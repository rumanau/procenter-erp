import type { Bodega, CategoriaInventario, ProveedorInventario, Articulo, MovimientoInventario } from "../types";

// PRNG determinístico (mulberry32) — misma "aleatoriedad" en cada carga, para una demo estable.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
const int = (min: number, max: number) => Math.floor(min + rng() * (max - min + 1));

export const BODEGAS_INIT: Bodega[] = [
  { id: "B1", nombre: "Bodega Central", ubicacion: "San José", tipo: "General", encargado: "Jules Ramirez", activa: true },
  { id: "B2", nombre: "Bodega 2", ubicacion: "Heredia", tipo: "Seco", encargado: "María Rojas", activa: true },
  { id: "B3", nombre: "Bodega 3 — Taller", ubicacion: "San José", tipo: "Peligroso", encargado: "Jules Ramirez", activa: true },
];

export const CATEGORIAS_INIT: CategoriaInventario[] = [
  { id: "C1", nombre: "Herramienta", prefijo: "HER", icono: "🔧", activa: true },
  { id: "C2", nombre: "Consumible", prefijo: "CON", icono: "📦", activa: true },
  { id: "C3", nombre: "Insumo", prefijo: "INS", icono: "🧱", activa: true },
  { id: "C4", nombre: "Electrónica", prefijo: "ELE", icono: "🔌", activa: true },
  { id: "C5", nombre: "Seguridad", prefijo: "SEG", icono: "🦺", activa: true },
  { id: "C6", nombre: "Activo Fijo", prefijo: "ACT", icono: "🏭", activa: true },
];

export const PROVEEDORES_INIT: ProveedorInventario[] = [
  { id: "PV1", nombre: "TechnoSupply CR S.A.", cedulaJuridica: "3-101-334455", contacto: "ventas@technosupply.cr", telefono: "2233-4455", condicion: "30 días", rating: "A+", categorias: ["C1", "C4"], activo: true, homologacion: "Aprobado" },
  { id: "PV2", nombre: "MegaTools Ferretería", cedulaJuridica: "3-101-556611", contacto: "info@megatools.cr", telefono: "2245-7788", condicion: "Contado", rating: "A", categorias: ["C1", "C3"], activo: true, homologacion: "Aprobado" },
  { id: "PV3", nombre: "ElectroMayorista", cedulaJuridica: "3-101-667788", contacto: "compras@electromayorista.cr", telefono: "2260-1122", condicion: "60 días", rating: "B+", categorias: ["C4"], activo: true, homologacion: "Aprobado Condicionado" },
  { id: "PV4", nombre: "InsumosCR S.A.", cedulaJuridica: "3-101-778823", contacto: "ventas@insumoscr.cr", telefono: "2272-3344", condicion: "15 días", rating: "A", categorias: ["C3", "C2"], activo: true, homologacion: "Aprobado" },
  { id: "PV5", nombre: "SafetyPro Equipos de Seguridad", cedulaJuridica: "3-101-889934", contacto: "ventas@safetypro.cr", telefono: "2288-9900", condicion: "30 días", rating: "A+", categorias: ["C5"], activo: true, homologacion: "Aprobado" },
  { id: "PV6", nombre: "Distribuidora del Norte", cedulaJuridica: "3-101-990045", contacto: "pedidos@distnorte.cr", telefono: "2299-0011", condicion: "30 días", rating: "B+", categorias: ["C2"], activo: true, homologacion: "En Evaluación" },
  { id: "PV7", nombre: "Mobiliario Corporativo CR", cedulaJuridica: "3-101-101156", contacto: "ventas@mobiliariocr.cr", telefono: "2210-2233", condicion: "45 días", rating: "A", categorias: ["C6"], activo: true, homologacion: "Pendiente" },
  { id: "PV8", nombre: "CamTech Seguridad Electrónica", cedulaJuridica: "3-101-212267", contacto: "info@camtech.cr", telefono: "2221-3344", condicion: "30 días", rating: "A", categorias: ["C4", "C5"], activo: true, homologacion: "Aprobado" },
];

