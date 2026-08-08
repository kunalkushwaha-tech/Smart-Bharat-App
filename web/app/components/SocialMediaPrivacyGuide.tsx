"use client";

import React, { useState } from 'react';

const platforms = [
  {
    name: 'Instagram',
    steps: [
      'Go to Profile → Menu → Settings and Privacy',
      'Tap "Account Privacy" and switch to Private Account',
      'Under "Story", control who can reply and share your stories',
      'Review "Close Friends" list for sensitive posts',
    ],
  },
  {
    name: 'Facebook',
    steps: [
      'Go to Settings & Privacy → Settings',
      'Open "Audience and Visibility" section',
      'Set future posts to "Friends" instead of Public',
      'Turn off "Public Search Engine" linking to your profile',
    ],
  },
  {
    name: 'WhatsApp',
    steps: [
      'Go to Settings → Privacy',
      'Set "Last Seen", "Profile Photo", and "About" to Contacts Only',
      'Turn on "Read Receipts" control as needed',
      'Enable "Two-Step Verification" for extra security',
    ],
  },
  {
    name: 'Twitter/X',
    steps: [
      'Go to Settings → Privacy and Safety',
      'Enable "Protect your posts" for private tweets',
      'Turn off "Tag me in photos" from anyone',
      'Review who can send you Direct Messages',
    ],
  },
];

const SocialMediaPrivacyGuide = () => {
  const [active, setActive] = useState(platforms[0].name);
  const selected = platforms.find((p) => p.name === active);

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="flex flex-wrap gap-2 mb-4">
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={() => setActive(p.name)}
            className={`px-4 py-2 rounded ${
              active === p.name ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {p.name}
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
    </div>
  );
};

export default SocialMediaPrivacyGuide;