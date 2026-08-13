import React, { useState } from "react";
import type { View, SolicitudInterna, EstadoSolicitudInterna, MotivoAtrasoSolicitud, ConfiguracionSolicitudesDepto, TipoSolicitudConfig, AlertaSolicitud } from "../../types";
import { DEPARTAMENTOS, nombreDepto, iconoDepto, deptoInfo, badgePrioridad, siguienteFolioSolicitud, diasEnBandeja, etiquetaTiempoEnBandeja, cadenaDeSolicitud, estadisticasAuditoria } from "../../data/solicitudesInternas";
import { CATALOGOS_INIT } from "../../data/catalogos";

const DEPTO = "proveeduria";
const hoy = () => new Date().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
const ROSTER = [...CATALOGOS_INIT.responsablesAutorizados.map(r => r.nombre), "Carlos Montoya", "Alejandro Vega", "Equipo Finanzas"];
const MOTIVOS_ATRASO: MotivoAtrasoSolicitud[] = ["Esperando a otro departamento", "Falta de stock o insumo", "Esperando aprobación", "Falta información del solicitante", "Prioridad reasignada", "Otro"];

const badgeEstado = (e: EstadoSolicitudInterna) => e === "Resuelta" ? "badge-ok" : e === "Descartada" ? "badge-gray" : e === "Bloqueada" ? "badge-crit" : e === "En Gestión" ? "badge-warn" : "badge-info";

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

      {tab === "nueva" && <NuevaSolicitudTab solicitudes={solicitudes} setSolicitudes={setSolicitudes} config={config} onCreada={() => setTab("enviadas")} />}
      {tab === "bandeja" && <ListaSolicitudes lista={entrantes} mostrarColumna="origen" config={config} onAbrir={setDetalleId} vacio="Sin solicitudes recibidas por Proveeduría." />}
      {tab === "enviadas" && <ListaSolicitudes lista={salientes} mostrarColumna="destino" config={config} onAbrir={setDetalleId} vacio="Proveeduría no ha enviado solicitudes a otros departamentos." />}
      {tab === "auditoria" && <AuditoriaGestionTab solicitudes={solicitudes} />}
      {tab === "configuracion" && <ConfiguracionTab config={config} setConfig={setConfig} />}

      {sel && <SolicitudDetalleModal solicitud={sel} todas={solicitudes} config={config} onActualizar={actualizar} onIrA={id => setDetalleId(id)} onCerrar={() => setDetalleId(null)} />}
    </div>
  );
}

