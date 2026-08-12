import type { OrdenCompra, EstadoOC, LineaOC, ProveedorArticulo, DocumentoProveedor, EstadoDocumento, Recepcion, LineaRecepcion, EvaluacionServicio, SolicitudCotizacion, OfertaProveedor } from "../types";
import { ARTICULOS_INIT, PROVEEDORES_INIT } from "./inventario";

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hoy = (offsetDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
};

interface PlanOC { proveedorId: string; estado: EstadoOC; offset: number; facturaId?: string; recepOffset?: number; }

const PLAN: PlanOC[] = [
  { proveedorId: "PV1", estado: "Facturada", offset: -18, facturaId: "PROV-1182", recepOffset: -12 },
  { proveedorId: "PV3", estado: "Facturada", offset: -24, facturaId: "PROV-1179", recepOffset: -15 },
  { proveedorId: "PV2", estado: "Recibida", offset: -10, recepOffset: -4 },
  { proveedorId: "PV5", estado: "Recibida", offset: -12, recepOffset: -3 },
  { proveedorId: "PV4", estado: "Enviada", offset: -3 },
  { proveedorId: "PV8", estado: "Enviada", offset: -2 },
  { proveedorId: "PV6", estado: "Borrador", offset: 0 },
  { proveedorId: "PV7", estado: "Borrador", offset: 0 },
];

function generarOrdenes(): OrdenCompra[] {
  const porProveedor = (id: string) => ARTICULOS_INIT.filter(a => a.proveedorId === id && a.activo).slice(0, 4);
  const ordenes: OrdenCompra[] = [];
  PLAN.forEach((p, i) => {
    const articulos = porProveedor(p.proveedorId);
    if (articulos.length === 0) return;
    const seleccion = articulos.slice(0, 2 + (i % 2));
    const lineas: LineaOC[] = seleccion.map(a => ({
      articuloId: a.id,
      cantidad: Math.max(a.max - a.stock, a.min, 5),
      costoUnitario: a.costoUnitario,
    }));
    ordenes.push({
      id: `OC-2024-${String(20 + i).padStart(3, "0")}`,
      proveedorId: p.proveedorId,
      bodegaId: seleccion[0].bodegaId,
      fecha: hoy(p.offset),
      fechaEntregaEsperada: hoy(p.offset + 7),
      fechaRecepcion: p.recepOffset !== undefined ? hoy(p.recepOffset) : undefined,
      estado: p.estado,
      lineas,
      observaciones: "",
      facturaId: p.facturaId,
      creadoPor: "Ronald",
    });
  });
  return ordenes;
}

export const ORDENES_COMPRA_INIT: OrdenCompra[] = generarOrdenes();

// Recepciones semilla: reconstruye en el nuevo formato estructurado las
// órdenes que ya nacieron como "Recibida"/"Facturada" en ORDENES_COMPRA_INIT,
// para que su pestaña de recepciones no aparezca vacía por ser datos previos.
function generarRecepcionesIniciales(): Recepcion[] {
  const recepciones: Recepcion[] = [];
  let seq = 0;
  ORDENES_COMPRA_INIT.filter(o => o.estado === "Recibida" || o.estado === "Facturada").forEach(o => {
    seq++;
    const lineas: LineaRecepcion[] = o.lineas.map(l => ({
      articuloId: l.articuloId,
      cantidadRecibida: l.cantidad,
      cantidadAceptada: l.cantidad,
      cantidadRechazada: 0,
    }));
    recepciones.push({ id: `REC-${seq}`, ordenCompraId: o.id, fecha: o.fechaRecepcion || o.fecha, lineas, recibidoPor: "Ronald" });
  });
  return recepciones;
}

export const RECEPCIONES_INIT: Recepcion[] = generarRecepcionesIniciales();

export function siguienteFolioOC(ordenes: OrdenCompra[]): string {
  return `OC-2024-${String(ordenes.length + 1).padStart(3, "0")}`;
}

export function siguienteFolioRecepcion(recepciones: Recepcion[]): string {
  return `REC-${recepciones.length + 1}`;
}

export function siguienteFolioDevolucion(devoluciones: { id: string }[]): string {
  return `DEV-PROV-${String(devoluciones.length + 1).padStart(4, "0")}`;
}

export function totalOC(oc: OrdenCompra): number {
  return oc.lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);
}

// Umbral de aprobación por monto — bajo ₡250.000 el comprador envía directo;
// entre ₡250.001 y ₡1.000.000 requiere Jefatura; sobre ₡1.000.000, Gerencia.
export function nivelAprobacion(monto: number): "Ninguno" | "Jefatura" | "Gerencia" {
  if (monto <= 250000) return "Ninguno";
  if (monto <= 1000000) return "Jefatura";
  return "Gerencia";
}

