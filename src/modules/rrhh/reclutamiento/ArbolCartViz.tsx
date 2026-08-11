import React from "react";
import type { ArbolCartNodo } from "../../../types";

export function ArbolCartViz({nodos,width=1200,height=500}:{nodos:Record<string,ArbolCartNodo>;width?:number;height?:number}) {
  const positions: Record<string,{x:number;y:number}> = {};

  const calcPos = (levelIndex:number, posInLevel:number): {x:number;y:number} => {
    const levelCount = Math.pow(2, levelIndex);
    const spacing = (width-100) / (levelCount + 1);
    const x = 50 + spacing * (posInLevel + 0.5);
    const y = 50 + levelIndex * 110;
    return {x, y};
  };

  const getResultColor = (resultado:string) => {
    if(resultado==="CONTRATAR") return {bg:"#ECFDF5",border:"#6EE7B7",text:"#065F46"};
    if(resultado==="SEGUNDA ENTREVISTA") return {bg:"#EFF6FF",border:"#BFDBFE",text:"#1D4ED8"};
    if(resultado==="EN ESPERA") return {bg:"#FFFBEB",border:"#FDE68A",text:"#92400E"};
    return {bg:"#FEF2F2",border:"#FCA5A5",text:"#991B1B"};
  };

  const renderTreeSVG = (nodoId:string, level:number, pos:number): React.ReactNode[] => {
    const currentPos = calcPos(level, pos);
    positions[nodoId] = currentPos;
    const elements: React.ReactNode[] = [];

    if(!nodoId.startsWith("n")) {
      const colors = getResultColor(nodoId);
      elements.push(
        <g key={`result-${nodoId}-${level}-${pos}`}>
          <rect x={currentPos.x-65} y={currentPos.y-22} width="130" height="44" fill={colors.bg} stroke={colors.border} strokeWidth="2.5" rx="8"/>
          <text x={currentPos.x} y={currentPos.y+6} textAnchor="middle" fill={colors.text} fontSize="12" fontWeight="700">
            {nodoId.length>15 ? nodoId.substring(0,12)+"..." : nodoId}
          </text>
        </g>
      );
      return elements;
    }

    const n = nodos[nodoId];
    if(!n) return elements;

    elements.push(
      <g key={`decision-${nodoId}`}>
        <rect x={currentPos.x-70} y={currentPos.y-22} width="140" height="44" fill="#1B1F2E" stroke="#374151" strokeWidth="2.5" rx="8"/>
        <text x={currentPos.x} y={currentPos.y-4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
          {n.pregunta.length>20 ? n.pregunta.substring(0,17)+"..." : n.pregunta}
        </text>
      </g>
    );

    const siPos = calcPos(level + 1, pos * 2);
    elements.push(
      <g key={`line-si-${nodoId}`}>
        <line x1={currentPos.x-35} y1={currentPos.y+22} x2={siPos.x} y2={siPos.y-25} stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrowGreen)"/>
        <text x={(currentPos.x-35+siPos.x)/2} y={(currentPos.y+22+siPos.y-25)/2-5} fill="#10B981" fontSize="11" fontWeight="700">Sí</text>
      </g>
    );
    elements.push(...renderTreeSVG(n.siNode, level + 1, pos * 2));

    const noPos = calcPos(level + 1, pos * 2 + 1);
    elements.push(
      <g key={`line-no-${nodoId}`}>
        <line x1={currentPos.x+35} y1={currentPos.y+22} x2={noPos.x} y2={noPos.y-25} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)"/>
        <text x={(currentPos.x+35+noPos.x)/2} y={(currentPos.y+22+noPos.y-25)/2-5} fill="#EF4444" fontSize="11" fontWeight="700">No</text>
      </g>
    );
    elements.push(...renderTreeSVG(n.noNode, level + 1, pos * 2 + 1));

    return elements;
  };

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{minWidth:Math.min(width,800)}}>
      <defs>
        <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#10B981"/>
        </marker>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#EF4444"/>
        </marker>
      </defs>
      {nodos.n1 ? renderTreeSVG("n1", 0, 0) : null}
    </svg>
  );
}
