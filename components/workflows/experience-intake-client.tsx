"use client";

import { useState } from "react";

import { useI18n } from "@/components/providers/locale-provider";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ResultCard } from "@/components/ui/result-card";
import { StatusBanner } from "@/components/ui/status-banner";
import type { Experience, ExperienceType } from "@/lib/types/experience";

export function ExperienceIntakeClient() {
  const { messages } = useI18n();
  const copy = messages.pages.experienceIntake;
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<Experience[] | null>(null);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleParse() {
    setLoading(true);
    setStatus(copy.parsingStatus);

    try {
      const response = await fetch("/api/experience/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? copy.errorStatus);
      }

      setResult(data as Experience[]);
      setStatus(copy.parsedStatus.replace("{count}", String((data as Experience[]).length)));
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
              id="experience-raw-text"
              label={copy.rawTextLabel}
              hint={copy.rawTextHint}
              value={rawText}
              onChange={setRawText}
              placeholder={copy.rawTextPlaceholder}
              multiline
            />
            <button
              type="button"
              className="pill-button"
              data-variant="primary"
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
            >
              {loading ? copy.parsingButton : copy.parseButton}
            </button>
          </div>
        </ResultCard>

        <ResultCard title={copy.outputTitle}>
          <StatusBanner message={status} />
          {result ? (
            <div className="stack-16">
              {result.map((item) => (
                <div key={item.id} className="result-block stack-16">
                  <div>
                    <div className="eyebrow">
                      {messages.common.experienceTypes[item.type as ExperienceType]}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="result-copy">
                      {item.organization ?? messages.common.emptyState.noOrganization} ·{" "}
                      {copy.confidenceLabel}{" "}
                      {item.confidenceLevel ?? messages.common.emptyState.notAvailable}
                    </p>
                  </div>
                  <div className="meta-grid">
                    <div className="meta-card">
                      <span className="meta-label">{copy.sections.responsibilities}</span>
                      <ul className="simple-list">
                        {item.responsibilities.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">{copy.sections.outcomes}</span>
                      <ul className="simple-list">
                        {item.outcomes.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">{copy.sections.skills}</span>
                      <ul className="simple-list">
                        {item.skills.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">{copy.sections.evidence}</span>
                      <ul className="simple-list">
                        {item.evidenceNotes.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="result-copy">{copy.noResult}</p>
          )}
        </ResultCard>
      </div>
    </main>
  );
}
