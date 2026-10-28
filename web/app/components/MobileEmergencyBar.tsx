"use client";

export default function MobileEmergencyBar() {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex h-12 items-center justify-center gap-2 border-t border-red-300/30 bg-[#7a1818]/95 px-3 text-sm font-bold text-white shadow-lg backdrop-blur md:hidden">
      <span className="sr-only">Emergency helplines</span>
      <a className="rounded-full bg-white/15 px-4 py-2" href="tel:112" aria-label="Call emergency helpline 112">
        112
      </a>
      <a className="rounded-full bg-white/15 px-4 py-2" href="tel:1930" aria-label="Call cyber fraud helpline 1930">
        1930
      </a>
    </div>
  );
}
