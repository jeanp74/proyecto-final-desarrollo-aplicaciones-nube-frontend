import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthValidation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;  
    }

    if (!localStorage.getItem('token')) {
      navigate("/login"); // <-- Router-friendly redirect
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return { logout };
};
