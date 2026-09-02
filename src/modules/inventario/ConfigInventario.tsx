import React, { useState } from "react";
import type { View, Bodega, CategoriaInventario, Articulo } from "../../types";

export function ConfigInventario({setView,bodegas,setBodegas,categorias,setCategorias,articulos}:{setView:(v:View)=>void;bodegas:Bodega[];setBodegas:React.Dispatch<React.SetStateAction<Bodega[]>>;categorias:CategoriaInventario[];setCategorias:React.Dispatch<React.SetStateAction<CategoriaInventario[]>>;articulos:Articulo[]}) {
  const [tab,setTab]=useState("bodegas");
  const itemsPorBodega=(id:string)=>articulos.filter(a=>a.activo&&a.bodegaId===id).length;
  const itemsPorCat=(id:string)=>articulos.filter(a=>a.activo&&a.categoriaId===id).length;
  const tabs=[["bodegas","🏭 Bodegas"],["categorias","📂 Categorías"],["alertas","🔔 Alertas"],["flujos","🔄 Flujos de Aprobación"],["importar","📤 Importar"],["general","⚙️ General"]];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Configuración — Inventario</div><div className="page-subtitle">Bodegas, categorías, alertas y flujos de aprobación</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="tab-bar" style={{marginBottom:14}}>
        {tabs.map(([id,label])=>(
          <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{label}</div>
        ))}
      </div>

      {tab==="bodegas"&&<div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
          <button className="btn btn-primary btn-sm" onClick={()=>setBodegas(p=>[...p,{id:`B${Date.now()}`,nombre:"Nueva Bodega",ubicacion:"",tipo:"General",encargado:"—",activa:true}])}>➕ Nueva Bodega</button>
        </div>
        {bodegas.map(b=>(
          <div key={b.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,background:b.activa?"#FFF3ED":"#F3F4F6",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏭</div>
            <div style={{flex:1}}>
              <input className="form-control" value={b.nombre} onChange={e=>setBodegas(p=>p.map(x=>x.id===b.id?{...x,nombre:e.target.value}:x))} style={{fontWeight:600,marginBottom:4}}/>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <select className="form-control" style={{width:120}} value={b.tipo} onChange={e=>setBodegas(p=>p.map(x=>x.id===b.id?{...x,tipo:e.target.value as Bodega["tipo"]}:x))}>
                  <option>General</option><option>Frío</option><option>Peligroso</option><option>Seco</option>
                </select>
                <span className="badge badge-info">{itemsPorBodega(b.id)} artículos</span>
                <span className={`badge ${b.activa?"badge-ok":"badge-gray"}`}>{b.activa?"Activa":"Inactiva"}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setBodegas(p=>p.map(x=>x.id===b.id?{...x,activa:!x.activa}:x))}>{b.activa?"⏸ Desactivar":"▶ Activar"}</button>
              <button className="btn btn-ghost btn-sm" disabled={itemsPorBodega(b.id)>0} title={itemsPorBodega(b.id)>0?"No se puede eliminar: tiene artículos asignados":""} onClick={()=>setBodegas(p=>p.filter(x=>x.id!==b.id))}>🗑</button>
            </div>
          </div>
        ))}
      </div>}

      {tab==="categorias"&&<div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
          <button className="btn btn-primary btn-sm" onClick={()=>setCategorias(p=>[...p,{id:`C${Date.now()}`,nombre:"Nueva Categoría",prefijo:"NUE",icono:"📦",activa:true}])}>➕ Nueva Categoría</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
          {categorias.map(c=>(
            <div key={c.id} className="card" style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:28}}>{c.icono}</div>
              <div style={{flex:1}}>
                <input className="form-control" value={c.nombre} onChange={e=>setCategorias(p=>p.map(x=>x.id===c.id?{...x,nombre:e.target.value}:x))} style={{fontWeight:600,marginBottom:4}}/>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span className="badge badge-info">{itemsPorCat(c.id)} artículos</span>
                  <span className={`badge ${c.activa?"badge-ok":"badge-gray"}`}>{c.activa?"Activa":"Inactiva"}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:4}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setCategorias(p=>p.map(x=>x.id===c.id?{...x,activa:!x.activa}:x))}>{c.activa?"⏸":"▶"}</button>
                <button className="btn btn-ghost btn-sm" disabled={itemsPorCat(c.id)>0} title={itemsPorCat(c.id)>0?"No se puede eliminar: tiene artículos asignados":""} onClick={()=>setCategorias(p=>p.filter(x=>x.id!==c.id))}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {tab==="alertas"&&<div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Alertas de Stock</div>
          {[
            {icon:"🔴",label:"Nivel Crítico",desc:"El sistema marca crítico cuando el stock cae por debajo del 50% del mínimo",val:"50",unit:"% del mín.",activa:true},
            {icon:"🟡",label:"Bajo Mínimo",desc:"Notificar cuando el stock llegue al mínimo configurado por artículo",val:"100",unit:"% del mín.",activa:true},
            {icon:"🔄",label:"Reorden Automático",desc:"Generar sugerencia de compra automáticamente",val:"8",unit:"Uds.",activa:false},
          ].map(a=>(
            <div key={a.label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
              <span style={{fontSize:20}}>{a.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{a.label}</div>
                <div style={{fontSize:11,color:"#6B7280"}}>{a.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="number" className="form-control" defaultValue={a.val} style={{width:55}}/>
                <span style={{fontSize:12,color:"#6B7280"}}>{a.unit}</span>
              </div>
              <div className={`toggle ${a.activa?"on":""}`} onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Destinatarios de Alertas</div>
          <div className="form-group"><label className="form-label">Encargado de Inventario</label><input className="form-control" defaultValue="jules@procenter.com"/></div>
          <div className="form-group"><label className="form-label">Director de Operaciones</label><input className="form-control" defaultValue="ronald@procenter.com"/></div>
          <div className="form-group"><label className="form-label">Departamento de Compras</label><input className="form-control" defaultValue="compras@procenter.com"/></div>
        </div>
      </div>}

      {tab==="flujos"&&<div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Flujos de Aprobación por Operación</div>
          {[
            {op:"📥 Ingreso de Artículos",pasos:["Encargado de bodega"],icon:"badge-ok"},
            {op:"📤 Salidas (Consumo/Despacho)",pasos:["Encargado de bodega"],icon:"badge-ok"},
            {op:"⚖️ Ajuste de Inventario",pasos:["Supervisor Inventario","Director"],icon:"badge-warn"},
            {op:"🗑️ Baja / Descarte",pasos:["Encargado Inventario","Director General"],icon:"badge-crit"},
            {op:"📋 Orden de Compra",pasos:["Encargado","Compras","Director"],icon:"badge-warn"},
          ].map(f=>(
            <div key={f.op} style={{padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{fontSize:12.5,fontWeight:600,marginBottom:6}}>{f.op}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {f.pasos.map((p,i)=>(
                  <React.Fragment key={p}>
                    <div style={{padding:"4px 10px",borderRadius:6,background:"#F4F5F7",fontSize:11.5,fontWeight:500}}>
                      <span style={{color:"#6B7280",marginRight:4}}>{i+1}.</span>{p}
                    </div>
                    {i<f.pasos.length-1&&<span style={{color:"#9CA3AF",alignSelf:"center"}}>→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>}

      {tab==="importar"&&<div>
        <div className="card" style={{maxWidth:600,margin:"40px auto",textAlign:"center",padding:40}}>
          <div style={{fontSize:48,marginBottom:12}}>📤</div>
          <div className="card-title">Importar Artículos desde Archivo</div>
          <div style={{fontSize:14,color:"#6B7280",marginBottom:24,lineHeight:1.6}}>
            Carga masiva de artículos desde un archivo CSV o Excel. El sistema validará cada registro y te mostrará un preview antes de confirmar la importación.
          </div>
          <div style={{display:"flex",gap:12,flexDirection:"column",marginBottom:24}}>
            <div style={{padding:16,background:"#F0F9FF",borderRadius:8,borderLeft:"4px solid #0284C7"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#0C4A6E",marginBottom:6}}>📋 Plantilla Requerida</div>
              <div style={{fontSize:12,color:"#0C4A6E"}}>Descarga la plantilla Excel con ejemplos y validaciones preconfiguradas</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="CARGA_MASIVA_INVENTARIO_PROCENTER.xlsx" download className="btn btn-secondary btn-sm">
              📥 Descargar Plantilla Excel
            </a>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("importar-articulos")}>
              📤 Iniciar Importación
            </button>
          </div>
        </div>
      </div>}

      {tab==="general"&&<div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Configuración General</div>
          <div className="form-group"><label className="form-label">Método de Valuación por Defecto</label>
            <select className="form-control"><option>FIFO</option><option>Promedio Ponderado</option><option>LIFO</option></select>
          </div>
          <div className="form-group"><label className="form-label">Moneda</label>
            <select className="form-control"><option>CRC — Colón Costarricense</option><option>USD — Dólar</option></select>
          </div>
          <div className="form-group"><label className="form-label">Prefijo de Código Interno</label>
            <div className="g3">
              <input className="form-control" defaultValue="HER" placeholder="Cat."/>
              <input className="form-control" defaultValue="EQO" placeholder="Sub."/>
              <div className="form-control" style={{background:"#F9FAFB",color:"#6B7280",fontSize:11.5}}>→ HER-EQO-00001</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
            {[["Trazabilidad obligatoria por artículo",true],["Requerir folio en cada movimiento",true],["Control de caducidad activo",false],["Alertas por email automáticas",true],["Firma digital en documentos",false]].map(([l,a])=>(
              <div key={l as string} className="toggle-row">
                <span style={{fontSize:12.5}}>{l}</span>
                <div className={`toggle ${a?"on":""}`} onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Cumplimiento ISO 9001</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {[["§7.5","Control de información documentada","badge-ok","✓ Activo"],["§8.5","Producción y provisión del servicio","badge-ok","✓ Activo"],["§9.1","Seguimiento, medición, análisis","badge-ok","✓ Activo"],["§10.2","No conformidad y acción correctiva","badge-warn","⚠ Parcial"]].map(([art,desc,cl,est])=>(
              <div key={art} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:7,fontSize:12}}>
                <b style={{fontFamily:"monospace",color:"#E8611A",minWidth:32}}>{art}</b>
                <span style={{flex:1,color:"#374151"}}>{desc}</span>
                <span className={`badge ${cl}`}>{est}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{width:"100%"}}>📄 Generar Reporte ISO 9001</button>
        </div>
      </div>}

      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
        <button className="btn btn-secondary" onClick={()=>setView("inventario")}>Cancelar</button>
        <button className="btn btn-primary" onClick={()=>alert("✅ Configuración guardada exitosamente.")}>💾 Guardar Cambios</button>
      </div>
    </div>
  );
}
