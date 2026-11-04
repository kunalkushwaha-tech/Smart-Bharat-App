export const VAULT_DB_NAME = "bharat-fraud-evidence-vault";
export const VAULT_DB_VERSION = 1;
export const VAULT_STORE = "cases";
export const VAULT_CHECKLIST_KEY = "bharat-fraud-vault-checklist";

export type EvidenceImage = {
  id: string;
  name: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  dataUrl: string;
  caption: string;
};

export type TimelineRow = {
  id: string;
  dateTime: string;
  whatHappened: string;
  amount: string;
  transactionId: string;
  notes: string;
};

export type FraudCase = {
  id: string;
  incidentDateTime: string;
  type: string;
  amountLost: string;
  paymentMode: string;
  bankWallet: string;
  accountLast4: string;
  suspectPhoneNumbers: string;
  upiIds: string;
  websitesApps: string;
  socialProfiles: string;
  namesUsed: string;
  description: string;
  timeline: TimelineRow[];
  evidence: EvidenceImage[];
  updatedAt: string;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = indexedDB.open(VAULT_DB_NAME, VAULT_DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open local vault."));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(VAULT_STORE)) {
        database.createObjectStore(VAULT_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function listVaultCases(): Promise<FraudCase[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(VAULT_STORE, "readonly").objectStore(VAULT_STORE).getAll();
    request.onerror = () => reject(request.error ?? new Error("Could not read local vault."));
    request.onsuccess = () => {
      database.close();
      resolve((request.result as FraudCase[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    };
  });
}

export async function saveVaultCase(caseData: FraudCase): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(VAULT_STORE, "readwrite").objectStore(VAULT_STORE).put(caseData);
    request.onerror = () => reject(request.error ?? new Error("Could not save local vault case."));
    request.onsuccess = () => {
      database.close();
      resolve();
    };
  });
}

export async function deleteVaultCase(id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(VAULT_STORE, "readwrite").objectStore(VAULT_STORE).delete(id);
    request.onerror = () => reject(request.error ?? new Error("Could not delete local vault case."));
    request.onsuccess = () => {
      database.close();
      resolve();
    };
  });
}

export async function clearFraudEvidenceVault(): Promise<void> {
  if (typeof indexedDB !== "undefined") {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(VAULT_DB_NAME);
      request.onerror = () => reject(request.error ?? new Error("Could not clear local vault."));
      request.onsuccess = () => resolve();
      request.onblocked = () => resolve();
    });
  }
  if (typeof localStorage !== "undefined") localStorage.removeItem(VAULT_CHECKLIST_KEY);
}

export function readChecklist(): boolean[] {
  if (typeof localStorage === "undefined") return Array(8).fill(false);
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(VAULT_CHECKLIST_KEY) ?? "null");
    return Array.isArray(parsed) && parsed.length === 8 && parsed.every((value) => typeof value === "boolean")
      ? parsed
      : Array(8).fill(false);
  } catch {
    return Array(8).fill(false);
  }
}

export function writeChecklist(checklist: boolean[]): void {
  localStorage.setItem(VAULT_CHECKLIST_KEY, JSON.stringify(checklist));
}
