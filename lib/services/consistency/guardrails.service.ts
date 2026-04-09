import { prisma } from "@/lib/db/prisma";
import { reviewConsistencyWithLLM } from "@/lib/services/consistency/llm-assist-reviewer";
import type { ConsistencyCheck } from "@/lib/types/consistency";
import type { Experience } from "@/lib/types/experience";
import type { InterviewAnswerDraft } from "@/lib/types/interview";
import type { NarrativePlan } from "@/lib/types/narrative";
import type { ResumeVariant } from "@/lib/types/resume";

type GuardrailsInput = {
  experiences: Experience[];
  narrativePlan?: NarrativePlan | null;
  resumeVariant?: ResumeVariant | null;
  interviewAnswerDrafts?: InterviewAnswerDraft[] | null;
};

export async function runConsistencyGuardrails(input: GuardrailsInput): Promise<ConsistencyCheck[]> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];

  checks.push(...runTimelineRuleChecks(input.experiences));

  if (input.narrativePlan) {
    checks.push(...runNarrativeRuleChecks(input.narrativePlan));
  }

  if (input.resumeVariant) {
    checks.push(...runResumeTraceabilityChecks(input.resumeVariant, input.experiences));
    checks.push(...runResumeRuleChecks(input.resumeVariant, input.experiences));
  }

  if (input.interviewAnswerDrafts?.length) {
    checks.push(...runInterviewTraceabilityChecks(input.interviewAnswerDrafts, input.experiences));
    checks.push(...runInterviewRuleChecks(input.interviewAnswerDrafts, input.experiences));
  }

  const llmChecks = await buildLLMAssistChecks(input);
  const persisted = await persistChecks([...dedupeChecks(checks), ...dedupeChecks(llmChecks)]);

  return persisted;
}

export function hasBlockingConsistencyIssues(checks: ConsistencyCheck[]): boolean {
  return checks.some((check) => check.checkSource === "TRACEABILITY" || check.checkSource === "RULE_ENGINE");
}

export function assertNoBlockingConsistencyIssues(checks: ConsistencyCheck[]): void {
  if (!hasBlockingConsistencyIssues(checks)) {
    return;
  }

  const summary = checks
    .filter((check) => check.checkSource === "TRACEABILITY" || check.checkSource === "RULE_ENGINE")
    .map((check) => check.message)
    .join(" | ");

  throw new Error(`Consistency guardrails blocked the output: ${summary}`);
}

function runTimelineRuleChecks(experiences: Experience[]): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];

  for (const experience of experiences) {
    if (experience.startDate && experience.endDate && new Date(experience.startDate) > new Date(experience.endDate)) {
      checks.push({
        entityType: "Experience",
        entityId: experience.id,
        issueType: "TIMELINE_CONFLICT",
        severity: "HIGH",
        message: `${experience.title} has a start date later than its end date.`,
        relatedExperienceIds: [experience.id],
        checkSource: "RULE_ENGINE",
        sourceText: experience.sourceText,
      });
    }
  }

  return checks;
}

function runNarrativeRuleChecks(narrativePlan: NarrativePlan): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];

  if (!narrativePlan.supportingExperienceIds.length) {
    checks.push({
      entityType: "NarrativePlan",
      entityId: narrativePlan.id,
      issueType: "UNSUPPORTED_CLAIM",
      severity: "HIGH",
      message: "NarrativePlan has no supporting experiences, so its claims are not traceable.",
      relatedExperienceIds: [],
      checkSource: "TRACEABILITY",
      sourceText: narrativePlan.sourceText,
    });
  }

  if (narrativePlan.evidenceGaps.length > 0) {
    checks.push({
      entityType: "NarrativePlan",
      entityId: narrativePlan.id,
      issueType: "UNCLEAR_TRANSITION",
      severity: "MEDIUM",
      message: `NarrativePlan still contains unresolved evidence gaps: ${narrativePlan.evidenceGaps.join("; ")}`,
      relatedExperienceIds: narrativePlan.supportingExperienceIds,
      checkSource: "RULE_ENGINE",
      sourceText: narrativePlan.sourceText,
    });
  }

  return checks;
}

