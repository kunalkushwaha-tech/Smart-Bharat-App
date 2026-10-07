"use client";

import React from 'react';

const preventionTips = [
  'Keep regular backups of important files (offline or cloud)',
  'Never open email attachments from unknown senders',
  'Keep your OS and antivirus software updated',
  'Avoid clicking on suspicious links, even from known contacts',
  'Use strong, unique passwords for all accounts',
  'Enable firewall and real-time malware protection',
];

const ifAttackedSteps = [
  'Disconnect the infected device from internet/network immediately',
  'Do NOT pay the ransom — there is no guarantee of file recovery',
  'Report the incident at cybercrime.gov.in or call 1930',
  'Restore files from your latest clean backup',
  'Run a full antivirus/malware scan before reconnecting',
  'Change all passwords from a different, clean device',
];

const RansomwareGuide = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Prevention Tips</h3>
        <ul className="space-y-2">
          {preventionTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">If You're Attacked</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          {ifAttackedSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RansomwareGuide;