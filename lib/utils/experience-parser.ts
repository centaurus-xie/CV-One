import type { ExperienceFormInput, ExperienceType } from "@/lib/types/experience";

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const PRESENT_TOKENS = ["present", "current", "now", "至今", "现在"];

export function normalizeWhitespace(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

export function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    const item = normalizeWhitespace(value.replace(/^[-*•\d.)\s]+/, "").replace(/[;,:]+$/, ""));
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(item);
  }

  return cleaned;
}

export function listFromUnknown(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return cleanList(value.filter(Boolean));
  }

  if (typeof value !== "string") {
    return [];
  }

  return cleanList(
    value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function splitRawTextIntoBlocks(rawText: string): string[] {
  const normalized = normalizeWhitespacePreserveParagraphs(rawText);
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.length > 0 ? blocks : [normalized];
}

export function normalizeWhitespacePreserveParagraphs(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function inferExperienceType(value?: string | null): ExperienceType {
  const normalized = (value ?? "").trim().toUpperCase();

  if (normalized === "PROJECT" || normalized === "INITIATIVE" || normalized === "ROLE") {
    return normalized;
  }

  return "ROLE";
}

export function extractDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const inlineMatch = text.match(
    /((?:[A-Za-z]{3,9}\s+\d{4})|(?:\d{4}[./-]\d{1,2})|(?:\d{4}))\s*(?:-|–|—|to|~)\s*((?:[A-Za-z]{3,9}\s+\d{4})|(?:\d{4}[./-]\d{1,2})|(?:\d{4})|Present|Current|Now|至今|现在)/i,
  );

  if (inlineMatch) {
    return {
      startDate: parseDateToken(inlineMatch[1]),
      endDate: parseDateToken(inlineMatch[2]),
    };
  }

  return { startDate: null, endDate: null };
}

export function parseDateToken(value?: string | null): string | null {
  if (!value) return null;

  const raw = value.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (PRESENT_TOKENS.includes(lower)) {
    return null;
  }

  const isoMonthMatch = raw.match(/^(\d{4})[./-](\d{1,2})$/);
  if (isoMonthMatch) {
    return toIsoDate(Number(isoMonthMatch[1]), Number(isoMonthMatch[2]));
  }

  const yearMatch = raw.match(/^(\d{4})$/);
  if (yearMatch) {
    return toIsoDate(Number(yearMatch[1]), 1);
  }

  const monthYearMatch = raw.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (monthYearMatch) {
    const month = MONTH_MAP[monthYearMatch[1].toLowerCase()];
    if (month) {
      return toIsoDate(Number(monthYearMatch[2]), month);
    }
  }

  return null;
}

function toIsoDate(year: number, month: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1)).toISOString();
}

export function deriveTitleAndOrganization(block: string): { title: string; organization: string | null } {
  const firstLine = block.split("\n").find((line) => line.trim())?.trim() ?? "";
  if (!firstLine) {
    return { title: "Untitled Experience", organization: null };
  }

  const separators = [" at ", " @ ", " | ", " - ", " — "];

  for (const separator of separators) {
    if (firstLine.includes(separator)) {
      const [title, organization] = firstLine.split(separator, 2).map((item) => item.trim());
      return {
        title: title || "Untitled Experience",
        organization: organization || null,
      };
    }
  }

  return { title: firstLine, organization: null };
}

export function deriveSummary(block: string): string | null {
  const sentences = sentenceSplit(block).filter(Boolean);
  const summary = sentences.find((sentence) => sentence.length > 20);
  return summary ? normalizeWhitespace(summary).slice(0, 280) : null;
}

export function sentenceSplit(value: string): string[] {
  return value
    .split(/\n|(?<=[.!?。；;])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function takeEvidenceSnippets(value: string, limit = 4): string[] {
  return sentenceSplit(value)
    .slice(0, limit)
    .map((sentence) => `Source snippet: ${sentence}`);
}

export function scoreConfidence(parts: {
  hasTitle: boolean;
  hasDates: boolean;
  responsibilities: number;
  outcomes: number;
  skills: number;
  extractorConfidence: number | null;
}): number {
  let score = 0.3;

  if (parts.hasTitle) score += 0.15;
  if (parts.hasDates) score += 0.1;
  if (parts.responsibilities > 0) score += 0.15;
  if (parts.outcomes > 0) score += 0.15;
  if (parts.skills > 0) score += 0.1;
  if (parts.extractorConfidence !== null) score += Math.max(0, Math.min(parts.extractorConfidence, 1)) * 0.25;

  return Number(Math.min(score, 0.99).toFixed(2));
}

export function normalizeFormInput(formInput: ExperienceFormInput): ExperienceFormInput {
  return {
    type: inferExperienceType(formInput.type),
    title: normalizeOptionalText(formInput.title),
    organization: normalizeOptionalText(formInput.organization),
    startDate: normalizeOptionalText(formInput.startDate),
    endDate: normalizeOptionalText(formInput.endDate),
    location: normalizeOptionalText(formInput.location),
    summary: normalizeOptionalText(formInput.summary),
    responsibilities: listFromUnknown(formInput.responsibilities),
    outcomes: listFromUnknown(formInput.outcomes),
    skills: listFromUnknown(formInput.skills),
    tools: listFromUnknown(formInput.tools),
    evidenceNotes: listFromUnknown(formInput.evidenceNotes),
    sourceText: normalizeOptionalText(formInput.sourceText),
  };
}

function normalizeOptionalText(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeWhitespace(value);
  return normalized || null;
}
