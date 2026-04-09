"use client";

import { useState } from "react";

import { useI18n } from "@/components/providers/locale-provider";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ResultCard } from "@/components/ui/result-card";
import { StatusBanner } from "@/components/ui/status-banner";

type InterviewResult = {
  interviewQuestionSet: Record<string, unknown>;
  interviewAnswerDrafts: Record<string, unknown>[];
};

export function InterviewPrepClient() {
  const { messages } = useI18n();
  const copy = messages.pages.interviewPrep;
  const [experienceJson, setExperienceJson] = useState("[]");
  const [resumeVariantJson, setResumeVariantJson] = useState("{}");
  const [narrativePlanJson, setNarrativePlanJson] = useState("{}");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setStatus(copy.runningStatus);

    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiences: JSON.parse(experienceJson),
          resumeVariant: JSON.parse(resumeVariantJson),
          narrativePlan: JSON.parse(narrativePlanJson),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? copy.errorStatus);
      }

      setResult(data as InterviewResult);
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
              id="interview-experience-json"
              label={copy.experienceJsonLabel}
              value={experienceJson}
              onChange={setExperienceJson}
              placeholder={copy.placeholderArray}
              multiline
            />
            <FormField
              id="interview-resume-json"
              label={copy.resumeVariantJsonLabel}
              value={resumeVariantJson}
              onChange={setResumeVariantJson}
              placeholder={copy.placeholderObject}
              multiline
            />
            <FormField
              id="interview-narrative-json"
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
                <span className="meta-label">{copy.sections.questionSet}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.interviewQuestionSet, null, 2)}
                </pre>
              </div>
              <div className="result-block stack-16">
                <span className="meta-label">{copy.sections.answerDrafts}</span>
                <pre className="input" style={{ whiteSpace: "pre-wrap", minHeight: 0 }}>
                  {JSON.stringify(result.interviewAnswerDrafts, null, 2)}
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
