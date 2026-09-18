'use client';

import { useState } from 'react';

type ScamResult = {
  score: number;
  flags: string[];
};

type IpResult = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
  error?: boolean;
  reason?: string;
};

type WhoisResult = Record<string, unknown>;

const scamPatterns: Array<{ pattern: RegExp; message: string; points: number }> = [
  { pattern: /\b(urgent|immediately|act now|within \d+ hours?|limited time)\b/i, message: 'Urgency or pressure language detected.', points: 25 },
  { pattern: /https?:\/\/|www\./i, message: 'A link was included. Check the domain carefully before opening it.', points: 20 },
  { pattern: /\b(otp|one[- ]time password|verification code)\b/i, message: 'A request for an OTP or verification code was detected.', points: 30 },
  { pattern: /\b(pay|payment|transfer|upi|fee|deposit|refund)\b/i, message: 'A payment, transfer, fee, or refund request was detected.', points: 25 },
];

function cardClass() {
  return 'rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow';
}

function ScamDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ScamResult | null>(null);
  const [error, setError] = useState('');

  function check() {
    const value = text.trim();
    if (!value) {
      setError('Paste an email or message first.');
      setResult(null);
      return;
    }
    const flags = scamPatterns.filter(({ pattern }) => pattern.test(value)).map(({ message }) => message);
    const score = scamPatterns.filter(({ pattern }) => pattern.test(value)).reduce((total, item) => total + item.points, 0);
    setError('');
    setResult({ score: Math.min(score, 100), flags });
  }

  return (
    <div className={cardClass()}>
      <label className="mb-2 block font-medium text-[#ECF2FA]">Email or message text</label>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} className="w-full rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]" placeholder="Paste a suspicious SMS, email, or chat message..." />
      <button type="button" onClick={check} className="mt-3 rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white">Check Now</button>
      {error ? <p className="mt-2 text-sm text-[#ffb0b0]">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-[#ECF2FA]">
          <p className="font-semibold">Scam warning score: <span className={result.score >= 50 ? 'text-red-400' : 'text-yellow-300'}>{result.score}/100</span></p>
          {result.flags.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{result.flags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : <p className="mt-2 text-sm text-green-400">No common scam patterns were detected. Stay cautious with unexpected messages.</p>}
        </div>
      ) : null}
    </div>
  );
}

function PhoneAwareness() {
  const [number, setNumber] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <div className={cardClass()}>
      <label className="mb-2 block font-medium text-[#ECF2FA]">Phone number</label>
      <input value={number} onChange={(event) => { setNumber(event.target.value); setChecked(false); }} className="w-full rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]" placeholder="+91 98765 43210" inputMode="tel" />
      <button type="button" onClick={() => setChecked(true)} className="mt-3 rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white">Check Now</button>
      {checked ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-sm text-[#ECF2FA]">
          {number.trim() ? <><p className="font-semibold text-yellow-300">Educational guidance for {number.trim()}</p><p className="mt-2">Scammers commonly impersonate banks, courier companies, police, telecom providers, or customer support. Never share OTPs, PINs, passwords, screen access, or send money because of a call.</p><p className="mt-2">Caller ID and phone numbers can be spoofed. Block and report suspicious calls; for financial cyber fraud in India, call 1930.</p></> : <p className="text-[#ffb0b0]">Enter a phone number first.</p>}
        </div>
      ) : null}
    </div>
  );
}

function IpDomainInfo() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<IpResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function check() {
    const query = value.trim();
    if (!query) {
      setError('Enter an IP address or domain.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`https://ipapi.co/${encodeURIComponent(query)}/json/`);
      const data = (await response.json()) as IpResult;
      if (!response.ok || data.error) throw new Error(data.reason || 'The IP/domain information service could not process that input.');
      setResult(data);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Lookup failed. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cardClass()}>
      <label className="mb-2 block font-medium text-[#ECF2FA]">IP address or domain</label>
      <div className="flex gap-2"><input value={value} onChange={(event) => setValue(event.target.value)} className="min-w-0 flex-1 rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]" placeholder="8.8.8.8 or example.com" /><button type="button" onClick={check} disabled={loading} className="rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white">{loading ? 'Checking...' : 'Check Now'}</button></div>
      {error ? <p className="mt-2 text-sm text-[#ffb0b0]">{error}</p> : null}
      {result ? <dl className="mt-4 grid gap-2 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-sm text-[#ECF2FA] sm:grid-cols-2"><div><dt className="font-semibold">IP</dt><dd>{result.ip || '—'}</dd></div><div><dt className="font-semibold">Location</dt><dd>{[result.city, result.region, result.country_name].filter(Boolean).join(', ') || '—'}</dd></div><div><dt className="font-semibold">ISP / organization</dt><dd>{result.org || '—'}</dd></div><div><dt className="font-semibold">Timezone</dt><dd>{result.timezone || '—'}</dd></div></dl> : null}
      <p className="mt-3 text-xs text-[#C8D5EA]">Uses the free ipapi.co service. Location and ISP data can be approximate.</p>
    </div>
  );
}

function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function check() {
    const query = domain.trim();
    if (!query) {
      setError('Enter a domain name.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(query)}`);
      const data = (await response.json()) as WhoisResult & { error?: string };
      if (!response.ok) throw new Error(data.error || 'WHOIS lookup failed.');
      setResult(data);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'WHOIS lookup failed. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cardClass()}>
      <label className="mb-2 block font-medium text-[#ECF2FA]">Domain name</label>
      <div className="flex gap-2"><input value={domain} onChange={(event) => setDomain(event.target.value)} className="min-w-0 flex-1 rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]" placeholder="example.com" /><button type="button" onClick={check} disabled={loading} className="rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white">{loading ? 'Looking up...' : 'Check Now'}</button></div>
      {error ? <p className="mt-3 text-sm text-yellow-300">{error}</p> : null}
      {result ? <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-white/15 bg-[#122A4D] p-3 text-xs text-[#ECF2FA]">{JSON.stringify(result, null, 2)}</pre> : null}
      <p className="mt-3 text-xs text-[#C8D5EA]">WHOIS data is supplied by the configured server-side WHOIS provider and may be redacted by registrars.</p>
    </div>
  );
}

export default function SecurityIntelTools() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xl font-semibold text-[#ECF2FA]">Email/Message Scam Detector</h3>
        <ScamDetector />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-semibold text-[#ECF2FA]">Phone Number Scam Awareness</h3>
        <PhoneAwareness />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-semibold text-[#ECF2FA]">IP/Domain Information</h3>
        <IpDomainInfo />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-semibold text-[#ECF2FA]">WHOIS Lookup</h3>
        <WhoisLookup />
      </div>
    </div>
  );
}