// ── Nueva Solicitud: asistente de 3 pasos (departamento → tipo → formulario) ──
function NuevaSolicitudTab({ solicitudes, setSolicitudes, config, onCreada }: { solicitudes: SolicitudInterna[]; setSolicitudes: React.Dispatch<React.SetStateAction<SolicitudInterna[]>>; config: ConfiguracionSolicitudesDepto; onCreada: () => void }) {
  const [deptoSel, setDeptoSel] = useState<string | null>(null);
  const [tipoSel, setTipoSel] = useState<TipoSolicitudConfig | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState(config.prioridades.find(p => p.nombre === "Media")?.nombre || config.prioridades[0]?.nombre || "Media");
  const [articuloCodigo, setArticuloCodigo] = useState("");
  const [cantidadSolicitada, setCantidadSolicitada] = useState("");
  const [adjuntoNombre, setAdjuntoNombre] = useState("");
  const [solicitudPadreId, setSolicitudPadreId] = useState("");

  const departamentosDisponibles = DEPARTAMENTOS.filter(d => d.id !== DEPTO);
  const deptoActual = deptoSel ? deptoInfo(deptoSel) : null;
  const tiposDelDepto = config.tiposSolicitud.filter(t => t.departamentoId === deptoSel);

  const folioPreview = siguienteFolioSolicitud(DEPTO, solicitudes);
  const encargado = deptoSel ? (config.flujoAprobacion.encargadosPorDepto[deptoSel] || nombreDepto(deptoSel)) : "";

  const valido = descripcion.trim().length > 3;

  const volver = () => { setDeptoSel(null); setTipoSel(null); };
  const cancelar = () => { setTipoSel(null); setDescripcion(""); setArticuloCodigo(""); setCantidadSolicitada(""); setAdjuntoNombre(""); setSolicitudPadreId(""); };

  const enviar = () => {
    if (!valido || !deptoSel || !tipoSel) return;
    const folio = siguienteFolioSolicitud(DEPTO, solicitudes);
    const nueva: SolicitudInterna = {
      id: folio, titulo: tipoSel.nombre, descripcion: descripcion.trim(), departamentoOrigen: DEPTO, departamentoDestino: deptoSel,
      solicitante: "Ronald", prioridad, etiquetas: [], estado: "Nueva", fechaCreacion: hoy(), fechaActualizacion: hoy(),
      articuloCodigo: articuloCodigo.trim() || undefined, cantidadSolicitada: cantidadSolicitada ? Math.max(1, parseInt(cantidadSolicitada) || 1) : undefined,
      adjuntoNombre: adjuntoNombre.trim() || undefined, solicitudPadreId: solicitudPadreId || undefined,
      checklist: [], subtareas: [], comentarios: [],
      historial: [{ id: `h-${Date.now()}`, texto: `Solicitud creada hacia ${nombreDepto(deptoSel)} — encargado inicial: ${encargado}`, usuario: "Ronald", fecha: hoy() }],
    };
    setSolicitudes(prev => [nueva, ...prev]);
    alert(`✅ Solicitud ${folio} enviada a ${nombreDepto(deptoSel)}.\n\nEncargado notificado: ${encargado}.\nPuedes seguir el estado en Solicitudes Enviadas.`);
    setDeptoSel(null); setTipoSel(null); setDescripcion(""); setArticuloCodigo(""); setCantidadSolicitada(""); setAdjuntoNombre(""); setSolicitudPadreId("");
    onCreada();
  };

  if (!tipoSel) {
    return (
      <div>
        {!deptoSel ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1B1F2E", marginBottom: 12 }}>¿A qué departamento necesitas solicitarle algo?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {departamentosDisponibles.map(d => {
                const n = config.tiposSolicitud.filter(t => t.departamentoId === d.id).length;
                return (
                  <div key={d.id} onClick={() => setDeptoSel(d.id)}
                    style={{ padding: "20px 16px", borderRadius: 14, border: `2px solid ${d.border}`, background: d.color, cursor: "pointer", textAlign: "center", transition: "all .15s" }}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,.08)"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{d.icono}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.colorText }}>{d.nombre}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{n} tipo{n !== 1 ? "s" : ""} disponible{n !== 1 ? "s" : ""}</div>
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#6B7280" }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <span>Todas las solicitudes quedan registradas con <b style={{ color: "#1B1F2E" }}>número de caso único</b>, fecha, estado y trazabilidad. El encargado del área recibe notificación automática.</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={volver}>← Volver</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: deptoActual?.color, border: `1px solid ${deptoActual?.border}` }}>
                <span>{deptoActual?.icono}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: deptoActual?.colorText }}>{deptoActual?.nombre}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1B1F2E", marginBottom: 12 }}>¿Qué necesitas solicitar?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {tiposDelDepto.map(t => (
                <div key={t.id} onClick={() => setTipoSel(t)}
                  style={{ padding: "14px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all .15s" }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E8611A"; (e.currentTarget as HTMLDivElement).style.background = "#FFF3ED"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: deptoActual?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{t.icono}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#1B1F2E" }}>{t.nombre}</div>
                </div>
              ))}
              {tiposDelDepto.length === 0 && <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>Sin tipos configurados para este departamento — agrégalos en Configuración.</div>}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="g2" style={{ alignItems: "start" }}>
      <div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button className="btn btn-ghost btn-sm" onClick={cancelar}>← Volver</button>
            <div style={{ padding: "5px 12px", borderRadius: 8, background: deptoActual?.color, border: `1px solid ${deptoActual?.border}`, fontSize: 12, fontWeight: 600, color: deptoActual?.colorText }}>{deptoActual?.icono} {tipoSel.nombre}</div>
          </div>
          <div className="card-title">Detalles de la Solicitud</div>
          <div className="form-group"><label className="form-label">Solicitante</label><input className="form-control" value="Ronald — Super Admin" readOnly style={{ background: "#F9FAFB" }} /></div>
          <div className="form-group"><label className="form-label">Prioridad</label>
            <div className="pills-row">
              {config.prioridades.map(p => <span key={p.id} className={`pill ${prioridad === p.nombre ? "sel" : ""}`} style={{ cursor: "pointer" }} onClick={() => setPrioridad(p.nombre)}>{p.nombre}</span>)}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Descripción detallada</label><textarea className="form-control" rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe con detalle lo que necesitas, cantidad, especificaciones, motivo..." /></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Artículo / Código (opcional)</label><input className="form-control" value={articuloCodigo} onChange={e => setArticuloCodigo(e.target.value)} placeholder="Ej: INV-HR-00158 o nombre" /></div>
            <div className="form-group"><label className="form-label">Cantidad solicitada (opcional)</label><input className="form-control" type="number" min={1} value={cantidadSolicitada} onChange={e => setCantidadSolicitada(e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Adjuntos (opcional)</label>
            <div className="photo-box" style={{ padding: 12, marginBottom: 8 }}><div style={{ fontSize: 16 }}>📎</div><div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Arrastrar o subir documentos</div></div>
            <input className="form-control" value={adjuntoNombre} onChange={e => setAdjuntoNombre(e.target.value)} placeholder="Nombre del archivo (opcional)" />
          </div>
          <div className="form-group"><label className="form-label">Solicitud relacionada (opcional)</label>
            <select className="form-control" value={solicitudPadreId} onChange={e => setSolicitudPadreId(e.target.value)}>
              <option value="">Sin relación con otra solicitud</option>
              {solicitudes.map(s => <option key={s.id} value={s.id}>{s.id} — {s.titulo}</option>)}
            </select>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 4 }}>Úsalo cuando esta solicitud nace de otra (ej. sin stock, se pide la compra a Proveeduría) — así queda visible la trazabilidad completa.</div>
          </div>
        </div>
      </div>
      <div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title">Flujo de Aprobación</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["👤", "Solicitante", "Ronald", "Origen", "#ECFDF5", "#6EE7B7"], [deptoActual?.icono || "🏢", "Encargado área", encargado, "Revisión", "#FFF3ED", "#FED7AA"], ["✅", "Aprobador final", config.flujoAprobacion.aprobadorFinal, "Aprobación final", "#EFF6FF", "#BFDBFE"]].map(([ic, rol, nom, est, bg, bd], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, background: bg as string, border: `1px solid ${bd}` }}>
                <span style={{ fontSize: 18 }}>{ic}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#1B1F2E" }}>{nom}</div><div style={{ fontSize: 10.5, color: "#6B7280" }}>{rol}</div></div>
                <span style={{ fontSize: 11, color: "#6B7280" }}>{est}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ fontSize: 12 }}>Información del caso</div>
          <div className="resumen">
            <div className="res-row"><span className="res-label">Número de caso</span><span className="res-val" style={{ color: "#E8611A", fontFamily: "monospace" }}>{folioPreview}</span></div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val">{tipoSel.nombre}</span></div>
            <div className="res-row"><span className="res-label">Fecha solicitud</span><span className="res-val">{hoy()}</span></div>
            <div className="res-row"><span className="res-label">SLA esperado</span><span className="res-val">{config.slaHoras} horas</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelar}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valido} onClick={enviar}>📬 Enviar Solicitud</button>
        </div>
      </div>
    </div>
  );
}

