import React, { useState } from "react";
import type { View, ProveedorInventario, Bodega, Articulo, SolicitudCotizacion, OfertaProveedor, LineaOferta, OrdenCompra, Recepcion, EvaluacionServicio, LineaOC } from "../../types";
import { siguienteFolioOferta, siguienteFolioOC, recomendarOferta, totalOferta } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function Cotizaciones({setView,proveedores,bodegas,articulos,solicitudes,setSolicitudes,ofertas,setOfertas,ordenesCompra,setOrdenesCompra,recepciones,evaluacionesServicio}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];bodegas:Bodega[];articulos:Articulo[];
  solicitudes:SolicitudCotizacion[];setSolicitudes:React.Dispatch<React.SetStateAction<SolicitudCotizacion[]>>;
  ofertas:OfertaProveedor[];setOfertas:React.Dispatch<React.SetStateAction<OfertaProveedor[]>>;
  ordenesCompra:OrdenCompra[];setOrdenesCompra:React.Dispatch<React.SetStateAction<OrdenCompra[]>>;
  recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
}) {
  const [selId,setSelId]=useState<string|null>(null);
  const [modalOferta,setModalOferta]=useState<{rfq:SolicitudCotizacion;proveedorId:string}|null>(null);

  const provNom=(id:string)=>proveedores.find(p=>p.id===id)?.nombre||id;
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;
  const artNom=(id:string)=>articulos.find(a=>a.id===id)?.nombre||id;
  const badgeCl=(e:string)=>e==="Adjudicada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Con Ofertas"?"badge-info":"badge-warn";

  const ordenadas=[...solicitudes].sort((a,b)=>b.id.localeCompare(a.id));
  const sel=solicitudes.find(s=>s.id===selId)||null;
  const ofertasDeSel=sel?ofertas.filter(o=>o.rfqId===sel.id):[];
  const recomendaciones=sel?recomendarOferta(ofertasDeSel,sel,ordenesCompra,recepciones,evaluacionesServicio):[];
  const mejorId=recomendaciones[0]?.proveedorId;

  const registrarOferta=(rfq:SolicitudCotizacion,proveedorId:string,lineas:LineaOferta[],plazo:number,obs:string)=>{
    const folio=siguienteFolioOferta(ofertas);
    const nueva:OfertaProveedor={id:folio,rfqId:rfq.id,proveedorId,lineas,plazoEntregaDias:plazo,fecha:hoy(),observaciones:obs||undefined};
    setOfertas(prev=>[nueva,...prev]);
    if(rfq.estado==="Enviada") setSolicitudes(prev=>prev.map(s=>s.id===rfq.id?{...s,estado:"Con Ofertas"}:s));
    setModalOferta(null);
    alert(`✅ Oferta ${folio} registrada para ${provNom(proveedorId)}.`);
  };

  const adjudicar=(rfq:SolicitudCotizacion,proveedorId:string)=>{
    const oferta=ofertas.find(o=>o.rfqId===rfq.id&&o.proveedorId===proveedorId);
    if(!oferta) return;
    if(!window.confirm(`¿Adjudicar la cotización ${rfq.id} a ${provNom(proveedorId)}? Se creará una Orden de Compra real.`)) return;
    const folioOC=siguienteFolioOC(ordenesCompra);
    const lineasOC:LineaOC[]=rfq.lineas.map(l=>{
      const lo=oferta.lineas.find(x=>x.articuloId===l.articuloId);
      return {articuloId:l.articuloId,cantidad:l.cantidad,costoUnitario:lo?.costoUnitario||0};
    });
    const entrega=new Date();entrega.setDate(entrega.getDate()+oferta.plazoEntregaDias);
    const nuevaOC:OrdenCompra={
      id:folioOC,proveedorId,bodegaId:rfq.bodegaId,fecha:hoy(),fechaEntregaEsperada:entrega.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
      estado:"Enviada",lineas:lineasOC,observaciones:`Generada desde cotización ${rfq.id}`,creadoPor:"Ronald",
    };
    setOrdenesCompra(prev=>[nuevaOC,...prev]);
    setSolicitudes(prev=>prev.map(s=>s.id===rfq.id?{...s,estado:"Adjudicada",ordenCompraId:folioOC,proveedorAdjudicadoId:proveedorId}:s));
    alert(`✅ Cotización adjudicada a ${provNom(proveedorId)}.\n\nSe creó la Orden de Compra ${folioOC}.`);
  };

  return (
    <div className="content" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div className="page-header">
        <div><div className="page-title">Cotizaciones (RFQ)</div><div className="page-subtitle">Solicita ofertas a varios proveedores y compara antes de comprar</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setView("nueva-cotizacion")}>➕ Nueva Solicitud</button>
        </div>
      </div>

      <div style={{display:"flex",gap:14,flex:1,overflow:"hidden"}}>
        <div style={{width:340,flexShrink:0,overflow:"auto",paddingRight:2}}>
          {ordenadas.map(s=>{
            const nOfertas=ofertas.filter(o=>o.rfqId===s.id).length;
            return (
            <div key={s.id} className="card" onClick={()=>setSelId(s.id)} style={{marginBottom:8,cursor:"pointer",border:selId===s.id?"2px solid #E8611A":"1px solid #E5E7EB"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{s.id}</b>
                <span className={`badge ${badgeCl(s.estado)}`} style={{fontSize:9}}>{s.estado}</span>
              </div>
              <div style={{fontSize:11.5,color:"#374151"}}>{s.lineas.length} artículo(s) · {s.proveedorIds.length} invitado(s) · {nOfertas} oferta(s)</div>
              <div style={{fontSize:10,color:"#9CA3AF",marginTop:4}}>{s.fecha} · {bodNom(s.bodegaId)}</div>
            </div>
            );
          })}
          {ordenadas.length===0&&<div className="card" style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin solicitudes de cotización</div>}
        </div>

        {sel?(
          <div style={{flex:1,overflow:"auto"}}>
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:15,fontWeight:700}}>{sel.id}</div>
                <span className={`badge ${badgeCl(sel.estado)}`}>{sel.estado}</span>
              </div>
              <div style={{fontSize:11.5,color:"#6B7280",marginBottom:10}}>{sel.fecha} · Bodega: {bodNom(sel.bodegaId)}{sel.observaciones&&` · ${sel.observaciones}`}</div>
              <table className="tbl">
                <thead><tr><th>Artículo</th><th>Cantidad</th></tr></thead>
                <tbody>{sel.lineas.map(l=>(<tr key={l.articuloId}><td style={{fontSize:12}}>{artNom(l.articuloId)}</td><td>{l.cantidad}</td></tr>))}</tbody>
              </table>
            </div>

            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">Proveedores invitados</div>
              {sel.proveedorIds.map(pid=>{
                const oferta=ofertas.find(o=>o.rfqId===sel.id&&o.proveedorId===pid);
                return (
                  <div key={pid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                    <div style={{fontSize:12.5,fontWeight:600}}>{provNom(pid)}</div>
                    {oferta?
                      <span className="badge badge-ok">✓ Oferta recibida — {fmt(totalOferta(oferta,sel))}</span>
                      :sel.estado==="Adjudicada"?<span style={{fontSize:11,color:"#9CA3AF"}}>Sin oferta</span>
                      :<button className="btn btn-secondary btn-sm" onClick={()=>setModalOferta({rfq:sel,proveedorId:pid})}>📝 Registrar Oferta</button>}
                  </div>
                );
              })}
            </div>

            {recomendaciones.length>0&&(
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                <div className="card-title" style={{padding:"10px 14px",marginBottom:0,borderBottom:"1px solid #E5E7EB"}}>Comparación de ofertas</div>
                <table className="tbl">
                  <thead><tr><th>Proveedor</th><th>Total</th><th>Plazo</th><th>Evaluación</th><th>Score</th><th></th></tr></thead>
                  <tbody>
                    {recomendaciones.map(r=>(
                      <tr key={r.proveedorId} style={{background:r.proveedorId===mejorId?"#FFFBF5":""}}>
                        <td style={{fontSize:12,fontWeight:600}}>{provNom(r.proveedorId)}{r.proveedorId===mejorId&&<span style={{marginLeft:6}}>🏆</span>}</td>
                        <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(r.total)}</td>
                        <td>{r.plazoEntregaDias} días</td>
                        <td><span className="badge badge-info">{r.evaluacion.grado}</span> {r.evaluacion.puntaje}</td>
                        <td><b style={{color:r.proveedorId===mejorId?"#10B981":undefined}}>{r.score}</b></td>
                        <td>{sel.estado!=="Adjudicada"&&<button className="btn btn-primary btn-sm" onClick={()=>adjudicar(sel,r.proveedorId)}>Adjudicar</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mejorId&&sel.estado!=="Adjudicada"&&<div style={{padding:"8px 14px",fontSize:10.5,color:"#9CA3AF"}}>🏆 {provNom(mejorId)} tiene el mejor balance de precio, evaluación histórica y plazo — no necesariamente el más barato.</div>}
                {sel.estado==="Adjudicada"&&<div style={{padding:"8px 14px",fontSize:11,color:"#10B981"}}>✓ Adjudicada a {provNom(sel.proveedorAdjudicadoId!)} — Orden de Compra {sel.ordenCompraId} <button className="btn btn-ghost btn-sm" onClick={()=>setView("ordenes-compra")}>Ver OC →</button></div>}
              </div>
            )}
          </div>
        ):(
          <div className="card" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#9CA3AF"}}>Selecciona una solicitud de cotización</div>
        )}
      </div>

      {modalOferta&&(
        <RegistrarOfertaModal
          rfq={modalOferta.rfq}
          proveedorNombre={provNom(modalOferta.proveedorId)}
          articulos={articulos}
          onGuardar={(lineas,plazo,obs)=>registrarOferta(modalOferta.rfq,modalOferta.proveedorId,lineas,plazo,obs)}
          onCerrar={()=>setModalOferta(null)}
        />
      )}
    </div>
  );
}

function RegistrarOfertaModal({rfq,proveedorNombre,articulos,onGuardar,onCerrar}:{
  rfq:SolicitudCotizacion;proveedorNombre:string;articulos:Articulo[];
  onGuardar:(lineas:LineaOferta[],plazo:number,observaciones:string)=>void;onCerrar:()=>void;
}) {
  const [precios,setPrecios]=useState<Record<string,number>>(()=>{
    const init:Record<string,number>={};
    rfq.lineas.forEach(l=>{const a=articulos.find(x=>x.id===l.articuloId);init[l.articuloId]=a?.costoUnitario||0;});
    return init;
  });
  const [plazo,setPlazo]=useState(5);
  const [observaciones,setObservaciones]=useState("");

  const total=rfq.lineas.reduce((s,l)=>s+l.cantidad*(precios[l.articuloId]||0),0);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:600}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Registrar Oferta — {proveedorNombre}</div><div className="modal-sub">{rfq.id}</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Artículo</th><th>Cantidad</th><th>Costo unitario ofertado</th><th>Subtotal</th></tr></thead>
          <tbody>
            {rfq.lineas.map(l=>{
              const a=articulos.find(x=>x.id===l.articuloId);
              return (
                <tr key={l.articuloId}>
                  <td style={{fontSize:12}}>{a?.nombre||l.articuloId}</td>
                  <td>{l.cantidad}</td>
                  <td><input type="number" className="form-control" style={{width:100}} value={precios[l.articuloId]} min={0} onChange={e=>setPrecios(prev=>({...prev,[l.articuloId]:Math.max(0,parseFloat(e.target.value)||0)}))}/></td>
                  <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(l.cantidad*(precios[l.articuloId]||0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="g2" style={{marginTop:10}}>
          <div className="form-group"><label className="form-label">Plazo de entrega (días)</label><input type="number" className="form-control" value={plazo} min={1} onChange={e=>setPlazo(Math.max(1,parseInt(e.target.value)||1))}/></div>
          <div className="form-group"><label className="form-label">Total ofertado</label><div className="form-control" style={{background:"#F9FAFB",color:"#E8611A",fontWeight:700}}>{fmt(total)}</div></div>
        </div>
        <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={2} value={observaciones} onChange={e=>setObservaciones(e.target.value)}/></div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onGuardar(rfq.lineas.map(l=>({articuloId:l.articuloId,costoUnitario:precios[l.articuloId]||0})),plazo,observaciones)}>Guardar Oferta</button>
        </div>
      </div>
    </div>
  );
}
