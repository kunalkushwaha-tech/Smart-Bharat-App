"use client";

import { useEffect, useMemo, useState } from "react";

type ScenarioKind = "SMS" | "WhatsApp" | "Email" | "Call transcript" | "Fake login page" | "Telegram";
type Scenario = {
  id: number;
  kind: ScenarioKind;
  title: string;
  content: string;
  redFlags: string[];
  explanation: string;
  isScam: boolean;
};

const scenarios: Scenario[] = [
  { id: 1, kind: "SMS", title: "Power notice", content: "PowerCo: Aaj raat electricity disconnect hogi. Turant 98XXXXXX12 par call karke payment karo.", redFlags: ["Aaj raat", "disconnect", "98XXXXXX12"], explanation: "Urgency plus a personal mobile number is a strong red flag. Verify bills only in the official app or website.", isScam: true },
  { id: 2, kind: "WhatsApp", title: "Part-time offer", content: "QuickCourier Hiring: Videos like karke ₹5000/day kamao. Registration ke liye abhi ₹499 bhejo.", redFlags: ["₹5000/day", "₹499 bhejo"], explanation: "Unrealistic earnings and an advance fee are classic job-scam signals.", isScam: true },
  { id: 3, kind: "SMS", title: "Transaction OTP", content: "ExampleBank: Your OTP for the transaction you started is 482916. Never share this OTP with anyone.", redFlags: [], explanation: "This matches a transaction you initiated and warns you not to share the OTP. Still check the transaction details before approving.", isScam: false },
  { id: 4, kind: "Email", title: "KYC expiry", content: "From: ExampleBank Support <help@example-bank-kyc.com>\nSubject: KYC expires today\nClick to update your account immediately.", redFlags: ["example-bank-kyc.com", "expires today", "immediately"], explanation: "A look-alike domain and urgent pressure are warning signs. Open the bank app yourself instead.", isScam: true },
  { id: 5, kind: "SMS", title: "UPI refund", content: "Refund desk: Approve this UPI collect request to receive your refund. Enter your UPI PIN to accept.", redFlags: ["Approve", "receive your refund", "UPI PIN"], explanation: "You never enter a UPI PIN to receive money. A collect request asks you to pay.", isScam: true },
  { id: 6, kind: "Call transcript", title: "Digital arrest", content: "Caller: Aapke parcel mein drugs mile hain. Call mat kaatna. Digital arrest ke liye video par raho aur fine transfer karo.", redFlags: ["drugs", "Digital arrest", "fine transfer"], explanation: "Police or courier services do not conduct digital arrests or demand transfers on a call.", isScam: true },
  { id: 7, kind: "Fake login page", title: "Account verification", content: "ExampleBank Secure Login\nhttps://examplebank-security-check.com\nEnter your username, password and OTP to unlock your account.", redFlags: ["examplebank-security-check.com", "password", "OTP"], explanation: "The look-alike URL and request for an OTP on a login page indicate phishing.", isScam: true },
  { id: 8, kind: "SMS", title: "Order update", content: "QuickCourier: Your ExampleStore order is shipped. Track it in the QuickCourier app. No payment is required.", redFlags: [], explanation: "A purchase you made, no link, and no payment request are reassuring signs. Check the app independently.", isScam: false },
  { id: 9, kind: "Telegram", title: "Guaranteed returns", content: "PowerCo Investors group: Guaranteed 30% monthly returns. Send funds today for our secret strategy.", redFlags: ["Guaranteed 30%", "Send funds today", "secret strategy"], explanation: "Guaranteed high returns and pressure to transfer funds are investment-scam signals.", isScam: true },
  { id: 10, kind: "SMS", title: "Tax refund alert", content: "Tax Refund: ₹18,400 pending. Verify in 30 minutes: bit.ly/refund-now\nLegit comparison: the official ExampleBank app notification says only “Tax status updated — open the app to view details.”", redFlags: ["₹18,400 pending", "30 minutes", "bit.ly/refund-now"], explanation: "The shortened link and deadline are scam signals. The separate official-app notification is the safer pattern: open the app yourself.", isScam: true },
];

