import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario, Bodega } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";
import { siguienteFolio } from "../../data/inventario";

interface Linea { articuloId:string; qty:number; }
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function TrasladoBodegas({setView,articulos,setArticulos,movimientos,setMovimientos,bodegas,catalogos}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;bodegas:Bodega[];catalogos:typeof CATALOGOS_INIT}) {
  const [origen,setOrigen]=useState(bodegas[0]?.id||"");
  const [destino,setDestino]=useState(bodegas[1]?.id||bodegas[0]?.id||"");
  const [responsable,setResponsable]=useState(catalogos.responsablesAutorizados[0]?.nombre||"");
  const [motivo,setMotivo]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [items,setItems]=useState<Linea[]>([]);

  const candidatos=articulos.filter(a=>a.activo&&a.bodegaId===origen&&a.stock>0&&!items.some(i=>i.articuloId===a.id)&&(busqueda===""||`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));
  const agregar=(a:Articulo)=>{setItems(p=>[...p,{articuloId:a.id,qty:1}]);setBusqueda("");};
  const actualizar=(id:string,qty:number)=>{
    const a=articulos.find(x=>x.id===id);
    const max=a?a.stock:1;
    setItems(p=>p.map(i=>i.articuloId===id?{...i,qty:Math.max(1,Math.min(max,qty))}:i));
  };
  const quitar=(id:string)=>setItems(p=>p.filter(i=>i.articuloId!==id));
  const totalPzas=items.reduce((s,i)=>s+i.qty,0);
  const folio=siguienteFolio(movimientos,"traslado");
  const nombreOrigen=bodegas.find(b=>b.id===origen)?.nombre||"";
  const nombreDestino=bodegas.find(b=>b.id===destino)?.nombre||"";

  const confirmar=()=>{
    if(origen===destino||items.length===0) return;
    setArticulos(prev=>{
      let next=[...prev];
      items.forEach(linea=>{
        const art=next.find(a=>a.id===linea.articuloId)!;
        next=next.map(a=>a.id===art.id?{...a,stock:Math.max(0,a.stock-linea.qty)}:a);
        const contraparte=next.find(a=>a.nombre===art.nombre&&a.bodegaId===destino);
        if(contraparte){
          next=next.map(a=>a.id===contraparte.id?{...a,stock:a.stock+linea.qty}:a);
        } else {
          next=[...next,{...art,id:`${art.id}-${destino}`,bodegaId:destino,stock:linea.qty}];
        }
      });
      return next;
    });
    const nuevos:MovimientoInventario[]=items.map((i,idx)=>{
      const a=articulos.find(x=>x.id===i.articuloId)!;
      return {id:idx===0?folio:`${folio}-${idx+1}`,tipo:"traslado",articuloId:i.articuloId,cantidad:i.qty,bodegaId:origen,bodegaDestinoId:destino,
        costoUnitario:a.costoUnitario,contraparte:`→ ${nombreDestino}`,fecha:hoy(),usuario:responsable,motivo};
    });
    setMovimientos(prev=>[...nuevos,...prev]);
    alert(`✅ Traslado ${folio} registrado.\n\nDe: ${nombreOrigen}\nHacia: ${nombreDestino}\n${items.length} artículos · ${totalPzas} unidades`);
    setView("existencias");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Traslado entre Bodegas</div><div className="page-subtitle">Movimiento de stock con trazabilidad completa · Multi-bodega · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Origen y Destino</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Bodega Origen</div>
                <select className="form-control" value={origen} onChange={e=>{setOrigen(e.target.value);setItems([]);}}>
                  {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div style={{textAlign:"center",fontSize:24,color:"#E8611A"}}>→</div>
              <div>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Bodega Destino</div>
                <select className="form-control" value={destino} onChange={e=>setDestino(e.target.value)}>
                  {bodegas.filter(b=>b.id!==origen).map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
            </div>
            {origen===destino&&<div className="alert-warn" style={{fontSize:12}}>⚠ El origen y destino no pueden ser iguales.</div>}
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos a Trasladar</div>
            <div style={{position:"relative",marginBottom:10}}>
              <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              {busqueda&&candidatos.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,marginTop:4,zIndex:5,maxHeight:200,overflow:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                  {candidatos.slice(0,8).map(a=>(
                    <div key={a.id} onClick={()=>agregar(a)} style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,borderBottom:"1px solid #F3F4F6"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"}>
                      <b>{a.id}</b> — {a.nombre} <span style={{color:"#10B981"}}>({a.stock} disp.)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Stock en {nombreOrigen}</th><th>Cantidad</th><th></th></tr></thead>
              <tbody>
                {items.map(item=>{
                  const a=articulos.find(x=>x.id===item.articuloId)!;
                  return (
                  <tr key={item.articuloId}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
                    <td style={{fontSize:12.5}}>{a.nombre}</td>
                    <td><span style={{color:"#10B981",fontWeight:600}}>{a.stock} {a.unidad}</span></td>
                    <td><input type="number" className="form-control" value={item.qty} min={1} max={a.stock} style={{width:60}} onChange={e=>actualizar(item.articuloId,parseInt(e.target.value)||1)}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>quitar(item.articuloId)}>✕</button></td>
                  </tr>
                  );
                })}
                {items.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"#9CA3AF",padding:14}}>Busca y agrega artículos con stock en {nombreOrigen}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-title">Datos del Traslado</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Responsable del Traslado</label><select className="form-control" value={responsable} onChange={e=>setResponsable(e.target.value)}>{catalogos.responsablesAutorizados.map(r=><option key={r.id}>{r.nombre}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Fecha programada</label><input type="date" className="form-control"/></div>
            </div>
            <div className="form-group"><label className="form-label">Motivo</label><textarea className="form-control" rows={2} placeholder="Motivo del traslado..." value={motivo} onChange={e=>setMotivo(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"linear-gradient(135deg,#1B1F2E,#2D3348)",border:"none"}}>
            <div style={{color:"rgba(255,255,255,.6)",fontSize:11,marginBottom:8}}>Visualización de traslado</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,padding:"10px 12px",background:"rgba(255,255,255,.08)",borderRadius:8,border:"1px solid rgba(255,255,255,.12)"}}>
                <div style={{fontSize:18}}>🏭</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>{nombreOrigen}</div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>↓ {totalPzas} Uds.</div>
              </div>
              <div style={{fontSize:20,color:"#E8611A",flexShrink:0}}>➡</div>
              <div style={{flex:1,padding:"10px 12px",background:"rgba(232,97,26,.15)",borderRadius:8,border:"1px solid rgba(232,97,26,.3)"}}>
                <div style={{fontSize:18}}>🏭</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:4}}>{nombreDestino}</div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>↑ {totalPzas} Uds.</div>
              </div>
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length}</span></div>
            <div className="res-row"><span className="res-label">Total Uds.</span><span className="res-val">{totalPzas}</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={origen===destino||items.length===0} onClick={confirmar}>🏭 Confirmar Traslado</button>
          </div>
        </div>
      </div>
    </div>
  );
}
