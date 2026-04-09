"use client";

import { useState } from "react";

import { useI18n } from "@/components/providers/locale-provider";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ResultCard } from "@/components/ui/result-card";
import { StatusBanner } from "@/components/ui/status-banner";

type NarrativeBuildResult = {
  jobTarget: Record<string, unknown>;
  narrativeAdjustmentStrategy: Record<string, unknown>;
  experienceMatchHints: Record<string, unknown>;
  pipeline?: Record<string, unknown>;
};

export function NarrativeBuilderClient() {
  const { messages } = useI18n();
  const copy = messages.pages.narrativeBuilder;
  const [experienceJson, setExperienceJson] = useState("[]");
  const [jobDescriptionRaw, setJobDescriptionRaw] = useState("");
  const [companyNotes, setCompanyNotes] = useState("");
  const [result, setResult] = useState<NarrativeBuildResult | null>(null);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    setStatus(copy.runningStatus);

    try {
      const experiences = JSON.parse(experienceJson);

      const analyzeResponse = await fetch("/api/job-target/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescriptionRaw,
          companyNotes,
          experiences,
        }),
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error ?? copy.errorStatus);
      }

      const narrativeResponse = await fetch("/api/narrative/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiences,
          jobTarget: analyzeData.jobTarget,
          narrativeAdjustmentStrategy: analyzeData.narrativeAdjustmentStrategy,
          experienceMatchHints: analyzeData.experienceMatchHints,
        }),
      });

      const narrativeData = await narrativeResponse.json();
      if (!narrativeResponse.ok) {
        throw new Error(narrativeData.error ?? copy.errorStatus);
      }

      setResult({
        jobTarget: analyzeData.jobTarget,
        narrativeAdjustmentStrategy: analyzeData.narrativeAdjustmentStrategy,
        experienceMatchHints: analyzeData.experienceMatchHints,
        pipeline: narrativeData,
      });
      setStatus(copy.successStatus);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : copy.errorStatus);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-section stack-24">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid-2">
        <ResultCard title={copy.inputTitle}>
          <div className="form-grid">
            <FormField
              id="jd-raw"
              label={copy.jobDescriptionLabel}
              value={jobDescriptionRaw}
              onChange={setJobDescriptionRaw}
              placeholder={copy.jobDescriptionPlaceholder}
              multiline
            />
            <FormField
              id="company-notes"
              label={copy.companyNotesLabel}
              value={companyNotes}
              onChange={setCompanyNotes}
              placeholder={copy.companyNotesPlaceholder}
              multiline
            />
            <FormField
              id="experience-json"
              label={copy.experienceJsonLabel}
              hint={copy.experienceJsonHint}
              value={experienceJson}
              onChange={setExperienceJson}
              placeholder={copy.experienceJsonPlaceholder}
              multiline
            />
            <button
              type="button"
              className="pill-button"
              data-variant="primary"
              onClick={handleRun}
              disabled={loading || !jobDescriptionRaw.trim()}
            >
              {loading ? copy.buildingButton : copy.buildButton}
            </button>
          </div>
        </ResultCard>

        <ResultCard title={copy.outputTitle}>
          <StatusBanner message={status} />
          {result ? (
            <div className="stack-16">
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.jobTarget}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.jobTarget, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.narrativeStrategy}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.narrativeAdjustmentStrategy, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.experienceMatchHints}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.experienceMatchHints, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.pipelineResult}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.pipeline, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="result-copy">{copy.noResult}</p>
          )}
        </ResultCard>
      </div>
    </main>
  );
}
