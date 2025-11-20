// api.js

const PHARMACY_API = import.meta.env.VITE_PHARMACY_API;
const PATIENTS_API = import.meta.env.VITE_PATIENTS_API;
const DOCTORS_API = import.meta.env.VITE_DOCTORS_API;

// ---- Fetch helpers ----
export async function api(path, options = {}) {
  const url = `${PHARMACY_API}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = resp.headers.get("content-type")?.includes("application/json")
    ? await resp.json()
    : await resp.text();
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${typeof data === 'string' ? data : data?.detail || JSON.stringify(data)}`);
  return data;
}

export async function extGet(base, path) {
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  const data = resp.headers.get("content-type")?.includes("application/json")
    ? await resp.json()
    : await resp.text();
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${typeof data === 'string' ? data : data?.detail || JSON.stringify(data)}`);
  return data;
}

// URLs base exportadas
export const PHARMACY_BASE = PHARMACY_API;
export const PATIENTS_BASE = PATIENTS_API;
export const DOCTORS_BASE = DOCTORS_API;