function ListaSolicitudes({ lista, mostrarColumna, config, onAbrir, vacio }: { lista: SolicitudInterna[]; mostrarColumna: "origen" | "destino"; config: ConfiguracionSolicitudesDepto; onAbrir: (id: string) => void; vacio: string }) {
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
              <td><span className={`badge ${badgePrioridad(config, s.prioridad)}`} style={{ fontSize: 9.5 }}>{s.prioridad}</span></td>
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

// ── Configuración: alertas (estilo Config RRHH), flujo de aprobación, tipos y prioridades ──
function ConfiguracionTab({ config, setConfig }: { config: ConfiguracionSolicitudesDepto; setConfig: React.Dispatch<React.SetStateAction<ConfiguracionSolicitudesDepto>> }) {
  const [subTab, setSubTab] = useState<"notif" | "flujo" | "tipos" | "prioridades">("notif");
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState("");
  const [nuevoTipoDepto, setNuevoTipoDepto] = useState(DEPARTAMENTOS.find(d => d.id !== DEPTO)?.id || "");
  const [nuevaPrioridadNombre, setNuevaPrioridadNombre] = useState("");
  const [nuevaPrioridadClase, setNuevaPrioridadClase] = useState("badge-info");

  const toggleAlerta = (id: string) => setConfig(prev => ({ ...prev, alertas: prev.alertas.map(a => a.id === id ? { ...a, activa: !a.activa } : a) }));
  const setEncargado = (deptoId: string, nombre: string) => setConfig(prev => ({ ...prev, flujoAprobacion: { ...prev.flujoAprobacion, encargadosPorDepto: { ...prev.flujoAprobacion.encargadosPorDepto, [deptoId]: nombre } } }));

  const agregarTipo = () => {
    if (!nuevoTipoNombre.trim()) return;
    const icono = deptoInfo(nuevoTipoDepto).icono;
    setConfig(prev => ({ ...prev, tiposSolicitud: [...prev.tiposSolicitud, { id: `t-${Date.now()}`, departamentoId: nuevoTipoDepto, nombre: nuevoTipoNombre.trim(), icono }] }));
    setNuevoTipoNombre("");
  };
  const quitarTipo = (id: string) => setConfig(prev => ({ ...prev, tiposSolicitud: prev.tiposSolicitud.filter(t => t.id !== id) }));

  const agregarPrioridad = () => {
    if (!nuevaPrioridadNombre.trim() || config.prioridades.some(p => p.nombre === nuevaPrioridadNombre.trim())) return;
    setConfig(prev => ({ ...prev, prioridades: [...prev.prioridades, { id: `p-${Date.now()}`, nombre: nuevaPrioridadNombre.trim(), badgeClass: nuevaPrioridadClase }] }));
    setNuevaPrioridadNombre("");
  };
  const quitarPrioridad = (id: string) => { if (config.prioridades.length <= 1) return; setConfig(prev => ({ ...prev, prioridades: prev.prioridades.filter(p => p.id !== id) })); };

  return (
    <div>
      <div className="tab-bar" style={{ marginBottom: 14 }}>
        {([["notif", "🔔 Notificaciones"], ["flujo", "Flujo de Aprobación"], ["tipos", "Tipos de Solicitud"], ["prioridades", "Prioridades"]] as const).map(([id, label]) => (
          <div key={id} className={`tab-btn ${subTab === id ? "active" : ""}`} onClick={() => setSubTab(id)}>{label}</div>
        ))}
      </div>

      {subTab === "notif" && (
        <div className="g2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">🔔 Alertas automáticas de Solicitudes</div>
            {config.alertas.map((n: AlertaSolicitud) => (
              <div key={n.id} className="toggle-row">
                <span style={{ fontSize: 12.5 }}>{n.nombre}</span>
                <div className={`toggle ${n.activa ? "on" : ""}`} onClick={() => toggleAlerta(n.id)} />
              </div>
            ))}
            <div className="form-group" style={{ marginTop: 10 }}><label className="form-label">Avisar si una solicitud lleva más de (horas)</label>
              <input type="number" className="form-control" value={config.slaHoras} min={1} onChange={e => setConfig(prev => ({ ...prev, slaHoras: Math.max(1, parseInt(e.target.value) || 1) }))} />
            </div>
          </div>
          <div className="card">
            <div className="card-title">📣 A quién notificar</div>
            <div className="form-group"><label className="form-label">Responsable de las alertas de Proveeduría</label>
              <select className="form-control" value={config.notificarA} onChange={e => setConfig(prev => ({ ...prev, notificarA: e.target.value }))}>
                {ROSTER.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Si una alerta activa se dispara (solicitud sin asignar, bloqueada mucho tiempo, SLA vencido, urgente recibida), se notifica a esta persona.</div>
          </div>
        </div>
      )}

      {subTab === "flujo" && (
        <div className="card">
          <div className="card-title">Encargado por defecto de cada departamento</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>Es quien aparece como "Encargado área" en el Flujo de Aprobación al crear una solicitud nueva.</div>
          {DEPARTAMENTOS.filter(d => d.id !== DEPTO).map(d => (
            <div key={d.id} className="g2" style={{ alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 12.5 }}>{d.icono} {d.nombre}</div>
              <select className="form-control" value={config.flujoAprobacion.encargadosPorDepto[d.id] || ""} onChange={e => setEncargado(d.id, e.target.value)}>
                {ROSTER.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          ))}
          <div className="form-group" style={{ marginTop: 10 }}><label className="form-label">Aprobador final</label>
            <select className="form-control" value={config.flujoAprobacion.aprobadorFinal} onChange={e => setConfig(prev => ({ ...prev, flujoAprobacion: { ...prev.flujoAprobacion, aprobadorFinal: e.target.value } }))}>
              {ROSTER.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {subTab === "tipos" && (
        <div className="card">
          <div className="card-title">Tipos de solicitud disponibles en "¿Qué necesitas solicitar?"</div>
          {DEPARTAMENTOS.filter(d => d.id !== DEPTO).map(d => {
            const tipos = config.tiposSolicitud.filter(t => t.departamentoId === d.id);
            return (
              <div key={d.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{d.icono} {d.nombre}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {tipos.map(t => <span key={t.id} className="badge badge-gray" style={{ fontSize: 9.5 }}>{t.nombre} <span style={{ cursor: "pointer" }} onClick={() => quitarTipo(t.id)}>✕</span></span>)}
                  {tipos.length === 0 && <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>Sin tipos</span>}
                </div>
              </div>
            );
          })}
          <div className="g3" style={{ marginTop: 12 }}>
            <div className="form-group"><label className="form-label">Departamento</label>
              <select className="form-control" value={nuevoTipoDepto} onChange={e => setNuevoTipoDepto(e.target.value)}>
                {DEPARTAMENTOS.filter(d => d.id !== DEPTO).map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Nuevo tipo</label><input className="form-control" value={nuevoTipoNombre} onChange={e => setNuevoTipoNombre(e.target.value)} placeholder="Ej: Cotización especial" /></div>
            <div className="form-group"><label className="form-label">&nbsp;</label><button className="btn btn-primary btn-sm" style={{ width: "100%" }} disabled={!nuevoTipoNombre.trim()} onClick={agregarTipo}>➕ Agregar</button></div>
          </div>
        </div>
      )}

      {subTab === "prioridades" && (
        <div className="card">
          <div className="card-title">Prioridades de solicitud</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>Se usan como pastillas al crear una solicitud y como badge en las listas y el detalle.</div>
          {config.prioridades.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
              <span className={`badge ${p.badgeClass}`}>{p.nombre}</span>
              <button className="btn btn-ghost btn-sm" disabled={config.prioridades.length <= 1} onClick={() => quitarPrioridad(p.id)}>✕</button>
            </div>
          ))}
          <div className="g3" style={{ marginTop: 12 }}>
            <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" value={nuevaPrioridadNombre} onChange={e => setNuevaPrioridadNombre(e.target.value)} placeholder="Ej: Crítica" /></div>
            <div className="form-group"><label className="form-label">Color</label>
              <select className="form-control" value={nuevaPrioridadClase} onChange={e => setNuevaPrioridadClase(e.target.value)}>
                <option value="badge-gray">Gris</option><option value="badge-info">Azul</option><option value="badge-warn">Amarillo</option><option value="badge-crit">Rojo</option><option value="badge-ok">Verde</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">&nbsp;</label><button className="btn btn-primary btn-sm" style={{ width: "100%" }} disabled={!nuevaPrioridadNombre.trim()} onClick={agregarPrioridad}>➕ Agregar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SolicitudDetalleModal({ solicitud, todas, config, onActualizar, onIrA, onCerrar }: {
  solicitud: SolicitudInterna; todas: SolicitudInterna[]; config: ConfiguracionSolicitudesDepto; onActualizar: (id: string, cambios: Partial<SolicitudInterna>) => void; onIrA: (id: string) => void; onCerrar: () => void;
}) {
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [nuevaSubtarea, setNuevaSubtarea] = useState("");
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [subTab, setSubTab] = useState<"todo" | "comentarios" | "historial">("todo");

  const cadena = cadenaDeSolicitud(solicitud.id, todas).filter(s => s.id !== solicitud.id);
  const agregarHistorial = (texto: string) => [...solicitud.historial, { id: `h-${Date.now()}`, texto, usuario: "Ronald", fecha: hoy() }];

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
  const cambiarEstado = (estado: EstadoSolicitudInterna) => onActualizar(solicitud.id, { estado, historial: agregarHistorial(`Estado cambiado a ${estado}`) });
  const cambiarPersonaAsignada = (nombre: string) => {
    const esPrimeraAsignacion = !solicitud.personaAsignada && !!nombre;
    onActualizar(solicitud.id, {
      personaAsignada: nombre || undefined,
      fechaAsignacion: esPrimeraAsignacion ? hoy() : solicitud.fechaAsignacion,
      historial: agregarHistorial(nombre ? `Asignada a ${nombre}` : "Se quitó la persona asignada"),
    });
  };
  const cambiarPrioridad = (p: string) => onActualizar(solicitud.id, { prioridad: p, historial: agregarHistorial(`Prioridad cambiada a ${p}`) });
  const cambiarMotivoAtraso = (m: string) => onActualizar(solicitud.id, { motivoAtraso: (m || undefined) as MotivoAtrasoSolicitud | undefined, historial: agregarHistorial(m ? `Motivo de atraso registrado: ${m}` : "Se quitó el motivo de atraso") });

  const feed = [
    ...solicitud.comentarios.map(c => ({ tipo: "comentario" as const, fecha: c.fecha, texto: c.texto, usuario: c.usuario })),
    ...solicitud.historial.map(h => ({ tipo: "historial" as const, fecha: h.fecha, texto: h.texto, usuario: h.usuario })),
  ];
  const feedFiltrado = subTab === "comentarios" ? feed.filter(f => f.tipo === "comentario") : subTab === "historial" ? feed.filter(f => f.tipo === "historial") : feed;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 980, display: "flex", flexDirection: "column", maxHeight: "88vh", padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>N° de Solicitud <b style={{ fontFamily: "monospace", color: "#E8611A", fontSize: 13 }}>{solicitud.id}</b></div>
          <div style={{ cursor: "pointer", fontSize: 16, color: "#9CA3AF" }} onClick={onCerrar}>✕</div>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "auto", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 14, background: "#E8611A" }}>{solicitud.solicitante.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{solicitud.titulo}</div>
                <div style={{ fontSize: 11.5, color: "#6B7280" }}>Solicitada por <b>{solicitud.solicitante}</b> ({iconoDepto(solicitud.departamentoOrigen)} {nombreDepto(solicitud.departamentoOrigen)}) → dirigida a {iconoDepto(solicitud.departamentoDestino)} {nombreDepto(solicitud.departamentoDestino)}</div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, margin: "14px 0 4px" }}>¿Qué se solicita?</div>
            <div style={{ fontSize: 12.5, color: "#374151", marginBottom: 6 }}>{solicitud.descripcion}</div>
            {(solicitud.articuloCodigo || solicitud.cantidadSolicitada) && (
              <div style={{ fontSize: 11.5, color: "#6B7280", marginBottom: 6 }}>{solicitud.articuloCodigo && <>Artículo/Código: <b>{solicitud.articuloCodigo}</b> </>}{solicitud.cantidadSolicitada && <>· Cantidad: <b>{solicitud.cantidadSolicitada}</b></>}</div>
            )}
            {solicitud.adjuntoNombre && <div style={{ fontSize: 11.5, color: "#6B7280", marginBottom: 10 }}>📎 {solicitud.adjuntoNombre}</div>}

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

            <div style={{ fontSize: 12.5, fontWeight: 700, margin: "14px 0 2px" }}>Subtareas</div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", marginBottom: 6 }}>Pasos internos para resolver esta solicitud (ej. "confirmar tallas", "registrar recepción") — dividen el trabajo sin necesidad de crear una solicitud nueva.</div>
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
                <div key={t} className={`tab-btn ${subTab === t ? "active" : ""}`} onClick={() => setSubTab(t)}>{t === "todo" ? "Todo" : t === "comentarios" ? `Comentarios${solicitud.comentarios.length ? ` (${solicitud.comentarios.length})` : ""}` : "Historial"}</div>
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
                {f.tipo === "comentario"
                  ? <span><b style={{ color: "#1B1F2E" }}>{f.usuario}</b> comentó: <span style={{ color: "#374151" }}>{f.texto}</span></span>
                  : <span style={{ color: "#3B82F6" }}>🕓 {f.texto}</span>}
                <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.fecha}{f.tipo === "historial" ? ` · ${f.usuario}` : ""}</div>
              </div>
            ))}
          </div>

          <div style={{ width: 270, flexShrink: 0, borderLeft: "1px solid #E5E7EB", padding: 16, overflow: "auto" }}>
            <select className="form-control" value={solicitud.estado} onChange={e => cambiarEstado(e.target.value as EstadoSolicitudInterna)} style={{ marginBottom: 14, fontWeight: 700 }}>
              <option>Nueva</option><option>En Gestión</option><option>Bloqueada</option><option>Resuelta</option><option>Descartada</option>
            </select>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", marginBottom: 8 }}>DETALLES</div>

            <div className="form-group"><label className="form-label">Persona y depto. que solicita</label>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{solicitud.solicitante}</div>
              <span className="badge badge-gray" style={{ fontSize: 9 }}>{iconoDepto(solicitud.departamentoOrigen)} {nombreDepto(solicitud.departamentoOrigen)}</span>
            </div>

            <div className="form-group"><label className="form-label">Persona asignada (receptora)</label>
              <select className="form-control" value={solicitud.personaAsignada || ""} onChange={e => cambiarPersonaAsignada(e.target.value)}>
                <option value="">Sin asignar</option>
                {ROSTER.map(n => <option key={n}>{n}</option>)}
              </select>
              <span className="badge badge-gray" style={{ fontSize: 9, marginTop: 4, display: "inline-block" }}>{iconoDepto(solicitud.departamentoDestino)} {nombreDepto(solicitud.departamentoDestino)}</span>
              <div><span style={{ fontSize: 10.5, color: "#E8611A", cursor: "pointer" }} onClick={() => cambiarPersonaAsignada("Ronald")}>Asignarme a mí</span></div>
            </div>

            <div className="form-group"><label className="form-label">Prioridad</label>
              <select className="form-control" value={solicitud.prioridad} onChange={e => cambiarPrioridad(e.target.value)}>
                {config.prioridades.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="form-group"><label className="form-label">Etiquetas</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                {solicitud.etiquetas.map(et => <span key={et} className="badge badge-gray" style={{ fontSize: 9 }}>{et} <span style={{ cursor: "pointer" }} onClick={() => quitarEtiqueta(et)}>✕</span></span>)}
              </div>
              <input className="form-control" style={{ fontSize: 11 }} value={nuevaEtiqueta} onChange={e => setNuevaEtiqueta(e.target.value)} placeholder="Nueva etiqueta + Enter" onKeyDown={e => e.key === "Enter" && agregarEtiqueta()} />
            </div>

            <div className="form-group"><label className="form-label">Motivo de atraso</label>
              <select className="form-control" value={solicitud.motivoAtraso || ""} onChange={e => cambiarMotivoAtraso(e.target.value)}>
                <option value="">Sin atraso</option>
                {MOTIVOS_ATRASO.map(m => <option key={m}>{m}</option>)}
              </select>
              {solicitud.motivoAtraso && (
                <textarea className="form-control" style={{ marginTop: 6, fontSize: 11 }} rows={2} value={solicitud.motivoAtrasoDetalle || ""} onChange={e => onActualizar(solicitud.id, { motivoAtrasoDetalle: e.target.value })} placeholder="Detalle del atraso..." />
              )}
            </div>

            <div className="resumen">
              <div className="res-row"><span className="res-label">Se solicitó</span><span className="res-val">{solicitud.fechaCreacion}</span></div>
              <div className="res-row"><span className="res-label">Se asignó</span><span className="res-val">{solicitud.fechaAsignacion || "Sin asignar aún"}</span></div>
              <div className="res-row"><span className="res-label">Última actualización</span><span className="res-val">{solicitud.fechaActualizacion}</span></div>
              <div className="res-row"><span className="res-label">En bandeja</span><span className="res-val">{etiquetaTiempoEnBandeja(solicitud)}</span></div>
              {solicitud.fechaLimite && <div className="res-row"><span className="res-label">Fecha límite</span><span className="res-val">{solicitud.fechaLimite}</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
