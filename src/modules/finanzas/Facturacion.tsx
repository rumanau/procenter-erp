import React, { useState } from "react";
import type { View, Factura } from "../../types";
import { FACTURAS_CXC_INIT } from "../../data/finanzas";

interface LineaDetalle { descripcion:string; cantidad:number; precio:number; }

export function Facturacion({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState("emitidas");
  const [facturas,setFacturas]=useState<Factura[]>(FACTURAS_CXC_INIT);
  const [cliente,setCliente]=useState("");
  const [cedulaCliente,setCedulaCliente]=useState("");
  const [lineas,setLineas]=useState<LineaDetalle[]>([{descripcion:"",cantidad:1,precio:0}]);

  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

  const subtotal=lineas.reduce((a,l)=>a+l.cantidad*l.precio,0);
  const iva=Math.round(subtotal*0.13);
  const total=subtotal+iva;

  const agregarLinea=()=>setLineas(prev=>[...prev,{descripcion:"",cantidad:1,precio:0}]);
  const actualizarLinea=(i:number,campo:keyof LineaDetalle,v:string|number)=>setLineas(prev=>prev.map((l,j)=>j===i?{...l,[campo]:v}:l));
  const quitarLinea=(i:number)=>setLineas(prev=>prev.filter((_,j)=>j!==i));

  const generarClave=(consecutivo:string)=>{
    const cedulaEmisor="3101445566";
    const fecha=new Date();
    const dd=String(fecha.getDate()).padStart(2,"0");
    const mm=String(fecha.getMonth()+1).padStart(2,"0");
    const yy=String(fecha.getFullYear()).slice(-2);
    return `506${dd}${mm}${yy}00${cedulaEmisor}${consecutivo}10000000${Math.floor(Math.random()*9)}`;
  };

  const emitirFactura=()=>{
    if(!cliente.trim()||subtotal<=0) return;
    const n=facturas.length+1;
    const consecutivo=`001000010100000000${String(n+41).slice(-2)}`;
    const nueva:Factura={
      id:`FE-${String(n+41).padStart(4,"0")}`,tipo:"cxc",contraparte:cliente,cedula:cedulaCliente||"—",
      fechaEmision:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
      fechaVencimiento:new Date(Date.now()+30*86400000).toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
      moneda:"CRC",monto:total,saldo:total,estado:"pendiente",
      consecutivo,claveHacienda:generarClave(consecutivo),estadoHacienda:"enviando",
    };
    setFacturas(prev=>[nueva,...prev]);
    setCliente("");setCedulaCliente("");setLineas([{descripcion:"",cantidad:1,precio:0}]);
    setTab("emitidas");
    setTimeout(()=>{
      setFacturas(prev=>prev.map(f=>f.id===nueva.id?{...f,estadoHacienda:"aceptado"}:f));
    },2200);
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Facturación Electrónica</div>
            <div className="page-subtitle">Comprobantes electrónicos · Clave numérica de 50 dígitos · Ministerio de Hacienda CR</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setTab("nueva")}>➕ Nueva Factura</button>
          </div>
        </div>

        <div className="tab-bar">
          {[["emitidas","🧾 Emitidas"],["nueva","➕ Nueva Factura"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="emitidas"&&(
          <div className="card" style={{padding:0,overflow:"auto"}}>
            <table className="tbl">
              <thead><tr><th>Comprobante</th><th>Cliente</th><th>Emisión</th><th>Total</th><th>Clave Hacienda</th><th>Estado Hacienda</th></tr></thead>
              <tbody>
                {facturas.map(f=>(
                  <tr key={f.id}>
                    <td style={{fontFamily:"monospace",fontSize:11,color:"#E8611A",fontWeight:700}}>{f.id}</td>
                    <td style={{fontSize:12,fontWeight:600}}>{f.contraparte}</td>
                    <td style={{fontSize:11.5}}>{f.fechaEmision}</td>
                    <td style={{fontSize:12,fontWeight:700}}>{fmt(f.monto)}</td>
                    <td style={{fontFamily:"monospace",fontSize:9.5,color:"#9CA3AF"}} title={f.claveHacienda}>{f.claveHacienda?.slice(0,18)}…</td>
                    <td>
                      {f.estadoHacienda==="enviando"&&<span className="badge badge-warn">⏳ Enviando a Hacienda…</span>}
                      {f.estadoHacienda==="aceptado"&&<span className="badge badge-ok">✓ Aceptado</span>}
                      {f.estadoHacienda==="rechazado"&&<span className="badge badge-crit">✕ Rechazado</span>}
                      {!f.estadoHacienda&&<span className="badge badge-gray">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="nueva"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">Datos del cliente</div>
                <div style={{display:"flex",gap:8}}>
                  <div className="form-group" style={{margin:0,flex:2}}>
                    <label className="form-label">Nombre / Razón social</label>
                    <input className="form-control" placeholder="Ej. Retail Corp" value={cliente} onChange={e=>setCliente(e.target.value)}/>
                  </div>
                  <div className="form-group" style={{margin:0,flex:1}}>
                    <label className="form-label">Cédula jurídica</label>
                    <input className="form-control" placeholder="3-101-000000" value={cedulaCliente} onChange={e=>setCedulaCliente(e.target.value)}/>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Detalle de la factura</div>
                {lineas.map((l,i)=>(
                  <div key={i} style={{display:"flex",gap:6,marginBottom:8,alignItems:"flex-end"}}>
                    <div className="form-group" style={{margin:0,flex:3}}>
                      <label className="form-label">Descripción</label>
                      <input className="form-control" value={l.descripcion} onChange={e=>actualizarLinea(i,"descripcion",e.target.value)}/>
                    </div>
                    <div className="form-group" style={{margin:0,flex:1}}>
                      <label className="form-label">Cant.</label>
                      <input type="number" className="form-control" value={l.cantidad} onChange={e=>actualizarLinea(i,"cantidad",parseFloat(e.target.value)||0)}/>
                    </div>
                    <div className="form-group" style={{margin:0,flex:1}}>
                      <label className="form-label">Precio ₡</label>
                      <input type="number" className="form-control" value={l.precio||""} onChange={e=>actualizarLinea(i,"precio",parseFloat(e.target.value)||0)}/>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>quitarLinea(i)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={agregarLinea}>➕ Agregar línea</button>
              </div>
            </div>
            <div>
              <div className="card">
                <div className="card-title">Resumen</div>
                <div className="res-row"><span className="res-label">Subtotal</span><span className="res-val">{fmt(subtotal)}</span></div>
                <div className="res-row"><span className="res-label">IVA (13%)</span><span className="res-val">{fmt(iva)}</span></div>
                <div className="res-row" style={{borderTop:"2px solid #1B1F2E",marginTop:6,paddingTop:8}}><span className="res-label" style={{fontWeight:700,color:"#1B1F2E"}}>TOTAL</span><span className="res-val" style={{color:"#E8611A",fontSize:15}}>{fmt(total)}</span></div>
                <button className="btn btn-primary" style={{width:"100%",marginTop:14}} disabled={!cliente.trim()||subtotal<=0} onClick={emitirFactura}>🧾 Emitir y enviar a Hacienda</button>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:8,lineHeight:1.4}}>Genera la clave numérica de 50 dígitos y simula el envío al Ministerio de Hacienda (ATV). Capa de UI lista para conectar el webservice real.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="panel-title">Estado de Hacienda</div>
        {[
          {l:"Aceptados",v:facturas.filter(f=>f.estadoHacienda==="aceptado").length,c:"#10B981"},
          {l:"Enviando",v:facturas.filter(f=>f.estadoHacienda==="enviando").length,c:"#F59E0B"},
          {l:"Rechazados",v:facturas.filter(f=>f.estadoHacienda==="rechazado").length,c:"#EF4444"},
        ].map(s=>(
          <div key={s.l} className="res-row"><span className="res-label">{s.l}</span><span className="res-val" style={{color:s.c}}>{s.v}</span></div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Últimos comprobantes</div>
        {facturas.slice(0,5).map(f=>(
          <div key={f.id} style={{fontSize:11,padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontWeight:600}}>{f.id} — {f.contraparte}</div>
            <div style={{color:"#6B7280"}}>{fmt(f.monto)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
