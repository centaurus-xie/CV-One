import type { Experience } from "@/lib/types/experience";
import type {
  ExperienceMatchHints,
  JobTarget,
  NarrativeAdjustmentStrategy,
} from "@/lib/types/job-target";

export type ExperienceSignal = {
  id: string;
  experienceId: string;
  signalType: string;
  signalText: string;
  evidenceRefs: string[];
  confidence: number | null;
  sourceText: string;
};

export type NarrativeTheme = {
  id: string;
  themeName: string;
  description: string;
  supportingSignalIds: string[];
  supportingExperienceIds: string[];
  sourceText: string;
};

export type TransitionLogic = {
  id: string;
  jobTargetId: string;
  logicSummary: string;
  supportingThemeIds: string[];
  riskPoints: string[];
  missingLinks: string[];
  sourceText: string;
};

export type NarrativePlan = {
  id: string;
  jobTargetId: string;
  transitionLogicId: string | null;
  positioningStatement: string;
  careerStorySummary: string;
  transitionLogic: string;
  coreThemes: string[];
  strengthsToEmphasize: string[];
  downplayPoints: string[];
  risksToAddress: string[];
  claimsToAvoid: string[];
  evidenceGaps: string[];
  supportingExperienceIds: string[];
  sourceText: string;
};

export type BuildNarrativePipelineRequest = {
  experiences: Experience[];
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
  experienceMatchHints: ExperienceMatchHints;
};

export type BuildNarrativePipelineResponse = {
  experienceSignals: ExperienceSignal[];
  narrativeThemes: NarrativeTheme[];
  transitionLogicNode: TransitionLogic;
  narrativePlan: NarrativePlan;
};

export type SignalCandidate = {
  signalType: string;
  signalText: string;
  evidenceRefs: string[];
  confidence: number | null;
};

export type ThemeCandidate = {
  themeName: string;
  description: string;
  supportingSignalIds: string[];
};

export type TransitionExpression = {
  logicSummary: string;
  riskPoints: string[];
  missingLinks: string[];
};
