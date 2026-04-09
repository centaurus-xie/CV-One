import { prisma } from "@/lib/db/prisma";
import { extractSupplementalSignals } from "@/lib/services/narrative/llm-signal-extractor";
import type { Experience } from "@/lib/types/experience";
import type { JobTarget, NarrativeAdjustmentStrategy } from "@/lib/types/job-target";
import type { ExperienceSignal, SignalCandidate } from "@/lib/types/narrative";

const SIGNAL_RULES: Array<{
  signalType: string;
  patterns: RegExp[];
  buildText: (experience: Experience) => string;
}> = [
  {
    signalType: "cross_functional_collaboration",
    patterns: [/cross-functional|stakeholder|partnered with|worked with|跨团队|协作|协同/i],
    buildText: (experience) => `${experience.title} shows cross-functional collaboration across teams or stakeholders.`,
  },
  {
    signalType: "user_problem_framing",
    patterns: [/user|customer|research|problem|需求|用户|客户/i],
    buildText: (experience) => `${experience.title} includes evidence of user or problem-oriented thinking.`,
  },
  {
    signalType: "prioritization_decision_making",
    patterns: [/prioritiz|trade-?off|roadmap|decision|scope|优先级|取舍|规划/i],
    buildText: (experience) => `${experience.title} includes prioritization or decision-making signals relevant to product work.`,
  },
  {
    signalType: "metrics_outcome_orientation",
    patterns: [/%|metric|kpi|data|analytics|experiment|sql|增长|指标|数据|实验/i],
    buildText: (experience) => `${experience.title} demonstrates measurable outcomes or data-informed work.`,
  },
];

export async function buildExperienceSignals(input: {
  experiences: Experience[];
  jobTarget: JobTarget;
  narrativeAdjustmentStrategy: NarrativeAdjustmentStrategy;
}): Promise<ExperienceSignal[]> {
  const signals: ExperienceSignal[] = [];

  for (const experience of input.experiences) {
    const deterministicSignals = deriveSignalsFromExperience(experience);
    const supplementalSignals = await extractSupplementalSignals({
      experience,
      jobTarget: input.jobTarget,
      narrativeAdjustmentStrategy: input.narrativeAdjustmentStrategy,
    });

    const mergedSignals = dedupeSignals([...deterministicSignals, ...supplementalSignals]);

    for (const signal of mergedSignals) {
      const created = await prisma.experienceSignal.create({
        data: {
          experienceId: experience.id,
          signalType: signal.signalType,
          signalText: signal.signalText,
          evidenceRefs: signal.evidenceRefs,
          confidence: signal.confidence,
          sourceText: experience.sourceText,
        },
      });

      signals.push({
        id: created.id,
        experienceId: created.experienceId,
        signalType: created.signalType,
        signalText: created.signalText,
        evidenceRefs: created.evidenceRefs,
        confidence: created.confidence,
        sourceText: created.sourceText ?? experience.sourceText,
      });
    }
  }

  return signals;
}

export function deriveSignalsFromExperience(experience: Experience): SignalCandidate[] {
  const text = [
    experience.title,
    experience.summary ?? "",
    ...experience.responsibilities,
    ...experience.outcomes,
    ...experience.skills,
    ...experience.evidenceNotes,
    experience.sourceText,
  ].join(" ");

  const candidates: SignalCandidate[] = [];

  for (const rule of SIGNAL_RULES) {
    if (!rule.patterns.some((pattern) => pattern.test(text))) {
      continue;
    }

    candidates.push({
      signalType: rule.signalType,
      signalText: rule.buildText(experience),
      evidenceRefs: extractEvidenceRefs(text, rule.patterns),
      confidence: 0.7,
    });
  }

  return candidates;
}

function extractEvidenceRefs(text: string, patterns: RegExp[]): string[] {
  const sentences = text
    .split(/\n|(?<=[.!?。；;])/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sentences.filter((sentence) => patterns.some((pattern) => pattern.test(sentence))).slice(0, 3);
}

function dedupeSignals(signals: SignalCandidate[]): SignalCandidate[] {
  const seen = new Set<string>();
  const results: SignalCandidate[] = [];

  for (const signal of signals) {
    const key = `${signal.signalType}:${signal.signalText}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(signal);
  }

  return results;
}
