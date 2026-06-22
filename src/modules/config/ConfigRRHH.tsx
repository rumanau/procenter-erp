import React, { useState } from "react";
import type { View } from "../../types";

export function ConfigRRHH({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState("legal");
  const [ccssObrero,setCcssObrero]=useState(7.45);
  const [ccssPatronal,setCcssPatronal]=useState(26.33);
  const [opc,setOpc]=useState(1.00);
  const [banco,setBanco]=useState(1.00);
  const [aguinaldoMeses,setAguinaldoMeses]=useState(12);

  const tabs=[{id:"legal",l:"⚖️ Legal & CCSS"},{id:"puestos",l:"💼 Puestos y escalas"},{id:"deducciones",l:"📋 Deducciones adicionales"},{id:"notif",l:"🔔 Notificaciones"}];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Configuración RRHH</div><div className="page-subtitle">Parámetros legales · Puestos · Deducciones configurables — sin tocar código</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("rrhh")}>← RRHH</button>
          <button className="btn btn-primary btn-sm" onClick={()=>alert("✅ Configuración RRHH guardada. Los cambios aplican en el próximo cálculo de planilla.")}>💾 Guardar</button>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(t=><div key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.l}</div>)}
      </div>

      {tab==="legal"&&(
        <div className="g2" style={{alignItems:"start"}}>
          <div className="card">
            <div className="card-title">⚖️ Cargas sociales — CCSS</div>
            <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:11.5,color:"#92400E"}}>
              ⚠️ Cuando la CCSS actualice los porcentajes por ley, cámbialos aquí. Aplican a todas las planillas que no tengan valores propios.
            </div>
            {[
              {label:"CCSS Obrero (SEM + IVM)",val:ccssObrero,set:setCcssObrero,min:0,max:20},
              {label:"CCSS Patronal (total)",val:ccssPatronal,set:setCcssPatronal,min:0,max:40},
              {label:"OPC (Pensión Complementaria)",val:opc,set:setOpc,min:0,max:5},
              {label:"Banco Popular",val:banco,set:setBanco,min:0,max:5},
            ].map(f=>(
              <div key={f.label} className="form-group">
                <label className="form-label">{f.label}</label>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input className="form-control" type="number" step="0.01" min={f.min} max={f.max} value={f.val} onChange={e=>f.set(parseFloat(e.target.value)||0)} style={{width:100}}/>
                  <span style={{fontSize:12,color:"#6B7280"}}>%</span>
                  <div style={{flex:1,background:"#E5E7EB",borderRadius:3,height:6}}>
                    <div style={{width:`${(f.val/f.max)*100}%`,background:"#E8611A",height:"100%",borderRadius:3}}/>
                  </div>
                </div>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Meses base para aguinaldo</label>
              <input className="form-control" type="number" value={aguinaldoMeses} onChange={e=>setAguinaldoMeses(parseInt(e.target.value))} style={{width:100}}/>
            </div>
            <div className="resumen" style={{marginTop:12}}>
              {[["Total deducción obrera",`${(ccssObrero+opc+banco).toFixed(2)}%`],["Total carga patronal",`${ccssPatronal.toFixed(2)}%`],["Costo total empresa",`${(ccssObrero+opc+banco+ccssPatronal).toFixed(2)}% del salario bruto`]].map(([l,v])=>(
                <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{color:"#E8611A"}}>{v}</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">📊 Bandas de renta (artículo 15 LIR)</div>
            <div style={{fontSize:11.5,color:"#6B7280",marginBottom:12}}>Actualiza los tramos según decreto vigente del Ministerio de Hacienda</div>
            {[
              {tramo:"Hasta ₡929,000",porcentaje:"Exento",color:"#10B981"},
              {tramo:"₡929,001 – ₡1,363,000",porcentaje:"10%",color:"#F59E0B"},
              {tramo:"₡1,363,001 – ₡2,393,000",porcentaje:"15%",color:"#F59E0B"},
              {tramo:"₡2,393,001 – ₡4,783,000",porcentaje:"20%",color:"#EF4444"},
              {tramo:"Más de ₡4,783,000",porcentaje:"25%",color:"#EF4444"},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                <div style={{flex:1,fontSize:12}}>{b.tramo}</div>
                <span style={{fontSize:13,fontWeight:700,color:b.color,minWidth:40,textAlign:"right"}}>{b.porcentaje}</span>
                <button className="btn btn-ghost btn-sm" style={{padding:"2px 6px"}}>✏️</button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" style={{marginTop:8}}>➕ Agregar tramo</button>
          </div>
        </div>
      )}

      {tab==="puestos"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <button className="btn btn-primary btn-sm" onClick={()=>alert("Formulario de nuevo puesto abierto.")}>➕ Nuevo Puesto</button>
          </div>
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Puesto</th><th>Departamento</th><th>Salario mínimo</th><th>Salario máximo</th><th>Jornada</th><th>Certificaciones requeridas</th><th></th></tr></thead>
              <tbody>
                {[
                  {p:"Director General",d:"Dirección",min:"₡2,500,000",max:"₡4,000,000",j:"Completa",certs:"—"},
                  {p:"Coordinadora de Calidad",d:"Calidad",min:"₡800,000",max:"₡1,200,000",j:"Completa",certs:"ISO 9001 Auditor"},
                  {p:"Supervisor de Bodega",d:"Operaciones",min:"₡750,000",max:"₡1,100,000",j:"Completa",certs:"Montacargas"},
                  {p:"Técnico de Mantenimiento",d:"Mantenimiento",min:"₡650,000",max:"₡900,000",j:"Completa",certs:"Eléctr. Industrial"},
                  {p:"Analista RRHH",d:"RRHH",min:"₡700,000",max:"₡1,050,000",j:"Completa",certs:"—"},
                  {p:"Agente de Seguridad",d:"Operaciones",min:"₡600,000",max:"₡800,000",j:"Rotativa",certs:"Seguridad privada"},
                ].map((r,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:600,fontSize:12.5}}>{r.p}</td>
                    <td><span className="badge badge-info" style={{fontSize:10}}>{r.d}</span></td>
                    <td style={{color:"#10B981",fontWeight:600}}>{r.min}</td>
                    <td style={{color:"#E8611A",fontWeight:600}}>{r.max}</td>
                    <td style={{fontSize:11.5,color:"#6B7280"}}>{r.j}</td>
                    <td style={{fontSize:11.5}}>{r.certs}</td>
                    <td><button className="btn btn-ghost btn-sm">✏️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="deducciones"&&(
        <div>
          <div style={{fontSize:12,color:"#6B7280",marginBottom:12}}>Conceptos de deducción adicionales — más allá de las legales</div>
          <div className="card" style={{padding:0,overflow:"hidden",marginBottom:12}}>
            <table className="tbl">
              <thead><tr><th>Concepto</th><th>Tipo</th><th>Valor / %</th><th>Aplica a</th><th>Activo</th><th></th></tr></thead>
              <tbody>
                {[
                  {c:"Embargo judicial",t:"Monto fijo",v:"Variable",a:"Individual",on:false},
                  {c:"Préstamo empresa",t:"Cuota fija",v:"₡50,000/mes",a:"Individual",on:true},
                  {c:"Póliza médica adicional",t:"Porcentaje",v:"1.5%",a:"Grupos",on:false},
                  {c:"Ahorro voluntario",t:"Porcentaje",v:"Variable",a:"Individual",on:true},
                  {c:"Uniforme / Equipo",t:"Amortización",v:"Variable",a:"Individual",on:false},
                ].map((d,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:500,fontSize:12.5}}>{d.c}</td>
                    <td><span className="badge badge-info">{d.t}</span></td>
                    <td style={{fontWeight:600}}>{d.v}</td>
                    <td style={{fontSize:11.5,color:"#6B7280"}}>{d.a}</td>
                    <td><div className={`toggle ${d.on?"on":""}`} onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></td>
                    <td><button className="btn btn-ghost btn-sm">✏️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>alert("Nuevo concepto de deducción agregado.")}>➕ Agregar concepto</button>
        </div>
      )}

      {tab==="notif"&&(
        <div className="g2" style={{alignItems:"start"}}>
          <div className="card">
            <div className="card-title">🔔 Alertas automáticas RRHH</div>
            {[
              {l:"Contrato por vencer (15 días antes)",on:true},
              {l:"Certificación por vencer (60 días antes)",on:true},
              {l:"Evaluación de desempeño pendiente",on:true},
              {l:"Planilla pendiente de aprobación",on:true},
              {l:"Ausencia no justificada",on:false},
              {l:"Cumpleaños de colaborador",on:false},
            ].map((n,i)=>(
              <div key={i} className="toggle-row">
                <span style={{fontSize:12.5}}>{n.l}</span>
                <div className={`toggle ${n.on?"on":""}`} onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">📧 Correos de notificación</div>
            {[{l:"Aprobación de planilla",v:"ronald@procenter.com"},{l:"Alertas de contratos",v:"rrhh@procenter.com"},{l:"Resumen diario RRHH",v:"director@procenter.com"}].map((e,i)=>(
              <div key={i} className="form-group">
                <label className="form-label">{e.l}</label>
                <input className="form-control" defaultValue={e.v}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
