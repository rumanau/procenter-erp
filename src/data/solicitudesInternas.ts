import type { SolicitudInterna, EstadoSolicitudInterna, ConfiguracionSolicitudesDepto } from "../types";
import { parseFechaEsCR } from "./proveeduria";

export interface Departamento { id: string; nombre: string; icono: string; color: string; border: string; colorText: string; }

// Mismos esquemas de color que ya usa el portal de Solicitudes genérico
// (PortalSolicitudes.tsx) — se reutilizan para que la tarjeta de departamento
// se vea consistente con el resto de la app.
export const DEPARTAMENTOS: Departamento[] = [
  { id: "proveeduria", nombre: "Proveeduría", icono: "📋", color: "#FFF3ED", border: "#FED7AA", colorText: "#92400E" },
  { id: "inventario", nombre: "Inventario", icono: "📦", color: "#EFF6FF", border: "#BFDBFE", colorText: "#1D4ED8" },
  { id: "rrhh", nombre: "Recursos Humanos", icono: "👥", color: "#ECFDF5", border: "#6EE7B7", colorText: "#065F46" },
  { id: "finanzas", nombre: "Finanzas", icono: "💰", color: "#FEF2F2", border: "#FCA5A5", colorText: "#991B1B" },
  { id: "mantenimiento", nombre: "Mantenimiento", icono: "🔧", color: "#FFFBEB", border: "#FDE68A", colorText: "#92400E" },
  { id: "calidad", nombre: "Calidad", icono: "✅", color: "#F5F3FF", border: "#C4B5FD", colorText: "#5B21B6" },
  { id: "operaciones", nombre: "Operaciones", icono: "🏗️", color: "#F0FDFA", border: "#5EEAD4", colorText: "#115E59" },
];

export const nombreDepto = (id: string) => DEPARTAMENTOS.find(d => d.id === id)?.nombre || id;
export const iconoDepto = (id: string) => DEPARTAMENTOS.find(d => d.id === id)?.icono || "🏢";
export const deptoInfo = (id: string) => DEPARTAMENTOS.find(d => d.id === id) || DEPARTAMENTOS[0];

export const badgePrioridad = (config: ConfiguracionSolicitudesDepto, nombre: string): string =>
  config.prioridades.find(p => p.nombre === nombre)?.badgeClass || "badge-gray";

export const CONFIG_SOLICITUDES_PROVEEDURIA_DEFAULT: ConfiguracionSolicitudesDepto = {
  slaHoras: 48,
  notificarA: "Ronald",
  canalNotificacion: "Solo alerta de sistema",
  alertas: [
    { id: "al1", nombre: "Solicitud nueva sin asignar", activa: true },
    { id: "al2", nombre: "Solicitud bloqueada por más de 2 días", activa: true },
    { id: "al3", nombre: "Solicitud superó el SLA sin resolverse", activa: true },
    { id: "al4", nombre: "Solicitud urgente recibida", activa: true },
  ],
  flujoAprobacion: {
    encargadosPorDepto: { inventario: "Jules Ramirez", rrhh: "Sofía Méndez", finanzas: "Equipo Finanzas", mantenimiento: "Carlos Montoya", calidad: "María Rojas", operaciones: "Alejandro Vega", proveeduria: "Ronald" },
    aprobadorFinal: "Ronald",
  },
  tiposSolicitud: [
    { id: "t1", departamentoId: "inventario", nombre: "Consulta de stock", icono: "📦" },
    { id: "t2", departamentoId: "inventario", nombre: "Traslado entre bodegas", icono: "📦" },
    { id: "t3", departamentoId: "inventario", nombre: "Verificación de recepción", icono: "📦" },
    { id: "t4", departamentoId: "inventario", nombre: "Otro inventario", icono: "📦" },
    { id: "t5", departamentoId: "rrhh", nombre: "Solicitud de personal para bodega", icono: "👥" },
    { id: "t6", departamentoId: "rrhh", nombre: "Capacitación de equipo", icono: "👥" },
    { id: "t7", departamentoId: "rrhh", nombre: "Otro RRHH", icono: "👥" },
    { id: "t8", departamentoId: "finanzas", nombre: "Aprobación de presupuesto", icono: "💰" },
    { id: "t9", departamentoId: "finanzas", nombre: "Consulta de estado de pago", icono: "💰" },
    { id: "t10", departamentoId: "finanzas", nombre: "Ajuste de condición de pago", icono: "💰" },
    { id: "t11", departamentoId: "finanzas", nombre: "Otro Finanzas", icono: "💰" },
    { id: "t12", departamentoId: "mantenimiento", nombre: "Mantenimiento de equipo de oficina", icono: "🔧" },
    { id: "t13", departamentoId: "mantenimiento", nombre: "Reparación urgente", icono: "🔧" },
    { id: "t14", departamentoId: "mantenimiento", nombre: "Otro Mantenimiento", icono: "🔧" },
    { id: "t15", departamentoId: "calidad", nombre: "Homologación de proveedor", icono: "✅" },
    { id: "t16", departamentoId: "calidad", nombre: "Validación de certificación", icono: "✅" },
    { id: "t17", departamentoId: "calidad", nombre: "Auditoría de proveedor", icono: "✅" },
    { id: "t18", departamentoId: "calidad", nombre: "Otro Calidad", icono: "✅" },
    { id: "t19", departamentoId: "operaciones", nombre: "Coordinación logística", icono: "🏗️" },
    { id: "t20", departamentoId: "operaciones", nombre: "Otro Operaciones", icono: "🏗️" },
  ],
  prioridades: [
    { id: "p1", nombre: "Baja", badgeClass: "badge-gray", nota: "No es necesaria para esta semana — puede esperar sin afectar la operación." },
    { id: "p2", nombre: "Media", badgeClass: "badge-info", nota: "Se resuelve dentro del flujo normal, sin plazos críticos de por medio." },
    { id: "p3", nombre: "Alta", badgeClass: "badge-warn", nota: "Afecta una entrega o proceso importante — debe atenderse en los próximos días." },
    { id: "p4", nombre: "Urgente", badgeClass: "badge-crit", nota: "Se requiere para iniciar o continuar una labor ahora mismo — bloquea el trabajo si no se atiende." },
  ],
};

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

