import React, { useState } from "react";
import type { View, ProveedorInventario, Articulo, OrdenCompra, CategoriaInventario, Factura, ProveedorArticulo, DocumentoProveedor, Recepcion, EvaluacionServicio, DevolucionProveedor, AuditoriaProveedor, ContactoProveedor, CuentaBancariaProveedor, DireccionProveedor } from "../../types";
import { totalOC, parseFechaEsCR, calcularEvaluacion, estadoDocumento, descripcionGrado, homologacionEfectiva, documentosVencidosDe, descripcionHomologacion, badgeHomologacion, type EvaluacionProveedor, type EstadoHomologacionEfectivo } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});
type Tab="resumen"|"compras"|"desempeno"|"precios"|"catalogo"|"finanzas"|"documentos"|"devoluciones"|"historial";

export function ProveedorDetalle({proveedor,setView,onVolver,proveedores,setProveedores,articulos,ordenesCompra,categorias,facturasCxp,proveedorArticulos,documentosProveedor,setDocumentosProveedor,recepciones,evaluacionesServicio,devoluciones,setDevoluciones,auditoriaProveedores,setAuditoriaProveedores,onEliminado}:{
  proveedor:ProveedorInventario;setView:(v:View)=>void;onVolver:()=>void;
  proveedores:ProveedorInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;
  articulos:Articulo[];ordenesCompra:OrdenCompra[];categorias:CategoriaInventario[];facturasCxp:Factura[];
  proveedorArticulos:ProveedorArticulo[];documentosProveedor:DocumentoProveedor[];setDocumentosProveedor:React.Dispatch<React.SetStateAction<DocumentoProveedor[]>>;
  recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
  devoluciones:DevolucionProveedor[];setDevoluciones:React.Dispatch<React.SetStateAction<DevolucionProveedor[]>>;
  auditoriaProveedores:AuditoriaProveedor[];setAuditoriaProveedores:React.Dispatch<React.SetStateAction<AuditoriaProveedor[]>>;
  onEliminado:()=>void;
}) {
  const [tab,setTab]=useState<Tab>("resumen");
  const [menuAbierto,setMenuAbierto]=useState(false);
  const [modalEditar,setModalEditar]=useState(false);

  const items=articulos.filter(a=>a.activo&&a.proveedorId===proveedor.id);
  const ocs=ordenesCompra.filter(o=>o.proveedorId===proveedor.id);
  const ocsAbiertas=ocs.filter(o=>o.estado!=="Cancelada"&&o.estado!=="Facturada").length;
  const documentos=documentosProveedor.filter(d=>d.proveedorId===proveedor.id);
  const cxpPendiente=facturasCxp.reduce((s,f)=>s+f.saldo,0);
  const comprasYTD=ocs.filter(o=>o.estado!=="Cancelada"&&parseFechaEsCR(o.fecha).getFullYear()===new Date().getFullYear()).reduce((s,o)=>s+totalOC(o),0);
  const evaluacion=calcularEvaluacion(proveedor.id,ordenesCompra,recepciones,evaluacionesServicio);
  const homolog=homologacionEfectiva(proveedor,documentosProveedor);
  const puedeEliminar=items.length===0&&ocsAbiertas===0;

  const eliminar=()=>{
    if(!puedeEliminar) return;
    if(!window.confirm(`¿Eliminar a ${proveedor.nombre}? Esta acción no se puede deshacer.`)) return;
    setProveedores(prev=>prev.filter(p=>p.id!==proveedor.id));
    onEliminado();
  };

  const tabs:[Tab,string][]=[["resumen","Resumen"],["compras","Compras"],["desempeno","Desempeño"],["precios","Precios"],["catalogo","Catálogo"],["finanzas","Finanzas"],["documentos","📄 Documentos"],["devoluciones","↩️ Devoluciones"],["historial","Historial"]];

  return (
    <div className="content" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{marginBottom:8}}><button className="btn btn-ghost btn-sm" onClick={onVolver}>← Proveedores</button></div>

      <div className="card" style={{marginBottom:12,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>🏢 {proveedor.nombre}
              <span className="badge badge-info">{evaluacion.grado}</span>
              <span className={`badge ${badgeHomologacion(homolog)}`} title={descripcionHomologacion(homolog)}>{homolog==="Bloqueado"?"🚫 Bloqueado":homolog}</span>
              <span className={`badge ${proveedor.activo?"badge-ok":"badge-gray"}`}>{proveedor.activo?"Activo":"Inactivo"}</span>
            </div>
            <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{proveedor.cedulaJuridica} · {proveedor.contacto} · {proveedor.telefono}</div>
          </div>
          <div style={{display:"flex",gap:6,position:"relative"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("nueva-oc")}>➕ Nueva OC</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setMenuAbierto(p=>!p)}>Acciones ▾</button>
            {menuAbierto&&(
              <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,zIndex:10,minWidth:180,boxShadow:"0 4px 12px rgba(0,0,0,.12)",overflow:"hidden"}}>
                <div style={{padding:"9px 12px",fontSize:12.5,cursor:"pointer"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"} onClick={()=>{setMenuAbierto(false);setModalEditar(true);}}>✏️ Editar proveedor</div>
                <div style={{padding:"9px 12px",fontSize:12.5,cursor:puedeEliminar?"pointer":"not-allowed",color:puedeEliminar?"#EF4444":"#D1D5DB",borderTop:"1px solid #F3F4F6"}} title={!puedeEliminar?"Tiene artículos u OCs vinculados":""} onMouseOver={e=>puedeEliminar&&((e.currentTarget as HTMLDivElement).style.background="#FEF2F2")} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#fff"} onClick={()=>{if(puedeEliminar){setMenuAbierto(false);eliminar();}}}>🗑 Eliminar proveedor</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {homolog==="Bloqueado"&&(
        <div className="card" style={{marginBottom:12,background:"#FEF2F2",border:"1px solid #FECACA",flexShrink:0}}>
          <div style={{fontSize:12,fontWeight:700,color:"#991B1B",marginBottom:4}}>🚫 Proveedor bloqueado automáticamente</div>
          <div style={{fontSize:11,color:"#991B1B",marginBottom:6}}>No puede recibir nuevas Órdenes de Compra hasta regularizar los siguientes documentos vencidos:</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {documentosVencidosDe(proveedor.id,documentosProveedor).map(d=>(
              <span key={d.id} className="badge badge-crit" style={{fontSize:9.5}}>{d.nombre} — venció {d.vigenciaHasta}</span>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{marginTop:8}} onClick={()=>setTab("documentos")}>📄 Ir a Documentos</button>
        </div>
      )}

      <div className="tab-bar" style={{marginBottom:12,flexShrink:0}}>
        {tabs.map(([id,label])=>(
          <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{label}</div>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto"}}>
        {tab==="resumen"&&<ResumenTab proveedor={proveedor} comprasYTD={comprasYTD} cxpPendiente={cxpPendiente} ocAbiertas={ocsAbiertas} evaluacion={evaluacion} ocs={ocs} facturas={facturasCxp} devoluciones={devoluciones} documentos={documentos}/>}
        {tab==="compras"&&<ComprasTab ocs={ocs}/>}
        {tab==="desempeno"&&<DesempenoTab proveedor={proveedor} evaluacion={evaluacion}/>}
        {tab==="precios"&&<PreciosTab items={items} ordenesCompra={ocs} proveedorArticulos={proveedorArticulos} proveedores={proveedores}/>}
        {tab==="catalogo"&&<CatalogoTab items={items} categorias={categorias} proveedorArticulos={proveedorArticulos} proveedores={proveedores}/>}
        {tab==="finanzas"&&<FinanzasTab facturas={facturasCxp}/>}
        {tab==="documentos"&&<DocumentosTab documentos={documentos} proveedorId={proveedor.id} setDocumentosProveedor={setDocumentosProveedor}/>}
        {tab==="devoluciones"&&<DevolucionesTab devoluciones={devoluciones} articulos={articulos} setDevoluciones={setDevoluciones}/>}
        {tab==="historial"&&<HistorialTab ocs={ocs} recepciones={recepciones.filter(r=>ocs.some(o=>o.id===r.ordenCompraId))} devoluciones={devoluciones} documentos={documentos}/>}
      </div>

      {modalEditar&&<EditarProveedorModal proveedor={proveedor} categorias={categorias} setProveedores={setProveedores} homologEfectiva={homolog} auditoriaProveedores={auditoriaProveedores} setAuditoriaProveedores={setAuditoriaProveedores} onCerrar={()=>setModalEditar(false)}/>}
    </div>
  );
}

function ResumenTab({proveedor,comprasYTD,cxpPendiente,ocAbiertas,evaluacion,ocs,facturas,devoluciones,documentos}:{proveedor:ProveedorInventario;comprasYTD:number;cxpPendiente:number;ocAbiertas:number;evaluacion:EvaluacionProveedor;ocs:OrdenCompra[];facturas:Factura[];devoluciones:DevolucionProveedor[];documentos:DocumentoProveedor[]}) {
  const badgeCl=(e:string)=>e==="Facturada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Recibida"?"badge-info":e==="Parcialmente Recibida"?"badge-warn":e==="Enviada"?"badge-warn":e==="Pendiente Aprobación"?"badge-purple":"badge-gray";
  const barColor=(v:number)=>v>=85?"#10B981":v>=70?"#F59E0B":"#EF4444";
  const recientes=[...ocs].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,4);

  const alertas:string[]=[];
  const docsVencidos=documentos.filter(d=>estadoDocumento(d.vigenciaHasta)==="Vencido").length;
  const docsPorVencer=documentos.filter(d=>estadoDocumento(d.vigenciaHasta)==="Por vencer").length;
  const devsPendientes=devoluciones.filter(d=>d.estado==="Pendiente").length;
  const hoy=new Date();
  const ocAtrasada=ocs.some(o=>(o.estado==="Enviada"||o.estado==="Parcialmente Recibida")&&o.fechaEntregaEsperada&&parseFechaEsCR(o.fechaEntregaEsperada)<hoy);
  if(docsVencidos>0) alertas.push(`📄 ${docsVencidos} documento(s) vencido(s)`);
  if(docsPorVencer>0) alertas.push(`📄 ${docsPorVencer} documento(s) por vencer en los próximos 30 días`);
  if(devsPendientes>0) alertas.push(`↩️ ${devsPendientes} devolución(es) pendiente(s) de resolver`);
  if(ocAtrasada) alertas.push(`⏰ Hay OC(s) enviadas con fecha de entrega esperada vencida`);
  if(facturas.some(f=>f.estado==="vencida")) alertas.push(`💳 Hay facturas vencidas en Cuentas por Pagar`);

  return (
    <div>
      <div className="g4" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Score</div><div className="kpi-value" style={{fontSize:15,color:barColor(evaluacion.puntaje)}}>{evaluacion.puntaje} {evaluacion.grado}</div></div>
        <div className="kpi"><div className="kpi-label">Compras YTD</div><div className="kpi-value" style={{fontSize:15}}>{fmt(comprasYTD)}</div></div>
        <div className="kpi"><div className="kpi-label">Entrega a tiempo</div><div className="kpi-value" style={{fontSize:15,color:barColor(evaluacion.entregaPct)}}>{evaluacion.entregaPct}%</div></div>
        <div className="kpi"><div className="kpi-label">OC abiertas</div><div className="kpi-value" style={{fontSize:15}}>{ocAbiertas}</div></div>
      </div>
      <div className="g2" style={{marginBottom:14,alignItems:"start"}}>
        <div className="kpi"><div className="kpi-label">Saldo CxP</div><div className="kpi-value" style={{fontSize:15,color:cxpPendiente>0?"#EF4444":undefined}}>{fmt(cxpPendiente)}</div></div>
        <div className="kpi"><div className="kpi-label">Condiciones de pago</div><div className="kpi-value" style={{fontSize:15}}>{proveedor.condicion}</div></div>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Alertas</div>
          {alertas.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin alertas activas</div>}
          {alertas.map((a,i)=>(<div key={i} style={{fontSize:11.5,color:"#991B1B",padding:"5px 0",borderBottom:"1px solid #F3F4F6"}}>{a}</div>))}
        </div>
        <div className="card">
          <div className="card-title">Actividad reciente</div>
          {recientes.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin actividad registrada</div>}
          {recientes.map(oc=>(
            <div key={oc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
              <div><b style={{fontFamily:"monospace",color:"#E8611A",fontSize:10.5}}>{oc.id}</b> · {oc.fecha}</div>
              <span className={`badge ${badgeCl(oc.estado)}`} style={{fontSize:9}}>{oc.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesempenoTab({proveedor,evaluacion}:{proveedor:ProveedorInventario;evaluacion:EvaluacionProveedor}) {
  const barColor=(v:number)=>v>=85?"#10B981":v>=70?"#F59E0B":"#EF4444";
  const [verDesglose,setVerDesglose]=useState(false);
  return (
    <div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="card-title" style={{marginBottom:0}}>Evaluación del proveedor</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22,fontWeight:800,color:barColor(evaluacion.puntaje)}}>{evaluacion.puntaje}</span>
            <span className="badge badge-info">{evaluacion.grado}</span>
          </div>
        </div>
        {evaluacion.criterios.map(c=>(
          <div key={c.nombre} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#374151",fontWeight:600}}>{c.nombre} <span style={{color:"#9CA3AF",fontWeight:400}}>({c.peso}%)</span></span><span>{c.resultado}%</span></div>
            <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${c.resultado}%`,background:barColor(c.resultado)}}/></div>
          </div>
        ))}
        <div style={{fontSize:10,color:"#9CA3AF",marginTop:8,marginBottom:10}}>
          {evaluacion.conDatos?`Calculado a partir de ${evaluacion.nRecibidas} orden(es) completa(s), ${evaluacion.nRecepciones} recepción(es) y ${evaluacion.nServicio} evaluación(es) de servicio.`:"Aún sin historial suficiente — se muestran valores neutros hasta la primera recepción."}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setVerDesglose(true)}>¿Por qué es {evaluacion.grado}?</button>
      </div>
      {verDesglose&&<EvaluacionDetalleModal proveedor={proveedor} evaluacion={evaluacion} onCerrar={()=>setVerDesglose(false)}/>}
    </div>
  );
}

function EvaluacionDetalleModal({proveedor,evaluacion,onCerrar}:{proveedor:ProveedorInventario;evaluacion:EvaluacionProveedor;onCerrar:()=>void}) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">¿Por qué {proveedor.nombre} es {evaluacion.grado}?</div><div className="modal-sub">{evaluacion.puntaje} / 100 — {descripcionGrado(evaluacion.grado)}</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Criterio</th><th>Resultado</th><th>Peso</th><th>Aporte</th></tr></thead>
          <tbody>
            {evaluacion.criterios.map(c=>(
              <tr key={c.nombre}>
                <td style={{fontSize:12}}>{c.nombre}</td>
                <td>{c.resultado}%</td>
                <td>{c.peso}%</td>
                <td style={{fontWeight:600,color:"#E8611A"}}>{(c.resultado*c.peso/100).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"#F9FAFB"}}>
              <td colSpan={3} style={{fontWeight:700,textAlign:"right",paddingRight:8}}>Resultado</td>
              <td style={{fontWeight:700,color:"#E8611A"}}>{evaluacion.puntaje}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{textAlign:"center",marginTop:14,padding:"10px",background:"#FFF3ED",borderRadius:8}}>
          <span style={{fontSize:16,fontWeight:800,color:"#E8611A"}}>{evaluacion.grado}</span>
          <span style={{fontSize:12,color:"#6B7280",marginLeft:8}}>{descripcionGrado(evaluacion.grado)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// Agrega el historial de costos de un artículo a partir de las OC reales de este proveedor.
function historicoPrecios(articuloId:string, ordenesCompra:OrdenCompra[]): {fecha:string;costo:number}[] {
  const puntos:{fecha:string;costo:number}[]=[];
  ordenesCompra.forEach(o=>o.lineas.forEach(l=>{if(l.articuloId===articuloId) puntos.push({fecha:o.fecha,costo:l.costoUnitario});}));
  return puntos.sort((a,b)=>parseFechaEsCR(a.fecha).getTime()-parseFechaEsCR(b.fecha).getTime());
}

function PreciosTab({items,ordenesCompra,proveedorArticulos,proveedores}:{items:Articulo[];ordenesCompra:OrdenCompra[];proveedorArticulos:ProveedorArticulo[];proveedores:ProveedorInventario[]}) {
  const [selArticuloId,setSelArticuloId]=useState<string|null>(items[0]?.id??null);
  const alternativosDe=(articuloId:string)=>proveedorArticulos.filter(pa=>pa.articuloId===articuloId);

  const filas=items.map(a=>{
    const historico=historicoPrecios(a.id,ordenesCompra);
    const anteriores=historico.filter(p=>p.costo!==a.costoUnitario);
    const promAnterior=anteriores.length?anteriores.reduce((s,p)=>s+p.costo,0)/anteriores.length:null;
    const variacion=promAnterior?((a.costoUnitario-promAnterior)/promAnterior)*100:null;
    const alternativos=alternativosDe(a.id);
    const masBarato=alternativos.length?alternativos.reduce((min,x)=>x.costoUnitario<min.costoUnitario?x:min):null;
    const ahorro=masBarato&&masBarato.costoUnitario<a.costoUnitario?(a.costoUnitario-masBarato.costoUnitario)*a.stock:0;
    return {articulo:a,historico,variacion,alternativos,masBarato,ahorro};
  });

  const conVariacion=filas.filter(f=>f.variacion!==null);
  const variacionProm=conVariacion.length?conVariacion.reduce((s,f)=>s+(f.variacion||0),0)/conVariacion.length:0;
  const nAumentaron=filas.filter(f=>(f.variacion||0)>1).length;
  const ahorroPotencial=filas.reduce((s,f)=>s+f.ahorro,0);

  const sel=filas.find(f=>f.articulo.id===selArticuloId)||filas[0];

  return (
    <div>
      <div className="g3" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Variación promedio de costo</div><div className="kpi-value" style={{fontSize:16,color:variacionProm>1?"#EF4444":variacionProm<-1?"#10B981":undefined}}>{variacionProm>0?"▲":variacionProm<0?"▼":"—"} {Math.abs(variacionProm).toFixed(1)}%</div></div>
        <div className="kpi"><div className="kpi-label">Artículos con aumento</div><div className="kpi-value" style={{fontSize:16,color:nAumentaron>0?"#EF4444":undefined}}>{nAumentaron}</div></div>
        <div className="kpi"><div className="kpi-label">Ahorro potencial (alternativos)</div><div className="kpi-value" style={{fontSize:16,color:"#10B981"}}>{fmt(ahorroPotencial)}</div></div>
      </div>

      {sel&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div className="card-title" style={{marginBottom:0}}>Evolución del costo — {sel.articulo.nombre}</div>
            <select className="form-control" style={{width:260}} value={sel.articulo.id} onChange={e=>setSelArticuloId(e.target.value)}>
              {items.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          {sel.historico.length<2?(
            <div style={{fontSize:11,color:"#9CA3AF"}}>Aún no hay suficiente historial de compras de este artículo para graficar una tendencia.</div>
          ):(
            <MiniSerie puntos={sel.historico}/>
          )}
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
            {sel.variacion!==null&&Math.abs(sel.variacion)>=10&&(
              <div style={{fontSize:11.5,color:sel.variacion>0?"#EF4444":"#10B981"}}>{sel.variacion>0?"▲":"▼"} {sel.variacion>0?"Incremento":"Reducción"} de {Math.abs(sel.variacion).toFixed(1)}% respecto al costo histórico promedio</div>
            )}
            {sel.masBarato&&sel.masBarato.costoUnitario<sel.articulo.costoUnitario&&(
              <div style={{fontSize:11.5,color:"#10B981"}}>💡 {proveedores.find(p=>p.id===sel.masBarato!.proveedorId)?.nombre} ofrece este artículo {(((sel.articulo.costoUnitario-sel.masBarato.costoUnitario)/sel.articulo.costoUnitario)*100).toFixed(1)}% más barato ({fmt(sel.masBarato.costoUnitario)})</div>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>Artículo</th><th>Costo actual</th><th>Variación</th><th>Alternativa más barata</th></tr></thead>
          <tbody>
            {filas.map(f=>(
              <tr key={f.articulo.id} style={{cursor:"pointer",background:selArticuloId===f.articulo.id?"#FFFBF5":""}} onClick={()=>setSelArticuloId(f.articulo.id)}>
                <td style={{fontSize:12.5}}>{f.articulo.nombre}</td>
                <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(f.articulo.costoUnitario)}</td>
                <td>{f.variacion===null?<span style={{fontSize:10.5,color:"#9CA3AF"}}>Sin historial</span>:
                  <span style={{fontSize:11,fontWeight:700,color:f.variacion>1?"#EF4444":f.variacion<-1?"#10B981":"#6B7280"}}>{f.variacion>0?"▲":f.variacion<0?"▼":"—"} {Math.abs(f.variacion).toFixed(1)}%</span>}</td>
                <td>{f.masBarato&&f.masBarato.costoUnitario<f.articulo.costoUnitario?<span className="badge badge-ok" style={{fontSize:9}}>{fmt(f.masBarato.costoUnitario)}</span>:<span style={{color:"#D1D5DB"}}>—</span>}</td>
              </tr>
            ))}
            {filas.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin artículos activos de este proveedor</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniSerie({puntos}:{puntos:{fecha:string;costo:number}[]}) {
  const w=560,h=110,pad=24;
  const costos=puntos.map(p=>p.costo);
  const min=Math.min(...costos),max=Math.max(...costos);
  const rango=max-min||1;
  const x=(i:number)=>pad+(i*(w-pad*2))/(puntos.length-1);
  const y=(v:number)=>h-pad-((v-min)*(h-pad*2))/rango;
  const path=puntos.map((p,i)=>`${i===0?"M":"L"}${x(i)},${y(p.costo)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:110}}>
      <path d={path} fill="none" stroke="#E8611A" strokeWidth={2}/>
      {puntos.map((p,i)=>(
        <g key={i}>
          <circle cx={x(i)} cy={y(p.costo)} r={3.5} fill="#E8611A"/>
          <text x={x(i)} y={h-6} fontSize={9} fill="#9CA3AF" textAnchor="middle">{p.fecha.split(" ").slice(0,2).join(" ")}</text>
          <text x={x(i)} y={y(p.costo)-8} fontSize={9} fill="#374151" textAnchor="middle">{fmt(p.costo)}</text>
        </g>
      ))}
    </svg>
  );
}

function CatalogoTab({items,categorias,proveedorArticulos,proveedores}:{items:Articulo[];categorias:CategoriaInventario[];proveedorArticulos:ProveedorArticulo[];proveedores:ProveedorInventario[]}) {
  const alternativosDe=(articuloId:string)=>proveedorArticulos.filter(pa=>pa.articuloId===articuloId);
  return (
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <table className="tbl">
        <thead><tr><th>Código</th><th>Artículo</th><th>Categoría</th><th>Stock</th><th>Costo actual</th><th>Otros proveedores</th></tr></thead>
        <tbody>
          {items.map(a=>{
            const alternativos=alternativosDe(a.id);
            const masBarato=alternativos.length?alternativos.reduce((min,x)=>x.costoUnitario<min.costoUnitario?x:min):null;
            return (
            <tr key={a.id}>
              <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{a.id}</b></td>
              <td style={{fontSize:12.5}}>{a.nombre}</td>
              <td><span className="badge badge-info" style={{fontSize:10}}>{categorias.find(c=>c.id===a.categoriaId)?.nombre}</span></td>
              <td>{a.stock} {a.unidad}</td>
              <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(a.costoUnitario)}</td>
              <td>
                {alternativos.length===0?<span style={{fontSize:10.5,color:"#9CA3AF"}}>—</span>:
                  <span style={{fontSize:10.5}}>
                    {alternativos.length} alternativo{alternativos.length>1?"s":""}
                    {masBarato&&masBarato.costoUnitario<a.costoUnitario&&<span className="badge badge-ok" style={{fontSize:8,marginLeft:4}} title={proveedores.find(p=>p.id===masBarato.proveedorId)?.nombre}>desde {fmt(masBarato.costoUnitario)}</span>}
                  </span>}
              </td>
            </tr>
            );
          })}
          {items.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Este proveedor no suministra artículos activos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ComprasTab({ocs}:{ocs:OrdenCompra[]}) {
  const badgeCl=(e:string)=>e==="Facturada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Recibida"?"badge-info":e==="Parcialmente Recibida"?"badge-warn":e==="Enviada"?"badge-warn":e==="Pendiente Aprobación"?"badge-purple":"badge-gray";
  const ordenadas=[...ocs].sort((a,b)=>b.id.localeCompare(a.id));
  return (
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <table className="tbl">
        <thead><tr><th>Folio</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
        <tbody>
          {ordenadas.map(oc=>(
            <tr key={oc.id}>
              <td><b style={{fontSize:11.5,fontFamily:"monospace",color:"#E8611A"}}>{oc.id}</b></td>
              <td style={{fontSize:12}}>{oc.fecha}</td>
              <td><span className={`badge ${badgeCl(oc.estado)}`}>{oc.estado}</span></td>
              <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(totalOC(oc))}</td>
            </tr>
          ))}
          {ordenadas.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin órdenes de compra registradas</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function FinanzasTab({facturas}:{facturas:Factura[]}) {
  const pendiente=facturas.filter(f=>f.saldo>0).reduce((s,f)=>s+f.saldo,0);
  const vencido=facturas.filter(f=>f.estado==="vencida").reduce((s,f)=>s+f.saldo,0);
  return (
    <div>
      <div className="g3" style={{marginBottom:12}}>
        <div className="kpi"><div className="kpi-label">Pendiente</div><div className="kpi-value" style={{fontSize:15,color:"#F59E0B"}}>{fmt(pendiente)}</div></div>
        <div className="kpi"><div className="kpi-label">Vencido</div><div className="kpi-value" style={{fontSize:15,color:"#EF4444"}}>{fmt(vencido)}</div></div>
        <div className="kpi"><div className="kpi-label">Facturas</div><div className="kpi-value" style={{fontSize:15}}>{facturas.length}</div></div>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>Referencia</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Saldo</th><th>Estado</th></tr></thead>
          <tbody>
            {facturas.map(f=>(
              <tr key={f.id}>
                <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{f.id}</td>
                <td style={{fontSize:11.5}}>{f.fechaEmision}</td>
                <td style={{fontSize:11.5,color:f.estado==="vencida"?"#EF4444":"#6B7280"}}>{f.fechaVencimiento}</td>
                <td style={{fontSize:12}}>{fmt(f.monto)}</td>
                <td style={{fontSize:12,fontWeight:700}}>{fmt(f.saldo)}</td>
                <td><span className={`badge ${f.estado==="pagada"?"badge-ok":f.estado==="vencida"?"badge-crit":"badge-info"}`}>{f.estado}</span></td>
              </tr>
            ))}
            {facturas.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin facturas en Cuentas por Pagar</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DevolucionesTab({devoluciones,articulos,setDevoluciones}:{devoluciones:DevolucionProveedor[];articulos:Articulo[];setDevoluciones:React.Dispatch<React.SetStateAction<DevolucionProveedor[]>>}) {
  const ordenadas=[...devoluciones].sort((a,b)=>b.id.localeCompare(a.id));
  const pendientes=devoluciones.filter(d=>d.estado==="Pendiente").length;
  const marcarResuelta=(id:string)=>setDevoluciones(prev=>prev.map(d=>d.id===id?{...d,estado:"Resuelta"}:d));

  return (
    <div>
      <div className="g3" style={{marginBottom:12}}>
        <div className="kpi"><div className="kpi-label">Devoluciones totales</div><div className="kpi-value" style={{fontSize:15}}>{devoluciones.length}</div></div>
        <div className="kpi"><div className="kpi-label">Pendientes</div><div className="kpi-value" style={{fontSize:15,color:pendientes>0?"#F59E0B":undefined}}>{pendientes}</div></div>
        <div className="kpi"><div className="kpi-label">Unidades rechazadas</div><div className="kpi-value" style={{fontSize:15,color:"#EF4444"}}>{devoluciones.reduce((s,d)=>s+d.cantidad,0)}</div></div>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>Folio</th><th>Artículo</th><th>Cantidad</th><th>Motivo</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {ordenadas.map(d=>{
              const art=articulos.find(a=>a.id===d.articuloId);
              return (
                <tr key={d.id}>
                  <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{d.id}</td>
                  <td style={{fontSize:12}}>{art?.nombre||d.articuloId}</td>
                  <td style={{fontWeight:600,color:"#EF4444"}}>{d.cantidad}</td>
                  <td style={{fontSize:11.5}}>{d.motivo}</td>
                  <td style={{fontSize:11.5}}>{d.fecha}</td>
                  <td><span className={`badge ${d.estado==="Resuelta"?"badge-ok":"badge-warn"}`}>{d.estado}</span></td>
                  <td>{d.estado==="Pendiente"&&<button className="btn btn-ghost btn-sm" onClick={()=>marcarResuelta(d.id)}>✓ Marcar resuelta</button>}</td>
                </tr>
              );
            })}
            {ordenadas.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin devoluciones registradas — se generan automáticamente cuando se rechazan unidades al recibir una orden</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentosTab({documentos,proveedorId,setDocumentosProveedor}:{documentos:DocumentoProveedor[];proveedorId:string;setDocumentosProveedor:React.Dispatch<React.SetStateAction<DocumentoProveedor[]>>}) {
  const [nombre,setNombre]=useState("");
  const [tipo,setTipo]=useState("Certificación");
  const [vigenciaHasta,setVigenciaHasta]=useState("");

  const badgeCl=(e:string)=>e==="Vigente"?"badge-ok":e==="Por vencer"?"badge-warn":"badge-crit";
  const agregar=()=>{
    if(!nombre.trim()) return;
    setDocumentosProveedor(prev=>[...prev,{id:`DOC-${Date.now()}`,proveedorId,tipo,nombre:nombre.trim(),vigenciaHasta:vigenciaHasta||undefined}]);
    setNombre("");setVigenciaHasta("");
  };

  return (
    <div>
      <div className="card" style={{marginBottom:12,padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead><tr><th>Tipo</th><th>Documento</th><th>Vigencia</th><th>Estado</th></tr></thead>
          <tbody>
            {documentos.map(d=>{
              const estado=estadoDocumento(d.vigenciaHasta);
              return (
                <tr key={d.id}>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{d.tipo}</td>
                  <td style={{fontSize:12.5}}>{d.nombre}</td>
                  <td style={{fontSize:11.5}}>{d.vigenciaHasta||"Sin vencimiento"}</td>
                  <td><span className={`badge ${badgeCl(estado)}`}>{estado}</span></td>
                </tr>
              );
            })}
            {documentos.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin documentos registrados</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-title" style={{fontSize:12}}>Agregar documento</div>
        <div className="g3">
          <div className="form-group"><label className="form-label">Tipo</label>
            <select className="form-control" value={tipo} onChange={e=>setTipo(e.target.value)}>
              <option>Personería jurídica</option><option>Bancario</option><option>Certificación</option><option>Permiso</option><option>Contrato</option><option>Otro</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Nombre del documento</label><input className="form-control" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Póliza de responsabilidad civil"/></div>
          <div className="form-group"><label className="form-label">Vigente hasta (opcional)</label><input type="date" className="form-control" onChange={e=>{
            if(!e.target.value){setVigenciaHasta("");return;}
            const [y,m,d]=e.target.value.split("-");
            const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
            setVigenciaHasta(`${d} ${meses[parseInt(m)-1]} ${y}`);
          }}/></div>
        </div>
        <button className="btn btn-primary btn-sm" disabled={!nombre.trim()} onClick={agregar}>➕ Agregar documento</button>
      </div>
    </div>
  );
}

type EventoHistorial={fecha:string;icono:string;texto:string;orden:string};

function HistorialTab({ocs,recepciones,devoluciones,documentos}:{ocs:OrdenCompra[];recepciones:Recepcion[];devoluciones:DevolucionProveedor[];documentos:DocumentoProveedor[]}) {
  const eventos:EventoHistorial[]=[];
  ocs.forEach(o=>eventos.push({fecha:o.fecha,icono:"📋",texto:`Orden de Compra ${o.id} creada — ${o.estado}`,orden:o.id}));
  recepciones.forEach(r=>eventos.push({fecha:r.fecha,icono:"📦",texto:`Recepción ${r.id} registrada contra ${r.ordenCompraId}`,orden:r.id}));
  devoluciones.forEach(d=>eventos.push({fecha:d.fecha,icono:"↩️",texto:`Devolución ${d.id} por ${d.motivo} (${d.cantidad} unidades)`,orden:d.id}));
  documentos.filter(d=>d.vigenciaHasta).forEach(d=>eventos.push({fecha:d.vigenciaHasta!,icono:"📄",texto:`${d.nombre} — vence ${d.vigenciaHasta}`,orden:d.id}));
  const ordenados=eventos.sort((a,b)=>parseFechaEsCR(b.fecha).getTime()-parseFechaEsCR(a.fecha).getTime());

  return (
    <div className="card">
      <div className="card-title">Línea de tiempo</div>
      {ordenados.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin eventos registrados</div>}
      {ordenados.map((e,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
          <div style={{fontSize:14}}>{e.icono}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12}}>{e.texto}</div>
            <div style={{fontSize:10,color:"#9CA3AF"}}>{e.fecha}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

type SeccionEdicion="general"|"contactos"|"comercial"|"bancaria"|"fiscal"|"direcciones"|"homologacion"|"configuracion";

function EditarProveedorModal({proveedor,categorias,setProveedores,homologEfectiva,auditoriaProveedores,setAuditoriaProveedores,onCerrar}:{
  proveedor:ProveedorInventario;categorias:CategoriaInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;
  homologEfectiva:EstadoHomologacionEfectivo;auditoriaProveedores:AuditoriaProveedor[];setAuditoriaProveedores:React.Dispatch<React.SetStateAction<AuditoriaProveedor[]>>;onCerrar:()=>void;
}) {
  const [seccion,setSeccion]=useState<SeccionEdicion>("general");
  const set=(campo:keyof ProveedorInventario,valor:any)=>setProveedores(prev=>prev.map(p=>p.id===proveedor.id?{...p,[campo]:valor}:p));
  const toggleCategoria=(catId:string)=>setProveedores(prev=>prev.map(p=>p.id===proveedor.id?{...p,categorias:p.categorias.includes(catId)?p.categorias.filter(c=>c!==catId):[...p.categorias,catId]}:p));
  const registrarAuditoria=(descripcion:string)=>setAuditoriaProveedores(prev=>[{id:`AUD-${Date.now()}`,proveedorId:proveedor.id,seccion:"Bancaria",descripcion,fecha:hoy(),usuario:"Ronald"},...prev]);

  const contactos=proveedor.contactos||[];
  const cuentas=proveedor.cuentasBancarias||[];
  const direcciones=proveedor.direcciones||[];
  const auditoriaDeEste=auditoriaProveedores.filter(a=>a.proveedorId===proveedor.id);

  const secciones:[SeccionEdicion,string][]=[["general","General"],["contactos","Contactos"],["comercial","Comercial"],["bancaria","Bancaria"],["fiscal","Fiscal"],["direcciones","Direcciones"],["homologacion","Homologación"],["configuracion","Configuración"]];

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:820,display:"flex",flexDirection:"column",maxHeight:"85vh"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Editar Proveedor</div><div className="modal-sub">{proveedor.nombre}</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <div style={{display:"flex",gap:16,flex:1,overflow:"hidden"}}>
          <div style={{width:150,flexShrink:0,display:"flex",flexDirection:"column",gap:2}}>
            {secciones.map(([id,label])=>(
              <div key={id} onClick={()=>setSeccion(id)} style={{padding:"8px 10px",borderRadius:6,fontSize:12,cursor:"pointer",fontWeight:seccion===id?700:400,background:seccion===id?"#FFF3ED":"transparent",color:seccion===id?"#E8611A":"#374151"}}>{label}</div>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",paddingRight:4}}>
            {seccion==="general"&&(
              <div>
                <div className="g2">
                  <div className="form-group"><label className="form-label">Nombre / Razón social</label><input className="form-control" value={proveedor.nombre} onChange={e=>set("nombre",e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Cédula jurídica</label><input className="form-control" value={proveedor.cedulaJuridica} onChange={e=>set("cedulaJuridica",e.target.value)}/></div>
                </div>
                <div className="g2">
                  <div className="form-group"><label className="form-label">Correo principal</label><input className="form-control" value={proveedor.contacto} onChange={e=>set("contacto",e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Teléfono principal</label><input className="form-control" value={proveedor.telefono} onChange={e=>set("telefono",e.target.value)}/></div>
                </div>
                <div className="form-group"><label className="form-label">Clasificación (calculada)</label><div className="form-control" style={{background:"#F9FAFB",color:"#6B7280"}}>Automática — ver pestaña Desempeño</div></div>
              </div>
            )}

            {seccion==="contactos"&&<ContactosSeccion contactos={contactos} onCambiar={list=>set("contactos",list)}/>}

            {seccion==="comercial"&&(
              <div>
                <div className="g2">
                  <div className="form-group"><label className="form-label">Condición de pago</label>
                    <select className="form-control" value={proveedor.condicion} onChange={e=>set("condicion",e.target.value)}>
                      <option>Contado</option><option>15 días</option><option>30 días</option><option>45 días</option><option>60 días</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Moneda preferida</label>
                    <select className="form-control" value={proveedor.monedaPreferida||"CRC"} onChange={e=>set("monedaPreferida",e.target.value)}>
                      <option value="CRC">CRC — Colones</option><option value="USD">USD — Dólares</option>
                    </select>
                  </div>
                </div>
                <div className="g3">
                  <div className="form-group"><label className="form-label">Lead time contractual (días)</label><input type="number" className="form-control" value={proveedor.leadTimeContractualDias??""} min={0} onChange={e=>set("leadTimeContractualDias",e.target.value?Math.max(0,parseInt(e.target.value)):undefined)}/></div>
                  <div className="form-group"><label className="form-label">Descuento acordado (%)</label><input type="number" className="form-control" value={proveedor.descuentoPct??""} min={0} max={100} onChange={e=>set("descuentoPct",e.target.value?Math.max(0,Math.min(100,parseFloat(e.target.value))):undefined)}/></div>
                  <div className="form-group"><label className="form-label">Monto mínimo de compra</label><input type="number" className="form-control" value={proveedor.montoMinimoCompra??""} min={0} onChange={e=>set("montoMinimoCompra",e.target.value?Math.max(0,parseFloat(e.target.value)):undefined)}/></div>
                </div>
              </div>
            )}

            {seccion==="bancaria"&&<BancariaSeccion cuentas={cuentas} onCambiar={list=>set("cuentasBancarias",list)} registrarAuditoria={registrarAuditoria} auditoria={auditoriaDeEste}/>}

            {seccion==="fiscal"&&(
              <div className="g2">
                <div className="form-group"><label className="form-label">Régimen fiscal</label><input className="form-control" value={proveedor.regimenFiscal||""} onChange={e=>set("regimenFiscal",e.target.value||undefined)} placeholder="Ej: Régimen Tradicional"/></div>
                <div className="form-group"><label className="form-label">Actividad económica</label><input className="form-control" value={proveedor.actividadEconomica||""} onChange={e=>set("actividadEconomica",e.target.value||undefined)} placeholder="Código / descripción Hacienda"/></div>
              </div>
            )}

            {seccion==="direcciones"&&<DireccionesSeccion direcciones={direcciones} onCambiar={list=>set("direcciones",list)}/>}

            {seccion==="homologacion"&&(
              <div className="form-group">
                <label className="form-label">Estado de homologación</label>
                <select className="form-control" value={proveedor.homologacion} onChange={e=>set("homologacion",e.target.value)} disabled={homologEfectiva==="Bloqueado"}>
                  <option>Pendiente</option><option>En Evaluación</option><option>Aprobado</option><option>Aprobado Condicionado</option><option>Suspendido</option>
                </select>
                {homologEfectiva==="Bloqueado"?
                  <div style={{fontSize:11,color:"#EF4444",marginTop:4}}>🚫 Bloqueado automáticamente por documentos vencidos — regulariza los documentos en la pestaña Documentos para poder cambiar este estado manualmente.</div>
                  :<div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Distinto del estado administrativo (Activo/Inactivo) — ver pestaña Configuración.</div>}
              </div>
            )}

            {seccion==="configuracion"&&(
              <div>
                <div className="form-group"><label className="form-label">Categorías que suministra</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {categorias.map(c=>(
                      <span key={c.id} className={`badge ${proveedor.categorias.includes(c.id)?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>toggleCategoria(c.id)}>{c.icono} {c.nombre}</span>
                    ))}
                  </div>
                </div>
                <div className="toggle-row">
                  <span style={{fontSize:12.5}}>Proveedor activo</span>
                  <div className={`toggle ${proveedor.activo?"on":""}`} onClick={()=>set("activo",!proveedor.activo)}/>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14,flexShrink:0}}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ContactosSeccion({contactos,onCambiar}:{contactos:ContactoProveedor[];onCambiar:(list:ContactoProveedor[])=>void}) {
  const [f,setF]=useState({nombre:"",cargo:"",correo:"",telefono:""});
  const agregar=()=>{
    if(!f.nombre.trim()) return;
    onCambiar([...contactos,{id:`CT-${Date.now()}`,...f,principal:contactos.length===0}]);
    setF({nombre:"",cargo:"",correo:"",telefono:""});
  };
  const quitar=(id:string)=>onCambiar(contactos.filter(c=>c.id!==id));
  const marcarPrincipal=(id:string)=>onCambiar(contactos.map(c=>({...c,principal:c.id===id})));
  return (
    <div>
      {contactos.map(c=>(
        <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
          <div>
            <div style={{fontSize:12.5,fontWeight:600}}>{c.nombre} {c.principal&&<span className="badge badge-info" style={{fontSize:8,marginLeft:4}}>Principal</span>}</div>
            <div style={{fontSize:11,color:"#6B7280"}}>{c.cargo} · {c.correo} · {c.telefono}</div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {!c.principal&&<button className="btn btn-ghost btn-sm" onClick={()=>marcarPrincipal(c.id)}>Marcar principal</button>}
            <button className="btn btn-ghost btn-sm" onClick={()=>quitar(c.id)}>✕</button>
          </div>
        </div>
      ))}
      {contactos.length===0&&<div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>Sin contactos registrados</div>}
      <div className="card" style={{marginTop:10}}>
        <div className="card-title" style={{fontSize:12}}>Agregar contacto</div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" value={f.nombre} onChange={e=>setF(p=>({...p,nombre:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Cargo / función</label><input className="form-control" value={f.cargo} onChange={e=>setF(p=>({...p,cargo:e.target.value}))} placeholder="Ej: Ventas, Cobros, Logística"/></div>
        </div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Correo</label><input className="form-control" value={f.correo} onChange={e=>setF(p=>({...p,correo:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={f.telefono} onChange={e=>setF(p=>({...p,telefono:e.target.value}))}/></div>
        </div>
        <button className="btn btn-primary btn-sm" disabled={!f.nombre.trim()} onClick={agregar}>➕ Agregar contacto</button>
      </div>
    </div>
  );
}

function BancariaSeccion({cuentas,onCambiar,registrarAuditoria,auditoria}:{cuentas:CuentaBancariaProveedor[];onCambiar:(list:CuentaBancariaProveedor[])=>void;registrarAuditoria:(descripcion:string)=>void;auditoria:AuditoriaProveedor[]}) {
  const [f,setF]=useState({banco:"",iban:"",moneda:"CRC",titular:""});
  const mascara=(iban:string)=>iban.length>4?`****${iban.slice(-4)}`:iban;
  const agregar=()=>{
    if(!f.banco.trim()||!f.iban.trim()) return;
    onCambiar([...cuentas,{id:`CB-${Date.now()}`,...f,principal:cuentas.length===0}]);
    registrarAuditoria(`Cuenta bancaria agregada: ${f.banco} ${mascara(f.iban)} (${f.moneda})`);
    setF({banco:"",iban:"",moneda:"CRC",titular:""});
  };
  const quitar=(id:string)=>{
    const c=cuentas.find(x=>x.id===id);
    onCambiar(cuentas.filter(x=>x.id!==id));
    if(c) registrarAuditoria(`Cuenta bancaria eliminada: ${c.banco} ${mascara(c.iban)}`);
  };
  const marcarPrincipal=(id:string)=>onCambiar(cuentas.map(c=>({...c,principal:c.id===id})));
  return (
    <div>
      {cuentas.map(c=>(
        <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
          <div>
            <div style={{fontSize:12.5,fontWeight:600}}>{c.banco} {c.principal&&<span className="badge badge-info" style={{fontSize:8,marginLeft:4}}>Principal</span>}</div>
            <div style={{fontSize:11,color:"#6B7280",fontFamily:"monospace"}}>{mascara(c.iban)} · {c.moneda} · {c.titular}</div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {!c.principal&&<button className="btn btn-ghost btn-sm" onClick={()=>marcarPrincipal(c.id)}>Marcar principal</button>}
            <button className="btn btn-ghost btn-sm" onClick={()=>quitar(c.id)}>✕</button>
          </div>
        </div>
      ))}
      {cuentas.length===0&&<div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>Sin cuentas bancarias registradas</div>}
      <div className="card" style={{marginTop:10}}>
        <div className="card-title" style={{fontSize:12}}>Agregar cuenta bancaria</div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Banco</label><input className="form-control" value={f.banco} onChange={e=>setF(p=>({...p,banco:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">IBAN / N° cuenta</label><input className="form-control" value={f.iban} onChange={e=>setF(p=>({...p,iban:e.target.value}))}/></div>
        </div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Moneda</label>
            <select className="form-control" value={f.moneda} onChange={e=>setF(p=>({...p,moneda:e.target.value}))}>
              <option value="CRC">CRC — Colones</option><option value="USD">USD — Dólares</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Titular</label><input className="form-control" value={f.titular} onChange={e=>setF(p=>({...p,titular:e.target.value}))}/></div>
        </div>
        <button className="btn btn-primary btn-sm" disabled={!f.banco.trim()||!f.iban.trim()} onClick={agregar}>➕ Agregar cuenta</button>
      </div>
      {auditoria.length>0&&(
        <div style={{marginTop:14}}>
          <div className="card-title" style={{fontSize:12}}>Auditoría de cambios bancarios</div>
          {auditoria.map(a=>(
            <div key={a.id} style={{fontSize:11,color:"#6B7280",padding:"5px 0",borderBottom:"1px solid #F3F4F6"}}>{a.fecha} — {a.descripcion} <span style={{color:"#9CA3AF"}}>({a.usuario})</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function DireccionesSeccion({direcciones,onCambiar}:{direcciones:DireccionProveedor[];onCambiar:(list:DireccionProveedor[])=>void}) {
  const [f,setF]=useState<{tipo:DireccionProveedor["tipo"];provincia:string;canton:string;senas:string}>({tipo:"Fiscal",provincia:"",canton:"",senas:""});
  const agregar=()=>{
    if(!f.provincia.trim()||!f.senas.trim()) return;
    onCambiar([...direcciones,{id:`DIR-${Date.now()}`,...f}]);
    setF({tipo:"Fiscal",provincia:"",canton:"",senas:""});
  };
  const quitar=(id:string)=>onCambiar(direcciones.filter(d=>d.id!==id));
  return (
    <div>
      {direcciones.map(d=>(
        <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
          <div>
            <div style={{fontSize:12.5,fontWeight:600}}>{d.tipo} <span style={{fontWeight:400,color:"#6B7280"}}>— {d.provincia}, {d.canton}</span></div>
            <div style={{fontSize:11,color:"#6B7280"}}>{d.senas}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>quitar(d.id)}>✕</button>
        </div>
      ))}
      {direcciones.length===0&&<div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>Sin direcciones registradas</div>}
      <div className="card" style={{marginTop:10}}>
        <div className="card-title" style={{fontSize:12}}>Agregar dirección</div>
        <div className="g3">
          <div className="form-group"><label className="form-label">Tipo</label>
            <select className="form-control" value={f.tipo} onChange={e=>setF(p=>({...p,tipo:e.target.value as DireccionProveedor["tipo"]}))}>
              <option>Fiscal</option><option>Entrega</option><option>Otra</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Provincia</label><input className="form-control" value={f.provincia} onChange={e=>setF(p=>({...p,provincia:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Cantón</label><input className="form-control" value={f.canton} onChange={e=>setF(p=>({...p,canton:e.target.value}))}/></div>
        </div>
        <div className="form-group"><label className="form-label">Señas exactas</label><input className="form-control" value={f.senas} onChange={e=>setF(p=>({...p,senas:e.target.value}))}/></div>
        <button className="btn btn-primary btn-sm" disabled={!f.provincia.trim()||!f.senas.trim()} onClick={agregar}>➕ Agregar dirección</button>
      </div>
    </div>
  );
}
