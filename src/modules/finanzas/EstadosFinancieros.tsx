import React, { useState } from "react";
import type { View, AsientoContable } from "../../types";
import { PLAN_CUENTAS } from "../../data/finanzas";

export function EstadosFinancieros({setView,asientos}:{setView:(v:View)=>void;asientos:AsientoContable[]}) {
  const [tab,setTab]=useState("balance");
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

  const saldos:Record<string,number>={};
  asientos.filter(a=>a.estado==="aprobado").forEach(a=>a.lineas.forEach(l=>{
    saldos[l.cuenta]=(saldos[l.cuenta]||0)+l.debito-l.credito;
  }));
  const saldoCuenta=(cod:string)=>{
    const cta=PLAN_CUENTAS.find(c=>c.codigo===cod);
    const raw=saldos[cod]||0;
    return cta?.naturaleza==="deudora"?raw:-raw;
  };
  const porTipo=(tipo:string)=>PLAN_CUENTAS.filter(c=>c.tipo===tipo).map(c=>({cuenta:c,saldo:saldoCuenta(c.codigo)})).filter(x=>x.saldo!==0);

  const activos=porTipo("activo");
  const pasivos=porTipo("pasivo");
  const patrimonio=porTipo("patrimonio");
  const ingresos=porTipo("ingreso");
  const gastos=porTipo("gasto");

  const totalActivo=activos.reduce((a,x)=>a+x.saldo,0);
  const totalPasivo=pasivos.reduce((a,x)=>a+x.saldo,0);
  const totalPatrimonio=patrimonio.reduce((a,x)=>a+x.saldo,0);
  const totalIngresos=ingresos.reduce((a,x)=>a+x.saldo,0);
  const totalGastos=gastos.reduce((a,x)=>a+x.saldo,0);
  const utilidadNeta=totalIngresos-totalGastos;
  const patrimonioConUtilidad=totalPatrimonio+utilidadNeta;

  const liquidezCorriente=totalPasivo>0?(totalActivo/totalPasivo).toFixed(2):"—";
  const margenNeto=totalIngresos>0?((utilidadNeta/totalIngresos)*100).toFixed(1):"—";
  const endeudamiento=totalActivo>0?((totalPasivo/totalActivo)*100).toFixed(1):"—";

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Estados Financieros</div>
            <div className="page-subtitle">Generados en tiempo real desde el Libro Diario</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
            <button className="btn btn-secondary btn-sm">📥 Exportar PDF</button>
          </div>
        </div>

        <div className="tab-bar">
          {[["balance","📊 Balance General"],["resultados","📈 Estado de Resultados"],["razones","🧮 Razones Financieras"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="balance"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div className="card">
              <div className="card-title">Activo</div>
              {activos.map(x=>(
                <div key={x.cuenta.codigo} className="res-row"><span className="res-label">{x.cuenta.nombre}</span><span className="res-val">{fmt(x.saldo)}</span></div>
              ))}
              <div className="res-row" style={{borderTop:"2px solid #1B1F2E",marginTop:6,paddingTop:8}}><span className="res-label" style={{fontWeight:700,color:"#1B1F2E"}}>TOTAL ACTIVO</span><span className="res-val" style={{color:"#3B82F6",fontSize:14}}>{fmt(totalActivo)}</span></div>
            </div>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">Pasivo</div>
                {pasivos.map(x=>(
                  <div key={x.cuenta.codigo} className="res-row"><span className="res-label">{x.cuenta.nombre}</span><span className="res-val">{fmt(x.saldo)}</span></div>
                ))}
                <div className="res-row" style={{borderTop:"2px solid #1B1F2E",marginTop:6,paddingTop:8}}><span className="res-label" style={{fontWeight:700,color:"#1B1F2E"}}>TOTAL PASIVO</span><span className="res-val" style={{color:"#EF4444",fontSize:14}}>{fmt(totalPasivo)}</span></div>
              </div>
              <div className="card">
                <div className="card-title">Patrimonio</div>
                {patrimonio.map(x=>(
                  <div key={x.cuenta.codigo} className="res-row"><span className="res-label">{x.cuenta.nombre}</span><span className="res-val">{fmt(x.saldo)}</span></div>
                ))}
                <div className="res-row"><span className="res-label">Utilidad del período</span><span className="res-val" style={{color:utilidadNeta>=0?"#10B981":"#EF4444"}}>{fmt(utilidadNeta)}</span></div>
                <div className="res-row" style={{borderTop:"2px solid #1B1F2E",marginTop:6,paddingTop:8}}><span className="res-label" style={{fontWeight:700,color:"#1B1F2E"}}>TOTAL PATRIMONIO</span><span className="res-val" style={{color:"#7C3AED",fontSize:14}}>{fmt(patrimonioConUtilidad)}</span></div>
              </div>
              <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:Math.abs(totalActivo-(totalPasivo+patrimonioConUtilidad))<1?"#ECFDF5":"#FEF2F2",border:`1px solid ${Math.abs(totalActivo-(totalPasivo+patrimonioConUtilidad))<1?"#6EE7B7":"#FCA5A5"}`}}>
                <span style={{fontSize:11.5,fontWeight:600,color:Math.abs(totalActivo-(totalPasivo+patrimonioConUtilidad))<1?"#059669":"#DC2626"}}>
                  {Math.abs(totalActivo-(totalPasivo+patrimonioConUtilidad))<1?"✓ Activo = Pasivo + Patrimonio (balanceado)":"✕ El balance no cuadra — revisar asientos"}
                </span>
              </div>
            </div>
          </div>
        )}

        {tab==="resultados"&&(
          <div className="card">
            <div className="card-title">Estado de Resultados</div>
            <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,margin:"8px 0 4px"}}>Ingresos</div>
            {ingresos.map(x=>(
              <div key={x.cuenta.codigo} className="res-row"><span className="res-label">{x.cuenta.nombre}</span><span className="res-val" style={{color:"#10B981"}}>{fmt(x.saldo)}</span></div>
            ))}
            <div className="res-row" style={{fontWeight:700}}><span className="res-label">Total ingresos</span><span className="res-val" style={{color:"#10B981"}}>{fmt(totalIngresos)}</span></div>
            <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,margin:"14px 0 4px"}}>Gastos</div>
            {gastos.map(x=>(
              <div key={x.cuenta.codigo} className="res-row"><span className="res-label">{x.cuenta.nombre}</span><span className="res-val" style={{color:"#EF4444"}}>{fmt(x.saldo)}</span></div>
            ))}
            <div className="res-row" style={{fontWeight:700}}><span className="res-label">Total gastos</span><span className="res-val" style={{color:"#EF4444"}}>{fmt(totalGastos)}</span></div>
            <div className="res-row" style={{borderTop:"2px solid #1B1F2E",marginTop:10,paddingTop:10}}>
              <span className="res-label" style={{fontWeight:700,fontSize:13,color:"#1B1F2E"}}>UTILIDAD NETA DEL PERÍODO</span>
              <span className="res-val" style={{color:utilidadNeta>=0?"#10B981":"#EF4444",fontSize:16}}>{fmt(utilidadNeta)}</span>
            </div>
          </div>
        )}

        {tab==="razones"&&(
          <div className="g3">
            {[
              {l:"Liquidez corriente",v:liquidezCorriente,d:"Activo / Pasivo — ideal > 1.5",c:"#3B82F6"},
              {l:"Margen neto",v:`${margenNeto}%`,d:"Utilidad neta / Ingresos",c:utilidadNeta>=0?"#10B981":"#EF4444"},
              {l:"Endeudamiento",v:`${endeudamiento}%`,d:"Pasivo / Activo — ideal < 60%",c:"#F59E0B"},
            ].map(r=>(
              <div key={r.l} className="kpi">
                <div className="kpi-label">{r.l}</div>
                <div className="kpi-value" style={{fontSize:20,color:r.c}}>{r.v}</div>
                <div style={{fontSize:10.5,color:"#6B7280",marginTop:4}}>{r.d}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Resumen ejecutivo</div>
        <div className="res-row"><span className="res-label">Total activo</span><span className="res-val" style={{color:"#3B82F6"}}>{fmt(totalActivo)}</span></div>
        <div className="res-row"><span className="res-label">Total pasivo</span><span className="res-val" style={{color:"#EF4444"}}>{fmt(totalPasivo)}</span></div>
        <div className="res-row"><span className="res-label">Patrimonio</span><span className="res-val" style={{color:"#7C3AED"}}>{fmt(patrimonioConUtilidad)}</span></div>
        <div className="res-row"><span className="res-label">Utilidad neta</span><span className="res-val" style={{color:utilidadNeta>=0?"#10B981":"#EF4444"}}>{fmt(utilidadNeta)}</span></div>
      </div>
    </div>
  );
}
