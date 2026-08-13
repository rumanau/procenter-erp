import type { SolicitudInterna, EstadoSolicitudInterna } from "../types";
import { parseFechaEsCR } from "./proveeduria";

export interface Departamento { id: string; nombre: string; icono: string; }

export const DEPARTAMENTOS: Departamento[] = [
  { id: "proveeduria", nombre: "Proveeduría", icono: "📋" },
  { id: "inventario", nombre: "Inventario", icono: "📦" },
  { id: "rrhh", nombre: "Recursos Humanos", icono: "👥" },
  { id: "finanzas", nombre: "Finanzas", icono: "💰" },
  { id: "mantenimiento", nombre: "Mantenimiento", icono: "🔧" },
  { id: "calidad", nombre: "Calidad", icono: "✅" },
  { id: "operaciones", nombre: "Operaciones", icono: "🏗️" },
];

export const nombreDepto = (id: string) => DEPARTAMENTOS.find(d => d.id === id)?.nombre || id;
export const iconoDepto = (id: string) => DEPARTAMENTOS.find(d => d.id === id)?.icono || "🏢";

const hoy = (offsetDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
};

export function siguienteFolioSolicitud(deptoId: string, solicitudes: SolicitudInterna[]): string {
  const prefijo = deptoId.slice(0, 4).toUpperCase();
  const n = solicitudes.filter(s => s.departamentoOrigen === deptoId).length + 1;
  return `SOL-${prefijo}-2026-${String(n).padStart(3, "0")}`;
}

export function diasEnBandeja(solicitud: SolicitudInterna): number {
  const desde = parseFechaEsCR(solicitud.fechaCreacion);
  const hasta = solicitud.estado === "Resuelta" || solicitud.estado === "Descartada" ? parseFechaEsCR(solicitud.fechaActualizacion) : new Date();
  return Math.max(0, Math.round((hasta.getTime() - desde.getTime()) / 86400000));
}

