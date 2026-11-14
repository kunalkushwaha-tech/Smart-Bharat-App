import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Safety - Bharat App",
  description: "Read how Bharat App handles browser data, certificate IDs, shared content, and security-tool checks.",
  openGraph: {
    title: "Privacy & Safety - Bharat App",
    description: "Read how Bharat App handles browser data, certificate IDs, shared content, and security-tool checks.",
    url: "/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy & Safety - Bharat App",
    description: "Read how Bharat App handles browser data, certificate IDs, shared content, and security-tool checks.",
  },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
