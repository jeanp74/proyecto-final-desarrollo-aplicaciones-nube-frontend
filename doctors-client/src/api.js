// api.js

const DOCTORS_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway
const DOCTORS_PATH = "/api/doctors"; // Ruta dentro del gateway

// ---- Fetch helper ----
export async function api(path, options = {}) {
  const url = `${DOCTORS_API}${DOCTORS_PATH}${path.startsWith("/") ? path : `/${path}`}`;
  const token = localStorage.getItem("token");

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const raw = await resp.text(); // Obtener como texto

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("La respuesta no es JSON válido");
  }

  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${typeof data === 'string' ? data : data?.detail || JSON.stringify(data)}`);

  // ✅ Validar que sea un array si esperas uno
  if (path.includes("/doctors") || path.includes("/patients") || path.includes("/appointments") || path.includes("/medicines")) {
    if (!Array.isArray(data)) {
      console.error("Respuesta inesperada del servidor:", data);
      throw new Error("El servidor no devolvió una lista válida");
    }
  }

  return data;
}