import { ShieldCheck } from "lucide-react";

export default function PrivacyTrustBadge() {
  return (
    <div
      className="inline-flex max-w-2xl items-start gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-3 py-2 text-left text-xs text-emerald-100"
      role="note"
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
      <span>
        Emails, passwords, and complaint details are not stored on any server. Scanned URLs are
        cached temporarily in Supabase for up to 48 hours for performance; other checks use public
        APIs or run locally in your browser.
      </span>
    </div>
  );
}
