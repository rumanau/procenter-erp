import React, { useState } from "react";
import type { View, Empleado } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function CatalogoPlanillas({setView,catalogos,setCatalogos,empleados,setEmpleados}:{
  setView:(v:View)=>void;
  catalogos:typeof CATALOGOS_INIT;
  setCatalogos:(c:typeof CATALOGOS_INIT)=>void;
  empleados:Empleado[];
  setEmpleados:(e:Empleado[])=>void;
}) {
  const [selPlanillaId,setSelPlanillaId]=useState(catalogos.planillas[0]?.id||"");
  const [tabDetalle,setTabDetalle]=useState<"config"|"empleados"|"resumen">("empleados");
  const [editForm,setEditForm]=useState<any>(null);
  const [busqueda,setBusqueda]=useState("");

  const planillas=catalogos.planillas;
  const selPlanilla=planillas.find(p=>p.id===selPlanillaId)||planillas[0];
  const estadoColor=(e:string)=>e==="activa"?"#10B981":e==="borrador"?"#F59E0B":"#9CA3AF";
  const tipoColor=(t:string)=>t==="Fija"?"#3B82F6":t==="Variable"?"#7C3AED":t==="Outsourcing"?"#E8611A":"#10B981";

  const empsEnPlanilla=empleados.filter(e=>
    selPlanilla?.empleadosIds.includes(e.id) && e.estado==="activo"
  );
  const empsDisponibles=empleados.filter(e=>
    e.estado==="activo" &&
    !planillas.filter(p=>p.estado==="activa").some(p=>p.empleadosIds.includes(e.id)) &&
    (busqueda===""||e.nombre.toLowerCase().includes(busqueda.toLowerCase())||e.puesto.toLowerCase().includes(busqueda.toLowerCase()))
  );
  const empsEnOtraPlanilla=empleados.filter(e=>
    e.estado==="activo" &&
    planillas.filter(p=>p.estado==="activa"&&p.id!==selPlanillaId).some(p=>p.empleadosIds.includes(e.id)) &&
    (busqueda===""||e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const totalBruto=empsEnPlanilla.reduce((a,e)=>a+e.salario,0);
  const fmt=(n:number)=>"₡"+Math.round(n).toLocaleString("es-CR");

  const agregarEmpleado=(empId:string)=>{
    const nuevasPlanillas=planillas.map(p=>
      p.id===selPlanillaId ? {...p,empleadosIds:[...p.empleadosIds,empId]} : p
    );
    setCatalogos({...catalogos,planillas:nuevasPlanillas});
    setEmpleados(empleados.map(e=>e.id===empId?{...e,planillaId:selPlanillaId}:e));
    setBusqueda("");
  };

  const quitarEmpleado=(empId:string)=>{
    if(!window.confirm("¿Quitar este colaborador de la planilla? Quedará sin planilla asignada.")) return;
    const nuevasPlanillas=planillas.map(p=>
      p.id===selPlanillaId ? {...p,empleadosIds:p.empleadosIds.filter((id:string)=>id!==empId)} : p
    );
    setCatalogos({...catalogos,planillas:nuevasPlanillas});
    setEmpleados(empleados.map(e=>e.id===empId?{...e,planillaId:""}:e));
  };

  const moverEmpleado=(empId:string,planillaOrigenId:string)=>{
    if(!window.confirm("¿Mover este colaborador a esta planilla?")) return;
    const nuevasPlanillas=planillas.map(p=>{
      if(p.id===planillaOrigenId) return {...p,empleadosIds:p.empleadosIds.filter((id:string)=>id!==empId)};
      if(p.id===selPlanillaId) return {...p,empleadosIds:[...p.empleadosIds,empId]};
      return p;
    });
    setCatalogos({...catalogos,planillas:nuevasPlanillas});
    setEmpleados(empleados.map(e=>e.id===empId?{...e,planillaId:selPlanillaId}:e));
  };

  const guardarConfig=(p:typeof CATALOGOS_INIT.planillas[0])=>{
    const nuevasPlanillas=planillas.map(x=>x.id===p.id?p:x);
    setCatalogos({...catalogos,planillas:nuevasPlanillas});
    setEditForm(null);
  };

  const nuevaPlanilla=()=>{
    const nueva={
      id:`PL${Date.now()}`,nombre:"Nueva Planilla",estado:"borrador",
      banco:"",cuenta:"",moneda:"CRC",frecuencia:"Mensual",
      ccssObrero:7.45,ccssPatronal:26.33,heRegular:1.5,heDoble:2.0,
      flujoAprobacion:["Gerencia"],empleadosIds:[],tipo:"Fija",color:"#9CA3AF",
      autorizador:"",descripcion:""
    };
    setCatalogos({...catalogos,planillas:[...planillas,nueva]});
    setSelPlanillaId(nueva.id);
    setTabDetalle("config");
    setEditForm({...nueva});
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#064E3B,#065F46)",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:28}}>📋</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Catálogo de Planillas</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,.55)"}}>Multi-planilla · Asignación de empleados · Parámetros por planilla · Flujo de aprobación</div>
          </div>
          <button className="btn btn-sm" style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setView("nomina")}>💰 Ir a Nómina</button>
          <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={nuevaPlanilla}>➕ Nueva Planilla</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[
            {l:"Planillas activas",v:planillas.filter(p=>p.estado==="activa").length.toString(),c:"#10B981"},
            {l:"Total colaboradores",v:empleados.filter(e=>e.estado==="activo").length.toString(),c:"#1B1F2E"},
            {l:"Asignados a planilla",v:empleados.filter(e=>e.estado==="activo"&&planillas.some(p=>p.estado==="activa"&&p.empleadosIds.includes(e.id))).length.toString(),c:"#3B82F6"},
            {l:"Sin planilla asignada",v:empleados.filter(e=>e.estado==="activo"&&!planillas.filter(p=>p.estado==="activa").some(p=>p.empleadosIds.includes(e.id))).length.toString(),c:"#EF4444"},
          ].map(k=>(
            <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c}}>{k.v}</div></div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:12,alignItems:"start"}}>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",fontSize:12,fontWeight:700,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Planillas</span>
              <span style={{fontSize:10,color:"#9CA3AF"}}>{planillas.length} total</span>
            </div>
            {planillas.map(p=>{
              const n=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo").length;
              const bruto=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo").reduce((a,e)=>a+e.salario,0);
              const isSelected=selPlanillaId===p.id;
              return (
                <div key={p.id} onClick={()=>{setSelPlanillaId(p.id);setEditForm(null);setTabDetalle("empleados");setBusqueda("");}}
                  style={{padding:"12px 14px",borderBottom:"1px solid #F3F4F6",cursor:"pointer",borderLeft:`3px solid ${isSelected?p.color:"transparent"}`,background:isSelected?"#FAFAFA":"#fff",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                    <div style={{fontSize:12.5,fontWeight:isSelected?700:500,flex:1,color:isSelected?"#1B1F2E":"#374151"}}>{p.nombre}</div>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:"9999px",background:estadoColor(p.estado)+"20",color:estadoColor(p.estado),fontWeight:600}}>{p.estado}</span>
                  </div>
                  <div style={{fontSize:11,color:"#6B7280",paddingLeft:18,display:"flex",gap:10}}>
                    <span>👥 {n} emp.</span>
                    <span>💰 {fmt(bruto)}</span>
                  </div>
                  <div style={{fontSize:10,color:"#9CA3AF",paddingLeft:18,marginTop:2}}>{p.banco||"Sin banco"} · {p.moneda}</div>
                </div>
              );
            })}
          </div>

          {selPlanilla&&(
            <div>
              <div style={{background:"#1B1F2E",borderRadius:10,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:selPlanilla.color,boxShadow:`0 0 0 3px ${selPlanilla.color}40`}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{selPlanilla.nombre}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{selPlanilla.descripcion||"Sin descripción"}</div>
                </div>
                <span style={{fontSize:11,padding:"3px 10px",borderRadius:"9999px",background:estadoColor(selPlanilla.estado)+"30",color:estadoColor(selPlanilla.estado),fontWeight:600,border:`1px solid ${estadoColor(selPlanilla.estado)}50`}}>{selPlanilla.estado}</span>
                <span style={{fontSize:11,padding:"3px 10px",borderRadius:"9999px",background:tipoColor(selPlanilla.tipo)+"30",color:tipoColor(selPlanilla.tipo),fontWeight:600}}>{selPlanilla.tipo}</span>
              </div>

              <div className="tab-bar" style={{marginBottom:12}}>
                {[["empleados","👥 Empleados en planilla"],["config","⚙️ Configuración"],["resumen","📊 Resumen nómina"]].map(([id,l])=>(
                  <div key={id} className={`tab-btn ${tabDetalle===id?"active":""}`} onClick={()=>{setTabDetalle(id as any);setEditForm(null);setBusqueda("");}}>{l}</div>
                ))}
              </div>

              {tabDetalle==="empleados"&&(
                <div>
                  <div className="card" style={{marginBottom:12,padding:0,overflow:"hidden"}}>
                    <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,fontWeight:700,flex:1}}>👥 Empleados en {selPlanilla.nombre}</span>
                      <span style={{fontSize:11.5,color:"#6B7280"}}>{empsEnPlanilla.length} colaboradores · {fmt(totalBruto)} bruto</span>
                    </div>
                    {empsEnPlanilla.length===0?(
                      <div style={{textAlign:"center",padding:"30px",color:"#9CA3AF"}}>
                        <div style={{fontSize:28,marginBottom:8}}>👥</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#1B1F2E",marginBottom:4}}>Sin empleados asignados</div>
                        <div style={{fontSize:12}}>Usa el buscador de abajo para agregar colaboradores a esta planilla</div>
                      </div>
                    ):(
                      <table className="tbl">
                        <thead><tr><th>Colaborador</th><th>Puesto</th><th>Depto.</th><th>Salario bruto</th><th>Banco</th><th>Contrato</th><th></th></tr></thead>
                        <tbody>
                          {empsEnPlanilla.map(e=>(
                            <tr key={e.id}>
                              <td>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div className="user-avatar" style={{width:28,height:28,fontSize:10,flexShrink:0}}>{e.foto.slice(0,2)}</div>
                                  <div>
                                    <div style={{fontSize:12.5,fontWeight:600}}>{e.nombre}</div>
                                    <div style={{fontSize:10,color:"#6B7280"}}>{e.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{fontSize:11.5,color:"#6B7280"}}>{e.puesto}</td>
                              <td><span className="badge badge-info" style={{fontSize:9}}>{e.depto}</span></td>
                              <td style={{fontWeight:700,color:"#10B981"}}>{fmt(e.salario)}</td>
                              <td style={{fontSize:11.5,color:"#6B7280"}}>{e.banco}</td>
                              <td><span className={`badge ${e.tipo==="Indefinido"?"badge-ok":"badge-warn"}`} style={{fontSize:9}}>{e.tipo}</span></td>
                              <td>
                                <button className="btn btn-ghost btn-sm" style={{color:"#EF4444",fontSize:10}} onClick={()=>quitarEmpleado(e.id)}>✕ Quitar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{background:"#F9FAFB",fontWeight:700}}>
                            <td colSpan={3} style={{fontSize:12}}>TOTAL PLANILLA</td>
                            <td style={{color:"#E8611A"}}>{fmt(totalBruto)}</td>
                            <td colSpan={3}></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>

                  <div className="card" style={{marginBottom:12}}>
                    <div className="card-title">➕ Agregar colaborador a esta planilla</div>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      <div className="header-search" style={{flex:1}}>
                        <span>🔍</span>
                        <input placeholder="Buscar por nombre o puesto..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/>
                        {busqueda&&<span style={{cursor:"pointer",color:"#9CA3AF",fontSize:13}} onClick={()=>setBusqueda("")}>✕</span>}
                      </div>
                    </div>

                    {empsDisponibles.length>0&&(
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#10B981",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:8}}>✓ Sin planilla asignada — disponibles</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {empsDisponibles.map(e=>(
                            <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"1px solid #6EE7B7",background:"#ECFDF5"}}>
                              <div className="user-avatar" style={{width:28,height:28,fontSize:10,flexShrink:0}}>{e.foto.slice(0,2)}</div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12.5,fontWeight:600}}>{e.nombre}</div>
                                <div style={{fontSize:11,color:"#6B7280"}}>{e.puesto} · {e.depto} · {fmt(e.salario)}</div>
                              </div>
                              <button className="btn btn-primary btn-sm" onClick={()=>agregarEmpleado(e.id)}>➕ Agregar</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {empsEnOtraPlanilla.length>0&&(busqueda!==""||empsDisponibles.length===0)&&(
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:"#F59E0B",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:8}}>⚠ En otra planilla — mover aquí</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {empsEnOtraPlanilla.map(e=>{
                            const planOrigen=planillas.find(p=>p.id!==selPlanillaId&&p.empleadosIds.includes(e.id));
                            return (
                              <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"1px solid #FDE68A",background:"#FFFBEB"}}>
                                <div className="user-avatar" style={{width:28,height:28,fontSize:10,flexShrink:0}}>{e.foto.slice(0,2)}</div>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:12.5,fontWeight:600}}>{e.nombre}</div>
                                  <div style={{fontSize:11,color:"#6B7280"}}>{e.puesto} · Actualmente en: <b>{planOrigen?.nombre||"—"}</b></div>
                                </div>
                                <button className="btn btn-sm" style={{background:"#F59E0B",color:"#fff",border:"none",fontSize:10}} onClick={()=>moverEmpleado(e.id,planOrigen?.id||"")}>🔄 Mover aquí</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {empsDisponibles.length===0&&empsEnOtraPlanilla.length===0&&busqueda===""&&(
                      <div style={{textAlign:"center",padding:"16px",color:"#9CA3AF",fontSize:12}}>
                        ✓ Todos los colaboradores activos ya tienen planilla asignada.<br/>
                        Usa el buscador para buscar uno específico y moverlo.
                      </div>
                    )}
                    {empsDisponibles.length===0&&empsEnOtraPlanilla.length===0&&busqueda!==""&&(
                      <div style={{textAlign:"center",padding:"16px",color:"#9CA3AF",fontSize:12}}>
                        Sin resultados para "{busqueda}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tabDetalle==="config"&&(
                <div>
                  {editForm?(
                    <div className="card" style={{border:"1.5px solid #E8611A"}}>
                      <div className="card-title" style={{color:"#E8611A",marginBottom:14}}>✏️ Editando: {editForm.nombre}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                        {[{k:"nombre",l:"Nombre de la planilla"},{k:"banco",l:"Banco"},{k:"cuenta",l:"Número de cuenta IBAN"},{k:"moneda",l:"Moneda (CRC/USD)"},{k:"frecuencia",l:"Frecuencia de pago"},{k:"autorizador",l:"Autorizador principal"},{k:"descripcion",l:"Descripción"},{k:"tipo",l:"Tipo (Fija/Variable/Outsourcing)"}].map(f=>(
                          <div key={f.k} className="form-group" style={{margin:0}}>
                            <label className="form-label">{f.l}</label>
                            <input className="form-control" value={editForm[f.k]||""} onChange={e=>setEditForm({...editForm,[f.k]:e.target.value})}/>
                          </div>
                        ))}
                        {[{k:"ccssObrero",l:"CCSS Obrero (%)"},{k:"ccssPatronal",l:"CCSS Patronal (%)"},{k:"heRegular",l:"Factor HE Regular (×)"},{k:"heDoble",l:"Factor HE Doble (×)"}].map(f=>(
                          <div key={f.k} className="form-group" style={{margin:0}}>
                            <label className="form-label">{f.l}</label>
                            <input className="form-control" type="number" step="0.01" value={editForm[f.k]} onChange={e=>setEditForm({...editForm,[f.k]:parseFloat(e.target.value)||0})}/>
                          </div>
                        ))}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Estado</label>
                        <select className="form-control" value={editForm.estado} onChange={e=>setEditForm({...editForm,estado:e.target.value})}>
                          <option value="activa">Activa</option>
                          <option value="borrador">Borrador</option>
                          <option value="inactiva">Inactiva</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Flujo de aprobación (pasos separados por coma)</label>
                        <input className="form-control" value={editForm.flujoAprobacion?.join(",")||""} onChange={e=>setEditForm({...editForm,flujoAprobacion:e.target.value.split(",").map((s:string)=>s.trim())})}/>
                        <div style={{fontSize:10.5,color:"#6B7280",marginTop:4}}>Ej: Empleado,Jefatura,Gerencia,Contabilidad</div>
                      </div>
                      <div style={{display:"flex",gap:8,marginTop:12}}>
                        <button className="btn btn-primary btn-sm" onClick={()=>guardarConfig(editForm)}>💾 Guardar configuración</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setEditForm(null)}>Cancelar</button>
                      </div>
                    </div>
                  ):(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div className="card">
                        <div className="card-title" style={{fontSize:12}}>🏦 Cuenta bancaria & pago</div>
                        <div className="resumen">
                          {[["Banco",selPlanilla.banco||"—"],["Cuenta IBAN",selPlanilla.cuenta||"—"],["Moneda",selPlanilla.moneda],["Frecuencia",selPlanilla.frecuencia],["Autorizador",selPlanilla.autorizador||"—"]].map(([l,v])=>(
                            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11}}>{v}</span></div>
                          ))}
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-title" style={{fontSize:12}}>⚙️ Parámetros de cálculo</div>
                        <div className="resumen">
                          {[["Tipo",selPlanilla.tipo],["CCSS Obrero",`${selPlanilla.ccssObrero}%`],["CCSS Patronal",`${selPlanilla.ccssPatronal}%`],["HE Regulares",`×${selPlanilla.heRegular}`],["HE Dobles",`×${selPlanilla.heDoble}`]].map(([l,v])=>(
                            <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{color:"#E8611A",fontSize:11}}>{v}</span></div>
                          ))}
                        </div>
                      </div>
                      <div className="card" style={{gridColumn:"1/-1"}}>
                        <div className="card-title" style={{fontSize:12}}>✅ Flujo de aprobación</div>
                        <div style={{display:"flex",gap:2,marginTop:8}}>
                          {selPlanilla.flujoAprobacion.map((paso,i)=>(
                            <div key={i} style={{flex:1,textAlign:"center",padding:"8px 4px",background:i===0?"#ECFDF5":i===1?"#FFF3ED":"#F4F5F7",border:`0.5px solid ${i===0?"#6EE7B7":i===1?"#FED7AA":"#E5E7EB"}`,borderRadius:i===0?"7px 0 0 7px":i===selPlanilla.flujoAprobacion.length-1?"0 7px 7px 0":"0",fontSize:11,fontWeight:600,color:i===0?"#065F46":i===1?"#92400E":"#6B7280"}}>
                              {i===0?"✓":i===1?"▶":"○"} {paso}
                              <div style={{fontSize:9,fontWeight:400,marginTop:2,color:"#9CA3AF"}}>Paso {i+1}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{gridColumn:"1/-1",display:"flex",gap:8}}>
                        <button className="btn btn-primary btn-sm" onClick={()=>setEditForm({...selPlanilla})}>✏️ Editar configuración</button>
                        <button className="btn btn-secondary btn-sm" onClick={()=>setView("nomina")}>💰 Ver en nómina →</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tabDetalle==="resumen"&&(
                <div>
                  {empsEnPlanilla.length===0?(
                    <div style={{textAlign:"center",padding:"40px",color:"#9CA3AF",background:"#F9FAFB",borderRadius:10}}>
                      <div style={{fontSize:32,marginBottom:8}}>💰</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#1B1F2E",marginBottom:4}}>Sin empleados en esta planilla</div>
                      <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={()=>setTabDetalle("empleados")}>👥 Agregar empleados →</button>
                    </div>
                  ):(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                        {[
                          {l:"Planilla bruta",v:fmt(totalBruto),c:"#E8611A"},
                          {l:"Deducción obrera est.",v:fmt(Math.round(totalBruto*(selPlanilla.ccssObrero/100+0.02))),c:"#EF4444"},
                          {l:"Planilla neta est.",v:fmt(Math.round(totalBruto*0.85)),c:"#10B981"},
                          {l:"Carga patronal est.",v:fmt(Math.round(totalBruto*(selPlanilla.ccssPatronal/100))),c:"#3B82F6"},
                          {l:"Aguinaldo 1/12",v:fmt(Math.round(totalBruto/12)),c:"#7C3AED"},
                          {l:"Costo total empresa",v:fmt(Math.round(totalBruto*(1+selPlanilla.ccssPatronal/100+1/12))),c:"#1B1F2E"},
                        ].map(k=>(
                          <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{fontSize:14,color:k.c}}>{k.v}</div></div>
                        ))}
                      </div>
                      <div className="card" style={{padding:0,overflow:"hidden"}}>
                        <table className="tbl">
                          <thead><tr><th>Colaborador</th><th>Salario bruto</th><th>CCSS ob. est.</th><th>Renta est.</th><th>Neto est.</th><th>Banco</th></tr></thead>
                          <tbody>
                            {empsEnPlanilla.map(e=>{
                              const ccss=Math.round(e.salario*(selPlanilla.ccssObrero/100+0.02));
                              const renta=Math.round(Math.max(0,(e.salario-ccss-929000)*0.10));
                              const neto=e.salario-ccss-renta;
                              return (
                                <tr key={e.id}>
                                  <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="user-avatar" style={{width:24,height:24,fontSize:9}}>{e.foto.slice(0,2)}</div><span style={{fontSize:12.5,fontWeight:500}}>{e.nombre}</span></div></td>
                                  <td style={{fontWeight:600}}>{fmt(e.salario)}</td>
                                  <td style={{color:"#EF4444",fontSize:11.5}}>-{fmt(ccss)}</td>
                                  <td style={{color:"#EF4444",fontSize:11.5}}>-{fmt(renta)}</td>
                                  <td style={{fontWeight:700,color:"#10B981"}}>{fmt(neto)}</td>
                                  <td style={{fontSize:11.5,color:"#6B7280"}}>{e.banco}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{background:"#F9FAFB",fontWeight:700}}>
                              <td>TOTAL</td>
                              <td style={{color:"#E8611A"}}>{fmt(totalBruto)}</td>
                              <td style={{color:"#EF4444",fontSize:11.5}}>-{fmt(Math.round(totalBruto*(selPlanilla.ccssObrero/100+0.02)))}</td>
                              <td style={{color:"#EF4444",fontSize:11.5}}>-{fmt(Math.round(totalBruto*0.04))}</td>
                              <td style={{color:"#10B981"}}>{fmt(Math.round(totalBruto*0.85))}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div style={{marginTop:10,display:"flex",gap:8}}>
                        <button className="btn btn-primary btn-sm" onClick={()=>setView("nomina")}>💰 Procesar en nómina completa →</button>
                        <button className="btn btn-secondary btn-sm">📥 Exportar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Vista global</div>
        {planillas.map(p=>{
          const n=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo").length;
          const bruto=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo").reduce((a,e)=>a+e.salario,0);
          return (
            <div key={p.id} onClick={()=>{setSelPlanillaId(p.id);setTabDetalle("empleados");setBusqueda("");}}
              style={{padding:"9px 10px",borderRadius:8,background:selPlanillaId===p.id?"#FFF3ED":"#F9FAFB",border:`1px solid ${selPlanillaId===p.id?"#E8611A":"#E5E7EB"}`,marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
                <div style={{fontSize:12,fontWeight:600,flex:1}}>{p.nombre}</div>
                <span style={{fontSize:10,color:estadoColor(p.estado),fontWeight:600}}>{p.estado}</span>
              </div>
              <div style={{fontSize:11,color:"#6B7280",paddingLeft:14}}>{n} empleados · {fmt(bruto)}</div>
            </div>
          );
        })}

        <div style={{height:12}}/>
        <div className="panel-title">Sin planilla asignada</div>
        {empleados.filter(e=>e.estado==="activo"&&!planillas.filter(p=>p.estado==="activa").some(p=>p.empleadosIds.includes(e.id))).length===0?(
          <div style={{fontSize:11.5,color:"#10B981"}}>✓ Todos los colaboradores tienen planilla</div>
        ):(
          empleados.filter(e=>e.estado==="activo"&&!planillas.filter(p=>p.estado==="activa").some(p=>p.empleadosIds.includes(e.id))).map(e=>(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div className="user-avatar" style={{width:24,height:24,fontSize:9,background:"#EF4444"}}>{e.foto.slice(0,2)}</div>
              <div style={{flex:1}}><div style={{fontSize:11.5,fontWeight:500}}>{e.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{e.puesto}</div></div>
            </div>
          ))
        )}

        <div style={{height:12}}/>
        <div className="panel-title">Acciones</div>
        {[{l:"Nueva planilla",i:"➕"},{l:"Ir a nómina",i:"💰"},{l:"Config. RRHH",i:"⚙️"}].map(a=>(
          <div key={a.l} onClick={()=>a.l==="Nueva planilla"?nuevaPlanilla():a.l==="Ir a nómina"?setView("nomina"):setView("config-rrhh")}
            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
