import { prisma } from "@/lib/db/prisma";
import type { Experience } from "@/lib/types/experience";
import type { ConsistencyCheck } from "@/lib/types/consistency";
import type { ResumeBullet, TraceabilityMap } from "@/lib/types/resume";

export async function runResumeConsistencyChecks(input: {
  resumeVariantId: string;
  bullets: ResumeBullet[];
  experiences: Experience[];
  traceabilityMap: TraceabilityMap;
}): Promise<ConsistencyCheck[]> {
  const checks: Omit<ConsistencyCheck, "id">[] = [];
  const experienceMap = new Map(input.experiences.map((experience) => [experience.id, experience]));

  for (const bullet of input.bullets) {
    const mapped = input.traceabilityMap.bullets.find((item) => item.bulletId === bullet.id);
    const experience = experienceMap.get(bullet.experienceId);

    if (!mapped || !experience) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: input.resumeVariantId,
        issueType: "UNSUPPORTED_CLAIM",
        severity: "HIGH",
        message: `Bullet "${bullet.text}" does not have a valid experience trace.`,
        relatedExperienceIds: bullet.experienceId ? [bullet.experienceId] : [],
        checkSource: "TRACEABILITY",
        sourceText: bullet.text,
      });
      continue;
    }

    if (/\b(owner|owned|end-to-end owner|led product strategy|product owner)\b/i.test(bullet.text) && !supportsOwnership(experience)) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: input.resumeVariantId,
        issueType: "SCOPE_INFLATION",
        severity: "HIGH",
        message: `Bullet "${bullet.text}" may overstate ownership beyond the source experience.`,
        relatedExperienceIds: [experience.id],
        checkSource: "RULE_ENGINE",
        sourceText: experience.sourceText,
      });
    }

    if (/\b(product strategy|defined roadmap|owned roadmap|product leadership)\b/i.test(bullet.text) && !supportsProductLeadership(experience)) {
      checks.push({
        entityType: "ResumeVariant",
        entityId: input.resumeVariantId,
        issueType: "UNSUPPORTED_CLAIM",
        severity: "HIGH",
        message: `Bullet "${bullet.text}" may frame technical implementation as product leadership without clear evidence.`,
        relatedExperienceIds: [experience.id],
        checkSource: "RULE_ENGINE",
        sourceText: experience.sourceText,
      });
    }
  }

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
