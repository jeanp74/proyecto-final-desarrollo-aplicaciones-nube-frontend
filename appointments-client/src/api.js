// api.js

const APPOINTMENTS_API = "https://appointments-proyecto-final-desarrollo-gafjenapfvb2e6da.brazilsouth-01.azurewebsites.net/";
const PATIENTS_API = "https://patients-proyecto-final-desarrollo-dvdpe0eegng6atfy.brazilsouth-01.azurewebsites.net/";
const DOCTORS_API = "https://doctors-proyecto-final-desarrollo-b7aqbdbpcgd0d7bq.brazilsouth-01.azurewebsites.net/";

// ---- Fetch helpers ----
export async function api(path, options = {}) {
  const url = `${APPOINTMENTS_API}${path.startsWith("/") ? path : `/${path}`}`;
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
export const APPOINTMENTS_BASE = APPOINTMENTS_API;
export const PATIENTS_BASE = PATIENTS_API;
export const DOCTORS_BASE = DOCTORS_API;