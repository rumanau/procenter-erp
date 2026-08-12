import React, { useState } from "react";
import type { View, OrdenCompra, ProveedorInventario, Bodega, Articulo, MovimientoInventario, Factura, EstadoOC } from "../../types";
import { totalOC } from "../../data/proveeduria";
import { siguienteFolio } from "../../data/inventario";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const hoy=()=>new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});
const fmtFecha=(d:Date)=>d.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"});

export function OrdenesCompra({setView,ordenesCompra,setOrdenesCompra,proveedores,bodegas,articulos,setArticulos,movimientos,setMovimientos,facturasCxp,setFacturasCxp}:{
  setView:(v:View)=>void;ordenesCompra:OrdenCompra[];setOrdenesCompra:React.Dispatch<React.SetStateAction<OrdenCompra[]>>;
  proveedores:ProveedorInventario[];bodegas:Bodega[];articulos:Articulo[];setArticulos:React.Dispatch<React.SetStateAction<Articulo[]>>;
  movimientos:MovimientoInventario[];setMovimientos:React.Dispatch<React.SetStateAction<MovimientoInventario[]>>;
  facturasCxp:Factura[];setFacturasCxp:React.Dispatch<React.SetStateAction<Factura[]>>;
}) {
  const [filtro,setFiltro]=useState<EstadoOC|"">("");
  const [selId,setSelId]=useState<string|null>(null);

  const provNom=(id:string)=>proveedores.find(p=>p.id===id)?.nombre||id;
  const bodNom=(id:string)=>bodegas.find(b=>b.id===id)?.nombre||id;
  const artNom=(id:string)=>articulos.find(a=>a.id===id)?.nombre||id;

  const ordenadas=[...ordenesCompra].sort((a,b)=>b.id.localeCompare(a.id));
  const filtradas=ordenadas.filter(o=>filtro===""||o.estado===filtro);
  const sel=ordenesCompra.find(o=>o.id===selId)||null;
  const proveedorSel=sel?proveedores.find(p=>p.id===sel.proveedorId):null;

  const badgeCl=(e:EstadoOC)=>e==="Facturada"?"badge-ok":e==="Cancelada"?"badge-gray":e==="Recibida"?"badge-info":e==="Enviada"?"badge-warn":"badge-gray";

  const enviar=(oc:OrdenCompra)=>{
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Enviada"}:o));
  };

  const recibir=(oc:OrdenCompra)=>{
    const proveedor=proveedores.find(p=>p.id===oc.proveedorId);
    setArticulos(prev=>prev.map(a=>{
      const linea=oc.lineas.find(l=>l.articuloId===a.id);
      return linea?{...a,stock:a.stock+linea.cantidad,costoUnitario:linea.costoUnitario}:a;
    }));
    const folio=siguienteFolio(movimientos,"entrada");
    const nuevosMovs:MovimientoInventario[]=oc.lineas.map((l,idx)=>({
      id:idx===0?folio:`${folio}-${idx+1}`,tipo:"entrada",articuloId:l.articuloId,cantidad:l.cantidad,bodegaId:oc.bodegaId,
      costoUnitario:l.costoUnitario,contraparte:proveedor?.nombre||"—",fecha:hoy(),usuario:"Ronald",referencia:oc.id,
    }));
    setMovimientos(prev=>[...nuevosMovs,...prev]);
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Recibida"}:o));
    alert(`✅ Mercancía de ${oc.id} recibida.\n\nStock actualizado en ${bodNom(oc.bodegaId)}: ${oc.lineas.length} artículo(s).`);
  };

  const facturar=(oc:OrdenCompra)=>{
    const proveedor=proveedores.find(p=>p.id===oc.proveedorId);
    if(!proveedor) return;
    const monto=totalOC(oc);
    const dias=parseInt(proveedor.condicion)||0;
    const emision=new Date();
    const venc=new Date(emision);
    venc.setDate(venc.getDate()+dias);
    const facturaId=`PROV-${1200+facturasCxp.length}`;
    const nuevaFactura:Factura={id:facturaId,tipo:"cxp",contraparte:proveedor.nombre,cedula:proveedor.cedulaJuridica,fechaEmision:fmtFecha(emision),fechaVencimiento:fmtFecha(venc),moneda:"CRC",monto,saldo:monto,estado:"pendiente"};
    setFacturasCxp(prev=>[nuevaFactura,...prev]);
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Facturada",facturaId}:o));
    alert(`✅ Factura ${facturaId} generada en Cuentas por Pagar.\n\nProveedor: ${proveedor.nombre}\nMonto: ${fmt(monto)}\nVence: ${fmtFecha(venc)}`);
  };

  const cancelar=(oc:OrdenCompra)=>{
    if(!window.confirm(`¿Cancelar la orden ${oc.id}? Esta acción no se puede deshacer.`)) return;
    setOrdenesCompra(prev=>prev.map(o=>o.id===oc.id?{...o,estado:"Cancelada"}:o));
  };

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div><div className="page-title">Órdenes de Compra</div><div className="page-subtitle">Ciclo completo: Borrador → Enviada → Recibida → Facturada</div></div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setView("nueva-oc")}>➕ Nueva OC</button>
          </div>
        </div>
        <div className="card" style={{marginBottom:12,padding:"10px 14px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {(["","Borrador","Enviada","Recibida","Facturada","Cancelada"] as const).map(e=>(
              <span key={e||"todas"} className={`badge ${filtro===e?"badge-info":"badge-gray"}`} style={{cursor:"pointer"}} onClick={()=>setFiltro(e)}>{e||"Todas"} {e&&`(${ordenesCompra.filter(o=>o.estado===e).length})`}</span>
            ))}
          </div>
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="tbl">
            <thead><tr><th>Folio</th><th>Proveedor</th><th>Bodega</th><th>Fecha</th><th>Estado</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {filtradas.map(oc=>(
                <tr key={oc.id} onClick={()=>setSelId(oc.id)} style={{cursor:"pointer",background:selId===oc.id?"#FFFBF5":""}}>
                  <td><b style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A"}}>{oc.id}</b></td>
                  <td style={{fontSize:12.5}}>{provNom(oc.proveedorId)}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{bodNom(oc.bodegaId)}</td>
                  <td style={{fontSize:12}}>{oc.fecha}</td>
                  <td><span className={`badge ${badgeCl(oc.estado)}`}>{oc.estado}</span></td>
                  <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(totalOC(oc))}</td>
                  <td><button className="btn btn-ghost btn-sm">👁</button></td>
                </tr>
              ))}
              {filtradas.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin órdenes para este filtro</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {sel&&(
        <div style={{width:320,background:"#fff",borderLeft:"1px solid #E5E7EB",padding:16,overflow:"auto",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>Detalle de Orden</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelId(null)}>✕</button>
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#E8611A"}}>{sel.id}</span></div>
            <div className="res-row"><span className="res-label">Proveedor</span><span className="res-val">{proveedorSel?.nombre}</span></div>
            <div className="res-row"><span className="res-label">Bodega destino</span><span className="res-val">{bodNom(sel.bodegaId)}</span></div>
            <div className="res-row"><span className="res-label">Fecha</span><span className="res-val">{sel.fecha}</span></div>
            {sel.fechaEntregaEsperada&&<div className="res-row"><span className="res-label">Entrega esperada</span><span className="res-val">{sel.fechaEntregaEsperada}</span></div>}
            <div className="res-row"><span className="res-label">Estado</span><span className={`badge ${badgeCl(sel.estado)}`}>{sel.estado}</span></div>
            {sel.facturaId&&<div className="res-row"><span className="res-label">Factura CxP</span><span className="res-val" style={{color:"#10B981"}}>{sel.facturaId}</span></div>}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:8}}>ARTÍCULOS ({sel.lineas.length})</div>
          {sel.lineas.map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{artNom(l.articuloId)}</div>
                <div style={{fontSize:10.5,color:"#6B7280"}}>{l.cantidad} × {fmt(l.costoUnitario)}</div>
              </div>
              <div style={{fontWeight:700,color:"#E8611A"}}>{fmt(l.cantidad*l.costoUnitario)}</div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700,fontSize:13}}>
            <span>Total</span><span style={{color:"#E8611A"}}>{fmt(totalOC(sel))}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
            {sel.estado==="Borrador"&&<button className="btn btn-primary btn-sm" onClick={()=>enviar(sel)}>📨 Enviar al Proveedor</button>}
            {sel.estado==="Enviada"&&<button className="btn btn-primary btn-sm" onClick={()=>recibir(sel)}>📥 Marcar como Recibida</button>}
            {sel.estado==="Recibida"&&<button className="btn btn-success btn-sm" onClick={()=>facturar(sel)}>🧾 Generar Factura (CxP)</button>}
            {sel.estado==="Facturada"&&<button className="btn btn-secondary btn-sm" onClick={()=>setView("cxp")}>💳 Ver en Cuentas por Pagar</button>}
            {(sel.estado==="Borrador"||sel.estado==="Enviada")&&<button className="btn btn-ghost btn-sm" onClick={()=>cancelar(sel)}>✕ Cancelar Orden</button>}
          </div>
        </div>
      )}
    </div>
  );
}
