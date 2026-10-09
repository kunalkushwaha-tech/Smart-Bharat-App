"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import VisitorCounter from "./components/VisitorCounter";
import PanicMode from "./components/PanicMode";
import HeroSection from "./components/HeroSection";
import MobileBottomNav from "./components/MobileBottomNav";


type Theme = "light" | "dark";
type Language = "en" | "hi";
type TabId = "emergency" | "ai" | "complaints" | "security" | "academy";
type ChatMessage = { role: "user" | "bot"; text: string };
type EmergencyContact = {
  number: string;
  label: string;
  icon: string;
  websiteUrl?: string;
  websiteLabel?: string;
};
type Scheme = {
  name: string;
  minAge: number;
  maxAge?: number;
  maxIncome: number | null;
  detail: string;
  eligibility: string;
  applyUrl: string;
  central?: boolean;
  relevantStates?: string[];
};
type ComplaintHistoryItem = {
  id: string;
  label: string;
  timestamp: string;
  output: string;
  analysis: string;
};
type Language = "en" | "hi" | "mr";
type QuizQuestion = {
  question: string;
  options: Array<{ text: string; correct: boolean }>;
};
type AcademyGuide = {
  title: string;
  explanation: string;
  protections: string[];
};
type ComplaintCategory = {
  title: string;
  description: string;
  guidance: string;
};

const translations = {
  en: {
    tagline: "One Platform for Cyber Safety & Citizen Services",
    languageLabel: "Language",
    english: "English",
    hindi: "Hindi",
    emergency: "Emergency Services",
    ai: "AI Companion & Schemes",
    complaints: "Complaints & Grievances",
    security: "Security Tools & Audit",
    academy: "Cyber Awareness Academy",
    callNow: "Call Now",
    official: "Official",
    schemeFinder: "Scheme Eligibility Finder",
    age: "Age",
    state: "State",
    annualIncome: "Annual Income (₹)",
    category: "Category",
    allStates: "All States",
    allCategories: "All Categories",
    evaluate: "Evaluate Matching Schemes",
    eligibilityCount: (count: number) => `You may be eligible for ${count} scheme${count === 1 ? "" : "s"}`,
    contact: "Contact",
    contactText: "Questions or feedback? Reach out to the Bharat App team.",
    emailUs: "Email Us",
    helplines: {
      "112": "Unified Emergency Response",
      "108": "Ambulance Emergency Services",
      "101": "Fire Emergency Services",
      "1930": "Cybercrime Financial Fraud Helpline",
      "1098": "Child Helpline",
      "181": "Women Safety Helpline",
      "1915": "National Consumer Helpline",
    },
  },
  hi: {
    tagline: "साइबर सुरक्षा और नागरिक सेवाओं के लिए एक मंच",
    languageLabel: "भाषा",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    emergency: "आपातकालीन सेवाएं",
    ai: "एआई सहायक और योजनाएं",
    complaints: "शिकायतें और जन-शिकायतें",
    security: "सुरक्षा उपकरण और ऑडिट",
    academy: "साइबर जागरूकता अकादमी",
    callNow: "अभी कॉल करें",
    official: "आधिकारिक",
    schemeFinder: "योजना पात्रता खोजक",
    age: "आयु",
    state: "राज्य",
    annualIncome: "वार्षिक आय (₹)",
    category: "श्रेणी",
    allStates: "सभी राज्य",
    allCategories: "सभी श्रेणियां",
    evaluate: "मिलान योजनाएं देखें",
    eligibilityCount: (count: number) => `आप ${count} योजना${count === 1 ? "" : "ओं"} के लिए पात्र हो सकते हैं`,
    contact: "संपर्क",
    contactText: "प्रश्न या सुझाव हैं? भारत ऐप टीम से संपर्क करें।",
    emailUs: "ईमेल करें",
    helplines: {
      "112": "एकीकृत आपातकालीन सहायता",
      "108": "एम्बुलेंस आपातकालीन सेवा",
      "101": "अग्निशमन आपातकालीन सेवा",
      "1930": "साइबर अपराध वित्तीय धोखाधड़ी हेल्पलाइन",
      "1098": "बाल हेल्पलाइन",
      "181": "महिला सुरक्षा हेल्पलाइन",
      "1915": "राष्ट्रीय उपभोक्ता हेल्पलाइन",
    },
  },
} as const;

const quickPrompts = [
  "Check this URL",
  "Is this SMS a scam?",
  "How to secure my account?",
  "I got a suspicious payment request",
  "How to report cyber fraud?",
];

