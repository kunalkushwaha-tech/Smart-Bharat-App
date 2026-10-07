"use client";

import React from 'react';

const checklist = [
  'VPN use karo public WiFi pe (bank/payment apps ke liye zaroor)',
  'HTTPS websites hi use karo (URL me lock icon check karo)',
  'Auto-connect WiFi setting band rakho phone/laptop me',
  'Public WiFi pe online banking/shopping avoid karo',
  'File sharing off rakho jab public network pe ho',
  'Free WiFi ka naam verify karo staff se (fake hotspots common hain)',
  'Important accounts ke liye 2FA enable rakho',
  'WiFi use karne ke baad "forget network" kar do agar dobara nahi aana',
];

const WifiSafetyChecklist = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <ul className="space-y-2">
        {checklist.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span className="text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WifiSafetyChecklist;