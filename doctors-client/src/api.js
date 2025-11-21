// api.js

const DOCTORS_API = import.meta.env.VITE_GATEWAY; // Usamos el gateway

// ---- Fetch helper ----
export async function api(path, options = {}) {
  // ✅ Si path es vacío o "/" → usar "/doctors"
  const finalPath = path === "" || path === "/" ? "/doctors" : path;

  // ✅ Construir URL completa
  const url = `${DOCTORS_API}/api/doctors${finalPath.startsWith("/") ? finalPath : `/${finalPath}`}`;
  const token = localStorage.getItem("access_token");

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

  // ✅ Validar que sea un array **solo si es una operación de lectura**
  const isReadOperation = options.method === undefined || options.method === "GET";
  if (isReadOperation && (path.includes("/doctors") || path.includes("/patients") || path.includes("/appointments") || path.includes("/medicines"))) {
    if (!Array.isArray(data)) {
      console.error("Respuesta inesperada del servidor:", data);
      throw new Error("El servidor no devolvió una lista válida");
    }
  }

  return data;
}