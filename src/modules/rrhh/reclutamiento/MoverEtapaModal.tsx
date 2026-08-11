import React, { useState } from "react";
import type { Candidato } from "../../../types";

export function MoverEtapaModal({candidato,etapas,onMover,onCerrar}:{
  candidato:Candidato;etapas:string[];
  onMover:(nuevaEtapa:string,responsable:string,observaciones:string,proximaAccion:string)=>void;
  onCerrar:()=>void;
}) {
  const [nuevaEtapa,setNuevaEtapa]=useState(candidato.etapa);
  const [responsable,setResponsable]=useState("Ronald");
  const [observaciones,setObservaciones]=useState("");
  const [proximaAccion,setProximaAccion]=useState("");

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Mover de etapa</div><div className="modal-sub">{candidato.nombre} · Etapa actual: {candidato.etapa}</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <div className="form-group">
          <label className="form-label">Nueva etapa</label>
          <select className="form-control" value={nuevaEtapa} onChange={e=>setNuevaEtapa(e.target.value)}>
            {etapas.map(et=><option key={et} value={et}>{et}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Responsable</label>
          <input className="form-control" value={responsable} onChange={e=>setResponsable(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea className="form-control" rows={2} value={observaciones} onChange={e=>setObservaciones(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Próxima acción</label>
          <input className="form-control" placeholder="Ej. Coordinar prueba técnica" value={proximaAccion} onChange={e=>setProximaAccion(e.target.value)}/>
        </div>
        <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>onMover(nuevaEtapa,responsable,observaciones,proximaAccion)}>🔄 Mover de etapa</button>
      </div>
    </div>
  );
}