export interface ResumenLineaRecepcion {
  articuloId: string;
  solicitado: number;
  recibido: number;
  aceptado: number;
  rechazado: number;
  pendiente: number;
}

// Agrega todas las recepciones registradas contra una OC, línea por línea.
export function resumenRecepcionOC(oc: OrdenCompra, recepciones: Recepcion[]): ResumenLineaRecepcion[] {
  const deEstaOC = recepciones.filter(r => r.ordenCompraId === oc.id);
  return oc.lineas.map(l => {
    let recibido = 0, aceptado = 0, rechazado = 0;
    deEstaOC.forEach(r => {
      const lr = r.lineas.find(x => x.articuloId === l.articuloId);
      if (lr) { recibido += lr.cantidadRecibida; aceptado += lr.cantidadAceptada; rechazado += lr.cantidadRechazada; }
    });
    return { articuloId: l.articuloId, solicitado: l.cantidad, recibido, aceptado, rechazado, pendiente: Math.max(0, l.cantidad - recibido) };
  });
}

export function ocCompleta(oc: OrdenCompra, recepciones: Recepcion[]): boolean {
  return resumenRecepcionOC(oc, recepciones).every(r => r.pendiente === 0);
}

// Diferencia en días entre la fecha comprometida y la fecha en que la OC quedó
// completamente recibida. Positivo = tarde, negativo = adelantada, 0 = puntual.
export function diasDiferenciaEntrega(oc: OrdenCompra): number | null {
  if (!oc.fechaRecepcion || !oc.fechaEntregaEsperada) return null;
  const ms = parseFechaEsCR(oc.fechaRecepcion).getTime() - parseFechaEsCR(oc.fechaEntregaEsperada).getTime();
  return Math.round(ms / 86400000);
}

const MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function parseFechaEsCR(s: string): Date {
  const [d, m, y] = s.replace(".", "").split(" ");
  const mi = MESES_ES.indexOf((m || "").toLowerCase());
  return new Date(parseInt(y) || 1970, mi >= 0 ? mi : 0, parseInt(d) || 1);
}

export interface CriterioEvaluacion { nombre: string; resultado: number; peso: number; }

export interface EvaluacionProveedor {
  puntaje: number;
  grado: string;
  entregaPct: number;
  cantidadPct: number;
  calidadPct: number;
  precioPct: number;
  servicioPct: number;
  criterios: CriterioEvaluacion[];
  nRecibidas: number;
  nRecepciones: number;
  nServicio: number;
  conDatos: boolean;
}

export function descripcionGrado(grado: string): string {
  return grado === "A+" ? "Excelente" : grado === "A" ? "Muy bueno" : grado === "B+" ? "Bueno" : grado === "B" ? "Aceptable" : "Requiere seguimiento";
}

