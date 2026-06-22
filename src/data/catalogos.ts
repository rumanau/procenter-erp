export const CATALOGOS_INIT = {
  bodegas: [
    {id:"B1",nombre:"Bodega Central",ubicacion:"San José",encargado:"Jules Ramirez",activa:true},
    {id:"B2",nombre:"Bodega 2",ubicacion:"Heredia",encargado:"María Rojas",activa:true},
    {id:"B3",nombre:"Bodega 3 — Taller",ubicacion:"San José",encargado:"Jules Ramirez",activa:true},
  ],
  areas: [
    {id:"A1",nombre:"Operaciones",dept:"Operaciones"},
    {id:"A2",nombre:"Administración",dept:"Administración"},
    {id:"A3",nombre:"Mantenimiento",dept:"Mantenimiento"},
    {id:"A4",nombre:"Producción",dept:"Operaciones"},
    {id:"A5",nombre:"Calidad",dept:"Calidad"},
    {id:"A6",nombre:"Logística",dept:"Operaciones"},
  ],
  tiposSalida: [
    {id:"TS1",nombre:"Uso Operativo"},
    {id:"TS2",nombre:"Venta"},
    {id:"TS3",nombre:"Préstamo"},
    {id:"TS4",nombre:"Mantenimiento Externo"},
    {id:"TS5",nombre:"Descarte / Baja"},
    {id:"TS6",nombre:"Devolución a Proveedor"},
    {id:"TS7",nombre:"Traslado entre bodegas"},
  ],
  motivosAjuste: [
    {id:"MA1",nombre:"Diferencia de conteo físico"},
    {id:"MA2",nombre:"Error de registro previo"},
    {id:"MA3",nombre:"Artículo encontrado"},
    {id:"MA4",nombre:"Devolución no registrada"},
    {id:"MA5",nombre:"Daño parcial"},
  ],
  proyectos: [
    {id:"P1",nombre:"PRO-2024-088",descripcion:"Proyecto Seguridad Perimetral",activo:true},
    {id:"P2",nombre:"OT-2024-0312",descripcion:"Mantenimiento Bodega Central",activo:true},
    {id:"P3",nombre:"PRO-2024-091",descripcion:"Expansión Bodega 2",activo:true},
  ],
  categorias: [
    {id:"C1",nombre:"Herramienta",prefijo:"HER"},
    {id:"C2",nombre:"Consumible",prefijo:"CON"},
    {id:"C3",nombre:"Insumo",prefijo:"INS"},
    {id:"C4",nombre:"Electrónica",prefijo:"ELE"},
    {id:"C5",nombre:"Seguridad",prefijo:"SEG"},
    {id:"C6",nombre:"Activo Fijo",prefijo:"ACT"},
  ],
  sucursales: [
    {id:"S1",nombre:"Casa Matriz — San José",principal:true},
    {id:"S2",nombre:"Sucursal Heredia",principal:false},
    {id:"S3",nombre:"Sucursal Alajuela",principal:false},
  ],
  proveedores: [
    {id:"PV1",nombre:"TechnoSupply",contacto:"ventas@techno.com",condicion:"30 días",rating:"A+",activo:true},
    {id:"PV2",nombre:"MegaTools",contacto:"info@megatools.com",condicion:"Contado",rating:"A",activo:true},
    {id:"PV3",nombre:"ElectroMayorista",contacto:"elect@mayo.com",condicion:"60 días",rating:"B+",activo:true},
    {id:"PV4",nombre:"InsumosCR",contacto:"ventas@insumos.cr",condicion:"15 días",rating:"A",activo:true},
  ],
  responsablesAutorizados: [
    {id:"R1",nombre:"Ronald",puesto:"Director General",nivel:3},
    {id:"R2",nombre:"Jules Ramirez",puesto:"Supervisor Bodega",nivel:2},
    {id:"R3",nombre:"María Rojas",puesto:"Coord. Calidad",nivel:2},
    {id:"R4",nombre:"Sofía Méndez",puesto:"Analista RRHH",nivel:1},
  ],
  roles: [
    {id:"ROL1",nombre:"Super Admin",permisos:"Todo",color:"#E8611A"},
    {id:"ROL2",nombre:"Director",permisos:"Lectura + Aprobación",color:"#3B82F6"},
    {id:"ROL3",nombre:"Supervisor",permisos:"Operativo + Reportes",color:"#10B981"},
    {id:"ROL4",nombre:"Operativo",permisos:"Solo operación",color:"#F59E0B"},
    {id:"ROL5",nombre:"Solo lectura",permisos:"Consulta",color:"#9CA3AF"},
  ],
  planillas: [
    {
      id:"PL1",nombre:"Planilla Administrativa",estado:"activa",
      banco:"BAC San José",cuenta:"CR21-0151-0001-0026-3490-4",moneda:"CRC",frecuencia:"Mensual",
      ccssObrero:7.45,ccssPatronal:26.33,heRegular:1.5,heDoble:2.0,
      flujoAprobacion:["Empleado","Jefatura","Gerencia","Contabilidad"],
      empleadosIds:["COL-004","COL-006"],tipo:"Fija",color:"#10B981",
      autorizador:"Ronald",descripcion:"Personal administrativo y RRHH",
    },
    {
      id:"PL2",nombre:"Planilla Operativa",estado:"activa",
      banco:"BCR",cuenta:"CR05-0152-0001-0877-6325-1",moneda:"CRC",frecuencia:"Mensual",
      ccssObrero:7.45,ccssPatronal:26.33,heRegular:1.5,heDoble:2.0,
      flujoAprobacion:["Supervisor","Gerencia"],
      empleadosIds:["COL-001","COL-002","COL-003","COL-005","COL-007","COL-008"],tipo:"Fija",color:"#3B82F6",
      autorizador:"Jules Ramirez",descripcion:"Personal operativo y mantenimiento",
    },
    {
      id:"PL3",nombre:"Planilla Outsourcing",estado:"activa",
      banco:"BAC San José",cuenta:"CR21-0151-0001-0026-3490-9",moneda:"USD",frecuencia:"Quincenal",
      ccssObrero:0,ccssPatronal:0,heRegular:1.0,heDoble:1.5,
      flujoAprobacion:["Gerencia"],
      empleadosIds:[],tipo:"Outsourcing",color:"#7C3AED",
      autorizador:"Ronald",descripcion:"Contratos de outsourcing y servicios externos",
    },
    {
      id:"PL4",nombre:"Planilla Comisiones",estado:"borrador",
      banco:"BAC San José",cuenta:"CR21-0151-0001-0026-3490-4",moneda:"CRC",frecuencia:"Mensual",
      ccssObrero:7.45,ccssPatronal:26.33,heRegular:1.5,heDoble:2.0,
      flujoAprobacion:["Jefatura","Gerencia"],
      empleadosIds:[],tipo:"Variable",color:"#F59E0B",
      autorizador:"Ronald",descripcion:"Bonos y comisiones variables por desempeño",
    },
  ],
};

