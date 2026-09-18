"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CYBER_HYGIENE_EVENT,
  readCyberHygieneResults,
  type CyberHygieneResults,
} from "./cyberHygieneStorage";

function calculateScore(results: CyberHygieneResults) {
  let score = 0;
  if (results.password?.checked) score += results.password.entropy >= 60 ? 25 : 10;
  if (results.breach?.checked) score += results.breach.found ? 0 : 25;
  if (results.url?.checked) {
    score += results.url.threatFound ? 0 : results.url.flags > 0 ? 15 : 25;
  }
  if (results.file?.checked) {
    score += results.file.verified ? (results.file.match ? 25 : 0) : 15;
  }
  return score;
}

export default function CyberHygieneScore() {
  const [results, setResults] = useState<CyberHygieneResults>({});

  useEffect(() => {
    const refresh = () => setResults(readCyberHygieneResults());
    refresh();
    window.addEventListener(CYBER_HYGIENE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CYBER_HYGIENE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const score = useMemo(() => calculateScore(results), [results]);
  const hasChecks = Object.values(results).some((result) => result?.checked);
  const scoreColor =
    score < 40 ? "text-red-400" : score <= 70 ? "text-amber-300" : "text-emerald-400";
  const barColor =
    score < 40 ? "bg-red-500" : score <= 70 ? "bg-amber-400" : "bg-emerald-500";

  const suggestions = [
    !results.password?.checked || results.password.entropy < 60
      ? "Use a unique password or passphrase with at least 60 bits of entropy."
      : null,
    !results.breach?.checked
      ? "Run a breach check for your password and email."
      : results.breach.found
        ? "Replace credentials found in a known breach."
        : null,
    !results.url?.checked
      ? "Scan a URL before opening an unfamiliar link."
      : results.url.threatFound || results.url.flags > 0
        ? "Avoid URLs flagged by Safe Browsing or local heuristics."
        : null,
    !results.file?.checked
      ? "Hash a downloaded file and compare it with the publisher's expected hash."
      : results.file.verified && !results.file.match
        ? "Do not use a file whose hash does not match the expected value."
        : !results.file.verified
          ? "Add an expected hash to verify the file's integrity."
          : null,
  ].filter((suggestion): suggestion is string => Boolean(suggestion));

  return (
    <section className="rounded-xl border border-white/10 bg-[#0A1424] p-5 shadow-lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${score < 40 ? "#ef4444" : score <= 70 ? "#fbbf24" : "#10b981"} ${score * 3.6}deg, #1c3557 0deg)` }}>
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#0A1424]">
            {hasChecks ? (
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            ) : (
              <span className="px-3 text-center text-xs text-[#C8D5EA]">Run checks</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-[#00e5ff]">Cyber Hygiene Score</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#ECF2FA]">
                {hasChecks ? `${score} / 100` : "Run checks to see your score"}
              </h2>
            </div>
            {hasChecks && <span className={`text-sm font-semibold ${scoreColor}`}>{score < 40 ? "Needs attention" : score <= 70 ? "Getting safer" : "Looking good"}</span>}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1c3557]">
            <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="font-semibold text-[#ECF2FA]">Improve your score</h3>
        {suggestions.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#C8D5EA]">
            {suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-emerald-300">All four checks are complete and look healthy.</p>
        )}
      </div>
    </section>
  );
}
