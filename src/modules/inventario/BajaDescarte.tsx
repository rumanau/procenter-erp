import React, { useState } from "react";
import type { View } from "../../types";

export function BajaDescarte({setView}:{setView:(v:View)=>void}) {
  const motivos=["Fin de vida útil","Daño irreparable","Caducidad / Vencimiento","Obsolescencia tecnológica","Norma / Regulación","Otro"];
  const metodos=["Descarte controlado","Donación","Venta como chatarra","Destrucción certificada","Devolución al proveedor"];

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Baja / Descarte de Artículo</div><div className="page-subtitle">Retiro definitivo con evidencia · Doble aprobación · ISO 9001 §8.5.4</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículo a Dar de Baja</div>
            <div className="form-group"><label className="form-label">Buscar Artículo</label>
              <div className="header-search"><span>🔍</span><input placeholder="Código o nombre del artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
            </div>
            <div style={{padding:"10px 12px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FCA5A5",marginBottom:12}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{fontSize:28}}>🔧</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>Taladro DeWalt 20V</div>
                  <div style={{fontSize:11,color:"#6B7280"}}>INV-HR-00158 · Herramientas · Bodega Central</div>
                  <div style={{fontSize:11,color:"#EF4444",fontWeight:600,marginTop:2}}>Stock: 2 Pzas. · Estado: Dañado</div>
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Cantidad a dar de baja</label><input type="number" className="form-control" defaultValue="1" min="1"/></div>
              <div className="form-group"><label className="form-label">Número de serie / Lote</label><input className="form-control" defaultValue="SN-DW-2023-004"/></div>
            </div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Motivo y Método</div>
            <div className="form-group"><label className="form-label">Motivo de la Baja</label>
              <select className="form-control">{motivos.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Método de Descarte</label>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {metodos.map(m=>(
                  <label key={m} style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,cursor:"pointer"}}>
                    <input type="radio" name="metodo" defaultChecked={m===metodos[0]}/>{m}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Descripción del estado físico</label><textarea className="form-control" rows={3} placeholder="Describe el estado del artículo y el motivo de la baja..."/></div>
          </div>
          <div className="card">
            <div className="card-title">Evidencia Fotográfica</div>
            <div className="photo-box" style={{minHeight:100}}><div style={{fontSize:36}}>📷</div><div style={{fontSize:12,color:"#6B7280",marginTop:8}}>Adjuntar foto del artículo a dar de baja</div><button className="btn btn-secondary btn-sm" style={{marginTop:8}}>📷 Subir Foto</button></div>
            <div style={{fontSize:11,color:"#6B7280",marginTop:6}}>La evidencia fotográfica es obligatoria para bajas por daño. ISO 9001 §8.5.4</div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12,background:"#FEF2F2",border:"1px solid #FCA5A5"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"#991B1B",marginBottom:8}}>⚠ Acción Irreversible</div>
            <p style={{fontSize:12,color:"#374151",lineHeight:1.6}}>Una vez aprobada, la baja no puede revertirse. El artículo será retirado del inventario de forma permanente y quedará registrado en el historial de auditoría.</p>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Flujo de Aprobación (Doble)</div>
            {[["👤","Encargado Inventario","Jules Ramirez","Primera aprobación","#ECFDF5","#6EE7B7"],["✅","Director General","Ronald","Aprobación final","#EFF6FF","#BFDBFE"]].map(([ic,rol,nom,est,bg,bd])=>(
              <div key={rol} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:bg as string,borderRadius:7,border:`1px solid ${bd}`,marginBottom:6}}>
                <span style={{fontSize:16}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{nom}</div><div style={{fontSize:10.5,color:"#6B7280"}}>{rol}</div></div>
                <span style={{fontSize:11,color:"#6B7280"}}>{est}</span>
              </div>
            ))}
          </div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#EF4444"}}>BAJ-2024-003</span></div>
            <div className="res-row"><span className="res-label">ISO</span><span className="badge badge-ok">§8.5.4 Cumple</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-danger" style={{width:"100%"}} onClick={()=>alert("✅ Baja BAJ-2024-003 enviada a aprobación dual.\nNotificaciones enviadas al encargado y director.")}>🗑️ Solicitar Baja</button>
          </div>
        </div>
      </div>
    </div>
  );
}
