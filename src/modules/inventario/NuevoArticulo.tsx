import React, { useState } from "react";
import type { View, Articulo, Bodega, CategoriaInventario, ProveedorInventario } from "../../types";
import { Stepper } from "../../components/Stepper";

interface DatosNuevo {
  nombre: string; descripcion: string; categoriaId: string;
  bodegaId: string; min: number; max: number; unidad: string;
  proveedorId: string; costoUnitario: number;
}
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function NuevoArticulo({step,setStep,setView,articulos,setArticulos,bodegas,categorias,proveedores}:{step:number;setStep:(s:number)=>void;setView:(v:View)=>void;articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;bodegas:Bodega[];categorias:CategoriaInventario[];proveedores:ProveedorInventario[]}) {
  const [datos,setDatos]=useState<DatosNuevo>({
    nombre:"",descripcion:"",categoriaId:categorias[0]?.id||"",
    bodegaId:bodegas[0]?.id||"",min:5,max:20,unidad:"Pzas.",
    proveedorId:proveedores[0]?.id||"",costoUnitario:0,
  });
  const set=<K extends keyof DatosNuevo>(k:K,v:DatosNuevo[K])=>setDatos(p=>({...p,[k]:v}));

  const nav=(n:number)=>setStep(Math.max(1,Math.min(6,n)));
  const categoria=categorias.find(c=>c.id===datos.categoriaId);
  const seqExistente=articulos.filter(a=>a.categoriaId===datos.categoriaId).length+1;
  const codigoGenerado=`${categoria?.prefijo||"GEN"}-NEW-${String(seqExistente).padStart(5,"0")}`;
  const listo=datos.nombre.trim().length>2;

  const finish=()=>{
    if(!listo) return;
    const nuevo:Articulo={
      id:codigoGenerado,nombre:datos.nombre.trim(),descripcion:datos.descripcion||`${datos.nombre} — ${categoria?.nombre.toLowerCase()}`,
      categoriaId:datos.categoriaId,bodegaId:datos.bodegaId,unidad:datos.unidad,
      stock:0,min:datos.min,max:datos.max,costoUnitario:datos.costoUnitario,
      proveedorId:datos.proveedorId,metodoValuacion:"Promedio",activo:true,fechaCreacion:hoy(),
    };
    setArticulos(prev=>[nuevo,...prev]);
    alert(`✅ Artículo registrado exitosamente!\n\nCódigo: ${codigoGenerado}\nBodega: ${bodegas.find(b=>b.id===datos.bodegaId)?.nombre}\nProveedor: ${proveedores.find(p=>p.id===datos.proveedorId)?.nombre}`);
    setView("existencias");setStep(1);
    setDatos({nombre:"",descripcion:"",categoriaId:categorias[0]?.id||"",bodegaId:bodegas[0]?.id||"",min:5,max:20,unidad:"Pzas.",proveedorId:proveedores[0]?.id||"",costoUnitario:0});
  };
  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Nuevo Artículo</div><div className="page-subtitle">Registra un nuevo ítem en el inventario · Workflow secuencial · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("config-inv")}>⚙️ Configurar Artículos</button>
      </div>
      <Stepper step={step} setStep={setStep}/>
      {step===1&&<Step1 datos={datos} set={set} categorias={categorias}/>}
      {step===2&&<Step2/>}
      {step===3&&<Step3 datos={datos} set={set} bodegas={bodegas}/>}
      {step===4&&<Step4 datos={datos} set={set} proveedores={proveedores}/>}
      {step===5&&<Step5/>}
      {step===6&&<Step6 datos={datos} codigo={codigoGenerado} categoria={categoria}/>}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
        {step>1&&<button className="btn btn-ghost" onClick={()=>nav(step-1)}>← Anterior</button>}
        <button className="btn btn-secondary" onClick={()=>setView("inventario")}>Cancelar</button>
        {step<6?<button className="btn btn-primary" disabled={step===1&&!listo} onClick={()=>nav(step+1)}>Siguiente →</button>
               :<button className="btn btn-success" disabled={!listo} onClick={finish}>✓ Registrar Artículo</button>}
      </div>
    </div>
  );
}

