"use client";

import React, { useState } from 'react';

const DataBreachTimeline = () => {
  const [email, setEmail] = useState('');
  const [breaches, setBreaches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState(false);

  const handleCheck = async () => {
    if (!email) return;
    setLoading(true);
    setMessage('');
    setBreaches([]);
    setChecked(false);

    try {
      const res = await fetch('/api/breach-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Kuch galat ho gaya.');
      } else if (data.breaches.length === 0) {
        setMessage('Achi khabar! Koi breach nahi mila.');
      } else {
        setBreaches(data.breaches);
      }
    } catch (err) {
      setMessage('Network error, dobara try karo.');
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 mb-3"
      />
      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Checking...' : 'Check'}
      </button>

      {checked && message && <p className="mt-3 text-gray-300">{message}</p>}

      {breaches.length > 0 && (
        <div className="mt-4">
          <p className="text-red-400 font-semibold mb-2">
            {breaches.length} breach(es) me mila:
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {breaches.map((name) => (
              <li
                key={name}
                className="p-2 bg-gray-800 rounded text-sm text-gray-300"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataBreachTimeline;