import React, { useState } from "react";
import type { View, MovimientoInventario, Articulo, Bodega } from "../../types";
import { RightPanel } from "../../components/Stepper";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function EntradasSalidas({setView,movimientos,articulos,bodegas}:{setView:(v:View)=>void;movimientos:MovimientoInventario[];articulos:Articulo[];bodegas:Bodega[]}) {
  const [tab,setTab]=useState<"entradas"|"salidas"|"todos">("todos");
  const [busqueda,setBusqueda]=useState("");

  const iconTipo={entrada:{icon:"📥",color:"#10B981",bg:"#ECFDF5"},salida:{icon:"📤",color:"#EF4444",bg:"#FEF2F2"},traslado:{icon:"🏭",color:"#3B82F6",bg:"#EFF6FF"},ajuste:{icon:"⚖️",color:"#F59E0B",bg:"#FFFBEB"},baja:{icon:"🗑️",color:"#991B1B",bg:"#FEF2F2"}} as const;

  const filtrados=movimientos.filter(m=>{
    if(tab==="entradas"&&m.tipo!=="entrada") return false;
    if(tab==="salidas"&&m.tipo!=="salida") return false;
    if(busqueda){
      const art=articulos.find(a=>a.id===m.articuloId);
      if(!(`${m.id} ${art?.nombre||""} ${m.contraparte}`.toLowerCase().includes(busqueda.toLowerCase()))) return false;
    }
    return true;
  });

  const entradasTotal=movimientos.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+m.cantidad*m.costoUnitario,0);
  const salidasTotal=movimientos.filter(m=>m.tipo==="salida").reduce((s,m)=>s+Math.abs(m.cantidad)*m.costoUnitario,0);
  const traslados=movimientos.filter(m=>m.tipo==="traslado").length;
  const ajustes=movimientos.filter(m=>m.tipo==="ajuste").length;
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div><div className="page-title">Entradas y Salidas</div><div className="page-subtitle">Historial de movimientos · Todos los tipos · Trazabilidad completa</div></div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("ingreso")}>📥 Nuevo Ingreso</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("salida")}>📤 Nueva Salida</button>
            <button className="btn btn-ghost btn-sm">📥 Excel</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[["Entradas (histórico)",fmt(entradasTotal),"#10B981"],["Salidas (histórico)",fmt(salidasTotal),"#EF4444"],["Traslados",String(traslados),"#3B82F6"],["Ajustes",String(ajustes),"#F59E0B"]].map(([l,v,c])=>(
            <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string,fontSize:16}}>{v}</div></div>
          ))}
        </div>
        <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div className="tab-bar" style={{margin:0}}>
              {[["todos","Todos"],["entradas","📥 Entradas"],["salidas","📤 Salidas"]].map(([id,l])=>(
                <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id as typeof tab)}>{l}</div>
              ))}
            </div>
            <div style={{flex:1,minWidth:160}} className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar folio, artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Tipo</th><th>Folio</th><th>Artículo</th><th>Cant.</th><th>Contraparte</th><th>Bodega</th><th>Fecha</th><th>Valor</th></tr></thead>
            <tbody>
              {filtrados.slice(0,80).map(mov=>{
                const art=articulos.find(a=>a.id===mov.articuloId);
                const t=iconTipo[mov.tipo];
                return (
                <tr key={mov.id}>
                  <td><div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",borderRadius:6,background:t.bg,width:"fit-content"}}><span style={{fontSize:13}}>{t.icon}</span><span style={{fontSize:11,fontWeight:600,color:t.color,textTransform:"capitalize"}}>{mov.tipo}</span></div></td>
                  <td><b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{mov.id}</b></td>
                  <td><div style={{fontSize:12.5}}>{art?.nombre||mov.articuloId}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{mov.articuloId}</div></td>
                  <td><span style={{fontWeight:700,color:mov.cantidad<0?"#EF4444":t.color}}>{mov.cantidad>0?"+":""}{mov.cantidad} {art?.unidad||""}</span></td>
                  <td style={{fontSize:12}}>{mov.contraparte}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{bodNom(mov.bodegaId)}</td>
                  <td><div style={{fontSize:12}}>{mov.fecha}</div></td>
                  <td style={{fontWeight:600,color:mov.tipo==="entrada"?"#10B981":"#EF4444"}}>{mov.cantidad>=0?"+":"-"}{fmt(Math.abs(mov.cantidad)*mov.costoUnitario)}</td>
                </tr>
                );
              })}
              {filtrados.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin movimientos para este filtro</td></tr>}
            </tbody>
          </table>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB"}}>
            <span>Mostrando {Math.min(80,filtrados.length)} de {filtrados.length} movimientos</span>
          </div>
        </div>
      </div>
      <RightPanel/>
    </div>
  );
}
