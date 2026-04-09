import { NextResponse } from "next/server";

import {
  hasBlockingConsistencyIssues,
  runConsistencyGuardrails,
} from "@/lib/services/consistency/guardrails.service";
import type { Experience } from "@/lib/types/experience";
import type { InterviewAnswerDraft } from "@/lib/types/interview";
import type { NarrativePlan } from "@/lib/types/narrative";
import type { ResumeVariant } from "@/lib/types/resume";

type ConsistencyCheckRequest = {
  experiences: Experience[];
  narrativePlan?: NarrativePlan | null;
  resumeVariant?: ResumeVariant | null;
  interviewAnswerDrafts?: InterviewAnswerDraft[] | null;
};

export async function POST(request: Request) {
  let payload: ConsistencyCheckRequest;

  try {
    payload = (await request.json()) as ConsistencyCheckRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!Array.isArray(payload.experiences) || payload.experiences.length === 0) {
    return NextResponse.json({ error: "experiences is required." }, { status: 400 });
  }

  const checks = await runConsistencyGuardrails(payload);

  return NextResponse.json({
    consistencyChecks: checks,
    blocked: hasBlockingConsistencyIssues(checks),
  });
}