function shuffle(items: Scenario[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function SpotTheScamSimulator() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState<Scenario[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    const saved = Number.parseInt(window.localStorage.getItem("spot-the-scam-best-score") ?? "", 10);
    if (Number.isNaN(saved)) return;
    const timer = window.setTimeout(() => setBest(saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const current = round[index];
  const missedFlags = useMemo(() => round.flatMap((scenario) =>
    answers[scenario.id] !== undefined && answers[scenario.id] !== scenario.isScam ? scenario.redFlags : [],
  ), [answers, round]);

  function start() {
    setRound(shuffle(scenarios));
    setStarted(true);
    setIndex(0);
    setChoice(null);
    setAnswers({});
    setScore(0);
  }

  function answer(value: boolean) {
    if (choice !== null) return;
    setChoice(value);
    setAnswers((previous) => ({ ...previous, [current.id]: value }));
    if (value === current.isScam) setScore((previous) => previous + 1);
  }

  function finishOrNext() {
    if (index >= round.length - 1) {
      const finalScore = score + (choice === current.isScam ? 1 : 0);
      setScore(finalScore);
      if (best === null || finalScore > best) {
        setBest(finalScore);
        window.localStorage.setItem("spot-the-scam-best-score", String(finalScore));
      }
      return;
    }
    setIndex((previous) => previous + 1);
    setChoice(null);
  }

  if (!started) {
    return (
      <div className="mt-6 rounded-xl border border-[#FF9933]/30 bg-[#122A4D] p-5 text-[#ECF2FA]">
        <h3 className="text-xl font-bold">Spot the Scam Simulator</h3>
        <p className="mt-2 text-sm">10 fictional Hinglish examples. Decide Scam ya Legit, then inspect the red flags.</p>
        {best !== null ? <p className="mt-2 text-sm opacity-80">Best score: {best}/10</p> : null}
        <button type="button" onClick={start} className="mt-4 min-h-11 rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">Start simulation</button>
      </div>
    );
  }

  if (choice !== null && index >= round.length - 1) {
    const shareText = `I scored ${score}/10 in Smart Bharat's Spot the Scam Simulator. Practice safer online habits at https://www.smartbharat.me`;
    return (
      <div className="mt-6 rounded-xl border border-[#FF9933]/30 bg-[#122A4D] p-5 text-[#ECF2FA]">
        <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold tracking-wide text-white">SIMULATION COMPLETE</span>
        <h3 className="mt-3 text-2xl font-bold">Score: {score}/10</h3>
        <p className="mt-2 text-sm">Red-flag types missed: {missedFlags.length ? missedFlags.join(", ") : "None — well spotted!"}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={start} className="min-h-11 rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">Try again</button>
          <a className="inline-flex min-h-11 items-center rounded-full bg-[#128c3a] px-5 py-2 font-semibold text-white" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-[#FF9933]/30 bg-[#122A4D] p-5 text-[#ECF2FA]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold tracking-wide text-white">SIMULATION</span>
        <span className="text-sm">Scenario {index + 1} of 10</span>
      </div>
      <h3 className="mt-3 text-xl font-bold">{current.title} <span className="text-sm font-normal opacity-80">({current.kind})</span></h3>
      <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/15 bg-[#050B14] p-4 text-sm">{current.content}</pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => answer(true)} disabled={choice !== null} className="min-h-11 rounded-full bg-red-700 px-5 py-2 font-semibold text-white">Scam</button>
        <button type="button" onClick={() => answer(false)} disabled={choice !== null} className="min-h-11 rounded-full bg-[#128c3a] px-5 py-2 font-semibold text-white">Legit</button>
      </div>
      {choice !== null ? (
        <div className="mt-4 rounded-lg border border-white/15 p-4" aria-live="polite">
          <p className="font-semibold">{choice === current.isScam ? "Correct!" : "Not quite."} This example is {current.isScam ? "a scam." : "legitimate."}</p>
          <div className="mt-3 space-y-2">
            {current.redFlags.length ? current.redFlags.map((flag) => <p key={flag} className="rounded bg-red-900/50 px-3 py-2 text-sm"><strong>Red flag:</strong> {flag}</p>) : <p className="text-sm text-green-200">No red-flag text in this example.</p>}
          </div>
          <p className="mt-3 text-sm">{current.explanation}</p>
          <button type="button" onClick={finishOrNext} className="mt-4 min-h-11 rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">{index === round.length - 1 ? "See results" : "Next scenario"}</button>
        </div>
      ) : null}
    </div>
  );
}
