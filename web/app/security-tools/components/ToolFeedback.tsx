"use client";

import { useState } from "react";
import { saveToolFeedback } from "./toolActivity";

export default function ToolFeedback({ toolId }: { toolId: string }) {
  const [selected, setSelected] = useState<"up" | "down" | null>(null);

  function choose(value: "up" | "down") {
    saveToolFeedback(toolId, value);
    setSelected(value);
  }

  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-[#C8D5EA]">
      <span>Was this helpful?</span>
      <button type="button" aria-label="Helpful" onClick={() => choose("up")} className={`rounded px-2 py-1 ${selected === "up" ? "bg-emerald-700" : "bg-[#122A4D]"}`}>👍</button>
      <button type="button" aria-label="Not helpful" onClick={() => choose("down")} className={`rounded px-2 py-1 ${selected === "down" ? "bg-red-700" : "bg-[#122A4D]"}`}>👎</button>
      {selected && <span className="text-xs text-[#8fa8c8]">Saved locally</span>}
    </div>
  );
}
