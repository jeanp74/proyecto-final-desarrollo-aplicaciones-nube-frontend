import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthValidation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    // const user = urlParams.get('user');

    if (token) {
      // If token and user are in URL, save to localStorage and clean URL
      localStorage.setItem('token', token);      
      // Clean the URL without page reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (!localStorage.getItem('token')) {
      // If no token or user in localStorage, redirect to login
      window.location.href = 'https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/';
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = 'https://front-proyecto-final-desarrollo2-c5bscwbwebfafvfj.brazilsouth-01.azurewebsites.net/';
  };

  return { logout };
};
