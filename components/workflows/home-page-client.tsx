"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/locale-provider";
import { routePaths, withLocale } from "@/lib/i18n/config";

export function HomePageClient() {
  const { locale, messages } = useI18n();
  const copy = messages.home;

  return (
    <main className="stack-32">
      <section className="hero-card">
        <div className="eyebrow">{copy.eyebrow}</div>
        <h1 className="hero-title">{copy.title}</h1>
        <p className="hero-copy">{copy.description}</p>
        <div className="hero-actions">
          <div className="pills-row">
            {copy.pills.map((pill) => (
              <span key={pill} className="pill">
                {pill}
              </span>
            ))}
          </div>
          <div className="pills-row">
            <Link
              href={withLocale(locale, routePaths.experienceIntake)}
              className="pill-button"
              data-variant="primary"
            >
              {copy.primaryAction}
            </Link>
            <Link
              href={withLocale(locale, routePaths.narrativeBuilder)}
              className="pill-button"
              data-variant="secondary"
            >
              {copy.secondaryAction}
            </Link>
          </div>
        </div>
      </section>

      <section className="page-section stack-24">
        <div>
          <div className="eyebrow">{copy.workflowEyebrow}</div>
          <h2 className="section-title">{copy.workflowTitle}</h2>
          <p className="page-copy">{copy.workflowDescription}</p>
        </div>

        <div className="grid-2">
          <article className="surface-card stack-16">
            <h3 className="card-title">{copy.cards.experienceIntake.title}</h3>
            <p className="result-copy">{copy.cards.experienceIntake.description}</p>
            <Link
              href={withLocale(locale, routePaths.experienceIntake)}
              className="pill-button"
              data-variant="secondary"
            >
              {messages.common.actions.openPage}
            </Link>
          </article>

          <article className="surface-card stack-16">
            <h3 className="card-title">{copy.cards.narrativeBuilder.title}</h3>
            <p className="result-copy">{copy.cards.narrativeBuilder.description}</p>
            <Link
              href={withLocale(locale, routePaths.narrativeBuilder)}
              className="pill-button"
              data-variant="secondary"
            >
              {messages.common.actions.openPage}
            </Link>
          </article>

          <article className="surface-card stack-16">
            <h3 className="card-title">{copy.cards.resumeGenerator.title}</h3>
            <p className="result-copy">{copy.cards.resumeGenerator.description}</p>
            <Link
              href={withLocale(locale, routePaths.resumeGenerator)}
              className="pill-button"
              data-variant="secondary"
            >
              {messages.common.actions.openPage}
            </Link>
          </article>

          <article className="surface-card stack-16">
            <h3 className="card-title">{copy.cards.interviewPrep.title}</h3>
            <p className="result-copy">{copy.cards.interviewPrep.description}</p>
            <Link
              href={withLocale(locale, routePaths.interviewPrep)}
              className="pill-button"
              data-variant="secondary"
            >
              {messages.common.actions.openPage}
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
