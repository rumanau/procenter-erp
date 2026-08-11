import React, { useState } from "react";
import type { View, Empleado, Vacante, Requisicion, Candidato, Entrevista, Evaluacion, Documento, TimelineEvento } from "../../types";
import { CATALOGOS_INIT } from "../../data/catalogos";
import { VACANTES_INIT, REQUISICIONES_INIT, PERFILES_TALENTO_INIT, POSTULACIONES_INIT, PERFILES_CART_INIT, CANDIDATOS_INIT, ENTREVISTAS_INIT, EVALUACIONES_INIT, DOCUMENTOS_INIT, TIMELINE_INIT, OFERTAS_INIT, EQUIPO_RECLUTAMIENTO_INIT, FILTROS_TALENTO_INIT, FUENTES_POSTULACION } from "../../data/reclutamiento";
import { Requisiciones } from "./reclutamiento/Requisiciones";
import { BaseTalento } from "./reclutamiento/BaseTalento";
import { VacanteModal } from "./reclutamiento/VacanteModal";
import { CandidatoExpediente } from "./reclutamiento/CandidatoExpediente";
import { Entrevistas } from "./reclutamiento/Entrevistas";
import { MoverEtapaModal } from "./reclutamiento/MoverEtapaModal";
import { ArbolCartViz } from "./reclutamiento/ArbolCartViz";
import { Ofertas } from "./reclutamiento/Ofertas";
import { ReclutamientoHome } from "./reclutamiento/ReclutamientoHome";
import { ConfigReclutamiento } from "./reclutamiento/ConfigReclutamiento";
import { AnaliticaReclutamiento } from "./reclutamiento/AnaliticaReclutamiento";
import type { ArbolCartNodo, OfertaLaboral, FiltrosBaseTalentoConfig, MiembroEquipoReclutamiento } from "../../types";

