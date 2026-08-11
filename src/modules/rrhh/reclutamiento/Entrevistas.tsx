import React, { useState } from "react";
import type { Candidato, Vacante, Entrevista, Evaluacion } from "../../../types";

const TIPOS = ["RRHH", "Técnica", "Gerencial"] as const;
const MODALIDADES = ["Presencial", "Virtual", "Telefónica"] as const;

export function Entrevistas({candidatos,vacantes,entrevistas,setEntrevistas,evaluaciones,setEvaluaciones,onEvaluada,candidatoPreseleccionado,formularioAbiertoInicial,onCerrarFormularioInicial,onVerCandidato}:{
  candidatos:Candidato[];vacantes:Vacante[];entrevistas:Entrevista[];setEntrevistas:(e:Entrevista[])=>void;
  evaluaciones:Evaluacion[];setEvaluaciones:(e:Evaluacion[])=>void;
  onEvaluada:(candidatoId:string,resultado:number,recomendacion:string)=>void;
  candidatoPreseleccionado?:string;formularioAbiertoInicial?:boolean;onCerrarFormularioInicial?:()=>void;
  onVerCandidato:(candId:string)=>void;
}) {
  const [formAbierto,setFormAbierto]=useState(!!formularioAbiertoInicial);
  const [evalAbierta,setEvalAbierta]=useState<string|null>(null);
  const [f,setF]=useState({candidatoId:candidatoPreseleccionado||candidatos[0]?.id||"",tipo:TIPOS[0] as string,fecha:"",hora:"",entrevistador:"Ronald",modalidad:MODALIDADES[0] as string,ubicacion:"",duracion:30});
  const [criterios,setCriterios]=useState({comunicacion:3,experiencia:3,competencias:3,culturaOrganizacional:3,conocimientoTecnico:3});
  const [comentarios,setComentarios]=useState("");

  const candNombre=(id:string)=>candidatos.find(c=>c.id===id)?.nombre||id;
  const vacPuesto=(id:string)=>vacantes.find(v=>v.id===id)?.puesto||id;

  const crearEntrevista=()=>{
    if(!f.candidatoId||!f.fecha) return;
    const cand=candidatos.find(c=>c.id===f.candidatoId);
    const nueva:Entrevista={id:`ENT-${Date.now()}`,candidatoId:f.candidatoId,vacanteId:cand?.vacante||"",tipo:f.tipo as Entrevista["tipo"],fecha:f.fecha,hora:f.hora,entrevistador:f.entrevistador,modalidad:f.modalidad as Entrevista["modalidad"],ubicacion:f.ubicacion,duracion:f.duracion,estado:"Programada"};
    setEntrevistas([nueva,...entrevistas]);
    setFormAbierto(false);
    onCerrarFormularioInicial?.();
  };

  const registrarEvaluacion=(ent:Entrevista)=>{
    const vals=Object.values(criterios);
    const resultado=Math.round((vals.reduce((a,b)=>a+b,0)/(vals.length*5))*100);
    const recomendacion=resultado>=80?"Avanzar":resultado>=60?"En espera":"Rechazar";
    const nueva:Evaluacion={id:`EVAL-${Date.now()}`,entrevistaId:ent.id,candidatoId:ent.candidatoId,...criterios,resultado,recomendacion,comentarios,fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),evaluador:"Ronald"};
    setEvaluaciones([nueva,...evaluaciones]);
    setEntrevistas(entrevistas.map(e=>e.id===ent.id?{...e,estado:"Realizada"}:e));
    onEvaluada(ent.candidatoId,resultado,recomendacion);
    setEvalAbierta(null);
    setCriterios({comunicacion:3,experiencia:3,competencias:3,culturaOrganizacional:3,conocimientoTecnico:3});
    setComentarios("");
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:700}}>{entrevistas.length} entrevistas</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setFormAbierto(true)}>➕ Programar Entrevista</button>
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>Candidato</th><th>Vacante</th><th>Tipo</th><th>Fecha</th><th>Entrevistador</th><th>Modalidad</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {entrevistas.map(en=>(
              <tr key={en.id}>
                <td style={{fontSize:12,fontWeight:600,cursor:"pointer",color:"#3B82F6"}} onClick={()=>onVerCandidato(en.candidatoId)}>{candNombre(en.candidatoId)}</td>
                <td style={{fontSize:12}}>{vacPuesto(en.vacanteId)}</td>
                <td><span className="badge badge-info" style={{fontSize:10}}>{en.tipo}</span></td>
                <td style={{fontSize:11.5}}>{en.fecha} {en.hora}</td>
                <td style={{fontSize:12}}>{en.entrevistador}</td>
                <td style={{fontSize:11.5}}>{en.modalidad}{en.ubicacion?` · ${en.ubicacion}`:""}</td>
                <td><span className={`badge ${en.estado==="Realizada"?"badge-ok":en.estado==="Programada"?"badge-info":"badge-gray"}`}>{en.estado}</span></td>
                <td>{en.estado==="Programada"&&<button className="btn btn-secondary btn-sm" onClick={()=>setEvalAbierta(en.id)}>📊 Evaluar</button>}</td>
              </tr>
            ))}
            {entrevistas.length===0&&<tr><td colSpan={8} style={{textAlign:"center" as const,color:"#9CA3AF",padding:20}}>Sin entrevistas programadas.</td></tr>}
          </tbody>
        </table>
      </div>

      {formAbierto&&(
        <div className="modal-overlay" onClick={()=>{setFormAbierto(false);onCerrarFormularioInicial?.();}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Programar Entrevista</div>
              <div className="modal-close" onClick={()=>{setFormAbierto(false);onCerrarFormularioInicial?.();}}>✕</div>
            </div>
            <div className="form-group">
              <label className="form-label">Candidato</label>
              <select className="form-control" value={f.candidatoId} onChange={e=>setF({...f,candidatoId:e.target.value})}>
                {candidatos.map(c=><option key={c.id} value={c.id}>{c.nombre} — {vacPuesto(c.vacante)}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Tipo</label>
                <select className="form-control" value={f.tipo} onChange={e=>setF({...f,tipo:e.target.value})}>
                  {TIPOS.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Modalidad</label>
                <select className="form-control" value={f.modalidad} onChange={e=>setF({...f,modalidad:e.target.value})}>
                  {MODALIDADES.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Fecha</label>
                <input className="form-control" placeholder="12 Ago 2026" value={f.fecha} onChange={e=>setF({...f,fecha:e.target.value})}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Hora</label>
                <input className="form-control" placeholder="10:00" value={f.hora} onChange={e=>setF({...f,hora:e.target.value})}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Duración (min)</label>
                <input type="number" className="form-control" value={f.duracion} onChange={e=>setF({...f,duracion:parseInt(e.target.value)||30})}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Entrevistador</label>
                <input className="form-control" value={f.entrevistador} onChange={e=>setF({...f,entrevistador:e.target.value})}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Ubicación / Enlace</label>
                <input className="form-control" value={f.ubicacion} onChange={e=>setF({...f,ubicacion:e.target.value})}/>
              </div>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!f.candidatoId||!f.fecha} onClick={crearEntrevista}>📅 Programar</button>
          </div>
        </div>
      )}

      {evalAbierta&&(()=>{const ent=entrevistas.find(e=>e.id===evalAbierta); if(!ent) return null; return (
        <div className="modal-overlay" onClick={()=>setEvalAbierta(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="modal-title">Registrar Evaluación</div><div className="modal-sub">{candNombre(ent.candidatoId)} · {ent.tipo}</div></div>
              <div className="modal-close" onClick={()=>setEvalAbierta(null)}>✕</div>
            </div>
            {([["comunicacion","Comunicación"],["experiencia","Experiencia"],["competencias","Competencias"],["culturaOrganizacional","Cultura organizacional"],["conocimientoTecnico","Conocimiento técnico"]] as const).map(([key,label])=>(
              <div key={key} className="form-group">
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <label className="form-label" style={{margin:0}}>{label}</label>
                  <span style={{fontWeight:700,color:"#E8611A"}}>{criterios[key]}/5</span>
                </div>
                <input type="range" min={1} max={5} value={criterios[key]} onChange={e=>setCriterios({...criterios,[key]:parseInt(e.target.value)})} style={{width:"100%"}}/>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea className="form-control" rows={3} value={comentarios} onChange={e=>setComentarios(e.target.value)}/>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>registrarEvaluacion(ent)}>💾 Guardar evaluación</button>
          </div>
        </div>
      );})()}
    </div>
  );
}
