import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario, Bodega } from "../../types";
import { siguienteFolio } from "../../data/inventario";

const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function ConteoAuditoria({setView,articulos,setArticulos,movimientos,setMovimientos,bodegas}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;bodegas:Bodega[]}) {
  const [fase,setFase]=useState<"config"|"conteo"|"revision">("config");
  const [bodegaId,setBodegaId]=useState(bodegas[0]?.id||"");
  const [responsable,setResponsable]=useState("Jules Ramirez");
  const [conteos,setConteos]=useState<Record<string,string>>({});
  const [cerrado,setCerrado]=useState(false);

  const items=articulos.filter(a=>a.activo&&a.bodegaId===bodegaId);
  const conDiff=items.filter(a=>{const v=conteos[a.id];return v!==undefined&&parseInt(v)!==a.stock;});
  const contados=items.filter(a=>conteos[a.id]!==undefined).length;
  const nombreBodega=bodegas.find(b=>b.id===bodegaId)?.nombre||"";

  const cerrarConteo=()=>{
    if(cerrado) return;
    const fecha=hoy();
    const nuevosMovs:MovimientoInventario[]=[];
    setArticulos(prev=>prev.map(a=>{
      const val=conteos[a.id];
      if(val===undefined||a.bodegaId!==bodegaId) return a;
      const fisico=parseInt(val);
      const diff=fisico-a.stock;
      if(diff===0) return a;
      const folio=`${siguienteFolio(movimientos,"ajuste")}-${a.id.slice(-3)}`;
      nuevosMovs.push({id:folio,tipo:"ajuste",articuloId:a.id,cantidad:diff,bodegaId:a.bodegaId,costoUnitario:a.costoUnitario,contraparte:"Ajuste por conteo físico",fecha,usuario:responsable,motivo:"Diferencia de conteo físico"});
      return {...a,stock:fisico};
    }));
    if(nuevosMovs.length>0) setMovimientos(prev=>[...nuevosMovs,...prev]);
    setCerrado(true);
    alert(`✅ Conteo cerrado y firmado.\n\n${conDiff.length} ajuste(s) aplicados automáticamente.\nActa de auditoría generada para ISO 9001.`);
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Conteo / Auditoría de Inventario</div><div className="page-subtitle">Conteo físico · Comparación vs sistema · ISO 9001 §9.1</div></div>
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
          <div className="form-group"><label className="form-label">Bodega</label>
            <select className="form-control" value={bodegaId} onChange={e=>{setBodegaId(e.target.value);setConteos({});setCerrado(false);}}>
              {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div style={{fontSize:11.5,color:"#6B7280",marginBottom:10}}>{items.length} artículos activos registrados en esta bodega.</div>
          <div className="form-group"><label className="form-label">Responsable</label>
            <select className="form-control" value={responsable} onChange={e=>setResponsable(e.target.value)}>
              <option>Jules Ramirez</option><option>María Rojas</option><option>Ronald</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:8}} onClick={()=>setFase("conteo")}>→ Iniciar Conteo Físico</button>
        </div>
        <div className="resumen">
          <div className="panel-title" style={{marginBottom:8}}>Últimos Conteos</div>
          {[["CON-2024-04","30 Abr 2024","Completo","badge-ok","Cerrado"],["CON-2024-03","28 Mar 2024","Cíclico","badge-ok","Cerrado"]].map(([id,fecha,tipo,cl,est])=>(
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
            <div><div style={{fontSize:13,fontWeight:700,color:"#1D4ED8"}}>Conteo en Proceso — {nombreBodega}</div><div style={{fontSize:11,color:"#3B82F6"}}>Ingresa la cantidad física real de cada artículo</div></div>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Código</th><th>Artículo</th><th>Stock Sistema</th><th>Conteo Físico</th><th>Diferencia</th><th>Estado</th></tr></thead>
            <tbody>
              {items.map(item=>{
                const val=conteos[item.id];
                const fisico=val!==undefined?parseInt(val):null;
                const diff=fisico!==null?fisico-item.stock:null;
                return (
                  <tr key={item.id}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.id}</b></td>
                    <td style={{fontSize:12.5}}>{item.nombre}</td>
                    <td><b style={{color:"#3B82F6"}}>{item.stock}</b></td>
                    <td><input type="number" className="form-control" style={{width:80}} placeholder="—" value={val||""} onChange={e=>setConteos(p=>({...p,[item.id]:e.target.value}))}/></td>
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
            {[["Artículos contados",String(contados),"#1B1F2E"],["Sin diferencias",String(contados-conDiff.length),"#10B981"],["Con diferencias",String(conDiff.length),"#EF4444"]].map(([l,v,c])=>(
              <div key={l} className="kpi" style={{textAlign:"center"}}><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string,fontSize:22}}>{v}</div></div>
            ))}
          </div>
          {conDiff.length>0&&<div className="card" style={{background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:"#991B1B",marginBottom:6}}>⚠ Artículos con diferencia</div>
            {conDiff.map(a=>{
              const fisico=parseInt(conteos[a.id]);
              const diff=fisico-a.stock;
              return (
                <div key={a.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,padding:"4px 0"}}>
                  <div><b>{a.id}</b> · {a.nombre}</div>
                  <div><span style={{color:"#3B82F6"}}>Sistema: {a.stock}</span> · <span style={{color:"#EF4444"}}>Físico: {fisico}</span> · <b style={{color:"#EF4444"}}>Dif: {diff>0?"+":""}{diff}</b></div>
                </div>
              );
            })}
          </div>}
        </div>
        <div>
          {cerrado&&<div className="card" style={{marginBottom:12,background:"#ECFDF5",border:"1px solid #6EE7B7"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"#065F46"}}>✓ Conteo cerrado y firmado</div>
            <div style={{fontSize:11,color:"#047857",marginTop:4}}>Los ajustes ya se reflejan en el stock del sistema.</div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("ajuste")}>⚖️ Crear Ajuste Manual</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={cerrado||contados===0} onClick={cerrarConteo}>✓ Cerrar y Firmar Conteo</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
