import type { TransitionExpression } from "@/lib/types/narrative";
import { invokeLlmJson } from "@/lib/config/llm";

export async function writeTransitionExpression(input: {
  jobTarget: {
    jobTitle: string;
    responsibilities: string[];
    requirements: string[];
  };
  themes: Array<{
    id: string;
    themeName: string;
    description: string;
    supportingExperienceIds: string[];
  }>;
  strategy: {
    transitionAngles: string[];
    emphasizePoints: string[];
    downplayPoints: string[];
  };
  matchHints: {
    primary: string[];
    supporting: string[];
  };
}): Promise<TransitionExpression | null> {
  const text = await invokeLlmJson({
    envPrefix: "NARRATIVE_TRANSITION_LLM",
    defaultModel: "narrative-transition-writer",
    prompt: [
      "Write a concise transition logic summary based on the supplied themes.",
      "Rules:",
      "1. Do not invent facts.",
      "2. Use only the supplied themes, strategy, and match hints.",
      "3. Return JSON object with logicSummary, riskPoints, missingLinks.",
      "4. Focus on defensible technical-to-product transition framing.",
      "",
      JSON.stringify(input, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return null;
  }

  return safeParseTransition(text);
}

function safeParseTransition(text: string): TransitionExpression | null {
  try {
    const parsed = JSON.parse(text) as Partial<TransitionExpression>;
    if (typeof parsed.logicSummary !== "string" || !parsed.logicSummary.trim()) {
      return null;
    }

    return {
      logicSummary: parsed.logicSummary.trim(),
      riskPoints: Array.isArray(parsed.riskPoints)
        ? parsed.riskPoints.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [],
      missingLinks: Array.isArray(parsed.missingLinks)
        ? parsed.missingLinks.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [],
    };
  } catch {
    return null;
  }
}
