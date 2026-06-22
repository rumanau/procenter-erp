import React, { useState } from "react";
import type { View, Solicitud } from "../../types";
import { SOLICITUDES_DATA } from "../../data/catalogos";

export function BandejaGestion({setView}:{setView:(v:View)=>void}) {
  const [filtroEstado,setFiltroEstado]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("");
  const [selSol,setSelSol]=useState<Solicitud|null>(null);

  const semHoras=(h:number)=>h<=24?"#10B981":h<=72?"#F59E0B":"#EF4444";
  const semLabel=(h:number)=>h<=24?"🟢 A tiempo":h<=72?"🟡 En espera":`🔴 ${h}h sin resolver`;

  const data=SOLICITUDES_DATA.filter(s=>
    (!filtroEstado||s.estado===filtroEstado)&&
    (!filtroCategoria||s.categoria===filtroCategoria)
  );

  const estadoBadge=(e:string)=>{
    const m:Record<string,string>={pendiente:"badge-warn","en-proceso":"badge-info",aprobada:"badge-ok",rechazada:"badge-crit"};
    const l:Record<string,string>={pendiente:"⏳ Pendiente","en-proceso":"🔄 En proceso",aprobada:"✅ Aprobada",rechazada:"❌ Rechazada"};
    return {cls:m[e]||"badge-gray",label:l[e]||e};
  };

  const urgBadge=(u:string)=>{
    const m:Record<string,string>={baja:"badge-ok",media:"badge-warn",alta:"badge-crit"};
    return m[u]||"badge-gray";
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Bandeja de Gestión</div>
            <div className="page-subtitle">Solicitudes recibidas · Semáforo de tiempo · Flujo de aprobación configurable</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("solicitudes")}>➕ Nueva Solicitud</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
          {[["Total","8","badge-info","#3B82F6"],["Pendientes","4","badge-warn","#F59E0B"],["En proceso","2","badge-info","#3B82F6"],["Aprobadas","1","badge-ok","#10B981"],["Rechazadas","1","badge-crit","#EF4444"]].map(([l,v,cl,c])=>(
            <div key={l} className="kpi" style={{textAlign:"center"}}>
              <div className="kpi-label">{l}</div>
              <div className="kpi-value" style={{color:c as string,fontSize:24}}>{v}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <div className="header-search" style={{flex:1,minWidth:180}}><span>🔍</span><input placeholder="Buscar por solicitante, tipo, caso..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            <select className="form-control" style={{width:150}} onChange={e=>setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="pendiente">⏳ Pendiente</option>
              <option value="en-proceso">🔄 En proceso</option>
              <option value="aprobada">✅ Aprobada</option>
              <option value="rechazada">❌ Rechazada</option>
            </select>
            <select className="form-control" style={{width:160}} onChange={e=>setFiltroCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              <option value="inventario">📦 Inventario</option>
              <option value="rrhh">👥 RRHH</option>
              <option value="operativo">⚙️ Operativo</option>
              <option value="admin">🏛️ Administrativo</option>
            </select>
            <select className="form-control" style={{width:130}}>
              <option>Todos los tiempos</option>
              <option>🟢 A tiempo</option>
              <option>🟡 En espera</option>
              <option>🔴 Vencidos</option>
            </select>
          </div>
        </div>

        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead>
              <tr><th>Tiempo</th><th>Caso</th><th>Tipo</th><th>Solicitante</th><th>Fecha</th><th>Urgencia</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {data.map(s=>{
                const {cls:eCls,label:eLabel}=estadoBadge(s.estado);
                return (
                  <tr key={s.id} onClick={()=>setSelSol(s)} style={{cursor:"pointer"}}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:semHoras(s.horas),flexShrink:0}}/>
                        <div style={{fontSize:10.5,color:semHoras(s.horas),fontWeight:600}}>{s.horas}h</div>
                      </div>
                    </td>
                    <td><b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{s.id}</b></td>
                    <td>
                      <div style={{fontSize:12.5,fontWeight:500}}>{s.tipo}</div>
                      <div style={{fontSize:10.5,color:"#6B7280"}}>{s.categoria}</div>
                    </td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div className="user-avatar" style={{width:24,height:24,fontSize:9}}>{s.solicitante.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                        <span style={{fontSize:12}}>{s.solicitante}</span>
                      </div>
                    </td>
                    <td style={{fontSize:11.5,color:"#6B7280"}}>{s.fecha}</td>
                    <td><span className={`badge ${urgBadge(s.urgencia)}`}>{s.urgencia==="alta"?"🔴 Alta":s.urgencia==="media"?"🟡 Media":"🟢 Baja"}</span></td>
                    <td><span className={`badge ${eCls}`}>{eLabel}</span></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",gap:4}}>
                        {s.estado==="pendiente"&&<>
                          <button className="btn btn-success btn-sm" onClick={()=>alert(`✅ Solicitud ${s.id} aprobada.`)}>✓ Aprobar</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>alert(`❌ Solicitud ${s.id} rechazada.`)}>✕</button>
                        </>}
                        {s.estado==="en-proceso"&&<button className="btn btn-primary btn-sm" onClick={()=>alert(`📋 Solicitud ${s.id} procesada.`)}>Procesar</button>}
                        {(s.estado==="aprobada"||s.estado==="rechazada")&&<span style={{fontSize:11,color:"#9CA3AF"}}>Cerrado</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB"}}>
            <span>Mostrando {data.length} de {SOLICITUDES_DATA.length} solicitudes</span>
            <div style={{display:"flex",gap:4}}>{["‹","1","›"].map((p,i)=><button key={i} className={`btn btn-sm ${p==="1"?"btn-primary":"btn-ghost"}`}>{p}</button>)}</div>
          </div>
        </div>
      </div>

      {selSol&&(
        <div style={{width:300,background:"#fff",borderLeft:"1px solid #E5E7EB",padding:16,overflow:"auto",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700}}>Detalle de Solicitud</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelSol(null)}>✕</button>
          </div>
          <div style={{padding:"10px 14px",borderRadius:10,background:selSol.horas<=24?"#ECFDF5":selSol.horas<=72?"#FFFBEB":"#FEF2F2",border:`1px solid ${selSol.horas<=24?"#6EE7B7":selSol.horas<=72?"#FDE68A":"#FCA5A5"}`,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:24}}>{selSol.horas<=24?"🟢":selSol.horas<=72?"🟡":"🔴"}</div>
            <div>
              <div style={{fontSize:12.5,fontWeight:700,color:semHoras(selSol.horas)}}>{semLabel(selSol.horas)}</div>
              <div style={{fontSize:11,color:"#6B7280"}}>SLA: 48h · Transcurrido: {selSol.horas}h</div>
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="res-row"><span className="res-label">Caso</span><span className="res-val" style={{color:"#E8611A",fontFamily:"monospace",fontSize:11}}>{selSol.id}</span></div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val">{selSol.tipo}</span></div>
            <div className="res-row"><span className="res-label">Solicitante</span><span className="res-val">{selSol.solicitante}</span></div>
            <div className="res-row"><span className="res-label">Fecha</span><span className="res-val">{selSol.fecha}</span></div>
            <div className="res-row"><span className="res-label">Urgencia</span><span className="res-val">{selSol.urgencia==="alta"?"🔴 Alta":selSol.urgencia==="media"?"🟡 Media":"🟢 Baja"}</span></div>
            <div className="res-row"><span className="res-label">Estado</span><span className={`badge ${estadoBadge(selSol.estado).cls}`}>{estadoBadge(selSol.estado).label}</span></div>
          </div>
          <div className="card" style={{marginBottom:12,background:"#F9FAFB"}}>
            <div className="card-title" style={{fontSize:12}}>Descripción</div>
            <p style={{fontSize:12,color:"#374151",lineHeight:1.6}}>{selSol.descripcion}</p>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Historial del caso</div>
            <div style={{position:"relative",paddingLeft:20}}>
              <div style={{position:"absolute",left:7,top:0,bottom:0,width:2,background:"#E5E7EB"}}/>
              {[{icon:"📬",label:"Solicitud recibida",fecha:selSol.fecha,color:"#10B981"},
                ...(selSol.estado!=="pendiente"?[{icon:"🔄",label:"En proceso — Encargado asignado",fecha:selSol.fecha,color:"#3B82F6"}]:[]),
                ...(selSol.estado==="aprobada"?[{icon:"✅",label:"Aprobada por director",fecha:selSol.fecha,color:"#10B981"}]:[]),
                ...(selSol.estado==="rechazada"?[{icon:"❌",label:"Rechazada — Ver motivo",fecha:selSol.fecha,color:"#EF4444"}]:[]),
              ].map((ev,i)=>(
                <div key={i} style={{position:"relative",marginBottom:10,paddingLeft:12}}>
                  <div style={{position:"absolute",left:-9,top:3,width:16,height:16,borderRadius:"50%",background:ev.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,border:"2px solid #fff"}}>{ev.icon}</div>
                  <div style={{fontSize:12,fontWeight:500,color:"#1B1F2E"}}>{ev.label}</div>
                  <div style={{fontSize:10.5,color:"#9CA3AF"}}>{ev.fecha}</div>
                </div>
              ))}
            </div>
          </div>
          {selSol.estado==="pendiente"&&(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <button className="btn btn-success" style={{width:"100%"}} onClick={()=>alert(`✅ Solicitud ${selSol.id} aprobada.`)}>✓ Aprobar Solicitud</button>
              <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>alert("📝 Solicitar más información enviado.")}>📝 Pedir más información</button>
              <button className="btn btn-danger" style={{width:"100%"}} onClick={()=>alert(`❌ Solicitud ${selSol.id} rechazada.`)}>✕ Rechazar</button>
            </div>
          )}
          {selSol.estado==="en-proceso"&&(
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>alert("✅ Solicitud marcada como completada.")}>✓ Marcar como completada</button>
          )}
        </div>
      )}
    </div>
  );
}