function Step1({datos,set,categorias}:{datos:DatosNuevo;set:<K extends keyof DatosNuevo>(k:K,v:DatosNuevo[K])=>void;categorias:CategoriaInventario[]}) {
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Datos del Artículo</div>
        <div className="form-group"><label className="form-label">Nombre del Artículo</label><input className="form-control" value={datos.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Taladro Inalámbrico DeWalt 20V"/></div>
        <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={2} placeholder="Escriba una descripción del artículo..." value={datos.descripcion} onChange={e=>set("descripcion",e.target.value)}/></div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Categoría</label>
            <select className="form-control" value={datos.categoriaId} onChange={e=>set("categoriaId",e.target.value)}>
              {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Unidad de Medida</label>
            <select className="form-control" value={datos.unidad} onChange={e=>set("unidad",e.target.value)}>
              <option>Pzas.</option><option>Cajas</option><option>Uds.</option><option>Kg</option><option>Rollos</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Foto del Artículo</div>
          <div className="photo-box"><div style={{fontSize:40}}>{categorias.find(c=>c.id===datos.categoriaId)?.icono||"🔧"}</div><div style={{fontSize:12,color:"#6B7280",marginTop:8}}>Arrastra o selecciona imagen</div><button className="btn btn-secondary btn-sm" style={{marginTop:8}}>📷 Subir Foto</button></div>
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Vista previa</div>
          {[["Nombre",datos.nombre||"—"],["Categoría",categorias.find(c=>c.id===datos.categoriaId)?.nombre||"—"],["Unidad",datos.unidad]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2() {
  const [estado,setEstado]=useState("Nuevo");
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Clasificación Operativa</div>
        <div className="form-group"><label className="form-label">Centro de Costos</label><select className="form-control"><option>Mantenimiento</option><option>Operaciones</option><option>Finanzas</option></select></div>
        <div className="form-group"><label className="form-label">Destino del Artículo</label><select className="form-control"><option>Uso Operativo</option><option>Venta</option><option>Activo Fijo</option></select></div>
        <div className="form-group"><label className="form-label">Estado físico</label>
          <div className="pills-row">{["Nuevo","Usado","Dañado","En cuarentena"].map(e=><div key={e} className={`pill ${estado===e?"sel":""}`} onClick={()=>setEstado(e)}>{e}</div>)}</div>
        </div>
        <div className="toggle-row"><span style={{fontSize:12}}>Control de Caducidad</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        <div className="toggle-row"><span style={{fontSize:12}}>Requiere Lote / Serie</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
      </div>
      <div className="card">
        <div className="card-title">Control Técnico</div>
        <div className="toggle-row"><span style={{fontSize:12,fontWeight:600}}>Requiere Mantenimiento</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        <div className="form-group" style={{marginTop:10}}><label className="form-label">Frecuencia</label><select className="form-control"><option>Cada 3 meses</option><option>Mensual</option><option>Semestral</option></select></div>
        <div className="form-group"><label className="form-label">Responsable</label><select className="form-control"><option>Jules Ramirez</option><option>María Rojas</option></select></div>
      </div>
    </div>
  );
}

function Step3({datos,set,bodegas}:{datos:DatosNuevo;set:<K extends keyof DatosNuevo>(k:K,v:DatosNuevo[K])=>void;bodegas:Bodega[]}) {
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Ubicación del Artículo</div>
        <div className="form-group"><label className="form-label">Bodega</label>
          <select className="form-control" value={datos.bodegaId} onChange={e=>set("bodegaId",e.target.value)}>
            {bodegas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Stock Mínimo</label><input type="number" className="form-control" value={datos.min} min={0} onChange={e=>set("min",Math.max(0,parseInt(e.target.value)||0))}/></div>
          <div className="form-group"><label className="form-label">Stock Máximo</label><input type="number" className="form-control" value={datos.max} min={datos.min} onChange={e=>set("max",Math.max(datos.min,parseInt(e.target.value)||datos.min))}/></div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Mapa de Bodega</div>
        <div style={{background:"linear-gradient(135deg,#e8f0fe,#dde9ff)",borderRadius:8,height:130,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,border:"1px solid #c7d7ff",marginBottom:10}}>
          <div style={{width:14,height:14,background:"#E8611A",borderRadius:"50%",border:"3px solid #fff",boxShadow:"0 2px 6px rgba(232,97,26,.4)"}}/>
          <div style={{fontSize:11,color:"#185FA5",fontWeight:500}}>{bodegas.find(b=>b.id===datos.bodegaId)?.nombre}</div>
        </div>
        <div className="resumen">
          {[["Bodega",bodegas.find(b=>b.id===datos.bodegaId)?.nombre||"—"],["Mínimo",String(datos.min)],["Máximo",String(datos.max)]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({datos,set,proveedores}:{datos:DatosNuevo;set:<K extends keyof DatosNuevo>(k:K,v:DatosNuevo[K])=>void;proveedores:ProveedorInventario[]}) {
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Proveedor</div>
          <div className="form-group"><label className="form-label">Proveedor</label>
            <select className="form-control" value={datos.proveedorId} onChange={e=>set("proveedorId",e.target.value)}>
              {proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Condiciones de Pago</label><div className="form-control" style={{background:"#F9FAFB",color:"#6B7280"}}>{proveedores.find(p=>p.id===datos.proveedorId)?.condicion||"—"}</div></div>
        </div>
        <div className="card">
          <div className="card-title">Costos del Artículo</div>
          <div className="form-group"><label className="form-label">Costo Unitario (CRC)</label><input type="number" className="form-control" value={datos.costoUnitario} min={0} onChange={e=>set("costoUnitario",Math.max(0,parseFloat(e.target.value)||0))}/></div>
        </div>
      </div>
      <div>
        <div className="resumen" style={{marginBottom:12}}>
          <div className="panel-title" style={{marginBottom:8}}>Resumen</div>
          {[["Costo unitario",fmt(datos.costoUnitario)],["Proveedor",proveedores.find(p=>p.id===datos.proveedorId)?.nombre||"—"],["Rating",proveedores.find(p=>p.id===datos.proveedorId)?.rating||"—"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step5() {
  const alerts=[
    {icon:"⚠️",bg:"#FFFBEB",title:"Bajo Stock",desc:"Alerta cuando el inventario esté por debajo del mínimo.",email:"compras@procenter.com"},
    {icon:"📋",bg:"#FEF2F2",title:"Reporte de Daño",desc:"Notificación cuando se registre un reporte de daño.",email:"calidad@procenter.com"},
  ];
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div className="card">
        <div className="card-title">Alertas por Correo Electrónico</div>
        {alerts.map(a=>(
          <div key={a.title} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:10,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:26,height:26,background:a.bg,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>{a.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:600}}>{a.title}</div><div style={{fontSize:11,color:"#6B7280"}}>{a.desc}</div></div>
              <div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}><input className="form-control" defaultValue={a.email} style={{flex:1}}/><span className="badge badge-ok">✓ Válido</span></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title" style={{fontSize:12}}>Adjuntos Requeridos</div>
        {[["📷","Foto del Producto","JPG, PNG · Máx 5MB",true],["📄","Ficha Técnica","PDF, DOC · Máx 10MB",false]].map(([ic,n,f,req])=>(
          <div key={n as string} className="toggle-row">
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>{ic}</span><div><div style={{fontSize:12,fontWeight:600}}>{n}</div><div style={{fontSize:10,color:"#6B7280"}}>{f}</div></div></div>
            <span className={`badge ${req?"badge-crit":"badge-gray"}`}>{req?"Obligatorio":"Opcional"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step6({datos,codigo,categoria}:{datos:DatosNuevo;codigo:string;categoria?:CategoriaInventario}) {
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div className="card">
        <div className="card-title">Identificación y Codificación</div>
        <div className="form-group"><label className="form-label">Código Interno PROCENTER</label>
          <div style={{background:"#FFF3ED",border:"1.5px solid #E8611A",borderRadius:7,padding:"8px 12px",fontSize:14,fontWeight:700,color:"#E8611A"}}>{codigo}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-secondary btn-sm">🖨️ Imprimir Etiqueta</button>
        </div>
      </div>
      <div>
        <div className="resumen" style={{marginBottom:12}}>
          <div className="panel-title" style={{marginBottom:8}}>Resumen Final</div>
          {[["Código",codigo],["Categoría",categoria?.nombre||"—"],["Nombre",datos.nombre||"—"],["Costo",fmt(datos.costoUnitario)],["Stock inicial","0 (se ingresa vía Registrar Ingreso)"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Vista Previa Etiqueta</div>
          <div style={{border:"2px solid #1B1F2E",borderRadius:6,padding:12,textAlign:"center",background:"#fff"}}>
            <div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:11,fontWeight:700,marginBottom:4}}>{codigo}</div>
            <div style={{fontFamily:"monospace",fontSize:22,letterSpacing:2,color:"#1B1F2E",lineHeight:1}}>▌▌▌▌▌▌▌▌▌</div>
            <div style={{fontSize:9,color:"#9CA3AF"}}>50mm × 25mm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
