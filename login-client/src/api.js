// login-frontend/src/api.js

const LOGIN_KEY = "login_react_api_base";

const Gateway = import.meta.env.VITE_GATEWAY; // URL de tu gateway en Azure

function joinUrl(base, path) {
  const b = (base || "/").replace(/\/+$/, "");
  const p = path?.startsWith("/") ? path : `/${path || ""}`;
  return `${b}${p}`;
}

export function getApiBase() {
  return localStorage.getItem(LOGIN_KEY) || Gateway;
}

export function setApiBase(v) {
  localStorage.setItem(LOGIN_KEY, v);
}

// 🔑 Login al gateway
export async function loginRequest(email, password) {
  const url = joinUrl(getApiBase(), "/auth/login");
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || "Error al iniciar sesión");
  return data;
}

// Helper general
export async function api(path, options = {}) {
  const url = joinUrl(getApiBase(), path);
  const token = localStorage.getItem("token");

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || data?.message || "Error en la solicitud");
  return data;
}
