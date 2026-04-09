import type { BulletRewriteCandidate } from "@/lib/types/resume";
import { invokeLlmJson } from "@/lib/config/llm";

export async function rewriteResumeBullets(input: {
  bullets: Array<{
    experienceId: string;
    title: string;
    responsibilities: string[];
    outcomes: string[];
    evidenceNotes: string[];
  }>;
  narrativeContext: {
    jobTitle: string;
    positioningStatement: string;
    strengthsToEmphasize: string[];
    claimsToAvoid: string[];
    downplayPoints: string[];
  };
}): Promise<BulletRewriteCandidate[]> {
  const text = await invokeLlmJson({
    envPrefix: "RESUME_BULLET_LLM",
    defaultModel: "resume-bullet-rewriter",
    prompt: [
      "Rewrite resume bullets for a target role.",
      "Rules:",
      "1. Do not invent any new facts.",
      "2. Do not convert participation into ownership.",
      "3. Do not describe technical implementation as product leadership unless explicitly supported.",
      "4. Return JSON array of objects with experienceId and text.",
      "5. Use only the supplied responsibilities, outcomes, and evidence notes.",
      "",
      JSON.stringify(input, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return [];
  }

  return safeParseBullets(text);
}

function safeParseBullets(text: string): BulletRewriteCandidate[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const experienceId = typeof record.experienceId === "string" ? record.experienceId.trim() : "";
        const bulletText = typeof record.text === "string" ? record.text.trim() : "";
        if (!experienceId || !bulletText) return null;

        return {
          experienceId,
          text: bulletText,
        } satisfies BulletRewriteCandidate;
      })
      .filter((item): item is BulletRewriteCandidate => Boolean(item));
  } catch {
    return [];
  }
}
