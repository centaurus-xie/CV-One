import type { AnswerDraftCandidate } from "@/lib/types/interview";
import { invokeLlmJson } from "@/lib/config/llm";

export async function draftInterviewAnswers(input: {
  questions: Array<{
    question: string;
    supportingExperienceIds: string[];
    riskFlags: string[];
  }>;
  experiences: Array<{
    id: string;
    title: string;
    summary: string | null;
    responsibilities: string[];
    outcomes: string[];
    evidenceNotes: string[];
    sourceText: string;
  }>;
  narrativeContext: {
    positioningStatement: string;
    transitionLogic: string;
    risksToAddress: string[];
    claimsToAvoid: string[];
  };
}): Promise<AnswerDraftCandidate[]> {
  const text = await invokeLlmJson({
    envPrefix: "INTERVIEW_ANSWER_LLM",
    defaultModel: "interview-answer-drafter",
    prompt: [
      "Draft interview answer outlines grounded in the supplied experiences.",
      "Rules:",
      "1. Do not invent facts.",
      "2. Use only the supplied experience evidence.",
      "3. Keep answers interview-defensible.",
      "4. Return JSON array of objects with question and answerOutline.",
      "",
      JSON.stringify(input, null, 2),
    ].join("\n"),
  });

  if (!text) {
    return [];
  }

  return safeParseAnswerDrafts(text);
}

function safeParseAnswerDrafts(text: string): AnswerDraftCandidate[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const question = typeof record.question === "string" ? record.question.trim() : "";
        const answerOutline = typeof record.answerOutline === "string" ? record.answerOutline.trim() : "";
        if (!question || !answerOutline) return null;

        return {
          question,
          answerOutline,
        } satisfies AnswerDraftCandidate;
      })
      .filter((item): item is AnswerDraftCandidate => Boolean(item));
  } catch {
    return [];
  }
}
