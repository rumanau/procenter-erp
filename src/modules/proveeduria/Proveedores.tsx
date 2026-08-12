import React, { useState } from "react";
import type { View, ProveedorInventario, Articulo, OrdenCompra, CategoriaInventario, Factura, ProveedorArticulo, DocumentoProveedor, Recepcion, EvaluacionServicio, DevolucionProveedor, EstadoHomologacion } from "../../types";
import { totalOC, parseFechaEsCR, calcularEvaluacion, estadoDocumento, descripcionGrado, homologacionEfectiva, documentosVencidosDe, descripcionHomologacion, type EvaluacionProveedor, type EstadoHomologacionEfectivo } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
type FiltroChip="todos"|"activos"|"oc-abiertas"|"cxp"|"criticos"|"bloqueados";
type OrdenPor="nombre"|"compras"|"deuda";
type Tab="resumen"|"catalogo"|"ordenes"|"cxp"|"documentos"|"devoluciones"|"editar";

export const badgeHomologacion=(e:EstadoHomologacionEfectivo)=>e==="Bloqueado"||e==="Suspendido"?"badge-crit":e==="Aprobado"?"badge-ok":e==="Aprobado Condicionado"||e==="En Evaluación"?"badge-warn":"badge-gray";

export function Proveedores({setView,proveedores,setProveedores,articulos,ordenesCompra,categorias,facturasCxp,proveedorArticulos,documentosProveedor,setDocumentosProveedor,recepciones,evaluacionesServicio,devoluciones,setDevoluciones}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;
  articulos:Articulo[];ordenesCompra:OrdenCompra[];categorias:CategoriaInventario[];facturasCxp:Factura[];
  proveedorArticulos:ProveedorArticulo[];documentosProveedor:DocumentoProveedor[];setDocumentosProveedor:React.Dispatch<React.SetStateAction<DocumentoProveedor[]>>;
  recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
  devoluciones:DevolucionProveedor[];setDevoluciones:React.Dispatch<React.SetStateAction<DevolucionProveedor[]>>;
}) {
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState<FiltroChip>("todos");
  const [ordenPor,setOrdenPor]=useState<OrdenPor>("nombre");
  const [selId,setSelId]=useState<string|null>(proveedores[0]?.id??null);
  const [tab,setTab]=useState<Tab>("resumen");
  const [modalNuevo,setModalNuevo]=useState(false);

  const itemsDe=(id:string)=>articulos.filter(a=>a.activo&&a.proveedorId===id);
  const ocsDe=(id:string)=>ordenesCompra.filter(o=>o.proveedorId===id);
  const ocsAbiertasDe=(id:string)=>ocsDe(id).filter(o=>o.estado!=="Cancelada"&&o.estado!=="Facturada").length;
  const facturasDe=(id:string)=>{const p=proveedores.find(x=>x.id===id);return p?facturasCxp.filter(f=>f.cedula===p.cedulaJuridica):[];};
  const cxpPendienteDe=(id:string)=>facturasDe(id).reduce((s,f)=>s+f.saldo,0);
  const comprasDe=(id:string)=>ocsDe(id).filter(o=>o.estado!=="Cancelada").reduce((s,o)=>s+totalOC(o),0);
  const ultimaCompraDe=(id:string)=>{const ocs=ocsDe(id).filter(o=>o.estado!=="Cancelada");return ocs.length?[...ocs].sort((a,b)=>b.id.localeCompare(a.id))[0]:null;};
  const evalDe=(id:string)=>calcularEvaluacion(id,ordenesCompra,recepciones,evaluacionesServicio);
  const documentosDe=(id:string)=>documentosProveedor.filter(d=>d.proveedorId===id);
  const devolucionesDe=(id:string)=>devoluciones.filter(d=>d.proveedorId===id);
  const homologDe=(id:string)=>{const p=proveedores.find(x=>x.id===id);return p?homologacionEfectiva(p,documentosProveedor):"Pendiente" as EstadoHomologacionEfectivo;};
  const esCritico=(id:string)=>{
    const hoy=new Date();
    const facturaVencida=facturasDe(id).some(f=>f.estado==="vencida");
    const ocAtrasada=ocsDe(id).some(o=>(o.estado==="Enviada"||o.estado==="Parcialmente Recibida")&&o.fechaEntregaEsperada&&parseFechaEsCR(o.fechaEntregaEsperada)<hoy);
    const documentoVencido=documentosDe(id).some(d=>estadoDocumento(d.vigenciaHasta)==="Vencido");
    return facturaVencida||ocAtrasada||documentoVencido;
  };

  const hoy=new Date();
  const comprasDelMes=ordenesCompra.filter(o=>o.estado!=="Cancelada"&&(()=>{const f=parseFechaEsCR(o.fecha);return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();})()).reduce((s,o)=>s+totalOC(o),0);
  const cedulasProv=new Set(proveedores.map(p=>p.cedulaJuridica));
  const cxpTotalPendiente=facturasCxp.filter(f=>cedulasProv.has(f.cedula)).reduce((s,f)=>s+f.saldo,0);
  const bloqueados=proveedores.filter(p=>homologDe(p.id)==="Bloqueado").length;
  const kpis=[
    {l:"Proveedores activos",v:String(proveedores.filter(p=>p.activo).length),c:"#10B981"},
    {l:"Órdenes abiertas",v:String(ordenesCompra.filter(o=>o.estado!=="Cancelada"&&o.estado!=="Facturada").length),c:"#3B82F6"},
    {l:"Compras del mes",v:fmt(comprasDelMes),c:"#E8611A"},
    {l:"CxP pendiente",v:fmt(cxpTotalPendiente),c:"#7C3AED"},
    {l:"Proveedores críticos",v:String(proveedores.filter(p=>esCritico(p.id)).length),c:"#F59E0B"},
    {l:"Bloqueados por documentos",v:String(bloqueados),c:"#EF4444"},
  ];

  let filtrados=proveedores.filter(p=>{
    if(busqueda&&!(`${p.nombre} ${p.cedulaJuridica} ${p.contacto}`.toLowerCase().includes(busqueda.toLowerCase()))) return false;
    if(filtro==="activos"&&!p.activo) return false;
    if(filtro==="oc-abiertas"&&ocsAbiertasDe(p.id)===0) return false;
    if(filtro==="cxp"&&cxpPendienteDe(p.id)<=0) return false;
    if(filtro==="criticos"&&!esCritico(p.id)) return false;
    if(filtro==="bloqueados"&&homologDe(p.id)!=="Bloqueado") return false;
    return true;
  });
  filtrados=[...filtrados].sort((a,b)=>{
    if(ordenPor==="compras") return comprasDe(b.id)-comprasDe(a.id);
    if(ordenPor==="deuda") return cxpPendienteDe(b.id)-cxpPendienteDe(a.id);
    return a.nombre.localeCompare(b.nombre);
  });

  const sel=proveedores.find(p=>p.id===selId)||null;

  const nuevoProveedor=(p:ProveedorInventario)=>{
    setProveedores(prev=>[p,...prev]);
    setSelId(p.id);
    setModalNuevo(false);
    setTab("resumen");
  };

  const chips:[FiltroChip,string][]=[["todos","Todos"],["activos","Activos"],["oc-abiertas","Con OC abiertas"],["cxp","Con CxP"],["criticos","Críticos"],["bloqueados","🚫 Bloqueados"]];

  return (
    <div className="content" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div className="page-header">
        <div><div className="page-title">Proveedores</div><div className="page-subtitle">Gestión, desempeño, compras y cuentas por pagar</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("comparador")}>🆚 Comparar</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModalNuevo(true)}>➕ Nuevo Proveedor</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
        {kpis.map(k=>(
          <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c,fontSize:15}}>{k.v}</div></div>
        ))}
      </div>

      <div className="card" style={{marginBottom:12,padding:"10px 14px",flexShrink:0}}>
        <div className="header-search" style={{marginBottom:10}}><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar proveedor, cédula, contacto o categoría..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {chips.map(([id,label])=>(
              <span key={id} className={`badge ${filtro===id?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>setFiltro(id)}>{label}</span>
            ))}
          </div>
          <select className="form-control" style={{width:170}} value={ordenPor} onChange={e=>setOrdenPor(e.target.value as OrdenPor)}>
            <option value="nombre">Ordenar: Nombre</option>
            <option value="compras">Ordenar: Mayor compra</option>
            <option value="deuda">Ordenar: Mayor deuda</option>
          </select>
        </div>
      </div>

      <div style={{display:"flex",gap:14,flex:1,overflow:"hidden"}}>
        <div style={{width:400,flexShrink:0,overflow:"auto",paddingRight:2}}>
          {filtrados.map(p=>{
            const critico=esCritico(p.id);
            const ultima=ultimaCompraDe(p.id);
            const ev=evalDe(p.id);
            const homolog=homologDe(p.id);
            const docsVencidos=documentosDe(p.id).filter(d=>estadoDocumento(d.vigenciaHasta)==="Vencido").length;
            const docsPorVencer=documentosDe(p.id).filter(d=>estadoDocumento(d.vigenciaHasta)==="Por vencer").length;
            const devsPendientes=devolucionesDe(p.id).filter(d=>d.estado==="Pendiente").length;
            return (
            <div key={p.id} className="card" onClick={()=>{setSelId(p.id);setTab("resumen");}}
              style={{marginBottom:8,cursor:"pointer",border:selId===p.id?"2px solid #E8611A":"1px solid #E5E7EB"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700}}>🏢 {p.nombre}</div>
                <div style={{display:"flex",gap:4}}>
                  <span className="badge badge-info" style={{fontSize:9}} title="Evaluación calculada">{ev.grado}</span>
                  <span className={`badge ${p.activo?"badge-ok":"badge-gray"}`} style={{fontSize:9}}>{p.activo?"Activo":"Inactivo"}</span>
                </div>
              </div>
              <div style={{fontSize:10.5,color:"#6B7280",marginBottom:6}}>{p.cedulaJuridica} · {p.contacto}</div>
              <div style={{marginBottom:6}}><span className={`badge ${badgeHomologacion(homolog)}`} style={{fontSize:9}} title={descripcionHomologacion(homolog)}>{homolog==="Bloqueado"?"🚫 ":""}Homologación: {homolog}</span></div>
              <div style={{fontSize:11,color:"#374151",marginBottom:6}}>
                {itemsDe(p.id).length} artículos · {ocsAbiertasDe(p.id)} OC abiertas
                {cxpPendienteDe(p.id)>0&&<> · <span style={{color:"#EF4444",fontWeight:600}}>{fmt(cxpPendienteDe(p.id))} CxP</span></>}
                {docsVencidos>0&&<span className="badge badge-crit" style={{fontSize:8.5,marginLeft:6}}>📄 {docsVencidos} vencido{docsVencidos>1?"s":""}</span>}
                {docsVencidos===0&&docsPorVencer>0&&<span className="badge badge-warn" style={{fontSize:8.5,marginLeft:6}}>📄 Por vencer</span>}
                {devsPendientes>0&&<span className="badge badge-warn" style={{fontSize:8.5,marginLeft:6}}>↩️ {devsPendientes} devolución{devsPendientes>1?"es":""}</span>}
                {critico&&<span className="badge badge-crit" style={{fontSize:8.5,marginLeft:6}}>⚠ Atención</span>}
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                {p.categorias.map(cId=>{const c=categorias.find(x=>x.id===cId);return c?<span key={cId} className="badge badge-gray" style={{fontSize:8.5}}>{c.icono} {c.nombre}</span>:null;})}
              </div>
              <div style={{fontSize:10,color:"#9CA3AF"}}>{ultima?`Última compra: ${ultima.fecha}`:"Sin compras registradas"} · Plazo: {p.condicion}</div>
            </div>
            );
          })}
          {filtrados.length===0&&<div className="card" style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin resultados</div>}
        </div>

        {sel?(
          <div style={{flex:1,overflow:"auto"}}>
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>🏢 {sel.nombre}
                    <span className="badge badge-info" title="Evaluación calculada">{evalDe(sel.id).grado}</span>
                    <span className={`badge ${sel.activo?"badge-ok":"badge-gray"}`}>{sel.activo?"Activo":"Inactivo"}</span>
                    <span className={`badge ${badgeHomologacion(homologDe(sel.id))}`} title={descripcionHomologacion(homologDe(sel.id))}>{homologDe(sel.id)==="Bloqueado"?"🚫 Bloqueado":homologDe(sel.id)}</span>
                  </div>
                  <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{sel.cedulaJuridica} · {sel.contacto} · {sel.telefono}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={()=>setView("nueva-oc")}>➕ Nueva OC</button>
              </div>
            </div>

            {homologDe(sel.id)==="Bloqueado"&&(
              <div className="card" style={{marginBottom:12,background:"#FEF2F2",border:"1px solid #FECACA"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#991B1B",marginBottom:4}}>🚫 Proveedor bloqueado automáticamente</div>
                <div style={{fontSize:11,color:"#991B1B",marginBottom:6}}>No puede recibir nuevas Órdenes de Compra hasta regularizar los siguientes documentos vencidos:</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {documentosVencidosDe(sel.id,documentosProveedor).map(d=>(
                    <span key={d.id} className="badge badge-crit" style={{fontSize:9.5}}>{d.nombre} — venció {d.vigenciaHasta}</span>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" style={{marginTop:8}} onClick={()=>setTab("documentos")}>📄 Ir a Documentos</button>
              </div>
            )}

            <div className="tab-bar" style={{marginBottom:12}}>
              {([["resumen","Resumen"],["catalogo","Catálogo"],["ordenes","Órdenes"],["cxp","CxP"],["devoluciones","↩️ Devoluciones"],["documentos","📄 Documentos"],["editar","✏️ Editar"]] as [Tab,string][]).map(([id,label])=>(
                <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{label}</div>
              ))}
            </div>

            {tab==="resumen"&&<ResumenTab proveedor={sel} comprasTotal={comprasDe(sel.id)} cxpPendiente={cxpPendienteDe(sel.id)} ocAbiertas={ocsAbiertasDe(sel.id)} nItems={itemsDe(sel.id).length} categorias={categorias} ocs={ocsDe(sel.id)} facturas={facturasDe(sel.id)} evaluacion={evalDe(sel.id)}/>}
            {tab==="catalogo"&&<CatalogoTab items={itemsDe(sel.id)} categorias={categorias} ordenesCompra={ocsDe(sel.id)} proveedorArticulos={proveedorArticulos} proveedores={proveedores}/>}
            {tab==="ordenes"&&<OrdenesTab ocs={ocsDe(sel.id)}/>}
            {tab==="cxp"&&<CxpTab facturas={facturasDe(sel.id)}/>}
            {tab==="devoluciones"&&<DevolucionesTab devoluciones={devolucionesDe(sel.id)} articulos={articulos} setDevoluciones={setDevoluciones}/>}
            {tab==="documentos"&&<DocumentosTab documentos={documentosDe(sel.id)} proveedorId={sel.id} setDocumentosProveedor={setDocumentosProveedor}/>}
            {tab==="editar"&&<EditarTab proveedor={sel} categorias={categorias} setProveedores={setProveedores} puedeEliminar={itemsDe(sel.id).length===0&&ocsAbiertasDe(sel.id)===0} onEliminado={()=>setSelId(null)} evaluacion={evalDe(sel.id)} homologEfectiva={homologDe(sel.id)}/>}
          </div>
        ):(
          <div className="card" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#9CA3AF"}}>Selecciona un proveedor para ver su expediente</div>
        )}
      </div>

      {modalNuevo&&<NuevoProveedorModal categorias={categorias} onGuardar={nuevoProveedor} onCerrar={()=>setModalNuevo(false)}/>}
    </div>
  );
}

function ResumenTab({proveedor,comprasTotal,cxpPendiente,ocAbiertas,nItems,categorias,ocs,facturas,evaluacion}:{proveedor:ProveedorInventario;comprasTotal:number;cxpPendiente:number;ocAbiertas:number;nItems:number;categorias:CategoriaInventario[];ocs:OrdenCompra[];facturas:Factura[];evaluacion:EvaluacionProveedor}) {
  const recientes=[...ocs].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,4);
  const badgeCl=(e:string)=>e==="Facturada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Recibida"?"badge-info":e==="Parcialmente Recibida"?"badge-warn":e==="Enviada"?"badge-warn":e==="Pendiente Aprobación"?"badge-purple":"badge-gray";
  const barColor=(v:number)=>v>=85?"#10B981":v>=70?"#F59E0B":"#EF4444";
  const [verDesglose,setVerDesglose]=useState(false);
  return (
    <div>
      <div className="g4" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Compras totales</div><div className="kpi-value" style={{fontSize:15}}>{fmt(comprasTotal)}</div></div>
        <div className="kpi"><div className="kpi-label">Saldo CxP</div><div className="kpi-value" style={{fontSize:15,color:cxpPendiente>0?"#EF4444":undefined}}>{fmt(cxpPendiente)}</div></div>
        <div className="kpi"><div className="kpi-label">OC abiertas</div><div className="kpi-value" style={{fontSize:15}}>{ocAbiertas}</div></div>
        <div className="kpi"><div className="kpi-label">Artículos</div><div className="kpi-value" style={{fontSize:15}}>{nItems}</div></div>
      </div>
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
      <div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Información comercial</div>
          <div className="resumen">
            {[["Cédula jurídica",proveedor.cedulaJuridica],["Contacto",proveedor.contacto],["Teléfono",proveedor.telefono],["Condiciones de pago",proveedor.condicion],["Moneda","Colones (₡)"]].map(([l,v])=>(
              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v||"—"}</span></div>
            ))}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
            {proveedor.categorias.map(cId=>{const c=categorias.find(x=>x.id===cId);return c?<span key={cId} className="badge badge-info" style={{fontSize:9.5}}>{c.icono} {c.nombre}</span>:null;})}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Actividad reciente</div>
          {recientes.length===0&&facturas.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin actividad registrada</div>}
          {recientes.map(oc=>(
            <div key={oc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
              <div><b style={{fontFamily:"monospace",color:"#E8611A",fontSize:10.5}}>{oc.id}</b> · {oc.fecha}</div>
              <span className={`badge ${badgeCl(oc.estado)}`} style={{fontSize:9}}>{oc.estado}</span>
            </div>
          ))}
          {facturas.slice(0,2).map(f=>(
            <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
              <div><b style={{fontFamily:"monospace",color:"#7C3AED",fontSize:10.5}}>{f.id}</b> · {f.fechaEmision}</div>
              <span className={`badge ${f.estado==="pagada"?"badge-ok":f.estado==="vencida"?"badge-crit":"badge-warn"}`} style={{fontSize:9}}>{f.estado}</span>
            </div>
          ))}
        </div>
      </div>
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

function CatalogoTab({items,categorias,ordenesCompra,proveedorArticulos,proveedores}:{items:Articulo[];categorias:CategoriaInventario[];ordenesCompra:OrdenCompra[];proveedorArticulos:ProveedorArticulo[];proveedores:ProveedorInventario[]}) {
  const historicoDe=(articuloId:string)=>{
    const precios:number[]=[];
    ordenesCompra.forEach(o=>o.lineas.forEach(l=>{if(l.articuloId===articuloId) precios.push(l.costoUnitario);}));
    return precios;
  };
  const alternativosDe=(articuloId:string)=>proveedorArticulos.filter(pa=>pa.articuloId===articuloId);
  return (
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <table className="tbl">
        <thead><tr><th>Código</th><th>Artículo</th><th>Categoría</th><th>Stock</th><th>Costo actual</th><th>Tendencia</th><th>Otros proveedores</th></tr></thead>
        <tbody>
          {items.map(a=>{
            const historico=historicoDe(a.id);
            const anteriores=historico.filter(p=>p!==a.costoUnitario);
            const promAnterior=anteriores.length?anteriores.reduce((s,p)=>s+p,0)/anteriores.length:null;
            const variacion=promAnterior?((a.costoUnitario-promAnterior)/promAnterior)*100:null;
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
                {variacion===null?<span style={{fontSize:10.5,color:"#9CA3AF"}}>Sin historial</span>:
                  <span style={{fontSize:11,fontWeight:700,color:variacion>1?"#EF4444":variacion<-1?"#10B981":"#6B7280"}}>
                    {variacion>0?"▲":variacion<0?"▼":"—"} {Math.abs(variacion).toFixed(1)}%
                  </span>}
              </td>
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
          {items.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Este proveedor no suministra artículos activos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function OrdenesTab({ocs}:{ocs:OrdenCompra[]}) {
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

function CxpTab({facturas}:{facturas:Factura[]}) {
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

function EditarTab({proveedor,categorias,setProveedores,puedeEliminar,onEliminado,evaluacion,homologEfectiva}:{proveedor:ProveedorInventario;categorias:CategoriaInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;puedeEliminar:boolean;onEliminado:()=>void;evaluacion:EvaluacionProveedor;homologEfectiva:EstadoHomologacionEfectivo}) {
  const set=(campo:keyof ProveedorInventario,valor:any)=>setProveedores(prev=>prev.map(p=>p.id===proveedor.id?{...p,[campo]:valor}:p));
  const toggleCategoria=(catId:string)=>setProveedores(prev=>prev.map(p=>p.id===proveedor.id?{...p,categorias:p.categorias.includes(catId)?p.categorias.filter(c=>c!==catId):[...p.categorias,catId]}:p));
  return (
    <div className="card">
      <div className="card-title">Editar Proveedor</div>
      <div className="g2">
        <div className="form-group"><label className="form-label">Nombre / Razón social</label><input className="form-control" value={proveedor.nombre} onChange={e=>set("nombre",e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Cédula jurídica</label><input className="form-control" value={proveedor.cedulaJuridica} onChange={e=>set("cedulaJuridica",e.target.value)}/></div>
      </div>
      <div className="g3">
        <div className="form-group"><label className="form-label">Correo de contacto</label><input className="form-control" value={proveedor.contacto} onChange={e=>set("contacto",e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={proveedor.telefono} onChange={e=>set("telefono",e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Condición de pago</label>
          <select className="form-control" value={proveedor.condicion} onChange={e=>set("condicion",e.target.value)}>
            <option>Contado</option><option>15 días</option><option>30 días</option><option>45 días</option><option>60 días</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Clasificación</label>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="badge badge-info">{evaluacion.grado}</span>
          <span style={{fontSize:11,color:"#9CA3AF"}}>Calculada automáticamente a partir del historial de compras — ver pestaña Resumen</span>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Estado de homologación</label>
        <select className="form-control" value={proveedor.homologacion} onChange={e=>set("homologacion",e.target.value as EstadoHomologacion)} disabled={homologEfectiva==="Bloqueado"}>
          <option>Pendiente</option><option>En Evaluación</option><option>Aprobado</option><option>Aprobado Condicionado</option><option>Suspendido</option>
        </select>
        {homologEfectiva==="Bloqueado"?
          <div style={{fontSize:11,color:"#EF4444",marginTop:4}}>🚫 Bloqueado automáticamente por documentos vencidos — regulariza los documentos en la pestaña Documentos para poder cambiar este estado manualmente.</div>
          :<div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>Distinto del estado administrativo (Activo/Inactivo) — un proveedor puede estar activo y no homologado, o inactivo y homologado.</div>}
      </div>
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
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
        <button className="btn btn-ghost btn-sm" disabled={!puedeEliminar} title={!puedeEliminar?"No se puede eliminar: tiene artículos u OCs vinculados":""} onClick={()=>{setProveedores(prev=>prev.filter(p=>p.id!==proveedor.id));onEliminado();}}>🗑 Eliminar Proveedor</button>
      </div>
    </div>
  );
}

function NuevoProveedorModal({categorias,onGuardar,onCerrar}:{categorias:CategoriaInventario[];onGuardar:(p:ProveedorInventario)=>void;onCerrar:()=>void}) {
  const [f,setF]=useState<ProveedorInventario>({id:"",nombre:"",cedulaJuridica:"",contacto:"",telefono:"",condicion:"30 días",rating:"B",categorias:[],activo:true,homologacion:"Pendiente"});
  const set=(campo:keyof ProveedorInventario,valor:any)=>setF(prev=>({...prev,[campo]:valor}));
  const toggleCategoria=(catId:string)=>setF(prev=>({...prev,categorias:prev.categorias.includes(catId)?prev.categorias.filter(c=>c!==catId):[...prev.categorias,catId]}));
  const valido=f.nombre.trim().length>2&&f.cedulaJuridica.trim().length>0;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Nuevo Proveedor</div><div className="modal-sub">Identificación, contacto y condiciones comerciales</div></div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Nombre / Razón social</label><input className="form-control" value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Ferretería Central S.A."/></div>
          <div className="form-group"><label className="form-label">Cédula jurídica</label><input className="form-control" value={f.cedulaJuridica} onChange={e=>set("cedulaJuridica",e.target.value)} placeholder="3-101-XXXXXX"/></div>
        </div>
        <div className="g3">
          <div className="form-group"><label className="form-label">Correo de contacto</label><input className="form-control" value={f.contacto} onChange={e=>set("contacto",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={f.telefono} onChange={e=>set("telefono",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Condición de pago</label>
            <select className="form-control" value={f.condicion} onChange={e=>set("condicion",e.target.value)}>
              <option>Contado</option><option>15 días</option><option>30 días</option><option>45 días</option><option>60 días</option>
            </select>
          </div>
        </div>
        <div style={{fontSize:11,color:"#9CA3AF",marginBottom:10}}>La clasificación se calculará automáticamente una vez que este proveedor tenga historial de órdenes recibidas.</div>
        <div className="form-group"><label className="form-label">Categorías que suministra</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {categorias.map(c=>(
              <span key={c.id} className={`badge ${f.categorias.includes(c.id)?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>toggleCategoria(c.id)}>{c.icono} {c.nombre}</span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" disabled={!valido} onClick={()=>onGuardar({...f,id:`PV${Date.now()}`})}>Guardar Proveedor</button>
        </div>
      </div>
    </div>
  );
}
