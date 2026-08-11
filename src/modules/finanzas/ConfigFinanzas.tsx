import React, { useState } from "react";
import type { View, Moneda } from "../../types";
import { MONEDAS, PLAN_CUENTAS } from "../../data/finanzas";

export function ConfigFinanzas({setView}:{setView:(v:View)=>void}) {
  const [tab,setTab]=useState("monedas");
  const [monedas,setMonedas]=useState<Moneda[]>(MONEDAS);
  const [monedaBase,setMonedaBase]=useState("CRC");
  const [ambiente,setAmbiente]=useState("sandbox");
  const [usuarioATV,setUsuarioATV]=useState("");
  const [certificado,setCertificado]=useState("");

  const actualizarTipoCambio=(cod:string,v:number)=>setMonedas(prev=>prev.map(m=>m.codigo===cod?{...m,tipoCambio:v}:m));

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div className="content" style={{flex:1}}>
        <div className="page-header">
          <div>
            <div className="page-title">Configuración de Finanzas</div>
            <div className="page-subtitle">Monedas · Series de facturación · Credenciales Hacienda</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setView("finanzas")}>← Finanzas</button>
        </div>

        <div className="tab-bar">
          {[["monedas","💱 Monedas"],["series","🔢 Series de Facturación"],["hacienda","🏛️ Hacienda ATV"],["plan-cuentas","📋 Plan de Cuentas"]].map(([id,l])=>(
            <div key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {tab==="monedas"&&(
          <div className="card">
            <div className="card-title">Multimoneda</div>
            <div className="form-group" style={{maxWidth:280}}>
              <label className="form-label">Moneda base del sistema</label>
              <select className="form-control" value={monedaBase} onChange={e=>setMonedaBase(e.target.value)}>
                {monedas.map(m=><option key={m.codigo} value={m.codigo}>{m.simbolo} {m.nombre} ({m.codigo})</option>)}
              </select>
            </div>
            <table className="tbl" style={{marginTop:10}}>
              <thead><tr><th>Moneda</th><th>Símbolo</th><th>Tipo de cambio vs ₡</th></tr></thead>
              <tbody>
                {monedas.map(m=>(
                  <tr key={m.codigo}>
                    <td style={{fontSize:12.5,fontWeight:600}}>{m.nombre} ({m.codigo})</td>
                    <td style={{fontSize:12}}>{m.simbolo}</td>
                    <td>
                      {m.codigo==="CRC"
                        ? <span style={{fontSize:12,color:"#9CA3AF"}}>Base — 1.00</span>
                        : <input type="number" step="0.01" className="form-control" style={{width:120}} value={m.tipoCambio} onChange={e=>actualizarTipoCambio(m.codigo,parseFloat(e.target.value)||0)}/>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="series"&&(
          <div className="card">
            <div className="card-title">Series de comprobantes electrónicos</div>
            <table className="tbl">
              <thead><tr><th>Tipo de comprobante</th><th>Serie</th><th>Consecutivo actual</th><th>Estado</th></tr></thead>
              <tbody>
                {[
                  {t:"Factura Electrónica",s:"001-00001-01",n:"0000000045",e:"activa"},
                  {t:"Nota de Crédito",s:"001-00001-03",n:"0000000003",e:"activa"},
                  {t:"Tiquete Electrónico",s:"001-00001-04",n:"0000000000",e:"inactiva"},
                ].map(r=>(
                  <tr key={r.t}>
                    <td style={{fontSize:12.5,fontWeight:600}}>{r.t}</td>
                    <td style={{fontFamily:"monospace",fontSize:11.5}}>{r.s}</td>
                    <td style={{fontFamily:"monospace",fontSize:11.5}}>{r.n}</td>
                    <td><span className={`badge ${r.e==="activa"?"badge-ok":"badge-gray"}`}>{r.e}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="hacienda"&&(
          <div className="card" style={{maxWidth:520}}>
            <div className="card-title">Credenciales Ministerio de Hacienda (ATV)</div>
            <div style={{fontSize:11,color:"#9CA3AF",marginBottom:12,lineHeight:1.4}}>Estos campos configuran la conexión simulada al webservice de Hacienda. Para producción real se requiere certificado de firma digital (.p12) emitido por el Banco Central de Costa Rica.</div>
            <div className="form-group">
              <label className="form-label">Usuario ATV</label>
              <input className="form-control" placeholder="cpf-o-cedula-juridica@hacienda" value={usuarioATV} onChange={e=>setUsuarioATV(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Certificado de firma digital (.p12)</label>
              <div className="photo-box" onClick={()=>setCertificado("certificado_firma.p12")}>
                {certificado?<span style={{fontSize:12,color:"#10B981"}}>✓ {certificado} cargado</span>:<span style={{fontSize:12,color:"#6B7280"}}>📎 Click para adjuntar certificado</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ambiente</label>
              <div className="pills-row">
                <div className={`pill ${ambiente==="sandbox"?"sel":""}`} onClick={()=>setAmbiente("sandbox")}>Sandbox (pruebas)</div>
                <div className={`pill ${ambiente==="produccion"?"sel":""}`} onClick={()=>setAmbiente("produccion")}>Producción</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={()=>alert("Configuración guardada localmente. La conexión real al webservice de Hacienda requiere backend.")}>💾 Guardar configuración</button>
          </div>
        )}

        {tab==="plan-cuentas"&&(
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th></tr></thead>
              <tbody>
                {PLAN_CUENTAS.map(c=>(
                  <tr key={c.codigo}>
                    <td style={{fontFamily:"monospace",fontSize:11.5,color:"#E8611A",fontWeight:700}}>{c.codigo}</td>
                    <td style={{fontSize:12.5}}>{c.nombre}</td>
                    <td><span className="badge badge-gray">{c.tipo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
