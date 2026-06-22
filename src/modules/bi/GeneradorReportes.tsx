import React, { useState } from "react";
import { REPORT_FIELDS_DATA } from "../../data/catalogos";
import { ProcenterIsotipo } from "../../components/Logo";

export function GeneradorReportes() {
  const [fields,setFields]=useState(REPORT_FIELDS_DATA.map(f=>({...f})));
  const toggle=(i:number)=>setFields(prev=>prev.map((f,j)=>j===i?{...f,sel:!f.sel}:f));
  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Generador de Reportes</div><div className="page-subtitle">Reportes personalizados y descargables · Plantillas guardadas · ISO Ready</div></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-secondary btn-sm">💾 Guardar Plantilla</button>
          <button className="btn btn-primary btn-sm" onClick={()=>alert("✅ Reporte generado: Inventario_CSI_Abr2024.xlsx\n\nDescarga iniciada automáticamente.")}>📥 Generar Reporte</button>
        </div>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Plantillas Guardadas</div>
            {[["📊","Inventario Mensual Completo","01 Abr 2024","Excel","badge-ok"],["📋","Stock Bajo Mínimo","Semanal · Automático","PDF","badge-info"],["💰","Valorizado para Contabilidad","31 Mar 2024","Excel","badge-ok"]].map(([ic,n,d,f,cl])=>(
              <div key={n} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,border:"1px solid #E5E7EB",marginBottom:6,cursor:"pointer",transition:"all .15s"}}
                onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.borderColor="#E8611A"}
                onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB"}>
                <span>{ic}</span>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12.5}}>{n}</div><div style={{fontSize:11,color:"#6B7280"}}>{d}</div></div>
                <span className={`badge ${cl}`}>{f}</span>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 10px",border:"1.5px dashed #E5E7EB",borderRadius:8,fontSize:12.5,color:"#6B7280",cursor:"pointer",marginTop:4}}>➕ Nueva plantilla</div>
          </div>
          <div className="card">
            <div className="card-title">Campos del Reporte</div>
            <div style={{fontSize:11,color:"#6B7280",marginBottom:8}}>Selecciona qué incluir en el reporte:</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto"}}>
              {fields.map((f,i)=>(
                <div key={f.label} onClick={()=>toggle(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,border:`1px solid ${f.sel?"#E8611A":"#E5E7EB"}`,cursor:"pointer",background:f.sel?"#FFF3ED":"#fff",transition:"all .15s"}}>
                  <div style={{width:16,height:16,border:`2px solid ${f.sel?"#E8611A":"#D1D5DB"}`,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:f.sel?"#E8611A":undefined}}>
                    {f.sel&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize:12}}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Configuración del Reporte</div>
            <div className="form-group"><label className="form-label">Módulo / Fuente de datos</label><select className="form-control"><option>Inventario & Proveeduría</option><option>RRHH & Planilla</option><option>Finanzas</option><option>Trazabilidad</option></select></div>
            <div className="form-group"><label className="form-label">Período</label>
              <div className="pills-row" style={{marginBottom:8}}>
                {["Mensual","Trimestral","Anual","Personalizado"].map(p=><span key={p} className={`pill ${p==="Mensual"?"sel":""}`}>{p}</span>)}
              </div>
              <div className="g2"><input type="date" className="form-control" defaultValue="2024-03-01"/><input type="date" className="form-control" defaultValue="2024-04-30"/></div>
            </div>
            <div className="form-group"><label className="form-label">Filtrar por Bodega</label><select className="form-control"><option>Todas</option><option>Bodega Central</option><option>Bodega 3</option></select></div>
            <div className="form-group"><label className="form-label">Filtrar por Categoría</label><select className="form-control"><option>Todas</option><option>Herramientas</option><option>Consumibles</option></select></div>
            <div className="form-group"><label className="form-label">Formato de Salida</label>
              <div className="pills-row">{["📊 Excel","📄 PDF","📋 CSV"].map(p=><span key={p} className={`pill ${p.includes("Excel")?"sel":""}`}>{p}</span>)}</div>
            </div>
            <div className="toggle-row"><span style={{fontSize:12}}>Incluir gráficos</span><div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
            <div className="toggle-row"><span style={{fontSize:12}}>Programar envío automático</span><div className="toggle" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
            <div className="toggle-row"><span style={{fontSize:12}}>Marca de agua PROCENTER</span><div className="toggle on" onClick={e=>(e.target as HTMLElement).classList.toggle("on")}/></div>
          </div>
          <div className="card">
            <div className="card-title">Vista Previa</div>
            <div style={{background:"#F4F5F7",borderRadius:8,padding:12,border:"1px solid #E5E7EB"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <ProcenterIsotipo size={20}/>
                <div><div style={{fontSize:12,fontWeight:700}}>PROCENTER ERP — CSI Seguridad</div><div style={{fontSize:10,color:"#6B7280"}}>Inventario Mensual · Abr 2024</div></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:11}}>
                <thead><tr style={{background:"#1B1F2E",color:"#fff"}}><th style={{padding:"4px 8px",textAlign:"left" as const}}>Código</th><th style={{padding:"4px 8px"}}>Artículo</th><th style={{padding:"4px 8px"}}>Stock</th><th style={{padding:"4px 8px",textAlign:"right" as const}}>Valor</th></tr></thead>
                <tbody>
                  <tr style={{borderBottom:"1px solid #E5E7EB"}}><td style={{padding:"3px 8px"}}>INV-HR-00158</td><td style={{padding:"3px 8px"}}>Taladro DeWalt</td><td style={{padding:"3px 8px",textAlign:"center" as const}}>22</td><td style={{padding:"3px 8px",textAlign:"right" as const}}>$69,300</td></tr>
                  <tr style={{background:"#FAFAFA"}}><td style={{padding:"3px 8px"}}>HI-SKU-0210</td><td style={{padding:"3px 8px"}}>Escalera Tijera</td><td style={{padding:"3px 8px",textAlign:"center" as const}}>18</td><td style={{padding:"3px 8px",textAlign:"right" as const}}>$11,250</td></tr>
                  <tr><td style={{padding:"3px 8px",color:"#9CA3AF"}}>···</td><td></td><td></td><td></td></tr>
                </tbody>
              </table>
              <div style={{marginTop:6,display:"flex",justifyContent:"center",gap:6}}>
                {["ISO 9001","ISO 27001"].map(t=><span key={t} style={{padding:"1px 6px",background:"#FFF3ED",color:"#E8611A",borderRadius:"9999px",fontSize:9,fontWeight:700,border:"1px solid #FED7AA"}}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