export function etiquetaTiempoEnBandeja(solicitud: SolicitudInterna): string {
  const dias = diasEnBandeja(solicitud);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

// Sigue la cadena de solicitudPadreId en ambas direcciones: ancestros (de dónde viene)
// y descendientes (qué generó) — para mostrar el embudo completo entre departamentos.
export function cadenaDeSolicitud(id: string, todas: SolicitudInterna[]): SolicitudInterna[] {
  const porId = new Map(todas.map(s => [s.id, s]));
  const cadena: SolicitudInterna[] = [];
  let actual = porId.get(id);
  const ancestros: SolicitudInterna[] = [];
  while (actual?.solicitudPadreId) {
    const padre = porId.get(actual.solicitudPadreId);
    if (!padre) break;
    ancestros.unshift(padre);
    actual = padre;
  }
  cadena.push(...ancestros);
  const propia = porId.get(id);
  if (propia) cadena.push(propia);
  const hijos = todas.filter(s => s.solicitudPadreId === id);
  cadena.push(...hijos);
  return cadena;
}

export interface EstadisticasAuditoria {
  totalEntrantes: number;
  totalSalientes: number;
  tiempoRespuestaPromedioDias: number | null;
  masAntiguasAbiertas: SolicitudInterna[];
  porPersona: { persona: string; resueltas: number; promedioDias: number }[];
  flujoDepartamentos: { origen: string; destino: string; n: number }[];
  tiempoRespuestaOtrosDeptos: { departamento: string; promedioDias: number | null; n: number }[];
}

export function estadisticasAuditoria(deptoId: string, todas: SolicitudInterna[]): EstadisticasAuditoria {
  const entrantes = todas.filter(s => s.departamentoDestino === deptoId);
  const salientes = todas.filter(s => s.departamentoOrigen === deptoId);
  const resueltasEntrantes = entrantes.filter(s => s.estado === "Resuelta");

  const diasEntre = (s: SolicitudInterna) => Math.max(0, Math.round((parseFechaEsCR(s.fechaActualizacion).getTime() - parseFechaEsCR(s.fechaCreacion).getTime()) / 86400000));
  const tiempoRespuestaPromedioDias = resueltasEntrantes.length
    ? Math.round((resueltasEntrantes.reduce((s, x) => s + diasEntre(x), 0) / resueltasEntrantes.length) * 10) / 10
    : null;

  const abiertosEstados: EstadoSolicitudInterna[] = ["Nueva", "En Gestión", "Bloqueada"];
  const masAntiguasAbiertas = [...entrantes]
    .filter(s => abiertosEstados.includes(s.estado))
    .sort((a, b) => diasEnBandeja(b) - diasEnBandeja(a))
    .slice(0, 5);

  const personas = new Map<string, { resueltas: number; dias: number }>();
  resueltasEntrantes.forEach(s => {
    const p = s.personaAsignada || "Sin asignar";
    const prev = personas.get(p) || { resueltas: 0, dias: 0 };
    personas.set(p, { resueltas: prev.resueltas + 1, dias: prev.dias + diasEntre(s) });
  });
  const porPersona = [...personas.entries()].map(([persona, v]) => ({ persona, resueltas: v.resueltas, promedioDias: Math.round((v.dias / v.resueltas) * 10) / 10 })).sort((a, b) => b.resueltas - a.resueltas);

  const flujo = new Map<string, number>();
  [...entrantes, ...salientes].forEach(s => {
    const key = `${s.departamentoOrigen}|${s.departamentoDestino}`;
    flujo.set(key, (flujo.get(key) || 0) + 1);
  });
  const flujoDepartamentos = [...flujo.entries()].map(([key, n]) => { const [origen, destino] = key.split("|"); return { origen, destino, n }; }).sort((a, b) => b.n - a.n);

  const porDestino = new Map<string, { dias: number; n: number }>();
  salientes.filter(s => s.estado === "Resuelta").forEach(s => {
    const prev = porDestino.get(s.departamentoDestino) || { dias: 0, n: 0 };
    porDestino.set(s.departamentoDestino, { dias: prev.dias + diasEntre(s), n: prev.n + 1 });
  });
  const tiempoRespuestaOtrosDeptos = DEPARTAMENTOS.filter(d => d.id !== deptoId).map(d => {
    const v = porDestino.get(d.id);
    return { departamento: d.id, promedioDias: v && v.n ? Math.round((v.dias / v.n) * 10) / 10 : null, n: v?.n || 0 };
  }).filter(x => x.n > 0);

  return { totalEntrantes: entrantes.length, totalSalientes: salientes.length, tiempoRespuestaPromedioDias, masAntiguasAbiertas, porPersona, flujoDepartamentos, tiempoRespuestaOtrosDeptos };
}

export const SOLICITUDES_INTERNAS_INIT: SolicitudInterna[] = [
  {
    id: "SOL-RRHH-2026-014", titulo: "Uniformes talla M para nuevo ingreso", descripcion: "Se necesitan 2 juegos de uniforme talla M para el Supervisor de Operaciones que ingresa la próxima semana.",
    departamentoOrigen: "rrhh", departamentoDestino: "inventario", solicitante: "Sofía Méndez", personaAsignada: "Jules Ramirez",
    prioridad: "Media", etiquetas: ["Uniformes", "Onboarding"], estado: "Bloqueada",
    motivoAtraso: "Falta de stock o insumo", motivoAtrasoDetalle: "No hay talla M en ninguna bodega — se generó solicitud de compra a Proveeduría.",
    fechaCreacion: hoy(-6), fechaActualizacion: hoy(-4), fechaLimite: hoy(2),
    checklist: [
      { id: "c1", texto: "¿Se confirmó la talla con el colaborador?", hecho: true },
      { id: "c2", texto: "¿Hay stock en otras bodegas?", hecho: true },
      { id: "c3", texto: "¿Se requiere compra a Proveeduría?", hecho: true },
      { id: "c4", texto: "¿Se notificó a RRHH del atraso?", hecho: true },
    ],
    subtareas: [], comentarios: [{ id: "m1", texto: "Sin talla M en Bodega Central ni Bodega 2 — se escala a compra.", usuario: "Jules Ramirez", fecha: hoy(-4) }],
    historial: [{ id: "h1", texto: "Solicitud creada", usuario: "Sofía Méndez", fecha: hoy(-6) }, { id: "h2", texto: "Bloqueada — sin stock, se generó SOL-INVE-2026-001", usuario: "Jules Ramirez", fecha: hoy(-4) }],
  },
  {
    id: "SOL-INVE-2026-001", titulo: "Compra de uniformes talla M — sin stock", descripcion: "Comprar 2 juegos de uniforme talla M. Referencia: solicitud original de RRHH (SOL-RRHH-2026-014) por ingreso de nuevo colaborador.",
    departamentoOrigen: "inventario", departamentoDestino: "proveeduria", solicitante: "Jules Ramirez", personaAsignada: "Ronald",
    prioridad: "Alta", etiquetas: ["Compra", "Uniformes"], estado: "En Gestión",
    motivoAtraso: "Esperando aprobación", motivoAtrasoDetalle: "El monto de la orden de compra supera el límite de compra directa y quedó pendiente de aprobación de Jefatura.",
    fechaCreacion: hoy(-4), fechaActualizacion: hoy(-1), fechaLimite: hoy(3), solicitudPadreId: "SOL-RRHH-2026-014",
    checklist: [
      { id: "c1", texto: "¿Se identificó un proveedor disponible?", hecho: true },
      { id: "c2", texto: "¿Se solicitó cotización?", hecho: true },
      { id: "c3", texto: "¿Se generó la Orden de Compra?", hecho: true },
      { id: "c4", texto: "¿Se notificó a Inventario del avance?", hecho: false },
    ],
    subtareas: [{ id: "s1", texto: "Confirmar tallas exactas con RRHH", hecho: true }, { id: "s2", texto: "Registrar recepción cuando llegue el pedido", hecho: false }],
    comentarios: [{ id: "m1", texto: "OC generada por ₡310.000 — quedó Pendiente Aprobación de Jefatura por superar el límite de compra directa.", usuario: "Ronald", fecha: hoy(-1) }],
    historial: [{ id: "h1", texto: "Solicitud creada desde Inventario", usuario: "Jules Ramirez", fecha: hoy(-4) }, { id: "h2", texto: "En gestión — cotización solicitada a MegaTools Ferretería", usuario: "Ronald", fecha: hoy(-3) }],
  },
  {
    id: "SOL-MANT-2026-007", titulo: "Compra urgente de repuestos — compresor Bodega 3", descripcion: "El compresor de Bodega 3 — Taller presenta falla en la válvula de admisión. Se requieren repuestos para no detener producción.",
    departamentoOrigen: "mantenimiento", departamentoDestino: "proveeduria", solicitante: "Carlos Montoya",
    prioridad: "Urgente", etiquetas: ["Repuestos", "Urgente"], estado: "Nueva",
    fechaCreacion: hoy(-1), fechaActualizacion: hoy(-1), fechaLimite: hoy(1),
    checklist: [
      { id: "c1", texto: "¿Se identificó un proveedor disponible?", hecho: false },
      { id: "c2", texto: "¿Se solicitó cotización?", hecho: false },
      { id: "c3", texto: "¿Se generó la Orden de Compra?", hecho: false },
      { id: "c4", texto: "¿Se notificó a Mantenimiento del avance?", hecho: false },
    ],
    subtareas: [], comentarios: [], historial: [{ id: "h1", texto: "Solicitud creada desde Mantenimiento", usuario: "Carlos Montoya", fecha: hoy(-1) }],
  },
  {
    id: "SOL-CALI-2026-002", titulo: "Homologar nuevo proveedor de EPP", descripcion: "Calidad identificó un proveedor alternativo de equipo de protección personal con mejor certificación — se solicita iniciar homologación.",
    departamentoOrigen: "calidad", departamentoDestino: "proveeduria", solicitante: "María Rojas", personaAsignada: "Ronald",
    prioridad: "Baja", etiquetas: ["Homologación"], estado: "Resuelta",
    fechaCreacion: hoy(-20), fechaActualizacion: hoy(-15), fechaLimite: hoy(-13),
    checklist: [
      { id: "c1", texto: "¿Se solicitó documentación al proveedor?", hecho: true },
      { id: "c2", texto: "¿Se registró en el directorio de Proveedores?", hecho: true },
      { id: "c3", texto: "¿Se notificó a Calidad del resultado?", hecho: true },
    ],
    subtareas: [], comentarios: [{ id: "m1", texto: "Proveedor registrado y homologado como 'Aprobado Condicionado' hasta primera recepción.", usuario: "Ronald", fecha: hoy(-15) }],
    historial: [{ id: "h1", texto: "Solicitud creada desde Calidad", usuario: "María Rojas", fecha: hoy(-20) }, { id: "h2", texto: "Resuelta — proveedor homologado", usuario: "Ronald", fecha: hoy(-15) }],
  },
  {
    id: "SOL-OPER-2026-018", titulo: "Compra de sillas ergonómicas adicionales", descripcion: "Operaciones solicita 6 sillas ergonómicas adicionales para la sala de supervisión.",
    departamentoOrigen: "operaciones", departamentoDestino: "proveeduria", solicitante: "Alejandro Vega",
    prioridad: "Baja", etiquetas: ["Mobiliario"], estado: "Descartada",
    motivoAtraso: "Otro", motivoAtrasoDetalle: "Presupuesto no aprobado para este trimestre.",
    fechaCreacion: hoy(-10), fechaActualizacion: hoy(-8),
    checklist: [{ id: "c1", texto: "¿Se identificó un proveedor disponible?", hecho: true }, { id: "c2", texto: "¿Hay presupuesto disponible?", hecho: false }],
    subtareas: [], comentarios: [{ id: "m1", texto: "Sin presupuesto disponible en el trimestre — se descarta, reevaluar en el siguiente.", usuario: "Ronald", fecha: hoy(-8) }],
    historial: [{ id: "h1", texto: "Solicitud creada desde Operaciones", usuario: "Alejandro Vega", fecha: hoy(-10) }, { id: "h2", texto: "Descartada por falta de presupuesto", usuario: "Ronald", fecha: hoy(-8) }],
  },
  {
    id: "SOL-PROV-2026-001", titulo: "Validar certificación ISO de SafetyPro antes de renovar contrato", descripcion: "Antes de renovar condiciones comerciales con SafetyPro Equipos de Seguridad, se solicita a Calidad validar que su certificación ISO 9001 siga vigente.",
    departamentoOrigen: "proveeduria", departamentoDestino: "calidad", solicitante: "Ronald", personaAsignada: "María Rojas",
    prioridad: "Media", etiquetas: ["Homologación", "Renovación"], estado: "Resuelta",
    fechaCreacion: hoy(-30), fechaActualizacion: hoy(-25),
    checklist: [{ id: "c1", texto: "¿Se validó la certificación vigente?", hecho: true }, { id: "c2", texto: "¿Se notificó a Proveeduría del resultado?", hecho: true }],
    subtareas: [], comentarios: [{ id: "m1", texto: "Certificación ISO 9001 vigente hasta 2027 — validado.", usuario: "María Rojas", fecha: hoy(-25) }],
    historial: [{ id: "h1", texto: "Solicitud creada desde Proveeduría", usuario: "Ronald", fecha: hoy(-30) }, { id: "h2", texto: "Resuelta — certificación validada", usuario: "María Rojas", fecha: hoy(-25) }],
  },
  {
    id: "SOL-PROV-2026-002", titulo: "Aprobación de presupuesto extraordinario — compra de uniformes", descripcion: "Se solicita aprobación de presupuesto extraordinario para cubrir la compra de uniformes solicitada por Inventario (ref. SOL-INVE-2026-001), que supera el límite de compra directa.",
    departamentoOrigen: "proveeduria", departamentoDestino: "finanzas", solicitante: "Ronald", personaAsignada: "Equipo Finanzas",
    prioridad: "Alta", etiquetas: ["Presupuesto"], estado: "En Gestión",
    fechaCreacion: hoy(-1), fechaActualizacion: hoy(-1), fechaLimite: hoy(2), solicitudPadreId: "SOL-INVE-2026-001",
    checklist: [{ id: "c1", texto: "¿Se envió la justificación del gasto?", hecho: true }, { id: "c2", texto: "¿Se recibió aprobación de Finanzas?", hecho: false }],
    subtareas: [], comentarios: [], historial: [{ id: "h1", texto: "Solicitud creada desde Proveeduría", usuario: "Ronald", fecha: hoy(-1) }],
  },
];
