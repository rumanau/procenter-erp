import type { Requisicion, PerfilTalento, Postulacion, PerfilCart, Vacante } from "../types";

export const FUENTES_POSTULACION = ["Portal PROCENTER", "LinkedIn", "Indeed", "Referido", "Correo", "Feria de empleo", "Universidad", "Carga manual"];

export const PROVINCIAS_CR = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];

export const CATEGORIAS_LICENCIA = [
  { id: "A1", label: "A1 — Bicimoto" },
  { id: "A2", label: "A2 — Motocicleta" },
  { id: "A3", label: "A3 — Motocicleta > 400cc" },
  { id: "B1", label: "B1 — Automóvil liviano" },
  { id: "B2", label: "B2 — Liviano doble tracción" },
  { id: "C1", label: "C1 — Pesado (carga)" },
  { id: "D1", label: "D1 — Pesado (pasajeros)" },
];

export const PERFILES_CART_INIT: PerfilCart[] = [
  { id: "CART-001", nombre: "Técnico Mantenimiento V1", puesto: "Técnico de Mantenimiento", pesos: { experiencia: 30, tecnica: 35, educacion: 15, disponibilidad: 20 } },
  { id: "CART-002", nombre: "Analista Calidad V1", puesto: "Analista de Calidad", pesos: { experiencia: 25, tecnica: 30, educacion: 30, disponibilidad: 15 } },
  { id: "CART-003", nombre: "Administrativo V1", puesto: "Asistente Administrativo", pesos: { experiencia: 20, tecnica: 20, educacion: 35, disponibilidad: 25 } },
  { id: "CART-004", nombre: "Mensajería/Campo V1", puesto: "Mensajero de Campo", pesos: { experiencia: 20, tecnica: 15, educacion: 10, disponibilidad: 55 } },
];

export const REQUISICIONES_INIT: Requisicion[] = [
  { id: "REQ-2026-014", puesto: "Supervisor de Operaciones", departamento: "Operaciones", solicitante: "Gerencia Operaciones", motivo: "Sustitución", plazas: 1, presupuesto: 850000, justificacion: "Renuncia del titular, cobertura de turno nocturno.", prioridad: "alta", estado: "pendiente", fecha: "05 Ago 2026" },
  { id: "REQ-2026-013", puesto: "Analista de Calidad", departamento: "Calidad", solicitante: "María Rojas", motivo: "Nueva posición", plazas: 1, presupuesto: 700000, justificacion: "Crecimiento de auditorías ISO 9001 requiere apoyo adicional.", prioridad: "media", estado: "aprobada", fecha: "22 Jul 2026", aprobador: "Ronald" },
  { id: "REQ-2026-012", puesto: "Mensajero de Campo", departamento: "Logística", solicitante: "Alejandro Vega", motivo: "Incremento de plantilla", plazas: 2, presupuesto: 620000, justificacion: "Aumento de rutas de entrega en GAM.", prioridad: "media", estado: "convertida", fecha: "10 Jul 2026", aprobador: "Ronald" },
  { id: "REQ-2026-011", puesto: "Practicante Administrativo", departamento: "Administración", solicitante: "Ana Vargas", motivo: "Temporal", plazas: 1, presupuesto: 300000, justificacion: "Apoyo temporal de 3 meses durante cierre fiscal.", prioridad: "baja", estado: "rechazada", fecha: "01 Jul 2026", aprobador: "Ronald" },
];

