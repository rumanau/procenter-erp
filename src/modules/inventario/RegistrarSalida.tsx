import React, { useState } from "react";
import type { View, Articulo, MovimientoInventario, Bodega } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";
import { siguienteFolio } from "../../data/inventario";

interface Linea { articuloId:string; qty:number; }
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function RegistrarSalida({setView,articulos,setArticulos,movimientos,setMovimientos,bodegas,catalogos}:{setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;bodegas:Bodega[];catalogos:typeof CATALOGOS_INIT}) {
  const [tipo,setTipo]=useState("consumo");
  const [bodegaId,setBodegaId]=useState(bodegas[0]?.id||"");
  const [solicitante,setSolicitante]=useState(catalogos.responsablesAutorizados[0]?.nombre||"");
  const [motivo,setMotivo]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [items,setItems]=useState<Linea[]>([]);
  const [check,setCheck]=useState<Record<string,boolean>>({});

  const tiposSalida=[
    {id:"consumo",icon:"⚙️",label:"Consumo Operativo",bg:"#EFF6FF",border:"#BFDBFE",colorText:"#1D4ED8"},
    {id:"despacho",icon:"🚚",label:"Despacho",bg:"#ECFDF5",border:"#6EE7B7",colorText:"#065F46"},
    {id:"prestamo",icon:"🔄",label:"Préstamo",bg:"#FFF3ED",border:"#FED7AA",colorText:"#92400E"},
    {id:"muestra",icon:"🔬",label:"Muestra",bg:"#F5F3FF",border:"#C4B5FD",colorText:"#5B21B6"},
    {id:"merma",icon:"⚠️",label:"Merma",bg:"#FFFBEB",border:"#FDE68A",colorText:"#92400E"},
  ];
  const tipoActual=tiposSalida.find(t=>t.id===tipo)!;

  const candidatos=articulos.filter(a=>a.activo&&a.bodegaId===bodegaId&&a.stock>0&&!items.some(i=>i.articuloId===a.id)&&(busqueda===""||`${a.nombre} ${a.id}`.toLowerCase().includes(busqueda.toLowerCase())));
  const agregar=(a:Articulo)=>{setItems(p=>[...p,{articuloId:a.id,qty:1}]);setBusqueda("");};
  const actualizar=(id:string,qty:number)=>{
    const a=articulos.find(x=>x.id===id);
    const max=a?a.stock:1;
    setItems(p=>p.map(i=>i.articuloId===id?{...i,qty:Math.max(1,Math.min(max,qty))}:i));
  };
  const quitar=(id:string)=>setItems(p=>p.filter(i=>i.articuloId!==id));

  const folio=siguienteFolio(movimientos,"salida");
  const checklistItems=["Artículo físicamente disponible","Solicitante autorizado","Cantidad dentro del límite aprobado"];
  const listo=checklistItems.every(c=>check[c])&&items.length>0;

  const confirmar=()=>{
    if(!listo) return;
    setArticulos(prev=>prev.map(a=>{
      const linea=items.find(i=>i.articuloId===a.id);
      return linea?{...a,stock:Math.max(0,a.stock-linea.qty)}:a;
    }));
    const nuevos:MovimientoInventario[]=items.map((i,idx)=>{
      const a=articulos.find(x=>x.id===i.articuloId)!;
      return {id:idx===0?folio:`${folio}-${idx+1}`,tipo:"salida",articuloId:i.articuloId,cantidad:-i.qty,bodegaId,
        costoUnitario:a.costoUnitario,contraparte:tipoActual.label,fecha:hoy(),usuario:solicitante,motivo};
    });
    setMovimientos(prev=>[...nuevos,...prev]);
    alert(`✅ Salida registrada exitosamente!\n\nFolio: ${folio}\nTipo: ${tipoActual.label}\nArtículos: ${items.length} ítems despachados`);
    setView("existencias");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Registrar Salida</div><div className="page-subtitle">Despacho de artículos · Trazabilidad por tipo · ISO 9001 §8.5</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Tipo de Salida</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {tiposSalida.map(t=>(
            <div key={t.id} onClick={()=>setTipo(t.id)}
              style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${tipo===t.id?t.colorText:t.border}`,background:tipo===t.id?t.bg:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
              <span>{t.icon}</span>
              <span style={{fontSize:12.5,fontWeight:tipo===t.id?700:500,color:tipo===t.id?t.colorText:"#374151"}}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Bodega de Salida</div>
            <select className="form-control" value={bodegaId} onChange={e=>{setBodegaId(e.target.value);setItems([]);}}>
              {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos a Despachar</div>
            <div style={{position:"relative",marginBottom:10}}>
              <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar artículo o código..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
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
              <thead><tr><th>Código</th><th>Artículo</th><th>Disponible</th><th>Cantidad</th><th></th></tr></thead>
              <tbody>
                {items.map(item=>{
                  const a=articulos.find(x=>x.id===item.articuloId)!;
                  return (
                  <tr key={item.articuloId}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
                    <td style={{fontSize:12.5}}>{a.nombre}</td>
                    <td><span style={{color:a.stock>10?"#10B981":"#EF4444",fontWeight:600}}>{a.stock} {a.unidad}</span></td>
                    <td><input type="number" className="form-control" value={item.qty} min={1} max={a.stock} style={{width:60}} onChange={e=>actualizar(item.articuloId,parseInt(e.target.value)||1)}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>quitar(item.articuloId)}>✕</button></td>
                  </tr>
                  );
                })}
                {items.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"#9CA3AF",padding:14}}>Busca y agrega artículos con stock en {bodegas.find(b=>b.id===bodegaId)?.nombre}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Información General</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Solicitante</label>
                <select className="form-control" value={solicitante} onChange={e=>setSolicitante(e.target.value)}>
                  {catalogos.responsablesAutorizados.map(r=><option key={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Departamento / Proyecto</label><select className="form-control"><option>Mantenimiento</option><option>Producción</option><option>Administración</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Motivo / Descripción</label><textarea className="form-control" rows={3} placeholder="Describe el motivo de la salida..." value={motivo} onChange={e=>setMotivo(e.target.value)}/></div>
          </div>
        </div>
        <div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen de Salida</div>
            <div className="res-row"><span className="res-label">Tipo</span><span className="res-val" style={{color:tipoActual.colorText}}>{tipoActual.icon} {tipoActual.label}</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length} ítems</span></div>
            <div className="res-row"><span className="res-label">Número Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{folio}</span></div>
            <div className="res-row"><span className="res-label">Bodega</span><span className="res-val">{bodegas.find(b=>b.id===bodegaId)?.nombre}</span></div>
          </div>
          <div className="card" style={{marginBottom:12,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#92400E",marginBottom:6}}>⚠ Verificación requerida</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {checklistItems.map(c=>(
                <label key={c} style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5}}><input type="checkbox" checked={!!check[c]} onChange={()=>setCheck(p=>({...p,[c]:!p[c]}))}/>{c}</label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!listo} onClick={confirmar}>📤 Confirmar Salida</button>
          </div>
        </div>
      </div>
    </div>
  );
}
