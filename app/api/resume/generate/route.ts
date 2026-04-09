import { NextResponse } from "next/server";

import { generateResumeVariant } from "@/lib/services/resume/generate-resume-variant.service";
import type { GenerateResumeVariantRequest } from "@/lib/types/resume";

export async function POST(request: Request) {
  let payload: GenerateResumeVariantRequest;

  try {
    payload = (await request.json()) as GenerateResumeVariantRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!Array.isArray(payload.experiences) || payload.experiences.length === 0) {
    return NextResponse.json({ error: "experiences is required." }, { status: 400 });
  }

  if (!payload.jobTarget?.id || !payload.narrativePlan?.id) {
    return NextResponse.json({ error: "jobTarget and narrativePlan are required." }, { status: 400 });
  }

  try {
    const result = await generateResumeVariant(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate resume variant.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
