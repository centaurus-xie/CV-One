export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export const routePaths = {
  home: "",
  experienceIntake: "/experience-intake",
  narrativeBuilder: "/narrative-builder",
  resumeGenerator: "/resume-generator",
  interviewPrep: "/interview-prep",
} as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function withLocale(locale: Locale, path = "") {
  return `/${locale}${path}`;
}
