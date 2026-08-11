import React, { useState } from "react";
import type { FiltrosBaseTalentoConfig, MiembroEquipoReclutamiento } from "../../../types";
import { FUENTES_POSTULACION } from "../../../data/reclutamiento";

const FILTRO_LABELS: Record<keyof FiltrosBaseTalentoConfig,string> = {
  busqueda: "Búsqueda por texto (nombre, CV, certificaciones)",
  provincia: "Filtro por provincia",
  licencia: "Licencia de conducir y categorías",
  experiencia: "Experiencia mínima (años)",
  disponibilidad: "Disponibilidad de ingreso",
  vehiculo: "Vehículo propio",
};

export function ConfigReclutamiento({filtrosConfig,setFiltrosConfig,equipo,setEquipo,fuentesHabilitadas,setFuentesHabilitadas,umbralCart,setUmbralCart}:{
  filtrosConfig:FiltrosBaseTalentoConfig;setFiltrosConfig:(f:FiltrosBaseTalentoConfig)=>void;
  equipo:MiembroEquipoReclutamiento[];setEquipo:(e:MiembroEquipoReclutamiento[])=>void;
  fuentesHabilitadas:string[];setFuentesHabilitadas:(f:string[])=>void;
  umbralCart:number;setUmbralCart:(n:number)=>void;
}) {
  const [subtab,setSubtab]=useState("filtros");
  const [nuevo,setNuevo]=useState({nombre:"",rol:"",correo:""});

  const toggleFiltro=(k:keyof FiltrosBaseTalentoConfig)=>setFiltrosConfig({...filtrosConfig,[k]:!filtrosConfig[k]});
  const toggleFuente=(f:string)=>setFuentesHabilitadas(fuentesHabilitadas.includes(f)?fuentesHabilitadas.filter(x=>x!==f):[...fuentesHabilitadas,f]);

  const agregarMiembro=()=>{
    if(!nuevo.nombre.trim()) return;
    setEquipo([...equipo,{id:`EQ-${Date.now()}`,...nuevo}]);
    setNuevo({nombre:"",rol:"",correo:""});
  };

  return (
    <div>
      <div className="tab-bar">
        {[["filtros","🔍 Filtros de Base de Talento"],["equipo","👥 Equipo Responsable"],["parametros","⚙️ Parámetros"]].map(([id,l])=>(
          <div key={id} className={`tab-btn ${subtab===id?"active":""}`} onClick={()=>setSubtab(id)}>{l}</div>
        ))}
      </div>

      {subtab==="filtros"&&(
        <div className="card">
          <div className="card-title">Filtros combinables disponibles en Base de Talento</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginBottom:12}}>Desactiva los filtros que no necesitas para simplificar la búsqueda de perfiles.</div>
          {(Object.keys(FILTRO_LABELS) as (keyof FiltrosBaseTalentoConfig)[]).map(k=>(
            <div key={k} className="toggle-row">
              <span>{FILTRO_LABELS[k]}</span>
              <div className={`toggle ${filtrosConfig[k]?"on":""}`} onClick={()=>toggleFiltro(k)}/>
            </div>
          ))}
        </div>
      )}

      {subtab==="equipo"&&(
        <div className="card">
          <div className="card-title">Equipo responsable de reclutamiento</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <input className="form-control" style={{flex:2}} placeholder="Nombre" value={nuevo.nombre} onChange={e=>setNuevo({...nuevo,nombre:e.target.value})}/>
            <input className="form-control" style={{flex:2}} placeholder="Rol (ej. Entrevistador Técnico)" value={nuevo.rol} onChange={e=>setNuevo({...nuevo,rol:e.target.value})}/>
            <input className="form-control" style={{flex:2}} placeholder="Correo" value={nuevo.correo} onChange={e=>setNuevo({...nuevo,correo:e.target.value})}/>
            <button className="btn btn-primary btn-sm" onClick={agregarMiembro}>➕ Agregar</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Nombre</th><th>Rol</th><th>Correo</th><th></th></tr></thead>
            <tbody>
              {equipo.map(m=>(
                <tr key={m.id}>
                  <td style={{fontSize:12,fontWeight:600}}>{m.nombre}</td>
                  <td style={{fontSize:12}}>{m.rol}</td>
                  <td style={{fontSize:11.5,color:"#6B7280"}}>{m.correo}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={()=>setEquipo(equipo.filter(x=>x.id!==m.id))}>✕</button></td>
                </tr>
              ))}
              {equipo.length===0&&<tr><td colSpan={4} style={{textAlign:"center" as const,color:"#9CA3AF",padding:16}}>Sin miembros agregados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {subtab==="parametros"&&(
        <div className="g2" style={{alignItems:"start"}}>
          <div className="card">
            <div className="card-title">Fuentes de postulación habilitadas</div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:4}}>
              {FUENTES_POSTULACION.map(f=>(
                <label key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,cursor:"pointer",padding:"4px 0"}}>
                  <input type="checkbox" checked={fuentesHabilitadas.includes(f)} onChange={()=>toggleFuente(f)}/>
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">Umbral mínimo CART</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11.5,color:"#6B7280"}}>Puntuación bajo la cual se marca alerta para revisar/descartar</span>
                <span style={{fontWeight:700,color:"#E8611A"}}>{umbralCart}/100</span>
              </div>
              <input type="range" min={0} max={100} value={umbralCart} onChange={e=>setUmbralCart(parseInt(e.target.value))} style={{width:"100%"}}/>
            </div>
            <div className="card">
              <div className="card-title">Etapas del Pipeline (referencia)</div>
              <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                {["Aplicación","Revisión CV","Entrevista RRHH","Prueba técnica","Entrevista técnica","Oferta","Contratado"].map((et,i)=>(
                  <span key={et} className="badge badge-info" style={{fontSize:10}}>{i+1}. {et}</span>
                ))}
              </div>
              <div style={{fontSize:10,color:"#9CA3AF",marginTop:8}}>El orden de etapas es fijo por diseño del ATS.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
