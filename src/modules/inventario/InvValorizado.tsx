import React, { useState } from "react";
import type { Articulo, CategoriaInventario } from "../../types";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function InvValorizado({articulos,categorias}:{articulos:Articulo[];categorias:CategoriaInventario[]}) {
  const [metodo,setMetodo]=useState<"fifo"|"prom"|"lifo">("fifo");
  const activos=articulos.filter(a=>a.activo);
  const porCategoria=categorias.map(cat=>{
    const items=activos.filter(a=>a.categoriaId===cat.id);
    const valor=items.reduce((s,a)=>s+a.stock*a.costoUnitario,0);
    return {cat:cat.nombre,items:items.length,valor};
  }).filter(c=>c.items>0);
  const total=porCategoria.reduce((s,i)=>s+i.valor,0);
  const totalItems=activos.length;

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Inventario Valorizado</div><div className="page-subtitle">Valuación de stock · FIFO · Promedio Ponderado · LIFO · ISO 9001</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm">📥 Excel</button>
          <button className="btn btn-secondary btn-sm">📄 PDF</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["fifo","FIFO","Primero en entrar, primero en salir"],["prom","Promedio Ponderado","Costo promedio de todas las entradas"],["lifo","LIFO","Último en entrar, primero en salir"]].map(([id,label,desc])=>(
          <div key={id} onClick={()=>setMetodo(id as typeof metodo)}
            style={{padding:"10px 16px",borderRadius:9,border:`2px solid ${metodo===id?"#E8611A":"#E5E7EB"}`,background:metodo===id?"#FFF3ED":"#fff",cursor:"pointer",flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:metodo===id?"#E8611A":"#374151"}}>{label}</div>
            <div style={{fontSize:10.5,color:"#6B7280",marginTop:2}}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["Valor Total",fmt(total),"#E8611A"],["Ítems totales",String(totalItems),"#1B1F2E"],["Categorías",String(porCategoria.length),"#3B82F6"],["Método activo",metodo.toUpperCase(),"#10B981"]].map(([l,v,c])=>(
          <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string,fontSize:16}}>{v}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:12,padding:0,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="card-title" style={{marginBottom:0}}>Valor por Categoría — Método: {metodo.toUpperCase()}</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Categoría</th><th>Ítems</th><th>Valor Stock</th><th>% del Total</th><th>Valor Unit. Prom.</th></tr></thead>
          <tbody>
            {porCategoria.map(item=>{
              const factor=metodo==="fifo"?1:metodo==="lifo"?0.97:0.985;
              const valorM=Math.round(item.valor*factor);
              return (
                <tr key={item.cat}>
                  <td style={{fontWeight:600}}>{item.cat}</td>
                  <td>{item.items}</td>
                  <td style={{fontWeight:700,color:"#E8611A"}}>{fmt(valorM)}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div className="stock-bar" style={{width:60}}><div className="stock-bar-fill" style={{width:`${total?Math.round(valorM/total*100):0}%`,background:"#E8611A"}}/></div>
                      <span style={{fontSize:11,color:"#6B7280"}}>{total?Math.round(valorM/total*100):0}%</span>
                    </div>
                  </td>
                  <td style={{color:"#6B7280"}}>{fmt(item.items?valorM/item.items:0)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{background:"#F9FAFB"}}>
              <td style={{fontWeight:700}}>TOTAL</td>
              <td style={{fontWeight:700}}>{totalItems}</td>
              <td style={{fontWeight:700,color:"#E8611A",fontSize:14}}>{fmt(total)}</td>
              <td style={{fontWeight:700}}>100%</td>
              <td style={{color:"#6B7280"}}>{fmt(totalItems?total/totalItems:0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="card" style={{background:"#F9FAFB"}}>
        <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#1B1F2E"}}>Nota metodológica:</div>
          <div style={{fontSize:12,color:"#6B7280"}}>
            {metodo==="fifo"&&"FIFO: Los primeros artículos en ingresar son los primeros en salir. Refleja valores de reposición más actuales."}
            {metodo==="prom"&&"Promedio Ponderado: El costo unitario es el promedio de todas las entradas ponderado por cantidad. Suaviza variaciones de precio."}
            {metodo==="lifo"&&"LIFO: Los últimos artículos en ingresar son los primeros en salir. Puede mostrar menor valuación en períodos inflacionarios."}
          </div>
        </div>
      </div>
    </div>
  );
}
