"use client";

type HeroSectionProps = {
  onNavigate: (section: "emergency" | "complaints" | "security") => void;
};

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="app-card w-full border-slate-800 bg-[#0F172A] px-5 py-5 text-slate-100 md:px-8 md:py-7">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Citizen safety, simplified</p>
      <h1 className="text-3xl font-extrabold md:text-5xl">Bharat App</h1>
      <p className="mt-2 max-w-2xl text-base font-semibold text-slate-100 md:text-lg">
        One Platform for Cyber Safety &amp; Citizen Services
      </p>
      <p className="mt-1 text-sm text-slate-300 md:text-base">Stay Safe. Stay Informed. Stay Connected.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onNavigate("security")} className="app-control bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-cyan-300">
          Check Cyber Risk
        </button>
        <button type="button" onClick={() => onNavigate("emergency")} className="app-control bg-[#EF4444] px-5 py-2.5 font-bold text-white hover:bg-red-500">
          Emergency Hub
        </button>
      </div>
    </section>
  );
}
