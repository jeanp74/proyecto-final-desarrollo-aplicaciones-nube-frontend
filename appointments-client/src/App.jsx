import { useEffect, useMemo, useState } from "react";
import { api, extGet, APPOINTMENTS_BASE, PATIENTS_BASE, DOCTORS_BASE } from "./api";

// ===== Helpers de fecha =====
const isoToLocalInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
const localInputToIso = (s) => s ? new Date(s).toISOString() : null;
const fmtDateTime = (iso) => iso ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "";

// ===== Hook de citas =====
function useAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/appointments");
      setItems(data);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload) => {
    const a = await api("/appointments", { method: "POST", body: JSON.stringify(payload) });
    setItems((prev) => [...prev, a].sort((x, y) => new Date(x.inicio) - new Date(y.inicio)));
  };

  const update = async (id, payload) => {
    const a = await api(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    setItems((prev) => prev.map((x) => (x.id === id ? a : x)).sort((x, y) => new Date(x.inicio) - new Date(y.inicio)));
  };

  const remove = async (id) => {
    await api(`/appointments/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return { items, loading, load, create, update, remove };
}

// ===== Hook de catálogos (pacientes/médicos) =====
function useCatalog(base, path) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await extGet(base, path);
      const mapped = (data || []).map((x) => ({
        id: x.id,
        nombre: x.nombre_completo || x.name || "",
        correo: x.correo || x.email || "",
        especialidad: x.especialidad || "",
      }));
      setItems(mapped);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, load };
}

function labelPaciente(p) {
  return [p.id, p.nombre, p.correo ? `(${p.correo})` : ""].filter(Boolean).join(" — ");
}
function labelMedico(d) {
  return [d.id, d.nombre, d.especialidad ? `(${d.especialidad})` : ""].filter(Boolean).join(" — ");
}

// ===== Fila editable =====
function Row({ item, onUpdate, onDelete, patientMap, doctorMap }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    paciente_id: item.paciente_id,
    medico_id: item.medico_id,
    inicio: isoToLocalInput(item.inicio),
    fin: isoToLocalInput(item.fin),
    motivo: item.motivo || "",
    estado: item.estado || "programada",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      paciente_id: item.paciente_id,
      medico_id: item.medico_id,
      inicio: isoToLocalInput(item.inicio),
      fin: isoToLocalInput(item.fin),
      motivo: item.motivo || "",
      estado: item.estado || "programada",
    });
  }, [item]);

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSave = async () => {
    const f = {
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      inicio: localInputToIso(form.inicio),
      fin: localInputToIso(form.fin),
      motivo: form.motivo.trim() || null,
      estado: form.estado || "programada",
    };
    const e = {};
    if (!f.paciente_id) e.paciente_id = "Requerido";
    if (!f.medico_id) e.medico_id = "Requerido";
    if (!f.inicio) e.inicio = "Requerido";
    if (!f.fin) e.fin = "Requerido";
    if (!e.inicio && !e.fin && new Date(f.fin) <= new Date(f.inicio)) e.fin = "Debe ser > inicio";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await onUpdate(item.id, f);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const p = patientMap.get(item.paciente_id);
  const d = doctorMap.get(item.medico_id);

  return (
    <tr>
      <td className="mono">{item.id}</td>
      <td>
        <div className="cell-title">{p?.nombre || `Paciente #${item.paciente_id}`}</div>
        <div className="cell-sub">{p?.correo || ""}</div>
      </td>
      <td>
        <div className="cell-title">{d?.nombre || `Médico #${item.medico_id}`}</div>
        <div className="cell-sub">{d?.especialidad || ""}</div>
      </td>
      <td>{editing ? <input className="row-edit-input" type="datetime-local" value={form.inicio} onChange={set("inicio")} aria-invalid={!!errors.inicio}/> : fmtDateTime(item.inicio)}</td>
      <td>{editing ? <input className="row-edit-input" type="datetime-local" value={form.fin} onChange={set("fin")} aria-invalid={!!errors.fin}/> : fmtDateTime(item.fin)}</td>
      <td>{editing ? <input className="row-edit-input" value={form.motivo} onChange={set("motivo")}/> : (item.motivo || "—")}</td>
      <td>
        {editing ? (
          <div className="pretty-select compact">
            <select className="row-edit-input" value={form.estado} onChange={set("estado")}>
              <option value="programada">programada</option>
              <option value="reprogramada">reprogramada</option>
              <option value="cancelada">cancelada</option>
              <option value="hecha">hecha</option>
            </select>
          </div>
        ) : (
          <span className={`badge ${item.estado}`}>{item.estado}</span>
        )}
      </td>
      <td className="row-actions">
        {editing ? (
          <>
            <button onClick={onSave} disabled={saving}>Guardar</button>
            <button className="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
          </>
        ) : (
          <>
            <button className="secondary" onClick={() => setEditing(true)}>Editar</button>
            <button className="danger" onClick={() => onDelete(item.id)}>Eliminar</button>
          </>
        )}
      </td>
    </tr>
  );
}

// ===== App principal =====
export default function App() {
  const { items, loading, load, create, update, remove } = useAppointments();
  const patients = useCatalog(PATIENTS_BASE, "/patients");
  const doctors = useCatalog(DOCTORS_BASE, "/doctors");

  useEffect(() => { load(); }, []);
  useEffect(() => { patients.load(); }, []);
  useEffect(() => { doctors.load(); }, []);

  const patientMap = useMemo(() => new Map(patients.items.map(p => [p.id, p])), [patients.items]);
  const doctorMap = useMemo(() => new Map(doctors.items.map(d => [d.id, d])), [doctors.items]);

  const [query, setQuery] = useState({ paciente_id: "", medico_id: "", estado: "", from: "", to: "" });
  const [deb, setDeb] = useState(query);
  useEffect(() => { const t = setTimeout(() => setDeb(query), 250); return () => clearTimeout(t); }, [query]);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      const matchPac = !deb.paciente_id || String(x.paciente_id) === deb.paciente_id.trim();
      const matchMed = !deb.medico_id || String(x.medico_id) === deb.medico_id.trim();
      const matchEstado = !deb.estado || String(x.estado || "").toLowerCase() === deb.estado.trim().toLowerCase();
      const matchFrom = !deb.from || new Date(x.inicio) >= new Date(deb.from);
      const matchTo = !deb.to || new Date(x.inicio) < new Date(deb.to);
      return matchPac && matchMed && matchEstado && matchFrom && matchTo;
    });
  }, [items, deb]);

  const [form, setForm] = useState({
    paciente_id: "", medico_id: "", inicio: "", fin: "", motivo: "", estado: "programada",
  });
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const setF = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onCreate = async (e) => {
    e.preventDefault();
    const payload = {
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      inicio: localInputToIso(form.inicio),
      fin: localInputToIso(form.fin),
      motivo: form.motivo.trim() || null,
      estado: form.estado || "programada",
    };
    const er = {};
    if (!payload.paciente_id) er.paciente_id = "Requerido";
    if (!payload.medico_id) er.medico_id = "Requerido";
    if (!payload.inicio) er.inicio = "Requerido";
    if (!payload.fin) er.fin = "Requerido";
    if (!er.inicio && !er.fin && new Date(payload.fin) <= new Date(payload.inicio)) er.fin = "Debe ser > inicio";
    setErrors(er);
    if (Object.keys(er).length) return;

    setCreating(true);
    try {
      await create(payload);
      setForm({ paciente_id: "", medico_id: "", inicio: "", fin: "", motivo: "", estado: "programada" });
      alert("Cita creada");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm(`Eliminar cita #${id}?`)) return;
    try { await remove(id); } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="container">
      <header>
        <h1>Citas</h1>
      </header>

      <main>
        {/* Programar nueva cita */}
        <section className="card">
          <h2>Programar cita</h2>
          <form onSubmit={onCreate} className="grid-form">
            <div className="form-row">
              <label>Paciente</label>
              <div className="pretty-select">
                <select value={form.paciente_id} onChange={setF("paciente_id")} aria-invalid={!!errors.paciente_id}>
                  <option value="">{patients.loading ? "Cargando..." : "Seleccione un paciente"}</option>
                  {patients.items.map((p) => <option key={p.id} value={p.id}>{labelPaciente(p)}</option>)}
                </select>
              </div>
              {errors.paciente_id && <small className="field-error">{errors.paciente_id}</small>}
            </div>

            <div className="form-row">
              <label>Médico</label>
              <div className="pretty-select">
                <select value={form.medico_id} onChange={setF("medico_id")} aria-invalid={!!errors.medico_id}>
                  <option value="">{doctors.loading ? "Cargando..." : "Seleccione un médico"}</option>
                  {doctors.items.map((d) => <option key={d.id} value={d.id}>{labelMedico(d)}</option>)}
                </select>
              </div>
              {errors.medico_id && <small className="field-error">{errors.medico_id}</small>}
            </div>

            <div className="form-row">
              <label>Inicio</label>
              <input type="datetime-local" value={form.inicio} onChange={setF("inicio")} aria-invalid={!!errors.inicio} />
              {errors.inicio && <small className="field-error">{errors.inicio}</small>}
            </div>

            <div className="form-row">
              <label>Fin</label>
              <input type="datetime-local" value={form.fin} onChange={setF("fin")} aria-invalid={!!errors.fin} />
              {errors.fin && <small className="field-error">{errors.fin}</small>}
            </div>

            <div className="form-row">
              <label>Motivo</label>
              <input value={form.motivo} onChange={setF("motivo")} />
            </div>

            <div className="form-row">
              <label>Estado</label>
              <div className="pretty-select">
                <select value={form.estado} onChange={setF("estado")}>
                  <option value="programada">programada</option>
                  <option value="reprogramada">reprogramada</option>
                  <option value="cancelada">cancelada</option>
                  <option value="hecha">hecha</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={creating}>{creating ? "Creando..." : "Crear"}</button>
          </form>
        </section>

        {/* Listado */}
        <section className="card">
          <div className="list-header">
            <h2>Listado</h2>
            <div className="right">
              <small>Registros: {filtered.length}</small>
              <button onClick={load} disabled={loading}>{loading ? "Cargando..." : "Actualizar"}</button>
            </div>
          </div>

          <div className="list-tools">
            <div className="pretty-select">
              <select className="search-input" value={query.paciente_id} onChange={(e) => setQuery((s) => ({ ...s, paciente_id: e.target.value }))}>
                <option value="">(Paciente)</option>
                {patients.items.map((p) => <option key={p.id} value={p.id}>{labelPaciente(p)}</option>)}
              </select>
            </div>

            <div className="pretty-select">
              <select className="search-input" value={query.medico_id} onChange={(e) => setQuery((s) => ({ ...s, medico_id: e.target.value }))}>
                <option value="">(Médico)</option>
                {doctors.items.map((d) => <option key={d.id} value={d.id}>{labelMedico(d)}</option>)}
              </select>
            </div>

            <div className="pretty-select">
              <select className="search-input" value={query.estado} onChange={(e) => setQuery((s) => ({ ...s, estado: e.target.value }))}>
                <option value="">(estado)</option>
                <option value="programada">programada</option>
                <option value="reprogramada">reprogramada</option>
                <option value="cancelada">cancelada</option>
                <option value="hecha">hecha</option>
              </select>
            </div>

            <input className="search-input" type="datetime-local" value={query.from} onChange={(e) => setQuery((s) => ({ ...s, from: e.target.value }))} />
            <input className="search-input" type="datetime-local" value={query.to} onChange={(e) => setQuery((s) => ({ ...s, to: e.target.value }))} />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th className="w-min">ID</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th className="w-min">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state">Sin citas.</div></td></tr>
              ) : (
                filtered.map((a) => (
                  <Row
                    key={a.id}
                    item={a}
                    onUpdate={update}
                    onDelete={onDelete}
                    patientMap={patientMap}
                    doctorMap={doctorMap}
                  />
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>

      <footer><small>appointments-react · conectado a appointments-api</small></footer>
    </div>
  );
}