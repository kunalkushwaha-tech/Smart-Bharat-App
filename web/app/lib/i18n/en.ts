import type { Translation } from "./index";

const en: Translation = {
  language: "Language",
  languageLabel: "Language",
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
  age: "Age",
  annualIncome: "Annual Income (₹)",
  contact: "Contact",
  contactText: "Questions or feedback? Reach out to the Bharat App team.",
  emailUs: "Email Us",
  eligibilityCount: (count) => `You may be eligible for ${count} scheme${count === 1 ? "" : "s"}`,
};

export default en;
