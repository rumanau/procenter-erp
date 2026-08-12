import React, { useState } from "react";
import type { View, Factura } from "../../types";
import { CUENTAS_BANCARIAS_INIT } from "../../data/finanzas";

export function CuentasPorPagar({setView,facturas,setFacturas}:{setView:(v:View)=>void;facturas:Factura[];setFacturas:React.Dispatch<React.SetStateAction<Factura[]>>}) {
  const [filtro,setFiltro]=useState("todas");
  const [pagando,setPagando]=useState<string|null>(null);
  const [cuentaPago,setCuentaPago]=useState(CUENTAS_BANCARIAS_INIT[0].id);

  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

  const totalPorPagar=facturas.reduce((a,f)=>a+f.saldo,0);
  const vencidas=facturas.filter(f=>f.estado==="vencida");
  const totalVencido=vencidas.reduce((a,f)=>a+f.saldo,0);
  const porVencer7d=facturas.filter(f=>f.estado==="pendiente").length;

  const filtradas=facturas.filter(f=>filtro==="todas"||f.estado===filtro);

  const confirmarPago=(id:string)=>{
    setFacturas(prev=>prev.map(f=>f.id===id?{...f,saldo:0,estado:"pagada"}:f));
    setPagando(null);
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Cuentas por Pagar</div>
            <div className="page-subtitle">Facturas de proveedores · Programación de pagos</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Total por pagar</div><div className="kpi-value" style={{fontSize:16,color:"#EF4444"}}>{fmt(totalPorPagar)}</div></div>
          <div className="kpi"><div className="kpi-label">Vencido</div><div className="kpi-value" style={{fontSize:16,color:"#DC2626"}}>{fmt(totalVencido)}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{vencidas.length} facturas</div></div>
          <div className="kpi"><div className="kpi-label">Pendientes de pago</div><div className="kpi-value" style={{fontSize:16}}>{porVencer7d}</div></div>
          <div className="kpi"><div className="kpi-label">Proveedores activos</div><div className="kpi-value" style={{fontSize:16}}>{new Set(facturas.map(f=>f.contraparte)).size}</div></div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700}}>{filtradas.length} facturas</div>
          <select className="form-control" style={{width:180}} value={filtro} onChange={e=>setFiltro(e.target.value)}>
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="vencida">Vencida</option>
            <option value="pagada">Pagada</option>
          </select>
        </div>

        <div className="card" style={{padding:0,overflow:"auto"}}>
          <table className="tbl">
            <thead><tr><th>Referencia</th><th>Proveedor</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Saldo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {filtradas.map(f=>(
                <tr key={f.id}>
                  <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{f.id}</td>
                  <td style={{fontSize:12,fontWeight:600}}>{f.contraparte}</td>
                  <td style={{fontSize:11.5}}>{f.fechaEmision}</td>
                  <td style={{fontSize:11.5,color:f.estado==="vencida"?"#EF4444":"#6B7280"}}>{f.fechaVencimiento}</td>
                  <td style={{fontSize:12}}>{fmt(f.monto)}</td>
                  <td style={{fontSize:12,fontWeight:700}}>{fmt(f.saldo)}</td>
                  <td><span className={`badge ${f.estado==="pagada"?"badge-ok":f.estado==="vencida"?"badge-crit":"badge-info"}`}>{f.estado}</span></td>
                  <td>{f.saldo>0&&<button className="btn btn-secondary btn-sm" onClick={()=>setPagando(f.id)}>💳 Programar pago</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Próximos vencimientos</div>
        {[...facturas].filter(f=>f.saldo>0).sort((a,b)=>a.fechaVencimiento.localeCompare(b.fechaVencimiento)).slice(0,6).map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:f.estado==="vencida"?"#EF4444":"#F59E0B",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.contraparte}</div>
              <div style={{fontSize:10,color:"#6B7280"}}>{fmt(f.saldo)} · {f.fechaVencimiento}</div>
            </div>
          </div>
        ))}
      </div>

      {pagando&&(
        <div className="modal-overlay" onClick={()=>setPagando(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="modal-title">Programar pago</div><div className="modal-sub">{facturas.find(f=>f.id===pagando)?.contraparte}</div></div>
              <div className="modal-close" onClick={()=>setPagando(null)}>✕</div>
            </div>
            <div className="form-group">
              <label className="form-label">Monto a pagar</label>
              <input className="form-control" disabled value={fmt(facturas.find(f=>f.id===pagando)?.saldo||0)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Cuenta bancaria de origen</label>
              <select className="form-control" value={cuentaPago} onChange={e=>setCuentaPago(e.target.value)}>
                {CUENTAS_BANCARIAS_INIT.map(c=><option key={c.id} value={c.id}>{c.alias} — {c.moneda} {c.saldo.toLocaleString("es-CR")}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>pagando&&confirmarPago(pagando)}>✅ Confirmar pago</button>
          </div>
        </div>
      )}
    </div>
  );
}
