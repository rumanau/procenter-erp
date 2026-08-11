import React, { useState } from "react";
import type { Candidato, Vacante, Entrevista, Evaluacion, Documento, TimelineEvento, Subtarea, MiembroEquipoReclutamiento } from "../../../types";

const TIPOS_DOC = ["CV", "Cédula", "Título", "Certificación", "Carta de recomendación", "Prueba", "Evaluación", "Oferta laboral"];
const PRIORIDAD_COLOR: Record<string,{c:string;bg:string;icon:string}> = {
  Alta:{c:"#DC2626",bg:"#FEF2F2",icon:"⬆️"}, Media:{c:"#D97706",bg:"#FFFBEB",icon:"➡️"}, Baja:{c:"#6B7280",bg:"#F3F4F6",icon:"⬇️"},
};

export function CandidatoExpediente({candidato,vacante,entrevistas,evaluaciones,documentos,timeline,subtareas,equipo,etapas,onCerrar,onIntegrar,onProgramarEntrevista,onAgregarDocumento,onCambiarEtapa,onActualizarCampo,onAgregarEtiqueta,onQuitarEtiqueta,onAgregarSubtarea,onToggleSubtarea,onComentar}:{
  candidato:Candidato;vacante:Vacante|undefined;
  entrevistas:Entrevista[];evaluaciones:Evaluacion[];documentos:Documento[];timeline:TimelineEvento[];subtareas:Subtarea[];
  equipo:MiembroEquipoReclutamiento[];etapas:string[];
  onCerrar:()=>void;onIntegrar:()=>void;onProgramarEntrevista:()=>void;
  onAgregarDocumento:(tipo:string,nombre:string)=>void;
  onCambiarEtapa:(nuevaEtapa:string)=>void;
  onActualizarCampo:(campo:"asignadoA"|"prioridad",valor:string)=>void;
  onAgregarEtiqueta:(tag:string)=>void;onQuitarEtiqueta:(tag:string)=>void;
  onAgregarSubtarea:(texto:string)=>void;onToggleSubtarea:(id:string)=>void;
  onComentar:(texto:string)=>void;
}) {
  const [actividadTab,setActividadTab]=useState("todo");
  const [nuevoDocTipo,setNuevoDocTipo]=useState(TIPOS_DOC[0]);
  const [nuevoDocNombre,setNuevoDocNombre]=useState("");
  const [nuevaSubtarea,setNuevaSubtarea]=useState("");
  const [nuevaEtiqueta,setNuevaEtiqueta]=useState("");
  const [comentario,setComentario]=useState("");
  const [detallesAbierto,setDetallesAbierto]=useState(true);

  const puedeIntegrar=candidato.estado!=="Integrado"&&candidato.estado!=="Descartado"&&candidato.etapa==="Contratado";
  const cc=candidato.puntCART>=80?"#10B981":candidato.puntCART>=60?"#F59E0B":"#EF4444";
  const prio=PRIORIDAD_COLOR[candidato.prioridad||"Media"];

  const timelineOrdenado=[...timeline].sort((a,b)=>a.id.localeCompare(b.id));
  const comentarios=timelineOrdenado.filter(t=>t.tipo==="comentario");
  const historial=timelineOrdenado.filter(t=>t.tipo!=="comentario");
  const visibles=actividadTab==="todo"?timelineOrdenado.slice().reverse():actividadTab==="comentarios"?comentarios.slice().reverse():historial.slice().reverse();
  const primerEvento=timelineOrdenado[0];
  const ultimoEvento=timelineOrdenado[timelineOrdenado.length-1];

  return (
    <div style={{position:"fixed" as const,top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onCerrar}>
      <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:960,maxHeight:"88vh",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.25)",display:"flex",flexDirection:"column" as const}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",borderBottom:"1px solid #F3F4F6",flexShrink:0}}>
          {vacante&&<span style={{fontSize:11,color:"#9CA3AF"}}>🔍 {vacante.id}</span>}
          {vacante&&<span style={{color:"#D1D5DB"}}>/</span>}
          <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{candidato.id}</span>
          <div style={{marginLeft:"auto"}} className="modal-close" onClick={onCerrar}>✕</div>
        </div>

        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto" as const,padding:"18px 22px",borderRight:"1px solid #F3F4F6"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
              <div className="user-avatar" style={{width:44,height:44,fontSize:15,background:cc}}>{candidato.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{candidato.nombre}</div>
                <div style={{fontSize:11.5,color:"#6B7280"}}>{candidato.correo} · {candidato.tel}</div>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Perfil del candidato</div>
              <div style={{fontSize:12,color:"#374151",lineHeight:1.5}}>{candidato.experiencia||"Sin información registrada."}</div>
              <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{candidato.educacion||"—"}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginTop:6}}>
                {(candidato.competencias||[]).map(c=><span key={c} className="badge badge-orange">{c}</span>)}
              </div>
            </div>

            {vacante&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Requisitos de la vacante</div>
                <div style={{fontSize:12,color:"#374151",lineHeight:1.5}}>{vacante.requisitos||"—"}</div>
              </div>
            )}

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Checklist de la etapa</div>
              <ul style={{margin:0,paddingLeft:18,fontSize:11.5,color:"#374151",lineHeight:1.8}}>
                <li>¿Se agendó la siguiente entrevista o acción de esta etapa?</li>
                <li>¿Se solicitaron los documentos pendientes al candidato?</li>
                <li>¿Cuál es el resultado esperado antes de avanzar de etapa?</li>
                <li>¿Hay observaciones del responsable anterior por revisar?</li>
              </ul>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:700}}>Subtareas {subtareas.length>0&&`${subtareas.filter(s=>s.completada).length}/${subtareas.length}`}</div>
              </div>
              {subtareas.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
                  <input type="checkbox" checked={s.completada} onChange={()=>onToggleSubtarea(s.id)}/>
                  <span style={{fontSize:12,textDecoration:s.completada?"line-through":"none",color:s.completada?"#9CA3AF":"#1B1F2E"}}>{s.texto}</span>
                </div>
              ))}
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <input className="form-control" style={{fontSize:12}} placeholder="Añadir subtarea..." value={nuevaSubtarea} onChange={e=>setNuevaSubtarea(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nuevaSubtarea.trim()){onAgregarSubtarea(nuevaSubtarea.trim());setNuevaSubtarea("");}}}/>
                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevaSubtarea.trim()){onAgregarSubtarea(nuevaSubtarea.trim());setNuevaSubtarea("");}}}>➕</button>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:700}}>Entrevistas vinculadas</div>
                <button className="btn btn-ghost btn-sm" onClick={onProgramarEntrevista}>📅 Programar</button>
              </div>
              {entrevistas.length===0&&<div style={{fontSize:11.5,color:"#9CA3AF"}}>Sin entrevistas registradas.</div>}
              {entrevistas.map(en=>(
                <div key={en.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
                  <span>{en.tipo} · {en.fecha} {en.hora}</span>
                  <span className={`badge ${en.estado==="Realizada"?"badge-ok":en.estado==="Programada"?"badge-info":"badge-gray"}`} style={{fontSize:9}}>{en.estado}</span>
                </div>
              ))}
              {evaluaciones.map(ev=>(
                <div key={ev.id} style={{fontSize:11,color:"#6B7280",padding:"3px 0"}}>📊 Evaluación {ev.fecha}: {ev.resultado}/100 — {ev.recomendacion}</div>
              ))}
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Documentos</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <select className="form-control" style={{flex:1,fontSize:11.5}} value={nuevoDocTipo} onChange={e=>setNuevoDocTipo(e.target.value)}>
                  {TIPOS_DOC.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input className="form-control" style={{flex:2,fontSize:11.5}} placeholder="Nombre del archivo" value={nuevoDocNombre} onChange={e=>setNuevoDocNombre(e.target.value)}/>
                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevoDocNombre.trim()){onAgregarDocumento(nuevoDocTipo,nuevoDocNombre);setNuevoDocNombre("");}}}>➕</button>
              </div>
              {documentos.map(d=>(
                <div key={d.id} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"3px 0"}}>
                  <span>📎 {d.nombre}</span>
                  <span className={`badge ${d.estado==="Verificado"?"badge-ok":d.estado==="Recibido"?"badge-info":"badge-warn"}`} style={{fontSize:9}}>{d.estado}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="tab-bar" style={{marginBottom:10}}>
                {[["todo","Todo"],["comentarios","Comentarios"],["historial","Historial"]].map(([id,l])=>(
                  <div key={id} className={`tab-btn ${actividadTab===id?"active":""}`} onClick={()=>setActividadTab(id)}>{l}</div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div className="user-avatar" style={{width:26,height:26,fontSize:9,flexShrink:0}}>RD</div>
                <div style={{flex:1}}>
                  <textarea className="form-control" rows={2} placeholder="Añadir un comentario..." value={comentario} onChange={e=>setComentario(e.target.value)}/>
                  <button className="btn btn-primary btn-sm" style={{marginTop:6}} disabled={!comentario.trim()} onClick={()=>{onComentar(comentario.trim());setComentario("");}}>Comentar</button>
                </div>
              </div>
              {visibles.map(ev=>(
                <div key={ev.id} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <div style={{width:24,height:24,borderRadius:7,background:"#F9FAFB",border:"1px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{ev.icono}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11.5,color:"#1B1F2E"}}>{ev.descripcion}</div>
                    <div style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>{ev.fecha}{ev.responsable?` · ${ev.responsable}`:""}</div>
                  </div>
                </div>
              ))}
              {visibles.length===0&&<div style={{fontSize:11.5,color:"#9CA3AF",padding:"8px 0"}}>Sin actividad en esta vista.</div>}
            </div>
          </div>

          <div style={{width:280,flexShrink:0,overflowY:"auto" as const,padding:"18px 20px"}}>
            <select className="form-control" style={{fontWeight:700,marginBottom:16,borderColor:"#3B82F6",color:"#1D4ED8",background:"#EFF6FF"}} value={candidato.etapa} onChange={e=>onCambiarEtapa(e.target.value)}>
              {etapas.map(et=><option key={et} value={et}>{et}</option>)}
            </select>

            <div onClick={()=>setDetallesAbierto(!detallesAbierto)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:10}}>
              <span style={{fontSize:11,color:"#9CA3AF"}}>{detallesAbierto?"▾":"▸"}</span>
              <span style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase" as const,letterSpacing:".4px"}}>Detalles</span>
            </div>

            {detallesAbierto&&(
              <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
                <div>
                  <div className="form-label">Persona asignada</div>
                  <select className="form-control" style={{fontSize:12}} value={candidato.asignadoA||""} onChange={e=>onActualizarCampo("asignadoA",e.target.value)}>
                    <option value="">— Sin asignar —</option>
                    {equipo.map(m=><option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                  </select>
                  <div style={{fontSize:10.5,color:"#3B82F6",cursor:"pointer",marginTop:3}} onClick={()=>onActualizarCampo("asignadoA","Ronald")}>Asignarme a mí</div>
                </div>

                <div>
                  <div className="form-label">Prioridad</div>
                  <select className="form-control" style={{fontSize:12,color:prio.c,background:prio.bg,fontWeight:700}} value={candidato.prioridad||"Media"} onChange={e=>onActualizarCampo("prioridad",e.target.value)}>
                    <option value="Alta">⬆️ Alta</option>
                    <option value="Media">➡️ Media</option>
                    <option value="Baja">⬇️ Baja</option>
                  </select>
                </div>

                <div>
                  <div className="form-label">Vacante</div>
                  <div>{vacante?<span className="badge badge-purple">🔍 {vacante.id} — {vacante.puesto}</span>:<span style={{fontSize:11.5,color:"#9CA3AF"}}>—</span>}</div>
                </div>

                <div>
                  <div className="form-label">Etiquetas</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap" as const,marginBottom:6}}>
                    {(candidato.etiquetas||[]).map(t=>(
                      <span key={t} className="badge badge-gray" style={{cursor:"pointer"}} onClick={()=>onQuitarEtiqueta(t)}>{t} ✕</span>
                    ))}
                  </div>
                  <input className="form-control" style={{fontSize:11.5}} placeholder="Nueva etiqueta + Enter" value={nuevaEtiqueta} onChange={e=>setNuevaEtiqueta(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nuevaEtiqueta.trim()){onAgregarEtiqueta(nuevaEtiqueta.trim());setNuevaEtiqueta("");}}}/>
                </div>

                <div>
                  <div className="form-label">Story point (CART)</div>
                  <span className="badge" style={{background:cc+"22",color:cc,fontWeight:700}}>🌳 {candidato.puntCART}/100</span>
                </div>

                <div>
                  <div className="form-label">Fecha de inicio</div>
                  <span style={{fontSize:12,color:"#374151"}}>{primerEvento?.fecha||"—"}</span>
                </div>

                <div>
                  <div className="form-label">Informador</div>
                  <span style={{fontSize:12,color:"#374151"}}>{candidato.informador||"—"}</span>
                </div>

                <div>
                  <div className="form-label">Estado</div>
                  <span className={`badge ${candidato.estado==="Integrado"?"badge-ok":candidato.estado==="Descartado"?"badge-crit":candidato.estado==="Avanzando"?"badge-info":"badge-warn"}`}>{candidato.estado}</span>
                </div>
              </div>
            )}

            {puedeIntegrar&&<button className="btn btn-primary btn-sm" style={{width:"100%",marginTop:16}} onClick={onIntegrar}>✅ Integrar al sistema</button>}

            <div style={{fontSize:9.5,color:"#9CA3AF",marginTop:16,paddingTop:10,borderTop:"1px solid #F3F4F6"}}>
              <div>Creado {primerEvento?.fecha||"—"}</div>
              <div>Actualizado {ultimoEvento?.fecha||"—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
