import React from "react";
import type { View, ProveedorInventario, OrdenCompra, Recepcion, EvaluacionServicio, DocumentoProveedor, Articulo, CategoriaInventario, ProveedorArticulo } from "../../types";
import { totalOC, calcularEvaluacion, homologacionEfectiva, badgeHomologacion, evaluarRiesgo, badgeRiesgo } from "../../data/proveeduria";

const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
const GRADOS=["A+","A","B+","B","C"] as const;

export function ResumenProveedores({setView,proveedores,ordenesCompra,recepciones,evaluacionesServicio,documentosProveedor,articulos,categorias,proveedorArticulos}:{
  setView:(v:View)=>void;proveedores:ProveedorInventario[];ordenesCompra:OrdenCompra[];recepciones:Recepcion[];evaluacionesServicio:EvaluacionServicio[];
  documentosProveedor:DocumentoProveedor[];articulos:Articulo[];categorias:CategoriaInventario[];proveedorArticulos:ProveedorArticulo[];
}) {
  const articulosActivos=articulos.filter(a=>a.activo);

  const filas=proveedores.map(p=>{
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
  const riesgoAlto=filas.filter(f=>f.riesgo.nivel==="Alto").length;
  const bloqueados=filas.filter(f=>f.homolog==="Bloqueado").length;

  const porGrado=GRADOS.map(g=>({grado:g,n:filas.filter(f=>f.evaluacion.grado===g).length}));
  const maxGrado=Math.max(1,...porGrado.map(g=>g.n));
  const porRiesgo=(["Bajo","Medio","Alto"] as const).map(nivel=>({nivel,n:filas.filter(f=>f.riesgo.nivel===nivel).length}));
  const maxRiesgo=Math.max(1,...porRiesgo.map(r=>r.n));
  const colorRiesgo=(n:"Bajo"|"Medio"|"Alto")=>n==="Alto"?"#EF4444":n==="Medio"?"#F59E0B":"#10B981";

  const comprasPorCategoria=new Map<string,number>();
  ordenesCompra.filter(o=>o.estado!=="Cancelada").forEach(o=>o.lineas.forEach(l=>{
    const art=articulos.find(a=>a.id===l.articuloId);
    const catId=art?.categoriaId||"otros";
    comprasPorCategoria.set(catId,(comprasPorCategoria.get(catId)||0)+l.cantidad*l.costoUnitario);
  }));
  const categoriasOrdenadas=[...comprasPorCategoria.entries()].sort((a,b)=>b[1]-a[1]);
  const maxCategoria=categoriasOrdenadas[0]?.[1]||1;

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Resumen de Proveedores</div><div className="page-subtitle">Evaluación, riesgo y compras — vista general de todos los proveedores</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("proveeduria")}>← Proveeduría</button>
      </div>

      <div className="g4" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Proveedores activos</div><div className="kpi-value" style={{fontSize:16}}>{activos.length}</div></div>
        <div className="kpi"><div className="kpi-label">Score promedio general</div><div className="kpi-value" style={{fontSize:16}}>{scoreProm===null?"Sin datos":scoreProm}</div></div>
        <div className="kpi"><div className="kpi-label">En riesgo alto</div><div className="kpi-value" style={{fontSize:16,color:riesgoAlto>0?"#EF4444":undefined}}>{riesgoAlto}</div></div>
        <div className="kpi"><div className="kpi-label">Bloqueados</div><div className="kpi-value" style={{fontSize:16,color:bloqueados>0?"#EF4444":undefined}}>{bloqueados}</div></div>
      </div>

      <div className="g2" style={{marginBottom:14,alignItems:"start"}}>
        <div className="card">
          <div className="card-title">Distribución de evaluación</div>
          {porGrado.map(g=>(
            <div key={g.grado} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{g.grado}</span><span>{g.n} proveedor{g.n!==1?"es":""}</span></div>
              <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${(g.n/maxGrado)*100}%`,background:"#3B82F6"}}/></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Distribución de riesgo</div>
          {porRiesgo.map(r=>(
            <div key={r.nivel} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600}}>{r.nivel}</span><span>{r.n} proveedor{r.n!==1?"es":""}</span></div>
              <div className="stock-bar"><div className="stock-bar-fill" style={{width:`${(r.n/maxRiesgo)*100}%`,background:colorRiesgo(r.nivel)}}/></div>
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