export const EXISTENCIAS = [
  {cod:"INV-HR-00158",name:"Taladro Inalámbrico DeWalt 20V",cat:"Herramienta",bodega:"Bodega Central",stock:22,min:5,max:50,costo:3150,estado:"ok"},
  {cod:"HI-SKU-0210",name:"Escalera Tipo Tijera 6 Est.",cat:"Herramienta",bodega:"Bodega Central",stock:18,min:20,max:40,costo:625,estado:"bajo"},
  {cod:"PCT-00548",name:'Caja de Herramientas 18" Amarilla',cat:"Consumible",bodega:"Bodega 3",stock:3,min:10,max:30,costo:890,estado:"critico"},
  {cod:"HER-EQO-000154",name:'Grapadora Neumática 1"',cat:"Herramienta",bodega:"Bodega Central",stock:9,min:5,max:25,costo:420,estado:"ok"},
  {cod:"TOR-1/4-002",name:'Tornillos 1/4" × 2" (caja 100u)',cat:"Insumo",bodega:"Bodega Central",stock:145,min:200,max:1000,costo:0.85,estado:"bajo"},
  {cod:"MAR-16OZ-001",name:"Martillo Carpintero 16 oz.",cat:"Herramienta",bodega:"Bodega 2",stock:12,min:8,max:20,costo:280,estado:"ok"},
  {cod:"REG-APC-200",name:"Regulador Voltaje APC 200VA",cat:"Electrónica",bodega:"Bodega 3",stock:4,min:5,max:15,costo:1200,estado:"bajo"},
  {cod:"EXT-3K-001",name:"Extintor 3KG ABC",cat:"Seguridad",bodega:"Bodega Central",stock:8,min:6,max:20,costo:350,estado:"ok"},
];

