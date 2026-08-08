"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import VisitorCounter from "./components/VisitorCounter";


type Theme = "light" | "dark";
type TabId = "emergency" | "ai" | "complaints" | "security" | "academy";
type ChatMessage = { role: "user" | "bot"; text: string };
type EmergencyContact = {
  number: string;
  label: string;
  websiteUrl?: string;
  websiteLabel?: string;
};
type Scheme = {
  name: string;
  minAge: number;
  maxIncome: number;
  detail: string;
  applyUrl: string;
};
type QuizQuestion = {
  question: string;
  options: Array<{ text: string; correct: boolean }>;
};

const emergencyContacts: EmergencyContact[] = [
  { number: "112", label: "Unified Emergency Response" },
  {
    number: "1930",
    label: "Cybercrime Financial Fraud Helpline",
    websiteUrl: "https://cybercrime.gov.in",
    websiteLabel: "cybercrime.gov.in",
  },
  {
    number: "1098",
    label: "Child Helpline",
    websiteUrl: "https://www.childlineindia.org",
    websiteLabel: "childlineindia.org",
  },
  { number: "181", label: "Women Safety Helpline" },
  {
  number: "1915",
  label: "National Consumer Helpline",
  websiteUrl: "https://consumerhelpline.gov.in",
  websiteLabel: " consumerhelpline.gov.in",
},
];

const schemeCards: Scheme[] = [
  {
    name: "PM-KISAN",
    minAge: 18,
    maxIncome: 300000,
    detail: "Liquid financial credits up to ₹6,000 mapping to farmer accounts directly.",
    applyUrl: "https://pmkisan.gov.in",
  },
  {
    name: "Post-Matric Scholarship",
    minAge: 16,
    maxIncome: 250000,
    detail: "100% academic verification reimbursement mechanism for underprivileged students.",
    applyUrl: "https://scholarships.gov.in",
  },
  {
    name: "MGNREGA",
    minAge: 18,
    maxIncome: 150000,
    detail: "Guaranteed 100 days of manual wage telemetry deployment logs per household.",
    applyUrl: "https://nrega.nic.in",
  },
];

const academyQuizQuestions: QuizQuestion[] = [
  {
    question: 'You get a call from "your bank" asking for your OTP. What do you do?',
    options: [
      { text: 'Never share the OTP', correct: true },
      { text: 'Share the OTP', correct: false },
    ],
  },
  {
    question: 'An SMS says you won a lottery and asks you to click a link to claim it. What do you do?',
    options: [
      { text: 'Ignore it, this is a scam', correct: true },
      { text: 'Click the link immediately', correct: false },
    ],
  },
  {
    question: 'An unknown SMS says your electricity will be cut tonight unless you click a link. What do you do?',
    options: [
      { text: 'Ignore the link and verify on the official portal', correct: true },
      { text: 'Click immediately and enter personal data', correct: false },
    ],
  },
  {
    question: 'Someone on WhatsApp asks for your OTP to "verify" a photo you sent. What do you do?',
    options: [
      { text: 'Never send it, even if it seems genuine', correct: true },
      { text: 'Send it if they seem trustworthy', correct: false },
    ],
  },
  {
    question: 'A website offers a job with a very high salary but asks for an advance registration fee. What do you do?',
    options: [
      { text: 'Treat it as a red flag and avoid paying', correct: true },
      { text: 'Pay the fee to secure the job', correct: false },
    ],
  },
];

const NearbyServicesMap = dynamic(() => import("./components/NearbyServicesMap"), {
  ssr: false,
  loading: () => <p className="mt-3 text-sm opacity-80">Loading emergency map...</p>,
});

const departmentKeywordMap: Record<string, string[]> = {
  "Public Health & Sanitation": ["gutter", "drain", "garbage", "smell", "dirty", "sewage"],
  "Roads / PWD": ["road", "pothole", "street", "bridge", "footpath"],
  "Water Supply Board": ["water", "pipeline", "leak", "tank", "supply"],
  "Electricity Board": ["electricity", "power", "meter", "transformer", "light"],
  "Police / Cyber Cell": ["fraud", "scam", "threat", "otp", "upi", "phishing", "hacked"],
};

