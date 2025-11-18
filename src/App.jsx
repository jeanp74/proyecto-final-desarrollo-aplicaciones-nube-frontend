import { useAuthValidation } from './authUtils';

const Header = () => (
  <header>
    <div className="inner u-container">
      <h1>Portal Frontend</h1>
      <nav aria-label="Módulos">
        <a className="btn btn--secondary u-ring" href="#modules">Ir a módulos</a>
        <a className="btn btn--secondary u-ring" onClick={logout}>Salir</a>
      </nav>
    </div>
  </header>
);

function ModuleCard({ id, title, desc, href }){
  return (
    <article className="module-card card" aria-labelledby={`mod-${id}`} aria-describedby={`mod-desc-${id}`}>
      <div className="meta">
        <h3 id={`mod-${id}`}>{title}</h3>
        <p id={`mod-desc-${id}`} className="cell-sub">{desc}</p>
      </div>
      <div className="actions">
        <a className="btn btn--primary u-ring" href={href} aria-label={`Abrir ${title}`}>Abrir</a>
      </div>
    </article>
  );
}

function App() {
  // Handle authentication
  useAuthValidation();

  const { logout } = useAuthValidation();

  const modules = [
    { id: 'appointments', title: 'Citas', desc: 'Gestiona y programa citas', href: '/appointments/' },
    { id: 'doctors',      title: 'Médicos', desc: 'Directorio y horarios de médicos', href: '/doctors/' },
    { id: 'patients',     title: 'Pacientes', desc: 'Lista y detalles de pacientes', href: '/patients/' },
    { id: 'pharmacy',     title: 'Farmacia', desc: 'Gestión de medicamentos y recetas', href: '/pharmacy/' }
  ];

  return (
    <div className="container" data-theme="light">
      <a href="#main" className="skip-link">Saltar al contenido</a>

      <Header />

      <main id="main" className="u-container">
        <section className="section home-hero card card--hero" aria-labelledby="bienvenida">
          <h2 id="bienvenida" style={{marginTop:0}}>Bienvenido</h2>
          <p className="muted">Selecciona uno de los módulos para abrir su cliente correspondiente.</p>
        </section>

        <section id="modules" className="section" aria-label="Listado de módulos">
          <div className="modules-grid">
            {modules.map(m => (
              <ModuleCard key={m.id} {...m} />
            ))}
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
