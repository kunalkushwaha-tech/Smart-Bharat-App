export type Scheme = {
  name: string;
  minAge: number;
  maxAge?: number;
  maxIncome: number | null;
  detail: string;
  eligibility: string;
  applyUrl: string;
  officialUrl: string;
  lastReviewed?: string;
  central?: boolean;
  relevantStates?: string[];
};

export const schemeCards: Scheme[] = [
  {
    name: "PM-KISAN",
    minAge: 18,
    maxIncome: 300000,
    detail: "Farmers can receive up to ₹6,000 per year in three instalments, paid directly into their bank account.",
    eligibility: "Age 18+; eligible landholding farmer families, subject to scheme exclusions.",
    applyUrl: "https://pmkisan.gov.in",
    officialUrl: "https://pmkisan.gov.in",
    central: true,
  },
  {
    name: "Post-Matric Scholarship",
    minAge: 16,
    maxIncome: 250000,
    detail: "Financial help for eligible students from some communities to continue their studies after school.",
    eligibility: "Age and income limits vary by community/category; this finder uses the commonly published ₹2.5 lakh annual family-income ceiling.",
    applyUrl: "https://scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in",
    central: true,
  },
  {
    name: "VB-G RAM G (earlier MGNREGA)",
    minAge: 18,
    maxIncome: 150000,
    detail: "Gaon ke rural household ke adults agar unskilled manual work karna chahte hain, to har saal per rural household up to 125 days ki guaranteed wage employment ke liye Gram Panchayat se sampark karein. Is card mein MGNREGA aur NREGA search keywords ke roop mein bhi kaam karte hain.",
    eligibility: "Adults volunteering for unskilled manual work in rural households; current rules aur application status official Ministry page par confirm karein.",
    applyUrl: "https://rural.gov.in",
    officialUrl: "https://rural.gov.in",
    central: true,
  },
  {
    name: "Ayushman Bharat (PM-JAY)",
    minAge: 0,
    maxIncome: null,
    detail: "Eligible poor and vulnerable families get cashless hospital treatment cover of up to ₹5 lakh per family per year. All citizens aged 70+ are also covered without an income limit.",
    eligibility: "No fixed age or income ceiling for SECC-identified families; all citizens aged 70+ are eligible regardless of income.",
    applyUrl: "https://beneficiary.nha.gov.in",
    officialUrl: "https://beneficiary.nha.gov.in",
    central: true,
  },
  {
    name: "PM Awas Yojana",
    minAge: 18,
    maxIncome: 900000,
    detail: "PMAY-U 2.0 mein eligible urban families ko housing support mil sakta hai. Annual household income bands: EWS up to ₹3 lakh, LIG ₹3–6 lakh, aur MIG ₹6–9 lakh. Interest subsidy lending institution ke through milti hai. Rural eligibility alag housing-deprivation rules par based hai.",
    eligibility: "Urban household income: EWS up to ₹3 lakh, LIG ₹3–6 lakh, MIG ₹6–9 lakh; rural eligibility housing deprivation ke basis par check hoti hai.",
    applyUrl: "https://pmaymis.gov.in",
    officialUrl: "https://pmaymis.gov.in",
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
    officialUrl: "https://www.indiapost.gov.in",
    central: true,
  },
  {
    name: "PM Ujjwala Yojana",
    minAge: 18,
    maxIncome: null,
    detail: "Women aged 18+ in eligible deprived or poor households can receive an LPG connection with government assistance for the connection and initial setup.",
    eligibility: "Woman aged 18+ from an eligible poor/deprived household with no existing LPG connection in the household; no single universal income ceiling.",
    applyUrl: "https://www.pmuy.gov.in",
    officialUrl: "https://www.pmuy.gov.in",
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
    officialUrl: "https://enps.nsdl.com",
    central: true,
  },
  {
    name: "Stand-Up India",
    minAge: 18,
    maxIncome: null,
    detail: "Stand-Up India eligible entrepreneurs ko new business ke liye bank finance guidance aur support deta hai. Eligibility, loan terms aur application availability official portal par check karein.",
    eligibility: "SC/ST ya woman entrepreneur ke liye new Greenfield enterprise ki scheme; current rules aur applications official site par confirm karein.",
    applyUrl: "https://www.standupmitra.in",
    officialUrl: "https://www.standupmitra.in",
    central: true,
  },
];

export const schemeCategories = ["All Categories", "Farmer", "Student", "Worker", "Health", "Housing", "Women", "Senior citizen"];

export function schemeCategoryFor(name: string) {
  if (name.includes("KISAN")) return "Farmer";
  if (name.includes("Scholarship")) return "Student";
  if (name.includes("MGNREGA") || name.includes("NREGA") || name.includes("Stand-Up")) return "Worker";
  if (name.includes("Ayushman")) return "Health";
  if (name.includes("Awas")) return "Housing";
  if (name.includes("Sukanya")) return "Women";
  if (name.includes("Pension")) return "Senior citizen";
  return "All Categories";
}
