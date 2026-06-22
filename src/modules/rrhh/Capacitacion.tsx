import React, { useState } from "react";
import type { View } from "../../types";

export function Capacitacion({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState("plan");

  const cursos=[
    {id:"C01",nombre:"ISO 9001:2015 — Fundamentos",tipo:"Obligatorio",hrs:8,estado:"Activo",completados:5,total:8,fecha:"15 Jul 2024",instructor:"Consultor externo",costo:450000},
    {id:"C02",nombre:"Seguridad e Higiene Laboral",tipo:"Obligatorio",hrs:4,estado:"Activo",completados:8,total:8,fecha:"Completado",instructor:"INTE",costo:200000},
    {id:"C03",nombre:"Liderazgo y Comunicación",tipo:"Desarrollo",hrs:16,estado:"Activo",completados:2,total:8,fecha:"Ago 2024",instructor:"Facilitador interno",costo:0},
    {id:"C04",nombre:"Excel Avanzado",tipo:"Técnico",hrs:12,estado:"Planificado",completados:0,total:8,fecha:"Sep 2024",instructor:"Online",costo:120000},
    {id:"C05",nombre:"Manejo de Materiales Peligrosos",tipo:"Obligatorio",hrs:6,estado:"Activo",completados:3,total:4,fecha:"22 Jun 2024",instructor:"CFIA",costo:300000},
  ];

  const matrizComp=[
    {competencia:"ISO 9001",nivel:"Básico",depts:["Calidad","Operaciones","RRHH","Administración"],obligatorio:true},
    {competencia:"Seguridad industrial",nivel:"Básico",depts:["Mantenimiento","Operaciones"],obligatorio:true},
    {competencia:"Liderazgo",nivel:"Intermedio",depts:["Calidad","RRHH","Administración"],obligatorio:false},
    {competencia:"Excel / Office",nivel:"Básico",depts:["Administración","RRHH","Calidad"],obligatorio:false},
    {competencia:"Normas RTCR",nivel:"Avanzado",depts:["Calidad","Operaciones"],obligatorio:true},
  ];

  const certificaciones=[
    {nombre:"ISO 9001 Lead Auditor",colaborador:"María Rojas",emitido:"Mar 2023",vence:"Mar 2025",estado:"Vigente",org:"Bureau Veritas"},
    {nombre:"ISO 45001 Implementador",colaborador:"Jules Ramirez",emitido:"Jun 2023",vence:"Jun 2025",estado:"Vigente",org:"SGS"},
    {nombre:"Manejo de Materiales Peligrosos",colaborador:"Carlos Montoya",emitido:"Nov 2022",vence:"Nov 2023",estado:"Vencida",org:"CFIA"},
    {nombre:"Primeros Auxilios",colaborador:"Sofía Méndez",emitido:"Ene 2024",vence:"Ene 2026",estado:"Vigente",org:"Cruz Roja CR"},
  ];

  const totalHrs=cursos.reduce((a,c)=>a+c.hrs,0);
  const totalCosto=cursos.reduce((a,c)=>a+c.costo,0);
  const certVencidas=certificaciones.filter(c=>c.estado==="Vencida").length;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Capacitación y Desarrollo</div>
            <div className="page-subtitle">Plan anual · Matriz de competencias · Certificaciones · ISO 9001 §7.2 · ISO 9001 §7.3</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Nueva capacitación agregada.")}>➕ Nueva Capacitación</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Cursos activos/planif.</div><div className="kpi-value">{cursos.length}</div><div className="kpi-pill kpi-info">{totalHrs}h en total</div></div>
          <div className="kpi"><div className="kpi-label">Costo anual planificado</div><div className="kpi-value" style={{fontSize:14,color:"#E8611A"}}>₡{Math.round(totalCosto/1000)}K</div></div>
          <div className="kpi"><div className="kpi-label">Certificaciones</div><div className="kpi-value" style={{color:"#10B981"}}>{certificaciones.filter(c=>c.estado==="Vigente").length}</div><div className="kpi-pill kpi-up">Vigentes</div></div>
          {certVencidas>0&&<div className="kpi"><div className="kpi-label">Certs. vencidas</div><div className="kpi-value" style={{color:"#EF4444"}}>{certVencidas}</div><div className="kpi-pill kpi-down">Urgente renovar</div></div>}
        </div>

        <div className="tab-bar">
          {[["plan","📅 Plan de Capacitación"],["matriz","📊 Matriz de Competencias"],["certs","🎓 Certificaciones"],["indicadores","📈 Indicadores"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="plan"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"hidden",marginBottom:12}}>
              <table className="tbl">
                <thead><tr><th>Curso / Taller</th><th>Tipo</th><th>Horas</th><th>Estado</th><th>Avance</th><th>Fecha</th><th>Costo</th><th></th></tr></thead>
                <tbody>
                  {cursos.map(c=>{
                    const pct=Math.round((c.completados/c.total)*100);
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{fontSize:12.5,fontWeight:600}}>{c.nombre}</div>
                          <div style={{fontSize:11,color:"#6B7280"}}>{c.instructor}</div>
                        </td>
                        <td><span className={`badge ${c.tipo==="Obligatorio"?"badge-crit":c.tipo==="Técnico"?"badge-info":"badge-ok"}`} style={{fontSize:10}}>{c.tipo}</span></td>
                        <td style={{fontWeight:700,fontSize:13}}>{c.hrs}h</td>
                        <td><span className={`badge ${c.estado==="Activo"?"badge-ok":c.estado==="Planificado"?"badge-warn":"badge-info"}`}>{c.estado}</span></td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{background:"#E5E7EB",borderRadius:4,height:7,width:60,overflow:"hidden"}}>
                              <div style={{width:`${pct}%`,background:pct===100?"#10B981":"#3B82F6",height:"100%",borderRadius:4}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:600,color:pct===100?"#10B981":"#6B7280"}}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{fontSize:11.5,color:"#6B7280"}}>{c.fecha}</td>
                        <td style={{fontSize:12,color:c.costo>0?"#E8611A":"#10B981",fontWeight:600}}>{c.costo>0?`₡${c.costo.toLocaleString()}`:"Interno"}</td>
                        <td>
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn btn-ghost btn-sm">👁</button>
                            <button className="btn btn-ghost btn-sm">✏️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="matriz"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"auto"}}>
              <table className="tbl" style={{minWidth:600}}>
                <thead>
                  <tr style={{background:"#F8FAFC"}}>
                    <th>Competencia</th>
                    <th>Nivel requerido</th>
                    <th>Obligatoria</th>
                    <th>Departamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {matrizComp.map(m=>(
                    <tr key={m.competencia}>
                      <td style={{fontWeight:600,fontSize:12.5}}>{m.competencia}</td>
                      <td><span className={`badge ${m.nivel==="Avanzado"?"badge-crit":m.nivel==="Intermedio"?"badge-warn":"badge-info"}`}>{m.nivel}</span></td>
                      <td>{m.obligatorio?<span className="badge badge-crit">Obligatoria</span>:<span className="badge badge-ok">Opcional</span>}</td>
                      <td>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap" as const}}>
                          {m.depts.map(d=><span key={d} className="badge badge-info" style={{fontSize:10}}>{d}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="certs"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Certificación</th><th>Colaborador</th><th>Organismo</th><th>Emitida</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {certificaciones.map((c,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600,fontSize:12.5}}>{c.nombre}</td>
                      <td style={{fontSize:12}}>{c.colaborador}</td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.org}</td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.emitido}</td>
                      <td style={{fontSize:11.5,color:c.estado==="Vencida"?"#EF4444":"#6B7280",fontWeight:c.estado==="Vencida"?700:400}}>{c.vence}</td>
                      <td><span className={`badge ${c.estado==="Vigente"?"badge-ok":"badge-crit"}`}>{c.estado}</span></td>
                      <td>
                        {c.estado==="Vencida"&&<button className="btn btn-primary btn-sm" style={{fontSize:10}} onClick={()=>alert("Proceso de renovación iniciado.")}>🔄 Renovar</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="indicadores"&&(
          <div>
            <div className="g2" style={{alignItems:"start"}}>
              <div className="card">
                <div className="card-title">KPIs de Capacitación</div>
                {[{k:"Horas de capacitación por colaborador",v:Math.round(totalHrs/8),meta:16,unit:"hrs"},{k:"Cobertura del plan anual",v:72,meta:100,unit:"%"},{k:"Satisfacción de participantes",v:88,meta:90,unit:"%"},{k:"Certificaciones vigentes",v:Math.round((certificaciones.filter(c=>c.estado==="Vigente").length/certificaciones.length)*100),meta:100,unit:"%"}].map(k=>(
                  <div key={k.k} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"#374151"}}>{k.k}</span>
                      <span style={{fontWeight:700,color:k.v>=k.meta?"#10B981":"#F59E0B"}}>{k.v}/{k.meta} {k.unit}</span>
                    </div>
                    <div style={{background:"#E5E7EB",borderRadius:4,height:8,overflow:"hidden"}}>
                      <div style={{width:`${Math.min(100,(k.v/k.meta)*100)}%`,background:k.v>=k.meta?"#10B981":"#F59E0B",height:"100%",borderRadius:4}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">Inversión en capacitación</div>
                {[["Presupuesto anual","₡2,000,000"],["Ejecutado","₡"+totalCosto.toLocaleString()],["Disponible","₡"+(2000000-totalCosto).toLocaleString()],["ROI estimado","3.2x"],["Costo por colaborador","₡"+(Math.round(totalCosto/8)).toLocaleString()]].map(([l,v])=>(
                  <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontWeight:600}}>{v}</span></div>
                ))}
                <div style={{marginTop:12,background:"#EFF6FF",borderRadius:8,padding:"10px 12px"}}>
                  <div style={{fontSize:11.5,fontWeight:600,color:"#1D4ED8",marginBottom:4}}>📊 ISO 9001 §7.2 — Cumplimiento</div>
                  <div style={{fontSize:11,color:"#1E40AF"}}>Plan de capacitación documentado y ejecutado. {Math.round((cursos.filter(c=>c.completados===c.total).length/cursos.length)*100)}% de cursos completados.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Próximas capacitaciones</div>
        {cursos.filter(c=>c.estado==="Activo"&&c.fecha!=="Completado").slice(0,4).map(c=>(
          <div key={c.id} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontSize:12,fontWeight:600}}>{c.nombre}</div>
            <div style={{fontSize:10.5,color:"#6B7280"}}>📅 {c.fecha} · {c.hrs}h</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <div style={{background:"#E5E7EB",borderRadius:3,height:5,flex:1}}>
                <div style={{width:`${Math.round((c.completados/c.total)*100)}%`,background:"#3B82F6",height:"100%",borderRadius:3}}/>
              </div>
              <span style={{fontSize:10,color:"#6B7280"}}>{Math.round((c.completados/c.total)*100)}%</span>
            </div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Alertas</div>
        {certificaciones.filter(c=>c.estado==="Vencida").map((c,i)=>(
          <div key={i} style={{padding:"8px 10px",background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:7,marginBottom:6}}>
            <div style={{fontSize:11.5,fontWeight:600,color:"#991B1B"}}>🔴 Cert. vencida</div>
            <div style={{fontSize:11,color:"#6B7280"}}>{c.nombre} · {c.colaborador}</div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Nueva capacitación",i:"➕"},{l:"Agregar certificación",i:"🎓"},{l:"Exportar plan",i:"📥"},{l:"Reporte ISO 9001",i:"📋"}].map(a=>(
          <div key={a.l} onClick={()=>alert(a.l)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
