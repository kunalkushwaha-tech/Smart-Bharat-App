"use client";

import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useState } from "react";

type CyberAwarenessCertificateProps = {
  score: number;
  total: number;
  isDistinction?: boolean;
  answers: Record<string, string>;
};

const namePattern = /^[\p{L} .'-]{2,40}$/u;

function drawEmblem(context: CanvasRenderingContext2D, x: number, y: number) {
  context.save();
  context.translate(x, y);
  context.fillStyle = "#D4AF37";
  context.strokeStyle = "#FF9933";
  context.lineWidth = 5;
  context.beginPath();
  context.arc(0, 0, 62, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#050B14";
  context.beginPath();
  context.moveTo(0, -34);
  for (let point = 1; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const radius = point % 2 === 0 ? 34 : 15;
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  context.closePath();
  context.fill();
  context.font = "bold 12px Arial";
  context.textAlign = "center";
  context.fillText("BHARAT APP", 0, 58);
  context.restore();
}

async function drawCertificate(name: string, score: number, total: number, certificateId: string, isDistinction: boolean, issuedDate: string) {
  const verificationUrl = `https://www.smartbharat.me/verify?id=${encodeURIComponent(certificateId)}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 140, margin: 1 });
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Certificate canvas is not available.");
  const accent = isDistinction ? "#D4AF37" : score >= 7 ? "#38bdf8" : "#86efac";
  context.fillStyle = "#050B14";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = accent;
  context.lineWidth = 18;
  context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  context.strokeStyle = "#FF9933";
  context.lineWidth = 2;
  context.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);
  context.textAlign = "center";
  context.fillStyle = "#FF9933";
  context.font = "bold 42px Arial";
  context.fillText("BHARAT APP", 800, 150);
  drawEmblem(context, 1390, 140);
  context.fillStyle = "#ECF2FA";
  context.font = "bold 72px Georgia";
  context.fillText("Certificate of Completion", 800, 275);
  context.fillStyle = "#C8D5EA";
  context.font = "30px Arial";
  context.fillText("Bharat App — Cyber Awareness Academy", 800, 345);
  if (isDistinction) {
    context.fillStyle = "#D4AF37";
    context.beginPath();
    context.moveTo(1190, 390); context.lineTo(1510, 390); context.lineTo(1450, 470); context.lineTo(1250, 470); context.closePath(); context.fill();
    context.fillStyle = "#050B14";
    context.font = "bold 28px Arial";
    context.fillText("DISTINCTION", 1350, 438);
  }
  context.fillStyle = accent;
  let nameFontSize = 64;
  while (nameFontSize > 32) {
    context.font = `bold ${nameFontSize}px Arial`;
    if (context.measureText(name).width <= 1050) break;
    nameFontSize -= 2;
  }
  context.fillText(name, 800, 515);
  context.fillStyle = "#ECF2FA";
  context.font = "bold 34px Arial";
  const percentage = Math.round((score / total) * 100);
  context.fillText(`Scored ${score}/${total} (${percentage}%)`, 800, 590);
  context.fillStyle = "#C8D5EA";
  context.font = "23px Arial";
  context.fillText("Topics covered: Emergency & Helplines • Fraud & Payments • Online Safety • Government Schemes", 800, 650);
  context.fillText(new Date(`${issuedDate}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), 390, 815);
  context.strokeStyle = "#C8D5EA";
  context.lineWidth = 2;
  context.beginPath(); context.moveTo(1080, 785); context.lineTo(1460, 785); context.stroke();
  context.fillStyle = "#FF9933";
  context.font = "italic 58px 'Brush Script MT', 'Segoe Script', cursive";
  context.fillText("Kunal Kushwaha", 1270, 850);
  context.fillStyle = "#C8D5EA";
  context.font = "22px Arial";
  context.fillText("Founder, Bharat App", 1270, 895);
  const qrImage = new Image();
  qrImage.src = qrDataUrl;
  await new Promise<void>((resolve, reject) => { qrImage.onload = () => resolve(); qrImage.onerror = () => reject(new Error("Certificate QR code could not be loaded.")); });
  context.drawImage(qrImage, 110, 775, 140, 140);
  context.textAlign = "left";
  context.fillStyle = accent;
  context.font = "bold 20px Arial";
  context.fillText(`Certificate ID: ${certificateId}`, 300, 860);
  context.fillStyle = "#C8D5EA";
  context.font = "20px Arial";
  context.fillText("Verify at smartbharat.me/verify", 300, 895);
  return canvas;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CyberAwarenessCertificate({ score, total, isDistinction = false, answers }: CyberAwarenessCertificateProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [certificateIssuedDate, setCertificateIssuedDate] = useState<string | null>(null);

  async function getCertificate() {
    if (certificateId) {
      return {
        certificateId,
        issuedDate: certificateIssuedDate ?? new Date().toISOString().slice(0, 10),
      };
    }
    const response = await fetch("/api/certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      }),
    });
    const data = (await response.json()) as { certificateId?: string; issuedDate?: string; error?: string };
    if (!response.ok || !data.certificateId) {
      throw new Error(data.error ?? "Unable to issue the certificate.");
    }
    setCertificateId(data.certificateId);
    const issuedDate = data.issuedDate ?? (data.certificateId.split("-").at(-1)?.length === 8
      ? `${data.certificateId.split("-").at(-1)?.slice(0, 4)}-${data.certificateId.split("-").at(-1)?.slice(4, 6)}-${data.certificateId.split("-").at(-1)?.slice(6)}`
      : new Date().toISOString().slice(0, 10));
    setCertificateIssuedDate(issuedDate);
    return {
      certificateId: data.certificateId,
      issuedDate,
    };
  }

  async function createCanvas() {
    const trimmedName = name.trim();
    if (!namePattern.test(trimmedName)) {
      setError("Enter a name of 2-40 characters using letters, spaces, periods, apostrophes, or hyphens.");
      return null;
    }
    setError(null);
    const certificate = await getCertificate();
    return drawCertificate(trimmedName, score, total, certificateId ?? certificate.certificateId, isDistinction, certificate.issuedDate);
  }

  async function downloadPng() {
    try {
      const canvas = await createCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Unable to create the certificate image.");
      downloadBlob(blob, "bharat-app-cyber-awareness-certificate.png");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to create the certificate image.");
    }
  }

  async function downloadPdf() {
    try {
      const canvas = await createCanvas();
      if (!canvas) return;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 210);
      pdf.save("bharat-app-cyber-awareness-certificate.pdf");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to create the certificate PDF.");
    }
  }

  function addToLinkedIn() {
    if (!certificateId) return;
    const issued = new Date();
    const verificationUrl = `https://www.smartbharat.me/verify?id=${encodeURIComponent(certificateId)}`;
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: "Cyber Awareness Academy Certificate",
      organizationName: "Bharat App",
      issueYear: String(issued.getFullYear()),
      issueMonth: String(issued.getMonth() + 1),
      certUrl: verificationUrl,
      certId: certificateId,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-5 rounded-xl border border-white/15 bg-[#050B14] p-4">
      <div className={`rounded-xl border p-4 ${isDistinction ? "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#FFE9a3]" : "border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#bae6fd]"}`}>
        <h3 className="text-xl font-bold">{isDistinction ? "Cyber Aware Citizen — Distinction" : "Cyber Aware Citizen"}</h3>
        <p className="mt-1">{score}/{total} score</p>
      </div>
      <label htmlFor="certificate-name" className="mt-4 block text-sm font-semibold">Name on certificate</label>
      <input id="certificate-name" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" className="mt-2 w-full rounded-lg border border-white/20 bg-[#0A1424] px-3 py-2 text-[#ECF2FA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={downloadPng} className="rounded-lg bg-[#FF9933] px-4 py-2 font-semibold text-white">Download PNG</button>
        <button type="button" onClick={downloadPdf} className="rounded-lg bg-[#122A4D] px-4 py-2 font-semibold text-white">Download PDF</button>
        <button type="button" onClick={addToLinkedIn} className="rounded-lg border border-[#38bdf8] px-4 py-2 font-semibold text-[#bae6fd]">Add to LinkedIn</button>
      </div>
      {error ? <p className="mt-2 text-sm text-[#ffb0b0]" role="alert">{error}</p> : null}
      <p className="mt-3 text-xs opacity-70">Your name is used only in the downloaded certificate and is not stored or sent anywhere.</p>
    </div>
  );
}
