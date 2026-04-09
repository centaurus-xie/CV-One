import type { ConsistencyCheck } from "@/lib/types/consistency";
import { invokeLlmJson } from "@/lib/config/llm";

export async function reviewConsistencyWithLLM(input: {
  entityType: string;
  entityId: string;
  texts: string[];
  sourceEvidence: string[];
}): Promise<Array<Omit<ConsistencyCheck, "id">>> {
  if (input.texts.length === 0) {
    return [];
  }

  const text = await invokeLlmJson({
    envPrefix: "CONSISTENCY_LLM",
    defaultModel: "consistency-reviewer",
    prompt: [
      "Review generated text for consistency risks.",
      "Rules:",
      "1. Do not decide whether facts are true.",
      "2. Only identify possible exaggeration, vagueness, or strained logic.",
      "3. Return JSON array with: issueType, severity, message, sourceText.",
      "4. Use only issue types UNCLEAR_TRANSITION or SCOPE_INFLATION unless the source text is clearly unsupported by missing evidence references.",
      "",
      JSON.stringify(input, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return [];
  }

  return safeParseChecks(text, input.entityType, input.entityId);
}

function safeParseChecks(
  text: string,
  entityType: string,
  entityId: string,
): Array<Omit<ConsistencyCheck, "id">> {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    const results = parsed
      .map((item): Omit<ConsistencyCheck, "id"> | null => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const issueType =
          record.issueType === "UNCLEAR_TRANSITION" || record.issueType === "SCOPE_INFLATION"
            ? record.issueType
            : "UNCLEAR_TRANSITION";
        const severity =
          record.severity === "HIGH" || record.severity === "MEDIUM" || record.severity === "LOW"
            ? record.severity
            : "LOW";
        const message = typeof record.message === "string" ? record.message.trim() : "";
        const sourceText = typeof record.sourceText === "string" ? record.sourceText.trim() : null;

        if (!message) return null;

        return {
          entityType,
          entityId,
          issueType,
          severity,
          message,
          relatedExperienceIds: [],
          checkSource: "LLM_ASSIST",
          sourceText,
        } satisfies Omit<ConsistencyCheck, "id">;
      })
      .filter((item): item is Omit<ConsistencyCheck, "id"> => item !== null);

    return results;
  } catch {
    return [];
  }
}
