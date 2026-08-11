import React from "react";
import type { Requisicion, Vacante, PerfilTalento, Candidato, Entrevista, OfertaLaboral } from "../../../types";
import { ModTile } from "../../../components/ModTile";

export function ReclutamientoHome({setTab,requisiciones,vacantes,perfilesTalento,candidatos,entrevistas,ofertas}:{
  setTab:(t:string)=>void;
  requisiciones:Requisicion[];vacantes:Vacante[];perfilesTalento:PerfilTalento[];
  candidatos:Candidato[];entrevistas:Entrevista[];ofertas:OfertaLaboral[];
}) {
  const enPipeline=candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado");
  const vacantesActivas=vacantes.filter(v=>v.estado==="Activa");
  const entrevistasProgramadas=entrevistas.filter(e=>e.estado==="Programada");
  const ofertasAbiertas=ofertas.filter(o=>o.estado==="Enviada"||o.estado==="Pendiente aprobación");
  const contratadosMes=candidatos.filter(c=>c.estado==="Integrado").length;
  const requisicionesPendientes=requisiciones.filter(r=>r.estado==="pendiente");

  const vacantesSinCandidatos=vacantesActivas.filter(v=>candidatos.filter(c=>c.vacante===v.id).length===0);
  const evaluacionesBajas=candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado"&&c.puntCART>0&&c.puntCART<50);

  const alertas=[
    ...requisicionesPendientes.map(r=>({icon:"📝",color:"#EF4444",bg:"#FEF2F2",bd:"#FCA5A5",texto:`Requisición ${r.id} (${r.puesto}) pendiente de aprobación`,urgencia:"alta" as const,accion:()=>setTab("requisiciones")})),
    ...vacantesSinCandidatos.map(v=>({icon:"📋",color:"#F59E0B",bg:"#FFFBEB",bd:"#FDE68A",texto:`${v.puesto} (${v.id}) activa sin candidatos todavía`,urgencia:"media" as const,accion:()=>setTab("talento")})),
    ...ofertasAbiertas.map(o=>({icon:"📨",color:"#3B82F6",bg:"#EFF6FF",bd:"#BFDBFE",texto:`Oferta ${o.id} (${o.puesto}) esperando respuesta`,urgencia:"media" as const,accion:()=>setTab("ofertas")})),
    ...evaluacionesBajas.map(c=>({icon:"🌳",color:"#EF4444",bg:"#FEF2F2",bd:"#FCA5A5",texto:`${c.nombre} con puntuación CART baja (${c.puntCART}/100) — decidir`,urgencia:"alta" as const,accion:()=>setTab("candidatos")})),
    ...entrevistasProgramadas.slice(0,3).map(e=>({icon:"🗣️",color:"#3B82F6",bg:"#EFF6FF",bd:"#BFDBFE",texto:`Entrevista ${e.tipo} — ${candidatos.find(c=>c.id===e.candidatoId)?.nombre||e.candidatoId} · ${e.fecha} ${e.hora}`,urgencia:"baja" as const,accion:()=>setTab("entrevistas")})),
  ];

  const tiles=[
    {icon:"📝",name:"Requisiciones",desc:"Necesidad → Aprobación → Vacante",sub:`${requisiciones.length} requisiciones`,badge:requisicionesPendientes.length>0?`⚠ ${requisicionesPendientes.length} pendientes`:undefined,badgeColor:"#EF4444",view:"requisiciones"},
    {icon:"📋",name:"Vacantes",desc:"Expediente completo del puesto",sub:`${vacantesActivas.length} activas`,view:"vacantes"},
    {icon:"🗂️",name:"Base de Talento",desc:"Perfiles multi-fuente · Filtros avanzados",sub:`${perfilesTalento.length} perfiles`,view:"talento"},
    {icon:"👤",name:"Candidatos",desc:"Expediente · Timeline · Documentos",sub:`${enPipeline.length} en proceso`,view:"candidatos"},
    {icon:"🔄",name:"Pipeline",desc:"Aplicación → Contratado",sub:`${enPipeline.length} activos`,view:"pipeline"},
    {icon:"🗣️",name:"Entrevistas",desc:"Programar · Evaluar criterios",sub:`${entrevistasProgramadas.length} programadas`,badge:entrevistasProgramadas.length>0?`${entrevistasProgramadas.length} pendientes`:undefined,badgeColor:"#3B82F6",view:"entrevistas"},
    {icon:"📨",name:"Ofertas",desc:"Borrador → Enviada → Aceptada",sub:`${ofertasAbiertas.length} abiertas`,view:"ofertas"},
    {icon:"🌳",name:"CART",desc:"Árbol de decisión · Evaluador",sub:"Motor de clasificación",view:"cart"},
    {icon:"📈",name:"Analítica",desc:"Embudo · Time to Hire · Fuentes",sub:"Métricas en tiempo real",view:"analitica"},
    {icon:"⚙️",name:"Configuración",desc:"Filtros · Equipo · Parámetros",sub:"Personalizable",view:"config"},
  ];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#1E1B4B,#4F46E5)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>🔍</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Reclutamiento y Selección</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginTop:2}}>ATS · Requisiciones · Base de Talento · CART · ISO 9001 §7.2 · {vacantesActivas.length} vacantes activas</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setTab("talento")}>🗂️ Base de Talento</button>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>setTab("requisiciones")}>➕ Nueva Requisición</button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"Requisiciones",v:requisicionesPendientes.length.toString(),sub:"pendientes",c:"#EF4444",pill:requisicionesPendientes.length>0?"kpi-down":"kpi-up",pillTxt:requisicionesPendientes.length>0?"⚠ Requiere acción":"✓ Al día"},
            {l:"Vacantes activas",v:vacantesActivas.length.toString(),sub:`${vacantes.length} totales`,c:"#1B1F2E",pill:"kpi-info",pillTxt:"📋 Abiertas"},
            {l:"Base de Talento",v:perfilesTalento.length.toString(),sub:"perfiles disponibles",c:"#7C3AED",pill:"kpi-info",pillTxt:"🗂️ Multi-fuente"},
            {l:"En pipeline",v:enPipeline.length.toString(),sub:"candidatos activos",c:"#3B82F6",pill:"kpi-info",pillTxt:"🔄 En proceso"},
            {l:"Entrevistas",v:entrevistasProgramadas.length.toString(),sub:"programadas",c:"#F59E0B",pill:entrevistasProgramadas.length>0?"kpi-warn":"kpi-up",pillTxt:entrevistasProgramadas.length>0?"⏳ Por realizar":"✓ Al día"},
            {l:"Contrataciones",v:contratadosMes.toString(),sub:"integrados al sistema",c:"#10B981",pill:"kpi-up",pillTxt:"✓ Completadas"},
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
            <ModTile key={t.name} icon={t.icon} name={t.name} desc={t.desc} sub={t.sub} badge={t.badge} badgeColor={t.badgeColor} onClick={()=>setTab(t.view)}/>
          ))}
        </div>

        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" as const}}>
          <div style={{fontSize:11.5,fontWeight:600,color:"#1B1F2E"}}>Flujo ATS:</div>
          {[{n:"Requisición",c:"#EF4444",bg:"#FEF2F2"},{n:"Vacante",c:"#3B82F6",bg:"#EFF6FF"},{n:"Postulación",c:"#7C3AED",bg:"#F5F3FF"},{n:"Pipeline",c:"#F59E0B",bg:"#FFFBEB"},{n:"Entrevista",c:"#3B82F6",bg:"#EFF6FF"},{n:"Oferta",c:"#F59E0B",bg:"#FFFBEB"},{n:"Contratado",c:"#10B981",bg:"#ECFDF5"}].map((b,i)=>(
            <div key={b.n} style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:10.5,fontWeight:700,color:b.c,background:b.bg,padding:"3px 9px",borderRadius:7}}>{b.n}</span>
              {i<6&&<span style={{color:"#D1D5DB"}}>→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Alertas de Reclutamiento</div>
        {alertas.length===0&&<div style={{fontSize:11.5,color:"#9CA3AF",padding:"8px 0"}}>Sin alertas activas.</div>}
        {alertas.map((a,i)=>(
          <div key={i} onClick={a.accion} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
            <div style={{width:28,height:28,borderRadius:7,background:a.bg,border:`1px solid ${a.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,color:"#1B1F2E",lineHeight:1.4}}>{a.texto}</div>
              <div style={{fontSize:10,color:a.color,fontWeight:600,marginTop:2}}>{a.urgencia==="alta"?"🔴 Urgente":a.urgencia==="media"?"🟡 Medio plazo":"🔵 Informativo"}</div>
            </div>
          </div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Vacantes activas</div>
        {vacantesActivas.map(v=>{
          const n=candidatos.filter(c=>c.vacante===v.id).length;
          return (
            <div key={v.id} onClick={()=>setTab("vacantes")} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:n>0?"#10B981":"#F59E0B",flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{v.puesto}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{n} candidatos · {v.departamento}</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