interface Catalogo { catId: string; unidad: string; costoMin: number; costoMax: number; minBase: [number, number]; nombres: string[]; }

const CATALOGO_PRODUCTOS: Catalogo[] = [
  { catId: "C1", unidad: "Pzas.", costoMin: 8000, costoMax: 180000, minBase: [3, 10], nombres: [
    "Taladro Inalámbrico DeWalt 20V", "Esmeril Angular 4.5\"", "Escalera Tipo Tijera 6 Est.", "Martillo Carpintero 16oz",
    "Llave Ajustable 12\"", "Llave de Impacto 1/2\"", "Sierra Circular 7.25\"", "Multímetro Digital",
    "Pulidora Orbital", "Compresor Portátil 6gal", "Soldadora Inverter 200A", "Juego de Destornilladores 12pz",
    "Pistola de Calor", "Nivel Láser", "Cinta Métrica 8m", "Grapadora Neumática 1\"",
    "Rotomartillo SDS-Plus", "Caja de Herramientas 18\"", "Gato Hidráulico 2Ton", "Extensión Eléctrica 20m",
    "Generador Portátil 2000W", "Pulverizador Manual 5L", "Carretilla de Mano", "Prensa de Banco 6\"",
  ]},
  { catId: "C2", unidad: "Cajas", costoMin: 800, costoMax: 25000, minBase: [10, 40], nombres: [
    "Guantes Nitrilo T-L (100u)", "Mascarilla N95 (20u)", "Papel Higiénico Industrial", "Toallas de Papel",
    "Jabón Líquido Industrial 5L", "Desinfectante Multiusos 5L", "Cinta Adhesiva Industrial", "Cinta Aislante",
    "Bolsas de Basura Industrial (100u)", "Lija Grano 120 (10u)", "Trapo Industrial (5kg)", "Limpiador de Vidrios 1L",
    "Cera para Piso 5L", "Filtros de Aire Industrial", "Etiquetas de Seguridad (rollo)", "Marcadores Permanentes (12u)",
    "Baterías AA (24u)", "Baterías 9V (10u)", "Focos LED 12W (10u)", "Aceite Lubricante 3-en-1",
    "Grasa Industrial 1kg", "Silicona Sellante", "Pegamento Industrial 500ml", "Papel Kraft (rollo)",
  ]},
  { catId: "C3", unidad: "Uds.", costoMin: 500, costoMax: 45000, minBase: [15, 60], nombres: [
    "Tornillos 1/4\"x2\" (caja 100u)", "Tornillos Autorroscantes (200u)", "Tuercas y Arandelas (kit)", "Alambre Galvanizado (rollo 50m)",
    "Cable Eléctrico #12 (rollo 100m)", "Cable Eléctrico #14 (rollo 100m)", "Tubería PVC 1/2\" (tramo 6m)", "Cinta de Teflón (10u)",
    "Conectores Eléctricos (caja 50u)", "Cemento Gris (saco 42.5kg)", "Arena de Río (saco)", "Pintura Anticorrosiva 1gal",
    "Pintura Esmalte 1gal", "Thinner 1gal", "Empaques de Goma (kit)", "Abrazaderas Metálicas (caja 50u)",
    "Soldadura de Estaño (rollo)", "Electrodos de Soldadura 6013 (caja)", "Varilla Corrugada 3/8\" (tramo)", "Malla Ciclón (rollo 20m)",
  ]},
  { catId: "C4", unidad: "Pzas.", costoMin: 15000, costoMax: 350000, minBase: [2, 8], nombres: [
    "Radio Portátil Motorola", "Cámara CCTV Domo 4MP", "Cámara CCTV Bullet 4MP", "DVR 8 Canales",
    "Sensor de Movimiento PIR", "Regulador de Voltaje APC 200VA", "Regulador de Voltaje APC 500VA", "Batería Respaldo UPS 12V",
    "Cargador de Batería Universal", "Router Wifi Empresarial", "Switch de Red 8 Puertos", "Cable UTP Cat6 (rollo 100m)",
    "Fuente de Poder 12V 5A", "Alarma de Intrusión Inalámbrica", "Contacto Magnético de Puerta", "Botón de Pánico",
    "Sirena de Alarma", "Lector de Proximidad", "Cerradura Electromagnética", "Timbre Inteligente",
  ]},
  { catId: "C5", unidad: "Pzas.", costoMin: 6000, costoMax: 120000, minBase: [4, 15], nombres: [
    "Extintor 3KG ABC", "Extintor 6KG CO2", "Chaleco Reflectivo", "Casco de Seguridad",
    "Arnés de Seguridad Cuerpo Completo", "Línea de Vida 2m", "Botas de Seguridad con Casquillo", "Lentes de Seguridad",
    "Tapones Auditivos (caja 100u)", "Careta de Soldar", "Guantes de Cuero para Soldar", "Cono de Señalización",
    "Cinta de Peligro (rollo)", "Botiquín de Primeros Auxilios", "Candado de Seguridad", "Cerradura de Alta Seguridad",
    "Detector de Humo", "Detector de Gas", "Manta Ignífuga", "Kit de Señalización de Emergencia",
  ]},
  { catId: "C6", unidad: "Pzas.", costoMin: 80000, costoMax: 950000, minBase: [1, 3], nombres: [
    "Escritorio Ejecutivo", "Silla Ergonómica", "Archivador Metálico 4 Gavetas", "Impresora Multifuncional",
    "Proyector Portátil", "Aire Acondicionado 12000BTU", "Refrigeradora de Bodega", "Ventilador Industrial",
    "Estantería Metálica Industrial", "Motocicleta Utilitaria", "Radio Base VHF", "Computadora de Escritorio",
    "Laptop Corporativa", "Televisor 43\" (sala reuniones)", "Mesa de Trabajo Metálica",
  ]},
];

