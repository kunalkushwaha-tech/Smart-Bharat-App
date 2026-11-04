"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

import {
  deleteVaultCase,
  clearFraudEvidenceVault,
  listVaultCases,
  readChecklist,
  saveVaultCase,
  type EvidenceImage,
  type FraudCase,
  type TimelineRow,
  writeChecklist,
} from "../lib/fraudEvidenceVault";

const checklistItems = [
  "Call 1930",
  "Call your bank or wallet to block or freeze",
  "Do not delete chats or SMS",
  "Screenshot everything",
  "Note transaction IDs (UTR)",
  "Report on cybercrime.gov.in",
  "Keep the acknowledgement number",
  "Follow up with the bank in writing",
];
const caseTypes = ["UPI fraud", "Card", "Net banking", "Fake job/investment", "OTP/vishing", "Harassment", "Social media", "Other"];
const footerText = "Prepared with Bharat App. A personal record, not an official complaint. File your complaint on cybercrime.gov.in.";
const unsafeInputMessage = "Never enter full card numbers, PINs, passwords or OTPs.";

function emptyCase(index: number): FraudCase {
  return {
    id: `case-${index + 1}`,
    incidentDateTime: "",
    type: "UPI fraud",
    amountLost: "",
    paymentMode: "",
    bankWallet: "",
    accountLast4: "",
    suspectPhoneNumbers: "",
    upiIds: "",
    websitesApps: "",
    socialProfiles: "",
    namesUsed: "",
    description: "",
    timeline: [],
    evidence: [],
    updatedAt: new Date().toISOString(),
  };
}

function isLuhnNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function looksUnsafe(value: string): boolean {
  return isLuhnNumber(value) || /\b\d{6}\b/.test(value) || /\b(?:pin|password|passcode|otp)\b/i.test(value);
}

