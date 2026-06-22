import React, { useState } from "react";
import type { View } from "../../types";

export function ConteoAuditoria({setView}:{setView:(v:View)=>void}) {
  const [fase,setFase]=useState<"config"|"conteo"|"revision">("config");
  const items=[
    {cod:"INV-HR-00158",name:"Taladro DeWalt 20V",sistema:14,fisico:null},
    {cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",sistema:200,fisico:null},
    {cod:"INV-HER-00203",name:"Llave Ajustable 12\"",sistema:8,fisico:null},
    {cod:"INV-EQO-00041",name:"Multímetro Digital",sistema:3,fisico:null},
  ];
  const [conteos,setConteos]=useState<Record<string,string>>({});

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Conteo / Auditoría de Inventario</div><div className="page-subtitle">Conteo físico · Comparación vs sistema · ISO 9001 §9.1 · Último: 30 Abr 2024</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="tab-bar" style={{marginBottom:14}}>
        {[["config","⚙️ Configurar Conteo"],["conteo","📋 Conteo Físico"],["revision","📊 Revisión y Cierre"]].map(([id,label])=>(
          <div key={id} className={`tab-btn ${fase===id?"active":""}`} onClick={()=>setFase(id as typeof fase)}>{label}</div>
        ))}
      </div>
      {fase==="config"&&<div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Configurar Conteo</div>
          <div className="form-group"><label className="form-label">Tipo de Conteo</label>
            <div style={{display:"flex",gap:8}}>
              {[["completo","Inventario Completo"],["ciclico","Cíclico"],["aleatorio","Muestreo Aleatorio"]].map(([id,label])=>(
                <label key={id} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",border:"1.5px solid #E5E7EB",borderRadius:7,cursor:"pointer",fontSize:12.5}}>
                  <input type="radio" name="tipo-conteo" defaultChecked={id==="completo"}/>{label}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Bodega</label><select className="form-control"><option>Bodega Central</option><option>Bodega 2</option><option>Bodega 3</option></select></div>
          <div className="form-group"><label className="form-label">Categorías incluidas</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["Herramientas","Consumibles","Activos Fijos","Insumos"].map(cat=>(
                <label key={cat} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",border:"1px solid #E5E7EB",borderRadius:6,fontSize:11.5,cursor:"pointer"}}>
                  <input type="checkbox" defaultChecked/>{cat}
                </label>
              ))}
            </div>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Responsable</label><select className="form-control"><option>Jules Ramirez</option><option>María Rojas</option></select></div>
            <div className="form-group"><label className="form-label">Fecha programada</label><input type="date" className="form-control"/></div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:8}} onClick={()=>setFase("conteo")}>→ Iniciar Conteo Físico</button>
        </div>
        <div className="resumen">
          <div className="panel-title" style={{marginBottom:8}}>Últimos Conteos</div>
          {[["CON-2024-04","30 Abr 2024","Completo","badge-ok","Cerrado"],["CON-2024-03","28 Mar 2024","Cíclico","badge-ok","Cerrado"],["CON-2024-02","15 Feb 2024","Muestreo","badge-warn","Con diferencias"]].map(([id,fecha,tipo,cl,est])=>(
            <div key={id} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><b style={{fontFamily:"monospace",color:"#E8611A"}}>{id}</b><span className={`badge ${cl}`}>{est}</span></div>
              <div style={{fontSize:10.5,color:"#6B7280"}}>{fecha} · {tipo}</div>
            </div>
          ))}
        </div>
      </div>}
      {fase==="conteo"&&<div>
        <div className="card" style={{marginBottom:12,background:"#EFF6FF",border:"1px solid #BFDBFE"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>📋</span>
            <div><div style={{fontSize:13,fontWeight:700,color:"#1D4ED8"}}>Conteo en Proceso — Bodega Central</div><div style={{fontSize:11,color:"#3B82F6"}}>Ingresa la cantidad física real de cada artículo</div></div>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Código</th><th>Artículo</th><th>Stock Sistema</th><th>Conteo Físico</th><th>Diferencia</th><th>Estado</th></tr></thead>
            <tbody>
              {items.map(item=>{
                const val=conteos[item.cod];
                const fisico=val!==undefined?parseInt(val):null;
                const diff=fisico!==null?fisico-item.sistema:null;
                return (
                  <tr key={item.cod}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.cod}</b></td>
                    <td style={{fontSize:12.5}}>{item.name}</td>
                    <td><b style={{color:"#3B82F6"}}>{item.sistema}</b></td>
                    <td><input type="number" className="form-control" style={{width:80}} placeholder="—" value={val||""} onChange={e=>setConteos(p=>({...p,[item.cod]:e.target.value}))}/></td>
                    <td>{diff!==null?<span style={{fontWeight:700,color:diff===0?"#10B981":diff>0?"#3B82F6":"#EF4444"}}>{diff>0?"+":""}{diff}</span>:<span style={{color:"#9CA3AF"}}>—</span>}</td>
                    <td>{fisico===null?<span className="badge badge-gray">Pendiente</span>:diff===0?<span className="badge badge-ok">✓ OK</span>:<span className="badge badge-crit">⚠ Diferencia</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
          <button className="btn btn-secondary" onClick={()=>setFase("config")}>← Volver</button>
          <button className="btn btn-primary" onClick={()=>setFase("revision")}>Revisar Resultados →</button>
        </div>
      </div>}
      {fase==="revision"&&<div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Resultados del Conteo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {[["Artículos contados","4","#1B1F2E"],["Sin diferencias","3","#10B981"],["Con diferencias","1","#EF4444"]].map(([l,v,c])=>(
              <div key={l} className="kpi" style={{textAlign:"center"}}><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string,fontSize:22}}>{v}</div></div>
            ))}
          </div>
          <div className="card" style={{background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:"#991B1B",marginBottom:6}}>⚠ Artículos con diferencia</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}>
              <div><b>INV-HER-00203</b> · Llave Ajustable 12"</div>
              <div><span style={{color:"#3B82F6"}}>Sistema: 8</span> · <span style={{color:"#EF4444"}}>Físico: 6</span> · <b style={{color:"#EF4444"}}>Dif: -2</b></div>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Observaciones del Responsable</label><textarea className="form-control" rows={3} placeholder="Notas sobre el conteo, condiciones, irregularidades..."/></div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Acciones requeridas</div>
            {[["🔍","Investigar diferencia en Llave Ajustable","Pendiente"],["⚖️","Generar ajuste por diferencia encontrada","Pendiente"],["📄","Cerrar acta de conteo","Pendiente"]].map(([ic,ac,est])=>(
              <div key={ac} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
                <span>{ic}</span><div style={{flex:1}}>{ac}</div><span className="badge badge-warn">{est}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("ajuste")}>⚖️ Crear Ajuste por Diferencia</button>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>alert("✅ Conteo CON-2024-05 cerrado y firmado.\nActa de auditoría generada para ISO 9001.")}>✓ Cerrar y Firmar Conteo</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
