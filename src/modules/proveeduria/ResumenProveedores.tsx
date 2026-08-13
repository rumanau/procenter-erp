import React, { useState } from "react";
import type { View, ProveedorInventario, OrdenCompra, Recepcion, EvaluacionServicio, DocumentoProveedor, Articulo, CategoriaInventario, ProveedorArticulo, Factura, DevolucionProveedor } from "../../types";
import { totalOC, calcularEvaluacion, homologacionEfectiva, badgeHomologacion, evaluarRiesgo, badgeRiesgo, type EvaluacionProveedor, type RiesgoProveedor } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const GRADOS=["A+","A","B+","B","C"] as const;
const NIVELES_RIESGO=["Bajo","Medio","Alto"] as const;

interface FilaProveedor { proveedor:ProveedorInventario; evaluacion:EvaluacionProveedor; riesgo:RiesgoProveedor; homolog:ReturnType<typeof homologacionEfectiva>; compras:number; }

export function ResumenProveedores({setView,proveedores,ordenesCompra,recepciones,evaluacionesServicio,documentosProveedor,articulos,categorias,proveedorArticulos,facturasCxp,devoluciones}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];ordenesCompra:OrdenCompra[];recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
  documentosProveedor:DocumentoProveedor[];articulos:Articulo[];categorias:CategoriaInventario[];proveedorArticulos:ProveedorArticulo[];
  facturasCxp:Factura[];devoluciones:DevolucionProveedor[];
}) {
  const [gradoAbierto,setGradoAbierto]=useState<string|null>(null);
  const [nivelAbierto,setNivelAbierto]=useState<string|null>(null);

  const articulosActivos=articulos.filter(a=>a.activo);

  const filas:FilaProveedor[]=proveedores.map(p=>{
    const evaluacion=calcularEvaluacion(p.id,ordenesCompra,recepciones,evaluacionesServicio);
    const itemsProv=articulosActivos.filter(a=>a.proveedorId===p.id);
    const riesgo=evaluarRiesgo(p,itemsProv,ordenesCompra,proveedorArticulos,documentosProveedor,evaluacion);
    const homolog=homologacionEfectiva(p,documentosProveedor);
    const compras=ordenesCompra.filter(o=>o.proveedorId===p.id&&o.estado!=="Cancelada").reduce((s,o)=>s+totalOC(o),0);
    return {proveedor:p,evaluacion,riesgo,homolog,compras};
  }).sort((a,b)=>b.evaluacion.puntaje-a.evaluacion.puntaje);

  const activos=proveedores.filter(p=>p.activo);
  const conDatos=filas.filter(f=>f.evaluacion.conDatos);
  const scoreProm=conDatos.length?Math.round(conDatos.reduce((s,f)=>s+f.evaluacion.puntaje,0)/conDatos.length):null;
  const filasRiesgoAlto=filas.filter(f=>f.riesgo.nivel==="Alto");
  const filasBloqueadas=filas.filter(f=>f.homolog==="Bloqueado");

  const mejor=conDatos[0]||null;
  const aVigilar=filasRiesgoAlto.length
    ? [...filasRiesgoAlto].sort((a,b)=>a.evaluacion.puntaje-b.evaluacion.puntaje)[0]
    : (conDatos.length?[...conDatos].sort((a,b)=>a.evaluacion.puntaje-b.evaluacion.puntaje)[0]:null);

  const porGrado=GRADOS.map(g=>({grado:g,n:filas.filter(f=>f.evaluacion.grado===g).length}));
  const maxGrado=Math.max(1,...porGrado.map(g=>g.n));
  const porRiesgo=NIVELES_RIESGO.map(nivel=>({nivel,n:filas.filter(f=>f.riesgo.nivel===nivel).length}));
  const maxRiesgo=Math.max(1,...porRiesgo.map(r=>r.n));
  const colorRiesgo=(n:"Bajo"|"Medio"|"Alto")=>n==="Alto"?"#EF4444":n==="Medio"?"#F59E0B":"#10B981";

  const cedulas=new Set(proveedores.map(p=>p.cedulaJuridica));
  const facturasProveedores=facturasCxp.filter(f=>cedulas.has(f.cedula));
  const cxpPendienteTotal=facturasProveedores.reduce((s,f)=>s+f.saldo,0);
  const cxpVencidoTotal=facturasProveedores.filter(f=>f.estado==="vencida").reduce((s,f)=>s+f.saldo,0);
  const devolucionesPendientes=devoluciones.filter(d=>d.estado==="Pendiente").length;

  const comprasPorCategoria=new Map<string,number>();
  ordenesCompra.filter(o=>o.estado!=="Cancelada").forEach(o=>o.lineas.forEach(l=>{
    const art=articulos.find(a=>a.id===l.articuloId);
    const catId=art?.categoriaId||"otros";
    comprasPorCategoria.set(catId,(comprasPorCategoria.get(catId)||0)+l.cantidad*l.costoUnitario);
  }));
  const categoriasOrdenadas=[...comprasPorCategoria.entries()].sort((a,b)=>b[1]-a[1]);
  const maxCategoria=categoriasOrdenadas[0]?.[1]||1;

  // ── Interpretación / Conclusión / Recomendaciones ─────────────────
  const conclusion=`El score promedio general es ${scoreProm===null?"aún indeterminado (sin historial suficiente)":scoreProm} entre ${conDatos.length} proveedor(es) con historial de ${activos.length} activos. `+
    `${filasRiesgoAlto.length} proveedor(es) están en riesgo Alto y ${filasBloqueadas.length} bloqueado(s) por documentación vencida. `+
    `La CxP pendiente total es ${fmt(cxpPendienteTotal)}, de la cual ${fmt(cxpVencidoTotal)} está vencida, y hay ${devolucionesPendientes} devolución(es) sin resolver.`;

  const recomendaciones:string[]=[];
  if(filasRiesgoAlto.length>0) recomendaciones.push(`Dar seguimiento prioritario a los proveedores en riesgo Alto: ${filasRiesgoAlto.map(f=>f.proveedor.nombre).join(", ")}.`);
  if(filasBloqueadas.length>0) recomendaciones.push(`Regularizar la documentación de ${filasBloqueadas.map(f=>f.proveedor.nombre).join(", ")} para destrabar sus compras.`);
  if(cxpVencidoTotal>0) recomendaciones.push(`Atender las facturas vencidas (${fmt(cxpVencidoTotal)}) antes de que afecten la relación comercial.`);
  if(devolucionesPendientes>0) recomendaciones.push(`Resolver las ${devolucionesPendientes} devolución(es) pendiente(s) — ver pestaña Devoluciones de cada proveedor.`);
  if(mejor) recomendaciones.push(`Aprovechar el buen desempeño de ${mejor.proveedor.nombre} (score ${mejor.evaluacion.puntaje}) para ampliar su participación en compras futuras.`);
  if(recomendaciones.length===0) recomendaciones.push("No hay focos rojos activos con los datos actuales; mantener el monitoreo periódico.");

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Resumen de Proveedores</div><div className="page-subtitle">Evaluación, riesgo y compras — vista general de todos los proveedores</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
      </div>

      <div className="g4" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Proveedores activos</div><div className="kpi-value" style={{fontSize:16}}>{activos.length}</div></div>
        <div className="kpi"><div className="kpi-label">Score promedio general</div><div className="kpi-value" style={{fontSize:16}}>{scoreProm===null?"Sin datos":scoreProm}</div></div>
        <div className="kpi"><div className="kpi-label">En riesgo alto</div><div className="kpi-value" style={{fontSize:16,color:filasRiesgoAlto.length>0?"#EF4444":undefined}}>{filasRiesgoAlto.length}</div></div>
        <div className="kpi"><div className="kpi-label">Bloqueados</div><div className="kpi-value" style={{fontSize:16,color:filasBloqueadas.length>0?"#EF4444":undefined}}>{filasBloqueadas.length}</div></div>
      </div>

      <div style={{marginBottom:14,padding:"10px 12px",background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,fontSize:11.5,lineHeight:1.6}}>
        <div><b>Interpretación:</b> Este resumen agrega el score de evaluación, el nivel de riesgo y la actividad financiera de cada proveedor activo — no calcula nada aparte, consolida los mismos datos que ya se ven en el expediente de cada uno.</div>
        <div style={{marginTop:4}}><b>Conclusión:</b> {conclusion}</div>
        <div style={{marginTop:4}}><b>Recomendaciones:</b></div>
        <ul style={{margin:"2px 0 0",paddingLeft:18}}>
          {recomendaciones.map((r,i)=>(<li key={i}>{r}</li>))}
        </ul>
      </div>

      <div className="g2" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">🏆 Mejor proveedor</div><div className="kpi-value" style={{fontSize:14}}>{mejor?`${mejor.proveedor.nombre} (${mejor.evaluacion.puntaje})`:"Sin datos"}</div></div>
        <div className="kpi"><div className="kpi-label">⚠️ Proveedor a vigilar</div><div className="kpi-value" style={{fontSize:14,color:"#F59E0B"}}>{aVigilar?`${aVigilar.proveedor.nombre} (${aVigilar.riesgo.nivel})`:"Sin datos"}</div></div>
      </div>

      <div className="g3" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">CxP pendiente total</div><div className="kpi-value" style={{fontSize:15,color:cxpPendienteTotal>0?"#F59E0B":undefined}}>{fmt(cxpPendienteTotal)}</div></div>
        <div className="kpi"><div className="kpi-label">CxP vencida</div><div className="kpi-value" style={{fontSize:15,color:cxpVencidoTotal>0?"#EF4444":undefined}}>{fmt(cxpVencidoTotal)}</div></div>
        <div className="kpi"><div className="kpi-label">Devoluciones pendientes</div><div className="kpi-value" style={{fontSize:15,color:devolucionesPendientes>0?"#F59E0B":undefined}}>{devolucionesPendientes}</div></div>
      </div>

      <div className="g2" style={{marginBottom:14,alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Distribución de evaluación</div>
          <div style={{fontSize:10,color:"#9CA3AF",marginBottom:6}}>Clic en un grado para ver qué proveedores lo componen.</div>
          {porGrado.map(g=>(
            <div key={g.grado} style={{marginBottom:8}}>
              <div style={{cursor:"pointer"}} onClick={()=>setGradoAbierto(gradoAbierto===g.grado?null:g.grado)}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{g.grado}</span><span>{g.n} proveedor{g.n!==1?"es":""}</span></div>
                <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${(g.n/maxGrado)*100}%`,background:"#3B82F6"}}/></div>
              </div>
              {gradoAbierto===g.grado&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                  {g.n===0?<span style={{fontSize:10,color:"#9CA3AF"}}>Sin proveedores en este grado</span>:
                    filas.filter(f=>f.evaluacion.grado===g.grado).map(f=>(
                      <span key={f.proveedor.id} className="badge badge-gray" style={{fontSize:9,cursor:"pointer"}} onClick={()=>setView("proveedores")}>{f.proveedor.nombre}</span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Distribución de riesgo</div>
          <div style={{fontSize:10,color:"#9CA3AF",marginBottom:6}}>Clic en un nivel para ver qué proveedores lo componen.</div>
          {porRiesgo.map(r=>(
            <div key={r.nivel} style={{marginBottom:8}}>
              <div style={{cursor:"pointer"}} onClick={()=>setNivelAbierto(nivelAbierto===r.nivel?null:r.nivel)}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{r.nivel}</span><span>{r.n} proveedor{r.n!==1?"es":""}</span></div>
                <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${(r.n/maxRiesgo)*100}%`,background:colorRiesgo(r.nivel)}}/></div>
              </div>
              {nivelAbierto===r.nivel&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                  {r.n===0?<span style={{fontSize:10,color:"#9CA3AF"}}>Sin proveedores en este nivel</span>:
                    filas.filter(f=>f.riesgo.nivel===r.nivel).map(f=>(
                      <span key={f.proveedor.id} className="badge badge-gray" style={{fontSize:9,cursor:"pointer"}} onClick={()=>setView("proveedores")}>{f.proveedor.nombre}</span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {categoriasOrdenadas.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="card-title">Compras por categoría</div>
          {categoriasOrdenadas.map(([catId,monto])=>{
            const cat=categorias.find(c=>c.id===catId);
            return (
              <div key={catId} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#374151",fontWeight:600}}>{cat?`${cat.icono} ${cat.nombre}`:"Sin categoría"}</span><span>{fmt(monto)}</span></div>
                <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${(monto/maxCategoria)*100}%`,background:"#E8611A"}}/></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="card-title" style={{padding:"10px 14px",marginBottom:0,borderBottom:"1px solid #E5E7EB"}}>Proveedores — vista general (ordenado por score)</div>
        <table className="tbl">
          <thead><tr><th>Proveedor</th><th>Score</th><th>Grado</th><th>Riesgo</th><th>Homologación</th><th>Compras totales</th></tr></thead>
          <tbody>
            {filas.map(f=>(
              <tr key={f.proveedor.id} style={{cursor:"pointer"}} onClick={()=>setView("proveedores")}>
                <td style={{fontSize:12.5,fontWeight:600}}>🏢 {f.proveedor.nombre}</td>
                <td style={{fontWeight:600}}>{f.evaluacion.conDatos?f.evaluacion.puntaje:"—"}</td>
                <td><span className="badge badge-info" style={{fontSize:9.5}}>{f.evaluacion.grado}</span></td>
                <td><span className={`badge ${badgeRiesgo(f.riesgo.nivel)}`} style={{fontSize:9.5}}>{f.riesgo.nivel}</span></td>
                <td><span className={`badge ${badgeHomologacion(f.homolog)}`} style={{fontSize:9.5}}>{f.homolog==="Bloqueado"?"🚫 ":""}{f.homolog}</span></td>
                <td style={{fontWeight:600,color:"#E8611A"}}>{fmt(f.compras)}</td>
              </tr>
            ))}
            {filas.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#9CA3AF",padding:20}}>Sin proveedores registrados</td></tr>}
          </tbody>
        </table>
        <div style={{padding:"8px 14px",fontSize:10.5,color:"#9CA3AF",borderTop:"1px solid #F3F4F6"}}>Clic en una fila para ir al directorio y abrir el expediente completo del proveedor.</div>
      </div>
    </div>
  );
}
