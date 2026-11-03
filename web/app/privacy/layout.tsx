import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Safety - Bharat App",
  description: "Learn how Bharat App handles browser data, certificate IDs, and security-tool checks.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
