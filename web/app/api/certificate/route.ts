import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getRequestFingerprint, isRateLimited } from "../../lib/rateLimit";
import { quizQuestions } from "../../lib/quizData";

export const runtime = "nodejs";

type SubmittedAnswer = {
  questionId: string;
  optionId: string;
};

const legacyIdPattern = /^BHRT-CYB-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{8}$/;

function createLegacyCertificateId() {
  const randomPart = randomBytes(6).toString("base64url").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8).padEnd(8, "0");
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BHRT-CYB-${randomPart.slice(0, 4)}-${randomPart.slice(4)}-${datePart}`;
}

function createSignedCertificateId(score: number) {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  const prefix = `BHRT-CYB-${datePart}-${String(score).padStart(2, "0")}-${randomPart}`;
  const signature = createHmac("sha256", process.env.CERT_SIGNING_SECRET as string).update(prefix).digest("hex").slice(0, 8).toUpperCase();
  return { id: `${prefix}-${signature}`, issuedDate: `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6)}` };
}

function gradeAnswers(answers: SubmittedAnswer[]) {
  return quizQuestions.reduce((score, question) => {
    const submitted = answers.find((answer) => answer.questionId === question.id);
    const correct = question.options.find((option) => option.correct);
    return score + (submitted?.optionId === correct?.id ? 1 : 0);
  }, 0);
}

export async function POST(request: Request) {
  if (isRateLimited(`certificate:${getRequestFingerprint(request)}`, 10_000)) {
    return NextResponse.json({ error: "Please wait before requesting another certificate" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const answers = body?.answers;
    if (!Array.isArray(answers) || answers.length !== quizQuestions.length || answers.some((answer: unknown) => (
      typeof answer !== "object"
      || answer === null
      || typeof (answer as SubmittedAnswer).questionId !== "string"
      || typeof (answer as SubmittedAnswer).optionId !== "string"
    ))) {
      return NextResponse.json({ error: "Invalid quiz answers" }, { status: 400 });
    }

    const normalizedAnswers = answers as SubmittedAnswer[];
    const validQuestionIds = new Set(quizQuestions.map((question) => question.id));
    const validOptionIds = new Set(quizQuestions.flatMap((question) => question.options.map((option) => option.id)));
    if (
      new Set(normalizedAnswers.map((answer) => answer.questionId)).size !== quizQuestions.length
      || normalizedAnswers.some((answer) => !validQuestionIds.has(answer.questionId) || !validOptionIds.has(answer.optionId))
    ) {
      return NextResponse.json({ error: "Invalid quiz answers" }, { status: 400 });
    }

    const score = gradeAnswers(normalizedAnswers);
    if (score < 7) {
      return NextResponse.json({ error: "Certificate requires a score of at least 7/10" }, { status: 403 });
    }

    if (!process.env.CERT_SIGNING_SECRET) {
      return NextResponse.json({ certificateId: createLegacyCertificateId(), score, fallback: true });
    }

    const signed = createSignedCertificateId(score);
    return NextResponse.json({ certificateId: signed.id, score, issuedDate: signed.issuedDate });
  } catch {
    return NextResponse.json({ error: "Unable to issue certificate" }, { status: 500 });
  }
}
