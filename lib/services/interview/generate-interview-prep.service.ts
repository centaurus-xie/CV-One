import { prisma } from "@/lib/db/prisma";
import {
  assertNoBlockingConsistencyIssues,
  runConsistencyGuardrails,
} from "@/lib/services/consistency/guardrails.service";
import { draftInterviewAnswers } from "@/lib/services/interview/llm-answer-drafter";
import type { Experience } from "@/lib/types/experience";
import type {
  GenerateInterviewPrepRequest,
  GenerateInterviewPrepResponse,
  InterviewAnswerDraft,
  InterviewQuestion,
  InterviewQuestionSet,
} from "@/lib/types/interview";

export async function generateInterviewPrep(
  input: GenerateInterviewPrepRequest,
): Promise<GenerateInterviewPrepResponse> {
  await ensurePersistedInputs(input.resumeVariant.id, input.experiences);

  const questions = buildInterviewQuestions(input);
  const createdQuestionSet = await prisma.interviewQuestionSet.create({
    data: {
      resumeVariantId: input.resumeVariant.id,
      questions: questions.map((question) => question.question),
      sourceText: buildQuestionSetSourceText(questions),
    },
  });

  const answerCandidates = await draftInterviewAnswers({
    questions: questions.map((question) => ({
      question: question.question,
      supportingExperienceIds: question.supportingExperienceIds,
      riskFlags: question.riskFlags,
    })),
    experiences: input.experiences.map((experience) => ({
      id: experience.id,
      title: experience.title,
      summary: experience.summary,
      responsibilities: experience.responsibilities,
      outcomes: experience.outcomes,
      evidenceNotes: experience.evidenceNotes,
      sourceText: experience.sourceText,
    })),
    narrativeContext: {
      positioningStatement: input.narrativePlan.positioningStatement,
      transitionLogic: input.narrativePlan.transitionLogic,
      risksToAddress: input.narrativePlan.risksToAddress,
      claimsToAvoid: input.narrativePlan.claimsToAvoid,
    },
  });

  const answerDrafts = await persistAnswerDrafts({
    interviewQuestionSetId: createdQuestionSet.id,
    questions,
    answerCandidates,
    experiences: input.experiences,
  });

  const consistencyChecks = await runConsistencyGuardrails({
    experiences: input.experiences,
    narrativePlan: input.narrativePlan,
    resumeVariant: input.resumeVariant,
    interviewAnswerDrafts: answerDrafts,
  });
  assertNoBlockingConsistencyIssues(consistencyChecks);

  return {
    interviewQuestionSet: {
      id: createdQuestionSet.id,
      resumeVariantId: createdQuestionSet.resumeVariantId,
      questions: createdQuestionSet.questions,
      sourceText: createdQuestionSet.sourceText ?? "",
    },
    interviewAnswerDrafts: answerDrafts,
  };
}

export function buildInterviewQuestions(input: GenerateInterviewPrepRequest): InterviewQuestion[] {
  const experienceById = new Map(input.experiences.map((experience) => [experience.id, experience]));
  const questions: InterviewQuestion[] = [];

  for (const [index, bullet] of input.resumeVariant.experienceBullets.entries()) {
    const bulletTrace = input.resumeVariant.traceabilityMap.bullets[index];
    const experienceId = bulletTrace?.experienceId;
    if (!experienceId) continue;

    const riskFlags = deriveBulletRiskFlags(bullet);
    if (riskFlags.length === 0) continue;

    const experience = experienceById.get(experienceId);
    questions.push({
      id: crypto.randomUUID(),
      question: `Can you walk me through the context behind "${truncateText(bullet, 80)}" and what your specific contribution was?`,
      source: "HIGH_RISK_BULLET",
      supportingExperienceIds: [experienceId],
      riskFlags,
    });

    if (experience && /\b(owner|owned|strategy|roadmap|主导|负责)\b/i.test(bullet)) {
      questions.push({
        id: crypto.randomUUID(),
        question: `What decisions did you personally own in ${experience.title}, and where were you contributing versus leading?`,
        source: "HIGH_RISK_BULLET",
        supportingExperienceIds: [experienceId],
        riskFlags: ["ownership_clarification"],
      });
    }
  }

  if (input.narrativePlan.transitionLogic) {
    questions.push({
      id: crypto.randomUUID(),
      question: "Why does your move from technical execution toward this product role make sense now?",
      source: "TRANSITION_POINT",
      supportingExperienceIds: input.narrativePlan.supportingExperienceIds.slice(0, 3),
      riskFlags: ["transition_defense"],
    });
  }

  for (const gap of input.narrativePlan.evidenceGaps.slice(0, 3)) {
    questions.push({
      id: crypto.randomUUID(),
      question: `How would you address this potential gap in your background: ${gap}?`,
      source: "WEAK_EVIDENCE",
      supportingExperienceIds: input.narrativePlan.supportingExperienceIds.slice(0, 2),
      riskFlags: ["weak_evidence"],
    });
  }

  return dedupeQuestions(questions).slice(0, 8);
}

