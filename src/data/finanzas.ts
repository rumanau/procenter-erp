import type { CuentaContable, AsientoContable, Factura, CuentaBancaria, MovimientoBancario, Moneda } from "../types";

export const PLAN_CUENTAS: CuentaContable[] = [
  {codigo:"1101",nombre:"Bancos",tipo:"activo",naturaleza:"deudora"},
  {codigo:"1102",nombre:"Caja chica",tipo:"activo",naturaleza:"deudora"},
  {codigo:"1103",nombre:"Cuentas por cobrar clientes",tipo:"activo",naturaleza:"deudora"},
  {codigo:"1104",nombre:"Inventario de mercancías",tipo:"activo",naturaleza:"deudora"},
  {codigo:"1201",nombre:"Mobiliario y equipo",tipo:"activo",naturaleza:"deudora"},
  {codigo:"1202",nombre:"Depreciación acumulada",tipo:"activo",naturaleza:"acreedora"},
  {codigo:"2101",nombre:"CCSS por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2102",nombre:"Renta por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2103",nombre:"OPC por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2104",nombre:"Banco Popular por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2105",nombre:"Cuentas por pagar proveedores",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2106",nombre:"IVA por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2107",nombre:"Aguinaldo por pagar",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"2201",nombre:"Préstamos por pagar L/P",tipo:"pasivo",naturaleza:"acreedora"},
  {codigo:"3101",nombre:"Capital social",tipo:"patrimonio",naturaleza:"acreedora"},
  {codigo:"3102",nombre:"Utilidades retenidas",tipo:"patrimonio",naturaleza:"acreedora"},
  {codigo:"4101",nombre:"Ventas de servicios",tipo:"ingreso",naturaleza:"acreedora"},
  {codigo:"4102",nombre:"Ventas de productos",tipo:"ingreso",naturaleza:"acreedora"},
  {codigo:"6101",nombre:"Gasto de sueldos y salarios",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6201",nombre:"CCSS patronal",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6202",nombre:"Provisión aguinaldo",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6301",nombre:"Gastos administrativos",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6302",nombre:"Gastos de operación",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6303",nombre:"Alquileres",tipo:"gasto",naturaleza:"deudora"},
  {codigo:"6304",nombre:"Servicios públicos",tipo:"gasto",naturaleza:"deudora"},
];

export const ASIENTOS_INIT: AsientoContable[] = [
  {
    id:"AS-2024-001",fecha:"01 May 2024",concepto:"Apertura de capital social",origen:"Manual",estado:"aprobado",
    lineas:[
      {cuenta:"1101",descripcion:"Depósito inicial",debito:15000000,credito:0},
      {cuenta:"3101",descripcion:"Capital social",debito:0,credito:15000000},
    ],
  },
  {
    id:"AS-2024-002",fecha:"05 May 2024",concepto:"Compra de mobiliario y equipo",origen:"Manual",estado:"aprobado",
    lineas:[
      {cuenta:"1201",descripcion:"Equipo de oficina",debito:2400000,credito:0},
      {cuenta:"1101",descripcion:"Pago por banco",debito:0,credito:2400000},
    ],
  },
  {
    id:"AS-2024-003",fecha:"10 May 2024",concepto:"Facturación servicios de seguridad — CSI",origen:"Facturación",estado:"aprobado",
    lineas:[
      {cuenta:"1103",descripcion:"Factura FE-0041",debito:3390000,credito:0},
      {cuenta:"4101",descripcion:"Ventas de servicios",debito:0,credito:3000000},
      {cuenta:"2106",descripcion:"IVA débito 13%",debito:0,credito:390000},
    ],
  },
  {
    id:"AS-2024-004",fecha:"18 May 2024",concepto:"Compra de insumos de bodega",origen:"Manual",estado:"aprobado",
    lineas:[
      {cuenta:"1104",descripcion:"Insumos varios",debito:820000,credito:0},
      {cuenta:"2105",descripcion:"TechnoSupply CR S.A.",debito:0,credito:820000},
    ],
  },
];

export const FACTURAS_CXC_INIT: Factura[] = [
  {id:"FE-0041",tipo:"cxc",contraparte:"AS — Vertical Servicios",cedula:"3-101-445566",fechaEmision:"10 May 2024",fechaVencimiento:"09 Jun 2024",moneda:"CRC",monto:3390000,saldo:3390000,estado:"pendiente",consecutivo:"00100001010000000041",claveHacienda:"50610052400031010144556600100001010000000041100000001",estadoHacienda:"aceptado"},
  {id:"FE-0040",tipo:"cxc",contraparte:"Retail Corp",cedula:"3-101-778899",fechaEmision:"28 Abr 2024",fechaVencimiento:"28 May 2024",moneda:"CRC",monto:1250000,saldo:0,estado:"pagada",consecutivo:"00100001010000000040",claveHacienda:"50628042400031010177889900100001010000000040100000009",estadoHacienda:"aceptado"},
  {id:"FE-0039",tipo:"cxc",contraparte:"Clínica San Juan",cedula:"3-101-223344",fechaEmision:"15 Abr 2024",fechaVencimiento:"15 May 2024",moneda:"CRC",monto:980000,saldo:980000,estado:"vencida",consecutivo:"00100001010000000039",claveHacienda:"50615042400031010122334400100001010000000039100000005",estadoHacienda:"aceptado"},
  {id:"FE-0038",tipo:"cxc",contraparte:"Sitepro",cedula:"3-101-991122",fechaEmision:"02 Abr 2024",fechaVencimiento:"02 May 2024",moneda:"CRC",monto:2100000,saldo:600000,estado:"parcial",consecutivo:"00100001010000000038",claveHacienda:"50602042400031010199112200100001010000000038100000002",estadoHacienda:"aceptado"},
  {id:"FE-0037",tipo:"cxc",contraparte:"Mi Empresa SA",cedula:"3-101-556677",fechaEmision:"20 Mar 2024",fechaVencimiento:"19 Abr 2024",moneda:"CRC",monto:540000,saldo:540000,estado:"vencida",consecutivo:"00100001010000000037",claveHacienda:"50620032400031010155667700100001010000000037100000007",estadoHacienda:"aceptado"},
];

export const FACTURAS_CXP_INIT: Factura[] = [
  {id:"PROV-1182",tipo:"cxp",contraparte:"TechnoSupply CR S.A.",cedula:"3-101-334455",fechaEmision:"18 May 2024",fechaVencimiento:"17 Jun 2024",moneda:"CRC",monto:820000,saldo:820000,estado:"pendiente"},
  {id:"PROV-1179",tipo:"cxp",contraparte:"ElectroMayorista",cedula:"3-101-667788",fechaEmision:"24 May 2024",fechaVencimiento:"23 Jun 2024",moneda:"CRC",monto:267000,saldo:267000,estado:"pendiente"},
  {id:"PROV-1160",tipo:"cxp",contraparte:"ICE",cedula:"4-000-042147",fechaEmision:"02 May 2024",fechaVencimiento:"17 May 2024",moneda:"CRC",monto:412500,saldo:0,estado:"pagada"},
  {id:"PROV-1155",tipo:"cxp",contraparte:"Arrendadora Central",cedula:"3-101-112233",fechaEmision:"01 May 2024",fechaVencimiento:"05 May 2024",moneda:"CRC",monto:1800000,saldo:1800000,estado:"vencida"},
  {id:"PROV-1140",tipo:"cxp",contraparte:"Prod. Línea A",cedula:"3-101-889900",fechaEmision:"27 Abr 2024",fechaVencimiento:"27 May 2024",moneda:"CRC",monto:140000,saldo:140000,estado:"pendiente"},
];

export const CUENTAS_BANCARIAS_INIT: CuentaBancaria[] = [
  {id:"CTA-01",banco:"Banco de Costa Rica",alias:"BCR Corriente Colones",numero:"CR05-0001-2024-56789",moneda:"CRC",saldo:8640000,conectada:true,ultimaSync:"Hace 12 min"},
  {id:"CTA-02",banco:"BAC Credomatic",alias:"BAC Ahorro Dólares",numero:"CR21-0002-2024-11223",moneda:"USD",saldo:4200,conectada:true,ultimaSync:"Hace 12 min"},
  {id:"CTA-03",banco:"Banco Popular",alias:"Popular Planillas",numero:"CR15-0005-2024-33445",moneda:"CRC",saldo:1950000,conectada:false},
];

export const MOVIMIENTOS_BANCARIOS_INIT: MovimientoBancario[] = [
  {id:"MOV-101",cuentaId:"CTA-01",fecha:"05 Jun 2024",descripcion:"Transferencia recibida — AS Vertical Servicios",monto:3390000,tipo:"credito",conciliado:false},
  {id:"MOV-100",cuentaId:"CTA-01",fecha:"03 Jun 2024",descripcion:"SINPE MOVIL — TechnoSupply CR",monto:820000,tipo:"debito",conciliado:false},
  {id:"MOV-099",cuentaId:"CTA-01",fecha:"31 May 2024",descripcion:"Pago planilla mayo — Popular",monto:9820000,tipo:"debito",conciliado:true},
  {id:"MOV-098",cuentaId:"CTA-01",fecha:"28 May 2024",descripcion:"Transferencia recibida — Retail Corp",monto:1250000,tipo:"credito",conciliado:true},
  {id:"MOV-097",cuentaId:"CTA-01",fecha:"17 May 2024",descripcion:"Pago ICE — Servicios públicos",monto:412500,tipo:"debito",conciliado:true},
  {id:"MOV-096",cuentaId:"CTA-02",fecha:"20 May 2024",descripcion:"Cobro cliente USD — Sitepro",monto:1050,tipo:"credito",conciliado:true},
];

export const MONEDAS: Moneda[] = [
  {codigo:"CRC",nombre:"Colón costarricense",simbolo:"₡",tipoCambio:1},
  {codigo:"USD",nombre:"Dólar estadounidense",simbolo:"$",tipoCambio:524.30},
  {codigo:"EUR",nombre:"Euro",simbolo:"€",tipoCambio:567.80},
];

export const FLUJO_CAJA_PROYECTADO = [
  {periodo:"Sem. 1 Jun",ingresos:3390000,egresos:2100000},
  {periodo:"Sem. 2 Jun",ingresos:1200000,egresos:9820000},
  {periodo:"Sem. 3 Jun",ingresos:980000,egresos:1300000},
  {periodo:"Sem. 4 Jun",ingresos:2600000,egresos:1450000},
  {periodo:"Sem. 1 Jul",ingresos:3100000,egresos:2200000},
  {periodo:"Sem. 2 Jul",ingresos:1450000,egresos:9950000},
];