export const SOLICITUDES_DATA = [
  {id:"SOL-2024-001",tipo:"Uniformes",categoria:"inventario",solicitante:"Carlos Montoya",fecha:"28 Abr 2024",estado:"pendiente" as const,urgencia:"alta" as const,descripcion:"Solicitud de 3 camisas talla M para personal de bodega",horas:48},
  {id:"SOL-2024-002",tipo:"Vacaciones",categoria:"rrhh",solicitante:"María Rojas",fecha:"27 Abr 2024",estado:"en-proceso" as const,urgencia:"media" as const,descripcion:"Solicitud de 5 días hábiles del 6 al 12 de mayo",horas:72},
  {id:"SOL-2024-003",tipo:"Herramienta",categoria:"inventario",solicitante:"Juan Pérez",fecha:"26 Abr 2024",estado:"pendiente" as const,urgencia:"alta" as const,descripcion:"Necesito taladro inalámbrico para mantenimiento urgente en bodega 3",horas:96},
  {id:"SOL-2024-004",tipo:"Incapacidad",categoria:"rrhh",solicitante:"Ana Vargas",fecha:"25 Abr 2024",estado:"aprobada" as const,urgencia:"baja" as const,descripcion:"Tramitación de incapacidad médica del 20 al 25 de abril",horas:24},
  {id:"SOL-2024-005",tipo:"Constancia",categoria:"rrhh",solicitante:"Pedro Salas",fecha:"24 Abr 2024",estado:"pendiente" as const,urgencia:"media" as const,descripcion:"Constancia salarial para trámite bancario",horas:120},
  {id:"SOL-2024-006",tipo:"Compra equipo",categoria:"inventario",solicitante:"Alejandro Vega",fecha:"23 Abr 2024",estado:"rechazada" as const,urgencia:"baja" as const,descripcion:"Compra de extintor para área administrativa",horas:168},
  {id:"SOL-2024-007",tipo:"Permiso",categoria:"rrhh",solicitante:"Sofía Méndez",fecha:"22 Abr 2024",estado:"en-proceso" as const,urgencia:"media" as const,descripcion:"Permiso personal medio día 30 de abril",horas:48},
  {id:"SOL-2024-008",tipo:"Mantenimiento",categoria:"operativo",solicitante:"Luis Herrera",fecha:"21 Abr 2024",estado:"pendiente" as const,urgencia:"alta" as const,descripcion:"Reparación urgente de compresor en área de producción",horas:144},
];

