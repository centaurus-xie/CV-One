export type ConsistencyIssueType =
  | "UNSUPPORTED_CLAIM"
  | "TIMELINE_CONFLICT"
  | "SCOPE_INFLATION"
  | "UNCLEAR_TRANSITION";

export type ConsistencySeverity = "LOW" | "MEDIUM" | "HIGH";

export type ConsistencyCheckSource = "TRACEABILITY" | "RULE_ENGINE" | "LLM_ASSIST";

export type ConsistencyCheck = {
  id: string;
  entityType: string;
  entityId: string;
  issueType: ConsistencyIssueType;
  severity: ConsistencySeverity;
  message: string;
  relatedExperienceIds: string[];
  checkSource: ConsistencyCheckSource;
  sourceText: string | null;
};
