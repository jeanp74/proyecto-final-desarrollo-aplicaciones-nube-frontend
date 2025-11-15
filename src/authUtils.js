import { useEffect } from 'react';

export const useAuthValidation = () => {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Guardar token
      localStorage.setItem('token', token);

      // Limpiar URL sin hacer refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      return;  
    }

    // Si NO hay token en URL NI en localStorage -> redirigir al login
    if (!localStorage.getItem('token')) {
      window.location.replace(
        "https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/"
      );
    }

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.replace(
      "https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/"
    );
  };

  return { logout };
};
