"use client";

import { useEffect, useState } from "react";

export default function PanicMode({ focusRequested = false }: { focusRequested?: boolean }) {
  const [expanded, setExpanded] = useState(focusRequested);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (focusRequested) setExpanded(true);
  }, [focusRequested]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  return (
    <div id="panic-mode" className="mt-6 rounded-xl border border-red-400/40 bg-[#351522] p-4">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="panic-mode-panel"
        aria-label={`${expanded ? "Collapse" : "Expand"} Panic Mode`}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="block text-sm font-semibold uppercase tracking-wider text-red-200">Emergency shortcut</span>
          <span className="mt-1 block text-xl font-bold">Panic Mode</span>
        </span>
        <span className="text-2xl" aria-hidden="true">🛡️</span>
      </button>
      {expanded && (
        <div id="panic-mode-panel" className="mt-4 border-t border-red-200/20 pt-4">
          <p className="text-sm text-red-100">Get immediate access to emergency contacts and prepare an alert. Nothing starts until you press the button.</p>
          {countdown === null ? (
            <button type="button" aria-label="Activate Panic Mode SOS countdown" onClick={() => setCountdown(5)} className="mt-4 rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">
              Activate Panic Mode
            </button>
          ) : countdown > 0 ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="font-semibold text-red-100" aria-live="assertive" aria-atomic="true">Activating in {countdown}...</span>
              <button type="button" onClick={() => setCountdown(null)} aria-label="Cancel Panic Mode countdown" className="rounded-full border border-red-200/50 px-4 py-2 text-sm font-semibold text-red-100">
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-4 font-semibold text-red-100">Panic Mode is ready. Please contact emergency services now.</p>
          )}
        </div>
      )}
    </div>
  );
}
