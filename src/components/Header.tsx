import React from "react";
import type { View, Company } from "../types";

export function Header({view,setView,company,onSwitch}:{view:View;setView:(v:View)=>void;company:Company;onSwitch:()=>void}) {
  const getModuleParent=(v:View):View=>{
    if(["inventario","existencias","nuevo","entradas","ingreso","salida","traslado","ajuste","baja","conteo","reabasto","valorizado","trazabilidad"].includes(v)) return "inventario";
    if(["proveeduria","proveedores","ordenes-compra","nueva-oc"].includes(v)) return "proveeduria";
    if(["bi","bi-ejecutivo","bi-rrhh","bi-inv","bi-calidad","reportes"].includes(v)) return "bi";
    if(["rrhh","admin-personal","nomina","asistencia","desempeno","reclutamiento","capacitacion","clima","planillas","config-rrhh"].includes(v)) return "rrhh";
    if(["solicitudes","bandeja"].includes(v)) return "solicitudes";
    if(["config-gral","config-inv","config-finanzas"].includes(v)) return "config-gral";
    if(["empresas","empresa-detalle","verticales"].includes(v)) return "empresas";
    if(["finanzas","libro-diario","cxc","cxp","estados-financieros","flujo-caja","facturacion","banca"].includes(v)) return "finanzas";
    return "inventario";
  };
  const parent=getModuleParent(view);
  const parentLabel:Record<View,string>={inventario:"Inventario",proveeduria:"Proveeduría",bi:"BI & Reportería",rrhh:"Recursos Humanos",solicitudes:"Solicitudes","config-gral":"Configuración",empresas:"Empresas & Verticales",finanzas:"Contabilidad y Finanzas"} as any;
  const bc:Record<View,string>={
    inventario:"Inventario & Proveeduría",existencias:"Inventario › Consulta Existencias",
    nuevo:"Inventario › Nuevo Artículo",entradas:"Inventario › Entradas & Salidas",
    ingreso:"Inventario › Registrar Ingreso",salida:"Inventario › Registrar Salida",
    traslado:"Inventario › Traslado Bodegas",ajuste:"Inventario › Ajuste Inventario",
    baja:"Inventario › Baja / Descarte",conteo:"Inventario › Conteo / Auditoría",
    reabasto:"Inventario › Reabastecimiento",valorizado:"Inventario › Inv. Valorizado",
    trazabilidad:"Inventario › Trazabilidad",
    proveeduria:"Proveeduría",proveedores:"Proveeduría › Proveedores",
    "ordenes-compra":"Proveeduría › Órdenes de Compra","nueva-oc":"Proveeduría › Nueva Orden de Compra",
    bi:"BI & Reportería",reportes:"BI › Generador Reportes",
    solicitudes:"Solicitudes › Nueva Solicitud",bandeja:"Solicitudes › Bandeja de Gestión",
    "config-inv":"Configuración › Inventario",
    "config-gral":"Configuración › General & Catálogos",
    "config-rrhh":"Configuración › RRHH & Nómina",
    "planillas":"RRHH › Catálogo de Planillas",
    "empresas":"Gestión de Empresas",
    "empresa-detalle":"Empresas › Detalle de empresa",
    "verticales":"Empresas › Verticales & Divisiones",
    rrhh:"Recursos Humanos",
    "admin-personal":"RRHH › Administración de Personal",
    nomina:"RRHH › Nómina y Compensaciones",
    asistencia:"RRHH › Control de Asistencia",
    desempeno:"RRHH › Gestión del Desempeño",
    reclutamiento:"RRHH › Reclutamiento y Selección",
    capacitacion:"RRHH › Capacitación y Desarrollo",
    clima:"RRHH › Clima & Salud Ocupacional",
    "bi-ejecutivo":"BI › Dashboard Ejecutivo",
    "bi-rrhh":"BI › RRHH & Nómina",
    "bi-inv":"BI › Inventario & Proveeduría",
    "bi-calidad":"BI › Calidad ISO",
    finanzas:"Contabilidad y Finanzas",
    "libro-diario":"Finanzas › Libro Diario",
    cxc:"Finanzas › Cuentas por Cobrar",
    cxp:"Finanzas › Cuentas por Pagar",
    "estados-financieros":"Finanzas › Estados Financieros",
    "flujo-caja":"Finanzas › Flujo de Caja",
    facturacion:"Finanzas › Facturación Electrónica",
    banca:"Finanzas › Conexión Bancaria",
    "config-finanzas":"Configuración › Finanzas",
  };
  return (
    <div className="header">
      <div className="header-search">
        <span>🔍</span>
        <input placeholder="Buscar en PROCENTER..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/>
      </div>
      <div style={{fontSize:"12px",color:"#6B7280",marginLeft:"10px",display:"flex",alignItems:"center",gap:"5px"}}>
        <span style={{cursor:"pointer",padding:"4px 8px",borderRadius:"4px",transition:"all .15s"}} onClick={()=>setView("inventario")} onMouseOver={e=>(e.currentTarget as HTMLElement).style.background="#F3F4F6"} onMouseOut={e=>(e.currentTarget as HTMLElement).style.background="transparent"} title="Ir a Inventario">🏠</span>
        <span style={{color:"#D1D5DB"}}>›</span>
        <span style={{cursor:"pointer",padding:"4px 8px",borderRadius:"4px",transition:"all .15s"}} onClick={()=>setView(parent)} onMouseOver={e=>(e.currentTarget as HTMLElement).style.background="#F3F4F6"} onMouseOut={e=>(e.currentTarget as HTMLElement).style.background="transparent"} title={`Ir a ${parentLabel[parent]||parent}`}>{parentLabel[parent]||parent}</span>
        {view!==parent&&<><span style={{color:"#D1D5DB"}}>›</span><span>{bc[view]?.split("›").pop()?.trim()||bc[view]}</span></>}
      </div>
      <div className="header-company-pill" onClick={onSwitch}>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:company.color}}/>
        <span style={{fontSize:"12px",fontWeight:600}}>{company.name}</span>
        <span style={{color:"#9CA3AF",fontSize:"10px"}}>⇄</span>
      </div>
      <div className="header-right">
        <div className="header-icon-btn">🔔<div className="notif-dot"/></div>
        <div className="header-icon-btn">📈</div>
        <div className="header-icon-btn">✉️</div>
        <div className="header-user">
          <div className="header-user-info">
            <div className="header-user-name">Bienvenido, Ronald</div>
            <div className="header-user-role">Super Admin · {company.group}</div>
          </div>
          <div className="user-avatar" style={{width:28,height:28,fontSize:10}}>RD</div>
        </div>
      </div>
    </div>
  );
}
