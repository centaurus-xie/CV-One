import { prisma } from "@/lib/db/prisma";
import { abstractNarrativeThemes } from "@/lib/services/narrative/llm-theme-extractor";
import type { NarrativeAdjustmentStrategy } from "@/lib/types/job-target";
import type { ExperienceSignal, NarrativeTheme, ThemeCandidate } from "@/lib/types/narrative";

export async function buildNarrativeThemes(input: {
  signals: ExperienceSignal[];
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
}): Promise<NarrativeTheme[]> {
  const groupedSignals = groupSignals(input.signals);
  const deterministicThemes = deriveThemesFromGroupedSignals(groupedSignals);
  const llmThemes = await abstractNarrativeThemes({
    groupedSignals,
    strategyContext: {
      emphasizePoints: input.narrativeAdjustmentStrategy.emphasizePoints,
      transitionAngles: input.narrativeAdjustmentStrategy.transitionAngles,
    },
  });

  const mergedCandidates = dedupeThemes([...deterministicThemes, ...llmThemes]);
  const signalMap = new Map(input.signals.map((signal) => [signal.id, signal]));
  const themes: NarrativeTheme[] = [];

  for (const candidate of mergedCandidates) {
    const supportingSignals = candidate.supportingSignalIds
      .map((id) => signalMap.get(id))
      .filter((item): item is ExperienceSignal => Boolean(item));

    if (supportingSignals.length === 0) {
      continue;
    }

    const supportingExperienceIds = [...new Set(supportingSignals.map((signal) => signal.experienceId))];
    const created = await prisma.narrativeTheme.create({
      data: {
        themeName: candidate.themeName,
        description: candidate.description,
        supportingExperienceIds,
        sourceText: supportingSignals.map((signal) => signal.sourceText).join("\n\n"),
        signals: {
          connect: candidate.supportingSignalIds.map((id) => ({ id })),
        },
      },
      include: {
        signals: true,
      },
    });

    themes.push({
      id: created.id,
      themeName: created.themeName,
      description: created.description,
      supportingSignalIds: created.signals.map((signal) => signal.id),
      supportingExperienceIds: created.supportingExperienceIds,
      sourceText: created.sourceText ?? "",
    });
  }

  return themes;
}

export function groupSignals(signals: ExperienceSignal[]): Array<{
  signalType: string;
  signalIds: string[];
  signalTexts: string[];
  experienceIds: string[];
}> {
  const grouped = new Map<
    string,
    { signalIds: string[]; signalTexts: string[]; experienceIds: string[] }
  >();

  for (const signal of signals) {
    const entry = grouped.get(signal.signalType) ?? {
      signalIds: [],
      signalTexts: [],
      experienceIds: [],
    };

    entry.signalIds.push(signal.id);
    entry.signalTexts.push(signal.signalText);
    entry.experienceIds.push(signal.experienceId);
    grouped.set(signal.signalType, entry);
  }

  return [...grouped.entries()].map(([signalType, entry]) => ({
    signalType,
    signalIds: [...new Set(entry.signalIds)],
    signalTexts: [...new Set(entry.signalTexts)],
    experienceIds: [...new Set(entry.experienceIds)],
  }));
}

export function deriveThemesFromGroupedSignals(
  groupedSignals: ReturnType<typeof groupSignals>,
): ThemeCandidate[] {
  return groupedSignals.map((group) => ({
    themeName: humanizeSignalType(group.signalType),
    description: `A recurring pattern of ${humanizeSignalType(group.signalType).toLowerCase()} appears across the supporting experiences.`,
    supportingSignalIds: group.signalIds,
  }));
}

function humanizeSignalType(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dedupeThemes(themes: ThemeCandidate[]): ThemeCandidate[] {
  const seen = new Set<string>();
  const results: ThemeCandidate[] = [];

  for (const theme of themes) {
    const key = theme.themeName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(theme);
  }

  return results;
}
