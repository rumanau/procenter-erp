import React, { useState } from "react";
import type { Empleado } from "../../types";
import { EXISTENCIAS } from "../../data/catalogos";

export function EstadisticaTab({empleados}:{empleados:Empleado[]}) {
  const [estMenu,setEstMenu]=useState("basicas");
  const [estSub,setEstSub]=useState("Estadísticos descriptivos");
  const [datosInput,setDatosInput]=useState("22,18,3,9,145,12,4,8");
  const [resultado,setResultado]=useState<any>(null);

  const MENU_EST=[
    {id:"basicas",label:"Estadísticas básicas",icon:"📊",items:["Estadísticos descriptivos","Almacenar descriptivos","Prueba t de 1 muestra","Prueba t de 2 muestras","Prueba t pareada","Proporción 1 muestra","Proporción 2 muestras","Varianza 1 muestra","Varianza 2 muestras","Correlación","Covarianza","Prueba de normalidad","Prueba de varianzas iguales"]},
    {id:"regresion",label:"Regresión",icon:"📈",items:["Regresión paso a paso","Ajustar modelo de regresión","Regresión PLS","Regresión logística binaria","Regresión logística ordinal","Regresión logística nominal","Regresión de Poisson","Regresión no lineal","Ajuste de respuesta","Optimización de respuesta"]},
    {id:"anova",label:"ANOVA",icon:"📉",items:["Un solo factor","Análisis de medias (ANOM)","ANOVA jerárquico","ANOVA balanceado","Modelo lineal general (GLM)","Comparaciones","Prueba de igualdad de varianzas"]},
    {id:"mixtos",label:"Modelos mixtos",icon:"🔀",items:["Ajustar modelo lineal mixto","Ajustar modelo lineal generalizado mixto"]},
    {id:"doe",label:"DOE",icon:"🧪",items:["Factorial (Crear, analizar, predecir)","Superficie de respuesta","Diseños de mezcla","Taguchi","Diseños aleatorios (Custom)"]},
    {id:"control",label:"Gráficos de control",icon:"🎯",items:["X̄-R y X̄-S (subgrupos)","I-MR y Z-MR (individuales)","Atributos (p, np, c, u)","EWMA y CUSUM (ponderados)","T² de Hotelling (multivariado)"]},
    {id:"calidad_h",label:"Herramientas calidad",icon:"✅",items:["Diagrama de Pareto","Diagrama Ishikawa","Análisis de capacidad (normal)","Análisis de capacidad (no normal)","Estudios de medición (Gage R&R)","Aceptación de muestreo","Tolerancia"]},
    {id:"fiabilidad",label:"Fiabilidad",icon:"🔒",items:["Distribución paramétrica","Weibull","Exponencial","Análisis de regresión (Cox)","Análisis de garantía"]},
    {id:"multivariante",label:"Multivariante",icon:"🕸️",items:["Componentes principales (PCA)","Análisis factorial","Análisis discriminante","Cluster","Análisis de correspondencia"]},
    {id:"series",label:"Series de tiempo",icon:"⏱️",items:["Gráfico de serie de tiempo","Descomposición","Suavizado exponencial","Tendencia","Media móvil","ARIMA"]},
    {id:"tablas",label:"Tablas",icon:"📋",items:["Estadísticas tabulares","Tabulación cruzada y Chi-cuadrado","Chi-cuadrado bondad de ajuste","Prueba de asociación"]},
    {id:"noparametricos",label:"No paramétricos",icon:"🔢",items:["Prueba de signos","Prueba de Wilcoxon","Mann-Whitney","Kruskal-Wallis","Prueba de Mood","Prueba de rachas"]},
    {id:"potencia",label:"Potencia & Muestra",icon:"⚡",items:["Potencia para prueba t","Potencia para ANOVA","Potencia para proporciones","Potencia para correlación","Potencia para varianzas","Potencia para Chi-cuadrado"]},
  ];

  const calcular=()=>{
    const nums=datosInput.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n));
    if(!nums.length){setResultado({error:"Ingresa datos numéricos separados por coma"});return;}
    const n=nums.length;const mean=nums.reduce((a,b)=>a+b,0)/n;
    const variance=nums.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)||0;const sd=Math.sqrt(variance);
    const sorted=[...nums].sort((a,b)=>a-b);
    const q1=sorted[Math.floor(n/4)];const q3=sorted[Math.floor(3*n/4)];
    const med=n%2===0?(sorted[n/2-1]+sorted[n/2])/2:sorted[Math.floor(n/2)];
    const tStat=mean/(sd/Math.sqrt(n));
    setResultado({n,mean:mean.toFixed(4),sd:sd.toFixed(4),variance:variance.toFixed(4),min:Math.min(...nums),max:Math.max(...nums),rango:Math.max(...nums)-Math.min(...nums),q1,med:med.toFixed(4),q3,iqr:(q3-q1).toFixed(4),cv:(sd/mean*100).toFixed(2),tStat:tStat.toFixed(4),skewness:(nums.reduce((a,b)=>a+Math.pow((b-mean)/sd,3),0)/n).toFixed(4),kurtosis:(nums.reduce((a,b)=>a+Math.pow((b-mean)/sd,4),0)/n-3).toFixed(4)});
  };

  const menuSel=MENU_EST.find(m=>m.id===estMenu)||MENU_EST[0];

  return (
    <div style={{display:"flex",gap:12,alignItems:"start"}}>
      <div style={{width:196,flexShrink:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"10px 12px",background:"linear-gradient(135deg,#1B1F2E,#185FA5)",color:"#fff",fontSize:12,fontWeight:700}}>📐 Estadísticas</div>
        {MENU_EST.map(m=>(
          <div key={m.id} onClick={()=>{setEstMenu(m.id);setEstSub(m.items[0]);setResultado(null);}}
            style={{padding:"7px 12px",cursor:"pointer",fontSize:11,fontWeight:estMenu===m.id?700:400,color:estMenu===m.id?"#E8611A":"#374151",background:estMenu===m.id?"#FFF3ED":"transparent",borderLeft:`3px solid ${estMenu===m.id?"#E8611A":"transparent"}`,display:"flex",alignItems:"center",gap:6}}
            onMouseOver={e=>{if(estMenu!==m.id)(e.currentTarget as HTMLDivElement).style.background="#F9FAFB";}}
            onMouseOut={e=>{if(estMenu!==m.id)(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
            <span>{m.icon}</span>{m.label}
          </div>
        ))}
      </div>

      <div style={{flex:1}}>
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:20}}>{menuSel.icon}</span>
            <div><div style={{fontSize:14,fontWeight:700}}>{menuSel.label}</div><div style={{fontSize:11,color:"#6B7280"}}>Selecciona el análisis</div></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
            {menuSel.items.map(item=>(
              <span key={item} onClick={()=>{setEstSub(item);setResultado(null);}}
                style={{fontSize:10.5,padding:"4px 10px",borderRadius:"9999px",cursor:"pointer",fontWeight:estSub===item?600:400,background:estSub===item?"#E8611A":"#F3F4F6",color:estSub===item?"#fff":"#374151"}}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📥 Datos — {estSub}</div>
            <div className="form-group" style={{marginBottom:8}}>
              <label className="form-label">Fuente</label>
              <select className="form-control" onChange={e=>{
                if(e.target.value==="inventario") setDatosInput(EXISTENCIAS.map(x=>x.stock).join(","));
                else if(e.target.value==="nomina") setDatosInput(empleados.filter(x=>x.estado==="activo").map(x=>x.salario).join(","));
                else if(e.target.value==="asistencia") setDatosInput("98,95,88,100,92,97,90,99");
                else if(e.target.value==="calidad") setDatosInput("100,95,90,87,92,88,85");
              }}>
                <option value="">— Manual —</option>
                <option value="inventario">📦 Stock inventario</option>
                <option value="nomina">💰 Salarios nómina</option>
                <option value="asistencia">🕐 % Asistencia</option>
                <option value="calidad">✅ Cumplimiento ISO</option>
              </select>
            </div>
            <div className="form-group" style={{marginBottom:8}}>
              <label className="form-label">Datos (separados por coma)</label>
              <textarea className="form-control" rows={3} value={datosInput} onChange={e=>setDatosInput(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-sm" style={{width:"100%"}} onClick={calcular}>▶ Ejecutar {estSub}</button>
          </div>

          <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📊 Resultados</div>
            {!resultado&&<div style={{textAlign:"center",padding:"16px",color:"#9CA3AF",fontSize:11.5}}>Ingresa datos y ejecuta el análisis</div>}
            {resultado?.error&&<div style={{color:"#EF4444",fontSize:11.5,padding:8}}>{resultado.error}</div>}
            {resultado&&!resultado.error&&(
              <div className="resumen" style={{maxHeight:200,overflowY:"auto" as const}}>
                {[["N",resultado.n],["Media (X̄)",resultado.mean],["Desv. estándar",resultado.sd],["Varianza",resultado.variance],["Mínimo",resultado.min],["Máximo",resultado.max],["Rango",resultado.rango],["Q1",resultado.q1],["Mediana",resultado.med],["Q3",resultado.q3],["IQR",resultado.iqr],["CV",`${resultado.cv}%`],["Estadístico t",resultado.tStat],["Asimetría",resultado.skewness],["Curtosis",resultado.kurtosis]].map(([l,v])=>(
                  <div key={l} className="res-row"><span className="res-label" style={{fontSize:10}}>{l}</span><span className="res-val" style={{color:"#E8611A",fontSize:10.5,fontFamily:"monospace"}}>{v}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {resultado&&!resultado.error&&(()=>{
          const nums=datosInput.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n));
          const mn=Math.min(...nums);const mx=Math.max(...nums)||1;const W2=360,H2=110;
          const mean2=parseFloat(resultado.mean);const sd2=parseFloat(resultado.sd)||1;
          const bins=5;const step2=(mx-mn)/bins||1;const counts=Array(bins).fill(0);
          nums.forEach(v=>{const b=Math.min(Math.floor((v-mn)/step2),bins-1);counts[b]++;});
          const mC=Math.max(...counts,1);const bw=Math.floor((W2-28)/bins);
          return (
            <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📈 Visualización</div>
              <svg viewBox={`0 0 ${W2} ${H2}`} style={{width:"100%",height:H2}}>
                <line x1="18" y1="10" x2="18" y2={H2-18} stroke="#E5E7EB" strokeWidth="1"/>
                <line x1="18" y1={H2-18} x2={W2-5} y2={H2-18} stroke="#E5E7EB" strokeWidth="1"/>
                {counts.map((c,i)=>{const x=18+i*bw+1;const bh=Math.max(2,Math.round((c/mC)*(H2-28)));const y=H2-18-bh;return<g key={i}><rect x={x} y={y} width={bw-2} height={bh} fill="#E8611A" rx="1" opacity=".8"/><text x={x+bw/2} y={H2-6} textAnchor="middle" fontSize="7" fill="#6B7280">{Math.round(mn+i*step2)}</text>{c>0&&<text x={x+bw/2} y={y-2} textAnchor="middle" fontSize="7" fill="#E8611A" fontWeight="bold">{c}</text>}</g>;})}
                {(()=>{const pts2=Array.from({length:50},(_,i2)=>{const x2=mn+i2*(mx-mn)/49;const y2=Math.exp(-0.5*((x2-mean2)/sd2)**2);return{x2,y2};});const maxY2=pts2.reduce((a,b)=>Math.max(a,b.y2),0)||1;const svgP=pts2.map(p=>`${18+Math.round((p.x2-mn)/(mx-mn+0.001)*(W2-28))},${H2-18-Math.round((p.y2/maxY2)*(H2-28))}`).join(" ");return<polyline points={svgP} fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity=".7"/>;})()}
              </svg>
              <div style={{fontSize:9,color:"#6B7280",textAlign:"center"}}>Histograma <span style={{color:"#3B82F6"}}>— Curva Normal</span></div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
