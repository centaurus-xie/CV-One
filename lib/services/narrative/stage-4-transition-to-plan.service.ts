import { prisma } from "@/lib/db/prisma";
import type { Experience } from "@/lib/types/experience";
import type { NarrativeAdjustmentStrategy, JobTarget } from "@/lib/types/job-target";
import type { NarrativePlan, NarrativeTheme, TransitionLogic } from "@/lib/types/narrative";

export async function buildNarrativePlan(input: {
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
  transitionLogicNode: TransitionLogic;
  themes: NarrativeTheme[];
  experiences: Experience[];
}): Promise<NarrativePlan> {
  const supportingExperienceIds = deriveSupportingExperienceIds(input.themes, input.experiences);
  const strengthsToEmphasize = uniqueList([
    ...input.narrativeAdjustmentStrategy.emphasizePoints,
    ...input.themes.map((theme) => theme.description),
  ]);
  const risksToAddress = uniqueList([
    ...input.transitionLogicNode.riskPoints,
    ...(input.transitionLogicNode.missingLinks.length > 0
      ? input.transitionLogicNode.missingLinks.map((item) => `Gap to address: ${item}`)
      : []),
  ]);
  const claimsToAvoid = uniqueList([
    ...input.narrativeAdjustmentStrategy.downplayPoints.map((item) => `Avoid overstating: ${item}`),
    "Avoid claiming end-to-end product ownership unless the source experience clearly supports it.",
  ]);
  const evidenceGaps = uniqueList(input.transitionLogicNode.missingLinks);
  const coreThemes = uniqueList(input.themes.map((theme) => theme.themeName));

  const positioningStatement = buildPositioningStatement({
    jobTitle: input.jobTarget.jobTitle,
    coreThemes,
  });

  const careerStorySummary = [
    positioningStatement,
    input.transitionLogicNode.logicSummary,
  ].join(" ");

  const created = await prisma.narrativePlan.create({
    data: {
      jobTargetId: input.jobTarget.id,
      transitionLogicId: input.transitionLogicNode.id,
      positioningStatement,
      careerStorySummary,
      transitionLogic: input.transitionLogicNode.logicSummary,
      coreThemes,
      strengthsToEmphasize,
      downplayPoints: input.narrativeAdjustmentStrategy.downplayPoints,
      risksToAddress,
      claimsToAvoid,
      evidenceGaps,
      sourceText: [
        input.jobTarget.sourceText,
        ...input.themes.map((theme) => theme.sourceText),
        input.transitionLogicNode.sourceText,
      ]
        .filter(Boolean)
        .join("\n\n"),
      supportingExperiences: {
        connect: supportingExperienceIds.map((id) => ({ id })),
      },
    },
    include: {
      supportingExperiences: true,
    },
  });

  return {
    id: created.id,
    jobTargetId: created.jobTargetId,
    transitionLogicId: created.transitionLogicId ?? null,
    positioningStatement: created.positioningStatement,
    careerStorySummary: created.careerStorySummary,
    transitionLogic: created.transitionLogic,
    coreThemes: created.coreThemes,
    strengthsToEmphasize: created.strengthsToEmphasize,
    downplayPoints: created.downplayPoints,
    risksToAddress: created.risksToAddress,
    claimsToAvoid: created.claimsToAvoid,
    evidenceGaps: created.evidenceGaps,
    supportingExperienceIds: created.supportingExperiences.map((experience) => experience.id),
    sourceText: created.sourceText ?? "",
  };
}

function deriveSupportingExperienceIds(themes: NarrativeTheme[], experiences: Experience[]): string[] {
  const themeIds = themes.flatMap((theme) => theme.supportingExperienceIds);
  const existing = new Set(experiences.map((experience) => experience.id));
  return [...new Set(themeIds.filter((id) => existing.has(id)))];
}

function buildPositioningStatement(input: { jobTitle: string; coreThemes: string[] }): string {
  const themeText = input.coreThemes.slice(0, 3).join(", ");
  if (!themeText) {
    return `Position the candidate as a credible fit for ${input.jobTitle} based on grounded, transferable experience.`;
  }

  return `Position the candidate for ${input.jobTitle} through grounded strengths in ${themeText}.`;
}

function uniqueList(values: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values) {
    const item = value.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
  }

  return results;
}
