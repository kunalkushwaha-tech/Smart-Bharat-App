import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Bharat App",
  description: "Learn about Bharat App, a civic safety and cybersecurity platform for Indian citizens.",
};

const offerings = [
  "Emergency Services & Panic Mode",
  "AI Companion",
  "Security Tools & Audit",
  "Complaints & Grievances",
  "Cyber Awareness Academy",
  "Scheme Eligibility Finder",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050B14] text-[#ECF2FA]">
      <a href="#about-content" className="skip-link">Skip to main content</a>
      <div className="h-[6px] w-full bg-[linear-gradient(90deg,#FF9933_0%,#FF9933_33%,#fff_33%,#fff_66%,#128807_66%)]" aria-hidden="true" />

      <header className="border-b border-white/10 bg-[#0A1424] px-5 py-4 shadow-sm md:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold tracking-wide text-[#FF9933]">Bharat App</Link>
          <p className="hidden text-xs text-gray-400 sm:block">One Platform for Cyber Safety & Citizen Services</p>
        </div>
      </header>

      <nav aria-label="About page navigation" className="border-b border-white/10 bg-[#0A1424] px-5 py-3 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl gap-5 text-sm text-[#C8D5EA]">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
        </div>
      </nav>

      <main id="about-content" className="mx-auto min-h-[calc(100vh-190px)] w-full max-w-3xl px-5 py-10 md:px-8">
        <Link href="/" className="text-sm font-semibold text-[#FF9933] hover:underline">← Back to Home</Link>
        <article className="mt-6 space-y-8">
          <section>
            <h1 className="text-3xl font-bold">About Bharat App</h1>
            <p className="mt-4 text-[#C8D5EA]">
              Bharat App is a civic safety and cybersecurity platform built to help Indian citizens stay safe online and access emergency and government services in one place. It brings practical safety guidance, trusted resources, and everyday civic tools together in a simple dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-3 text-[#C8D5EA]">
              Our mission is to combine cyber safety tools with civic services for everyday users, especially in a Hinglish-friendly and accessible way. We aim to make helpful safety and government information easier to understand and act on.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">What We Offer</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#C8D5EA]">
              {offerings.map((offering) => <li key={offering}>{offering}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Built By</h2>
            <p className="mt-3 text-[#C8D5EA]">
              Bharat App was built as a student project with the goal of turning useful civic and cybersecurity ideas into an approachable public-facing tool. Feedback and contributions are welcome through our <a href="https://github.com/kunalkushwaha-tech" target="_blank" rel="noopener noreferrer" className="text-[#FF9933] underline">GitHub</a>.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-gray-700 py-8 text-center text-gray-400">
        <div className="flex justify-center gap-6 px-5 text-sm">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
        </div>
        <p className="mt-3 text-sm">© 2026 Bharat App</p>
      </footer>
    </div>
  );
}
