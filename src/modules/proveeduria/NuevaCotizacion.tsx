import React, { useState } from "react";
import type { View, ProveedorInventario, Bodega, Articulo, SolicitudCotizacion, LineaRFQ, DocumentoProveedor } from "../../types";
import { siguienteFolioRFQ, homologacionEfectiva } from "../../data/proveeduria";

const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function NuevaCotizacion({setView,proveedores,bodegas,articulos,solicitudes,setSolicitudes,documentosProveedor}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];bodegas:Bodega[];articulos:Articulo[];
  solicitudes:SolicitudCotizacion[];setSolicitudes:React.Dispatch<React.SetStateAction<SolicitudCotizacion[]>>;documentosProveedor:DocumentoProveedor[];
}) {
  const [bodegaId,setBodegaId]=useState(bodegas[0]?.id||"");
  const [busqueda,setBusqueda]=useState("");
  const [lineas,setLineas]=useState<LineaRFQ[]>([]);
  const [proveedorIds,setProveedorIds]=useState<string[]>([]);
  const [observaciones,setObservaciones]=useState("");

  const candidatos=articulos.filter(a=>a.activo&&a.bodegaId===bodegaId&&!lineas.some(l=>l.articuloId===a.id)&&(busqueda===""||`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));
  const agregar=(a:Articulo)=>{setLineas(p=>[...p,{articuloId:a.id,cantidad:Math.max(a.max-a.stock,a.min,5)}]);setBusqueda("");};
  const actualizar=(id:string,cantidad:number)=>setLineas(p=>p.map(l=>l.articuloId===id?{...l,cantidad:Math.max(1,cantidad)}:l));
  const quitar=(id:string)=>setLineas(p=>p.filter(l=>l.articuloId!==id));
  const toggleProveedor=(id:string)=>setProveedorIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const folio=siguienteFolioRFQ(solicitudes);
  const listo=lineas.length>0&&proveedorIds.length>=2;

  const enviar=()=>{
    if(!listo) return;
    const nueva:SolicitudCotizacion={id:folio,fecha:hoy(),bodegaId,lineas,proveedorIds,estado:"Enviada",observaciones:observaciones||undefined,creadoPor:"Ronald"};
    setSolicitudes(prev=>[nueva,...prev]);
    alert(`✅ Solicitud de cotización ${folio} enviada a ${proveedorIds.length} proveedor(es).`);
    setView("cotizaciones");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Nueva Solicitud de Cotización</div><div className="page-subtitle">Define qué necesitas y a qué proveedores invitar a ofertar</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("cotizaciones")}>← Cotizaciones</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Bodega destino</div>
            <select className="form-control" value={bodegaId} onChange={e=>{setBodegaId(e.target.value);setLineas([]);}}>
              {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos que necesitas</div>
            <div style={{position:"relative",marginBottom:10}}>
              <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar artículo en esta bodega..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              {busqueda&&candidatos.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,marginTop:4,zIndex:5,maxHeight:200,overflow:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                  {candidatos.slice(0,8).map(a=>(
                    <div key={a.id} onClick={()=>agregar(a)} style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,borderBottom:"1px solid #F3F4F6"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"}>
                      <b>{a.id}</b> — {a.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th></th></tr></thead>
              <tbody>
                {lineas.map(l=>{
                  const a=articulos.find(x=>x.id===l.articuloId)!;
                  return (
                  <tr key={l.articuloId}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
                    <td style={{fontSize:12.5}}>{a.nombre}</td>
                    <td><input type="number" className="form-control" value={l.cantidad} min={1} style={{width:80}} onChange={e=>actualizar(l.articuloId,parseInt(e.target.value)||1)}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>quitar(l.articuloId)}>✕</button></td>
                  </tr>
                  );
                })}
                {lineas.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#9CA3AF",padding:14}}>Busca y agrega artículos de {bodegas.find(b=>b.id===bodegaId)?.nombre}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={2} placeholder="Especificaciones, urgencia, etc..." value={observaciones} onChange={e=>setObservaciones(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Invitar proveedores ({proveedorIds.length})</div>
            <div style={{fontSize:11,color:"#9CA3AF",marginBottom:8}}>Selecciona al menos 2 para poder comparar ofertas</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {proveedores.filter(p=>p.activo).map(p=>{
                const bloqueado=homologacionEfectiva(p,documentosProveedor)==="Bloqueado";
                return (
                <label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",border:`1.5px solid ${proveedorIds.includes(p.id)?"#E8611A":"#E5E7EB"}`,borderRadius:8,cursor:bloqueado?"not-allowed":"pointer",background:proveedorIds.includes(p.id)?"#FFF3ED":bloqueado?"#F9FAFB":"#fff",opacity:bloqueado?0.6:1}}>
                  <input type="checkbox" checked={proveedorIds.includes(p.id)} disabled={bloqueado} onChange={()=>toggleProveedor(p.id)}/>
                  <span style={{fontSize:12}}>{p.nombre}</span>
                  {bloqueado&&<span className="badge badge-crit" style={{fontSize:8.5,marginLeft:"auto"}}>🚫 Bloqueado</span>}
                </label>
                );
              })}
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{lineas.length}</span></div>
            <div className="res-row"><span className="res-label">Proveedores invitados</span><span className="res-val">{proveedorIds.length}</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("cotizaciones")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!listo} onClick={enviar}>📤 Enviar Solicitud de Cotización</button>
          </div>
        </div>
      </div>
    </div>
  );
}
