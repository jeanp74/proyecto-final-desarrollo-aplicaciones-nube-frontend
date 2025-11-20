// api.js

const PATIENTS_API = import.meta.env.VITE_PATIENTS_API;

// ---- Fetch helper ----
export async function api(path, options = {}) {
  const url = `${PATIENTS_API}${path.startsWith("/") ? path : `/${path}`}`;
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
