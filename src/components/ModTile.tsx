import React from "react";

export function ModTile({icon,name,desc,sub,alert,badge,badgeColor,onClick}:{icon:string;name:string;desc:string;sub?:string;alert?:string;badge?:string;badgeColor?:string;onClick:()=>void}) {
  return (
    <div onClick={onClick}
      style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"16px 14px",cursor:"pointer",transition:"all .15s",display:"flex",flexDirection:"column" as const,alignItems:"center",textAlign:"center" as const,gap:8,position:"relative"}}
      onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E8611A";(e.currentTarget as HTMLDivElement).style.boxShadow="0 6px 18px rgba(232,97,26,.12)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}}
      onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLDivElement).style.boxShadow="none";(e.currentTarget as HTMLDivElement).style.transform="";}}>
      {alert&&<span style={{position:"absolute",top:8,right:8,background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:"9999px"}}>{alert}</span>}
      <div style={{fontSize:28,lineHeight:1}}>{icon}</div>
      <div style={{fontSize:12.5,fontWeight:700,color:"#1B1F2E",lineHeight:1.3}}>{name}</div>
      <div style={{fontSize:10.5,color:"#6B7280",lineHeight:1.4}}>{desc}</div>
      {sub&&<div style={{fontSize:10,color:badge?"#fff":"#9CA3AF",background:badgeColor||"transparent",padding:badge?"2px 8px":"0",borderRadius:"9999px",fontWeight:badge?600:400}}>{badge||sub}</div>}
    </div>
  );
}
