import React, { useState } from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function AdminPersonal({setView,empleados,setEmpleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];setEmpleados:(e:Empleado[])=>void;catalogos:typeof CATALOGOS_INIT}) {
  const [tab,setTab]=useState("directorio");
  const [selCol,setSelCol]=useState<Empleado|null>(null);
  const [expTab,setExpTab]=useState("personal");
  const [showNuevo,setShowNuevo]=useState(false);
  const [formNuevo,setFormNuevo]=useState<any>({tipo:"Indefinido",estado:"activo",jornada:"Completa",depto:"Operaciones",planillaId:"PL2"});

  const tipoColor=(t:string)=>t==="Indefinido"?"badge-ok":"badge-warn";

  const guardarNuevo=()=>{
    const nuevo:Empleado={
      id:`COL-${String(empleados.length+1).padStart(3,"0")}`,
      nombre:formNuevo.nombre||"Nuevo colaborador",
      puesto:formNuevo.puesto||"—",
      depto:formNuevo.depto||"Operaciones",
      tipo:formNuevo.tipo||"Indefinido",
      inicio:new Date().toLocaleDateString("es-CR"),
      estado:"activo",
      foto:(formNuevo.nombre||"NC").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase(),
      salario:parseInt(formNuevo.salario)||0,
      planillaId:formNuevo.planillaId||"PL2",
      cedula:formNuevo.cedula||"",
      correo:formNuevo.correo||"",
      telefono:formNuevo.telefono||"",
      banco:formNuevo.banco||"BCR",
      cuentaBanco:formNuevo.cuentaBanco||"",
      jornada:formNuevo.jornada||"Completa",
    };
    setEmpleados([...empleados,nuevo]);
    setShowNuevo(false);
    setFormNuevo({tipo:"Indefinido",estado:"activo",jornada:"Completa",depto:"Operaciones",planillaId:"PL2"});
    alert(`✅ Colaborador ${nuevo.nombre} agregado exitosamente.\nID: ${nuevo.id}\nPlanilla: ${catalogos.planillas.find((p:any)=>p.id===nuevo.planillaId)?.nombre||"—"}\nAparece automáticamente en nómina en el próximo período.`);
  };

  const eliminarColaborador=(id:string)=>{
    if(!window.confirm("¿Dar de baja a este colaborador?")) return;
    setEmpleados(empleados.map(e=>e.id===id?{...e,estado:"inactivo"}:e));
    setSelCol(null);
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Administración de Personal</div>
            <div className="page-subtitle">Expediente digital · Contratos · Organigrama · ISO 9001 §7.5</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowNuevo(true)}>➕ Nuevo Colaborador</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Total activos</div><div className="kpi-value">{empleados.filter(e=>e.estado==="activo").length}</div><div className="kpi-pill kpi-up">▲ colaboradores</div></div>
          <div className="kpi"><div className="kpi-label">Contratos indefinidos</div><div className="kpi-value">{empleados.filter(e=>e.estado==="activo"&&e.tipo==="Indefinido").length}</div><div className="kpi-pill kpi-up">✓ Estables</div></div>
          <div className="kpi"><div className="kpi-label">Plazo fijo</div><div className="kpi-value" style={{color:"#F59E0B"}}>{empleados.filter(e=>e.estado==="activo"&&e.tipo==="Plazo fijo").length}</div><div className="kpi-pill kpi-warn">⚠ Revisar</div></div>
          <div className="kpi"><div className="kpi-label">Inactivos</div><div className="kpi-value" style={{color:"#9CA3AF"}}>{empleados.filter(e=>e.estado!=="activo").length}</div><div className="kpi-pill kpi-info">Bajas</div></div>

          {showNuevo&&(
            <div style={{gridColumn:"1/-1",margin:"12px 0",padding:"16px",background:"#FFFDF9",border:"1.5px solid #E8611A",borderRadius:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"#E8611A",marginBottom:14}}>➕ Nuevo Colaborador</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
                {[{k:"nombre",l:"Nombre completo"},{k:"puesto",l:"Puesto"},{k:"cedula",l:"Cédula"},{k:"correo",l:"Correo corporativo"},{k:"telefono",l:"Teléfono"}].map(f=>(
                  <div key={f.k} className="form-group" style={{margin:0}}>
                    <label className="form-label">{f.l}</label>
                    <input className="form-control" value={formNuevo[f.k]||""} onChange={e=>setFormNuevo({...formNuevo,[f.k]:e.target.value})} placeholder={f.l}/>
                  </div>
                ))}
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Salario bruto (₡)</label>
                  <input className="form-control" type="number" value={formNuevo.salario||""} onChange={e=>setFormNuevo({...formNuevo,salario:e.target.value})} placeholder="₡0"/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Departamento</label>
                  <select className="form-control" value={formNuevo.depto||""} onChange={e=>setFormNuevo({...formNuevo,depto:e.target.value})}>
                    {catalogos.areas.map((a:any)=><option key={a.id} value={a.dept}>{a.dept}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Tipo contrato</label>
                  <select className="form-control" value={formNuevo.tipo||"Indefinido"} onChange={e=>setFormNuevo({...formNuevo,tipo:e.target.value})}>
                    <option>Indefinido</option><option>Plazo fijo</option><option>Por obra</option>
                  </select>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Planilla asignada</label>
                  <select className="form-control" value={formNuevo.planillaId||"PL2"} onChange={e=>setFormNuevo({...formNuevo,planillaId:e.target.value})}>
                    {catalogos.planillas.filter((p:any)=>p.estado==="activa").map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Banco</label>
                  <select className="form-control" value={formNuevo.banco||"BCR"} onChange={e=>setFormNuevo({...formNuevo,banco:e.target.value})}>
                    {["BCR","BAC San José","Banco Popular","BNCR","Scotiabank"].map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:7,padding:"8px 12px",fontSize:11.5,color:"#065F46",marginBottom:12}}>
                ✅ Este colaborador aparecerá automáticamente en la planilla "<b>{catalogos.planillas.find((p:any)=>p.id===formNuevo.planillaId)?.nombre||"—"}</b>" en el próximo período de nómina.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-primary btn-sm" onClick={guardarNuevo}>💾 Guardar colaborador</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setShowNuevo(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div className="tab-bar">
          {[["directorio","👥 Directorio"],["expediente","📁 Expediente"],["contratos","📄 Contratos"],["organigrama","🏛️ Organigrama"],["cambios","🔄 Cambios Internos"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="directorio"&&(
          <div>
            <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const,alignItems:"center"}}>
                <div className="header-search" style={{flex:1}}><span>🔍</span><input placeholder="Buscar por nombre, puesto, cédula..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
                <select className="form-control" style={{width:160}}><option>Todos los deptos.</option></select>
                <select className="form-control" style={{width:150}}><option>Todos los contratos</option><option>Indefinido</option><option>Plazo fijo</option></select>
                <select className="form-control" style={{width:130}}><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select>
              </div>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Puesto</th><th>Dpto.</th><th>Tipo contrato</th><th>Fecha inicio</th><th>Antigüedad</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {empleados.filter(e=>e.estado==="activo").map(c=>(
                    <tr key={c.id} onClick={()=>{setSelCol(c);setTab("expediente");}} style={{cursor:"pointer"}}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <div className="user-avatar" style={{width:30,height:30,fontSize:11,flexShrink:0}}>{c.foto.slice(0,2)}</div>
                          <div><div style={{fontSize:12.5,fontWeight:600}}>{c.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{c.id}</div></div>
                        </div>
                      </td>
                      <td style={{fontSize:12}}>{c.puesto}</td>
                      <td><span className="badge badge-info" style={{fontSize:10}}>{c.depto}</span></td>
                      <td><span className={`badge ${tipoColor(c.tipo)}`}>{c.tipo}</span></td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.inicio}</td>
                      <td style={{fontSize:11.5}}>
                        {Math.floor((new Date().getTime()-new Date(c.inicio.replace(/(\d+)\s(\w+)\s(\d+)/,"$2 $1 $3")).getTime())/(1000*60*60*24*365))} años
                      </td>
                      <td><span className="badge badge-ok">● Activo</span></td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setSelCol(c);setTab("expediente");}}>📁</button>
                          <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();alert(`Editar: ${c.nombre}`);}}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{color:"#EF4444"}} onClick={e=>{e.stopPropagation();eliminarColaborador(c.id);}}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding:"9px 14px",fontSize:12,color:"#6B7280",borderTop:"1px solid #E5E7EB",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{empleados.filter(e=>e.estado==="activo").length} colaboradores activos</span>
                <button className="btn btn-secondary btn-sm">📥 Exportar directorio</button>
              </div>
            </div>
          </div>
        )}

        {tab==="expediente"&&(
          <div>
            {!selCol?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>
                <div style={{fontSize:36,marginBottom:12}}>📁</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Selecciona un colaborador</div>
                <div style={{fontSize:12}}>Haz clic en cualquier colaborador del directorio para ver su expediente</div>
                <button className="btn btn-secondary btn-sm" style={{marginTop:14}} onClick={()=>setTab("directorio")}>← Ir al directorio</button>
              </div>
            ):(
              <div className="g2" style={{alignItems:"start"}}>
                <div>
                  <div className="card" style={{marginBottom:12,textAlign:"center" as const}}>
                    <div className="user-avatar" style={{width:64,height:64,fontSize:22,margin:"0 auto 10px"}}>{selCol.foto.slice(0,2)}</div>
                    <div style={{fontSize:15,fontWeight:700}}>{selCol.nombre}</div>
                    <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{selCol.puesto}</div>
                    <div style={{marginTop:8,display:"flex",justifyContent:"center",gap:6}}>
                      <span className="badge badge-info">{selCol.depto}</span>
                      <span className={`badge ${tipoColor(selCol.tipo)}`}>{selCol.tipo}</span>
                      <span className="badge badge-ok">Activo</span>
                    </div>
                    <div style={{marginTop:12,display:"flex",gap:6}}>
                      <button className="btn btn-secondary btn-sm" style={{flex:1}}>✏️ Editar</button>
                      <button className="btn btn-ghost btn-sm" style={{flex:1}}>📧 Correo</button>
                    </div>
                  </div>
                  <div className="card" style={{marginBottom:12}}>
                    <div className="card-title" style={{fontSize:12}}>Documentos del expediente</div>
                    {[{icon:"📄",name:"Contrato laboral",est:"badge-ok",estTxt:"Vigente"},{icon:"🪪",name:"Cédula de identidad",est:"badge-ok",estTxt:"Cargada"},{icon:"🎓",name:"Títulos / Diplomas",est:"badge-ok",estTxt:"2 documentos"},{icon:"🔒",name:"Acuerdo confidencialidad",est:"badge-ok",estTxt:"Firmado"},{icon:"🏥",name:"Examen médico",est:"badge-warn",estTxt:"Vence Jun 2025"},{icon:"📋",name:"Evaluación de ingreso",est:"badge-ok",estTxt:"Completada"}].map(d=>(
                      <div key={d.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
                        <span style={{fontSize:16}}>{d.icon}</span>
                        <span style={{flex:1,fontSize:12}}>{d.name}</span>
                        <span className={`badge ${d.est}`} style={{fontSize:9}}>{d.estTxt}</span>
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 6px"}}>👁</button>
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" style={{width:"100%",marginTop:8}}>📎 Subir documento</button>
                  </div>
                </div>
                <div>
                  <div className="tab-bar" style={{marginBottom:12}}>
                    {[["personal","Personal"],["laboral","Laboral"],["contacto","Contacto"],["historial","Historial"]].map(([id,l])=>(
                      <div key={id} className={`tab-btn ${expTab===id?"active":""}`} onClick={()=>setExpTab(id)} style={{fontSize:12}}>{l}</div>
                    ))}
                  </div>
                  {expTab==="personal"&&(
                    <div className="card">
                      <div className="card-title">Datos Personales</div>
                      <div className="g2">
                        <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-control" defaultValue={selCol.nombre}/></div>
                        <div className="form-group"><label className="form-label">Cédula / ID</label><input className="form-control" defaultValue="1-0234-5678"/></div>
                        <div className="form-group"><label className="form-label">Fecha nacimiento</label><input type="date" className="form-control" defaultValue="1990-05-15"/></div>
                        <div className="form-group"><label className="form-label">Género</label><select className="form-control"><option>Femenino</option><option>Masculino</option></select></div>
                        <div className="form-group"><label className="form-label">Nacionalidad</label><input className="form-control" defaultValue="Costarricense"/></div>
                        <div className="form-group"><label className="form-label">Estado civil</label><select className="form-control"><option>Soltero/a</option><option>Casado/a</option></select></div>
                      </div>
                      <div className="form-group"><label className="form-label">Dirección</label><input className="form-control" defaultValue="San José, Costa Rica"/></div>
                    </div>
                  )}
                  {expTab==="laboral"&&(
                    <div className="card">
                      <div className="card-title">Datos Laborales</div>
                      <div className="g2">
                        <div className="form-group"><label className="form-label">Puesto</label><input className="form-control" defaultValue={selCol.puesto}/></div>
                        <div className="form-group"><label className="form-label">Departamento</label><select className="form-control"><option>{selCol.depto}</option></select></div>
                        <div className="form-group"><label className="form-label">Fecha ingreso</label><input className="form-control" defaultValue={selCol.inicio}/></div>
                        <div className="form-group"><label className="form-label">Tipo contrato</label><select className="form-control"><option>{selCol.tipo}</option></select></div>
                        <div className="form-group"><label className="form-label">Salario bruto</label><input className="form-control" defaultValue={`₡${selCol.salario.toLocaleString()}`}/></div>
                        <div className="form-group"><label className="form-label">Jornada</label><select className="form-control"><option>Tiempo completo</option><option>Medio tiempo</option></select></div>
                      </div>
                    </div>
                  )}
                  {expTab==="contacto"&&(
                    <div className="card">
                      <div className="card-title">Información de Contacto</div>
                      <div className="form-group"><label className="form-label">Correo corporativo</label><input className="form-control" defaultValue={selCol.correo||selCol.nombre.toLowerCase().replace(" ",".")+"@procenter.com"}/></div>
                      <div className="g2">
                        <div className="form-group"><label className="form-label">Teléfono móvil</label><input className="form-control" defaultValue={selCol.telefono||"8888-0000"}/></div>
                        <div className="form-group"><label className="form-label">Tel. emergencias</label><input className="form-control" defaultValue="8999-1111"/></div>
                      </div>
                      <div className="card-title" style={{marginTop:12,fontSize:12}}>Contacto de emergencia</div>
                      <div className="g2">
                        <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" defaultValue="Familiar directo"/></div>
                        <div className="form-group"><label className="form-label">Parentesco</label><select className="form-control"><option>Madre / Padre</option><option>Cónyuge</option></select></div>
                      </div>
                    </div>
                  )}
                  {expTab==="historial"&&(
                    <div className="card">
                      <div className="card-title">Historial Laboral Interno</div>
                      <div style={{position:"relative",paddingLeft:24}}>
                        <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"#E5E7EB"}}/>
                        {[{icon:"🏢",label:"Ingreso a la empresa",fecha:selCol.inicio,color:"#10B981",desc:"Contrato inicial firmado digitalmente"},{icon:"📊",label:"Evaluación de desempeño Q4 2023",fecha:"Dic 2023",color:"#3B82F6",desc:"Calificación: 87/100 — Sobresaliente"},{icon:"📚",label:"Capacitación ISO 9001",fecha:"Mar 2024",color:"#7C3AED",desc:"Completada · Certificación válida 2 años"},{icon:"⬆️",label:"Ajuste salarial anual",fecha:"Ene 2024",color:"#F59E0B",desc:"+8% sobre salario base"}].map((ev,i)=>(
                          <div key={i} style={{position:"relative",marginBottom:14,paddingLeft:16}}>
                            <div style={{position:"absolute",left:-12,top:2,width:18,height:18,borderRadius:"50%",background:ev.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,border:"2px solid #fff"}}>{ev.icon}</div>
                            <div style={{fontSize:12.5,fontWeight:600,color:"#1B1F2E"}}>{ev.label}</div>
                            <div style={{fontSize:11,color:"#6B7280"}}>{ev.desc}</div>
                            <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{ev.fecha}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>alert("✅ Expediente guardado.")}>💾 Guardar cambios</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setSelCol(null)}>← Volver</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="contratos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",gap:8}}>
                <select className="form-control" style={{width:160}}><option>Todos los tipos</option></select>
                <select className="form-control" style={{width:160}}><option>Todos los estados</option></select>
              </div>
              <button className="btn btn-primary btn-sm">📄 Nuevo Contrato</button>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Tipo</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th><th>Firmado</th><th></th></tr></thead>
                <tbody>
                  {[{col:"María Rojas",tipo:"Indefinido",inicio:"15 Mar 2021",vence:"—",estado:"Vigente",firmado:true},{col:"Jules Ramirez",tipo:"Indefinido",inicio:"02 Ene 2020",vence:"—",estado:"Vigente",firmado:true},{col:"Carlos Montoya",tipo:"Plazo fijo",inicio:"01 Feb 2024",vence:"31 May 2024",estado:"Por vencer",firmado:true},{col:"Ana Vargas",tipo:"Indefinido",inicio:"10 Jun 2022",vence:"—",estado:"Vigente",firmado:true}].map((c,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:500,fontSize:12.5}}>{c.col}</td>
                      <td><span className={`badge ${c.tipo==="Indefinido"?"badge-ok":"badge-warn"}`}>{c.tipo}</span></td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.inicio}</td>
                      <td style={{fontSize:11.5,color:c.estado==="Por vencer"?"#EF4444":"#9CA3AF"}}>{c.vence}</td>
                      <td><span className={`badge ${c.estado==="Vigente"?"badge-ok":"badge-crit"}`}>{c.estado}</span></td>
                      <td>{c.firmado?<span className="badge badge-ok">✓ Digital</span>:<span className="badge badge-warn">Pendiente</span>}</td>
                      <td><button className="btn btn-ghost btn-sm">👁 Ver</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="organigrama"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:"#6B7280"}}>Estructura organizacional · {empleados.filter(e=>e.estado==="activo").length} colaboradores · 5 departamentos</div>
              <div style={{display:"flex",gap:6}}><button className="btn btn-secondary btn-sm">📥 Exportar PDF</button></div>
            </div>
            <div className="card" style={{overflowX:"auto" as const}}>
              <div style={{minWidth:700,padding:"10px 0"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
                  <div style={{background:"linear-gradient(135deg,#E8611A,#F97316)",borderRadius:12,padding:"12px 20px",textAlign:"center" as const,color:"#fff",minWidth:160}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.2)",margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>RD</div>
                    <div style={{fontSize:12.5,fontWeight:700}}>Ronald</div>
                    <div style={{fontSize:10.5,opacity:.85}}>Director General</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:0}}><div style={{width:2,height:20,background:"#E5E7EB"}}/></div>
                <div style={{display:"flex",justifyContent:"center"}}><div style={{width:"75%",height:2,background:"#E5E7EB"}}/></div>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  {[["Calidad","#3B82F6","María Rojas"],["Operaciones","#10B981","Jules Ramirez"],["RRHH","#7C3AED","Sofía Méndez"],["Administración","#F59E0B","Ana Vargas"],["Mantenimiento","#EF4444","Carlos M."]].map(([depto,color,jefe])=>(
                    <div key={depto} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <div style={{width:2,height:20,background:"#E5E7EB",marginBottom:0}}/>
                      <div style={{border:`2px solid ${color}`,borderRadius:10,padding:"10px 14px",textAlign:"center" as const,minWidth:130,background:"#fff"}}>
                        <div style={{width:30,height:30,borderRadius:"50%",background:color+"20",margin:"0 auto 5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:color}}>{(jefe as string).split(" ").map((n:string)=>n[0]).join("").slice(0,2)}</div>
                        <div style={{fontSize:11.5,fontWeight:700,color:"#1B1F2E"}}>{depto}</div>
                        <div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{jefe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="cambios"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:"#6B7280"}}>Ascensos · Traslados · Cambios de puesto</div>
              <button className="btn btn-primary btn-sm" onClick={()=>alert("Formulario de cambio interno abierto.")}>➕ Registrar Cambio</button>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Tipo de cambio</th><th>Desde</th><th>Hacia</th><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>
                  {[{col:"Sofía Méndez",tipo:"Ascenso",desde:"Asistente Admin.",hacia:"Analista de RRHH",fecha:"20 Abr 2023",estado:"Completado"},{col:"Pedro Salas",tipo:"Traslado",desde:"San José Norte",hacia:"Operaciones Central",fecha:"10 Feb 2024",estado:"Completado"},{col:"Carlos Montoya",tipo:"Renovación",desde:"Contrato 6 meses",hacia:"Nuevo plazo fijo",fecha:"Pendiente",estado:"Pendiente"}].map((c,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:500,fontSize:12.5}}>{c.col}</td>
                      <td><span className={`badge ${c.tipo==="Ascenso"?"badge-ok":"badge-info"}`}>{c.tipo}</span></td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.desde}</td>
                      <td style={{fontSize:12,fontWeight:500}}>{c.hacia}</td>
                      <td style={{fontSize:11.5,color:"#6B7280"}}>{c.fecha}</td>
                      <td><span className={`badge ${c.estado==="Completado"?"badge-ok":"badge-warn"}`}>{c.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Por atender</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{icon:"📄",text:"Contrato Carlos Montoya vence en 15 días",color:"#EF4444",bg:"#FEF2F2"},{icon:"🏥",text:"Examen médico María Rojas vence Jun 2025",color:"#F59E0B",bg:"#FFFBEB"},{icon:"📚",text:"Capacitación pendiente de 2 colaboradores",color:"#3B82F6",bg:"#EFF6FF"}].map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,padding:"9px 10px",borderRadius:9,background:a.bg,border:`1px solid ${a.color}30`}}>
              <span style={{fontSize:15}}>{a.icon}</span>
              <span style={{fontSize:11.5,color:"#374151",lineHeight:1.4}}>{a.text}</span>
            </div>
          ))}
        </div>
        <div style={{height:14}}/>
        <div className="panel-title">Distribución por depto.</div>
        {[["Operaciones",3,"#10B981"],["Mantenimiento",2,"#F59E0B"],["Administración",1,"#3B82F6"],["Calidad",1,"#7C3AED"],["RRHH",1,"#E8611A"]].map(([d,n,c])=>(
          <div key={d as string} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
              <span style={{color:"#374151"}}>{d}</span>
              <span style={{fontWeight:600,color:c as string}}>{n}</span>
            </div>
            <div style={{background:"#E5E7EB",borderRadius:3,height:6}}><div style={{width:`${(n as number)/8*100}%`,background:c as string,height:"100%",borderRadius:3}}/></div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Nuevo colaborador",icon:"➕"},{l:"Renovar contrato",icon:"📄"},{l:"Registrar cambio",icon:"🔄"},{l:"Exportar directorio",icon:"📥"}].map(a=>(
          <div key={a.l} onClick={()=>setShowNuevo(a.l==="Nuevo colaborador"||showNuevo)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}}
            onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"}
            onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span style={{fontSize:14}}>{a.icon}</span>
            <span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span>
            <span style={{marginLeft:"auto",color:"#D1D5DB",fontSize:12}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
