import type { OrdenCompra, EstadoOC, LineaOC, ProveedorArticulo, DocumentoProveedor, EstadoDocumento } from "../types";
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

export function siguienteFolioOC(ordenes: OrdenCompra[]): string {
  return `OC-2024-${String(ordenes.length + 1).padStart(3, "0")}`;
}

export function totalOC(oc: OrdenCompra): number {
  return oc.lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);
}

const MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function parseFechaEsCR(s: string): Date {
  const [d, m, y] = s.replace(".", "").split(" ");
  const mi = MESES_ES.indexOf((m || "").toLowerCase());
  return new Date(parseInt(y) || 1970, mi >= 0 ? mi : 0, parseInt(d) || 1);
}

export interface EvaluacionProveedor {
  puntaje: number;
  grado: string;
  entregaPct: number;
  estabilidadPrecio: number;
  confiabilidad: number;
  nRecibidas: number;
  conDatos: boolean;
}

// Evaluación calculada a partir de historial real de OCs — sin campos manuales.
// Entrega a tiempo (45%): % de recepciones que llegaron en la fecha esperada o antes.
// Estabilidad de precio (30%): qué tan poco varía el costo del mismo artículo entre órdenes (coef. de variación).
// Confiabilidad de suministro (25%): % de órdenes no canceladas sobre el total enviado.
// Sin historial suficiente, cada dimensión usa un valor neutro (ni premia ni penaliza).
export function calcularEvaluacion(proveedorId: string, ordenesCompra: OrdenCompra[]): EvaluacionProveedor {
  const ocsProveedor = ordenesCompra.filter(o => o.proveedorId === proveedorId);
  const noBorrador = ocsProveedor.filter(o => o.estado !== "Borrador");

  const recibidas = ocsProveedor.filter(o => o.fechaRecepcion && o.fechaEntregaEsperada);
  const aTiempo = recibidas.filter(o => parseFechaEsCR(o.fechaRecepcion!) <= parseFechaEsCR(o.fechaEntregaEsperada!));
  const entregaPct = recibidas.length ? Math.round((aTiempo.length / recibidas.length) * 100) : 75;

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
  const estabilidadPrecio = cvProm === null ? 78 : Math.round(Math.max(0, Math.min(100, 100 - cvProm * 300)));

  const canceladas = noBorrador.filter(o => o.estado === "Cancelada").length;
  const confiabilidad = noBorrador.length ? Math.round(((noBorrador.length - canceladas) / noBorrador.length) * 100) : 80;

  const puntaje = Math.round(entregaPct * 0.45 + estabilidadPrecio * 0.30 + confiabilidad * 0.25);
  const grado = puntaje >= 93 ? "A+" : puntaje >= 85 ? "A" : puntaje >= 75 ? "B+" : puntaje >= 65 ? "B" : "C";

  return { puntaje, grado, entregaPct, estabilidadPrecio, confiabilidad, nRecibidas: recibidas.length, conDatos: recibidas.length > 0 || cvProm !== null };
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
