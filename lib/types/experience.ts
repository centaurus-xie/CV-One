export type ExperienceType = "ROLE" | "PROJECT" | "INITIATIVE";

export type Experience = {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  summary: string | null;
  responsibilities: string[];
  outcomes: string[];
  skills: string[];
  tools: string[];
  evidenceNotes: string[];
  sourceText: string;
  confidenceLevel: number | null;
};

export type ExperienceFormInput = {
  type?: ExperienceType | string | null;
  title?: string | null;
  organization?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  summary?: string | null;
  responsibilities?: string[] | string | null;
  outcomes?: string[] | string | null;
  skills?: string[] | string | null;
  tools?: string[] | string | null;
  evidenceNotes?: string[] | string | null;
  sourceText?: string | null;
};

export type ExperienceParseRequest = {
  rawText?: string | null;
  formData?: ExperienceFormInput | ExperienceFormInput[] | null;
};

export type ExtractionCandidate = {
  responsibilities: string[];
  outcomes: string[];
  skills: string[];
  evidenceNotes: string[];
  confidenceLevel: number | null;
};
