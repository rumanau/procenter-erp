import React, { useState } from "react";
import type { View, SolicitudInterna, EstadoSolicitudInterna, PrioridadSolicitudInterna, MotivoAtrasoSolicitud, ConfiguracionSolicitudesDepto } from "../../types";
import { DEPARTAMENTOS, nombreDepto, iconoDepto, siguienteFolioSolicitud, diasEnBandeja, etiquetaTiempoEnBandeja, cadenaDeSolicitud, estadisticasAuditoria } from "../../data/solicitudesInternas";
import { CATALOGOS_INIT } from "../../data/catalogos";

const DEPTO = "proveeduria";
const hoy = () => new Date().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
const ROSTER = [...CATALOGOS_INIT.responsablesAutorizados.map(r => r.nombre), "Carlos Montoya", "Alejandro Vega", "Equipo Finanzas"];
const MOTIVOS_ATRASO: MotivoAtrasoSolicitud[] = ["Esperando a otro departamento", "Falta de stock o insumo", "Esperando aprobación", "Falta información del solicitante", "Prioridad reasignada", "Otro"];

const badgeEstado = (e: EstadoSolicitudInterna) => e === "Resuelta" ? "badge-ok" : e === "Descartada" ? "badge-gray" : e === "Bloqueada" ? "badge-crit" : e === "En Gestión" ? "badge-warn" : "badge-info";
const badgePrioridad = (p: PrioridadSolicitudInterna) => p === "Urgente" ? "badge-crit" : p === "Alta" ? "badge-warn" : p === "Media" ? "badge-info" : "badge-gray";

type Tab = "nueva" | "bandeja" | "enviadas" | "auditoria" | "configuracion";

