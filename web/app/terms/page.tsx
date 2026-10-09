import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Bharat App",
  description: "Terms of use for Bharat App civic services and cyber safety tools.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-[#050B14] px-5 py-10 text-[#ECF2FA]">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-4 text-[#C8D5EA]">Bharat App provides informational civic and cyber safety tools. Verify urgent information with official services and contact emergency responders directly when needed.</p>
    </main>
  );
}
