import React, { useState } from "react";
import type { View, ProveedorInventario, OrdenCompra, ProveedorArticulo, Articulo } from "../../types";
import { calcularEvaluacion } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function ComparadorProveedores({setView,proveedores,ordenesCompra,proveedorArticulos,articulos}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];ordenesCompra:OrdenCompra[];proveedorArticulos:ProveedorArticulo[];articulos:Articulo[];
}) {
  const [seleccionados,setSeleccionados]=useState<string[]>([]);
  const toggle=(id:string)=>setSeleccionados(prev=>prev.includes(id)?prev.filter(x=>x!==id):prev.length<3?[...prev,id]:prev);

  const activos=proveedores.filter(p=>p.activo);
  const provsSel=proveedores.filter(p=>seleccionados.includes(p.id));

  const leadTimeProm=(id:string)=>{
    const entradas=proveedorArticulos.filter(pa=>pa.proveedorId===id);
    if(!entradas.length) return null;
    return Math.round(entradas.reduce((s,e)=>s+e.leadTimeDias,0)/entradas.length);
  };
  const nCatalogo=(id:string)=>articulos.filter(a=>a.activo&&a.proveedorId===id).length;

  const evals=provsSel.map(p=>({p,ev:calcularEvaluacion(p.id,ordenesCompra)}));
  const mejorId=evals.length?evals.reduce((a,b)=>b.ev.puntaje>a.ev.puntaje?b:a).p.id:null;

  const preciosPorArticulo=(articuloId:string)=>provsSel.map(p=>{
    const art=articulos.find(a=>a.id===articuloId);
    if(art&&art.proveedorId===p.id) return {proveedorId:p.id,costo:art.costoUnitario,principal:true};
    const alt=proveedorArticulos.find(pa=>pa.articuloId===articuloId&&pa.proveedorId===p.id);
    return alt?{proveedorId:p.id,costo:alt.costoUnitario,principal:false}:null;
  }).filter((x):x is {proveedorId:string;costo:number;principal:boolean}=>x!==null);

  const articulosComparables=provsSel.length>=2?articulos.filter(a=>a.activo&&preciosPorArticulo(a.id).length>=2).slice(0,20):[];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Comparador de Proveedores</div><div className="page-subtitle">Selecciona hasta 3 proveedores para comparar desempeño y precio</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-title">Selecciona proveedores ({seleccionados.length}/3)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {activos.map(p=>{
            const bloqueado=seleccionados.length>=3&&!seleccionados.includes(p.id);
            return (
            <label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:`1.5px solid ${seleccionados.includes(p.id)?"#E8611A":"#E5E7EB"}`,borderRadius:8,cursor:bloqueado?"not-allowed":"pointer",background:seleccionados.includes(p.id)?"#FFF3ED":"#fff",opacity:bloqueado?0.5:1}}>
              <input type="checkbox" checked={seleccionados.includes(p.id)} disabled={bloqueado} onChange={()=>toggle(p.id)}/>
              <span style={{fontSize:12}}>{p.nombre}</span>
            </label>
            );
          })}
        </div>
      </div>

      {provsSel.length<2&&<div className="card" style={{textAlign:"center",color:"#9CA3AF",padding:30}}>Selecciona al menos 2 proveedores para comparar</div>}

      {provsSel.length>=2&&<>
        <div className="card" style={{marginBottom:14,padding:0,overflow:"auto"}}>
          <table className="tbl">
            <thead><tr><th>Criterio</th>{provsSel.map(p=>(
              <th key={p.id}>{p.nombre}{p.id===mejorId&&<div style={{fontSize:9,color:"#10B981",fontWeight:700}}>🏆 Recomendado</div>}</th>
            ))}</tr></thead>
            <tbody>
              <tr><td>Evaluación</td>{evals.map(({p,ev})=><td key={p.id}><span className="badge badge-info">{ev.grado}</span> <b>{ev.puntaje}</b></td>)}</tr>
              <tr><td>Entrega a tiempo</td>{evals.map(({p,ev})=><td key={p.id}>{ev.entregaPct}%</td>)}</tr>
              <tr><td>Estabilidad de precio</td>{evals.map(({p,ev})=><td key={p.id}>{ev.estabilidadPrecio}%</td>)}</tr>
              <tr><td>Confiabilidad de suministro</td>{evals.map(({p,ev})=><td key={p.id}>{ev.confiabilidad}%</td>)}</tr>
              <tr><td>Artículos en catálogo</td>{provsSel.map(p=><td key={p.id}>{nCatalogo(p.id)}</td>)}</tr>
              <tr><td>Lead time promedio</td>{provsSel.map(p=>{const lt=leadTimeProm(p.id);return <td key={p.id}>{lt!==null?`${lt} días`:"—"}</td>;})}</tr>
              <tr><td>Condición de pago</td>{provsSel.map(p=><td key={p.id}>{p.condicion}</td>)}</tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div className="card-title" style={{padding:"10px 14px",marginBottom:0,borderBottom:"1px solid #E5E7EB"}}>Comparación de precio por artículo en común</div>
          <table className="tbl">
            <thead><tr><th>Artículo</th>{provsSel.map(p=><th key={p.id}>{p.nombre}</th>)}</tr></thead>
            <tbody>
              {articulosComparables.map(a=>{
                const precios=preciosPorArticulo(a.id);
                const minCosto=Math.min(...precios.map(x=>x.costo));
                return (
                  <tr key={a.id}>
                    <td style={{fontSize:12}}>{a.nombre}</td>
                    {provsSel.map(p=>{
                      const entry=precios.find(x=>x.proveedorId===p.id);
                      return (
                        <td key={p.id}>
                          {entry?
                            <span style={{fontWeight:entry.costo===minCosto?700:400,color:entry.costo===minCosto?"#10B981":undefined}}>
                              {fmt(entry.costo)}{entry.principal&&<span className="badge badge-gray" style={{fontSize:8,marginLeft:4}}>principal</span>}
                            </span>
                            :<span style={{color:"#D1D5DB"}}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {articulosComparables.length===0&&<tr><td colSpan={provsSel.length+1} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Estos proveedores no comparten artículos comparables en el catálogo</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  );
}
