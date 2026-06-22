import React, { useState } from "react";
import type { View } from "../../types";

export function RegistrarIngreso({setView}:{setView:(v:View)=>void}) {
  const [items,setItems]=useState([{cod:"INV-HR-00158",name:"Taladro DeWalt 20V",qty:10,costo:3150}]);

  return (
    <div className="content">
      <div className="page-header">
        <div><div className="page-title">Registrar Ingreso</div><div className="page-subtitle">Entrada de artículos al inventario · Con o sin orden de compra · ISO 9001</div></div>
        <button className="btn btn-secondary btn-sm" onClick={()=>setView("inventario")}>← Inventario</button>
      </div>
      <div className="g2" style={{alignItems:"start"}}>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Tipo de Ingreso</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {([["oc","📋 Con Orden de Compra","#EFF6FF","#BFDBFE","#1D4ED8",true],["directo","📦 Ingreso Directo","#ECFDF5","#6EE7B7","#065F46",false],["devolucion","↩ Devolución","#FFF3ED","#FED7AA","#92400E",false]] as [string,string,string,string,string,boolean][]).map(([id,label,bg,bd,ct,active])=>(
                <div key={id} style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${active?ct:bd}`,background:active?bg:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12.5,fontWeight:active?700:500,color:active?ct:"#374151"}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Datos del Proveedor / OC</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Proveedor</label><select className="form-control"><option>TechnoSupply</option><option>SafetyPro</option><option>ToolMaster</option></select></div>
              <div className="form-group"><label className="form-label">Número OC / Folio</label><input className="form-control" defaultValue="OC-2024-028"/></div>
            </div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Número de Factura</label><input className="form-control" placeholder="FAC-2024-..."/></div>
              <div className="form-group"><label className="form-label">Fecha de Factura</label><input type="date" className="form-control"/></div>
            </div>
            <div className="form-group"><label className="form-label">Condiciones de Pago</label><select className="form-control"><option>30 días crédito</option><option>Contado</option><option>60 días</option></select></div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Artículos Recibidos</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div className="header-search" style={{flex:1}}><span>🔍</span><input placeholder="Buscar artículo..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"12.5px"}}/></div>
              <button className="btn btn-primary btn-sm" onClick={()=>setItems(p=>[...p,{cod:"INV-EQO-00041",name:"Multímetro Digital",qty:2,costo:890}])}>➕ Agregar</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th>Costo Unit.</th><th>Total</th><th>Lote</th><th></th></tr></thead>
              <tbody>
                {items.map((item,i)=>(
                  <tr key={i}>
                    <td><b style={{fontSize:11.5,fontFamily:"monospace"}}>{item.cod}</b></td>
                    <td style={{fontSize:12.5}}>{item.name}</td>
                    <td><input type="number" className="form-control" defaultValue={item.qty} min={1} style={{width:60}}/></td>
                    <td><input type="number" className="form-control" defaultValue={item.costo} style={{width:80}}/></td>
                    <td style={{fontWeight:600,color:"#E8611A"}}>${(item.qty*item.costo).toLocaleString()}</td>
                    <td><input className="form-control" placeholder="Lote..." style={{width:80}}/></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-title">Bodega de Destino</div>
            <div className="g2">
              <div className="form-group"><label className="form-label">Bodega</label><select className="form-control"><option>Bodega Central</option><option>Bodega 2</option><option>Bodega 3</option></select></div>
              <div className="form-group"><label className="form-label">Responsable recepción</label><select className="form-control"><option>Jules Ramirez</option><option>María Rojas</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={2} placeholder="Estado del pedido, condiciones de entrega..."/></div>
            <div className="form-group"><label className="form-label">Factura / Remisión (adjunto)</label><div className="photo-box" style={{padding:12}}><span>📎</span><span style={{fontSize:11,color:"#6B7280",marginLeft:8}}>Adjuntar documentos</span></div></div>
          </div>
        </div>
        <div>
          <div className="resumen" style={{marginBottom:12}}>
            <div className="panel-title" style={{marginBottom:8}}>Resumen de Ingreso</div>
            <div className="res-row"><span className="res-label">Folio</span><span className="res-val" style={{fontFamily:"monospace",color:"#10B981"}}>ENT-2024-042</span></div>
            <div className="res-row"><span className="res-label">Proveedor</span><span className="res-val">TechnoSupply</span></div>
            <div className="res-row"><span className="res-label">OC vinculada</span><span className="res-val">OC-2024-028</span></div>
            <div className="res-row"><span className="res-label">Artículos</span><span className="res-val">{items.length}</span></div>
            <div className="res-row"><span className="res-label">Valor Total</span><span className="res-val" style={{color:"#10B981",fontWeight:700}}>${items.reduce((s,i)=>s+i.qty*i.costo,0).toLocaleString()}</span></div>
            <div className="res-row"><span className="res-label">Bodega destino</span><span className="res-val">Bodega Central</span></div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="card-title" style={{fontSize:12}}>Lista de verificación</div>
            {["Factura recibida y revisada","Cantidades verificadas físicamente","Productos sin daños visibles","Proveedor coincide con OC","Lotes y series registrados"].map(c=>(
              <label key={c} style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,padding:"4px 0",cursor:"pointer"}}><input type="checkbox"/>{c}</label>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-secondary" style={{width:"100%"}} onClick={()=>setView("inventario")}>Cancelar</button>
            <button className="btn btn-success" style={{width:"100%"}} onClick={()=>alert(`✅ Ingreso ENT-2024-042 registrado.\n\nProveedor: TechnoSupply\n${items.length} artículos · $${items.reduce((s,i)=>s+i.qty*i.costo,0).toLocaleString()} MXN`)}>📥 Confirmar Ingreso</button>
          </div>
        </div>
      </div>
    </div>
  );
}
