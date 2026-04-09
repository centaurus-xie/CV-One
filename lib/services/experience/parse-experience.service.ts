import { extractExperienceCandidates } from "@/lib/services/experience/llm-extractor";
import type {
  Experience,
  ExperienceFormInput,
  ExperienceParseRequest,
  ExperienceType,
} from "@/lib/types/experience";
import {
  cleanList,
  deriveSummary,
  deriveTitleAndOrganization,
  extractDateRange,
  inferExperienceType,
  listFromUnknown,
  normalizeFormInput,
  normalizeWhitespacePreserveParagraphs,
  normalizeWhitespace,
  parseDateToken,
  scoreConfidence,
  splitRawTextIntoBlocks,
  takeEvidenceSnippets,
} from "@/lib/utils/experience-parser";

export async function parseExperienceInput(input: ExperienceParseRequest): Promise<Experience[]> {
  const experiences: Experience[] = [];

  if (typeof input.rawText === "string" && input.rawText.trim()) {
    const parsedFromText = await parseExperiencesFromRawText(input.rawText);
    experiences.push(...parsedFromText);
  }

  const formItems = normalizeFormEntries(input.formData);
  for (const formItem of formItems) {
    experiences.push(parseExperienceFromForm(formItem));
  }

  return experiences;
}

async function parseExperiencesFromRawText(rawText: string): Promise<Experience[]> {
  const blocks = splitRawTextIntoBlocks(rawText);
  const parsedBlocks = await Promise.all(blocks.map((block) => parseExperienceBlock(block)));
  return parsedBlocks.filter((experience) => hasUsefulContent(experience));
}

async function parseExperienceBlock(block: string): Promise<Experience> {
  const normalizedBlock = normalizeWhitespacePreserveParagraphs(block);
  const normalizedSourceText = normalizeWhitespace(block);
  const { title, organization } = deriveTitleAndOrganization(normalizedBlock);
  const { startDate, endDate } = extractDateRange(normalizedBlock);
  const extracted = await extractExperienceCandidates(normalizedBlock);

  const responsibilities = cleanList(extracted.responsibilities);
  const outcomes = cleanList(extracted.outcomes);
  const skills = cleanList(extracted.skills);
  const evidenceNotes = cleanList([
    ...extracted.evidenceNotes,
    ...takeEvidenceSnippets(normalizedBlock),
  ]);

  return {
    id: crypto.randomUUID(),
    type: inferTypeFromBlock(normalizedBlock),
    title,
    organization,
    startDate,
    endDate,
    location: null,
    summary: deriveSummary(normalizedBlock),
    responsibilities,
    outcomes,
    skills,
    tools: [],
    evidenceNotes,
    sourceText: normalizedSourceText,
    confidenceLevel: scoreConfidence({
      hasTitle: Boolean(title && title !== "Untitled Experience"),
      hasDates: Boolean(startDate || endDate),
      responsibilities: responsibilities.length,
      outcomes: outcomes.length,
      skills: skills.length,
      extractorConfidence: extracted.confidenceLevel,
    }),
  };
}

function parseExperienceFromForm(formInput: ExperienceFormInput): Experience {
  const normalized = normalizeFormInput(formInput);
  const sourceText = normalized.sourceText ?? buildFallbackSourceText(normalized);
  const startDate = parseDateToken(normalized.startDate);
  const endDate = parseDateToken(normalized.endDate);

  const responsibilities = listFromUnknown(normalized.responsibilities);
  const outcomes = listFromUnknown(normalized.outcomes);
  const skills = listFromUnknown(normalized.skills);
  const tools = listFromUnknown(normalized.tools);
  const evidenceNotes = cleanList([
    ...listFromUnknown(normalized.evidenceNotes),
    ...takeEvidenceSnippets(sourceText),
  ]);

  return {
    id: crypto.randomUUID(),
    type: inferExperienceType(normalized.type),
    title: normalized.title ?? "Untitled Experience",
    organization: normalized.organization ?? null,
    startDate,
    endDate,
    location: normalized.location ?? null,
    summary: normalized.summary ?? null,
    responsibilities,
    outcomes,
    skills,
    tools,
    evidenceNotes,
    sourceText,
    confidenceLevel: scoreConfidence({
      hasTitle: Boolean(normalized.title),
      hasDates: Boolean(startDate || endDate),
      responsibilities: responsibilities.length,
      outcomes: outcomes.length,
      skills: skills.length,
      extractorConfidence: null,
    }),
  };
}

function normalizeFormEntries(formData: ExperienceParseRequest["formData"]): ExperienceFormInput[] {
  if (!formData) return [];
  return Array.isArray(formData) ? formData : [formData];
}

function buildFallbackSourceText(formInput: ExperienceFormInput): string {
  const lines = [
    formInput.title ?? "",
    formInput.organization ?? "",
    formInput.summary ?? "",
    ...listFromUnknown(formInput.responsibilities),
    ...listFromUnknown(formInput.outcomes),
    ...listFromUnknown(formInput.skills),
    ...listFromUnknown(formInput.evidenceNotes),
  ].filter(Boolean);

  return normalizeWhitespace(lines.join("\n")) || "User provided structured experience data.";
}

function inferTypeFromBlock(block: string): ExperienceType {
  const lowered = block.toLowerCase();
  if (/\bproject\b|项目/.test(lowered)) return "PROJECT";
  if (/\binitiative\b|专项|计划/.test(lowered)) return "INITIATIVE";
  return "ROLE";
}

function hasUsefulContent(experience: Experience): boolean {
  return Boolean(
    experience.title ||
      experience.summary ||
      experience.responsibilities.length ||
      experience.outcomes.length ||
      experience.skills.length,
  );
}
