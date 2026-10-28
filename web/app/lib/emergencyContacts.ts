export type EmergencyContact = {
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  websiteUrl?: string;
  websiteLabel?: string;
};

export const emergencyContacts: EmergencyContact[] = [
  { number: "112", title: "Unified Emergency Response", subtitle: "Police • Fire • Medical", icon: "🚨" },
  { number: "108", title: "Ambulance Emergency Services", subtitle: "Medical Emergency", icon: "🚑" },
  { number: "101", title: "Fire Emergency Services", subtitle: "Fire & Rescue", icon: "🚒" },
  {
    number: "1930",
    title: "Cybercrime Financial Fraud Helpline",
    subtitle: "Report Financial Cyber Fraud",
    icon: "💳",
    websiteUrl: "https://cybercrime.gov.in",
    websiteLabel: "cybercrime.gov.in",
  },
  {
    number: "1098",
    title: "Child Helpline",
    subtitle: "Child Safety Support",
    icon: "👶",
    websiteUrl: "https://www.childlineindia.org",
    websiteLabel: "childlineindia.org",
  },
  { number: "181", title: "Women Safety Helpline", subtitle: "Women Safety Support", icon: "🧡" },
  {
    number: "1915",
    title: "National Consumer Helpline",
    subtitle: "Consumer Complaints",
    icon: "🛒",
    websiteUrl: "https://consumerhelpline.gov.in",
    websiteLabel: "consumerhelpline.gov.in",
  },
];

if (process.env.NODE_ENV !== "production") {
  const numbers = emergencyContacts.map((contact) => contact.number);
  const duplicateNumbers = numbers.filter((number, index) => numbers.indexOf(number) !== index);
  if (duplicateNumbers.length > 0) {
    console.error("Duplicate emergency contact numbers:", [...new Set(duplicateNumbers)]);
  }
}
