import React, { useState } from "react";

export function InvValorizado() {
  const [metodo,setMetodo]=useState<"fifo"|"prom"|"lifo">("fifo");
  const items=[
    {cat:"Herramientas",items:48,valor:324500,variacion:2.3},
    {cat:"Consumibles",items:62,valor:187200,variacion:-1.1},
    {cat:"Activos Fijos",items:12,valor:215000,variacion:0},
    {cat:"Insumos / EPP",items:40,valor:115300,variacion:3.7},
  ];
  const total=items.reduce((s,i)=>s+i.valor,0);

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
        {[["Valor Total",`$${(total/1000).toFixed(0)}K`,"#E8611A"],["Ítems totales","162","#1B1F2E"],["Categorías","4","#3B82F6"],["Variación mes","+1.8%","#10B981"]].map(([l,v,c])=>(
          <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string}}>{v}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:12,padding:0,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="card-title" style={{marginBottom:0}}>Valor por Categoría — Método: {metodo.toUpperCase()}</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Categoría</th><th>Ítems</th><th>Valor Stock</th><th>% del Total</th><th>Variación Mes</th><th>Valor Unit. Prom.</th></tr></thead>
          <tbody>
            {items.map(item=>{
              const factor=metodo==="fifo"?1:metodo==="lifo"?0.97:0.985;
              const valorM=Math.round(item.valor*factor);
              return (
                <tr key={item.cat}>
                  <td style={{fontWeight:600}}>{item.cat}</td>
                  <td>{item.items}</td>
                  <td style={{fontWeight:700,color:"#E8611A"}}>${valorM.toLocaleString()}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:60,height:5,background:"#E5E7EB",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${Math.round(valorM/total*100)}%`,background:"#E8611A",height:"100%",borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:11,color:"#6B7280"}}>{Math.round(valorM/total*100)}%</span>
                    </div>
                  </td>
                  <td><span style={{color:item.variacion>0?"#10B981":item.variacion<0?"#EF4444":"#6B7280",fontWeight:600}}>{item.variacion>0?"+":""}{item.variacion}%</span></td>
                  <td style={{color:"#6B7280"}}>${Math.round(valorM/item.items).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{background:"#F9FAFB"}}>
              <td style={{fontWeight:700}}>TOTAL</td>
              <td style={{fontWeight:700}}>162</td>
              <td style={{fontWeight:700,color:"#E8611A",fontSize:14}}>${total.toLocaleString()}</td>
              <td style={{fontWeight:700}}>100%</td>
              <td style={{fontWeight:700,color:"#10B981"}}>+1.8%</td>
              <td style={{color:"#6B7280"}}>${Math.round(total/162).toLocaleString()}</td>
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
