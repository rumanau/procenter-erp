import React from "react";
import type { Candidato, OfertaLaboral, Postulacion, TimelineEvento, Vacante } from "../../../types";

const ETAPAS = ["Aplicación","Revisión CV","Entrevista RRHH","Prueba técnica","Entrevista técnica","Oferta","Contratado"];

const MESES: Record<string,number> = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
function parseFecha(s:string): Date|null {
  const m=s.match(/(\d{1,2})\s+([A-Za-zÁ-ú]{3,})\.?\s+(\d{4})/);
  if(!m) return null;
  const mes=MESES[m[2].slice(0,3).toLowerCase()];
  if(mes===undefined) return null;
  return new Date(parseInt(m[3]),mes,parseInt(m[1]));
}

export function AnaliticaReclutamiento({candidatos,vacantes,ofertas,postulaciones,timeline}:{
  candidatos:Candidato[];vacantes:Vacante[];ofertas:OfertaLaboral[];postulaciones:Postulacion[];timeline:TimelineEvento[];
}) {
  const etapaIndex=(et:string)=>{const i=ETAPAS.indexOf(et); return i<0?0:i;};
  const funnel=ETAPAS.map((et,i)=>({etapa:et,count:candidatos.filter(c=>etapaIndex(c.etapa)>=i).length}));
  const maxFunnel=Math.max(...funnel.map(f=>f.count),1);

  const fuentes=Array.from(new Set(postulaciones.map(p=>p.fuente)));
  const porFuente=fuentes.map(f=>({fuente:f,count:postulaciones.filter(p=>p.fuente===f).length})).sort((a,b)=>b.count-a.count);
  const maxFuente=Math.max(...porFuente.map(f=>f.count),1);

  const integrados=candidatos.filter(c=>c.estado==="Integrado");
  const tiemposContratacion=integrados.map(c=>{
    const eventos=timeline.filter(t=>t.candidatoId===c.id);
    const aplicacion=eventos.find(e=>e.descripcion.includes("Aplicación recibida"));
    const integrado=eventos.find(e=>e.descripcion.includes("Integrado al sistema"));
    if(!aplicacion||!integrado) return null;
    const d1=parseFecha(aplicacion.fecha), d2=parseFecha(integrado.fecha);
    if(!d1||!d2) return null;
    return Math.max(0,Math.round((d2.getTime()-d1.getTime())/86400000));
  }).filter((n):n is number=>n!==null);
  const timeToHire=tiemposContratacion.length>0?Math.round(tiemposContratacion.reduce((a,b)=>a+b,0)/tiemposContratacion.length):null;

  const ofertasResueltas=ofertas.filter(o=>o.estado==="Aceptada"||o.estado==="Rechazada"||o.estado==="Vencida");
  const ofertasAceptadas=ofertas.filter(o=>o.estado==="Aceptada");
  const tasaAceptacion=ofertasResueltas.length>0?Math.round((ofertasAceptadas.length/ofertasResueltas.length)*100):null;

  const totalPostulaciones=postulaciones.length;
  const conversion=totalPostulaciones>0?((integrados.length/totalPostulaciones)*100).toFixed(1):"0.0";

  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;
  const salarioPromedioOfertado=ofertas.length>0?Math.round(ofertas.reduce((a,o)=>a+o.salario,0)/ofertas.length):0;

  return (
    <div>
      <div className="g4" style={{marginBottom:14}}>
        <div className="kpi"><div className="kpi-label">Time to Hire</div><div className="kpi-value" style={{fontSize:18}}>{timeToHire!==null?`${timeToHire} días`:"N/D"}</div><div style={{fontSize:10.5,color:"#6B7280"}}>Aplicación → Contratado</div></div>
        <div className="kpi"><div className="kpi-label">Tasa de aceptación de ofertas</div><div className="kpi-value" style={{fontSize:18,color:tasaAceptacion!==null&&tasaAceptacion>=70?"#10B981":"#F59E0B"}}>{tasaAceptacion!==null?`${tasaAceptacion}%`:"N/D"}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{ofertasResueltas.length} ofertas resueltas</div></div>
        <div className="kpi"><div className="kpi-label">Conversión postulación→contratación</div><div className="kpi-value" style={{fontSize:18}}>{conversion}%</div><div style={{fontSize:10.5,color:"#6B7280"}}>{totalPostulaciones} postulaciones totales</div></div>
        <div className="kpi"><div className="kpi-label">Salario promedio ofertado</div><div className="kpi-value" style={{fontSize:16,color:"#7C3AED"}}>{ofertas.length>0?fmt(salarioPromedioOfertado):"N/D"}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{ofertas.length} ofertas generadas</div></div>
      </div>

      <div className="g2" style={{alignItems:"start"}}>
        <div className="card">
          <div className="card-title">📉 Embudo de conversión</div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {funnel.map(f=>(
              <div key={f.etapa}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                  <span style={{color:"#374151"}}>{f.etapa}</span>
                  <span style={{fontWeight:700,color:"#1B1F2E"}}>{f.count}</span>
                </div>
                <div className="stock-bar" style={{height:10}}>
                  <div className="stock-bar-fill" style={{width:`${(f.count/maxFunnel)*100}%`,background:"#E8611A"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">📡 Fuente de postulación</div>
          {porFuente.length===0&&<div style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:16}}>Sin postulaciones registradas.</div>}
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {porFuente.map(f=>(
              <div key={f.fuente}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}>
                  <span style={{color:"#374151"}}>{f.fuente}</span>
                  <span style={{fontWeight:700,color:"#1B1F2E"}}>{f.count}</span>
                </div>
                <div className="stock-bar" style={{height:10}}>
                  <div className="stock-bar-fill" style={{width:`${(f.count/maxFuente)*100}%`,background:"#3B82F6"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="card-title">📋 Vacantes por rendimiento</div>
        <table className="tbl">
          <thead><tr><th>Vacante</th><th>Departamento</th><th>Candidatos</th><th>En etapas avanzadas</th><th>Estado</th></tr></thead>
          <tbody>
            {vacantes.map(v=>{
              const cs=candidatos.filter(c=>c.vacante===v.id);
              const avanzados=cs.filter(c=>etapaIndex(c.etapa)>=etapaIndex("Entrevista técnica")).length;
              return (
                <tr key={v.id}>
                  <td style={{fontSize:12,fontWeight:600}}>{v.puesto}</td>
                  <td style={{fontSize:12}}>{v.departamento}</td>
                  <td style={{fontSize:12}}>{cs.length}</td>
                  <td style={{fontSize:12,color:avanzados>0?"#10B981":"#9CA3AF"}}>{avanzados}</td>
                  <td><span className={`badge ${v.estado==="Activa"?"badge-ok":v.estado==="Borrador"?"badge-gray":v.estado==="Pausada"?"badge-warn":"badge-crit"}`}>{v.estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