export const VACANTES_INIT: Vacante[] = [
  {
    id: "VAC-001", puesto: "Técnico de Mantenimiento", departamento: "Mantenimiento", sucursal: "Bodega Central", plazas: 1, responsable: "Ronald",
    motivoContratacion: "Sustitución", tipoContrato: "Indefinido", jornada: "Completa", modalidad: "Presencial",
    salarioMin: 750000, salarioMax: 900000, fechaLimite: "30 Ago 2026",
    descripcion: "Mantenimiento preventivo y correctivo de equipos e instalaciones.",
    funciones: "Diagnóstico de fallas · Mantenimiento preventivo · Reparación de equipos · Reporte de incidencias",
    requisitos: "Experiencia comprobable en mantenimiento industrial", educacionMin: "Técnico", experienciaMin: 2,
    competencias: "Trabajo en equipo, resolución de problemas", idiomas: "No requerido",
    perfilCartId: "CART-001", estado: "Activa", fecha: "10 Jun 2026",
  },
  {
    id: "VAC-002", puesto: "Asistente Administrativo", departamento: "Administración", sucursal: "Oficina Central", plazas: 1, responsable: "Ana Vargas",
    motivoContratacion: "Nueva posición", tipoContrato: "Plazo fijo", jornada: "Completa", modalidad: "Presencial",
    salarioMin: 500000, salarioMax: 650000, fechaLimite: "20 Ago 2026",
    descripcion: "Soporte administrativo a la gerencia y coordinación de agenda.",
    funciones: "Gestión documental · Agenda · Atención a proveedores · Reportes",
    requisitos: "Manejo de Excel y herramientas de oficina", educacionMin: "Universitario", experienciaMin: 1,
    competencias: "Organización, comunicación", idiomas: "Inglés básico",
    perfilCartId: "CART-003", estado: "Activa", fecha: "05 Jun 2026",
  },
  {
    id: "VAC-003", puesto: "Analista de Calidad", departamento: "Calidad", sucursal: "Oficina Central", plazas: 1, responsable: "María Rojas",
    requisicionId: "REQ-2026-013",
    motivoContratacion: "Nueva posición", tipoContrato: "Indefinido", jornada: "Completa", modalidad: "Híbrida",
    salarioMin: 650000, salarioMax: 820000, fechaLimite: "15 Sep 2026",
    descripcion: "Apoyo al Sistema de Gestión de Calidad ISO 9001, ejecución de auditorías internas.",
    funciones: "Auditorías internas · Control documental · No conformidades · Indicadores de calidad",
    requisitos: "Formación en ingeniería industrial o afín, conocimiento ISO 9001", educacionMin: "Universitario", experienciaMin: 2,
    competencias: "Atención al detalle, análisis", idiomas: "Inglés intermedio",
    perfilCartId: "CART-002", estado: "Borrador", fecha: "08 Ago 2026",
  },
  {
    id: "VAC-004", puesto: "Mensajero de Campo", departamento: "Logística", sucursal: "Bodega Central", plazas: 2,
    responsable: "Alejandro Vega", requisicionId: "REQ-2026-012",
    motivoContratacion: "Incremento de plantilla", tipoContrato: "Indefinido", jornada: "Completa", modalidad: "Campo",
    salarioMin: 550000, salarioMax: 620000, fechaLimite: "25 Jul 2026",
    descripcion: "Entrega y recolección de paquetería en rutas asignadas del GAM.",
    funciones: "Entregas a domicilio · Recolección de firmas · Reporte de entregas",
    requisitos: "Licencia de moto vigente (A2), disponibilidad para giras cortas", educacionMin: "Sin título", experienciaMin: 1,
    competencias: "Puntualidad, orientación al cliente", idiomas: "No requerido",
    perfilCartId: "CART-004", estado: "Cerrada", fecha: "10 Jul 2026",
  },
];

