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

  useEffect(() => {
    const restoreCard = async () => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) return;
        try {
          setData({ ...initialData, ...(await decryptIceData(saved)) });
        } catch {
          // Read cards created before encryption so the next save can migrate them.
          setData({ ...initialData, ...(JSON.parse(saved) as Partial<IceData>) });
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
    </div>
  );
}
