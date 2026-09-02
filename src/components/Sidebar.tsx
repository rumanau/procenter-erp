import React, { useState } from "react";
import type { View, Company } from "../types";
import { ProcenterIsotipo } from "./Logo";

const GRUPOS:Record<string,View[]>={
  inventario:["inventario","existencias","nuevo","entradas","ingreso","salida","traslado","ajuste","baja","conteo","reabasto","valorizado","trazabilidad","solicitudes-inventario","importar-articulos"],
  proveeduria:["proveeduria","proveedores","resumen-proveedores","ordenes-compra","nueva-oc","comparador","cotizaciones","nueva-cotizacion","solicitudes-proveeduria"],
  solicitudes:["solicitudes","bandeja"],
  bi:["bi","reportes","bi-ejecutivo","bi-rrhh","bi-inv","bi-calidad"],
  rrhh:["rrhh","admin-personal","nomina","asistencia","desempeno","reclutamiento","capacitacion","clima","planillas","config-rrhh","solicitudes-rrhh"],
  finanzas:["finanzas","libro-diario","cxc","cxp","estados-financieros","flujo-caja","facturacion","banca","solicitudes-finanzas"],
  empresas:["empresas","empresa-detalle","verticales"],
};
const grupoDeVista=(v:View):string|null=>Object.keys(GRUPOS).find(g=>GRUPOS[g].includes(v))||null;

