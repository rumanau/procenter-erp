import React, { useState } from "react";
import type { View } from "../../types";
import { Stepper } from "../../components/Stepper";

export function NuevoArticulo({step,setStep,setView}:{step:number;setStep:(s:number)=>void;setView:(v:View)=>void}) {
  const nav=(n:number)=>setStep(Math.max(1,Math.min(6,n)));
  const finish=()=>{alert("✅ Artículo registrado exitosamente!\n\nCódigo: HER-EQO-000154\nUbicación: Central › Pasillo B › Estante 5\nProveedor: TechnoSupply · $3,150.00");setView("inventario");setStep(1);};
  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Nuevo Artículo</div><div className="page-subtitle">Registra un nuevo ítem en el inventario · Workflow secuencial · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm">⚙️ Configurar Artículos</button>
      </div>
      <Stepper step={step} setStep={setStep}/>
      {step===1&&<Step1/>}{step===2&&<Step2/>}{step===3&&<Step3/>}
      {step===4&&<Step4/>}{step===5&&<Step5/>}{step===6&&<Step6/>}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
        {step>1&&<button className="btn btn-ghost" onClick={()=>nav(step-1)}>← Anterior</button>}
        <button className="btn btn-secondary" onClick={()=>setView("inventario")}>Cancelar</button>
        {step<6?<button className="btn btn-primary" onClick={()=>nav(step+1)}>Siguiente →</button>
               :<button className="btn btn-success" onClick={finish}>✓ Registrar Artículo</button>}
      </div>
    </div>
  );
}

