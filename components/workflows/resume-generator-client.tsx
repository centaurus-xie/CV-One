"use client";

import { useState } from "react";

import { useI18n } from "@/components/providers/locale-provider";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ResultCard } from "@/components/ui/result-card";
import { StatusBanner } from "@/components/ui/status-banner";

type ResumeResult = {
  resumeVariant: Record<string, unknown>;
  traceabilityMap: Record<string, unknown>;
  consistencyChecks: Record<string, unknown>[];
};

export function ResumeGeneratorClient() {
  const { messages } = useI18n();
  const copy = messages.pages.resumeGenerator;
  const [experienceJson, setExperienceJson] = useState("[]");
  const [jobTargetJson, setJobTargetJson] = useState("{}");
  const [narrativePlanJson, setNarrativePlanJson] = useState("{}");
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setStatus(copy.runningStatus);

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiences: JSON.parse(experienceJson),
          jobTarget: JSON.parse(jobTargetJson),
          narrativePlan: JSON.parse(narrativePlanJson),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? copy.errorStatus);
      }

      setResult(data as ResumeResult);
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
              id="resume-experience-json"
              label={copy.experienceJsonLabel}
              value={experienceJson}
              onChange={setExperienceJson}
              placeholder={copy.placeholderArray}
              multiline
            />
            <FormField
              id="resume-job-target-json"
              label={copy.jobTargetJsonLabel}
              value={jobTargetJson}
              onChange={setJobTargetJson}
              placeholder={copy.placeholderObject}
              multiline
            />
            <FormField
              id="resume-narrative-json"
              label={copy.narrativePlanJsonLabel}
              value={narrativePlanJson}
              onChange={setNarrativePlanJson}
              placeholder={copy.placeholderObject}
              multiline
            />
            <button
              type="button"
              className="pill-button"
              data-variant="primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? copy.generatingButton : copy.generateButton}
            </button>
          </div>
        </ResultCard>

        <ResultCard title={copy.outputTitle}>
          <StatusBanner message={status} />
          {result ? (
            <div className="stack-16">
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.resumeVariant}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.resumeVariant, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.traceabilityMap}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.traceabilityMap, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.consistencyChecks}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.consistencyChecks, null, 2)}
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
