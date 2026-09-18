"use client";

import { useEffect, useState } from "react";
import { readToolHistory, type ToolHistoryEntry } from "./toolActivity";

export default function RecentChecks({ toolId }: { toolId: string }) {
  const [entries, setEntries] = useState<ToolHistoryEntry[]>([]);
  const eventName = `smart-bharat-tool-history-${toolId}-updated`;

  useEffect(() => {
    const refresh = () => setEntries(readToolHistory(toolId));
    refresh();
    window.addEventListener(eventName, refresh);
    return () => window.removeEventListener(eventName, refresh);
  }, [eventName, toolId]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <h3 className="text-sm font-semibold text-[#ECF2FA]">Recent checks</h3>
      <ul className="mt-2 space-y-2 text-xs text-[#C8D5EA]">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded bg-[#050B14] px-3 py-2">
            <span className="font-medium text-[#ECF2FA]">{entry.summary}</span>
            {entry.detail && <span className="ml-2">{entry.detail}</span>}
            <time className="ml-2 text-[#7891b2]" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
