import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured on this server." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are Bharat App AI Companion. Reply in simple Hinglish (Roman Hindi + English), safety-first, concise, and practical. If user asks civic/scheme/security question, provide actionable steps.",
          },
          {
            role: "user",
            content: trimmedMessage,
          },
        ],
      }),
    });

    const data = (await response.json()) as ChatCompletionsResponse;
    if (!response.ok) {
      const errorMessage =
        data.error?.message ?? `LLM provider error (status ${response.status})`;
      return NextResponse.json(
        { error: errorMessage },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reply }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