export function Step1() {
  const [estado,setEstado]=useState("Nuevo");
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Datos del Artículo</div>
        <div className="form-group"><label className="form-label">Nombre del Artículo</label><input className="form-control" defaultValue="Taladro Inalámbrico DeWalt 20V"/></div>
        <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={2} placeholder="Escriba una descripción del artículo..."/></div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Código</label><input className="form-control" defaultValue="INV-HR-00158"/></div>
          <div className="form-group"><label className="form-label">Tipo</label><select className="form-control"><option>Herramienta</option><option>Consumible</option><option>Activo Fijo</option></select></div>
        </div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Modelo</label><input className="form-control" defaultValue="DCD777C2"/></div>
          <div className="form-group"><label className="form-label">Material</label><select className="form-control"><option>Metal</option><option>Plástico</option><option>Mixto</option></select></div>
        </div>
        <div className="form-group"><label className="form-label">Estado físico</label>
          <div className="pills-row">{["Nuevo","Usado","Dañado","Caducado","En cuarentena"].map(e=><div key={e} className={`pill ${estado===e?"sel":""}`} onClick={()=>setEstado(e)}>{e}</div>)}</div>
        </div>
      </div>
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Foto del Artículo</div>
          <div className="photo-box"><div style={{fontSize:40}}>🔧</div><div style={{fontSize:12,color:"#6B7280",marginTop:8}}>Arrastra o selecciona imagen</div><button className="btn btn-secondary btn-sm" style={{marginTop:8}}>📷 Subir Foto</button></div>
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Clasificación previa</div>
          {[["Categoría","Herramienta"],["Marca","DEWALT"],["Modelo","DCD777C2"],["Subcategoría","Percusión"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step2() {
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Clasificación Operativa</div>
        <div className="form-group"><label className="form-label">Centro de Costos</label><select className="form-control"><option>Mantenimiento</option><option>Operaciones</option><option>Finanzas</option></select></div>
        <div className="form-group"><label className="form-label">Destino del Artículo</label><select className="form-control"><option>Uso Operativo</option><option>Venta</option><option>Activo Fijo</option></select></div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Clasificación ABC</label><select className="form-control"><option>A - Crítico</option><option>B - Importante</option><option>C - Regular</option></select></div>
          <div className="form-group"><label className="form-label">Logística</label><select className="form-control"><option>Ambiente / Seco</option><option>Frío</option><option>Peligroso</option></select></div>
        </div>
        <div className="form-group"><label className="form-label">Tipo de Embalaje</label><select className="form-control"><option>Caja</option><option>Pallet</option><option>Bolsa</option></select></div>
        <div className="toggle-row"><span style={{fontSize:12}}>Control de Caducidad</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        <div className="toggle-row"><span style={{fontSize:12}}>Requiere Lote / Serie</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        <div className="toggle-row"><span style={{fontSize:12}}>Permite Fraccionamiento</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
      </div>
      <div className="card">
        <div className="card-title">Control Técnico</div>
        <div className="toggle-row"><span style={{fontSize:12,fontWeight:600}}>Requiere Mantenimiento</span><div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        <div className="form-group" style={{marginTop:10}}><label className="form-label">Frecuencia</label><select className="form-control"><option>Cada 3 meses</option><option>Mensual</option><option>Semestral</option></select></div>
        <div className="form-group"><label className="form-label">Responsable</label><select className="form-control"><option>Jules Ramirez</option><option>María Rojas</option></select></div>
        <div className="form-group"><label className="form-label">Método de Valuación</label><select className="form-control"><option>FIFO</option><option>LIFO</option><option>Promedio Ponderado</option></select></div>
      </div>
    </div>
  );
}

export function Step3() {
  return (
    <div className="g2">
      <div className="card">
        <div className="card-title">Ubicación del Artículo</div>
        <div className="form-group"><label className="form-label">Sucursal / Bodega</label><select className="form-control"><option>Central / Bodega General</option><option>Bodega 2</option><option>Bodega 3</option></select></div>
        <div className="g2">
          <div className="form-group"><label className="form-label">Zona / Pasillo</label><select className="form-control"><option>Pasillo B</option><option>Zona de Frío</option><option>Área Seca</option></select></div>
          <div className="form-group"><label className="form-label">Estante / Casilla</label><select className="form-control"><option>Estante 5 / Casilla 14</option><option>Estante 3</option></select></div>
        </div>
        <div className="form-group"><label className="form-label">Responsable</label><select className="form-control"><option>Jules Ramirez — Coordinador</option><option>María Rojas</option></select></div>
        <div className="g3">
          <div className="form-group"><label className="form-label">Reorden</label><input className="form-control" defaultValue="5 Uds."/></div>
          <div className="form-group"><label className="form-label">Crítico</label><input className="form-control" defaultValue="2 Uds."/></div>
          <div className="form-group"><label className="form-label">Mínimo</label><input className="form-control" defaultValue="3 Uds."/></div>
        </div>
        <div className="toggle-row"><span style={{fontSize:12}}>Trazabilidad de Caducidad</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
      </div>
      <div className="card">
        <div className="card-title">Mapa de Bodega</div>
        <div style={{background:"linear-gradient(135deg,#e8f0fe,#dde9ff)",borderRadius:8,height:130,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,border:"1px solid #c7d7ff",marginBottom:10}}>
          <div style={{width:14,height:14,background:"#E8611A",borderRadius:"50%",border:"3px solid #fff",boxShadow:"0 2px 6px rgba(232,97,26,.4)"}}/>
          <div style={{fontSize:11,color:"#185FA5",fontWeight:500}}>Bodega Central · Pasillo B · Est.5 · Cas.14</div>
        </div>
        <div className="resumen">
          {[["Código","HAR-1050"],["Bodega","Central / General"],["Pasillo","B"],["Posición","Estante 5 / Casilla 14"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step4() {
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">Proveedor</div>
          <div className="form-group"><label className="form-label">Proveedor</label><select className="form-control"><option>TechnoSupply</option><option>MegaTools</option><option>ElectroMayorista</option></select></div>
          <div className="form-group"><label className="form-label">Referencia / Núm. Parte</label><input className="form-control" defaultValue="DCD777C2"/></div>
          <div className="form-group"><label className="form-label">Condiciones de Pago</label><select className="form-control"><option>30 días crédito</option><option>Contado</option><option>60 días</option></select></div>
          <div className="toggle-row"><span style={{fontSize:12}}>Proveedor Principal</span><div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
          <div className="toggle-row"><span style={{fontSize:12}}>Incluye IVA</span><div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
          <div className="toggle-row"><span style={{fontSize:12}}>Aplicar descuento especial</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
        </div>
        <div className="card">
          <div className="card-title">Costos del Artículo</div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Moneda</label><select className="form-control"><option>MXN</option><option>USD</option><option>CRC</option></select></div>
            <div className="form-group"><label className="form-label">Precio Base</label><input className="form-control" defaultValue="$3,200.00"/></div>
          </div>
          <div style={{background:"#F4F5F7",borderRadius:7,padding:10,fontSize:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#6B7280"}}>IVA 16%</span><span>$512.00</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#6B7280"}}>Especial 4%</span><span>$128.00</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,borderTop:"1px solid #E5E7EB",paddingTop:4}}><span>Total</span><span style={{color:"#E8611A"}}>$3,840.00</span></div>
          </div>
        </div>
      </div>
      <div>
        <div className="resumen" style={{marginBottom:12}}>
          <div className="panel-title" style={{marginBottom:8}}>Resumen</div>
          {[["Factura","WH4ER0347"],["Costo Prom.","$3,269.50"],["Último Costo","$3,150.00"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{color:l==="Costo Prom."?"#E8611A":l==="Último Costo"?"#10B981":undefined}}>{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Comparativa Proveedores</div>
          {[["🟠","TechnoSupply","$3,150.00","#10B981"],["🔵","MegaTools","Pendiente","#9CA3AF"],["🟣","ElectroMayorista","$3,400.00","#9CA3AF"]].map(([d,n,p,c])=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",border:"1px solid #E5E7EB",borderRadius:7,marginBottom:6,fontSize:12}}>
              <span>{d}</span><span style={{flex:1,fontWeight:600}}>{n}</span><span style={{color:c,fontWeight:600}}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step5() {
  const alerts=[
    {icon:"⚠️",bg:"#FFFBEB",title:"Bajo Stock",desc:"Alerta cuando el inventario esté por debajo del mínimo.",email:"compras@procenter.com"},
    {icon:"📋",bg:"#FEF2F2",title:"Reporte de Daño",desc:"Notificación cuando se registre un reporte de daño.",email:"calidad@procenter.com"},
    {icon:"🔧",bg:"#EFF6FF",title:"Mantenimiento No Realizado",desc:"Recordatorio si no se registra el mantenimiento a tiempo.",email:"mantenimiento@procenter.com"},
  ];
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div>
        <div className="card" style={{marginBottom:12}}>
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
        <div className="form-group"><label className="form-label">Notas Adicionales (Opcional)</label><textarea className="form-control" rows={3} placeholder="Observaciones adicionales..."/></div>
      </div>
      <div>
        <div className="resumen" style={{marginBottom:12}}>
          <div className="panel-title" style={{marginBottom:8}}>Resumen — Paso 5 de 6</div>
          {[["Código","INV-HR-00158"],["Tipo","Herramienta"],["Ubicación","Central › Est.5 › Cas.14"],["Proveedor","TechnoSupply"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val">{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Adjuntos Requeridos</div>
          {[["📷","Foto del Producto","JPG, PNG · Máx 5MB",true],["📄","Ficha Técnica","PDF, DOC · Máx 10MB",true],["📖","Manual / Procedimiento","PDF · Máx 10MB",false],["🔲","Código de Barras","JPG, PNG · Máx 3MB",false]].map(([ic,n,f,req])=>(
            <div key={n as string} className="toggle-row">
              <div style={{display:"flex",alignItems:"center",gap:8}}><span>{ic}</span><div><div style={{fontSize:12,fontWeight:600}}>{n}</div><div style={{fontSize:10,color:"#6B7280"}}>{f}</div></div></div>
              <span className={`badge ${req?"badge-crit":"badge-gray"}`}>{req?"Obligatorio":"Opcional"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step6() {
  return (
    <div className="g2" style={{alignItems:"start"}}>
      <div className="card">
        <div className="card-title">Identificación y Codificación</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {[{v:"existente",l:"Leer código existente",d:"Escanear o digitar el código del proveedor.",a:false},
            {v:"procenter",l:"Generar código PROCENTER",d:"Crear un código interno único.",a:false},
            {v:"ambos",l:"Usar ambos",d:"Registrar y crear códigos externo e interno.",a:true}].map(o=>(
            <label key={o.v} style={{display:"flex",alignItems:"flex-start",gap:8,padding:8,border:`1.5px solid ${o.a?"#E8611A":"#E5E7EB"}`,borderRadius:8,background:o.a?"#FFF3ED":"#fff",cursor:"pointer"}}>
              <input type="radio" name="codtype" defaultChecked={o.a} style={{marginTop:2}}/>
              <div><div style={{fontSize:12.5,fontWeight:600,color:o.a?"#E8611A":undefined}}>{o.l}</div><div style={{fontSize:11,color:"#6B7280"}}>{o.d}</div></div>
            </label>
          ))}
        </div>
        <div className="form-group"><label className="form-label">Código Externo (EAN-13)</label>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-primary btn-sm">📷 Escanear</button>
            <button className="btn btn-secondary btn-sm">Digitar manual</button>
            <div style={{flex:1,background:"#F4F5F7",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#6B7280"}}>7093459 (EAN-13)</div>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Código Interno PROCENTER</label>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <select className="form-control" style={{width:70}}><option>HER</option></select>
            <select className="form-control" style={{width:70}}><option>EQO</option></select>
            <select className="form-control" style={{width:70}}><option>00054</option></select>
            <div style={{flex:1,background:"#FFF3ED",border:"1.5px solid #E8611A",borderRadius:7,padding:"6px 10px",fontSize:12.5,fontWeight:700,color:"#E8611A"}}>HER-EQO-000154</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-secondary btn-sm">🖨️ Imprimir Etiqueta</button>
          <button className="btn btn-secondary btn-sm">💾 Guardar</button>
        </div>
      </div>
      <div>
        <div className="resumen" style={{marginBottom:12}}>
          <div className="panel-title" style={{marginBottom:8}}>Resumen Final</div>
          {[["Código","HER-EQO-000154"],["Tipo","Herramienta"],["Nombre","Taladro DeWalt 20V"],["Inventariable","Sí"],["Proveedor","TechnoSupply"],["Precio","$3,150.00 MXN"]].map(([l,v])=>(
            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{fontSize:12}}>Vista Previa Etiqueta</div>
          <div style={{border:"2px solid #1B1F2E",borderRadius:6,padding:12,textAlign:"center",background:"#fff"}}>
            <div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:11,fontWeight:700,marginBottom:4}}>HER-EQO-000154</div>
            <div style={{fontFamily:"monospace",fontSize:22,letterSpacing:2,color:"#1B1F2E",lineHeight:1}}>▌▌▌▌▌▌▌▌▌</div>
            <div style={{fontSize:9,letterSpacing:1,color:"#6B7280",margin:"4px 0"}}>7501234567890 · EAN-13</div>
            <div style={{fontSize:9,color:"#9CA3AF"}}>50mm × 25mm · Bodega Central</div>
          </div>
        </div>
      </div>
    </div>
  );
}
