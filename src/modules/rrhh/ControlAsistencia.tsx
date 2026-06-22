import React, { useState } from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function ControlAsistencia({setView,empleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];catalogos:typeof CATALOGOS_INIT}) {
  const activos=empleados.filter(e=>e.estado==="activo");
  const estados=["presente","ausente","tardanza","permiso"];
  const [registros,setRegistros]=useState(()=>activos.map((e,i)=>({
    id:e.id,nombre:e.nombre,depto:e.depto,puesto:e.puesto,foto:e.foto,
    entrada:i%5===1?"—":`0${7+Math.floor(i*1.3)%2}:${i%2===0?"00":"15"}`,
    salida:i%5===1?"—":"—",
    estado:estados[i%4] as string,
    horas:0,
    justificacion:"",
  })));
  const [tab,setTab]=useState("hoy");
  const [turnos]=useState([
    {id:"T1",nombre:"Diurno A",hora_entrada:"07:00",hora_salida:"15:00",dias:"Lun-Vie",asignados:["COL-001","COL-002","COL-003"],color:"#3B82F6"},
    {id:"T2",nombre:"Diurno B",hora_entrada:"08:00",hora_salida:"17:00",dias:"Lun-Vie",asignados:["COL-004","COL-005"],color:"#10B981"},
    {id:"T3",nombre:"Nocturno",hora_entrada:"21:00",hora_salida:"07:00",dias:"Lun-Dom",asignados:[],color:"#7C3AED"},
  ]);

  const registrarEntrada=(id:string)=>{
    const hora=new Date().toLocaleTimeString("es-CR",{hour:"2-digit",minute:"2-digit"});
    setRegistros(prev=>prev.map(r=>r.id===id?{...r,entrada:hora,estado:"presente"}:r));
  };
  const registrarSalida=(id:string)=>{
    const hora=new Date().toLocaleTimeString("es-CR",{hour:"2-digit",minute:"2-digit"});
    setRegistros(prev=>prev.map(r=>r.id===id?{...r,salida:hora,horas:8}:r));
  };
  const justificar=(id:string)=>{
    const mot=window.prompt("Motivo de justificación:");
    if(mot) setRegistros(prev=>prev.map(r=>r.id===id?{...r,justificacion:mot,estado:"permiso"}:r));
  };

  const presentes=registros.filter(r=>r.estado==="presente").length;
  const ausentes=registros.filter(r=>r.estado==="ausente").length;
  const tardanzas=registros.filter(r=>r.estado==="tardanza").length;
  const permisos=registros.filter(r=>r.estado==="permiso").length;
  const pct=activos.length>0?Math.round((presentes/activos.length)*100):0;

  const estadoBadge=(est:string)=>{
    if(est==="presente") return "badge-ok";
    if(est==="ausente") return "badge-crit";
    if(est==="tardanza") return "badge-warn";
    return "badge-info";
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Control de Asistencia</div>
            <div className="page-subtitle">Marcado digital · Turnos · Ausencias · ISO 9001 §7.1.2</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Marcaje masivo registrado.")}>📍 Marcar Entrada Masiva</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Presentes hoy</div><div className="kpi-value" style={{color:"#10B981"}}>{presentes}</div><div className="kpi-pill kpi-up">{pct}% asistencia</div></div>
          <div className="kpi"><div className="kpi-label">Ausentes</div><div className="kpi-value" style={{color:"#EF4444"}}>{ausentes}</div><div className="kpi-pill kpi-down">Sin justificar</div></div>
          <div className="kpi"><div className="kpi-label">Tardanzas</div><div className="kpi-value" style={{color:"#F59E0B"}}>{tardanzas}</div><div className="kpi-pill kpi-warn">+10 min promedio</div></div>
          <div className="kpi"><div className="kpi-label">Permisos</div><div className="kpi-value" style={{color:"#3B82F6"}}>{permisos}</div><div className="kpi-pill kpi-info">Justificados</div></div>
        </div>

        <div className="tab-bar">
          {[["hoy","📅 Hoy"],["semana","📊 Semana"],["turnos","🔄 Turnos"],["ausencias","📋 Ausencias"],["heExtra","⏱ HE Pendientes"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="hoy"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",gap:8,alignItems:"center"}}>
                <div className="header-search" style={{flex:1}}><span>🔍</span><input placeholder="Buscar colaborador..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
                <select className="form-control" style={{width:150}}><option>Todos los estados</option><option>Presente</option><option>Ausente</option><option>Tardanza</option></select>
                <select className="form-control" style={{width:160}}><option>Todos los deptos.</option></select>
              </div>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Depto.</th><th>Estado</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Acciones</th></tr></thead>
                <tbody>
                  {registros.map(r=>(
                    <tr key={r.id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div className="user-avatar" style={{width:28,height:28,fontSize:10}}>{r.foto.slice(0,2)}</div>
                          <div><div style={{fontSize:12.5,fontWeight:600}}>{r.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{r.puesto}</div></div>
                        </div>
                      </td>
                      <td><span className="badge badge-info" style={{fontSize:10}}>{r.depto}</span></td>
                      <td><span className={`badge ${estadoBadge(r.estado)}`} style={{fontSize:10}}>{r.estado}</span></td>
                      <td style={{fontFamily:"monospace",fontSize:12,color:r.entrada==="—"?"#D1D5DB":"#1B1F2E"}}>{r.entrada}</td>
                      <td style={{fontFamily:"monospace",fontSize:12,color:r.salida==="—"?"#D1D5DB":"#1B1F2E"}}>{r.salida}</td>
                      <td style={{fontSize:12,fontWeight:r.horas>0?700:400,color:r.horas>0?"#1B1F2E":"#D1D5DB"}}>{r.horas>0?`${r.horas}h`:"—"}</td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          {r.entrada==="—"&&<button className="btn btn-ghost btn-sm" style={{fontSize:10}} onClick={()=>registrarEntrada(r.id)}>📍 Entrada</button>}
                          {r.entrada!=="—"&&r.salida==="—"&&<button className="btn btn-ghost btn-sm" style={{fontSize:10}} onClick={()=>registrarSalida(r.id)}>🏃 Salida</button>}
                          {r.estado==="ausente"&&<button className="btn btn-ghost btn-sm" style={{fontSize:10}} onClick={()=>justificar(r.id)}>✏️ Justif.</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="semana"&&(
          <div className="card" style={{padding:0,overflow:"auto"}}>
            <table className="tbl" style={{minWidth:700}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  <th>Colaborador</th>
                  {["Lun 17","Mar 18","Mié 19","Jue 20","Vie 21"].map(d=><th key={d}>{d}</th>)}
                  <th>Total hrs.</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((e,i)=>{
                  const dias=[8,0,8,8,7].map((h,j)=>({h,est:h===0?"ausente":"presente",td:j===i%5}));
                  const total=dias.reduce((a,d)=>a+d.h,0);
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div className="user-avatar" style={{width:24,height:24,fontSize:9}}>{e.foto.slice(0,2)}</div>
                          <span style={{fontSize:12,fontWeight:500}}>{e.nombre}</span>
                        </div>
                      </td>
                      {dias.map((d,j)=>(
                        <td key={j} style={{textAlign:"center",background:d.est==="ausente"?"#FEF2F2":d.h<8?"#FFFBEB":"transparent"}}>
                          <div style={{fontSize:11.5,fontWeight:600,color:d.est==="ausente"?"#EF4444":d.h<8?"#F59E0B":"#1B1F2E"}}>{d.h>0?`${d.h}h`:"—"}</div>
                        </td>
                      ))}
                      <td style={{fontWeight:700,fontSize:13,color:total<40?"#F59E0B":"#1B1F2E"}}>{total}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab==="turnos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <button className="btn btn-primary btn-sm" onClick={()=>alert("Nuevo turno creado.")}>➕ Nuevo Turno</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {turnos.map(t=>(
                <div key={t.id} className="card" style={{borderTop:`3px solid ${t.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.color}}>{t.nombre}</div>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:10}}>✏️ Editar</button>
                  </div>
                  <div style={{fontSize:12,color:"#6B7280",marginBottom:4}}>⏰ {t.hora_entrada} — {t.hora_salida}</div>
                  <div style={{fontSize:12,color:"#6B7280",marginBottom:10}}>📅 {t.dias}</div>
                  <div style={{fontSize:11,fontWeight:600,color:"#1B1F2E",marginBottom:6}}>Colaboradores ({t.asignados.length}):</div>
                  {t.asignados.length>0?(
                    t.asignados.map(id=>{const e=empleados.find(x=>x.id===id);return e?<div key={id} style={{fontSize:11.5,color:"#374151",padding:"2px 0"}}>• {e.nombre}</div>:<div key={id} style={{fontSize:11.5,color:"#9CA3AF"}}>• {id}</div>;})
                  ):(
                    <div style={{fontSize:11.5,color:"#D1D5DB",fontStyle:"italic"}}>Sin asignados</div>
                  )}
                  <button className="btn btn-secondary btn-sm" style={{width:"100%",marginTop:8}} onClick={()=>alert(`Asignar colaboradores a ${t.nombre}`)}>👥 Asignar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="ausencias"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,color:"#6B7280"}}>Registro de ausencias, incapacidades y vacaciones</div>
              <button className="btn btn-primary btn-sm" onClick={()=>alert("Nueva solicitud de ausencia.")}>➕ Registrar Ausencia</button>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Tipo</th><th>Fecha inicio</th><th>Fecha fin</th><th>Días</th><th>Estado</th><th>Documento</th></tr></thead>
                <tbody>
                  {[{col:"María Rojas",tipo:"Vacaciones",ini:"24 Jun 2024",fin:"28 Jun 2024",dias:5,estado:"Aprobada",doc:"Solicitud"},{col:"Carlos Montoya",tipo:"Incapacidad",ini:"15 Jun 2024",fin:"17 Jun 2024",dias:3,estado:"Aprobada",doc:"CCSS"},{col:"Sofía Méndez",tipo:"Permiso con goce",ini:"20 Jun 2024",fin:"20 Jun 2024",dias:1,estado:"Aprobada",doc:"Autorización"},{col:"Pedro Salas",tipo:"Ausencia injustificada",ini:"18 Jun 2024",fin:"18 Jun 2024",dias:1,estado:"Pendiente justificación",doc:"—"}].map((a,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600,fontSize:12.5}}>{a.col}</td>
                      <td><span className={`badge ${a.tipo==="Vacaciones"?"badge-info":a.tipo.includes("injust")?"badge-crit":"badge-warn"}`}>{a.tipo}</span></td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{a.ini}</td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{a.fin}</td>
                      <td style={{fontWeight:700,fontSize:13}}>{a.dias}</td>
                      <td><span className={`badge ${a.estado.includes("Aprobada")?"badge-ok":"badge-warn"}`}>{a.estado}</span></td>
                      <td><button className="btn btn-ghost btn-sm" style={{fontSize:10}}>{a.doc}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="heExtra"&&(
          <div>
            <div className="card" style={{marginBottom:10}}>
              <div className="card-title">Solicitudes de horas extra pendientes de aprobación</div>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Fecha</th><th>Tipo</th><th>Horas</th><th>Costo est.</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {activos.slice(0,3).map((e,i)=>{
                    const pl=(catalogos.planillas as any[]).find((p:any)=>p.id===e.planillaId);
                    const hrTarifa=(e.salario/(30*8));
                    const h=[2,3,1][i];
                    const tipo=["regular","doble","regular"][i];
                    const costo=Math.round(hrTarifa*h*(tipo==="doble"?2:1.5));
                    return (
                      <tr key={e.id}>
                        <td style={{fontWeight:600,fontSize:12.5}}>{e.nombre}</td>
                        <td style={{fontSize:11.5,color:"#6B7280"}}>Jun 2024</td>
                        <td><span className={`badge ${tipo==="doble"?"badge-crit":"badge-warn"}`}>{tipo==="doble"?"HE Doble":"HE Regular"}</span></td>
                        <td style={{fontWeight:700}}>{h}h</td>
                        <td style={{fontSize:12,color:"#E8611A",fontWeight:600}}>₡{costo.toLocaleString()}</td>
                        <td><span className="badge badge-warn">Pendiente</span></td>
                        <td>
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn btn-ghost btn-sm" style={{color:"#10B981",fontSize:10}} onClick={()=>alert(`✅ HE aprobada: ${e.nombre}`)}>✅ Aprobar</button>
                            <button className="btn btn-ghost btn-sm" style={{color:"#EF4444",fontSize:10}} onClick={()=>alert(`❌ HE rechazada`)}>❌ Rechazar</button>
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
      </div>

      <div className="right-panel">
        <div className="panel-title">Asistencia hoy</div>
        <div style={{background:"#ECFDF5",borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center" as const}}>
          <div style={{fontSize:28,fontWeight:700,color:"#10B981"}}>{pct}%</div>
          <div style={{fontSize:11,color:"#065F46"}}>Asistencia del día</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {[{l:"Presentes",v:presentes,c:"#10B981"},{l:"Ausentes",v:ausentes,c:"#EF4444"},{l:"Tardanzas",v:tardanzas,c:"#F59E0B"},{l:"Permisos",v:permisos,c:"#3B82F6"}].map(k=>(
            <div key={k.l} style={{background:"#F9FAFB",borderRadius:6,padding:"6px 8px",textAlign:"center" as const}}>
              <div style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</div>
              <div style={{fontSize:10,color:"#6B7280"}}>{k.l}</div>
            </div>
          ))}
        </div>
        <div className="panel-title">Últimas marcaciones</div>
        {registros.filter(r=>r.entrada!=="—").slice(0,5).map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div className="user-avatar" style={{width:24,height:24,fontSize:9,background:"#10B981"}}>{r.foto.slice(0,2)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,fontWeight:600}}>{r.nombre}</div>
              <div style={{fontSize:10.5,color:"#6B7280"}}>⏰ {r.entrada}</div>
            </div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Marcar entrada masiva",i:"📍"},{l:"Registrar ausencia",i:"📋"},{l:"Ver turnos",i:"🔄"},{l:"Exportar reporte",i:"📥"}].map(a=>(
          <div key={a.l} onClick={()=>alert(a.l)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
