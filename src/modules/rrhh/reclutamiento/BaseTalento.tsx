import React, { useMemo, useState } from "react";
import type { PerfilTalento, Vacante, FiltrosBaseTalentoConfig } from "../../../types";
import { PROVINCIAS_CR, CATEGORIAS_LICENCIA } from "../../../data/reclutamiento";

const DISPONIBILIDADES = ["Inmediata", "1-3 meses", "3+ meses"];

function compatibilidad(p:PerfilTalento, v:Vacante|undefined):number|null {
  if(!v) return null;
  let score=0, total=0;
  total+=30; score+=Math.min(30, (p.experienciaAnios/(v.experienciaMin||1))*30);
  const rangoEdu=["Sin título","Técnico","Universitario","Posgrado"];
  total+=25; if(rangoEdu.indexOf(p.educacion)>=rangoEdu.indexOf(v.educacionMin)) score+=25;
  total+=20; if(v.idiomas==="No requerido"||p.idiomas.some(i=>v.idiomas.toLowerCase().includes(i.toLowerCase().split(" ")[0]))) score+=20;
  total+=15; if(p.disponibilidadIngreso==="Inmediata") score+=15; else if(p.disponibilidadIngreso==="1-3 meses") score+=8;
  total+=10; if(p.estado==="disponible") score+=10;
  return Math.round((score/total)*100);
}

const FILTROS_DEFAULT:FiltrosBaseTalentoConfig={busqueda:true,provincia:true,licencia:true,experiencia:true,disponibilidad:true,vehiculo:true};

