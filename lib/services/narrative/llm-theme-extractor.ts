import type { ThemeCandidate } from "@/lib/types/narrative";
import { invokeLlmJson } from "@/lib/config/llm";

export async function abstractNarrativeThemes(input: {
  groupedSignals: Array<{
    signalType: string;
    signalIds: string[];
    signalTexts: string[];
    experienceIds: string[];
  }>;
  strategyContext: {
    emphasizePoints: string[];
    transitionAngles: string[];
  };
}): Promise<ThemeCandidate[]> {
  const text = await invokeLlmJson({
    envPrefix: "NARRATIVE_THEME_LLM",
    defaultModel: "narrative-theme-extractor",
    prompt: [
      "Abstract narrative themes from grouped experience signals.",
      "Rules:",
      "1. Do not invent evidence.",
      "2. Build themes only from the supplied signal groups.",
      "3. Return JSON array of objects: themeName, description, supportingSignalIds.",
      "4. Prefer themes useful for technical-to-product narrative framing.",
      "",
      JSON.stringify(input, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return [];
  }

  return safeParseThemes(text);
}

function safeParseThemes(text: string): ThemeCandidate[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const themeName = typeof record.themeName === "string" ? record.themeName.trim() : "";
        const description = typeof record.description === "string" ? record.description.trim() : "";
        const supportingSignalIds = Array.isArray(record.supportingSignalIds)
          ? record.supportingSignalIds.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
          : [];

        if (!themeName || !description || supportingSignalIds.length === 0) return null;

        return {
          themeName,
          description,
          supportingSignalIds,
        } satisfies ThemeCandidate;
      })
      .filter((item): item is ThemeCandidate => Boolean(item));
  } catch {
    return [];
  }
}
