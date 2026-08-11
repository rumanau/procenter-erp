import React, { useState } from "react";
import type { Requisicion } from "../../../types";

const MOTIVOS = ["Nueva posición", "Sustitución", "Incremento de plantilla", "Temporal"];

export function Requisiciones({requisiciones,setRequisiciones,onCrearVacante}:{
  requisiciones:Requisicion[];setRequisiciones:(r:Requisicion[])=>void;onCrearVacante:(req:Requisicion)=>void;
}) {
  const [modalAbierto,setModalAbierto]=useState(false);
  const [form,setForm]=useState({puesto:"",departamento:"",solicitante:"",motivo:MOTIVOS[0],plazas:1,presupuesto:0,justificacion:"",prioridad:"media" as Requisicion["prioridad"]});

  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;

  const crear=()=>{
    if(!form.puesto.trim()||!form.departamento.trim()||!form.solicitante.trim()) return;
    const nueva:Requisicion={
      id:`REQ-2026-${String(requisiciones.length+15).padStart(3,"0")}`,
      ...form, estado:"pendiente",
      fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
    };
    setRequisiciones([nueva,...requisiciones]);
    setForm({puesto:"",departamento:"",solicitante:"",motivo:MOTIVOS[0],plazas:1,presupuesto:0,justificacion:"",prioridad:"media"});
    setModalAbierto(false);
  };

  const resolver=(id:string,estado:"aprobada"|"rechazada")=>{
    setRequisiciones(requisiciones.map(r=>r.id===id?{...r,estado,aprobador:"Ronald"}:r));
  };

  const marcarConvertida=(req:Requisicion)=>{
    setRequisiciones(requisiciones.map(r=>r.id===req.id?{...r,estado:"convertida"}:r));
    onCrearVacante(req);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700}}>{requisiciones.length} requisiciones de personal</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setModalAbierto(true)}>➕ Nueva Requisición</button>
      </div>

      {requisiciones.map(r=>(
        <div key={r.id} className="card" style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{r.id}</span>
                <span style={{fontSize:13.5,fontWeight:700}}>{r.puesto}</span>
                <span className={`badge ${r.prioridad==="alta"?"badge-crit":r.prioridad==="media"?"badge-warn":"badge-gray"}`}>Prioridad {r.prioridad}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const,marginBottom:6}}>
                <span className="badge badge-info">{r.departamento}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>👤 Solicita: {r.solicitante}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>📋 Motivo: {r.motivo}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>🧑‍🤝‍🧑 Plazas: {r.plazas}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>💰 Presupuesto: {fmt(r.presupuesto)}</span>
              </div>
              <div style={{fontSize:12,color:"#374151"}}>{r.justificacion}</div>
              {r.aprobador&&<div style={{fontSize:10.5,color:"#9CA3AF",marginTop:4}}>Resuelto por {r.aprobador}</div>}
            </div>
            <div style={{textAlign:"right" as const,display:"flex",flexDirection:"column" as const,gap:6,alignItems:"flex-end"}}>
              <span className={`badge ${r.estado==="aprobada"?"badge-ok":r.estado==="rechazada"?"badge-crit":r.estado==="convertida"?"badge-purple":"badge-warn"}`}>{r.estado}</span>
              <span style={{fontSize:10.5,color:"#9CA3AF"}}>{r.fecha}</span>
              {r.estado==="pendiente"&&(
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-primary btn-sm" onClick={()=>resolver(r.id,"aprobada")}>✅ Aprobar</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>resolver(r.id,"rechazada")}>✕ Rechazar</button>
                </div>
              )}
              {r.estado==="aprobada"&&(
                <button className="btn btn-secondary btn-sm" onClick={()=>marcarConvertida(r)}>📋 Crear Vacante</button>
              )}
            </div>
          </div>
        </div>
      ))}

      {modalAbierto&&(
        <div className="modal-overlay" onClick={()=>setModalAbierto(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="modal-title">Nueva Requisición de Personal</div><div className="modal-sub">Necesidad → Requisición → Aprobación → Vacante</div></div>
              <div className="modal-close" onClick={()=>setModalAbierto(false)}>✕</div>
            </div>
            <div className="form-group">
              <label className="form-label">Puesto</label>
              <input className="form-control" value={form.puesto} onChange={e=>setForm({...form,puesto:e.target.value})}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Departamento</label>
                <input className="form-control" value={form.departamento} onChange={e=>setForm({...form,departamento:e.target.value})}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Solicitante</label>
                <input className="form-control" value={form.solicitante} onChange={e=>setForm({...form,solicitante:e.target.value})}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Motivo</label>
                <select className="form-control" value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})}>
                  {MOTIVOS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{width:100}}>
                <label className="form-label">Plazas</label>
                <input type="number" min={1} className="form-control" value={form.plazas} onChange={e=>setForm({...form,plazas:parseInt(e.target.value)||1})}/>
              </div>
              <div className="form-group" style={{width:100}}>
                <label className="form-label">Prioridad</label>
                <select className="form-control" value={form.prioridad} onChange={e=>setForm({...form,prioridad:e.target.value as Requisicion["prioridad"]})}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Presupuesto mensual (₡)</label>
              <input type="number" className="form-control" value={form.presupuesto||""} onChange={e=>setForm({...form,presupuesto:parseFloat(e.target.value)||0})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Justificación</label>
              <textarea className="form-control" rows={3} value={form.justificacion} onChange={e=>setForm({...form,justificacion:e.target.value})}/>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!form.puesto.trim()||!form.departamento.trim()||!form.solicitante.trim()} onClick={crear}>📤 Enviar a aprobación</button>
          </div>
        </div>
      )}
    </div>
  );
}
