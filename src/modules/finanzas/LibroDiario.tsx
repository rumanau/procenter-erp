import React, { useState } from "react";
import type { View, AsientoContable, LineaAsiento } from "../../types";
import { PLAN_CUENTAS } from "../../data/finanzas";

export function LibroDiario({setView,asientos,setAsientos}:{setView:(v:View)=>void;asientos:AsientoContable[];setAsientos:(a:AsientoContable[])=>void}) {
  const [tab,setTab]=useState("asientos");
  const [filtroOrigen,setFiltroOrigen]=useState("todos");
  const [lineasNuevo,setLineasNuevo]=useState<LineaAsiento[]>([{cuenta:PLAN_CUENTAS[0].codigo,descripcion:"",debito:0,credito:0}]);
  const [conceptoNuevo,setConceptoNuevo]=useState("");

  const fmt=(n:number)=>n===0?"—":`₡${n.toLocaleString("es-CR")}`;
  const cuentaNombre=(cod:string)=>PLAN_CUENTAS.find(c=>c.codigo===cod)?.nombre||cod;

  const totDeb=lineasNuevo.reduce((a,l)=>a+(l.debito||0),0);
  const totCred=lineasNuevo.reduce((a,l)=>a+(l.credito||0),0);
  const balanceado=totDeb===totCred&&totDeb>0;

  const asientosFiltrados=asientos.filter(a=>filtroOrigen==="todos"||a.origen===filtroOrigen);
  const origenes=Array.from(new Set(asientos.map(a=>a.origen)));

  const agregarLinea=()=>setLineasNuevo(prev=>[...prev,{cuenta:PLAN_CUENTAS[0].codigo,descripcion:"",debito:0,credito:0}]);
  const actualizarLinea=(i:number,campo:keyof LineaAsiento,valor:string|number)=>{
    setLineasNuevo(prev=>prev.map((l,j)=>j===i?{...l,[campo]:valor}:l));
  };
  const quitarLinea=(i:number)=>setLineasNuevo(prev=>prev.filter((_,j)=>j!==i));

  const contabilizar=()=>{
    if(!balanceado||!conceptoNuevo.trim()) return;
    const nuevo:AsientoContable={
      id:`AS-2024-${String(asientos.length+1).padStart(3,"0")}`,
      fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
      concepto:conceptoNuevo,origen:"Manual",estado:"aprobado",
      lineas:lineasNuevo.filter(l=>l.debito>0||l.credito>0),
    };
    setAsientos([nuevo,...asientos]);
    setConceptoNuevo("");
    setLineasNuevo([{cuenta:PLAN_CUENTAS[0].codigo,descripcion:"",debito:0,credito:0}]);
    setTab("asientos");
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Libro Diario</div>
            <div className="page-subtitle">Asientos contables · Plan de cuentas · Partida doble</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setTab("nuevo")}>➕ Nuevo Asiento</button>
          </div>
        </div>

        <div className="tab-bar">
          {[["asientos","📓 Asientos"],["nuevo","➕ Nuevo Asiento"],["plan-cuentas","📋 Plan de Cuentas"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="asientos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700}}>{asientosFiltrados.length} asientos</div>
              <select className="form-control" style={{width:180}} value={filtroOrigen} onChange={e=>setFiltroOrigen(e.target.value)}>
                <option value="todos">Todos los orígenes</option>
                {origenes.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {asientosFiltrados.map(a=>{
              const deb=a.lineas.reduce((s,l)=>s+l.debito,0);
              return (
                <div key={a.id} className="card" style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <span style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{a.id}</span>
                      <span style={{fontSize:12.5,fontWeight:700,marginLeft:10}}>{a.concepto}</span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span className="badge badge-info">{a.origen}</span>
                      <span className={`badge ${a.estado==="aprobado"?"badge-ok":a.estado==="anulado"?"badge-crit":"badge-warn"}`}>{a.estado}</span>
                      <span style={{fontSize:11,color:"#6B7280"}}>{a.fecha}</span>
                    </div>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Cuenta</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
                    <tbody>
                      {a.lineas.map((l,i)=>(
                        <tr key={i}>
                          <td style={{fontFamily:"monospace",fontSize:11}}>{l.cuenta} · {cuentaNombre(l.cuenta)}</td>
                          <td style={{fontSize:12}}>{l.descripcion}</td>
                          <td style={{fontSize:12,color:"#10B981",fontWeight:600}}>{fmt(l.debito)}</td>
                          <td style={{fontSize:12,color:"#EF4444",fontWeight:600}}>{fmt(l.credito)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{fontWeight:700,background:"#F8FAFC"}}><td colSpan={2}>TOTAL</td><td style={{color:"#10B981"}}>{fmt(deb)}</td><td style={{color:"#EF4444"}}>{fmt(a.lineas.reduce((s,l)=>s+l.credito,0))}</td></tr></tfoot>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {tab==="nuevo"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">Nuevo asiento manual</div>
                <div className="form-group">
                  <label className="form-label">Concepto</label>
                  <input className="form-control" placeholder="Ej. Pago de alquiler mayo" value={conceptoNuevo} onChange={e=>setConceptoNuevo(e.target.value)}/>
                </div>
                {lineasNuevo.map((l,i)=>(
                  <div key={i} style={{display:"flex",gap:6,marginBottom:8,alignItems:"flex-end"}}>
                    <div className="form-group" style={{margin:0,flex:2}}>
                      <label className="form-label">Cuenta</label>
                      <select className="form-control" value={l.cuenta} onChange={e=>actualizarLinea(i,"cuenta",e.target.value)}>
                        {PLAN_CUENTAS.map(c=><option key={c.codigo} value={c.codigo}>{c.codigo} — {c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{margin:0,flex:2}}>
                      <label className="form-label">Descripción</label>
                      <input className="form-control" value={l.descripcion} onChange={e=>actualizarLinea(i,"descripcion",e.target.value)}/>
                    </div>
                    <div className="form-group" style={{margin:0,flex:1}}>
                      <label className="form-label">Débito ₡</label>
                      <input type="number" className="form-control" value={l.debito||""} onChange={e=>actualizarLinea(i,"debito",parseFloat(e.target.value)||0)}/>
                    </div>
                    <div className="form-group" style={{margin:0,flex:1}}>
                      <label className="form-label">Crédito ₡</label>
                      <input type="number" className="form-control" value={l.credito||""} onChange={e=>actualizarLinea(i,"credito",parseFloat(e.target.value)||0)}/>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>quitarLinea(i)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={agregarLinea}>➕ Agregar línea</button>
              </div>
            </div>
            <div>
              <div className="card">
                <div className="card-title">Verificación de partida doble</div>
                <div className="res-row"><span className="res-label">Total débitos</span><span className="res-val" style={{color:"#10B981"}}>₡{totDeb.toLocaleString("es-CR")}</span></div>
                <div className="res-row"><span className="res-label">Total créditos</span><span className="res-val" style={{color:"#EF4444"}}>₡{totCred.toLocaleString("es-CR")}</span></div>
                <div className="res-row"><span className="res-label">Diferencia</span><span className="res-val" style={{color:totDeb-totCred===0?"#10B981":"#EF4444"}}>₡{Math.abs(totDeb-totCred).toLocaleString("es-CR")}</span></div>
                <div style={{marginTop:10}}>
                  {balanceado
                    ? <span className="badge badge-ok">✓ Asiento balanceado</span>
                    : <span className="badge badge-crit">✕ Débitos y créditos deben ser iguales</span>}
                </div>
                <button className="btn btn-primary btn-sm" style={{width:"100%",marginTop:14}} disabled={!balanceado||!conceptoNuevo.trim()} onClick={contabilizar}>✅ Contabilizar asiento</button>
              </div>
            </div>
          </div>
        )}

        {tab==="plan-cuentas"&&(
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th>Naturaleza</th></tr></thead>
              <tbody>
                {PLAN_CUENTAS.map(c=>(
                  <tr key={c.codigo}>
                    <td style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A",fontWeight:700}}>{c.codigo}</td>
                    <td style={{fontSize:12.5,fontWeight:600}}>{c.nombre}</td>
                    <td><span className={`badge ${c.tipo==="activo"?"badge-info":c.tipo==="pasivo"?"badge-crit":c.tipo==="patrimonio"?"badge-purple":c.tipo==="ingreso"?"badge-ok":"badge-warn"}`}>{c.tipo}</span></td>
                    <td style={{fontSize:12,color:"#6B7280"}}>{c.naturaleza}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Resumen Libro Diario</div>
        <div className="res-row"><span className="res-label">Total asientos</span><span className="res-val">{asientos.length}</span></div>
        <div className="res-row"><span className="res-label">Aprobados</span><span className="res-val" style={{color:"#10B981"}}>{asientos.filter(a=>a.estado==="aprobado").length}</span></div>
        <div className="res-row"><span className="res-label">Desde Nómina</span><span className="res-val" style={{color:"#7C3AED"}}>{asientos.filter(a=>a.origen==="Nómina").length}</span></div>
        <div className="res-row"><span className="res-label">Manuales</span><span className="res-val">{asientos.filter(a=>a.origen==="Manual").length}</span></div>
        <div style={{height:12}}/>
        <div className="panel-title">Cuentas más usadas</div>
        {Object.entries(asientos.flatMap(a=>a.lineas).reduce((acc:Record<string,number>,l)=>{acc[l.cuenta]=(acc[l.cuenta]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cod,n])=>(
          <div key={cod} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"5px 0",borderBottom:"1px solid #F3F4F6"}}>
            <span style={{color:"#374151"}}>{cod} — {cuentaNombre(cod)}</span>
            <span style={{fontWeight:700,color:"#E8611A"}}>{n}×</span>
          </div>
        ))}
      </div>
    </div>
  );
}
