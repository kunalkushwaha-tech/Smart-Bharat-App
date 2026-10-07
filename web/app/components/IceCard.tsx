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

export default function IceCard() {
  const [data, setData] = useState<IceData>(initialData);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setData({ ...initialData, ...JSON.parse(saved) });
    } catch {
      // Ignore malformed local-only data and let the user create a fresh card.
    }
  }, []);

  const update = (field: keyof IceData, value: string) => setData((current) => ({ ...current, [field]: value }));
  const cardText = `ICE CARD\nBlood group: ${data.bloodGroup || "Not provided"}\nAllergies: ${data.allergies || "None provided"}\nMedical conditions: ${data.conditions || "None provided"}\nEmergency contact: ${data.contactName || "Not provided"} (${data.contactNumber || "Not provided"})`;

  async function saveCard() {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
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