function detectDepartment(text: string): string {
  const normalized = text.toLowerCase();
  const best = Object.entries(departmentKeywordMap)
    .map(([department, keywords]) => ({
      department,
      score: keywords.filter((keyword) => normalized.includes(keyword)).length,
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (!best || best.score === 0) {
    return "Municipal Grievance Cell";
  }
  return best.department;
}

function computeSeverityScore(text: string): number {
  const normalized = text.toLowerCase();
  const urgencyWords = ["urgent", "immediately", "emergency", "danger", "injury", "critical"];
  const highRiskWords = ["fraud", "scam", "hacked", "threat", "leak", "fire", "assault"];

  let score = Math.min(35, Math.floor(text.length / 5));
  score += urgencyWords.filter((w) => normalized.includes(w)).length * 10;
  score += highRiskWords.filter((w) => normalized.includes(w)).length * 12;

  return Math.min(100, score);
}

function buildComplaintDraft(rawComplaint: string): string {
  return `To,
The Ward Officer Command Sub-Cell,
Municipal Sovereign Corporation.

Subject: Structural Grievance Registry regarding municipal anomalies.

Sir/Madam,
This is to officially file an alert on record: "${rawComplaint}".
Kindly route telemetry units to fix this node immediately.

Regards,
Sovereign Resident Node.`;
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<TabId>("emergency");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Jai Hind! Main Bharat AI Companion hoon. Aap cyber safety, complaints, ya scheme eligibility pooch sakte ho.",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [complaintInput, setComplaintInput] = useState("");
  const [complaintOutput, setComplaintOutput] = useState("");
  const [complaintAnalysis, setComplaintAnalysis] = useState("");
  const [complaintError, setComplaintError] = useState<string | null>(null);

  const [schemeAge, setSchemeAge] = useState("");
  const [schemeIncome, setSchemeIncome] = useState("");
  const [selectedSchemeName, setSelectedSchemeName] = useState<string | null>(null);
  const [matchingSchemeNames, setMatchingSchemeNames] = useState<string[] | null>(null);
  const [schemeEvaluation, setSchemeEvaluation] = useState("");
  const [schemeError, setSchemeError] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const tabs: TabId[] = ["emergency", "ai", "complaints", "security", "academy"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveTab(visible[0].target.id as TabId);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.4, 0.6] },
    );

    tabs.forEach((tab) => {
      const section = document.getElementById(tab);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  const selectedScheme = useMemo(
    () => schemeCards.find((scheme) => scheme.name === selectedSchemeName) ?? null,
    [selectedSchemeName],
  );
  const visibleSchemes = useMemo(() => {
    if (!matchingSchemeNames) {
      return schemeCards;
    }
    return schemeCards.filter((scheme) => matchingSchemeNames.includes(scheme.name));
  }, [matchingSchemeNames]);

  const scrollToSection = (tab: TabId) => {
    const section = document.getElementById(tab);
    if (!section) {
      return;
    }
    setActiveTab(tab);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getTabClass = (tab: TabId, variant: "default" | "emergency" | "security" = "default") => {
    const isActive = activeTab === tab;
    const base = "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition";

    if (isActive && variant === "emergency") {
      return `${base} border-transparent bg-gradient-to-br from-[#7a1818] to-[#d93838] text-white`;
    }
    if (isActive && variant === "security") {
      return `${base} border-[#00e5ff] bg-gradient-to-br from-[#091322] to-[#10233c] text-[#bff7ff]`;
    }
    if (isActive) {
      return `${base} border-transparent bg-gradient-to-br from-[#0B1F3A] to-[#122A4D] text-white`;
    }

    if (variant === "emergency") {
      return `${base} ${
        isDark
          ? "border-[#d93838] text-[#ffd6d6] hover:bg-[#7a1818]"
          : "border-[#d93838] text-[#d93838] hover:bg-[#fff2f2]"
      }`;
    }
    if (variant === "security") {
      return `${base} ${
        isDark
          ? "border-[#00e5ff] text-[#bff7ff] hover:bg-[#10233c]"
          : "border-[#00a8c0] text-[#005c69] hover:bg-[#eefcff]"
      }`;
    }

    return `${base} ${
      isDark
        ? "border-white/15 bg-[#0A1424] text-[#ECF2FA] hover:bg-[#122A4D]"
        : "border-[#0B1F3A]/15 bg-white text-[#5C6E88] hover:bg-[#f7f9fd]"
    }`;
  };

  const runAIChat = async () => {
    const query = chatInput.trim();
    if (!query) {
      setChatError("Please type your question first.");
      return;
    }

    setChatError(null);
    setIsChatLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", text: query }]);
    setChatInput("");

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      const reply = typeof data.reply === "string" ? data.reply.trim() : "";

      if (!response.ok || !reply) {
        const error = data.error ?? "AI service failed.";
        setChatMessages((prev) => [...prev, { role: "bot", text: `Sorry, ${error}` }]);
        return;
      }

      setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to reach AI service";
      setChatMessages((prev) => [...prev, { role: "bot", text: `Sorry, ${message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const runAIComplaintWriter = () => {
    const text = complaintInput.trim();
    if (!text) {
      setComplaintError("Please enter complaint details.");
      return;
    }
    setComplaintError(null);
    setComplaintOutput(buildComplaintDraft(text));
  };

  const runAIComplaintAnalyzer = () => {
    const text = complaintInput.trim();
    if (!text) {
      setComplaintError("Please enter complaint details.");
      return;
    }
    setComplaintError(null);

    const score = computeSeverityScore(text);
    const department = detectDepartment(text);

    let severityLabel = "LOW";
    let responseWindow = "5-7 days";
    if (score >= 70) {
      severityLabel = "HIGH";
      responseWindow = "Within 24 hours";
    } else if (score >= 40) {
      severityLabel = "MODERATE";
      responseWindow = "48-72 hours";
    }

    setComplaintAnalysis(
      `[AI COMPLAINT RISK HEURISTICS DIAGNOSTIC]
------------------------------------------
Target Length: ${text.length} characters
Primary Department Route: ${department}
Severity Grade Matrix: ${severityLabel}
Priority Response Index: ${responseWindow}
Computed Severity Score: ${score}/100`,
    );
  };

  const getComplaintExportText = () => {
    const sections: string[] = [];
    if (complaintOutput) {
      sections.push("[FORMATTED COMPLAINT]\n" + complaintOutput);
    }
    if (complaintAnalysis) {
      sections.push("[SEVERITY ANALYSIS]\n" + complaintAnalysis);
    }
    return sections.join("\n\n");
  };

  const copyComplaintOutput = async () => {
    const exportText = getComplaintExportText();
    if (!exportText) {
      setComplaintError("Pehle Format ya Analyze run karo.");
      return;
    }
    await navigator.clipboard.writeText(exportText);
    setComplaintError(null);
  };

  const downloadComplaintAsText = () => {
    const exportText = getComplaintExportText();
    if (!exportText) {
      setComplaintError("Pehle Format ya Analyze run karo.");
      return;
    }
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "bharat-complaint-output.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
    setComplaintError(null);
  };

  const downloadComplaintAsPdf = () => {
    const exportText = getComplaintExportText();
    if (!exportText) {
      setComplaintError("Pehle Format ya Analyze run karo.");
      return;
    }
    const escaped = exportText
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      setComplaintError("Pop-up blocked. Please allow pop-ups to export PDF.");
      return;
    }
    popup.document.write(
      `<html><head><title>Complaint Export</title></head><body style="font-family: Arial, sans-serif; padding: 24px;"><pre style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${escaped}</pre></body></html>`,
    );
    popup.document.close();
    popup.focus();
    popup.print();
    setComplaintError(null);
  };

  const evaluateSchemeFor = (scheme: Scheme) => {
    const age = Number.parseInt(schemeAge, 10);
    const income = Number.parseInt(schemeIncome, 10);
    if (Number.isNaN(age) || Number.isNaN(income)) {
      setSchemeError("Age aur annual income dono fill karo for eligibility check.");
      setSchemeEvaluation(
        `${scheme.name}
Detail: ${scheme.detail}
Eligibility Rule: Age >= ${scheme.minAge}, Income <= ₹${scheme.maxIncome.toLocaleString("en-IN")}
Apply: ${scheme.applyUrl}
Status: Awaiting profile input (enter age + annual income).`,
      );
      return;
    }
    setSchemeError(null);

    const eligible = age >= scheme.minAge && income <= scheme.maxIncome;
    setSchemeEvaluation(
      `${scheme.name}
Eligibility Rule: Age >= ${scheme.minAge}, Income <= ₹${scheme.maxIncome.toLocaleString("en-IN")}
Your Profile: Age ${age}, Income ₹${income.toLocaleString("en-IN")}
Status: ${eligible ? "Eligible ✅" : "Not Eligible ❌"}
Detail: ${scheme.detail}
Apply: ${scheme.applyUrl}`,
    );
  };

  const runSchemeEligibility = () => {
    const age = Number.parseInt(schemeAge, 10);
    const income = Number.parseInt(schemeIncome, 10);
    if (Number.isNaN(age) || Number.isNaN(income)) {
      setSchemeError("Please enter valid age and annual income.");
      setSchemeEvaluation("");
      setMatchingSchemeNames(null);
      return;
    }
    setSchemeError(null);

    const matched = schemeCards.filter((scheme) => age >= scheme.minAge && income <= scheme.maxIncome);
    setMatchingSchemeNames(matched.map((scheme) => scheme.name));
    if (matched.length === 0) {
      setSchemeEvaluation("No scheme criteria matches this matrix.");
      setSelectedSchemeName(null);
      return;
    }

    if (!selectedSchemeName || !matched.some((scheme) => scheme.name === selectedSchemeName)) {
      setSelectedSchemeName(matched[0].name);
      evaluateSchemeFor(matched[0]);
    }

    const summary = matched
      .map(
        (scheme) =>
          `${scheme.name}: Eligible ✅ (Age >= ${scheme.minAge}, Income <= ₹${scheme.maxIncome.toLocaleString("en-IN")})`,
      )
      .join("\n");
    setSchemeEvaluation(summary);
  };

  const currentQuiz = academyQuizQuestions[quizIndex];

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (quizAnswered !== null) {
      return;
    }
    setQuizAnswered(isCorrect);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const moveToNextQuiz = () => {
    if (quizIndex >= academyQuizQuestions.length - 1) {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(null);
      return;
    }
    setQuizIndex((prev) => prev + 1);
    setQuizAnswered(null);
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? "bg-[#050B14] text-[#ECF2FA]" : "bg-[#F4F7FC] text-[#111E30]"
      }`}
    >
      <div className="h-[6px] w-full bg-[linear-gradient(90deg,#FF9933_0%,#FF9933_33%,#fff_33%,#fff_66%,#128807_66%)]" />

      <header
        className={`sticky top-0 z-50 border-b px-5 py-4 shadow-sm md:px-8 ${
          isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-extrabold tracking-wide text-[#FF9933]">Bharat App</div>
          <p className="text-xs text-gray-400 hidden md:block">One Platform for Cyber Safety & Citizen Services</p>
          <VisitorCounter />
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isDark ? "bg-[#122A4D] text-[#ECF2FA]" : "bg-[#0B1F3A] text-white"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <nav
        className={`sticky top-[73px] z-40 border-b px-5 py-3 md:px-8 ${
          isDark ? "border-white/10 bg-[#0A1424]/95" : "border-[#0B1F3A]/10 bg-white/95"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl gap-3 overflow-x-auto pb-1">
          <a
            href="#emergency"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("emergency");
            }}
            className={getTabClass("emergency", "emergency")}
          >
            <i className="fa-solid fa-heart-pulse" />
            Emergency Services
          </a>
          <a
            href="#ai"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("ai");
            }}
            className={getTabClass("ai")}
          >
            <i className="fa-solid fa-robot" />
            AI Companion & Schemes
          </a>
          <a
            href="#complaints"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("complaints");
            }}
            className={getTabClass("complaints")}
          >
            <i className="fa-solid fa-file-invoice" />
            Complaints & Grievances
          </a>
          <a
            href="#security"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("security");
            }}
            className={getTabClass("security", "security")}
          >
            <i className="fa-solid fa-screwdriver-wrench" />
            Security Tools & Audit
          </a>
          <a
            href="#academy"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("academy");
            }}
            className={getTabClass("academy")}
          >
            <i className="fa-solid fa-graduation-cap" />
            Cyber Awareness Academy
          </a>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 md:px-8">
        <section
          id="emergency"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">Emergency Services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map((item) => (
              <div
                key={item.number}
                className={`hover-lift rounded-xl border p-4 ${
                  isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
                }`}
              >
                <p className="text-3xl font-extrabold text-[#FF9933]">{item.number}</p>
                <p className="mt-1 text-sm">{item.label}</p>
                <a href={`tel:${item.number}`} className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700">Call Now</a>
                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-[#FF9933] underline"
                  >
                    Official: {item.websiteLabel}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          <NearbyServicesMap isDark={isDark} />
        </section>

        <section
          id="ai"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">AI Companion & Schemes</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className={`rounded-xl border p-4 ${
                isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
              }`}
            >
              <p className="mb-3 text-sm">
                Ask in Hinglish: &quot;password safe hai?&quot;, &quot;ye link fake hai kya?&quot;
              </p>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isChatLoading) {
                      void runAIChat();
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 ${
                    isDark
                      ? "border-white/20 bg-[#050B14] text-[#ECF2FA]"
                      : "border-[#0B1F3A]/20 bg-white text-[#111E30]"
                  }`}
                  placeholder="Type your query..."
                />
                <button
                  type="button"
                  disabled={isChatLoading}
                  onClick={() => {
                    void runAIChat();
                  }}
                  className="rounded-lg bg-[#FF9933] px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  {isChatLoading ? "Sending..." : "Send"}
                </button>
              </div>
              {chatError ? <p className="mt-2 text-sm text-[#ffb0b0]">{chatError}</p> : null}
              <div
                className={`mt-4 max-h-72 space-y-3 overflow-y-auto rounded-lg border p-3 ${
                  isDark ? "border-white/15 bg-[#050B14]" : "border-[#0B1F3A]/15 bg-white"
                }`}
              >
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "ml-auto bg-[#0B1F3A] text-white"
                        : isDark
                          ? "bg-[#122A4D] text-[#ECF2FA]"
                          : "bg-[#F4F7FC] text-[#111E30]"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
              }`}
            >
              <h3 className="mb-3 text-lg font-bold">Scheme Eligibility Finder</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="number"
                  min={0}
                  value={schemeAge}
                  onChange={(event) => {
                    setSchemeAge(event.target.value);
                    setMatchingSchemeNames(null);
                  }}
                  className={`rounded-lg border px-3 py-2 ${
                    isDark
                      ? "border-white/20 bg-[#050B14] text-[#ECF2FA]"
                      : "border-[#0B1F3A]/20 bg-white text-[#111E30]"
                  }`}
                  placeholder="Age"
                />
                <input
                  type="number"
                  min={0}
                  value={schemeIncome}
                  onChange={(event) => {
                    setSchemeIncome(event.target.value);
                    setMatchingSchemeNames(null);
                  }}
                  className={`rounded-lg border px-3 py-2 ${
                    isDark
                      ? "border-white/20 bg-[#050B14] text-[#ECF2FA]"
                      : "border-[#0B1F3A]/20 bg-white text-[#111E30]"
                  }`}
                  placeholder="Annual income (₹)"
                />
              </div>
              <button
                type="button"
                onClick={runSchemeEligibility}
                className="mt-3 rounded-full bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
              >
                Evaluate All Matching Schemes
              </button>
              {schemeError ? <p className="mt-2 text-sm text-[#ffb0b0]">{schemeError}</p> : null}

              <div className="mt-4 grid gap-3">
                {visibleSchemes.map((scheme) => (
                  <div
                    key={scheme.name}
                    onClick={() => {
                      setSelectedSchemeName(scheme.name);
                      evaluateSchemeFor(scheme);
                    }}
                    className={`hover-lift rounded-xl border p-4 text-left transition ${
                      selectedSchemeName === scheme.name
                        ? "border-[#FF9933] bg-[#FF9933]/10"
                        : isDark
                          ? "border-white/15 bg-[#0A1424] hover:bg-[#16253a]"
                          : "border-[#0B1F3A]/15 bg-white hover:bg-[#eef4ff]"
                    } cursor-pointer`}
                  >
                    <p className="font-bold">{scheme.name}</p>
                    <p className="text-sm opacity-85">{scheme.detail}</p>
                    <p className="mt-1 text-xs opacity-75">
                      Criteria: Age {scheme.minAge}+ | Income up to ₹
                      {scheme.maxIncome.toLocaleString("en-IN")}
                    </p>
                    <a
                      href={scheme.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="mt-2 inline-flex text-xs font-semibold text-[#FF9933] underline"
                    >
                      Apply Officially: {scheme.applyUrl.replace("https://", "")}
                    </a>
                  </div>
                ))}
              </div>
              {matchingSchemeNames && visibleSchemes.length === 0 ? (
                <p className="mt-3 text-sm text-[#ffb0b0]">
                  No scheme cards shown because none match the current age/income filter.
                </p>
              ) : null}

              {selectedScheme ? (
                <div
                  className={`mt-4 rounded-lg border p-3 text-sm whitespace-pre-line ${
                    isDark ? "border-white/15 bg-[#050B14]" : "border-[#0B1F3A]/15 bg-white"
                  }`}
                >
                  {schemeEvaluation}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="complaints"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">Complaints & Grievances</h2>
          <textarea
            rows={4}
            value={complaintInput}
            onChange={(event) => setComplaintInput(event.target.value)}
            className={`w-full rounded-xl border p-3 ${
              isDark
                ? "border-white/20 bg-[#122A4D] text-[#ECF2FA]"
                : "border-[#0B1F3A]/20 bg-[#F9FBFF] text-[#111E30]"
            }`}
            placeholder="Issue likhiye: location, incident details, timeline..."
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runAIComplaintWriter}
              className="rounded-full bg-[#0B1F3A] px-5 py-2 text-white"
            >
              Format via AI
            </button>
            <button
              type="button"
              onClick={runAIComplaintAnalyzer}
              className="rounded-full bg-[#128807] px-5 py-2 text-white"
            >
              Analyze Severity
            </button>
            <button
              type="button"
              onClick={() => {
                void copyComplaintOutput();
              }}
              className="rounded-full bg-[#FF9933] px-5 py-2 text-white"
            >
              Copy Output
            </button>
            <button
              type="button"
              onClick={downloadComplaintAsText}
              className="rounded-full bg-[#122A4D] px-5 py-2 text-white"
            >
              Download TXT
            </button>
            <button
              type="button"
              onClick={downloadComplaintAsPdf}
              className="rounded-full bg-[#7a1818] px-5 py-2 text-white"
            >
              Download PDF
            </button>
          </div>
          {complaintError ? <p className="mt-2 text-sm text-[#ffb0b0]">{complaintError}</p> : null}

          {complaintOutput ? (
            <pre
              className={`mt-4 whitespace-pre-wrap rounded-lg border p-4 text-sm ${
                isDark ? "border-white/15 bg-[#050B14]" : "border-[#0B1F3A]/15 bg-white"
              }`}
            >
              {complaintOutput}
            </pre>
          ) : null}

          {complaintAnalysis ? (
            <pre
              className={`mt-4 whitespace-pre-wrap rounded-lg border p-4 text-sm ${
                isDark ? "border-white/15 bg-[#050B14]" : "border-[#0B1F3A]/15 bg-white"
              }`}
            >
              {complaintAnalysis}
            </pre>
          ) : null}
        </section>

        <section
          id="security"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-3 text-2xl font-bold">Security Tools & Audit</h2>
          <p className="mb-4 text-sm opacity-90">
            Password checks, malicious URL scanner, SHA-256 hash checks, and breach verification.
          </p>
          <Link
            href="/security-tools"
            className="inline-flex rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white"
          >
            Open Security Tools Page
          </Link>
        </section>

        <section
          id="academy"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">Cyber Awareness Academy</h2>
          <p className="mb-4 text-sm">
            Question {quizIndex + 1} of {academyQuizQuestions.length} | Score: {quizScore}
          </p>
          <p className="mb-4 text-sm font-semibold">{currentQuiz.question}</p>
          <div className="grid gap-3">
            {currentQuiz.options.map((option, index) => {
              const selectedWrong = quizAnswered === false && option.correct === false;
              const selectedCorrect = quizAnswered === true && option.correct === true;
              return (
                <button
                  key={`${quizIndex}-${index}`}
                  type="button"
                  onClick={() => handleQuizAnswer(option.correct)}
                  className={`rounded-xl border p-3 text-left ${
                    selectedCorrect
                      ? "border-[#128807] bg-[#128807]/15"
                      : selectedWrong
                        ? "border-[#d93838] bg-[#d93838]/15"
                        : isDark
                          ? "border-white/20 bg-[#122A4D]"
                          : "border-[#0B1F3A]/15 bg-[#F9FBFF]"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
          {quizAnswered !== null ? (
            <p className={`mt-3 text-sm font-semibold ${quizAnswered ? "text-[#4ade80]" : "text-[#f87171]"}`}>
              {quizAnswered ? "Correct answer selected ✅" : "Wrong choice ❌  — dubara socho aur safe option follow karo."}
            </p>
          ) : null}
          <button
            type="button"
            onClick={moveToNextQuiz}
            className="mt-4 rounded-full bg-[#0B1F3A] px-5 py-2 text-sm font-semibold text-white"
          >
            {quizIndex === academyQuizQuestions.length - 1 ? "Restart Quiz" : "Next Question"}
          </button>
        </section>
      </main>
      <footer className="mt-16 py-8 border-t border-gray-700 text-center text-gray-400">
  <div className="flex justify-center gap-6 mb-3">
    <a href="#" className="hover:text-white">About</a>
    <a href="#" className="hover:text-white">Privacy Policy</a>
    <a href="https://github.com/kunalkushwaha-tech" target="_blank" className="hover:text-white">GitHub</a>
    <a href="tel:+918126748461" className="hover:text-white">Contact</a>
  </div>
  <p className="text-sm">© 2026 Bharat App</p>
</footer>
    </div>
  );
}
