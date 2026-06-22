import React from "react";
import { STEPS } from "../data/catalogos";

export function Stepper({step,setStep}:{step:number;setStep:(s:number)=>void}) {
  return (
    <div className="stepper">
      {STEPS.map((label,i)=>{
        const n=i+1;const st=n<step?"done":n===step?"active":"pending";
        return <React.Fragment key={n}>
          <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>setStep(n)}>
            <div className={`step-circle ${st}`}>{st==="done"?"✓":n}</div>
            <div className={`step-label ${st}`}>{label}</div>
          </div>
          {i<STEPS.length-1&&<div className={`step-arrow ${n<step?"done":""}`}/>}
        </React.Fragment>;
      })}
    </div>
  );
}

export function RightPanel() {
  return (
    <div className="right-panel">
      <div className="panel-title">Alertas</div>
      <div className="alert-item">
        <div className="alert-icon" style={{background:"#FFFBEB"}}>⚠️</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Bajo Stock</div><div style={{fontSize:10.5,color:"#6B7280"}}>2 artículos críticos</div></div>
        <span style={{background:"#E8611A",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:"9999px"}}>2</span>
      </div>
      <div className="alert-item">
        <div className="alert-icon" style={{background:"#FEF2F2"}}>📋</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Solicitudes</div><div style={{fontSize:10.5,color:"#6B7280"}}>10 pendientes</div></div>
        <span style={{background:"#E8611A",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:"9999px"}}>10</span>
      </div>
      <div style={{height:14}}/>
      <div className="panel-title">Últimos Movimientos</div>
      {[["📥","TechnoSupply · Taladro","+20 pzas · Bodega 3"],["📤","Escalera Tijera","-2 pzas · Producción"],["⚖️","Ajuste Inventario","Escalera · +1 ud"]].map(([ic,n,s])=>(
        <div key={n} className="mini-reg"><span style={{fontSize:18}}>{ic}</span><div><div style={{fontSize:11,fontWeight:600}}>{n}</div><div style={{fontSize:10,color:"#6B7280"}}>{s}</div></div></div>
      ))}
      <div style={{height:14}}/>
      <div className="panel-title">Clasificación ABC</div>
      {[["A – Crítico","#EF4444",48],["B – Importante","#F59E0B",31],["C – Regular","#10B981",21]].map(([l,c,p])=>(
        <div key={l as string} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:c as string,fontWeight:600}}>{l}</span><span>{p}%</span></div>
          <div style={{background:"#E5E7EB",borderRadius:3,height:6}}><div style={{width:`${p}%`,background:c as string,height:"100%",borderRadius:3}}/></div>
        </div>
      ))}
    </div>
  );
}
