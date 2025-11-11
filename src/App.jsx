function App() {
  const modules = [
    { id: 'appointments', title: 'Appointments', desc: 'Gestiona y programa citas', href: '/appointments/' },
    { id: 'doctors',      title: 'Doctors',      desc: 'Directorio y horarios de médicos', href: '/doctors/' },
    { id: 'patients',     title: 'Patients',     desc: 'Lista y detalles de pacientes', href: '/patients/' },
    { id: 'pharmacy',     title: 'Pharmacy',     desc: 'Gestión de medicamentos y recetas', href: '/pharmacy/' }
  ];

  return (
    <div className="container" data-theme="light">
      <a href="#main" className="skip-link">Saltar al contenido</a>

      <header>
        <div className="inner u-container">
          <h1>Portal Frontend</h1>
          <nav aria-label="Módulos">
            <a className="btn btn--secondary u-ring" href="#modules">Ir a módulos</a>
          </nav>
        </div>
      </header>

      <main id="main" className="u-container">
        <section className="section home-hero card card--hero" aria-labelledby="bienvenida">
          <h2 id="bienvenida" style={{marginTop:0}}>Bienvenido</h2>
          <p className="muted">Selecciona uno de los módulos para abrir su cliente correspondiente.</p>
        </section>

        <section id="modules" className="section" aria-label="Listado de módulos">
          <div className="modules-grid">
            {modules.map(m => (
              <article key={m.id} className="module-card card" aria-labelledby={`mod-${m.id}`} aria-describedby={`mod-desc-${m.id}`}>
                <div>
                  <h3 id={`mod-${m.id}`}>{m.title}</h3>
                  <p id={`mod-desc-${m.id}`} className="cell-sub">{m.desc}</p>
                </div>
                <div>
                  <a className="btn btn--primary u-ring" href={m.href} aria-label={`Abrir ${m.title}`}>Abrir</a>
                </div>
              </article>
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
