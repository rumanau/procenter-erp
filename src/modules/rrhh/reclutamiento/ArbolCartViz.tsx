import React from "react";
import type { ArbolCartNodo } from "../../../types";

const NODE_W = 148, NODE_H = 50, LEAF_W = 128, LEAF_H = 44, LEVEL_GAP = 92, MARGIN_TOP = 36, MARGIN_X = 20, MARGIN_BOTTOM = 44;

const RESULT_STYLES: Record<string,{bg:string;border:string;text:string;icon:string}> = {
  "CONTRATAR": {bg:"#ECFDF5",border:"#10B981",text:"#065F46",icon:"✓"},
  "SEGUNDA ENTREVISTA": {bg:"#EFF6FF",border:"#3B82F6",text:"#1D4ED8",icon:"↪"},
  "EN ESPERA": {bg:"#FFFBEB",border:"#F59E0B",text:"#92400E",icon:"⏸"},
  "NO CONTINÚA": {bg:"#FEF2F2",border:"#EF4444",text:"#991B1B",icon:"✕"},
};
const getResultStyle = (r:string) => RESULT_STYLES[r] || {bg:"#F3F4F6",border:"#9CA3AF",text:"#374151",icon:"•"};

function wrapLines(text:string, maxCharsPerLine:number):string[] {
  if(text.length<=maxCharsPerLine) return [text];
  const words=text.split(" ");
  const lines:string[]=[]; let cur="";
  for(const w of words){
    const trial=cur?`${cur} ${w}`:w;
    if(trial.length>maxCharsPerLine&&cur){ lines.push(cur); cur=w; } else cur=trial;
  }
  if(cur) lines.push(cur);
  return lines.slice(0,2);
}

export function ArbolCartViz({nodos,width=1200,height=500}:{nodos:Record<string,ArbolCartNodo>;width?:number;height?:number}) {
  if(!nodos.n1) return <div style={{textAlign:"center" as const,color:"#9CA3AF",fontSize:12,padding:20}}>Sin árbol configurado.</div>;

  const leafMemo:Record<string,number>={};
  const countLeaves=(nodoId:string):number=>{
    if(leafMemo[nodoId]!==undefined) return leafMemo[nodoId];
    if(!nodoId.startsWith("n")||!nodos[nodoId]){ leafMemo[nodoId]=1; return 1; }
    const n=nodos[nodoId];
    const c=countLeaves(n.siNode)+countLeaves(n.noNode);
    leafMemo[nodoId]=c;
    return c;
  };
  const totalLeaves=countLeaves("n1");
  const UNIT=Math.max(90,(width-MARGIN_X*2)/totalLeaves);
  const contentWidth=Math.max(width,UNIT*totalLeaves+MARGIN_X*2);

  let maxDepth=0;
  const elements:React.ReactNode[]=[];
  let leafCursor=0;

  const place=(nodoId:string, depth:number, path:string):number=>{
    maxDepth=Math.max(maxDepth,depth);
    const y=MARGIN_TOP+depth*LEVEL_GAP;

    if(!nodoId.startsWith("n")||!nodos[nodoId]){
      const x=MARGIN_X+(leafCursor+0.5)*UNIT;
      leafCursor+=1;
      const st=getResultStyle(nodoId);
      const words=nodoId.split(" ");
      const line1=words.length>1?`${st.icon} ${words[0]}`:`${st.icon} ${nodoId}`;
      const line2=words.length>1?words.slice(1).join(" "):"";
      elements.push(
        <g key={`leaf-${path}`}>
          <rect x={x-LEAF_W/2} y={y-LEAF_H/2} width={LEAF_W} height={LEAF_H} fill={st.bg} stroke={st.border} strokeWidth="2" rx="10"/>
          <text x={x} y={line2?y-3:y+4} textAnchor="middle" fill={st.text} fontSize="10.5" fontWeight="700">
            <tspan x={x}>{line1}</tspan>
            {line2&&<tspan x={x} dy="13" fontSize="9.5">{line2}</tspan>}
          </text>
        </g>
      );
      return x;
    }

    const n=nodos[nodoId];
    const siX=place(n.siNode, depth+1, path+"s");
    const noX=place(n.noNode, depth+1, path+"n");
    const x=(siX+noX)/2;
    const midY=y+LEVEL_GAP/2;

    elements.push(
      <g key={`edge-si-${path}`}>
        <path d={`M ${x-28} ${y+NODE_H/2} L ${x-28} ${midY} L ${siX} ${midY} L ${siX} ${midY+LEVEL_GAP/2-LEAF_H/2}`} fill="none" stroke="#10B981" strokeWidth="2"/>
        <circle cx={siX} cy={midY} r="2.5" fill="#10B981"/>
        <rect x={x-28-15} y={midY-9} width="30" height="16" fill="#ECFDF5" rx="4"/>
        <text x={x-28} y={midY+3} textAnchor="middle" fill="#059669" fontSize="9.5" fontWeight="700">Sí</text>
      </g>
    );
    elements.push(
      <g key={`edge-no-${path}`}>
        <path d={`M ${x+28} ${y+NODE_H/2} L ${x+28} ${midY} L ${noX} ${midY} L ${noX} ${midY+LEVEL_GAP/2-LEAF_H/2}`} fill="none" stroke="#EF4444" strokeWidth="2"/>
        <circle cx={noX} cy={midY} r="2.5" fill="#EF4444"/>
        <rect x={x+28-15} y={midY-9} width="30" height="16" fill="#FEF2F2" rx="4"/>
        <text x={x+28} y={midY+3} textAnchor="middle" fill="#DC2626" fontSize="9.5" fontWeight="700">No</text>
      </g>
    );

    const lines=wrapLines(n.pregunta, 18);
    elements.push(
      <g key={`node-${path}`}>
        <rect x={x-NODE_W/2} y={y-NODE_H/2} width={NODE_W} height={NODE_H} fill="#1B1F2E" stroke="#111827" strokeWidth="1.5" rx="10"/>
        <text x={x} y={y+(lines.length>1?-2:4)} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
          {lines.map((l,i)=><tspan key={i} x={x} dy={i===0?0:12}>{l}</tspan>)}
        </text>
      </g>
    );

    return x;
  };

  place("n1",0,"r");
  const contentHeight=Math.max(height, MARGIN_TOP+maxDepth*LEVEL_GAP+MARGIN_BOTTOM);

  return (
    <div>
      <svg width="100%" height={Math.min(contentHeight,height)} viewBox={`0 0 ${contentWidth} ${contentHeight}`} style={{minWidth:Math.min(contentWidth,700),display:"block"}} preserveAspectRatio="xMidYMin meet">
        {elements}
      </svg>
      <div style={{display:"flex",gap:14,flexWrap:"wrap" as const,justifyContent:"center",marginTop:10,paddingTop:10,borderTop:"1px solid #E5E7EB"}}>
        {Object.entries(RESULT_STYLES).map(([label,st])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,borderRadius:3,background:st.bg,border:`2px solid ${st.border}`}}/>
            <span style={{fontSize:10.5,color:"#6B7280"}}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
