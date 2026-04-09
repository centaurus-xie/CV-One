"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/providers/locale-provider";
import { locales, type Locale } from "@/lib/i18n/config";

function replaceLocaleInPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  segments[0] = locale;
  return `/${segments.join("/")}`;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, messages } = useI18n();

  return (
    <div className="pills-row" aria-label={messages.common.language}>
      {locales.map((item) => (
        <Link
          key={item}
          href={replaceLocaleInPath(pathname, item)}
          className="nav-link"
          data-active={locale === item}
        >
          {messages.common.localeNames[item]}
        </Link>
      ))}
    </div>
  );
}
