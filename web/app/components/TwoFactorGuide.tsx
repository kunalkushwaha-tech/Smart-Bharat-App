"use client";

import React, { useState } from 'react';

const guides = [
  {
    app: 'Gmail',
    steps: [
      'Google Account settings kholo → Security',
      '"2-Step Verification" pe click karo',
      'Apna phone number ya authenticator app add karo',
      'Verification code enter karke confirm karo',
    ],
  },
  {
    app: 'WhatsApp',
    steps: [
      'WhatsApp Settings → Account kholo',
      '"Two-step verification" pe tap karo',
      '6-digit PIN set karo',
      'Recovery email add karo (optional but recommended)',
    ],
  },
  {
    app: 'Facebook',
    steps: [
      'Settings & Privacy → Settings kholo',
      '"Security and Login" section me jao',
      '"Use two-factor authentication" enable karo',
      'Authentication app ya SMS choose karo',
    ],
  },
  {
    app: 'Instagram',
    steps: [
      'Profile → Menu → Settings kholo',
      '"Security" → "Two-Factor Authentication"',
      'Authentication method choose karo (SMS/App)',
      'Backup codes save karke rakho',
    ],
  },
];

const TwoFactorGuide = () => {
  const [activeApp, setActiveApp] = useState(guides[0].app);

  const selected = guides.find((g) => g.app === activeApp);

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="flex flex-wrap gap-2 mb-4">
        {guides.map((g) => (
          <button
            key={g.app}
            onClick={() => setActiveApp(g.app)}
            className={`px-4 py-2 rounded ${
              activeApp === g.app
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {g.app}
          </button>
        ))}
      </div>

      {selected && (
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          {selected.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Tip: Authentication app (Google Authenticator, Authy) SMS se zyada safe hota hai.
      </p>
    </div>
  );
};

export default TwoFactorGuide;