export function Sidebar({view,setView,setStep,company,onSwitch,collapsed,setCollapsed}:
  {view:View;setView:(v:View)=>void;setStep:(s:number)=>void;company:Company;onSwitch:()=>void;collapsed:boolean;setCollapsed:(b:boolean)=>void}) {

  const [abiertos,setAbiertos]=useState<Record<string,boolean>>(()=>{
    const activo=grupoDeVista(view);
    return activo?{[activo]:true}:{};
  });
  const toggleGrupo=(g:string)=>setAbiertos(prev=>({...prev,[g]:!prev[g]}));

  const ni=(id:View|null,label:string,icon:string,active:boolean,action?:()=>void,grupo?:string)=>{
    const expandible=!!grupo;
    const abierto=grupo?(abiertos[grupo]??false):false;
    return (
      <div className={`nav-item ${active?"active":""}`} onClick={action??(()=>{id&&setView(id);if(grupo)setAbiertos(prev=>({...prev,[grupo]:true}));})} title={label}>
        <span className="nav-item-icon">{icon}</span>
        {!collapsed&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{label}</span>}
        {!collapsed&&expandible&&(
          <span onClick={e=>{e.stopPropagation();toggleGrupo(grupo!);}} style={{marginLeft:"auto",fontSize:9,color:"rgba(255,255,255,.35)",padding:"2px 4px",transform:abierto?"rotate(90deg)":"none",transition:"transform .15s"}}>▶</span>
        )}
      </div>
    );
  };
  const ns=(id:View,label:string,grupo?:string)=>{
    if(collapsed) return null;
    if(grupo&&!(abiertos[grupo]??false)) return null;
    return <div className={`nav-sub ${view===id?"active":""}`} onClick={()=>setView(id)}>{label}</div>;
  };

  const invActive=GRUPOS.inventario.includes(view);
  const provActive=GRUPOS.proveeduria.includes(view);
  const biActive=GRUPOS.bi.includes(view);
  const solActive=GRUPOS.solicitudes.includes(view);
  const finanzasActive=GRUPOS.finanzas.includes(view);

  return (
    <div className={`sidebar ${collapsed?"collapsed":""}`}>
      <div className="sidebar-logo">
        <ProcenterIsotipo size={28}/>
        {!collapsed&&<div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:"14px",fontWeight:800,letterSpacing:"-.3px",lineHeight:1}}><span style={{color:"#F97316"}}>PRO</span><span style={{color:"#fff"}}>CENTER</span></div>}
        <div className="sidebar-collapse-btn" onClick={()=>setCollapsed(!collapsed)} style={{marginLeft:collapsed?0:"auto"}}>{collapsed?"▶":"◀"}</div>
      </div>

      <div className="sidebar-company" onClick={onSwitch} title="Cambiar empresa">
        <div style={{width:8,height:8,borderRadius:"50%",background:company.color,flexShrink:0}}/>
        {!collapsed&&<>
          <div style={{flex:1,overflow:"hidden"}}>
            <div className="company-name">{company.name}</div>
            <div className="company-group">{company.group}</div>
          </div>
          <span className="company-switch-icon">⇄</span>
        </>}
      </div>

      <div className="nav-section">
        {!collapsed&&<div className="nav-section-label">Módulos</div>}
        {ni("inventario","Inventario","📦",invActive,undefined,"inventario")}
        {ns("existencias","↳ Consulta Existencias","inventario")}
        {ns("nuevo","↳ Nuevo Artículo","inventario")}
        {ns("entradas","↳ Entradas & Salidas","inventario")}
        {ns("ingreso","↳ Registrar Ingreso","inventario")}
        {ns("salida","↳ Registrar Salida","inventario")}
        {ns("traslado","↳ Traslado Bodegas","inventario")}
        {ns("ajuste","↳ Ajuste Inventario","inventario")}
        {ns("baja","↳ Baja / Descarte","inventario")}
        {ns("conteo","↳ Conteo / Auditoría","inventario")}
        {ns("reabasto","↳ Reabastecimiento","inventario")}
        {ns("valorizado","↳ Inv. Valorizado","inventario")}
        {ns("trazabilidad","↳ Trazabilidad","inventario")}
        {ns("solicitudes-inventario","↳ Solicitudes entre Deptos.","inventario")}

        {ni("proveeduria","Proveeduría","📋",provActive,undefined,"proveeduria")}
        {ns("proveedores","↳ Proveedores","proveeduria")}
        {ns("resumen-proveedores","↳ Resumen de Proveedores","proveeduria")}
        {ns("ordenes-compra","↳ Órdenes de Compra","proveeduria")}
        {ns("nueva-oc","↳ Nueva Orden de Compra","proveeduria")}
        {ns("cotizaciones","↳ Cotizaciones (RFQ)","proveeduria")}
        {ns("comparador","↳ Comparador de Proveedores","proveeduria")}
        {ns("solicitudes-proveeduria","↳ Solicitudes entre Deptos.","proveeduria")}

        {ni("solicitudes","Solicitudes","📬",solActive,undefined,"solicitudes")}
        {ns("solicitudes","↳ Nueva Solicitud","solicitudes")}
        {ns("bandeja","↳ Bandeja de Gestión","solicitudes")}

        {ni("bi","BI & Reportería","📊",biActive,undefined,"bi")}
        {ns("bi-ejecutivo","↳ Dashboard Ejecutivo","bi")}
        {ns("bi-rrhh","↳ BI RRHH & Nómina","bi")}
        {ns("bi-inv","↳ BI Inventario","bi")}
        {ns("bi-calidad","↳ BI Calidad ISO","bi")}
        {ns("reportes","↳ Generador Reportes","bi")}

        {ni("rrhh","Recursos Humanos","👥",GRUPOS.rrhh.includes(view),undefined,"rrhh")}
        {ns("admin-personal","↳ Adm. Personal","rrhh")}
        {ns("planillas","↳ Planillas","rrhh")}
        {ns("nomina","↳ Nómina","rrhh")}
        {ns("asistencia","↳ Asistencia","rrhh")}
        {ns("desempeno","↳ Desempeño","rrhh")}
        {ns("reclutamiento","↳ Reclutamiento","rrhh")}
        {ns("capacitacion","↳ Capacitación","rrhh")}
        {ns("clima","↳ Clima & Salud","rrhh")}
        {ns("solicitudes-rrhh","↳ Solicitudes entre Deptos.","rrhh")}

        {ni("finanzas","Finanzas","💰",finanzasActive,undefined,"finanzas")}
        {ns("libro-diario","↳ Libro Diario","finanzas")}
        {ns("cxc","↳ Cuentas por Cobrar","finanzas")}
        {ns("cxp","↳ Cuentas por Pagar","finanzas")}
        {ns("estados-financieros","↳ Estados Financieros","finanzas")}
        {ns("flujo-caja","↳ Flujo de Caja","finanzas")}
        {ns("facturacion","↳ Facturación Electrónica","finanzas")}
        {ns("banca","↳ Conexión Bancaria","finanzas")}
        {ns("solicitudes-finanzas","↳ Solicitudes entre Deptos.","finanzas")}

        {ni(null,"CRM & Ventas","🤝",false)}
        {ni(null,"Calidad ISO","✅",false)}

        {!collapsed&&<div className="nav-section-label" style={{marginTop:8}}>Configuración</div>}
        {ni("config-gral","Config. General","⚙️",view==="config-gral")}
        {ni("config-rrhh","Config. RRHH","👥",view==="config-rrhh")}
        {ni("config-inv","Config. Inventario","📦",view==="config-inv")}
        {ni("config-finanzas","Config. Finanzas","💱",view==="config-finanzas")}

        {!collapsed&&<div className="nav-section-label" style={{marginTop:8}}>Organización</div>}
        {ni("empresas","Empresas & Verticales","🏛️",GRUPOS.empresas.includes(view),undefined,"empresas")}
        {ns("empresa-detalle","↳ Detalle empresa","empresas")}
        {ns("verticales","↳ Verticales","empresas")}
      </div>

      <div className="nav-section">
        {!collapsed&&<div className="nav-section-label">Accesos Rápidos</div>}
        {ni("nuevo","Nuevo Artículo","➕",false,()=>{setView("nuevo");setStep(1);})}
        {ni("solicitudes","Nueva Solicitud","📬",false)}
        {ni("ingreso","Registrar Ingreso","📥",false)}
        {ni("bandeja","Bandeja Pendiente","📭",false)}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar" style={{width:30,height:30,fontSize:11}}>RD</div>
          {!collapsed&&<div><div className="user-info-name">Ronald</div><div className="user-info-role">Super Admin</div></div>}
        </div>
      </div>
    </div>
  );
}
