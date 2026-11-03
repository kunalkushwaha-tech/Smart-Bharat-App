import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Verification - Bharat App",
  description: "Verify a Bharat App Cyber Awareness certificate ID.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/verify" },
};

export default function VerifyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
