import type { Experience } from "@/lib/types/experience";
import type { JobTarget } from "@/lib/types/job-target";
import type { NarrativePlan } from "@/lib/types/narrative";
import type { ConsistencyCheck } from "@/lib/types/consistency";

export type ResumeBullet = {
  id: string;
  text: string;
  experienceId: string;
  evidenceRefs: string[];
};

export type TraceabilityMap = {
  bullets: Array<{
    bulletId: string;
    experienceId: string;
    sourceText: string;
    evidenceRefs: string[];
  }>;
};

export type ResumeVariant = {
  id: string;
  narrativePlanId: string;
  summary: string | null;
  experienceBullets: string[];
  skillsSection: string[];
  tailoringNotes: string[];
  traceabilityMap: TraceabilityMap;
  sourceText: string;
  selectedExperienceIds: string[];
};

export type GenerateResumeVariantRequest = {
  experiences: Experience[];
  jobTarget: JobTarget;
  narrativePlan: NarrativePlan;
};

export type GenerateResumeVariantResponse = {
  resumeVariant: ResumeVariant;
  traceabilityMap: TraceabilityMap;
  consistencyChecks: ConsistencyCheck[];
};

export type BulletRewriteCandidate = {
  experienceId: string;
  text: string;
};