export function BaseTalento({perfiles,vacantes,onInvitar,filtrosConfig=FILTROS_DEFAULT}:{
  perfiles:PerfilTalento[];vacantes:Vacante[];onInvitar:(perfilIds:string[],vacanteId:string)=>void;filtrosConfig?:FiltrosBaseTalentoConfig;
}) {
  const [texto,setTexto]=useState("");
  const [provincia,setProvincia]=useState("todas");
  const [licenciaFiltro,setLicenciaFiltro]=useState<"cualquiera"|"si"|"no">("cualquiera");
  const [categorias,setCategorias]=useState<string[]>([]);
  const [expMin,setExpMin]=useState(0);
  const [disponibilidad,setDisponibilidad]=useState("cualquiera");
  const [vehiculo,setVehiculo]=useState<"cualquiera"|"si"|"no">("cualquiera");
  const [vacanteCtx,setVacanteCtx]=useState("");
  const [seleccion,setSeleccion]=useState<string[]>([]);

  const toggleCategoria=(id:string)=>setCategorias(prev=>prev.includes(id)?prev.filter(c=>c!==id):[...prev,id]);
  const toggleSeleccion=(id:string)=>setSeleccion(prev=>prev.includes(id)?prev.filter(s=>s!==id):[...prev,id]);

  const vacanteSel=vacantes.find(v=>v.id===vacanteCtx);

  const filtrados=useMemo(()=>{
    const q=texto.trim().toLowerCase();
    return perfiles.filter(p=>{
      if(filtrosConfig.busqueda&&q&&!(p.nombre.toLowerCase().includes(q)||p.profesion.toLowerCase().includes(q)||p.competencias.join(" ").toLowerCase().includes(q)||p.cvResumen.toLowerCase().includes(q)||p.certificaciones.join(" ").toLowerCase().includes(q))) return false;
      if(filtrosConfig.provincia&&provincia!=="todas"&&p.provincia!==provincia) return false;
      if(filtrosConfig.licencia&&licenciaFiltro==="si"&&!p.licencia.tiene) return false;
      if(filtrosConfig.licencia&&licenciaFiltro==="no"&&p.licencia.tiene) return false;
      if(filtrosConfig.licencia&&categorias.length>0&&!categorias.some(c=>p.licencia.categorias.includes(c))) return false;
      if(filtrosConfig.experiencia&&p.experienciaAnios<expMin) return false;
      if(filtrosConfig.disponibilidad&&disponibilidad!=="cualquiera"&&p.disponibilidadIngreso!==disponibilidad) return false;
      if(filtrosConfig.vehiculo&&vehiculo==="si"&&p.vehiculoPropio==="No") return false;
      if(filtrosConfig.vehiculo&&vehiculo==="no"&&p.vehiculoPropio!=="No") return false;
      return true;
    }).map(p=>({perfil:p,compat:compatibilidad(p,vacanteSel)}))
      .sort((a,b)=>(b.compat??0)-(a.compat??0));
  },[perfiles,texto,provincia,licenciaFiltro,categorias,expMin,disponibilidad,vehiculo,vacanteSel,filtrosConfig]);

  const invitar=()=>{
    if(seleccion.length===0||!vacanteCtx) return;
    onInvitar(seleccion,vacanteCtx);
    setSeleccion([]);
  };

  return (
    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
      <div style={{width:260,flexShrink:0}}>
        <div className="card">
          <div className="card-title">🔍 Filtros combinables</div>
          {filtrosConfig.busqueda&&(
          <div className="form-group">
            <label className="form-label">Búsqueda (nombre, puesto, CV, certificaciones)</label>
            <input className="form-control" placeholder="Ej. ISO 9001, soldadura..." value={texto} onChange={e=>setTexto(e.target.value)}/>
          </div>
          )}
          {filtrosConfig.provincia&&(
          <div className="form-group">
            <label className="form-label">Provincia</label>
            <select className="form-control" value={provincia} onChange={e=>setProvincia(e.target.value)}>
              <option value="todas">Todas</option>
              {PROVINCIAS_CR.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          )}
          {filtrosConfig.licencia&&(<>
          <div className="form-group">
            <label className="form-label">Licencia de conducir</label>
            <div className="pills-row">
              {[["cualquiera","Cualquiera"],["si","Sí"],["no","No"]].map(([v,l])=>(
                <div key={v} className={`pill ${licenciaFiltro===v?"sel":""}`} onClick={()=>setLicenciaFiltro(v as any)}>{l}</div>
              ))}
            </div>
          </div>
          {licenciaFiltro==="si"&&(
            <div className="form-group">
              <label className="form-label">Categorías</label>
              <div style={{display:"flex",flexDirection:"column" as const,gap:4}}>
                {CATEGORIAS_LICENCIA.map(c=>(
                  <label key={c.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,cursor:"pointer"}}>
                    <input type="checkbox" checked={categorias.includes(c.id)} onChange={()=>toggleCategoria(c.id)}/>
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          </>)}
          {filtrosConfig.experiencia&&(
          <div className="form-group">
            <label className="form-label">Experiencia mínima: {expMin} años</label>
            <input type="range" min={0} max={10} value={expMin} onChange={e=>setExpMin(parseInt(e.target.value))} style={{width:"100%"}}/>
          </div>
          )}
          {filtrosConfig.disponibilidad&&(
          <div className="form-group">
            <label className="form-label">Disponibilidad de ingreso</label>
            <select className="form-control" value={disponibilidad} onChange={e=>setDisponibilidad(e.target.value)}>
              <option value="cualquiera">Cualquiera</option>
              {DISPONIBILIDADES.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          )}
          {filtrosConfig.vehiculo&&(
          <div className="form-group">
            <label className="form-label">Vehículo propio</label>
            <div className="pills-row">
              {[["cualquiera","Cualquiera"],["si","Sí"],["no","No"]].map(([v,l])=>(
                <div key={v} className={`pill ${vehiculo===v?"sel":""}`} onClick={()=>setVehiculo(v as any)}>{l}</div>
              ))}
            </div>
          </div>
          )}
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Vacante de referencia (compatibilidad %)</label>
            <select className="form-control" value={vacanteCtx} onChange={e=>setVacanteCtx(e.target.value)}>
              <option value="">— Sin vacante —</option>
              {vacantes.map(v=><option key={v.id} value={v.id}>{v.puesto} ({v.id})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700}}>Resultado: {filtrados.length} perfiles</div>
          {seleccion.length>0&&(
            <button className="btn btn-primary btn-sm" disabled={!vacanteCtx} title={!vacanteCtx?"Selecciona una vacante de referencia primero":""} onClick={invitar}>
              📬 Invitar {seleccion.length} a {vacanteSel?.id||"vacante"}
            </button>
          )}
        </div>
        {filtrados.length===0&&<div className="card" style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:24}}>Sin resultados para estos filtros.</div>}
        {filtrados.map(({perfil:p,compat})=>(
          <div key={p.id} className="card" style={{marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
            <input type="checkbox" checked={seleccion.includes(p.id)} onChange={()=>toggleSeleccion(p.id)}/>
            <div className="user-avatar" style={{width:36,height:36,fontSize:12,background:p.estado==="disponible"?"#10B981":"#9CA3AF"}}>{p.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,fontWeight:700}}>{p.nombre}</span>
                <span style={{fontSize:10.5,color:"#9CA3AF"}}>{p.id}</span>
                <span className={`badge ${p.estado==="disponible"?"badge-ok":p.estado==="en proceso"?"badge-info":p.estado==="contratado"?"badge-purple":"badge-gray"}`}>{p.estado}</span>
              </div>
              <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{p.profesion} · {p.experienciaAnios} años exp. · {p.provincia}, {p.canton}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginTop:5}}>
                {p.licencia.tiene&&<span className="badge badge-info" style={{fontSize:9.5}}>🪪 Lic. {p.licencia.categorias.join("/")}</span>}
                {p.vehiculoPropio!=="No"&&<span className="badge badge-gray" style={{fontSize:9.5}}>🚗 {p.vehiculoPropio}</span>}
                <span className="badge badge-gray" style={{fontSize:9.5}}>⏱ {p.disponibilidadIngreso}</span>
                <span className="badge badge-gray" style={{fontSize:9.5}}>📡 {p.fuente}</span>
                {p.competencias.slice(0,3).map(c=><span key={c} className="badge badge-orange" style={{fontSize:9.5}}>{c}</span>)}
              </div>
            </div>
            {compat!==null&&(
              <div style={{textAlign:"center" as const,width:56}}>
                <div style={{fontSize:18,fontWeight:800,color:compat>=80?"#10B981":compat>=60?"#F59E0B":"#EF4444"}}>{compat}%</div>
                <div style={{fontSize:9,color:"#9CA3AF"}}>compat.</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
