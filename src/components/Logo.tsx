import React from "react";
import logo from "../assets/logo-procenter.png";

export function ProcenterIsotipo({size=32}:{size?:number}) {
  return (
    <img
      src={logo}
      alt="PROCENTER Isotipo"
      style={{height:`${size}px`, width:"auto", objectFit:"contain"}}
    />
  );
}

export function ProcenterLogo({variant="light",size="md"}:{variant?:"light"|"dark";size?:"sm"|"md"|"lg"}) {
  const s={sm:22,md:30,lg:44}[size];
  const fs={sm:"13px",md:"15px",lg:"21px"}[size];
  return (
    <div style={{display:"flex",alignItems:"center",gap:size==="lg"?12:8}}>
      <ProcenterIsotipo size={s}/>
      <div>
        <div style={{fontFamily:"'Poppins','Inter',sans-serif",fontSize:fs,fontWeight:800,letterSpacing:"-.3px",lineHeight:1}}>
          <span style={{color:variant==="light"?"#F97316":"#E8611A"}}>PRO</span>
          <span style={{color:variant==="light"?"#fff":"#3D3D3D"}}>CENTER</span>
        </div>
        {size!=="sm"&&<div style={{fontSize:"10px",color:variant==="light"?"rgba(255,255,255,.45)":"#9CA3AF",fontStyle:"italic",marginTop:"2px"}}>— El centro de control de tus procesos —</div>}
      </div>
    </div>
  );
}
