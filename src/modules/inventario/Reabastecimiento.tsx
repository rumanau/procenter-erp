import React, { useState } from "react";
import type { View } from "../../types";

export function Reabastecimiento({setView}:{setView:(v:View)=>void}) {
  const items=[
    {cod:"INV-HR-00158",name:"Taladro DeWalt 20V",stock:2,min:5,sugerido:15,proveedor:"TechnoSupply",costo:3150,urgencia:"alta"},
    {cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",stock:12,min:50,sugerido:200,proveedor:"SafetyPro",costo:28,urgencia:"alta"},
    {cod:"INV-EQO-00041",name:"Multímetro Digital",stock:1,min:3,sugerido:5,proveedor:"TechnoSupply",costo:890,urgencia:"media"},
    {cod:"INV-HER-00203",name:"Llave Ajustable 12\"",stock:4,min:8,sugerido:20,proveedor:"ToolMaster",costo:145,urgencia:"media"},
  ];
  const [sel,setSel]=useState<Set<string>>(new Set(items.map(i=>i.cod)));
  const toggle=(cod:string)=>setSel(p=>{const n=new Set(p);n.has(cod)?n.delete(cod):n.add(cod);return n;});
  const total=items.filter(i=>sel.has(i.cod)).reduce((s,i)=>s+i.sugerido*i.costo,0);

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Reabastecimiento</div><div className="page-subtitle">Órdenes de compra sugeridas · 24 artículos bajo mínimo · Automático por reglas</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Por reordenar","24","#F59E0B"],["Críticos","8","#EF4444"],["OC pendientes","3","#3B82F6"],["Valor estimado",`$${(total/1000).toFixed(0)}K`,"#E8611A"]].map(([l,v,c])=>(
          <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string}}>{v}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div className="card-title" style={{marginBottom:0}}>Artículos Sugeridos para Reabastecimiento</div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSel(new Set())}>Deseleccionar todo</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSel(new Set(items.map(i=>i.cod)))}>Seleccionar todo</button>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th><input type="checkbox" checked={sel.size===items.length} onChange={()=>sel.size===items.length?setSel(new Set()):setSel(new Set(items.map(i=>i.cod)))}/></th><th>Urgencia</th><th>Código</th><th>Artículo</th><th>Stock Actual</th><th>Mínimo</th><th>Qty Sugerida</th><th>Proveedor</th><th>Costo Unit.</th><th>Total OC</th></tr></thead>
          <tbody>
            {items.map(item=>(
              <tr key={item.cod} style={{background:sel.has(item.cod)?"#FFFBF5":""}}>
                <td><input type="checkbox" checked={sel.has(item.cod)} onChange={()=>toggle(item.cod)}/></td>
                <td><span className={`badge ${item.urgencia==="alta"?"badge-crit":"badge-warn"}`}>{item.urgencia==="alta"?"🔴 Alta":"🟡 Media"}</span></td>
                <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.cod}</b></td>
                <td style={{fontSize:12.5}}>{item.name}</td>
                <td><span style={{color:"#EF4444",fontWeight:600}}>{item.stock} Pzas.</span></td>
                <td style={{color:"#6B7280"}}>{item.min}</td>
                <td><input type="number" className="form-control" defaultValue={item.sugerido} style={{width:60}}/></td>
                <td style={{fontSize:12}}>{item.proveedor}</td>
                <td>${item.costo.toLocaleString()}</td>
                <td style={{fontWeight:700,color:"#E8611A"}}>${(item.sugerido*item.costo).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"#F9FAFB"}}>
              <td colSpan={9} style={{textAlign:"right",fontWeight:700,fontSize:12,paddingRight:8}}>Total Orden de Compra ({sel.size} artículos):</td>
              <td style={{fontWeight:700,color:"#E8611A",fontSize:13}}>${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn btn-secondary">📥 Exportar lista</button>
        <button className="btn btn-ghost" onClick={()=>setView("inventario")}>Cancelar</button>
        <button className="btn btn-primary" disabled={sel.size===0} onClick={()=>alert(`✅ Orden de Compra OC-2024-031 generada.\n${sel.size} artículos · Total: $${total.toLocaleString()}\n\nEnviada a aprobación del director.`)}>📋 Generar Orden de Compra</button>
      </div>
    </div>
  );
}
