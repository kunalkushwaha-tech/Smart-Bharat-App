import { NextResponse } from "next/server";

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

function getFallbackHinglishReply(query: string): string {
  const text = query.toLowerCase();
  const tips: string[] = [];

  if (text.includes("password") || text.includes("pass")) {
    tips.push(
      "Password tip: 12+ chars rakho with uppercase, lowercase, number aur special character. Same password har site pe reuse mat karo.",
    );
  }
  if (text.includes("link") || text.includes("url") || text.includes("http")) {
    tips.push(
      "Link safety: URL spelling check karo, short-link blindly open mat karo, aur login/payment sirf official app ya bookmarked site se karo.",
    );
  }
  if (text.includes("scam") || text.includes("fraud") || text.includes("phishing")) {
    tips.push(
      "Scam alert: Unknown call/SMS pe personal details mat do. Screenshot + number save karo aur 1930/cybercrime.gov.in pe turant report karo.",
    );
  }
  if (text.includes("otp")) {
    tips.push(
      "OTP rule: OTP/PIN/CVV kisi ko mat batao, even bank staff bolkar call kare tab bhi nahi. OTP share = account risk.",
    );
  }
  if (text.includes("scheme") || text.includes("scholarship") || text.includes("paisa")) {
    tips.push(
      "Scheme check: Age + annual income fill karo, phir PM-KISAN / Scholarship / MGNREGA cards pe click karke exact eligibility aur apply link dekho.",
    );
  }

  if (tips.length === 0) {
    return `Aapka query mila: "${query}". Thoda specific keyword use karo (password, link, scam, OTP, scheme) taaki main exact actionable guidance de saku.`;
  }

  return `Query samjha: "${query}".\n\n${tips.join("\n\n")}`;
}

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
        {
          ok: true,
          reply: getFallbackHinglishReply(trimmedMessage),
          fallback: true,
        },
        { status: 200 },
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
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
