import type { Metadata } from "next";
import ClearMyData from "../components/ClearMyData";

export const metadata: Metadata = {
  title: "Privacy Policy - Bharat App",
  description: "Learn how Bharat App handles local browser data and anonymous community reports.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl bg-[#050B14] px-5 py-10 text-[#ECF2FA]">
      <a href="#privacy-content" className="skip-link">Skip to main content</a>
      <article id="privacy-content">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-[#C8D5EA]">Bharat App stores tool history, preferences, ICE Card information, formatted complaint history, and other app data locally in your browser. My Complaints history is local-only and is not synced to a server. Community Scam Alerts sends anonymous reports to Supabase when configured.</p>
        <p className="mt-3 text-[#C8D5EA]">Use the button below to clear all data written by Bharat App in this browser. You can also clear site data through your browser settings.</p>
        <ClearMyData />
      </article>
    </main>
  );
}