export const WIDGET_CATS = [
  {cat:"KPI & Scorecards",items:[
    {icon:"📊",label:"KPI Scorecard",type:"kpi"},
    {icon:"⏱️",label:"Gauge Progresivo",type:"gauge"},
    {icon:"🎯",label:"Bullet Graph",type:"bullet"},
    {icon:"📈",label:"Sparkline Tendencia",type:"tendencia"},
    {icon:"🏆",label:"Ranking Top",type:"ranking"},
    {icon:"🔖",label:"Indicator Badge",type:"badge"},
  ]},
  {cat:"Operaciones & Control SPC",items:[
    {icon:"🎯",label:"X̄-R Control (SPC)",type:"spc"},
    {icon:"📉",label:"Pareto Interactivo",type:"pareto"},
    {icon:"📦",label:"Boxplot",type:"boxplot"},
    {icon:"🔽",label:"Burndown Chart",type:"burndown"},
    {icon:"🗺️",label:"Treemap",type:"treemap"},
    {icon:"📅",label:"Gantt",type:"gantt"},
  ]},
  {cat:"Relaciones & Flujo",items:[
    {icon:"🌊",label:"Sankey Diagram",type:"sankey"},
    {icon:"✦",label:"Scatter Plot",type:"dispersion"},
    {icon:"🫧",label:"Bubble Chart",type:"burbuja"},
    {icon:"🔽",label:"Funnel Chart",type:"embudo"},
    {icon:"🌡️",label:"Heatmap Matriz",type:"heatmap"},
    {icon:"⚠️",label:"Matriz de Riesgo",type:"riesgo"},
  ]},
  {cat:"Series de Tiempo",items:[
    {icon:"📈",label:"Dual-Axis Line",type:"dual_axis"},
    {icon:"🌊",label:"Area Stacked",type:"area_stack"},
    {icon:"🕯️",label:"Candlestick",type:"candlestick"},
    {icon:"📊",label:"Histograma",type:"histograma"},
    {icon:"🌐",label:"Radar",type:"radar"},
    {icon:"📅",label:"Calendario",type:"calendario"},
  ]},
  {cat:"Financiero & Costos",items:[
    {icon:"💧",label:"Waterfall",type:"waterfall"},
    {icon:"🥧",label:"Circular",type:"circular"},
    {icon:"📉",label:"Área tendencia",type:"area"},
    {icon:"📊",label:"Barras",type:"barras"},
  ]},
  {cat:"Nivel Dios & IA",items:[
    {icon:"🤖",label:"Predicción IA",type:"prediccion"},
    {icon:"🚨",label:"Anomaly Alert",type:"anomalias"},
    {icon:"🔔",label:"Alertas IA",type:"alertas_ia"},
    {icon:"💰",label:"Pred. Costos",type:"pred_costos"},
    {icon:"📋",label:"Data Grid",type:"data_grid"},
    {icon:"🎛️",label:"Metric Filter",type:"metric_filter"},
  ]},
];

export const REPORT_FIELDS_DATA = [
  {label:"Código del artículo",sel:true},{label:"Nombre / Descripción",sel:true},{label:"Categoría",sel:true},
  {label:"Bodega / Ubicación",sel:true},{label:"Stock actual",sel:true},{label:"Stock mínimo",sel:false},
  {label:"Costo unitario",sel:true},{label:"Valor total",sel:true},{label:"Proveedor",sel:false},
  {label:"Estado (semáforo)",sel:true},{label:"Clasificación ABC",sel:false},{label:"Fecha caducidad",sel:false},
];

export const STEPS = ["Características","Clasificación","Almacenamiento","Costos / Proveedor","Avanzado","Código"];

export const BI_FUENTES: {[k:string]:{label:string;variables:{key:string;label:string;datos:()=>number[]}[];etiquetas:string[]}} = {
  inventario: {
    label:"📦 Inventario",
    variables:[
      {key:"stock",    label:"Stock actual",     datos:()=>[22,18,3,9,145,12,4,8]},
      {key:"valor",    label:"Valor total ($)",  datos:()=>[69300,11250,2670,3780,123,3360,4800,2800]},
      {key:"minimo",   label:"Stock mínimo",     datos:()=>[5,20,10,5,200,8,5,6]},
      {key:"costo",    label:"Costo unitario",   datos:()=>[3150,625,890,420,1,280,1200,350]},
    ],
    etiquetas:["Taladro","Escalera","C.Herr.","Grapadora","Tornillos","Martillo","Regulador","Extintor"],
  },
  nomina: {
    label:"💰 Nómina",
    variables:[
      {key:"salario",label:"Salario bruto (₡)",datos:()=>[950000,880000,720000,680000,650000,820000,750000,620000]},
      {key:"neto",   label:"Salario neto (₡)", datos:()=>[806750,747800,611200,577400,551750,696100,637500,526700]},
      {key:"ccss",   label:"Deducción CCSS",   datos:()=>[70775,65480,53580,50620,48425,61090,55875,46190]},
    ],
    etiquetas:["M.Rojas","J.Ramirez","C.Montoya","A.Vargas","P.Salas","S.Méndez","L.Herrera","A.Vega"],
  },
  asistencia: {
    label:"🕐 Asistencia",
    variables:[
      {key:"pct",      label:"% Asistencia",  datos:()=>[98,95,88,100,92,97,90,99]},
      {key:"he",       label:"Horas extra",    datos:()=>[0,4,8,0,12,0,6,2]},
      {key:"ausencias",label:"Días ausentes",  datos:()=>[0,1,3,0,2,1,2,0]},
    ],
    etiquetas:["M.Rojas","J.Ramirez","C.Montoya","A.Vargas","P.Salas","S.Méndez","L.Herrera","A.Vega"],
  },
  desempeno: {
    label:"📊 Desempeño",
    variables:[
      {key:"score",label:"Score Q1 2025",datos:()=>[92,85,78,88,80,95,82,87]},
      {key:"meta", label:"Meta score",   datos:()=>[90,90,85,90,85,90,85,85]},
    ],
    etiquetas:["M.Rojas","J.Ramirez","C.Montoya","A.Vargas","P.Salas","S.Méndez","L.Herrera","A.Vega"],
  },
  calidad: {
    label:"✅ Calidad ISO",
    variables:[
      {key:"cumplimiento",label:"% Cumplimiento",datos:()=>[100,95,90,87,92,88,85]},
      {key:"nc",          label:"NC abiertas",   datos:()=>[0,1,2,3,1,2,3]},
    ],
    etiquetas:["§4","§5","§6","§7","§8","§9","§10"],
  },
};

