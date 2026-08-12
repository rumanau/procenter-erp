import React, { useState } from "react";
import type { Articulo, MovimientoInventario, Bodega, ProveedorInventario } from "../../types";

export function Trazabilidad({articulos,movimientos,bodegas,proveedores}:{articulos:Articulo[];movimientos:MovimientoInventario[];bodegas:Bodega[];proveedores:ProveedorInventario[]}) {
  const conMovs=articulos.filter(a=>movimientos.some(m=>m.articuloId===a.id));
  const [artSel,setArtSel]=useState(conMovs[0]?.id||articulos[0]?.id||"");
  const [busqueda,setBusqueda]=useState("");
  const [filtroTipo,setFiltroTipo]=useState("");

  const artActual=articulos.find(a=>a.id===artSel)||articulos[0];
  const lista=(busqueda?articulos.filter(a=>`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())):conMovs).slice(0,30);

  const movsArt=movimientos.filter(m=>m.articuloId===artActual?.id&&(filtroTipo===""||m.tipo===filtroTipo)).sort((a,b)=>b.id.localeCompare(a.id));
  let runningSaldo=artActual?.stock||0;
  const movsConSaldo=movsArt.map(m=>{
    const saldo=runningSaldo;
    runningSaldo-=m.cantidad;
    return {...m,saldo};
  });

  const iconTipo={entrada:{icon:"📥",color:"#10B981",bg:"#ECFDF5"},salida:{icon:"📤",color:"#EF4444",bg:"#FEF2F2"},traslado:{icon:"🏭",color:"#3B82F6",bg:"#EFF6FF"},ajuste:{icon:"⚖️",color:"#F59E0B",bg:"#FFFBEB"},baja:{icon:"🗑️",color:"#991B1B",bg:"#FEF2F2"}} as const;
  const provActual=proveedores.find(p=>p.id===artActual?.proveedorId);
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;

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
            <div className="header-search" style={{marginBottom:10}}><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por código o nombre..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            {lista.map(art=>(
              <div key={art.id} onClick={()=>setArtSel(art.id)}
                style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${artSel===art.id?"#E8611A":"#E5E7EB"}`,background:artSel===art.id?"#FFF3ED":"#fff",cursor:"pointer",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:20}}>🔧</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:artSel===art.id?700:500,color:artSel===art.id?"#E8611A":"#1B1F2E"}}>{art.nombre}</div>
                  <div style={{fontSize:11,color:"#6B7280"}}>{art.id} · {art.stock} {art.unidad}</div>
                </div>
                {artSel===art.id&&<span style={{color:"#E8611A"}}>▶</span>}
              </div>
            ))}
            {lista.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin resultados</div>}
          </div>
          {artActual&&<div className="resumen">
            <div className="panel-title" style={{marginBottom:8}}>Datos del Artículo</div>
            {[["Código",artActual.id],["Nombre",artActual.nombre],["Stock Actual",`${artActual.stock} ${artActual.unidad}`],["Bodega",bodNom(artActual.bodegaId)],["Proveedor",provActual?.nombre||"—"],["Último Mov.",movsArt[0]?.fecha||"—"]].map(([l,v])=>(
              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
            ))}
          </div>}
        </div>
        <div style={{flex:1}}>
          <div className="card" style={{marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
              <div className="card-title" style={{marginBottom:0,flex:1}}>Historial de Movimientos — {artActual?.nombre}</div>
              <select className="form-control" style={{width:130}} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}>
                <option value="">Todos</option><option value="entrada">Entradas</option><option value="salida">Salidas</option><option value="traslado">Traslados</option><option value="ajuste">Ajustes</option><option value="baja">Bajas</option>
              </select>
            </div>
            <div style={{position:"relative",paddingLeft:28}}>
              <div style={{position:"absolute",left:11,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#E8611A,#E5E7EB)"}}/>
              {movsConSaldo.length===0&&<div style={{fontSize:12,color:"#9CA3AF"}}>Sin movimientos registrados para este artículo.</div>}
              {movsConSaldo.map(mov=>{
                const t=iconTipo[mov.tipo];
                return (
                <div key={mov.id} style={{position:"relative",marginBottom:16,paddingLeft:14}}>
                  <div style={{position:"absolute",left:-16,top:4,width:20,height:20,borderRadius:"50%",background:t.bg,border:`2px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{t.icon}</div>
                  <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:9,padding:"10px 12px",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{fontSize:11,fontWeight:700,color:t.color,textTransform:"uppercase",padding:"2px 7px",borderRadius:5,background:t.bg}}>{mov.tipo}</span>
                          <b style={{fontFamily:"monospace",fontSize:11,color:"#6B7280"}}>{mov.id}</b>
                        </div>
                        <div style={{fontSize:12.5,color:"#1B1F2E",marginBottom:4}}>{mov.cantidad>0?"+":""}{mov.cantidad} {artActual?.unidad} — {mov.contraparte}{mov.tipo==="traslado"&&mov.bodegaDestinoId?` (${bodNom(mov.bodegaId)} → ${bodNom(mov.bodegaDestinoId)})`:""}</div>
                        <div style={{display:"flex",gap:10,fontSize:11,color:"#6B7280"}}>
                          <span>👤 {mov.usuario}</span>
                          {mov.referencia&&<span>📄 {mov.referencia}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:11,color:"#9CA3AF"}}>{mov.fecha}</div>
                        <div style={{fontSize:12,fontWeight:700,marginTop:4}}>Saldo: <span style={{color:"#1B1F2E"}}>{Math.max(0,mov.saldo)} {artActual?.unidad}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
