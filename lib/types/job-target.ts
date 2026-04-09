import type { Experience } from "@/lib/types/experience";

export type JobTarget = {
  id: string;
  jobTitle: string;
  company: string | null;
  jobDescriptionRaw: string;
  responsibilities: string[];
  requirements: string[];
  preferenceSignals: string[];
  roleKeywords: string[];
  sourceText: string;
};

export type NarrativeAdjustmentStrategy = {
  id: string;
  jobTargetId: string;
  emphasizePoints: string[];
  downplayPoints: string[];
  transitionAngles: string[];
  roleFitHypotheses: string[];
  sourceText: string;
};

export type ExperienceMatchHint = {
  experienceId: string;
  title: string;
  matchScore: number;
  matchedKeywords: string[];
  rationale: string;
  useRecommendation: "PRIMARY" | "SUPPORTING" | "OPTIONAL";
};

export type ExperienceMatchHints = {
  primaryMatches: ExperienceMatchHint[];
  supportingMatches: ExperienceMatchHint[];
  optionalMatches: ExperienceMatchHint[];
};

export type JobTargetAnalyzeRequest = {
  jobDescriptionRaw: string;
  companyNotes?: string | null;
  experiences?: Experience[] | null;
};

export type JobTargetAnalyzeResponse = {
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
  experienceMatchHints: ExperienceMatchHints;
};

export type NarrativeStrategyCandidate = {
  emphasizePoints: string[];
  downplayPoints: string[];
  transitionAngles: string[];
  roleFitHypotheses: string[];
  preferenceSignals: string[];
};
