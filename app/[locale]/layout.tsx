import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/navigation/app-nav";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { defaultLocale, isLocale, locales, routePaths, type Locale, withLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const messages = getMessages(activeLocale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <div className="app-shell">
        <header className="topbar">
          <Link href={withLocale(locale, routePaths.home)} className="brand">
            <span className="brand-mark">CV</span>
            <span>{messages.common.brand}</span>
          </Link>
          <div className="stack-16">
            <LanguageSwitcher />
            <AppNav />
          </div>
        </header>
        {children}
      </div>
    </LocaleProvider>
  );
}
