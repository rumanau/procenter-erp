import React from "react";
import type { View, Articulo, MovimientoInventario } from "../../types";
import { ModTile } from "../../components/ModTile";
import { estadoStock } from "../../data/inventario";

export function InventarioHome({setView,articulos,movimientos}:{setView:(v:View)=>void;articulos:Articulo[];movimientos:MovimientoInventario[]}) {
  const activos=articulos.filter(a=>a.activo);
  const valorTotal=activos.reduce((s,a)=>s+a.stock*a.costoUnitario,0);
  const bajoMinimo=activos.filter(a=>estadoStock(a.stock,a.min)==="bajo").length;
  const criticos=activos.filter(a=>{const e=estadoStock(a.stock,a.min);return e==="critico"||e==="agotado";}).length;
  const controlPct=activos.length?Math.round((activos.length-bajoMinimo-criticos)/activos.length*100):0;
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;
  const ultimoMov=movimientos[0];

  const tiles=[
    {icon:"🔎",name:"Consulta Existencias",desc:"Stock en tiempo real",sub:`${activos.length} ítems · ${criticos} críticos`,badge:criticos>0?`🔴 ${criticos} críticos`:undefined,badgeColor:"#EF4444",view:"existencias" as View},
    {icon:"📄",name:"Nuevo Artículo",desc:"Alta con workflow 6 pasos",sub:"ISO 9001",view:"nuevo" as View},
    {icon:"📥",name:"Registrar Ingreso",desc:"Ingreso al inventario",sub:ultimoMov?`Último mov.: ${ultimoMov.fecha}`:"Sin movimientos",view:"ingreso" as View},
    {icon:"📤",name:"Registrar Salida",desc:"Despacho de artículos",sub:"Tipos de salida configurables",view:"salida" as View},
    {icon:"🏭",name:"Traslado Bodegas",desc:"Mover con trazabilidad",sub:"3 bodegas activas",view:"traslado" as View},
    {icon:"⚖️",name:"Ajuste Inventario",desc:"Correcciones aprobadas",sub:"ISO 9001 §8.5",view:"ajuste" as View},
    {icon:"🗑️",name:"Baja / Descarte",desc:"Retiro con evidencia",sub:"Doble aprobación",view:"baja" as View},
    {icon:"📋",name:"Conteo / Auditoría",desc:"Conteo físico",sub:"Comparación vs sistema",view:"conteo" as View},
    {icon:"🔄",name:"Reabastecimiento",desc:"OC sugeridas automáticas",sub:`${bajoMinimo+criticos} artículos por reordenar`,badge:bajoMinimo+criticos>0?`⚠ ${bajoMinimo+criticos}`:undefined,badgeColor:"#F59E0B",view:"reabasto" as View},
    {icon:"💰",name:"Inv. Valorizado",desc:"FIFO / Promedio / LIFO",sub:`Valor total: ${fmt(valorTotal)}`,view:"valorizado" as View},
    {icon:"🔍",name:"Trazabilidad",desc:"Historial por artículo",sub:"ISO 9001 trazabilidad completa",view:"trazabilidad" as View},
    {icon:"📬",name:"Solicitudes entre Deptos.",desc:"Bandeja, enviadas y auditoría",sub:"Conecta con otros departamentos",view:"solicitudes-inventario" as View},
    {icon:"📋",name:"Proveeduría",desc:"Proveedores y Órdenes de Compra",sub:"Submódulo relacionado",view:"proveeduria" as View},
    {icon:"📊",name:"BI & Reportería",desc:"Análisis y dashboards",sub:"25+ tipos de widget",view:"bi" as View},
  ];
  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#1B1F2E,#2D3348)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>📦</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Inventario & Proveeduría</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginTop:2}}>Gestión central · ISO 9001 · Trazabilidad completa · Multi-bodega</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setView("config-inv")}>⚙️ Configuración</button>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>{setView("nuevo");}}>➕ Nuevo Artículo</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"Ítems activos",v:String(activos.length),sub:`${new Set(activos.map(a=>a.categoriaId)).size} categorías`,c:"#1B1F2E",pill:"kpi-up"},
            {l:"Bajo mínimo",v:String(bajoMinimo),sub:"⚠ Reorden recomendado",c:"#F59E0B",pill:"kpi-warn"},
            {l:"Críticos",v:String(criticos),sub:"↓ Atención inmediata",c:"#EF4444",pill:"kpi-down"},
            {l:"Control stock",v:`${controlPct}%`,sub:controlPct>=90?"✓ Excelente":controlPct>=75?"Aceptable":"Requiere acción",c:"#10B981",pill:"kpi-up"},
          ].map(k=>(
            <div key={k.l} className="kpi">
              <div className="kpi-label">{k.l}</div>
              <div className="kpi-value" style={{color:k.c}}>{k.v}</div>
              <div className={`kpi-pill ${k.pill}`}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:10}}>Acciones del módulo</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {tiles.map(t=>(
            <ModTile key={t.name} icon={t.icon} name={t.name} desc={t.desc} sub={t.sub} badge={t.badge} badgeColor={t.badgeColor} onClick={()=>setView(t.view)}/>
          ))}
        </div>
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" as const}}>
          <div style={{fontSize:11.5,fontWeight:600,color:"#1B1F2E"}}>Cumplimiento normativo:</div>
          {[{n:"ISO 9001",i:"§7.5 · §8.5 · §9.1",c:"#E8611A",bg:"#FFF3ED"},{n:"Trazabilidad",i:"Completa por artículo",c:"#3B82F6",bg:"#EFF6FF"},{n:"Multi-bodega",i:"3 bodegas · catálogos vivos",c:"#10B981",bg:"#ECFDF5"}].map(b=>(
            <div key={b.n} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:7,background:b.bg}}>
              <span style={{fontSize:11.5,fontWeight:700,color:b.c}}>{b.n}</span>
              <span style={{fontSize:10.5,color:"#6B7280"}}>{b.i}</span>
            </div>
          ))}
        </div>
      </div>
      <RightPanelInventario articulos={activos} movimientos={movimientos}/>
    </div>
  );
}

