export type View =
  | "inventario" | "existencias" | "nuevo" | "entradas"
  | "ingreso" | "salida" | "traslado" | "ajuste" | "baja"
  | "conteo" | "reabasto" | "valorizado" | "trazabilidad"
  | "bi" | "reportes" | "solicitudes" | "bandeja" | "config-inv"
  | "rrhh" | "admin-personal" | "nomina" | "asistencia"
  | "desempeno" | "reclutamiento" | "capacitacion" | "clima"
  | "config-gral" | "config-rrhh" | "planillas"
  | "bi-ejecutivo" | "bi-rrhh" | "bi-inv" | "bi-calidad"
  | "empresas" | "empresa-detalle" | "verticales";

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
