import React, { useState } from "react";
import type { Candidato, Vacante, Entrevista, Evaluacion, Documento, TimelineEvento } from "../../../types";

const TIPOS_DOC = ["CV", "Cédula", "Título", "Certificación", "Carta de recomendación", "Prueba", "Evaluación", "Oferta laboral"];

export function CandidatoExpediente({candidato,vacante,entrevistas,evaluaciones,documentos,timeline,onCerrar,onIntegrar,onProgramarEntrevista,onAgregarDocumento}:{
  candidato:Candidato;vacante:Vacante|undefined;
  entrevistas:Entrevista[];evaluaciones:Evaluacion[];documentos:Documento[];timeline:TimelineEvento[];
  onCerrar:()=>void;onIntegrar:()=>void;onProgramarEntrevista:()=>void;
  onAgregarDocumento:(tipo:string,nombre:string)=>void;
}) {
  const [tab,setTab]=useState("resumen");
  const [nuevoDocTipo,setNuevoDocTipo]=useState(TIPOS_DOC[0]);
  const [nuevoDocNombre,setNuevoDocNombre]=useState("");

  const puedeIntegrar=candidato.estado!=="Integrado"&&candidato.estado!=="Descartado";
  const cc=candidato.puntCART>=80?"#10B981":candidato.puntCART>=60?"#F59E0B":"#EF4444";

  return (
    <div style={{position:"fixed" as const,top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onCerrar}>
      <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:680,maxHeight:"86vh",overflowY:"auto" as const,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div className="user-avatar" style={{width:48,height:48,fontSize:16,background:cc}}>{candidato.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{candidato.nombre}</div>
                <div style={{fontSize:12,color:"#6B7280"}}>{candidato.id} · {candidato.correo} · {candidato.tel}</div>
              </div>
            </div>
            <div className="modal-close" onClick={onCerrar}>✕</div>
          </div>
          <div className="tab-bar" style={{marginBottom:0}}>
            {[["resumen","📋 Resumen"],["evaluaciones","📊 Evaluaciones"],["entrevistas","🗣️ Entrevistas"],["documentos","📎 Documentos"],["timeline","🕒 Timeline"]].map(([id,l])=>(
              <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
            ))}
          </div>
        </div>

        <div style={{padding:"16px 24px"}}>
          {tab==="resumen"&&(
            <div>
              {[["Vacante",vacante?.puesto||candidato.vacante],["Etapa actual",candidato.etapa],["Estado",candidato.estado],["Puntuación CART",`${candidato.puntCART}/100`],["Cédula",candidato.cedula||"—"],["Educación",candidato.educacion||"—"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:12.5}}>
                  <span style={{color:"#6B7280"}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:4}}>EXPERIENCIA</div>
                <div style={{fontSize:12.5,color:"#374151"}}>{candidato.experiencia||"Sin información registrada."}</div>
              </div>
              <div style={{marginTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:4}}>COMPETENCIAS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
                  {(candidato.competencias||[]).map(c=><span key={c} className="badge badge-orange">{c}</span>)}
                  {(!candidato.competencias||candidato.competencias.length===0)&&<span style={{fontSize:12,color:"#9CA3AF"}}>Sin registrar</span>}
                </div>
              </div>
            </div>
          )}

          {tab==="evaluaciones"&&(
            <div>
              {evaluaciones.length===0&&<div style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:20}}>Sin evaluaciones registradas todavía.</div>}
              {evaluaciones.map(ev=>(
                <div key={ev.id} className="card" style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12.5,fontWeight:700}}>{ev.fecha} · {ev.evaluador}</span>
                    <span className={`badge ${ev.recomendacion==="Avanzar"?"badge-ok":ev.recomendacion==="En espera"?"badge-warn":"badge-crit"}`}>{ev.recomendacion}</span>
                  </div>
                  {[["Comunicación",ev.comunicacion],["Experiencia",ev.experiencia],["Competencias",ev.competencias],["Cultura organizacional",ev.culturaOrganizacional],["Conocimiento técnico",ev.conocimientoTecnico]].map(([l,v])=>(
                    <div key={l as string} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:11.5,color:"#6B7280",width:160}}>{l}</span>
                      <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><span key={n} style={{color:n<=(v as number)?"#F59E0B":"#E5E7EB",fontSize:13}}>★</span>)}</div>
                    </div>
                  ))}
                  <div style={{fontSize:12,color:"#374151",marginTop:8,borderTop:"1px solid #F3F4F6",paddingTop:8}}>{ev.comentarios}</div>
                  <div style={{fontSize:18,fontWeight:800,marginTop:8,color:ev.resultado>=80?"#10B981":ev.resultado>=60?"#F59E0B":"#EF4444"}}>{ev.resultado}/100</div>
                </div>
              ))}
            </div>
          )}

          {tab==="entrevistas"&&(
            <div>
              <button className="btn btn-primary btn-sm" style={{marginBottom:10}} onClick={onProgramarEntrevista}>📅 Programar entrevista</button>
              {entrevistas.length===0&&<div style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:20}}>Sin entrevistas programadas.</div>}
              {entrevistas.map(en=>(
                <div key={en.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:600}}>{en.tipo} · {en.fecha} {en.hora}</div>
                    <div style={{fontSize:11,color:"#6B7280"}}>{en.entrevistador} · {en.modalidad} · {en.ubicacion} · {en.duracion} min</div>
                  </div>
                  <span className={`badge ${en.estado==="Realizada"?"badge-ok":en.estado==="Programada"?"badge-info":"badge-gray"}`}>{en.estado}</span>
                </div>
              ))}
            </div>
          )}

          {tab==="documentos"&&(
            <div>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                <select className="form-control" style={{flex:1}} value={nuevoDocTipo} onChange={e=>setNuevoDocTipo(e.target.value)}>
                  {TIPOS_DOC.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input className="form-control" style={{flex:2}} placeholder="Nombre del archivo" value={nuevoDocNombre} onChange={e=>setNuevoDocNombre(e.target.value)}/>
                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevoDocNombre.trim()){onAgregarDocumento(nuevoDocTipo,nuevoDocNombre);setNuevoDocNombre("");}}}>➕ Agregar</button>
              </div>
              <table className="tbl">
                <thead><tr><th>Documento</th><th>Tipo</th><th>Fecha</th><th>Versión</th><th>Estado</th></tr></thead>
                <tbody>
                  {documentos.map(d=>(
                    <tr key={d.id}>
                      <td style={{fontSize:12,fontWeight:600}}>{d.nombre}</td>
                      <td style={{fontSize:12}}>{d.tipo}</td>
                      <td style={{fontSize:11.5}}>{d.fecha}</td>
                      <td style={{fontSize:11.5}}>{d.version}</td>
                      <td><span className={`badge ${d.estado==="Verificado"?"badge-ok":d.estado==="Recibido"?"badge-info":"badge-warn"}`}>{d.estado}</span></td>
                    </tr>
                  ))}
                  {documentos.length===0&&<tr><td colSpan={5} style={{textAlign:"center" as const,color:"#9CA3AF",padding:16}}>Sin documentos cargados.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab==="timeline"&&(
            <div>
              {timeline.length===0&&<div style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:20}}>Sin historial registrado.</div>}
              {timeline.map(ev=>(
                <div key={ev.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <div style={{width:26,height:26,borderRadius:7,background:"#F9FAFB",border:"1px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{ev.icono}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#1B1F2E"}}>{ev.descripcion}</div>
                    <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:2}}>{ev.fecha}{ev.responsable?` · ${ev.responsable}`:""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:8,padding:"14px 24px",borderTop:"1px solid #F3F4F6"}}>
          {puedeIntegrar&&candidato.etapa==="Contratado"&&<button className="btn btn-primary btn-sm" onClick={onIntegrar}>✅ Integrar al sistema</button>}
          <button className="btn btn-secondary btn-sm" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
