import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario, Bodega, ProveedorInventario } from "../../types";
import { siguienteFolio } from "../../data/inventario";

interface Linea { articuloId:string; qty:number; costo:number; }
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});
const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function RegistrarIngreso({setView,articulos,setArticulos,movimientos,setMovimientos,bodegas,proveedores}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;bodegas:Bodega[];proveedores:ProveedorInventario[]}) {
  const [bodegaId,setBodegaId]=useState(bodegas[0]?.id||"");
  const [proveedorId,setProveedorId]=useState(proveedores[0]?.id||"");
  const [numeroOC,setNumeroOC]=useState("OC-2024-028");
  const [factura,setFactura]=useState("");
  const [observaciones,setObservaciones]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [items,setItems]=useState<Linea[]>([]);
  const [check,setCheck]=useState<Record<string,boolean>>({});

  const proveedor=proveedores.find(p=>p.id===proveedorId);
  const candidatos=articulos.filter(a=>a.activo&&a.bodegaId===bodegaId&&!items.some(i=>i.articuloId===a.id)&&(busqueda===""||`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));

  const agregar=(a:Articulo)=>{setItems(p=>[...p,{articuloId:a.id,qty:5,costo:a.costoUnitario}]);setBusqueda("");};
  const actualizar=(id:string,campo:"qty"|"costo",val:number)=>setItems(p=>p.map(i=>i.articuloId===id?{...i,[campo]:val}:i));
  const quitar=(id:string)=>setItems(p=>p.filter(i=>i.articuloId!==id));

  const total=items.reduce((s,i)=>{const a=articulos.find(x=>x.id===i.articuloId);return s+i.qty*(i.costo||a?.costoUnitario||0);},0);
  const folio=siguienteFolio(movimientos,"entrada");
  const checklistItems=["Factura recibida y revisada","Cantidades verificadas físicamente","Productos sin daños visibles","Proveedor coincide con OC"];
  const listo=(checklistItems.length===0||checklistItems.every(c=>check[c]))&&items.length>0;

  const confirmar=()=>{
    if(!listo) return;
    setArticulos(prev=>prev.map(a=>{
      const linea=items.find(i=>i.articuloId===a.id);
      return linea?{...a,stock:a.stock+linea.qty,costoUnitario:linea.costo||a.costoUnitario}:a;
    }));
    const nuevos:MovimientoInventario[]=items.map((i,idx)=>({
      id:idx===0?folio:`${folio}-${idx+1}`,tipo:"entrada",articuloId:i.articuloId,cantidad:i.qty,bodegaId,
      costoUnitario:i.costo,contraparte:proveedor?.nombre||"—",fecha:hoy(),usuario:"Ronald",referencia:numeroOC,
    }));
    setMovimientos(prev=>[...nuevos,...prev]);
    alert(`✅ Ingreso ${folio} registrado.\n\nProveedor: ${proveedor?.nombre}\n${items.length} artículos · ${fmt(total)}`);
    setView("existencias");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Registrar Ingreso</div><div className="page-subtitle">Entrada de artículos al inventario · Con o sin orden de compra · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Datos del Proveedor / OC</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Proveedor</label>
                <select className="form-control" value={proveedorId} onChange={e=>setProveedorId(e.target.value)}>
                  {proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Número OC / Folio</label><input className="form-control" value={numeroOC} onChange={e=>setNumeroOC(e.target.value)}/></div>
            </div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Número de Factura</label><input className="form-control" placeholder="FAC-2024-..." value={factura} onChange={e=>setFactura(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Condiciones de Pago</label><div className="form-control" style={{background:"#F9FAFB",color:"#6B7280"}}>{proveedor?.condicion||"—"}</div></div>
            </div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Bodega de Destino</div>
            <select className="form-control" value={bodegaId} onChange={e=>{setBodegaId(e.target.value);setItems([]);}}>
              {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos Recibidos</div>
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
              <thead><tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th>Costo Unit.</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {items.map(item=>{
                  const a=articulos.find(x=>x.id===item.articuloId)!;
                  return (
                  <tr key={item.articuloId}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
                    <td style={{fontSize:12.5}}>{a.nombre}</td>
                    <td><input type="number" className="form-control" value={item.qty} min={1} style={{width:60}} onChange={e=>actualizar(item.articuloId,"qty",Math.max(1,parseInt(e.target.value)||1))}/></td>
                    <td><input type="number" className="form-control" value={item.costo} style={{width:90}} onChange={e=>actualizar(item.articuloId,"costo",parseFloat(e.target.value)||0)}/></td>
                    <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(item.qty*item.costo)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>quitar(item.articuloId)}>✕</button></td>
                  </tr>
                  );
                })}
                {items.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#9CA3AF",padding:14}}>Busca y agrega artículos de {bodegas.find(b=>b.id===bodegaId)?.nombre}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={2} placeholder="Estado del pedido, condiciones de entrega..." value={observaciones} onChange={e=>setObservaciones(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen de Ingreso</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#10B981"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Proveedor</span><span className="res-val">{proveedor?.nombre}</span></div>
            <div className="res-row"><span className="res-label">OC vinculada</span><span className="res-val">{numeroOC||"—"}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length}</span></div>
            <div className="res-row"><span className="res-label">Valor Total</span><span className="res-val" style={{color:"#10B981",fontWeight:700}}>{fmt(total)}</span></div>
            <div className="res-row"><span className="res-label">Bodega destino</span><span className="res-val">{bodegas.find(b=>b.id===bodegaId)?.nombre}</span></div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Lista de verificación</div>
            {checklistItems.map(c=>(
              <label key={c} style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,padding:"4px 0",cursor:"pointer"}}><input type="checkbox" checked={!!check[c]} onChange={()=>setCheck(p=>({...p,[c]:!p[c]}))}/>{c}</label>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-success" style={{width:"100%"}} disabled={!listo} onClick={confirmar}>📥 Confirmar Ingreso</button>
          </div>
        </div>
      </div>
    </div>
  );
}
