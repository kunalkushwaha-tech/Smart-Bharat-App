'use client';

import { useState } from 'react';

type HeaderCheckResult = {
  valid: boolean;
  header: string;
};

const redFlags = [
  'Urgent action demanded or a threat of account closure',
  'Requests for an OTP, PIN, password, or other sensitive information',
  'Shortened or suspicious links',
  'Spelling errors or unusual characters in the header',
];

export default function FakeSmsHeaderChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<HeaderCheckResult | null>(null);

  function checkHeader() {
    const header = input.trim().toUpperCase();
    setResult({
      header,
      valid: /^[A-Z]{2}-[A-Z0-9]{6}$/.test(header),
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow">
      <label className="mb-2 block font-medium text-[#ECF2FA]" htmlFor="sms-header">
        SMS sender header
      </label>
      <div className="flex gap-2">
        <input
          id="sms-header"
          className="flex-1 rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="VK-SBIINB"
          maxLength={20}
        />
        <button type="button" className="rounded bg-sky-600 px-4 py-2 text-white" onClick={checkHeader}>
          Check
        </button>
      </div>

      {result ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-sm text-[#ECF2FA]">
          <p className={result.valid ? 'text-green-400' : 'text-red-300'}>
            {result.valid ? 'Format looks valid.' : 'Format is not valid.'}
          </p>
          <p className="mt-2">
            Expected format: two uppercase letters, a hyphen, and a six-character entity code
            (for example, <code>VK-SBIINB</code>).
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3 text-sm text-[#C8D5EA]">
        <p>
          DLT headers use a two-letter prefix (such as VK, VM, AD, or BW) for telecom operator
          routing, followed by a hyphen and a six-character entity code identifying the sender.
        </p>
        <div>
          <p className="font-semibold text-[#ECF2FA]">Common red flags</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {redFlags.map((flag) => <li key={flag}>{flag}</li>)}
          </ul>
        </div>
        <p className="rounded border border-yellow-400/30 bg-yellow-400/10 p-3 text-yellow-100">
          This checks format validity only — it cannot confirm if a message is genuinely from the
          claimed sender. Always verify suspicious messages directly with the organization via
          their official app or website, never via links in the SMS.
        </p>
      </div>
    </div>
  );
}
