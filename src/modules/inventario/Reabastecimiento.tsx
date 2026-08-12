import React, { useState } from "react";
import type { View, Articulo, ProveedorInventario, OrdenCompra, LineaOC } from "../../types";
import { estadoStock } from "../../data/inventario";
const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const hoy=(offsetDias=0)=>{const d=new Date();d.setDate(d.getDate()+offsetDias);return d.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});};

export function Reabastecimiento({setView,articulos,proveedores,ordenesCompra,setOrdenesCompra}:{setView:(v:View)=>void;articulos:Articulo[];proveedores:ProveedorInventario[];ordenesCompra:OrdenCompra[];setOrdenesCompra:React.Dispatch<React.SetStateAction<OrdenCompra[]>>}) {
  const items=articulos.filter(a=>a.activo&&(estadoStock(a.stock,a.min)==="bajo"||estadoStock(a.stock,a.min)==="critico"||estadoStock(a.stock,a.min)==="agotado"));
  const [sel,setSel]=useState<Set<string>>(new Set(items.map(i=>i.id)));
  const [sugeridos,setSugeridos]=useState<Record<string,number>>({});
  const toggle=(id:string)=>setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const sugeridoDe=(a:Articulo)=>sugeridos[a.id]??Math.max(a.max-a.stock,a.min);
  const total=items.filter(i=>sel.has(i.id)).reduce((s,i)=>s+sugeridoDe(i)*i.costoUnitario,0);
  const criticos=items.filter(a=>{const e=estadoStock(a.stock,a.min);return e==="critico"||e==="agotado";}).length;

  const generarOC=()=>{
    const seleccionados=items.filter(i=>sel.has(i.id));
    if(seleccionados.length===0) return;
    const grupos=new Map<string,Articulo[]>();
    seleccionados.forEach(a=>{
      const key=`${a.proveedorId}|${a.bodegaId}`;
      grupos.set(key,[...(grupos.get(key)||[]),a]);
    });
    const nuevasOCs:OrdenCompra[]=[];
    let contador=ordenesCompra.length;
    grupos.forEach((arts,key)=>{
      const [proveedorId,bodegaId]=key.split("|");
      contador++;
      const lineas:LineaOC[]=arts.map(a=>({articuloId:a.id,cantidad:sugeridoDe(a),costoUnitario:a.costoUnitario}));
      nuevasOCs.push({
        id:`OC-2024-${String(contador).padStart(3,"0")}`,
        proveedorId,bodegaId,fecha:hoy(),fechaEntregaEsperada:hoy(7),
        estado:"Enviada",lineas,observaciones:"Generada automáticamente desde Reabastecimiento",creadoPor:"Ronald",
      });
    });
    setOrdenesCompra(prev=>[...nuevasOCs,...prev]);
    alert(`✅ ${nuevasOCs.length} Orden(es) de Compra generada(s) y enviada(s).\n\n${nuevasOCs.map(o=>o.id).join(", ")}\nTotal: ${fmt(total)}`);
    setView("ordenes-compra");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Reabastecimiento</div><div className="page-subtitle">Órdenes de compra sugeridas · {items.length} artículos bajo mínimo · Automático por reglas</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Por reordenar",String(items.length),"#F59E0B"],["Críticos",String(criticos),"#EF4444"],["Proveedores involucrados",String(new Set(items.map(i=>i.proveedorId)).size),"#3B82F6"],["Valor estimado",fmt(total),"#E8611A"]].map(([l,v,c])=>(
          <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string,fontSize:16}}>{v}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div className="card-title" style={{marginBottom:0}}>Artículos Sugeridos para Reabastecimiento</div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSel(new Set())}>Deseleccionar todo</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSel(new Set(items.map(i=>i.id)))}>Seleccionar todo</button>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th><input type="checkbox" checked={sel.size===items.length&&items.length>0} onChange={()=>sel.size===items.length?setSel(new Set()):setSel(new Set(items.map(i=>i.id)))}/></th><th>Urgencia</th><th>Código</th><th>Artículo</th><th>Stock Actual</th><th>Mínimo</th><th>Qty Sugerida</th><th>Proveedor</th><th>Costo Unit.</th><th>Total OC</th></tr></thead>
          <tbody>
            {items.map(item=>{
              const est=estadoStock(item.stock,item.min);
              const urgente=est==="critico"||est==="agotado";
              const prov=proveedores.find(p=>p.id===item.proveedorId);
              const sug=sugeridoDe(item);
              return (
                <tr key={item.id} style={{background:sel.has(item.id)?"#FFFBF5":""}}>
                  <td><input type="checkbox" checked={sel.has(item.id)} onChange={()=>toggle(item.id)}/></td>
                  <td><span className={`badge ${urgente?"badge-crit":"badge-warn"}`}>{urgente?"🔴 Alta":"🟡 Media"}</span></td>
                  <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.id}</b></td>
                  <td style={{fontSize:12.5}}>{item.nombre}</td>
                  <td><span style={{color:"#EF4444",fontWeight:600}}>{item.stock} {item.unidad}</span></td>
                  <td style={{color:"#6B7280"}}>{item.min}</td>
                  <td><input type="number" className="form-control" value={sug} min={1} style={{width:70}} onChange={e=>setSugeridos(p=>({...p,[item.id]:Math.max(1,parseInt(e.target.value)||1)}))}/></td>
                  <td style={{fontSize:12}}>{prov?.nombre||"—"}</td>
                  <td>{fmt(item.costoUnitario)}</td>
                  <td style={{fontWeight:700,color:"#E8611A"}}>{fmt(sug*item.costoUnitario)}</td>
                </tr>
              );
            })}
            {items.length===0&&<tr><td colSpan={10} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Ningún artículo está bajo mínimo actualmente 🎉</td></tr>}
          </tbody>
          <tfoot>
            <tr style={{background:"#F9FAFB"}}>
              <td colSpan={9} style={{textAlign:"right",fontWeight:700,fontSize:12,paddingRight:8}}>Total Orden de Compra ({sel.size} artículos):</td>
              <td style={{fontWeight:700,color:"#E8611A",fontSize:13}}>{fmt(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <button className="btn btn-secondary">📥 Exportar lista</button>
        <button className="btn btn-ghost" onClick={()=>setView("inventario")}>Cancelar</button>
        <button className="btn btn-primary" disabled={sel.size===0} onClick={generarOC}>📋 Generar Orden de Compra</button>
      </div>
    </div>
  );
}
