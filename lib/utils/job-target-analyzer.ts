import type { Experience } from "@/lib/types/experience";
import type { ExperienceMatchHint } from "@/lib/types/job-target";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "will",
  "this",
  "that",
  "from",
  "have",
  "has",
  "are",
  "is",
  "be",
  "an",
  "a",
  "to",
  "of",
  "in",
  "on",
  "or",
  "as",
  "by",
  "we",
]);

const PRODUCT_SIGNALS = [
  "product strategy",
  "roadmap",
  "prioritization",
  "stakeholder management",
  "cross-functional collaboration",
  "user research",
  "customer insights",
  "metrics",
  "experimentation",
  "go-to-market",
  "product thinking",
  "problem definition",
  "需求分析",
  "用户研究",
  "跨团队协作",
  "产品规划",
  "指标",
  "实验",
  "优先级",
];

const TECHNICAL_SIGNALS = [
  "implementation",
  "coding",
  "frontend",
  "backend",
  "architecture",
  "infra",
  "api",
  "system design",
  "engineering",
  "开发",
  "实现",
  "架构",
  "接口",
  "工程",
];

export function normalizeJobText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function segmentJobDescription(jobDescriptionRaw: string): {
  responsibilities: string[];
  requirements: string[];
  preferenceSignals: string[];
  rawSections: string[];
} {
  const normalized = normalizeJobText(jobDescriptionRaw);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const responsibilities: string[] = [];
  const requirements: string[] = [];
  const preferenceSignals: string[] = [];

  let mode: "RESPONSIBILITIES" | "REQUIREMENTS" | "PREFERENCES" | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (/(responsibilities|what you'?ll do|what you will do|what you'll be doing|职责)/i.test(lower)) {
      mode = "RESPONSIBILITIES";
      continue;
    }

    if (/(requirements|qualifications|what we'?re looking for|you have|任职要求|资格)/i.test(lower)) {
      mode = "REQUIREMENTS";
      continue;
    }

    if (/(preferred|nice to have|bonus|plus|preferred qualifications|加分项)/i.test(lower)) {
      mode = "PREFERENCES";
      continue;
    }

    const cleaned = cleanBullet(line);
    if (!cleaned) continue;

    if (mode === "RESPONSIBILITIES") {
      responsibilities.push(cleaned);
      continue;
    }

    if (mode === "REQUIREMENTS") {
      requirements.push(cleaned);
      continue;
    }

    if (mode === "PREFERENCES") {
      preferenceSignals.push(cleaned);
      continue;
    }

    if (looksLikeRequirement(cleaned)) {
      requirements.push(cleaned);
    } else if (looksLikePreference(cleaned)) {
      preferenceSignals.push(cleaned);
    } else {
      responsibilities.push(cleaned);
    }
  }

  return {
    responsibilities: uniqueList(responsibilities),
    requirements: uniqueList(requirements),
    preferenceSignals: uniqueList(preferenceSignals),
    rawSections: lines,
  };
}

