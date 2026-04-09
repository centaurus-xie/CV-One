import type { Experience } from "@/lib/types/experience";
import type {
  ExperienceMatchHints,
  JobTarget,
  JobTargetAnalyzeRequest,
  JobTargetAnalyzeResponse,
  NarrativeAdjustmentStrategy,
} from "@/lib/types/job-target";
import { extractNarrativeAdjustmentStrategy } from "@/lib/services/job-target/llm-strategy-extractor";
import {
  deriveDeterministicStrategy,
  deriveJobTitle,
  extractRoleKeywords,
  inferPreferenceSignals,
  matchExperiencesToJobTarget,
  normalizeJobText,
  segmentJobDescription,
} from "@/lib/utils/job-target-analyzer";

export async function analyzeJobTarget(input: JobTargetAnalyzeRequest): Promise<JobTargetAnalyzeResponse> {
  const normalizedJobDescription = normalizeJobText(input.jobDescriptionRaw);
  const experiences = Array.isArray(input.experiences) ? input.experiences : [];
  const segmented = segmentJobDescription(normalizedJobDescription);
  const roleKeywords = extractRoleKeywords(segmented);
  const matchHintsFlat = matchExperiencesToJobTarget(experiences, roleKeywords);
  const deterministicStrategy = deriveDeterministicStrategy({
    responsibilities: segmented.responsibilities,
    requirements: segmented.requirements,
    preferenceSignals: segmented.preferenceSignals,
    roleKeywords,
    matchHints: matchHintsFlat,
  });

  const llmStrategy = await extractNarrativeAdjustmentStrategy({
    jobDescriptionRaw: normalizedJobDescription,
    companyNotes: input.companyNotes,
    deterministicContext: {
      responsibilities: segmented.responsibilities,
      requirements: segmented.requirements,
      preferenceSignals: segmented.preferenceSignals,
      roleKeywords,
      matchSummary: matchHintsFlat.slice(0, 5).map((hint) => hint.rationale),
    },
  });

  const preferenceSignals = uniqueList(
    inferPreferenceSignals({
      companyNotes: input.companyNotes,
      roleKeywords,
      requirements: segmented.requirements,
      preferenceSignals: [
        ...segmented.preferenceSignals,
        ...(llmStrategy?.preferenceSignals ?? []),
      ],
    }),
  );

  const jobTarget: JobTarget = {
    id: crypto.randomUUID(),
    jobTitle: deriveJobTitle(normalizedJobDescription),
    company: inferCompanyName(input.companyNotes),
    jobDescriptionRaw: normalizedJobDescription,
    responsibilities: segmented.responsibilities,
    requirements: segmented.requirements,
    preferenceSignals,
    roleKeywords,
    sourceText: buildSourceText(normalizedJobDescription, input.companyNotes),
  };

  const narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy = {
    id: crypto.randomUUID(),
    jobTargetId: jobTarget.id,
    emphasizePoints: uniqueList([
      ...deterministicStrategy.emphasizePoints,
      ...(llmStrategy?.emphasizePoints ?? []),
    ]),
    downplayPoints: uniqueList([
      ...deterministicStrategy.downplayPoints,
      ...(llmStrategy?.downplayPoints ?? []),
    ]),
    transitionAngles: uniqueList([
      ...deterministicStrategy.transitionAngles,
      ...(llmStrategy?.transitionAngles ?? []),
    ]),
    roleFitHypotheses: uniqueList([
      ...deterministicStrategy.roleFitHypotheses,
      ...(llmStrategy?.roleFitHypotheses ?? []),
    ]),
    sourceText: buildSourceText(normalizedJobDescription, input.companyNotes),
  };

  const experienceMatchHints: ExperienceMatchHints = {
    primaryMatches: matchHintsFlat.filter((hint) => hint.useRecommendation === "PRIMARY"),
    supportingMatches: matchHintsFlat.filter((hint) => hint.useRecommendation === "SUPPORTING"),
    optionalMatches: matchHintsFlat.filter((hint) => hint.useRecommendation === "OPTIONAL"),
  };

  return {
    jobTarget,
    narrativeAdjustmentStrategy,
    experienceMatchHints,
  };
}

function inferCompanyName(companyNotes?: string | null): string | null {
  if (!companyNotes) return null;
  const firstLine = companyNotes
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine || null;
}

function buildSourceText(jobDescriptionRaw: string, companyNotes?: string | null): string {
  return [jobDescriptionRaw, companyNotes?.trim() ?? ""].filter(Boolean).join("\n\n");
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
