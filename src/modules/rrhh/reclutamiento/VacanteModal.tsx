import React, { useState } from "react";
import type { Vacante, PerfilCart, Requisicion } from "../../../types";

const TIPOS_CONTRATO = ["Indefinido", "Plazo fijo", "Temporal", "Outsourcing"];
const JORNADAS = ["Completa", "Media jornada", "Por horas"];
const MODALIDADES = ["Presencial", "Remoto", "Híbrida", "Campo"];
const EDUCACIONES = ["Sin título", "Técnico", "Universitario", "Posgrado"];

export function VacanteModal({vacante,requisicionOrigen,perfilesCart,onGuardar,onCerrar}:{
  vacante:Vacante|null;requisicionOrigen:Requisicion|null;perfilesCart:PerfilCart[];
  onGuardar:(v:Vacante)=>void;onCerrar:()=>void;
}) {
  const esEdicion=!!vacante;
  const [f,setF]=useState<Vacante>(vacante||{
    id:"", puesto:requisicionOrigen?.puesto||"", departamento:requisicionOrigen?.departamento||"", sucursal:"Oficina Central",
    plazas:requisicionOrigen?.plazas||1, responsable:requisicionOrigen?.solicitante||"",
    requisicionId:requisicionOrigen?.id, motivoContratacion:requisicionOrigen?.motivo||"Nueva posición",
    tipoContrato:"Indefinido", jornada:"Completa", modalidad:"Presencial",
    salarioMin:0, salarioMax:0, fechaLimite:"", descripcion:"", funciones:"", requisitos:"",
    educacionMin:"Técnico", experienciaMin:0, competencias:"", idiomas:"No requerido",
    perfilCartId:undefined, estado:"Borrador", fecha:new Date().toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"}),
  });

  const set=(campo:keyof Vacante,valor:any)=>setF(prev=>({...prev,[campo]:valor}));
  const valido=f.puesto.trim()&&f.departamento.trim()&&f.salarioMax>=f.salarioMin;

  const guardar=()=>{
    if(!valido) return;
    onGuardar({...f, id:f.id||`VAC-${String(Date.now()).slice(-4)}`});
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{maxWidth:640}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{esEdicion?`Editar ${f.id}`:"Nueva Vacante"}</div>
            <div className="modal-sub">{requisicionOrigen?`Generada desde ${requisicionOrigen.id}`:"Expediente completo del puesto"}</div>
          </div>
          <div className="modal-close" onClick={onCerrar}>✕</div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:2}}>
            <label className="form-label">Puesto</label>
            <input className="form-control" value={f.puesto} onChange={e=>set("puesto",e.target.value)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Plazas</label>
            <input type="number" min={1} className="form-control" value={f.plazas} onChange={e=>set("plazas",parseInt(e.target.value)||1)}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Departamento</label>
            <input className="form-control" value={f.departamento} onChange={e=>set("departamento",e.target.value)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Sucursal</label>
            <input className="form-control" value={f.sucursal} onChange={e=>set("sucursal",e.target.value)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Responsable</label>
            <input className="form-control" value={f.responsable} onChange={e=>set("responsable",e.target.value)}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Tipo de contrato</label>
            <select className="form-control" value={f.tipoContrato} onChange={e=>set("tipoContrato",e.target.value)}>
              {TIPOS_CONTRATO.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Jornada</label>
            <select className="form-control" value={f.jornada} onChange={e=>set("jornada",e.target.value)}>
              {JORNADAS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Modalidad</label>
            <select className="form-control" value={f.modalidad} onChange={e=>set("modalidad",e.target.value)}>
              {MODALIDADES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Salario mínimo (₡)</label>
            <input type="number" className="form-control" value={f.salarioMin||""} onChange={e=>set("salarioMin",parseFloat(e.target.value)||0)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Salario máximo (₡)</label>
            <input type="number" className="form-control" value={f.salarioMax||""} onChange={e=>set("salarioMax",parseFloat(e.target.value)||0)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Fecha límite</label>
            <input className="form-control" placeholder="30 Ago 2026" value={f.fechaLimite} onChange={e=>set("fechaLimite",e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción del puesto</label>
          <textarea className="form-control" rows={2} value={f.descripcion} onChange={e=>set("descripcion",e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Funciones principales</label>
          <textarea className="form-control" rows={2} value={f.funciones} onChange={e=>set("funciones",e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Requisitos</label>
          <textarea className="form-control" rows={2} value={f.requisitos} onChange={e=>set("requisitos",e.target.value)}/>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Educación mínima</label>
            <select className="form-control" value={f.educacionMin} onChange={e=>set("educacionMin",e.target.value)}>
              {EDUCACIONES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Experiencia mínima (años)</label>
            <input type="number" min={0} className="form-control" value={f.experienciaMin} onChange={e=>set("experienciaMin",parseInt(e.target.value)||0)}/>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Idiomas</label>
            <input className="form-control" value={f.idiomas} onChange={e=>set("idiomas",e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Competencias clave</label>
          <input className="form-control" value={f.competencias} onChange={e=>set("competencias",e.target.value)}/>
        </div>

        <div style={{display:"flex",gap:8}}>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Perfil CART asociado</label>
            <select className="form-control" value={f.perfilCartId||""} onChange={e=>set("perfilCartId",e.target.value||undefined)}>
              <option value="">— Sin perfil CART —</option>
              {perfilesCart.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="form-group" style={{flex:1}}>
            <label className="form-label">Estado</label>
            <select className="form-control" value={f.estado} onChange={e=>set("estado",e.target.value as Vacante["estado"])}>
              <option value="Borrador">Borrador</option>
              <option value="Activa">Activa</option>
              <option value="Pausada">Pausada</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{width:"100%",marginTop:6}} disabled={!valido} onClick={guardar}>{esEdicion?"💾 Guardar cambios":"✅ Crear vacante"}</button>
      </div>
    </div>
  );
}