// Evaluación calculada a partir de historial real — sin campos manuales, salvo Servicio.
// Entrega a tiempo (25%): % de OCs que llegaron completas en la fecha esperada o antes.
// Cumplimiento de cantidad (20%): recibido/solicitado promedio por OC con recepciones.
// Calidad (25%): aceptado/recibido acumulado en todas las recepciones.
// Precio (15%): qué tan poco varía el costo del mismo artículo entre órdenes (coef. de variación).
// Servicio (15%): promedio de evaluaciones manuales de atención/respuesta/cumplimiento tras cada recepción.
// Sin historial suficiente, cada dimensión usa un valor neutro (ni premia ni penaliza).
export function calcularEvaluacion(proveedorId: string, ordenesCompra: OrdenCompra[], recepciones: Recepcion[], evaluacionesServicio: EvaluacionServicio[]): EvaluacionProveedor {
  const ocsProveedor = ordenesCompra.filter(o => o.proveedorId === proveedorId);
  const idsOC = new Set(ocsProveedor.map(o => o.id));
  const recepcionesProveedor = recepciones.filter(r => idsOC.has(r.ordenCompraId));

  const completas = ocsProveedor.filter(o => o.fechaRecepcion && o.fechaEntregaEsperada);
  const aTiempo = completas.filter(o => parseFechaEsCR(o.fechaRecepcion!) <= parseFechaEsCR(o.fechaEntregaEsperada!));
  const entregaPct = completas.length ? Math.round((aTiempo.length / completas.length) * 100) : 75;

  const ocsConRecepcion = ocsProveedor.filter(o => recepcionesProveedor.some(r => r.ordenCompraId === o.id));
  const cumplimientos = ocsConRecepcion.map(o => {
    const totalSolicitado = o.lineas.reduce((s, l) => s + l.cantidad, 0);
    const totalRecibido = recepcionesProveedor.filter(r => r.ordenCompraId === o.id)
      .reduce((s, r) => s + r.lineas.reduce((s2, l) => s2 + l.cantidadRecibida, 0), 0);
    return totalSolicitado ? Math.min(100, (totalRecibido / totalSolicitado) * 100) : 100;
  });
  const cantidadPct = cumplimientos.length ? Math.round(cumplimientos.reduce((a, b) => a + b, 0) / cumplimientos.length) : 80;

  let totalRecibidoUnidades = 0, totalAceptadoUnidades = 0;
  recepcionesProveedor.forEach(r => r.lineas.forEach(l => { totalRecibidoUnidades += l.cantidadRecibida; totalAceptadoUnidades += l.cantidadAceptada; }));
  const calidadPct = totalRecibidoUnidades > 0 ? Math.round((totalAceptadoUnidades / totalRecibidoUnidades) * 100) : 85;

  const preciosPorArticulo = new Map<string, number[]>();
  ocsProveedor.forEach(o => o.lineas.forEach(l => {
    preciosPorArticulo.set(l.articuloId, [...(preciosPorArticulo.get(l.articuloId) || []), l.costoUnitario]);
  }));
  const coeficientes: number[] = [];
  preciosPorArticulo.forEach(precios => {
    if (precios.length < 2) return;
    const media = precios.reduce((a, b) => a + b, 0) / precios.length;
    const varianza = precios.reduce((a, b) => a + (b - media) ** 2, 0) / precios.length;
    coeficientes.push(media ? Math.sqrt(varianza) / media : 0);
  });
  const cvProm = coeficientes.length ? coeficientes.reduce((a, b) => a + b, 0) / coeficientes.length : null;
  const precioPct = cvProm === null ? 78 : Math.round(Math.max(0, Math.min(100, 100 - cvProm * 300)));

  const evalsServicio = evaluacionesServicio.filter(e => e.proveedorId === proveedorId);
  const servicioPct = evalsServicio.length
    ? Math.round(evalsServicio.reduce((s, e) => s + (e.atencion + e.respuesta + e.cumplimientoComercial) / 3, 0) / evalsServicio.length * 20)
    : 75;

  const criterios: CriterioEvaluacion[] = [
    { nombre: "Entrega a tiempo", resultado: entregaPct, peso: 25 },
    { nombre: "Cumplimiento de cantidad", resultado: cantidadPct, peso: 20 },
    { nombre: "Calidad", resultado: calidadPct, peso: 25 },
    { nombre: "Precio", resultado: precioPct, peso: 15 },
    { nombre: "Servicio", resultado: servicioPct, peso: 15 },
  ];
  const puntaje = Math.round(criterios.reduce((s, c) => s + c.resultado * (c.peso / 100), 0));
  const grado = puntaje >= 93 ? "A+" : puntaje >= 85 ? "A" : puntaje >= 75 ? "B+" : puntaje >= 65 ? "B" : "C";

  return {
    puntaje, grado, entregaPct, cantidadPct, calidadPct, precioPct, servicioPct, criterios,
    nRecibidas: completas.length, nRecepciones: recepcionesProveedor.length, nServicio: evalsServicio.length,
    conDatos: completas.length > 0 || recepcionesProveedor.length > 0 || cvProm !== null || evalsServicio.length > 0,
  };
}

// ── Multi-proveedor por artículo ────────────────────────────────
// Para cada artículo, ofrece 1-2 proveedores alternativos (misma categoría,
// proveedor distinto al principal) con su propio costo y lead time, para
// poder comparar precio real entre proveedores de un mismo artículo.
function generarProveedorArticulo(): ProveedorArticulo[] {
  const rng = mulberry32(7);
  const entradas: ProveedorArticulo[] = [];
  let seq = 0;
  ARTICULOS_INIT.forEach(articulo => {
    const alternativos = PROVEEDORES_INIT.filter(p => p.activo && p.id !== articulo.proveedorId && p.categorias.includes(articulo.categoriaId));
    if (alternativos.length === 0) return;
    const nAlt = alternativos.length > 1 && rng() > 0.5 ? 2 : 1;
    alternativos.slice(0, nAlt).forEach(prov => {
      seq++;
      const factor = 0.88 + rng() * 0.27; // -12% a +15% vs el costo del proveedor principal
      entradas.push({
        id: `PA-${seq}`,
        articuloId: articulo.id,
        proveedorId: prov.id,
        costoUnitario: Math.round((articulo.costoUnitario * factor) / 5) * 5,
        leadTimeDias: 2 + Math.floor(rng() * 9),
      });
    });
  });
  return entradas;
}

