import { NextResponse } from "next/server";

import { parseExperienceInput } from "@/lib/services/experience/parse-experience.service";
import type { ExperienceParseRequest } from "@/lib/types/experience";

export async function POST(request: Request) {
  let payload: ExperienceParseRequest;

  try {
    payload = (await request.json()) as ExperienceParseRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const hasRawText = typeof payload.rawText === "string" && payload.rawText.trim().length > 0;
  const hasFormData = Boolean(payload.formData) && (!Array.isArray(payload.formData) || payload.formData.length > 0);

  if (!hasRawText && !hasFormData) {
    return NextResponse.json(
      { error: "Request body must include either rawText or formData." },
      { status: 400 },
    );
  }

  const experiences = await parseExperienceInput(payload);

  return NextResponse.json(experiences);
}
