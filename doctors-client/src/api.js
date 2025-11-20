// api.js

const DOCTORS_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway
const DOCTORS_PATH = "/api/doctors"; // Ruta dentro del gateway

// ---- Fetch helper ----
export async function api(path, options = {}) {
  const url = `${DOCTORS_API}${DOCTORS_PATH}${path.startsWith("/") ? path : `/${path}`}`;
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