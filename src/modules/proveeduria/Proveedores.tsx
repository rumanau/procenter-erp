import React, { useState } from "react";
import type { View, ProveedorInventario, Articulo, OrdenCompra, CategoriaInventario } from "../../types";

export function Proveedores({setView,proveedores,setProveedores,articulos,ordenesCompra,categorias}:{setView:(v:View)=>void;proveedores:ProveedorInventario[];setProveedores:React.Dispatch<React.SetStateAction<ProveedorInventario[]>>;articulos:Articulo[];ordenesCompra:OrdenCompra[];categorias:CategoriaInventario[]}) {
  const [busqueda,setBusqueda]=useState("");

  const itemsDe=(id:string)=>articulos.filter(a=>a.activo&&a.proveedorId===id).length;
  const ocsAbiertasDe=(id:string)=>ordenesCompra.filter(o=>o.proveedorId===id&&o.estado!=="Cancelada"&&o.estado!=="Facturada").length;
  const puedeEliminar=(id:string)=>itemsDe(id)===0&&ocsAbiertasDe(id)===0;

  const filtrados=proveedores.filter(p=>busqueda===""||`${p.nombre} ${p.cedulaJuridica}`.toLowerCase().includes(busqueda.toLowerCase()));

  const set=(id:string,campo:keyof ProveedorInventario,valor:any)=>setProveedores(prev=>prev.map(p=>p.id===id?{...p,[campo]:valor}:p));
  const toggleCategoria=(id:string,catId:string)=>setProveedores(prev=>prev.map(p=>p.id===id?{...p,categorias:p.categorias.includes(catId)?p.categorias.filter(c=>c!==catId):[...p.categorias,catId]}:p));

  const nuevoProveedor=()=>{
    const nuevo:ProveedorInventario={id:`PV${Date.now()}`,nombre:"Nuevo Proveedor",cedulaJuridica:"",contacto:"",telefono:"",condicion:"30 días",rating:"B",categorias:[],activo:true};
    setProveedores(prev=>[nuevo,...prev]);
  };

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Proveedores</div><div className="page-subtitle">Directorio unificado · Vinculado a Inventario y Cuentas por Pagar</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
          <button className="btn btn-primary btn-sm" onClick={nuevoProveedor}>➕ Nuevo Proveedor</button>
        </div>
      </div>
      <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
        <div className="header-search"><span>🔍</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por nombre o cédula jurídica..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
      </div>
      {filtrados.map(p=>{
        const nItems=itemsDe(p.id);
        const nOcs=ocsAbiertasDe(p.id);
        return (
        <div key={p.id} className="card" style={{marginBottom:8}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:40,height:40,background:p.activo?"#FFF3ED":"#F3F4F6",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏢</div>
            <div style={{flex:1}}>
              <div className="g2" style={{marginBottom:8}}>
                <input className="form-control" value={p.nombre} onChange={e=>set(p.id,"nombre",e.target.value)} style={{fontWeight:600}} placeholder="Nombre / Razón social"/>
                <input className="form-control" value={p.cedulaJuridica} onChange={e=>set(p.id,"cedulaJuridica",e.target.value)} placeholder="Cédula jurídica"/>
              </div>
              <div className="g3" style={{marginBottom:8}}>
                <input className="form-control" value={p.contacto} onChange={e=>set(p.id,"contacto",e.target.value)} placeholder="Correo de contacto"/>
                <input className="form-control" value={p.telefono} onChange={e=>set(p.id,"telefono",e.target.value)} placeholder="Teléfono"/>
                <select className="form-control" value={p.condicion} onChange={e=>set(p.id,"condicion",e.target.value)}>
                  <option>Contado</option><option>15 días</option><option>30 días</option><option>45 días</option><option>60 días</option>
                </select>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <select className="form-control" style={{width:90}} value={p.rating} onChange={e=>set(p.id,"rating",e.target.value)}>
                  <option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option>
                </select>
                {categorias.map(c=>(
                  <span key={c.id} className={`badge ${p.categorias.includes(c.id)?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>toggleCategoria(p.id,c.id)}>{c.icono} {c.nombre}</span>
                ))}
              </div>
            </div>
            <div style={{textAlign:"right" as const,flexShrink:0}}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <span className="badge badge-info">{nItems} artículos</span>
                {nOcs>0&&<span className="badge badge-warn">{nOcs} OC abiertas</span>}
                <span className={`badge ${p.activo?"badge-ok":"badge-gray"}`}>{p.activo?"Activo":"Inactivo"}</span>
              </div>
              <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>set(p.id,"activo",!p.activo)}>{p.activo?"⏸ Desactivar":"▶ Activar"}</button>
                <button className="btn btn-ghost btn-sm" disabled={!puedeEliminar(p.id)} title={!puedeEliminar(p.id)?"No se puede eliminar: tiene artículos u OCs vinculados":""} onClick={()=>setProveedores(prev=>prev.filter(x=>x.id!==p.id))}>🗑</button>
              </div>
            </div>
          </div>
        </div>
        );
      })}
      {filtrados.length===0&&<div className="card" style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin resultados</div>}
    </div>
  );
}
