import React, { useState } from "react";
import { ProcenterIsotipo } from "./Logo";
import type { Company } from "../types";
import { COMPANIES } from "../data/empresas";

export function LoginScreen({onLogin}:{onLogin:()=>void}) {
  const [usuario,setUsuario]=useState("");
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handle=()=>{
    if(!usuario||!password){setError("Ingresa tu usuario y contraseña.");return;}
    setError("");setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin();},900);
  };
  const inp:React.CSSProperties={width:"100%",padding:"13px 46px",border:"1.5px solid #E5E7EB",borderRadius:"10px",fontSize:"13.5px",fontFamily:"inherit",color:"#1B1F2E",background:"#F9FAFB",outline:"none",transition:"all .18s"};
  const onF=(e:React.FocusEvent<HTMLInputElement>)=>{e.target.style.borderColor="#E8611A";e.target.style.background="#fff";e.target.style.boxShadow="0 0 0 3px rgba(232,97,26,.1)";};
  const onB=(e:React.FocusEvent<HTMLInputElement>)=>{e.target.style.borderColor="#E5E7EB";e.target.style.background="#F9FAFB";e.target.style.boxShadow="none";};

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFFFFF",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        {/* Logo horizontal centrado */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:"36px"}}>
          <ProcenterIsotipo size={50}/>
          <div>
            <div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:"26px",fontWeight:800,letterSpacing:"-.5px",lineHeight:1}}>
              <span style={{color:"#E8611A"}}>PRO</span><span style={{color:"#3D3D3D"}}>CENTER</span>
            </div>
            <div style={{fontSize:"11px",color:"#9CA3AF",fontStyle:"italic",marginTop:"3px"}}>— El centro de control de tus procesos —</div>
          </div>
        </div>

        {/* Card login */}
        <div style={{background:"#fff",borderRadius:"16px",padding:"34px 30px 28px",border:"1px solid #E5E7EB",boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:"19px",fontWeight:700,textAlign:"center",marginBottom:"22px",color:"#1B1F2E",fontFamily:"'Poppins','Inter',sans-serif"}}>Iniciar Sesión</div>

          {error&&<div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:"8px",padding:"9px 12px",marginBottom:"14px",fontSize:"12px",color:"#DC2626"}}>{error}</div>}

          <div style={{position:"relative",marginBottom:"12px"}}>
            <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"#9CA3AF",fontSize:"16px",pointerEvents:"none"}}>👤</span>
            <input type="text" placeholder="Usuario" value={usuario} onChange={e=>setUsuario(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} style={inp} onFocus={onF} onBlur={onB}/>
            <span style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",color:"#D1D5DB",fontSize:"14px"}}>👤</span>
          </div>

          <div style={{position:"relative",marginBottom:"20px"}}>
            <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"#9CA3AF",fontSize:"15px",pointerEvents:"none"}}>🔑</span>
            <input type={showPass?"text":"password"} placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} style={inp} onFocus={onF} onBlur={onB}/>
            <span style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",color:"#D1D5DB",fontSize:"13px",cursor:"pointer"}} onClick={()=>setShowPass(!showPass)}>{showPass?"🔓":"🔑"}</span>
          </div>

          <button onClick={handle} disabled={loading}
            style={{width:"100%",padding:"14px",background:loading?"#E5E7EB":"linear-gradient(135deg,#E8611A,#F97316)",color:loading?"#9CA3AF":"#fff",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:700,fontFamily:"'Poppins','Inter',sans-serif",letterSpacing:"1px",cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 16px rgba(232,97,26,.32)",transition:"all .2s"}}>
            {loading?"Verificando...":"INGRESAR"}
          </button>

          <a href="#" onClick={e=>e.preventDefault()} style={{display:"block",textAlign:"center",marginTop:"16px",fontSize:"13px",color:"#E8611A",textDecoration:"none",fontWeight:500}}>
            ¿Olvidaste tu Contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export function CompanySelector({onSelect}:{onSelect:(c:Company)=>void}) {
  const [sel,setSel]=useState<Company|null>(null);
  const [search,setSearch]=useState("");

  const groups=[
    {label:"Grupo CSI",emoji:"🏛️",ids:["csi","as","sitepro"],desc:"3 empresas"},
    {label:"BPO RRHH",emoji:"📋",ids:["bpo-retail","bpo-salud"],desc:"20 clientes"},
    {label:"Empresa independiente",emoji:"🏢",ids:["solo"],desc:"1 empresa"},
  ];

  const filtered=(ids:string[])=>COMPANIES.filter(c=>
    ids.includes(c.id)&&(!search||c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{minHeight:"100vh",background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 20px"}}>
      <div style={{marginBottom:"28px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:5}}>
          <ProcenterIsotipo size={38}/>
          <div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:"22px",fontWeight:800,letterSpacing:"-.3px"}}>
            <span style={{color:"#E8611A"}}>PRO</span><span style={{color:"#3D3D3D"}}>CENTER</span>
          </div>
        </div>
        <div style={{fontSize:"11px",color:"#9CA3AF",fontStyle:"italic"}}>— El centro de control de tus procesos —</div>
      </div>

      <div style={{width:"100%",maxWidth:"740px",background:"#fff",borderRadius:"20px",border:"1px solid #E5E7EB",boxShadow:"0 8px 40px rgba(0,0,0,.07)",overflow:"hidden"}}>
        <div style={{height:"4px",background:"linear-gradient(90deg,#E8611A,#F97316)"}}/>
        <div style={{padding:"28px 32px 32px"}}>
          <div style={{fontSize:"20px",fontWeight:700,fontFamily:"'Poppins','Inter',sans-serif",color:"#1B1F2E",marginBottom:3}}>Bienvenido, Ronald 👋</div>
          <div style={{fontSize:"13px",color:"#6B7280",marginBottom:"22px"}}>Selecciona la empresa con la que deseas trabajar hoy</div>

          <div style={{display:"flex",alignItems:"center",gap:8,background:"#F9FAFB",border:"1.5px solid #E5E7EB",borderRadius:"10px",padding:"10px 14px",marginBottom:"22px"}}>
            <span style={{color:"#9CA3AF",fontSize:15}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa..." style={{border:"none",background:"transparent",outline:"none",flex:1,fontSize:"13px",color:"#1B1F2E"}}/>
          </div>

          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".8px",color:"#9CA3AF",marginBottom:"10px"}}>⚡ Acceso rápido — últimas sesiones</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[COMPANIES[0],COMPANIES[2]].map(c=>(
                <div key={c.id} onClick={()=>{setSel(c);setTimeout(()=>onSelect(c),150);}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:"12px",border:"1.5px solid #E5E7EB",cursor:"pointer",transition:"all .15s",background:"#FAFAFA"}}
                  onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E8611A";(e.currentTarget as HTMLDivElement).style.background="#FFF8F5";}}
                  onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLDivElement).style.background="#FAFAFA";}}>
                  <div style={{width:38,height:38,borderRadius:10,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1B1F2E",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                    <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:1}}>Hace 2h · {c.meta}</div>
                  </div>
                  <span style={{fontSize:11,color:"#E8611A",fontWeight:700,flexShrink:0}}>→</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"20px"}}>
            <div style={{flex:1,height:1,background:"#F3F4F6"}}/>
            <span style={{fontSize:11,color:"#9CA3AF"}}>Todas las empresas</span>
            <div style={{flex:1,height:1,background:"#F3F4F6"}}/>
          </div>

          {groups.map(g=>{
            const items=filtered(g.ids);
            if(!items.length) return null;
            return (
              <div key={g.label} style={{marginBottom:"20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:"10px"}}>
                  <span style={{fontSize:13}}>{g.emoji}</span>
                  <span style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".8px",color:"#9CA3AF"}}>{g.label}</span>
                  <span style={{fontSize:"10px",color:"#D1D5DB"}}>— {g.desc}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(items.length,3)},1fr)`,gap:"8px"}}>
                  {items.map(c=>{
                    const isSel=sel?.id===c.id;
                    return (
                      <div key={c.id} onClick={()=>setSel(c)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:"12px",border:`1.5px solid ${isSel?"#E8611A":"#E5E7EB"}`,background:isSel?"#FFF3ED":"#fff",cursor:"pointer",transition:"all .15s"}}
                        onMouseOver={e=>{if(!isSel){(e.currentTarget as HTMLDivElement).style.borderColor="#F97316";(e.currentTarget as HTMLDivElement).style.background="#FFFAF7";}}}
                        onMouseOut={e=>{if(!isSel){(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLDivElement).style.background="#fff";}}}>
                        <div style={{width:34,height:34,borderRadius:9,background:c.color+"1A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,border:`1px solid ${c.color}30`}}>{c.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:isSel?"#E8611A":"#1B1F2E",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                          <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.meta}</div>
                        </div>
                        {isSel
                          ? <div style={{width:20,height:20,borderRadius:"50%",background:"#E8611A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span></div>
                          : <div style={{width:20,height:20,borderRadius:"50%",border:"1.5px solid #E5E7EB",flexShrink:0}}/>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button disabled={!sel} onClick={()=>sel&&onSelect(sel)}
            style={{width:"100%",marginTop:"8px",padding:"14px",background:sel?"linear-gradient(135deg,#E8611A,#F97316)":"#F3F4F6",color:sel?"#fff":"#9CA3AF",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:700,fontFamily:"'Poppins','Inter',sans-serif",letterSpacing:".4px",cursor:sel?"pointer":"not-allowed",boxShadow:sel?"0 4px 16px rgba(232,97,26,.28)":"none",transition:"all .2s"}}>
            {sel?`Entrar a ${sel.name} →`:"Selecciona una empresa para continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
