import React from "react";
import type { View, Company } from "../types";
import { ProcenterIsotipo } from "./Logo";

export function Sidebar({view,setView,setStep,company,onSwitch,collapsed,setCollapsed}:
  {view:View;setView:(v:View)=>void;setStep:(s:number)=>void;company:Company;onSwitch:()=>void;collapsed:boolean;setCollapsed:(b:boolean)=>void}) {

  const ni=(id:View|null,label:string,icon:string,active:boolean,action?:()=>void)=>(
    <div className={`nav-item ${active?"active":""}`} onClick={action??(()=>id&&setView(id))} title={label}>
      <span className="nav-item-icon">{icon}</span>
      {!collapsed&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>}
    </div>
  );
  const ns=(id:View,label:string)=>(!collapsed?<div className={`nav-sub ${view===id?"active":""}`} onClick={()=>setView(id)}>{label}</div>:null);

  const invActive=["inventario","existencias","nuevo","entradas","ingreso","salida","traslado","ajuste","baja","conteo","reabasto","valorizado","trazabilidad"].includes(view);
  const biActive=["bi","reportes","bi-ejecutivo","bi-rrhh","bi-inv","bi-calidad"].includes(view);
  const solActive=["solicitudes","bandeja"].includes(view);
  const finanzasActive=["finanzas","libro-diario","cxc","cxp","estados-financieros","flujo-caja","facturacion","banca"].includes(view);

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
        {ni("inventario","Inventario & Prov.","📦",invActive)}
        {ns("existencias","↳ Consulta Existencias")}
        {ns("nuevo","↳ Nuevo Artículo")}
        {ns("entradas","↳ Entradas & Salidas")}
        {ns("ingreso","↳ Registrar Ingreso")}
        {ns("salida","↳ Registrar Salida")}
        {ns("traslado","↳ Traslado Bodegas")}
        {ns("ajuste","↳ Ajuste Inventario")}
        {ns("baja","↳ Baja / Descarte")}
        {ns("conteo","↳ Conteo / Auditoría")}
        {ns("reabasto","↳ Reabastecimiento")}
        {ns("valorizado","↳ Inv. Valorizado")}
        {ns("trazabilidad","↳ Trazabilidad")}

        {ni("solicitudes","Solicitudes","📬",solActive)}
        {ns("solicitudes","↳ Nueva Solicitud")}
        {ns("bandeja","↳ Bandeja de Gestión")}

        {ni("bi","BI & Reportería","📊",biActive)}
        {ns("bi-ejecutivo","↳ Dashboard Ejecutivo")}
        {ns("bi-rrhh","↳ BI RRHH & Nómina")}
        {ns("bi-inv","↳ BI Inventario")}
        {ns("bi-calidad","↳ BI Calidad ISO")}
        {ns("reportes","↳ Generador Reportes")}

        {ni("rrhh","Recursos Humanos","👥",["rrhh","admin-personal","nomina","asistencia","desempeno","reclutamiento","capacitacion","clima","planillas","config-rrhh"].includes(view))}
        {ns("admin-personal","↳ Adm. Personal")}
        {ns("planillas","↳ Planillas")}
        {ns("nomina","↳ Nómina")}
        {ns("asistencia","↳ Asistencia")}
        {ns("desempeno","↳ Desempeño")}
        {ns("reclutamiento","↳ Reclutamiento")}
        {ns("capacitacion","↳ Capacitación")}
        {ns("clima","↳ Clima & Salud")}

        {ni("finanzas","Finanzas","💰",finanzasActive)}
        {ns("libro-diario","↳ Libro Diario")}
        {ns("cxc","↳ Cuentas por Cobrar")}
        {ns("cxp","↳ Cuentas por Pagar")}
        {ns("estados-financieros","↳ Estados Financieros")}
        {ns("flujo-caja","↳ Flujo de Caja")}
        {ns("facturacion","↳ Facturación Electrónica")}
        {ns("banca","↳ Conexión Bancaria")}

        {ni(null,"CRM & Ventas","🤝",false)}
        {ni(null,"Calidad ISO","✅",false)}

        {!collapsed&&<div className="nav-section-label" style={{marginTop:8}}>Configuración</div>}
        {ni("config-gral","Config. General","⚙️",view==="config-gral")}
        {ni("config-rrhh","Config. RRHH","👥",view==="config-rrhh")}
        {ni("config-inv","Config. Inventario","📦",view==="config-inv")}
        {ni("config-finanzas","Config. Finanzas","💱",view==="config-finanzas")}

        {!collapsed&&<div className="nav-section-label" style={{marginTop:8}}>Organización</div>}
        {ni("empresas","Empresas & Verticales","🏛️",["empresas","empresa-detalle","verticales"].includes(view))}
        {ns("empresa-detalle","↳ Detalle empresa")}
        {ns("verticales","↳ Verticales")}
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
