export type CyberHygieneResults = {
  password?: {
    entropy: number;
    checked: boolean;
  };
  breach?: {
    found: boolean;
    checked: boolean;
  };
  url?: {
    flags: number;
    threatFound: boolean;
    checked: boolean;
  };
  file?: {
    verified: boolean;
    match: boolean;
    checked: boolean;
  };
};

export const CYBER_HYGIENE_STORAGE_KEY = "smart-bharat-cyber-hygiene-results";
export const CYBER_HYGIENE_EVENT = "smart-bharat-cyber-hygiene-updated";

const emptyResults: CyberHygieneResults = {};

export function readCyberHygieneResults(): CyberHygieneResults {
  if (typeof window === "undefined") return emptyResults;

  try {
    const stored = window.localStorage.getItem(CYBER_HYGIENE_STORAGE_KEY);
    return stored ? { ...emptyResults, ...JSON.parse(stored) } : emptyResults;
  } catch {
    return emptyResults;
  }
}

export function updateCyberHygieneResults(
  update: Partial<CyberHygieneResults>,
) {
  if (typeof window === "undefined") return;

  const next = { ...readCyberHygieneResults(), ...update };
  window.localStorage.setItem(CYBER_HYGIENE_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CYBER_HYGIENE_EVENT));
}