function generarArticulos(): Articulo[] {
  const articulos: Articulo[] = [];
  const seqPorPrefijo: Record<string, number> = {};

  CATALOGO_PRODUCTOS.forEach(cat => {
    const categoria = CATEGORIAS_INIT.find(c => c.id === cat.catId)!;
    const proveedoresCat = PROVEEDORES_INIT.filter(p => p.categorias.includes(cat.catId));

    cat.nombres.forEach((nombre, i) => {
      seqPorPrefijo[categoria.prefijo] = (seqPorPrefijo[categoria.prefijo] || 0) + 1;
      const seq = seqPorPrefijo[categoria.prefijo];
      const sub = pick(["EQO", "GEN", "OPS", "TEC", "STD"]);
      const id = `${categoria.prefijo}-${sub}-${String(seq).padStart(5, "0")}`;

      const min = int(cat.minBase[0], cat.minBase[1]);
      const max = min * int(3, 6);
      const costoUnitario = Math.round(int(cat.costoMin, cat.costoMax) / 5) * 5;
      const bodega = pick(BODEGAS_INIT);
      const proveedor = pick(proveedoresCat.length ? proveedoresCat : PROVEEDORES_INIT);

      // Distribución de niveles de stock: ~65% ok, ~22% bajo, ~9% crítico, ~4% agotado
      const roll = rng();
      let stock: number;
      if (roll < 0.65) stock = int(min, max);
      else if (roll < 0.87) stock = int(Math.floor(min * 0.5), Math.max(min - 1, Math.floor(min * 0.5)));
      else if (roll < 0.96) stock = int(1, Math.max(1, Math.floor(min * 0.5) - 1));
      else stock = 0;

      articulos.push({
        id, nombre, descripcion: `${nombre} — ${categoria.nombre.toLowerCase()} de uso operativo`,
        categoriaId: cat.catId, bodegaId: bodega.id, unidad: cat.unidad,
        stock, min, max, costoUnitario, proveedorId: proveedor.id,
        metodoValuacion: i % 3 === 0 ? "Promedio" : i % 3 === 1 ? "FIFO" : "LIFO",
        activo: true, fechaCreacion: `${int(1, 28)} ${pick(["Ene", "Feb", "Mar", "Abr", "May", "Jun"])} 2024`,
      });
    });
  });
  return articulos;
}

