import React, { useState } from "react";
import type { View } from "../../types";

export function ClimaYSalud({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState("clima");

  const encuestas=[
    {dim:"Satisfacción general",valor:78,meta:80,icon:"😊"},
    {dim:"Comunicación interna",valor:72,meta:80,icon:"💬"},
    {dim:"Reconocimiento y méritos",valor:65,meta:75,icon:"🏆"},
    {dim:"Equilibrio vida-trabajo",valor:81,meta:80,icon:"⚖️"},
    {dim:"Ambiente físico",valor:88,meta:80,icon:"🏢"},
    {dim:"Liderazgo",valor:76,meta:80,icon:"👔"},
  ];

  const rotacion=[
    {mes:"Ene 2024",ing:1,sal:0},
    {mes:"Feb 2024",ing:0,sal:1},
    {mes:"Mar 2024",ing:2,sal:0},
    {mes:"Abr 2024",ing:0,sal:0},
    {mes:"May 2024",ing:1,sal:0},
    {mes:"Jun 2024",ing:1,sal:0},
  ];

  const incidentes=[
    {id:"INC-2024-003",tipo:"Accidente leve",colaborador:"Pedro Salas",fecha:"10 Jun 2024",estado:"Abierto",gravedad:"Leve",descripcion:"Contusión en mano derecha por herramienta"},
    {id:"INC-2024-002",tipo:"Casi accidente",colaborador:"Carlos Montoya",fecha:"22 May 2024",estado:"Cerrado",gravedad:"Sin lesión",descripcion:"Derrame de líquido en pasillo sin señalización"},
    {id:"INC-2024-001",tipo:"Enfermedad ocupacional",colaborador:"—",fecha:"05 Mar 2024",estado:"Cerrado",gravedad:"Leve",descripcion:"Molestia lumbar por postura prolongada"},
  ];

  const epp=[
    {item:"Casco de seguridad",cant:8,estado:"OK",vence:"Mar 2026",icon:"⛑️"},
    {item:"Guantes de nitrilo",cant:200,estado:"OK",vence:"Dic 2024",icon:"🧤"},
    {item:"Lentes de seguridad",cant:10,estado:"OK",vence:"Jun 2025",icon:"🥽"},
    {item:"Protección auditiva",cant:15,estado:"Vencido",vence:"Jun 2024",icon:"🎧"},
    {item:"Chaleco reflectivo",cant:5,estado:"OK",vence:"Ene 2026",icon:"🦺"},
    {item:"Calzado de seguridad",cant:8,estado:"Por renovar",vence:"Ago 2024",icon:"👢"},
  ];

  const riesgos=[
    {area:"Bodega",riesgo:"Caída de objetos",nivel:"Alto",control:"Señalización · Orden y limpieza",estado:"Activo"},
    {area:"Taller",riesgo:"Ruido excesivo",nivel:"Medio",control:"EPP auditivo obligatorio",estado:"Controlado"},
    {area:"Oficinas",riesgo:"Trastornos musculoesqueléticos",nivel:"Bajo",control:"Ergonomía · Pausas activas",estado:"Controlado"},
    {area:"General",riesgo:"Incendio",nivel:"Medio",control:"Extintores · Plan evacuación",estado:"Activo"},
    {area:"Bodega de químicos",riesgo:"Exposición a sustancias",nivel:"Alto",control:"Hoja MSDS · EPP completo",estado:"Activo"},
  ];

  const nivelColor=(n:string)=>n==="Alto"?"#EF4444":n==="Medio"?"#F59E0B":"#10B981";

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Clima Laboral & Salud Ocupacional</div>
            <div className="page-subtitle">Encuestas · Rotación · Incidentes · EPP · Matriz de riesgos · ISO 45001</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Nueva acción registrada.")}>➕ Nueva Acción</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi">
            <div className="kpi-label">Clima laboral</div>
            <div className="kpi-value" style={{color:encuestas[0].valor>=80?"#10B981":"#F59E0B"}}>{Math.round(encuestas.reduce((a,e)=>a+e.valor,0)/encuestas.length)}%</div>
            <div className="kpi-pill kpi-warn">Meta: 80%</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Rotación acumulada</div>
            <div className="kpi-value" style={{color:"#10B981"}}>{rotacion.reduce((a,r)=>a+r.sal,0)}</div>
            <div className="kpi-pill kpi-up">bajas en 2024</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Incidentes abiertos</div>
            <div className="kpi-value" style={{color:"#EF4444"}}>{incidentes.filter(i=>i.estado==="Abierto").length}</div>
            <div className="kpi-pill kpi-down">Requieren cierre</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">EPP vencidos/por vencer</div>
            <div className="kpi-value" style={{color:"#F59E0B"}}>{epp.filter(e=>e.estado!=="OK").length}</div>
            <div className="kpi-pill kpi-warn">Atención requerida</div>
          </div>
        </div>

        <div className="tab-bar">
          {[["clima","🌡️ Clima Laboral"],["rotacion","📊 Rotación"],["incidentes","⚠️ Incidentes"],["epp","🦺 EPP"],["riesgos","⚡ Riesgos"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="clima"&&(
          <div>
            <div className="g2" style={{alignItems:"start"}}>
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div className="card-title" style={{marginBottom:0}}>Encuesta de clima Q2 2024</div>
                  <button className="btn btn-secondary btn-sm" onClick={()=>alert("Encuesta enviada a colaboradores.")}>📧 Enviar encuesta</button>
                </div>
                {encuestas.map(e=>(
                  <div key={e.dim} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:16}}>{e.icon}</span>
                        <span style={{fontSize:12,color:"#374151"}}>{e.dim}</span>
                      </div>
                      <div>
                        <span style={{fontWeight:700,fontSize:14,color:e.valor>=e.meta?"#10B981":"#F59E0B"}}>{e.valor}%</span>
                        <span style={{fontSize:10.5,color:"#9CA3AF",marginLeft:4}}>/ {e.meta}% meta</span>
                      </div>
                    </div>
                    <div style={{background:"#E5E7EB",borderRadius:6,height:10,overflow:"hidden"}}>
                      <div style={{width:`${e.valor}%`,background:e.valor>=e.meta?"#10B981":"#F59E0B",height:"100%",borderRadius:6,transition:"width .4s"}}/>
                    </div>
                    {e.valor<e.meta&&(
                      <div style={{fontSize:10.5,color:"#EF4444",marginTop:2}}>⚠️ Por debajo de la meta. Generar plan de acción.</div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="card-title">Índice general de clima</div>
                  <div style={{textAlign:"center" as const,padding:"10px 0"}}>
                    <div style={{fontSize:48,fontWeight:800,color:"#F59E0B"}}>{Math.round(encuestas.reduce((a,e)=>a+e.valor,0)/encuestas.length)}%</div>
                    <div style={{fontSize:12,color:"#6B7280"}}>Promedio general · Meta: 80%</div>
                    <div style={{fontSize:11.5,fontWeight:600,color:"#F59E0B",marginTop:4}}>Por debajo del objetivo · Plan de acción activo</div>
                  </div>
                  <div style={{background:"#FFFBEB",borderRadius:8,padding:"10px 12px",border:"1px solid #FDE68A"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#92400E",marginBottom:4}}>Áreas de mejora identificadas:</div>
                    {encuestas.filter(e=>e.valor<e.meta).map(e=>(
                      <div key={e.dim} style={{fontSize:11.5,color:"#78350F",marginBottom:2}}>• {e.dim}: {e.valor}% (meta {e.meta}%)</div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Próximas acciones</div>
                  {[{a:"Sesión de retroalimentación",f:"15 Jul 2024",r:"RRHH"},{a:"Taller de comunicación",f:"22 Jul 2024",r:"Facilitador externo"},{a:"Revisión de reconocimientos",f:"01 Ago 2024",r:"Gerencia"}].map((ac,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
                      <span style={{fontSize:14}}>📌</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600}}>{ac.a}</div>
                        <div style={{fontSize:10.5,color:"#6B7280"}}>📅 {ac.f} · 👤 {ac.r}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="rotacion"&&(
          <div>
            <div className="g2" style={{alignItems:"start"}}>
              <div className="card">
                <div className="card-title">Movimientos de personal 2024</div>
                <table className="tbl">
                  <thead><tr><th>Mes</th><th>Ingresos</th><th>Salidas</th><th>Neto</th></tr></thead>
                  <tbody>
                    {rotacion.map(r=>(
                      <tr key={r.mes}>
                        <td style={{fontSize:12}}>{r.mes}</td>
                        <td><span style={{color:"#10B981",fontWeight:700}}>{r.ing>0?`+${r.ing}`:"—"}</span></td>
                        <td><span style={{color:r.sal>0?"#EF4444":"#9CA3AF",fontWeight:700}}>{r.sal>0?`-${r.sal}`:"—"}</span></td>
                        <td><span style={{fontWeight:700,color:r.ing-r.sal>=0?"#10B981":"#EF4444"}}>{r.ing-r.sal>=0?"+":""}{r.ing-r.sal}</span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{fontWeight:700,background:"#F8FAFC"}}>
                      <td>TOTAL</td>
                      <td style={{color:"#10B981"}}>+{rotacion.reduce((a,r)=>a+r.ing,0)}</td>
                      <td style={{color:"#EF4444"}}>-{rotacion.reduce((a,r)=>a+r.sal,0)}</td>
                      <td style={{color:"#10B981"}}>+{rotacion.reduce((a,r)=>a+r.ing-r.sal,0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="card">
                <div className="card-title">Indicadores de rotación</div>
                {[["Tasa de rotación anual","3.2%","Meta: <5%","#10B981"],["Tiempo promedio en empresa","2.8 años","Meta: >2 años","#10B981"],["Motivo principal de salida","Oportunidad mejor","—","#6B7280"],["Costo estimado por rotación","₡1,200,000","Por colaborador","#E8611A"]].map(([l,v,sub,c])=>(
                  <div key={l as string} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                    <div style={{fontSize:11,color:"#6B7280"}}>{l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:c as string}}>{v}</div>
                    <div style={{fontSize:10.5,color:"#9CA3AF"}}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="incidentes"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,color:"#6B7280"}}>Registro de accidentes, casi-accidentes y enfermedades · ISO 45001 §10.2</div>
              <button className="btn btn-primary btn-sm" onClick={()=>alert("Nuevo incidente registrado.")}>⚠️ Registrar Incidente</button>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Folio</th><th>Tipo</th><th>Colaborador</th><th>Fecha</th><th>Gravedad</th><th>Estado</th><th>Descripción</th><th></th></tr></thead>
                <tbody>
                  {incidentes.map(inc=>(
                    <tr key={inc.id}>
                      <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A"}}>{inc.id}</td>
                      <td><span className={`badge ${inc.tipo.includes("Accidente")?"badge-crit":inc.tipo.includes("Casi")?"badge-warn":"badge-info"}`} style={{fontSize:10}}>{inc.tipo}</span></td>
                      <td style={{fontSize:12.5,fontWeight:500}}>{inc.colaborador}</td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{inc.fecha}</td>
                      <td><span className={`badge ${inc.gravedad==="Sin lesión"?"badge-ok":"badge-warn"}`}>{inc.gravedad}</span></td>
                      <td><span className={`badge ${inc.estado==="Cerrado"?"badge-ok":"badge-crit"}`}>{inc.estado}</span></td>
                      <td style={{fontSize:11.5,color:"#374151",maxWidth:200}}>{inc.descripcion}</td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          <button className="btn btn-ghost btn-sm">👁</button>
                          {inc.estado==="Abierto"&&<button className="btn btn-primary btn-sm" style={{fontSize:10}} onClick={()=>alert("Incidente marcado como cerrado.")}>✅ Cerrar</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="epp"&&(
          <div>
            <div className="g2">
              {epp.map(e=>(
                <div key={e.item} className="card" style={{display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${e.estado==="OK"?"#10B981":e.estado==="Vencido"?"#EF4444":"#F59E0B"}`}}>
                  <span style={{fontSize:28}}>{e.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{e.item}</div>
                    <div style={{fontSize:11.5,color:"#6B7280"}}>{e.cant} unidades · Vence: {e.vence}</div>
                  </div>
                  <div>
                    <span className={`badge ${e.estado==="OK"?"badge-ok":e.estado==="Vencido"?"badge-crit":"badge-warn"}`}>{e.estado}</span>
                    {e.estado!=="OK"&&<button className="btn btn-ghost btn-sm" style={{display:"block",marginTop:4,fontSize:10}} onClick={()=>alert("Proceso de renovación de EPP iniciado.")}>🔄 Renovar</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="riesgos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,color:"#6B7280"}}>Matriz de riesgos laborales · ISO 45001 §6.1</div>
              <button className="btn btn-primary btn-sm" onClick={()=>alert("Nuevo riesgo agregado.")}>➕ Agregar Riesgo</button>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Área</th><th>Riesgo identificado</th><th>Nivel</th><th>Control aplicado</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {riesgos.map((r,i)=>(
                    <tr key={i}>
                      <td><span className="badge badge-info" style={{fontSize:10}}>{r.area}</span></td>
                      <td style={{fontSize:12.5,fontWeight:500}}>{r.riesgo}</td>
                      <td><span className="badge" style={{background:nivelColor(r.nivel)+"20",color:nivelColor(r.nivel),fontSize:10}}>{r.nivel}</span></td>
                      <td style={{fontSize:11.5,color:"#374151"}}>{r.control}</td>
                      <td><span className={`badge ${r.estado==="Controlado"?"badge-ok":"badge-warn"}`}>{r.estado}</span></td>
                      <td><button className="btn btn-ghost btn-sm">✏️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:12}}>
              {[{nivel:"Alto",c:"#EF4444",n:riesgos.filter(r=>r.nivel==="Alto").length},{nivel:"Medio",c:"#F59E0B",n:riesgos.filter(r=>r.nivel==="Medio").length},{nivel:"Bajo",c:"#10B981",n:riesgos.filter(r=>r.nivel==="Bajo").length}].map(s=>(
                <div key={s.nivel} style={{background:s.c+"10",border:`1px solid ${s.c}30`,borderRadius:8,padding:"10px 14px",textAlign:"center" as const}}>
                  <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.n}</div>
                  <div style={{fontSize:12,color:s.c,fontWeight:600}}>Riesgo {s.nivel}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Alertas ISO 45001</div>
        <div style={{padding:"9px 10px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#991B1B"}}>🔴 Incidente sin cerrar</div>
          <div style={{fontSize:11,color:"#6B7280"}}>INC-2024-003 · Pedro Salas</div>
        </div>
        <div style={{padding:"9px 10px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#991B1B"}}>🔴 EPP vencido</div>
          <div style={{fontSize:11,color:"#6B7280"}}>Protección auditiva · Jun 2024</div>
        </div>
        <div style={{padding:"9px 10px",borderRadius:8,background:"#FFFBEB",border:"1px solid #FDE68A",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#92400E"}}>🟡 Satisfacción 78%</div>
          <div style={{fontSize:11,color:"#6B7280"}}>Meta: 80% · Acciones activas</div>
        </div>
        <div style={{height:12}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Registrar incidente",i:"⚠️"},{l:"Entregar EPP",i:"🦺"},{l:"Enviar encuesta",i:"📊"},{l:"Acción correctiva",i:"✅"}].map(a=>(
          <div key={a.l} onClick={()=>alert(a.l)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
