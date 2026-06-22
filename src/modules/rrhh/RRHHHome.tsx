import React from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";
import { ALERTAS_RRHH } from "../../data/colaboradores";
import { ModTile } from "../../components/ModTile";

export function RRHHHome({setView,empleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];catalogos:typeof CATALOGOS_INIT}) {
  const activos=empleados.filter(e=>e.estado==="activo");
  const planillasActivas=catalogos.planillas.filter((p:any)=>p.estado==="activa");
  const totalBruto=activos.reduce((a,e)=>a+e.salario,0);
  const contratosVencer=activos.filter(e=>e.tipo==="Plazo fijo").length;

  const tiles=[
    {icon:"👤",name:"Adm. de Personal",desc:"Expediente · Contratos · Organigrama",sub:`${activos.length} colaboradores activos`,badge:contratosVencer>0?`⚠ ${contratosVencer} vencen`:undefined,badgeColor:"#EF4444",view:"admin-personal" as View},
    {icon:"📋",name:"Planillas",desc:"Catálogo multi-planilla · Configuración",sub:`${planillasActivas.length} planillas activas`,view:"planillas" as View},
    {icon:"💰",name:"Nómina",desc:"Motor de cálculo · Deducciones · HE",sub:`₡${Math.round(totalBruto/1000)}K planilla bruta`,badge:"Pendiente aprobación",badgeColor:"#F59E0B",view:"nomina" as View},
    {icon:"🕐",name:"Control de Asistencia",desc:"Turnos · Ausencias · Horas extra",sub:"2 ausencias hoy",view:"asistencia" as View},
    {icon:"📊",name:"Gestión Desempeño",desc:"KPIs · 360° · Planes de mejora",sub:"Evaluación Q2 pendiente",badge:"4 pendientes",badgeColor:"#F59E0B",view:"desempeno" as View},
    {icon:"🔍",name:"Reclutamiento",desc:"Vacantes · Candidatos · Pipeline",sub:"2 vacantes abiertas",view:"reclutamiento" as View},
    {icon:"📚",name:"Capacitación",desc:"Plan · Matriz · Certificaciones",sub:"3 certs. por vencer",badge:"Urgente",badgeColor:"#EF4444",view:"capacitacion" as View},
    {icon:"🌡️",name:"Clima & Salud Ocup.",desc:"Encuestas · Incidentes · EPP · ISO 45001",sub:"1 incidente sin cerrar",badge:"Atención",badgeColor:"#EF4444",view:"clima" as View},
    {icon:"⚙️",name:"Configuración RRHH",desc:"CCSS · Puestos · Deducciones · Bandas",sub:"Parámetros editables",view:"config-rrhh" as View},
    {icon:"📊",name:"BI & Reportería RRHH",desc:"Planilla · Rotación · Desempeño · ISO",sub:"Datos en tiempo real",view:"bi-rrhh" as View},
  ];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#3B0764,#5B21B6)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>👥</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Recursos Humanos</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginTop:2}}>Ciclo de vida del colaborador · ISO 9001 · ISO 45001 · {activos.length} colaboradores · {planillasActivas.length} planillas activas</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setView("config-rrhh")}>⚙️ Config. RRHH</button>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>setView("reclutamiento")}>➕ Nueva Contratación</button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"Colaboradores",v:activos.length.toString(),sub:`${empleados.filter(e=>e.estado!=="activo").length} inactivos`,c:"#1B1F2E",pill:"kpi-up",pillTxt:"▲ activos"},
            {l:"Planilla bruta",v:`₡${Math.round(totalBruto/1000)}K`,sub:"todas las planillas",c:"#E8611A",pill:"kpi-info",pillTxt:"CRC mensual"},
            {l:"Asistencia hoy",v:"87.5%",sub:"7 de 8 presentes",c:"#10B981",pill:"kpi-up",pillTxt:"✓ Normal"},
            {l:"Alertas activas",v:"5",sub:"Requieren atención",c:"#EF4444",pill:"kpi-down",pillTxt:"↑ +2 esta semana"},
            {l:"Vacantes abiertas",v:"2",sub:"En proceso",c:"#F59E0B",pill:"kpi-warn",pillTxt:"⏳ Reclutando"},
          ].map(k=>(
            <div key={k.l} className="kpi">
              <div className="kpi-label">{k.l}</div>
              <div className="kpi-value" style={{fontSize:18,color:k.c}}>{k.v}</div>
              <div style={{fontSize:10.5,color:"#6B7280",marginBottom:3}}>{k.sub}</div>
              <div className={`kpi-pill ${k.pill}`}>{k.pillTxt}</div>
            </div>
          ))}
        </div>

        <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:10}}>Submódulos y acciones</div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {tiles.map(t=>(
            <ModTile key={t.name} icon={t.icon} name={t.name} desc={t.desc} sub={t.sub} badge={t.badge} badgeColor={t.badgeColor} onClick={()=>setView(t.view)}/>
          ))}
        </div>

        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" as const}}>
          <div style={{fontSize:11.5,fontWeight:600,color:"#1B1F2E"}}>Cumplimiento normativo:</div>
          {[{n:"ISO 9001",i:"§7.1 · §7.2 · §7.5 · §8.1 · §8.5 · §9.1 · §10.3",c:"#E8611A",bg:"#FFF3ED"},{n:"ISO 45001",i:"§6.1 · §8.1 · §10.2 · §10.3",c:"#EF4444",bg:"#FEF2F2"},{n:"Legislación CR",i:"CCSS · Renta · Código Trabajo",c:"#3B82F6",bg:"#EFF6FF"}].map(b=>(
            <div key={b.n} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:7,background:b.bg}}>
              <span style={{fontSize:11.5,fontWeight:700,color:b.c}}>{b.n}</span>
              <span style={{fontSize:10.5,color:"#6B7280"}}>{b.i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Alertas RRHH</div>
        {ALERTAS_RRHH.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
            <div style={{width:28,height:28,borderRadius:7,background:a.bg,border:`1px solid ${a.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,color:"#1B1F2E",lineHeight:1.4}}>{a.texto}</div>
              <div style={{fontSize:10,color:a.color,fontWeight:600,marginTop:2}}>{a.urgencia==="alta"?"🔴 Urgente":a.urgencia==="media"?"🟡 Medio plazo":"🟢 Informativo"}</div>
            </div>
          </div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Plantilla activa</div>
        {activos.slice(0,5).map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div className="user-avatar" style={{width:26,height:26,fontSize:10,background:"#7C3AED",flexShrink:0}}>{c.foto.slice(0,2)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nombre}</div>
              <div style={{fontSize:10.5,color:"#6B7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.puesto}</div>
            </div>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#10B981",flexShrink:0}}/>
          </div>
        ))}
        {activos.length>5&&<div style={{fontSize:11,color:"#6B7280",padding:"6px 0"}}>{activos.length-5} más...</div>}
        <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:6}} onClick={()=>setView("admin-personal")}>Ver todos →</button>
        <div style={{height:12}}/>
        <div className="panel-title">Planillas activas</div>
        {planillasActivas.map((p:any)=>{
          const n=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo").length;
          return (
            <div key={p.id} onClick={()=>setView("planillas")} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{p.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{n} colaboradores</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
