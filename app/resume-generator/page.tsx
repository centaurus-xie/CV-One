import { redirect } from "next/navigation";

import { defaultLocale, routePaths, withLocale } from "@/lib/i18n/config";

export default function ResumeGeneratorPage() {
  redirect(withLocale(defaultLocale, routePaths.resumeGenerator));
}