export interface FlujoDepartamento { departamento: string; n: number; pct: number; tiempoRespuestaPromedioDias: number | null; }
export interface DiaRecepcion { dia: string; n: number; pct: number; }

export interface EstadisticasAuditoria {
  totalEntrantes: number;
  totalSalientes: number;
  tiempoRespuestaPromedioDias: number | null;
  masAntiguasAbiertas: SolicitudInterna[];
  porPersona: { persona: string; resueltas: number; promedioDias: number }[];
  flujoEntrante: FlujoDepartamento[];
  flujoSaliente: FlujoDepartamento[];
  mejorDiaRecepcion: DiaRecepcion[];
}

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
// getDay(): 0=Domingo..6=Sábado — se remapea para que la semana empiece en lunes.
const diaSemanaDe = (fecha: string): string => DIAS_SEMANA[(parseFechaEsCR(fecha).getDay() + 6) % 7];

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

  // Flujo de entrada y de salida por separado — cada uno con su propio % (sobre el
  // total de esa bandeja, no mezclado) y su propio tiempo de respuesta promedio.
  const flujoDe = (lista: SolicitudInterna[], campoDepto: "departamentoOrigen" | "departamentoDestino"): FlujoDepartamento[] => {
    const total = lista.length;
    const porDepto = new Map<string, { n: number; diasResueltas: number; nResueltas: number }>();
    lista.forEach(s => {
      const depto = s[campoDepto];
      const prev = porDepto.get(depto) || { n: 0, diasResueltas: 0, nResueltas: 0 };
      const resuelta = s.estado === "Resuelta";
      porDepto.set(depto, { n: prev.n + 1, diasResueltas: prev.diasResueltas + (resuelta ? diasEntre(s) : 0), nResueltas: prev.nResueltas + (resuelta ? 1 : 0) });
    });
    return [...porDepto.entries()]
      .map(([depto, v]) => ({ departamento: depto, n: v.n, pct: total ? Math.round((v.n / total) * 1000) / 10 : 0, tiempoRespuestaPromedioDias: v.nResueltas ? Math.round((v.diasResueltas / v.nResueltas) * 10) / 10 : null }))
      .sort((a, b) => b.n - a.n);
  };
  const flujoEntrante = flujoDe(entrantes, "departamentoOrigen");
  const flujoSaliente = flujoDe(salientes, "departamentoDestino");

  const porDia = new Map<string, number>();
  entrantes.forEach(s => porDia.set(diaSemanaDe(s.fechaCreacion), (porDia.get(diaSemanaDe(s.fechaCreacion)) || 0) + 1));
  const mejorDiaRecepcion = DIAS_SEMANA.map(dia => ({ dia, n: porDia.get(dia) || 0, pct: entrantes.length ? Math.round(((porDia.get(dia) || 0) / entrantes.length) * 1000) / 10 : 0 }));

  return { totalEntrantes: entrantes.length, totalSalientes: salientes.length, tiempoRespuestaPromedioDias, masAntiguasAbiertas, porPersona, flujoEntrante, flujoSaliente, mejorDiaRecepcion };
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
