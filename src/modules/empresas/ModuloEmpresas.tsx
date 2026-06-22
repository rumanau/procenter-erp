import React, { useState } from "react";
import type { View, Empleado, EmpresaData, Vertical } from "../../types";
import { EMPRESAS_INIT } from "../../data/empresas";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function ModuloEmpresas({setView,empleados,catalogos}:{
  setView:(v:View)=>void;
  empleados:Empleado[];
  catalogos:typeof CATALOGOS_INIT;
}) {
  const [empresas,setEmpresas]=useState<EmpresaData[]>(EMPRESAS_INIT);
  const [empSel,setEmpSel]=useState<EmpresaData>(EMPRESAS_INIT[0]);
  const [tab,setTab]=useState<"resumen"|"verticales"|"config"|"estructura">("resumen");
  const [vertSel,setVertSel]=useState<Vertical|null>(null);
  const [showNuevaEmp,setShowNuevaEmp]=useState(false);
  const [showNuevaVert,setShowNuevaVert]=useState(false);
  const [formEmp,setFormEmp]=useState<any>({pais:"Costa Rica",moneda:"CRC",anoFiscal:"Enero–Diciembre",activa:true});
  const [formVert,setFormVert]=useState<any>({activa:true,sucursales:[],deptos:[],centrosCosto:[]});
  const [editandoEmp,setEditandoEmp]=useState(false);
  const [editandoVert,setEditandoVert]=useState(false);
  const [nuevaSuc,setNuevaSuc]=useState("");
  const [nuevoDepto,setNuevoDepto]=useState("");
  const [nuevaCC,setNuevaCC]=useState("");

  const totalEmpleados=empleados.filter(e=>e.estado==="activo").length;
  const totalPlanillas=catalogos.planillas.filter(p=>p.estado==="activa").length;

  const crearEmpresa=()=>{
    const nueva:EmpresaData={
      id:`EMP-${String(empresas.length+1).padStart(3,"0")}`,
      nombre:formEmp.nombre||"Nueva Empresa",
      razonSocial:formEmp.razonSocial||"",
      cedula:formEmp.cedula||"",
      sector:formEmp.sector||"",
      pais:formEmp.pais||"Costa Rica",
      moneda:formEmp.moneda||"CRC",
      anoFiscal:formEmp.anoFiscal||"Enero–Diciembre",
      logo:(formEmp.nombre||"NE").substring(0,2).toUpperCase(),
      color:["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B"][empresas.length%5],
      icono:formEmp.icono||"🏢",
      direccion:formEmp.direccion||"",
      telefono:formEmp.telefono||"",
      correo:formEmp.correo||"",
      web:formEmp.web||"",
      representante:formEmp.representante||"",
      activa:true,
      verticales:[],
    };
    setEmpresas([...empresas,nueva]);
    setEmpSel(nueva);
    setShowNuevaEmp(false);
    setFormEmp({pais:"Costa Rica",moneda:"CRC",anoFiscal:"Enero–Diciembre",activa:true});
    setTab("verticales");
  };

  const crearVertical=()=>{
    const nueva:Vertical={
      id:`V-${String(empSel.verticales.length+1).padStart(3,"0")}`,
      nombre:formVert.nombre||"Nueva Vertical",
      descripcion:formVert.descripcion||"",
      color:["#10B981","#3B82F6","#7C3AED","#E8611A","#F59E0B"][empSel.verticales.length%5],
      icono:formVert.icono||"🏢",
      activa:true,
      sucursales:formVert.sucursales||[],
      deptos:formVert.deptos||[],
      centrosCosto:formVert.centrosCosto||[],
    };
    const empActualizada={...empSel,verticales:[...empSel.verticales,nueva]};
    setEmpresas(empresas.map(e=>e.id===empSel.id?empActualizada:e));
    setEmpSel(empActualizada);
    setVertSel(nueva);
    setShowNuevaVert(false);
    setFormVert({activa:true,sucursales:[],deptos:[],centrosCosto:[]});
  };

  const actualizarVertical=(vert:Vertical)=>{
    const empActualizada={...empSel,verticales:empSel.verticales.map(v=>v.id===vert.id?vert:v)};
    setEmpresas(empresas.map(e=>e.id===empSel.id?empActualizada:e));
    setEmpSel(empActualizada);
    setVertSel(vert);
    setEditandoVert(false);
  };

  const actualizarEmpresa=(emp:EmpresaData)=>{
    setEmpresas(empresas.map(e=>e.id===emp.id?emp:e));
    setEmpSel(emp);
    setEditandoEmp(false);
  };

  const toggleVertical=(vId:string)=>{
    const empActualizada={...empSel,verticales:empSel.verticales.map(v=>v.id===vId?{...v,activa:!v.activa}:v)};
    setEmpresas(empresas.map(e=>e.id===empSel.id?empActualizada:e));
    setEmpSel(empActualizada);
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#1B1F2E,#2D3348)",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:32}}>🏛️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Empresas & Verticales</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,.55)"}}>Estructura organizacional · Multi-empresa · Verticales / Divisiones · Sucursales · Departamentos</div>
          </div>
          <button className="btn btn-sm" style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>{setShowNuevaEmp(true);setEditandoEmp(false);}}>🏢 Nueva Empresa</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[
            {l:"Empresas activas",v:empresas.filter(e=>e.activa).length.toString(),c:"#E8611A"},
            {l:"Total verticales",v:empresas.reduce((a,e)=>a+e.verticales.length,0).toString(),c:"#3B82F6"},
            {l:"Colaboradores",v:totalEmpleados.toString(),c:"#10B981"},
            {l:"Planillas activas",v:totalPlanillas.toString(),c:"#7C3AED"},
          ].map(k=>(
            <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c}}>{k.v}</div></div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:12,alignItems:"start"}}>
          <div>
            <div className="card" style={{padding:0,overflow:"hidden",marginBottom:10}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",fontSize:12,fontWeight:700,display:"flex",justifyContent:"space-between"}}>
                <span>Empresas</span>
                <span style={{fontSize:10,color:"#9CA3AF"}}>{empresas.length}</span>
              </div>
              {empresas.map(emp=>(
                <div key={emp.id} onClick={()=>{setEmpSel(emp);setTab("resumen");setVertSel(null);}}
                  style={{padding:"12px 14px",borderBottom:"1px solid #F3F4F6",cursor:"pointer",borderLeft:`3px solid ${empSel.id===emp.id?emp.color:"transparent"}`,background:empSel.id===emp.id?"#FAFAFA":"#fff",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{width:30,height:30,borderRadius:8,background:emp.color+"20",border:`1.5px solid ${emp.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{emp.icono}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:empSel.id===emp.id?700:500,color:"#1B1F2E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.nombre}</div>
                      <div style={{fontSize:10.5,color:"#6B7280"}}>{emp.verticales.length} vertical{emp.verticales.length!==1?"es":""} · {emp.pais}</div>
                    </div>
                    <span style={{width:8,height:8,borderRadius:"50%",background:emp.activa?"#10B981":"#9CA3AF",flexShrink:0}}/>
                  </div>
                </div>
              ))}
              <div onClick={()=>{setShowNuevaEmp(true);}} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:"#E8611A",fontSize:12,background:"#FAFAFA"}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#FFF3ED"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="#FAFAFA"}>
                <span style={{fontSize:16}}>➕</span> Nueva empresa
              </div>
            </div>
          </div>

          <div>
            {showNuevaEmp&&(
              <div className="card" style={{border:"1.5px solid #E8611A",marginBottom:12}}>
                <div className="card-title" style={{color:"#E8611A",marginBottom:14}}>🏢 Nueva Empresa</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  {[{k:"nombre",l:"Nombre comercial"},{k:"razonSocial",l:"Razón social"},{k:"cedula",l:"Cédula jurídica"},{k:"sector",l:"Sector / Industria"},{k:"representante",l:"Representante legal"},{k:"correo",l:"Correo"},{k:"telefono",l:"Teléfono"},{k:"web",l:"Sitio web"},{k:"direccion",l:"Dirección fiscal"},{k:"icono",l:"Ícono (emoji)"}].map(f=>(
                    <div key={f.k} className="form-group" style={{margin:0}}>
                      <label className="form-label">{f.l}</label>
                      <input className="form-control" value={formEmp[f.k]||""} onChange={e=>setFormEmp({...formEmp,[f.k]:e.target.value})} placeholder={f.l}/>
                    </div>
                  ))}
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">País</label>
                    <select className="form-control" value={formEmp.pais||"Costa Rica"} onChange={e=>setFormEmp({...formEmp,pais:e.target.value})}>
                      {["Costa Rica","México","Guatemala","Panamá","Colombia","El Salvador"].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Moneda base</label>
                    <select className="form-control" value={formEmp.moneda||"CRC"} onChange={e=>setFormEmp({...formEmp,moneda:e.target.value})}>
                      {["CRC","USD","MXN","GTQ","PAB","COP"].map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="btn btn-primary btn-sm" onClick={crearEmpresa}>💾 Crear empresa</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setShowNuevaEmp(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {!showNuevaEmp&&(
              <div>
                <div style={{background:`linear-gradient(135deg,${empSel.color},${empSel.color}CC)`,borderRadius:10,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,flexShrink:0}}>{empSel.icono}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{empSel.nombre}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{empSel.razonSocial} · {empSel.cedula}</div>
                  </div>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:"9999px",background:"rgba(255,255,255,.2)",color:"#fff",fontWeight:600}}>{empSel.pais} · {empSel.moneda}</span>
                  <button className="btn btn-sm" style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",fontSize:11}} onClick={()=>setEditandoEmp(true)}>✏️ Editar</button>
                </div>

                <div className="tab-bar" style={{marginBottom:12}}>
                  {[["resumen","📊 Resumen"],["verticales","🏢 Verticales"],["estructura","🗂️ Estructura"],["config","⚙️ Configuración"]].map(([id,l])=>(
                    <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>{setTab(id as any);setVertSel(null);setEditandoEmp(false);setShowNuevaVert(false);}}>{l}</div>
                  ))}
                </div>

                {tab==="resumen"&&(
                  <div>
                    {editandoEmp?(
                      <div className="card" style={{border:"1.5px solid #E8611A"}}>
                        <div className="card-title" style={{color:"#E8611A",marginBottom:12}}>✏️ Editando empresa</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                          {[{k:"nombre",l:"Nombre comercial"},{k:"razonSocial",l:"Razón social"},{k:"cedula",l:"Cédula jurídica"},{k:"sector",l:"Sector"},{k:"representante",l:"Representante legal"},{k:"correo",l:"Correo"},{k:"telefono",l:"Teléfono"},{k:"web",l:"Web"},{k:"direccion",l:"Dirección"}].map(f=>(
                            <div key={f.k} className="form-group" style={{margin:0}}>
                              <label className="form-label">{f.l}</label>
                              <input className="form-control" defaultValue={(empSel as any)[f.k]||""} onChange={e=>setEmpSel({...empSel,[f.k]:e.target.value})}/>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button className="btn btn-primary btn-sm" onClick={()=>actualizarEmpresa(empSel)}>💾 Guardar</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setEditandoEmp(false)}>Cancelar</button>
                        </div>
                      </div>
                    ):(
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <div className="card">
                          <div className="card-title" style={{fontSize:12}}>📋 Datos generales</div>
                          <div className="resumen">
                            {[["Razón social",empSel.razonSocial||"—"],["Cédula jurídica",empSel.cedula||"—"],["Sector",empSel.sector||"—"],["País",empSel.pais],["Moneda",empSel.moneda],["Año fiscal",empSel.anoFiscal],["Representante",empSel.representante||"—"]].map(([l,v])=>(
                              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-title" style={{fontSize:12}}>📞 Contacto</div>
                          <div className="resumen">
                            {[["Dirección",empSel.direccion||"—"],["Teléfono",empSel.telefono||"—"],["Correo",empSel.correo||"—"],["Web",empSel.web||"—"]].map(([l,v])=>(
                              <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="card" style={{gridColumn:"1/-1"}}>
                          <div className="card-title" style={{fontSize:12}}>📊 Estadísticas de la empresa</div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                            {[
                              {l:"Verticales activas",v:empSel.verticales.filter(v=>v.activa).length.toString(),c:"#E8611A"},
                              {l:"Total sucursales",v:empSel.verticales.reduce((a,v)=>a+v.sucursales.length,0).toString(),c:"#3B82F6"},
                              {l:"Departamentos",v:empSel.verticales.reduce((a,v)=>a+v.deptos.length,0).toString(),c:"#10B981"},
                              {l:"Centros de costo",v:empSel.verticales.reduce((a,v)=>a+v.centrosCosto.length,0).toString(),c:"#7C3AED"},
                            ].map(k=>(
                              <div key={k.l} style={{textAlign:"center",padding:"12px",background:"#F9FAFB",borderRadius:8}}>
                                <div style={{fontSize:10.5,color:"#6B7280"}}>{k.l}</div>
                                <div style={{fontSize:22,fontWeight:800,color:k.c,marginTop:4}}>{k.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab==="verticales"&&(
                  <div>
                    {showNuevaVert&&(
                      <div className="card" style={{border:"1.5px solid #3B82F6",marginBottom:12}}>
                        <div className="card-title" style={{color:"#3B82F6",marginBottom:12}}>🏢 Nueva Vertical / División</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                          {[{k:"nombre",l:"Nombre de la vertical"},{k:"descripcion",l:"Descripción"},{k:"icono",l:"Ícono (emoji)"}].map(f=>(
                            <div key={f.k} className="form-group" style={{margin:0}}>
                              <label className="form-label">{f.l}</label>
                              <input className="form-control" value={formVert[f.k]||""} onChange={e=>setFormVert({...formVert,[f.k]:e.target.value})} placeholder={f.l}/>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button className="btn btn-primary btn-sm" onClick={crearVertical}>💾 Crear vertical</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setShowNuevaVert(false)}>Cancelar</button>
                        </div>
                      </div>
                    )}

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontSize:12,color:"#6B7280"}}>{empSel.verticales.length} verticales en {empSel.nombre}</div>
                      <button className="btn btn-primary btn-sm" onClick={()=>setShowNuevaVert(true)}>➕ Nueva Vertical</button>
                    </div>

                    {empSel.verticales.length===0?(
                      <div style={{textAlign:"center",padding:"50px",color:"#9CA3AF",background:"#F9FAFB",borderRadius:10,border:"1.5px dashed #E5E7EB"}}>
                        <div style={{fontSize:40,marginBottom:12}}>🏢</div>
                        <div style={{fontSize:14,fontWeight:600,color:"#1B1F2E",marginBottom:6}}>Sin verticales aún</div>
                        <div style={{fontSize:12,marginBottom:14}}>Crea la primera vertical o división de {empSel.nombre}</div>
                        <button className="btn btn-primary btn-sm" onClick={()=>setShowNuevaVert(true)}>➕ Crear primera vertical</button>
                      </div>
                    ):(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                        {empSel.verticales.map(vert=>(
                          <div key={vert.id}
                            style={{background:"#fff",border:`1.5px solid ${vertSel?.id===vert.id?vert.color:"#E5E7EB"}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all .15s",opacity:vert.activa?1:.6}}
                            onClick={()=>setVertSel(vertSel?.id===vert.id?null:vert)}
                            onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=vert.color;(e.currentTarget as HTMLDivElement).style.boxShadow=`0 4px 14px ${vert.color}25`;}}
                            onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=vertSel?.id===vert.id?vert.color:"#E5E7EB";(e.currentTarget as HTMLDivElement).style.boxShadow="none";}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                              <div style={{width:38,height:38,borderRadius:9,background:vert.color+"20",border:`1.5px solid ${vert.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{vert.icono}</div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13.5,fontWeight:700,color:"#1B1F2E"}}>{vert.nombre}</div>
                                <div style={{fontSize:11,color:"#6B7280",marginTop:1}}>{vert.descripcion}</div>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                                <span style={{fontSize:10,padding:"2px 7px",borderRadius:"9999px",background:vert.activa?"#ECFDF5":"#F4F5F7",color:vert.activa?"#065F46":"#9CA3AF",fontWeight:600}}>{vert.activa?"Activa":"Inactiva"}</span>
                              </div>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                              {[["🏪",vert.sucursales.length,"Suc."],["🏢",vert.deptos.length,"Dptos."],["💰",vert.centrosCosto.length,"CC"]].map(([ic,n,l])=>(
                                <div key={l} style={{textAlign:"center",padding:"6px 4px",background:"#F9FAFB",borderRadius:6}}>
                                  <div style={{fontSize:12}}>{ic}</div>
                                  <div style={{fontSize:14,fontWeight:700,color:vert.color}}>{n as number}</div>
                                  <div style={{fontSize:9.5,color:"#9CA3AF"}}>{l}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {vertSel&&(
                      <div className="card" style={{marginTop:12,border:`1.5px solid ${vertSel.color}50`}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                          <div style={{width:32,height:32,borderRadius:8,background:vertSel.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{vertSel.icono}</div>
                          <div style={{fontSize:14,fontWeight:700,flex:1}}>{vertSel.nombre}</div>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setEditandoVert(!editandoVert)}>{editandoVert?"Cancelar":"✏️ Editar"}</button>
                          <button className="btn btn-ghost btn-sm" style={{color:vertSel.activa?"#EF4444":"#10B981"}} onClick={()=>toggleVertical(vertSel.id)}>{vertSel.activa?"Desactivar":"Activar"}</button>
                        </div>

                        {editandoVert?(
                          <div>
                            <div style={{marginBottom:14}}>
                              <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>🏪 Sucursales</div>
                              {vertSel.sucursales.map((s,i)=>(
                                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"0.5px solid #F3F4F6"}}>
                                  <span style={{flex:1,fontSize:12}}>{s}</span>
                                  <button className="btn btn-ghost btn-sm" style={{color:"#EF4444",fontSize:10}} onClick={()=>actualizarVertical({...vertSel,sucursales:vertSel.sucursales.filter((_,j)=>j!==i)})}>✕</button>
                                </div>
                              ))}
                              <div style={{display:"flex",gap:6,marginTop:8}}>
                                <input className="form-control" style={{flex:1}} placeholder="Nueva sucursal..." value={nuevaSuc} onChange={e=>setNuevaSuc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nuevaSuc.trim()){actualizarVertical({...vertSel,sucursales:[...vertSel.sucursales,nuevaSuc.trim()]});setNuevaSuc("");}}}/>
                                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevaSuc.trim()){actualizarVertical({...vertSel,sucursales:[...vertSel.sucursales,nuevaSuc.trim()]});setNuevaSuc("");}}}>➕</button>
                              </div>
                            </div>
                            <div style={{marginBottom:14}}>
                              <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>🏢 Departamentos</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginBottom:8}}>
                                {vertSel.deptos.map((d,i)=>(
                                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:"9999px",background:vertSel.color+"15",border:`1px solid ${vertSel.color}40`,fontSize:11.5,fontWeight:500,color:vertSel.color}}>
                                    {d}
                                    <span style={{cursor:"pointer",fontSize:11,color:"#9CA3AF",marginLeft:2}} onClick={()=>actualizarVertical({...vertSel,deptos:vertSel.deptos.filter((_,j)=>j!==i)})}>✕</span>
                                  </span>
                                ))}
                              </div>
                              <div style={{display:"flex",gap:6}}>
                                <input className="form-control" style={{flex:1}} placeholder="Nuevo departamento..." value={nuevoDepto} onChange={e=>setNuevoDepto(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nuevoDepto.trim()){actualizarVertical({...vertSel,deptos:[...vertSel.deptos,nuevoDepto.trim()]});setNuevoDepto("");}}}/>
                                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevoDepto.trim()){actualizarVertical({...vertSel,deptos:[...vertSel.deptos,nuevoDepto.trim()]});setNuevoDepto("");}}}>➕</button>
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>💰 Centros de Costo</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginBottom:8}}>
                                {vertSel.centrosCosto.map((cc,i)=>(
                                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:"9999px",background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:11.5,color:"#1D4ED8"}}>
                                    {cc}
                                    <span style={{cursor:"pointer",fontSize:11,color:"#9CA3AF"}} onClick={()=>actualizarVertical({...vertSel,centrosCosto:vertSel.centrosCosto.filter((_,j)=>j!==i)})}>✕</span>
                                  </span>
                                ))}
                              </div>
                              <div style={{display:"flex",gap:6}}>
                                <input className="form-control" style={{flex:1}} placeholder="Ej: CC-OPS-003" value={nuevaCC} onChange={e=>setNuevaCC(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nuevaCC.trim()){actualizarVertical({...vertSel,centrosCosto:[...vertSel.centrosCosto,nuevaCC.trim()]});setNuevaCC("");}}}/>
                                <button className="btn btn-secondary btn-sm" onClick={()=>{if(nuevaCC.trim()){actualizarVertical({...vertSel,centrosCosto:[...vertSel.centrosCosto,nuevaCC.trim()]});setNuevaCC("");}}}>➕</button>
                              </div>
                            </div>
                          </div>
                        ):(
                          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:6}}>🏪 SUCURSALES</div>
                              {vertSel.sucursales.length===0?<div style={{fontSize:11,color:"#9CA3AF"}}>Sin sucursales</div>:vertSel.sucursales.map((s,i)=>(
                                <div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:"0.5px solid #F3F4F6",color:"#374151"}}>{s}</div>
                              ))}
                            </div>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:6}}>🏢 DEPARTAMENTOS</div>
                              {vertSel.deptos.length===0?<div style={{fontSize:11,color:"#9CA3AF"}}>Sin departamentos</div>:vertSel.deptos.map((d,i)=>(
                                <span key={i} style={{display:"inline-block",margin:"2px",padding:"2px 8px",borderRadius:"9999px",background:vertSel.color+"15",color:vertSel.color,fontSize:11,fontWeight:500}}>{d}</span>
                              ))}
                            </div>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:6}}>💰 CENTROS DE COSTO</div>
                              {vertSel.centrosCosto.length===0?<div style={{fontSize:11,color:"#9CA3AF"}}>Sin centros de costo</div>:vertSel.centrosCosto.map((cc,i)=>(
                                <div key={i} style={{fontSize:11,padding:"3px 8px",background:"#EFF6FF",borderRadius:5,margin:"2px 0",color:"#1D4ED8",fontFamily:"monospace"}}>{cc}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {tab==="estructura"&&(
                  <div className="card">
                    <div className="card-title">🗂️ Árbol organizacional — {empSel.nombre}</div>
                    <div style={{fontFamily:"monospace",fontSize:12,lineHeight:2,color:"#374151"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:`${empSel.color}15`,borderRadius:8,marginBottom:4,border:`1.5px solid ${empSel.color}40`}}>
                        <span style={{fontSize:18}}>{empSel.icono}</span>
                        <span style={{fontWeight:700,color:empSel.color,fontSize:13}}>{empSel.nombre}</span>
                        <span style={{fontSize:10,color:"#6B7280",marginLeft:"auto"}}>{empSel.cedula}</span>
                      </div>
                      {empSel.verticales.map((vert)=>(
                        <div key={vert.id} style={{marginLeft:20,marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:`${vert.color}10`,borderRadius:7,border:`1px solid ${vert.color}30`,marginBottom:3}}>
                            <span style={{color:"#9CA3AF",fontSize:11}}>└──</span>
                            <span style={{fontSize:15}}>{vert.icono}</span>
                            <span style={{fontWeight:600,color:vert.color,fontSize:12}}>{vert.nombre}</span>
                            <span className={`badge ${vert.activa?"badge-ok":"badge-gray"}`} style={{fontSize:9,marginLeft:4}}>{vert.activa?"Activa":"Inactiva"}</span>
                          </div>
                          <div style={{marginLeft:40}}>
                            {vert.sucursales.map((s,si)=>(
                              <div key={si} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",fontSize:11,color:"#6B7280"}}>
                                <span style={{color:"#D1D5DB"}}>{si===vert.sucursales.length-1?"└─":"├─"}</span>
                                <span>🏪</span><span>{s}</span>
                              </div>
                            ))}
                            {vert.deptos.length>0&&(
                              <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",fontSize:11,color:"#6B7280"}}>
                                <span style={{color:"#D1D5DB"}}>├─</span>
                                <span>🏢</span>
                                <span>{vert.deptos.join(" · ")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {empSel.verticales.length===0&&(
                        <div style={{padding:"20px",color:"#9CA3AF",fontSize:12,textAlign:"center"}}>
                          Sin verticales. Ve a la pestaña "Verticales" para crear la primera.
                        </div>
                      )}
                    </div>
                    <div style={{marginTop:12,padding:"10px 12px",background:"#F9FAFB",borderRadius:8,fontSize:11.5,color:"#6B7280"}}>
                      💡 La estructura empresarial define los centros de costo y departamentos disponibles en todos los módulos (Inventario, RRHH, Solicitudes).
                    </div>
                  </div>
                )}

                {tab==="config"&&(
                  <div className="g2" style={{alignItems:"start"}}>
                    <div className="card">
                      <div className="card-title">⚙️ Configuración legal y fiscal</div>
                      {[{k:"pais",l:"País",opts:["Costa Rica","México","Guatemala","Panamá","Colombia"]},{k:"moneda",l:"Moneda base",opts:["CRC","USD","MXN","GTQ","COP"]},{k:"anoFiscal",l:"Año fiscal",opts:["Enero–Diciembre","Octubre–Septiembre","Julio–Junio"]}].map(f=>(
                        <div key={f.k} className="form-group">
                          <label className="form-label">{f.l}</label>
                          <select className="form-control" defaultValue={(empSel as any)[f.k]} onChange={e=>setEmpSel({...empSel,[f.k]:e.target.value})}>
                            {f.opts.map(o=><option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                      <div className="toggle-row"><span style={{fontSize:12.5}}>Empresa activa en la plataforma</span><div className={`toggle ${empSel.activa?"on":""}`} onClick={()=>setEmpSel({...empSel,activa:!empSel.activa})}/></div>
                      <button className="btn btn-primary btn-sm" style={{marginTop:12}} onClick={()=>actualizarEmpresa(empSel)}>💾 Guardar configuración</button>
                    </div>
                    <div className="card">
                      <div className="card-title">🔗 Módulos habilitados</div>
                      {[["📦 Inventario & Proveeduría",true],["👥 RRHH & Nómina",true],["📊 BI & Reportería",true],["📬 Solicitudes",true],["💰 Finanzas",false],["🤝 CRM & Ventas",false],["✅ Calidad ISO",false]].map(([m,on],i)=>(
                        <div key={i} className="toggle-row">
                          <span style={{fontSize:12.5}}>{m as string}</span>
                          <div className={`toggle ${on?"on":""}`} onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Empresas activas</div>
        {empresas.filter(e=>e.activa).map(emp=>(
          <div key={emp.id} onClick={()=>{setEmpSel(emp);setTab("resumen");}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
            <div style={{width:28,height:28,borderRadius:7,background:emp.color+"20",border:`1px solid ${emp.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{emp.icono}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>{emp.nombre}</div>
              <div style={{fontSize:10.5,color:"#6B7280"}}>{emp.verticales.length} verticales · {emp.pais}</div>
            </div>
          </div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Resumen de verticales</div>
        {empSel.verticales.map(v=>(
          <div key={v.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <span style={{fontSize:14}}>{v.icono}</span>
            <div style={{flex:1}}><div style={{fontSize:11.5,fontWeight:500,color:v.color}}>{v.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{v.sucursales.length} suc · {v.deptos.length} dptos</div></div>
            <span style={{width:7,height:7,borderRadius:"50%",background:v.activa?"#10B981":"#9CA3AF"}}/>
          </div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Nueva empresa",i:"🏢"},{l:"Nueva vertical",i:"➕"},{l:"Ver estructura",i:"🗂️"}].map(a=>(
          <div key={a.l} onClick={()=>a.l==="Nueva empresa"?setShowNuevaEmp(true):a.l==="Nueva vertical"?(setTab("verticales"),setShowNuevaVert(true)):setTab("estructura")}
            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