export const ARTICULOS_INIT: Articulo[] = generarArticulos();

function generarMovimientos(): MovimientoInventario[] {
  const movs: MovimientoInventario[] = [];
  const usuarios = ["Jules Ramirez", "María Rojas", "Ronald", "Carlos Montoya", "Sofía Méndez"];
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  let seq = { entrada: 0, salida: 0, traslado: 0, ajuste: 0, baja: 0 };
  const prefijos = { entrada: "ENT", salida: "SAL", traslado: "TRA", ajuste: "AJU", baja: "BAJ" };

  const muestra = ARTICULOS_INIT.filter((_, i) => i % 2 === 0);
  muestra.forEach((art, i) => {
    const nMovs = int(1, 3);
    for (let m = 0; m < nMovs; m++) {
      const tipoRoll = rng();
      const tipo: MovimientoInventario["tipo"] =
        tipoRoll < 0.4 ? "entrada" : tipoRoll < 0.75 ? "salida" : tipoRoll < 0.88 ? "traslado" : tipoRoll < 0.96 ? "ajuste" : "baja";
      seq[tipo]++;
      const proveedor = PROVEEDORES_INIT.find(p => p.id === art.proveedorId)!;
      const otraBodega = BODEGAS_INIT.find(b => b.id !== art.bodegaId)!;
      const cantidad =
        tipo === "entrada" ? int(5, 40) :
        tipo === "salida" ? -int(1, 15) :
        tipo === "traslado" ? int(1, 10) :
        tipo === "ajuste" ? (rng() > 0.5 ? int(1, 5) : -int(1, 5)) :
        -int(1, 3);
      const contraparte =
        tipo === "entrada" ? proveedor.nombre :
        tipo === "salida" ? pick(["Uso Operativo", "Despacho a proyecto", "Préstamo interno", "Mantenimiento"]) :
        tipo === "traslado" ? `→ ${otraBodega.nombre}` :
        tipo === "ajuste" ? "Ajuste por conteo físico" :
        "Baja por daño / obsolescencia";

      movs.push({
        id: `${prefijos[tipo]}-2024-${String(seq[tipo]).padStart(3, "0")}`,
        tipo, articuloId: art.id, cantidad, bodegaId: art.bodegaId,
        bodegaDestinoId: tipo === "traslado" ? otraBodega.id : undefined,
        costoUnitario: art.costoUnitario, contraparte,
        fecha: `${int(1, 28)} ${pick(meses)} 2024`, usuario: pick(usuarios),
        motivo: tipo === "ajuste" ? "Diferencia de conteo físico" : tipo === "baja" ? "Daño irreparable" : undefined,
        referencia: tipo === "entrada" ? `OC-2024-${String(int(10, 99))}` : tipo === "salida" ? `OT-2024-${String(int(100, 199))}` : undefined,
      });
    }
  });
  return movs.sort((a, b) => b.id.localeCompare(a.id));
}

export const MOVIMIENTOS_INIT: MovimientoInventario[] = generarMovimientos();

export function estadoStock(stock: number, min: number): "ok" | "bajo" | "critico" | "agotado" {
  if (stock <= 0) return "agotado";
  if (stock < min * 0.5) return "critico";
  if (stock < min) return "bajo";
  return "ok";
}

export function siguienteFolio(movimientos: MovimientoInventario[], tipo: MovimientoInventario["tipo"]): string {
  const prefijos = { entrada: "ENT", salida: "SAL", traslado: "TRA", ajuste: "AJU", baja: "BAJ" };
  const n = movimientos.filter(m => m.tipo === tipo).length + 1;
  return `${prefijos[tipo]}-2024-${String(n).padStart(3, "0")}`;
}
