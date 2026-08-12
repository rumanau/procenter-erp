import React, { useState } from "react";
import type { View, OrdenCompra, ProveedorInventario, Bodega, Articulo, MovimientoInventario, Factura, EstadoOC, Recepcion, LineaRecepcion, MotivoRechazo, EvaluacionServicio, DevolucionProveedor } from "../../types";
import { totalOC, siguienteFolioRecepcion, resumenRecepcionOC, diasDiferenciaEntrega, nivelAprobacion, type ResumenLineaRecepcion } from "../../data/proveeduria";
import { siguienteFolio } from "../../data/inventario";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});
const fmtFecha=(d:Date)=>d.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});
const MOTIVOS_RECHAZO:MotivoRechazo[]=["Producto defectuoso","Especificación incorrecta","Daño de transporte","Producto equivocado","Empaque deficiente","Otro"];

export function OrdenesCompra({setView,ordenesCompra,setOrdenesCompra,proveedores,bodegas,articulos,setArticulos,movimientos,setMovimientos,facturasCxp,setFacturasCxp,recepciones,setRecepciones,evaluacionesServicio,setEvaluacionesServicio,devoluciones,setDevoluciones}:{
  setView:(v:View)=>void;ordenesCompra:OrdenCompra[];setOrdenesCompra:React.Dispatch<React.SetStateAction<OrdenCompra[]>>;
  proveedores:ProveedorInventario[];bodegas:Bodega[];articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;
  movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;
  facturasCxp:Factura[];setFacturasCxp:React.Dispatch<React.SetStateAction<Factura[]>>;
  recepciones:Recepcion[];setRecepciones:React.Dispatch<React.SetStateAction<Recepcion[]>>;
  evaluacionesServicio:EvaluacionServicio[];setEvaluacionesServicio:React.Dispatch<React.SetStateAction<EvaluacionServicio[]>>;
  devoluciones:DevolucionProveedor[];setDevoluciones:React.Dispatch<React.SetStateAction<DevolucionProveedor[]>>;
}) {
  const [filtro,setFiltro]=useState<EstadoOC|"">("");
  const [selId,setSelId]=useState<string|null>(null);
  const [modalRecepcion,setModalRecepcion]=useState<OrdenCompra|null>(null);
  const [modalServicio,setModalServicio]=useState<OrdenCompra|null>(null);

  const provNom=(id:string)=>proveedores.find(p=>p.id===id)?.nombre||id;
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;
  const artNom=(id:string)=>articulos.find(a=>a.id===id)?.nombre||id;

  const ordenadas=[...ordenesCompra].sort((a,b)=>b.id.localeCompare(a.id));
  const filtradas=ordenadas.filter(o=>filtro===""||o.estado===filtro);
  const sel=ordenesCompra.find(o=>o.id===selId)||null;
  const proveedorSel=sel?proveedores.find(p=>p.id===sel.proveedorId):null;
  const recepcionesDeSel=sel?recepciones.filter(r=>r.ordenCompraId===sel.id).sort((a,b)=>b.id.localeCompare(a.id)):[];
  const diasDif=sel?diasDiferenciaEntrega(sel):null;

  const badgeCl=(e:EstadoOC)=>e==="Facturada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Recibida"?"badge-info":e==="Parcialmente Recibida"?"badge-warn":e==="Enviada"?"badge-warn":e==="Pendiente Aprobación"?"badge-purple":"badge-gray";

  const enviar=(oc:OrdenCompra)=>{
    const nivel=nivelAprobacion(totalOC(oc));
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:nivel==="Ninguno"?"Enviada":"Pendiente Aprobación"}:o));
  };

  const aprobar=(oc:OrdenCompra)=>{
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Enviada",aprobadoPor:"Ronald",fechaAprobacion:hoy()}:o));
    alert(`✅ Orden ${oc.id} aprobada y enviada al proveedor.`);
  };

  const confirmarRecepcion=(oc:OrdenCompra,fecha:string,lineas:LineaRecepcion[],observaciones:string)=>{
    const proveedor=proveedores.find(p=>p.id===oc.proveedorId);
    const folioRec=siguienteFolioRecepcion(recepciones);
    const nuevaRecepcion:Recepcion={id:folioRec,ordenCompraId:oc.id,fecha,lineas,observaciones:observaciones||undefined,recibidoPor:"Ronald"};

    setArticulos(prev=>prev.map(a=>{
      const l=lineas.find(x=>x.articuloId===a.id);
      return l&&l.cantidadAceptada>0?{...a,stock:a.stock+l.cantidadAceptada}:a;
    }));

    const aceptadas=lineas.filter(l=>l.cantidadAceptada>0);
    if(aceptadas.length>0){
      const folioMov=siguienteFolio(movimientos,"entrada");
      const nuevosMovs:MovimientoInventario[]=aceptadas.map((l,idx)=>{
        const linOC=oc.lineas.find(x=>x.articuloId===l.articuloId)!;
        return {id:idx===0?folioMov:`${folioMov}-${idx+1}`,tipo:"entrada",articuloId:l.articuloId,cantidad:l.cantidadAceptada,bodegaId:oc.bodegaId,
          costoUnitario:linOC.costoUnitario,contraparte:proveedor?.nombre||"—",fecha,usuario:"Ronald",referencia:`${oc.id} · ${folioRec}`};
      });
      setMovimientos(prev=>[...nuevosMovs,...prev]);
    }

    setRecepciones(prev=>[nuevaRecepcion,...prev]);

    const rechazadas=lineas.filter(l=>l.cantidadRechazada>0);
    if(rechazadas.length>0){
      let seq=devoluciones.length;
      const nuevasDevoluciones:DevolucionProveedor[]=rechazadas.map(l=>{
        seq++;
        return {id:`DEV-PROV-${String(seq).padStart(4,"0")}`,proveedorId:oc.proveedorId,ordenCompraId:oc.id,recepcionId:folioRec,
          articuloId:l.articuloId,cantidad:l.cantidadRechazada,motivo:l.motivoRechazo||"Otro",fecha,estado:"Pendiente"};
      });
      setDevoluciones(prev=>[...nuevasDevoluciones,...prev]);
    }

    const resumenPrevio=resumenRecepcionOC(oc,recepciones);
    const completa=resumenPrevio.every(r=>{
      const li=lineas.find(x=>x.articuloId===r.articuloId);
      return r.recibido+(li?li.cantidadRecibida:0)>=r.solicitado;
    });
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:completa?"Recibida":"Parcialmente Recibida",fechaRecepcion:completa?fecha:o.fechaRecepcion}:o));

    const totalAceptado=lineas.reduce((s,l)=>s+l.cantidadAceptada,0);
    const totalRechazado=lineas.reduce((s,l)=>s+l.cantidadRechazada,0);
    alert(`✅ Recepción ${folioRec} registrada.\n\n${totalAceptado} unidad(es) aceptada(s)${totalRechazado>0?`, ${totalRechazado} rechazada(s)`:""}.\nEstado de la orden: ${completa?"Recibida completa":"Parcialmente Recibida"}.`);
    setModalRecepcion(null);
    setModalServicio(oc);
  };

  const guardarServicio=(oc:OrdenCompra,atencion:number,respuesta:number,cumplimientoComercial:number,observaciones:string)=>{
    const nueva:EvaluacionServicio={id:`SERV-${Date.now()}`,proveedorId:oc.proveedorId,ordenCompraId:oc.id,atencion,respuesta,cumplimientoComercial,observaciones:observaciones||undefined,fecha:hoy()};
    setEvaluacionesServicio(prev=>[...prev,nueva]);
    setModalServicio(null);
  };

  const facturar=(oc:OrdenCompra)=>{
    const proveedor=proveedores.find(p=>p.id===oc.proveedorId);
    if(!proveedor) return;
    const monto=totalOC(oc);
    const dias=parseInt(proveedor.condicion)||0;
    const emision=new Date();
    const venc=new Date(emision);
    venc.setDate(venc.getDate()+dias);
    const facturaId=`PROV-${1200+facturasCxp.length}`;
    const nuevaFactura:Factura={id:facturaId,tipo:"cxp",contraparte:proveedor.nombre,cedula:proveedor.cedulaJuridica,fechaEmision:fmtFecha(emision),fechaVencimiento:fmtFecha(venc),moneda:"CRC",monto,saldo:monto,estado:"pendiente"};
    setFacturasCxp(prev=>[nuevaFactura,...prev]);
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Facturada",facturaId}:o));
    alert(`✅ Factura ${facturaId} generada en Cuentas por Pagar.\n\nProveedor: ${proveedor.nombre}\nMonto: ${fmt(monto)}\nVence: ${fmtFecha(venc)}`);
  };

  const cancelar=(oc:OrdenCompra)=>{
    if(!window.confirm(`¿Cancelar la orden ${oc.id}? Esta acción no se puede deshacer.`)) return;
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Cancelada"}:o));
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div><div className="page-title">Órdenes de Compra</div><div className="page-subtitle">Ciclo completo: Borrador → Enviada → Recibida (parcial o total) → Facturada</div></div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("nueva-oc")}>➕ Nueva OC</button>
          </div>
        </div>
        <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {(["","Borrador","Pendiente Aprobación","Enviada","Parcialmente Recibida","Recibida","Facturada","Cancelada"] as const).map(e=>(
              <span key={e||"todas"} className={`badge ${filtro===e?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>setFiltro(e)}>{e||"Todas"} {e&&`(${ordenesCompra.filter(o=>o.estado===e).length})`}</span>
            ))}
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Folio</th><th>Proveedor</th><th>Bodega</th><th>Fecha</th><th>Estado</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {filtradas.map(oc=>(
                <tr key={oc.id} onClick={()=>setSelId(oc.id)} style={{cursor:"pointer",background:selId===oc.id?"#FFFBF5":""}}>
                  <td><b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{oc.id}</b></td>
                  <td style={{fontSize:12.5}}>{provNom(oc.proveedorId)}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{bodNom(oc.bodegaId)}</td>
                  <td style={{fontSize:12}}>{oc.fecha}</td>
                  <td><span className={`badge ${badgeCl(oc.estado)}`}>{oc.estado}</span></td>
                  <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(totalOC(oc))}</td>
                  <td><button className="btn btn-ghost btn-sm">👁</button></td>
                </tr>
              ))}
              {filtradas.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin órdenes para este filtro</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {sel&&(
        <div style={{width:340,background:"#fff",borderLeft:"1px solid #E5E7EB",padding:16,overflow:"auto",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>Detalle de Orden</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelId(null)}>✕</button>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{sel.id}</span></div>
            <div className="res-row"><span className="res-label">Proveedor</span><span className="res-val">{proveedorSel?.nombre}</span></div>
            <div className="res-row"><span className="res-label">Bodega destino</span><span className="res-val">{bodNom(sel.bodegaId)}</span></div>
            <div className="res-row"><span className="res-label">Fecha OC</span><span className="res-val">{sel.fecha}</span></div>
            {sel.centroCosto&&<div className="res-row"><span className="res-label">Centro de costo</span><span className="res-val">{sel.centroCosto}</span></div>}
            {sel.proyecto&&<div className="res-row"><span className="res-label">Proyecto</span><span className="res-val">{sel.proyecto}</span></div>}
            <div className="res-row"><span className="res-label">Moneda</span><span className="res-val">{sel.moneda||"CRC"}</span></div>
            <div className="res-row"><span className="res-label">Comprador</span><span className="res-val">{sel.creadoPor}</span></div>
            {sel.fechaRequerida&&<div className="res-row"><span className="res-label">Fecha requerida</span><span className="res-val">{sel.fechaRequerida}</span></div>}
            {sel.fechaEntregaEsperada&&<div className="res-row"><span className="res-label">Comprometida por proveedor</span><span className="res-val">{sel.fechaEntregaEsperada}</span></div>}
            {sel.fechaRecepcion&&<div className="res-row"><span className="res-label">Recibida completa el</span><span className="res-val">{sel.fechaRecepcion}</span></div>}
            {sel.aprobadoPor&&<div className="res-row"><span className="res-label">Aprobada por</span><span className="res-val">{sel.aprobadoPor} · {sel.fechaAprobacion}</span></div>}
            {diasDif!==null&&(
              <div className="res-row"><span className="res-label">Resultado</span>
                <span className="res-val" style={{color:diasDif>0?"#EF4444":diasDif<0?"#10B981":"#10B981",fontWeight:700}}>
                  {diasDif>0?`🔴 ${diasDif} día(s) tarde`:diasDif<0?`🟢 ${Math.abs(diasDif)} día(s) adelantado`:"🟢 A tiempo"}
                </span>
              </div>
            )}
            <div className="res-row"><span className="res-label">Estado</span><span className={`badge ${badgeCl(sel.estado)}`}>{sel.estado}</span></div>
            {sel.facturaId&&<div className="res-row"><span className="res-label">Factura CxP</span><span className="res-val" style={{color:"#10B981"}}>{sel.facturaId}</span></div>}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:8}}>ARTÍCULOS ({sel.lineas.length})</div>
          {sel.lineas.map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{artNom(l.articuloId)}</div>
                <div style={{fontSize:10.5,color:"#6B7280"}}>{l.cantidad} × {fmt(l.costoUnitario)}</div>
              </div>
              <div style={{fontWeight:700,color:"#E8611A"}}>{fmt(l.cantidad*l.costoUnitario)}</div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700,fontSize:13}}>
            <span>Total</span><span style={{color:"#E8611A"}}>{fmt(totalOC(sel))}</span>
          </div>

          {recepcionesDeSel.length>0&&<div style={{marginTop:6,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:6}}>RECEPCIONES REGISTRADAS ({recepcionesDeSel.length})</div>
            {recepcionesDeSel.map(r=>{
              const aceptado=r.lineas.reduce((s,l)=>s+l.cantidadAceptada,0);
              const rechazado=r.lineas.reduce((s,l)=>s+l.cantidadRechazada,0);
              return (
                <div key={r.id} style={{padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:11}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <b style={{fontFamily:"monospace",color:"#3B82F6"}}>{r.id}</b><span style={{color:"#6B7280"}}>{r.fecha}</span>
                  </div>
                  <div style={{color:"#374151"}}>{aceptado} aceptada(s){rechazado>0&&<span style={{color:"#EF4444"}}> · {rechazado} rechazada(s)</span>}</div>
                </div>
              );
            })}
          </div>}

          {sel.estado==="Pendiente Aprobación"&&(
            <div className="card" style={{marginBottom:10,background:"#F5F3FF",border:"1px solid #C4B5FD"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#5B21B6"}}>⏳ Requiere aprobación de {nivelAprobacion(totalOC(sel))}</div>
              <div style={{fontSize:11,color:"#5B21B6"}}>Monto {fmt(totalOC(sel))} supera el límite de compra directa (₡250.000).</div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
            {sel.estado==="Borrador"&&<button className="btn btn-primary btn-sm" onClick={()=>enviar(sel)}>📨 Enviar al Proveedor</button>}
            {sel.estado==="Pendiente Aprobación"&&<button className="btn btn-success btn-sm" onClick={()=>aprobar(sel)}>✅ Aprobar y Enviar</button>}
            {(sel.estado==="Enviada"||sel.estado==="Parcialmente Recibida")&&<button className="btn btn-primary btn-sm" onClick={()=>setModalRecepcion(sel)}>📦 Registrar Recepción</button>}
            {sel.estado==="Recibida"&&<button className="btn btn-success btn-sm" onClick={()=>facturar(sel)}>🧾 Generar Factura (CxP)</button>}
            {sel.estado==="Facturada"&&<button className="btn btn-secondary btn-sm" onClick={()=>setView("cxp")}>💳 Ver en Cuentas por Pagar</button>}
            {(sel.estado==="Borrador"||sel.estado==="Enviada"||sel.estado==="Pendiente Aprobación")&&<button className="btn btn-ghost btn-sm" onClick={()=>cancelar(sel)}>✕ Cancelar Orden</button>}
          </div>
        </div>
      )}

      {modalRecepcion&&(
        <RegistrarRecepcionModal
          oc={modalRecepcion}
          resumen={resumenRecepcionOC(modalRecepcion,recepciones)}
          articulos={articulos}
          onConfirmar={(fecha,lineas,obs)=>confirmarRecepcion(modalRecepcion,fecha,lineas,obs)}
          onCerrar={()=>setModalRecepcion(null)}
        />
      )}

      {modalServicio&&(
        <EvaluarServicioModal
          oc={modalServicio}
          proveedorNombre={provNom(modalServicio.proveedorId)}
          onGuardar={(atencion,respuesta,cumplimiento,obs)=>guardarServicio(modalServicio,atencion,respuesta,cumplimiento,obs)}
          onOmitir={()=>setModalServicio(null)}
        />
      )}
    </div>
  );
}

function Estrellas({valor,onChange}:{valor:number;onChange:(v:number)=>void}) {
  return (
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} onClick={()=>onChange(n)} style={{cursor:"pointer",fontSize:20,color:n<=valor?"#F59E0B":"#E5E7EB"}}>★</span>
      ))}
    </div>
  );
}

function EvaluarServicioModal({oc,proveedorNombre,onGuardar,onOmitir}:{
  oc:OrdenCompra;proveedorNombre:string;onGuardar:(atencion:number,respuesta:number,cumplimiento:number,observaciones:string)=>void;onOmitir:()=>void;
}) {
  const [atencion,setAtencion]=useState(4);
  const [respuesta,setRespuesta]=useState(4);
  const [cumplimiento,setCumplimiento]=useState(4);
  const [observaciones,setObservaciones]=useState("");

  return (
    <div className="modal-overlay" onClick={onOmitir}>
      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Evaluar servicio del proveedor</div><div className="modal-sub">{proveedorNombre} · {oc.id} · opcional</div></div>
          <div className="modal-close" onClick={onOmitir}>✕</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontSize:12.5,fontWeight:600,marginBottom:6}}>Atención y comunicación</div>
            <Estrellas valor={atencion} onChange={setAtencion}/>
          </div>
          <div>
            <div style={{fontSize:12.5,fontWeight:600,marginBottom:6}}>Respuesta ante problemas</div>
            <Estrellas valor={respuesta} onChange={setRespuesta}/>
          </div>
          <div>
            <div style={{fontSize:12.5,fontWeight:600,marginBottom:6}}>Cumplimiento comercial</div>
            <Estrellas valor={cumplimiento} onChange={setCumplimiento}/>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">Observaciones</label>
            <textarea className="form-control" rows={2} value={observaciones} onChange={e=>setObservaciones(e.target.value)} placeholder="Ej: Respondió rápidamente al faltante de unidades."/>
          </div>
        </div>
        <div style={{fontSize:10,color:"#9CA3AF",marginTop:10}}>Esta calificación pesa solo el 15% de la evaluación total del proveedor — el resto se calcula de datos reales de compras.</div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
          <button className="btn btn-ghost" onClick={onOmitir}>Omitir</button>
          <button className="btn btn-primary" onClick={()=>onGuardar(atencion,respuesta,cumplimiento,observaciones)}>Guardar Evaluación</button>
        </div>
      </div>
    </div>
  );
}

function RegistrarRecepcionModal({oc,resumen,articulos,onConfirmar,onCerrar}:{
  oc:OrdenCompra;resumen:ResumenLineaRecepcion[];articulos:Articulo[];
  onConfirmar:(fecha:string,lineas:LineaRecepcion[],observaciones:string)=>void;onCerrar:()=>void;
}) {
  const [fecha,setFecha]=useState(hoy());
  const [observaciones,setObservaciones]=useState("");
  const [valores,setValores]=useState<Record<string,{recibida:number;aceptada:number;motivo:MotivoRechazo}>>(()=>{
    const init:Record<string,{recibida:number;aceptada:number;motivo:MotivoRechazo}>={};
    resumen.forEach(r=>{init[r.articuloId]={recibida:r.pendiente,aceptada:r.pendiente,motivo:"Producto defectuoso"};});
    return init;
  });

  const setCampo=(articuloId:string,campo:"recibida"|"aceptada",val:number)=>{
    setValores(prev=>{
      const actual=prev[articuloId];
      const recibida=campo==="recibida"?Math.max(0,val):actual.recibida;
      const aceptada=campo==="aceptada"?Math.max(0,Math.min(val,recibida)):Math.min(actual.aceptada,recibida);
      return {...prev,[articuloId]:{...actual,recibida,aceptada}};
    });
  };
  const setMotivo=(articuloId:string,motivo:MotivoRechazo)=>setValores(prev=>({...prev,[articuloId]:{...prev[articuloId],motivo}}));

  const totalRecibiendo=Object.values(valores).reduce((s,v)=>s+v.recibida,0);
  const listo=totalRecibiendo>0;

  const confirmar=()=>{
    const lineas:LineaRecepcion[]=resumen.map(r=>{
      const v=valores[r.articuloId];
      const rechazada=Math.max(0,v.recibida-v.aceptada);
      return {articuloId:r.articuloId,cantidadRecibida:v.recibida,cantidadAceptada:v.aceptada,cantidadRechazada:rechazada,motivoRechazo:rechazada>0?v.motivo:undefined};
    }).filter(l=>l.cantidadRecibida>0);
    onConfirmar(fecha,lineas,observaciones);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:720}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Registrar Recepción — {oc.id}</div><div className="modal-sub">Cantidad recibida, aceptada y rechazada por artículo</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Artículo</th><th>Solicitado</th><th>Ya recibido</th><th>Pendiente</th><th>Recibiendo ahora</th><th>Aceptado</th><th>Motivo si rechaza</th></tr></thead>
          <tbody>
            {resumen.map(r=>{
              const v=valores[r.articuloId];
              const art=articulos.find(a=>a.id===r.articuloId);
              const rechazada=Math.max(0,v.recibida-v.aceptada);
              return (
                <tr key={r.articuloId}>
                  <td style={{fontSize:12}}>{art?.nombre||r.articuloId}</td>
                  <td>{r.solicitado}</td>
                  <td style={{color:"#6B7280"}}>{r.recibido}</td>
                  <td><b style={{color:r.pendiente>0?"#F59E0B":"#10B981"}}>{r.pendiente}</b></td>
                  <td><input type="number" className="form-control" style={{width:70}} min={0} max={r.pendiente} value={v.recibida} onChange={e=>setCampo(r.articuloId,"recibida",parseInt(e.target.value)||0)}/></td>
                  <td><input type="number" className="form-control" style={{width:70}} min={0} max={v.recibida} value={v.aceptada} onChange={e=>setCampo(r.articuloId,"aceptada",parseInt(e.target.value)||0)}/></td>
                  <td>
                    {rechazada>0?(
                      <select className="form-control" style={{fontSize:11}} value={v.motivo} onChange={e=>setMotivo(r.articuloId,e.target.value as MotivoRechazo)}>
                        {MOTIVOS_RECHAZO.map(m=><option key={m}>{m}</option>)}
                      </select>
                    ):<span style={{color:"#D1D5DB",fontSize:11}}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="g2" style={{marginTop:12}}>
          <div className="form-group"><label className="form-label">Fecha de recepción</label><input type="date" className="form-control" onChange={e=>{
            if(!e.target.value) return;
            const [y,m,d]=e.target.value.split("-");
            const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
            setFecha(`${d} ${meses[parseInt(m)-1]} ${y}`);
          }}/></div>
          <div className="form-group"><label className="form-label">Observaciones</label><input className="form-control" value={observaciones} onChange={e=>setObservaciones(e.target.value)} placeholder="Estado del embarque, incidencias..."/></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" disabled={!listo} onClick={confirmar}>📦 Confirmar Recepción</button>
        </div>
      </div>
    </div>
  );
}
