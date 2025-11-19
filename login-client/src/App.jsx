import { useState } from 'react';
import './styles.css';
import { loginRequest } from "./api";

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginRequest(email, password);
      console.log("Login correcto:", data);

      // Redirigir al portal principal
      const userString = encodeURIComponent(JSON.stringify(data.user));
      window.location.href =
        `https://front-proyecto-final-desarrollo-gabafbanbrdxc5gj.brazilsouth-01.azurewebsites.net/?access_token=${data.access_token}&refresh_token=${data.refresh_token}`;
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales inválidas. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bienvenido</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Contraseña</label>
              <a href="/forgot-password" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
        </div>
      </div>
    </div>
  );
}

export default App;