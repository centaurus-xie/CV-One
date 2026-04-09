import { NextResponse } from "next/server";

import { generateInterviewPrep } from "@/lib/services/interview/generate-interview-prep.service";
import type { GenerateInterviewPrepRequest } from "@/lib/types/interview";

export async function POST(request: Request) {
  let payload: GenerateInterviewPrepRequest;

  try {
    payload = (await request.json()) as GenerateInterviewPrepRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.resumeVariant?.id || !payload.narrativePlan?.id) {
    return NextResponse.json({ error: "resumeVariant and narrativePlan are required." }, { status: 400 });
  }

  if (!Array.isArray(payload.experiences) || payload.experiences.length === 0) {
    return NextResponse.json({ error: "experiences is required." }, { status: 400 });
  }

  try {
    const result = await generateInterviewPrep(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate interview prep.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
