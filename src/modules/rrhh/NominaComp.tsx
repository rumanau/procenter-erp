import React, { useState } from "react";
import type { View, Empleado, Planilla, FilaPlanilla, LineaHE, DeduccionExtra } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";

export function calcularRenta(salNeto:number):number {
  if(salNeto<=929000) return 0;
  if(salNeto<=1363000) return Math.round((salNeto-929000)*0.10);
  if(salNeto<=2393000) return Math.round((434000*0.10)+((salNeto-1363000)*0.15));
  if(salNeto<=4783000) return Math.round((434000*0.10)+(1030000*0.15)+((salNeto-2393000)*0.20));
  return Math.round((434000*0.10)+(1030000*0.15)+(2390000*0.20)+((salNeto-4783000)*0.25));
}

export function calcularPlanillaCompleta(
  emps:Empleado[], planilla:Planilla,
  lineasHE:LineaHE[]=[],
  bonos:Record<string,number>={},
  dedExtra:DeduccionExtra[]=[],
):FilaPlanilla[] {
  const p=planilla as any;
  return emps.map(e=>{
    const salBase=e.salario;
    const heEmp=lineasHE.filter(l=>l.empId===e.id);
    const heReg=heEmp.filter(l=>l.tipo==="regular").reduce((a,l)=>a+l.horas*((salBase/(30*8))*1.5),0);
    const heDob=heEmp.filter(l=>l.tipo==="doble").reduce((a,l)=>a+l.horas*((salBase/(30*8))*2),0);
    const bono=bonos[e.id]||0;
    const salBruto=salBase+heReg+heDob+bono;
    const ccssObrero=Math.round(salBruto*(p.ccssObreroPorc/100));
    const opc=Math.round(salBruto*(p.opcPorc/100));
    const bpop=Math.round(salBruto*(p.bpopPorc/100));
    const baseRenta=salBruto-ccssObrero-opc-bpop;
    const renta=calcularRenta(baseRenta);
    const dedsExtra=dedExtra.filter(d=>d.empId===e.id).reduce((a,d)=>a+d.monto,0);
    const totalDed=ccssObrero+opc+bpop+renta+dedsExtra;
    const liquido=salBruto-totalDed;
    const ccssPatronal=Math.round(salBruto*(p.ccssPatronalPorc/100));
    const aguinaldo=Math.round(salBruto/12);
    const cargoTotal=salBruto+ccssPatronal+aguinaldo;
    return {empId:e.id,nombre:e.nombre,puesto:e.puesto,salBase,heReg,heDob,bono,salBruto,ccssObrero,opc,bpop,renta,dedsExtra,totalDed,liquido,ccssPatronal,aguinaldo,cargoTotal};
  });
}

