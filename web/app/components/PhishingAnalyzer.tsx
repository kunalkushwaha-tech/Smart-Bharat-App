"use client";

import React, { useState } from 'react';

const redFlags = [
  { keyword: 'urgent', label: 'Urgency create karta hai' },
  { keyword: 'verify your account', label: 'Account verify karne ka pressure' },
  { keyword: 'click here', label: 'Suspicious link click karwane ki koshish' },
  { keyword: 'lottery', label: 'Fake lottery/prize scam' },
  { keyword: 'suspended', label: 'Account suspend hone ka darr dikhana' },
  { keyword: 'otp', label: 'OTP share karwane ki koshish' },
  { keyword: 'bank', label: 'Bank details maangna' },
  { keyword: 'password', label: 'Password maangna (legit companies kabhi nahi maangte)' },
  { keyword: 'congratulations', label: 'Fake reward/prize claim' },
  { keyword: 'limited time', label: 'Time pressure tactics' },
];

const PhishingAnalyzer = () => {
  const [text, setText] = useState('');
  const [found, setFound] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const handleAnalyze = () => {
    const lower = text.toLowerCase();
    const matches = redFlags
      .filter((f) => lower.includes(f.keyword))
      .map((f) => f.label);
    setFound(matches);
    setChecked(true);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Suspicious email/SMS ka text yahan paste karo"
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 mb-3 h-24"
      />
      <button
        onClick={handleAnalyze}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Analyze
      </button>

      {checked && (
        <div className="mt-4">
          {found.length === 0 ? (
            <p className="text-green-400">Koi obvious red flag nahi mila. Phir bhi careful raho.</p>
          ) : (
            <>
              <p className="text-red-400 font-semibold mb-2">
                {found.length} red flag(s) mile:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {found.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PhishingAnalyzer;