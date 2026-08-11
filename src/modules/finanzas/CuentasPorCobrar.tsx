import React, { useState } from "react";
import type { View, Factura } from "../../types";
import { FACTURAS_CXC_INIT } from "../../data/finanzas";

export function CuentasPorCobrar({setView}:{setView:(v:View)=>void}) {
  const [facturas,setFacturas]=useState<Factura[]>(FACTURAS_CXC_INIT);
  const [filtro,setFiltro]=useState("todas");

  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
  const hoy=new Date("2024-06-05");
  const diasVencido=(f:Factura)=>{
    const [d,m,y]=f.fechaVencimiento.replace(".","").split(" ");
    const meses:Record<string,number>={Ene:0,Feb:1,Mar:2,Abr:3,May:4,Jun:5,Jul:6,Ago:7,Sep:8,Oct:9,Nov:10,Dic:11};
    const venc=new Date(parseInt(y),meses[m]??0,parseInt(d));
    return Math.round((hoy.getTime()-venc.getTime())/86400000);
  };

  const totalPorCobrar=facturas.reduce((a,f)=>a+f.saldo,0);
  const vencidas=facturas.filter(f=>f.estado==="vencida");
  const totalVencido=vencidas.reduce((a,f)=>a+f.saldo,0);
  const buckets=[
    {l:"0-30 días",v:facturas.filter(f=>f.estado==="vencida"&&diasVencido(f)<=30).reduce((a,f)=>a+f.saldo,0),c:"#F59E0B"},
    {l:"31-60 días",v:facturas.filter(f=>f.estado==="vencida"&&diasVencido(f)>30&&diasVencido(f)<=60).reduce((a,f)=>a+f.saldo,0),c:"#EF4444"},
    {l:"61-90 días",v:facturas.filter(f=>f.estado==="vencida"&&diasVencido(f)>60&&diasVencido(f)<=90).reduce((a,f)=>a+f.saldo,0),c:"#DC2626"},
    {l:"+90 días",v:facturas.filter(f=>f.estado==="vencida"&&diasVencido(f)>90).reduce((a,f)=>a+f.saldo,0),c:"#991B1B"},
  ];
  const maxBucket=Math.max(...buckets.map(b=>b.v),1);

  const filtradas=facturas.filter(f=>filtro==="todas"||f.estado===filtro);

  const marcarPagada=(id:string)=>setFacturas(prev=>prev.map(f=>f.id===id?{...f,saldo:0,estado:"pagada"}:f));

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Cuentas por Cobrar</div>
            <div className="page-subtitle">Facturas a clientes · Antigüedad de saldos · Gestión de cobro</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("facturacion")}>➕ Nueva Factura</button>
          </div>
        </div>

        <div className="g4" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Total por cobrar</div><div className="kpi-value" style={{fontSize:16,color:"#3B82F6"}}>{fmt(totalPorCobrar)}</div></div>
          <div className="kpi"><div className="kpi-label">Vencido</div><div className="kpi-value" style={{fontSize:16,color:"#EF4444"}}>{fmt(totalVencido)}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{vencidas.length} facturas</div></div>
          <div className="kpi"><div className="kpi-label">DSO estimado</div><div className="kpi-value" style={{fontSize:16}}>28 días</div><div style={{fontSize:10.5,color:"#6B7280"}}>Días promedio de cobro</div></div>
          <div className="kpi"><div className="kpi-label">Facturas activas</div><div className="kpi-value" style={{fontSize:16}}>{facturas.filter(f=>f.estado!=="pagada").length}</div></div>
        </div>

        <div className="card" style={{marginBottom:14}}>
          <div className="card-title">Antigüedad de saldos vencidos</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {buckets.map(b=>(
              <div key={b.l}>
                <div style={{fontSize:10.5,color:"#6B7280",marginBottom:4}}>{b.l}</div>
                <div className="stock-bar" style={{height:8}}><div className="stock-bar-fill" style={{width:`${(b.v/maxBucket)*100}%`,background:b.c}}/></div>
                <div style={{fontSize:12,fontWeight:700,marginTop:4,color:b.c}}>{fmt(b.v)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700}}>{filtradas.length} facturas</div>
          <select className="form-control" style={{width:180}} value={filtro} onChange={e=>setFiltro(e.target.value)}>
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
            <option value="vencida">Vencida</option>
            <option value="pagada">Pagada</option>
          </select>
        </div>
        <div className="card" style={{padding:0,overflow:"auto"}}>
          <table className="tbl">
            <thead><tr><th>Factura</th><th>Cliente</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Saldo</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {filtradas.map(f=>(
                <tr key={f.id}>
                  <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{f.id}</td>
                  <td style={{fontSize:12,fontWeight:600}}>{f.contraparte}</td>
                  <td style={{fontSize:11.5}}>{f.fechaEmision}</td>
                  <td style={{fontSize:11.5,color:f.estado==="vencida"?"#EF4444":"#6B7280"}}>{f.fechaVencimiento}{f.estado==="vencida"&&` (${diasVencido(f)}d)`}</td>
                  <td style={{fontSize:12}}>{fmt(f.monto)}</td>
                  <td style={{fontSize:12,fontWeight:700}}>{fmt(f.saldo)}</td>
                  <td><span className={`badge ${f.estado==="pagada"?"badge-ok":f.estado==="vencida"?"badge-crit":f.estado==="parcial"?"badge-warn":"badge-info"}`}>{f.estado}</span></td>
                  <td>{f.saldo>0&&<button className="btn btn-ghost btn-sm" onClick={()=>marcarPagada(f.id)}>✓ Marcar pagada</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Top clientes por saldo</div>
        {[...facturas].sort((a,b)=>b.saldo-a.saldo).slice(0,6).map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div className="user-avatar" style={{width:24,height:24,fontSize:9,background:"#3B82F6"}}>{f.contraparte.slice(0,2).toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.contraparte}</div>
              <div style={{fontSize:10,color:"#6B7280"}}>{fmt(f.saldo)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
