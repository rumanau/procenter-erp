import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario } from "../../types";
import { siguienteFolio } from "../../data/inventario";

const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function BajaDescarte({setView,articulos,setArticulos,movimientos,setMovimientos}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>}) {
  const motivos=["Fin de vida útil","Daño irreparable","Caducidad / Vencimiento","Obsolescencia tecnológica","Norma / Regulación","Otro"];
  const metodos=["Descarte controlado","Donación","Venta como chatarra","Destrucción certificada","Devolución al proveedor"];

  const [busqueda,setBusqueda]=useState("");
  const [articuloId,setArticuloId]=useState<string|null>(null);
  const [cantidad,setCantidad]=useState(1);
  const [motivo,setMotivo]=useState(motivos[0]);
  const [metodo,setMetodo]=useState(metodos[0]);
  const [descripcion,setDescripcion]=useState("");

  const art=articulos.find(a=>a.id===articuloId)||null;
  const candidatos=articulos.filter(a=>a.activo&&a.stock>0&&!articuloId&&busqueda!==""&&`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase()));
  const seleccionar=(a:Articulo)=>{setArticuloId(a.id);setBusqueda(`${a.id} — ${a.nombre}`);setCantidad(1);};
  const folio=siguienteFolio(movimientos,"baja");
  const listo=!!art&&cantidad>0&&cantidad<=art.stock;

  const confirmar=()=>{
    if(!art||!listo) return;
    setArticulos(prev=>prev.map(a=>a.id===art.id?{...a,stock:Math.max(0,a.stock-cantidad)}:a));
    setMovimientos(prev=>[{id:folio,tipo:"baja",articuloId:art.id,cantidad:-cantidad,bodegaId:art.bodegaId,costoUnitario:art.costoUnitario,contraparte:metodo,fecha:hoy(),usuario:"Ronald",motivo:descripcion||motivo},...prev]);
    alert(`✅ Baja ${folio} enviada a aprobación dual.\nNotificaciones enviadas al encargado y director.`);
    setView("existencias");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Baja / Descarte de Artículo</div><div className="page-subtitle">Retiro definitivo con evidencia · Doble aprobación · ISO 9001 §8.5.4</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículo a Dar de Baja</div>
            <div className="form-group"><label className="form-label">Buscar Artículo</label>
              <div style={{position:"relative"}}>
                <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>{setBusqueda(e.target.value);setArticuloId(null);}} placeholder="Código o nombre del artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
                {!articuloId&&candidatos.length>0&&(
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,marginTop:4,zIndex:5,maxHeight:200,overflow:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                    {candidatos.slice(0,8).map(a=>(
                      <div key={a.id} onClick={()=>seleccionar(a)} style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,borderBottom:"1px solid #F3F4F6"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"}>
                        <b>{a.id}</b> — {a.nombre} <span style={{color:"#6B7280"}}>(stock: {a.stock})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {art&&<div style={{padding:"10px 12px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:12}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{fontSize:28}}>🔧</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>{art.nombre}</div>
                  <div style={{fontSize:11,color:"#6B7280"}}>{art.id} · {art.bodegaId}</div>
                  <div style={{fontSize:11,color:"#EF4444",fontWeight:600,marginTop:2}}>Stock: {art.stock} {art.unidad}</div>
                </div>
              </div>
            </div>}
            {art&&<div className="form-group"><label className="form-label">Cantidad a dar de baja</label><input type="number" className="form-control" value={cantidad} min={1} max={art.stock} onChange={e=>setCantidad(Math.max(1,Math.min(art.stock,parseInt(e.target.value)||1)))}/></div>}
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Motivo y Método</div>
            <div className="form-group"><label className="form-label">Motivo de la Baja</label>
              <select className="form-control" value={motivo} onChange={e=>setMotivo(e.target.value)}>{motivos.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Método de Descarte</label>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {metodos.map(m=>(
                  <label key={m} style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,cursor:"pointer"}}>
                    <input type="radio" name="metodo" checked={metodo===m} onChange={()=>setMetodo(m)}/>{m}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Descripción del estado físico</label><textarea className="form-control" rows={3} placeholder="Describe el estado del artículo y el motivo de la baja..." value={descripcion} onChange={e=>setDescripcion(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"#FEF2F2",border:"1px solid #FCA5A5"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"#991B1B",marginBottom:8}}>⚠ Acción Irreversible</div>
            <p style={{fontSize:12,color:"#374151",lineHeight:1.6}}>Una vez aprobada, la baja no puede revertirse. El artículo será retirado del inventario de forma permanente y quedará registrado en el historial de auditoría.</p>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Flujo de Aprobación (Doble)</div>
            {[["👤","Encargado Inventario","Jules Ramirez","Primera aprobación","#ECFDF5","#6EE7B7"],["✅","Director General","Ronald","Aprobación final","#EFF6FF","#BFDBFE"]].map(([ic,rol,nom,est,bg,bd])=>(
              <div key={rol} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:bg as string,borderRadius:7,border:`1px solid ${bd}`,marginBottom:6}}>
                <span style={{fontSize:16}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{nom}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{rol}</div></div>
                <span style={{fontSize:11,color:"#6B7280"}}>{est}</span>
              </div>
            ))}
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#EF4444"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">ISO</span><span className="badge badge-ok">§8.5.4 Cumple</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-danger" style={{width:"100%"}} disabled={!listo} onClick={confirmar}>🗑️ Solicitar Baja</button>
          </div>
        </div>
      </div>
    </div>
  );
}