function runResumeTraceabilityChecks(
  resumeVariant: ResumeVariant,
  experiences: Experience[],
): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];
  const experienceIds = new Set(experiences.map((experience) => experience.id));

  for (const [index, bullet] of resumeVariant.experienceBullets.entries()) {
    const trace = resumeVariant.traceabilityMap.bullets[index];
    if (!trace || !trace.experienceId || !experienceIds.has(trace.experienceId)) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: resumeVariant.id,
        issueType: "UNSUPPORTED_CLAIM",
        severity: "HIGH",
        message: `Resume bullet "${bullet}" does not map to a valid Experience.`,
        relatedExperienceIds: trace?.experienceId ? [trace.experienceId] : [],
        checkSource: "TRACEABILITY",
        sourceText: bullet,
      });
    }
  }

  return checks;
}

function runResumeRuleChecks(
  resumeVariant: ResumeVariant,
  experiences: Experience[],
): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];
  const experienceMap = new Map(experiences.map((experience) => [experience.id, experience]));

  for (const [index, bullet] of resumeVariant.experienceBullets.entries()) {
    const trace = resumeVariant.traceabilityMap.bullets[index];
    const experience = trace ? experienceMap.get(trace.experienceId) : null;

    if (!experience) {
      continue;
    }

    if (/\b(owner|owned|end-to-end owner|led product strategy|product owner)\b/i.test(bullet) && !supportsOwnership(experience)) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: resumeVariant.id,
        issueType: "SCOPE_INFLATION",
        severity: "HIGH",
        message: `Resume bullet "${bullet}" overstates ownership beyond the source experience.`,
        relatedExperienceIds: [experience.id],
        checkSource: "RULE_ENGINE",
        sourceText: bullet,
      });
    }

    if (/\b(product strategy|defined roadmap|owned roadmap|product leadership)\b/i.test(bullet) && !supportsProductLeadership(experience)) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: resumeVariant.id,
        issueType: "UNSUPPORTED_CLAIM",
        severity: "HIGH",
        message: `Resume bullet "${bullet}" frames technical execution as product leadership without evidence.`,
        relatedExperienceIds: [experience.id],
        checkSource: "RULE_ENGINE",
        sourceText: bullet,
      });
    }
  }

  return checks;
}

function runInterviewTraceabilityChecks(
  drafts: InterviewAnswerDraft[],
  experiences: Experience[],
): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];
  const experienceIds = new Set(experiences.map((experience) => experience.id));

  for (const draft of drafts) {
    if (!draft.supportingExperienceIds.length || draft.supportingExperienceIds.some((id) => !experienceIds.has(id))) {
      checks.push({
        entityType: "InterviewAnswerDraft",
        entityId: draft.id,
        issueType: "UNSUPPORTED_CLAIM",
        severity: "HIGH",
        message: `Interview answer for "${draft.question}" does not have complete experience traceability.`,
        relatedExperienceIds: draft.supportingExperienceIds,
        checkSource: "TRACEABILITY",
        sourceText: draft.answerOutline,
      });
    }
  }

  return checks;
}

function runInterviewRuleChecks(
  drafts: InterviewAnswerDraft[],
  experiences: Experience[],
): Array<Omit<ConsistencyCheck, "id">> {
  const checks: Array<Omit<ConsistencyCheck, "id">> = [];
  const experienceMap = new Map(experiences.map((experience) => [experience.id, experience]));

  for (const draft of drafts) {
    const supporting = draft.supportingExperienceIds
      .map((id) => experienceMap.get(id))
      .filter((item): item is Experience => Boolean(item));

    const evidence = supporting
      .map((experience) =>
        [
          experience.title,
          experience.summary ?? "",
          ...experience.responsibilities,
          ...experience.outcomes,
          ...experience.evidenceNotes,
          experience.sourceText,
        ].join(" "),
      )
      .join(" ")
      .toLowerCase();

    if (/\b(owner|solely responsible|owned roadmap|product strategy)\b/i.test(draft.answerOutline) && !/\b(owner|owned|led|roadmap|strategy|负责|主导)\b/i.test(evidence)) {
      checks.push({
        entityType: "InterviewAnswerDraft",
        entityId: draft.id,
        issueType: "SCOPE_INFLATION",
        severity: "HIGH",
        message: `Interview answer for "${draft.question}" appears to overstate ownership or product leadership.`,
        relatedExperienceIds: draft.supportingExperienceIds,
        checkSource: "RULE_ENGINE",
        sourceText: draft.answerOutline,
      });
    }
  }

  return checks;
}

