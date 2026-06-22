import type { EmpresaData, Company } from "../types";

export const EMPRESAS_INIT: EmpresaData[] = [
  {
    id:"EMP-001",
    nombre:"Grupo Ullons",
    razonSocial:"Grupo Ullons Sociedad Anónima",
    cedula:"3-101-812345",
    sector:"Servicios & Seguridad",
    pais:"Costa Rica",
    moneda:"CRC",
    anoFiscal:"Enero–Diciembre",
    logo:"GU",color:"#E8611A",icono:"🏛️",
    direccion:"San José, Costa Rica, Edificio Central",
    telefono:"+506 2200-0000",
    correo:"info@grupoulons.com",
    web:"procentercr.com",
    representante:"Ronald Umaña",
    activa:true,
    verticales:[
      {
        id:"V-001",nombre:"CSI Seguridad",descripcion:"Servicios de vigilancia y seguridad privada",
        color:"#10B981",icono:"🛡️",activa:true,
        sucursales:["Sede Central San José","Sucursal Heredia","Sucursal Cartago"],
        deptos:["Operaciones","Administración","Calidad","RRHH","Mantenimiento","Logística"],
        centrosCosto:["CC-OPS-001","CC-ADM-001","CC-CAL-001"],
      },
      {
        id:"V-002",nombre:"AS Vertical Servicios",descripcion:"Servicios verticales y consultoría empresarial",
        color:"#3B82F6",icono:"📊",activa:true,
        sucursales:["Sede San José"],
        deptos:["Consultoría","Administración","Tecnología"],
        centrosCosto:["CC-CON-001","CC-TEC-001"],
      },
      {
        id:"V-003",nombre:"Sitepro",descripcion:"Cámaras, monitoreo y tecnología de seguridad",
        color:"#7C3AED",icono:"🎥",activa:true,
        sucursales:["Sede Tecnológica San José"],
        deptos:["Tecnología","Operaciones","Soporte"],
        centrosCosto:["CC-TEC-002","CC-OPS-002"],
      },
    ],
  },
];

export const COMPANIES: Company[] = [
  {id:"csi",name:"CSI Seguridad",group:"Grupo CSI",color:"#10B981",meta:"Admin · ERP Completo · CR",icon:"🛡️"},
  {id:"as",name:"AS — Vertical Servicios",group:"Grupo CSI",color:"#3B82F6",meta:"Solo lectura · ERP + CRM · CR",icon:"📊"},
  {id:"sitepro",name:"Sitepro",group:"Grupo CSI",color:"#7C3AED",meta:"Operativo · Cámaras & Monitoreo · CR",icon:"🎥"},
  {id:"bpo-retail",name:"Retail Corp",group:"BPO RRHH",color:"#F59E0B",meta:"Admin RRHH · Planilla + Asistencia",icon:"🛍️"},
  {id:"bpo-salud",name:"Clínica San Juan",group:"BPO RRHH",color:"#EF4444",meta:"Admin RRHH · Planilla",icon:"🏥"},
  {id:"solo",name:"Mi Empresa SA",group:"Cuenta propia",color:"#10B981",meta:"Admin · Acceso total · CR",icon:"🏢"},
];
