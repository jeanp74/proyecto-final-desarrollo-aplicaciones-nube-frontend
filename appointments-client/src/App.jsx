import { useEffect, useMemo, useState } from "react";
import {
  api,
  getApiBase, setApiBase,
  getPatientsBase, setPatientsBase,
  getDoctorsBase,  setDoctorsBase,
  extGet
} from "./api";

/* ===== Helpers de fecha ===== */
function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
}

function fmtDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

/* ===== Hook de citas (propio servicio) ===== */
function useAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await api("/appointments");
      setItems(data);
    } catch (e) {
      setError(e.message);
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

  return { items, loading, error, load, create, update, remove };
}

/* ===== Hooks de catálogos externos (Pacientes/Doctores) ===== */
function useRoster(getBase, setBase) {
  const [base, setBaseState] = useState(getBase());
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!base) return;
    setBusy(true); setErr("");
    try {
      const path = base.includes("patients") ? "/patients" : "/doctors";
      const data = await extGet(base, path);
      const mapped = (data || []).map((x) => ({
        id: x.id,
        nombre: x.nombre_completo || x.name || "",
        correo: x.correo || x.email || "",
        especialidad: x.especialidad || "",
      }));
      setItems(mapped);
      setBase(base); // persistir en LS
    } catch (e) {
      setErr(e.message || "Error cargando");
      setItems([]);
    } finally {
      setBusy(false);
    }
  };

  return { base, setBase: setBaseState, items, busy, err, load };
}

function labelPaciente(p) {
  return [p.id, p.nombre, p.correo ? `(${p.correo})` : ""].filter(Boolean).join(" — ");
}

function labelMedico(d) {
  return [d.id, d.nombre, d.especialidad ? `(${d.especialidad})` : ""].filter(Boolean).join(" — ");
}

/* ===== App principal ===== */
export default function App() {
  const { items, loading, error, load, create, update, remove } = useAppointments();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: "",
    medico_id: "",
    inicio: "",
    fin: "",
    motivo: "",
    estado: "programada",
  });

  // Bases de APIs
  const [apiBase, setApiBaseState] = useState(getApiBase());
  const patients = useRoster(getPatientsBase, setPatientsBase);
  const doctors  = useRoster(getDoctorsBase, setDoctorsBase);

  // Cargar datos
  useEffect(() => { load(); }, []);
  useEffect(() => { patients.load(); }, [patients.base]);
  useEffect(() => { doctors.load();  }, [doctors.base]);

  // Maps para resolver nombres en tabla
  const patientMap = useMemo(
    () => new Map(patients.items.map(p => [p.id, p])),
    [patients.items]
  );
  const doctorMap = useMemo(
    () => new Map(doctors.items.map(d => [d.id, d])),
    [doctors.items]
  );

  const [query, setQuery] = useState({ paciente_id: "", medico_id: "", estado: "", from: "", to: "" });
  const [deb, setDeb] = useState(query);
  useEffect(() => { const t = setTimeout(() => setDeb(query), 250); return () => clearTimeout(t); }, [query]);

  const filtered = useMemo(() => {
    const f = (arr) => arr
      .filter((x) => !deb.paciente_id || String(x.paciente_id) === deb.paciente_id.trim())
      .filter((x) => !deb.medico_id || String(x.medico_id) === deb.medico_id.trim())
      .filter((x) => !deb.estado || String(x.estado || "").toLowerCase() === deb.estado.trim().toLowerCase())
      .filter((x) => !deb.from || new Date(x.inicio) >= new Date(deb.from))
      .filter((x) => !deb.to   || new Date(x.inicio) <  new Date(deb.to));
    return f(items);
  }, [items, deb]);

  const setF = (k) => (e) => setFormData((s) => ({ ...s, [k]: e.target.value }));

  const onCreate = async (e) => {
    e.preventDefault();
    const payload = {
      paciente_id: Number(formData.paciente_id),
      medico_id: Number(formData.medico_id),
      inicio: localInputToIso(formData.inicio),
      fin: localInputToIso(formData.fin),
      motivo: formData.motivo.trim() || null,
      estado: formData.estado || "programada",
    };
    try {
      await create(payload);
      setFormData({ paciente_id: "", medico_id: "", inicio: "", fin: "", motivo: "", estado: "programada" });
      setShowModal(false); // Close modal
    } catch (e) {
      alert("Error creando: " + e.message);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Citas Médicas</h1>
        <button onClick={() => setShowModal(true)}>Agregar Cita</button>
      </header>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Agregar Cita</h2>
            </div>
            <form onSubmit={onCreate} className="modal-body">
              <div className="form-row">
                <label>Paciente</label>
                <select value={formData.paciente_id} onChange={setF("paciente_id")}>
                  <option value="">Seleccione un paciente</option>
                  {patients.items.map((p) => (
                    <option key={p.id} value={p.id}>{labelPaciente(p)}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Médico</label>
                <select value={formData.medico_id} onChange={setF("medico_id")}>
                  <option value="">Seleccione un médico</option>
                  {doctors.items.map((d) => (
                    <option key={d.id} value={d.id}>{labelMedico(d)}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Inicio</label>
                <input type="datetime-local" value={formData.inicio} onChange={setF("inicio")} />
              </div>
              <div className="form-row">
                <label>Fin</label>
                <input type="datetime-local" value={formData.fin} onChange={setF("fin")} />
              </div>
              <div className="form-row">
                <label>Motivo</label>
                <input type="text" value={formData.motivo} onChange={setF("motivo")} />
              </div>
              <div className="form-row">
                <label>Estado</label>
                <select value={formData.estado} onChange={setF("estado")}>
                  <option value="programada">Programada</option>
                  <option value="reprogramada">Reprogramada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="hecha">Hecha</option>
                </select>
              </div>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Listado de citas */}
      <main>
        <section className="card">
          <h2>Listado de Citas</h2>
          {loading && <p>Cargando...</p>}
          {error && <p>{error}</p>}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8">No hay citas programadas</td></tr>
              ) : (
                filtered.map((a) => (
                  <Row key={a.id} item={a} onUpdate={update} onDelete={remove} patientMap={patientMap} doctorMap={doctorMap} />
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
