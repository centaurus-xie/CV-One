import { NextResponse } from "next/server";

import { analyzeJobTarget } from "@/lib/services/job-target/analyze-job-target.service";
import type { JobTargetAnalyzeRequest } from "@/lib/types/job-target";

export async function POST(request: Request) {
  let payload: JobTargetAnalyzeRequest;

  try {
    payload = (await request.json()) as JobTargetAnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof payload.jobDescriptionRaw !== "string" || !payload.jobDescriptionRaw.trim()) {
    return NextResponse.json({ error: "jobDescriptionRaw is required." }, { status: 400 });
  }

  const result = await analyzeJobTarget(payload);

  return NextResponse.json(result);
}
