import type { Experience } from "@/lib/types/experience";
import type { JobTarget, NarrativeAdjustmentStrategy } from "@/lib/types/job-target";
import type { SignalCandidate } from "@/lib/types/narrative";
import { invokeLlmJson } from "@/lib/config/llm";

export async function extractSupplementalSignals(input: {
  experience: Experience;
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
}): Promise<SignalCandidate[]> {
  const text = await invokeLlmJson({
    envPrefix: "NARRATIVE_SIGNAL_LLM",
    defaultModel: "narrative-signal-extractor",
    prompt: [
      "Identify supplemental experience signals relevant to the target role.",
      "Rules:",
      "1. Do not invent facts.",
      "2. Only derive signals explicitly grounded in the experience text.",
      "3. Return JSON array of objects: signalType, signalText, evidenceRefs, confidence.",
      "4. Focus on product-adjacent signals such as user understanding, prioritization, cross-functional work, metrics, decision-making.",
      "",
      "Target job:",
      JSON.stringify(
        {
          jobTitle: input.jobTarget.jobTitle,
          responsibilities: input.jobTarget.responsibilities,
          requirements: input.jobTarget.requirements,
          preferenceSignals: input.jobTarget.preferenceSignals,
        },
        null,
        2,
      ),
      "",
      "Narrative strategy:",
      JSON.stringify(input.narrativeAdjustmentStrategy, null, 2),
      "",
      "Experience:",
      JSON.stringify(input.experience, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return [];
  }

  return safeParseSignals(text);
}

function safeParseSignals(text: string): SignalCandidate[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const signalType = typeof record.signalType === "string" ? record.signalType.trim() : "";
        const signalText = typeof record.signalText === "string" ? record.signalText.trim() : "";
        const evidenceRefs = Array.isArray(record.evidenceRefs)
          ? record.evidenceRefs.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
          : [];
        const confidence =
          typeof record.confidence === "number" ? Math.max(0, Math.min(record.confidence, 1)) : null;

        if (!signalType || !signalText) return null;

        return {
          signalType,
          signalText,
          evidenceRefs,
          confidence,
        } satisfies SignalCandidate;
      })
      .filter((item): item is SignalCandidate => Boolean(item));
  } catch {
    return [];
  }
}