async function buildLLMAssistChecks(input: GuardrailsInput): Promise<Array<Omit<ConsistencyCheck, "id">>> {
  const llmChecks: Array<Omit<ConsistencyCheck, "id">> = [];

  if (input.resumeVariant) {
    llmChecks.push(
      ...(await reviewConsistencyWithLLM({
        entityType: "ResumeVariant",
        entityId: input.resumeVariant.id,
        texts: input.resumeVariant.experienceBullets,
        sourceEvidence: input.experiences.map((experience) => experience.sourceText),
      })),
    );
  }

  if (input.interviewAnswerDrafts?.length) {
    for (const draft of input.interviewAnswerDrafts) {
      llmChecks.push(
        ...(await reviewConsistencyWithLLM({
          entityType: "InterviewAnswerDraft",
          entityId: draft.id,
          texts: [draft.answerOutline],
          sourceEvidence: input.experiences
            .filter((experience) => draft.supportingExperienceIds.includes(experience.id))
            .map((experience) => experience.sourceText),
        })),
      );
    }
  }

  if (input.narrativePlan) {
    llmChecks.push(
      ...(await reviewConsistencyWithLLM({
        entityType: "NarrativePlan",
        entityId: input.narrativePlan.id,
        texts: [input.narrativePlan.transitionLogic, input.narrativePlan.positioningStatement],
        sourceEvidence: input.experiences.map((experience) => experience.sourceText),
      })),
    );
  }

  return llmChecks;
}

async function persistChecks(checks: Array<Omit<ConsistencyCheck, "id">>): Promise<ConsistencyCheck[]> {
  const persisted: ConsistencyCheck[] = [];

  for (const check of checks) {
    const created = await prisma.consistencyCheck.create({
      data: check,
    });

    persisted.push({
      id: created.id,
      entityType: created.entityType,
      entityId: created.entityId,
      issueType: created.issueType,
      severity: created.severity,
      message: created.message,
      relatedExperienceIds: created.relatedExperienceIds,
      checkSource: created.checkSource,
      sourceText: created.sourceText,
    });
  }

  return persisted;
}

function dedupeChecks(checks: Array<Omit<ConsistencyCheck, "id">>): Array<Omit<ConsistencyCheck, "id">> {
  const seen = new Set<string>();
  const results: Array<Omit<ConsistencyCheck, "id">> = [];

  for (const check of checks) {
    const key = `${check.entityType}:${check.entityId}:${check.issueType}:${check.message}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(check);
  }

  return results;
}

function supportsOwnership(experience: Experience): boolean {
  const text = [
    experience.title,
    experience.summary ?? "",
    ...experience.responsibilities,
    ...experience.outcomes,
    ...experience.evidenceNotes,
    experience.sourceText,
  ].join(" ");

  return /\b(owned|owner|led|lead|managed|负责|主导|推动)\b/i.test(text);
}

function supportsProductLeadership(experience: Experience): boolean {
  const text = [
    experience.title,
    experience.summary ?? "",
    ...experience.responsibilities,
    ...experience.outcomes,
    ...experience.evidenceNotes,
    experience.sourceText,
  ].join(" ");

  return /\b(product|roadmap|prioritization|user research|stakeholder|需求|用户|优先级|路线图)\b/i.test(text);
}
