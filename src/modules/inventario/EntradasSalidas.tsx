import React, { useState } from "react";
import type { View } from "../../types";
import { RightPanel } from "../../components/Stepper";

export function EntradasSalidas({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState<"entradas"|"salidas"|"todos">("todos");
  const movimientos=[
    {id:"ENT-2024-041",tipo:"entrada",icon:"📥",color:"#10B981",bg:"#ECFDF5",cod:"INV-HR-00158",name:"Taladro DeWalt 20V",qty:20,proveedor:"TechnoSupply",fecha:"28 May 2024",hora:"09:14",bodega:"Bodega Central",valor:63000},
    {id:"SAL-2024-042",tipo:"salida",icon:"📤",color:"#EF4444",bg:"#FEF2F2",cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",qty:50,proveedor:"Prod. Línea A",fecha:"27 May 2024",hora:"14:30",bodega:"Bodega Central",valor:1400},
    {id:"TRA-2024-018",tipo:"traslado",icon:"🏭",color:"#3B82F6",bg:"#EFF6FF",cod:"INV-HER-00203",name:"Llave Ajustable 12\"",qty:5,proveedor:"→ Bodega 2",fecha:"26 May 2024",hora:"11:00",bodega:"Bodega Central",valor:725},
    {id:"ENT-2024-040",tipo:"entrada",icon:"📥",color:"#10B981",bg:"#ECFDF5",cod:"INV-EQO-00041",name:"Multímetro Digital",qty:3,proveedor:"ElectroMayorista",fecha:"24 May 2024",hora:"08:45",bodega:"Bodega Central",valor:2670},
    {id:"AJU-2024-007",tipo:"ajuste",icon:"⚖️",color:"#F59E0B",bg:"#FFFBEB",cod:"INV-HER-00203",name:"Llave Ajustable 12\"",qty:-2,proveedor:"Ajuste conteo",fecha:"22 May 2024",hora:"16:20",bodega:"Bodega Central",valor:-290},
  ];
  const filtered=tab==="todos"?movimientos:movimientos.filter(m=>m.tipo===tab.slice(0,-1)||m.tipo===tab.slice(0,-1)+"s");
  const entradas=movimientos.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+m.valor,0);
  const salidas=movimientos.filter(m=>m.tipo==="salida").reduce((s,m)=>s+m.valor,0);

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
          {[["Entradas mes",`$${(entradas/1000).toFixed(0)}K`,"#10B981"],["Salidas mes",`$${(salidas/1000).toFixed(1)}K`,"#EF4444"],["Traslados","5","#3B82F6"],["Ajustes","1","#F59E0B"]].map(([l,v,c])=>(
            <div key={l} className="kpi"><div className="kpi-label">{l}</div><div className="kpi-value" style={{color:c as string}}>{v}</div></div>
          ))}
        </div>
        <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div className="tab-bar" style={{margin:0}}>
              {[["todos","Todos"],["entradas","📥 Entradas"],["salidas","📤 Salidas"]].map(([id,l])=>(
                <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id as typeof tab)}>{l}</div>
              ))}
            </div>
            <div style={{flex:1,minWidth:160}} className="header-search"><span>🔍</span><input placeholder="Buscar folio, artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            <select className="form-control" style={{width:150}}><option>Todos los períodos</option><option>Hoy</option><option>Esta semana</option><option>Este mes</option></select>
            <input type="date" className="form-control" style={{width:130}}/>
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Tipo</th><th>Folio</th><th>Artículo</th><th>Cant.</th><th>Contraparte</th><th>Bodega</th><th>Fecha</th><th>Valor</th></tr></thead>
            <tbody>
              {movimientos.map(mov=>(
                <tr key={mov.id}>
                  <td><div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",borderRadius:6,background:mov.bg,width:"fit-content"}}><span style={{fontSize:13}}>{mov.icon}</span><span style={{fontSize:11,fontWeight:600,color:mov.color,textTransform:"capitalize"}}>{mov.tipo}</span></div></td>
                  <td><b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{mov.id}</b></td>
                  <td><div style={{fontSize:12.5}}>{mov.name}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{mov.cod}</div></td>
                  <td><span style={{fontWeight:700,color:mov.qty<0?"#EF4444":mov.color}}>{mov.qty>0?"+":""}{mov.qty} Pzas.</span></td>
                  <td style={{fontSize:12}}>{mov.proveedor}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{mov.bodega}</td>
                  <td><div style={{fontSize:12}}>{mov.fecha}</div><div style={{fontSize:10.5,color:"#9CA3AF"}}>{mov.hora}</div></td>
                  <td style={{fontWeight:600,color:mov.tipo==="entrada"?"#10B981":"#EF4444"}}>{mov.tipo==="entrada"?"+":"-"}${Math.abs(mov.valor).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB"}}>
            <span>Mostrando {movimientos.length} de 234 movimientos</span>
            <div style={{display:"flex",gap:4}}>{["‹","1","2","3","...","24","›"].map((p,i)=><button key={i} className={`btn btn-sm ${p==="1"?"btn-primary":"btn-ghost"}`}>{p}</button>)}</div>
          </div>
        </div>
      </div>
      <RightPanel/>
    </div>
  );
}
