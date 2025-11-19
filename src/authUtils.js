import { useEffect } from "react";

const Gateway = import.meta.env.VITE_GATEWAY;
// console.log("URL Gateway: ", Gateway);

// Llama al backend para renovar el token
export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const resp = await fetch(`${Gateway}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    // console.log("Gateway: ", Gateway);
    // console.log("Refrescar token");

    const data = await resp.json();
    // console.log(data);
    if (!resp.ok) return null;

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data.access_token;
  } catch (err) {
    // console.log(err);
    return null;
  }
}

// Decodifica el token y retorna si está expirado
function isExpired(token) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

// Hook principal
export const useAuthValidation = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // console.log(params);
    const token = params.get("access_token");
    const refresh = params.get("refresh_token");
    // console.log(params.get("access_token"));
    // console.log(params.get("refresh_token"));

    // Guardar tokens si vienen por URL
    if (token && refresh) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refresh);
      
      // console.log(localStorage);
      // console.log("Tokens guardados");
      
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Si no hay tokens → login obligatorio
    if (!localStorage.getItem("access_token") || !localStorage.getItem("refresh_token")) {
      // console.log("No hay tokens");
      return redirectToLogin();
    }

    // Validar expiración del token
    const accessToken = localStorage.getItem("access_token");
    if (isExpired(accessToken)) {
      // console.log("Token expirado");
      refreshToken().then(newToken => {
        // console.log("Token renovado");
        if (!newToken) redirectToLogin();
      });
    }

  }, []);
};

export function redirectToLogin() {
  // console.log("Redirigiendo a login");
  // alert("Redirigiendo a login");
  localStorage.clear();
  window.location.replace(
    "https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/"
  );
}

export async function getAllowedModules() {
  const access = localStorage.getItem("access_token");
  // console.log("2");
  // console.log(access);
  if (!access) return null;

  try {
    const resp = await fetch(`${Gateway}/api/modules`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access}` 
      },
    });
    // console.log("3");
    // console.log(resp);

    if (!resp.ok) return null;

    const data = await resp.json();
    // console.log("4");
    // console.log(data);
    return data; // { role: "doctor", modules: ["appointments","pharmacy"] }
  } catch {
    return null;
  }
}

export const logout = () => redirectToLogin();
