"use client";

import { useState } from "react";

type CyberAwarenessCertificateProps = {
  score: number;
  total: number;
  onRestart: () => void;
};

type BadgeTier = {
  icon: string;
  title: string;
  description: string;
  className: string;
};

function getBadgeTier(score: number, total: number): BadgeTier {
  const percentage = (score / total) * 100;
  if (percentage >= 80) {
    return {
      icon: "🛡️",
      title: "Cyber Aware Citizen",
      description: "Excellent cyber safety awareness!",
      className: "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#FFE9a3]",
    };
  }
  if (percentage >= 50) {
    return {
      icon: "📘",
      title: "Cyber Learner",
      description: "Good progress - keep building safe habits.",
      className: "border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#bae6fd]",
    };
  }
  return {
    icon: "🌱",
    title: "Getting Started",
    description: "Every safe choice is a step forward. Keep learning!",
    className: "border-[#86efac]/60 bg-[#86efac]/15 text-[#dcfce7]",
  };
}

function drawCertificate(name: string, score: number, total: number, badge: BadgeTier) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Certificate canvas is not available.");
  }

  context.fillStyle = "#050B14";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#FF9933";
  context.lineWidth = 18;
  context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  context.strokeStyle = "#D4AF37";
  context.lineWidth = 2;
  context.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

  context.textAlign = "center";
  context.fillStyle = "#FF9933";
  context.font = "bold 42px Arial";
  context.fillText("BHARAT APP", canvas.width / 2, 170);
  context.fillStyle = "#ECF2FA";
  context.font = "bold 78px Georgia";
  context.fillText("Certificate of Completion", canvas.width / 2, 300);
  context.fillStyle = "#C8D5EA";
  context.font = "32px Arial";
  context.fillText("Bharat App — Cyber Awareness Academy", canvas.width / 2, 375);
  context.fillStyle = "#FF9933";
  context.font = "bold 64px Georgia";
  context.fillText(name, canvas.width / 2, 535);
  context.fillStyle = "#ECF2FA";
  context.font = "bold 34px Arial";
  context.fillText(`Scored ${score}/${total}`, canvas.width / 2, 625);
  context.fillStyle = "#D4AF37";
  context.font = "bold 36px Arial";
  context.fillText(`${badge.icon} ${badge.title}`, canvas.width / 2, 710);
  context.fillStyle = "#C8D5EA";
  context.font = "28px Arial";
  context.fillText(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), canvas.width / 2, 820);
  context.fillStyle = "#128807";
  context.fillRect(540, 875, 520, 8);

  return canvas;
}

export default function CyberAwarenessCertificate({ score, total, onRestart }: CyberAwarenessCertificateProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const badge = getBadgeTier(score, total);

  function downloadCertificate() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name to create the certificate.");
      return;
    }
    setError(null);
    const canvas = drawCertificate(trimmedName, score, total, badge);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Unable to create the certificate image. Please try again.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bharat-app-cyber-awareness-certificate.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return (
    <div className="mt-5 rounded-xl border border-white/15 bg-[#050B14] p-4">
      <div className={`rounded-xl border p-4 ${badge.className}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-3xl" aria-hidden="true">{badge.icon}</p>
            <h3 className="mt-1 text-xl font-bold">{badge.title}</h3>
            <p className="mt-1 text-sm">{badge.description}</p>
          </div>
          <p className="text-3xl font-extrabold">{score}/{total}<span className="ml-1 text-base font-semibold">score</span></p>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="certificate-name" className="block text-sm font-semibold">Name on certificate</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input id="certificate-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-[#0A1424] px-3 py-2 text-[#ECF2FA]" />
          <button type="button" onClick={downloadCertificate} className="rounded-lg bg-[#FF9933] px-4 py-2 font-semibold text-white hover:bg-[#e58621]">Download Certificate</button>
        </div>
        {error ? <p className="mt-2 text-sm text-[#ffb0b0]" role="alert">{error}</p> : null}
      </div>
      <button type="button" onClick={onRestart} className="mt-4 rounded-full bg-[#122A4D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173963]">Try Quiz Again</button>
    </div>
  );
}