async function persistAnswerDrafts(input: {
  interviewQuestionSetId: string;
  questions: InterviewQuestion[];
  answerCandidates: Array<{ question: string; answerOutline: string }>;
  experiences: Experience[];
}): Promise<InterviewAnswerDraft[]> {
  const candidateMap = new Map(input.answerCandidates.map((candidate) => [candidate.question, candidate.answerOutline]));
  const experienceMap = new Map(input.experiences.map((experience) => [experience.id, experience]));
  const drafts: InterviewAnswerDraft[] = [];

  for (const question of input.questions) {
    const supportingExperiences = question.supportingExperienceIds
      .map((id) => experienceMap.get(id))
      .filter((item): item is Experience => Boolean(item));

    const llmOutline = candidateMap.get(question.question);
    const answerOutline =
      llmOutline && isAnswerGrounded(llmOutline, supportingExperiences)
        ? llmOutline
        : buildDeterministicAnswerOutline(question.question, supportingExperiences);

    const created = await prisma.interviewAnswerDraft.create({
      data: {
        interviewQuestionSetId: input.interviewQuestionSetId,
        question: question.question,
        answerOutline,
        riskFlags: question.riskFlags,
        userReviewStatus: null,
        sourceText: supportingExperiences.map((experience) => experience.sourceText).join("\n\n"),
        supportingExperiences: {
          connect: supportingExperiences.map((experience) => ({ id: experience.id })),
        },
      },
      include: {
        supportingExperiences: true,
      },
    });

    drafts.push({
      id: created.id,
      question: created.question,
      answerOutline: created.answerOutline,
      supportingExperienceIds: created.supportingExperiences.map((experience) => experience.id),
      riskFlags: created.riskFlags,
      userReviewStatus: created.userReviewStatus,
      sourceText: created.sourceText ?? "",
    });
  }

  return drafts;
}

function buildDeterministicAnswerOutline(question: string, experiences: Experience[]): string {
  const summaryParts = experiences.flatMap((experience) => {
    const pieces = [
      `${experience.title}${experience.organization ? ` at ${experience.organization}` : ""}`,
      experience.summary ?? null,
      experience.responsibilities[0] ?? null,
      experience.outcomes[0] ?? null,
    ].filter(Boolean);

    return pieces as string[];
  });

  const evidenceText = summaryParts.slice(0, 4).join(" ");

  return [
    `Start by answering the question directly: ${question}`,
    evidenceText ? `Use grounded examples from your experience: ${evidenceText}` : "Use only concrete responsibilities and outcomes you can support.",
    "Clarify your exact scope, what you influenced, and what result you observed.",
  ].join(" ");
}

function deriveBulletRiskFlags(bullet: string): string[] {
  const flags: string[] = [];

  if (/\b(owner|owned|led strategy|product owner|主导|负责)\b/i.test(bullet)) {
    flags.push("ownership_risk");
  }

  if (/\b(product strategy|roadmap|prioritization|strategy|路线图|优先级)\b/i.test(bullet)) {
    flags.push("product_scope_risk");
  }

  if (/\b(increased|improved|reduced|grew|提升|增长|降低|优化|%)\b/i.test(bullet)) {
    flags.push("metrics_defense");
  }

  return flags;
}

function isAnswerGrounded(answer: string, experiences: Experience[]): boolean {
  const evidence = experiences
    .map((experience) =>
      [
        experience.title,
        experience.organization ?? "",
        experience.summary ?? "",
        ...experience.responsibilities,
        ...experience.outcomes,
        ...experience.evidenceNotes,
        experience.sourceText,
      ].join(" "),
    )
    .join(" ")
    .toLowerCase();

  if (/\b(owner|owned roadmap|product strategy|end-to-end owner|solely responsible)\b/i.test(answer)) {
    return /\b(owner|owned|lead|led|roadmap|strategy|负责|主导)\b/i.test(evidence);
  }

  return true;
}

async function ensurePersistedInputs(resumeVariantId: string, experiences: Experience[]): Promise<void> {
  const existingVariant = await prisma.resumeVariant.findUnique({
    where: { id: resumeVariantId },
    select: { id: true },
  });

  if (!existingVariant) {
    throw new Error(`ResumeVariant ${resumeVariantId} does not exist in the database.`);
  }

  for (const experience of experiences) {
    await prisma.experience.upsert({
      where: { id: experience.id },
      update: {
        type: experience.type,
        title: experience.title,
        organization: experience.organization,
        startDate: experience.startDate ? new Date(experience.startDate) : null,
        endDate: experience.endDate ? new Date(experience.endDate) : null,
        location: experience.location,
        summary: experience.summary,
        responsibilities: experience.responsibilities,
        outcomes: experience.outcomes,
        skills: experience.skills,
        tools: experience.tools,
        evidenceNotes: experience.evidenceNotes,
        sourceText: experience.sourceText,
        confidenceLevel: experience.confidenceLevel,
      },
      create: {
        id: experience.id,
        type: experience.type,
        title: experience.title,
        organization: experience.organization,
        startDate: experience.startDate ? new Date(experience.startDate) : null,
        endDate: experience.endDate ? new Date(experience.endDate) : null,
        location: experience.location,
        summary: experience.summary,
        responsibilities: experience.responsibilities,
        outcomes: experience.outcomes,
        skills: experience.skills,
        tools: experience.tools,
        evidenceNotes: experience.evidenceNotes,
        sourceText: experience.sourceText,
        confidenceLevel: experience.confidenceLevel,
      },
    });
  }
}

function buildQuestionSetSourceText(questions: InterviewQuestion[]): string {
  return questions.map((question) => `${question.source}: ${question.question}`).join("\n");
}

function dedupeQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
  const seen = new Set<string>();
  const results: InterviewQuestion[] = [];

  for (const question of questions) {
    const key = question.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(question);
  }

  return results;
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}