export function NominaComp({setView,empleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];catalogos:typeof CATALOGOS_INIT}) {
  const [tab,setTab]=useState("selector");
  const [planSelId,setPlanSelId]=useState(catalogos.planillas[0]?.id||"");
  const [lineasHE,setLineasHE]=useState<LineaHE[]>([]);
  const [bonos,setBonos]=useState<Record<string,number>>({});
  const [dedExtra,setDedExtra]=useState<DeduccionExtra[]>([]);
  const [historial]=useState<any[]>([
    {per:"Mayo 2024",planilla:"Fijo Mensual",estado:"Aprobada",pagado:"✓",bruto:12450000,liquido:9820000},
    {per:"Abril 2024",planilla:"Fijo Mensual",estado:"Aprobada",pagado:"✓",bruto:12200000,liquido:9600000},
    {per:"Marzo 2024",planilla:"Fijo Mensual",estado:"Aprobada",pagado:"✓",bruto:11980000,liquido:9440000},
  ]);

  const planSel=(catalogos.planillas as any[]).find(p=>p.id===planSelId)||catalogos.planillas[0];
  const empsEnPlan=empleados.filter(e=>e.estado==="activo"&&planSel?.empleadosIds?.includes(e.id));
  const filas:FilaPlanilla[]=planSel?calcularPlanillaCompleta(empsEnPlan,planSel,lineasHE,bonos,dedExtra):[];
  const totBruto=filas.reduce((a,f)=>a+f.salBruto,0);
  const totLiquido=filas.reduce((a,f)=>a+f.liquido,0);
  const totPatronal=filas.reduce((a,f)=>a+f.ccssPatronal,0);
  const totCargo=filas.reduce((a,f)=>a+f.cargoTotal,0);

  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Nómina</div>
            <div className="page-subtitle">Motor de cálculo CR · CCSS · Renta · HE · Aguinaldo · ISO 9001 §8.1</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar planilla</button>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("✅ Planilla enviada a aprobación.")}>✅ Enviar a aprobación</button>
          </div>
        </div>

        <div className="tab-bar">
          {[["selector","📋 Selector"],["planilla","💰 Planilla"],["he","⏱ HE & Bonos"],["compensacion","🎁 Compensación"],["historial","📚 Historial"],["contable","📊 Contable"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="selector"&&(
          <div>
            <div className="g4" style={{marginBottom:14}}>
              <div className="kpi"><div className="kpi-label">Planillas activas</div><div className="kpi-value">{(catalogos.planillas as any[]).filter(p=>p.estado==="activa").length}</div></div>
              <div className="kpi"><div className="kpi-label">Colaboradores en {planSel?.nombre||"—"}</div><div className="kpi-value">{empsEnPlan.length}</div></div>
              <div className="kpi"><div className="kpi-label">Bruto total</div><div className="kpi-value" style={{fontSize:14,color:"#E8611A"}}>{fmt(totBruto)}</div></div>
              <div className="kpi"><div className="kpi-label">Cargo empresa</div><div className="kpi-value" style={{fontSize:14,color:"#7C3AED"}}>{fmt(totCargo)}</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
              {(catalogos.planillas as any[]).map(pl=>{
                const n=empleados.filter(e=>pl.empleadosIds.includes(e.id)&&e.estado==="activo").length;
                const isSelected=pl.id===planSelId;
                return (
                  <div key={pl.id} onClick={()=>{setPlanSelId(pl.id);setTab("planilla");}}
                    style={{border:`2px solid ${isSelected?"#E8611A":pl.color+"40"}`,borderRadius:10,padding:"14px 16px",background:isSelected?"#FFF3ED":"#fff",cursor:"pointer",boxShadow:isSelected?"0 2px 8px rgba(232,97,26,.15)":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:8,background:pl.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💰</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:isSelected?"#E8611A":"#1B1F2E"}}>{pl.nombre}</div>
                        <span className={`badge ${pl.estado==="activa"?"badge-ok":"badge-gray"}`} style={{fontSize:9}}>{pl.estado}</span>
                      </div>
                      {isSelected&&<span style={{color:"#E8611A",fontSize:18}}>✓</span>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {[["Colaboradores",n],["CCSS Obrero",`${pl.ccssObreroPorc}%`],["OPC",`${pl.opcPorc}%`],["B.Pop",`${pl.bpopPorc}%`],["CCSS Patronal",`${pl.ccssPatronalPorc}%`],["Periodicidad",pl.periodicidad||"Mensual"]].map(([l,v])=>(
                        <div key={l as string} style={{background:"#F9FAFB",borderRadius:6,padding:"5px 8px"}}>
                          <div style={{fontSize:10,color:"#6B7280"}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#1B1F2E"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="planilla"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700}}>Planilla: {planSel?.nombre} · {empsEnPlan.length} colaboradores</div>
              <div style={{display:"flex",gap:6}}>
                <select className="form-control" style={{width:180}} value={planSelId} onChange={e=>setPlanSelId(e.target.value)}>
                  {(catalogos.planillas as any[]).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm">📥 Exportar</button>
              </div>
            </div>
            <div className="card" style={{padding:0,overflow:"auto",marginBottom:10}}>
              <table className="tbl" style={{minWidth:900}}>
                <thead>
                  <tr style={{background:"#F8FAFC"}}>
                    <th>Colaborador</th><th>Sal. Base</th><th>HE Reg.</th><th>HE Dob.</th><th>Bono</th>
                    <th>Sal. Bruto</th><th>CCSS</th><th>OPC</th><th>B.Pop</th><th>Renta</th>
                    <th>Total Ded.</th><th style={{color:"#10B981"}}>Líquido</th><th>C.C. Patronal</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(f=>(
                    <tr key={f.empId}>
                      <td>
                        <div style={{fontSize:12,fontWeight:600}}>{f.nombre}</div>
                        <div style={{fontSize:10.5,color:"#6B7280"}}>{f.puesto}</div>
                      </td>
                      <td style={{fontSize:11.5}}>{fmt(f.salBase)}</td>
                      <td style={{fontSize:11.5,color:f.heReg>0?"#F59E0B":"#D1D5DB"}}>{f.heReg>0?fmt(Math.round(f.heReg)):"—"}</td>
                      <td style={{fontSize:11.5,color:f.heDob>0?"#EF4444":"#D1D5DB"}}>{f.heDob>0?fmt(Math.round(f.heDob)):"—"}</td>
                      <td style={{fontSize:11.5,color:f.bono>0?"#10B981":"#D1D5DB"}}>{f.bono>0?fmt(f.bono):"—"}</td>
                      <td style={{fontSize:12,fontWeight:700}}>{fmt(Math.round(f.salBruto))}</td>
                      <td style={{fontSize:11,color:"#EF4444"}}>-{fmt(f.ccssObrero)}</td>
                      <td style={{fontSize:11,color:"#EF4444"}}>-{fmt(f.opc)}</td>
                      <td style={{fontSize:11,color:"#EF4444"}}>-{fmt(f.bpop)}</td>
                      <td style={{fontSize:11,color:"#EF4444"}}>-{fmt(f.renta)}</td>
                      <td style={{fontSize:11,color:"#EF4444",fontWeight:600}}>-{fmt(f.totalDed)}</td>
                      <td style={{fontSize:12,fontWeight:700,color:"#10B981"}}>{fmt(Math.round(f.liquido))}</td>
                      <td style={{fontSize:11,color:"#7C3AED"}}>{fmt(f.ccssPatronal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"#F8FAFC",fontWeight:700}}>
                    <td>TOTALES</td>
                    <td>{fmt(filas.reduce((a,f)=>a+f.salBase,0))}</td>
                    <td colSpan={3}/>
                    <td>{fmt(Math.round(totBruto))}</td>
                    <td colSpan={5} style={{color:"#EF4444"}}>-{fmt(filas.reduce((a,f)=>a+f.totalDed,0))}</td>
                    <td style={{color:"#10B981"}}>{fmt(Math.round(totLiquido))}</td>
                    <td style={{color:"#7C3AED"}}>{fmt(totPatronal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="g4">
              <div className="kpi"><div className="kpi-label">Bruto planilla</div><div className="kpi-value" style={{fontSize:14,color:"#E8611A"}}>{fmt(Math.round(totBruto))}</div></div>
              <div className="kpi"><div className="kpi-label">Total deducciones</div><div className="kpi-value" style={{fontSize:14,color:"#EF4444"}}>{fmt(filas.reduce((a,f)=>a+f.totalDed,0))}</div></div>
              <div className="kpi"><div className="kpi-label">Líquido a pagar</div><div className="kpi-value" style={{fontSize:14,color:"#10B981"}}>{fmt(Math.round(totLiquido))}</div></div>
              <div className="kpi"><div className="kpi-label">Costo total empresa</div><div className="kpi-value" style={{fontSize:14,color:"#7C3AED"}}>{fmt(Math.round(totCargo))}</div></div>
            </div>
          </div>
        )}

        {tab==="he"&&(
          <div>
            <div className="g2" style={{alignItems:"start"}}>
              <div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="card-title">Registrar Horas Extra</div>
                  {empsEnPlan.map(e=>{
                    const le=lineasHE.filter(l=>l.empId===e.id);
                    const hrReg=le.filter(l=>l.tipo==="regular").reduce((a,l)=>a+l.horas,0);
                    const hrDob=le.filter(l=>l.tipo==="doble").reduce((a,l)=>a+l.horas,0);
                    return (
                      <div key={e.id} style={{padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <div className="user-avatar" style={{width:24,height:24,fontSize:9}}>{e.foto.slice(0,2)}</div>
                          <span style={{fontSize:12,fontWeight:600,flex:1}}>{e.nombre}</span>
                          <span style={{fontSize:11,color:"#6B7280"}}>{fmt(e.salario)}/mes</span>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <div className="form-group" style={{margin:0,flex:1}}>
                            <label className="form-label">HE Regular (×1.5)</label>
                            <input type="number" className="form-control" min={0} value={hrReg} onChange={ev=>{
                              const h=parseFloat(ev.target.value)||0;
                              setLineasHE(prev=>{const filtered=prev.filter(l=>!(l.empId===e.id&&l.tipo==="regular"));return h>0?[...filtered,{empId:e.id,tipo:"regular",horas:h}]:filtered;});
                            }}/>
                          </div>
                          <div className="form-group" style={{margin:0,flex:1}}>
                            <label className="form-label">HE Doble (×2.0)</label>
                            <input type="number" className="form-control" min={0} value={hrDob} onChange={ev=>{
                              const h=parseFloat(ev.target.value)||0;
                              setLineasHE(prev=>{const filtered=prev.filter(l=>!(l.empId===e.id&&l.tipo==="doble"));return h>0?[...filtered,{empId:e.id,tipo:"doble",horas:h}]:filtered;});
                            }}/>
                          </div>
                          <div className="form-group" style={{margin:0,flex:1}}>
                            <label className="form-label">Bono (₡)</label>
                            <input type="number" className="form-control" min={0} value={bonos[e.id]||0} onChange={ev=>setBonos(prev=>({...prev,[e.id]:parseFloat(ev.target.value)||0}))}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="card">
                  <div className="card-title">Resumen HE período</div>
                  <div className="res-row"><span className="res-label">Total hrs. regulares</span><span className="res-val">{lineasHE.filter(l=>l.tipo==="regular").reduce((a,l)=>a+l.horas,0)} h</span></div>
                  <div className="res-row"><span className="res-label">Total hrs. dobles</span><span className="res-val">{lineasHE.filter(l=>l.tipo==="doble").reduce((a,l)=>a+l.horas,0)} h</span></div>
                  <div className="res-row"><span className="res-label">Total bonos</span><span className="res-val">{fmt(Object.values(bonos).reduce((a,b)=>a+b,0))}</span></div>
                  <div className="res-row"><span className="res-label">HE total pagado</span><span className="res-val" style={{color:"#E8611A",fontWeight:700}}>
                    {fmt(filas.reduce((a,f)=>a+Math.round(f.heReg)+Math.round(f.heDob),0))}
                  </span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="compensacion"&&(
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">Deducciones Adicionales</div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <select className="form-control" style={{width:200}} id="ded-emp">
                  {empsEnPlan.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <input id="ded-desc" className="form-control" style={{flex:1}} placeholder="Descripción (ej. Seguro voluntario)"/>
                <input id="ded-monto" type="number" className="form-control" style={{width:120}} placeholder="₡"/>
                <button className="btn btn-primary btn-sm" onClick={()=>{
                  const empSel=(document.getElementById("ded-emp") as HTMLSelectElement)?.value;
                  const desc=(document.getElementById("ded-desc") as HTMLInputElement)?.value||"Deducción";
                  const monto=parseFloat((document.getElementById("ded-monto") as HTMLInputElement)?.value||"0");
                  if(empSel&&monto>0) setDedExtra(prev=>[...prev,{empId:empSel,concepto:desc,monto}]);
                }}>➕ Agregar</button>
              </div>
              {dedExtra.length>0&&(
                <table className="tbl">
                  <thead><tr><th>Colaborador</th><th>Concepto</th><th>Monto</th><th></th></tr></thead>
                  <tbody>
                    {dedExtra.map((d,i)=>{
                      const emp=empleados.find(e=>e.id===d.empId);
                      return <tr key={i}><td style={{fontSize:12}}>{emp?.nombre||d.empId}</td><td style={{fontSize:12}}>{d.concepto}</td><td style={{fontSize:12,color:"#EF4444"}}>-{fmt(d.monto)}</td><td><button className="btn btn-ghost btn-sm" onClick={()=>setDedExtra(prev=>prev.filter((_,j)=>j!==i))}>✕</button></td></tr>;
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card">
              <div className="card-title">Aguinaldo proyectado (1/12)</div>
              <table className="tbl">
                <thead><tr><th>Colaborador</th><th>Salario bruto</th><th>Aguinaldo mensual provisionado</th></tr></thead>
                <tbody>
                  {filas.map(f=><tr key={f.empId}><td style={{fontSize:12}}>{f.nombre}</td><td style={{fontSize:12}}>{fmt(Math.round(f.salBruto))}</td><td style={{fontSize:12,fontWeight:700,color:"#7C3AED"}}>{fmt(f.aguinaldo)}</td></tr>)}
                </tbody>
                <tfoot><tr style={{fontWeight:700,background:"#F8FAFC"}}><td>TOTAL</td><td/><td style={{color:"#7C3AED"}}>{fmt(filas.reduce((a,f)=>a+f.aguinaldo,0))}</td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {tab==="historial"&&(
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Período</th><th>Planilla</th><th>Bruto</th><th>Líquido</th><th>Estado</th><th>Pago</th><th></th></tr></thead>
              <tbody>
                {historial.map((h,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:600,fontSize:12.5}}>{h.per}</td>
                    <td style={{fontSize:12}}>{h.planilla}</td>
                    <td style={{fontSize:12}}>{fmt(h.bruto)}</td>
                    <td style={{fontSize:12,fontWeight:700,color:"#10B981"}}>{fmt(h.liquido)}</td>
                    <td><span className="badge badge-ok">{h.estado}</span></td>
                    <td><span className="badge badge-ok">{h.pagado} Procesado</span></td>
                    <td><button className="btn btn-ghost btn-sm">📥 Descargar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="contable"&&(
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">Asientos contables sugeridos — {planSel?.nombre}</div>
              <table className="tbl">
                <thead><tr><th>Cuenta</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
                <tbody>
                  {[
                    ["6101","Gasto de sueldos y salarios",fmt(Math.round(totBruto)),""],
                    ["6201","CCSS patronal (26.67%)",fmt(totPatronal),""],
                    ["6202","Provisión aguinaldo (1/12)",fmt(filas.reduce((a,f)=>a+f.aguinaldo,0)),""],
                    ["2101","CCSS por pagar (obrero+patronal)","",fmt(filas.reduce((a,f)=>a+f.ccssObrero,0)+totPatronal)],
                    ["2102","Renta por pagar","",fmt(filas.reduce((a,f)=>a+f.renta,0))],
                    ["2103","OPC por pagar","",fmt(filas.reduce((a,f)=>a+f.opc,0))],
                    ["2104","Banco Popular por pagar","",fmt(filas.reduce((a,f)=>a+f.bpop,0))],
                    ["1101","Bancos (planilla neta)","",fmt(Math.round(totLiquido))],
                  ].map(([cod,desc,deb,cred])=>(
                    <tr key={cod}><td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A"}}>{cod}</td><td style={{fontSize:12}}>{desc}</td><td style={{color:"#10B981",fontWeight:600,fontSize:12}}>{deb}</td><td style={{color:"#EF4444",fontWeight:600,fontSize:12}}>{cred}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-secondary btn-sm">📊 Exportar asientos</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>alert("Integración contable en proceso.")}>🔗 Enviar a contabilidad</button>
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Planilla seleccionada</div>
        {planSel&&(
          <div style={{padding:"10px 12px",background:"#FFF3ED",border:"1px solid #FED7AA",borderRadius:8,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#E8611A",marginBottom:6}}>{planSel.nombre}</div>
            {[["Colaboradores",empsEnPlan.length],["CCSS Obrero",`${(planSel as any).ccssObreroPorc}%`],["OPC",`${(planSel as any).opcPorc}%`],["B.Popular",`${(planSel as any).bpopPorc}%`],["CCSS Patronal",`${(planSel as any).ccssPatronalPorc}%`]].map(([l,v])=>(
              <div key={l as string} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                <span style={{color:"#6B7280"}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <div className="panel-title">Resumen del período</div>
        {[["Bruto planilla",fmt(Math.round(totBruto)),"#E8611A"],["Total deducciones",fmt(filas.reduce((a,f)=>a+f.totalDed,0)),"#EF4444"],["Líquido a pagar",fmt(Math.round(totLiquido)),"#10B981"],["CCSS patronal",fmt(totPatronal),"#7C3AED"],["Costo total",fmt(Math.round(totCargo)),"#1B1F2E"]].map(([l,v,c])=>(
          <div key={l as string} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{color:c as string,fontWeight:700,fontSize:11}}>{v}</span></div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Ver selector",v:"selector"},{l:"Ver planilla",v:"planilla"},{l:"HE & Bonos",v:"he"},{l:"Historial",v:"historial"}].map(a=>(
          <div key={a.l} onClick={()=>setTab(a.v)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span>
            <span style={{marginLeft:"auto",color:"#D1D5DB",fontSize:12}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
