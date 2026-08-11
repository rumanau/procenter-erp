import React from "react";
import type { View, AsientoContable } from "../../types";
import { FACTURAS_CXC_INIT, FACTURAS_CXP_INIT, CUENTAS_BANCARIAS_INIT } from "../../data/finanzas";
import { ModTile } from "../../components/ModTile";

export function FinanzasHome({setView,asientos}:{setView:(v:View)=>void;asientos:AsientoContable[]}) {
  const fmt=(n:number)=>`₡${Math.round(n).toLocaleString("es-CR")}`;

  const saldoBancos=CUENTAS_BANCARIAS_INIT.reduce((a,c)=>a+(c.moneda==="CRC"?c.saldo:c.saldo*524.30),0);
  const totalCxC=FACTURAS_CXC_INIT.reduce((a,f)=>a+f.saldo,0);
  const totalCxP=FACTURAS_CXP_INIT.reduce((a,f)=>a+f.saldo,0);
  const cxcVencidas=FACTURAS_CXC_INIT.filter(f=>f.estado==="vencida");
  const cxpVencidas=FACTURAS_CXP_INIT.filter(f=>f.estado==="vencida");

  let ingresos=0,gastos=0;
  asientos.filter(a=>a.estado==="aprobado").forEach(a=>a.lineas.forEach(l=>{
    if(l.cuenta.startsWith("4")) ingresos+=l.credito-l.debito;
    if(l.cuenta.startsWith("6")) gastos+=l.debito-l.credito;
  }));
  const utilidad=ingresos-gastos;

  const tiles=[
    {icon:"📓",name:"Libro Diario",desc:"Asientos contables · Plan de cuentas",sub:`${asientos.length} asientos registrados`,view:"libro-diario" as View},
    {icon:"📥",name:"Cuentas por Cobrar",desc:"Facturas a clientes · Antigüedad de saldos",sub:fmt(totalCxC),badge:cxcVencidas.length>0?`⚠ ${cxcVencidas.length} vencidas`:undefined,badgeColor:"#EF4444",view:"cxc" as View},
    {icon:"📤",name:"Cuentas por Pagar",desc:"Facturas de proveedores · Pagos programados",sub:fmt(totalCxP),badge:cxpVencidas.length>0?`⚠ ${cxpVencidas.length} vencidas`:undefined,badgeColor:"#EF4444",view:"cxp" as View},
    {icon:"📊",name:"Estados Financieros",desc:"Balance General · Estado de Resultados",sub:"Actualizado en tiempo real",view:"estados-financieros" as View},
    {icon:"💧",name:"Flujo de Caja",desc:"Proyección de ingresos y egresos",sub:"8 semanas proyectadas",view:"flujo-caja" as View},
    {icon:"🧾",name:"Facturación Electrónica",desc:"Emisión · Clave numérica · Hacienda",sub:`${FACTURAS_CXC_INIT.length} comprobantes emitidos`,view:"facturacion" as View},
    {icon:"🏦",name:"Conexión Bancaria",desc:"Cuentas conectadas · Conciliación",sub:`${CUENTAS_BANCARIAS_INIT.filter(c=>c.conectada).length}/${CUENTAS_BANCARIAS_INIT.length} conectadas`,view:"banca" as View},
    {icon:"⚙️",name:"Configuración Finanzas",desc:"Monedas · Series · Credenciales Hacienda",sub:"Multimoneda personalizable",view:"config-finanzas" as View},
  ];

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div style={{background:"linear-gradient(135deg,#064E3B,#059669)",borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>💰</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>Contabilidad y Finanzas</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginTop:2}}>Libro contable · Facturación electrónica · Banca · Multimoneda (base ₡)</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm" style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}} onClick={()=>setView("config-finanzas")}>⚙️ Configuración</button>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>setView("facturacion")}>➕ Nueva Factura</button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
          {[
            {l:"Saldo en bancos",v:fmt(saldoBancos),sub:`${CUENTAS_BANCARIAS_INIT.length} cuentas`,c:"#1B1F2E",pill:"kpi-info",pillTxt:"CRC equiv."},
            {l:"Por cobrar",v:fmt(totalCxC),sub:`${FACTURAS_CXC_INIT.length} facturas`,c:"#3B82F6",pill:cxcVencidas.length>0?"kpi-down":"kpi-up",pillTxt:cxcVencidas.length>0?`▼ ${cxcVencidas.length} vencidas`:"✓ Al día"},
            {l:"Por pagar",v:fmt(totalCxP),sub:`${FACTURAS_CXP_INIT.length} facturas`,c:"#EF4444",pill:cxpVencidas.length>0?"kpi-down":"kpi-up",pillTxt:cxpVencidas.length>0?`▼ ${cxpVencidas.length} vencidas`:"✓ Al día"},
            {l:"Resultado del período",v:fmt(utilidad),sub:utilidad>=0?"Utilidad":"Pérdida",c:utilidad>=0?"#10B981":"#EF4444",pill:utilidad>=0?"kpi-up":"kpi-down",pillTxt:utilidad>=0?"▲ Positivo":"▼ Negativo"},
            {l:"Asientos del período",v:asientos.length.toString(),sub:`${asientos.filter(a=>a.origen==="Nómina").length} desde Nómina`,c:"#7C3AED",pill:"kpi-info",pillTxt:"Libro Diario"},
          ].map(k=>(
            <div key={k.l} className="kpi">
              <div className="kpi-label">{k.l}</div>
              <div className="kpi-value" style={{fontSize:16,color:k.c}}>{k.v}</div>
              <div style={{fontSize:10.5,color:"#6B7280",marginBottom:3}}>{k.sub}</div>
              <div className={`kpi-pill ${k.pill}`}>{k.pillTxt}</div>
            </div>
          ))}
        </div>

        <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".5px",marginBottom:10}}>Submódulos y acciones</div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {tiles.map(t=>(
            <ModTile key={t.name} icon={t.icon} name={t.name} desc={t.desc} sub={t.sub} badge={t.badge} badgeColor={t.badgeColor} onClick={()=>setView(t.view)}/>
          ))}
        </div>

        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" as const}}>
          <div style={{fontSize:11.5,fontWeight:600,color:"#1B1F2E"}}>Integraciones (simuladas — capa de UI lista para backend real):</div>
          {[{n:"Hacienda ATV",i:"Factura electrónica v4.3",c:"#3B82F6",bg:"#EFF6FF"},{n:"Banca",i:"Sincronización de movimientos",c:"#10B981",bg:"#ECFDF5"},{n:"Nómina",i:"Asientos automáticos",c:"#7C3AED",bg:"#F5F3FF"}].map(b=>(
            <div key={b.n} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:7,background:b.bg}}>
              <span style={{fontSize:11.5,fontWeight:700,color:b.c}}>{b.n}</span>
              <span style={{fontSize:10.5,color:"#6B7280"}}>{b.i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-title">Facturas vencidas</div>
        {[...cxcVencidas.map(f=>({...f,dir:"cobrar"})),...cxpVencidas.map(f=>({...f,dir:"pagar"}))].slice(0,6).map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}} onClick={()=>setView(f.dir==="cobrar"?"cxc":"cxp")}>
            <div style={{width:28,height:28,borderRadius:7,background:"#FEF2F2",border:"1px solid #FCA5A5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{f.dir==="cobrar"?"📥":"📤"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,color:"#1B1F2E",lineHeight:1.4}}>{f.contraparte} — {fmt(f.saldo)}</div>
              <div style={{fontSize:10,color:"#DC2626",fontWeight:600,marginTop:2}}>🔴 Vencida · {f.fechaVencimiento}</div>
            </div>
          </div>
        ))}
        <div style={{height:12}}/>
        <div className="panel-title">Cuentas bancarias</div>
        {CUENTAS_BANCARIAS_INIT.map(c=>(
          <div key={c.id} onClick={()=>setView("banca")} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F3F4F6",cursor:"pointer"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c.conectada?"#10B981":"#D1D5DB",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.alias}</div>
              <div style={{fontSize:10.5,color:"#6B7280"}}>{c.moneda==="CRC"?fmt(c.saldo):`${c.moneda} ${c.saldo.toLocaleString("es-CR")}`}</div>
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:10}} onClick={()=>setView("banca")}>Gestionar cuentas →</button>
      </div>
    </div>
  );
}
