import React, { useState } from "react";
import type { View } from "../../types";

export function AjusteInventario({setView}:{setView:(v:View)=>void}) {
  const [tipoAjuste,setTipoAjuste]=useState("incremento");
  const ajustesTipo=[
    {id:"incremento",icon:"↑",label:"Incremento",color:"#10B981",bg:"#ECFDF5",border:"#6EE7B7"},
    {id:"decremento",icon:"↓",label:"Decremento",color:"#EF4444",bg:"#FEF2F2",border:"#FCA5A5"},
    {id:"correccion",icon:"⚖️",label:"Corrección General",color:"#3B82F6",bg:"#EFF6FF",border:"#BFDBFE"},
  ];
  const motivosAjuste=["Resultado de conteo físico","Daño o merma descubierta","Error de registro previo","Devolución interna","Ajuste de auditoría","Otro"];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Ajuste de Inventario</div><div className="page-subtitle">Correcciones aprobadas · Doble autorización · ISO 9001 §8.5</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Tipo de Ajuste</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {ajustesTipo.map(t=>(
                <div key={t.id} onClick={()=>setTipoAjuste(t.id)}
                  style={{flex:1,padding:"12px 8px",borderRadius:9,border:`2px solid ${tipoAjuste===t.id?t.color:t.border}`,background:tipoAjuste===t.id?t.bg:"#fff",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:20,color:t.color}}>{t.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:tipoAjuste===t.id?t.color:"#374151",marginTop:4}}>{t.label}</div>
                </div>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Artículo</label>
              <div className="header-search"><span>🔍</span><input placeholder="Buscar por código o nombre..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            </div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Stock Actual (sistema)</label><input className="form-control" defaultValue="14" readOnly style={{background:"#F9FAFB"}}/></div>
              <div className="form-group"><label className="form-label">{tipoAjuste==="correccion"?"Stock Real (físico)":"Cantidad a Ajustar"}</label><input type="number" className="form-control" defaultValue={tipoAjuste==="correccion"?"14":"0"} min="0"/></div>
            </div>
            {tipoAjuste==="correccion"&&<div className="card" style={{background:"#EFF6FF",border:"1px solid #BFDBFE",marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#6B7280"}}>Diferencia calculada:</span>
                <span style={{fontWeight:700,color:"#1D4ED8"}}>0 Pzas. (sin cambio)</span>
              </div>
            </div>}
          </div>
          <div className="card">
            <div className="card-title">Documentación del Ajuste</div>
            <div className="form-group"><label className="form-label">Motivo del Ajuste</label>
              <select className="form-control">{motivosAjuste.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Descripción / Justificación</label><textarea className="form-control" rows={3} placeholder="Detalla el motivo del ajuste para el registro ISO 9001..."/></div>
            <div className="form-group"><label className="form-label">Evidencia / Adjunto</label><div className="photo-box" style={{padding:12}}><span>📎</span><span style={{fontSize:11,color:"#6B7280",marginLeft:8}}>Foto conteo, acta de auditoría...</span></div></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#92400E",marginBottom:6}}>⚠ Ajuste requiere doble autorización</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[["🔵","Supervisor de Inventario","Jules Ramirez","Revisión"],["✅","Director de Operaciones","Ronald","Aprobación final"]].map(([ic,rol,nom,est])=>(
                <div key={rol} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#fff",borderRadius:7,border:"1px solid #FDE68A"}}>
                  <span style={{fontSize:16}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{nom}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{rol}</div></div>
                  <span style={{fontSize:11,color:"#92400E"}}>{est}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen del Ajuste</div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val" style={{color:ajustesTipo.find(t=>t.id===tipoAjuste)?.color}}>{ajustesTipo.find(t=>t.id===tipoAjuste)?.label}</span></div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>AJU-2024-007</span></div>
            <div className="res-row"><span className="res-label">Fecha</span><span className="res-val">{new Date().toLocaleDateString("es-CR")}</span></div>
            <div className="res-row"><span className="res-label">ISO 9001</span><span className="badge badge-ok">§8.5 Cumple</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>alert("✅ Ajuste AJU-2024-007 enviado a aprobación.\n\nEl supervisor de inventario fue notificado.")}>⚖️ Enviar a Aprobación</button>
          </div>
        </div>
      </div>
    </div>
  );
}
