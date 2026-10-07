"use client";

type HeroSectionProps = {
  onNavigate: (section: "emergency" | "complaints" | "security") => void;
};

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="mx-auto mt-8 w-full max-w-6xl rounded-2xl border border-[#FF9933]/30 bg-gradient-to-br from-[#0B1F3A] via-[#122A4D] to-[#128807] px-6 py-10 text-white shadow-lg md:px-10">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFB15C]">Citizen safety, simplified</p>
      <h1 className="text-4xl font-extrabold md:text-5xl">Bharat App</h1>
      <p className="mt-3 max-w-2xl text-lg font-semibold text-[#ECF2FA]">
        One Platform for Cyber Safety &amp; Citizen Services
      </p>
      <p className="mt-2 text-base text-white/80">Stay Safe. Stay Informed. Stay Connected.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => onNavigate("emergency")} className="rounded-full bg-[#d93838] px-5 py-2.5 font-bold text-white hover:bg-[#b42318]">
          Emergency
        </button>
        <button type="button" onClick={() => onNavigate("security")} className="rounded-full bg-[#00b8d4] px-5 py-2.5 font-bold text-[#07111f] hover:bg-[#67e8f9]">
          Check Cyber Risk
        </button>
        <button type="button" onClick={() => onNavigate("complaints")} className="rounded-full bg-white px-5 py-2.5 font-bold text-[#0B1F3A] hover:bg-[#f1f5f9]">
          File Complaint
        </button>
      </div>
    </section>
  );
}
