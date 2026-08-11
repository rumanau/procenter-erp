import React, { useState } from "react";
import type { View } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function RegistrarSalida({setView}:{setView:(v:View)=>void}) {
  const [tipo,setTipo]=useState("consumo");
  const [items,setItems]=useState([{cod:"INV-HR-00158",name:"Taladro DeWalt 20V",qty:1,disp:14}]);
  const tiposSalida=[
    {id:"consumo",icon:"⚙️",label:"Consumo Operativo",bg:"#EFF6FF",border:"#BFDBFE",colorText:"#1D4ED8"},
    {id:"despacho",icon:"🚚",label:"Despacho",bg:"#ECFDF5",border:"#6EE7B7",colorText:"#065F46"},
    {id:"prestamo",icon:"🔄",label:"Préstamo",bg:"#FFF3ED",border:"#FED7AA",colorText:"#92400E"},
    {id:"baja",icon:"🗑️",label:"Baja / Descarte",bg:"#FEF2F2",border:"#FCA5A5",colorText:"#991B1B"},
    {id:"muestra",icon:"🔬",label:"Muestra",bg:"#F5F3FF",border:"#C4B5FD",colorText:"#5B21B6"},
    {id:"merma",icon:"⚠️",label:"Merma",bg:"#FFFBEB",border:"#FDE68A",colorText:"#92400E"},
  ];
  const tipoActual=tiposSalida.find(t=>t.id===tipo)!;

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Registrar Salida</div><div className="page-subtitle">Despacho de artículos · Trazabilidad por tipo · ISO 9001 §8.5</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Tipo de Salida</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {tiposSalida.map(t=>(
            <div key={t.id} onClick={()=>setTipo(t.id)}
              style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${tipo===t.id?t.colorText:t.border}`,background:tipo===t.id?t.bg:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
              <span>{t.icon}</span>
              <span style={{fontSize:12.5,fontWeight:tipo===t.id?700:500,color:tipo===t.id?t.colorText:"#374151"}}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos a Despachar</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div className="header-search" style={{flex:1}}><span>🔍</span><input placeholder="Buscar artículo o código..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              <button className="btn btn-primary btn-sm" onClick={()=>setItems(prev=>[...prev,{cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",qty:10,disp:200}])}>➕ Agregar</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Disponible</th><th>Cantidad</th><th>Lote</th><th></th></tr></thead>
              <tbody>
                {items.map((item,i)=>(
                  <tr key={i}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.cod}</b></td>
                    <td style={{fontSize:12.5}}>{item.name}</td>
                    <td><span style={{color:item.disp>10?"#10B981":"#EF4444",fontWeight:600}}>{item.disp} Pzas.</span></td>
                    <td><input type="number" className="form-control" defaultValue={item.qty} min={1} max={item.disp} style={{width:60}}/></td>
                    <td><input className="form-control" placeholder="Lote..." style={{width:80}}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>setItems(prev=>prev.filter((_,j)=>j!==i))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tipo==="prestamo"&&<div className="card" style={{marginBottom:12}}>
            <div className="card-title">Datos del Préstamo</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Fecha Devolución</label><input type="date" className="form-control"/></div>
              <div className="form-group"><label className="form-label">Empleado Responsable</label>
                <select className="form-control">
                  {CATALOGOS_INIT.responsablesAutorizados.map(r=><option key={r.id}>{r.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>}
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Información General</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Solicitante</label>
                <select className="form-control">
                  {CATALOGOS_INIT.responsablesAutorizados.map(r=><option key={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Departamento / Proyecto</label><select className="form-control"><option>Mantenimiento</option><option>Producción</option><option>Administración</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Bodega de Salida</label><select className="form-control">{CATALOGOS_INIT.bodegas.map(b=><option key={b.id}>{b.nombre}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Motivo / Descripción</label><textarea className="form-control" rows={3} placeholder="Describe el motivo de la salida..."/></div>
            <div className="form-group"><label className="form-label">Adjuntos (Orden de trabajo, Vale, etc.)</label><div className="photo-box" style={{padding:12}}><span>📎</span><span style={{fontSize:11,color:"#6B7280",marginLeft:8}}>Adjuntar documentos</span></div></div>
          </div>
        </div>
        <div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen de Salida</div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val" style={{color:tipoActual.colorText}}>{tipoActual.icon} {tipoActual.label}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length} ítems</span></div>
            <div className="res-row"><span className="res-label">Número Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>SAL-2024-{String(Math.floor(Math.random()*900)+100)}</span></div>
            <div className="res-row"><span className="res-label">Bodega</span><span className="res-val">Bodega Central</span></div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Artículos en salida</div>
            {items.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
                <div style={{flex:1}}><b>{item.cod}</b><div style={{fontSize:10.5,color:"#6B7280"}}>{item.name}</div></div>
                <span className="badge badge-warn">{item.qty} Pzas.</span>
              </div>
            ))}
          </div>
          <div className="card" style={{marginBottom:12,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#92400E",marginBottom:6}}>⚠ Verificación requerida</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {["Artículo físicamente disponible","Solicitante autorizado","Documentación adjunta","Cantidad dentro del límite aprobado"].map(c=>(
                <label key={c} style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5}}><input type="checkbox"/>{c}</label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>alert(`✅ Salida registrada exitosamente!\n\nFolio: SAL-2024-042\nTipo: ${tipoActual.label}\nArtículos: ${items.length} ítems despachos`)}>📤 Confirmar Salida</button>
          </div>
        </div>
      </div>
    </div>
  );
}
