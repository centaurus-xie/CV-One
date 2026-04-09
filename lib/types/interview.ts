import type { Experience } from "@/lib/types/experience";
import type { NarrativePlan } from "@/lib/types/narrative";
import type { ResumeVariant } from "@/lib/types/resume";

export type InterviewQuestion = {
  id: string;
  question: string;
  source: "HIGH_RISK_BULLET" | "TRANSITION_POINT" | "WEAK_EVIDENCE";
  supportingExperienceIds: string[];
  riskFlags: string[];
};

export type InterviewQuestionSet = {
  id: string;
  resumeVariantId: string;
  questions: string[];
  sourceText: string;
};

export type InterviewAnswerDraft = {
  id: string;
  question: string;
  answerOutline: string;
  supportingExperienceIds: string[];
  riskFlags: string[];
  userReviewStatus: string | null;
  sourceText: string;
};

export type GenerateInterviewPrepRequest = {
  resumeVariant: ResumeVariant;
  narrativePlan: NarrativePlan;
  experiences: Experience[];
};

export type GenerateInterviewPrepResponse = {
  interviewQuestionSet: InterviewQuestionSet;
  interviewAnswerDrafts: InterviewAnswerDraft[];
};

export type AnswerDraftCandidate = {
  question: string;
  answerOutline: string;
};
