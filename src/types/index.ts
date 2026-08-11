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

// ── Reclutamiento: Requisiciones, Base de Talento, Vacantes ──

export interface Requisicion {
  id: string;
  puesto: string;
  departamento: string;
  solicitante: string;
  motivo: string;
  plazas: number;
  presupuesto: number;
  justificacion: string;
  prioridad: "alta" | "media" | "baja";
  estado: "pendiente" | "aprobada" | "rechazada" | "convertida";
  fecha: string;
  aprobador?: string;
}

export interface LicenciaConducir {
  tiene: boolean;
  categorias: string[];
  vigencia?: string;
}

export interface PerfilTalento {
  id: string;
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  provincia: string;
  canton: string;
  fuente: string;
  fechaRegistro: string;
  profesion: string;
  educacion: string;
  experienciaAnios: number;
  idiomas: string[];
  competencias: string[];
  certificaciones: string[];
  licencia: LicenciaConducir;
  vehiculoPropio: string;
  disponibilidadViajar: boolean;
  disponibilidadIngreso: "Inmediata" | "1-3 meses" | "3+ meses";
  expectativaSalarial: number;
  cvResumen: string;
  estado: "disponible" | "en proceso" | "contratado" | "no disponible";
}

export interface Postulacion {
  id: string;
  personaId: string;
  vacanteId: string | null;
  fuente: string;
  fecha: string;
  estado: string;
}

export interface PerfilCart {
  id: string;
  nombre: string;
  puesto: string;
  pesos: { experiencia: number; tecnica: number; educacion: number; disponibilidad: number };
}

export interface Vacante {
  id: string;
  puesto: string;
  departamento: string;
  sucursal: string;
  plazas: number;
  responsable: string;
  requisicionId?: string;
  motivoContratacion: string;
  tipoContrato: string;
  jornada: string;
  modalidad: string;
  salarioMin: number;
  salarioMax: number;
  fechaLimite: string;
  descripcion: string;
  funciones: string;
  requisitos: string;
  educacionMin: string;
  experienciaMin: number;
  competencias: string;
  idiomas: string;
  perfilCartId?: string;
  estado: "Borrador" | "Activa" | "Pausada" | "Cerrada";
  fecha: string;
}

export interface Candidato {
  id: string;
  nombre: string;
  vacante: string;
  etapa: string;
  puntCART: number;
  estado: string;
  correo: string;
  tel: string;
  cedula?: string;
  experiencia?: string;
  educacion?: string;
  competencias?: string[];
  personaId?: string;
  asignadoA?: string;
  prioridad?: "Alta" | "Media" | "Baja";
  etiquetas?: string[];
  informador?: string;
}

export interface Subtarea {
  id: string;
  candidatoId: string;
  texto: string;
  completada: boolean;
}

export interface TimelineEvento {
  id: string;
  candidatoId: string;
  fecha: string;
  icono: string;
  descripcion: string;
  responsable?: string;
  tipo?: "sistema" | "comentario";
}

export interface Entrevista {
  id: string;
  candidatoId: string;
  vacanteId: string;
  tipo: "RRHH" | "Técnica" | "Gerencial";
  fecha: string;
  hora: string;
  entrevistador: string;
  modalidad: "Presencial" | "Virtual" | "Telefónica";
  ubicacion: string;
  duracion: number;
  estado: "Programada" | "Realizada" | "Cancelada" | "No asistió";
}

export interface Evaluacion {
  id: string;
  entrevistaId: string;
  candidatoId: string;
  comunicacion: number;
  experiencia: number;
  competencias: number;
  culturaOrganizacional: number;
  conocimientoTecnico: number;
  resultado: number;
  recomendacion: "Avanzar" | "En espera" | "Rechazar";
  comentarios: string;
  fecha: string;
  evaluador: string;
}

export interface Documento {
  id: string;
  candidatoId: string;
  tipo: string;
  nombre: string;
  fecha: string;
  version: string;
  estado: "Pendiente" | "Recibido" | "Verificado";
}

export interface ArbolCartNodo {
  id: string;
  pregunta: string;
  siNode: string;
  noNode: string;
}

export interface OfertaLaboral {
  id: string;
  candidatoId: string;
  vacanteId: string;
  salario: number;
  puesto: string;
  departamento: string;
  jornada: string;
  modalidad: string;
  fechaIngreso: string;
  beneficios: string;
  periodoPrueba: string;
  observaciones: string;
  estado: "Borrador" | "Pendiente aprobación" | "Enviada" | "Aceptada" | "Rechazada" | "Vencida";
  fecha: string;
}

export interface MiembroEquipoReclutamiento {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
}

export interface FiltrosBaseTalentoConfig {
  busqueda: boolean;
  provincia: boolean;
  licencia: boolean;
  experiencia: boolean;
  disponibilidad: boolean;
  vehiculo: boolean;
}

export interface RecursoDocumental {
  id: string;
  nombre: string;
  categoria: "Prueba Psicométrica" | "Guía de Entrevista" | "Plantilla de Evaluación" | "Política" | "Otro";
  descripcion: string;
  fecha: string;
  version: string;
  estado: "Activo" | "Archivado";
}
