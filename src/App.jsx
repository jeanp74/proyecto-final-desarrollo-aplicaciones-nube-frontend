import { useState, useEffect } from 'react';
import { useAuthValidation, logout, getAllowedModules } from "./authUtils";

const Header = ({ logout }) => (
  <header>
    <div className="inner u-container">
      <h1>Portal Frontend</h1>
      <nav aria-label="Módulos">
        <a className="btn btn--secondary u-ring" href="#modules">Ir a módulos</a>
        <button className="btn btn--secondary u-ring" onClick={logout}>
          Salir
        </button>
      </nav>
    </div>
  </header>
);

function ModuleCard({ id, title, desc, href }) {
  return (
    <article className="module-card card">
      <div className="meta">
        <h3>{title}</h3>
        <p className="cell-sub">{desc}</p>
      </div>
      <div className="actions">
        <a className="btn btn--primary u-ring" href={href}>Abrir</a>
      </div>
    </article>
  );
}

function App() {

  useAuthValidation();

  const MODULE_INFO = [
    { id: 'appointments', title: 'Citas', desc: 'Gestiona y programa citas', href: '/appointments/' },
    { id: 'doctors', title: 'Médicos', desc: 'Directorio y horarios de médicos', href: '/doctors/' },
    { id: 'patients', title: 'Pacientes', desc: 'Lista de pacientes', href: '/patients/' },
    { id: 'pharmacy', title: 'Farmacia', desc: 'Gestión de medicamentos', href: '/pharmacy/' }
  ];

  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function loadModules() {
      // console.log("Cargando módulos");
      const res = await getAllowedModules();
      // console.log("1");
      console.log(res);
      if (res && res.modules) {
        setModules(res.modules);
      }
    }
    loadModules();
  }, []);


  return (
    <div className="container" data-theme="light">
      <Header logout={logout} />

      <main className="u-container">
        <section className="section home-hero card card--hero">
          <h2 style={{ marginTop: 0 }}>Bienvenido</h2>
          <p className="muted">Selecciona un módulo para continuar.</p>
        </section>

        <section className="section">
          <div className="modules-grid">
            {modules.map(id => {
              const complete = MODULE_INFO.find(m => m.id === id);
              return <ModuleCard key={id} {...complete} />;
            })}
          </div>
        </section>
      </main>

      <footer className="u-container">
        <small>Proyecto final — Desarrollo de Aplicaciones en la Nube</small>
      </footer>
    </div>
  );
}

export default App;
