import type { ExtractionCandidate } from "@/lib/types/experience";
import { invokeLlmJson } from "@/lib/config/llm";
import { cleanList, sentenceSplit } from "@/lib/utils/experience-parser";

const SKILL_KEYWORDS = [
  "product",
  "roadmap",
  "prioritization",
  "stakeholder",
  "user research",
  "sql",
  "python",
  "javascript",
  "typescript",
  "react",
  "node",
  "api",
  "analytics",
  "experimentation",
  "a/b testing",
  "dashboard",
  "figma",
  "jira",
  "agile",
  "scrum",
  "数据分析",
  "产品规划",
  "需求分析",
  "用户研究",
  "跨团队协作",
  "项目管理",
  "实验设计",
  "SQL",
  "Python",
];

export async function extractExperienceCandidates(rawText: string): Promise<ExtractionCandidate> {
  const providerResult = await extractWithProvider(rawText);
  if (providerResult) {
    return providerResult;
  }

  return extractHeuristically(rawText);
}

async function extractWithProvider(rawText: string): Promise<ExtractionCandidate | null> {
  const text = await invokeLlmJson({
    envPrefix: "EXPERIENCE_PARSER_LLM",
    defaultModel: "experience-parser",
    prompt: [
      "Extract structured experience candidates from the source text.",
      "Rules:",
      "1. Do not invent facts.",
      "2. Only use information explicitly present in the source text.",
      "3. Return JSON with responsibilities, outcomes, skills, evidenceNotes, confidenceLevel.",
      "4. Keep each item traceable to the source text.",
      "",
      rawText,
    ].join("\n"),
  });

  if (!text) {
    return null;
  }

  return safeParseCandidate(text);
}

function safeParseCandidate(text: string): ExtractionCandidate | null {
  try {
    const parsed = JSON.parse(text) as Partial<ExtractionCandidate>;
    return {
      responsibilities: cleanList(Array.isArray(parsed.responsibilities) ? parsed.responsibilities : []),
      outcomes: cleanList(Array.isArray(parsed.outcomes) ? parsed.outcomes : []),
      skills: cleanList(Array.isArray(parsed.skills) ? parsed.skills : []),
      evidenceNotes: cleanList(Array.isArray(parsed.evidenceNotes) ? parsed.evidenceNotes : []),
      confidenceLevel:
        typeof parsed.confidenceLevel === "number" ? Math.max(0, Math.min(parsed.confidenceLevel, 1)) : null,
    };
  } catch {
    return null;
  }
}

function extractHeuristically(rawText: string): ExtractionCandidate {
  const sentences = sentenceSplit(rawText);
  const lowerText = rawText.toLowerCase();

  const responsibilities = cleanList(
    sentences.filter(
      (sentence) =>
        !looksLikeOutcome(sentence) &&
        (sentence.startsWith("Led") ||
          sentence.startsWith("Built") ||
          sentence.startsWith("Owned") ||
          sentence.startsWith("Managed") ||
          sentence.startsWith("Designed") ||
          sentence.startsWith("Implemented") ||
          sentence.includes("responsible for") ||
          sentence.includes("负责") ||
          sentence.includes("参与") ||
          sentence.includes("推动")),
    ),
  ).slice(0, 6);

  const outcomes = cleanList(sentences.filter((sentence) => looksLikeOutcome(sentence))).slice(0, 6);

  const skills = cleanList(
    SKILL_KEYWORDS.filter((keyword) => lowerText.includes(keyword.toLowerCase())).map((keyword) => keyword),
  ).slice(0, 12);

  const evidenceNotes = cleanList(sentences.slice(0, 4).map((sentence) => `Source snippet: ${sentence}`));

  return {
    responsibilities,
    outcomes,
    skills,
    evidenceNotes,
    confidenceLevel: 0.45,
  };
}

function looksLikeOutcome(sentence: string): boolean {
  return /%|\b(increased|reduced|improved|launched|grew|saved|delivered|achieved)\b|提升|增长|降低|上线|优化/i.test(
    sentence,
  );
}
