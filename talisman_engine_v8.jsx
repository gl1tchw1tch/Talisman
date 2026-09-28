import { useState, useEffect, useCallback, useMemo } from "react";

// ─── FONT INJECTION ───────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
  const _s = document.createElement("style");
  _s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #070604; }
    ::-webkit-scrollbar-thumb { background: #2a1e0d; border-radius: 3px; }
    button { cursor: pointer; }
  `;
  document.head.appendChild(_s);
}

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#070604", bg2:"#0f0b06", bg3:"#16100a",
  border:"#2a1e0d", border2:"#3d2e14",
  gold:"#d4a843", gold2:"#f0c060", amber:"#c47c3b",
  crimson:"#8b1a1a", crimson2:"#b22222",
  silver:"#a8b4c0", muted:"#6b5533", text:"#e8d5a8", dim:"#8b7355",
  purple:"#6b3d8b",
};

const QUARTER_COLOR = { East:C.gold, South:C.crimson2, West:C.silver, North:C.amber };
const QUARTER_KING  = { East:"Oriens · Fire · Spring", South:"Amaymon · Fire · Summer", West:"Paymon · Water · Autumn", North:"Egin · Earth · Winter" };

// ─── NATAL DATA ───────────────────────────────────────────────────────────────
const NATAL = {
  sun:80.64, moon:264.12, mercury:103.75, venus:61.10, mars:104.25,
  jupiter:22.88, saturn:257.65, uranus:264.90, neptune:277.07,
  pluto:217.50, asc:289.83, nn:8.80
};

// ─── EPHEMERIS (day 0 = current local date when engine loads; keeps rolling forward) ─
const EPH = {
  sun:    { base:5.5,   motion:0.9856 },
  moon:   { base:152.0, motion:13.176 },
  mercury:{ base:358.2, motion:1.380  },
  venus:  { base:42.5,  motion:1.214  },
  mars:   { base:115.8, motion:0.524  },
  jupiter:{ base:66.4,  motion:0.083  },
  saturn: { base:9.8,   motion:0.033  },
};
const NATURE   = { sun:2, moon:1, mercury:0.5, venus:2, mars:-1, jupiter:3, saturn:-2 };
const N_WEIGHT = { sun:2, moon:2, mercury:1.5, venus:1, mars:1.5, jupiter:2, saturn:1, asc:1.5, nn:2 };

function norm(d){ return ((d%360)+360)%360; }
function getPos(planet,day){ const e=EPH[planet]; return norm(e.base+e.motion*day); }
function getAspect(a,b){
  const diff=Math.abs(norm(a-b)); const d=diff>180?360-diff:diff;
  const orb=d<1?1.8:d<3?1.2:1;
  if(d<8) return {type:"conjunction",score:1*orb};
  if(Math.abs(d-60)<6) return {type:"sextile",score:0.6*orb};
  if(Math.abs(d-90)<8) return {type:"square",score:-0.5*orb};
  if(Math.abs(d-120)<8) return {type:"trine",score:0.8*orb};
  if(Math.abs(d-180)<8) return {type:"opposition",score:-0.7*orb};
  return null;
}
function scoreDay(day){
  let total=0; const hits=[];
  Object.keys(EPH).forEach(tp=>{
    const tPos=getPos(tp,day); const tNature=NATURE[tp]||0;
    Object.keys(NATAL).forEach(np=>{
      const asp=getAspect(tPos,NATAL[np]);
      if(asp){
        const nw=N_WEIGHT[np]||1; const pts=tNature*asp.score*nw; total+=pts;
        if(Math.abs(pts)>0.8) hits.push({transit:tp,natal:np,type:asp.type,pts:pts.toFixed(1)});
      }
    });
  });
  return {score:total,hits};
}
function buildDays(){
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({length:32},(_,i)=>{
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const {score,hits}=scoreDay(i);
    return {day:i,date,score,hits};
  });
}
