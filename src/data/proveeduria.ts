import type { OrdenCompra, EstadoOC, LineaOC } from "../types";
import { ARTICULOS_INIT } from "./inventario";

const hoy = (offsetDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
};

interface PlanOC { proveedorId: string; estado: EstadoOC; offset: number; facturaId?: string; }

const PLAN: PlanOC[] = [
  { proveedorId: "PV1", estado: "Facturada", offset: -18, facturaId: "PROV-1182" },
  { proveedorId: "PV3", estado: "Facturada", offset: -24, facturaId: "PROV-1179" },
  { proveedorId: "PV2", estado: "Recibida", offset: -10 },
  { proveedorId: "PV5", estado: "Recibida", offset: -7 },
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
