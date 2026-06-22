import React, { useState } from "react";
import type { View, Empleado, GraficaConstructor } from "../../types";
import { EXISTENCIAS, WIDGET_CATS, BI_TIPOS_GRAFICA, BI_FUENTES, CATALOGOS_INIT } from "../../data/catalogos";
import { RenderGraficaBI } from "./RenderGraficaBI";
import { EstadisticaTab } from "./EstadisticaTab";

export function BIReporteria({setView,empleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];catalogos:typeof CATALOGOS_INIT}) {
  const [biTab,setBiTab]=useState("ejecutivo");
  const [widgets,setWidgets]=useState<{id:number;type:string;title:string;modulo:string;metrica:string;periodo:string}[]>([
    {id:1,type:"kpi",title:"Ítems Activos",modulo:"Inventario & Proveeduría",metrica:"Stock actual total",periodo:"Últimos 6 meses"},
    {id:2,type:"tendencia",title:"Rotación Mensual",modulo:"Inventario & Proveeduría",metrica:"Rotación mensual",periodo:"Últimos 6 meses"},
    {id:3,type:"gauge",title:"Eficiencia de Stock",modulo:"Inventario & Proveeduría",metrica:"% cumplimiento mínimos",periodo:"Último mes"},
    {id:4,type:"ranking",title:"Top por Valor",modulo:"Inventario & Proveeduría",metrica:"Valor total por artículo",periodo:"Últimos 6 meses"},
  ]);
  const [showModal,setShowModal]=useState(false);
  const [selType,setSelType]=useState<string|null>(null);
  const [wmStep,setWmStep]=useState<1|2>(1);
  const [wmTitle,setWmTitle]=useState("");
  const [wmModulo,setWmModulo]=useState("Inventario & Proveeduría");
  const [wmMetrica,setWmMetrica]=useState("Stock actual total");
  const [wmPeriodo,setWmPeriodo]=useState("Últimos 6 meses");
  const MODULOS_W=["Inventario & Proveeduría","RRHH & Nómina","Calidad ISO","Solicitudes","Todos los módulos"];
  const METRICAS_W:Record<string,string[]>={
    "Inventario & Proveeduría":["Stock actual total","Valor total inventario","Artículos bajo mínimo","Rotación mensual","% cumplimiento mínimos","Top artículos por valor","Movimientos ENT/SAL","Costo por proveedor"],
    "RRHH & Nómina":["Planilla bruta mensual","Salario por colaborador","% Asistencia equipo","Horas extra acumuladas","Score desempeño Q1","Rotación anual","Ausentismo","Costo total empresa"],
    "Calidad ISO":["% Cumplimiento ISO 9001","NC abiertas","Acciones correctivas","Resultados auditoría","Capacidad proceso Cp","Gage R&R"],
    "Solicitudes":["Solicitudes por estado","SLA cumplimiento %","Tiempo promedio resolución","Solicitudes por categoría"],
    "Todos los módulos":["KPI ejecutivo consolidado","Alertas cruzadas activas","Costo total empresa","Dashboard multi-módulo"],
  };
  const PERIODOS_W=["Último mes","Últimos 3 meses","Últimos 6 meses","Este año","Personalizado"];
  const [graficas,setGraficas]=useState<GraficaConstructor[]>([]);
  const [showConstructor,setShowConstructor]=useState(false);
  const [cPaso,setCPaso]=useState<1|2|3>(1);
  const [cCfg,setCCfg]=useState<Partial<GraficaConstructor>>({color:"#E8611A"});
  const COLS_GRAFICA=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444","#06B6D4","#1B1F2E"];

  // Hooks hoisted for estadística tab (kept as-is from source)
  const [estMenu,setEstMenu]=useState("basicas");
  const [estSub,setEstSub]=useState("Estadísticos descriptivos");
  const [datosInput,setDatosInput]=useState("22,18,3,9,145,12,4,8");
  const [estResultado,setEstResultado]=useState<any>(null);

  const totalBruto=empleados.filter(e=>e.estado==="activo").reduce((a,e)=>a+e.salario,0);
  const totalEmpleados=empleados.filter(e=>e.estado==="activo").length;
  const planillasActivas=catalogos.planillas.filter(p=>p.estado==="activa").length;
  const totalProveedores=catalogos.proveedores.length;
  const totalBodegas=catalogos.bodegas.length;
  const itemsCriticos=EXISTENCIAS.filter(e=>e.estado==="critico").length;
  const valorInventario=EXISTENCIAS.reduce((a,e)=>a+e.stock*e.costo,0);
  const fmt=(n:number)=>"₡"+Math.round(n).toLocaleString("es-CR");

  const renderWidget=(w:{id:number;type:string;title:string;modulo:string;metrica:string;periodo:string})=>{
    const esRRHH=w.modulo.includes("RRHH");const esCalidad=w.modulo.includes("Calidad");
    const datosInv=EXISTENCIAS.map(e=>e.stock);
    const datosNom=empleados.filter(e=>e.estado==="activo").map(e=>e.salario);
    const datosQual=[100,95,90,87,92,88,85];
    const datos=esRRHH?datosNom:esCalidad?datosQual:datosInv;
    const etiqInv=EXISTENCIAS.map(e=>e.name.split(" ")[0]);
    const etiqNom=empleados.filter(e=>e.estado==="activo").map(e=>e.nombre.split(" ")[0]);
    const etiqQual=["§4","§5","§6","§7","§8","§9","§10"];
    const etiq=esRRHH?etiqNom:esCalidad?etiqQual:etiqInv;
    const maxD=Math.max(...datos,1);
    const fmtN=(n:number)=>n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${Math.round(n/1000)}K`:`${n}`;
    const W=260,H=130;
    const infoBar=<div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:9,color:"#9CA3AF",flexWrap:"wrap" as const,gap:3}}>
      <span style={{background:"#F3F4F6",padding:"1px 5px",borderRadius:3}}>{w.modulo.split(" ")[0]}</span>
      <span>{w.metrica.split(" ").slice(0,3).join(" ")}</span>
      <span style={{background:"#F3F4F6",padding:"1px 5px",borderRadius:3}}>{w.periodo}</span>
    </div>;

    const m:Record<string,JSX.Element>={
      kpi:<div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div><div style={{fontSize:28,fontWeight:800,color:"#E8611A",lineHeight:1}}>{fmtN(datos.reduce((a,b)=>a+b,0))}</div><div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{w.metrica}</div></div>
          <div className="kpi-pill kpi-up" style={{fontSize:9,marginLeft:"auto"}}>▲ +8.3%</div>
        </div>
        <svg viewBox="0 0 200 30" style={{width:"100%",height:30}}><polyline points="0,26 33,18 66,14 100,8 133,11 166,4 200,2" fill="none" stroke="#E8611A" strokeWidth="2" strokeLinejoin="round"/><polygon points="0,26 33,18 66,14 100,8 133,11 166,4 200,2 200,30 0,30" fill="#E8611A" fillOpacity=".07"/></svg>
        {infoBar}
      </div>,
      gauge:(()=>{
        const val=datos[0]||0;const pct=Math.min(val/maxD,1);const ang=-Math.PI+pct*Math.PI;
        const cx=W/2,cy=68,r=52;const gColor=pct>=0.8?"#10B981":pct>=0.5?"#F59E0B":"#EF4444";
        return <div>
          <svg viewBox={`0 0 ${W} 85`} style={{width:"100%",height:85}}>
            <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="#FEE2E2" strokeWidth="14" strokeLinecap="round"/>
            <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx-r+r*0.66},${cy-r*0.57}`} fill="none" stroke="#FEF3C7" strokeWidth="14" strokeLinecap="butt"/>
            <path d={`M${cx},${cy-r} A${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="#D1FAE5" strokeWidth="14" strokeLinecap="round"/>
            <path d={`M${cx-r},${cy} A${r},${r} 0 ${pct>0.5?1:0},1 ${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`} fill="none" stroke={gColor} strokeWidth="10" strokeLinecap="round" opacity=".9"/>
            <line x1={cx} y1={cy} x2={cx+(r-10)*Math.cos(ang)} y2={cy+(r-10)*Math.sin(ang)} stroke="#1B1F2E" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx={cx} cy={cy} r="5" fill="#1B1F2E"/>
            <text x={cx} y={cy-20} textAnchor="middle" fontSize="18" fontWeight="800" fill={gColor}>{Math.round(pct*100)}%</text>
          </svg>
          {infoBar}
        </div>;
      })(),
      bullet:(()=>{
        const val=datos[0]||0;const pct=val/maxD;
        return <div style={{padding:"8px 0"}}>
          <div style={{fontSize:11.5,fontWeight:600,marginBottom:8}}>{w.metrica}</div>
          <div style={{position:"relative",height:26,borderRadius:4,overflow:"hidden",marginBottom:5}}>
            <div style={{position:"absolute",inset:0,background:"#FEE2E2"}}/>
            <div style={{position:"absolute",left:0,top:0,width:"65%",height:"100%",background:"#FEF3C7"}}/>
            <div style={{position:"absolute",left:0,top:0,width:"90%",height:"100%",background:"#D1FAE5"}}/>
            <div style={{position:"absolute",left:0,top:"25%",width:`${pct*100}%`,height:"50%",background:"#1B1F2E",borderRadius:2}}/>
            <div style={{position:"absolute",left:"80%",top:0,width:2,height:"100%",background:"#E8611A"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#9CA3AF"}}><span>🔴 Malo</span><span>🟡 Satis.</span><span>🟢 Excelente</span><span>🎯 Meta</span></div>
          <div style={{textAlign:"center",marginTop:6,fontSize:12,fontWeight:700,color:"#10B981"}}>{fmtN(val)} / {fmtN(maxD)} · {Math.round(pct*100)}%</div>
          {infoBar}
        </div>;
      })(),
      badge:(()=>{
        const val=datos[0]||0;
        return <div style={{textAlign:"center",padding:"10px 0"}}>
          <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>{w.metrica}</div>
          <div style={{fontSize:28,fontWeight:800,color:"#1B1F2E",marginBottom:8}}>{fmtN(val)}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:"9999px",background:"#ECFDF5",border:"1.5px solid #6EE7B7"}}>
            <span style={{fontSize:16,color:"#10B981"}}>▲</span>
            <span style={{fontSize:13,fontWeight:800,color:"#10B981"}}>8%</span>
            <span style={{fontSize:9,color:"#6B7280"}}>vs período anterior</span>
          </div>
          {infoBar}
        </div>;
      })(),
      tendencia:<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10.5,color:"#6B7280"}}>{w.metrica}</span>
          <span className="kpi-pill kpi-up" style={{fontSize:9}}>▲ +12.3%</span>
        </div>
        <svg viewBox={`0 0 ${W} 50`} style={{width:"100%",height:50}}>
          <polyline points="0,46 43,34 86,26 130,14 173,18 216,6 260,2" fill="none" stroke="#E8611A" strokeWidth="2.5" strokeLinejoin="round"/>
          <polygon points="0,46 43,34 86,26 130,14 173,18 216,6 260,2 260,50 0,50" fill="#E8611A" fillOpacity=".08"/>
          {[43,86,130,173,216].map((x,i)=><circle key={i} cx={x} cy={[34,26,14,18,6][i]} r="3" fill="#E8611A"/>)}
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8.5,color:"#9CA3AF"}}>{["Ene","Feb","Mar","Abr","May","Jun"].map(m2=><span key={m2}>{m2}</span>)}</div>
        {infoBar}
      </div>,
      ranking:<div>
        {[...datos.map((v,i)=>({v,l:etiq[i]||`#${i+1}`}))].sort((a,b)=>b.v-a.v).slice(0,4).map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
            <span style={{fontSize:14}}>{["🥇","🥈","🥉","4️⃣"][i]}</span>
            <span style={{flex:1,color:"#374151"}}>{d.l}</span>
            <b style={{color:"#E8611A"}}>{fmtN(d.v)}</b>
          </div>
        ))}
        {infoBar}
      </div>,
      spc:(()=>{
        const mean=datos.reduce((a,b)=>a+b,0)/datos.length;
        const sd=Math.sqrt(datos.reduce((a,b)=>a+(b-mean)**2,0)/datos.length)||1;
        const ucl=mean+3*sd;const lcl=Math.max(0,mean-3*sd);const rng=ucl-lcl||1;
        const ySc=(v:number)=>H-18-Math.round(((v-lcl)/rng)*(H-28));
        const pts=datos.map((v,i)=>`${18+i*(W-28)/(datos.length-1)},${ySc(v)}`).join(" ");
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1={ySc(ucl)} x2={W-20} y2={ySc(ucl)} stroke="#EF4444" strokeWidth="1.2" strokeDasharray="5,3"/>
            <line x1="18" y1={ySc(mean)} x2={W-20} y2={ySc(mean)} stroke="#10B981" strokeWidth="1.5"/>
            <line x1="18" y1={ySc(lcl)} x2={W-20} y2={ySc(lcl)} stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="5,3"/>
            <text x={W-18} y={ySc(ucl)+3} fontSize="7" fill="#EF4444">UCL</text>
            <text x={W-18} y={ySc(mean)+3} fontSize="7" fill="#10B981">X̄</text>
            <text x={W-18} y={ySc(lcl)+3} fontSize="7" fill="#3B82F6">LCL</text>
            <polyline points={pts} fill="none" stroke="#E8611A" strokeWidth="1.5" strokeLinejoin="round"/>
            {datos.map((v,i)=>{const x=18+i*(W-28)/(datos.length-1);const y=ySc(v);const out=v>ucl||v<lcl;return<circle key={i} cx={x} cy={y} r={out?5:3} fill={out?"#EF4444":"#E8611A"} stroke={out?"#fff":undefined} strokeWidth={out?1.5:0}/>;})}</svg>
          {infoBar}
        </div>;
      })(),
      pareto:(()=>{
        const sorted=[...datos.map((v,i)=>({v,l:(etiq[i]||`#${i+1}`).split(" ")[0]}))].sort((a,b)=>b.v-a.v);
        const total=sorted.reduce((a,b)=>a+b.v,0)||1;const bw=Math.floor((W-28)/sorted.length);
        let acum=0;const acums=sorted.map(d=>{acum+=d.v/total*100;return acum;});
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1={H-18} x2={W-5} y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            {sorted.map((d,i)=>{const x=18+i*bw+2;const bh=Math.max(2,Math.round((d.v/sorted[0].v)*(H-28)));return<g key={i}><rect x={x} y={H-18-bh} width={bw-4} height={bh} fill="#E8611A" rx="1" opacity=".85"/><text x={x+bw/2-2} y={H-6} textAnchor="middle" fontSize="6.5" fill="#6B7280">{d.l}</text></g>;})}
            <polyline points={sorted.map((_,i)=>`${18+(i+0.5)*bw},${H-18-Math.round(acums[i]/100*(H-28))}`).join(" ")} fill="none" stroke="#1B1F2E" strokeWidth="2" strokeLinejoin="round"/>
            {(()=>{const y=H-18-Math.round(0.8*(H-28));return<><line x1="18" y1={y} x2={W-5} y2={y} stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3"/><text x={22} y={y-2} fontSize="7" fill="#EF4444">80%</text></>;})()}
          </svg>
          {infoBar}
        </div>;
      })(),
      boxplot:(()=>{
        const s2=[...datos].sort((a,b)=>a-b);const n=s2.length;const mn2=Math.min(...datos);
        const q1=s2[Math.floor(n/4)];const med=s2[Math.floor(n/2)];const q3=s2[Math.floor(3*n/4)];
        const iqr=q3-q1;const wlo=Math.max(s2[0],q1-1.5*iqr);const whi=Math.min(s2[n-1],q3+1.5*iqr);
        const sc=(v:number)=>H-18-Math.round(((v-mn2)/(maxD-mn2+1))*(H-28));const cx=W/2;const bw=55;
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1={cx} y1={sc(whi)} x2={cx} y2={sc(q3)} stroke="#E8611A" strokeWidth="1.5" strokeDasharray="3,2"/>
            <line x1={cx} y1={sc(q1)} x2={cx} y2={sc(wlo)} stroke="#E8611A" strokeWidth="1.5" strokeDasharray="3,2"/>
            <line x1={cx-20} y1={sc(whi)} x2={cx+20} y2={sc(whi)} stroke="#E8611A" strokeWidth="2"/>
            <line x1={cx-20} y1={sc(wlo)} x2={cx+20} y2={sc(wlo)} stroke="#E8611A" strokeWidth="2"/>
            <rect x={cx-bw/2} y={sc(q3)} width={bw} height={Math.max(2,sc(q1)-sc(q3))} fill="#E8611A" fillOpacity=".15" stroke="#E8611A" strokeWidth="2" rx="2"/>
            <line x1={cx-bw/2} y1={sc(med)} x2={cx+bw/2} y2={sc(med)} stroke="#E8611A" strokeWidth="3"/>
            <text x={cx+bw/2+4} y={sc(med)+3} fontSize="7" fill="#E8611A">Med:{fmtN(med)}</text>
          </svg>
          {infoBar}
        </div>;
      })(),
      burndown:(()=>{
        const n=8;const ideal=Array.from({length:n},(_,i)=>Math.round(maxD*(1-i/(n-1))));
        const real=ideal.map((v,i)=>Math.max(0,v+Math.round(Math.sin(i*42)*maxD*0.12)));
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="18" y1={H-18} x2={W-5} y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            <polyline points={ideal.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxD)*(H-28))}`).join(" ")} fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="5,4"/>
            <polygon points={`18,${H-18} ${real.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxD)*(H-28))}`).join(" ")} ${W-5},${H-18}`} fill="#E8611A" fillOpacity=".08"/>
            <polyline points={real.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxD)*(H-28))}`).join(" ")} fill="none" stroke="#E8611A" strokeWidth="2.5" strokeLinejoin="round"/>
            {real.map((v,i)=><circle key={i} cx={18+i*(W-28)/(n-1)} cy={H-18-Math.round((v/maxD)*(H-28))} r="3" fill="#E8611A"/>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      treemap:(()=>{
        const total=datos.reduce((a,b)=>a+b,0)||1;const cols2=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444","#06B6D4","#84CC16"];
        let xc=2;
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {datos.slice(0,6).map((v,i)=>{const w2=Math.max(4,Math.round((v/total)*(W-4)));const xp=xc;xc+=w2;const c=cols2[i%cols2.length];return<g key={i}><rect x={xp} y={2} width={Math.max(1,w2-3)} height={H-4} fill={c} rx="3" opacity=".85"/>{w2>28&&<><text x={xp+w2/2-1} y={H/2-2} textAnchor="middle" fontSize="8.5" fill="#fff" fontWeight="bold">{(etiq[i]||"").split(" ")[0]}</text><text x={xp+w2/2-1} y={H/2+10} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,.7)">{Math.round(v/total*100)}%</text></>}</g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      gantt:(()=>{
        const tareas=[{l:"Auditoría ISO",s:1,d:5,c:"#E8611A"},{l:"Mant. Equipo",s:2,d:3,c:"#3B82F6"},{l:"Capacitación",s:4,d:6,c:"#10B981"},{l:"Evaluación",s:6,d:8,c:"#7C3AED"}];
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {tareas.map((t,i)=>{const x=65+(t.s-1)*(W-73)/8;const w2=t.d*(W-73)/8;const y=8+i*28;return<g key={i}><text x={61} y={y+15} textAnchor="end" fontSize="7.5" fill="#6B7280">{t.l}</text><rect x={x} y={y} width={w2} height={22} fill={t.c} rx="3" opacity=".8"/><text x={x+w2/2} y={y+14} textAnchor="middle" fontSize="7" fill="#fff">{t.d}s</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      sankey:(()=>{
        const nodes=[{l:"Leads",x:6,y:22,h:70},{l:"Calif.",x:72,y:18,h:55},{l:"Entrev.",x:144,y:20,h:38},{l:"Oferta",x:202,y:26,h:24},{l:"Cierre",x:W-16,y:30,h:14}];
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {nodes.map((nd,i)=><g key={i}><rect x={nd.x} y={nd.y} width={12} height={nd.h} fill="#E8611A" opacity={0.4+0.6*i/nodes.length} rx="2"/><text x={nd.x+6} y={nd.y+nd.h+12} textAnchor="middle" fontSize="7" fill="#6B7280">{nd.l}</text></g>)}
            {nodes.slice(0,-1).map((nd,i)=>{const nd2=nodes[i+1];return<path key={i} d={`M${nd.x+12},${nd.y+nd.h*0.3} C${(nd.x+nd2.x)/2},${nd.y+nd.h*0.3} ${(nd.x+nd2.x)/2},${nd2.y+nd2.h*0.3} ${nd2.x},${nd2.y+nd2.h*0.3}`} fill="none" stroke="#E8611A" strokeWidth={Math.max(2,nd.h*0.3)} opacity=".2"/>;})}</svg>
          {infoBar}
        </div>;
      })(),
      dispersion:(()=>{
        const d2=esRRHH?datosInv.slice(0,datos.length):datosNom.slice(0,datos.length);const mn1=Math.min(...datos);const mn2=Math.min(...d2);const mx2=Math.max(...d2,1);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="18" y1={H-18} x2={W-5} y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            {datos.map((vx,i)=>{const vy=d2[i%d2.length]||0;const cx=18+Math.round((vx-mn1)/(maxD-mn1+1)*(W-28));const cy=H-18-Math.round((vy-mn2)/(mx2-mn2+1)*(H-28));return<g key={i}><circle cx={cx} cy={cy} r="5" fill="#E8611A" opacity=".7" stroke="#fff" strokeWidth="1"/><text x={cx+7} y={cy+3} fontSize="6.5" fill="#6B7280">{(etiq[i]||"").split(" ")[0]}</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      burbuja:(()=>{
        const d2=esRRHH?datosInv.slice(0,datos.length):datosNom.slice(0,datos.length);const mn1=Math.min(...datos);const mn2=Math.min(...d2);const mx2=Math.max(...d2,1);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1={H-18} x2={W-5} y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            {datos.map((vx,i)=>{const vy=d2[i%d2.length]||0;const cx=18+Math.round((vx-mn1)/(maxD-mn1+1)*(W-28));const cy=H-18-Math.round((vy-mn2)/(mx2-mn2+1)*(H-28));const r2=Math.max(5,Math.min(18,vx/maxD*18));return<g key={i}><circle cx={cx} cy={cy} r={r2} fill="#E8611A" opacity=".5" stroke="#fff" strokeWidth="1.5"/><text x={cx} y={cy+3} textAnchor="middle" fontSize="6.5" fill="#fff" fontWeight="bold">{(etiq[i]||"").split(" ")[0]}</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      embudo:(()=>{
        const etapas=[{l:"Solicitudes",v:100},{l:"Revisión",v:72},{l:"Aprobadas",v:55},{l:"Completadas",v:38}];
        return <div style={{padding:"4px 0"}}>
          {etapas.map((e,i)=><div key={i} style={{marginBottom:5}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span>{e.l}</span><span style={{fontWeight:700,color:"#E8611A"}}>{e.v}%{i>0?` (${Math.round(e.v/etapas[i-1].v*100)}%)`:""}</span></div>
            <div style={{height:18,background:"linear-gradient(90deg,#E8611ACC,#F97316AA)",borderRadius:3,width:`${e.v}%`}}/>
          </div>)}
          {infoBar}
        </div>;
      })(),
      heatmap:(()=>{
        const nc=4;const nr=Math.ceil(datos.length/nc);const cw=Math.floor((W-8)/nc);const ch=Math.floor((H-8)/nr);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {datos.slice(0,8).map((v,i)=>{const c=i%nc;const r2=Math.floor(i/nc);const intensity=v/maxD;const rr=Math.round(232*intensity+229*(1-intensity));const gg=Math.round(97*intensity+229*(1-intensity));const b=Math.round(26*intensity+229*(1-intensity));const x=c*cw+1;const y=r2*ch+1;return<g key={i}><rect x={x} y={y} width={cw-2} height={ch-2} fill={`rgb(${rr},${gg},${b})`} rx="3"/><text x={x+cw/2} y={y+ch/2+3} textAnchor="middle" fontSize="7.5" fill={intensity>0.5?"#fff":"#374151"} fontWeight="bold">{fmtN(v)}</text><text x={x+cw/2} y={y+ch-4} textAnchor="middle" fontSize="6" fill={intensity>0.5?"rgba(255,255,255,.6)":"#9CA3AF"}>{(etiq[i]||"").split(" ")[0]}</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      riesgo:(()=>{
        const celdas=[[{l:"Bajo",c:"#D1FAE5"},{l:"Medio",c:"#FEF3C7"},{l:"Alto",c:"#FEE2E2"}],[{l:"Bajo",c:"#D1FAE5"},{l:"Alto",c:"#FEE2E2"},{l:"Crítico",c:"#EF4444"}],[{l:"Medio",c:"#FEF3C7"},{l:"Alto",c:"#FEE2E2"},{l:"Crítico",c:"#EF4444"}]];
        const cw=(W-42)/3;const ch=(H-22)/3;
        return <div>
          <div style={{display:"flex",fontSize:8,color:"#6B7280",marginBottom:1}}><span style={{width:40}}/>{["Baja","Media","Alta"].map(l=><span key={l} style={{flex:1,textAlign:"center"}}>{l}</span>)}</div>
          <svg viewBox={`0 0 ${W} ${H-12}`} style={{width:"100%",height:H-12}}>
            {["Alta","Media","Baja"].map((rl,ri)=><React.Fragment key={ri}>
              <text x={38} y={ri*ch+ch/2+3} textAnchor="end" fontSize="7" fill="#6B7280">{rl}</text>
              {celdas[ri].map((cd,ci)=><g key={ci}><rect x={40+ci*cw+1} y={ri*ch+1} width={cw-2} height={ch-2} fill={cd.c} rx="3"/><text x={40+ci*cw+cw/2} y={ri*ch+ch/2+3} textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600">{cd.l}</text></g>)}
            </React.Fragment>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      dual_axis:(()=>{
        const d2=esRRHH?datosInv.slice(0,datos.length):datosNom.slice(0,datos.length);const mx2=Math.max(...d2,1);const n=datos.length;
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            <polyline points={datos.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxD)*(H-28))}`).join(" ")} fill="none" stroke="#E8611A" strokeWidth="2.5" strokeLinejoin="round"/>
            <polyline points={d2.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/mx2)*(H-28))}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3"/>
            {datos.map((_,i)=><text key={i} x={18+i*(W-28)/(n-1)} y={H-6} textAnchor="middle" fontSize="6.5" fill="#9CA3AF">{(etiq[i]||"").split(" ")[0]}</text>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      area_stack:(()=>{
        const n=6;const series=[[40,55,70,65,80,90],[30,40,50,45,55,60],[20,25,30,35,40,45]];const cols2=["#E8611A","#3B82F6","#10B981"];
        const totals=Array.from({length:n},(_,i)=>series.reduce((a,s)=>a+s[i],0));const maxT=Math.max(...totals,1);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {series.map((s,si)=>{const tops=s.map((v,i)=>series.slice(0,si+1).reduce((a,sr)=>a+sr[i],0));const bots=s.map((_,i)=>series.slice(0,si).reduce((a,sr)=>a+sr[i],0));const pts=tops.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxT)*(H-28))}`).join(" ");const base=bots.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v/maxT)*(H-28))}`).reverse().join(" ");return<polygon key={si} points={`${pts} ${base}`} fill={cols2[si%cols2.length]} opacity=".75"/>;})}</svg>
          {infoBar}
        </div>;
      })(),
      candlestick:(()=>{
        const candles=datos.slice(0,6).map(v=>({o:v*0.95,h:v*1.08,l:v*0.9,c:v}));const allV=candles.flatMap(c=>[c.h,c.l]);const mn2=Math.min(...allV);const mx2=Math.max(...allV)||1;const sc=(v:number)=>H-18-Math.round((v-mn2)/(mx2-mn2)*(H-28));const bw=Math.floor((W-28)/candles.length);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {candles.map((c,i)=>{const x=18+i*bw+bw/2;const up=c.c>=c.o;const clr=up?"#10B981":"#EF4444";return<g key={i}><line x1={x} y1={sc(c.h)} x2={x} y2={sc(c.l)} stroke={clr} strokeWidth="1.5"/><rect x={x-bw/4} y={Math.min(sc(c.o),sc(c.c))} width={bw/2} height={Math.max(2,Math.abs(sc(c.o)-sc(c.c)))} fill={clr} rx="1"/></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      histograma:(()=>{
        const s2=[...datos].sort((a,b)=>a-b);const bins=5;const mn2=s2[0];const mx2=s2[s2.length-1];const step=(mx2-mn2)/bins||1;const counts=Array(bins).fill(0);s2.forEach(v=>{const b=Math.min(Math.floor((v-mn2)/step),bins-1);counts[b]++;});const mC=Math.max(...counts,1);const bw=Math.floor((W-28)/bins);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            {counts.map((c,i)=>{const x=18+i*bw+1;const bh=Math.max(2,Math.round((c/mC)*(H-28)));const y=H-18-bh;return<g key={i}><rect x={x} y={y} width={bw-2} height={bh} fill="#E8611A" rx="1" opacity=".8"/><text x={x+bw/2} y={H-6} textAnchor="middle" fontSize="6.5" fill="#6B7280">{fmtN(Math.round(mn2+i*step))}</text>{c>0&&<text x={x+bw/2} y={y-2} textAnchor="middle" fontSize="7" fill="#E8611A" fontWeight="bold">{c}</text>}</g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      radar:(()=>{
        const n3=Math.min(datos.length,8);const d3=datos.slice(0,n3);const max3=Math.max(...d3,1);const cx=W/2;const cy=H/2;const r=Math.min(cx,cy)-14;
        const pts3=d3.map((v,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n3);const rv=(v/max3)*r;return{x:cx+rv*Math.cos(ang),y:cy+rv*Math.sin(ang),lx:cx+(r+12)*Math.cos(ang),ly:cy+(r+12)*Math.sin(ang),l:(etiq[i]||"").split(" ")[0]};});
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {[0.33,0.66,1].map(f=>{const rr=r*f;const pp=d3.map((_,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n3);return`${cx+rr*Math.cos(ang)},${cy+rr*Math.sin(ang)}`;}).join(" ");return<polygon key={f} points={pp} fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>;})
            }{d3.map((_,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n3);return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(ang)} y2={cy+r*Math.sin(ang)} stroke="#E5E7EB" strokeWidth="0.5"/>;})
            }<polygon points={pts3.map(p=>`${p.x},${p.y}`).join(" ")} fill="#E8611A" fillOpacity=".2" stroke="#E8611A" strokeWidth="2"/>
            {pts3.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="3" fill="#E8611A"/><text x={p.lx} y={p.ly+3} textAnchor="middle" fontSize="6.5" fill="#6B7280">{p.l}</text></g>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      waterfall:(()=>{
        const bw=Math.floor((W-28)/datos.length);let running=0;const bars=datos.map((v,i)=>{const base=running;running+=v;return{v,base,c:v>=0?"#10B981":"#EF4444",l:(etiq[i]||"").split(" ")[0]};});
        const allV=[0,...bars.map(b=>b.base+b.v)];const mn2=Math.min(...allV);const mx2=Math.max(...allV)||1;const sc=(v:number)=>H-18-Math.round((v-mn2)/(mx2-mn2)*(H-28));
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1={sc(0)} x2={W-5} y2={sc(0)} stroke="#E5E7EB" strokeWidth="1"/>
            {bars.map((b,i)=>{const x=18+i*bw+2;const y1=sc(b.base);const y2=sc(b.base+b.v);const top=Math.min(y1,y2);const h=Math.max(2,Math.abs(y2-y1));return<g key={i}><rect x={x} y={top} width={bw-4} height={h} fill={b.c} rx="1" opacity=".8"/><text x={x+bw/2-2} y={H-6} textAnchor="middle" fontSize="6.5" fill="#6B7280">{b.l}</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      circular:(()=>{
        const total=datos.reduce((a,b)=>a+b,0)||1;const cols2=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444","#06B6D4","#84CC16"];
        let ang=-Math.PI/2;const cx=H/2+4;const cy=H/2;const r=H/2-8;
        const slices=datos.slice(0,6).map((v,i)=>{const s=ang;const sw=(v/total)*2*Math.PI;ang+=sw;const x1=cx+r*Math.cos(s);const y1=cy+r*Math.sin(s);const x2=cx+r*Math.cos(ang);const y2=cy+r*Math.sin(ang);const large=sw>Math.PI?1:0;const mx2=cx+(r*0.62)*Math.cos(s+sw/2);const my=cy+(r*0.62)*Math.sin(s+sw/2);return{path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`,c:cols2[i%cols2.length],mx:mx2,my,pct:Math.round(v/total*100),l:(etiq[i]||"").split(" ")[0]};});
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            {slices.map((s,i)=><g key={i}><path d={s.path} fill={s.c} opacity=".85" stroke="#fff" strokeWidth="1.5"/>{s.pct>5&&<text x={s.mx} y={s.my} textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="bold">{s.pct}%</text>}</g>)}
            {slices.map((s,i)=><g key={`l${i}`}><rect x={H+12} y={6+i*14} width={9} height={8} fill={s.c} rx="1"/><text x={H+24} y={13+i*14} fontSize="7.5" fill="#374151">{s.l}</text></g>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      area:(()=>{
        const n=datos.length;const mn2=Math.min(...datos);const pts=datos.map((v,i)=>`${18+i*(W-28)/(n-1)},${H-18-Math.round((v-mn2)/(maxD-mn2+1)*(H-28))}`).join(" ");
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <polygon points={`18,${H-18} ${pts} ${18+(n-1)*(W-28)/(n-1)},${H-18}`} fill="#E8611A" fillOpacity=".18"/>
            <polyline points={pts} fill="none" stroke="#E8611A" strokeWidth="2.5" strokeLinejoin="round"/>
            {datos.map((_,i)=><text key={i} x={18+i*(W-28)/(n-1)} y={H-6} textAnchor="middle" fontSize="6.5" fill="#9CA3AF">{(etiq[i]||"").split(" ")[0]}</text>)}
          </svg>
          {infoBar}
        </div>;
      })(),
      barras:(()=>{
        const bw=Math.floor((W-28)/datos.length);
        return <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
            <line x1="18" y1="10" x2="18" y2={H-18} stroke="#E5E7EB" strokeWidth="1"/>
            {datos.map((v,i)=>{const x=18+i*bw+2;const bh=Math.max(2,Math.round((v/maxD)*(H-28)));const y=H-18-bh;return<g key={i}><rect x={x} y={y} width={bw-4} height={bh} fill="#E8611A" rx="2" opacity=".85"/><text x={x+bw/2-2} y={H-6} textAnchor="middle" fontSize="6.5" fill="#6B7280">{(etiq[i]||"").split(" ")[0]}</text></g>;})}
          </svg>
          {infoBar}
        </div>;
      })(),
      calendario:<div style={{padding:"2px 0"}}>
        <div style={{fontSize:9.5,fontWeight:600,color:"#6B7280",textAlign:"center",marginBottom:4}}>Abr 2025 · {w.modulo.split(" ")[0]}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1.5}}>
          {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{textAlign:"center",fontSize:7,color:"#9CA3AF"}}>{d}</div>)}
          {Array.from({length:30},(_,i)=>{const v=datos[i%datos.length];const intensity=v/maxD;return<div key={i} style={{textAlign:"center",fontSize:7,padding:"1.5px 0",borderRadius:2,background:intensity>0.7?"#FFF3ED":intensity>0.4?"#FEF3C7":"#F9FAFB",color:intensity>0.7?"#E8611A":"#374151",fontWeight:intensity>0.7?600:400}}>{i+1}</div>;})}
        </div>
        {infoBar}
      </div>,
      prediccion:<div style={{display:"flex",flexDirection:"column",gap:5}}>
        <div style={{padding:"7px 9px",background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:7,fontSize:11}}>🔴 <b>Riesgo:</b> {w.metrica} en tendencia crítica</div>
        <div style={{padding:"7px 9px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7,fontSize:11}}>⚡ <b>Patrón:</b> Ciclo de 30 días detectado</div>
        <div style={{padding:"7px 9px",background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:7,fontSize:11}}>✓ <b>Normal:</b> 82% dentro del rango esperado</div>
        {infoBar}
      </div>,
      anomalias:<div style={{padding:"10px",background:"#FEF2F2",border:"2px solid #EF4444",borderRadius:9}}>
        <div style={{fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:5}}>🚨 ANOMALÍA DETECTADA</div>
        <div style={{fontSize:11,color:"#374151",marginBottom:4}}><b>{w.metrica}</b> fuera de UCL (+2.8σ)</div>
        <div style={{height:4,background:"#E5E7EB",borderRadius:2,margin:"6px 0 3px"}}><div style={{width:"82%",background:"#EF4444",height:"100%",borderRadius:2}}/></div>
        <div style={{fontSize:9,color:"#9CA3AF"}}>Nivel: 82%</div>
        {infoBar}
      </div>,
      alertas_ia:<div style={{display:"flex",flexDirection:"column",gap:4}}>
        {[["🔴","Alta","Stock crítico en inventario"],["🟡","Media","Tendencia negativa Q2"],["🔵","Info","Patrón nuevo identificado"]].map(([ic,tipo,msg])=>(
          <div key={tipo} style={{display:"flex",gap:7,padding:"5px 7px",background:"#F9FAFB",borderRadius:7,fontSize:10.5,alignItems:"flex-start"}}>
            <span style={{fontSize:13}}>{ic}</span><div><div style={{fontWeight:600,color:"#1B1F2E"}}>{tipo}</div><div style={{color:"#6B7280"}}>{msg}</div></div>
          </div>
        ))}
        {infoBar}
      </div>,
      pred_costos:<div>
        <div style={{textAlign:"center",padding:"6px 0"}}>
          <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Proyección — {w.periodo}</div>
          <div style={{fontSize:26,fontWeight:800,color:"#7C3AED"}}>{fmtN(Math.round(maxD*1.08))}</div>
          <div style={{fontSize:10.5,color:"#6B7280",marginTop:3}}>+8% · Confianza: 87%</div>
        </div>
        <div style={{height:5,background:"#E5E7EB",borderRadius:3,margin:"6px 0 3px"}}><div style={{width:"87%",background:"#7C3AED",height:"100%",borderRadius:3}}/></div>
        {infoBar}
      </div>,
      data_grid:<div style={{overflowX:"auto" as const}}>
        <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:10.5}}>
          <thead><tr style={{background:"#F9FAFB"}}>{["#","Nombre","Valor","Estado"].map(h=><th key={h} style={{padding:"3px 5px",textAlign:"left" as const,fontSize:9,color:"#6B7280",borderBottom:"1px solid #E5E7EB"}}>{h}</th>)}</tr></thead>
          <tbody>
            {datos.slice(0,4).map((v,i)=><tr key={i} style={{borderBottom:"0.5px solid #F3F4F6"}}>
              <td style={{padding:"3px 5px",color:"#9CA3AF",fontSize:9}}>{i+1}</td>
              <td style={{padding:"3px 5px",fontWeight:500}}>{(etiq[i]||`#${i+1}`).split(" ")[0]}</td>
              <td style={{padding:"3px 5px",color:"#E8611A",fontWeight:700}}>{fmtN(v)}</td>
              <td style={{padding:"3px 5px"}}><span style={{fontSize:8.5,padding:"1px 5px",borderRadius:"9999px",background:v/maxD>0.7?"#ECFDF5":"#FEF3C7",color:v/maxD>0.7?"#065F46":"#92400E"}}>{v/maxD>0.7?"✓":"⚠"}</span></td>
            </tr>)}
          </tbody>
        </table>
        {infoBar}
      </div>,
      metric_filter:<div>
        <div style={{fontSize:10,fontWeight:600,color:"#6B7280",marginBottom:6}}>🎛️ Filtros activos del dashboard</div>
        {[["📅",w.periodo],["🏢",w.modulo.split(" ")[0]],["📊",w.metrica.split(" ").slice(0,3).join(" ")]].map(([ic,v])=>(
          <div key={ic} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",background:"#F9FAFB",borderRadius:6,marginBottom:4,fontSize:11}}>
            <span style={{fontSize:13}}>{ic}</span><span style={{flex:1,color:"#374151"}}>{v}</span>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" style={{width:"100%",marginTop:4,fontSize:10}}>Aplicar al dashboard</button>
        {infoBar}
      </div>,
    };
    return m[w.type]||<div style={{textAlign:"center",padding:"16px 0",color:"#9CA3AF",fontSize:11}}>
      <div style={{fontSize:22,marginBottom:5}}>📊</div><div>{w.type}</div><div style={{fontSize:9.5,marginTop:3}}>{w.metrica}</div>
    </div>;
  };

  return (
    <div className="content">
      <div style={{background:"linear-gradient(135deg,#1B1F2E,#185FA5)",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:32}}>📊</div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Poppins','Inter',sans-serif"}}>BI & Reportería Multi-módulo</div>
          <div style={{fontSize:11.5,color:"rgba(255,255,255,.55)"}}>Ejecutivo · RRHH · Inventario · Calidad ISO · Datos reales cruzados</div>
        </div>
        <select className="form-control" style={{width:160,background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)"}}>
          <option style={{color:"#1B1F2E"}}>Últimos 6 meses</option>
          <option style={{color:"#1B1F2E"}}>Este año</option>
          <option style={{color:"#1B1F2E"}}>Último mes</option>
        </select>
        <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>setView("reportes")}>📥 Reportes</button>
      </div>

      <div className="tab-bar" style={{marginBottom:14}}>
        {[["ejecutivo","🏆 Ejecutivo"],["rrhh","👥 RRHH & Nómina"],["inventario","📦 Inventario"],["calidad","✅ Calidad ISO"],["custom","⚙️ Mis Widgets"],["constructor","📐 Constructor"],["estadistica","📐 Estadística"]].map(([id,l])=>(
          <div key={id} className={`tab-btn ${biTab===id?"active":""}`} onClick={()=>setBiTab(id)}>
            {l}{id==="constructor"&&graficas.length>0&&<span style={{marginLeft:5,background:"#E8611A",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:"9999px"}}>{graficas.length}</span>}
          </div>
        ))}
      </div>

      {biTab==="ejecutivo"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[
              {l:"Colaboradores activos",v:totalEmpleados.toString(),sub:`${catalogos.planillas.filter(p=>p.estado==="activa").length} planillas activas`,c:"#1B1F2E",icon:"👥"},
              {l:"Planilla bruta mensual",v:fmt(totalBruto),sub:"Total empresa · todas planillas",c:"#E8611A",icon:"💰"},
              {l:"Valor inventario",v:`$${Math.round(valorInventario/1000)}K`,sub:`${EXISTENCIAS.length} artículos · ${totalBodegas} bodegas`,c:"#3B82F6",icon:"📦"},
              {l:"Alertas activas",v:(itemsCriticos+2).toString(),sub:"Inv: "+itemsCriticos+" críticos · RRHH: 2",c:"#EF4444",icon:"🔔"},
            ].map(k=>(
              <div key={k.l} className="kpi" style={{position:"relative"}}>
                <div style={{fontSize:20,marginBottom:4}}>{k.icon}</div>
                <div className="kpi-label">{k.l}</div>
                <div className="kpi-value" style={{fontSize:18,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10.5,color:"#6B7280",marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div className="card">
              <div className="card-title">💰 Estructura de costos empresa</div>
              {[
                {l:"Planilla neta total",v:Math.round(totalBruto*0.85),c:"#10B981",pct:52},
                {l:"Cargas sociales CCSS",v:Math.round(totalBruto*0.2633),c:"#3B82F6",pct:16},
                {l:"Inventario (costo mes)",v:Math.round(valorInventario*0.03),c:"#E8611A",pct:18},
                {l:"Operaciones estimado",v:Math.round(totalBruto*0.22),c:"#7C3AED",pct:14},
              ].map(r=>(
                <div key={r.l} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                    <span style={{color:"#374151"}}>{r.l}</span>
                    <span style={{fontWeight:700,color:r.c}}>₡{r.v.toLocaleString("es-CR")}</span>
                  </div>
                  <div style={{background:"#E5E7EB",borderRadius:3,height:7}}><div style={{width:`${r.pct}%`,background:r.c,height:"100%",borderRadius:3}}/></div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title">📈 Tendencia — indicadores clave</div>
              <svg viewBox="0 0 300 100" style={{width:"100%",height:100,marginBottom:8}}>
                <polyline points="0,80 50,72 100,68 150,60 200,58 250,52 300,48" fill="none" stroke="#E8611A" strokeWidth="2" strokeLinejoin="round"/>
                <polyline points="0,60 50,55 100,50 150,65 200,58 250,62 300,70" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3"/>
                <polyline points="0,20 50,30 100,25 150,15 200,28 250,20 300,18" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="2,4"/>
              </svg>
              <div style={{display:"flex",gap:16,fontSize:10.5}}>
                <span style={{color:"#E8611A"}}>— Costo nómina</span>
                <span style={{color:"#3B82F6"}}>-- Valor inventario</span>
                <span style={{color:"#EF4444"}}>.. Alertas</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">🔔 Alertas cruzadas — todos los módulos</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                {modulo:"📦 Inventario",alertas:[`${itemsCriticos} artículos en stock crítico`,"24 ítems bajo mínimo de reorden"],color:"#E8611A",bg:"#FFF3ED"},
                {modulo:"👥 RRHH",alertas:["1 contrato vence en 15 días","3 certificaciones por vencer","Evaluación Q2 pendiente"],color:"#7C3AED",bg:"#F5F3FF"},
                {modulo:"📋 Solicitudes",alertas:["4 solicitudes pendientes >48h","2 casos sin asignar"],color:"#3B82F6",bg:"#EFF6FF"},
              ].map(m=>(
                <div key={m.modulo} style={{padding:"12px 14px",borderRadius:9,background:m.bg,border:`1px solid ${m.color}30`}}>
                  <div style={{fontSize:12,fontWeight:700,color:m.color,marginBottom:8}}>{m.modulo}</div>
                  {m.alertas.map((a,i)=>(
                    <div key={i} style={{fontSize:11.5,color:"#374151",padding:"3px 0",borderBottom:"0.5px solid rgba(0,0,0,.06)",display:"flex",gap:6}}>
                      <span style={{color:m.color,fontSize:10}}>●</span>{a}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {biTab==="rrhh"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[
              {l:"Planilla bruta",v:fmt(totalBruto),c:"#E8611A"},
              {l:"Costo total empresa",v:fmt(Math.round(totalBruto*1.2633)),c:"#7C3AED"},
              {l:"Costo promedio/colab.",v:fmt(Math.round(totalBruto*1.2633/totalEmpleados)),c:"#3B82F6"},
              {l:"Planillas activas",v:planillasActivas.toString(),c:"#10B981"},
            ].map(k=>(
              <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c,fontSize:15}}>{k.v}</div></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="card">
              <div className="card-title">📋 Distribución por planilla</div>
              {catalogos.planillas.filter(p=>p.estado==="activa").map(p=>{
                const emps=empleados.filter(e=>p.empleadosIds.includes(e.id)&&e.estado==="activo");
                const bruto=emps.reduce((a,e)=>a+e.salario,0);
                const pct=totalBruto>0?Math.round(bruto/totalBruto*100):0;
                return (
                  <div key={p.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:p.color,display:"inline-block"}}/>{p.nombre} ({emps.length})</span>
                      <span style={{fontWeight:700,color:p.color}}>{fmt(bruto)} · {pct}%</span>
                    </div>
                    <div style={{background:"#E5E7EB",borderRadius:3,height:7}}><div style={{width:`${pct}%`,background:p.color,height:"100%",borderRadius:3}}/></div>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div className="card-title">🏢 Headcount por departamento</div>
              {Array.from(new Set(empleados.filter(e=>e.estado==="activo").map(e=>e.depto))).map(dept=>{
                const n=empleados.filter(e=>e.estado==="activo"&&e.depto===dept).length;
                const salDept=empleados.filter(e=>e.estado==="activo"&&e.depto===dept).reduce((a,e)=>a+e.salario,0);
                const colors=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444"];
                const ci=Array.from(new Set(empleados.map(e=>e.depto))).indexOf(dept)%colors.length;
                return (
                  <div key={dept} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"0.5px solid #F3F4F6"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:colors[ci],flexShrink:0}}/>
                    <span style={{flex:1,fontSize:12}}>{dept}</span>
                    <span style={{fontSize:12,fontWeight:600,color:colors[ci]}}>{n} pers.</span>
                    <span style={{fontSize:11,color:"#6B7280",minWidth:90,textAlign:"right"}}>{fmt(salDept)}</span>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div className="card-title">💰 Pirámide salarial</div>
              {[
                {rango:"Más de ₡900K",emps:empleados.filter(e=>e.estado==="activo"&&e.salario>900000)},
                {rango:"₡700K – ₡900K",emps:empleados.filter(e=>e.estado==="activo"&&e.salario>=700000&&e.salario<=900000)},
                {rango:"₡500K – ₡699K",emps:empleados.filter(e=>e.estado==="activo"&&e.salario>=500000&&e.salario<700000)},
                {rango:"Menos de ₡500K",emps:empleados.filter(e=>e.estado==="activo"&&e.salario<500000)},
              ].map(r=>(
                <div key={r.rango} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:2}}>
                    <span>{r.rango}</span><span style={{fontWeight:600}}>{r.emps.length} pers.</span>
                  </div>
                  <div style={{background:"#E5E7EB",borderRadius:3,height:6}}><div style={{width:`${totalEmpleados>0?Math.round(r.emps.length/totalEmpleados*100):0}%`,background:"#7C3AED",height:"100%",borderRadius:3}}/></div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title">📊 Indicadores RRHH</div>
              <div className="resumen">
                {[["Rotación 2024","12.5%"],["Ausentismo","2.1%"],["Satisfacción clima","78%"],["Horas capacitación","66h"],["Evaluaciones pendientes","8 (Q2)"],["Contratos por vencer","1 (15 días)"],["NPS interno","+42"]].map(([l,v])=>(
                  <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{color:"#7C3AED",fontSize:11}}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {biTab==="inventario"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[
              {l:"Valor total inventario",v:`$${Math.round(valorInventario/1000)}K`,c:"#E8611A"},
              {l:"Artículos críticos",v:itemsCriticos.toString(),c:"#EF4444"},
              {l:"Bodegas activas",v:totalBodegas.toString(),c:"#3B82F6"},
              {l:"Proveedores activos",v:totalProveedores.toString(),c:"#10B981"},
            ].map(k=>(
              <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c}}>{k.v}</div></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="card">
              <div className="card-title">🏭 Stock por bodega</div>
              {catalogos.bodegas.map((b,i)=>{
                const colors=["#E8611A","#3B82F6","#10B981"];
                const val=Math.round(valorInventario/(i+2));
                return (
                  <div key={b.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span>{b.nombre}</span><span style={{fontWeight:700,color:colors[i%3]}}>${Math.round(val/1000)}K</span>
                    </div>
                    <div style={{background:"#E5E7EB",borderRadius:3,height:7}}><div style={{width:`${Math.round(100/(i+2))}%`,background:colors[i%3],height:"100%",borderRadius:3}}/></div>
                  </div>
                );
              })}
            </div>
            <div className="card">
              <div className="card-title">🚦 Semáforo de stock</div>
              {[
                {l:"🟢 Stock OK",n:EXISTENCIAS.filter(e=>e.estado==="ok").length,c:"#10B981"},
                {l:"🟡 Bajo mínimo",n:EXISTENCIAS.filter(e=>e.estado==="bajo").length,c:"#F59E0B"},
                {l:"🔴 Crítico",n:EXISTENCIAS.filter(e=>e.estado==="critico").length,c:"#EF4444"},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"0.5px solid #F3F4F6"}}>
                  <span style={{fontSize:13,flex:1}}>{r.l}</span>
                  <span style={{fontSize:20,fontWeight:800,color:r.c}}>{r.n}</span>
                  <div style={{width:60,height:8,background:"#E5E7EB",borderRadius:3}}><div style={{width:`${Math.round(r.n/EXISTENCIAS.length*100)}%`,background:r.c,height:"100%",borderRadius:3}}/></div>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{marginTop:10,width:"100%"}} onClick={()=>setView("reabasto")}>Ver plan de reabastecimiento →</button>
            </div>
            <div className="card" style={{gridColumn:"1/-1"}}>
              <div className="card-title">📊 Valor por categoría</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {catalogos.categorias.slice(0,4).map((cat,i)=>{
                  const catColors=["#E8611A","#3B82F6","#10B981","#7C3AED"];
                  const items=EXISTENCIAS.filter(e=>e.cat===cat.nombre);
                  const val=items.reduce((a,e)=>a+e.stock*e.costo,0);
                  return (
                    <div key={cat.id} style={{padding:"12px",background:catColors[i]+"10",border:`1px solid ${catColors[i]}30`,borderRadius:9,textAlign:"center"}}>
                      <div style={{fontSize:13,fontWeight:700,color:catColors[i]}}>{cat.nombre}</div>
                      <div style={{fontSize:16,fontWeight:800,marginTop:4}}>${Math.round(val/1000)}K</div>
                      <div style={{fontSize:10.5,color:"#6B7280",marginTop:2}}>{items.length} artículos</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {biTab==="calidad"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[{l:"NC abiertas",v:"3",c:"#EF4444"},{l:"Auditorías 2024",v:"2",c:"#3B82F6"},{l:"Acciones correctivas",v:"7",c:"#F59E0B"},{l:"Cumplimiento ISO",v:"94%",c:"#10B981"}].map(k=>(
              <div key={k.l} className="kpi"><div className="kpi-label">{k.l}</div><div className="kpi-value" style={{color:k.c}}>{k.v}</div></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="card">
              <div className="card-title">📋 Cumplimiento por cláusula ISO 9001</div>
              {[{c:"§4 Contexto",pct:100},{c:"§5 Liderazgo",pct:95},{c:"§6 Planificación",pct:90},{c:"§7 Apoyo (Recursos)",pct:87},{c:"§8 Operación",pct:92},{c:"§9 Evaluación",pct:88},{c:"§10 Mejora",pct:85}].map(r=>(
                <div key={r.c} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:2}}>
                    <span>{r.c}</span><span style={{fontWeight:700,color:r.pct>=90?"#10B981":r.pct>=80?"#F59E0B":"#EF4444"}}>{r.pct}%</span>
                  </div>
                  <div style={{background:"#E5E7EB",borderRadius:3,height:6}}><div style={{width:`${r.pct}%`,background:r.pct>=90?"#10B981":r.pct>=80?"#F59E0B":"#EF4444",height:"100%",borderRadius:3}}/></div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title">⚠️ No conformidades abiertas</div>
              {[
                {nc:"NC-2024-001",desc:"Falta de calibración instrumento medición",nivel:"Mayor",dias:12},
                {nc:"NC-2024-002",desc:"Procedimiento no actualizado §7.5",nivel:"Menor",dias:5},
                {nc:"NC-2024-003",desc:"Registro incompleto capacitaciones",nivel:"Menor",dias:3},
              ].map((nc,i)=>(
                <div key={i} style={{padding:"9px 10px",borderRadius:8,background:nc.nivel==="Mayor"?"#FEF2F2":"#FFFBEB",border:`1px solid ${nc.nivel==="Mayor"?"#FCA5A5":"#FDE68A"}`,marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontFamily:"monospace",fontSize:11,color:"#E8611A"}}>{nc.nc}</span>
                    <span className={`badge ${nc.nivel==="Mayor"?"badge-crit":"badge-warn"}`}>{nc.nivel}</span>
                    <span style={{marginLeft:"auto",fontSize:11,color:"#6B7280"}}>{nc.dias} días abierta</span>
                  </div>
                  <div style={{fontSize:11.5,color:"#374151"}}>{nc.desc}</div>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{width:"100%",marginTop:4}}>Ver todas las NC →</button>
            </div>
          </div>
        </div>
      )}

      {biTab==="custom"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"9px 13px",marginBottom:14,fontSize:12}}>
            <span>💡</span><span style={{color:"#6B7280",flex:1}}>Dashboard personalizable. Agrega widgets de cualquier módulo.</span>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>+ Widget</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {widgets.map(w=>(
              <div key={w.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:14,position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700}}>{w.title}</div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setWidgets(prev=>prev.filter(x=>x.id!==w.id))} style={{padding:"2px 5px",fontSize:11}}>✕</button>
                </div>
                {renderWidget(w)}
              </div>
            ))}
            <div style={{border:"2px dashed #E5E7EB",borderRadius:10,padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",background:"#F4F5F7",minHeight:120}} onClick={()=>setShowModal(true)}>
              <div style={{fontSize:24,color:"#9CA3AF"}}>＋</div>
              <div style={{fontSize:12,color:"#9CA3AF"}}>Añadir widget</div>
            </div>
          </div>
        </div>
      )}

      {biTab==="constructor"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#1B1F2E,#2D3348)",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
            <span style={{fontSize:24}}>📐</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:700,color:"#fff"}}>Constructor de Gráficas</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Elige módulo → variable → tipo de gráfica → personaliza. Inspirado en Minitab.</div>
            </div>
            <button className="btn btn-sm" style={{background:"#E8611A",color:"#fff",border:"none"}} onClick={()=>{setShowConstructor(true);setCPaso(1);setCCfg({color:"#E8611A"});}}>+ Nueva gráfica</button>
          </div>
          {graficas.length===0?(
            <div style={{textAlign:"center",padding:"50px 20px",background:"#F9FAFB",borderRadius:12,border:"2px dashed #E5E7EB"}}>
              <div style={{fontSize:44,marginBottom:12}}>📐</div>
              <div style={{fontSize:15,fontWeight:700,color:"#1B1F2E",marginBottom:8}}>Sin gráficas personalizadas</div>
              <div style={{fontSize:12.5,color:"#6B7280",marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>Usa el constructor para crear gráficas eligiendo el módulo fuente, la variable a graficar y el tipo de visualización.</div>
              <button className="btn btn-primary" onClick={()=>{setShowConstructor(true);setCPaso(1);}}>📐 Crear primera gráfica</button>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {graficas.map(g=>(
                <div key={g.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:g.color,flexShrink:0}}/>
                    <div style={{fontSize:13,fontWeight:700,flex:1}}>{g.titulo}</div>
                    <span className="badge badge-info" style={{fontSize:9}}>{BI_TIPOS_GRAFICA.flatMap(c=>c.items).find(t=>t.id===g.tipo)?.label||g.tipo}</span>
                    <span style={{fontSize:10,color:"#9CA3AF"}}>|</span>
                    <span style={{fontSize:10,color:"#6B7280"}}>{BI_FUENTES[g.fuente]?.label||g.fuente}</span>
                    <button className="btn btn-ghost btn-sm" style={{color:"#EF4444",fontSize:11}} onClick={()=>setGraficas(prev=>prev.filter(x=>x.id!==g.id))}>✕</button>
                  </div>
                  <RenderGraficaBI g={g}/>
                  <div style={{fontSize:10,color:"#9CA3AF",marginTop:6}}>
                    Variable: {BI_FUENTES[g.fuente]?.variables.find(v=>v.key===g.varX)?.label||g.varX}
                    {g.varY!==g.varX&&` vs ${BI_FUENTES[g.fuente]?.variables.find(v=>v.key===g.varY)?.label||g.varY}`}
                  </div>
                </div>
              ))}
              <div style={{border:"2px dashed #E5E7EB",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",minHeight:200,background:"#F9FAFB",transition:"all .15s"}}
                onClick={()=>{setShowConstructor(true);setCPaso(1);}}
                onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E8611A";(e.currentTarget as HTMLDivElement).style.background="#FFF8F5";}}
                onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLDivElement).style.background="#F9FAFB";}}>
                <div style={{fontSize:30,color:"#9CA3AF"}}>📐</div>
                <div style={{fontSize:12,color:"#9CA3AF"}}>Nueva gráfica</div>
              </div>
            </div>
          )}
        </div>
      )}

      {biTab==="estadistica"&&<EstadisticaTab empleados={empleados}/>}

      {showConstructor&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:700,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.25)",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700}}>📐 Constructor de Gráficas</div>
                <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>
                  {cPaso===1?"Paso 1 — Elige el tipo de gráfica":cPaso===2?"Paso 2 — Define la fuente y variable de datos":"Paso 3 — Personaliza y agrega al dashboard"}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {[1,2,3].map(s=>(
                  <React.Fragment key={s}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:cPaso>=s?"#E8611A":"#E5E7EB",color:cPaso>=s?"#fff":"#9CA3AF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,transition:"all .2s"}}>{cPaso>s?"✓":s}</div>
                    {s<3&&<div style={{width:20,height:2,background:cPaso>s?"#E8611A":"#E5E7EB",transition:"all .2s"}}/>}
                  </React.Fragment>
                ))}
              </div>
              <div style={{cursor:"pointer",fontSize:18,color:"#6B7280",padding:"2px 8px",borderRadius:6}} onClick={()=>{setShowConstructor(false);setCPaso(1);setCCfg({color:"#E8611A"});}}>✕</div>
            </div>
            <div style={{padding:"18px 20px",flex:1,overflow:"auto"}}>
              {cPaso===1&&(
                <div>
                  {BI_TIPOS_GRAFICA.map(cat=>(
                    <div key={cat.cat} style={{marginBottom:18}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase" as const,letterSpacing:".6px",marginBottom:8,paddingBottom:5,borderBottom:"1px solid #F3F4F6"}}>{cat.cat}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                        {cat.items.map(t=>(
                          <div key={t.id} onClick={()=>setCCfg({...cCfg,tipo:t.id})}
                            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:`1.5px solid ${cCfg.tipo===t.id?"#E8611A":"#E5E7EB"}`,background:cCfg.tipo===t.id?"#FFF3ED":"#fff",cursor:"pointer",transition:"all .12s"}}
                            onMouseOver={e=>{if(cCfg.tipo!==t.id)(e.currentTarget as HTMLDivElement).style.borderColor="#F97316";}}
                            onMouseOut={e=>{if(cCfg.tipo!==t.id)(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";}}>
                            <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                            <div><div style={{fontSize:12,fontWeight:600,color:cCfg.tipo===t.id?"#E8611A":"#1B1F2E"}}>{t.label}</div><div style={{fontSize:10,color:"#6B7280",lineHeight:1.3}}>{t.desc}</div></div>
                            {cCfg.tipo===t.id&&<span style={{marginLeft:"auto",color:"#E8611A",fontSize:16,flexShrink:0}}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cPaso===2&&(
                <div>
                  {cCfg.tipo&&(()=>{const t=BI_TIPOS_GRAFICA.flatMap(c=>c.items).find(x=>x.id===cCfg.tipo);return(
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#FFF3ED",border:"1.5px solid #E8611A",borderRadius:9,marginBottom:16}}>
                      <span style={{fontSize:20}}>{t?.icon}</span>
                      <div><div style={{fontSize:13,fontWeight:700,color:"#E8611A"}}>{t?.label}</div><div style={{fontSize:11,color:"#6B7280"}}>{t?.desc}</div></div>
                      <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto",fontSize:10}} onClick={()=>setCPaso(1)}>Cambiar</button>
                    </div>
                  );})()}
                  <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:"#1B1F2E"}}>📁 Módulo fuente de datos</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                    {Object.entries(BI_FUENTES).map(([key,f])=>(
                      <div key={key} onClick={()=>setCCfg({...cCfg,fuente:key,varX:undefined as any,varY:undefined as any})}
                        style={{padding:"10px 12px",borderRadius:9,border:`1.5px solid ${cCfg.fuente===key?"#E8611A":"#E5E7EB"}`,background:cCfg.fuente===key?"#FFF3ED":"#fff",cursor:"pointer",textAlign:"center" as const,transition:"all .12s"}}>
                        <div style={{fontSize:16,marginBottom:4}}>{f.label.split(" ")[0]}</div>
                        <div style={{fontSize:12,fontWeight:cCfg.fuente===key?700:400,color:cCfg.fuente===key?"#E8611A":"#374151"}}>{f.label.slice(3)}</div>
                        <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{f.variables.length} variables</div>
                      </div>
                    ))}
                  </div>
                  {cCfg.fuente&&(()=>{
                    const fuente=BI_FUENTES[cCfg.fuente];
                    const necesitaY=["dispersion","burbuja","lineas_multi"].includes(cCfg.tipo||"");
                    return (
                      <div>
                        <div style={{display:"grid",gridTemplateColumns:necesitaY?"1fr 1fr":"1fr",gap:10,marginBottom:14}}>
                          <div className="form-group" style={{margin:0}}>
                            <label className="form-label">📊 Variable principal {necesitaY?"(Eje Y)":"(a graficar)"}</label>
                            <select className="form-control" value={cCfg.varX||""} onChange={e=>setCCfg({...cCfg,varX:e.target.value})}>
                              <option value="">— Seleccionar variable —</option>
                              {fuente.variables.map(v=><option key={v.key} value={v.key}>{v.label}</option>)}
                            </select>
                          </div>
                          {necesitaY&&(
                            <div className="form-group" style={{margin:0}}>
                              <label className="form-label">📊 Variable secundaria (Eje X)</label>
                              <select className="form-control" value={cCfg.varY||""} onChange={e=>setCCfg({...cCfg,varY:e.target.value})}>
                                <option value="">— Misma variable —</option>
                                {fuente.variables.map(v=><option key={v.key} value={v.key}>{v.label}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        {cCfg.varX&&(()=>{
                          const vd=fuente.variables.find(v=>v.key===cCfg.varX);
                          const datos=vd?.datos()||[];
                          return (
                            <div style={{background:"#F9FAFB",borderRadius:8,padding:"10px 12px"}}>
                              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:8}}>Vista previa — {fuente.etiquetas.length} registros de {fuente.label}</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
                                {datos.map((v,i)=>(
                                  <span key={i} style={{fontSize:11,padding:"3px 8px",background:"#fff",border:"1px solid #E5E7EB",borderRadius:5,color:"#374151"}}>
                                    <span style={{color:"#9CA3AF"}}>{(fuente.etiquetas[i]||"").split(" ")[0]}:</span> <b style={{color:cCfg.color||"#E8611A"}}>{v>=1000?`${Math.round(v/1000)}K`:v}</b>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              )}
              {cPaso===3&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Título de la gráfica</label>
                      <input className="form-control" placeholder="Ej: Distribución de salarios Q1" value={cCfg.titulo||""} onChange={e=>setCCfg({...cCfg,titulo:e.target.value})}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color principal</label>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap" as const,marginTop:4}}>
                        {COLS_GRAFICA.map(c=>(
                          <div key={c} onClick={()=>setCCfg({...cCfg,color:c})}
                            style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${cCfg.color===c?"#1B1F2E":"transparent"}`,transition:"all .12s",boxShadow:cCfg.color===c?"0 0 0 2px #fff,0 0 0 4px #1B1F2E":"none"}}/>
                        ))}
                      </div>
                    </div>
                    <div style={{background:"#F9FAFB",borderRadius:8,padding:"10px 12px",marginTop:4}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:6}}>Resumen</div>
                      {[
                        ["Tipo",BI_TIPOS_GRAFICA.flatMap(c=>c.items).find(t=>t.id===cCfg.tipo)?.label||cCfg.tipo||"—"],
                        ["Fuente",BI_FUENTES[cCfg.fuente||""]?.label||"—"],
                        ["Variable",BI_FUENTES[cCfg.fuente||""]?.variables.find(v=>v.key===cCfg.varX)?.label||"—"],
                      ].map(([l,v])=>(
                        <div key={l} className="res-row"><span className="res-label">{l}</span><span className="res-val" style={{fontSize:11,color:"#E8611A"}}>{v}</span></div>
                      ))}
                    </div>
                  </div>
                  <div style={{border:"1.5px solid #E5E7EB",borderRadius:9,padding:12,background:"#F9FAFB"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:8}}>Vista previa</div>
                    <RenderGraficaBI g={{id:0,tipo:cCfg.tipo||"barras",titulo:cCfg.titulo||"Preview",fuente:cCfg.fuente||"inventario",varX:cCfg.varX||"stock",varY:cCfg.varY||cCfg.varX||"stock",color:cCfg.color||"#E8611A"}}/>
                  </div>
                </div>
              )}
            </div>
            <div style={{padding:"12px 20px",borderTop:"1px solid #E5E7EB",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{fontSize:11,color:"#9CA3AF"}}>
                {cPaso===1?"Selecciona el tipo de visualización":cPaso===2?"Elige dónde tomar los datos":"Ajusta el aspecto y agrega al dashboard"}
              </div>
              <div style={{display:"flex",gap:8}}>
                {cPaso>1&&<button className="btn btn-ghost btn-sm" onClick={()=>setCPaso((cPaso-1) as 1|2|3)}>← Atrás</button>}
                <button className="btn btn-secondary btn-sm" onClick={()=>{setShowConstructor(false);setCPaso(1);setCCfg({color:"#E8611A"});}}>Cancelar</button>
                {cPaso<3?(
                  <button className="btn btn-primary btn-sm"
                    disabled={cPaso===1?!cCfg.tipo:!cCfg.fuente||!cCfg.varX}
                    style={{opacity:(cPaso===1?!cCfg.tipo:!cCfg.fuente||!cCfg.varX)?0.5:1}}
                    onClick={()=>setCPaso((cPaso+1) as 1|2|3)}>
                    Siguiente →
                  </button>
                ):(
                  <button className="btn btn-primary btn-sm"
                    onClick={()=>{
                      const t=BI_TIPOS_GRAFICA.flatMap(c=>c.items).find(x=>x.id===cCfg.tipo);
                      const nueva:GraficaConstructor={id:Date.now(),tipo:cCfg.tipo!,titulo:cCfg.titulo||t?.label||cCfg.tipo!,fuente:cCfg.fuente!,varX:cCfg.varX!,varY:cCfg.varY||cCfg.varX!,color:cCfg.color||"#E8611A"};
                      setGraficas(prev=>[...prev,nueva]);
                      setShowConstructor(false);setCPaso(1);setCCfg({color:"#E8611A"});
                      setBiTab("constructor");
                    }}>
                    ✅ Agregar al dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:480,maxHeight:"80vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700}}>Agregar Widget</div>
              <div style={{cursor:"pointer",fontSize:17,color:"#6B7280"}} onClick={()=>{setShowModal(false);setSelType(null);setWmStep(1);}}>✕</div>
            </div>
            {wmStep===1&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                  {WIDGET_CATS.map(cat=><React.Fragment key={cat.cat}>
                    <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".6px",color:"#6B7280",padding:"4px 0 2px",borderTop:"1px solid #F3F4F6",marginTop:4}}>{cat.cat}</div>
                    {cat.items.map(w=>(
                      <div key={w.type} onClick={()=>setSelType(w.type)}
                        style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 6px",borderRadius:8,border:`1.5px solid ${selType===w.type?"#E8611A":"#E5E7EB"}`,background:selType===w.type?"#FFF3ED":"#fff",cursor:"pointer",textAlign:"center" as const}}>
                        <div style={{fontSize:20}}>{w.icon}</div>
                        <div style={{fontSize:10,fontWeight:500,color:selType===w.type?"#E8611A":"#6B7280"}}>{w.label}</div>
                      </div>
                    ))}
                  </React.Fragment>)}
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                  <button className="btn btn-secondary" onClick={()=>{setShowModal(false);setSelType(null);}}>Cancelar</button>
                  <button className="btn btn-primary" disabled={!selType} onClick={()=>setWmStep(2)}>Siguiente →</button>
                </div>
              </>
            )}
            {wmStep===2&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#FFF3ED",border:"1.5px solid #E8611A",borderRadius:8,marginBottom:14}}>
                  <span style={{fontSize:20}}>{WIDGET_CATS.flatMap(c=>c.items).find(i=>i.type===selType)?.icon||"📊"}</span>
                  <div><div style={{fontSize:13,fontWeight:700,color:"#E8611A"}}>{WIDGET_CATS.flatMap(c=>c.items).find(i=>i.type===selType)?.label||selType}</div><div style={{fontSize:11,color:"#6B7280"}}>Widget seleccionado</div></div>
                </div>
                <div className="form-group">
                  <label className="form-label">TÍTULO DEL WIDGET</label>
                  <input className="form-control" placeholder="Ej: KPI de rotación mensual" value={wmTitle} onChange={e=>setWmTitle(e.target.value)} autoFocus/>
                </div>
                <div className="form-group">
                  <label className="form-label">MÓDULO</label>
                  <select className="form-control" value={wmModulo} onChange={e=>{setWmModulo(e.target.value);setWmMetrica(METRICAS_W[e.target.value]?.[0]||"");}}>
                    {MODULOS_W.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{color:"#185FA5",fontWeight:700}}>MÉTRICA / FUENTE DE DATOS</label>
                  <select className="form-control" style={{border:"2px solid #185FA5"}} value={wmMetrica} onChange={e=>setWmMetrica(e.target.value)}>
                    {(METRICAS_W[wmModulo]||[]).map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PERÍODO</label>
                  <select className="form-control" value={wmPeriodo} onChange={e=>setWmPeriodo(e.target.value)}>
                    {PERIODOS_W.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
                  <button className="btn btn-ghost" onClick={()=>setWmStep(1)}>← Atrás</button>
                  <button className="btn btn-secondary" onClick={()=>{setShowModal(false);setSelType(null);setWmStep(1);setWmTitle("");}}>Cancelar</button>
                  <button className="btn btn-primary" onClick={()=>{
                    const info=WIDGET_CATS.flatMap(c=>c.items).find(i=>i.type===selType);
                    setWidgets(prev=>[...prev,{id:Date.now(),type:selType!,title:wmTitle||info?.label||selType!,modulo:wmModulo,metrica:wmMetrica||wmModulo,periodo:wmPeriodo}]);
                    setShowModal(false);setSelType(null);setWmStep(1);setWmTitle("");setWmMetrica("");
                  }}>+ Agregar Widget</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
