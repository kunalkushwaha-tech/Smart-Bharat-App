"use client";

import React, { useState } from 'react';

const questions = [
  { id: 1, text: 'Is your phone number visible on public social media profiles?' },
  { id: 2, text: 'Do you use the same password across multiple accounts?' },
  { id: 3, text: 'Do you share your live location on any app?' },
  { id: 4, text: 'Have you ever entered your Aadhaar/PAN number on an unknown site?' },
  { id: 5, text: 'Are your old posts/photos public on social media?' },
  { id: 6, text: 'Do you grant camera/contacts permission to apps without checking?' },
];

const DigitalFootprintChecker = () => {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (id: number, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const riskCount = Object.values(answers).filter((v) => v).length;

  const getRiskLevel = () => {
    if (riskCount <= 1) return { label: 'Low Risk', color: 'text-green-400' };
    if (riskCount <= 3) return { label: 'Medium Risk', color: 'text-yellow-400' };
    return { label: 'High Risk', color: 'text-red-400' };
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="flex items-center justify-between gap-3">
            <span className="text-gray-300 flex-1">{q.text}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleAnswer(q.id, true)}
                className={`px-3 py-1 rounded ${
                  answers[q.id] === true ? 'bg-red-600' : 'bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(q.id, false)}
                className={`px-3 py-1 rounded ${
                  answers[q.id] === false ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowResult(true)}
        className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        See Result
      </button>

      {showResult && Object.keys(answers).length === questions.length && (
        <p className={`mt-4 text-lg font-semibold ${getRiskLevel().color}`}>
          Your Digital Footprint Risk: {getRiskLevel().label}
        </p>
      )}
    </div>
  );
};

export default DigitalFootprintChecker;