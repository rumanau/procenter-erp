import React, { useState } from "react";
import type { View, CuentaBancaria, MovimientoBancario } from "../../types";
import { CUENTAS_BANCARIAS_INIT, MOVIMIENTOS_BANCARIOS_INIT } from "../../data/finanzas";

export function ConexionBancaria({setView}:{setView:(v:View)=>void}) {
  const [cuentas,setCuentas]=useState<CuentaBancaria[]>(CUENTAS_BANCARIAS_INIT);
  const [movimientos,setMovimientos]=useState<MovimientoBancario[]>(MOVIMIENTOS_BANCARIOS_INIT);
  const [conectando,setConectando]=useState<string|null>(null);
  const [cuentaVista,setCuentaVista]=useState(CUENTAS_BANCARIAS_INIT[0].id);

  const fmt=(n:number,mon="CRC")=>mon==="CRC"?`₡${Math.round(n).toLocaleString("es-CR")}`:`${mon} ${n.toLocaleString("es-CR")}`;

  const conectar=(id:string)=>{
    setConectando(id);
    setTimeout(()=>{
      setCuentas(prev=>prev.map(c=>c.id===id?{...c,conectada:true,ultimaSync:"Justo ahora"}:c));
      setConectando(null);
    },1800);
  };
  const desconectar=(id:string)=>setCuentas(prev=>prev.map(c=>c.id===id?{...c,conectada:false,ultimaSync:undefined}:c));

  const conciliar=(id:string)=>setMovimientos(prev=>prev.map(m=>m.id===id?{...m,conciliado:true}:m));

  const movsCuenta=movimientos.filter(m=>m.cuentaId===cuentaVista);
  const sinConciliar=movimientos.filter(m=>!m.conciliado).length;

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Conexión Bancaria</div>
            <div className="page-subtitle">Cuentas conectadas · Sincronización de movimientos · Conciliación</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
        </div>

        <div className="g3" style={{marginBottom:14}}>
          {cuentas.map(c=>(
            <div key={c.id} className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:12.5,fontWeight:700}}>{c.banco}</div>
                  <div style={{fontSize:11,color:"#6B7280"}}>{c.alias}</div>
                </div>
                <span className={`badge ${c.conectada?"badge-ok":"badge-gray"}`}>{c.conectada?"● Conectada":"○ Sin conectar"}</span>
              </div>
              <div style={{fontSize:10.5,color:"#9CA3AF",fontFamily:"monospace",marginBottom:8}}>{c.numero}</div>
              <div style={{fontSize:18,fontWeight:800,fontFamily:"'Poppins','Inter',sans-serif",color:"#1B1F2E",marginBottom:8}}>{fmt(c.saldo,c.moneda)}</div>
              {c.conectada
                ? (
                  <>
                    <div style={{fontSize:10.5,color:"#10B981",marginBottom:8}}>🔄 Sincronizado · {c.ultimaSync}</div>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={()=>setCuentaVista(c.id)}>Ver movimientos</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>desconectar(c.id)}>Desconectar</button>
                    </div>
                  </>
                )
                : (
                  <button className="btn btn-primary btn-sm" style={{width:"100%"}} disabled={conectando===c.id} onClick={()=>conectar(c.id)}>
                    {conectando===c.id?"⏳ Conectando…":"🔗 Conectar cuenta"}
                  </button>
                )}
            </div>
          ))}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700}}>Movimientos — {cuentas.find(c=>c.id===cuentaVista)?.alias}</div>
          <select className="form-control" style={{width:220}} value={cuentaVista} onChange={e=>setCuentaVista(e.target.value)}>
            {cuentas.map(c=><option key={c.id} value={c.id}>{c.alias}</option>)}
          </select>
        </div>
        <div className="card" style={{padding:0,overflow:"auto"}}>
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Conciliación</th></tr></thead>
            <tbody>
              {movsCuenta.length===0&&<tr><td colSpan={4} style={{textAlign:"center",padding:20,color:"#9CA3AF",fontSize:12}}>Sin movimientos sincronizados para esta cuenta.</td></tr>}
              {movsCuenta.map(m=>(
                <tr key={m.id}>
                  <td style={{fontSize:11.5}}>{m.fecha}</td>
                  <td style={{fontSize:12}}>{m.descripcion}</td>
                  <td style={{fontSize:12,fontWeight:700,color:m.tipo==="credito"?"#10B981":"#EF4444"}}>{m.tipo==="credito"?"+":"-"}{fmt(m.monto)}</td>
                  <td>{m.conciliado?<span className="badge badge-ok">✓ Conciliado</span>:<button className="btn btn-secondary btn-sm" onClick={()=>conciliar(m.id)}>Conciliar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Estado de conciliación</div>
        <div className="res-row"><span className="res-label">Movimientos totales</span><span className="res-val">{movimientos.length}</span></div>
        <div className="res-row"><span className="res-label">Sin conciliar</span><span className="res-val" style={{color:sinConciliar>0?"#F59E0B":"#10B981"}}>{sinConciliar}</span></div>
        <div className="res-row"><span className="res-label">Cuentas conectadas</span><span className="res-val" style={{color:"#10B981"}}>{cuentas.filter(c=>c.conectada).length}/{cuentas.length}</span></div>
      </div>
    </div>
  );
}
