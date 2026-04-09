import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV-One",
  description: "AI job-search narrative tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
