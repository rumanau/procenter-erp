import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario } from "../../types";
import { siguienteFolio } from "../../data/inventario";

const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function AjusteInventario({setView,articulos,setArticulos,movimientos,setMovimientos}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>}) {
  const [tipoAjuste,setTipoAjuste]=useState<"incremento"|"decremento"|"correccion">("incremento");
  const [busqueda,setBusqueda]=useState("");
  const [articuloId,setArticuloId]=useState<string|null>(null);
  const [cantidad,setCantidad]=useState(0);
  const [stockReal,setStockReal]=useState(0);
  const [motivo,setMotivo]=useState("Resultado de conteo físico");
  const [descripcion,setDescripcion]=useState("");

  const ajustesTipo=[
    {id:"incremento",icon:"↑",label:"Incremento",color:"#10B981",bg:"#ECFDF5",border:"#6EE7B7"},
    {id:"decremento",icon:"↓",label:"Decremento",color:"#EF4444",bg:"#FEF2F2",border:"#FCA5A5"},
    {id:"correccion",icon:"⚖️",label:"Corrección General",color:"#3B82F6",bg:"#EFF6FF",border:"#BFDBFE"},
  ] as const;
  const motivosAjuste=["Resultado de conteo físico","Daño o merma descubierta","Error de registro previo","Devolución interna","Ajuste de auditoría","Otro"];

  const candidatos=articulos.filter(a=>a.activo&&!articuloId&&(busqueda===""?false:`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));
  const art=articulos.find(a=>a.id===articuloId)||null;
  const seleccionar=(a:Articulo)=>{setArticuloId(a.id);setBusqueda(`${a.id} — ${a.nombre}`);setStockReal(a.stock);setCantidad(0);};

  const diferencia=tipoAjuste==="correccion"?(art?stockReal-art.stock:0):(tipoAjuste==="incremento"?cantidad:-cantidad);
  const folio=siguienteFolio(movimientos,"ajuste");
  const listo=!!art&&diferencia!==0;

  const confirmar=()=>{
    if(!art||!listo) return;
    setArticulos(prev=>prev.map(a=>a.id===art.id?{...a,stock:Math.max(0,a.stock+diferencia)}:a));
    setMovimientos(prev=>[{id:folio,tipo:"ajuste",articuloId:art.id,cantidad:diferencia,bodegaId:art.bodegaId,costoUnitario:art.costoUnitario,contraparte:motivo,fecha:hoy(),usuario:"Ronald",motivo:descripcion||motivo},...prev]);
    alert(`✅ Ajuste ${folio} enviado a aprobación.\n\nArtículo: ${art.nombre}\nDiferencia: ${diferencia>0?"+":""}${diferencia} ${art.unidad}\nEl supervisor de inventario fue notificado.`);
    setView("existencias");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Ajuste de Inventario</div><div className="page-subtitle">Correcciones aprobadas · Doble autorización · ISO 9001 §8.5</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Tipo de Ajuste</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {ajustesTipo.map(t=>(
                <div key={t.id} onClick={()=>setTipoAjuste(t.id)}
                  style={{flex:1,padding:"12px 8px",borderRadius:9,border:`2px solid ${tipoAjuste===t.id?t.color:t.border}`,background:tipoAjuste===t.id?t.bg:"#fff",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:20,color:t.color}}>{t.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:tipoAjuste===t.id?t.color:"#374151",marginTop:4}}>{t.label}</div>
                </div>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Artículo</label>
              <div style={{position:"relative"}}>
                <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>{setBusqueda(e.target.value);setArticuloId(null);}} placeholder="Buscar por código o nombre..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
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
            {art&&<div className="g2">
              <div className="form-group"><label className="form-label">Stock Actual (sistema)</label><input className="form-control" value={art.stock} readOnly style={{background:"#F9FAFB"}}/></div>
              <div className="form-group"><label className="form-label">{tipoAjuste==="correccion"?"Stock Real (físico)":"Cantidad a Ajustar"}</label>
                <input type="number" className="form-control" min={0} value={tipoAjuste==="correccion"?stockReal:cantidad} onChange={e=>tipoAjuste==="correccion"?setStockReal(Math.max(0,parseInt(e.target.value)||0)):setCantidad(Math.max(0,parseInt(e.target.value)||0))}/>
              </div>
            </div>}
            {art&&<div className="card" style={{background:"#EFF6FF",border:"1px solid #BFDBFE",marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#6B7280"}}>Diferencia calculada:</span>
                <span style={{fontWeight:700,color:diferencia===0?"#1D4ED8":diferencia>0?"#10B981":"#EF4444"}}>{diferencia>0?"+":""}{diferencia} {art.unidad}{diferencia===0?" (sin cambio)":""}</span>
              </div>
            </div>}
          </div>
          <div className="card">
            <div className="card-title">Documentación del Ajuste</div>
            <div className="form-group"><label className="form-label">Motivo del Ajuste</label>
              <select className="form-control" value={motivo} onChange={e=>setMotivo(e.target.value)}>{motivosAjuste.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Descripción / Justificación</label><textarea className="form-control" rows={3} placeholder="Detalla el motivo del ajuste para el registro ISO 9001..." value={descripcion} onChange={e=>setDescripcion(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#92400E",marginBottom:6}}>⚠ Ajuste requiere doble autorización</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[["🔵","Supervisor de Inventario","Jules Ramirez","Revisión"],["✅","Director de Operaciones","Ronald","Aprobación final"]].map(([ic,rol,nom,est])=>(
                <div key={rol} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#fff",borderRadius:7,border:"1px solid #FDE68A"}}>
                  <span style={{fontSize:16}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{nom}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{rol}</div></div>
                  <span style={{fontSize:11,color:"#92400E"}}>{est}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen del Ajuste</div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val" style={{color:ajustesTipo.find(t=>t.id===tipoAjuste)?.color}}>{ajustesTipo.find(t=>t.id===tipoAjuste)?.label}</span></div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Fecha</span><span className="res-val">{hoy()}</span></div>
            <div className="res-row"><span className="res-label">ISO 9001</span><span className="badge badge-ok">§8.5 Cumple</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!listo} onClick={confirmar}>⚖️ Enviar a Aprobación</button>
          </div>
        </div>
      </div>
    </div>
  );
}
