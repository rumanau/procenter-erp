import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario, Bodega, CategoriaInventario, ProveedorInventario } from "../../types";
import { estadoStock } from "../../data/inventario";

export function ConsultaExistencias({setView,articulos,movimientos,bodegas,categorias,proveedores}:{setView:(v:View)=>void;articulos:Articulo[];movimientos:MovimientoInventario[];bodegas:Bodega[];categorias:CategoriaInventario[];proveedores:ProveedorInventario[]}) {
  const [filter,setFilter]=useState("");
  const [bodegaFiltro,setBodegaFiltro]=useState("");
  const [catFiltro,setCatFiltro]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [det,setDet]=useState<Articulo|null>(null);
  const [detTab,setDetTab]=useState("info");

  const activos=articulos.filter(a=>a.activo);
  const data=activos.filter(a=>{
    if(filter&&estadoStock(a.stock,a.min)!==filter) return false;
    if(bodegaFiltro&&a.bodegaId!==bodegaFiltro) return false;
    if(catFiltro&&a.categoriaId!==catFiltro) return false;
    if(busqueda&&!(`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase()))) return false;
    return true;
  });
  const sc=(e:string)=>e==="ok"?"#10B981":e==="bajo"?"#F59E0B":e==="critico"?"#EF4444":"#6B7280";
  const catNom=(id:string)=>categorias.find(c=>c.id===id)?.nombre||id;
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

  const valorTotal=activos.reduce((s,a)=>s+a.stock*a.costoUnitario,0);
  const nBajo=activos.filter(a=>estadoStock(a.stock,a.min)==="bajo").length;
  const nCritico=activos.filter(a=>{const e=estadoStock(a.stock,a.min);return e==="critico"||e==="agotado";}).length;
  const nOk=activos.filter(a=>estadoStock(a.stock,a.min)==="ok").length;

  const detEstado=det?estadoStock(det.stock,det.min):"ok";
  const detMovs=det?movimientos.filter(m=>m.articuloId===det.id).slice(0,6):[];
  const detProv=det?proveedores.find(p=>p.id===det.proveedorId):null;
  const iconMov={entrada:"badge-ent",salida:"badge-sal",traslado:"badge-info",ajuste:"badge-warn",baja:"badge-crit"} as const;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="content">
          <div className="page-header">
            <div><div className="page-title">Consulta de Existencias</div><div className="page-subtitle">Stock en tiempo real · Semáforo de niveles · ISO 9001</div></div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-secondary btn-sm">📥 Excel</button>
              <button className="btn btn-secondary btn-sm">📄 PDF</button>
              <button className="btn btn-primary btn-sm" onClick={()=>setView("nuevo")}>➕ Nuevo Artículo</button>
            </div>
          </div>
          <div className="g4" style={{marginBottom:14}}>
            <div className="kpi"><div className="kpi-label">Total Ítems</div><div className="kpi-value">{activos.length}</div></div>
            <div className="kpi"><div className="kpi-label">Valor Total</div><div className="kpi-value" style={{fontSize:16,color:"#E8611A"}}>{fmt(valorTotal)}</div><div className="kpi-pill kpi-info">CRC</div></div>
            <div className="kpi"><div className="kpi-label">🟡 Bajo mínimo</div><div className="kpi-value" style={{color:"#F59E0B"}}>{nBajo}</div><div className="kpi-pill kpi-warn">Reorden</div></div>
            <div className="kpi"><div className="kpi-label">🔴 Críticos</div><div className="kpi-value" style={{color:"#EF4444"}}>{nCritico}</div><div className="kpi-pill kpi-down">Urgente</div></div>
          </div>
          <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div className="header-search" style={{flex:1,minWidth:180}}><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar artículo, código..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              <select className="form-control" style={{width:160}} value={bodegaFiltro} onChange={e=>setBodegaFiltro(e.target.value)}>
                <option value="">Todas las bodegas</option>
                {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
              <select className="form-control" style={{width:150}} value={catFiltro} onChange={e=>setCatFiltro(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <select className="form-control" style={{width:140}} value={filter} onChange={e=>setFilter(e.target.value)}>
                <option value="">Todos</option><option value="ok">🟢 OK</option><option value="bajo">🟡 Bajo</option><option value="critico">🔴 Crítico</option><option value="agotado">⚫ Agotado</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {[["badge-ok",`🟢 OK (${nOk})`,"ok"],["badge-warn",`🟡 Bajo (${nBajo})`,"bajo"],["badge-crit",`🔴 Crítico (${nCritico})`,"critico"],["badge-gray",`⚫ Agotado (${activos.filter(a=>estadoStock(a.stock,a.min)==="agotado").length})`,"agotado"]].map(([cl,tx,v])=>(
                <span key={tx} className={`badge ${cl}`} style={{cursor:"pointer"}} onClick={()=>setFilter(filter===v?"":v)}>{tx}</span>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Est.</th><th>Código</th><th>Artículo</th><th>Cat.</th><th>Bodega</th><th>Stock</th><th>Mín</th><th>Máx</th><th>Costo</th><th>Valor Total</th><th></th></tr></thead>
              <tbody>
                {data.map(item=>{
                  const est=estadoStock(item.stock,item.min);
                  return (
                  <tr key={item.id} onClick={()=>{setDet(item);setDetTab("info");}} style={{cursor:"pointer"}}>
                    <td><div style={{width:10,height:10,borderRadius:"50%",background:sc(est),display:"inline-block"}}/></td>
                    <td><b style={{fontSize:12}}>{item.id}</b></td>
                    <td style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.nombre}</td>
                    <td><span className="badge badge-info" style={{fontSize:10}}>{catNom(item.categoriaId)}</span></td>
                    <td style={{fontSize:11.5}}>{bodNom(item.bodegaId)}</td>
                    <td>
                      <b style={{color:sc(est)}}>{item.stock}</b>
                      <div className="stock-bar" style={{width:50}}>
                        <div className="stock-bar-fill" style={{width:`${Math.min(100,Math.round(item.stock/item.max*100))}%`,background:sc(est)}}/>
                      </div>
                    </td>
                    <td style={{color:"#6B7280"}}>{item.min}</td>
                    <td style={{color:"#6B7280"}}>{item.max}</td>
                    <td>{fmt(item.costoUnitario)}</td>
                    <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(item.stock*item.costoUnitario)}</td>
                    <td><button className="btn btn-ghost btn-sm">👁</button></td>
                  </tr>
                  );
                })}
                {data.length===0&&<tr><td colSpan={11} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin resultados para los filtros aplicados</td></tr>}
              </tbody>
            </table>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB"}}>
              <span>Mostrando {data.length} de {activos.length} artículos</span>
            </div>
          </div>
        </div>
      </div>

      {det&&(
        <div style={{width:285,background:"#fff",borderLeft:"1px solid #E5E7EB",padding:16,overflow:"auto",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>Detalle</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setDet(null)}>✕</button>
          </div>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:36}}>{categorias.find(c=>c.id===det.categoriaId)?.icono||"📦"}</div>
            <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{det.nombre}</div>
            <div style={{fontSize:11,color:"#6B7280"}}>{det.id}</div>
          </div>
          <div className="tab-bar">
            {["info","mov","prov"].map(t=><div key={t} className={`tab-btn ${detTab===t?"active":""}`} onClick={()=>setDetTab(t)}>{t==="info"?"Info":t==="mov"?"Movimientos":"Proveedor"}</div>)}
          </div>
          {detTab==="info"&&<div>
            <div className="resumen" style={{marginBottom:10}}>
              <div className="res-row"><span className="res-label">Stock actual</span><span className="res-val" style={{color:sc(detEstado)}}>{det.stock} {det.unidad}</span></div>
              <div className="res-row"><span className="res-label">Mínimo</span><span className="res-val">{det.min}</span></div>
              <div className="res-row"><span className="res-label">Máximo</span><span className="res-val">{det.max}</span></div>
              <div className="res-row"><span className="res-label">Bodega</span><span className="res-val">{bodNom(det.bodegaId)}</span></div>
              <div className="res-row"><span className="res-label">Costo unit.</span><span className="res-val">{fmt(det.costoUnitario)}</span></div>
              <div className="res-row"><span className="res-label">Valor total</span><span className="res-val" style={{color:"#E8611A"}}>{fmt(det.stock*det.costoUnitario)}</span></div>
            </div>
            <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Nivel de stock</div>
            <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${Math.min(100,Math.round(det.stock/det.max*100))}%`,background:sc(detEstado)}}/></div>
          </div>}
          {detTab==="mov"&&<div>
            {detMovs.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin movimientos registrados</div>}
            {detMovs.map(mov=>(
              <div key={mov.id} className="mini-reg"><span className={`badge ${iconMov[mov.tipo]}`} style={{fontSize:9}}>{mov.tipo.slice(0,3).toUpperCase()}</span><div style={{flex:1,fontSize:11}}>{mov.cantidad>0?"+":""}{mov.cantidad} {det.unidad} · {mov.contraparte}</div><div style={{fontSize:10,color:"#6B7280"}}>{mov.fecha}</div></div>
            ))}
          </div>}
          {detTab==="prov"&&<div className="resumen">
            {[["Proveedor",detProv?.nombre||"—"],["Contacto",detProv?.contacto||"—"],["Cond.",detProv?.condicion||"—"],["Rating",detProv?.rating||"—"],["Último precio",fmt(det.costoUnitario)]].map(([l,v])=>(
              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
            ))}
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:14}}>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("ingreso")} style={{width:"100%"}}>📥 Registrar Ingreso</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("salida")} style={{width:"100%"}}>📤 Registrar Salida</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setView("trazabilidad")} style={{width:"100%"}}>🔍 Trazabilidad</button>
          </div>
        </div>
      )}
    </div>
  );
}
