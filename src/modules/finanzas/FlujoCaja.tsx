import React from "react";
import type { View } from "../../types";
import { FLUJO_CAJA_PROYECTADO, CUENTAS_BANCARIAS_INIT } from "../../data/finanzas";

export function FlujoCaja({setView}:{setView:(v:View)=>void}) {
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
  const fmtK=(n:number)=>n>=1000000?`${(n/1000000).toFixed(1)}M`:`${Math.round(n/1000)}K`;

  const saldoInicial=CUENTAS_BANCARIAS_INIT.reduce((a,c)=>a+(c.moneda==="CRC"?c.saldo:c.saldo*524.30),0);
  let acumulado=saldoInicial;
  const proyeccion=FLUJO_CAJA_PROYECTADO.map(p=>{
    acumulado=acumulado+p.ingresos-p.egresos;
    return {...p,neto:p.ingresos-p.egresos,saldo:acumulado};
  });
  const saldoFinal=proyeccion[proyeccion.length-1]?.saldo||saldoInicial;
  const totalIngresos=FLUJO_CAJA_PROYECTADO.reduce((a,p)=>a+p.ingresos,0);
  const totalEgresos=FLUJO_CAJA_PROYECTADO.reduce((a,p)=>a+p.egresos,0);
  const semanaCritica=proyeccion.find(p=>p.saldo<0);

  const W=560,H=180;
  const maxSaldo=Math.max(...proyeccion.map(p=>p.saldo),saldoInicial,1);
  const minSaldo=Math.min(...proyeccion.map(p=>p.saldo),0);
  const range=maxSaldo-minSaldo||1;
  const yFor=(v:number)=>H-30-((v-minSaldo)/range)*(H-50);
  const xFor=(i:number)=>40+i*((W-60)/(proyeccion.length-1));
  const pathPts=proyeccion.map((p,i)=>`${xFor(i)},${yFor(p.saldo)}`).join(" ");

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Flujo de Caja</div>
            <div className="page-subtitle">Proyección de ingresos, egresos y saldo disponible</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Saldo actual</div><div className="kpi-value" style={{fontSize:16}}>{fmt(saldoInicial)}</div></div>
          <div className="kpi"><div className="kpi-label">Ingresos proyectados</div><div className="kpi-value" style={{fontSize:16,color:"#10B981"}}>{fmt(totalIngresos)}</div><div style={{fontSize:10.5,color:"#6B7280"}}>8 semanas</div></div>
          <div className="kpi"><div className="kpi-label">Egresos proyectados</div><div className="kpi-value" style={{fontSize:16,color:"#EF4444"}}>{fmt(totalEgresos)}</div><div style={{fontSize:10.5,color:"#6B7280"}}>8 semanas</div></div>
          <div className="kpi"><div className="kpi-label">Saldo proyectado</div><div className="kpi-value" style={{fontSize:16,color:saldoFinal>=0?"#10B981":"#EF4444"}}>{fmt(saldoFinal)}</div></div>
        </div>

        {semanaCritica&&(
          <div style={{padding:"10px 14px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>⚠️</span>
            <span style={{fontSize:12,color:"#DC2626",fontWeight:600}}>Alerta de liquidez: el saldo proyectado cae por debajo de ₡0 en {semanaCritica.periodo}.</span>
          </div>
        )}

        <div className="card" style={{marginBottom:14}}>
          <div className="card-title">Proyección de saldo (8 semanas)</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="40" y1={yFor(0)} x2={W-20} y2={yFor(0)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3"/>
            <text x="8" y={yFor(0)+3} fontSize="8" fill="#9CA3AF">₡0</text>
            <polyline points={pathPts} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round"/>
            <polygon points={`${pathPts} ${xFor(proyeccion.length-1)},${yFor(0)} ${xFor(0)},${yFor(0)}`} fill="#059669" opacity=".08"/>
            {proyeccion.map((p,i)=>(
              <g key={i}>
                <circle cx={xFor(i)} cy={yFor(p.saldo)} r={p.saldo<0?4:3} fill={p.saldo<0?"#EF4444":"#059669"} stroke="#fff" strokeWidth="1.5"/>
                <text x={xFor(i)} y={H-8} textAnchor="middle" fontSize="7" fill="#6B7280">{p.periodo.replace("Sem. ","S")}</text>
                <text x={xFor(i)} y={yFor(p.saldo)-8} textAnchor="middle" fontSize="7" fontWeight="bold" fill={p.saldo<0?"#EF4444":"#059669"}>{fmtK(p.saldo)}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="card" style={{padding:0,overflow:"auto"}}>
          <table className="tbl">
            <thead><tr><th>Período</th><th>Ingresos</th><th>Egresos</th><th>Neto</th><th>Saldo proyectado</th></tr></thead>
            <tbody>
              {proyeccion.map((p,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:600,fontSize:12.5}}>{p.periodo}</td>
                  <td style={{fontSize:12,color:"#10B981"}}>{fmt(p.ingresos)}</td>
                  <td style={{fontSize:12,color:"#EF4444"}}>{fmt(p.egresos)}</td>
                  <td style={{fontSize:12,fontWeight:700,color:p.neto>=0?"#10B981":"#EF4444"}}>{p.neto>=0?"+":""}{fmt(p.neto)}</td>
                  <td style={{fontSize:12,fontWeight:700,color:p.saldo<0?"#EF4444":"#1B1F2E"}}>{fmt(p.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Cuentas incluidas</div>
        {CUENTAS_BANCARIAS_INIT.map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c.conectada?"#10B981":"#D1D5DB",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.alias}</div>
              <div style={{fontSize:10,color:"#6B7280"}}>{c.moneda==="CRC"?fmt(c.saldo):`${c.moneda} ${c.saldo.toLocaleString("es-CR")}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
