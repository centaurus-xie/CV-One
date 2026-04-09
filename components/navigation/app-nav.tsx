"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/providers/locale-provider";
import { routePaths, withLocale } from "@/lib/i18n/config";

export function AppNav() {
  const pathname = usePathname();
  const { locale, messages } = useI18n();

  const navItems = [
    { href: withLocale(locale, routePaths.experienceIntake), label: messages.nav.experienceIntake },
    { href: withLocale(locale, routePaths.narrativeBuilder), label: messages.nav.narrativeBuilder },
    { href: withLocale(locale, routePaths.resumeGenerator), label: messages.nav.resumeGenerator },
    { href: withLocale(locale, routePaths.interviewPrep), label: messages.nav.interviewPrep },
  ];

  return (
    <nav className="nav" aria-label="Primary">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-link"
          data-active={pathname === item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
