export type ToolHistoryEntry = {
  id: string;
  summary: string;
  detail?: string;
  createdAt: string;
};

const feedbackKey = "smart-bharat-tool-feedback";

export function saveToolFeedback(toolId: string, value: "up" | "down") {
  if (typeof window === "undefined") return;
  const feedback = JSON.parse(window.localStorage.getItem(feedbackKey) || "{}") as Record<string, string>;
  feedback[toolId] = value;
  window.localStorage.setItem(feedbackKey, JSON.stringify(feedback));
}

export function addToolHistory(toolId: string, entry: Omit<ToolHistoryEntry, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const key = `smart-bharat-tool-history-${toolId}`;
  const existing = JSON.parse(window.localStorage.getItem(key) || "[]") as ToolHistoryEntry[];
  const next = [{ ...entry, id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() }, ...existing].slice(0, 5);
  window.localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(`${key}-updated`));
}

export function readToolHistory(toolId: string): ToolHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(`smart-bharat-tool-history-${toolId}`) || "[]") as ToolHistoryEntry[];
  } catch {
    return [];
  }
}
