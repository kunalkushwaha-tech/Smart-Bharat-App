'use client';

import { useState } from 'react';

type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

type AnalysisResult = {
  risk: RiskLevel;
  score: number;
  reasons: string[];
};

export default function FakeOfferScamChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runChecks() {
    const text = input.toLowerCase().trim();
    if (!text) {
      setError('Please paste company name ya offer details.');
      setResult(null);
      return;
    }
    setError(null);

    const reasons: string[] = [];
    let score = 0;

    if (/advance fee|registration fee|processing fee|security deposit|pay.*first|joining fee/.test(text)) {
      reasons.push('Advance fee demand detected.');
      score += 30;
    }
    if (/salary\s*\d{1,2}\s*lakh|salary\s*₹?\s*\d{6,}|earn\s*\d{5,}\s*per day|guaranteed job/.test(text)) {
      reasons.push('Unrealistic salary / guaranteed returns claim detected.');
      score += 20;
    }
    if (/whatsapp only|only whatsapp|telegram only|dm me on whatsapp/.test(text)) {
      reasons.push('WhatsApp/Telegram-only communication pattern detected.');
      score += 20;
    }
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    if (!hasEmail) {
      reasons.push('No official email domain found in offer details.');
      score += 15;
    }
    if (/urgent|today only|immediately|limited seats|act now|within 1 hour/.test(text)) {
      reasons.push('Urgent pressure tactic detected.');
      score += 15;
    }

    let risk: RiskLevel = 'Low Risk';
    if (score >= 55) {
      risk = 'High Risk';
    } else if (score >= 30) {
      risk = 'Medium Risk';
    }

    if (reasons.length === 0) {
      reasons.push('No major scam red flags detected from given text. Still verify company website and recruiter email.');
    }

    setResult({ risk, score, reasons });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow">
      <label className="mb-2 block font-medium text-[#ECF2FA]">Company / Offer Details</label>
      <textarea
        rows={5}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste message/job/loan offer here..."
        className="w-full rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]"
      />
      <button
        type="button"
        onClick={runChecks}
        className="mt-3 rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white"
      >
        Analyze Offer
      </button>

      {error ? <p className="mt-2 text-sm text-[#ffb0b0]">{error}</p> : null}

      {result ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-[#ECF2FA]">
          <p className="font-semibold">
            Risk Verdict:{' '}
            <span
              className={
                result.risk === 'High Risk'
                  ? 'text-red-400'
                  : result.risk === 'Medium Risk'
                    ? 'text-yellow-300'
                    : 'text-green-400'
              }
            >
              {result.risk}
            </span>{' '}
            (Score: {result.score}/100)
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {result.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