export function SolicitudesProveeduria({ setView, solicitudes, setSolicitudes, config, setConfig }: {
  setView: (v: View) => void; solicitudes: SolicitudInterna[]; setSolicitudes: React.Dispatch<React.SetStateAction<SolicitudInterna[]>>;
  config: ConfiguracionSolicitudesDepto; setConfig: React.Dispatch<React.SetStateAction<ConfiguracionSolicitudesDepto>>;
}) {
  const [tab, setTab] = useState<Tab>("bandeja");
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const entrantes = solicitudes.filter(s => s.departamentoDestino === DEPTO);
  const salientes = solicitudes.filter(s => s.departamentoOrigen === DEPTO);
  const pendientesEntrantes = entrantes.filter(s => s.estado !== "Resuelta" && s.estado !== "Descartada").length;

  const actualizar = (id: string, cambios: Partial<SolicitudInterna>) =>
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, ...cambios, fechaActualizacion: hoy() } : s));

  const tabs: [Tab, string][] = [["nueva", "➕ Nueva Solicitud"], ["bandeja", `📥 Bandeja de Gestión${pendientesEntrantes ? ` (${pendientesEntrantes})` : ""}`], ["enviadas", "📤 Solicitudes Enviadas"], ["auditoria", "📊 Auditoría de Gestión"], ["configuracion", "⚙️ Configuración"]];

  const sel = solicitudes.find(s => s.id === detalleId) || null;

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Solicitudes entre Departamentos</div><div className="page-subtitle">Proveeduría — gestión de solicitudes recibidas y enviadas a otros departamentos</div></div>
        <button className="btn btn-secondary btn-sm" onClick={() => setView("proveeduria")}>← Proveeduría</button>
      </div>

      <div className="tab-bar" style={{ marginBottom: 14 }}>
        {tabs.map(([id, label]) => (
          <div key={id} className={`tab-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === "nueva" && <NuevaSolicitudTab solicitudes={solicitudes} setSolicitudes={setSolicitudes} onCreada={() => setTab("enviadas")} />}
      {tab === "bandeja" && <ListaSolicitudes lista={entrantes} mostrarColumna="origen" onAbrir={setDetalleId} vacio="Sin solicitudes recibidas por Proveeduría." />}
      {tab === "enviadas" && <ListaSolicitudes lista={salientes} mostrarColumna="destino" onAbrir={setDetalleId} vacio="Proveeduría no ha enviado solicitudes a otros departamentos." />}
      {tab === "auditoria" && <AuditoriaGestionTab solicitudes={solicitudes} />}
      {tab === "configuracion" && <ConfiguracionTab config={config} setConfig={setConfig} />}

      {sel && <SolicitudDetalleModal solicitud={sel} todas={solicitudes} onActualizar={actualizar} onIrA={id => setDetalleId(id)} onCerrar={() => setDetalleId(null)} />}
    </div>
  );
}

function NuevaSolicitudTab({ solicitudes, setSolicitudes, onCreada }: { solicitudes: SolicitudInterna[]; setSolicitudes: React.Dispatch<React.SetStateAction<SolicitudInterna[]>>; onCreada: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [departamentoDestino, setDepartamentoDestino] = useState(DEPARTAMENTOS.find(d => d.id !== DEPTO)?.id || "");
  const [prioridad, setPrioridad] = useState<PrioridadSolicitudInterna>("Media");
  const [solicitudPadreId, setSolicitudPadreId] = useState("");

  const valido = titulo.trim().length > 3 && descripcion.trim().length > 3 && !!departamentoDestino;

  const crear = () => {
    if (!valido) return;
    const folio = siguienteFolioSolicitud(DEPTO, solicitudes);
    const nueva: SolicitudInterna = {
      id: folio, titulo: titulo.trim(), descripcion: descripcion.trim(), departamentoOrigen: DEPTO, departamentoDestino,
      solicitante: "Ronald", prioridad, etiquetas: [], estado: "Nueva", fechaCreacion: hoy(), fechaActualizacion: hoy(),
      solicitudPadreId: solicitudPadreId || undefined, checklist: [], subtareas: [], comentarios: [],
      historial: [{ id: `h-${Date.now()}`, texto: `Solicitud creada hacia ${nombreDepto(departamentoDestino)}`, usuario: "Ronald", fecha: hoy() }],
    };
    setSolicitudes(prev => [nueva, ...prev]);
    alert(`✅ Solicitud ${folio} enviada a ${nombreDepto(departamentoDestino)}.`);
    setTitulo(""); setDescripcion(""); setSolicitudPadreId(""); setPrioridad("Media");
    onCreada();
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div className="card-title">Nueva solicitud hacia otro departamento</div>
      <div className="form-group"><label className="form-label">Título</label><input className="form-control" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Compra de repuestos para compresor" /></div>
      <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalla qué se necesita y por qué" /></div>
      <div className="g2">
        <div className="form-group"><label className="form-label">Departamento destino</label>
          <select className="form-control" value={departamentoDestino} onChange={e => setDepartamentoDestino(e.target.value)}>
            {DEPARTAMENTOS.filter(d => d.id !== DEPTO).map(d => <option key={d.id} value={d.id}>{d.icono} {d.nombre}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Prioridad</label>
          <select className="form-control" value={prioridad} onChange={e => setPrioridad(e.target.value as PrioridadSolicitudInterna)}>
            <option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option>
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Solicitud relacionada (opcional)</label>
        <select className="form-control" value={solicitudPadreId} onChange={e => setSolicitudPadreId(e.target.value)}>
          <option value="">Sin relación con otra solicitud</option>
          {solicitudes.map(s => <option key={s.id} value={s.id}>{s.id} — {s.titulo}</option>)}
        </select>
        <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 4 }}>Úsalo cuando esta solicitud nace de otra (ej. Inventario sin stock pide la compra a Proveeduría) — así queda visible la trazabilidad completa.</div>
      </div>
      <button className="btn btn-primary" disabled={!valido} onClick={crear}>📤 Enviar solicitud</button>
    </div>
  );
}

function ListaSolicitudes({ lista, mostrarColumna, onAbrir, vacio }: { lista: SolicitudInterna[]; mostrarColumna: "origen" | "destino"; onAbrir: (id: string) => void; vacio: string }) {
  const ordenadas = [...lista].sort((a, b) => diasEnBandeja(b) - diasEnBandeja(a));
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="tbl">
        <thead><tr><th>Folio</th><th>Título</th><th>{mostrarColumna === "origen" ? "Departamento origen" : "Departamento destino"}</th><th>Prioridad</th><th>Estado</th><th>Ingresó</th><th>Tiempo en bandeja</th></tr></thead>
        <tbody>
          {ordenadas.map(s => (
            <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => onAbrir(s.id)}>
              <td style={{ fontFamily: "monospace", fontSize: 11, color: "#E8611A", fontWeight: 700 }}>{s.id}</td>
              <td style={{ fontSize: 12.5 }}>{s.titulo}</td>
              <td style={{ fontSize: 12 }}>{iconoDepto(mostrarColumna === "origen" ? s.departamentoOrigen : s.departamentoDestino)} {nombreDepto(mostrarColumna === "origen" ? s.departamentoOrigen : s.departamentoDestino)}</td>
              <td><span className={`badge ${badgePrioridad(s.prioridad)}`} style={{ fontSize: 9.5 }}>{s.prioridad}</span></td>
              <td><span className={`badge ${badgeEstado(s.estado)}`} style={{ fontSize: 9.5 }}>{s.estado}</span></td>
              <td style={{ fontSize: 11.5, color: "#6B7280" }}>{s.fechaCreacion}</td>
              <td style={{ fontSize: 11.5, fontWeight: 600, color: diasEnBandeja(s) >= 5 && s.estado !== "Resuelta" && s.estado !== "Descartada" ? "#EF4444" : "#374151" }}>{etiquetaTiempoEnBandeja(s)}</td>
            </tr>
          ))}
          {ordenadas.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#9CA3AF", padding: 20 }}>{vacio}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AuditoriaGestionTab({ solicitudes }: { solicitudes: SolicitudInterna[] }) {
  const a = estadisticasAuditoria(DEPTO, solicitudes);

  const conclusion = `Proveeduría ha recibido ${a.totalEntrantes} solicitud(es) de otros departamentos y enviado ${a.totalSalientes}. ` +
    `El tiempo de respuesta promedio de las resueltas es ${a.tiempoRespuestaPromedioDias === null ? "aún indeterminado (sin solicitudes resueltas)" : `${a.tiempoRespuestaPromedioDias} día(s)`}. ` +
    `${a.masAntiguasAbiertas.length > 0 ? `Hay ${a.masAntiguasAbiertas.length} solicitud(es) abiertas, la más antigua con ${diasEnBandeja(a.masAntiguasAbiertas[0])} día(s) en bandeja.` : "No hay solicitudes abiertas pendientes."}`;

  const recomendaciones: string[] = [];
  const criticas = a.masAntiguasAbiertas.filter(s => diasEnBandeja(s) >= 3);
  if (criticas.length > 0) recomendaciones.push(`Dar seguimiento a las solicitudes con más días en bandeja: ${criticas.map(s => `${s.id} (${diasEnBandeja(s)}d)`).join(", ")}.`);
  const bloqueadas = solicitudes.filter(s => s.departamentoDestino === DEPTO && s.estado === "Bloqueada");
  if (bloqueadas.length > 0) recomendaciones.push(`Revisar el motivo de atraso de las solicitudes bloqueadas (${bloqueadas.length}) — puede requerir escalar a otro departamento.`);
  if (recomendaciones.length === 0) recomendaciones.push("Sin focos rojos activos con los datos actuales; mantener el monitoreo periódico.");

  return (
    <div>
      <div className="g3" style={{ marginBottom: 14 }}>
        <div className="kpi"><div className="kpi-label">Recibidas de otros deptos</div><div className="kpi-value" style={{ fontSize: 16 }}>{a.totalEntrantes}</div></div>
        <div className="kpi"><div className="kpi-label">Enviadas a otros deptos</div><div className="kpi-value" style={{ fontSize: 16 }}>{a.totalSalientes}</div></div>
        <div className="kpi"><div className="kpi-label">Tiempo de respuesta promedio</div><div className="kpi-value" style={{ fontSize: 16 }}>{a.tiempoRespuestaPromedioDias === null ? "Sin datos" : `${a.tiempoRespuestaPromedioDias}d`}</div></div>
      </div>

      <div style={{ marginBottom: 14, padding: "10px 12px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 11.5, lineHeight: 1.6 }}>
        <div><b>Interpretación:</b> Agrega todas las solicitudes que entran y salen de Proveeduría hacia otros departamentos — tiempos de respuesta, antigüedad y flujo entre áreas, calculados de las mismas solicitudes que se ven en Bandeja y Enviadas.</div>
        <div style={{ marginTop: 4 }}><b>Conclusión:</b> {conclusion}</div>
        <div style={{ marginTop: 4 }}><b>Recomendaciones:</b></div>
        <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>{recomendaciones.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      <div className="g2" style={{ marginBottom: 14, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Solicitudes con mayor antigüedad</div>
          {a.masAntiguasAbiertas.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Sin solicitudes abiertas</div>}
          {a.masAntiguasAbiertas.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
              <div><b style={{ fontFamily: "monospace", color: "#E8611A", fontSize: 10.5 }}>{s.id}</b> · {s.titulo}</div>
              <span style={{ fontWeight: 700, color: diasEnBandeja(s) >= 5 ? "#EF4444" : "#F59E0B" }}>{diasEnBandeja(s)}d</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Por persona asignada (resueltas)</div>
          {a.porPersona.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Sin solicitudes resueltas todavía</div>}
          {a.porPersona.map(p => (
            <div key={p.persona} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
              <div style={{ fontWeight: 600 }}>{p.persona}</div>
              <div style={{ color: "#6B7280" }}>{p.resueltas} resuelta(s) · {p.promedioDias}d prom.</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Flujo entre departamentos</div>
          {a.flujoDepartamentos.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Sin actividad registrada</div>}
          {a.flujoDepartamentos.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
              <div>{iconoDepto(f.origen)} {nombreDepto(f.origen)} → {iconoDepto(f.destino)} {nombreDepto(f.destino)}</div>
              <b>{f.n}</b>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Tiempo de respuesta de otros departamentos hacia Proveeduría</div>
          {a.tiempoRespuestaOtrosDeptos.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Aún no hay solicitudes resueltas por otros departamentos</div>}
          {a.tiempoRespuestaOtrosDeptos.map(d => (
            <div key={d.departamento} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
              <div>{iconoDepto(d.departamento)} {nombreDepto(d.departamento)}</div>
              <div style={{ color: "#6B7280" }}>{d.promedioDias === null ? "Sin datos" : `${d.promedioDias}d`} ({d.n})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfiguracionTab({ config, setConfig }: { config: ConfiguracionSolicitudesDepto; setConfig: React.Dispatch<React.SetStateAction<ConfiguracionSolicitudesDepto>> }) {
  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="card-title">Alertas de la bandeja de Proveeduría</div>
      <div className="toggle-row">
        <span style={{ fontSize: 12.5 }}>Alertas automáticas activas</span>
        <div className={`toggle ${config.alertasActivas ? "on" : ""}`} onClick={() => setConfig(prev => ({ ...prev, alertasActivas: !prev.alertasActivas }))} />
      </div>
      <div className="form-group"><label className="form-label">Avisar si una solicitud lleva más de (horas)</label>
        <input type="number" className="form-control" value={config.slaHoras} min={1} disabled={!config.alertasActivas} onChange={e => setConfig(prev => ({ ...prev, slaHoras: Math.max(1, parseInt(e.target.value) || 1) }))} />
      </div>
      <div className="form-group"><label className="form-label">Notificar a</label>
        <select className="form-control" value={config.notificarA} disabled={!config.alertasActivas} onChange={e => setConfig(prev => ({ ...prev, notificarA: e.target.value }))}>
          {ROSTER.map(n => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Si una solicitud recibida por Proveeduría supera este tiempo sin cambiar de estado, se notifica automáticamente a la persona indicada.</div>
    </div>
  );
}

function SolicitudDetalleModal({ solicitud, todas, onActualizar, onIrA, onCerrar }: {
  solicitud: SolicitudInterna; todas: SolicitudInterna[]; onActualizar: (id: string, cambios: Partial<SolicitudInterna>) => void; onIrA: (id: string) => void; onCerrar: () => void;
}) {
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [nuevaSubtarea, setNuevaSubtarea] = useState("");
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [subTab, setSubTab] = useState<"todo" | "comentarios" | "historial">("todo");

  const cadena = cadenaDeSolicitud(solicitud.id, todas).filter(s => s.id !== solicitud.id);

  const toggleChecklist = (itemId: string) => onActualizar(solicitud.id, { checklist: solicitud.checklist.map(c => c.id === itemId ? { ...c, hecho: !c.hecho } : c) });
  const toggleSubtarea = (itemId: string) => onActualizar(solicitud.id, { subtareas: solicitud.subtareas.map(c => c.id === itemId ? { ...c, hecho: !c.hecho } : c) });
  const agregarSubtarea = () => { if (!nuevaSubtarea.trim()) return; onActualizar(solicitud.id, { subtareas: [...solicitud.subtareas, { id: `s-${Date.now()}`, texto: nuevaSubtarea.trim(), hecho: false }] }); setNuevaSubtarea(""); };
  const quitarEtiqueta = (et: string) => onActualizar(solicitud.id, { etiquetas: solicitud.etiquetas.filter(e => e !== et) });
  const agregarEtiqueta = () => { if (!nuevaEtiqueta.trim() || solicitud.etiquetas.includes(nuevaEtiqueta.trim())) return; onActualizar(solicitud.id, { etiquetas: [...solicitud.etiquetas, nuevaEtiqueta.trim()] }); setNuevaEtiqueta(""); };
  const comentar = () => {
    if (!nuevoComentario.trim()) return;
    onActualizar(solicitud.id, { comentarios: [...solicitud.comentarios, { id: `m-${Date.now()}`, texto: nuevoComentario.trim(), usuario: "Ronald", fecha: hoy() }] });
    setNuevoComentario("");
  };
  const cambiarEstado = (estado: EstadoSolicitudInterna) => onActualizar(solicitud.id, { estado, historial: [...solicitud.historial, { id: `h-${Date.now()}`, texto: `Estado cambiado a ${estado}`, usuario: "Ronald", fecha: hoy() }] });

  const feed = [
    ...solicitud.comentarios.map(c => ({ tipo: "comentario" as const, fecha: c.fecha, texto: c.texto, usuario: c.usuario })),
    ...solicitud.historial.map(h => ({ tipo: "historial" as const, fecha: h.fecha, texto: h.texto, usuario: h.usuario })),
  ];
  const feedFiltrado = subTab === "comentarios" ? feed.filter(f => f.tipo === "comentario") : subTab === "historial" ? feed.filter(f => f.tipo === "historial") : feed;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 980, display: "flex", flexDirection: "column", maxHeight: "88vh", padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>🔍 {iconoDepto(solicitud.departamentoOrigen)} {nombreDepto(solicitud.departamentoOrigen)} <span style={{ color: "#D1D5DB" }}>/</span> <b style={{ fontFamily: "monospace", color: "#E8611A" }}>{solicitud.id}</b></div>
          <div style={{ cursor: "pointer", fontSize: 16, color: "#9CA3AF" }} onClick={onCerrar}>✕</div>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "auto", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 14, background: "#E8611A" }}>{solicitud.solicitante.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{solicitud.titulo}</div>
                <div style={{ fontSize: 11.5, color: "#6B7280" }}>{solicitud.solicitante} · {iconoDepto(solicitud.departamentoOrigen)} {nombreDepto(solicitud.departamentoOrigen)} → {iconoDepto(solicitud.departamentoDestino)} {nombreDepto(solicitud.departamentoDestino)}</div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Descripción</div>
            <div style={{ fontSize: 12.5, color: "#374151", marginBottom: 14 }}>{solicitud.descripcion}</div>

            {solicitud.etiquetas.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
                {solicitud.etiquetas.map(et => <span key={et} className="badge badge-info" style={{ fontSize: 9.5 }}>{et}</span>)}
              </div>
            )}

            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Checklist de gestión</div>
            {solicitud.checklist.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>Sin checklist definido</div>}
            {solicitud.checklist.map(c => (
              <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "4px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={c.hecho} onChange={() => toggleChecklist(c.id)} />
                <span style={{ textDecoration: c.hecho ? "line-through" : "none", color: c.hecho ? "#9CA3AF" : "#374151" }}>{c.texto}</span>
              </label>
            ))}

            <div style={{ fontSize: 12.5, fontWeight: 700, margin: "14px 0 6px" }}>Subtareas</div>
            {solicitud.subtareas.map(s => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "4px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={s.hecho} onChange={() => toggleSubtarea(s.id)} />
                <span style={{ textDecoration: s.hecho ? "line-through" : "none", color: s.hecho ? "#9CA3AF" : "#374151" }}>{s.texto}</span>
              </label>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input className="form-control" style={{ fontSize: 12 }} value={nuevaSubtarea} onChange={e => setNuevaSubtarea(e.target.value)} placeholder="Añadir subtarea..." onKeyDown={e => e.key === "Enter" && agregarSubtarea()} />
              <button className="btn btn-secondary btn-sm" onClick={agregarSubtarea}>+</button>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 6px" }}>Solicitudes vinculadas (trazabilidad)</div>
            {cadena.length === 0 && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>Esta solicitud no está encadenada con otra.</div>}
            {cadena.map(s => (
              <div key={s.id} className="card" style={{ marginBottom: 6, padding: "8px 10px", cursor: "pointer" }} onClick={() => onIrA(s.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <div><b style={{ fontFamily: "monospace", color: "#E8611A" }}>{s.id}</b> {s.solicitudPadreId === solicitud.id ? "← generada por esta" : s.id === solicitud.solicitudPadreId ? "← origen de esta" : ""}</div>
                  <span className={`badge ${badgeEstado(s.estado)}`} style={{ fontSize: 9 }}>{s.estado}</span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{s.titulo} · {iconoDepto(s.departamentoOrigen)}→{iconoDepto(s.departamentoDestino)}</div>
              </div>
            ))}

            <div className="tab-bar" style={{ margin: "16px 0 10px" }}>
              {(["todo", "comentarios", "historial"] as const).map(t => (
                <div key={t} className={`tab-btn ${subTab === t ? "active" : ""}`} onClick={() => setSubTab(t)}>{t === "todo" ? "Todo" : t === "comentarios" ? "Comentarios" : "Historial"}</div>
              ))}
            </div>
            {subTab !== "historial" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <textarea className="form-control" rows={2} value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} placeholder="Añadir un comentario..." />
                <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-end" }} onClick={comentar}>Comentar</button>
              </div>
            )}
            {[...feedFiltrado].reverse().map((f, i) => (
              <div key={i} style={{ fontSize: 11.5, padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: f.tipo === "historial" ? "#3B82F6" : "#374151" }}>{f.tipo === "historial" ? "🕓 " : ""}{f.texto}</span>
                <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.fecha} · {f.usuario}</div>
              </div>
            ))}
          </div>

          <div style={{ width: 260, flexShrink: 0, borderLeft: "1px solid #E5E7EB", padding: 16, overflow: "auto" }}>
            <select className="form-control" value={solicitud.estado} onChange={e => cambiarEstado(e.target.value as EstadoSolicitudInterna)} style={{ marginBottom: 14, fontWeight: 700 }}>
              <option>Nueva</option><option>En Gestión</option><option>Bloqueada</option><option>Resuelta</option><option>Descartada</option>
            </select>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", marginBottom: 8 }}>DETALLES</div>

            <div className="form-group"><label className="form-label">Persona asignada</label>
              <select className="form-control" value={solicitud.personaAsignada || ""} onChange={e => onActualizar(solicitud.id, { personaAsignada: e.target.value || undefined })}>
                <option value="">Sin asignar</option>
                {ROSTER.map(n => <option key={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 10.5, color: "#E8611A", cursor: "pointer" }} onClick={() => onActualizar(solicitud.id, { personaAsignada: "Ronald" })}>Asignarme a mí</span>
            </div>

            <div className="form-group"><label className="form-label">Prioridad</label>
              <select className="form-control" value={solicitud.prioridad} onChange={e => onActualizar(solicitud.id, { prioridad: e.target.value as PrioridadSolicitudInterna })}>
                <option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option>
              </select>
            </div>

            <div className="form-group"><label className="form-label">Departamentos</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <span className="badge badge-gray" style={{ fontSize: 9 }}>{iconoDepto(solicitud.departamentoOrigen)} {nombreDepto(solicitud.departamentoOrigen)}</span>
                <span style={{ color: "#9CA3AF" }}>→</span>
                <span className="badge badge-gray" style={{ fontSize: 9 }}>{iconoDepto(solicitud.departamentoDestino)} {nombreDepto(solicitud.departamentoDestino)}</span>
              </div>
            </div>

            <div className="form-group"><label className="form-label">Etiquetas</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                {solicitud.etiquetas.map(et => <span key={et} className="badge badge-gray" style={{ fontSize: 9 }}>{et} <span style={{ cursor: "pointer" }} onClick={() => quitarEtiqueta(et)}>✕</span></span>)}
              </div>
              <input className="form-control" style={{ fontSize: 11 }} value={nuevaEtiqueta} onChange={e => setNuevaEtiqueta(e.target.value)} placeholder="Nueva etiqueta + Enter" onKeyDown={e => e.key === "Enter" && agregarEtiqueta()} />
            </div>

            <div className="form-group"><label className="form-label">Motivo de atraso</label>
              <select className="form-control" value={solicitud.motivoAtraso || ""} onChange={e => onActualizar(solicitud.id, { motivoAtraso: (e.target.value || undefined) as MotivoAtrasoSolicitud | undefined })}>
                <option value="">Sin atraso</option>
                {MOTIVOS_ATRASO.map(m => <option key={m}>{m}</option>)}
              </select>
              {solicitud.motivoAtraso && (
                <textarea className="form-control" style={{ marginTop: 6, fontSize: 11 }} rows={2} value={solicitud.motivoAtrasoDetalle || ""} onChange={e => onActualizar(solicitud.id, { motivoAtrasoDetalle: e.target.value })} placeholder="Detalle del atraso..." />
              )}
            </div>

            <div className="resumen">
              <div className="res-row"><span className="res-label">Ingresó</span><span className="res-val">{solicitud.fechaCreacion}</span></div>
              <div className="res-row"><span className="res-label">En bandeja</span><span className="res-val">{etiquetaTiempoEnBandeja(solicitud)}</span></div>
              {solicitud.fechaLimite && <div className="res-row"><span className="res-label">Fecha límite</span><span className="res-val">{solicitud.fechaLimite}</span></div>}
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 10 }}>Creado {solicitud.fechaCreacion} · Actualizado {solicitud.fechaActualizacion}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
