import React from "react";
import type { View } from "../../types";
import { ModTile } from "../../components/ModTile";
import { RightPanel } from "../../components/Stepper";

export function InventarioHome({setView}:{setView:(v:View)=>void}) {
  const tiles=[
    {icon:"🔎",name:"Consulta Existencias",desc:"Stock en tiempo real",sub:"162 ítems · 8 críticos",badge:"🔴 8 críticos",badgeColor:"#EF4444",view:"existencias" as View},
    {icon:"📄",name:"Nuevo Artículo",desc:"Alta con workflow 6 pasos",sub:"ISO 9001",view:"nuevo" as View},
    {icon:"📥",name:"Registrar Ingreso",desc:"Ingreso al inventario",sub:"Última entrada: hoy",view:"ingreso" as View},
    {icon:"📤",name:"Registrar Salida",desc:"Despacho de artículos",sub:"Tipos de salida configurables",view:"salida" as View},
    {icon:"🏭",name:"Traslado Bodegas",desc:"Mover con trazabilidad",sub:"3 bodegas activas",view:"traslado" as View},
    {icon:"⚖️",name:"Ajuste Inventario",desc:"Correcciones aprobadas",sub:"ISO 9001 §8.5",view:"ajuste" as View},
    {icon:"🗑️",name:"Baja / Descarte",desc:"Retiro con evidencia",sub:"Doble aprobación",view:"baja" as View},
    {icon:"📋",name:"Conteo / Auditoría",desc:"Conteo físico",sub:"Último: 30 Abr 2024",view:"conteo" as View},
    {icon:"🔄",name:"Reabastecimiento",desc:"OC sugeridas automáticas",sub:"24 artículos por reordenar",badge:"⚠ 24",badgeColor:"#F59E0B",view:"reabasto" as View},
    {icon:"💰",name:"Inv. Valorizado",desc:"FIFO / Promedio / LIFO",sub:"Valor total: $842K",view:"valorizado" as View},
    {icon:"🔍",name:"Trazabilidad",desc:"Historial por artículo",sub:"ISO 9001 trazabilidad completa",view:"trazabilidad" as View},
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
            {l:"Ítems activos",v:"162",sub:"▲ +8 este mes",c:"#1B1F2E",pill:"kpi-up"},
            {l:"Bajo mínimo",v:"24",sub:"⚠ Reorden urgente",c:"#F59E0B",pill:"kpi-warn"},
            {l:"Críticos",v:"8",sub:"↓ Atención inmediata",c:"#EF4444",pill:"kpi-down"},
            {l:"Control stock",v:"96%",sub:"✓ Excelente",c:"#10B981",pill:"kpi-up"},
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
      <RightPanel/>
    </div>
  );
}
