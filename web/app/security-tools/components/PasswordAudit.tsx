'use client';

import { useState } from 'react';

function bufToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(str: string) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(hash);
}

async function sha1HexUpper(str: string) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return bufToHex(hash).toUpperCase();
}

function estimateEntropyBits(password: string) {
  if (!password) return 0;
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32; // rough symbol count
  // fallback
  if (pool === 0) pool = 1;
  const bits = Math.log2(Math.pow(pool, password.length));
  return Math.round(bits * 10) / 10;
}

export default function PasswordAudit() {
  const [password, setPassword] = useState('');
  const [sha256, setSha256] = useState<string | null>(null);
  const [sha1, setSha1] = useState<string | null>(null);
  const [entropy, setEntropy] = useState<number>(0);
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  async function analyze(pw: string) {
    setError(null);
    setSha256(null);
    setSha1(null);
    setPwnedCount(null);
    setEntropy(estimateEntropyBits(pw));
    if (!pw) return;
    setLoading(true);
    try {
      const s256 = await sha256Hex(pw);
      const s1 = await sha1HexUpper(pw);
      setSha256(s256);
      setSha1(s1);

      // HIBP k-anonymity range query: first 5 chars of SHA-1 (uppercase)
      const prefix = s1.slice(0, 5);
      const suffix = s1.slice(5);
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!res.ok) {
        // HIBP sometimes rate-limits or blocks; surface but continue
        setError('HIBP range API error: ' + res.statusText);
        setPwnedCount(null);
      } else {
        const text = await res.text();
        // Each line: Suffix:Count
        const lines = text.split('\n');
        const found = lines.find((l) => l.split(':')[0].trim() === suffix);
        if (found) {
          const cnt = parseInt(found.split(':')[1].trim(), 10);
          setPwnedCount(isNaN(cnt) ? 0 : cnt);
        } else {
          setPwnedCount(0);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function pickRandomChar(charset: string) {
    const index = Math.floor(Math.random() * charset.length);
    return charset[index];
  }

  function shuffle(input: string) {
    const chars = input.split('');
    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  function generatePassword() {
    const charsets: string[] = [];
    if (includeUppercase) charsets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeLowercase) charsets.push('abcdefghijklmnopqrstuvwxyz');
    if (includeNumbers) charsets.push('0123456789');
    if (includeSymbols) charsets.push('!@#$%^&*()_+-=[]{}|;:,.<>?');

    if (charsets.length === 0) {
      setError('At least one character set select karo.');
      return;
    }

    setError(null);
    const required = charsets.map((set) => pickRandomChar(set)).join('');
    const fullPool = charsets.join('');
    let result = required;

    while (result.length < length) {
      result += pickRandomChar(fullPool);
    }

    const finalPassword = shuffle(result).slice(0, length);
    setGeneratedPassword(finalPassword);
    setPassword(finalPassword);
    void analyze(finalPassword);
  }

  async function copyGeneratedPassword() {
    if (!generatedPassword) {
      setError('Pehle password generate karo.');
      return;
    }
    await navigator.clipboard.writeText(generatedPassword);
    setError(null);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow">
      <label className="mb-2 block font-medium text-[#ECF2FA]">Enter password</label>
      <input
        className="mb-3 w-full rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]"
        type="password"
        value={password}
        onChange={(e) => {
          const v = e.target.value;
          setPassword(v);
          void analyze(v);
        }}
        placeholder="Type a password to evaluate"
      />

      <div className="mb-5 rounded-lg border border-white/10 bg-[#122A4D] p-3">
        <h3 className="mb-2 text-sm font-semibold text-[#ECF2FA]">Password Generator</h3>
        <label className="mb-1 block text-sm text-[#ECF2FA]">Length: {length}</label>
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={(event) => setLength(Number(event.target.value))}
          className="mb-3 w-full"
        />
        <div className="grid gap-2 text-sm text-[#ECF2FA] sm:grid-cols-2">
          <label>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(event) => setIncludeUppercase(event.target.checked)}
              className="mr-2"
            />
            Uppercase
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(event) => setIncludeLowercase(event.target.checked)}
              className="mr-2"
            />
            Lowercase
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(event) => setIncludeNumbers(event.target.checked)}
              className="mr-2"
            />
            Numbers
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(event) => setIncludeSymbols(event.target.checked)}
              className="mr-2"
            />
            Symbols
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generatePassword}
            className="rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white"
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => {
              void copyGeneratedPassword();
            }}
            className="rounded-full bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
          >
            Copy
          </button>
        </div>
        {generatedPassword ? (
          <code className="mt-3 block break-all rounded bg-[#050B14] p-2 text-xs text-[#00e5ff]">
            {generatedPassword}
          </code>
        ) : null}
      </div>

      <div className="space-y-2 text-[#ECF2FA]">
        <div>
          Estimated entropy: <strong>{entropy}</strong> bits
        </div>
        <div>
          SHA-256: <code className="break-words">{sha256 ?? '—'}</code>
        </div>
        <div>
          SHA-1 (HIBP): <code className="break-words">{sha1 ?? '—'}</code>
        </div>
        <div>
          HIBP breach count: {' '}
          {loading ? <span>checking...</span> : pwnedCount === null ? <span>—</span> : (
            pwnedCount > 0 ? <span className="text-red-600 font-semibold">{pwnedCount} times (COMPROMISED)</span> : <span className="text-green-600">Not found in known breaches</span>
          )}
        </div>
        {error && <div className="text-yellow-300">Note: {error}</div>}

        <div className="mt-3 text-sm text-[#C8D5EA]">
          Guidance: Aim for 60+ bits for strong passwords. Use a unique passphrase or a password manager. Even strong passwords should be checked against breach databases.
        </div>
      </div>
    </div>
  );
}
