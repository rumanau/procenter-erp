import React, { useState } from "react";
import type { View, ProveedorInventario, Bodega, Articulo, OrdenCompra, LineaOC, DocumentoProveedor } from "../../types";
import { siguienteFolioOC, nivelAprobacion, homologacionEfectiva } from "../../data/proveeduria";
import { CATALOGOS_INIT } from "../../data/catalogos";

const hoy=(offsetDias=0)=>{const d=new Date();d.setDate(d.getDate()+offsetDias);return d.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});};
const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function NuevaOrdenCompra({setView,proveedores,bodegas,articulos,ordenesCompra,setOrdenesCompra,documentosProveedor}:{setView:(v:View)=>void;proveedores:ProveedorInventario[];bodegas:Bodega[];articulos:Articulo[];ordenesCompra:OrdenCompra[];setOrdenesCompra:React.Dispatch<React.SetStateAction<OrdenCompra[]>>;documentosProveedor:DocumentoProveedor[]}) {
  const disponibles=proveedores.filter(p=>p.activo&&homologacionEfectiva(p,documentosProveedor)!=="Bloqueado");
  const bloqueados=proveedores.filter(p=>p.activo&&homologacionEfectiva(p,documentosProveedor)==="Bloqueado");
  const [proveedorId,setProveedorId]=useState(disponibles[0]?.id||"");
  const [bodegaId,setBodegaId]=useState(bodegas[0]?.id||"");
  const [centroCosto,setCentroCosto]=useState(CATALOGOS_INIT.areas[0]?.nombre||"");
  const [proyecto,setProyecto]=useState("");
  const [moneda,setMoneda]=useState("CRC");
  const [fechaRequerida,setFechaRequerida]=useState(hoy(5));
  const [fechaComprometida,setFechaComprometida]=useState(hoy(7));
  const [observaciones,setObservaciones]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [lineas,setLineas]=useState<LineaOC[]>([]);

  const proveedor=proveedores.find(p=>p.id===proveedorId);
  const candidatos=articulos.filter(a=>a.activo&&a.bodegaId===bodegaId&&!lineas.some(l=>l.articuloId===a.id)&&(busqueda===""||`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));

  const agregar=(a:Articulo)=>{setLineas(p=>[...p,{articuloId:a.id,cantidad:Math.max(a.max-a.stock,a.min,5),costoUnitario:a.costoUnitario}]);setBusqueda("");};
  const actualizar=(id:string,campo:"cantidad"|"costoUnitario",val:number)=>setLineas(p=>p.map(l=>l.articuloId===id?{...l,[campo]:val}:l));
  const quitar=(id:string)=>setLineas(p=>p.filter(l=>l.articuloId!==id));

  const total=lineas.reduce((s,l)=>s+l.cantidad*l.costoUnitario,0);
  const folio=siguienteFolioOC(ordenesCompra);
  const listo=lineas.length>0&&!!proveedorId&&!!bodegaId;
  const nivel=nivelAprobacion(total);

  const fechaInput=(valor:string,setValor:(s:string)=>void)=>(
    <input type="date" className="form-control" onChange={e=>{
      if(!e.target.value) return;
      const [y,m,d]=e.target.value.split("-");
      const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      setValor(`${d} ${meses[parseInt(m)-1]} ${y}`);
    }}/>
  );

  const guardar=(enviar:boolean)=>{
    if(!listo) return;
    const requiereAprobacion=enviar&&nivel!=="Ninguno";
    const nueva:OrdenCompra={
      id:folio,proveedorId,bodegaId,fecha:hoy(),fechaRequerida,fechaEntregaEsperada:fechaComprometida,
      centroCosto,proyecto:proyecto||undefined,moneda,
      estado:!enviar?"Borrador":requiereAprobacion?"Pendiente Aprobación":"Enviada",
      lineas,observaciones,creadoPor:"Ronald",
    };
    setOrdenesCompra(prev=>[nueva,...prev]);
    const msg=requiereAprobacion
      ?`✅ Orden de Compra ${folio} enviada a aprobación de ${nivel}.\n\nMonto: ${fmt(total)} supera el límite de compra directa.\nProveedor: ${proveedor?.nombre}`
      :`✅ Orden de Compra ${folio} guardada como ${nueva.estado}.\n\nProveedor: ${proveedor?.nombre}\n${lineas.length} artículo(s) · ${fmt(total)}`;
    alert(msg);
    setView("ordenes-compra");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Nueva Orden de Compra</div><div className="page-subtitle">Selecciona proveedor, bodega destino y artículos a comprar</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("ordenes-compra")}>← Órdenes de Compra</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Proveedor y Destino</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Proveedor</label>
                <select className="form-control" value={proveedorId} onChange={e=>setProveedorId(e.target.value)}>
                  {disponibles.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                {bloqueados.length>0&&<div style={{fontSize:10,color:"#EF4444",marginTop:4}}>🚫 {bloqueados.length} proveedor(es) no aparecen por estar bloqueados (documentos vencidos): {bloqueados.map(p=>p.nombre).join(", ")}</div>}
              </div>
              <div className="form-group"><label className="form-label">Bodega Destino</label>
                <select className="form-control" value={bodegaId} onChange={e=>{setBodegaId(e.target.value);setLineas([]);}}>
                  {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="g3">
              <div className="form-group"><label className="form-label">Centro de Costo</label>
                <select className="form-control" value={centroCosto} onChange={e=>setCentroCosto(e.target.value)}>
                  {CATALOGOS_INIT.areas.map(a=><option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Proyecto (opcional)</label>
                <select className="form-control" value={proyecto} onChange={e=>setProyecto(e.target.value)}>
                  <option value="">Sin proyecto asociado</option>
                  {CATALOGOS_INIT.proyectos.filter(p=>p.activo).map(p=><option key={p.id} value={p.nombre}>{p.nombre} — {p.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Moneda</label>
                <select className="form-control" value={moneda} onChange={e=>setMoneda(e.target.value)}>
                  <option value="CRC">CRC — Colones</option>
                  <option value="USD">USD — Dólares</option>
                </select>
              </div>
            </div>
            <div className="g3">
              <div className="form-group"><label className="form-label">Fecha requerida</label>{fechaInput(fechaRequerida,setFechaRequerida)}</div>
              <div className="form-group"><label className="form-label">Fecha comprometida por proveedor</label>{fechaInput(fechaComprometida,setFechaComprometida)}</div>
              <div className="form-group"><label className="form-label">Condiciones de Pago</label><div className="form-control" style={{background:"#F9FAFB",color:"#6B7280"}}>{proveedor?.condicion||"—"}</div></div>
            </div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos a Solicitar</div>
            <div style={{position:"relative",marginBottom:10}}>
              <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar artículo en esta bodega..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              {busqueda&&candidatos.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,marginTop:4,zIndex:5,maxHeight:200,overflow:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                  {candidatos.slice(0,8).map(a=>(
                    <div key={a.id} onClick={()=>agregar(a)} style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,borderBottom:"1px solid #F3F4F6"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"}>
                      <b>{a.id}</b> — {a.nombre} <span style={{color:"#6B7280"}}>(stock: {a.stock})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th>Costo Unit.</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {lineas.map(l=>{
                  const a=articulos.find(x=>x.id===l.articuloId)!;
                  return (
                  <tr key={l.articuloId}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
                    <td style={{fontSize:12.5}}>{a.nombre}</td>
                    <td><input type="number" className="form-control" value={l.cantidad} min={1} style={{width:70}} onChange={e=>actualizar(l.articuloId,"cantidad",Math.max(1,parseInt(e.target.value)||1))}/></td>
                    <td><input type="number" className="form-control" value={l.costoUnitario} style={{width:90}} onChange={e=>actualizar(l.articuloId,"costoUnitario",Math.max(0,parseFloat(e.target.value)||0))}/></td>
                    <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(l.cantidad*l.costoUnitario)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>quitar(l.articuloId)}>✕</button></td>
                  </tr>
                  );
                })}
                {lineas.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#9CA3AF",padding:14}}>Busca y agrega artículos de {bodegas.find(b=>b.id===bodegaId)?.nombre}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={2} placeholder="Notas para el proveedor..." value={observaciones} onChange={e=>setObservaciones(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen de Orden</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Proveedor</span><span className="res-val">{proveedor?.nombre}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{lineas.length}</span></div>
            <div className="res-row"><span className="res-label">Total</span><span className="res-val" style={{color:"#10B981",fontWeight:700}}>{fmt(total)}</span></div>
            <div className="res-row"><span className="res-label">Bodega destino</span><span className="res-val">{bodegas.find(b=>b.id===bodegaId)?.nombre}</span></div>
            <div className="res-row"><span className="res-label">Fecha requerida</span><span className="res-val">{fechaRequerida}</span></div>
            <div className="res-row"><span className="res-label">Comprometida por proveedor</span><span className="res-val">{fechaComprometida}</span></div>
          </div>
          {nivel!=="Ninguno"&&(
            <div className="card" style={{marginBottom:12,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#92400E",marginBottom:4}}>⚠ Requiere aprobación de {nivel}</div>
              <div style={{fontSize:11,color:"#92400E"}}>Este monto supera el límite de compra directa (₡250.000). Al enviar, la orden quedará "Pendiente Aprobación" hasta que {nivel.toLowerCase()} la apruebe.</div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("ordenes-compra")}>Cancelar</button>
            <button className="btn btn-secondary" style={{width:"100%"}} disabled={!listo} onClick={()=>guardar(false)}>💾 Guardar como Borrador</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!listo} onClick={()=>guardar(true)}>{nivel==="Ninguno"?"📨 Guardar y Enviar":`📤 Enviar a Aprobación (${nivel})`}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
