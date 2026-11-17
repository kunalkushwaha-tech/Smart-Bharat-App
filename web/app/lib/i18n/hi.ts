import type { Translation } from "./index";

const hi: Translation = {
  language: "भाषा",
  languageLabel: "भाषा",
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
  age: "आयु",
  annualIncome: "वार्षिक आय (₹)",
  contact: "संपर्क",
  contactText: "प्रश्न या सुझाव हैं? भारत ऐप टीम से संपर्क करें।",
  emailUs: "ईमेल करें",
  eligibilityCount: (count) => `आप ${count} योजना${count === 1 ? "" : "ओं"} के लिए पात्र हो सकते हैं`,
};

export default hi;
