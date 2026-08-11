import React from "react";
import type { GraficaConstructor } from "../../types";
import { BI_FUENTES } from "../../data/catalogos";

export function RenderGraficaBI({g}:{g:GraficaConstructor}) {
  const fuente=BI_FUENTES[g.fuente];
  if(!fuente) return <div style={{textAlign:"center",padding:20,color:"#9CA3AF",fontSize:12}}>Fuente no encontrada</div>;
  const vX=fuente.variables.find(v=>v.key===g.varX)||fuente.variables[0];
  const vY=fuente.variables.find(v=>v.key===g.varY)||vX;
  const dX:number[]=vX?.datos()||[];
  const dY:number[]=vY?.datos()||dX;
  const labs:string[]=fuente.etiquetas;
  const mX=Math.max(...dX,1);
  const mY=Math.max(...dY,1);
  const col=g.color||"#E8611A";
  const W=300,H=160;
  const fmt2=(v:number)=>v>=1000000?Math.round(v/1000000)+"M":v>=1000?Math.round(v/1000)+"K":v;
  const ySc=(v:number,mn:number,mx:number)=>H-30-Math.round(((v-mn)/(mx-mn||1))*(H-40));

  if(g.tipo==="barras"){
    const bw=Math.floor((W-42)/dX.length);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {[0,50,100].map(p=>{const y=H-28-((p/100)*(H-38));return<g key={p}><line x1="36" y1={y} x2={W-5} y2={y} stroke="#F3F4F6" strokeWidth="0.5"/><text x="34" y={y+3} textAnchor="end" fontSize="7" fill="#9CA3AF">{fmt2(mX*p/100)}</text></g>;})}
      {dX.map((v,i)=>{const x=38+i*bw+2;const bh=Math.max(2,Math.round((v/mX)*(H-38)));const y=H-28-bh;return<g key={i}><rect x={x} y={y} width={bw-4} height={bh} fill={col} rx="2" opacity=".85"/><text x={x+(bw-4)/2} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{(labs[i]||"").split(" ")[0]}</text><text x={x+(bw-4)/2} y={y-2} textAnchor="middle" fontSize="6.5" fill={col} fontWeight="bold">{fmt2(v)}</text></g>;})}
    </svg>;
  }

  if(g.tipo==="barras_h"){
    const sorted=[...dX.map((v,i)=>({v,l:labs[i]||`#${i+1}`}))].sort((a,b)=>b.v-a.v);
    const rh=Math.floor((H-14)/sorted.length);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {sorted.map((d,i)=>{const bw=Math.round((d.v/mX)*(W-110));const y=8+i*rh;return<g key={i}><text x={88} y={y+rh/2+3} textAnchor="end" fontSize="7.5" fill="#6B7280">{d.l.split(" ")[0]}</text><rect x={92} y={y+2} width={Math.max(2,bw)} height={rh-6} fill={col} rx="2" opacity=".85"/><text x={96+bw} y={y+rh/2+3} fontSize="7" fill={col} fontWeight="bold">{fmt2(d.v)}</text></g>;})}
    </svg>;
  }

  if(g.tipo==="lineas"||g.tipo==="area"){
    const n=dX.length;const mn=Math.min(...dX);
    const pts=dX.map((v,i)=>`${38+i*(W-48)/(n-1)},${ySc(v,mn,mX)}`).join(" ");
    const area=`38,${H-28} `+pts+` ${38+(n-1)*(W-48)/(n-1)},${H-28}`;
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {g.tipo==="area"&&<polygon points={area} fill={col} fillOpacity=".15"/>}
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {dX.map((v,i)=>{const x=38+i*(W-48)/(n-1);const y=ySc(v,mn,mX);return<g key={i}><circle cx={x} cy={y} r="3" fill={col}/><text x={x} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{(labs[i]||"").split(" ")[0]}</text></g>;})}
    </svg>;
  }

  if(g.tipo==="lineas_multi"){
    const n=dX.length;const mn=Math.min(...dX,...dY);const mx2=Math.max(...dX,...dY,1);
    const pX=dX.map((v,i)=>`${38+i*(W-48)/(n-1)},${ySc(v,mn,mx2)}`).join(" ");
    const pY=dY.map((v,i)=>`${38+i*(W-48)/(n-1)},${ySc(v,mn,mx2)}`).join(" ");
    const c2="#3B82F6";
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <polyline points={pX} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round"/>
      <polyline points={pY} fill="none" stroke={c2} strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3"/>
      {dX.map((_,i)=><text key={i} x={38+i*(W-48)/(n-1)} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{(labs[i]||"").split(" ")[0]}</text>)}
      <rect x={W-85} y={6} width={80} height={26} fill="white" rx="3" stroke="#E5E7EB" strokeWidth=".5"/>
      <line x1={W-82} y1={13} x2={W-74} y2={13} stroke={col} strokeWidth="2"/>
      <text x={W-71} y={16} fontSize="7" fill={col}>{vX?.label.split(" ")[0]}</text>
      <line x1={W-82} y1={23} x2={W-74} y2={23} stroke={c2} strokeWidth="2" strokeDasharray="3,2"/>
      <text x={W-71} y={26} fontSize="7" fill={c2}>{vY?.label.split(" ")[0]}</text>
    </svg>;
  }

  if(g.tipo==="histograma"){
    const sorted2=[...dX].sort((a,b)=>a-b);
    const bins=5;const mn2=sorted2[0];const mx2=sorted2[sorted2.length-1];const step=(mx2-mn2)/bins||1;
    const counts=Array(bins).fill(0);
    sorted2.forEach(v=>{const b=Math.min(Math.floor((v-mn2)/step),bins-1);counts[b]++;});
    const mC=Math.max(...counts,1);const bw=Math.floor((W-42)/bins);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {counts.map((c,i)=>{const x=38+i*bw+1;const bh=Math.max(2,Math.round((c/mC)*(H-38)));const y=H-28-bh;const lo=Math.round(mn2+i*step);return<g key={i}><rect x={x} y={y} width={bw-2} height={bh} fill={col} rx="1" opacity=".8"/><text x={x+bw/2-1} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{fmt2(lo)}</text>{c>0&&<text x={x+bw/2-1} y={y-2} textAnchor="middle" fontSize="7" fill={col} fontWeight="bold">{c}</text>}</g>;})}
      <text x={W/2} y={H-4} textAnchor="middle" fontSize="7" fill="#9CA3AF">n={dX.length}</text>
    </svg>;
  }

  if(g.tipo==="circular"){
    const total=dX.reduce((a,b)=>a+b,0)||1;
    const cols2=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444","#06B6D4","#84CC16"];
    let ang=-Math.PI/2;const cx=H/2+8;const cy=H/2;const r=H/2-10;
    const slices=dX.map((v,i)=>{const s=ang;const sw=(v/total)*2*Math.PI;ang+=sw;const x1=cx+r*Math.cos(s);const y1=cy+r*Math.sin(s);const x2=cx+r*Math.cos(ang);const y2=cy+r*Math.sin(ang);const large=sw>Math.PI?1:0;const mx2=cx+(r*0.62)*Math.cos(s+sw/2);const my=cy+(r*0.62)*Math.sin(s+sw/2);return{path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`,c:cols2[i%cols2.length],mx:mx2,my,pct:Math.round(v/total*100),l:(labs[i]||`#${i+1}`).split(" ")[0]};});
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {slices.map((s,i)=><g key={i}><path d={s.path} fill={s.c} opacity=".85" stroke="#fff" strokeWidth="1.5"/>{s.pct>5&&<text x={s.mx} y={s.my} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{s.pct}%</text>}</g>)}
      {slices.map((s,i)=><g key={`l${i}`}><rect x={H+18} y={8+i*14} width={9} height={7} fill={s.c} rx="1"/><text x={H+30} y={15+i*14} fontSize="7.5" fill="#374151">{s.l}</text></g>)}
    </svg>;
  }

  if(g.tipo==="pareto"){
    const sorted2=[...dX.map((v,i)=>({v,l:(labs[i]||`#${i+1}`).split(" ")[0]}))].sort((a,b)=>b.v-a.v);
    const total=sorted2.reduce((a,b)=>a+b.v,0)||1;const bw=Math.floor((W-42)/sorted2.length);
    let acum=0;const acums=sorted2.map(d=>{acum+=d.v/total*100;return acum;});
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {sorted2.map((d,i)=>{const x=38+i*bw+2;const bh=Math.max(2,Math.round((d.v/sorted2[0].v)*(H-38)));const y=H-28-bh;return<g key={i}><rect x={x} y={y} width={bw-4} height={bh} fill={col} rx="1" opacity=".8"/><text x={x+bw/2-2} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{d.l}</text></g>;})}
      <polyline points={sorted2.map((_,i)=>`${38+(i+0.5)*bw},${H-28-Math.round(acums[i]/100*(H-38))}`).join(" ")} fill="none" stroke="#E8611A" strokeWidth="2" strokeLinejoin="round"/>
      {acums.map((a,i)=><circle key={i} cx={38+(i+0.5)*bw} cy={H-28-Math.round(a/100*(H-38))} r="3" fill="#E8611A"/>)}
      {(()=>{const y=H-28-Math.round(0.8*(H-38));return<><line x1="38" y1={y} x2={W-5} y2={y} stroke="#EF4444" strokeWidth="1" strokeDasharray="4,3"/><text x={42} y={y-2} fontSize="7" fill="#EF4444">80%</text></>;})()}
    </svg>;
  }

  if(g.tipo==="dispersion"||g.tipo==="burbuja"){
    const mnX=Math.min(...dX);const mnY=Math.min(...dY);const rX=mX-mnX||1;const rY=mY-mnY||1;
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      <line x1="38" y1={H-28} x2={W-5} y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {dX.map((vx,i)=>{const vy=dY[i]||0;const cx=38+Math.round((vx-mnX)/rX*(W-50));const cy=H-28-Math.round((vy-mnY)/rY*(H-38));const r2=g.tipo==="burbuja"?Math.max(3,Math.min(10,vx/mX*10)):4;return<g key={i}><circle cx={cx} cy={cy} r={r2} fill={col} opacity=".7" stroke="white" strokeWidth="1"/><text x={cx+r2+2} y={cy+3} fontSize="6.5" fill="#6B7280">{(labs[i]||"").split(" ")[0]}</text></g>;})}
      <text x={W/2} y={H-4} textAnchor="middle" fontSize="7" fill="#9CA3AF">{vX?.label}</text>
    </svg>;
  }

  if(g.tipo==="spc_xbar"){
    const mean2=dX.reduce((a,b)=>a+b,0)/dX.length;
    const sd=Math.sqrt(dX.reduce((a,b)=>a+(b-mean2)**2,0)/dX.length)||1;
    const ucl=mean2+3*sd;const lcl=Math.max(0,mean2-3*sd);const range=ucl-lcl||1;
    const sc2=(v:number)=>H-28-Math.round(((v-lcl)/range)*(H-38));
    const pts=dX.map((v,i)=>`${38+i*(W-48)/(dX.length-1)},${sc2(v)}`).join(" ");
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1={sc2(ucl)} x2={W-5} y2={sc2(ucl)} stroke="#EF4444" strokeWidth="1" strokeDasharray="4,3"/>
      <line x1="38" y1={sc2(mean2)} x2={W-5} y2={sc2(mean2)} stroke="#10B981" strokeWidth="1.5"/>
      <line x1="38" y1={sc2(lcl)} x2={W-5} y2={sc2(lcl)} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4,3"/>
      <text x={W-3} y={sc2(ucl)+3} fontSize="6.5" fill="#EF4444">UCL</text>
      <text x={W-3} y={sc2(mean2)+3} fontSize="6.5" fill="#10B981">X̄</text>
      <text x={W-3} y={sc2(lcl)+3} fontSize="6.5" fill="#3B82F6">LCL</text>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
      {dX.map((v,i)=>{const x=38+i*(W-48)/(dX.length-1);const y=sc2(v);const out=v>ucl||v<lcl;return<circle key={i} cx={x} cy={y} r={out?5:3} fill={out?"#EF4444":col} stroke={out?"#fff":undefined} strokeWidth={out?1.5:0}/>;})}</svg>;
  }

  if(g.tipo==="capacidad"){
    const mean2=dX.reduce((a,b)=>a+b,0)/dX.length;const sd=Math.sqrt(dX.reduce((a,b)=>a+(b-mean2)**2,0)/dX.length)||1;
    const lsl=mean2-3*sd;const usl=mean2+3*sd;
    const pts=Array.from({length:60},(_,i)=>{const x=lsl+(i/59)*(usl-lsl);const y=Math.exp(-0.5*((x-mean2)/sd)**2);return{x,y};});
    const maxY2=pts.reduce((a,b)=>Math.max(a,b.y),0)||1;
    const svgP=pts.map(p=>`${38+Math.round((p.x-lsl)/(usl-lsl)*(W-48))},${H-28-Math.round((p.y/maxY2)*(H-42))}`).join(" ");
    const cp=((usl-lsl)/(6*sd)).toFixed(2);const cpk=Math.min((usl-mean2)/(3*sd),(mean2-lsl)/(3*sd)).toFixed(2);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <polygon points={`38,${H-28} ${svgP} ${W-10},${H-28}`} fill={col} fillOpacity=".12"/>
      <polyline points={svgP} fill="none" stroke={col} strokeWidth="2.5"/>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1={W-10} y1="10" x2={W-10} y2={H-28} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,3"/>
      <text x={38} y={8} fontSize="7" fill="#EF4444" textAnchor="start">LSL</text>
      <text x={W-10} y={8} fontSize="7" fill="#EF4444" textAnchor="end">USL</text>
      <text x={W/2} y={H-4} textAnchor="middle" fontSize="8" fill="#1B1F2E" fontWeight="bold">Cp: {cp} · Cpk: {cpk}</text>
    </svg>;
  }

  if(g.tipo==="boxplot"){
    const sorted2=[...dX].sort((a,b)=>a-b);const n=sorted2.length;
    const q1=sorted2[Math.floor(n/4)];const med=sorted2[Math.floor(n/2)];const q3=sorted2[Math.floor(3*n/4)];
    const iqr=q3-q1;const wlo=Math.max(sorted2[0],q1-1.5*iqr);const whi=Math.min(sorted2[n-1],q3+1.5*iqr);
    const mn2=Math.min(...dX);const sc2=(v:number)=>H-28-Math.round(((v-mn2)/(mX-mn2||1))*(H-38));
    const cx=W/2;const bw=55;
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1="10" x2="38" y2={H-28} stroke="#E5E7EB" strokeWidth="1"/>
      {[0,25,50,75,100].map(p=>{const y=H-28-((p/100)*(H-38));return<g key={p}><line x1="38" y1={y} x2={W-5} y2={y} stroke="#F3F4F6" strokeWidth="0.5"/><text x="36" y={y+3} textAnchor="end" fontSize="6.5" fill="#9CA3AF">{fmt2(Math.round(mX*p/100))}</text></g>;})}
      <line x1={cx} y1={sc2(whi)} x2={cx} y2={sc2(q3)} stroke={col} strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1={cx} y1={sc2(q1)} x2={cx} y2={sc2(wlo)} stroke={col} strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1={cx-bw/3} y1={sc2(whi)} x2={cx+bw/3} y2={sc2(whi)} stroke={col} strokeWidth="2"/>
      <line x1={cx-bw/3} y1={sc2(wlo)} x2={cx+bw/3} y2={sc2(wlo)} stroke={col} strokeWidth="2"/>
      <rect x={cx-bw/2} y={sc2(q3)} width={bw} height={sc2(q1)-sc2(q3)} fill={col} fillOpacity=".2" stroke={col} strokeWidth="2" rx="2"/>
      <line x1={cx-bw/2} y1={sc2(med)} x2={cx+bw/2} y2={sc2(med)} stroke={col} strokeWidth="3"/>
      {sorted2.filter(v=>v<wlo||v>whi).map((v,i)=><circle key={i} cx={cx+(i%2===0?-8:8)} cy={sc2(v)} r="3" fill="none" stroke={col} strokeWidth="1.5"/>)}
      <text x={cx+bw/2+4} y={sc2(med)+3} fontSize="7" fill={col}>Med:{fmt2(med)}</text>
    </svg>;
  }

  if(g.tipo==="radar"){
    const n=Math.min(dX.length,8);const datos2=dX.slice(0,n);const max2=Math.max(...datos2,1);
    const cx=H/2+5;const cy=H/2;const r=H/2-14;
    const pts2=datos2.map((v,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n);const rv=(v/max2)*r;return{x:cx+rv*Math.cos(ang),y:cy+rv*Math.sin(ang),lx:cx+(r+14)*Math.cos(ang),ly:cy+(r+14)*Math.sin(ang),l:(labs[i]||`#${i+1}`).split(" ")[0]};});
    const polygon=pts2.map(p=>`${p.x},${p.y}`).join(" ");
    const axes=datos2.map((_,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n);return{x2:cx+r*Math.cos(ang),y2:cy+r*Math.sin(ang)};});
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {[0.25,0.5,0.75,1].map(f=>{const rr=r*f;const pp=datos2.map((_,i)=>{const ang=-Math.PI/2+(i*2*Math.PI/n);return`${cx+rr*Math.cos(ang)},${cy+rr*Math.sin(ang)}`;}).join(" ");return<polygon key={f} points={pp} fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>;})
      }{axes.map((a,i)=><line key={i} x1={cx} y1={cy} x2={a.x2} y2={a.y2} stroke="#E5E7EB" strokeWidth="0.5"/>)}
      <polygon points={polygon} fill={col} fillOpacity=".22" stroke={col} strokeWidth="2"/>
      {pts2.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="3" fill={col}/><text x={p.lx} y={p.ly+3} textAnchor="middle" fontSize="6.5" fill="#6B7280">{p.l}</text></g>)}
    </svg>;
  }

  if(g.tipo==="heatmap"){
    const cols2=4;const rows=Math.ceil(dX.length/cols2);const cw=Math.floor((W-38)/cols2);const ch=Math.floor((H-16)/rows);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {dX.map((v,i)=>{const c=i%cols2;const row=Math.floor(i/cols2);const intensity=v/mX;const r2=Math.round(232*intensity+229*(1-intensity));const gg=Math.round(97*intensity+229*(1-intensity));const b=Math.round(26*intensity+229*(1-intensity));const fill=`rgb(${r2},${gg},${b})`;const x=38+c*cw;const y=8+row*ch;return<g key={i}><rect x={x} y={y} width={cw-2} height={ch-2} fill={fill} rx="2"/><text x={x+cw/2} y={y+ch/2+3} textAnchor="middle" fontSize="7" fill={intensity>0.5?"#fff":"#374151"} fontWeight="bold">{fmt2(v)}</text><text x={x+cw/2} y={y+ch-3} textAnchor="middle" fontSize="6" fill={intensity>0.5?"rgba(255,255,255,.6)":"#9CA3AF"}>{(labs[i]||"").split(" ")[0]}</text></g>;})}
    </svg>;
  }

  if(g.tipo==="waterfall"){
    const bw=Math.floor((W-42)/dX.length);let running=0;
    const bars=dX.map((v,i)=>{const base=running;running+=v;return{v,base,c:v>=0?"#10B981":"#EF4444",l:(labs[i]||`#${i+1}`).split(" ")[0]};});
    const allV=[0,...bars.map(b=>b.base+b.v)];const mn2=Math.min(...allV);const mx2=Math.max(...allV);const rng=mx2-mn2||1;
    const sc2=(v:number)=>H-28-Math.round((v-mn2)/rng*(H-38));
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1="38" y1={sc2(0)} x2={W-5} y2={sc2(0)} stroke="#E5E7EB" strokeWidth="1"/>
      {bars.map((b,i)=>{const x=38+i*bw+2;const y1=sc2(b.base);const y2=sc2(b.base+b.v);const top=Math.min(y1,y2);const h=Math.max(2,Math.abs(y2-y1));return<g key={i}><rect x={x} y={top} width={bw-4} height={h} fill={b.c} rx="1" opacity=".8"/><text x={x+bw/2-2} y={H-16} textAnchor="middle" fontSize="6.5" fill="#6B7280">{b.l}</text><text x={x+bw/2-2} y={top-2} textAnchor="middle" fontSize="6.5" fill={b.c} fontWeight="bold">{b.v>0?"+":""}{fmt2(b.v)}</text></g>;})}
    </svg>;
  }

  if(g.tipo==="treemap"){
    const total=dX.reduce((a,b)=>a+b,0)||1;const cols2=["#E8611A","#3B82F6","#10B981","#7C3AED","#F59E0B","#EF4444","#06B6D4","#84CC16"];
    let xc=4;
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {dX.map((v,i)=>{const w2=Math.round((v/total)*(W-8));const x=xc;xc+=w2;const c=cols2[i%cols2.length];return<g key={i}><rect x={x} y={4} width={Math.max(1,w2-2)} height={H-8} fill={c} rx="3" opacity=".85"/>{w2>28&&<><text x={x+w2/2-1} y={H/2} textAnchor="middle" fontSize="8.5" fill="#fff" fontWeight="bold">{(labs[i]||"").split(" ")[0]}</text><text x={x+w2/2-1} y={H/2+12} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,.75)">{Math.round(v/total*100)}%</text></>}</g>;})}
    </svg>;
  }

  if(g.tipo==="gauge"){
    const val=dX[0]||0;const pct=Math.min(val/mX,1);
    const ang=-Math.PI+pct*Math.PI;const cx=W/2;const cy=H/2+14;const r=H/2-12;
    const gColor=pct>=0.8?col:pct>=0.5?"#F59E0B":"#EF4444";
    return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="#E5E7EB" strokeWidth="14" strokeLinecap="round"/>
      <path d={`M${cx-r},${cy} A${r},${r} 0 ${pct>0.5?1:0},1 ${cx+r*Math.cos(ang)},${cy+r*Math.sin(ang)}`} fill="none" stroke={gColor} strokeWidth="14" strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={cx+r*0.85*Math.cos(ang)} y2={cy+r*0.85*Math.sin(ang)} stroke="#1B1F2E" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="5" fill="#1B1F2E"/>
      <text x={cx} y={cy-22} textAnchor="middle" fontSize="20" fontWeight="800" fill={gColor}>{Math.round(pct*100)}%</text>
      <text x={cx} y={cy+20} textAnchor="middle" fontSize="8.5" fill="#6B7280">{vX?.label}</text>
      <text x={cx-r-2} y={cy+16} fontSize="7" fill="#9CA3AF">0</text>
      <text x={cx+r+2} y={cy+16} textAnchor="start" fontSize="7" fill="#9CA3AF">{fmt2(mX)}</text>
    </svg>;
  }

  return <div style={{textAlign:"center",padding:"20px",color:"#9CA3AF",fontSize:12}}>
    <div style={{fontSize:24,marginBottom:6}}>📊</div>
    <div>Selecciona fuente y variable para generar la gráfica</div>
  </div>;
}