const emergencyContacts: EmergencyContact[] = [
  { number: "112", label: "Unified Emergency Response" },
  { number: "108", label: "Ambulance Emergency Services" },
  { number: "101", label: "Fire Emergency Services" },
  {
    number: "1930",
    label: "Cybercrime Financial Fraud Helpline",
    icon: "💳",
    websiteUrl: "https://cybercrime.gov.in",
    websiteLabel: "cybercrime.gov.in",
  },
  {
    number: "1098",
    label: "Child Helpline",
    icon: "👶",
    websiteUrl: "https://www.childlineindia.org",
    websiteLabel: "childlineindia.org",
  },
  { number: "181", label: "Women Safety Helpline" },
  { number: "108", label: "Ambulance" },
  { number: "101", label: "Fire" },
  {
  number: "1915",
  label: "National Consumer Helpline",
  icon: "🛒",
  websiteUrl: "https://consumerhelpline.gov.in",
  websiteLabel: " consumerhelpline.gov.in",
},
];

const primaryEmergencyServices = [
  { number: "112", title: "Unified Emergency Response", subtitle: "Police • Fire • Medical", icon: "🚨" },
  { number: "108", title: "Ambulance Emergency Services", subtitle: "Medical Emergency", icon: "🚑" },
  { number: "101", title: "Fire Emergency Services", subtitle: "Fire & Rescue", icon: "🚒" },
  { number: "1930", title: "Cybercrime Financial Fraud Helpline", subtitle: "Report Financial Cyber Fraud", icon: "🛡️" },
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const schemeCards: Scheme[] = [
  {
    name: "PM-KISAN",
    minAge: 18,
    maxIncome: 300000,
    detail: "Farmers can receive up to ₹6,000 per year in three instalments, paid directly into their bank account.",
    eligibility: "Age 18+; eligible landholding farmer families, subject to scheme exclusions.",
    applyUrl: "https://pmkisan.gov.in",
    central: true,
  },
  {
    name: "Post-Matric Scholarship",
    minAge: 16,
    maxIncome: 250000,
    detail: "Financial help for eligible students from some communities to continue their studies after school.",
    eligibility: "Age and income limits vary by community/category; this finder uses the commonly published ₹2.5 lakh annual family-income ceiling.",
    applyUrl: "https://scholarships.gov.in",
    central: true,
  },
  {
    name: "MGNREGA",
    minAge: 18,
    maxIncome: 150000,
    detail: "Rural households can get up to 100 days of paid work in a year. Ask your Gram Panchayat to apply.",
    eligibility: "Age 18+; adult members of rural households willing to do unskilled manual work.",
    applyUrl: "https://nrega.nic.in",
    central: true,
  },
  {
    name: "Ayushman Bharat (PM-JAY)",
    minAge: 0,
    maxIncome: null,
    detail: "Eligible poor and vulnerable families get cashless hospital treatment cover of up to ₹5 lakh per family per year. All citizens aged 70+ are also covered without an income limit.",
    eligibility: "No fixed age or income ceiling for SECC-identified families; all citizens aged 70+ are eligible regardless of income.",
    applyUrl: "https://beneficiary.nha.gov.in",
    central: true,
  },
  {
    name: "PM Awas Yojana",
    minAge: 18,
    maxIncome: 1800000,
    detail: "Eligible families without a pucca house can get housing support. Urban income bands run from EWS up to ₹3 lakh, LIG up to ₹6 lakh, and MIG up to ₹18 lakh; rural eligibility is based on housing deprivation.",
    eligibility: "Usually an adult household applicant who does not own a pucca house; urban annual household income up to ₹18 lakh, with rural eligibility based on housing deprivation.",
    applyUrl: "https://pmaymis.gov.in",
    central: true,
  },
  {
    name: "Sukanya Samriddhi Yojana",
    minAge: 0,
    maxAge: 10,
    maxIncome: null,
    detail: "A parent or guardian can open a savings account for a girl child below age 10. Deposits earn government-notified interest, receive tax benefits, and the account matures after 21 years.",
    eligibility: "Girl child must be below 10 when the account opens; normally up to two accounts per family. No income limit.",
    applyUrl: "https://www.indiapost.gov.in",
    central: true,
  },
  {
    name: "PM Ujjwala Yojana",
    minAge: 18,
    maxIncome: null,
    detail: "Women aged 18+ in eligible deprived or poor households can receive an LPG connection with government assistance for the connection and initial setup.",
    eligibility: "Woman aged 18+ from an eligible poor/deprived household with no existing LPG connection in the household; no single universal income ceiling.",
    applyUrl: "https://www.pmuy.gov.in",
    central: true,
  },
  {
    name: "National Pension System (NPS)",
    minAge: 18,
    maxAge: 70,
    maxIncome: null,
    detail: "Indian citizens can build a retirement corpus through voluntary contributions. NPS offers retirement savings and tax benefits; returns depend on market-linked investments.",
    eligibility: "Indian citizen or eligible resident aged 18–70; no income limit and contributions are voluntary.",
    applyUrl: "https://enps.nsdl.com",
    central: true,
  },
  {
    name: "Stand-Up India",
    minAge: 18,
    maxIncome: null,
    detail: "Banks can provide loans of ₹10 lakh to ₹1 crore to SC/ST or women entrepreneurs for a new Greenfield business in manufacturing, services, trading, or allied agriculture.",
    eligibility: "SC/ST or woman entrepreneur aged 18+; for a new Greenfield enterprise. No income limit, but bank credit assessment applies.",
    applyUrl: "https://www.standupmitra.in",
    central: true,
  },
];

const COMPLAINT_HISTORY_KEY = "bharat-app-complaint-history";

const indianStatesAndUnionTerritories = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

const scamWarnings = [
  "⚠️ FedEx Parcel Scam Alert",
  "⚠️ Fake Electricity Bill SMS Fraud",
  "⚠️ Part-Time Job Scam on WhatsApp",
  "⚠️ KYC Update Phishing Calls",
  "⚠️ Fake Loan App Harassment",
  "⚠️ UPI Refund Request Fraud",
];
const translatedScamWarnings: Record<Language, string[]> = {
  en: scamWarnings,
  hi: ["⚠️ FedEx पार्सल घोटाला अलर्ट", "⚠️ नकली बिजली बिल SMS धोखाधड़ी", "⚠️ WhatsApp पर पार्ट-टाइम नौकरी घोटाला", "⚠️ KYC अपडेट फिशिंग कॉल", "⚠️ नकली लोन ऐप उत्पीड़न", "⚠️ UPI रिफंड अनुरोध धोखाधड़ी"],
  mr: ["⚠️ FedEx पार्सल घोटाळा सूचना", "⚠️ बनावट वीज बिल SMS फसवणूक", "⚠️ WhatsApp वरील अर्धवेळ नोकरी घोटाळा", "⚠️ KYC अपडेट फिशिंग कॉल", "⚠️ बनावट कर्ज अॅपचा त्रास", "⚠️ UPI परतावा विनंती फसवणूक"],
};

const translations = {
  en: {
    language: "Language",
    tagline: "One Platform for Cyber Safety & Citizen Services",
    emergency: "Emergency Services",
    ai: "AI Companion & Schemes",
    complaints: "Complaints & Grievances",
    security: "Security Tools & Audit",
    academy: "Cyber Awareness Academy",
    schemeFinder: "Scheme Eligibility Finder",
    state: "State",
    allStates: "All States & UTs",
    evaluate: "Evaluate All Matching Schemes",
    tickerLabel: "Trending scam alerts",
  },
  hi: {
    language: "भाषा",
    tagline: "साइबर सुरक्षा और नागरिक सेवाओं का एक मंच",
    emergency: "आपातकालीन सेवाएं",
    ai: "एआई सहायक और योजनाएं",
    complaints: "शिकायतें और जन-शिकायत",
    security: "सुरक्षा उपकरण और ऑडिट",
    academy: "साइबर जागरूकता अकादमी",
    schemeFinder: "योजना पात्रता खोजक",
    state: "राज्य",
    allStates: "सभी राज्य और केंद्र शासित प्रदेश",
    evaluate: "सभी मिलती योजनाएं जांचें",
    tickerLabel: "लोकप्रिय ठगी अलर्ट",
  },
  mr: {
    language: "भाषा",
    tagline: "सायबर सुरक्षा आणि नागरिक सेवांसाठी एक व्यासपीठ",
    emergency: "आपत्कालीन सेवा",
    ai: "एआय सहाय्यक आणि योजना",
    complaints: "तक्रारी आणि गाऱ्हाणी",
    security: "सुरक्षा साधने आणि ऑडिट",
    academy: "सायबर जागरूकता अकादमी",
    schemeFinder: "योजना पात्रता शोधक",
    state: "राज्य",
    allStates: "सर्व राज्ये आणि केंद्रशासित प्रदेश",
    evaluate: "सर्व जुळणाऱ्या योजना तपासा",
    tickerLabel: "ट्रेंडिंग फसवणूक सूचना",
  },
} as const;

const translatedEmergencyLabels = {
  en: ["Unified Emergency Response", "Ambulance Emergency Services", "Fire Emergency Services", "Cybercrime Financial Fraud Helpline", "Child Helpline", "Women Safety Helpline", "National Consumer Helpline"],
  hi: ["एकीकृत आपातकालीन प्रतिक्रिया", "एम्बुलेंस आपातकालीन सेवा", "अग्निशमन आपातकालीन सेवा", "साइबर अपराध वित्तीय धोखाधड़ी हेल्पलाइन", "बाल हेल्पलाइन", "महिला सुरक्षा हेल्पलाइन", "राष्ट्रीय उपभोक्ता हेल्पलाइन"],
  mr: ["एकत्रित आपत्कालीन प्रतिसाद", "रुग्णवाहिका आपत्कालीन सेवा", "अग्निशमन आपत्कालीन सेवा", "सायबर गुन्हे आर्थिक फसवणूक हेल्पलाइन", "बाल हेल्पलाइन", "महिला सुरक्षा हेल्पलाइन", "राष्ट्रीय ग्राहक हेल्पलाइन"],
} as const;

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

const academyGuides: AcademyGuide[] = [
  {
    title: "UPI Scam",
    explanation:
      "Scammers may pretend to be customer support or send a collect request while claiming you will receive money. Remember that entering a UPI PIN authorizes a payment; it is never required to receive a refund.",
    protections: [
      "Verify the recipient and amount before entering your UPI PIN.",
      "Reject unexpected collect requests and never scan a QR code to receive money.",
      "Report suspicious transactions to your bank and 1930 immediately.",
    ],
  },
  {
    title: "Phishing",
    explanation:
      "Phishing messages imitate banks, government services, delivery companies, or people you know to steal login details. They often use urgent language and links to lookalike websites.",
    protections: [
      "Open official websites by typing the address yourself instead of tapping an unexpected link.",
      "Check the complete sender address and domain before responding.",
      "Never share passwords, OTPs, or recovery codes through a message.",
    ],
  },
  {
    title: "Fake Job Scam",
    explanation:
      "Fake recruiters promise quick hiring or unusually high salaries and then ask for registration, training, or document fees. Legitimate employers do not require payment to secure a job.",
    protections: [
      "Verify the company and vacancy on its official careers page.",
      "Never pay an advance fee or share identity documents with an unverified recruiter.",
      "Be cautious of WhatsApp-only interviews and pressure to act immediately.",
    ],
  },
  {
    title: "Investment Scam",
    explanation:
      "Investment scams promise guaranteed returns, exclusive tips, or fast profits through fake apps and social groups. Early withdrawals or testimonials may be used to build trust before a larger deposit is demanded.",
    protections: [
      "Do not trust guaranteed-return claims or unsolicited investment advice.",
      "Use regulated platforms and verify advisers through official sources.",
      "Never transfer money to a personal account or install an investment app from a message.",
    ],
  },
  {
    title: "OTP Fraud",
    explanation:
      "An OTP is a one-time authorization for a login, payment, or account change. Anyone asking for it over a call or chat may be trying to approve an action on your behalf.",
    protections: [
      "Keep OTPs, PINs, and verification codes private, even from someone claiming to be support.",
      "Read the OTP message and transaction details before approving anything.",
      "Contact the bank through its official number if an unexpected OTP arrives.",
    ],
  },
  {
    title: "Social Media Account Safety",
    explanation:
      "Compromised social accounts can expose private messages and be used to scam your contacts. Weak reused passwords, fake login pages, and unauthorized third-party apps are common causes.",
    protections: [
      "Use a unique strong password and enable two-factor authentication.",
      "Review active sessions and connected apps regularly.",
      "Limit public personal details and verify unusual requests through another channel.",
    ],
  },
  {
    title: "Public Wi-Fi Safety",
    explanation:
      "Public Wi-Fi networks can be fake, poorly secured, or monitored by attackers. Sensitive activity on an untrusted network can expose accounts and personal data.",
    protections: [
      "Avoid banking and sensitive logins on open public networks.",
      "Confirm the network name with staff and use mobile data when possible.",
      "Keep device sharing off, use HTTPS, and update your device before connecting.",
    ],
  },
];

const complaintCategories: ComplaintCategory[] = [
  {
    title: "Cybercrime Complaint",
    description: "Report online fraud, phishing, unauthorized transactions, account compromise, or cyber harassment.",
    guidance: "For cyber complaints and financial fraud, use cybercrime.gov.in or call 1930 for urgent assistance.",
  },
  {
    title: "Consumer Complaint",
    description: "Prepare a complaint about defective products, misleading services, billing issues, or unresolved seller disputes.",
    guidance: "For national consumer complaints, check consumerhelpline.gov.in and keep invoices, order details, and correspondence ready.",
  },
  {
    title: "Government Grievance",
    description: "Format a grievance about public services, local administration, utilities, roads, sanitation, or other government departments.",
    guidance: "Check your relevant department or state grievance portal and keep the department, location, and submission date available.",
  },
];

const NearbyServicesMap = dynamic(() => import("./components/NearbyServicesMap"), {
  ssr: false,
  loading: () => (
    <div className="mt-5 rounded-xl border border-white/10 bg-[#0A1424] p-4 text-sm text-[#C8D5EA]">
      Emergency map is loading. Use the helpline buttons above if you need immediate assistance.
    </div>
  ),
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
  const [theme, setTheme] = useState<Theme>("dark");
  const [themeInitialized, setThemeInitialized] = useState(false);
  const isDark = theme === "dark";
  const [language, setLanguage] = useState<Language>("en");
  const text = translations[language];
  const [highContrast, setHighContrast] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("emergency");
  const [panicShortcut, setPanicShortcut] = useState(false);
  const [panicModeVisible, setPanicModeVisible] = useState(true);

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
  const [complaintHistory, setComplaintHistory] = useState<ComplaintHistoryItem[]>([]);
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [complaintDownloaded, setComplaintDownloaded] = useState(false);

  const [schemeAge, setSchemeAge] = useState("");
  const [schemeState, setSchemeState] = useState("");
  const [schemeIncome, setSchemeIncome] = useState("");
  const [schemeState, setSchemeState] = useState("");
  const [selectedSchemeName, setSelectedSchemeName] = useState<string | null>(null);
  const [matchingSchemeNames, setMatchingSchemeNames] = useState<string[] | null>(null);
  const [schemeEvaluation, setSchemeEvaluation] = useState("");
  const [schemeError, setSchemeError] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompletedScore, setQuizCompletedScore] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    setThemeInitialized(true);
  }, []);

  useEffect(() => {
    if (themeInitialized) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, themeInitialized]);

  useEffect(() => {
    setHighContrast(localStorage.getItem("high-contrast") === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("high-contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(COMPLAINT_HISTORY_KEY);
    if (!savedHistory) return;
    try {
      const parsed = JSON.parse(savedHistory) as unknown;
      if (Array.isArray(parsed)) {
        setComplaintHistory(parsed.filter((item): item is ComplaintHistoryItem => (
          typeof item === "object"
          && item !== null
          && typeof (item as ComplaintHistoryItem).id === "string"
          && typeof (item as ComplaintHistoryItem).label === "string"
          && typeof (item as ComplaintHistoryItem).timestamp === "string"
          && typeof (item as ComplaintHistoryItem).output === "string"
          && typeof (item as ComplaintHistoryItem).analysis === "string"
        )));
      }
    } catch (error: unknown) {
      console.warn("Could not restore complaint history from local storage.", error);
    }
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("panic") !== "true") return;
    setPanicShortcut(true);
    window.setTimeout(() => {
      document.getElementById("panic-mode")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }, []);

  useEffect(() => {
    const panicMode = document.getElementById("panic-mode");
    if (!panicMode) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPanicModeVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.1 },
    );
    observer.observe(panicMode);
    return () => observer.disconnect();
  }, []);

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
    const stateFiltered = schemeCards.filter((scheme) =>
      scheme.central || !scheme.relevantStates || !schemeState || scheme.relevantStates.includes(schemeState),
    );
    if (!matchingSchemeNames) {
      return stateFiltered;
    }
    return stateFiltered.filter((scheme) => matchingSchemeNames.includes(scheme.name));
  }, [matchingSchemeNames, schemeState]);

  const scrollToSection = (tab: TabId) => {
    const section = document.getElementById(tab);
    if (!section) {
      return;
    }
    setActiveTab(tab);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectComplaintCategory = (category: string) => {
    setSelectedComplaintCategory(category);
    document.getElementById("complaint-formatter")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const trackComplaint = () => {
    const reference = complaintReference.trim();
    if (!reference) {
      setTrackingGuidance("Enter the complaint reference number first.");
      return;
    }

    const category = complaintCategories.find((item) => item.title === selectedComplaintCategory);
    setTrackingGuidance(
      `${category?.guidance ?? "Check the official portal that issued your reference number."} This tool does not connect to complaint databases, so it cannot show live status for ${reference}.`,
    );
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
      const { response, data } = await requestAIChat(query);
      const reply = typeof data.reply === "string" ? data.reply.trim() : "";

      if (!response.ok || !reply) {
        const error = data.error ?? "AI service failed.";
        setChatMessages((prev) => [...prev, { role: "bot", text: `Sorry, ${error}` }]);
        return;
      }

      setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (error: unknown) {
      const message =
        error instanceof TypeError
          ? "Unable to reach the AI service. Please check that the app server is running."
          : error instanceof Error
            ? error.message
            : "Unable to reach AI service";
      setChatMessages((prev) => [...prev, { role: "bot", text: `Sorry, ${message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const runAIComplaintWriter = () => {
    const text = complaintInput.trim();
    if (!text || text.length > 5000) {
      setComplaintError("Please enter complaint details.");
      return;
    }
    setComplaintError(null);
    const output = buildComplaintDraft(text);
    const timestamp = new Date();
    const nextItem: ComplaintHistoryItem = {
      id: `${timestamp.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      label: `Complaint #${complaintHistory.length + 1} - ${timestamp.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      timestamp: timestamp.toISOString(),
      output,
      analysis: complaintAnalysis,
    };
    const nextHistory = [nextItem, ...complaintHistory];
    setComplaintOutput(output);
    setComplaintHistory(nextHistory);
    localStorage.setItem(COMPLAINT_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const runAIComplaintAnalyzer = () => {
    const text = complaintInput.trim();
    if (!text || text.length > 5000) {
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
    setComplaintDownloaded(true);
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
    setComplaintDownloaded(true);
    setComplaintError(null);
  };

  const openCybercrimePortal = () => {
    window.open("https://cybercrime.gov.in", "_blank", "noopener,noreferrer");
  };

  const viewComplaintHistoryItem = (item: ComplaintHistoryItem) => {
    setComplaintOutput(item.output);
    setComplaintAnalysis(item.analysis);
    setComplaintError(null);
  };

  const clearComplaintHistory = () => {
    setComplaintHistory([]);
    localStorage.removeItem(COMPLAINT_HISTORY_KEY);
    setComplaintError(null);
  };

  const exportComplaintHistory = () => {
    if (complaintHistory.length === 0) {
      setComplaintError("No complaint history is available to export.");
      return;
    }
    const fileUrl = URL.createObjectURL(
      new Blob([JSON.stringify(complaintHistory, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `bharat-app-complaints-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
    setComplaintError(null);
  };

  const evaluateSchemeFor = (scheme: Scheme) => {
    const age = Number.parseInt(schemeAge, 10);
    const income = Number.parseInt(schemeIncome, 10);
    if (Number.isNaN(age) || Number.isNaN(income)) {
      setSchemeError("Please enter valid age and annual income.");
      setSchemeEvaluation(
        `${scheme.name}
Detail: ${scheme.detail}
Eligibility Rule: ${scheme.eligibility}
Apply: ${scheme.applyUrl}
Status: Awaiting profile input (enter age + annual income).`,
      );
      return;
    }
    setSchemeError(null);

    const eligible = age >= scheme.minAge
      && (scheme.maxAge === undefined || age <= scheme.maxAge)
      && (scheme.maxIncome === null || income <= scheme.maxIncome);
    setSchemeEvaluation(
      `${scheme.name}
Eligibility Rule: ${scheme.eligibility}
Your Profile: Age ${age}, Income ₹${income.toLocaleString("en-IN")}
Status: ${eligible ? "Eligible ✅" : "Not Eligible ❌"}
Detail: ${scheme.detail}
Apply: ${scheme.applyUrl}`,
    );
  };

  const runSchemeEligibility = () => {
    const age = schemeAge ? Number.parseInt(schemeAge, 10) : null;
    const income = schemeIncome ? Number.parseInt(schemeIncome, 10) : null;
    if ((schemeAge && Number.isNaN(age)) || (schemeIncome && Number.isNaN(income))) {
      setSchemeError("Please enter valid age and annual income.");
      setSchemeEvaluation("");
      setMatchingSchemeNames(null);
      return;
    }
    setSchemeError(null);

    const matched = schemeCards.filter((scheme) => {
      const appliesToState = scheme.central || !scheme.relevantStates || !schemeState || scheme.relevantStates.includes(schemeState);
      return appliesToState
        && age >= scheme.minAge
        && (scheme.maxAge === undefined || age <= scheme.maxAge)
        && (scheme.maxIncome === null || income <= scheme.maxIncome);
    });
    setMatchingSchemeNames(matched.map((scheme) => scheme.name));
    setSelectedSchemeName(matched[0]?.name ?? null);
    setSchemeEvaluation("");
    if (matched.length === 0) {
      setSchemeEvaluation("No scheme criteria matches this matrix.");
      return;
    }

    if (!selectedSchemeName || !matched.some((scheme) => scheme.name === selectedSchemeName)) {
      setSelectedSchemeName(matched[0].name);
      evaluateSchemeFor(matched[0]);
    }

    const summary = matched
      .map(
        (scheme) =>
          `${scheme.name}: Eligible ✅ (${scheme.eligibility})`,
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
    const nextScore = quizScore + (isCorrect ? 1 : 0);
    setQuizScore(nextScore);
    if (quizIndex >= academyQuizQuestions.length - 1) {
      setQuizCompletedScore(nextScore);
    }
  };

  const moveToNextQuiz = () => {
    if (quizIndex >= academyQuizQuestions.length - 1) {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(null);
      setQuizCompletedScore(null);
      return;
    }
    setQuizIndex((prev) => prev + 1);
    setQuizAnswered(null);
  };

  const speakScamWarnings = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedScamWarnings[language].join(". "));
    const languageCode = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    utterance.lang = languageCode;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(languageCode.slice(0, 2)));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`${highContrast ? "high-contrast " : ""}min-h-screen transition-colors ${
        isDark ? "bg-[#050B14] text-[#ECF2FA]" : "bg-[#F4F7FC] text-[#111E30]"
      }`}
    >
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="h-[6px] w-full bg-[linear-gradient(90deg,#FF9933_0%,#FF9933_33%,#fff_33%,#fff_66%,#128807_66%)]" aria-hidden="true" />

      <header
        className={`sticky top-0 z-50 border-b px-5 py-4 shadow-sm md:px-8 ${
          isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-extrabold tracking-wide text-[#FF9933]">Bharat App</div>
          <p className="text-xs text-gray-400 hidden md:block">{text.tagline}</p>
          <VisitorCounter />
          <label className="flex items-center gap-2 text-xs font-semibold">
            <span className="sr-only">{text.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              aria-label={text.language}
              className={`rounded-full border px-3 py-2 ${isDark ? "border-white/15 bg-[#122A4D] text-[#ECF2FA]" : "border-[#0B1F3A]/15 bg-white text-[#111E30]"}`}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </label>
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
          <button
            type="button"
            onClick={() => setHighContrast((current) => !current)}
            className={`rounded-full px-3 py-2 text-sm font-bold ${
              isDark ? "bg-[#122A4D] text-[#ECF2FA]" : "bg-[#0B1F3A] text-white"
            }`}
            aria-label="Toggle high contrast and large text mode"
            aria-pressed={highContrast}
            title="High contrast and large text"
          >
            Aa
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
            <i className="fa-solid fa-heart-pulse" aria-hidden="true" />
            {text.emergency}
          </a>
          <a
            href="#ai"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("ai");
            }}
            className={getTabClass("ai")}
          >
            <i className="fa-solid fa-robot" aria-hidden="true" />
            {text.ai}
          </a>
          <a
            href="#complaints"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("complaints");
            }}
            className={getTabClass("complaints")}
          >
            <i className="fa-solid fa-file-invoice" aria-hidden="true" />
            {text.complaints}
          </a>
          <a
            href="#security"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("security");
            }}
            className={getTabClass("security", "security")}
          >
            <i className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
            {text.security}
          </a>
          <a
            href="#academy"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("academy");
            }}
            className={getTabClass("academy")}
          >
            <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
            {text.academy}
          </a>
        </div>
      </nav>

      <HeroSection onNavigate={scrollToSection} />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 md:px-8">
        <section
          aria-label={text.tickerLabel}
          className={`scam-ticker relative flex items-center overflow-hidden rounded-xl border ${
            isDark ? "border-[#d93838]/50 bg-[#2a1118]" : "border-[#d93838]/30 bg-[#fff2f2]"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">Emergency Services</h2>
          <PanicMode />
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
          <button
            type="button"
            onClick={speakScamWarnings}
            className="z-10 mr-2 shrink-0 rounded-full bg-[#d93838] px-3 py-2 text-white shadow"
            aria-label="Read scam alerts aloud"
            title="Read scam alerts aloud"
          >
            <span aria-hidden="true">🔊</span>
          </button>
        </section>
        <EmergencyErrorBoundary>
          <section
            id="emergency"
            className={`rounded-2xl border p-6 ${
              isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
            }`}
          >
            <h2 className="mb-4 text-2xl font-bold">{text.emergency}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {emergencyContacts.map((item) => (
                <div
                  key={item.number}
                  className={`hover-lift rounded-xl border p-4 ${
                    isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
                  }`}
                >
                  <p className="text-3xl font-extrabold text-[#FF9933]">
                    <span aria-hidden="true">{item.icon}</span>{" "}
                    <span>{item.number}</span>
                  </p>
                  <p className="mt-1 text-sm">{translatedEmergencyLabels[language][emergencyContacts.indexOf(item)]}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a aria-label={`Call ${item.label} at ${item.number}`} href={`tel:${item.number.replace(/\D/g, "")}`} className="inline-block bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 rounded-full">Call Now</a>
                    {item.websiteUrl ? (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-xs font-semibold text-[#FF9933] underline"
                      >
                        Official: {item.websiteLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <IceCard />
            <PanicMode focusRequested={panicShortcut} />
            <NearbyServicesMap isDark={isDark} />
          </section>
        </EmergencyErrorBoundary>

        <section
          id="ai"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-4 text-2xl font-bold">{text.ai}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className={`rounded-xl border p-4 ${
                isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
              }`}
            >
              <p className="mb-3 text-sm">
                Ask in Hinglish: &quot;password safe hai?&quot;, &quot;ye link fake hai kya?&quot;
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setChatInput(prompt);
                      setChatError(null);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isDark
                        ? "border-white/20 text-[#ECF2FA] hover:bg-[#122A4D]"
                        : "border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#eef4ff]"
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
                <SpeechInput value={chatInput} onChange={setChatInput} />
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
              <p className="mt-2 text-xs text-gray-400">⚠️ AI-generated guidance may not always be accurate.</p>
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
              <h3 className="mb-3 text-lg font-bold">{text.schemeFinder}</h3>
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
                  placeholder={copy.age}
                />
                <select value={schemeState} onChange={(event) => { setSchemeState(event.target.value); setMatchingSchemeNames(null); }} className={`rounded-lg border px-3 py-2 ${isDark ? "border-white/20 bg-[#050B14] text-[#ECF2FA]" : "border-[#0B1F3A]/20 bg-white text-[#111E30]"}`}>
                  <option value="">{copy.allStates}</option>
                  {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
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
                  placeholder={copy.annualIncome}
                />
                <select
                  value={schemeState}
                  onChange={(event) => {
                    setSchemeState(event.target.value);
                    setMatchingSchemeNames(null);
                    setSelectedSchemeName(null);
                  }}
                  aria-label={text.state}
                  className={`rounded-lg border px-3 py-2 ${
                    isDark
                      ? "border-white/20 bg-[#050B14] text-[#ECF2FA]"
                      : "border-[#0B1F3A]/20 bg-white text-[#111E30]"
                  }`}
                >
                  <option value="">{text.allStates}</option>
                  {indianStatesAndUnionTerritories.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={runSchemeEligibility}
                className="mt-3 rounded-full bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
              >
                {text.evaluate}
              </button>
              {matchingSchemeNames ? <p className="mt-3 text-sm font-semibold text-[#FF9933]">{copy.eligibilityCount(visibleSchemes.length)}</p> : null}
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
                      Criteria: {scheme.eligibility}
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
          <h2 className="mb-4 text-2xl font-bold">{text.complaints}</h2>
          <label htmlFor="complaint-input" className="mb-2 block text-sm font-semibold">
            Describe your complaint
          </label>
          <textarea
            id="complaint-input"
            aria-label="Complaint details"
            rows={6}
            value={complaintInput}
            onChange={(event) => setComplaintInput(event.target.value)}
            className={`min-h-[180px] w-full rounded-xl border p-3 text-base ${
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
          {complaintDownloaded ? (
            <button
              type="button"
              onClick={openCybercrimePortal}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#128807] px-5 py-3 text-center font-bold text-white shadow-lg hover:bg-[#0d6b05] sm:w-auto"
            >
              Go to Official Govt Cybercrime Portal (cybercrime.gov.in)
            </button>
          ) : null}
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

          <div className={`mt-6 rounded-xl border p-4 ${
            isDark ? "border-white/10 bg-[#122A4D]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">My Complaints</h3>
                <p className="text-xs opacity-75">Local-only history. These formatted complaints are stored in this browser and are not synced to any server.</p>
              </div>
              {complaintHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportComplaintHistory}
                    className="rounded-full border border-[#128807] px-3 py-1 text-xs font-semibold text-[#8ee28a]"
                  >
                    Export All as JSON
                  </button>
                  <button
                    type="button"
                    onClick={clearComplaintHistory}
                    className="rounded-full border border-[#d93838] px-3 py-1 text-xs font-semibold text-[#ffb0b0]"
                  >
                    Clear History
                  </button>
                </div>
              ) : null}
            </div>
            {complaintHistory.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {complaintHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
                      isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs opacity-70">{new Date(item.timestamp).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => viewComplaintHistoryItem(item)}
                        className="rounded-full bg-[#0B1F3A] px-3 py-1 text-xs font-semibold text-white"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          viewComplaintHistoryItem(item);
                          window.setTimeout(downloadComplaintAsText, 0);
                        }}
                        className="rounded-full bg-[#FF9933] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Download TXT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm opacity-75">No formatted complaints saved yet.</p>
            )}
          </div>
        </section>

        <section
          id="security"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-3 text-2xl font-bold">{text.security}</h2>
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
          <h2 className="mb-4 text-2xl font-bold">{text.academy}</h2>
          <CommunityScamAlerts />
          {quizCompletedScore === null ? (
            <>
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
                Next Question
              </button>
            </>
          ) : (
            <CyberAwarenessCertificate
              score={quizCompletedScore}
              total={academyQuizQuestions.length}
              onRestart={moveToNextQuiz}
            />
          )}
        </section>

        <section
          id="contact"
          className={`rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h2 className="mb-2 text-2xl font-bold">{copy.contact}</h2>
          <p className="mb-4 text-sm opacity-85">{copy.contactText}</p>
          <a href="mailto:support@bharatapp.example" className="inline-flex rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">
            {copy.emailUs}
          </a>
        </section>
      </main>
      <footer className="mt-16 pb-24 pt-8 text-center text-gray-400 md:pb-8">
  <div className="flex justify-center gap-6 mb-3">
    <a href="#" className="hover:text-white">About</a>
    <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
    <a href="https://github.com/kunalkushwaha-tech" target="_blank" className="hover:text-white">GitHub</a>
    <a href="tel:+918126748461" className="hover:text-white">Contact</a>
  </div>
  <div className="flex justify-center gap-6 mb-3">
    <a href="/about" className="hover:text-white">About</a>
    <a href="/privacy" className="hover:text-white">Privacy Policy</a>
    <a href="/terms" className="hover:text-white">Terms</a>
    <a href="https://github.com/kunalkushwaha-tech" target="_blank" className="hover:text-white">GitHub</a>
    <a href="#contact" className="hover:text-white">Contact</a>
  </div>
  <p className="mx-auto max-w-3xl text-xs leading-relaxed text-[#cbd5e1]">
    Bharat App is an independent, open-access awareness platform and is not officially affiliated with any government agency.
    Helpline numbers and scheme links point to official government sources.
  </p>
  <p className="text-sm">© 2026 Bharat App</p>
</footer>
     <MobileBottomNav activeTab={activeTab} onNavigate={scrollToSection} isDark={isDark} />
    </div>
  );
}
