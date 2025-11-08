// login-frontend/src/api.js

// === Claves en localStorage ===
const LOGIN_KEY = "login_react_api_base";

// === Defaults (sobrescribibles por .env Vite) ===
const LOGIN_DEFAULT =
  import.meta.env.VITE_API_LOGIN_BASE || process.env.VITE_API_LOGIN_BASE ||
  "https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/";

// === Utils ===
function joinUrl(base, path) {
  const b = (base || "/").replace(/\/+$/, "");
  const p = path?.startsWith("/") ? path : `/${path || ""}`;
  return `${b}${p}`;
}

// === Login API base ===
export function getApiBase() {
  return localStorage.getItem(LOGIN_KEY) || LOGIN_DEFAULT;
}
export function setApiBase(v) {
  localStorage.setItem(LOGIN_KEY, v);
}

// === Pacientes / Doctores API base ===
export function getPatientsBase() {
  return localStorage.getItem(PATIENTS_KEY) || PATIENTS_DEFAULT;
}
export function setPatientsBase(v) {
  localStorage.setItem(PATIENTS_KEY, v);
}
export function getDoctorsBase() {
  return localStorage.getItem(DOCTORS_KEY) || DOCTORS_DEFAULT;
}
export function setDoctorsBase(v) {
  localStorage.setItem(DOCTORS_KEY, v);
}

// === Helper de fetch para Pharmacy ===
export async function api(path, options = {}) {
  const url = joinUrl(getApiBase(), path);
  const resp = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const ct = resp.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail =
      typeof data === "string" ? data : data?.detail || data?.error || JSON.stringify(data);
    throw new Error(`HTTP ${resp.status}: ${detail}`);
  }
  return data;
}

// === Helper de fetch para bases externas (Pacientes/Doctores) ===
export async function extGet(base, path) {
  const url = joinUrl(base, path);
  const resp = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const ct = resp.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail =
      typeof data === "string" ? data : data?.detail || data?.error || JSON.stringify(data);
    throw new Error(`HTTP ${resp.status}: ${detail}`);
  }
  return data;
}
