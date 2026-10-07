export type AIChatResponse = {
  reply?: string;
  error?: string;
};

export async function requestAIChat(message: string): Promise<{
  response: Response;
  data: AIChatResponse;
}> {
  const response = await fetch(new URL("/api/ai-chat", window.location.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ message }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`AI service returned an unexpected response (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as AIChatResponse;
  return { response, data };
}
