import React, { useState } from "react";
import type { RecursoDocumental } from "../../../types";

const CATEGORIAS = ["Prueba Psicométrica", "Guía de Entrevista", "Plantilla de Evaluación", "Política", "Otro"] as const;
const CAT_ICON: Record<string,string> = {
  "Prueba Psicométrica": "🧠", "Guía de Entrevista": "🗣️", "Plantilla de Evaluación": "📋", "Política": "📜", "Otro": "📄",
};

export function BibliotecaDocumental({recursos,setRecursos}:{recursos:RecursoDocumental[];setRecursos:(r:RecursoDocumental[])=>void}) {
  const [categoriaFiltro,setCategoriaFiltro]=useState("todas");
  const [formAbierto,setFormAbierto]=useState(false);
  const [f,setF]=useState({nombre:"",categoria:CATEGORIAS[0] as string,descripcion:"",version:"v1"});

  const filtrados=recursos.filter(r=>categoriaFiltro==="todas"||r.categoria===categoriaFiltro);
  const activos=recursos.filter(r=>r.estado==="Activo");

  const crear=()=>{
    if(!f.nombre.trim()) return;
    setRecursos([{id:`REC-${Date.now()}`,nombre:f.nombre,categoria:f.categoria as RecursoDocumental["categoria"],descripcion:f.descripcion,version:f.version,estado:"Activo",fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"})},...recursos]);
    setF({nombre:"",categoria:CATEGORIAS[0],descripcion:"",version:"v1"});
    setFormAbierto(false);
  };

  const toggleEstado=(r:RecursoDocumental)=>setRecursos(recursos.map(x=>x.id===r.id?{...x,estado:x.estado==="Activo"?"Archivado":"Activo"}:x));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700}}>{activos.length} recursos activos · {recursos.length} totales</div>
        <div style={{display:"flex",gap:8}}>
          <select className="form-control" style={{width:200}} value={categoriaFiltro} onChange={e=>setCategoriaFiltro(e.target.value)}>
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={()=>setFormAbierto(true)}>➕ Nuevo Recurso</button>
        </div>
      </div>

      <div className="g3">
        {filtrados.map(r=>(
          <div key={r.id} className="card" style={{opacity:r.estado==="Archivado"?.6:1}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{fontSize:22}}>{CAT_ICON[r.categoria]}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:700,lineHeight:1.3}}>{r.nombre}</div>
                <span className="badge badge-info" style={{fontSize:9,marginTop:4}}>{r.categoria}</span>
              </div>
            </div>
            <div style={{fontSize:11.5,color:"#374151",marginBottom:8,lineHeight:1.4}}>{r.descripcion}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#9CA3AF"}}>{r.version} · {r.fecha}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span className={`badge ${r.estado==="Activo"?"badge-ok":"badge-gray"}`}>{r.estado}</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>toggleEstado(r)}>{r.estado==="Activo"?"Archivar":"Reactivar"}</button>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length===0&&<div className="card" style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:24,gridColumn:"1/-1"}}>Sin recursos en esta categoría.</div>}
      </div>

      {formAbierto&&(
        <div className="modal-overlay" onClick={()=>setFormAbierto(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="modal-title">Nuevo Recurso Documental</div><div className="modal-sub">Pruebas psicométricas, guías y plantillas</div></div>
              <div className="modal-close" onClick={()=>setFormAbierto(false)}>✕</div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div className="form-group" style={{flex:2}}>
                <label className="form-label">Categoría</label>
                <select className="form-control" value={f.categoria} onChange={e=>setF({...f,categoria:e.target.value})}>
                  {CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Versión</label>
                <input className="form-control" value={f.version} onChange={e=>setF({...f,version:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción / uso recomendado</label>
              <textarea className="form-control" rows={3} value={f.descripcion} onChange={e=>setF({...f,descripcion:e.target.value})}/>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} disabled={!f.nombre.trim()} onClick={crear}>💾 Agregar a la biblioteca</button>
          </div>
        </div>
      )}
    </div>
  );
}
