import React, { useState } from "react";
import type { View } from "../../types";

export function PortalSolicitudes({setView}:{setView:(v:View)=>void}) {
  const [catSel,setCatSel]=useState<string|null>(null);
  const [tipoSel,setTipoSel]=useState<string|null>(null);
  const [showForm,setShowForm]=useState(false);

  const categorias=[
    {id:"inventario",icon:"📦",label:"Inventario & Proveeduría",color:"#EFF6FF",border:"#BFDBFE",colorText:"#1D4ED8",
      tipos:["Herramienta / Equipo","Uniformes / EPP","Insumos / Consumibles","Compra de equipo nuevo","Baja o descarte","Reporte de daño","Otro inventario"]},
    {id:"rrhh",icon:"👥",label:"Recursos Humanos",color:"#ECFDF5",border:"#6EE7B7",colorText:"#065F46",
      tipos:["Vacaciones","Permiso personal","Incapacidad","Constancia laboral","Constancia salarial","Adelanto de salario","Uniformes / Gafete","Examen psicológico","Tramitación","Actualización de datos","Otra solicitud RRHH"]},
    {id:"operativo",icon:"⚙️",label:"Operaciones & Mantenimiento",color:"#FFF3ED",border:"#FED7AA",colorText:"#92400E",
      tipos:["Mantenimiento correctivo","Mantenimiento preventivo","Reparación de equipo","Solicitud de servicio externo","Reporte de incidente","Otro operativo"]},
    {id:"admin",icon:"🏛️",label:"Administrativo",color:"#F5F3FF",border:"#C4B5FD",colorText:"#5B21B6",
      tipos:["Reunión de departamento","Solicitud de acceso","Reporte de acoso laboral","Reporte de acoso sexual","Sugerencia","Otra administrativa"]},
    {id:"ti",icon:"💻",label:"Tecnología & Sistemas",color:"#FEF2F2",border:"#FCA5A5",colorText:"#991B1B",
      tipos:["Acceso a sistema","Soporte técnico","Equipo de cómputo","Cuenta / Usuario nuevo","Otro TI"]},
  ];

  const catActual=categorias.find(c=>c.id===catSel);

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <div className="page-title">Nueva Solicitud</div>
          <div className="page-subtitle">Selecciona el tipo de solicitud · Todas quedan registradas con número de caso y trazabilidad</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("bandeja")}>📭 Ver Bandeja de Gestión <span style={{background:"#E8611A",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:"9999px",marginLeft:4}}>10</span></button>
      </div>

      {!showForm ? (
        <>
          {!catSel && (
            <>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1B1F2E",marginBottom:12}}>¿Qué tipo de solicitud necesitas?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {categorias.map(cat=>(
                  <div key={cat.id} onClick={()=>setCatSel(cat.id)}
                    style={{padding:"20px 16px",borderRadius:"14px",border:`2px solid ${cat.border}`,background:cat.color,cursor:"pointer",transition:"all .15s",textAlign:"center"}}
                    onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";(e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 20px rgba(0,0,0,.08)";}}
                    onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.transform="";(e.currentTarget as HTMLDivElement).style.boxShadow="";}}>
                    <div style={{fontSize:32,marginBottom:8}}>{cat.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,color:cat.colorText}}>{cat.label}</div>
                    <div style={{fontSize:11,color:"#6B7280",marginTop:4}}>{cat.tipos.length} tipos disponibles</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{background:"#F9FAFB",border:"1px solid #E5E7EB"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12.5,color:"#6B7280"}}>
                  <span style={{fontSize:18}}>💡</span>
                  <span>Todas las solicitudes quedan registradas con <b style={{color:"#1B1F2E"}}>número de caso único</b>, fecha, estado y trazabilidad. El responsable del área recibe notificación automática.</span>
                </div>
              </div>
            </>
          )}

          {catSel && catActual && !tipoSel && (
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setCatSel(null)}>← Volver</button>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:8,background:catActual.color,border:`1px solid ${catActual.border}`}}>
                  <span>{catActual.icon}</span>
                  <span style={{fontSize:12.5,fontWeight:600,color:catActual.colorText}}>{catActual.label}</span>
                </div>
              </div>
              <div style={{fontSize:"13px",fontWeight:600,color:"#1B1F2E",marginBottom:12}}>¿Qué necesitas solicitar?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {catActual.tipos.map(tipo=>(
                  <div key={tipo} onClick={()=>{setTipoSel(tipo);setShowForm(true);}}
                    style={{padding:"14px 16px",borderRadius:"10px",border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:10}}
                    onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E8611A";(e.currentTarget as HTMLDivElement).style.background="#FFF3ED";}}
                    onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLDivElement).style.background="#fff";}}>
                    <div style={{width:32,height:32,borderRadius:8,background:catActual.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{catActual.icon}</div>
                    <div style={{fontSize:12.5,fontWeight:500,color:"#1B1F2E"}}>{tipo}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="g2" style={{alignItems:"start"}}>
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setShowForm(false);setTipoSel(null);}}>← Volver</button>
                <div style={{padding:"5px 12px",borderRadius:8,background:catActual?.color,border:`1px solid ${catActual?.border}`,fontSize:12,fontWeight:600,color:catActual?.colorText}}>{catActual?.icon} {tipoSel}</div>
              </div>
              <div className="card-title">Detalles de la Solicitud</div>
              <div className="form-group"><label className="form-label">Solicitante</label><input className="form-control" defaultValue="Ronald — Super Admin" readOnly style={{background:"#F9FAFB"}}/></div>
              <div className="form-group"><label className="form-label">Departamento / Área</label><select className="form-control"><option>Operaciones</option><option>Administración</option><option>Bodega</option><option>Producción</option></select></div>
              <div className="form-group"><label className="form-label">Urgencia</label>
                <div className="pills-row">
                  {["🟢 Baja","🟡 Media","🔴 Alta"].map(u=><span key={u} className={`pill ${u.includes("Media")?"sel":""}`}>{u}</span>)}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Descripción detallada</label><textarea className="form-control" rows={4} placeholder="Describe con detalle lo que necesitas, cantidad, especificaciones, motivo..."/></div>
              {catSel==="inventario"&&<>
                <div className="g2">
                  <div className="form-group"><label className="form-label">Artículo / Código</label><input className="form-control" placeholder="Ej: INV-HR-00158 o nombre"/></div>
                  <div className="form-group"><label className="form-label">Cantidad solicitada</label><input className="form-control" type="number" defaultValue="1" min="1"/></div>
                </div>
              </>}
              {catSel==="rrhh"&&(tipoSel?.includes("Vacacion")||tipoSel?.includes("Permiso"))&&<>
                <div className="g2">
                  <div className="form-group"><label className="form-label">Fecha inicio</label><input type="date" className="form-control"/></div>
                  <div className="form-group"><label className="form-label">Fecha fin</label><input type="date" className="form-control"/></div>
                </div>
              </>}
              <div className="form-group"><label className="form-label">Adjuntos (opcional)</label><div className="photo-box" style={{padding:12}}><div style={{fontSize:16}}>📎</div><div style={{fontSize:11,color:"#6B7280",marginTop:4}}>Arrastrar o subir documentos</div></div></div>
            </div>
          </div>
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">Flujo de Aprobación</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[["👤","Solicitante","Ronald","Origen","#ECFDF5","#6EE7B7"],["📦","Encargado área","Dpto. Inventario","Revisión","#FFF3ED","#FED7AA"],["✅","Director","Ronald (director)","Aprobación final","#EFF6FF","#BFDBFE"]].map(([ic,rol,nom,est,bg,bd])=>(
                  <div key={rol} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,background:bg as string,border:`1px solid ${bd}`}}>
                    <span style={{fontSize:18}}>{ic}</span>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#1B1F2E"}}>{nom}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{rol}</div></div>
                    <span style={{fontSize:11,color:"#6B7280"}}>{est}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{fontSize:12}}>Información del caso</div>
              <div className="resumen">
                <div className="res-row"><span className="res-label">Número de caso</span><span className="res-val" style={{color:"#E8611A",fontFamily:"monospace"}}>SOL-2024-009</span></div>
                <div className="res-row"><span className="res-label">Tipo</span><span className="res-val">{tipoSel}</span></div>
                <div className="res-row"><span className="res-label">Fecha solicitud</span><span className="res-val">{new Date().toLocaleDateString("es-CR")}</span></div>
                <div className="res-row"><span className="res-label">SLA esperado</span><span className="res-val">48 horas</span></div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={()=>{setShowForm(false);setTipoSel(null);}}>Cancelar</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={()=>alert("✅ Solicitud SOL-2024-009 enviada exitosamente.\n\nEl encargado de inventario fue notificado.\nPuedes seguir el estado en la Bandeja de Gestión.")}>📬 Enviar Solicitud</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
