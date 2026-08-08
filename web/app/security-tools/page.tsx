import TwoFactorGuide from '../components/TwoFactorGuide';
import DataBreachTimeline from '../components/DataBreachTimeline';
import PasswordAudit from './components/PasswordAudit';
import URLScanner from './components/URLScanner';
import FakeOfferScamChecker from './components/FakeOfferScamChecker';
import QRScannerTool from './components/QRScannerTool';
import PhishingAnalyzer from '../components/PhishingAnalyzer';
import FileHashChecker from './components/FileHashChecker';
import PermissionChecker from './components/PermissionChecker';
import WifiSafetyChecklist from '../components/WifiSafetyChecklist';
import DigitalFootprintChecker from '../components/DigitalFootprintChecker';
import RansomwareGuide from '../components/RansomwareGuide';
import SafeShoppingChecklist from '../components/SafeShoppingChecklist';
import SocialMediaPrivacyGuide from '../components/SocialMediaPrivacyGuide';
export const metadata = {
  title: 'Security Tools & Audit - Smart Bharat',
};

export default function SecurityToolsPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Security Tools & Audit</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Password Auditor</h2>
        <p className="mb-4 text-gray-600">Check password strength, SHA-256 fingerprint, and whether it appears in known breaches (HIBP k-Anonymity).</p>
        <PasswordAudit />
      </section>
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Data Breach Timeline</h2>
  <p className="mb-4 text-gray-600">Check if your email has been involved in any known data breaches.</p>
  <DataBreachTimeline />
</section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">URL / Malicious Scanner</h2>
        <p className="mb-4 text-gray-600">Scan a URL with heuristic checks and Google Safe Browsing (server-side key required).</p>
        <URLScanner />
      </section>
      <section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">2FA Setup Guide</h2>
  <p className="mb-4 text-gray-600">Step-by-step guide to enable two-factor authentication.</p>
  <TwoFactorGuide />
</section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Fake Job / Loan Scam Checker</h2>
        <p className="mb-4 text-gray-600">
          Paste company or offer details to detect common scam red flags (advance fee, pressure tactics, suspicious communication).
        </p>
        <FakeOfferScamChecker />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">QR Scanner</h2>
        <p className="mb-4 text-gray-600">
          Scan QR from camera and automatically run URL safety checks (heuristics + Safe Browsing).
        </p>
        <QRScannerTool />
      </section>
      <section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Phishing Email/SMS Analyzer</h2>
  <p className="mb-4 text-gray-600">Paste suspicious email or SMS text to detect common phishing red flags.</p>
  <PhishingAnalyzer />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Wi-Fi Safety Checklist</h2>
  <p className="mb-4 text-gray-600">Stay safe while using public Wi-Fi networks.</p>
  <WifiSafetyChecklist />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Digital Footprint Checker</h2>
  <p className="mb-4 text-gray-600">Quick self-assessment of your online exposure risk.</p>
  <DigitalFootprintChecker />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Ransomware Awareness Guide</h2>
  <p className="mb-4 text-gray-600">Prevention tips and what to do if attacked.</p>
  <RansomwareGuide />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Safe Online Shopping Checklist</h2>
  <p className="mb-4 text-gray-600">Tips to avoid fake e-commerce scams.</p>
  <SafeShoppingChecklist />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Social Media Privacy Guide</h2>
  <p className="mb-4 text-gray-600">Step-by-step privacy settings for popular platforms.</p>
  <SocialMediaPrivacyGuide />
</section>
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">File Hash Checker</h2>
  <p className="mb-4 text-gray-600">Verify file integrity using SHA-256 hash comparison.</p>
  <FileHashChecker />
</section>

<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-2">Permission Checker Guide</h2>
  <p className="mb-4 text-gray-600">Understand which app permissions are genuine vs suspicious.</p>
  <PermissionChecker />
</section>
    </main>
  );
}
