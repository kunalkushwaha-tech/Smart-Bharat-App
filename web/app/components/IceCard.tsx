"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type IceData = {
  bloodGroup: string;
  allergies: string;
  conditions: string;
  contactName: string;
  contactNumber: string;
};

const storageKey = "smart-bharat-ice-card";
const initialData: IceData = { bloodGroup: "", allergies: "", conditions: "", contactName: "", contactNumber: "" };
const appEncryptionKey = "bharat-app-ice-card-storage-v1";

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

async function getEncryptionKey() {
  // This static app key protects against plain-text localStorage exposure, not a determined extension that can inspect app code.
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(appEncryptionKey));
  return window.crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptIceData(data: IceData) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await getEncryptionKey(),
    new TextEncoder().encode(JSON.stringify(data)),
  );
  return `${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`;
}

async function decryptIceData(value: string) {
  const [encodedIv, encodedData] = value.split(".");
  if (!encodedIv || !encodedData) {
    throw new Error("Invalid encrypted ICE Card data.");
  }
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(encodedIv) },
    await getEncryptionKey(),
    fromBase64(encodedData),
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as Partial<IceData>;
}

export default function IceCard() {
  const [data, setData] = useState<IceData>(initialData);
  const [qrCode, setQrCode] = useState("");
  const [imageFields, setImageFields] = useState({
    bloodGroup: true,
    allergies: true,
    contactName: true,
    contactNumber: true,
    conditions: false,
  });
  const [imageSize, setImageSize] = useState<"1080x2400" | "1170x2532">("1080x2400");

  useEffect(() => {
    const restoreCard = async () => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) return;
        try {
          setData({ ...initialData, ...(await decryptIceData(saved)) });
        } catch {
          const legacyData = { ...initialData, ...(JSON.parse(saved) as Partial<IceData>) };
          setData(legacyData);
          window.localStorage.setItem(storageKey, await encryptIceData(legacyData));
        }
      } catch {
        // Ignore malformed local-only data and let the user create a fresh card.
      }
    };
    void restoreCard();
  }, []);

  const update = (field: keyof IceData, value: string) => setData((current) => ({ ...current, [field]: value }));
  const cardText = `ICE CARD\nBlood group: ${data.bloodGroup || "Not provided"}\nAllergies: ${data.allergies || "None provided"}\nMedical conditions: ${data.conditions || "None provided"}\nEmergency contact: ${data.contactName || "Not provided"} (${data.contactNumber || "Not provided"})`;

  async function saveCard() {
    window.localStorage.setItem(storageKey, await encryptIceData(data));
    setQrCode(await QRCode.toDataURL(cardText, { width: 240, margin: 2 }));
  }

  function downloadLockScreen() {
    const [width, height] = imageSize.split("x").map(Number);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#071426";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = `700 ${Math.round(width * 0.045)}px system-ui, sans-serif`;
    context.fillText("IN CASE OF EMERGENCY", width / 2, height * 0.42);
    const lines = [
      imageFields.bloodGroup && data.bloodGroup ? `Blood group: ${data.bloodGroup}` : "",
      imageFields.allergies && data.allergies ? `Allergies: ${data.allergies}` : "",
      imageFields.conditions && data.conditions ? `Medical conditions: ${data.conditions}` : "",
      imageFields.contactName && data.contactName ? `Contact: ${data.contactName}` : "",
      imageFields.contactNumber && data.contactNumber ? data.contactNumber : "",
    ].filter(Boolean);
    context.textAlign = "left";
    context.font = `600 ${Math.round(width * 0.032)}px system-ui, sans-serif`;
    const maxWidth = width * 0.82;
    let y = height * 0.5;
    lines.forEach((line) => {
      const words = line.split(/\s+/);
      let current = "";
      words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (context.measureText(next).width > maxWidth && current) {
          context.fillText(current, width * 0.09, y);
          y += width * 0.045;
          current = word;
        } else {
          current = next;
        }
      });
      if (current) {
        context.fillText(current, width * 0.09, y);
        y += width * 0.055;
      }
    });
    const link = document.createElement("a");
    link.download = `ice-lock-screen-${imageSize}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-[#122A4D] p-4">
      <h3 className="text-xl font-bold">ICE Card</h3>
      <p className="mt-1 text-sm opacity-80">Store essential emergency information offline and share it as a scannable QR code.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {([
          ["bloodGroup", "Blood group"],
          ["allergies", "Allergies"],
          ["conditions", "Medical conditions"],
          ["contactName", "Emergency contact name"],
          ["contactNumber", "Emergency contact number"],
        ] as const).map(([field, label]) => (
          <label key={field} className="text-sm">
            {label}
            <input value={data[field]} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded border border-white/15 bg-[#050B14] p-2" />
          </label>
        ))}
      </div>
      <button type="button" onClick={() => void saveCard()} className="mt-4 rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold">Save & Generate QR</button>
      {qrCode && <div className="mt-4 rounded bg-white p-3 sm:w-fit"><img src={qrCode} alt="QR code containing your ICE Card information" width={240} height={240} /></div>}
      <div className="mt-5 rounded-lg border border-amber-300/40 bg-amber-500/10 p-4 text-sm">
        <p className="font-semibold">Anyone who sees your lock screen can read this. Include only what you want a stranger or paramedic to see. Also set up your phone&apos;s built-in Emergency Info / Medical ID.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {([
            ["bloodGroup", "Blood group"],
            ["allergies", "Allergies"],
            ["contactName", "Emergency contact name"],
            ["contactNumber", "Contact number"],
            ["conditions", "Medical conditions"],
          ] as const).map(([field, label]) => (
            <label key={field} className="flex min-h-11 items-center gap-2">
              <input type="checkbox" checked={imageFields[field]} onChange={(event) => setImageFields((current) => ({ ...current, [field]: event.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
        <label className="mt-3 block">Image size
          <select value={imageSize} onChange={(event) => setImageSize(event.target.value as typeof imageSize)} className="ml-2 min-h-11 rounded border bg-[#050B14] px-2">
            <option value="1080x2400">1080 × 2400</option>
            <option value="1170x2532">1170 × 2532</option>
          </select>
        </label>
        <button type="button" onClick={downloadLockScreen} className="mt-4 min-h-11 rounded-full bg-[#FF9933] px-4 py-2 font-semibold">Download lock-screen image</button>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs"><li>Open your phone&apos;s Photos or Gallery app.</li><li>Choose the downloaded image and select Set as wallpaper.</li><li>Choose the lock screen and confirm.</li></ol>
      </div>
    </div>
  );
}