function RightPanelInventario({articulos,movimientos}:{articulos:Articulo[];movimientos:MovimientoInventario[]}) {
  const criticos=articulos.filter(a=>estadoStock(a.stock,a.min)==="critico"||estadoStock(a.stock,a.min)==="agotado");
  const ultimos=movimientos.slice(0,3);
  const iconTipo={entrada:"📥",salida:"📤",traslado:"🏭",ajuste:"⚖️",baja:"🗑️"} as const;
  const valorTotal=articulos.reduce((s,a)=>s+a.stock*a.costoUnitario,0);
  const porCategoria=new Map<string,number>();
  articulos.forEach(a=>porCategoria.set(a.categoriaId,(porCategoria.get(a.categoriaId)||0)+a.stock*a.costoUnitario));
  const top3=[...porCategoria.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);

  return (
    <div className="right-panel">
      <div className="panel-title">Alertas</div>
      <div className="alert-item">
        <div className="alert-icon" style={{background:"#FFFBEB"}}>⚠️</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Bajo Stock</div><div style={{fontSize:10.5,color:"#6B7280"}}>{criticos.length} artículos críticos</div></div>
        <span style={{background:"#E8611A",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:"9999px"}}>{criticos.length}</span>
      </div>
      <div style={{height:14}}/>
      <div className="panel-title">Últimos Movimientos</div>
      {ultimos.length===0&&<div style={{fontSize:11,color:"#9CA3AF"}}>Sin movimientos recientes</div>}
      {ultimos.map(m=>{
        const art=articulos.find(a=>a.id===m.articuloId);
        return (
          <div key={m.id} className="mini-reg"><span style={{fontSize:18}}>{iconTipo[m.tipo]}</span><div><div style={{fontSize:11,fontWeight:600}}>{art?.nombre||m.articuloId}</div><div style={{fontSize:10,color:"#6B7280"}}>{m.cantidad>0?"+":""}{m.cantidad} · {m.contraparte}</div></div></div>
        );
      })}
      <div style={{height:14}}/>
      <div className="panel-title">Valor por Categoría (Top 3)</div>
      {top3.map(([cat,val])=>(
        <div key={cat} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#374151",fontWeight:600}}>{cat}</span><span>{valorTotal?Math.round(val/valorTotal*100):0}%</span></div>
          <div style={{background:"#E5E7EB",borderRadius:3,height:6}}><div style={{width:`${valorTotal?Math.round(val/valorTotal*100):0}%`,background:"#E8611A",height:"100%",borderRadius:3}}/></div>
        </div>
      ))}
    </div>
  );
}
