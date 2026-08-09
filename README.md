🇮🇳 Bharat App — One Platform for Cyber Safety & Citizen Services
Bharat App is a civic and cybersecurity web platform built for IgniteX HackFest 2026. The goal is simple: bring essential cyber safety tools, scam awareness resources, and citizen services together in one easy-to-use platform.
From checking suspicious URLs and passwords to finding emergency services and understanding government schemes, Bharat App is designed to help users stay safer and more informed online.
🔗 Live Demo: https://smart-bharat-app-snowy.vercel.app/
🚀 Features
🔐 Cybersecurity & Safety Tools
Password Auditor — Checks password strength using entropy calculation and generates SHA-256/SHA-1 fingerprints. It also supports real HIBP k-Anonymity breach checking.
Password Generator — Creates strong, customizable passwords.
Data Breach Timeline — Checks an email address for known breach history using the XposedOrNot API.
URL / Malicious Link Scanner — Performs heuristic checks and uses Google Safe Browsing to identify potentially unsafe URLs.
Fake Job & Loan Scam Checker — Identifies common red flags associated with fraudulent job and loan offers.
QR Code Scanner — Scans QR codes using the device camera and checks detected URLs for potential safety issues.
File Hash Checker — Generates SHA-256 hashes to help verify file integrity.
2FA Setup Guide — Step-by-step security guides for Gmail, WhatsApp, Facebook and Instagram.
Phishing Email/SMS Analyzer — Looks for suspicious keywords and common phishing indicators.
Wi-Fi Safety Checklist — Practical security tips for using public and unfamiliar networks.
Digital Footprint Checker — A self-assessment quiz to help users understand their online exposure.
Ransomware Awareness Guide — Covers prevention, basic response steps and recovery practices.
Safe Online Shopping Checklist — Helps users identify common e-commerce scams.
Social Media Privacy Guide — Platform-specific guidance for improving account privacy.
Permission Checker Guide — Helps users understand potentially risky Android and browser permissions.
🏛️ Citizen Services
Emergency Services — Quick access to 112, 1930, 1098, 181 and 1915, along with a live map for nearby services.
AI Companion — A Hinglish, rule-based assistant for common cyber safety questions.
Complaints & Grievances — Helps users structure complaints and provides basic severity analysis.
Scheme Eligibility Finder — Helps users check basic eligibility for schemes such as PM-KISAN, Post-Matric Scholarship and MGNREGA.
Cyber Awareness Academy — Interactive quizzes based on real-world scam scenarios.
🛠️ Tech Stack
Technology
Purpose
Next.js
Frontend framework
React
UI development
TypeScript
Type-safe development
Tailwind CSS
Styling and responsive design
Vercel
Deployment
Leaflet + OpenStreetMap
Maps and location-based services
Have I Been Pwned
Password breach checking
XposedOrNot API
Email breach history
Google Safe Browsing
URL safety verification
Browser Geolocation API
Location-based services
Web Crypto API
Hash generation and cryptographic operations
🏗️ How It Works
Bharat App brings different security and civic features together through a single web interface.
Users can:
Select a cybersecurity or citizen-service tool.
Provide the required information, such as a URL, email address, file or QR code.
The application performs local analysis or communicates with the relevant API.
Results are presented in a simple and understandable format.
Users also get practical guidance on what to do next.
The platform is designed with simplicity and awareness in mind, so that even users without a technical background can understand the results.
📦 Getting Started
Prerequisites
Make sure you have Node.js and npm installed.
Installation
git clone <your-repository-url>

cd web

npm install

npm run dev
Then open:
http://localhost:3000
Environment Variables
If a feature requires an external API key, create a .env.local file and add the required credentials according to the project's configuration.
Never commit API keys or other secrets to GitHub.
🔮 Roadmap
Bharat App is still evolving. Some features planned for future versions include:
🌐 Dark Web Monitor
💳 UPI / Account Risk Verifier
📱 SIM Safety & Sanchar Saathi Integration
📦 APK / App Malware Scanner
🚨 AI Panic Mode for users facing an active fraud situation
🗂️ Categorized Dashboard Navigation
📲 Offline Access / PWA Support
🔒 Security & Privacy
Bharat App is built primarily for cybersecurity awareness and educational purposes.
The project aims to minimize unnecessary data collection and use browser-side security features where possible. External services and APIs may have their own privacy policies and limitations.
Users should never enter real passwords, OTPs, banking credentials, UPI PINs or other sensitive information into security-testing tools unless the feature specifically requires it and the user understands how the data is handled.
⚠️ Disclaimer
Bharat App is an educational and awareness project developed for IgniteX HackFest 2026.
The results provided by security checks are intended to assist users with basic awareness and should not be considered a replacement for professional cybersecurity tools, security audits or official government services.
For emergencies or cybercrime incidents, users should contact the appropriate official authorities.
👨‍💻 Author
Kunal Kushwaha
B.Tech CSE Student | Cybersecurity & Network Security Enthusiast
Built with ❤️ for IgniteX HackFest 2026.
⭐ Support the Project
If you find Bharat App useful or interesting, consider giving the repository a ⭐ on GitHub.
Feedback, suggestions and contributions are welcome!
