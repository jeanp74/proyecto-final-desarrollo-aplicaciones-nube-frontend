// api.js

const PHARMACY_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway
const PHARMACY_PATH = "/api/pharmacy"; // Ruta dentro del gateway

// ---- Fetch helpers ----
export async function api(path, options = {}) {
  // ✅ Ajustar para que no duplique "pharmacy"
  const finalPath = path.startsWith("/pharmacy") ? path : `/pharmacy${path.startsWith("/") ? path : `/${path}`}`;
  const url = `${PHARMACY_API}${PHARMACY_PATH}${finalPath}`;
  const token = localStorage.getItem("access_token");

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
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
  const token = localStorage.getItem("access_token");

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = resp.headers.get("content-type")?.includes("application/json")
    ? await resp.json()
    : await resp.text();
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${typeof data === 'string' ? data : data?.detail || JSON.stringify(data)}`);
  return data;
}

// URLs base exportadas
export const PHARMACY_BASE = PHARMACY_API + PHARMACY_PATH;
export const PATIENTS_BASE = PHARMACY_API + "/api/patients";
export const DOCTORS_BASE = PHARMACY_API + "/api/doctors";