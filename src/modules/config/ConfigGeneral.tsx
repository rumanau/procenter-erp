import React, { useState } from "react";
import type { View } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function ConfigGeneral({setView,catalogos,setCatalogos}:{setView:(v:View)=>void;catalogos:typeof CATALOGOS_INIT;setCatalogos:(c:typeof CATALOGOS_INIT)=>void}) {
  const [tab,setTab]=useState("bodegas");
  const [editando,setEditando]=useState<any>(null);
  const [nuevo,setNuevo]=useState(false);
  const [form,setForm]=useState<any>({});

  const guardar=(seccion:string,item:any)=>{
    const lista=(catalogos as any)[seccion];
    const existe=lista.findIndex((x:any)=>x.id===item.id);
    const nueva=existe>=0?lista.map((x:any)=>x.id===item.id?item:x):[...lista,{...item,id:`${seccion.slice(0,2).toUpperCase()}${Date.now()}`}];
    setCatalogos({...catalogos,[seccion]:nueva});
    setEditando(null);setNuevo(false);setForm({});
  };
  const eliminar=(seccion:string,id:string)=>{
    if(!window.confirm("¿Eliminar este elemento?")) return;
    setCatalogos({...catalogos,[seccion]:(catalogos as any)[seccion].filter((x:any)=>x.id!==id)});
  };

  const tabs=[
    {id:"bodegas",icon:"🏭",label:"Bodegas"},
    {id:"areas",icon:"🏢",label:"Áreas / Destinos"},
    {id:"tiposSalida",icon:"📤",label:"Tipos de Salida"},
    {id:"motivosAjuste",icon:"⚖️",label:"Motivos de Ajuste"},
    {id:"proyectos",icon:"📋",label:"Proyectos / OT"},
    {id:"categorias",icon:"🏷️",label:"Categorías"},
    {id:"sucursales",icon:"🏪",label:"Sucursales"},
    {id:"proveedores",icon:"🤝",label:"Proveedores"},
    {id:"responsablesAutorizados",icon:"👤",label:"Responsables"},
    {id:"roles",icon:"🔐",label:"Roles"},
  ];

  const campos:Record<string,{key:string;label:string;type?:string}[]>={
    bodegas:[{key:"nombre",label:"Nombre"},{key:"ubicacion",label:"Ubicación"},{key:"encargado",label:"Encargado"}],
    areas:[{key:"nombre",label:"Nombre"},{key:"dept",label:"Departamento"}],
    tiposSalida:[{key:"nombre",label:"Nombre del tipo"}],
    motivosAjuste:[{key:"nombre",label:"Motivo"}],
    proyectos:[{key:"nombre",label:"Código / Nombre"},{key:"descripcion",label:"Descripción"}],
    categorias:[{key:"nombre",label:"Nombre"},{key:"prefijo",label:"Prefijo de código"}],
    sucursales:[{key:"nombre",label:"Nombre de la sucursal"}],
    proveedores:[{key:"nombre",label:"Nombre"},{key:"contacto",label:"Correo/Contacto"},{key:"condicion",label:"Cond. de pago"},{key:"rating",label:"Rating"}],
    responsablesAutorizados:[{key:"nombre",label:"Nombre"},{key:"puesto",label:"Puesto"},{key:"nivel",label:"Nivel (1-3)",type:"number"}],
    roles:[{key:"nombre",label:"Nombre del rol"},{key:"permisos",label:"Descripción permisos"},{key:"color",label:"Color hex"}],
  };

  const lista=(catalogos as any)[tab]||[];
  const camposActual=campos[tab]||[];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Configuración General</div>
            <div className="page-subtitle">Catálogos maestros editables · Fuente única de verdad para todos los módulos</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Módulos</button>
            <button className="btn btn-primary btn-sm" onClick={()=>{setNuevo(true);setForm({});setEditando(null);}}>➕ Nuevo</button>
          </div>
        </div>

        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:190,flexShrink:0}}>
            <div className="card" style={{padding:"6px 0"}}>
              {tabs.map(t=>(
                <div key={t.id} onClick={()=>{setTab(t.id);setEditando(null);setNuevo(false);}}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",cursor:"pointer",borderLeft:`3px solid ${tab===t.id?"#E8611A":"transparent"}`,background:tab===t.id?"#FFF3ED":"transparent",transition:"all .15s"}}>
                  <span style={{fontSize:14}}>{t.icon}</span>
                  <span style={{fontSize:12.5,fontWeight:tab===t.id?600:400,color:tab===t.id?"#E8611A":"#374151"}}>{t.label}</span>
                  <span style={{marginLeft:"auto",fontSize:10,color:"#9CA3AF",fontWeight:600}}>{((catalogos as any)[t.id]||[]).length}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{flex:1}}>
            {(nuevo||editando)&&(
              <div className="card" style={{marginBottom:12,border:"1.5px solid #E8611A",background:"#FFFDF9"}}>
                <div className="card-title" style={{color:"#E8611A",marginBottom:10}}>{nuevo?"Nuevo registro":"Editar registro"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:12}}>
                  {camposActual.map(c=>(
                    <div key={c.key} className="form-group" style={{margin:0}}>
                      <label className="form-label">{c.label}</label>
                      <input className="form-control" type={c.type||"text"} value={form[c.key]||""} onChange={e=>setForm({...form,[c.key]:e.target.value})} placeholder={c.label}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-primary btn-sm" onClick={()=>guardar(tab,editando?{...editando,...form}:{...form})}>💾 Guardar</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setEditando(null);setNuevo(false);setForm({});}}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,fontWeight:700,flex:1}}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</span>
                <span style={{fontSize:11.5,color:"#6B7280"}}>{lista.length} registros</span>
              </div>
              {lista.length===0?(
                <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>
                  <div style={{fontSize:32,marginBottom:8}}>📂</div>
                  <div style={{fontSize:13}}>Sin registros. Haz clic en "Nuevo" para agregar.</div>
                </div>
              ):(
                <table className="tbl">
                  <thead>
                    <tr>
                      {camposActual.map(c=><th key={c.key}>{c.label}</th>)}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((item:any)=>(
                      <tr key={item.id}>
                        {camposActual.map(c=>(
                          <td key={c.key} style={{fontSize:12.5}}>
                            {c.key==="color"?<span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:14,height:14,borderRadius:3,background:item[c.key],border:"1px solid #E5E7EB",display:"inline-block"}}/>{item[c.key]}</span>:item[c.key]||"—"}
                          </td>
                        ))}
                        <td>
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>{setEditando(item);setForm({...item});setNuevo(false);}}>✏️</button>
                            <button className="btn btn-ghost btn-sm" style={{color:"#EF4444"}} onClick={()=>eliminar(tab,item.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">¿Cómo funciona?</div>
        <div style={{fontSize:11.5,color:"#374151",lineHeight:1.7,marginBottom:12}}>
          Los catálogos aquí editados alimentan automáticamente todos los dropdowns del sistema. Sin tocar código.
        </div>
        {[
          {icon:"📤",texto:"Tipos de salida → Registrar Salida"},
          {icon:"🏭",texto:"Bodegas → Traslados y stock"},
          {icon:"📋",texto:"Proyectos → Asociar movimientos"},
          {icon:"👤",texto:"Responsables → Aprobaciones"},
          {icon:"🤝",texto:"Proveedores → Ingresos y OC"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5,color:"#6B7280"}}>
            <span>{r.icon}</span><span>{r.texto}</span>
          </div>
        ))}
        <div style={{height:12}}/>
        <div style={{background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:8,padding:"10px 12px",fontSize:11.5,color:"#065F46"}}>
          ✅ Agregar una nueva bodega, área o proveedor = 1 clic. Sin programar nada.
        </div>
      </div>
    </div>
  );
}
