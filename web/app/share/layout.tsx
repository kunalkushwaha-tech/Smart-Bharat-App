import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Content - Smart Bharat",
  description: "Review shared content safely before scanning it.",
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
