"use client";

import React from 'react';

const checklist = [
  'Website ka URL check karo - "https" aur lock icon zaroor dekho',
  'Company ka naam Google karo, reviews padho kharidne se pehle',
  'Bahut zyada discount (90% off jaisa) dekh ke suspicious raho',
  'Payment karte time card details save karne se bacho unknown sites pe',
  'COD (Cash on Delivery) option use karo jab bhi possible ho',
  'Fake customer care numbers se bacho, official app/website se hi contact karo',
  'Return/refund policy padh lo order karne se pehle',
  'Social media ads pe seedha click karke order mat karo, website verify karo',
];

const SafeShoppingChecklist = () => {
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

export default SafeShoppingChecklist;