function defang(value: string): string {
  return value.replace(/https?:\/\//gi, (protocol) => `hxxps${protocol.slice(5)}`).replace(/\./g, "[.]");
}

function formatAmount(value: string): string {
  return value.trim() ? `₹${value.trim()}` : "—";
}

function sortTimeline(rows: TimelineRow[]): TimelineRow[] {
  return [...rows].sort((a, b) => (a.dateTime || "9999").localeCompare(b.dateTime || "9999"));
}

async function imageToDataUrl(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Only JPG, PNG or WebP images are allowed.");
  const source = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this image.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  let quality = 0.78;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 550_000 && quality > 0.42) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

export default function FraudEvidenceVault() {
  const [checklist, setChecklist] = useState<boolean[]>(Array(8).fill(false));
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [selectedId, setSelectedId] = useState("case-1");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const currentCase = cases.find((caseData) => caseData.id === selectedId) ?? null;

  useEffect(() => {
    let active = true;
    void listVaultCases().then((storedCases) => {
      if (!active) return;
      setCases(storedCases);
      if (storedCases[0]) setSelectedId(storedCases[0].id);
      setChecklist(readChecklist());
      setLoading(false);
    }).catch(() => {
      if (active) {
        setChecklist(readChecklist());
        setLoading(false);
        setMessage("Local vault storage is unavailable in this browser.");
      }
    });
    return () => { active = false; };
  }, []);

  const updateCase = (patch: Partial<FraudCase>) => {
    if (!currentCase) return;
    const next = { ...currentCase, ...patch, updatedAt: new Date().toISOString() };
    setCases((previous) => previous.map((item) => item.id === next.id ? next : item));
    void saveVaultCase(next).catch(() => setMessage("Could not save this case locally."));
    void navigator.storage?.persist?.();
  };

  const createCase = () => {
    if (cases.length >= 3) {
      setMessage("You can keep up to 3 cases.");
      return;
    }
    const next = emptyCase(cases.length);
    setCases((previous) => [...previous, next]);
    setSelectedId(next.id);
    void saveVaultCase(next).catch(() => setMessage("Could not save this case locally."));
  };

  const removeCase = () => {
    if (!currentCase || !window.confirm("Delete this case and its local evidence?")) return;
    void deleteVaultCase(currentCase.id).then(() => {
      const remaining = cases.filter((item) => item.id !== currentCase.id);
      setCases(remaining);
      setSelectedId(remaining[0]?.id ?? "");
    }).catch(() => setMessage("Could not delete this case."));
  };

  const removeEverything = () => {
    if (!window.confirm("Delete every vault case, timeline row, image and checklist item from this browser?")) return;
    void clearFraudEvidenceVault().then(() => {
      setCases([]);
      setSelectedId("");
      setChecklist(Array(8).fill(false));
      setMessage("Everything in the Fraud Evidence Vault was deleted from this browser.");
    }).catch(() => setMessage("The evidence vault could not be fully deleted."));
  };

  const updateChecklist = (index: number, checked: boolean) => {
    const next = checklist.map((value, itemIndex) => itemIndex === index ? checked : value);
    setChecklist(next);
    writeChecklist(next);
  };

  const addTimeline = () => {
    if (!currentCase) return;
    const row: TimelineRow = { id: crypto.randomUUID(), dateTime: "", whatHappened: "", amount: "", transactionId: "", notes: "" };
    updateCase({ timeline: sortTimeline([...currentCase.timeline, row]) });
  };

  const updateTimeline = (id: string, patch: Partial<TimelineRow>) => {
    if (!currentCase) return;
    updateCase({ timeline: sortTimeline(currentCase.timeline.map((row) => row.id === id ? { ...row, ...patch } : row)) });
  };

  const attachEvidence = async (files: FileList | null) => {
    if (!currentCase || !files) return;
    if (currentCase.evidence.length + files.length > 10) {
      setMessage("Each case can have up to 10 images.");
      return;
    }
    try {
      const images: EvidenceImage[] = [];
      for (const file of Array.from(files)) {
        images.push({ id: crypto.randomUUID(), name: file.name, type: "image/jpeg", dataUrl: await imageToDataUrl(file), caption: "" });
      }
      updateCase({ evidence: [...currentCase.evidence, ...images] });
      await navigator.storage?.persist?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not process this image.");
    }
  };

  const exportText = () => {
    if (!currentCase) return;
    const timeline = sortTimeline(currentCase.timeline).map((row) => `${row.dateTime || "Unknown time"} | ${row.whatHappened || "—"} | ${formatAmount(row.amount)} | UTR: ${row.transactionId || "—"} | ${row.notes || "—"}`).join("\n");
    const evidence = currentCase.evidence.map((item) => `${item.name}: ${item.caption || "No caption"}`).join("\n") || "None";
    const text = [
      "BHARAT APP — FRAUD EVIDENCE VAULT",
      "The portal's own fields may differ.",
      "",
      "WHAT HAPPENED",
      currentCase.description || "—",
      `WHEN: ${currentCase.incidentDateTime || "—"}`,
      `AMOUNT: ${formatAmount(currentCase.amountLost)}`,
      `TRANSACTION IDs: ${timeline || "—"}`,
      "",
      "SUSPECT IDENTIFIERS",
      `Phone numbers: ${currentCase.suspectPhoneNumbers || "—"}`,
      `UPI IDs: ${currentCase.upiIds || "—"}`,
      `Websites/apps: ${defang(currentCase.websitesApps || "—")}`,
      `Social profiles: ${currentCase.socialProfiles || "—"}`,
      `Names used: ${currentCase.namesUsed || "—"}`,
      "",
      "EVIDENCE LIST",
      evidence,
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    link.download = "bharat-fraud-evidence-summary.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportJson = () => {
    if (!currentCase) return;
    const withoutImages: Partial<FraudCase> = { ...currentCase };
    delete withoutImages.evidence;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(withoutImages, null, 2)], { type: "application/json" }));
    link.download = "bharat-fraud-evidence-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPdf = async () => {
    if (!currentCase) return;
    const pdf = new jsPDF();
    let y = 18;
    const write = (value: string, size = 10) => {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(value, 178);
      pdf.text(lines, 16, y);
      y += lines.length * (size === 16 ? 8 : 5) + 2;
      if (y > 270) { pdf.addPage(); y = 18; }
    };
    write("Fraud Evidence Vault", 16);
    write("The portal's own fields may differ.");
    write(`Incident: ${currentCase.incidentDateTime || "—"} | Type: ${currentCase.type} | Amount: ${formatAmount(currentCase.amountLost)}`);
    write(`Payment mode: ${currentCase.paymentMode || "—"} | Bank/wallet: ${currentCase.bankWallet || "—"} | Account last 4: ${currentCase.accountLast4 || "—"}`);
    write(`What happened: ${currentCase.description || "—"}`);
    write(`Suspects: phones ${currentCase.suspectPhoneNumbers || "—"}; UPI ${currentCase.upiIds || "—"}; sites/apps ${defang(currentCase.websitesApps || "—")}; profiles ${currentCase.socialProfiles || "—"}; names ${currentCase.namesUsed || "—"}`);
    write("Timeline", 12);
    sortTimeline(currentCase.timeline).forEach((row) => write(`${row.dateTime || "Unknown"} | ${row.whatHappened || "—"} | ${formatAmount(row.amount)} | UTR: ${row.transactionId || "—"} | ${row.notes || "—"}`));
    write("Evidence", 12);
    currentCase.evidence.forEach((item) => {
      write(`${item.name}: ${item.caption || "No caption"}`);
      if (y > 235) { pdf.addPage(); y = 18; }
      const image = pdf.getImageProperties(item.dataUrl);
      const width = Math.min(170, image.width);
      const height = Math.min(100, (image.height / image.width) * width);
      pdf.addImage(item.dataUrl, "JPEG", 16, y, width, height);
      y += height + 5;
    });
    pdf.setFontSize(8);
    pdf.text(footerText, 16, 286, { maxWidth: 178 });
    pdf.save("bharat-fraud-evidence-summary.pdf");
  };

  const unsafeFields = currentCase ? [
    currentCase.amountLost, currentCase.accountLast4, currentCase.suspectPhoneNumbers, currentCase.upiIds,
    currentCase.websitesApps, currentCase.socialProfiles, currentCase.namesUsed, currentCase.description,
  ].some(looksUnsafe) : false;

  if (loading) return <p className="mt-4 text-sm">Loading your local evidence vault…</p>;

  return (
    <details className="mt-6 rounded-xl border border-[#d93838]/30 bg-[#d93838]/5 p-4">
      <summary className="cursor-pointer text-lg font-bold">Fraud Evidence Vault</summary>
      <div className="mt-4 space-y-5">
        <div className="rounded-lg border border-[#FF9933]/40 bg-[#FF9933]/10 p-3 text-sm font-semibold">Saved only on this device. Not uploaded. Anyone using this browser can see it. Delete it after you have filed.</div>
        <section>
          <h3 className="font-bold">First 24 hours</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {checklistItems.map((item, index) => (
              <label key={item} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={checklist[index]} onChange={(event) => updateChecklist(index, event.target.checked)} />{item}</label>
            ))}
          </div>
          <a className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#d93838] px-4 py-2 font-semibold text-white" href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">Open cybercrime.gov.in</a>
        </section>
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">Cases ({cases.length}/3)</h3>
            <button type="button" onClick={createCase} className="min-h-11 rounded-full bg-[#FF9933] px-4 py-2 font-semibold text-white">Add case</button>
          </div>
          {cases.length === 0 ? <p className="mt-2 text-sm">Create a case to record what happened.</p> : (
            <div className="mt-3 flex flex-wrap gap-2">
              {cases.map((caseData, index) => <button key={caseData.id} type="button" onClick={() => setSelectedId(caseData.id)} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${selectedId === caseData.id ? "border-[#FF9933] bg-[#FF9933]/15" : "border-current/20"}`}>Case {index + 1}</button>)}
            </div>
          )}
          {cases.length > 0 ? <button type="button" onClick={removeEverything} className="mt-3 min-h-11 rounded-full border border-[#d93838] px-4 py-2 text-sm font-semibold text-[#b42318]">Delete everything</button> : null}
        </section>
        {currentCase ? (
          <section className="space-y-4 rounded-lg border border-current/15 p-4">
            {message ? <p role="status" className="text-sm text-[#b42318]">{message}</p> : null}
            {unsafeFields ? <p role="alert" className="rounded-lg bg-[#d93838]/10 p-3 text-sm font-semibold">{unsafeInputMessage}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Incident date/time (approximate allowed)<input aria-label="Incident date and time" type="datetime-local" value={currentCase.incidentDateTime} onChange={(event) => updateCase({ incidentDateTime: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-semibold">Type<select aria-label="Incident type" value={currentCase.type} onChange={(event) => updateCase({ type: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2">{caseTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="text-sm font-semibold">Amount lost<input aria-label="Amount lost" value={currentCase.amountLost} onChange={(event) => updateCase({ amountLost: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-semibold">Payment mode<input aria-label="Payment mode" value={currentCase.paymentMode} onChange={(event) => updateCase({ paymentMode: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-semibold">Your bank or wallet<input aria-label="Your bank or wallet" value={currentCase.bankWallet} onChange={(event) => updateCase({ bankWallet: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>
              <label className="text-sm font-semibold">Account last 4 digits only<input aria-label="Account last 4 digits" maxLength={4} value={currentCase.accountLast4} onChange={(event) => updateCase({ accountLast4: event.target.value.replace(/\D/g, "").slice(0, 4) })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>
              {(["suspectPhoneNumbers", "upiIds", "websitesApps", "socialProfiles", "namesUsed"] as const).map((field) => <label key={field} className="text-sm font-semibold">{field.replace(/([A-Z])/g, " $1")}<input aria-label={field} value={currentCase[field]} onChange={(event) => updateCase({ [field]: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border px-3 py-2" /></label>)}
            </div>
            <label className="block text-sm font-semibold">Free-text description<textarea aria-label="What happened" rows={4} value={currentCase.description} onChange={(event) => updateCase({ description: event.target.value })} className="mt-1 block w-full rounded-lg border px-3 py-2" /></label>
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">Timeline</h4><button type="button" onClick={addTimeline} className="min-h-11 rounded-full border px-4 py-2 font-semibold">Add timeline row</button></div>
              {currentCase.timeline.map((row) => <div key={row.id} className="mt-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                <input aria-label="Timeline date-time" type="datetime-local" value={row.dateTime} onChange={(event) => updateTimeline(row.id, { dateTime: event.target.value })} className="min-h-11 rounded border px-2" />
                <input aria-label="Timeline what happened" placeholder="What happened" value={row.whatHappened} onChange={(event) => updateTimeline(row.id, { whatHappened: event.target.value })} className="min-h-11 rounded border px-2" />
                <input aria-label="Timeline amount" placeholder="Amount" value={row.amount} onChange={(event) => updateTimeline(row.id, { amount: event.target.value })} className="min-h-11 rounded border px-2" />
                <input aria-label="Timeline transaction ID" placeholder="Transaction ID / UTR" value={row.transactionId} onChange={(event) => updateTimeline(row.id, { transactionId: event.target.value })} className="min-h-11 rounded border px-2" />
                <input aria-label="Timeline notes" placeholder="Notes" value={row.notes} onChange={(event) => updateTimeline(row.id, { notes: event.target.value })} className="min-h-11 rounded border px-2 sm:col-span-2" />
                <button type="button" onClick={() => updateCase({ timeline: currentCase.timeline.filter((item) => item.id !== row.id) })} className="min-h-11 justify-self-start rounded-full border border-[#d93838] px-4 py-2 text-sm font-semibold text-[#b42318]">Delete row</button>
              </div>)}
            </section>
            <section>
              <h4 className="font-bold">Evidence (up to 10 JPG, PNG or WebP images)</h4>
              <input aria-label="Attach evidence images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void attachEvidence(event.target.files)} className="mt-2 block min-h-11 max-w-full" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">{currentCase.evidence.map((item) => <div key={item.id} className="rounded border p-2"><img src={item.dataUrl} alt={item.caption || item.name} className="h-28 w-full object-contain" /><input aria-label={`Caption ${item.name}`} placeholder="Caption" value={item.caption} onChange={(event) => updateCase({ evidence: currentCase.evidence.map((image) => image.id === item.id ? { ...image, caption: event.target.value } : image) })} className="mt-2 min-h-11 w-full rounded border px-2" /></div>)}</div>
            </section>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void exportPdf()} className="min-h-11 rounded-full bg-[#FF9933] px-4 py-2 font-semibold text-white">Download PDF summary</button>
              <button type="button" onClick={exportText} className="min-h-11 rounded-full border px-4 py-2 font-semibold">Download text summary (.txt)</button>
              <button type="button" onClick={exportJson} className="min-h-11 rounded-full border px-4 py-2 font-semibold">Export backup (JSON, without images)</button>
              <button type="button" onClick={removeCase} className="min-h-11 rounded-full border border-[#d93838] px-4 py-2 font-semibold text-[#b42318]">Delete case</button>
            </div>
          </section>
        ) : null}
      </div>
    </details>
  );
}