export const PROVEEDOR_ARTICULO_INIT: ProveedorArticulo[] = generarProveedorArticulo();

// ── Documentos del proveedor ────────────────────────────────────
function generarDocumentos(): DocumentoProveedor[] {
  const rng = mulberry32(13);
  const docs: DocumentoProveedor[] = [];
  let seq = 0;
  PROVEEDORES_INIT.forEach(p => {
    seq++;
    docs.push({ id: `DOC-${seq}`, proveedorId: p.id, tipo: "Personería jurídica", nombre: "Certificación de personería jurídica" });
    seq++;
    docs.push({ id: `DOC-${seq}`, proveedorId: p.id, tipo: "Bancario", nombre: "Constancia de cuenta bancaria" });
    seq++;
    const diasIso = Math.floor(rng() * 400) - 20; // algunos vencidos, algunos por vencer, la mayoría vigentes
    docs.push({ id: `DOC-${seq}`, proveedorId: p.id, tipo: "Certificación", nombre: "Certificación ISO 9001", vigenciaHasta: hoy(diasIso) });
    seq++;
    const diasSan = Math.floor(rng() * 400) - 15;
    docs.push({ id: `DOC-${seq}`, proveedorId: p.id, tipo: "Permiso", nombre: "Permiso sanitario de funcionamiento", vigenciaHasta: hoy(diasSan) });
  });
  return docs;
}

export const DOCUMENTOS_PROVEEDOR_INIT: DocumentoProveedor[] = generarDocumentos();

// ── Cotizaciones / RFQ ───────────────────────────────────────────
export function siguienteFolioRFQ(solicitudes: SolicitudCotizacion[]): string {
  return `RFQ-2024-${String(solicitudes.length + 1).padStart(3, "0")}`;
}

export function siguienteFolioOferta(ofertas: OfertaProveedor[]): string {
  return `OF-2024-${String(ofertas.length + 1).padStart(3, "0")}`;
}

export function totalOferta(oferta: OfertaProveedor, rfq: SolicitudCotizacion): number {
  return oferta.lineas.reduce((s, l) => {
    const linea = rfq.lineas.find(x => x.articuloId === l.articuloId);
    return s + (linea ? linea.cantidad * l.costoUnitario : 0);
  }, 0);
}

export interface RecomendacionOferta {
  proveedorId: string;
  total: number;
  plazoEntregaDias: number;
  score: number;
  evaluacion: EvaluacionProveedor;
}

// Recomienda la oferta con mejor balance de precio (40%), evaluación histórica del
// proveedor (35%) y plazo de entrega (25%) — no necesariamente la más barata.
export function recomendarOferta(
  ofertas: OfertaProveedor[], rfq: SolicitudCotizacion, ordenesCompra: OrdenCompra[], recepciones: Recepcion[], evaluacionesServicio: EvaluacionServicio[]
): RecomendacionOferta[] {
  const datos = ofertas.map(o => ({
    proveedorId: o.proveedorId,
    total: totalOferta(o, rfq),
    plazoEntregaDias: o.plazoEntregaDias,
    evaluacion: calcularEvaluacion(o.proveedorId, ordenesCompra, recepciones, evaluacionesServicio),
  }));
  if (datos.length === 0) return [];
  const minTotal = Math.min(...datos.map(d => d.total));
  const minPlazo = Math.min(...datos.map(d => d.plazoEntregaDias));
  return datos.map(d => {
    const normPrecio = d.total > 0 ? Math.max(0, 100 - ((d.total - minTotal) / d.total) * 100) : 100;
    const normPlazo = d.plazoEntregaDias > 0 ? Math.max(0, 100 - ((d.plazoEntregaDias - minPlazo) / d.plazoEntregaDias) * 100) : 100;
    const score = Math.round(normPrecio * 0.40 + d.evaluacion.puntaje * 0.35 + normPlazo * 0.25);
    return { ...d, score };
  }).sort((a, b) => b.score - a.score);
}

export function estadoDocumento(vigenciaHasta?: string): EstadoDocumento {
  if (!vigenciaHasta) return "Vigente";
  const hoyD = new Date();
  const v = parseFechaEsCR(vigenciaHasta);
  const en30dias = new Date(hoyD);
  en30dias.setDate(en30dias.getDate() + 30);
  if (v < hoyD) return "Vencido";
  if (v <= en30dias) return "Por vencer";
  return "Vigente";
}
