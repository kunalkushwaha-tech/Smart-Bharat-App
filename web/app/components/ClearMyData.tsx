"use client";

import { useState } from "react";

export default function ClearMyData() {
  const [message, setMessage] = useState("");

  function clearData() {
    if (!window.confirm("Clear all Bharat App data stored in this browser? This cannot be undone.")) return;
    window.localStorage.clear();
    setMessage("Your local Bharat App data has been cleared successfully.");
  }

  return (
    <div className="mt-6 rounded-xl border border-red-300/30 bg-[#351522] p-4">
      <h2 className="text-xl font-bold">Clear My Data</h2>
      <p className="mt-2 text-sm opacity-85">Remove emergency contacts, ICE Card data, location and language preferences, security history, score data, feedback, and local rate-limit records from this browser.</p>
      <button type="button" onClick={clearData} className="mt-4 rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">Clear My Data</button>
      {message && <p role="status" className="mt-3 text-sm text-red-100">{message}</p>}
    </div>
  );
}
