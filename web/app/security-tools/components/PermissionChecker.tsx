"use client";

import React, { useState } from 'react';

const permissions = [
  {
    name: 'Camera',
    genuine: 'Photo/video apps, video calling apps (WhatsApp, Zoom)',
    suspicious: 'Weather apps, flashlight apps, calculator apps asking for camera access',
  },
  {
    name: 'Microphone',
    genuine: 'Calling apps, voice recorder, voice assistant apps',
    suspicious: 'Games, photo editors, or utility apps with no obvious audio feature',
  },
  {
    name: 'Location',
    genuine: 'Maps, ride-sharing apps, weather apps (for local forecast)',
    suspicious: 'Games, flashlight apps, or apps that constantly track location in background',
  },
  {
    name: 'Contacts',
    genuine: 'Messaging apps, dialer apps, social media apps for finding friends',
    suspicious: 'Games, photo editors, or unrelated utility apps requesting full contact access',
  },
  {
    name: 'Storage',
    genuine: 'File managers, photo/video apps, apps that need to save or open files',
    suspicious: 'Simple single-purpose apps requesting full storage access unnecessarily',
  },
  {
    name: 'SMS',
    genuine: 'Default messaging apps, OTP autofill apps from trusted sources',
    suspicious: 'Any non-messaging app requesting SMS read/send permission — high risk for OTP theft',
  },
];

const PermissionChecker = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white space-y-3">
      {permissions.map((perm, idx) => (
        <div key={perm.name} className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(idx)}
            className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
          >
            <span className="font-semibold">{perm.name}</span>
            <span>{openIndex === idx ? '−' : '+'}</span>
          </button>
          {openIndex === idx && (
            <div className="px-4 py-3 space-y-2 text-sm">
              <p>
                <span className="text-green-400 font-semibold">Genuinely needed: </span>
                <span className="text-gray-300">{perm.genuine}</span>
              </p>
              <p>
                <span className="text-red-400 font-semibold">Red flag: </span>
                <span className="text-gray-300">{perm.suspicious}</span>
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PermissionChecker;