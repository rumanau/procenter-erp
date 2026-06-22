import React, { useState } from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function GestionDesempeno({setView,empleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];catalogos:typeof CATALOGOS_INIT}) {
  const activos=empleados.filter(e=>e.estado==="activo");
  const [tab,setTab]=useState("kpis");
  const [selEmp,setSelEmp]=useState<Empleado|null>(activos[0]||null);

  const evaluaciones=activos.map((e,i)=>{
    const puntajes=[82,91,74,88,79,95,68,84];
    const punt=puntajes[i%puntajes.length];
    return {
      emp:e,
      punt,
      nivel:punt>=90?"Sobresaliente":punt>=80?"Satisfactorio":punt>=70?"En desarrollo":"Insuficiente",
      color:punt>=90?"#10B981":punt>=80?"#3B82F6":punt>=70?"#F59E0B":"#EF4444",
      kpis:[
        {k:"Calidad del trabajo",v:punt+5>100?99:punt+5},
        {k:"Productividad",v:punt},
        {k:"Trabajo en equipo",v:punt-4<0?0:punt-4},
        {k:"Iniciativa",v:punt+3>100?99:punt+3},
        {k:"Puntualidad",v:punt+8>100?99:punt+8},
      ],
      feedback360:[
        {eval:"Jefe directo",punt:punt+4>100?99:punt+4,icon:"👔"},
        {eval:"Pares",punt:punt,icon:"👥"},
        {eval:"Auto-evaluación",punt:punt+6>100?99:punt+6,icon:"🔍"},
        {eval:"Subalternos",punt:Math.max(0,punt-10),icon:"👇"},
      ],
      plan:punt<80?"Plan de mejora activo":null,
    };
  });

  const evalSel=evaluaciones.find(ev=>ev.emp.id===selEmp?.id)||evaluaciones[0];
  const ranking=[...evaluaciones].sort((a,b)=>b.punt-a.punt);

  const bscPerspectivas=[
    {nombre:"Financiera",icon:"💰",kpis:[{k:"Productividad por colaborador",v:87},{k:"Costo por hora trabajada",v:92}]},
    {nombre:"Clientes internos",icon:"🤝",kpis:[{k:"Satisfacción del servicio interno",v:84},{k:"Tiempo de respuesta",v:79}]},
    {nombre:"Procesos internos",icon:"⚙️",kpis:[{k:"Cumplimiento de procedimientos",v:91},{k:"No conformidades resueltas",v:88}]},
    {nombre:"Aprendizaje",icon:"📚",kpis:[{k:"Capacitaciones completadas",v:74},{k:"Planes de carrera activos",v:65}]},
  ];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Gestión del Desempeño</div>
            <div className="page-subtitle">KPIs · 360° · Planes de mejora · Balanced Scorecard · ISO 9001 §9.1</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Nueva evaluación iniciada.")}>➕ Nueva Evaluación</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Puntuación promedio</div><div className="kpi-value" style={{color:"#3B82F6"}}>{Math.round(evaluaciones.reduce((a,e)=>a+e.punt,0)/evaluaciones.length)}</div><div className="kpi-pill kpi-up">/ 100 pts</div></div>
          <div className="kpi"><div className="kpi-label">Sobresalientes</div><div className="kpi-value" style={{color:"#10B981"}}>{evaluaciones.filter(e=>e.punt>=90).length}</div></div>
          <div className="kpi"><div className="kpi-label">En desarrollo</div><div className="kpi-value" style={{color:"#F59E0B"}}>{evaluaciones.filter(e=>e.punt<80).length}</div><div className="kpi-pill kpi-warn">Con plan de mejora</div></div>
          <div className="kpi"><div className="kpi-label">Período</div><div className="kpi-value" style={{fontSize:16}}>Q2</div><div className="kpi-pill kpi-info">2024</div></div>
        </div>

        <div className="tab-bar">
          {[["kpis","📊 KPIs"],["360","🔄 360°"],["planes","📋 Planes"],["ranking","🏆 Ranking"],["bsc","⚖️ BSC"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="kpis"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:10}}>
                <div className="card-title">Seleccionar colaborador</div>
                {activos.map(e=>{
                  const ev=evaluaciones.find(x=>x.emp.id===e.id)!;
                  return (
                    <div key={e.id} onClick={()=>setSelEmp(e)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px",borderRadius:8,border:`2px solid ${selEmp?.id===e.id?ev.color:"transparent"}`,background:selEmp?.id===e.id?ev.color+"10":"transparent",cursor:"pointer",marginBottom:4}}>
                      <div className="user-avatar" style={{width:26,height:26,fontSize:10,background:ev.color}}>{e.foto.slice(0,2)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600}}>{e.nombre}</div>
                        <div style={{fontSize:10.5,color:"#6B7280"}}>{e.puesto}</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:ev.color}}>{ev.punt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {evalSel&&(
              <div style={{flex:1}}>
                <div className="card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                    <div className="user-avatar" style={{width:48,height:48,fontSize:16,background:evalSel.color}}>{evalSel.emp.foto.slice(0,2)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{evalSel.emp.nombre}</div>
                      <div style={{fontSize:12,color:"#6B7280"}}>{evalSel.emp.puesto} · {evalSel.emp.depto}</div>
                    </div>
                    <div style={{textAlign:"center" as const}}>
                      <div style={{fontSize:32,fontWeight:800,color:evalSel.color}}>{evalSel.punt}</div>
                      <div style={{fontSize:11,fontWeight:600,color:evalSel.color}}>{evalSel.nivel}</div>
                    </div>
                  </div>
                  <div className="card-title" style={{marginBottom:10}}>KPIs de desempeño</div>
                  {evalSel.kpis.map(k=>(
                    <div key={k.k} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                        <span style={{color:"#374151"}}>{k.k}</span>
                        <span style={{fontWeight:700,color:k.v>=80?evalSel.color:"#F59E0B"}}>{k.v}/100</span>
                      </div>
                      <div style={{background:"#E5E7EB",borderRadius:4,height:8,overflow:"hidden"}}>
                        <div style={{width:`${k.v}%`,height:"100%",background:k.v>=80?evalSel.color:"#F59E0B",borderRadius:4,transition:"width .4s"}}/>
                      </div>
                    </div>
                  ))}
                  {evalSel.plan&&(
                    <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"10px 12px",marginTop:10}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#92400E",marginBottom:4}}>⚠️ Plan de mejora activo</div>
                      <div style={{fontSize:11.5,color:"#78350F"}}>Puntuación inferior al objetivo (80 pts). Este colaborador tiene un plan de mejora vigente con metas trimestrales.</div>
                      <button className="btn btn-ghost btn-sm" style={{marginTop:6,fontSize:10}} onClick={()=>setTab("planes")}>Ver plan →</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="360"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <select className="form-control" style={{width:220}} onChange={e=>{const emp=activos.find(a=>a.id===e.target.value);if(emp)setSelEmp(emp);}}>
                {activos.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            {evalSel&&(
              <div className="g2" style={{alignItems:"start"}}>
                <div className="card">
                  <div className="card-title">Evaluación 360° — {evalSel.emp.nombre}</div>
                  {evalSel.feedback360.map(f=>(
                    <div key={f.eval} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:16}}>{f.icon}</span>
                          <span style={{fontSize:12,fontWeight:600}}>{f.eval}</span>
                        </div>
                        <span style={{fontSize:14,fontWeight:700,color:f.punt>=80?"#10B981":f.punt>=70?"#F59E0B":"#EF4444"}}>{f.punt} pts</span>
                      </div>
                      <div style={{background:"#E5E7EB",borderRadius:6,height:10,overflow:"hidden"}}>
                        <div style={{width:`${f.punt}%`,height:"100%",background:f.punt>=80?"#10B981":f.punt>=70?"#F59E0B":"#EF4444",borderRadius:6}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{borderTop:"1px solid #E5E7EB",paddingTop:10,marginTop:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
                      <span>Promedio 360°</span>
                      <span style={{color:evalSel.color}}>{Math.round(evalSel.feedback360.reduce((a,f)=>a+f.punt,0)/evalSel.feedback360.length)} pts</span>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Modelo 360° — Dimensiones evaluadas</div>
                  {[{d:"Liderazgo",desc:"Capacidad para influir y dirigir equipos",score:85},{d:"Comunicación",desc:"Efectividad en la transmisión de ideas",score:88},{d:"Resolución de problemas",desc:"Habilidad para analizar y actuar",score:79},{d:"Orientación a resultados",desc:"Enfoque en el logro de objetivos",score:91},{d:"Adaptabilidad",desc:"Respuesta positiva ante el cambio",score:76}].map(d=>(
                    <div key={d.d} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div><div style={{fontSize:12,fontWeight:600}}>{d.d}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{d.desc}</div></div>
                        <span style={{fontWeight:700,fontSize:13,color:d.score>=80?"#10B981":"#F59E0B"}}>{d.score}</span>
                      </div>
                      <div style={{background:"#E5E7EB",borderRadius:3,height:5}}>
                        <div style={{width:`${d.score}%`,background:d.score>=80?"#10B981":"#F59E0B",height:"100%",borderRadius:3}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="planes"&&(
          <div>
            <div className="card" style={{marginBottom:10}}>
              <div className="card-title">Planes de mejora activos</div>
              {evaluaciones.filter(e=>e.punt<80).map(ev=>(
                <div key={ev.emp.id} style={{padding:"12px 0",borderBottom:"1px solid #E5E7EB"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div className="user-avatar" style={{width:32,height:32,fontSize:11,background:ev.color}}>{ev.emp.foto.slice(0,2)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{ev.emp.nombre}</div>
                      <div style={{fontSize:11,color:"#6B7280"}}>Puntuación actual: <strong style={{color:ev.color}}>{ev.punt}/100</strong></div>
                    </div>
                    <span className="badge badge-warn">Plan activo</span>
                  </div>
                  <div style={{paddingLeft:42}}>
                    {[{obj:"Alcanzar 80 pts en KPI calidad",plazo:"30 Sep 2024",prog:40},{obj:"Completar capacitación liderazgo",plazo:"15 Oct 2024",prog:25},{obj:"Reducir ausencias no justificadas",plazo:"Dic 2024",prog:60}].map((m,i)=>(
                      <div key={i} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                          <span>✦ {m.obj}</span>
                          <span style={{color:"#6B7280",fontSize:10}}>{m.plazo}</span>
                        </div>
                        <div style={{background:"#E5E7EB",borderRadius:4,height:6}}>
                          <div style={{width:`${m.prog}%`,background:"#3B82F6",height:"100%",borderRadius:4}}/>
                        </div>
                        <div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{m.prog}% completado</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {evaluaciones.filter(e=>e.punt<80).length===0&&(
                <div style={{textAlign:"center" as const,padding:"24px 0",color:"#9CA3AF"}}>
                  <div style={{fontSize:28,marginBottom:8}}>🎉</div>
                  <div style={{fontSize:13,fontWeight:600}}>Sin planes de mejora activos</div>
                  <div style={{fontSize:12}}>Todo el equipo supera el umbral de 80 puntos</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==="ranking"&&(
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>#</th><th>Colaborador</th><th>Puntuación</th><th>Nivel</th><th>Tendencia</th><th>Plan</th></tr></thead>
              <tbody>
                {ranking.map((ev,i)=>(
                  <tr key={ev.emp.id}>
                    <td>
                      <span style={{fontSize:16,fontWeight:700,color:i===0?"#F59E0B":i===1?"#9CA3AF":i===2?"#92400E":"#1B1F2E"}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                      </span>
                    </td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="user-avatar" style={{width:28,height:28,fontSize:10,background:ev.color}}>{ev.emp.foto.slice(0,2)}</div>
                        <div><div style={{fontSize:12.5,fontWeight:600}}>{ev.emp.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{ev.emp.puesto}</div></div>
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{background:"#E5E7EB",borderRadius:4,height:8,width:80,overflow:"hidden"}}>
                          <div style={{width:`${ev.punt}%`,background:ev.color,height:"100%",borderRadius:4}}/>
                        </div>
                        <span style={{fontWeight:700,fontSize:14,color:ev.color}}>{ev.punt}</span>
                      </div>
                    </td>
                    <td><span className="badge" style={{background:ev.color+"20",color:ev.color,fontSize:10}}>{ev.nivel}</span></td>
                    <td style={{fontSize:13}}>{ev.punt>=85?"↑":"↔"}</td>
                    <td>{ev.plan?<span className="badge badge-warn" style={{fontSize:10}}>Activo</span>:<span style={{color:"#10B981",fontSize:11}}>✓</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="bsc"&&(
          <div>
            <div style={{fontSize:12,color:"#6B7280",marginBottom:12}}>Balanced Scorecard — Perspectivas estratégicas de RRHH</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {bscPerspectivas.map(p=>{
                const avg=Math.round(p.kpis.reduce((a,k)=>a+k.v,0)/p.kpis.length);
                const c=avg>=85?"#10B981":avg>=75?"#3B82F6":"#F59E0B";
                return (
                  <div key={p.nombre} className="card" style={{borderLeft:`4px solid ${c}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <span style={{fontSize:20}}>{p.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div>
                        <div style={{fontSize:11,color:"#6B7280"}}>Perspectiva BSC</div>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,color:c}}>{avg}%</div>
                    </div>
                    {p.kpis.map(k=>(
                      <div key={k.k} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:2}}>
                          <span style={{color:"#374151"}}>{k.k}</span>
                          <span style={{fontWeight:700,color:k.v>=80?c:"#F59E0B"}}>{k.v}%</span>
                        </div>
                        <div style={{background:"#E5E7EB",borderRadius:4,height:6}}>
                          <div style={{width:`${k.v}%`,background:k.v>=80?c:"#F59E0B",height:"100%",borderRadius:4}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Distribución del equipo</div>
        {[{l:"Sobresaliente (≥90)",v:evaluaciones.filter(e=>e.punt>=90).length,c:"#10B981"},{l:"Satisfactorio (80-89)",v:evaluaciones.filter(e=>e.punt>=80&&e.punt<90).length,c:"#3B82F6"},{l:"En desarrollo (70-79)",v:evaluaciones.filter(e=>e.punt>=70&&e.punt<80).length,c:"#F59E0B"},{l:"Insuficiente (<70)",v:evaluaciones.filter(e=>e.punt<70).length,c:"#EF4444"}].map(s=>(
          <div key={s.l} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}><span style={{color:"#374151"}}>{s.l}</span><span style={{fontWeight:700,color:s.c}}>{s.v}</span></div>
            <div style={{background:"#E5E7EB",borderRadius:4,height:7}}>
              <div style={{width:`${(s.v/evaluaciones.length)*100}%`,background:s.c,height:"100%",borderRadius:4}}/>
            </div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones</div>
        {[{l:"Nueva evaluación",i:"➕"},{l:"Exportar reporte",i:"📥"},{l:"Ver planes de mejora",i:"📋"},{l:"Calibración de notas",i:"⚖️"}].map(a=>(
          <div key={a.l} onClick={()=>alert(a.l)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
