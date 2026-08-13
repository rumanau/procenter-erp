import React from "react";
import type { View, OrdenCompra, ProveedorInventario, Factura, Recepcion, EvaluacionServicio, DocumentoProveedor, Articulo, ProveedorArticulo } from "../../types";
import { ModTile } from "../../components/ModTile";
import { totalOC, calcularEvaluacion, homologacionEfectiva, analisisPrecios, evaluarRiesgo, parseFechaEsCR } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

export function ProveeduriaHome({setView,ordenesCompra,proveedores,facturasCxp,recepciones,evaluacionesServicio,documentosProveedor,articulos,proveedorArticulos}:{setView:(v:View)=>void;ordenesCompra:OrdenCompra[];proveedores:ProveedorInventario[];facturasCxp:Factura[];recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];documentosProveedor:DocumentoProveedor[];articulos:Articulo[];proveedorArticulos:ProveedorArticulo[]}) {
  const abiertas=ordenesCompra.filter(o=>o.estado==="Borrador"||o.estado==="Pendiente Aprobación"||o.estado==="Enviada"||o.estado==="Parcialmente Recibida");
  const comprometido=ordenesCompra.filter(o=>o.estado!=="Cancelada"&&o.estado!=="Facturada").reduce((s,o)=>s+totalOC(o),0);
  const activos=proveedores.filter(p=>p.activo);
  const cedulas=new Set(proveedores.map(p=>p.cedulaJuridica));
  const facturasProveedores=facturasCxp.filter(f=>cedulas.has(f.cedula)&&f.saldo>0);
  const bloqueados=proveedores.filter(p=>homologacionEfectiva(p,documentosProveedor)==="Bloqueado");

  // ── Tendencias del módulo (Hito 10) ─────────────────────────────
  const hoyD=new Date();
  const gastoMes=ordenesCompra.filter(o=>o.estado!=="Cancelada"&&(()=>{const f=parseFechaEsCR(o.fecha);return f.getMonth()===hoyD.getMonth()&&f.getFullYear()===hoyD.getFullYear();})()).reduce((s,o)=>s+totalOC(o),0);
  const articulosActivos=articulos.filter(a=>a.activo);
  const precios=analisisPrecios(articulosActivos,ordenesCompra,proveedorArticulos);
  const evaluaciones=proveedores.map(p=>calcularEvaluacion(p.id,ordenesCompra,recepciones,evaluacionesServicio)).filter(e=>e.conDatos);
  const puntualidadProm=evaluaciones.length?Math.round(evaluaciones.reduce((s,e)=>s+e.entregaPct,0)/evaluaciones.length):null;
  const calidadProm=evaluaciones.length?Math.round(evaluaciones.reduce((s,e)=>s+e.calidadPct,0)/evaluaciones.length):null;
  const riesgosAltos=proveedores.filter(p=>{
    const itemsProv=articulosActivos.filter(a=>a.proveedorId===p.id);
    const ev=calcularEvaluacion(p.id,ordenesCompra,recepciones,evaluacionesServicio);
    return evaluarRiesgo(p,itemsProv,ordenesCompra,proveedorArticulos,documentosProveedor,ev).nivel==="Alto";
  }).length;
  const tiles=[
    {icon:"🏢",name:"Proveedores",desc:"Directorio y condiciones",sub:`${activos.length} activos`,view:"proveedores" as View},
    {icon:"📊",name:"Resumen de Proveedores",desc:"Evaluación, riesgo y compras generales",sub:"Vista general de todos",view:"resumen-proveedores" as View},
    {icon:"📋",name:"Órdenes de Compra",desc:"Ciclo completo de compra",sub:`${abiertas.length} abiertas`,badge:abiertas.length>0?`${abiertas.length}`:undefined,badgeColor:"#3B82F6",view:"ordenes-compra" as View},
    {icon:"➕",name:"Nueva Orden de Compra",desc:"Crear OC manual",sub:"Borrador o enviar directo",view:"nueva-oc" as View},
    {icon:"📨",name:"Cotizaciones (RFQ)",desc:"Solicita y compara ofertas",sub:"Antes de comprar",view:"cotizaciones" as View},
    {icon:"🔄",name:"Reabastecimiento",desc:"Sugerencias desde Inventario",sub:"Genera OC automáticas",view:"reabasto" as View},
    {icon:"💳",name:"Cuentas por Pagar",desc:"Facturas de proveedores",sub:`${facturasProveedores.length} pendientes`,view:"cxp" as View},
    {icon:"🆚",name:"Comparador de Proveedores",desc:"Desempeño y precio lado a lado",sub:"Hasta 3 proveedores",view:"comparador" as View},
    {icon:"📦",name:"Ir a Inventario",desc:"Stock y bodegas",sub:"Submódulo relacionado",view:"inventario" as View},
  ];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#1B1F2E,#2D3348)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>📋</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Proveeduría</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginTop:2}}>Proveedores · Órdenes de Compra · Integración con Cuentas por Pagar</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setView("proveedores")}>🏢 Proveedores</button>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>setView("nueva-oc")}>➕ Nueva OC</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"OCs abiertas",v:String(abiertas.length),sub:"Borrador + Enviada",c:"#3B82F6",pill:"kpi-info"},
            {l:"Monto comprometido",v:fmt(comprometido),sub:"Sin facturar aún",c:"#E8611A",pill:"kpi-warn"},
            {l:"Proveedores activos",v:String(activos.length),sub:`${proveedores.length} en directorio`,c:"#10B981",pill:"kpi-up"},
            {l:"Facturas CxP pendientes",v:String(facturasProveedores.length),sub:fmt(facturasProveedores.reduce((s,f)=>s+f.saldo,0)),c:"#EF4444",pill:"kpi-down"},
            {l:"Proveedores bloqueados",v:String(bloqueados.length),sub:"Por documentos vencidos",c:"#EF4444",pill:"kpi-down"},
          ].map(k=>(
            <div key={k.l} className="kpi">
              <div className="kpi-label">{k.l}</div>
              <div className="kpi-value" style={{color:k.c,fontSize:16}}>{k.v}</div>
              <div className={`kpi-pill ${k.pill}`}>{k.sub}</div>
            </div>
          ))}
        </div>
        {bloqueados.length>0&&(
          <div className="card" style={{marginBottom:16,background:"#FEF2F2",border:"1px solid #FECACA"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#991B1B",marginBottom:2}}>🚫 {bloqueados.length} proveedor(es) bloqueado(s) automáticamente</div>
            <div style={{fontSize:11,color:"#991B1B"}}>{bloqueados.map(p=>p.nombre).join(", ")} — no pueden recibir nuevas Órdenes de Compra hasta regularizar sus documentos. <span style={{textDecoration:"underline",cursor:"pointer"}} onClick={()=>setView("proveedores")}>Ver proveedores →</span></div>
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".5px"}}>Tendencias del módulo</div>
          <span style={{fontSize:11,color:"#E8611A",cursor:"pointer",fontWeight:600}} onClick={()=>setView("resumen-proveedores")}>Ver resumen completo de proveedores →</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
          {[
            {l:"Gasto del mes",v:fmt(gastoMes),sub:"OC no canceladas",c:"#E8611A"},
            {l:"Variación de precios (12m)",v:precios.variacion365===null?"Sin datos":`${precios.variacion365>0?"▲ +":precios.variacion365<0?"▼ ":"— "}${Math.abs(precios.variacion365).toFixed(1)}%`,sub:`${precios.articulosConAumento} artículo(s) con aumento`,c:precios.variacion365&&precios.variacion365>1?"#EF4444":"#10B981"},
            {l:"Ahorro potencial detectado",v:fmt(precios.ahorroPotencial),sub:"Cambiando a la alternativa más barata",c:"#10B981"},
          ].map(k=>(
            <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c,fontSize:15}}>{k.v}</div><div className="kpi-pill kpi-info">{k.sub}</div></div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"Puntualidad promedio",v:puntualidadProm===null?"Sin datos":`${puntualidadProm}%`,sub:"Proveedores con historial",c:puntualidadProm&&puntualidadProm<80?"#EF4444":"#10B981"},
            {l:"Calidad promedio",v:calidadProm===null?"Sin datos":`${calidadProm}%`,sub:"Aceptado / recibido",c:calidadProm&&calidadProm<80?"#EF4444":"#10B981"},
            {l:"Proveedores en riesgo alto",v:String(riesgosAltos),sub:"Ver pestaña Riesgo de cada uno",c:riesgosAltos>0?"#EF4444":"#10B981"},
          ].map(k=>(
            <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c,fontSize:15}}>{k.v}</div><div className="kpi-pill kpi-info">{k.sub}</div></div>
          ))}
        </div>
        <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:10,marginTop:6}}>Acciones del módulo</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {tiles.map(t=>(
            <ModTile key={t.name} icon={t.icon} name={t.name} desc={t.desc} sub={t.sub} badge={t.badge} badgeColor={t.badgeColor} onClick={()=>setView(t.view)}/>
          ))}
        </div>
      </div>
      <div className="right-panel">
        <div className="panel-title">Órdenes recientes</div>
        {ordenesCompra.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin órdenes registradas</div>}
        {[...ordenesCompra].slice(-5).reverse().map(oc=>{
          const prov=proveedores.find(p=>p.id===oc.proveedorId);
          return (
            <div key={oc.id} style={{padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <b style={{fontFamily:"monospace",color:"#E8611A",fontSize:11}}>{oc.id}</b>
                <span className={`badge ${oc.estado==="Facturada"?"badge-ok":oc.estado==="Cancelada"?"badge-gray":oc.estado==="Recibida"?"badge-info":oc.estado==="Pendiente Aprobación"?"badge-purple":"badge-warn"}`} style={{fontSize:9}}>{oc.estado}</span>
              </div>
              <div style={{fontSize:10.5,color:"#6B7280"}}>{prov?.nombre} · {fmt(totalOC(oc))}</div>
            </div>
          );
        })}
        <div style={{height:14}}/>
        <div className="panel-title">Top proveedores por facturación</div>
        {[...activos].sort((a,b)=>{
          const totalDe=(id:string)=>ordenesCompra.filter(o=>o.proveedorId===id&&o.estado!=="Cancelada").reduce((s,o)=>s+totalOC(o),0);
          return totalDe(b.id)-totalDe(a.id);
        }).slice(0,5).map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontSize:11.5,fontWeight:600}}>{p.nombre}</div>
            <span className="badge badge-info" style={{fontSize:9}} title="Evaluación calculada">{calcularEvaluacion(p.id,ordenesCompra,recepciones,evaluacionesServicio).grado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
