import React, { useState } from "react";
import type { View } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function TrasladoBodegas({setView}:{setView:(v:View)=>void}) {
  const [origen,setOrigen]=useState("Bodega Central");
  const [destino,setDestino]=useState("Bodega 2");
  const [items,setItems]=useState([{cod:"INV-HR-00158",name:"Taladro DeWalt 20V",qty:1,disp:14}]);

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Traslado entre Bodegas</div><div className="page-subtitle">Movimiento de stock con trazabilidad completa · Multi-bodega · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Origen y Destino</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Bodega Origen</div>
                <select className="form-control" value={origen} onChange={e=>setOrigen(e.target.value)}>
                  {CATALOGOS_INIT.bodegas.map(b=><option key={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div style={{textAlign:"center",fontSize:24,color:"#E8611A"}}>→</div>
              <div>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Bodega Destino</div>
                <select className="form-control" value={destino} onChange={e=>setDestino(e.target.value)}>
                  {CATALOGOS_INIT.bodegas.filter(b=>b.nombre!==origen).map(b=><option key={b.id}>{b.nombre}</option>)}
                </select>
              </div>
            </div>
            {origen===destino&&<div className="alert-warn" style={{fontSize:12}}>⚠ El origen y destino no pueden ser iguales.</div>}
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos a Trasladar</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div className="header-search" style={{flex:1}}><span>🔍</span><input placeholder="Buscar artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              <button className="btn btn-primary btn-sm" onClick={()=>setItems(p=>[...p,{cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",qty:10,disp:200}])}>➕ Agregar</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Stock en {origen}</th><th>Cantidad</th><th></th></tr></thead>
              <tbody>
                {items.map((item,i)=>(
                  <tr key={i}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.cod}</b></td>
                    <td style={{fontSize:12.5}}>{item.name}</td>
                    <td><span style={{color:"#10B981",fontWeight:600}}>{item.disp} Pzas.</span></td>
                    <td><input type="number" className="form-control" defaultValue={item.qty} min={1} max={item.disp} style={{width:60}}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-title">Datos del Traslado</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Responsable del Traslado</label><select className="form-control">{CATALOGOS_INIT.responsablesAutorizados.map(r=><option key={r.id}>{r.nombre}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Fecha programada</label><input type="date" className="form-control"/></div>
            </div>
            <div className="form-group"><label className="form-label">Motivo</label><textarea className="form-control" rows={2} placeholder="Motivo del traslado..."/></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"linear-gradient(135deg,#1B1F2E,#2D3348)",border:"none"}}>
            <div style={{color:"rgba(255,255,255,.6)",fontSize:11,marginBottom:8}}>Visualización de traslado</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,padding:"10px 12px",background:"rgba(255,255,255,.08)",borderRadius:8,border:"1px solid rgba(255,255,255,.12)"}}>
                <div style={{fontSize:18}}>🏭</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>{origen}</div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>↓ {items.reduce((s,i)=>s+i.qty,0)} Pzas.</div>
              </div>
              <div style={{fontSize:20,color:"#E8611A",flexShrink:0}}>➡</div>
              <div style={{flex:1,padding:"10px 12px",background:"rgba(232,97,26,.15)",borderRadius:8,border:"1px solid rgba(232,97,26,.3)"}}>
                <div style={{fontSize:18}}>🏭</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>{destino}</div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>↑ {items.reduce((s,i)=>s+i.qty,0)} Pzas.</div>
              </div>
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>TRA-2024-018</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length}</span></div>
            <div className="res-row"><span className="res-label">Total Pzas.</span><span className="res-val">{items.reduce((s,i)=>s+i.qty,0)}</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={origen===destino} onClick={()=>alert(`✅ Traslado TRA-2024-018 registrado.\n\nDe: ${origen}\nHacia: ${destino}\n${items.length} artículos · ${items.reduce((s,i)=>s+i.qty,0)} Pzas.`)}>🏭 Confirmar Traslado</button>
          </div>
        </div>
      </div>
    </div>
  );
}