export function CartTab({setTab,arbolNodos}:{setTab:(t:string)=>void;arbolNodos:Record<string,ArbolCartNodo>}) {
  const [exp,setExp]=useState(2);
  const [tecnica,setTecnica]=useState(60);
  const [idioma,setIdioma]=useState("No");
  const [edu,setEdu]=useState("Técnico");
  const [disp,setDisp]=useState("Inmediata");
  const [resultado,setResultado]=useState<{clase:string;prob:number;segment:string;desc:string}|null>(null);

  const evaluar=()=>{
    let score=0;
    score+=exp>=2?30:10;
    score+=(tecnica/100)*25;
    score+=idioma==="Intermedio"||idioma==="Avanzado"?20:5;
    const eduscore=edu==="Posgrado"?25:edu==="Universitario"?20:edu==="Técnico"?10:0;
    score+=eduscore;
    score+=disp==="Inmediata"?25:disp==="1-3 meses"?15:5;

    let clase="NO APTO",prob=0,segment="Perfil no compatible";
    if(score>=80){clase="✅ APTO — CONTRATAR";prob=94;segment="Perfil ideal";}
    else if(score>=65){clase="🔄 POTENCIAL — SEGUNDA ENTREVISTA";prob=68;segment="Perfil competente";}
    else if(score>=45){clase="⏸ EN ESPERA — Revisar";prob=45;segment="Perfil marginal";}
    else{clase="✗ NO APTO — Descartar";prob=18;segment="Perfil no compatible";}

    const cumple:string[]=[],falta:string[]=[];
    (exp>=2?cumple:falta).push(`experiencia (${exp} años, mínimo 2)`);
    (tecnica>=60?cumple:falta).push(`score técnico (${tecnica}/100, mínimo 60)`);
    (idioma==="Intermedio"||idioma==="Avanzado"?cumple:falta).push(`idioma (${idioma})`);
    (edu==="Universitario"||edu==="Posgrado"?cumple:falta).push(`educación (${edu})`);
    (disp==="Inmediata"?cumple:falta).push(`disponibilidad (${disp})`);
    const desc=falta.length===0
      ? `Cumple todos los criterios evaluados: ${cumple.join(", ")}.`
      : `Criterios que suman: ${cumple.length?cumple.join(", "):"ninguno"}. Criterios débiles: ${falta.join(", ")}.`;

    setResultado({clase,prob,segment,desc});
  };

  return (
    <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
      <div className="card">
        <div className="card-title" style={{marginBottom:16}}>🌳 Árbol CART — mismo árbol configurado en Constructor</div>
        <div style={{overflowX:"auto",paddingBottom:12,background:"#F8FAFC",borderRadius:8,border:"1px solid #E5E7EB",padding:16}}>
          <ArbolCartViz nodos={arbolNodos} width={900} height={340}/>
        </div>
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E5E7EB",fontSize:10,color:"#6B7280",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>🔗 Este árbol se edita en la pestaña <b>Constructor</b> — los cambios se reflejan aquí automáticamente.</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>setTab("constructor")}>🛠️ Editar árbol</button>
        </div>
      </div>

      {/* Evaluador con sliders */}
      <div className="g2">
        <div className="card">
          <div className="card-title">📊 Evaluador candidato</div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
            {/* Experiencia en años */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <label className="form-label" style={{margin:0}}>Años de experiencia</label>
                <span style={{fontWeight:700,color:"#E8611A",fontSize:13}}>{exp} años</span>
              </div>
              <input type="range" min="0" max="10" value={exp} onChange={e=>setExp(parseInt(e.target.value))} style={{width:"100%"}}/>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:3}}>0 = No tiene, 5+ = Experiencia sólida</div>
            </div>

            {/* Score técnico */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <label className="form-label" style={{margin:0}}>Score prueba técnica (0-100)</label>
                <span style={{fontWeight:700,color:tecnica>=80?"#10B981":tecnica>=60?"#F59E0B":"#EF4444",fontSize:13}}>{tecnica}</span>
              </div>
              <input type="range" min="0" max="100" value={tecnica} onChange={e=>setTecnica(parseInt(e.target.value))} style={{width:"100%"}}/>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:3}}>Evaluación técnica requerida</div>
            </div>

            {/* Idioma */}
            <div>
              <label className="form-label">Idioma requerido</label>
              <select className="form-control" value={idioma} onChange={e=>setIdioma(e.target.value)}>
                <option value="No">No</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            {/* Educación */}
            <div>
              <label className="form-label">Nivel educativo</label>
              <select className="form-control" value={edu} onChange={e=>setEdu(e.target.value)}>
                <option value="Sin título">Sin título</option>
                <option value="Técnico">Técnico</option>
                <option value="Universitario">Universitario</option>
                <option value="Posgrado">Posgrado</option>
              </select>
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="form-label">Disponibilidad</label>
              <select className="form-control" value={disp} onChange={e=>setDisp(e.target.value)}>
                <option value="3+ meses">3+ meses</option>
                <option value="1-3 meses">1-3 meses</option>
                <option value="Inmediata">Inmediata</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:16}} onClick={evaluar}>🔍 Ejecutar clasificación CART</button>
        </div>

        {/* Resultado mejorado */}
        {resultado&&(
          <div className="card" style={{display:"flex",flexDirection:"column" as const}}>
            <div className="card-title">📈 Resultado CART</div>
            <div style={{background:resultado.prob>=80?"#ECFDF5":resultado.prob>=65?"#EFF6FF":resultado.prob>=45?"#FFFBEB":"#FEF2F2",border:`2px solid ${resultado.prob>=80?"#6EE7B7":resultado.prob>=65?"#BFDBFE":resultado.prob>=45?"#FDE68A":"#FCA5A5"}`,borderRadius:10,padding:14,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:resultado.prob>=80?"#065F46":resultado.prob>=65?"#1D4ED8":resultado.prob>=45?"#92400E":"#991B1B",marginBottom:6}}>{resultado.clase}</div>
              <div style={{fontSize:11,color:"#6B7280",marginBottom:8}}>{resultado.desc}</div>
              <div style={{fontSize:24,fontWeight:700,color:resultado.prob>=80?"#10B981":resultado.prob>=65?"#3B82F6":resultado.prob>=45?"#F59E0B":"#EF4444"}}>
                {resultado.prob}%
              </div>
              <div style={{fontSize:10,color:"#6B7280",marginTop:6}}>Probabilidad de éxito</div>
            </div>

            <div style={{background:"#F9FAFB",borderRadius:8,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:"#6B7280",marginBottom:6}}>Segmento: <span style={{color:"#1B1F2E",fontWeight:700}}>{resultado.segment}</span></div>
              <div style={{fontSize:11,color:"#374151",lineHeight:1.6}}>
                <div>• <b>Experiencia:</b> {exp} años</div>
                <div>• <b>Score técnico:</b> {tecnica}/100</div>
                <div>• <b>Idioma:</b> {idioma}</div>
                <div>• <b>Educación:</b> {edu}</div>
                <div>• <b>Disponibilidad:</b> {disp}</div>
              </div>
            </div>

            <div style={{fontSize:10,color:"#6B7280",borderTop:"1px solid #E5E7EB",paddingTop:10}}>
              💡 <b>Interpretabilidad CART:</b> Puedes ver exactamente qué reglas llevaron a esta clasificación, reduciendo sesgos humanos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Reclutamiento({setView,empleados,setEmpleados,catalogos}:{setView:(v:View)=>void;empleados:Empleado[];setEmpleados:(e:Empleado[])=>void;catalogos:typeof CATALOGOS_INIT}) {
  const [tab,setTab]=useState("dashboard");
  const [vacantes,setVacantes]=useState<Vacante[]>(VACANTES_INIT);
  const [requisiciones,setRequisiciones]=useState<Requisicion[]>(REQUISICIONES_INIT);
  const [perfilesTalento,setPerfilesTalento]=useState(PERFILES_TALENTO_INIT);
  const [postulaciones,setPostulaciones]=useState(POSTULACIONES_INIT);
  const [modalVacante,setModalVacante]=useState<{modo:"crear"|"editar";vacante:Vacante|null;requisicion:Requisicion|null}|null>(null);
  const [candidatos,setCandidatos]=useState<Candidato[]>(CANDIDATOS_INIT);
  const [entrevistas,setEntrevistas]=useState<Entrevista[]>(ENTREVISTAS_INIT);
  const [evaluaciones,setEvaluaciones]=useState<Evaluacion[]>(EVALUACIONES_INIT);
  const [documentos,setDocumentos]=useState<Documento[]>(DOCUMENTOS_INIT);
  const [timeline,setTimeline]=useState<TimelineEvento[]>(TIMELINE_INIT);
  const [selCandId,setSelCandId]=useState<string|null>(null);
  const [moverEtapaCand,setMoverEtapaCand]=useState<Candidato|null>(null);
  const [entrevistaPreseleccion,setEntrevistaPreseleccion]=useState<{candidatoId:string;abrir:boolean}|null>(null);
  const [ofertas,setOfertas]=useState<OfertaLaboral[]>(OFERTAS_INIT);
  const [filtrosConfig,setFiltrosConfig]=useState<FiltrosBaseTalentoConfig>(FILTROS_TALENTO_INIT);
  const [equipoReclutamiento,setEquipoReclutamiento]=useState<MiembroEquipoReclutamiento[]>(EQUIPO_RECLUTAMIENTO_INIT);
  const [fuentesHabilitadas,setFuentesHabilitadas]=useState<string[]>(FUENTES_POSTULACION);
  const [umbralCart,setUmbralCart]=useState(50);
  const selCand=candidatos.find(c=>c.id===selCandId)||null;

  const agregarEvento=(candidatoId:string,icono:string,descripcion:string,responsable?:string)=>{
    setTimeline(prev=>[...prev,{id:`TL-${Date.now()}`,candidatoId,fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),icono,descripcion,responsable}]);
  };

  const cambiarEstadoOferta=(oferta:OfertaLaboral,nuevoEstado:OfertaLaboral["estado"])=>{
    setOfertas(prev=>prev.map(o=>o.id===oferta.id?{...o,estado:nuevoEstado}:o));
    if(nuevoEstado==="Enviada"){
      agregarEvento(oferta.candidatoId,"📨",`Oferta enviada — ${fmt(oferta.salario)}, ingreso ${oferta.fechaIngreso}`,"Ronald");
      setCandidatos(prev=>prev.map(c=>c.id===oferta.candidatoId?{...c,etapa:"Oferta"}:c));
    } else if(nuevoEstado==="Aceptada"){
      agregarEvento(oferta.candidatoId,"🎉",`Oferta aceptada por el candidato`,"Ronald");
      setCandidatos(prev=>prev.map(c=>c.id===oferta.candidatoId?{...c,etapa:"Contratado"}:c));
    } else if(nuevoEstado==="Rechazada"){
      agregarEvento(oferta.candidatoId,"✕",`Oferta rechazada por el candidato`,"Ronald");
    } else if(nuevoEstado==="Vencida"){
      agregarEvento(oferta.candidatoId,"⏱",`Oferta vencida sin respuesta`,"Ronald");
    } else if(nuevoEstado==="Pendiente aprobación"){
      agregarEvento(oferta.candidatoId,"📤",`Oferta enviada a aprobación`,"Ronald");
    }
  };

  // Constructor de árbol
  type Nodo={id:string;pregunta:string;siNode:string|"CONTRATAR"|"SEGUNDA ENTREVISTA"|"EN ESPERA"|"NO CONTINÚA";noNode:string|"CONTRATAR"|"SEGUNDA ENTREVISTA"|"EN ESPERA"|"NO CONTINÚA"};
  const [arbolNodos,setArbolNodos]=useState<Record<string,Nodo>>({
    n1:{id:"n1",pregunta:"¿Experiencia ≥ 2 años?",siNode:"n2",noNode:"n3"},
    n2:{id:"n2",pregunta:"¿Estudios universitarios?",siNode:"n4",noNode:"SEGUNDA ENTREVISTA"},
    n3:{id:"n3",pregunta:"¿Estudios avanzados?",siNode:"SEGUNDA ENTREVISTA",noNode:"NO CONTINÚA"},
    n4:{id:"n4",pregunta:"¿Inglés intermedio+?",siNode:"CONTRATAR",noNode:"n5"},
    n5:{id:"n5",pregunta:"¿Disponibilidad inmediata?",siNode:"SEGUNDA ENTREVISTA",noNode:"EN ESPERA"},
  });
  const [pesos,setPesos]=useState({experiencia:30,estudios:25,ingles:20,disponibilidad:25});
  const [vacSelCtor,setVacSelCtor]=useState("Manual");

  const etapas=["Aplicación","Revisión CV","Entrevista RRHH","Prueba técnica","Entrevista técnica","Oferta","Contratado"];

  const integrarAlSistema=(cand:Candidato)=>{
    const vac=vacantes.find(v=>v.id===cand.vacante);
    if(!vac) return;
    const nuevo:Empleado={
      id:`COL-${String(empleados.length+1).padStart(3,"0")}`,
      nombre:cand.nombre,
      puesto:vac.puesto,
      depto:vac.departamento,
      tipo:vac.tipoContrato,
      inicio:new Date().toLocaleDateString("es-CR"),
      estado:"activo",
      foto:cand.nombre.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(),
      salario:vac.salarioMin,
      planillaId:(catalogos.planillas as any[])[0]?.id||"PL2",
      cedula:"",correo:cand.correo,telefono:cand.tel,banco:"BCR",cuentaBanco:"",jornada:"Completa",
    };
    setEmpleados([...empleados,nuevo]);
    setCandidatos(prev=>prev.map(c=>c.id===cand.id?{...c,etapa:"Contratado",estado:"Integrado"}:c));
    agregarEvento(cand.id,"🎉",`Integrado al sistema como ${nuevo.id} — ${vac.puesto}`,"Ronald");
    alert(`✅ ¡${cand.nombre} integrado exitosamente!\n\nID: ${nuevo.id}\nPuesto: ${vac.puesto}\nDpto: ${vac.departamento}\nPlanilla: ${(catalogos.planillas as any[]).find(p=>p.id===nuevo.planillaId)?.nombre||"—"}\n\nYa aparece en nómina y todos los módulos RRHH.`);
  };

  const moverDeEtapa=(cand:Candidato,nuevaEtapa:string,responsable:string,observaciones:string,proximaAccion:string)=>{
    setCandidatos(prev=>prev.map(c=>c.id===cand.id?{...c,etapa:nuevaEtapa}:c));
    let desc=`Movido a etapa: ${nuevaEtapa}`;
    if(observaciones.trim()) desc+=` — ${observaciones.trim()}`;
    if(proximaAccion.trim()) desc+=` · Próxima acción: ${proximaAccion.trim()}`;
    agregarEvento(cand.id,"🔄",desc,responsable);
    setMoverEtapaCand(null);
  };

  const registrarEvaluacionCandidato=(candidatoId:string,resultado:number,recomendacion:string)=>{
    agregarEvento(candidatoId,"🗣️",`Entrevista evaluada — Resultado ${resultado}/100, recomendación: ${recomendacion}`,"Ronald");
  };

  const agregarDocumentoCandidato=(candidatoId:string,tipo:string,nombre:string)=>{
    setDocumentos(prev=>[...prev,{id:`DOC-${Date.now()}`,candidatoId,tipo,nombre,fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),version:"v1",estado:"Recibido"}]);
    agregarEvento(candidatoId,"📎",`Documento agregado: ${tipo} — ${nombre}`,"Ronald");
  };

  const guardarVacante=(v:Vacante)=>{
    setVacantes(prev=>prev.some(x=>x.id===v.id)?prev.map(x=>x.id===v.id?v:x):[v,...prev]);
    setModalVacante(null);
  };

  const invitarDesdeTalento=(perfilIds:string[],vacanteId:string)=>{
    const nuevos:Candidato[]=perfilIds.map(pid=>{
      const p=perfilesTalento.find(x=>x.id===pid)!;
      return {id:`CAND-${Date.now()}-${pid.slice(-3)}`,nombre:p.nombre,vacante:vacanteId,etapa:"Aplicación",puntCART:0,estado:"En proceso",correo:p.correo,tel:p.telefono,cedula:p.cedula,experiencia:p.cvResumen,educacion:p.educacion,competencias:p.competencias,personaId:pid};
    });
    setCandidatos(prev=>[...prev,...nuevos]);
    setPostulaciones(prev=>[...prev,...perfilIds.map(pid=>({id:`POST-${Date.now()}-${pid.slice(-3)}`,personaId:pid,vacanteId,fuente:perfilesTalento.find(x=>x.id===pid)?.fuente||"Base de Talento",fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),estado:"En proceso"}))]);
    setPerfilesTalento(prev=>prev.map(p=>perfilIds.includes(p.id)?{...p,estado:"en proceso"}:p));
    nuevos.forEach(c=>agregarEvento(c.id,"📥",`Aplicación recibida — Base de Talento (${c.personaId})`,"Sistema"));
    setTab("candidatos");
  };

  const fmt=(n:number)=>`₡${n.toLocaleString("es-CR")}`;

  if(tab==="dashboard"){
    return (
      <ReclutamientoHome
        setTab={setTab}
        requisiciones={requisiciones} vacantes={vacantes} perfilesTalento={perfilesTalento}
        candidatos={candidatos} entrevistas={entrevistas} ofertas={ofertas}
      />
    );
  }

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Reclutamiento y Selección</div>
            <div className="page-subtitle">Vacantes · Pipeline · CART · Integración automática · ISO 9001 §7.2</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setTab("dashboard")}>← Dashboard</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setView("rrhh")}>Salir a RRHH</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setModalVacante({modo:"crear",vacante:null,requisicion:null})}>➕ Nueva Vacante</button>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:14}}>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("requisiciones")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">📝 Requisiciones</div><div className="kpi-value" style={{fontSize:17}}>{requisiciones.filter(r=>r.estado==="pendiente").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("vacantes")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">📋 Vacantes activas</div><div className="kpi-value" style={{fontSize:17}}>{vacantes.filter(v=>v.estado==="Activa").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("talento")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🗂️ Base de Talento</div><div className="kpi-value" style={{fontSize:17}}>{perfilesTalento.length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("candidatos")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">👤 En pipeline</div><div className="kpi-value" style={{fontSize:17}}>{candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("entrevistas")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🗣️ Entrevistas</div><div className="kpi-value" style={{fontSize:17,color:"#3B82F6"}}>{entrevistas.filter(e=>e.estado==="Programada").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("pipeline")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🔄 Pipeline</div><div className="kpi-value" style={{fontSize:17,color:"#3B82F6"}}>{candidatos.filter(c=>c.estado!=="Descartado"&&c.estado!=="Integrado").length}</div></div>
          <div className="kpi" style={{cursor:"pointer",transition:"all .15s"}} onClick={()=>setTab("integracion")} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(0,0,0,.1)"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="var(--shadow-sm)"}><div className="kpi-label">🔗 Integración</div><div className="kpi-value" style={{fontSize:17,color:"#10B981"}}>{candidatos.filter(c=>c.estado==="Integrado").length}</div></div>
        </div>

        <div className="tab-bar">
          {[["dashboard","🏠 Dashboard"],["requisiciones","📝 Requisiciones"],["vacantes","📋 Vacantes"],["talento","🗂️ Base de Talento"],["candidatos","👤 Candidatos"],["pipeline","🔄 Pipeline"],["entrevistas","🗣️ Entrevistas"],["ofertas","📨 Ofertas"],["analitica","📈 Analítica"],["constructor","🛠️ Constructor"],["integracion","🔗 Integración"],["cart","🌳 CART"],["config","⚙️ Configuración"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="requisiciones"&&(
          <Requisiciones requisiciones={requisiciones} setRequisiciones={setRequisiciones} onCrearVacante={req=>{setModalVacante({modo:"crear",vacante:null,requisicion:req});setTab("vacantes");}}/>
        )}

        {tab==="talento"&&(
          <BaseTalento perfiles={perfilesTalento} vacantes={vacantes} onInvitar={invitarDesdeTalento} filtrosConfig={filtrosConfig}/>
        )}

        {tab==="vacantes"&&(
          <div>
            {vacantes.map(v=>{
              const nCand=candidatos.filter(c=>c.vacante===v.id).length;
              return (
              <div key={v.id} className="card" style={{marginBottom:10,display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:48,height:48,background:"#EFF6FF",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔍</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontFamily:"monospace",fontSize:10.5,color:"#9CA3AF"}}>{v.id}</span>
                    <span style={{fontSize:14,fontWeight:700}}>{v.puesto}</span>
                    {v.requisicionId&&<span className="badge badge-purple" style={{fontSize:9.5}}>{v.requisicionId}</span>}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                    <span className="badge badge-info">{v.departamento}</span>
                    <span className={`badge ${v.tipoContrato==="Indefinido"?"badge-ok":"badge-warn"}`}>{v.tipoContrato}</span>
                    <span className={`badge ${v.estado==="Activa"?"badge-ok":v.estado==="Borrador"?"badge-gray":v.estado==="Pausada"?"badge-warn":"badge-crit"}`}>{v.estado}</span>
                    <span style={{fontSize:11.5,color:"#6B7280"}}>💰 {fmt(v.salarioMin)} – {fmt(v.salarioMax)}</span>
                    <span style={{fontSize:11.5,color:"#6B7280"}}>📅 Límite: {v.fechaLimite||"—"}</span>
                    {v.perfilCartId&&<span style={{fontSize:11.5,color:"#6B7280"}}>🌳 {PERFILES_CART_INIT.find(p=>p.id===v.perfilCartId)?.nombre}</span>}
                  </div>
                </div>
                <div style={{textAlign:"center" as const}}>
                  <div style={{fontSize:24,fontWeight:700,color:"#3B82F6"}}>{nCand}</div>
                  <div style={{fontSize:10.5,color:"#6B7280"}}>candidatos</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setTab("candidatos")}>Ver candidatos</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setModalVacante({modo:"editar",vacante:v,requisicion:null})}>✏️ Editar</button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {tab==="candidatos"&&(
          <div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Candidato</th><th>Vacante</th><th>Etapa</th><th>Punt. CART</th><th>Estado</th><th>Contacto</th><th></th></tr></thead>
                <tbody>
                  {candidatos.map(c=>{
                    const vac=vacantes.find(v=>v.id===c.vacante);
                    const cc=c.puntCART>=80?"#10B981":c.puntCART>=60?"#F59E0B":"#EF4444";
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div className="user-avatar" style={{width:28,height:28,fontSize:10,background:cc}}>{c.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                            <div><div style={{fontSize:12.5,fontWeight:600}}>{c.nombre}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{c.id}</div></div>
                          </div>
                        </td>
                        <td style={{fontSize:12}}>{vac?.puesto||c.vacante}</td>
                        <td><span className="badge badge-info" style={{fontSize:10}}>{c.etapa}</span></td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{background:"#E5E7EB",borderRadius:4,height:8,width:60,overflow:"hidden"}}>
                              <div style={{width:`${c.puntCART}%`,background:cc,height:"100%",borderRadius:4}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:12,color:cc}}>{c.puntCART}</span>
                          </div>
                        </td>
                        <td><span className={`badge ${c.estado==="Integrado"?"badge-ok":c.estado==="Descartado"?"badge-crit":c.estado==="Avanzando"?"badge-info":"badge-warn"}`}>{c.estado}</span></td>
                        <td style={{fontSize:11}}>{c.correo}</td>
                        <td>
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>setSelCandId(c.id)}>👁</button>
                            <button className="btn btn-ghost btn-sm" style={{fontSize:10}} onClick={()=>setMoverEtapaCand(c)}>🔄 Etapa</button>
                            {c.etapa==="Contratado"&&c.estado!=="Integrado"&&(
                              <button className="btn btn-primary btn-sm" style={{fontSize:10}} onClick={()=>integrarAlSistema(c)}>✅ Integrar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="pipeline"&&(
          <div style={{overflowX:"auto" as const}}>
            <div style={{display:"flex",gap:10,minWidth:900}}>
              {etapas.map(etapa=>{
                const cands=candidatos.filter(c=>c.etapa===etapa);
                return (
                  <div key={etapa} style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:11.5,fontWeight:700,color:"#374151",background:"#F3F4F6",padding:"6px 8px",borderRadius:6,marginBottom:8,textAlign:"center" as const}}>
                      {etapa}<br/><span style={{fontSize:18,fontWeight:800,color:"#1B1F2E"}}>{cands.length}</span>
                    </div>
                    {cands.map(c=>(
                      <div key={c.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:7,padding:"8px 10px",marginBottom:6,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                        <div onClick={()=>setSelCandId(c.id)} style={{cursor:"pointer"}}>
                          <div style={{fontSize:11.5,fontWeight:600,marginBottom:2}}>{c.nombre}</div>
                          <div style={{fontSize:10.5,color:"#6B7280",marginBottom:4}}>{vacantes.find(v=>v.id===c.vacante)?.puesto||"—"}</div>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{background:"#E5E7EB",borderRadius:3,height:5,flex:1}}>
                              <div style={{width:`${c.puntCART}%`,background:c.puntCART>=80?"#10B981":"#F59E0B",height:"100%",borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:10,fontWeight:700,color:c.puntCART>=80?"#10B981":"#F59E0B"}}>{c.puntCART}</span>
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:6,fontSize:10,padding:"3px 6px"}} onClick={()=>setMoverEtapaCand(c)}>🔄 Mover de etapa</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="entrevistas"&&(
          <Entrevistas
            candidatos={candidatos} vacantes={vacantes}
            entrevistas={entrevistas} setEntrevistas={setEntrevistas}
            evaluaciones={evaluaciones} setEvaluaciones={setEvaluaciones}
            onEvaluada={registrarEvaluacionCandidato}
            candidatoPreseleccionado={entrevistaPreseleccion?.candidatoId}
            formularioAbiertoInicial={entrevistaPreseleccion?.abrir}
            onCerrarFormularioInicial={()=>setEntrevistaPreseleccion(null)}
            onVerCandidato={id=>setSelCandId(id)}
          />
        )}

        {tab==="ofertas"&&(
          <Ofertas
            ofertas={ofertas} setOfertas={setOfertas}
            candidatos={candidatos} vacantes={vacantes}
            onCambioEstado={cambiarEstadoOferta}
            onVerCandidato={id=>setSelCandId(id)}
          />
        )}

        {tab==="analitica"&&(
          <AnaliticaReclutamiento
            candidatos={candidatos} vacantes={vacantes} ofertas={ofertas}
            postulaciones={postulaciones} timeline={timeline}
          />
        )}

        {tab==="config"&&(
          <ConfigReclutamiento
            filtrosConfig={filtrosConfig} setFiltrosConfig={setFiltrosConfig}
            equipo={equipoReclutamiento} setEquipo={setEquipoReclutamiento}
            fuentesHabilitadas={fuentesHabilitadas} setFuentesHabilitadas={setFuentesHabilitadas}
            umbralCart={umbralCart} setUmbralCart={setUmbralCart}
          />
        )}

        {tab==="constructor"&&(
          <div className="g2" style={{alignItems:"start"}}>
            <div>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">🛠️ Constructor de Árbol de Decisión</div>
                <div className="form-group" style={{margin:0,marginBottom:14}}>
                  <label className="form-label">Vacante</label>
                  <select className="form-control" value={vacSelCtor} onChange={e=>setVacSelCtor(e.target.value)}>
                    <option value="Manual">Manual (sin aplicar a vacante)</option>
                    {vacantes.map(v=><option key={v.id} value={v.id}>{v.puesto} ({v.departamento})</option>)}
                  </select>
                </div>

                <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"12px",marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:10}}>NODOS DEL ÁRBOL</div>
                  {Object.values(arbolNodos).map(nodo=>(
                    <div key={nodo.id} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:6,padding:"10px",marginBottom:8}}>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        <input type="text" className="form-control" style={{flex:1,fontSize:12}} value={nodo.pregunta} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,pregunta:e.target.value}}))} placeholder="Pregunta Sí/No"/>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setArbolNodos(prev=>{const n={...prev};delete n[nodo.id];return n;})}>✕</button>
                      </div>
                      <div style={{display:"flex",gap:8,fontSize:11}}>
                        <div style={{flex:1}}>
                          <div style={{color:"#6B7280",marginBottom:3}}>Si SÍ:</div>
                          <select className="form-control" value={nodo.siNode} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,siNode:e.target.value as any}}))} style={{fontSize:11}}>
                            <option value="CONTRATAR">✓ CONTRATAR</option>
                            <option value="SEGUNDA ENTREVISTA">↪ SEGUNDA ENTREVISTA</option>
                            <option value="EN ESPERA">⏸ EN ESPERA</option>
                            <option value="NO CONTINÚA">✗ NO CONTINÚA</option>
                            {Object.keys(arbolNodos).map(id=><option key={id} value={id}>{arbolNodos[id]?.pregunta?.slice(0,20)}...</option>)}
                          </select>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{color:"#6B7280",marginBottom:3}}>Si NO:</div>
                          <select className="form-control" value={nodo.noNode} onChange={e=>setArbolNodos(prev=>({...prev,[nodo.id]:{...nodo,noNode:e.target.value as any}}))} style={{fontSize:11}}>
                            <option value="CONTRATAR">✓ CONTRATAR</option>
                            <option value="SEGUNDA ENTREVISTA">↪ SEGUNDA ENTREVISTA</option>
                            <option value="EN ESPERA">⏸ EN ESPERA</option>
                            <option value="NO CONTINÚA">✗ NO CONTINÚA</option>
                            {Object.keys(arbolNodos).map(id=><option key={id} value={id}>{arbolNodos[id]?.pregunta?.slice(0,20)}...</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" style={{width:"100%"}} onClick={()=>{const nid=`n${Object.keys(arbolNodos).length+1}`;setArbolNodos(prev=>({...prev,[nid]:{id:nid,pregunta:"Nueva pregunta",siNode:"CONTRATAR",noNode:"NO CONTINÚA"}}));}}>+ Agregar nodo</button>
                </div>

                <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"12px",marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:12}}>PESOS DE CRITERIOS</div>
                  {([["Experiencia","experiencia"],["Estudios","estudios"],["Inglés","ingles"],["Disponibilidad","disponibilidad"]] as const).map(([label,key])=>(
                    <div key={key} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600}}>{label}</span>
                        <span style={{fontWeight:700,color:"#E8611A"}}>{pesos[key]}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={pesos[key]} onChange={e=>{const pct=parseInt(e.target.value);setPesos(prev=>{const sum=Object.values(prev).reduce((a,b)=>a+b,0)-prev[key]+pct;if(sum>100) return prev;return {...prev,[key]:pct};})}} style={{width:"100%"}}/>
                      <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>Total: {Object.values(pesos).reduce((a,b)=>a+b,0)}% de 100%</div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>setTab("cart")}>📤 Ver en CART</button>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:6,textAlign:"center" as const}}>Los cambios ya están activos — CART usa este mismo árbol en tiempo real.</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">🌳 Preview — Árbol generado con dependencias</div>
              <div style={{overflowX:"auto",paddingBottom:12,background:"#F8FAFC",borderRadius:8,border:"1px solid #E5E7EB",padding:16}}>
                <ArbolCartViz nodos={arbolNodos} width={1200} height={500}/>
              </div>

              <div style={{marginTop:14,background:"#F9FAFB",borderRadius:8,padding:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:10}}>📊 Estructura del árbol</div>
                <div style={{fontFamily:"monospace",fontSize:10,lineHeight:1.8,color:"#374151",maxHeight:180,overflowY:"auto" as const}}>
                  {(() => {
                    const renderText=(nodoId:string,depth:number):string[]=> {
                      if(typeof nodoId === "string" && !nodoId.startsWith("n")) {
                        return [`${"  ".repeat(depth)}→ ${nodoId}`];
                      }
                      const n=arbolNodos[nodoId];
                      if(!n) return [];
                      return [
                        `${"  ".repeat(depth)}❓ ${n.pregunta}`,
                        ...renderText(n.siNode, depth+1).map(l=>`${"  ".repeat(depth)}  ✓ ${l}`),
                        ...renderText(n.noNode, depth+1).map(l=>`${"  ".repeat(depth)}  ✗ ${l}`)
                      ];
                    };
                    return renderText("n1",0).map((line,i)=><div key={i}>{line}</div>);
                  })()}
                </div>
              </div>

              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E5E7EB",fontSize:10,color:"#6B7280"}}>
                <div style={{marginBottom:6}}><b>Pesos configurados:</b></div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap" as const}}>
                  <div>• <span style={{color:"#E8611A",fontWeight:700}}>Experiencia: {pesos.experiencia}%</span></div>
                  <div>• <span style={{color:"#E8611A",fontWeight:700}}>Estudios: {pesos.estudios}%</span></div>
                  <div>• <span style={{color:"#E8611A",fontWeight:700}}>Inglés: {pesos.ingles}%</span></div>
                  <div>• <span style={{color:"#E8611A",fontWeight:700}}>Disponibilidad: {pesos.disponibilidad}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="integracion"&&(
          <div>
            <div style={{background:"#ECFDF5",border:"1px solid #6EE7B7",borderRadius:10,padding:"12px 16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"#065F46",marginBottom:4}}>🔗 Integración automática al sistema</div>
              <div style={{fontSize:12,color:"#047857"}}>Al integrar un candidato, se crea automáticamente un perfil de Empleado que aparece en: Nómina, Control de Asistencia, Gestión de Desempeño, Capacitación y Administración de Personal.</div>
            </div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Candidato</th><th>Vacante</th><th>Punt. CART</th><th>Planilla destino</th><th>Acción</th></tr></thead>
                <tbody>
                  {candidatos.filter(c=>c.estado!=="Descartado").map(c=>{
                    const vac=vacantes.find(v=>v.id===c.vacante);
                    const cc=c.puntCART>=80?"#10B981":"#F59E0B";
                    const planDest=(catalogos.planillas as any[]).find((p:any)=>p.estado==="activa");
                    return (
                      <tr key={c.id}>
                        <td style={{fontWeight:600,fontSize:12.5}}>{c.nombre}</td>
                        <td style={{fontSize:12}}>{vac?.puesto||"—"}</td>
                        <td><span style={{fontWeight:700,color:cc}}>{c.puntCART}/100</span></td>
                        <td><span className="badge badge-info" style={{fontSize:10}}>{planDest?.nombre||"PL2 Operaciones"}</span></td>
                        <td>
                          {c.estado==="Integrado"?(
                            <span className="badge badge-ok">✓ Integrado</span>
                          ):c.etapa==="Contratado"?(
                            <button className="btn btn-primary btn-sm" onClick={()=>integrarAlSistema(c)}>✅ Integrar</button>
                          ):(
                            <span style={{fontSize:10.5,color:"#9CA3AF"}} title="Solo disponible una vez que el candidato llega a la etapa Contratado">Pendiente de contratación</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="cart"&&<CartTab setTab={setTab} arbolNodos={arbolNodos}/>}
      </div>

      <div className="right-panel">
        <div className="panel-title">Postulaciones recibidas</div>
        <div className="res-row"><span className="res-label">Total histórico</span><span className="res-val">{postulaciones.length}</span></div>
        <div className="res-row"><span className="res-label">En Base de Talento</span><span className="res-val" style={{color:"#7C3AED"}}>{postulaciones.filter(p=>p.vacanteId===null).length}</span></div>
        <div style={{height:14}}/>
        <div className="panel-title">Pipeline resumen</div>
        {etapas.slice(1,-1).map(et=>{
          const n=candidatos.filter(c=>c.etapa===et).length;
          return n>0?(
            <div key={et} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
              <span style={{color:"#374151"}}>{et}</span>
              <span className="badge badge-info" style={{fontSize:9}}>{n}</span>
            </div>
          ):null;
        })}
        <div style={{height:14}}/>
        <div className="panel-title">Vacantes activas</div>
        {vacantes.filter(v=>v.estado==="Activa").map(v=>(
          <div key={v.id} style={{padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontSize:12,fontWeight:600}}>{v.puesto}</div>
            <div style={{fontSize:10.5,color:"#6B7280"}}>{candidatos.filter(c=>c.vacante===v.id).length} candidatos · {v.departamento}</div>
          </div>
        ))}
        <div style={{height:14}}/>
        <div className="panel-title">Acciones rápidas</div>
        {[{l:"Nueva vacante",i:"➕",a:()=>setModalVacante({modo:"crear",vacante:null,requisicion:null})},{l:"Base de Talento",i:"🗂️",a:()=>setTab("talento")},{l:"Ver pipeline",i:"🔄",a:()=>setTab("pipeline")},{l:"Usar CART",i:"🌳",a:()=>setTab("cart")}].map(a=>(
          <div key={a.l} onClick={a.a} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:4}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background="#F9FAFB"} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
            <span>{a.i}</span><span style={{fontSize:11.5,color:"#374151"}}>{a.l}</span><span style={{marginLeft:"auto",color:"#D1D5DB"}}>›</span>
          </div>
        ))}
      </div>

      {modalVacante&&(
        <VacanteModal
          vacante={modalVacante.vacante}
          requisicionOrigen={modalVacante.requisicion}
          perfilesCart={PERFILES_CART_INIT}
          onGuardar={guardarVacante}
          onCerrar={()=>setModalVacante(null)}
        />
      )}

      {selCand&&(
        <CandidatoExpediente
          candidato={selCand}
          vacante={vacantes.find(v=>v.id===selCand.vacante)}
          entrevistas={entrevistas.filter(e=>e.candidatoId===selCand.id)}
          evaluaciones={evaluaciones.filter(e=>e.candidatoId===selCand.id)}
          documentos={documentos.filter(d=>d.candidatoId===selCand.id)}
          timeline={timeline.filter(t=>t.candidatoId===selCand.id).slice().reverse()}
          onCerrar={()=>setSelCandId(null)}
          onIntegrar={()=>{integrarAlSistema(selCand);setSelCandId(null);}}
          onProgramarEntrevista={()=>{setEntrevistaPreseleccion({candidatoId:selCand.id,abrir:true});setTab("entrevistas");setSelCandId(null);}}
          onAgregarDocumento={(tipo,nombre)=>agregarDocumentoCandidato(selCand.id,tipo,nombre)}
        />
      )}

      {moverEtapaCand&&(
        <MoverEtapaModal
          candidato={moverEtapaCand}
          etapas={etapas}
          onMover={(nuevaEtapa,responsable,observaciones,proximaAccion)=>moverDeEtapa(moverEtapaCand,nuevaEtapa,responsable,observaciones,proximaAccion)}
          onCerrar={()=>setMoverEtapaCand(null)}
        />
      )}
    </div>
  );
}