export const PERFILES_TALENTO_INIT: PerfilTalento[] = [
  { id: "TAL-00381", nombre: "Esteban Vargas", cedula: "1-1234-5678", correo: "e.vargas@gmail.com", telefono: "8654-3210", provincia: "San José", canton: "Desamparados", fuente: "Portal PROCENTER", fechaRegistro: "02 Jun 2026", profesion: "Técnico Electromecánico", educacion: "Técnico", experienciaAnios: 4, idiomas: ["Español"], competencias: ["Mantenimiento", "Soldadura", "Electricidad industrial"], certificaciones: ["INA Electromecánica"], licencia: { tiene: true, categorias: ["B1"], vigencia: "2027" }, vehiculoPropio: "Automóvil", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 820000, cvResumen: "4 años en mantenimiento industrial, soldadura y electricidad.", estado: "en proceso" },
  { id: "TAL-00382", nombre: "Alicia Moreno", cedula: "1-2345-6789", correo: "a.moreno@hotmail.com", telefono: "8833-1122", provincia: "Heredia", canton: "Belén", fuente: "LinkedIn", fechaRegistro: "04 Jun 2026", profesion: "Técnica de Mantenimiento", educacion: "Técnico", experienciaAnios: 3, idiomas: ["Español", "Inglés básico"], competencias: ["Mantenimiento preventivo", "Diagnóstico de fallas"], certificaciones: [], licencia: { tiene: false, categorias: [] }, vehiculoPropio: "No", disponibilidadViajar: false, disponibilidadIngreso: "1-3 meses", expectativaSalarial: 780000, cvResumen: "3 años de experiencia en mantenimiento de maquinaria liviana.", estado: "en proceso" },
  { id: "TAL-00383", nombre: "Ricardo Salas", cedula: "1-3456-7890", correo: "r.salas@yahoo.com", telefono: "8799-4455", provincia: "San José", canton: "Curridabat", fuente: "Referido", fechaRegistro: "28 May 2026", profesion: "Administrador de Empresas", educacion: "Universitario", experienciaAnios: 5, idiomas: ["Español", "Inglés avanzado"], competencias: ["Gestión de agenda", "Excel avanzado", "Atención a proveedores"], certificaciones: ["Excel Avanzado - CENFOTEC"], licencia: { tiene: true, categorias: ["B1"], vigencia: "2026" }, vehiculoPropio: "Automóvil", disponibilidadViajar: false, disponibilidadIngreso: "Inmediata", expectativaSalarial: 700000, cvResumen: "5 años en asistencia administrativa y gerencial.", estado: "en proceso" },
  { id: "TAL-00384", nombre: "Patricia Nuñez", cedula: "1-4567-8901", correo: "p.nunez@gmail.com", telefono: "8600-0000", provincia: "San José", canton: "San José Centro", fuente: "Portal PROCENTER", fechaRegistro: "20 May 2026", profesion: "Secretariado Ejecutivo", educacion: "Técnico", experienciaAnios: 1, idiomas: ["Español"], competencias: ["Digitación", "Atención al cliente"], certificaciones: [], licencia: { tiene: false, categorias: [] }, vehiculoPropio: "No", disponibilidadViajar: false, disponibilidadIngreso: "3+ meses", expectativaSalarial: 480000, cvResumen: "1 año como asistente de oficina.", estado: "no disponible" },
  { id: "TAL-00385", nombre: "Kevin Solano", cedula: "1-5678-9012", correo: "kevin.solano@gmail.com", telefono: "8711-2233", provincia: "San José", canton: "Tibás", fuente: "Feria de empleo", fechaRegistro: "12 Jul 2026", profesion: "Mensajero / Motorizado", educacion: "Sin título", experienciaAnios: 2, idiomas: ["Español"], competencias: ["Manejo defensivo", "Rutas GAM"], certificaciones: [], licencia: { tiene: true, categorias: ["A2"], vigencia: "2028" }, vehiculoPropio: "Motocicleta", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 580000, cvResumen: "2 años como mensajero motorizado en zona GAM.", estado: "disponible" },
  { id: "TAL-00386", nombre: "Daniela Chaves", cedula: "1-6789-0123", correo: "d.chaves@outlook.com", telefono: "8722-3344", provincia: "Alajuela", canton: "Alajuela Centro", fuente: "Indeed", fechaRegistro: "15 Jul 2026", profesion: "Repartidora", educacion: "Sin título", experienciaAnios: 1, idiomas: ["Español"], competencias: ["Atención al cliente", "Rutas rurales"], certificaciones: [], licencia: { tiene: true, categorias: ["A2", "A3"], vigencia: "2027" }, vehiculoPropio: "Motocicleta", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 560000, cvResumen: "1 año de experiencia en entregas con motocicleta propia.", estado: "disponible" },
  { id: "TAL-00387", nombre: "Luis Fernández", cedula: "1-7890-1234", correo: "luis.fernandez@gmail.com", telefono: "8733-4455", provincia: "Cartago", canton: "Cartago Centro", fuente: "Universidad", fechaRegistro: "18 Jul 2026", profesion: "Ingeniero Industrial", educacion: "Universitario", experienciaAnios: 2, idiomas: ["Español", "Inglés intermedio"], competencias: ["ISO 9001", "Auditorías internas", "Control estadístico"], certificaciones: ["Auditor Interno ISO 9001"], licencia: { tiene: true, categorias: ["B1"], vigencia: "2029" }, vehiculoPropio: "Automóvil", disponibilidadViajar: false, disponibilidadIngreso: "1-3 meses", expectativaSalarial: 750000, cvResumen: "2 años en control de calidad y auditorías ISO 9001.", estado: "disponible" },
  { id: "TAL-00388", nombre: "Sofía Ramírez", cedula: "1-8901-2345", correo: "sofia.ramirez@gmail.com", telefono: "8744-5566", provincia: "Heredia", canton: "San Rafael", fuente: "LinkedIn", fechaRegistro: "20 Jul 2026", profesion: "Ingeniera en Calidad", educacion: "Universitario", experienciaAnios: 4, idiomas: ["Español", "Inglés avanzado"], competencias: ["ISO 9001", "Six Sigma", "Excel avanzado"], certificaciones: ["Six Sigma Green Belt"], licencia: { tiene: false, categorias: [] }, vehiculoPropio: "No", disponibilidadViajar: false, disponibilidadIngreso: "Inmediata", expectativaSalarial: 900000, cvResumen: "4 años como analista de calidad en manufactura.", estado: "disponible" },
  { id: "TAL-00389", nombre: "Andrés Jiménez", cedula: "1-9012-3456", correo: "andres.jimenez@hotmail.com", telefono: "8755-6677", provincia: "Puntarenas", canton: "Esparza", fuente: "Carga manual", fechaRegistro: "22 Jul 2026", profesion: "Motorizado / Mensajería", educacion: "Sin título", experienciaAnios: 3, idiomas: ["Español"], competencias: ["Rutas costeras", "Manejo de carga liviana"], certificaciones: [], licencia: { tiene: true, categorias: ["A2"], vigencia: "2026" }, vehiculoPropio: "Motocicleta", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 570000, cvResumen: "3 años de mensajería motorizada en Puntarenas.", estado: "disponible" },
  { id: "TAL-00390", nombre: "Gabriela Solís", cedula: "1-0123-4567", correo: "g.solis@gmail.com", telefono: "8766-7788", provincia: "San José", canton: "Escazú", fuente: "Portal PROCENTER", fechaRegistro: "25 Jul 2026", profesion: "Asistente Administrativa", educacion: "Universitario", experienciaAnios: 2, idiomas: ["Español", "Inglés intermedio"], competencias: ["Agenda", "Facturación", "Atención telefónica"], certificaciones: [], licencia: { tiene: true, categorias: ["B1"], vigencia: "2028" }, vehiculoPropio: "Automóvil", disponibilidadViajar: false, disponibilidadIngreso: "1-3 meses", expectativaSalarial: 620000, cvResumen: "2 años en soporte administrativo y facturación.", estado: "disponible" },
  { id: "TAL-00391", nombre: "Jonathan Araya", cedula: "1-1234-0987", correo: "jonathan.araya@gmail.com", telefono: "8777-8899", provincia: "San José", canton: "Goicoechea", fuente: "Feria de empleo", fechaRegistro: "28 Jul 2026", profesion: "Técnico en Refrigeración", educacion: "Técnico", experienciaAnios: 6, idiomas: ["Español"], competencias: ["Refrigeración", "Electricidad", "Soldadura"], certificaciones: ["INA Refrigeración"], licencia: { tiene: true, categorias: ["A2", "B1"], vigencia: "2027" }, vehiculoPropio: "Motocicleta", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 880000, cvResumen: "6 años en mantenimiento de sistemas de refrigeración y climatización.", estado: "disponible" },
  { id: "TAL-00392", nombre: "Mariana Castro", cedula: "1-2109-8765", correo: "mariana.castro@outlook.com", telefono: "8788-9900", provincia: "Guanacaste", canton: "Liberia", fuente: "Universidad", fechaRegistro: "01 Ago 2026", profesion: "Ingeniera Industrial", educacion: "Universitario", experienciaAnios: 0, idiomas: ["Español", "Inglés avanzado"], competencias: ["Excel", "Power BI"], certificaciones: [], licencia: { tiene: false, categorias: [] }, vehiculoPropio: "No", disponibilidadViajar: true, disponibilidadIngreso: "Inmediata", expectativaSalarial: 550000, cvResumen: "Recién egresada, práctica profesional en control de calidad.", estado: "disponible" },
];

export const POSTULACIONES_INIT: Postulacion[] = [
  { id: "POST-1001", personaId: "TAL-00381", vacanteId: "VAC-001", fuente: "Portal PROCENTER", fecha: "03 Jun 2026", estado: "En proceso" },
  { id: "POST-1002", personaId: "TAL-00382", vacanteId: "VAC-001", fuente: "LinkedIn", fecha: "05 Jun 2026", estado: "En proceso" },
  { id: "POST-1003", personaId: "TAL-00383", vacanteId: "VAC-002", fuente: "Referido", fecha: "29 May 2026", estado: "En proceso" },
  { id: "POST-1004", personaId: "TAL-00384", vacanteId: "VAC-002", fuente: "Portal PROCENTER", fecha: "21 May 2026", estado: "Descartada" },
  { id: "POST-1005", personaId: "TAL-00385", vacanteId: null, fuente: "Feria de empleo", fecha: "12 Jul 2026", estado: "En banco de talento" },
  { id: "POST-1006", personaId: "TAL-00386", vacanteId: null, fuente: "Indeed", fecha: "15 Jul 2026", estado: "En banco de talento" },
];