export const BI_TIPOS_GRAFICA = [
  {cat:"Distribución",items:[
    {id:"barras",      icon:"📊",label:"Barras verticales",   desc:"Compara valores entre categorías"},
    {id:"barras_h",    icon:"📉",label:"Barras horizontales",  desc:"Ideal para muchas categorías"},
    {id:"histograma",  icon:"📈",label:"Histograma",           desc:"Distribución de frecuencias"},
    {id:"circular",    icon:"🥧",label:"Gráfica circular",     desc:"Proporciones del total"},
    {id:"pareto",      icon:"📋",label:"Diagrama de Pareto",   desc:"80/20 · Causas principales"},
  ]},
  {cat:"Tendencia & Series de tiempo",items:[
    {id:"lineas",      icon:"📈",label:"Gráfica de líneas",    desc:"Tendencia a lo largo del tiempo"},
    {id:"area",        icon:"🌊",label:"Gráfica de área",      desc:"Tendencia con volumen visual"},
    {id:"lineas_multi",icon:"📉",label:"Líneas múltiples",     desc:"Compara dos variables"},
  ]},
  {cat:"Relación & Correlación",items:[
    {id:"dispersion",  icon:"✦", label:"Dispersión (X-Y)",    desc:"Relación entre dos variables"},
    {id:"burbuja",     icon:"🫧",label:"Burbujas",             desc:"Dispersión con tamaño variable"},
  ]},
  {cat:"Control Calidad (SPC)",items:[
    {id:"spc_xbar",    icon:"🎯",label:"Gráfica X̄-R control",  desc:"UCL/LCL · Puntos fuera de control"},
    {id:"capacidad",   icon:"⚡",label:"Análisis de capacidad", desc:"Cp, Cpk · Curva normal"},
  ]},
  {cat:"Estadísticas descriptivas",items:[
    {id:"boxplot",     icon:"📦",label:"Gráfica de caja",      desc:"Mediana, cuartiles, outliers"},
    {id:"radar",       icon:"🕸️",label:"Gráfica de radar",    desc:"Multi-variable en polígono"},
    {id:"heatmap",     icon:"🌡️",label:"Mapa de calor",       desc:"Intensidad en matriz"},
  ]},
  {cat:"Financiero & Gestión",items:[
    {id:"waterfall",   icon:"🌊",label:"Cascada (waterfall)",  desc:"Variación incremental"},
    {id:"treemap",     icon:"🗺️",label:"Mapa de árbol",       desc:"Proporción jerárquica"},
    {id:"gauge",       icon:"⏱️",label:"Velocímetro (KPI)",   desc:"Un valor vs meta"},
  ]},
];
