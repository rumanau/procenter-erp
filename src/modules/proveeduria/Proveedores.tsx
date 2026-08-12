import React, { useState } from "react";
import type { View, ProveedorInventario, Articulo, OrdenCompra, CategoriaInventario, Factura, ProveedorArticulo, DocumentoProveedor, Recepcion, EvaluacionServicio, DevolucionProveedor, AuditoriaProveedor } from "../../types";
import { totalOC, parseFechaEsCR, calcularEvaluacion, estadoDocumento, homologacionEfectiva, badgeHomologacion } from "../../data/proveeduria";
import { ProveedorDetalle } from "./ProveedorDetalle";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
type FiltroChip="todos"|"activos"|"aprobados"|"atencion";

export function Proveedores({setView,proveedores,setProveedores,articulos,ordenesCompra,categorias,facturasCxp,proveedorArticulos,documentosProveedor,setDocumentosProveedor,recepciones,evaluacionesServicio,devoluciones,setDevoluciones,auditoriaProveedores,setAuditoriaProveedores}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;
  articulos:Articulo[];ordenesCompra:OrdenCompra[];categorias:CategoriaInventario[];facturasCxp:Factura[];
  proveedorArticulos:ProveedorArticulo[];documentosProveedor:DocumentoProveedor[];setDocumentosProveedor:React.Dispatch<React.SetStateAction<DocumentoProveedor[]>>;
  recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
  devoluciones:DevolucionProveedor[];setDevoluciones:React.Dispatch<React.SetStateAction<DevolucionProveedor[]>>;
  auditoriaProveedores:AuditoriaProveedor[];setAuditoriaProveedores:React.Dispatch<React.SetStateAction<AuditoriaProveedor[]>>;
}) {
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState<FiltroChip>("todos");
  const [detalleId,setDetalleId]=useState<string|null>(null);
  const [modalNuevo,setModalNuevo]=useState(false);

  const ocsDe=(id:string)=>ordenesCompra.filter(o=>o.proveedorId===id);
  const facturasDe=(id:string)=>{const p=proveedores.find(x=>x.id===id);return p?facturasCxp.filter(f=>f.cedula===p.cedulaJuridica):[];};
  const documentosDe=(id:string)=>documentosProveedor.filter(d=>d.proveedorId===id);
  const devolucionesDe=(id:string)=>devoluciones.filter(d=>d.proveedorId===id);
  const evalDe=(id:string)=>calcularEvaluacion(id,ordenesCompra,recepciones,evaluacionesServicio);
  const homologDe=(id:string)=>{const p=proveedores.find(x=>x.id===id);return p?homologacionEfectiva(p,documentosProveedor):"Pendiente" as const;};
  const alertasDe=(id:string)=>{
    const hoy=new Date();
    const docsVencidos=documentosDe(id).filter(d=>estadoDocumento(d.vigenciaHasta)==="Vencido").length;
    const facturaVencida=facturasDe(id).some(f=>f.estado==="vencida")?1:0;
    const ocAtrasada=ocsDe(id).some(o=>(o.estado==="Enviada"||o.estado==="Parcialmente Recibida")&&o.fechaEntregaEsperada&&parseFechaEsCR(o.fechaEntregaEsperada)<hoy)?1:0;
    const devsPendientes=devolucionesDe(id).filter(d=>d.estado==="Pendiente").length;
    return docsVencidos+facturaVencida+ocAtrasada+devsPendientes;
  };

  const hoy=new Date();
  const comprasDelMes=ordenesCompra.filter(o=>o.estado!=="Cancelada"&&(()=>{const f=parseFechaEsCR(o.fecha);return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();})()).reduce((s,o)=>s+totalOC(o),0);
  const bloqueados=proveedores.filter(p=>homologDe(p.id)==="Bloqueado").length;
  const conAlerta=proveedores.filter(p=>alertasDe(p.id)>0).length;
  const kpis=[
    {l:"Proveedores activos",v:String(proveedores.filter(p=>p.activo).length),c:"#10B981"},
    {l:"Bloqueados",v:String(bloqueados),c:"#EF4444"},
    {l:"Con alertas",v:String(conAlerta),c:"#F59E0B"},
    {l:"Compras del mes",v:fmt(comprasDelMes),c:"#E8611A"},
  ];

  let filtrados=proveedores.filter(p=>{
    if(busqueda&&!(`${p.nombre} ${p.cedulaJuridica} ${p.contacto}`.toLowerCase().includes(busqueda.toLowerCase()))) return false;
    if(filtro==="activos"&&!p.activo) return false;
    if(filtro==="aprobados"&&homologDe(p.id)!=="Aprobado") return false;
    if(filtro==="atencion"&&alertasDe(p.id)===0&&homologDe(p.id)!=="Bloqueado") return false;
    return true;
  });
  filtrados=[...filtrados].sort((a,b)=>a.nombre.localeCompare(b.nombre));

  const chips:[FiltroChip,string][]=[["todos","Todos"],["activos","Activos"],["aprobados","Aprobados"],["atencion","Atención"]];

  const nuevoProveedor=(p:ProveedorInventario)=>{
    setProveedores(prev=>[p,...prev]);
    setModalNuevo(false);
    setDetalleId(p.id);
  };

  if(detalleId){
    const prov=proveedores.find(p=>p.id===detalleId);
    if(prov){
      return (
        <ProveedorDetalle
          proveedor={prov} setView={setView} onVolver={()=>setDetalleId(null)}
          proveedores={proveedores} setProveedores={setProveedores} articulos={articulos} ordenesCompra={ordenesCompra}
          categorias={categorias} facturasCxp={facturasDe(prov.id)} proveedorArticulos={proveedorArticulos}
          documentosProveedor={documentosProveedor} setDocumentosProveedor={setDocumentosProveedor}
          recepciones={recepciones} evaluacionesServicio={evaluacionesServicio}
          devoluciones={devolucionesDe(prov.id)} setDevoluciones={setDevoluciones}
          auditoriaProveedores={auditoriaProveedores} setAuditoriaProveedores={setAuditoriaProveedores}
          onEliminado={()=>setDetalleId(null)}
        />
      );
    }
  }

  return (
    <div className="content" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div className="page-header">
        <div><div className="page-title">Proveedores</div><div className="page-subtitle">Directorio de proveedores — haz clic en uno para ver su expediente</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("comparador")}>🆚 Comparar</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModalNuevo(true)}>➕ Nuevo Proveedor</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {kpis.map(k=>(
          <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c,fontSize:15}}>{k.v}</div></div>
        ))}
      </div>

      <div className="card" style={{marginBottom:12,padding:"10px 14px",flexShrink:0}}>
        <div className="header-search" style={{marginBottom:10}}><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar proveedor, cédula o contacto..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {chips.map(([id,label])=>(
            <span key={id} className={`badge ${filtro===id?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>setFiltro(id)}>{label}</span>
          ))}
        </div>
      </div>

      <div className="card" style={{flex:1,overflow:"auto",padding:0}}>
        <table className="tbl">
          <thead><tr><th>Proveedor</th><th>Cédula</th><th>Homologación</th><th>Score</th><th>Estado</th><th>Alertas</th><th></th></tr></thead>
          <tbody>
            {filtrados.map(p=>{
              const homolog=homologDe(p.id);
              const ev=evalDe(p.id);
              const nAlertas=alertasDe(p.id);
              return (
                <tr key={p.id} style={{cursor:"pointer"}} onClick={()=>setDetalleId(p.id)}>
                  <td style={{fontSize:12.5,fontWeight:600}}>🏢 {p.nombre}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{p.cedulaJuridica}</td>
                  <td><span className={`badge ${badgeHomologacion(homolog)}`} style={{fontSize:9.5}}>{homolog==="Bloqueado"?"🚫 ":""}{homolog}</span></td>
                  <td><span className="badge badge-info" style={{fontSize:9.5}}>{ev.grado}</span></td>
                  <td><span className={`badge ${p.activo?"badge-ok":"badge-gray"}`} style={{fontSize:9.5}}>{p.activo?"Activo":"Inactivo"}</span></td>
                  <td>{nAlertas>0?<span className="badge badge-crit" style={{fontSize:9.5}}>{nAlertas}</span>:<span style={{color:"#D1D5DB"}}>—</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setDetalleId(p.id);}}>Ver →</button></td>
                </tr>
              );
            })}
            {filtrados.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      {modalNuevo&&<NuevoProveedorModal categorias={categorias} onGuardar={nuevoProveedor} onCerrar={()=>setModalNuevo(false)}/>}
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
