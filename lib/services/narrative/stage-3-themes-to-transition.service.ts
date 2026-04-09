import { prisma } from "@/lib/db/prisma";
import { writeTransitionExpression } from "@/lib/services/narrative/llm-transition-writer";
import type { ExperienceMatchHints, JobTarget, NarrativeAdjustmentStrategy } from "@/lib/types/job-target";
import type { NarrativeTheme, TransitionLogic } from "@/lib/types/narrative";

export async function buildTransitionLogic(input: {
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
  experienceMatchHints: ExperienceMatchHints;
  themes: NarrativeTheme[];
}): Promise<TransitionLogic> {
  const deterministic = deriveDeterministicTransition(input);
  const llmTransition = await writeTransitionExpression({
    jobTarget: {
      jobTitle: input.jobTarget.jobTitle,
      responsibilities: input.jobTarget.responsibilities,
      requirements: input.jobTarget.requirements,
    },
    themes: input.themes.map((theme) => ({
      id: theme.id,
      themeName: theme.themeName,
      description: theme.description,
      supportingExperienceIds: theme.supportingExperienceIds,
    })),
    strategy: {
      transitionAngles: input.narrativeAdjustmentStrategy.transitionAngles,
      emphasizePoints: input.narrativeAdjustmentStrategy.emphasizePoints,
      downplayPoints: input.narrativeAdjustmentStrategy.downplayPoints,
    },
    matchHints: {
      primary: input.experienceMatchHints.primaryMatches.map((item) => item.rationale),
      supporting: input.experienceMatchHints.supportingMatches.map((item) => item.rationale),
    },
  });

  const finalTransition = {
    logicSummary: llmTransition?.logicSummary ?? deterministic.logicSummary,
    riskPoints: uniqueList([...(deterministic.riskPoints ?? []), ...(llmTransition?.riskPoints ?? [])]),
    missingLinks: uniqueList([...(deterministic.missingLinks ?? []), ...(llmTransition?.missingLinks ?? [])]),
  };

  const created = await prisma.transitionLogic.create({
    data: {
      jobTargetId: input.jobTarget.id,
      logicSummary: finalTransition.logicSummary,
      riskPoints: finalTransition.riskPoints,
      missingLinks: finalTransition.missingLinks,
      sourceText: input.themes.map((theme) => theme.sourceText).join("\n\n"),
      themes: {
        connect: input.themes.map((theme) => ({ id: theme.id })),
      },
    },
    include: {
      themes: true,
    },
  });

  return {
    id: created.id,
    jobTargetId: created.jobTargetId,
    logicSummary: created.logicSummary,
    supportingThemeIds: created.themes.map((theme) => theme.id),
    riskPoints: created.riskPoints,
    missingLinks: created.missingLinks,
    sourceText: created.sourceText ?? "",
  };
}

export function deriveDeterministicTransition(input: {
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
  experienceMatchHints: ExperienceMatchHints;
  themes: NarrativeTheme[];
}): {
  logicSummary: string;
  riskPoints: string[];
  missingLinks: string[];
} {
  const topThemes = input.themes.slice(0, 3).map((theme) => theme.themeName);
  const topPrimaryMatches = input.experienceMatchHints.primaryMatches.slice(0, 2).map((item) => item.title);

  const logicSummary = [
    `The candidate is best positioned for ${input.jobTarget.jobTitle} by connecting prior work through ${topThemes.join(", ") || "relevant recurring themes"}.`,
    input.narrativeAdjustmentStrategy.transitionAngles[0]
      ? `The primary transition angle is: ${input.narrativeAdjustmentStrategy.transitionAngles[0]}`
      : null,
    topPrimaryMatches.length > 0
      ? `The strongest supporting experiences are ${topPrimaryMatches.join(" and ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const riskPoints = uniqueList([
    ...input.narrativeAdjustmentStrategy.downplayPoints.map((item) => `Risk of over-indexing on: ${item}`),
    ...(input.experienceMatchHints.primaryMatches.length === 0
      ? ["There is no strong direct experience match yet, so the transition argument may feel indirect."]
      : []),
  ]);

  const missingLinks = uniqueList(
    input.themes.length === 0
      ? ["No stable narrative themes were formed from the current experiences."]
      : input.experienceMatchHints.primaryMatches.length === 0
        ? ["Need clearer evidence linking past work to target-role decision making."]
        : [],
  );

  return {
    logicSummary,
    riskPoints,
    missingLinks,
  };
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
