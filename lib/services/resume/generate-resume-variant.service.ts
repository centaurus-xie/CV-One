import { prisma } from "@/lib/db/prisma";
import {
  assertNoBlockingConsistencyIssues,
  runConsistencyGuardrails,
} from "@/lib/services/consistency/guardrails.service";
import { rewriteResumeBullets } from "@/lib/services/resume/llm-bullet-rewriter";
import type { Experience } from "@/lib/types/experience";
import type { GenerateResumeVariantRequest, GenerateResumeVariantResponse, ResumeBullet, TraceabilityMap } from "@/lib/types/resume";

export async function generateResumeVariant(
  input: GenerateResumeVariantRequest,
): Promise<GenerateResumeVariantResponse> {
  await ensurePersistedInputs(input.experiences, input.narrativePlan.id);

  const selectedExperiences = selectExperiences(input.experiences, input.narrativePlan.supportingExperienceIds);
  const draftBullets = buildDeterministicBullets(selectedExperiences);
  const rewrittenBullets = await rewriteResumeBullets({
    bullets: selectedExperiences.map((experience) => ({
      experienceId: experience.id,
      title: experience.title,
      responsibilities: experience.responsibilities,
      outcomes: experience.outcomes,
      evidenceNotes: experience.evidenceNotes,
    })),
    narrativeContext: {
      jobTitle: input.jobTarget.jobTitle,
      positioningStatement: input.narrativePlan.positioningStatement,
      strengthsToEmphasize: input.narrativePlan.strengthsToEmphasize,
      claimsToAvoid: input.narrativePlan.claimsToAvoid,
      downplayPoints: input.narrativePlan.downplayPoints,
    },
  });

  const finalBullets = mergeBullets(draftBullets, rewrittenBullets, selectedExperiences);
  const traceabilityMap = buildTraceabilityMap(finalBullets, selectedExperiences);

  const created = await prisma.resumeVariant.create({
    data: {
      narrativePlanId: input.narrativePlan.id,
      summary: input.narrativePlan.positioningStatement,
      experienceBullets: finalBullets.map((bullet) => bullet.text),
      skillsSection: deriveSkillsSection(selectedExperiences),
      tailoringNotes: [
        `Tailored for ${input.jobTarget.jobTitle}.`,
        ...input.narrativePlan.strengthsToEmphasize.slice(0, 3),
      ],
      traceabilityMap,
      sourceText: selectedExperiences.map((experience) => experience.sourceText).join("\n\n"),
      selectedExperiences: {
        connect: selectedExperiences.map((experience) => ({ id: experience.id })),
      },
    },
  });

  const consistencyChecks = await runConsistencyGuardrails({
    experiences: selectedExperiences,
    narrativePlan: input.narrativePlan,
    resumeVariant: {
      id: created.id,
      narrativePlanId: created.narrativePlanId,
      summary: created.summary,
      experienceBullets: created.experienceBullets,
      skillsSection: created.skillsSection,
      tailoringNotes: created.tailoringNotes,
      traceabilityMap,
      sourceText: created.sourceText ?? "",
      selectedExperienceIds: selectedExperiences.map((experience) => experience.id),
    },
  });
  assertNoBlockingConsistencyIssues(consistencyChecks);

  return {
    resumeVariant: {
      id: created.id,
      narrativePlanId: created.narrativePlanId,
      summary: created.summary,
      experienceBullets: created.experienceBullets,
      skillsSection: created.skillsSection,
      tailoringNotes: created.tailoringNotes,
      traceabilityMap,
      sourceText: created.sourceText ?? "",
      selectedExperienceIds: selectedExperiences.map((experience) => experience.id),
    },
    traceabilityMap,
    consistencyChecks,
  };
}

export function selectExperiences(experiences: Experience[], supportingExperienceIds: string[]): Experience[] {
  const supportingSet = new Set(supportingExperienceIds);
  const selected = experiences.filter((experience) => supportingSet.has(experience.id));

  if (selected.length > 0) {
    return selected.slice(0, 4);
  }

  return [...experiences]
    .sort((a, b) => (b.outcomes.length + b.responsibilities.length) - (a.outcomes.length + a.responsibilities.length))
    .slice(0, 4);
}

export function buildDeterministicBullets(experiences: Experience[]): ResumeBullet[] {
  return experiences.map((experience) => {
    const baseText = deriveBulletText(experience);

    return {
      id: crypto.randomUUID(),
      text: baseText,
      experienceId: experience.id,
      evidenceRefs: experience.evidenceNotes.slice(0, 3),
    };
  });
}

function deriveBulletText(experience: Experience): string {
  const lead = experience.outcomes[0] ?? experience.responsibilities[0] ?? experience.summary ?? experience.title;
  return lead.trim();
}

export function mergeBullets(
  draftBullets: ResumeBullet[],
  rewrittenBullets: Array<{ experienceId: string; text: string }>,
  experiences: Experience[],
): ResumeBullet[] {
  const experienceMap = new Map(experiences.map((experience) => [experience.id, experience]));
  const rewrittenMap = new Map(rewrittenBullets.map((bullet) => [bullet.experienceId, bullet.text]));

  return draftBullets.map((draft) => {
    const candidateText = rewrittenMap.get(draft.experienceId);
    const experience = experienceMap.get(draft.experienceId);
    const finalText =
      candidateText && isBulletGrounded(candidateText, experience)
        ? candidateText
        : draft.text;

    return {
      ...draft,
      text: finalText,
    };
  });
}

export function buildTraceabilityMap(bullets: ResumeBullet[], experiences: Experience[]): TraceabilityMap {
  const experienceMap = new Map(experiences.map((experience) => [experience.id, experience]));

  return {
    bullets: bullets.map((bullet) => {
      const experience = experienceMap.get(bullet.experienceId);

      return {
        bulletId: bullet.id,
        experienceId: bullet.experienceId,
        sourceText: experience?.sourceText ?? "",
        evidenceRefs: bullet.evidenceRefs,
      };
    }),
  };
}

function deriveSkillsSection(experiences: Experience[]): string[] {
  const seen = new Set<string>();
  const skills: string[] = [];

  for (const experience of experiences) {
    for (const skill of [...experience.skills, ...experience.tools]) {
      const normalized = skill.trim();
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      skills.push(normalized);
    }
  }

  return skills.slice(0, 12);
}

function isBulletGrounded(candidateText: string, experience?: Experience): boolean {
  if (!experience) return false;

  const evidenceText = [
    experience.title,
    experience.summary ?? "",
    ...experience.responsibilities,
    ...experience.outcomes,
    ...experience.evidenceNotes,
    experience.sourceText,
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(owner|owned|product strategy|owned roadmap|product leadership)\b/i.test(candidateText)) {
    return /\b(owner|owned|lead|led|product|roadmap|strategy|负责|主导|路线图)\b/i.test(evidenceText);
  }

  return true;
}

async function ensurePersistedInputs(experiences: Experience[], narrativePlanId: string): Promise<void> {
  const existingPlan = await prisma.narrativePlan.findUnique({
    where: { id: narrativePlanId },
    select: { id: true },
  });

  if (!existingPlan) {
    throw new Error(`NarrativePlan ${narrativePlanId} does not exist in the database.`);
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
