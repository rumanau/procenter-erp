import React, { useState } from "react";
import type { View } from "../../types";
import { EXISTENCIAS } from "../../data/catalogos";

export function ConsultaExistencias({setView}:{setView:(v:View)=>void}) {
  const [filter,setFilter]=useState("");
  const [det,setDet]=useState<typeof EXISTENCIAS[0]|null>(null);
  const [detTab,setDetTab]=useState("info");
  const data=filter?EXISTENCIAS.filter(e=>e.estado===filter):EXISTENCIAS;
  const sc=(e:string)=>e==="ok"?"#10B981":e==="bajo"?"#F59E0B":"#EF4444";

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="content">
          <div className="page-header">
            <div><div className="page-title">Consulta de Existencias</div><div className="page-subtitle">Stock en tiempo real · Semáforo de niveles · ISO 9001</div></div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-secondary btn-sm">📥 Excel</button>
              <button className="btn btn-secondary btn-sm">📄 PDF</button>
              <button className="btn btn-primary btn-sm" onClick={()=>setView("nuevo")}>➕ Nuevo Artículo</button>
            </div>
          </div>
          <div className="g4" style={{marginBottom:14}}>
            <div className="kpi"><div className="kpi-label">Total Ítems</div><div className="kpi-value">162</div><div className="kpi-pill kpi-up">▲ +8</div></div>
            <div className="kpi"><div className="kpi-label">Valor Total</div><div className="kpi-value" style={{fontSize:18,color:"#E8611A"}}>$842K</div><div className="kpi-pill kpi-info">MXN</div></div>
            <div className="kpi"><div className="kpi-label">🟡 Bajo mínimo</div><div className="kpi-value" style={{color:"#F59E0B"}}>24</div><div className="kpi-pill kpi-warn">Reorden</div></div>
            <div className="kpi"><div className="kpi-label">🔴 Críticos</div><div className="kpi-value" style={{color:"#EF4444"}}>8</div><div className="kpi-pill kpi-down">Urgente</div></div>
          </div>
          <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div className="header-search" style={{flex:1,minWidth:180}}><span>🔍</span><input placeholder="Buscar artículo, código..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              <select className="form-control" style={{width:160}}><option>Todas las bodegas</option><option>Bodega Central</option><option>Bodega 2</option><option>Bodega 3</option></select>
              <select className="form-control" style={{width:150}}><option>Todas las categorías</option><option>Herramientas</option><option>Consumibles</option><option>Insumos</option></select>
              <select className="form-control" style={{width:140}} onChange={e=>setFilter(e.target.value)}>
                <option value="">Todos</option><option value="ok">🟢 OK</option><option value="bajo">🟡 Bajo</option><option value="critico">🔴 Crítico</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {[["badge-ok","🟢 OK (130)","ok"],["badge-warn","🟡 Bajo (24)","bajo"],["badge-crit","🔴 Crítico (8)","critico"],["badge-gray","⚫ Agotado (0)",""]].map(([cl,tx,v])=>(
                <span key={tx} className={`badge ${cl}`} style={{cursor:"pointer"}} onClick={()=>setFilter(filter===v?"":v)}>{tx}</span>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Est.</th><th>Código</th><th>Artículo</th><th>Cat.</th><th>Bodega</th><th>Stock</th><th>Mín</th><th>Máx</th><th>Costo</th><th>Valor Total</th><th></th></tr></thead>
              <tbody>
                {data.map(item=>(
                  <tr key={item.cod} onClick={()=>setDet(item)}>
                    <td><div style={{width:10,height:10,borderRadius:"50%",background:sc(item.estado),display:"inline-block"}}/></td>
                    <td><b style={{fontSize:12}}>{item.cod}</b></td>
                    <td style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</td>
                    <td><span className="badge badge-info" style={{fontSize:10}}>{item.cat}</span></td>
                    <td style={{fontSize:11.5}}>{item.bodega}</td>
                    <td>
                      <b style={{color:sc(item.estado)}}>{item.stock}</b>
                      <div style={{width:50,height:5,borderRadius:3,background:"#E5E7EB",marginTop:2,overflow:"hidden"}}>
                        <div style={{width:`${Math.round(item.stock/item.max*100)}%`,background:sc(item.estado),height:"100%",borderRadius:3}}/>
                      </div>
                    </td>
                    <td style={{color:"#6B7280"}}>{item.min}</td>
                    <td style={{color:"#6B7280"}}>{item.max}</td>
                    <td>${item.costo.toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
                    <td style={{fontWeight:600,color:"#E8611A"}}>${(item.stock*item.costo).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
                    <td><button className="btn btn-ghost btn-sm">👁</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB"}}>
              <span>Mostrando 1–{data.length} de 162 artículos</span>
              <div style={{display:"flex",gap:4}}>{["‹","1","2","3","›"].map((p,i)=><button key={i} className={`btn btn-sm ${p==="1"?"btn-primary":"btn-ghost"}`}>{p}</button>)}</div>
            </div>
          </div>
        </div>
      </div>

      {det&&(
        <div style={{width:285,background:"#fff",borderLeft:"1px solid #E5E7EB",padding:16,overflow:"auto",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>Detalle</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setDet(null)}>✕</button>
          </div>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:36}}>🔧</div>
            <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{det.name}</div>
            <div style={{fontSize:11,color:"#6B7280"}}>{det.cod}</div>
          </div>
          <div className="tab-bar">
            {["info","mov","prov"].map(t=><div key={t} className={`tab-btn ${detTab===t?"active":""}`} onClick={()=>setDetTab(t)}>{t==="info"?"Info":t==="mov"?"Movimientos":"Proveedor"}</div>)}
          </div>
          {detTab==="info"&&<div>
            <div className="resumen" style={{marginBottom:10}}>
              <div className="res-row"><span className="res-label">Stock actual</span><span className="res-val" style={{color:sc(det.estado)}}>{det.stock} Pzas.</span></div>
              <div className="res-row"><span className="res-label">Mínimo</span><span className="res-val">{det.min}</span></div>
              <div className="res-row"><span className="res-label">Máximo</span><span className="res-val">{det.max}</span></div>
              <div className="res-row"><span className="res-label">Costo unit.</span><span className="res-val">${det.costo.toLocaleString()}</span></div>
              <div className="res-row"><span className="res-label">Valor total</span><span className="res-val" style={{color:"#E8611A"}}>${(det.stock*det.costo).toLocaleString()}</span></div>
            </div>
            <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Nivel de stock</div>
            <div style={{background:"#E5E7EB",borderRadius:3,height:8,overflow:"hidden"}}><div style={{width:`${Math.round(det.stock/det.max*100)}%`,background:sc(det.estado),height:"100%",borderRadius:3}}/></div>
          </div>}
          {detTab==="mov"&&<div>{[["badge-ent","ENT","+20 pzas TechnoSupply","24 Abr"],["badge-sal","SAL","-2 pzas Producción","26 Abr"],["badge-info","TRA","→ Bodega 3 · 5 pzas","24 Abr"]].map(([cl,t,d,f])=>(
            <div key={t} className="mini-reg"><span className={`badge ${cl}`} style={{fontSize:9}}>{t}</span><div style={{flex:1,fontSize:11}}>{d}</div><div style={{fontSize:10,color:"#6B7280"}}>{f}</div></div>
          ))}</div>}
          {detTab==="prov"&&<div className="resumen">
            {[["Proveedor","TechnoSupply"],["Ref.","DCD777C2"],["Cond.","30 días"],["Último precio","$3,150.00"]].map(([l,v])=>(
              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
            ))}
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:14}}>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("ingreso")} style={{width:"100%"}}>📥 Registrar Ingreso</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("salida")} style={{width:"100%"}}>📤 Registrar Salida</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setView("trazabilidad")} style={{width:"100%"}}>🔍 Trazabilidad</button>
          </div>
        </div>
      )}
    </div>
  );
}
