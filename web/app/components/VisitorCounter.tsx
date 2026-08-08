"use client";

import React, { useEffect, useState } from 'react';

const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.countapi.xyz/hit/bharat-app-kunal/visits')
      .then((res) => res.json())
      .then((data) => setCount(data.value))
      .catch(() => setCount(null));
  }, []);

  if (count === null) return null;

  return (
    <p className="text-xs text-gray-400">
      👁️ {count} visits
    </p>
  );
};

export default VisitorCounter;