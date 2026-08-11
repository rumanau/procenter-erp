import React, { useState } from "react";
import type { Candidato, Vacante, OfertaLaboral } from "../../../types";

export function Ofertas({ofertas,setOfertas,candidatos,vacantes,onCambioEstado,onVerCandidato}:{
  ofertas:OfertaLaboral[];setOfertas:(o:OfertaLaboral[])=>void;
  candidatos:Candidato[];vacantes:Vacante[];
  onCambioEstado:(oferta:OfertaLaboral,nuevoEstado:OfertaLaboral["estado"])=>void;
  onVerCandidato:(candId:string)=>void;
}) {
  const [formAbierto,setFormAbierto]=useState(false);
  const candidatosElegibles=candidatos.filter(c=>c.estado!=="Integrado"&&c.estado!=="Descartado");
  const [candidatoId,setCandidatoId]=useState(candidatosElegibles[0]?.id||"");
  const cand=candidatos.find(c=>c.id===candidatoId);
  const vac=vacantes.find(v=>v.id===cand?.vacante);

  const [f,setF]=useState({salario:0,jornada:"Completa",modalidad:"Presencial",fechaIngreso:"",beneficios:"",periodoPrueba:"3 meses",observaciones:""});

  const candNombre=(id:string)=>candidatos.find(c=>c.id===id)?.nombre||id;
  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;

  const crear=()=>{
    if(!cand||!vac||!f.salario||!f.fechaIngreso) return;
    const nueva:OfertaLaboral={
      id:`OF-${Date.now()}`,candidatoId:cand.id,vacanteId:vac.id,
      salario:f.salario,puesto:vac.puesto,departamento:vac.departamento,
      jornada:f.jornada,modalidad:f.modalidad,fechaIngreso:f.fechaIngreso,
      beneficios:f.beneficios,periodoPrueba:f.periodoPrueba,observaciones:f.observaciones,
      estado:"Borrador",fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
    };
    setOfertas([nueva,...ofertas]);
    setFormAbierto(false);
    setF({salario:0,jornada:"Completa",modalidad:"Presencial",fechaIngreso:"",beneficios:"",periodoPrueba:"3 meses",observaciones:""});
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:700}}>{ofertas.length} ofertas laborales</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setFormAbierto(true)}>➕ Nueva Oferta</button>
      </div>

      {ofertas.length===0&&<div className="card" style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:24}}>Sin ofertas generadas todavía. Créala cuando un candidato llegue a la etapa "Oferta" en el Pipeline.</div>}

      {ofertas.map(of=>(
        <div key={of.id} className="card" style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{of.id}</span>
                <span style={{fontSize:13.5,fontWeight:700,cursor:"pointer",color:"#3B82F6"}} onClick={()=>onVerCandidato(of.candidatoId)}>{candNombre(of.candidatoId)}</span>
                <span style={{fontSize:12,color:"#6B7280"}}>— {of.puesto}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const,marginBottom:6}}>
                <span className="badge badge-info">{of.departamento}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>💰 {fmt(of.salario)}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>🗓️ Ingreso: {of.fechaIngreso}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>{of.jornada} · {of.modalidad}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>⏳ Prueba: {of.periodoPrueba}</span>
              </div>
              {of.beneficios&&<div style={{fontSize:12,color:"#374151"}}>🎁 {of.beneficios}</div>}
            </div>
            <div style={{textAlign:"right" as const,display:"flex",flexDirection:"column" as const,gap:6,alignItems:"flex-end"}}>
              <span className={`badge ${of.estado==="Aceptada"?"badge-ok":of.estado==="Rechazada"||of.estado==="Vencida"?"badge-crit":of.estado==="Enviada"?"badge-info":"badge-warn"}`}>{of.estado}</span>
              <span style={{fontSize:10.5,color:"#9CA3AF"}}>{of.fecha}</span>
              {of.estado==="Borrador"&&<button className="btn btn-secondary btn-sm" onClick={()=>onCambioEstado(of,"Pendiente aprobación")}>📤 Enviar a aprobación</button>}
              {of.estado==="Pendiente aprobación"&&<button className="btn btn-primary btn-sm" onClick={()=>onCambioEstado(of,"Enviada")}>✅ Aprobar y enviar</button>}
              {of.estado==="Enviada"&&(
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-primary btn-sm" onClick={()=>onCambioEstado(of,"Aceptada")}>✓ Aceptada</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>onCambioEstado(of,"Rechazada")}>✕ Rechazada</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>onCambioEstado(of,"Vencida")}>⏱ Vencida</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {formAbierto&&(
        <div className="modal-overlay" onClick={()=>setFormAbierto(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="modal-title">Nueva Oferta Laboral</div><div className="modal-sub">Entrevista técnica → Oferta → Aceptación → Contratado</div></div>
              <div className="modal-close" onClick={()=>setFormAbierto(false)}>✕</div>
            </div>
            <div className="form-group">
              <label className="form-label">Candidato</label>
              <select className="form-control" value={candidatoId} onChange={e=>setCandidatoId(e.target.value)}>
                {candidatosElegibles.map(c=><option key={c.id} value={c.id}>{c.nombre} — {c.etapa}</option>)}
              </select>
            </div>
            {vac&&(
              <div style={{fontSize:11.5,color:"#6B7280",marginBottom:10}}>Vacante: <b>{vac.puesto}</b> ({vac.departamento}) · Rango salarial sugerido: {fmt(vac.salarioMin)} – {fmt(vac.salarioMax)}</div>
            )}
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Salario ofrecido (₡)</label>
                <input type="number" className="form-control" value={f.salario||""} onChange={e=>setF({...f,salario:parseFloat(e.target.value)||0})}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Fecha de ingreso</label>
                <input className="form-control" placeholder="25 Ago 2026" value={f.fechaIngreso} onChange={e=>setF({...f,fechaIngreso:e.target.value})}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Jornada</label>
                <select className="form-control" value={f.jornada} onChange={e=>setF({...f,jornada:e.target.value})}>
                  <option value="Completa">Completa</option>
                  <option value="Media jornada">Media jornada</option>
                  <option value="Por horas">Por horas</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Modalidad</label>
                <select className="form-control" value={f.modalidad} onChange={e=>setF({...f,modalidad:e.target.value})}>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrida">Híbrida</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Período de prueba</label>
                <input className="form-control" value={f.periodoPrueba} onChange={e=>setF({...f,periodoPrueba:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Beneficios</label>
              <input className="form-control" placeholder="Ej. Seguro médico, transporte" value={f.beneficios} onChange={e=>setF({...f,beneficios:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <textarea className="form-control" rows={2} value={f.observaciones} onChange={e=>setF({...f,observaciones:e.target.value})}/>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!candidatoId||!vac||!f.salario||!f.fechaIngreso} onClick={crear}>💾 Crear oferta (borrador)</button>
          </div>
        </div>
      )}
    </div>
  );
}
