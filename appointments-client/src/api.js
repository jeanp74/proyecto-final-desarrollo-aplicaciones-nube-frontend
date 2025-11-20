// api.js

const APPOINTMENTS_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway
const APPOINTMENTS_PATH = "/api/appointments"; // Ruta dentro del gateway

// ---- Fetch helpers ----
export async function api(path, options = {}) {
  const url = `${APPOINTMENTS_API}${APPOINTMENTS_PATH}${path.startsWith("/") ? path : `/${path}`}`;
  const token = localStorage.getItem("access_token"); // Obtener token de login

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
export const APPOINTMENTS_BASE = APPOINTMENTS_API + APPOINTMENTS_PATH;
export const PATIENTS_BASE = import.meta.env.VITE_GATEWAY + "/api/patients";
export const DOCTORS_BASE = import.meta.env.VITE_GATEWAY + "/api/doctors";