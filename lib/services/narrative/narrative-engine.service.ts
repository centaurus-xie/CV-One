import { prisma } from "@/lib/db/prisma";
import { buildExperienceSignals } from "@/lib/services/narrative/stage-1-experience-to-signals.service";
import { buildNarrativeThemes } from "@/lib/services/narrative/stage-2-signals-to-themes.service";
import { buildTransitionLogic } from "@/lib/services/narrative/stage-3-themes-to-transition.service";
import { buildNarrativePlan } from "@/lib/services/narrative/stage-4-transition-to-plan.service";
import type {
  BuildNarrativePipelineRequest,
  BuildNarrativePipelineResponse,
} from "@/lib/types/narrative";

export async function runNarrativeEngine(
  input: BuildNarrativePipelineRequest,
): Promise<BuildNarrativePipelineResponse> {
  await ensurePersistedInputs(input);

  const experienceSignals = await buildExperienceSignals({
    experiences: input.experiences,
    jobTarget: input.jobTarget,
    narrativeAdjustmentStrategy: input.narrativeAdjustmentStrategy,
  });

  const narrativeThemes = await buildNarrativeThemes({
    signals: experienceSignals,
    narrativeAdjustmentStrategy: input.narrativeAdjustmentStrategy,
  });

  const transitionLogicNode = await buildTransitionLogic({
    jobTarget: input.jobTarget,
    narrativeAdjustmentStrategy: input.narrativeAdjustmentStrategy,
    experienceMatchHints: input.experienceMatchHints,
    themes: narrativeThemes,
  });

  const narrativePlan = await buildNarrativePlan({
    jobTarget: input.jobTarget,
    narrativeAdjustmentStrategy: input.narrativeAdjustmentStrategy,
    transitionLogicNode,
    themes: narrativeThemes,
    experiences: input.experiences,
  });

  return {
    experienceSignals,
    narrativeThemes,
    transitionLogicNode,
    narrativePlan,
  };
}

async function ensurePersistedInputs(input: BuildNarrativePipelineRequest): Promise<void> {
  for (const experience of input.experiences) {
    await prisma.experience.upsert({
      where: { id: experience.id },
      update: {
        type: experience.type,
        title: experience.title,
        organization: experience.organization,
        startDate: experience.startDate ? new Date(experience.startDate) : null,
        endDate: experience.endDate ? new Date(experience.endDate) : null,
        location: experience.location,
        summary: experience.summary,
        responsibilities: experience.responsibilities,
        outcomes: experience.outcomes,
        skills: experience.skills,
        tools: experience.tools,
        evidenceNotes: experience.evidenceNotes,
        sourceText: experience.sourceText,
        confidenceLevel: experience.confidenceLevel,
      },
      create: {
        id: experience.id,
        type: experience.type,
        title: experience.title,
        organization: experience.organization,
        startDate: experience.startDate ? new Date(experience.startDate) : null,
        endDate: experience.endDate ? new Date(experience.endDate) : null,
        location: experience.location,
        summary: experience.summary,
        responsibilities: experience.responsibilities,
        outcomes: experience.outcomes,
        skills: experience.skills,
        tools: experience.tools,
        evidenceNotes: experience.evidenceNotes,
        sourceText: experience.sourceText,
        confidenceLevel: experience.confidenceLevel,
      },
    });
  }

  await prisma.jobTarget.upsert({
    where: { id: input.jobTarget.id },
    update: {
      jobTitle: input.jobTarget.jobTitle,
      company: input.jobTarget.company,
      jobDescriptionRaw: input.jobTarget.jobDescriptionRaw,
      responsibilities: input.jobTarget.responsibilities,
      requirements: input.jobTarget.requirements,
      preferenceSignals: input.jobTarget.preferenceSignals,
      roleKeywords: input.jobTarget.roleKeywords,
      sourceText: input.jobTarget.sourceText,
    },
    create: {
      id: input.jobTarget.id,
      jobTitle: input.jobTarget.jobTitle,
      company: input.jobTarget.company,
      jobDescriptionRaw: input.jobTarget.jobDescriptionRaw,
      responsibilities: input.jobTarget.responsibilities,
      requirements: input.jobTarget.requirements,
      preferenceSignals: input.jobTarget.preferenceSignals,
      roleKeywords: input.jobTarget.roleKeywords,
      sourceText: input.jobTarget.sourceText,
    },
  });

  await prisma.narrativeAdjustmentStrategy.upsert({
    where: { id: input.narrativeAdjustmentStrategy.id },
    update: {
      jobTargetId: input.jobTarget.id,
      emphasizePoints: input.narrativeAdjustmentStrategy.emphasizePoints,
      downplayPoints: input.narrativeAdjustmentStrategy.downplayPoints,
      transitionAngles: input.narrativeAdjustmentStrategy.transitionAngles,
      roleFitHypotheses: input.narrativeAdjustmentStrategy.roleFitHypotheses,
      sourceText: input.narrativeAdjustmentStrategy.sourceText,
    },
    create: {
      id: input.narrativeAdjustmentStrategy.id,
      jobTargetId: input.jobTarget.id,
      emphasizePoints: input.narrativeAdjustmentStrategy.emphasizePoints,
      downplayPoints: input.narrativeAdjustmentStrategy.downplayPoints,
      transitionAngles: input.narrativeAdjustmentStrategy.transitionAngles,
      roleFitHypotheses: input.narrativeAdjustmentStrategy.roleFitHypotheses,
      sourceText: input.narrativeAdjustmentStrategy.sourceText,
    },
  });
}
