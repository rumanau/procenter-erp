export type View =
  | "inventario" | "existencias" | "nuevo" | "entradas"
  | "ingreso" | "salida" | "traslado" | "ajuste" | "baja"
  | "conteo" | "reabasto" | "valorizado" | "trazabilidad"
  | "bi" | "reportes" | "solicitudes" | "bandeja" | "config-inv"
  | "rrhh" | "admin-personal" | "nomina" | "asistencia"
  | "desempeno" | "reclutamiento" | "capacitacion" | "clima"
  | "config-gral" | "config-rrhh" | "planillas"
  | "bi-ejecutivo" | "bi-rrhh" | "bi-inv" | "bi-calidad"
  | "empresas" | "empresa-detalle" | "verticales"
  | "finanzas" | "libro-diario" | "cxc" | "cxp"
  | "estados-financieros" | "flujo-caja" | "facturacion"
  | "banca" | "config-finanzas";

export interface Company {
  id: string;
  name: string;
  group: string;
  color: string;
  meta: string;
  icon: string;
}

export interface Widget {
  id: number;
  type: string;
  title: string;
}

export interface Solicitud {
  id: string;
  tipo: string;
  categoria: string;
  solicitante: string;
  fecha: string;
  estado: "pendiente" | "en-proceso" | "aprobada" | "rechazada";
  urgencia: "baja" | "media" | "alta";
  descripcion: string;
  horas: number;
}

export interface Vertical {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  activa: boolean;
  sucursales: string[];
  deptos: string[];
  centrosCosto: string[];
}

export interface EmpresaData {
  id: string;
  nombre: string;
  razonSocial: string;
  cedula: string;
  sector: string;
  pais: string;
  moneda: string;
  anoFiscal: string;
  logo: string;
  color: string;
  icono: string;
  direccion: string;
  telefono: string;
  correo: string;
  web: string;
  representante: string;
  activa: boolean;
  verticales: Vertical[];
}

export interface Empleado {
  id: string;
  nombre: string;
  puesto: string;
  depto: string;
  tipo: string;
  inicio: string;
  estado: string;
  foto: string;
  salario: number;
  planillaId: string;
  cedula: string;
  correo: string;
  telefono: string;
  banco: string;
  cuentaBanco: string;
  jornada: string;
}

export interface Planilla {
  id: string;
  nombre: string;
  estado: string;
  banco: string;
  cuenta: string;
  moneda: string;
  frecuencia: string;
  ccssObrero: number;
  ccssPatronal: number;
  heRegular: number;
  heDoble: number;
  flujoAprobacion: string[];
  empleadosIds: string[];
  tipo: string;
  color: string;
  autorizador: string;
  descripcion: string;
}

export interface GraficaConstructor {
  id: number;
  tipo: string;
  titulo: string;
  fuente: string;
  varX: string;
  varY: string;
  color: string;
}

export interface FilaPlanilla {
  empId: string;
  nombre: string;
  puesto: string;
  salBase: number;
  heReg: number;
  heDob: number;
  bono: number;
  salBruto: number;
  ccssObrero: number;
  opc: number;
  bpop: number;
  renta: number;
  dedsExtra: number;
  totalDed: number;
  liquido: number;
  ccssPatronal: number;
  aguinaldo: number;
  cargoTotal: number;
}

export interface LineaHE {
  empId: string;
  tipo: string;
  horas: number;
}

export interface DeduccionExtra {
  empId: string;
  concepto: string;
  monto: number;
}

// ── Finanzas & Contabilidad ─────────────────────────────────

export interface CuentaContable {
  codigo: string;
  nombre: string;
  tipo: "activo" | "pasivo" | "patrimonio" | "ingreso" | "gasto";
  naturaleza: "deudora" | "acreedora";
}

export interface LineaAsiento {
  cuenta: string;
  descripcion: string;
  debito: number;
  credito: number;
}

export interface AsientoContable {
  id: string;
  fecha: string;
  concepto: string;
  origen: string;
  estado: "borrador" | "aprobado" | "anulado";
  lineas: LineaAsiento[];
}

export interface Factura {
  id: string;
  tipo: "cxc" | "cxp";
  contraparte: string;
  cedula: string;
  fechaEmision: string;
  fechaVencimiento: string;
  moneda: string;
  monto: number;
  saldo: number;
  estado: "pendiente" | "vencida" | "pagada" | "parcial";
  consecutivo?: string;
  claveHacienda?: string;
  estadoHacienda?: "aceptado" | "pendiente" | "rechazado" | "enviando";
}

export interface CuentaBancaria {
  id: string;
  banco: string;
  alias: string;
  numero: string;
  moneda: string;
  saldo: number;
  conectada: boolean;
  ultimaSync?: string;
}

export interface MovimientoBancario {
  id: string;
  cuentaId: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: "credito" | "debito";
  conciliado: boolean;
}

export interface Moneda {
  codigo: string;
  nombre: string;
  simbolo: string;
  tipoCambio: number;
}
