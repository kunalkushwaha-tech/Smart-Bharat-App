export type SupportedLanguage = "en" | "hi" | "mr";

export const translatedScamWarnings: Record<SupportedLanguage, string[]> = {
  en: [
    "⚠️ FedEx Parcel Scam Alert",
    "⚠️ Fake Electricity Bill SMS Fraud",
    "⚠️ Part-Time Job Scam on WhatsApp",
    "⚠️ KYC Update Phishing Calls",
    "⚠️ Fake Loan App Harassment",
    "⚠️ UPI Refund Request Fraud",
  ],
  hi: [
    "⚠️ FedEx पार्सल घोटाला अलर्ट",
    "⚠️ नकली बिजली बिल SMS धोखाधड़ी",
    "⚠️ WhatsApp पर पार्ट-टाइम नौकरी घोटाला",
    "⚠️ KYC अपडेट फिशिंग कॉल",
    "⚠️ नकली लोन ऐप उत्पीड़न",
    "⚠️ UPI रिफंड अनुरोध धोखाधड़ी",
  ],
  mr: [
    "⚠️ FedEx पार्सल घोटाळा सूचना",
    "⚠️ बनावट वीज बिल SMS फसवणूक",
    "⚠️ WhatsApp वरील अर्धवेळ नोकरी घोटाळा",
    "⚠️ KYC अपडेट फिशिंग कॉल",
    "⚠️ बनावट कर्ज अॅपचा त्रास",
    "⚠️ UPI परतावा विनंती फसवणूक",
  ],
};
