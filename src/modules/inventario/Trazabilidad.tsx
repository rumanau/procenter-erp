import React, { useState } from "react";

export function Trazabilidad() {
  const [artSel,setArtSel]=useState("INV-HR-00158");
  const movs=[
    {id:"ENT-2024-041",tipo:"entrada",icon:"📥",color:"#10B981",bg:"#ECFDF5",desc:"Ingreso de 20 pzas. desde TechnoSupply",fecha:"28 May 2024",hora:"09:14",user:"Jules Ramirez",saldo:14,folio:"OC-2024-028"},
    {id:"SAL-2024-039",tipo:"salida",icon:"📤",color:"#EF4444",bg:"#FEF2F2",desc:"Salida de 3 pzas. — Mantenimiento correctivo",fecha:"25 May 2024",hora:"14:30",user:"María Rojas",saldo:8,folio:"OT-2024-114"},
    {id:"TRA-2024-015",tipo:"traslado",icon:"🏭",color:"#3B82F6",bg:"#EFF6FF",desc:"Traslado de 5 pzas. → Bodega 2",fecha:"20 May 2024",hora:"11:00",user:"Jules Ramirez",saldo:11,folio:"TRA-2024-015"},
    {id:"AJU-2024-005",tipo:"ajuste",icon:"⚖️",color:"#F59E0B",bg:"#FFFBEB",desc:"Ajuste de inventario: +1 pza. por conteo físico",fecha:"10 May 2024",hora:"16:20",user:"Ronald",saldo:16,folio:"AJU-2024-005"},
    {id:"SAL-2024-031",tipo:"salida",icon:"📤",color:"#EF4444",bg:"#FEF2F2",desc:"Préstamo 2 pzas. — Proyecto Omega",fecha:"5 May 2024",hora:"08:45",user:"Carlos Méndez",saldo:15,folio:"PRES-2024-007"},
    {id:"ENT-2024-028",tipo:"entrada",icon:"📥",color:"#10B981",bg:"#ECFDF5",desc:"Ingreso inicial — Alta de artículo",fecha:"15 Abr 2024",hora:"10:00",user:"Jules Ramirez",saldo:17,folio:"OC-2024-010"},
  ];
  const arts=[
    {cod:"INV-HR-00158",name:"Taladro DeWalt 20V",stock:14},
    {cod:"INV-CNS-00067",name:"Guantes Nitrilo T-L",stock:200},
    {cod:"INV-EQO-00041",name:"Multímetro Digital",stock:3},
  ];
  const artActual=arts.find(a=>a.cod===artSel)||arts[0];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Trazabilidad de Artículos</div><div className="page-subtitle">Historial completo por artículo · ISO 9001 · Quién, cuándo, cuánto y por qué</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm">📥 Exportar historial</button>
          <button className="btn btn-ghost btn-sm">🖨️ Imprimir</button>
        </div>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Seleccionar Artículo</div>
            <div className="header-search" style={{marginBottom:10}}><span>🔍</span><input placeholder="Buscar por código o nombre..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            {arts.map(art=>(
              <div key={art.cod} onClick={()=>setArtSel(art.cod)}
                style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${artSel===art.cod?"#E8611A":"#E5E7EB"}`,background:artSel===art.cod?"#FFF3ED":"#fff",cursor:"pointer",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:20}}>🔧</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:artSel===art.cod?700:500,color:artSel===art.cod?"#E8611A":"#1B1F2E"}}>{art.name}</div>
                  <div style={{fontSize:11,color:"#6B7280"}}>{art.cod} · {art.stock} Pzas.</div>
                </div>
                {artSel===art.cod&&<span style={{color:"#E8611A"}}>▶</span>}
              </div>
            ))}
          </div>
          <div className="resumen">
            <div className="panel-title" style={{marginBottom:8}}>Datos del Artículo</div>
            {[["Código",artActual.cod],["Nombre",artActual.name],["Stock Actual",`${artActual.stock} Pzas.`],["Bodega","Bodega Central"],["Proveedor","TechnoSupply"],["Último Mov.","28 May 2024"]].map(([l,v])=>(
              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{flex:1}}>
          <div className="card" style={{marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
              <div className="card-title" style={{marginBottom:0,flex:1}}>Historial de Movimientos — {artActual.name}</div>
              <select className="form-control" style={{width:130}}><option>Todos</option><option>Entradas</option><option>Salidas</option><option>Traslados</option></select>
              <input type="date" className="form-control" style={{width:130}}/>
            </div>
            <div style={{position:"relative",paddingLeft:28}}>
              <div style={{position:"absolute",left:11,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#E8611A,#E5E7EB)"}}/>
              {movs.map((mov,i)=>(
                <div key={mov.id} style={{position:"relative",marginBottom:16,paddingLeft:14}}>
                  <div style={{position:"absolute",left:-16,top:4,width:20,height:20,borderRadius:"50%",background:mov.bg,border:`2px solid ${mov.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{mov.icon}</div>
                  <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:9,padding:"10px 12px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{fontSize:11,fontWeight:700,color:mov.color,textTransform:"uppercase",padding:"2px 7px",borderRadius:5,background:mov.bg}}>{mov.tipo}</span>
                          <b style={{fontFamily:"monospace",fontSize:11,color:"#6B7280"}}>{mov.id}</b>
                        </div>
                        <div style={{fontSize:12.5,color:"#1B1F2E",marginBottom:4}}>{mov.desc}</div>
                        <div style={{display:"flex",gap:10,fontSize:11,color:"#6B7280"}}>
                          <span>👤 {mov.user}</span>
                          <span>📄 {mov.folio}</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:11,color:"#9CA3AF"}}>{mov.fecha} · {mov.hora}</div>
                        <div style={{fontSize:12,fontWeight:700,marginTop:4}}>Saldo: <span style={{color:"#1B1F2E"}}>{mov.saldo} Pzas.</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
