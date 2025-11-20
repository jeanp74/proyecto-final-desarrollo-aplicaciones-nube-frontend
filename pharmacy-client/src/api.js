// api.js

const PHARMACY_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway
const PHARMACY_PATH = "/api/pharmacy"; // Ruta dentro del gateway
const PATIENTS_PATH = "/api/patients";
const DOCTORS_PATH = "/api/doctors";

// ---- Fetch helpers ----
export async function api(path, options = {}) {
  const url = `${PHARMACY_API}${PHARMACY_PATH}${path.startsWith("/") ? path : `/${path}`}`;
  const token = localStorage.getItem("token"); // Obtener token de login

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
  const token = localStorage.getItem("token");

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
export const PATIENTS_BASE = PHARMACY_API + PATIENTS_PATH;
export const DOCTORS_BASE = PHARMACY_API + DOCTORS_PATH;