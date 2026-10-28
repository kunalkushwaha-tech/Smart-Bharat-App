export type QuizCategory =
  | "Fraud & Payments"
  | "Emergency & Helplines"
  | "Online Safety"
  | "Government Schemes";

export type QuizOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  question: string;
  explanation: string;
  options: QuizOption[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    category: "Fraud & Payments",
    question: "Online fraud mein paisa kat gaya. Sabse pehle kya karna chahiye?",
    explanation: "Jitni jaldi 1930 par report karoge, paisa freeze hone ke chance utne zyada hote hain.",
    options: [
      { id: "q1o1", text: "Turant 1930 par call karke cybercrime.gov.in par complaint darj karna", correct: true },
      { id: "q1o2", text: "Kuch din wait karna ki paisa wapas aata hai ya nahi", correct: false },
      { id: "q1o3", text: "Scammer ko message karke paisa wapas maangna", correct: false },
      { id: "q1o4", text: "Sirf social media par post karke sabko batana", correct: false },
    ],
  },
  {
    id: "q2",
    category: "Emergency & Helplines",
    question: "Police, ambulance aur fire ke liye India ka unified emergency number kaunsa hai?",
    explanation: "112 sabhi emergencies ke liye ek unified number hai. 108 ambulance aur 101 fire ke liye alag se bhi chalte hain.",
    options: [
      { id: "q2o1", text: "112", correct: true },
      { id: "q2o2", text: "100", correct: false },
      { id: "q2o3", text: "108", correct: false },
      { id: "q2o4", text: "1098", correct: false },
    ],
  },
  {
    id: "q3",
    category: "Emergency & Helplines",
    question: "Women Safety Helpline ka number kaunsa hai?",
    explanation: "181 Women Helpline hai. 1098 Childline, 1915 National Consumer Helpline aur 1930 cyber fraud ke liye hai.",
    options: [
      { id: "q3o1", text: "181", correct: true },
      { id: "q3o2", text: "1098", correct: false },
      { id: "q3o3", text: "1915", correct: false },
      { id: "q3o4", text: "1930", correct: false },
    ],
  },
  {
    id: "q4",
    category: "Fraud & Payments",
    question: "Bank ka \"executive\" call karke aapka OTP maang raha hai. Aap kya karoge?",
    explanation: "OTP, PIN aur CVV kisi ko bhi mat batao, chahe caller kitna bhi asli lage.",
    options: [
      { id: "q4o1", text: "Call kaat doge, kyunki asli bank kabhi OTP nahi maangta", correct: true },
      { id: "q4o2", text: "OTP bata doge taaki account block na ho", correct: false },
      { id: "q4o3", text: "Pehle 3 digit bata doge, baaki baad mein", correct: false },
      { id: "q4o4", text: "Sirf agar caller ko aapka naam pata ho to bata doge", correct: false },
    ],
  },
  {
    id: "q5",
    category: "Fraud & Payments",
    question: "Koi kehta hai \"paisa receive karne ke liye UPI PIN daalo\". Ye kya hai?",
    explanation: "Paisa receive karne ke liye kabhi PIN nahi daalna padta. PIN maange to samajh jao scam hai.",
    options: [
      { id: "q5o1", text: "Scam. UPI PIN sirf paise bhejne ke liye chahiye, receive karne ke liye nahi", correct: true },
      { id: "q5o2", text: "Normal process hai, PIN daalna padta hai", correct: false },
      { id: "q5o3", text: "Sirf bade amount par PIN lagta hai", correct: false },
      { id: "q5o4", text: "Sirf business account par PIN lagta hai", correct: false },
    ],
  },
  {
    id: "q6",
    category: "Online Safety",
    question: "Ek link \"sbi-kyc-update.com\" hai aur browser mein HTTPS lock bhi hai. Kya ye safe hai?",
    explanation: "Scam sites bhi HTTPS use karti hain. Hamesha official domain khud check karo.",
    options: [
      { id: "q6o1", text: "Nahi. HTTPS sirf encrypted connection batata hai, site asli hone ki guarantee nahi", correct: true },
      { id: "q6o2", text: "Haan, lock hai to safe hai", correct: false },
      { id: "q6o3", text: "Haan, kyunki naam mein SBI likha hai", correct: false },
      { id: "q6o4", text: "Haan, agar mobile par khole", correct: false },
    ],
  },
  {
    id: "q7",
    category: "Online Safety",
    question: "SMS ka sender ID \"VK-SBIINB\" jaisa dikhta hai. Sirf format sahi dikhne se kya sabit hota hai?",
    explanation: "Sender ka format dekhkar bharosa mat karo. SMS ke link par click kiye bina official app se check karo.",
    options: [
      { id: "q7o1", text: "Kuch nahi. Message asli hone ki guarantee nahi, official app ya website se verify karo", correct: true },
      { id: "q7o2", text: "Message pakka bank ka hi hai", correct: false },
      { id: "q7o3", text: "SMS ka link safe hai", correct: false },
      { id: "q7o4", text: "Isme OTP share kar sakte ho", correct: false },
    ],
  },
  {
    id: "q8",
    category: "Online Safety",
    question: "Railway station ke free public Wi-Fi par kya nahi karna chahiye?",
    explanation: "Public Wi-Fi par koi data chura sakta hai, isliye banking aur payment se door raho.",
    options: [
      { id: "q8o1", text: "Net banking ya UPI payment (sensitive kaam mobile data ya VPN se karo)", correct: true },
      { id: "q8o2", text: "Weather aur news dekhna", correct: false },
      { id: "q8o3", text: "Gaane ya videos dekhna", correct: false },
      { id: "q8o4", text: "Maps par rasta dekhna", correct: false },
    ],
  },
  {
    id: "q9",
    category: "Government Schemes",
    question: "PM-KISAN mein eligible kisan parivaron ko saal mein kitni sahayata milti hai?",
    explanation: "PM-KISAN mein eligible parivaron ko saal mein ₹6,000 teen kisht mein milte hain.",
    options: [
      { id: "q9o1", text: "₹6,000 (₹2,000 ki teen kisht mein)", correct: true },
      { id: "q9o2", text: "₹2,000", correct: false },
      { id: "q9o3", text: "₹12,000", correct: false },
      { id: "q9o4", text: "₹1,00,000", correct: false },
    ],
  },
  {
    id: "q10",
    category: "Emergency & Helplines",
    question: "ICE Card mein emergency ke liye kaun si jaankari rakhni chahiye?",
    explanation: "ICE Card mein sirf wahi rakho jo emergency mein doctor ya responder ke kaam aaye, kabhi PIN ya password nahi.",
    options: [
      { id: "q10o1", text: "Blood group, allergies, medical conditions aur emergency contact", correct: true },
      { id: "q10o2", text: "ATM PIN aur net banking password", correct: false },
      { id: "q10o3", text: "Aadhaar aur PAN ka number", correct: false },
      { id: "q10o4", text: "Social media passwords", correct: false },
    ],
  },
];

export function shuffleQuiz(source: QuizQuestion[]): QuizQuestion[] {
  const questions = source.map((question) => ({
    ...question,
    options: [...question.options],
  }));
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
  }
  questions.forEach((question) => {
    for (let index = question.options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [question.options[index], question.options[swapIndex]] = [question.options[swapIndex], question.options[index]];
    }
  });
  return questions;
}
