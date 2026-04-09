import type { NarrativeStrategyCandidate } from "@/lib/types/job-target";
import { invokeLlmJson } from "@/lib/config/llm";

export async function extractNarrativeAdjustmentStrategy(input: {
  jobDescriptionRaw: string;
  companyNotes?: string | null;
  deterministicContext: {
    responsibilities: string[];
    requirements: string[];
    preferenceSignals: string[];
    roleKeywords: string[];
    matchSummary: string[];
  };
}): Promise<NarrativeStrategyCandidate | null> {
  const text = await invokeLlmJson({
    envPrefix: "JOB_TARGET_ANALYZER_LLM",
    defaultModel: "job-target-analyzer",
    prompt: [
      "Analyze the job target for narrative planning.",
      "Return JSON with keys: emphasizePoints, downplayPoints, transitionAngles, roleFitHypotheses, preferenceSignals.",
      "Rules:",
      "1. Do not invent user experience details.",
      "2. Use the JD, company notes, and match summary to infer implicit expectations.",
      "3. Focus on narrative adjustment strategy, not resume copy.",
      "4. Keep output grounded and interview-defensible.",
      "",
      "Job Description:",
      input.jobDescriptionRaw,
      "",
      "Company Notes:",
      input.companyNotes ?? "",
      "",
      "Deterministic Context:",
      JSON.stringify(input.deterministicContext, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return null;
  }

  return safeParseStrategy(text);
}

function safeParseStrategy(text: string): NarrativeStrategyCandidate | null {
  try {
    const parsed = JSON.parse(text) as Partial<NarrativeStrategyCandidate>;

    return {
      emphasizePoints: sanitizeList(parsed.emphasizePoints),
      downplayPoints: sanitizeList(parsed.downplayPoints),
      transitionAngles: sanitizeList(parsed.transitionAngles),
      roleFitHypotheses: sanitizeList(parsed.roleFitHypotheses),
      preferenceSignals: sanitizeList(parsed.preferenceSignals),
    };
  } catch {
    return null;
  }
}

function sanitizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const results: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") continue;
    const cleaned = item.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(cleaned);
  }

  return results;
}
