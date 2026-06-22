import React, { useState } from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function CartTab({setTab}:{setTab:(t:string)=>void}) {
  const [puntos,setPuntos]=useState({experiencia:0,estudios:0,ingles:0,disponibilidad:0});
  const [resultado,setResultado]=useState<string|null>(null);

  const evaluar=()=>{
    const score=puntos.experiencia*30+puntos.estudios*25+puntos.ingles*20+puntos.disponibilidad*25;
    if(score>=80) setResultado("CONTRATAR");
    else if(score>=60) setResultado("SEGUNDA ENTREVISTA");
    else if(score>=40) setResultado("EN ESPERA");
    else setResultado("NO CONTINÚA");
  };

  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Árbol de decisión CART — Clasificación de candidatos</div>
          <div style={{fontFamily:"monospace",fontSize:11,lineHeight:1.8,background:"#F8FAFC",padding:"12px 14px",borderRadius:8,marginBottom:12}}>
            <div style={{color:"#E8611A",fontWeight:700}}>INICIO</div>
            <div style={{paddingLeft:16}}>
              <div>¿Experiencia ≥ 2 años?</div>
              <div style={{paddingLeft:16,color:"#10B981"}}>✓ SÍ → ¿Estudios universitarios?</div>
              <div style={{paddingLeft:32,color:"#10B981"}}>✓ SÍ → ¿Inglés intermedio+?</div>
              <div style={{paddingLeft:48,color:"#10B981"}}>✓ SÍ → <b>CONTRATAR</b></div>
              <div style={{paddingLeft:48,color:"#F59E0B"}}>✗ NO → ¿Disponibilidad inmediata?</div>
              <div style={{paddingLeft:64,color:"#3B82F6"}}>SÍ → <b>SEGUNDA ENTREVISTA</b></div>
              <div style={{paddingLeft:64,color:"#F59E0B"}}>NO → <b>EN ESPERA</b></div>
              <div style={{paddingLeft:32,color:"#F59E0B"}}>✗ NO → <b>EN ESPERA</b></div>
              <div style={{paddingLeft:16,color:"#EF4444"}}>✗ NO → ¿Estudios avanzados?</div>
              <div style={{paddingLeft:32,color:"#F59E0B"}}>SÍ → <b>SEGUNDA ENTREVISTA</b></div>
              <div style={{paddingLeft:32,color:"#EF4444"}}>NO → <b>NO CONTINÚA</b></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Evaluador CART</div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
            {[
              {k:"experiencia" as const,l:"Experiencia laboral",opts:["< 1 año","1-2 años","2-5 años","> 5 años"]},
              {k:"estudios" as const,l:"Nivel de estudios",opts:["Sin título","Técnico","Universitario","Posgrado"]},
              {k:"ingles" as const,l:"Nivel de inglés",opts:["Ninguno","Básico","Intermedio","Avanzado"]},
              {k:"disponibilidad" as const,l:"Disponibilidad",opts:["3+ meses","1-3 meses","Inmediata","Flexible"]},
            ].map(f=>(
              <div key={f.k} className="form-group" style={{margin:0}}>
                <label className="form-label">{f.l}</label>
                <select className="form-control" value={puntos[f.k]} onChange={e=>setPuntos(p=>({...p,[f.k]:parseFloat(e.target.value)}))}>
                  <option value={0}>Seleccionar...</option>
                  {f.opts.map((o,i)=><option key={o} value={(i+1)*0.33}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" style={{width:"100%",marginTop:12}} onClick={evaluar}>🌳 Clasificar candidato</button>
          {resultado&&(
            <div style={{marginTop:10,padding:"12px",borderRadius:8,textAlign:"center" as const,background:resultado==="CONTRATAR"?"#ECFDF5":resultado==="SEGUNDA ENTREVISTA"?"#EFF6FF":resultado==="EN ESPERA"?"#FFFBEB":"#FEF2F2",border:`1px solid ${resultado==="CONTRATAR"?"#6EE7B7":resultado==="SEGUNDA ENTREVISTA"?"#BFDBFE":resultado==="EN ESPERA"?"#FDE68A":"#FCA5A5"}`}}>
              <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Resultado CART:</div>
              <div style={{fontSize:16,fontWeight:800,color:resultado==="CONTRATAR"?"#065F46":resultado==="SEGUNDA ENTREVISTA"?"#1D4ED8":resultado==="EN ESPERA"?"#92400E":"#991B1B"}}>{resultado}</div>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-title">¿Cómo funciona el algoritmo CART?</div>
        <div style={{fontSize:12,color:"#374151",lineHeight:1.7}}>
          <p style={{marginTop:0}}>El árbol CART (Classification And Regression Tree) evalúa candidatos usando 4 variables clave con distinto peso:</p>
          {[["30%","Experiencia laboral","Factor más importante. Candidatos con +2 años pasan directamente al nodo de estudios."],["25%","Nivel educativo","Sin título universitario, se requiere disponibilidad inmediata para avanzar."],["20%","Inglés","Idioma diferenciador. Nivel intermedio o superior abre la clasificación Contratar."],["25%","Disponibilidad","Disponibilidad inmediata compensa otras debilidades parciales."]].map(([pct,name,desc])=>(
            <div key={name} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                <span style={{background:"#E8611A",color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{pct}</span>
                <span style={{fontWeight:600,fontSize:12.5}}>{name}</span>
              </div>
              <div style={{fontSize:11.5,color:"#6B7280"}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Reclutamiento({setView,empleados,setEmpleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];setEmpleados:(e:Empleado[])=>void;catalogos:typeof CATALOGOS_INIT}) {
  const [tab,setTab]=useState("vacantes");
  const [vacantes]=useState([
    {id:"VAC-001",puesto:"Técnico de Mantenimiento",depto:"Mantenimiento",tipo:"Indefinido",salarioMin:750000,salarioMax:900000,estado:"Activa",candidatos:4,fecha:"10 Jun 2024"},
    {id:"VAC-002",puesto:"Asistente Administrativo",depto:"Administración",tipo:"Plazo fijo",salarioMin:500000,salarioMax:650000,estado:"Activa",candidatos:7,fecha:"05 Jun 2024"},
  ]);
  const [candidatos,setCandidatos]=useState([
    {id:"CAND-001",nombre:"Esteban Vargas",vacante:"VAC-001",etapa:"Entrevista técnica",puntCART:85,estado:"Avanzando",correo:"e.vargas@gmail.com",tel:"8654-3210"},
    {id:"CAND-002",nombre:"Alicia Moreno",vacante:"VAC-001",etapa:"Prueba técnica",puntCART:72,estado:"En proceso",correo:"a.moreno@hotmail.com",tel:"8833-1122"},
    {id:"CAND-003",nombre:"Ricardo Salas",vacante:"VAC-002",etapa:"Entrevista RRHH",puntCART:91,estado:"Avanzando",correo:"r.salas@yahoo.com",tel:"8799-4455"},
    {id:"CAND-004",nombre:"Patricia Nuñez",vacante:"VAC-002",etapa:"Revisión CV",puntCART:45,estado:"Descartado",correo:"p.nunez@gmail.com",tel:"8600-0000"},
  ]);
  const [selCand,setSelCand]=useState<typeof candidatos[0]|null>(null);

  // Constructor de árbol
  type Nodo={id:string;pregunta:string;siNode:string|"CONTRATAR"|"SEGUNDA ENTREVISTA"|"EN ESPERA"|"NO CONTINÚA";noNode:string|"CONTRATAR"|"SEGUNDA ENTREVISTA"|"EN ESPERA"|"NO CONTINÚA"};
  const [arbolNodos,setArbolNodos]=useState<Record<string,Nodo>>({
    n1:{id:"n1",pregunta:"¿Experiencia ≥ 2 años?",siNode:"n2",noNode:"n3"},
    n2:{id:"n2",pregunta:"¿Estudios universitarios?",siNode:"n4",noNode:"SEGUNDA ENTREVISTA"},
    n3:{id:"n3",pregunta:"¿Estudios avanzados?",siNode:"SEGUNDA ENTREVISTA",noNode:"NO CONTINÚA"},
    n4:{id:"n4",pregunta:"¿Inglés intermedio+?",siNode:"CONTRATAR",noNode:"n5"},
    n5:{id:"n5",pregunta:"¿Disponibilidad inmediata?",siNode:"SEGUNDA ENTREVISTA",noNode:"EN ESPERA"},
  });
  const [pesos,setPesos]=useState({experiencia:30,estudios:25,ingles:20,disponibilidad:25});
  const [vacSelCtor,setVacSelCtor]=useState("Manual");

  const etapas=["Aplicación","Revisión CV","Entrevista RRHH","Prueba técnica","Entrevista técnica","Oferta","Contratado"];

  const integrarAlSistema=(cand:typeof candidatos[0])=>{
    const vac=vacantes.find(v=>v.id===cand.vacante);
    if(!vac) return;
    const nuevo:Empleado={
      id:`COL-${String(empleados.length+1).padStart(3,"0")}`,
      nombre:cand.nombre,
      puesto:vac.puesto,
      depto:vac.depto,
      tipo:vac.tipo,
      inicio:new Date().toLocaleDateString("es-CR"),
      estado:"activo",
      foto:cand.nombre.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(),
      salario:vac.salarioMin,
      planillaId:(catalogos.planillas as any[])[0]?.id||"PL2",
      cedula:"",correo:cand.correo,telefono:cand.tel,banco:"BCR",cuentaBanco:"",jornada:"Completa",
    };
    setEmpleados([...empleados,nuevo]);
    setCandidatos(prev=>prev.map(c=>c.id===cand.id?{...c,etapa:"Contratado",estado:"Integrado"}:c));
    alert(`✅ ¡${cand.nombre} integrado exitosamente!\n\nID: ${nuevo.id}\nPuesto: ${vac.puesto}\nDpto: ${vac.depto}\nPlanilla: ${(catalogos.planillas as any[]).find(p=>p.id===nuevo.planillaId)?.nombre||"—"}\n\nYa aparece en nómina y todos los módulos RRHH.`);
  };

  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Reclutamiento y Selección</div>
            <div className="page-subtitle">Vacantes · Pipeline · CART · Integración automática · ISO 9001 §7.2</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Nueva vacante creada.")}>➕ Nueva Vacante</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("vacantes")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">📋 Vacantes activas</div><div className="kpi-value">{vacantes.filter(v=>v.estado==="Activa").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("candidatos")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">👤 Candidatos en pipeline</div><div className="kpi-value">{candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("pipeline")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🔄 Pipeline por etapa</div><div className="kpi-value" style={{color:"#3B82F6"}}>{candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("integracion")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🔗 Integración</div><div className="kpi-value" style={{color:"#10B981"}}>{candidatos.filter(c=>c.estado==="Integrado").length}</div></div>
        </div>

        <div className="tab-bar">
          {[["vacantes","📋 Vacantes"],["candidatos","👤 Candidatos"],["pipeline","🔄 Pipeline"],["constructor","🛠️ Constructor"],["integracion","🔗 Integración"],["cart","🌳 CART"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="vacantes"&&(
          <div>
            {vacantes.map(v=>(
              <div key={v.id} className="card" style={{marginBottom:10,display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:48,height:48,background:"#EFF6FF",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔍</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{v.puesto}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                    <span className="badge badge-info">{v.depto}</span>
                    <span className={`badge ${v.tipo==="Indefinido"?"badge-ok":"badge-warn"}`}>{v.tipo}</span>
                    <span className="badge badge-ok">{v.estado}</span>
                    <span style={{fontSize:11.5,color:"#6B7280"}}>💰 {fmt(v.salarioMin)} – {fmt(v.salarioMax)}</span>
                    <span style={{fontSize:11.5,color:"#6B7280"}}>📅 Abierta: {v.fecha}</span>
                  </div>
                </div>
                <div style={{textAlign:"center" as const}}>
                  <div style={{fontSize:24,fontWeight:700,color:"#3B82F6"}}>{v.candidatos}</div>
                  <div style={{fontSize:10.5,color:"#6B7280"}}>candidatos</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setTab("candidatos")}>Ver candidatos</button>
                  <button className="btn btn-ghost btn-sm">✏️ Editar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="candidatos"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Candidato</th><th>Vacante</th><th>Etapa</th><th>Punt. CART</th><th>Estado</th><th>Contacto</th><th></th></tr></thead>
                <tbody>
                  {candidatos.map(c=>{
                    const vac=vacantes.find(v=>v.id===c.vacante);
                    const cc=c.puntCART>=80?"#10B981":c.puntCART>=60?"#F59E0B":"#EF4444";
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div className="user-avatar" style={{width:28,height:28,fontSize:10,background:cc}}>{c.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                            <div><div style={{fontSize:12.5,fontWeight:600}}>{c.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{c.id}</div></div>
                          </div>
                        </td>
                        <td style={{fontSize:12}}>{vac?.puesto||c.vacante}</td>
                        <td><span className="badge badge-info" style={{fontSize:10}}>{c.etapa}</span></td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{background:"#E5E7EB",borderRadius:4,height:8,width:60,overflow:"hidden"}}>
                              <div style={{width:`${c.puntCART}%`,background:cc,height:"100%",borderRadius:4}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:12,color:cc}}>{c.puntCART}</span>
                          </div>
                        </td>
                        <td><span className={`badge ${c.estado==="Integrado"?"badge-ok":c.estado==="Descartado"?"badge-crit":c.estado==="Avanzando"?"badge-info":"badge-warn"}`}>{c.estado}</span></td>
                        <td style={{fontSize:11}}>{c.correo}</td>
                        <td>
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>setSelCand(c)}>👁</button>
                            {c.etapa==="Entrevista técnica"&&c.estado!=="Integrado"&&(
                              <button className="btn btn-primary btn-sm" style={{fontSize:10}} onClick={()=>integrarAlSistema(c)}>✅ Integrar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selCand&&(
              <div style={{position:"fixed" as const,top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setSelCand(null)}>
                <div style={{background:"#fff",borderRadius:14,padding:"20px 24px",width:480,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>📄 Ficha de candidato</div>
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
                    <div className="user-avatar" style={{width:48,height:48,fontSize:16,background:selCand.puntCART>=80?"#10B981":"#F59E0B"}}>{selCand.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                    <div><div style={{fontSize:14,fontWeight:700}}>{selCand.nombre}</div><div style={{fontSize:12,color:"#6B7280"}}>{selCand.correo} · {selCand.tel}</div></div>
                  </div>
                  {[["Vacante",vacantes.find(v=>v.id===selCand.vacante)?.puesto||"—"],["Etapa actual",selCand.etapa],["Estado",selCand.estado],["Puntuación CART",`${selCand.puntCART}/100`]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
                      <span style={{color:"#6B7280"}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:14}}>
                    {selCand.estado!=="Integrado"&&selCand.estado!=="Descartado"&&<button className="btn btn-primary btn-sm" onClick={()=>{integrarAlSistema(selCand);setSelCand(null);}}>✅ Integrar al sistema</button>}
                    <button className="btn btn-secondary btn-sm" onClick={()=>setSelCand(null)}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="pipeline"&&(
          <div style={{overflowX:"auto" as const}}>
            <div style={{display:"flex",gap:10,minWidth:900}}>
              {etapas.map(etapa=>{
                const cands=candidatos.filter(c=>c.etapa===etapa);
                return (
                  <div key={etapa} style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:11.5,fontWeight:700,color:"#374151",background:"#F3F4F6",padding:"6px 8px",borderRadius:6,marginBottom:8,textAlign:"center" as const}}>
                      {etapa}<br/><span style={{fontSize:18,fontWeight:800,color:"#1B1F2E"}}>{cands.length}</span>
                    </div>
                    {cands.map(c=>(
                      <div key={c.id} onClick={()=>setSelCand(c)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:7,padding:"8px 10px",marginBottom:6,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                        <div style={{fontSize:11.5,fontWeight:600,marginBottom:2}}>{c.nombre}</div>
                        <div style={{fontSize:10.5,color:"#6B7280",marginBottom:4}}>{vacantes.find(v=>v.id===c.vacante)?.puesto||"—"}</div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{background:"#E5E7EB",borderRadius:3,height:5,flex:1}}>
                            <div style={{width:`${c.puntCART}%`,background:c.puntCART>=80?"#10B981":"#F59E0B",height:"100%",borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:10,fontWeight:700,color:c.puntCART>=80?"#10B981":"#F59E0B"}}>{c.puntCART}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="constructor"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">🛠️ Constructor de Árbol de Decisión</div>
                <div className="form-group" style={{margin:0,marginBottom:14}}>
                  <label className="form-label">Vacante</label>
                  <select className="form-control" value={vacSelCtor} onChange={e=>setVacSelCtor(e.target.value)}>
                    <option value="Manual">Manual (sin aplicar a vacante)</option>
                    {vacantes.map(v=><option key={v.id} value={v.id}>{v.puesto} ({v.depto})</option>)}
                  </select>
                </div>

                <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"12px",marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:10}}>NODOS DEL ÁRBOL</div>
                  {Object.values(arbolNodos).map(nodo=>(
                    <div key={nodo.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:6,padding:"10px",marginBottom:8}}>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        <input type="text" className="form-control" style={{flex:1,fontSize:12}} value={nodo.pregunta} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,pregunta:e.target.value}}))} placeholder="Pregunta Sí/No"/>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setArbolNodos(prev=>{const n={...prev};delete n[nodo.id];return n;})}>✕</button>
                      </div>
                      <div style={{display:"flex",gap:8,fontSize:11}}>
                        <div style={{flex:1}}>
                          <div style={{color:"#6B7280",marginBottom:3}}>Si SÍ:</div>
                          <select className="form-control" value={nodo.siNode} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,siNode:e.target.value as any}}))} style={{fontSize:11}}>
                            <option value="CONTRATAR">✓ CONTRATAR</option>
                            <option value="SEGUNDA ENTREVISTA">↪ SEGUNDA ENTREVISTA</option>
                            <option value="EN ESPERA">⏸ EN ESPERA</option>
                            <option value="NO CONTINÚA">✗ NO CONTINÚA</option>
                            {Object.keys(arbolNodos).map(id=><option key={id} value={id}>{arbolNodos[id]?.pregunta?.slice(0,20)}...</option>)}
                          </select>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{color:"#6B7280",marginBottom:3}}>Si NO:</div>
                          <select className="form-control" value={nodo.noNode} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,noNode:e.target.value as any}}))} style={{fontSize:11}}>
                            <option value="CONTRATAR">✓ CONTRATAR</option>
                            <option value="SEGUNDA ENTREVISTA">↪ SEGUNDA ENTREVISTA</option>
                            <option value="EN ESPERA">⏸ EN ESPERA</option>
                            <option value="NO CONTINÚA">✗ NO CONTINÚA</option>
                            {Object.keys(arbolNodos).map(id=><option key={id} value={id}>{arbolNodos[id]?.pregunta?.slice(0,20)}...</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" style={{width:"100%"}} onClick={()=>{const nid=`n${Object.keys(arbolNodos).length+1}`;setArbolNodos(prev=>({...prev,[nid]:{id:nid,pregunta:"Nueva pregunta",siNode:"CONTRATAR",noNode:"NO CONTINÚA"}}));}}>+ Agregar nodo</button>
                </div>

                <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"12px",marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:12}}>PESOS DE CRITERIOS</div>
                  {([["Experiencia","experiencia"],["Estudios","estudios"],["Inglés","ingles"],["Disponibilidad","disponibilidad"]] as const).map(([label,key])=>(
                    <div key={key} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600}}>{label}</span>
                        <span style={{fontWeight:700,color:"#E8611A"}}>{pesos[key]}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={pesos[key]} onChange={e=>{const pct=parseInt(e.target.value);setPesos(prev=>{const sum=Object.values(prev).reduce((a,b)=>a+b,0)-prev[key]+pct;if(sum>100) return prev;return {...prev,[key]:pct};})}} style={{width:"100%"}}/>
                      <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>Total: {Object.values(pesos).reduce((a,b)=>a+b,0)}% de 100%</div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>alert("✅ Árbol personalizado aplicado a CART")}>📤 Aplicar a CART</button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Preview — Árbol generado</div>
              <div style={{fontFamily:"monospace",fontSize:11,lineHeight:1.8,background:"#F8FAFC",padding:"12px 14px",borderRadius:8}}>
                <div style={{color:"#E8611A",fontWeight:700}}>INICIO</div>
                <div style={{paddingLeft:16}}>
                  {(() => {
                    const renderNodo=(nodoId:string,depth:number):React.ReactNode=>{
                      if(nodoId==="CONTRATAR") return <div style={{color:"#10B981"}}>→ <b>CONTRATAR</b></div>;
                      if(nodoId==="SEGUNDA ENTREVISTA") return <div style={{color:"#3B82F6"}}>→ <b>SEGUNDA ENTREVISTA</b></div>;
                      if(nodoId==="EN ESPERA") return <div style={{color:"#F59E0B"}}>→ <b>EN ESPERA</b></div>;
                      if(nodoId==="NO CONTINÚA") return <div style={{color:"#EF4444"}}>→ <b>NO CONTINÚA</b></div>;
                      const n=arbolNodos[nodoId];
                      if(!n) return null;
                      return (
                        <div key={nodoId}>
                          <div>{n.pregunta}</div>
                          <div style={{paddingLeft:16,color:"#10B981"}}>✓ SÍ: {renderNodo(n.siNode,depth+1)}</div>
                          <div style={{paddingLeft:16,color:"#EF4444"}}>✗ NO: {renderNodo(n.noNode,depth+1)}</div>
                        </div>
                      );
                    };
                    return renderNodo("n1",0);
                  })()}
                </div>
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E5E7EB",fontSize:10,color:"#6B7280"}}>
                  <div style={{marginBottom:4}}><b>Pesos configurados:</b></div>
                  <div>• Experiencia: {pesos.experiencia}%</div>
                  <div>• Estudios: {pesos.estudios}%</div>
                  <div>• Inglés: {pesos.ingles}%</div>
                  <div>• Disponibilidad: {pesos.disponibilidad}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="integracion"&&(
          <div>
            <div style={{background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:10,padding:"12px 16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"#065F46",marginBottom:4}}>🔗 Integración automática al sistema</div>
              <div style={{fontSize:12,color:"#047857"}}>Al integrar un candidato, se crea automáticamente un perfil de Empleado que aparece en: Nómina, Control de Asistencia, Gestión de Desempeño, Capacitación y Administración de Personal.</div>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Candidato</th><th>Vacante</th><th>Punt. CART</th><th>Planilla destino</th><th>Acción</th></tr></thead>
                <tbody>
                  {candidatos.filter(c=>c.estado!=="Descartado").map(c=>{
                    const vac=vacantes.find(v=>v.id===c.vacante);
                    const cc=c.puntCART>=80?"#10B981":"#F59E0B";
                    const planDest=(catalogos.planillas as any[]).find((p:any)=>p.estado==="activa");
                    return (
                      <tr key={c.id}>
                        <td style={{fontWeight:600,fontSize:12.5}}>{c.nombre}</td>
                        <td style={{fontSize:12}}>{vac?.puesto||"—"}</td>
                        <td><span style={{fontWeight:700,color:cc}}>{c.puntCART}/100</span></td>
                        <td><span className="badge badge-info" style={{fontSize:10}}>{planDest?.nombre||"PL2 Operaciones"}</span></td>
                        <td>
                          {c.estado==="Integrado"?(
                            <span className="badge badge-ok">✓ Integrado</span>
                          ):(
                            <button className="btn btn-primary btn-sm" onClick={()=>integrarAlSistema(c)}>✅ Integrar</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="cart"&&<CartTab setTab={setTab}/>}
      </div>

      <div className="right-panel">
        <div className="panel-title">Pipeline resumen</div>
        {etapas.slice(1,-1).map(et=>{
          const n=candidatos.filter(c=>c.etapa===et).length;
          return n>0?(
            <div key={et} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
              <span style={{color:"#374151"}}>{et}</span>
              <span className="badge badge-info" style={{fontSize:9}}>{n}</span>
            </div>
          ):null;
        })}
        <div style={{height:14}}/>
        <div className="panel-title">Vacantes activas</div>
        {vacantes.filter(v=>v.estado==="Activa").map(v=>(
          <div key={v.id} style={{padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontSize:12,fontWeight:600}}>{v.puesto}</div>
            <div style={{fontSize:10.5,color:"#6B7280"}}>{v.candidatos} candidatos · {v.depto}</div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Nueva vacante",i:"➕"},{l:"Agregar candidato",i:"👤"},{l:"Ver pipeline",i:"🔄"},{l:"Usar CART",i:"🌳"}].map(a=>(
          <div key={a.l} onClick={()=>alert(a.l)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