export function extractRoleKeywords(input: {
  responsibilities: string[];
  requirements: string[];
  preferenceSignals: string[];
}): string[] {
  const joined = [...input.responsibilities, ...input.requirements, ...input.preferenceSignals].join(" ");
  const tokens = joined
    .toLowerCase()
    .split(/[^a-zA-Z0-9\u4e00-\u9fa5+#/. -]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 2 || /[\u4e00-\u9fa5]/.test(token))
    .filter((token) => !STOP_WORDS.has(token));

  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([token]) => token);
}

export function deriveJobTitle(jobDescriptionRaw: string): string {
  const firstNonEmptyLine = normalizeJobText(jobDescriptionRaw)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstNonEmptyLine || "Untitled Job Target";
}

export function inferPreferenceSignals(input: {
  companyNotes?: string | null;
  roleKeywords: string[];
  requirements: string[];
  preferenceSignals: string[];
}): string[] {
  const derived: string[] = [];
  const combinedText = [
    input.companyNotes ?? "",
    ...input.requirements,
    ...input.preferenceSignals,
    ...input.roleKeywords,
  ]
    .join(" ")
    .toLowerCase();

  if (/(ambiguous|0 to 1|zero to one|fast-paced|startup|创业|从0到1)/i.test(combinedText)) {
    derived.push("Likely values ownership in ambiguous or early-stage environments.");
  }

  if (/(cross-functional|stakeholder|alignment|协作|跨团队)/i.test(combinedText)) {
    derived.push("Likely values cross-functional coordination and stakeholder alignment.");
  }

  if (/(metrics|data|analytics|experiment|sql|指标|数据|实验)/i.test(combinedText)) {
    derived.push("Likely values data-informed decision making and measurable outcomes.");
  }

  if (/(user|customer|research|用户|客户|研究)/i.test(combinedText)) {
    derived.push("Likely values user-centric problem framing.");
  }

  return uniqueList([...input.preferenceSignals, ...derived]);
}

export function matchExperiencesToJobTarget(
  experiences: Experience[],
  roleKeywords: string[],
): ExperienceMatchHint[] {
  return experiences
    .map((experience) => {
      const experienceText = [
        experience.title,
        experience.organization ?? "",
        experience.summary ?? "",
        ...experience.responsibilities,
        ...experience.outcomes,
        ...experience.skills,
        ...experience.tools,
        ...experience.evidenceNotes,
        experience.sourceText,
      ]
        .join(" ")
        .toLowerCase();

      const matchedKeywords = roleKeywords.filter((keyword) => experienceText.includes(keyword.toLowerCase()));
      const score = computeMatchScore(experienceText, matchedKeywords);

      return {
        experienceId: experience.id,
        title: experience.title,
        matchScore: score,
        matchedKeywords,
        rationale: buildMatchRationale(experience, matchedKeywords, score),
        useRecommendation: deriveUseRecommendation(score),
      } satisfies ExperienceMatchHint;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function deriveDeterministicStrategy(input: {
  responsibilities: string[];
  requirements: string[];
  preferenceSignals: string[];
  roleKeywords: string[];
  matchHints: ExperienceMatchHint[];
}): {
  emphasizePoints: string[];
  downplayPoints: string[];
  transitionAngles: string[];
  roleFitHypotheses: string[];
} {
  const combined = [...input.responsibilities, ...input.requirements, ...input.preferenceSignals].join(" ").toLowerCase();

  const emphasizePoints: string[] = [];
  const downplayPoints: string[] = [];
  const transitionAngles: string[] = [];
  const roleFitHypotheses: string[] = [];

  if (containsAny(combined, PRODUCT_SIGNALS)) {
    emphasizePoints.push("Emphasize product-adjacent work: problem framing, prioritization, user impact, and cross-functional coordination.");
  }

  if (/(metrics|data|analytics|experiment|sql|指标|数据|实验)/i.test(combined)) {
    emphasizePoints.push("Emphasize measurable outcomes, metrics usage, and evidence-based decision making.");
  }

  if (/(stakeholder|cross-functional|alignment|协作|跨团队)/i.test(combined)) {
    emphasizePoints.push("Emphasize collaboration with engineering, design, business, or operations stakeholders.");
  }

  if (containsAny(combined, TECHNICAL_SIGNALS)) {
    downplayPoints.push("Downplay implementation-only detail unless it directly supports product judgment or user impact.");
  }

  if (/(product|pm|产品)/i.test(combined)) {
    transitionAngles.push("Frame the transition as an expansion from execution depth into product judgment and decision ownership.");
  }

  if (/(user|customer|research|用户|客户)/i.test(combined)) {
    transitionAngles.push("Anchor the story in user problem understanding rather than technology for its own sake.");
  }

  for (const hint of input.matchHints.slice(0, 3)) {
    if (hint.matchScore <= 0) continue;
    roleFitHypotheses.push(
      `${hint.title} can support role fit because it overlaps with ${hint.matchedKeywords.slice(0, 4).join(", ")}.`,
    );
  }

  return {
    emphasizePoints: uniqueList(emphasizePoints),
    downplayPoints: uniqueList(downplayPoints),
    transitionAngles: uniqueList(transitionAngles),
    roleFitHypotheses: uniqueList(roleFitHypotheses),
  };
}

function computeMatchScore(experienceText: string, matchedKeywords: string[]): number {
  const base = Math.min(matchedKeywords.length * 0.18, 0.9);
  const productBonus = containsAny(experienceText, PRODUCT_SIGNALS) ? 0.08 : 0;
  const metricsBonus = /(metrics|data|analytics|experiment|sql|指标|数据|实验)/i.test(experienceText) ? 0.06 : 0;
  return Number(Math.min(base + productBonus + metricsBonus, 0.99).toFixed(2));
}

function buildMatchRationale(experience: Experience, matchedKeywords: string[], score: number): string {
  if (score === 0) {
    return `${experience.title} has limited direct overlap with the current JD keywords.`;
  }

  return `${experience.title} overlaps with the JD through ${matchedKeywords.slice(0, 5).join(", ")}.`;
}

function deriveUseRecommendation(score: number): ExperienceMatchHint["useRecommendation"] {
  if (score >= 0.5) return "PRIMARY";
  if (score >= 0.2) return "SUPPORTING";
  return "OPTIONAL";
}

function cleanBullet(value: string): string {
  return value.replace(/^[-*•\d.)\s]+/, "").trim();
}

function looksLikeRequirement(value: string): boolean {
  return /(experience|years|ability|proven|strong|familiarity|bachelor|must|should|able to|经验|能力|熟悉|本科|需要)/i.test(
    value,
  );
}

function looksLikePreference(value: string): boolean {
  return /(preferred|bonus|plus|nice to have|加分|优先)/i.test(value);
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

function containsAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}
