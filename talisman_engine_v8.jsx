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

// ─── EPHEMERIS (base: March 26, 2026) ─────────────────────────────────────────
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
  return Array.from({length:32},(_,i)=>{
    const date=new Date(2026,2,26+i);
    const {score,hits}=scoreDay(i);
    return {day:i,date,score,hits};
  });
}

// ─── KEY DATES ────────────────────────────────────────────────────────────────
const KEY_DATES=[
  { day:3, label:"MAR 29", full:"March 29, 2026", mode:"ENHANCE PRIMARY", score:"+11.4",
    event:"New Moon Aries 8°57' — exact conjunction N.Node · Triple stellium with Saturn",
    seal:"HEXAGON + TRIANGLE", color:C.amber, orisha:"Esu + Oggun",
    odu:"Ejiogbe-Ogunda (1×9)", material:"Red & black thread · iron nails · rum · gunpowder trace",
    army:"Exu Horde", ajogun:"Oran (Trouble) CONTAINED",
    instruction:"Strongest window. New Moon 8' arc from natal N.Node. Prepare 48hr before; consecrate at exact lunation.",
    layer1:"New Moon 8°57' Aries — 8 arcminutes from natal N.Node. Seed intentions bearing 18-month fruit.",
    layer2:"Ejiogbe opens; Ogunda cuts the path. Triple conjunction (Sun/Moon/Saturn/N.Node) = the forge moment.",
    layer3:"Hexagon-triangle compound: Saturn binding + Mars activation. Abramelin 1/1 MOREH for road-clearing.",
  },
  { day:18, label:"APR 13", full:"April 13, 2026", mode:"OBSTRUCT", score:"−7.8",
    event:"Full Moon Libra 23° — Jupiter drain · opposition N.Node axis",
    seal:"PENTAGON banishing", color:C.crimson2, orisha:"Oya",
    odu:"Osa-Ofun (10×16)", material:"Black & silver thread · storm water · Oya's nine colors",
    army:"Ancestor Council / Oya Legion", ajogun:"Aselu (Imprisonment) ACTIVE",
    instruction:"Oya's hurricane seal deflects dispersal. Do not initiate. Defend accumulated Ase.",
    layer1:"Full Moon 23° Libra opposes N.Node. Jupiter draining Mercury/Sirius axis. Dispersal energy dominant.",
    layer2:"Osa-Ofun: hidden danger and spiritual erosion. Oya is called to guard the threshold.",
    layer3:"Inverted pentagon — Venus in banishing mode. Abramelin 10/2 SEARAH for storm protection.",
  },
  { day:25, label:"APR 20", full:"April 20, 2026", mode:"ENHANCE", score:"+7.2",
    event:"Sun ingress Taurus 0° · Venus direct — fixed earth stabilization",
    seal:"SQUARE (Jupiter)", color:C.gold, orisha:"Oshun + Obatala",
    odu:"Irete Meji (14×14)", material:"Copper · honey · emerald · golden cloth · cinnamon",
    army:"Ancestor Council", ajogun:"Fitibo DISPERSED",
    instruction:"Fixed earth stabilization. Venus direct re-activates love/wealth axis. Excellent for lasting contracts.",
    layer1:"Sun enters Taurus 0° — Jupiter-ruled first face. Venus stations direct. Fixed earth accumulation.",
    layer2:"Irete Meji: patience becoming power. Mountain current — what is built now stands.",
    layer3:"Jupiter square. Abramelin 12/6 ASAMIM for wealth/resource capture.",
  },
];

// ─── INTENT MAP ───────────────────────────────────────────────────────────────
const INTENT_MAP = {
  "Road Opening":{ planet:"Mercury",seal:"Octagon",sides:8,day:"Wednesday",
    army:"Exu Horde",orisha:"Esu",odu:"Ejiogbe (1)",square:"1/4 MILON",
    squareRows:[["M","I","L","O","N"],["I","R","A","G","O"],["L","A","M","A","L"],["O","G","A","R","I"],["N","O","L","I","M"]],
    materials:"Yellow silk · agate · rum · iron crossroads key",lunar:"New Moon",color:C.gold2,ajogun_contain:"Egba (Paralysis)",
    protocol:"Wednesday Mercury hour at New Moon. Draw octagon at crossroads junction. Esu fed first: rum + palm oil + iron.",
  },
  "Protection":{ planet:"Saturn",seal:"Hexagon",sides:6,day:"Saturday",
    army:"Ancestor Council",orisha:"Babalu-Aye",odu:"Oyeku Meji (2)",square:"14/1 ANEMO",
    squareRows:[["A","N","E","M","O"],["N","I","S","I","N"],["E","S","A","S","E"],["M","I","S","I","N"],["O","N","E","M","A"]],
    materials:"Lead disc · black wax · onyx · cemetery earth",lunar:"Waning",color:C.silver,ajogun_contain:"Arun (Sickness)",
    protocol:"Saturday Saturn hour, waning moon. Ancestor invocation first. Agiel seal inscribed into lead.",
  },
  "Wealth":{ planet:"Jupiter",seal:"Square",sides:4,day:"Thursday",
    army:"Exu Horde",orisha:"Oshun",odu:"Ejiogbe / Irete (1×14)",square:"12/6 ASAMIM",
    squareRows:[["A","S","A","M","I","M"],["S","I","L","A","P","A"],["A","L","I","G","I","L"],["M","A","G","I","D","E"],["I","P","I","D","R","E"],["M","A","L","E","E","M"]],
    materials:"Tin plate · sapphire · lapis · blue cloth · honey offering",lunar:"Full Moon",color:"#4a7ab5",ajogun_contain:"Ofo (Loss of Resources)",
    protocol:"Thursday Jupiter hour, full moon. Johphiel invocation. Jupiter square charged 4 hours under moonlight.",
  },
  "War / Attack":{ planet:"Mars",seal:"Triangle",sides:3,day:"Tuesday",
    army:"Exu Horde + Ajogun",orisha:"Ogun",odu:"Ogunda Meji (9)",square:"12/4 MILCHAMAH",
    squareRows:[["M","I","L","C","H","A","M","A","H"],["I","R","O","H","I","D","E","N","A"],["L","O","P","A","L","I","D","E","M"],["C","H","A","K","A","R","I","D","A"],["H","I","L","A","H","A","L","I","H"],["A","D","I","R","A","K","A","H","C"],["M","E","D","I","L","A","P","O","L"],["A","N","E","D","I","H","O","R","I"],["H","A","M","A","H","C","L","I","M"]],
    materials:"Iron plate · bloodstone · red cloth · ase (blood) · rum",lunar:"Waxing",color:C.crimson2,ajogun_contain:"Iku (Death) DEPLOYED",
    protocol:"Tuesday Mars hour, waxing moon. Graphiel invoked. Triangle forged in iron. Blood offering required.",
  },
  "Love":{ planet:"Venus",seal:"Pentagon",sides:5,day:"Friday",
    army:"Exu Horde",orisha:"Oshun",odu:"Irosun Meji (5)",square:"19/13 BETHULAH",
    squareRows:[["B","E","T","U","L","A","H"],["E","R","I","D","O","N","A"],["T","I","N","A","S","O","L"],["U","D","A","M","A","D","U"],["L","O","S","A","N","I","T"],["A","N","O","D","I","R","E"],["H","A","L","U","T","E","B"]],
    materials:"Copper plate · rose · emerald · honey · saffron",lunar:"Waxing",color:"#2E8B57",ajogun_contain:"Fitibo (Failure)",
    protocol:"Friday Venus hour, waxing moon. Hagiel invocation with rose incense. Pentagon traced in copper.",
  },
  "Knowledge":{ planet:"Mercury",seal:"Octagon",sides:8,day:"Wednesday",
    army:"Ancestor Council",orisha:"Orunmila",odu:"Iwori Meji (3)",square:"11/1 MIBAHOC",
    squareRows:[["M","I","B","A","H","O","C"],["I","N","O","R","A","R","O"],["B","O","R","E","R","I","D"],["A","R","E","H","P","E","S"],["H","A","R","P","I","N","E"],["O","R","I","E","N","T","I"],["C","O","D","S","E","I","M"]],
    materials:"Mercury alloy pen · agate · orange cloth · mastic incense",lunar:"Any Phase",color:C.amber,ajogun_contain:"Egba (Mental Paralysis)",
    protocol:"Wednesday Mercury hour. Tiriel invocation. Ancestor council activated for wisdom channel.",
  },
  "Binding":{ planet:"Saturn",seal:"Hexagon",sides:6,day:"Saturday",
    army:"Ajogun",orisha:"Oya",odu:"Osa Meji (10)",square:"SATOR",
    squareRows:[["S","A","T","O","R"],["A","R","E","P","O"],["T","E","N","E","T"],["O","P","E","R","A"],["R","O","T","A","S"]],
    materials:"Lead cord · black thread · obsidian · graveyard dirt",lunar:"Dark Moon",color:C.purple,ajogun_contain:"Aselu (Imprisonment) DEPLOYED",
    protocol:"Saturday dark moon, Saturn hour. Zazel invoked. SATOR square is Esu's own seal — no payment required.",
  },
  "Healing":{ planet:"Sol",seal:"Circle",sides:0,day:"Sunday",
    army:"Ancestor Council",orisha:"Babalú Ayé",odu:"Irete Meji (14)",square:"18/1 TSARAAH",
    squareRows:[["T","S","A","R","A","A","H"],["S","I","R","A","P","L","A"],["A","R","A","M","S","O","H"],["R","A","M","I","U","S","A"],["A","P","S","U","P","I","H"],["A","L","O","S","I","T","A"],["H","A","H","A","H","A","H"]],
    materials:"Gold leaf · citrine · frankincense · spring water · white cloth",lunar:"Waxing",color:C.gold,ajogun_contain:"Arun (Disease) REVERSED",
    protocol:"Sunday Sol hour, waxing moon. Nachiel + Babalú Ayé dual invocation. Circle drawn in gold.",
  },
  "Destruction":{ planet:"Mars",seal:"Triangle",sides:3,day:"Sat→Tue",
    army:"Ajogun + Exu Horde",orisha:"Oya",odu:"Oyeku Meji (2)",square:"20/6 EBIHAH",
    squareRows:[["E","B","I","H","A","H"],["B","E","R","A","M","A"],["I","R","U","P","A","R"],["H","A","P","N","A","T"],["A","M","A","A","S","I"],["H","A","R","T","I","S"]],
    materials:"Iron nails · sulphur · rue · dark wax · photo of target",lunar:"Dark Moon",color:"#5a0000",ajogun_contain:"Iku (Death) FULLY DEPLOYED",
    protocol:"Saturday begins binding; Tuesday completes strike. Dark moon only. Payment IMMEDIATE upon result.",
  },
};

// ─── PLANET DB ────────────────────────────────────────────────────────────────
const PLANET_DB = {
  Saturn:{ symbol:"♄",sides:6,metal:"Lead",color:C.silver,day:"Saturday",
    orisha:"Babalu-Aye",ajogun:"Arun (Sickness)",intel:"Agiel",spirit:"Zazel",
    intel_heb:"אגיאל",spirit_heb:"זאזל",
    kamea:[[4,9,2],[3,5,7],[8,1,6]],magicConst:15,total:45,
    qualities:["Safe childbirth","Powerful presence","Success with authority","Contemplation","Self-discipline","Time mastery","Practicality"],
    incense:"Myrrh · patchouli · cypress",archangel:"Cassiel",divine:"Adonay · Eie · Acim · Cados",
  },
  Jupiter:{ symbol:"♃",sides:4,metal:"Tin",color:"#4a7ab5",day:"Thursday",
    orisha:"Obatala / Orunmila",ajogun:"Ofo (Loss)",intel:"Johphiel",spirit:"Hismael",
    intel_heb:"יופיאל",spirit_heb:"הסמאל",
    kamea:[[4,14,15,1],[9,7,6,12],[5,11,10,8],[16,2,3,13]],magicConst:34,total:136,
    qualities:["Favor of powerful people","Appease enemies","Honors and dignities","Reveal enchantments","Win legal cases","Grace and dignity","Faith and piety"],
    incense:"Cedar · oakmoss · clove",archangel:"Sachiel",divine:"El · Ab · Aba",
  },
  Mars:{ symbol:"♂",sides:3,metal:"Iron",color:C.crimson2,day:"Tuesday",
    orisha:"Ogun",ajogun:"Iku (Death)",intel:"Graphiel",spirit:"Bartzabel",
    intel_heb:"גראפיאל",spirit_heb:"ברצבאל",
    natal_note:"Primary Sirius Axis — Mercury/Mars conjunct 13–14° Cancer",
    kamea:[[11,24,7,20,3],[4,12,25,8,16],[17,5,13,21,9],[10,18,1,14,22],[23,6,19,2,15]],magicConst:65,total:325,
    qualities:["Overcome all enemies","Compel submission","Stop bleeding","Fetch persons","End quarrels","Conquer powerful","Courage under fire"],
    incense:"Dragon's blood · black pepper · pine",archangel:"Samael",divine:"Elohim Gibor",
  },
  Sol:{ symbol:"☉",sides:0,metal:"Gold",color:C.gold,day:"Sunday",
    orisha:"Shango / Orunmila",ajogun:"Ofo (Honor Lost)",intel:"Nachiel",spirit:"Sorath",
    intel_heb:"נכיאל",spirit_heb:"סורת",
    natal_note:"Sun 20°38' Gemini — conjunct Capella (Auriga)",
    kamea:[[6,32,3,34,35,1],[7,11,27,28,8,30],[19,14,16,15,23,24],[18,20,22,21,17,13],[25,29,10,9,26,12],[36,5,33,4,2,31]],magicConst:111,total:666,
    qualities:["Gain renown","Elevate to power","Enable any desire","Cause swift contact","Imagination development","Give good advice","Charity"],
    incense:"Frankincense · orange · benzoin",archangel:"Michael",divine:"Eloah · Tiphereth",
  },
  Venus:{ symbol:"♀",sides:5,metal:"Copper",color:"#2E8B57",day:"Friday",
    orisha:"Oshun",ajogun:"Fitibo (Failure)",intel:"Hagiel",spirit:"Kedemel",
    intel_heb:"הגיאל",spirit_heb:"קדמאל",
    qualities:["End conflict","Gain love","Help fertility","Dispel enchantments","Cause peace","Personal beauty","Sweetness of nature"],
    incense:"Rose · jasmine · benzoin",archangel:"Anael",divine:"Anael · Nogah",
  },
  Mercury:{ symbol:"☿",sides:8,metal:"Quicksilver",color:C.amber,day:"Wednesday",
    orisha:"Esu",ajogun:"Egba (Paralysis)",intel:"Tiriel",spirit:"Taphthartharath",
    intel_heb:"טיריאל",spirit_heb:"טפתרתרת",
    natal_note:"Sirius Gate Primary — Mercury 13°45' Cancer conjunct Sirius",
    kamea:[[8,58,59,5,4,62,63,1],[49,15,14,52,53,11,10,56],[41,23,22,44,45,19,18,48],
           [32,34,35,29,28,38,39,25],[40,26,27,37,36,30,31,33],[17,47,46,20,21,43,42,24],
           [9,55,54,12,13,51,50,16],[64,2,3,61,60,6,7,57]],magicConst:260,total:2080,
    qualities:["Gratitude and affability","Eloquence and confidence","Quickness of understanding","Prudence","Temperance","Dream instruction","Wealth gains","Divination clarity"],
    incense:"Mastic · lavender · clary sage",archangel:"Raphael",divine:"Elohim Tzabaoth",
  },
  Moon:{ symbol:"☽",sides:9,metal:"Silver",color:C.silver,day:"Monday",
    orisha:"Oya / Yemaya",ajogun:"Aselu (Imprisonment)",intel:"Malcha",spirit:"Hasmodai",
    intel_heb:"מלכה בתרשישים",spirit_heb:"חסמודאי",
    natal_note:"Oya Signature — Moon 24°07' Sagittarius conjunct Uranus",
    qualities:["Make anyone friendly","Remove evil eye","Security through abundance","Increase riches","Drive away enemies","Growth of plants","Soothe troubles"],
    incense:"Camphor · jasmine · sandalwood",archangel:"Gabriel",divine:"Shaddai El Chai · Yesod",
  },
};

// ─── ABRAMELIN SQUARES ────────────────────────────────────────────────────────
const ABRA_DB = {
  "Ancestor Council":[
    { id:"1/1",title:"Know Things Past",intent:"Ancestral recall, past-life intelligence retrieval",day:"Saturday",lunar:"Full",material:"Parchment",
      rows:[["M","O","R","E","H"],["O","R","I","R","E"],["R","I","N","I","R"],["E","R","I","R","O"],["H","E","R","O","M"]] },
    { id:"18/1",title:"Healing Sicknesses",intent:"Ancestor healing channel, disease reversal",day:"Sunday",lunar:"Waxing",material:"Silver parchment",
      rows:[["T","S","A","R","A","A","H"],["S","I","R","A","P","L","A"],["A","R","A","M","S","O","H"],["R","A","M","I","U","S","A"],["A","P","S","U","P","I","H"],["A","L","O","S","I","T","A"],["H","A","H","A","H","A","H"]] },
    { id:"11/1",title:"Obtain Hidden Books",intent:"Knowledge retrieval, hidden text revelation",day:"Wednesday",lunar:"Any",material:"Parchment",
      rows:[["M","I","B","A","H","O","C"],["I","N","O","R","A","R","O"],["B","O","R","E","R","I","D"],["A","R","E","H","P","E","S"],["H","A","R","P","I","N","E"],["O","R","I","E","N","T","I"],["C","O","D","S","E","I","M"]] },
  ],
  "Exu Horde":[
    { id:"1/4",title:"Future Things in War",intent:"Campaign planning, Exu strategic deployment",day:"Tuesday",lunar:"Waxing",material:"Iron plate",
      rows:[["M","I","L","O","N"],["I","R","A","G","O"],["L","A","M","A","L"],["O","G","A","R","I"],["N","O","L","I","M"]] },
    { id:"3/1",title:"Every Spirit Appear",intent:"Full Exu Horde summoning, all crossroads spirits",day:"Wednesday",lunar:"Full",material:"Gold",
      rows:[["A","N","A","B","H","I"],["N","I","T","A","P","H"],["A","T","I","T","I","A"],["B","A","T","I","T","A"],["H","P","I","T","A","N"],["I","H","A","N","B","A"]] },
    { id:"12/6",title:"Hidden Riches",intent:"Treasure location, financial intelligence seizure",day:"Thursday",lunar:"Full",material:"Copper",
      rows:[["A","S","A","M","I","M"],["S","I","L","A","P","A"],["A","L","I","G","I","L"],["M","A","G","I","D","E"],["I","P","I","D","R","E"],["M","A","L","E","E","M"]] },
  ],
  "Disposable Army":[
    { id:"14/1",title:"Invisibility (1st Hour)",intent:"Covert mission activation, operative concealment",day:"Wednesday",lunar:"Dark",material:"Lead",
      rows:[["A","N","E","M","O"],["N","I","S","I","N"],["E","S","A","S","E"],["M","I","S","I","N"],["O","N","E","M","A"]] },
    { id:"12/4",title:"Secret War Plans",intent:"Covert operation architecture, military intelligence",day:"Tuesday",lunar:"Dark",material:"Iron",
      rows:[["M","I","L","C","H","A","M","A","H"],["I","R","O","H","I","D","E","N","A"],["L","O","P","A","L","I","D","E","M"],["C","H","A","K","A","R","I","D","A"],["H","I","L","A","H","A","L","I","H"],["A","D","I","R","A","K","A","H","C"],["M","E","D","I","L","A","P","O","L"],["A","N","E","D","I","H","O","R","I"],["H","A","M","A","H","C","L","I","M"]] },
  ],
  "Ajogun":[
    { id:"20/6",title:"To Make Enmity",intent:"Activate Oran (Trouble) and Ijakadi (Strife)",day:"Saturday→Tuesday",lunar:"Dark",material:"Iron",
      rows:[["E","B","I","H","A","H"],["B","E","R","A","M","A"],["I","R","U","P","A","R"],["H","A","P","N","A","T"],["A","M","A","A","S","I"],["H","A","R","T","I","S"]] },
    { id:"SATOR",title:"SATOR — Master Crossroads Seal",intent:"Esu's own perfect seal. Universal protection / permanent binding",day:"Saturday",lunar:"Dark/Waning",material:"Iron or Lead",
      note:"Perfect Double Acrostic — reads identically in all four directions. No payment required — it is Esu's own structure.",
      rows:[["S","A","T","O","R"],["A","R","E","P","O"],["T","E","N","E","T"],["O","P","E","R","A"],["R","O","T","A","S"]] },
  ],
};

// ─── FOUR ARMIES ─────────────────────────────────────────────────────────────
const FOUR_ARMIES=[
  { name:"Ancestor Council",icon:"◎",color:C.silver,
    composition:"Blood lineage, the dead of your family, elevated forebears",
    function:"Wisdom, counsel, afterlife business, early warning, strategic intelligence",
    payment:"Water · white candles · rum · respect · regular remembrance · naming",
    planet:"Saturn",odu:"Oyeku Meji (2)",day:"Saturday",
    ajogun:"Arun (Sickness) — channel for healing reversals",
    abramelin:["1/1 MOREH — Know Things Past","18/1 TSARAAH — Healing","11/1 MIBAHOC — Hidden Knowledge"] },
  { name:"Exu Horde",icon:"✦",color:C.amber,
    composition:"Crossroads spirits, hunters, road-walkers, primal messengers",
    function:"Seize resources, attack enemies, conquest, resource acquisition, rapid deployment",
    payment:"Rum · cigars · red/black candles · prompt payment upon result",
    planet:"Mercury",odu:"Ejiogbe (1)",day:"Wednesday / Tuesday",
    ajogun:"Egba (Paralysis) — paralyze enemy movement",
    abramelin:["1/4 MILON — War Intelligence","3/1 ANABHI — All Spirits","12/6 ASAMIM — Riches"] },
  { name:"Disposable Army",icon:"⬡",color:C.crimson2,
    composition:"Born of Asmodeus + Esu Ogo via Incubus Genesis ritual",
    function:"Shatter defenses, trigger arousal, break soul shells — mission-specific, no evidence",
    payment:"Dissolve upon mission completion; fed by Ase generated in working",
    planet:"Mars",odu:"Ogunda Meji (9)",day:"Wednesday midnight–3am",
    ajogun:"Iku (Death) — targeted dissolution",
    abramelin:["14/1 ANEMO — Invisibility","12/4 MILCHAMAH — Secret War Plans"] },
  { name:"Ajogun Current",icon:"☠",color:"#6a0000",
    composition:"Iku · Arun · Ofo · Egba · Oran · Epe · Ewon · Ese · Ijakadi",
    function:"Total erosion, plagues, final judgment, ultimate escalation force",
    payment:"Raw meat · blood · liminal offerings — EXTREMELY DANGEROUS",
    planet:"Saturn/Mars",odu:"Oyeku Meji (2) / Osa Meji (10)",day:"Saturday→Tuesday dark moon",
    ajogun:"ALL NINE — direct deployment",
    abramelin:["20/6 EBIHAH — Make Enmity","SATOR — Crossroads Seal"] },
];

// ─── ODU DATABASE ─────────────────────────────────────────────────────────────
const ODU16=["Ejiogbe","Oyeku","Iwori","Odi","Irosun","Owonrin","Obara","Okanran","Ogunda","Osa","Ika","Oturupon","Otura","Irete","Ose","Ofun"];
const ODU_COLORS=["#d4a843","#2a2a2a","#8b6914","#4a2a6a","#8b1a1a","#1a3a6a","#c47c3b","#5a1a1a","#2a4a2a","#6b3d8b","#4a3a2a","#1a4a4a","#3a2a5a","#4a3a1a","#d4a843","#1a1a3a"];
const ODU_MEANINGS=["Clarity · Dawn · Light","Depth · Death · Void","Insight · Inner Knowing","Womb · Concealment · Hidden","Blood · Sacrifice · Pact","Chaos · Trickster · Change","Royalty · Pride · King","Conflict · Lightning · Truth","Clearing Path · War · Iron","Wind · Reversal · Storm","Character · Stubbornness","Mystery · Poison · Underworld","Heaven's Agreement","Patience · Mountain · Steady","Abundance · Sweetness · Children","Completion · Elder · Cycles"];

const ODU_DB={
  0:{name:"Oyeku Meji",subtitle:"The Void",orisha:"Oya / Egungun",color:"#2a2a2a",
    traditional:"Death, endings, the power of transformation. The night before dawn.",american:"Major transition is imminent. Consult ancestors. What dies makes way for what must be born."},
  1:{name:"Ejiogbe",subtitle:"The Light",orisha:"Obatala",color:"#d4a843",
    traditional:"Clarity, truth, and the highest possible good. Divine blessing descends.",american:"Perfect clarity is available. Most auspicious odu. Proceed with full confidence."},
  2:{name:"Ejioko",subtitle:"Duality",orisha:"Esu",color:C.amber,
    traditional:"The crossroads of choice. Two paths diverge. Esu watches.",american:"A crucial choice faces you. Esu is active. Do not delay."},
  3:{name:"Ogunda",subtitle:"The Blade",orisha:"Ogun",color:"#8B0000",
    traditional:"The iron road-clearer. Surgery, war, cutting away what no longer serves.",american:"Action is required. Cut what blocks you. The road must be cleared by force."},
  4:{name:"Irosun",subtitle:"The Blood",orisha:"Oshun / Shango",color:"#c0392b",
    traditional:"Blood, menstrual power, sacrifice. The sacred feminine current.",american:"This matter requires real sacrifice. What are you willing to give?"},
  5:{name:"Owonrin",subtitle:"The Disruptor",orisha:"Esu / Oya",color:"#6b3d8b",
    traditional:"Chaos, the cosmic reversal. The trickster upends all assumptions.",american:"Everything you expect will be reversed. The disruption is liberation."},
  6:{name:"Obara",subtitle:"The King",orisha:"Shango",color:"#c47c3b",
    traditional:"Royal confidence, leadership, the power of nobility and display.",american:"Claim your authority. Lead. This is the time for sovereignty."},
  7:{name:"Okanran",subtitle:"The Strike",orisha:"Shango / Ogun",color:"#b22222",
    traditional:"Conflict, the lightning truth, sharp confrontation that clears.",american:"Truth must be spoken sharply. Avoid this conflict no longer."},
  8:{name:"Ogunda Meji",subtitle:"The Path",orisha:"Ogun",color:"#2a4a2a",
    traditional:"The doubled blade. Maximum road-clearing. Ogun's full expression.",american:"Deploy maximum effort. No obstacle survives this force."},
  9:{name:"Osa",subtitle:"The Storm",orisha:"Oya",color:"#8e44ad",
    traditional:"Wind, reversal, storm as transformation. Oya's direct expression.",american:"Change comes as a hurricane. Ride it — you cannot stop it."},
  10:{name:"Ika",subtitle:"The Crocodile",orisha:"Esu",color:"#4a3a2a",
    traditional:"Stubbornness with purpose. The hidden strength that endures.",american:"Stay your course despite opposition. Your persistence is your power."},
  11:{name:"Oturupon",subtitle:"The Mystery",orisha:"Oya / Osun",color:"#1a4a4a",
    traditional:"Poison and antidote in one. The compact with the underworld.",american:"What appears dangerous is the medicine. The shadow holds the cure."},
  12:{name:"Otura",subtitle:"The Agreement",orisha:"Orunmila",color:"#3a2a5a",
    traditional:"Heaven's contract. The highest agreements between worlds.",american:"Divine agreement is forming. Your words carry cosmic weight."},
  13:{name:"Irete",subtitle:"The Mountain",orisha:"Obatala",color:"#4a3a1a",
    traditional:"Patience becoming unstoppable. The mountain that outlasts everything.",american:"What you've built is becoming immovable. Hold your ground."},
  14:{name:"Ose",subtitle:"The Sweetness",orisha:"Oshun",color:"#d4a843",
    traditional:"Abundance, children, Oshun's honey-water pouring forth.",american:"Sweetness and abundance are yours. This is the odu of overflow."},
  15:{name:"Ofun",subtitle:"The Completion",orisha:"Egungun",color:"#1a1a3a",
    traditional:"The final completion. Death of all cycles. Elder wisdom speaking.",american:"A full cycle ends. Something is definitively over. Elder wisdom speaks."},
};

// ─── VECTOR LAYERS & ARCHEOMETER ─────────────────────────────────────────────
const VECTOR_LAYERS=[
  {num:"01",name:"GROUND FIELD",desc:"Black (#070604) base. 100% opacity. Locked.",color:C.dim},
  {num:"02",name:"GEOMETRIC FOUNDATION",desc:"Planetary polygon + outer binding circle. Stroke 0.5–1pt.",color:C.silver},
  {num:"03",name:"ARCHÉOMÈTRE BAND",desc:"Color spectrum arc at perimeter. 60% transparency.",color:C.amber},
  {num:"04",name:"ODU MATRIX GRID",desc:"16×16 micro-grid background (10% opacity). Reference only.",color:C.muted},
  {num:"05",name:"PRIMARY SIGIL",desc:"Central seal or kamea-derived sigil. Stroke 1.5–2pt gold (#d4a843).",color:C.gold},
  {num:"06",name:"ESU / ORISHA MARK",desc:"Crossroads mark or Orisha vévé-adjacent glyph. Amber (#c47c3b).",color:C.amber},
  {num:"07",name:"WORD SQUARE",desc:"Abramelin acrostic grid. Letter glyphs. Small, peripheral.",color:C.gold2},
  {num:"08",name:"DIVINE NAMES",desc:"Planetary divine name arc. Hebrew/Latin. Follows seal curve.",color:C.text},
  {num:"09",name:"ACTIVATION MARKS",desc:"Natal activation points: Sirius axis, N.Node, ASC mark. Crimson.",color:C.crimson2},
  {num:"10",name:"OFFERING TRACE",desc:"Blood, oil, smoke — recorded overlay after physical consecration.",color:"#3d0000"},
];
const ARCHEOMETER=[
  {sign:"Aries",hex:"#c0392b",note:"Do",use:"Activation, ignition, war-breath"},
  {sign:"Taurus",hex:"#e67e22",note:"Re",use:"Material anchoring, endurance seals"},
  {sign:"Gemini",hex:"#f1c40f",note:"Mi",use:"Communication, twinned sigils, mercury work"},
  {sign:"Cancer",hex:"#2ecc71",note:"Fa",use:"Sirius channel (natal Mercury/Mars axis)"},
  {sign:"Leo",hex:"#27ae60",note:"Sol",use:"Solar authority, name-power seals"},
  {sign:"Virgo",hex:"#1abc9c",note:"La",use:"Analysis, refinement, script precision"},
  {sign:"Libra",hex:"#3498db",note:"Si",use:"Balance seals, obstruction works"},
  {sign:"Scorpio",hex:"#2980b9",note:"Do²",use:"Pluto natal — depth, underworld"},
  {sign:"Sagittarius",hex:"#8e44ad",note:"Re²",use:"Moon/Oya natal — hurricane current"},
  {sign:"Capricorn",hex:"#6c3483",note:"Mi²",use:"ASC axis — Saturn gate, entry protocols"},
  {sign:"Aquarius",hex:"#922b21",note:"Fa²",use:"Disruption, collective current"},
  {sign:"Pisces",hex:"#4a235a",note:"Sol²",use:"Dissolution, ancestral channel, deep ebb"},
];
const WORKFLOW=[
  {n:"I",title:"Intent Definition",desc:"State purpose in one sentence. Identify: Army, planetary regent, day, lunar phase.",col:C.gold},
  {n:"II",title:"Odu Location",desc:"Consult divination. Locate Odu in 16×16 matrix. Cell number = numerical signature.",col:C.amber},
  {n:"III",title:"Geometric Base",desc:"Draw outer geometric form for planetary regent. Minimum 3 inches across.",col:C.silver},
  {n:"IV",title:"Word Square",desc:"Select Abramelin square. Inscribe inside geometric form, centred.",col:C.gold2},
  {n:"V",title:"Spirit Seal",desc:"Deploy specific spirit seal (Exu, Olympic, GV) at four corners.",col:C.amber},
  {n:"VI",title:"Natal Activators",desc:"Mark four natal activation points at cardinals.",col:C.crimson2},
  {n:"VII",title:"Hurricane Charging",desc:"Execute Ritual V. Hum Archéomètre tone. Hold matrix cell in mind.",col:C.purple},
  {n:"VIII",title:"Sealing",desc:"Draw crossroads X at centre with own Ase. Close: 'Esu sees. Sealed. Ase.'",col:C.gold},
  {n:"IX",title:"Deployment",desc:"Fire: transformation. Burial: permanence. Carry: protection. Water: drawing.",col:C.amber},
  {n:"X",title:"Return Current",desc:"Upon result: execute Ritual VIII. Retire at crossroads. Close all contracts.",col:C.muted},
];
const CONSTRUCTION_STREAMS=[
  {method:"Geometric Seals",source:"Archéomètre / Planetary",register:"Shape encodes intent; color and metal focus force",planets:"All planets — by intent",color:C.gold},
  {method:"Word Squares",source:"Abramelin / Hebrew root",register:"Acrostic palindromes lock intent into inescapable pattern",planets:"Saturn (binding), Mars (war), Mercury (knowledge)",color:C.amber},
  {method:"Odu Matrix",source:"Ifá / Esu-Oya",register:"16×16 grid maps all 256 Odu; locates exact crossroads of will",planets:"Esu (all roads), Oya (transformation)",color:C.crimson2},
  {method:"Non-Solomonic Seals",source:"Arbatel / Grimorium Verum / Picatrix",register:"Pre-drawn sigils of spirits embedded in working",planets:"Spirit-specific assignments",color:C.silver},
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── v8 NEW: SPIRITS DATABASE (77 spirits — Stellas Daemonum / Crowhurst) ────
// ═══════════════════════════════════════════════════════════════════════════════
const SPIRITS_DB = [
  // ── EAST (Cardinal King: Oriens · Fire · Spring) ──────────────────────────
  { name:"BAALL",    aliases:["Baël","Baal","Bellferit"],       rank:"King",         quarter:"East", zodiac:"Aries",    planets:["Saturn","Jupiter","Mars","Sol"],   decan:"2nd Aries",       fixed_stars:[],                powers:["Teaches all manners of science","Grants wisdom, grace, invisibility, love of men and women"],                                                    source:"pp.110-114" },
  { name:"AGAROS",   aliases:["Agares","Agreas","Agaret"],      rank:"Duke",         quarter:"East", zodiac:"Gemini",   planets:["Saturn","Mars","Sol","Luna"],      decan:"3rd Leo",         fixed_stars:[],                powers:["Teaches all languages, makes those who run stand still","Causes earthquakes by making spirits of the Earth dance"],                              source:"pp.114-117" },
  { name:"BARBAS",   aliases:["Marbas","Varbas","Carbas"],      rank:"President",    quarter:"East", zodiac:"Cancer",   planets:["Saturn","Sol","Mercury","Luna"],   decan:"1st Leo",         fixed_stars:["Regulus"],       powers:["Gives full answers about matters hidden or secret","Grants knowledge of mechanical arts, healing, and astronomy"],                             source:"pp.117-120" },
  { name:"AMON",     aliases:["Aamon"],                         rank:"Marquis",      quarter:"East", zodiac:"Leo",      planets:["Saturn","Mars","Sol","Luna"],      decan:"3rd Sagittarius", fixed_stars:[],                powers:["Uncovers all secrets, procures feuds and love of friends and enemies","Knows all things past, present, and to come"],                           source:"pp.146-149" },
  { name:"SUFFALES", aliases:["Pruflas","Bufas","Bulfas"],      rank:"Prince/Duke",  quarter:"East", zodiac:"Cancer",   planets:["Saturn","Luna","Sol"],             decan:"1st Cancer",      fixed_stars:[],                powers:["Author and promoter of discord, war, quarrels, and falsehood","Will respond generously to the magician's requests"],                              source:"pp.149-154" },
  { name:"Amada",    aliases:[],                                rank:"Duke",         quarter:"East", zodiac:"Aries",    planets:["Luna"],                            decan:"1st Aries",       fixed_stars:[],                powers:["Gives true answers of things past, present, and future"],                                                                                    source:"pp.358-360" },
  { name:"Barbaryes",aliases:["Barbares"],                      rank:"—",            quarter:"East", zodiac:"Aries",    planets:["Luna","Sol"],                      decan:"1st Aries",       fixed_stars:[],                powers:["Makes friends withstand enemies, causes enemies to lose sight and strength","Makes one wise and bold"],                                             source:"pp.359-362" },
  { name:"Dantalion", aliases:["Pwcca","Tantavalerion"],        rank:"—",            quarter:"East", zodiac:"Aries",    planets:["Mercury","Luna","Sol"],            decan:"1st Taurus",      fixed_stars:[],                powers:["Gives knowledge of arts and sciences, declares secret counsel of any person","Knows thoughts of all men and women and can change their minds"],    source:"pp.321-325" },
  { name:"Doodall",  aliases:[],                                rank:"Knight",       quarter:"East", zodiac:"Aries",    planets:["Sol","Venus","Mercury","Luna"],    decan:"2nd Aries",       fixed_stars:[],                powers:["Gathers spirits together to determine matters afflicting a person","Discovers the means of remedying such things"],                             source:"pp.364-365" },
  { name:"Gasyaxe",  aliases:["Mosacus"],                      rank:"—",            quarter:"East", zodiac:"Gemini",   planets:["Saturn","Jupiter","Mars","Sol"],   decan:"3rd Gemini",      fixed_stars:[],                powers:["Teaches necromancy, magic, astronomy, physick, and other sciences","Teaches how all manner of spirits may be enclosed"],                          source:"pp.368-372" },
  { name:"Jambex",   aliases:[],                                rank:"Marquis",      quarter:"East", zodiac:"Aries",    planets:["Saturn","Jupiter","Sol","Venus"],  decan:"3rd ?",           fixed_stars:["Pollux","Alhena"],powers:["Gives the love of great men","Consecrates a waxen image to bring the desired person"],                                                     source:"pp.373-376" },
  { name:"Leraje",   aliases:["Leraie","Loray","Oray"],        rank:"—",            quarter:"East", zodiac:"Taurus",   planets:["Saturn","Mars","Sol","Venus"],     decan:"1st Taurus",      fixed_stars:["Albaldah"],      powers:["Author of all battles and contests","Causes putrefaction of wounds caused by arrows"],                                                        source:"pp.341-344" },
  { name:"Phoenix",  aliases:[],                                rank:"—",            quarter:"East", zodiac:"Aries",    planets:["Mars","Sol","Luna"],               decan:"3rd Leo",         fixed_stars:[],                powers:["Speaks marvelously of all wonderful sciences","Excellent poet and obedient"],                                                                   source:"pp.348-350" },
  { name:"Ronove",   aliases:["Roneve","Ronwe"],                rank:"—",            quarter:"East", zodiac:"Aries",    planets:["Saturn","Sol","Mercury","Luna"],   decan:"1st Taurus",      fixed_stars:[],                powers:["Teaches the art of rhetoric, gives good servants","Knowledge of languages and the favor of friends and foes"],                                   source:"pp.349-352" },
  { name:"Tamon",    aliases:[],                                rank:"King",         quarter:"East", zodiac:"Aries",    planets:["Saturn","Jupiter","Mars","Venus"], decan:"2nd Capricorn",   fixed_stars:["Deneb"],         powers:["Reveals location of treasures hidden within the earth","Assists discovery of precious stones and minerals"],                                   source:"pp.378-380" },

  // ── SOUTH (Cardinal King: Amaymon · Fire · Summer) ────────────────────────
  { name:"ASMODAY",  aliases:["Asmodeus","Ashmedai","Sydonay"],      rank:"King",         quarter:"South", zodiac:"Aries",    planets:["Saturn","Jupiter","Mars","Sol"],  decan:"1st Pisces",   fixed_stars:["Alkaid"],   powers:["Answers all demands truly, gives a ring of great virtue","Reveals secrets and hidden treasures, teaches arithmetic and geomancy"],      source:"pp.154-166" },
  { name:"ASTAROTH", aliases:["Ashtaroth","Ashtoreth"],              rank:"Duke",         quarter:"South", zodiac:"Leo",      planets:["Saturn","Jupiter","Sol","Venus"], decan:"1st Pisces",   fixed_stars:[],           powers:["Answers matters of past, present, and future truly","Teaches the seven liberal arts, obtains favors of those in power"],                 source:"pp.166-175" },
  { name:"Andromalius",aliases:["the warn"],                         rank:"—",            quarter:"South", zodiac:"Gemini",   planets:["Saturn","Jupiter","Mercury","Luna"],decan:"—",          fixed_stars:["Spica"],    powers:["Brings back thieves and stolen goods, discovers all wickedness","Punishes thieves, reveals hidden treasures"],                           source:"pp.308-312" },
  { name:"BERITH",   aliases:["Gemmos","Berteth","Beale","Bolfry"],  rank:"Duke/King",    quarter:"South", zodiac:"Capricorn",planets:["Mars","Sol","Venus","Mercury"],    decan:"—",           fixed_stars:["Sirius"],   powers:["Teaches physick, logic, how metals can be turned into gold","Can grant dignities and make one invisible"],                             source:"pp.185-187" },
  { name:"BILETH",   aliases:["Beleth","Balath","Gaap"],             rank:"King",         quarter:"South", zodiac:"Taurus",   planets:["Saturn","Mars","Sol","Venus"],    decan:"3rd Pisces",   fixed_stars:[],           powers:["Can cause women to love men and men to love women","Teaches the liberal arts, grants invisibility, carries men speedily between kingdoms"], source:"pp.175-183" },
  { name:"BUSIN",    aliases:["Bune","Bime","Rewsyn"],               rank:"Duke",         quarter:"South", zodiac:"Taurus",   planets:["Sol","Venus","Mercury","Luna"],   decan:"—",            fixed_stars:[],           powers:["Makes her servitors enter dead bodies and do all things the living could","Can make a man rich and wise, answers all demands truly"],        source:"pp.194-196" },
  { name:"Botis",    aliases:["Ogya"],                               rank:"President",    quarter:"South", zodiac:"Gemini",   planets:["Saturn","Jupiter","Mars","Sol"],  decan:"1st Gemini",   fixed_stars:[],           powers:["Reconciles friends and foes, gives love and grace to all","Gives true answers of all things, tells past, present, and future"],       source:"pp.314-318" },
  { name:"CAMBRA",   aliases:["Cornyx","Carabia","Decarabia"],       rank:"President",    quarter:"South", zodiac:"Cancer",   planets:["Sol","Venus","Luna"],             decan:"—",            fixed_stars:[],           powers:["Has knowledge of birds and precious stones","Makes all kinds of birds appear tamely before the magician"],                             source:"pp.206-210" },
  { name:"Forneus",  aliases:["Fameis","Fronons"],                   rank:"King",         quarter:"South", zodiac:"Cancer",   planets:["Jupiter","Mars","Venus","Mercury"],decan:"1st Scorpio", fixed_stars:[],           powers:["Makes one gifted in rhetoric and languages, gives good repute","Makes one beloved to friends and foes"],                                    source:"pp.328-331" },
  { name:"GAMOR",    aliases:["Gamigin","Gamygyn","Buer"],           rank:"Marquis",      quarter:"South", zodiac:"Virgo",    planets:["Sol","Venus","Mercury","Luna"],   decan:"1st Virgo",    fixed_stars:[],           powers:["Informs one of astronomy, moral philosophy, rhetoric, and all sciences","Can heal all diseases, teaches virtues of herbs"],              source:"pp.210-214" },
  { name:"Gyell",    aliases:[],                                     rank:"Earl",         quarter:"South", zodiac:"Gemini",   planets:["Saturn","Jupiter","Sol","Venus"], decan:"3rd Gemini",   fixed_stars:["Pollux","Alhena"], powers:["Grants dignities, gives the best acquaintances","Can bring forth money or treasures from any place"],                       source:"pp.372-374" },
  { name:"Halphas",  aliases:["Leban","Malthous"],                   rank:"—",            quarter:"South", zodiac:"Cancer",   planets:["Saturn","Mars","Venus","Luna"],   decan:"1st Cancer",   fixed_stars:[],           powers:["Fortifies towns with weapons and ammunition, builds towers","Carries one wherever one wills, fetches anything desired"],              source:"pp.334-337" },
  { name:"Haures",   aliases:["Flauros"],                            rank:"—",            quarter:"South", zodiac:"Taurus",   planets:["Saturn","Mars","Sol","Venus"],    decan:"1st Scorpio",  fixed_stars:[],           powers:["Gives true answers of all things past, present, and future","Destroys and burns up the magician's enemies"],                          source:"pp.336-340" },
  { name:"MALLAPAS", aliases:["Malphas","Malpharas"],                rank:"President",    quarter:"South", zodiac:"Taurus",   planets:["Saturn","Mercury","Luna","Sol"],  decan:"—",            fixed_stars:[],           powers:["Can quickly gather artificers to construct houses, fortresses, castles","Can transport one from one place to another"],              source:"pp.187-191" },
  { name:"OZE",      aliases:["Otius","Azo","Oso","Voso"],           rank:"President",    quarter:"South", zodiac:"Capricorn",planets:["Saturn","Sol","Venus","Luna"],    decan:"3rd Capricorn",fixed_stars:[],           powers:["Answers truly of divine and secret things","Can turn straw into a great horse or belt of gold or silver; changes a person's shape"],  source:"pp.196-201" },
  { name:"PARTAS",   aliases:["Purson","Curson","Foras","Forcas"],   rank:"King",         quarter:"South", zodiac:"Virgo",    planets:["Sol","Venus","Mercury","Luna"],   decan:"—",            fixed_stars:[],           powers:["Can teach of logic and ethics","Grants invisibility, wit, and eloquence; restores lost vision; reveals hidden treasures"],          source:"pp.191-194" },
  { name:"PATHYN",   aliases:["Bathin","Mathim","Aim","Haborym"],    rank:"Duke",         quarter:"South", zodiac:"Gemini",   planets:["Saturn","Jupiter","Mars","Sol"],  decan:"1st Gemini",   fixed_stars:[],           powers:["Gives true answers of all things hidden, secret, and esoteric","Makes one witty and wise"],                                            source:"pp.201-206" },
  { name:"Zepar",    aliases:["Ariton","Zephar","Globa"],            rank:"King",         quarter:"South", zodiac:"Aries",    planets:["Mars","Venus","Mercury","Luna"],  decan:"1st Aries",    fixed_stars:[],           powers:["Chief ruler of women, makes them burn with love for men","Alters their form and brings them together in love"],                       source:"pp.356-359" },

  // ── WEST (Cardinal King: Paymon · Water · Autumn) ─────────────────────────
  { name:"Amduscias",  aliases:["Amdukias"],                              rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Jupiter","Mars","Mercury","Luna"],  decan:"3rd Virgo",    fixed_stars:["Sirius"],   powers:["Grants excellent familiars and can cause trees to bend to the will of the magician","Able to make trees dance to his music"],           source:"pp.303-307" },
  { name:"Andras",     aliases:[],                                        rank:"King",       quarter:"West", zodiac:"Virgo",   planets:["Mars","Mercury","Luna","Sol"],       decan:"3rd Virgo",    fixed_stars:[],           powers:["Author of discord and may decide to kill the magician, his servant, and all his assistants"],                                            source:"pp.305-306" },
  { name:"Andrealphus",aliases:["Andras"],                               rank:"—",          quarter:"West", zodiac:"Gemini",  planets:["Jupiter","Mars","Mercury","Luna"],  decan:"1st Scorpio",  fixed_stars:[],           powers:["Teaches geometry and all things relating to admeasurements perfectly"],                                                               source:"pp.306-308" },
  { name:"BALATH",     aliases:["Balat"],                                 rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Sol","Mercury","Luna"],              decan:"3rd Gemini",   fixed_stars:["Pollux"],   powers:["Can make a whole man sick, take away his senses and wits","Can grant love and dignity, teach seven liberal sciences"],              source:"pp.223-225" },
  { name:"BASON",      aliases:["Balam","Baron","Abalam"],               rank:"King",       quarter:"West", zodiac:"Gemini",  planets:["Sol","Mercury","Luna"],              decan:"1st Libra",    fixed_stars:[],           powers:["Can reveal treasure, make one invisible, witty, and wise","Grants knowledge of past, present, and future; lordships and dignities"],   source:"pp.218-221" },
  { name:"BELIALL",    aliases:["Beliar","Belias"],                       rank:"King",       quarter:"West", zodiac:"Cancer",  planets:["Sol","Venus","Luna"],                decan:"2nd Libra",    fixed_stars:[],           powers:["Makes one invisible, grants excellent familiars, bestows dignities and promotions","Brings the love and favor of all persons"],         source:"pp.214-218" },
  { name:"CAGYNE",     aliases:["Samigina","Sogan","Cogin"],             rank:"Marquis",    quarter:"West", zodiac:"Taurus",  planets:["Jupiter","Mars","Sol","Mercury"],    decan:"2nd Cancer",   fixed_stars:[],           powers:["Grants wisdom and knowledge of liberal sciences, particularly mathematics and philosophy","Brings forth souls of those who died at sea"], source:"pp.235-238" },
  { name:"CALEOS",     aliases:["Sallos","Saleos","Zaleos"],             rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Jupiter","Mars","Sol","Mercury"],    decan:"2nd Gemini",   fixed_stars:[],           powers:["Brings women the love of men and men the love of women","Has knowledge of infinite treasures"],                                        source:"pp.233-235" },
  { name:"Cimejes",    aliases:["Cimeries","Kimaris","Sowrges"],         rank:"Marquis",    quarter:"West", zodiac:"Aries",   planets:["Saturn","Mars","Mercury","Luna"],    decan:"1st Taurus",   fixed_stars:["Algenib"],  powers:["Teaches grammar, logic, rhetoric, and theology","Reveals the location of treasures and hidden things"],                             source:"pp.318-321" },
  { name:"Crocell",    aliases:["Procell","Procel","Pucel"],             rank:"—",          quarter:"West", zodiac:"Aries",   planets:["Saturn","Mars","Mercury","Luna"],    decan:"1st Taurus",   fixed_stars:["Algenib"],  powers:["Teaches geometry and the liberal sciences, warms waters and discovers baths","Makes one see great abyssal waters in the air"],        source:"pp.320-322" },
  { name:"Deydo",      aliases:[],                                        rank:"—",          quarter:"West", zodiac:"Aries",   planets:["Sol","Venus","Mercury","Luna"],      decan:"2nd Aries",    fixed_stars:[],           powers:["Gives perfect knowledge of the liberal sciences and mathematics","Can cause one to speak all languages"],                              source:"pp.362-365" },
  { name:"Drewchall",  aliases:[],                                        rank:"Knight",     quarter:"West", zodiac:"Aries",   planets:["Saturn","Sol","Venus","Mercury"],    decan:"2nd Aries",    fixed_stars:[],           powers:["Wins strongholds, casts defenders into sleep","Makes a great host of armed men appear on the battlefield"],                           source:"pp.364-368" },
  { name:"Focalor",    aliases:["Furcalor"],                             rank:"—",          quarter:"West", zodiac:"Cancer",  planets:["Mars","Mercury","Luna","Sol"],       decan:"1st Scorpio",  fixed_stars:[],           powers:["Causes people to die by drowning, overturning their ships","Will not kill anyone if the conjurer does not permit it"],               source:"pp.325-328" },
  { name:"Furfur",     aliases:[],                                        rank:"—",          quarter:"West", zodiac:"Cancer",  planets:["Jupiter","Venus","Mercury","Luna"],  decan:"1st Capricorn",fixed_stars:[],           powers:["Brings love between men and women, can raise thunder, lightning, and great tempests","Can teach of philosophy and astronomy"],      source:"pp.330-333" },
  { name:"GORDONSOR",  aliases:["Seere","Gorsay"],                       rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Sol","Mercury","Luna"],              decan:"2nd Aquarius", fixed_stars:["Rigel","Sirius"], powers:["Gives true answers in relation to all things including hidden treasures","Retrieves thieves and murderers by bringing them before the conjurer"], source:"pp.221-223" },
  { name:"Gremory",    aliases:["Gemon","Gemyem"],                       rank:"—",          quarter:"West", zodiac:"Cancer",  planets:["Mars","Venus","Mercury","Luna"],     decan:"2nd Cancer",   fixed_stars:[],           powers:["Answers truly of all things past, present, and to come","Reveals locations of hidden treasures, procures love of maiden women"],  source:"pp.332-335" },
  { name:"Ipes",       aliases:["Ayporos","Porax"],                      rank:"Earl",       quarter:"West", zodiac:"Taurus",  planets:["Saturn","Mars","Sol","Venus"],       decan:"1st Leo",      fixed_stars:["Albaldah"],  powers:["Knows things to come and of the past, makes a man witty and bold","Has power over building of structures and houses"],            source:"pp.339-342" },
  { name:"LECHER",     aliases:["Alloces","Alocer"],                     rank:"Marquis",    quarter:"West", zodiac:"Gemini",  planets:["Jupiter","Mars","Sol","Mercury"],    decan:"2nd Cancer",   fixed_stars:[],           powers:["Teaches of astronomy and the liberal sciences","Can bring the conjurer friendships and good familiars"],                           source:"pp.228-230" },
  { name:"MISTALAS",   aliases:["Stolas","Distolas"],                    rank:"Earl",       quarter:"West", zodiac:"Cancer",  planets:["Saturn","Mars","Sol","Venus"],       decan:"2nd Aquarius", fixed_stars:[],           powers:["Teaches witchcraft, necromancy, astronomy, and virtues of herbs and precious stones","Grants a horse that bears one hundreds of leagues in an hour"], source:"pp.225-228" },
  { name:"Marax",      aliases:["Morax","Foraii","Goorox"],              rank:"President",  quarter:"West", zodiac:"Aries",   planets:["Mars","Sol","Venus","Mercury"],      decan:"3rd Leo",      fixed_stars:["Albaldah"],  powers:["Makes one marvelously cunning in astronomy and all liberal sciences","Gives wisdom, good familiars, knowledge of virtues of herbs and stones"], source:"pp.344-347" },
  { name:"Marchosias", aliases:[],                                        rank:"Marquis",    quarter:"West", zodiac:"Aries",   planets:["Mars","Sol","Mercury","Luna"],       decan:"3rd Leo",      fixed_stars:[],           powers:["Answers all questions truly","Strong fighter who hopes to return to the seventh throne"],                                          source:"pp.346-349" },
  { name:"RYALL",      aliases:["Uvall","Vuall","Vaal","Voval"],         rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Sol","Venus","Mercury","Luna"],      decan:"3rd Scorpio",  fixed_stars:[],           powers:["Procures the love of women, causes love between friends and foes","Gives lordships, dignities, and good grace to all people"],      source:"pp.242-246" },
  { name:"SUCHAY",     aliases:["Sucax","Sitri","Bitur","Dam"],          rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Mars","Sol","Venus","Mercury"],      decan:"2nd Cancer",   fixed_stars:[],           powers:["Enflames men with love for women, discloses women's secrets","Can bring gold, teach all manner of languages"],                    source:"pp.238-242" },
  { name:"Valefor",    aliases:[],                                        rank:"King",       quarter:"West", zodiac:"Taurus",  planets:["Saturn","Mars","Sol","Mercury"],     decan:"2nd Gemini",   fixed_stars:[],           powers:["Acts as a familiar spirit","Causes those acquainted to steal until he brings them to the gallows"],                              source:"pp.353-355" },
  { name:"ZAGAYNE",    aliases:["Zagan","Zagam","Zagon","Bugan"],        rank:"King/President",quarter:"West",zodiac:"Gemini",planets:["Jupiter","Mars","Mercury","Luna"],  decan:"1st Gemini",   fixed_stars:[],           powers:["Grants wisdom and is a master of the arts of transmutation","Able to turn earth into any kind of metal; oil and wine into water"],  source:"pp.230-233" },
  { name:"ZAYME",      aliases:["Raum","Raim","Kayne"],                  rank:"Duke",       quarter:"West", zodiac:"Gemini",  planets:["Saturn","Jupiter","Mars","Mercury"], decan:"3rd Sagittarius",fixed_stars:[],          powers:["Counsels people to steal, can bring money or treasures from any place","Can reveal and destroy castles and cities"],               source:"pp.246-250" },

  // ── NORTH (Cardinal King: Egin · Earth · Winter) ──────────────────────────
  { name:"ANNOBOTH",  aliases:["Furcas","Bartax","Noocar"],                rank:"Prince",   quarter:"North", zodiac:"Leo",      planets:["Saturn","Sol","Mercury","Luna"],   decan:"—",            fixed_stars:["Deneb"],        powers:["Reveals treasures kept under powers of Saturn","Gives true answers of all things; can drive away the protectors of treasures"],         source:"pp.292-302" },
  { name:"AURAS",     aliases:["Orobas"],                                   rank:"Prince",   quarter:"North", zodiac:"Cancer",   planets:["Jupiter","Mars","Sol","Mercury"],  decan:"2nd Cancer",   fixed_stars:[],               powers:["Gives dignities, prelacies, and the favor of friends and foes","Answers all questions truly and without deceit; talks of origins of divinity"],  source:"pp.269-272" },
  { name:"Aron",      aliases:[],                                           rank:"—",        quarter:"North", zodiac:"Aries",    planets:["Luna","Sol"],                      decan:"1st Aries",    fixed_stars:[],               powers:["Brings the favor of friends and enemies","Grants dignities and promotions"],                                                               source:"pp.359-361" },
  { name:"Bifrons",   aliases:["Bifrous"],                                  rank:"Earl",     quarter:"North", zodiac:"Gemini",   planets:["Jupiter","Mercury","Luna"],        decan:"1st Gemini",   fixed_stars:["Spica"],        powers:["Grants knowledge of astrology and exact positions of the planets","Teaches mensurative arts such as geometry; knowledge of herbs and stones"],  source:"pp.312-315" },
  { name:"Bryman",    aliases:["Brymiel"],                                  rank:"Earl",     quarter:"North", zodiac:"Aries",    planets:["Sol","Venus","Mercury","Luna"],    decan:"1st Aries",    fixed_stars:[],               powers:["Has excellent knowledge of herbs, stones, flowers, fishes, birds, beasts, metal, wood, and water","Can make one become invisible from time to time"], source:"pp.361-363" },
  { name:"FESSAN",    aliases:["Amy","Avnas","Tamor","Chamor"],             rank:"Duke",     quarter:"North", zodiac:"Cancer",   planets:["Jupiter","Sol","Venus","Mercury"], decan:"—",            fixed_stars:[],               powers:["Reveals the locations of treasures kept under the guardianship of spirits","Provides excellent familiars, brings favor of great men"],           source:"pp.264-266" },
  { name:"GOYLE",     aliases:["Moyle","Vapula","Naphula"],                 rank:"Duke",     quarter:"North", zodiac:"Cancer",   planets:["Saturn","Jupiter","Mars","Sol"],   decan:"1st Scorpio",  fixed_stars:["Antares"],      powers:["Causes one to be gorgeous and gay, grants love and favor of princes","Gives victory over enemies by making one expert in feats of arms"],        source:"pp.266-269" },
  { name:"HINBRA",    aliases:["Umbra","Cerbere","Cerberus","Naberius"],   rank:"King",     quarter:"North", zodiac:"Taurus",   planets:["Saturn","Sol","Venus","Mercury"],  decan:"1st Cancer",   fixed_stars:["Sirius","Procyon"], powers:["Has the power to inflict evil in whatsoever way he wishes","Can grant, destroy, and restore dignities, prelacies, and honors; discovers Hand of Glory"], source:"pp.282-292" },
  { name:"MURYELL",   aliases:["Orias","Oriax"],                           rank:"Marquis",  quarter:"North", zodiac:"Gemini",   planets:["Mars","Sol","Mercury","Luna"],     decan:"2nd Cancer",   fixed_stars:["Regulus"],      powers:["Can tell of hidden treasures, knows the mansions of the planets","Transforms people, giving dignities; causes love to grow between people"],     source:"pp.279-282" },
  { name:"Mageyne",   aliases:[],                                           rank:"—",        quarter:"North", zodiac:"Aries",    planets:["Saturn","Venus","Mercury","Luna"], decan:"3rd ?",        fixed_stars:["Deneb","Alhena"],powers:["Good familiar, assists in all manner of needful business, specifically husbandry and occupations"],                                             source:"pp.375-379" },
  { name:"OTHEY",     aliases:["Boab","Rewboo","Vinea","Vine"],             rank:"Duke",     quarter:"North", zodiac:"Aries",    planets:["Saturn","Mars","Sol","Venus"],     decan:"3rd Scorpio",  fixed_stars:[],               powers:["Discovers hidden things, witches, wizards, and things present, past, and to come","Will build towers, overthrow walls, destroy enemies"],           source:"pp.272-276" },
  { name:"OZIA",      aliases:["Gloolas","Glasya Labolas","Carmola"],      rank:"King",     quarter:"North", zodiac:"Cancer",   planets:["Saturn","Sol","Mercury","Luna"],   decan:"1st Leo",      fixed_stars:["Sirius","Procyon"], powers:["Chief of all murderers; can teach all manner of arts and sciences","Gives ability to understand birds, make one invisible, grant favor of enemies"], source:"pp.250-255" },
  { name:"SARANYT",   aliases:["Murmur","Saranit"],                        rank:"Duke",     quarter:"North", zodiac:"Cancer",   planets:["Saturn","Mars","Sol","Mercury"],   decan:"1st Pisces",   fixed_stars:[],               powers:["Can teach philosophy and the seven liberal sciences","Can raise and constrain the souls of the dead"],                                          source:"pp.276-279" },
  { name:"SYNORYELL", aliases:["Camio","Caym","Soonek"],                   rank:"President",quarter:"North", zodiac:"Cancer",   planets:["Sol","Mercury","Luna"],            decan:"2nd Cancer",   fixed_stars:["Sirius","Procyon"], powers:["Teaches all manner of languages including the barking of dogs, chirping of birds","Gives true answers to all manner of questions; reveals things of the future"], source:"pp.261-264" },
  { name:"Sabnack",   aliases:["Sabnock","Savnock","Salmac"],              rank:"Marquis",  quarter:"North", zodiac:"Taurus",   planets:["Saturn","Mars","Sol","Mercury"],   decan:"1st Taurus",   fixed_stars:[],               powers:["Changes one's form and favor into any that is desired","Builds high towers, castles, and cities; inflicts rotten wounds for thirty days"],           source:"pp.352-354" },
  { name:"VRIALL",    aliases:["Uriel","Haagenti","Lucubar"],              rank:"President",quarter:"North", zodiac:"Gemini",   planets:["Sol","Mercury","Luna"],            decan:"2nd Cancer",   fixed_stars:[],               powers:["Changes all metals into silver or gold and wine into water","Can make one invisible and wise"],                                                     source:"pp.255-258" },
  { name:"VZAGO",     aliases:["Vassago","Vsagoo","Dyelagoo","Friblex"],   rank:"Duke",     quarter:"North", zodiac:"Cancer",   planets:["Jupiter","Sol","Venus","Mercury"], decan:"2nd Cancer",   fixed_stars:[],               powers:["True and faithful in all doings; declares things past and to come","Makes one wise and invisible, transforms shape, brings love and favor"],          source:"pp.258-261" },
  { name:"Volac",     aliases:["Doolas","Coolor"],                         rank:"—",        quarter:"North", zodiac:"Taurus",   planets:["Mars","Venus","Mercury","Luna"],   decan:"2nd Gemini",   fixed_stars:[],               powers:["Answers truly about hidden treasures, grants service of all manner of household spirits","Reveals where drakes or serpents may be seen"],           source:"pp.354-358" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── v8 NEW: BEHENIAN FIXED STARS (Agrippa via Crowhurst / Appendix) ─────────
// ═══════════════════════════════════════════════════════════════════════════════
const BEHENIAN_DB = [
  { name:"Algol",              position:"26°25' Taurus",    planet:"Saturn / Jupiter", stone:"Diamond",       herb:"Black hellebore",
    talisman:"Brings hatred and courage; preserves members of the body; grants vengeance; helps against witchcraft and projects evil endeavors upon enemies.",
    natal:false, natal_note:"" },
  { name:"Pleiades (Alcyone)", position:"0°15' Gemini",     planet:"Moon / Mars",      stone:"Rock crystal",  herb:"Fennel",
    talisman:"Preserves eyesight; summons demons and spirits of the dead; calls the winds; reveals secrets and lost things. Moon conjunct Pleiades rising or at Midheaven.",
    natal:false, natal_note:"" },
  { name:"Aldebaran",          position:"10°02' Gemini",    planet:"Mars / Venus",     stone:"Carbuncle (ruby)",herb:"Milk thistle",
    talisman:"Increases riches and brings great honors. Moon conjunct Aldebaran on Ascendant or Midheaven.",
    natal:false, natal_note:"" },
  { name:"Capella",            position:"22°07' Gemini",    planet:"Jupiter / Saturn", stone:"Sapphire",      herb:"Horehound",
    talisman:"Exalts men to honors; brings favor of kings and nobles; heals toothache; medicinal.",
    natal:true, natal_note:"★ Conjunct natal Sun 20°38' Gemini — the communicative gate and primary East cardinal" },
  { name:"Sirius",             position:"14°20' Cancer",    planet:"Jupiter / Mars",   stone:"Beryl",         herb:"Savine juniper / wormwood / bistort",
    talisman:"Grants favor of spirits of the air and peoples of the earth; brings peace and concord between kings and rulers and between husbands and wives. Set in gold.",
    natal:true, natal_note:"★★★ PRIMARY AXIS — conjunct Mercury 13°45' AND Mars 14°15' Cancer — the Sirius Gate and chief power channel" },
  { name:"Procyon",            position:"26°02' Cancer",    planet:"Mercury / Mars",   stone:"Agate",         herb:"Heliotrope / marigold / pennyroyal",
    talisman:"Grants favor of God and man; favor of spirits of the air; great power over magic; keeps men healthy.",
    natal:false, natal_note:"" },
  { name:"Regulus",            position:"0°05' Virgo",      planet:"Jupiter / Mars",   stone:"Granite",       herb:"Celandine / wormwood / mastic",
    talisman:"Takes away anger and melancholy; makes men temperate and grants favor.",
    natal:false, natal_note:"" },
  { name:"Alkaid",             position:"27°11' Virgo",     planet:"Saturn / Mars",    stone:"Magnet",        herb:"Succory / chicory / wormwood / periwinkle",
    talisman:"Power against enchantments and dryness; safety in travel; with wolf's teeth makes hunters proficient.",
    natal:false, natal_note:"" },
  { name:"Algorab",            position:"13°42' Libra",     planet:"Saturn / Mars",    stone:"Onyx",          herb:"Burdock / tongue of a frog",
    talisman:"Makes men angry, hateful, daring, and evil-speaking; causes wicked dreams; drives demons away; protects against demons and evil winds.",
    natal:false, natal_note:"" },
  { name:"Spica",              position:"24°06' Libra",     planet:"Venus / Mercury",  stone:"Emerald",       herb:"Sage / trefoil / periwinkle / wormwood / mandrake",
    talisman:"Increases gold; accumulates riches; victory in lawsuits; frees men from evil and anguish.",
    natal:false, natal_note:"" },
  { name:"Arcturus",           position:"24°29' Libra",     planet:"Jupiter / Mars",   stone:"Jasper (green)",herb:"Plantain",
    talisman:"Carries away fevers; restrains the flow of blood.",
    natal:false, natal_note:"" },
  { name:"Alphecca",           position:"12°33' Scorpio",   planet:"Venus / Mercury",  stone:"Topaz",         herb:"Rosemary / trefoil / ivy",
    talisman:"Makes men chaste; grants friendship and honor with God and man.",
    natal:false, natal_note:"" },
  { name:"Antares",            position:"10°00' Sagittarius",planet:"Mars / Jupiter",  stone:"Sardonyx",      herb:"Birthwort / yew",
    talisman:"Gives men healthy color; grants good memory and intelligence; makes them appear wise; banishes demons.",
    natal:true, natal_note:"★ Conjunct natal South Node 8°48' Sagittarius — opposing the destiny axis; also proximate to Moon/Uranus at 24°" },
  { name:"Vega",               position:"15°35' Capricorn", planet:"Venus / Mercury",  stone:"Chrysolite",    herb:"Winter savory / fumitory",
    talisman:"Grants favor with beasts; protects from scabies, demons, nocturnal phantoms, and fears.",
    natal:false, natal_note:"" },
  { name:"Deneb Algedi",       position:"23°48' Aquarius",  planet:"Saturn / Jupiter", stone:"Chalcedony",    herb:"Marjoram",
    talisman:"Gives favor in lawsuits; improves and secures the home; increases all manner of riches. Moon conjunct tail of Capricorn rising.",
    natal:false, natal_note:"" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── v8 NEW: DECAN SPIRIT ASSIGNMENTS (36 decans — Stellas Daemonum Appendix) ─
// ═══════════════════════════════════════════════════════════════════════════════
const DECAN_DB = [
  { sign:"Aries",     decan:1, key:"Aries 1",      spirits:["Oriens","Baall","Maxayn","Barbaryes","Marchosias"],                                                                         natal:false, natal_note:"" },
  { sign:"Aries",     decan:2, key:"Aries 2",      spirits:["Oriens","Baall","Algor","Neophon","Marchosias"],                                                                            natal:false, natal_note:"" },
  { sign:"Aries",     decan:3, key:"Aries 3",      spirits:["Oriens","Partas","Amaymon","Mageyne","Marax","Ipes","Mallapas"],                                                            natal:false, natal_note:"" },
  { sign:"Taurus",    decan:1, key:"Taurus 1",     spirits:["Oriens","Sabnack","Amaymon","Marax","Mallapas"],                                                                            natal:false, natal_note:"" },
  { sign:"Taurus",    decan:2, key:"Taurus 2",     spirits:["Oriens","Amaymon","Marax","Mallapas"],                                                                                      natal:false, natal_note:"" },
  { sign:"Taurus",    decan:3, key:"Taurus 3",     spirits:["Oriens","Baall","Busin","Pathyn","Bifrons","Paymon","Andrealphus","Balath","Bason","Lecher","Caleos","Cagyne"],             natal:false, natal_note:"" },
  { sign:"Gemini",    decan:1, key:"Gemini 1",     spirits:["Oriens","Paymon","Zayme","Balath","Caleos","Lecher","Suchay","Valefor"],                                                    natal:false, natal_note:"" },
  { sign:"Gemini",    decan:2, key:"Gemini 2",     spirits:["Oriens","Star","Seson","Paymon","Gasyaxe","Botis","Ryall","Balath","Mistalas","Lecher"],                                   natal:false, natal_note:"" },
  { sign:"Gemini",    decan:3, key:"Gemini 3",     spirits:[],                                                                                                                           natal:true,  natal_note:"☉ Sun 20°38' Gemini · Capella conjunction · East cardinal" },
  { sign:"Cancer",    decan:1, key:"Cancer 1",     spirits:["Egin","Pathyn","Cambra","Hinbra","Ozia","Vriall","Vzago","Goyle","Dantalion","Othey"],                                     natal:true,  natal_note:"★★★ SIRIUS GATE — ☿ Mercury 13°45' + ♂ Mars 14°15' — primary power axis" },
  { sign:"Cancer",    decan:2, key:"Cancer 2",     spirits:["Egin","Hinbra","Vriall","Gremory","Dantalion","Auras","Othey","Saranyt","Muryell","Annoboth"],                             natal:false, natal_note:"" },
  { sign:"Cancer",    decan:3, key:"Cancer 3",     spirits:["Egin","Hinbra","Drewchall","Ozia","Synoryell","Goyle","Othey"],                                                             natal:false, natal_note:"" },
  { sign:"Leo",       decan:1, key:"Leo 1",        spirits:["Oriens","Barbas","Pathyn","Haures","Seson","Leraje","Maxayn","Suffales","Egin","Ozia","Goyle","Othey","Annoboth","Botis"], natal:false, natal_note:"" },
  { sign:"Leo",       decan:2, key:"Leo 2",        spirits:["Oriens","Egin","Goyle"],                                                                                                   natal:false, natal_note:"" },
  { sign:"Leo",       decan:3, key:"Leo 3",        spirits:["Oriens","Baall","Agaros","Caleos","Amon","Egin","Goyle","Neophon","Muryell"],                                              natal:false, natal_note:"" },
  { sign:"Virgo",     decan:1, key:"Virgo 1",      spirits:["Amaymon","Busin","Egin","Vriall","Mageyne","Goyle","Partas","Gamor","Saranyt","Annoboth"],                                 natal:false, natal_note:"" },
  { sign:"Virgo",     decan:2, key:"Virgo 2",      spirits:["Paymon","Egin","Vriall","Partas","Gamor","Saranyt","Annoboth"],                                                             natal:false, natal_note:"" },
  { sign:"Virgo",     decan:3, key:"Virgo 3",      spirits:["Amaymon","Amduscias","Egin","Partas","Gamor","Saranyt","Annoboth"],                                                        natal:false, natal_note:"" },
  { sign:"Libra",     decan:1, key:"Libra 1",      spirits:["Paymon","Beliall","Andromalius","Gordonsor","Bason"],                                                                       natal:false, natal_note:"" },
  { sign:"Libra",     decan:2, key:"Libra 2",      spirits:["Paymon","Andromalius","Gordonsor"],                                                                                         natal:false, natal_note:"" },
  { sign:"Libra",     decan:3, key:"Libra 3",      spirits:["Paymon","Suchay","Balath"],                                                                                                 natal:false, natal_note:"" },
  { sign:"Scorpio",   decan:1, key:"Scorpio 1",    spirits:["Andrealphus","Othey","Saranyt"],                                                                                            natal:false, natal_note:"" },
  { sign:"Scorpio",   decan:2, key:"Scorpio 2",    spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Scorpio",   decan:3, key:"Scorpio 3",    spirits:["Zagayne"],                                                                                                                  natal:false, natal_note:"♇ Pluto 7°30' Scorpio — underworld anchor nearby" },
  { sign:"Sagittarius",decan:1, key:"Sagittarius 1",spirits:[],                                                                                                                          natal:false, natal_note:"" },
  { sign:"Sagittarius",decan:2, key:"Sagittarius 2",spirits:[],                                                                                                                          natal:false, natal_note:"" },
  { sign:"Sagittarius",decan:3, key:"Sagittarius 3",spirits:["Othey","Saranyt","Annoboth"],                                                                                             natal:true,  natal_note:"☽ Moon 24°07' + ♅ Uranus 24°54' — Oya Hurricane signature · West cardinal" },
  { sign:"Capricorn", decan:1, key:"Capricorn 1",  spirits:["Suchay","Zepar","Egin","Othey","Saranyt"],                                                                                 natal:true,  natal_note:"↑ ASC 19°50' Capricorn — Saturn-ruled gateway · all entry protocols" },
  { sign:"Capricorn", decan:2, key:"Capricorn 2",  spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Capricorn", decan:3, key:"Capricorn 3",  spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Aquarius",  decan:1, key:"Aquarius 1",   spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Aquarius",  decan:2, key:"Aquarius 2",   spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Aquarius",  decan:3, key:"Aquarius 3",   spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Pisces",    decan:1, key:"Pisces 1",     spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Pisces",    decan:2, key:"Pisces 2",     spirits:[],                                                                                                                           natal:false, natal_note:"" },
  { sign:"Pisces",    decan:3, key:"Pisces 3",     spirits:[],                                                                                                                           natal:false, natal_note:"" },
];

// ─── GEOMETRY ─────────────────────────────────────────────────────────────────
function polyPoints(sides, cx, cy, r, angleOff=0){
  return Array.from({length:sides},(_,i)=>{
    const a=(i*360/sides+angleOff-90)*Math.PI/180;
    return `${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function SealSVG({planet, size=90}){
  const p=PLANET_DB[planet]; if(!p) return null;
  const c=50, r=36;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={C.bg}/>
      <circle cx={c} cy={c} r={r+8} fill="none" stroke={C.border2} strokeWidth="0.4" strokeDasharray="2,4"/>
      {p.sides===0 && <circle cx={c} cy={c} r={r} fill="none" stroke={p.color} strokeWidth="1.5"/>}
      {p.sides===9 && <path d={`M ${c-r} ${c} A ${r} ${r} 0 1 1 ${c} ${c-r}`} fill="none" stroke={p.color} strokeWidth="1.5"/>}
      {p.sides>2 && p.sides!==9 && <polygon points={polyPoints(p.sides,c,c,r)} fill="none" stroke={p.color} strokeWidth="1.5"/>}
      <circle cx={c} cy={c} r="2.5" fill={p.color} opacity="0.8"/>
      {p.sides>2 && p.sides<9 && Array.from({length:p.sides}).map((_,i)=>{
        const a=(i*360/p.sides-90)*Math.PI/180;
        return <circle key={i} cx={(c+r*Math.cos(a)).toFixed(2)} cy={(c+r*Math.sin(a)).toFixed(2)} r="1.2" fill={p.color} opacity="0.5"/>;
      })}
    </svg>
  );
}

function KameaGrid({kamea, color}){
  if(!kamea||!kamea.length) return <div style={{color:C.muted,fontSize:10}}>No kamea defined</div>;
  const flat=kamea.flat(); const max=Math.max(...flat);
  const cols=kamea[0].length; const cs=Math.min(38,Math.floor(260/cols));
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols}, ${cs}px)`,gap:2}}>
      {flat.map((n,i)=>(
        <div key={i} style={{width:cs,height:cs,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:Math.max(8,cs*0.38),fontFamily:"monospace",
          background:`${color}${Math.floor(n/max*70).toString(16).padStart(2,"0")}`,
          border:`1px solid ${color}33`,color:C.text}}>
          {n}
        </div>
      ))}
    </div>
  );
}

function AbraSquare({rows, size=12}){
  const [magi,setMagi]=useState(false);
  if(!rows||!rows.length) return null;
  return (
    <div>
      <button onClick={()=>setMagi(m=>!m)} style={{
        background:"transparent",border:`1px solid ${magi?C.gold:C.border2}`,
        color:magi?C.gold:C.muted,fontSize:8,padding:"1px 6px",cursor:"pointer",marginBottom:5,
      }}>{magi?"✦ MAGI":"LATIN"}</button>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${rows[0].length}, 1fr)`,gap:1}}>
        {rows.map((row,ri)=>row.map((cell,ci)=>(
          <div key={`${ri}-${ci}`} style={{
            width:magi?22:18,height:magi?22:18,display:"flex",alignItems:"center",justifyContent:"center",
            border:`1px solid ${C.border}`,
            background:(ri===0||ri===rows.length-1)?`${C.gold}18`:`${C.amber}08`,
            color:(ri===0||ri===rows.length-1)?C.gold:C.amber,
            fontSize:magi?size+2:size,
            fontFamily:magi?"'IM Fell English', serif":"Georgia, serif",
            letterSpacing:magi?"0.2em":"normal",
          }}>{cell}</div>
        )))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function TalismanEngine() {
  const [tab,setTab]               = useState("election");
  const [selDate,setSelDate]       = useState(0);
  const [selPlanet,setSelPlanet]   = useState("Mercury");
  const [selArmy,setSelArmy]       = useState("Exu Horde");
  const [polarity,setPolarity]     = useState("Expansion");
  const [oduHover,setOduHover]     = useState(null);
  const [selIntent,setSelIntent]   = useState(null);
  const [cowries,setCowries]       = useState(Array(16).fill(0));
  const [casting,setCasting]       = useState(false);
  const [odu1,setOdu1]             = useState(null);
  const [odu2,setOdu2]             = useState(null);
  const [castMode,setCastMode]     = useState("composite");
  const [thrown,setThrown]         = useState(false);
  // ── v8 spirit state ──
  const [spiritQ,setSpiritQ]       = useState("All");
  const [spiritSearch,setSpiritSearch] = useState("");
  const [spiritSirius,setSpiritSirius] = useState(false);
  const [selSpirit,setSelSpirit]   = useState(null);
  const [selStar,setSelStar]       = useState(null);
  const [selDecan,setSelDecan]     = useState(null);

  const days = useMemo(()=>buildDays(),[]);
  const maxScore = useMemo(()=>Math.max(...days.map(d=>Math.abs(d.score))),[days]);

  const castOdu = useCallback(()=>{
    if(casting) return;
    setCasting(true); setThrown(false); setOdu1(null); setOdu2(null);
    let count=0;
    const iv=setInterval(()=>{
      setCowries(Array.from({length:16},()=>Math.random()<0.5?1:0));
      count++;
      if(count>=6){
        clearInterval(iv);
        const f1=Array.from({length:16},()=>Math.random()<0.5?1:0);
        const n1=Math.min(f1.filter(c=>c===1).length,16);
        setCowries(f1); setOdu1(n1); setThrown(true); setCasting(false);
        if(castMode==="composite"){
          const n2=Math.min(Array.from({length:16},()=>Math.random()<0.5?1:0).filter(c=>c===1).length,16);
          setOdu2(n2);
        }
      }
    },90);
  },[casting,castMode]);

  const filteredSpirits = useMemo(()=>{
    return SPIRITS_DB.filter(s=>{
      if(spiritQ!=="All" && s.quarter!==spiritQ) return false;
      if(spiritSirius && !s.fixed_stars.includes("Sirius")) return false;
      if(spiritSearch){
        const q=spiritSearch.toLowerCase();
        return s.name.toLowerCase().includes(q) ||
          s.aliases.some(a=>a.toLowerCase().includes(q)) ||
          s.zodiac.toLowerCase().includes(q) ||
          s.rank.toLowerCase().includes(q);
      }
      return true;
    });
  },[spiritQ,spiritSearch,spiritSirius]);

  const planet    = PLANET_DB[selPlanet];
  const keyD      = KEY_DATES[selDate];
  const intentRec = INTENT_MAP[selIntent];

  const S={
    app:{fontFamily:"Georgia, serif",background:C.bg,minHeight:"100vh",color:C.text,fontSize:13},
    hdr:{background:C.bg2,borderBottom:`1px solid ${C.border2}`,padding:"10px 20px",
      display:"flex",alignItems:"center",justifyContent:"space-between"},
    nav:{display:"flex",gap:3,padding:"6px 20px",background:C.bg3,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap"},
    nb:(a)=>({padding:"4px 10px",fontSize:9,letterSpacing:2,fontFamily:"monospace",
      background:a?C.border2:"transparent",color:a?C.gold2:C.muted,
      border:`1px solid ${a?C.gold:C.border}`,borderRadius:2,cursor:"pointer"}),
    body:{padding:"16px 20px",maxWidth:1120,margin:"0 auto"},
    card:{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:3,padding:"14px",marginBottom:12},
    label:{fontSize:8,color:C.muted,letterSpacing:3,fontFamily:"monospace",marginBottom:6,display:"block"},
    h2:{fontSize:13,color:C.gold,fontFamily:"monospace",fontWeight:"bold",margin:"0 0 8px"},
    rule:{border:"none",borderTop:`1px solid ${C.border}`,margin:"10px 0"},
    tag:(c)=>({display:"inline-block",padding:"2px 7px",borderRadius:2,background:C.bg3,
      border:`1px solid ${c||C.border2}`,color:c||C.dim,fontSize:8,letterSpacing:1,fontFamily:"monospace"}),
    modeTag:(mode)=>({display:"inline-block",padding:"2px 10px",borderRadius:1,fontSize:8,letterSpacing:2,
      fontFamily:"monospace",fontWeight:"bold",
      background:mode==="OBSTRUCT"?"#1a0505":mode==="ENHANCE PRIMARY"?"#0d0a00":"#0a0800",
      color:mode==="OBSTRUCT"?C.crimson2:mode==="ENHANCE PRIMARY"?C.gold2:C.amber,
      border:`1px solid ${mode==="OBSTRUCT"?C.crimson:mode==="ENHANCE PRIMARY"?C.gold:C.amber}`}),
    polBtn:(a,col)=>({padding:"4px 12px",fontSize:9,letterSpacing:1,fontFamily:"monospace",
      background:a?`${col}22`:"transparent",color:a?col:C.muted,
      border:`1px solid ${a?col:C.border}`,cursor:"pointer"}),
    qBtn:(active,col)=>({padding:"4px 10px",fontSize:8,letterSpacing:1,fontFamily:"monospace",
      background:active?`${col}22`:"transparent",color:active?col:C.muted,
      border:`1px solid ${active?col:C.border}`,borderRadius:2,cursor:"pointer"}),
  };

  return (
    <div style={S.app}>
      {/* HEADER */}
      <div style={S.hdr}>
        <div>
          <div style={{fontSize:11,color:C.gold2,letterSpacing:3,fontFamily:"monospace",fontWeight:"bold"}}>
            ⊕ LIVING CROSSROADS GRIMOIRE · TALISMAN ENGINE v8
          </div>
          <div style={{fontSize:8,color:C.muted,marginTop:2}}>ESU OSO · 77 SPIRITS · 15 BEHENIAN · 36 DECANS · MARCH–APRIL 2026</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button style={S.polBtn(polarity==="Expansion",C.gold2)} onClick={()=>setPolarity("Expansion")}>EXPANSION ↑</button>
          <button style={S.polBtn(polarity==="Contraction",C.crimson2)} onClick={()=>setPolarity("Contraction")}>CONTRACTION ↓</button>
        </div>
      </div>

      {/* NAV */}
      <div style={S.nav}>
        {[["election","⊕ Election"],["spirits","⊛ Spirits"],["behenian","★ Behenian"],["decans","⬟ Decans"],["vector","⬡ Vector"],["codex","✦ Codex"],["synthesis","⊙ Synthesis"],["oracle","◉ Oracle"]].map(([id,lbl])=>(
          <button key={id} style={S.nb(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div style={S.body}>

        {/* ══ ELECTION ENGINE ══════════════════════════════════════════════════ */}
        {tab==="election" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>TALISMAN RECOMMENDATION ENGINE — INTENT → ELECTION → PROTOCOL</span>
              <div style={S.h2}>Select Operative Intent</div>
              <hr style={S.rule}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {Object.keys(INTENT_MAP).map(k=>(
                  <button key={k} onClick={()=>setSelIntent(selIntent===k?null:k)} style={{
                    padding:"5px 12px",fontSize:9,letterSpacing:1,fontFamily:"monospace",
                    background:selIntent===k?`${INTENT_MAP[k].color}22`:C.bg3,
                    border:`1px solid ${selIntent===k?INTENT_MAP[k].color:C.border}`,
                    color:selIntent===k?INTENT_MAP[k].color:C.muted,cursor:"pointer",borderRadius:2,
                  }}>{k.toUpperCase()}</button>
                ))}
              </div>
              {intentRec && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                  <div style={{background:C.bg3,border:`1px solid ${intentRec.color}`,borderRadius:3,padding:12}}>
                    <div style={{fontSize:8,color:C.muted,marginBottom:6}}>CELESTIAL CONFIGURATION</div>
                    <div style={{fontSize:13,color:intentRec.color,fontFamily:"monospace",marginBottom:4}}>{intentRec.planet} · {intentRec.seal}</div>
                    <div style={{fontSize:10,color:C.text,marginBottom:3}}>{intentRec.day} · {intentRec.lunar}</div>
                    <div style={{fontSize:10,color:C.amber}}>{intentRec.orisha}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:4}}>{intentRec.odu}</div>
                  </div>
                  <div style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:3,padding:12}}>
                    <div style={{fontSize:8,color:C.muted,marginBottom:6}}>MATERIALS & ARMY</div>
                    <div style={{fontSize:10,color:C.text,lineHeight:1.6,marginBottom:8}}>{intentRec.materials}</div>
                    <div style={{fontSize:9,color:polarity==="Contraction"?C.crimson2:C.amber}}>
                      {polarity==="Contraction"?`⚠ AJOGUN: ${intentRec.ajogun_contain}`:`Army: ${intentRec.army}`}
                    </div>
                  </div>
                  <div style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:3,padding:12}}>
                    <div style={{fontSize:8,color:C.muted,marginBottom:6}}>OPERATIVE PROTOCOL</div>
                    <div style={{fontSize:9,color:C.text,lineHeight:1.7}}>{intentRec.protocol}</div>
                  </div>
                  {intentRec.squareRows && (
                    <div style={{gridColumn:"1/-1",background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:3,padding:12}}>
                      <div style={{fontSize:8,color:C.muted,marginBottom:8}}>ASSIGNED WORD SQUARE — {intentRec.square}</div>
                      <AbraSquare rows={intentRec.squareRows} size={12}/>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={S.card}>
              <span style={S.label}>32-DAY NATAL TRANSIT SCORE · MAR 26 – APR 26, 2026</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:10}}>
                {days.map(({day,date,score})=>{
                  const ki=KEY_DATES.findIndex(k=>k.day===day);
                  const isKey=ki>=0; const kd=isKey?KEY_DATES[ki]:null;
                  const n=score/maxScore; const d=date.getDate(); const m=date.getMonth()===2?"M":"A";
                  return (
                    <div key={day} onClick={()=>{if(isKey)setSelDate(ki);}} style={{
                      width:28,padding:"2px 0",borderRadius:2,textAlign:"center",position:"relative",overflow:"hidden",
                      background:isKey?(kd.mode==="OBSTRUCT"?"#1a0505":"#0d0a00"):C.bg2,
                      border:`1px solid ${isKey?(kd.mode==="OBSTRUCT"?C.crimson2:C.gold):C.border}`,
                      cursor:isKey?"pointer":"default",
                    }}>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${Math.abs(n)*28}px`,
                        background:score>0?C.gold:C.crimson2,opacity:0.2}}/>
                      <div style={{fontSize:6,color:isKey?C.gold2:C.dim,position:"relative"}}>{m}{d}</div>
                      {isKey&&<div style={{fontSize:6,color:kd.mode==="OBSTRUCT"?C.crimson2:C.amber,position:"relative"}}>
                        {kd.mode==="OBSTRUCT"?"⊘":"◉"}</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {KEY_DATES.map((kd,i)=>(
                  <button key={i} onClick={()=>setSelDate(i)} style={{
                    flex:1,padding:"8px",cursor:"pointer",borderRadius:3,
                    border:`1px solid ${i===selDate?kd.color:C.border}`,
                    background:i===selDate?(kd.mode==="OBSTRUCT"?"#150505":"#0d0a00"):C.bg2,
                  }}>
                    <div style={{fontSize:11,color:kd.color,fontFamily:"monospace",fontWeight:"bold"}}>{kd.label}</div>
                    <div style={S.modeTag(kd.mode)}>{kd.mode}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:4}}>{kd.score}</div>
                  </button>
                ))}
              </div>
              <div style={{background:C.bg3,border:`1px solid ${keyD.color}40`,borderRadius:3,padding:14}}>
                <div style={{fontSize:17,color:keyD.color,fontFamily:"monospace",fontWeight:"bold"}}>{keyD.full}</div>
                <div style={{fontSize:10,color:C.text,marginTop:6,marginBottom:10}}>{keyD.event}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  {[["ASTROLOGY",keyD.layer1,C.gold],["IFÁ / ODU",`${keyD.odu}\n\n${keyD.layer2}`,C.amber],["GRIMOIRE",keyD.layer3,C.silver]].map(([t,txt,col])=>(
                    <div key={t} style={{background:C.bg2,borderTop:`2px solid ${col}`,padding:10,borderRadius:2}}>
                      <div style={{fontSize:8,color:col,fontFamily:"monospace",marginBottom:5}}>{t}</div>
                      <div style={{fontSize:9,color:C.dim,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{txt}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><div style={{fontSize:8,color:C.muted,marginBottom:4}}>MATERIALS</div><div style={{fontSize:10,color:C.text}}>{keyD.material}</div></div>
                  <div><div style={{fontSize:8,color:C.muted,marginBottom:4}}>INSTRUCTION</div><div style={{fontSize:10,color:C.text}}>{keyD.instruction}</div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SPIRITS TAB (v8 NEW) ══════════════════════════════════════════════ */}
        {tab==="spirits" && (
          <div>
            {/* Filter bar */}
            <div style={S.card}>
              <span style={S.label}>77 SPIRITS — BOOK OF OFFICES · PSEUDOMONARCHIA · LEMEGETON · STELLAS DAEMONUM (CROWHURST)</span>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",gap:4}}>
                  {["All","East","South","West","North"].map(q=>(
                    <button key={q} onClick={()=>{setSpiritQ(q);setSelSpirit(null);}} style={S.qBtn(spiritQ===q, q==="All"?C.gold:QUARTER_COLOR[q]||C.gold)}>
                      {q==="All"?"ALL QUARTERS":`${q.toUpperCase()} (${SPIRITS_DB.filter(s=>s.quarter===q).length})`}
                    </button>
                  ))}
                </div>
                <input value={spiritSearch} onChange={e=>setSpiritSearch(e.target.value)} placeholder="Search name, alias, zodiac, rank..."
                  style={{flex:1,minWidth:160,background:C.bg3,border:`1px solid ${C.border2}`,color:C.text,
                    padding:"4px 10px",fontSize:9,fontFamily:"monospace",outline:"none"}}/>
                <button onClick={()=>setSpiritSirius(s=>!s)} style={{
                  padding:"4px 10px",fontSize:8,letterSpacing:1,fontFamily:"monospace",cursor:"pointer",
                  background:spiritSirius?`${C.gold}22`:"transparent",
                  color:spiritSirius?C.gold2:C.muted,border:`1px solid ${spiritSirius?C.gold:C.border}`,borderRadius:2}}>
                  ★ SIRIUS AXIS ONLY
                </button>
                <div style={{fontSize:9,color:C.dim}}>{filteredSpirits.length} spirits</div>
              </div>
              {spiritQ!=="All" && (
                <div style={{fontSize:9,color:QUARTER_COLOR[spiritQ]||C.gold,marginBottom:4,fontStyle:"italic"}}>
                  {QUARTER_KING[spiritQ]}
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
              {filteredSpirits.map(s=>{
                const qcol=QUARTER_COLOR[s.quarter]||C.gold;
                const hasSirius=s.fixed_stars.includes("Sirius");
                const isSelected=selSpirit===s.name;
                return (
                  <div key={s.name} onClick={()=>setSelSpirit(isSelected?null:s.name)}
                    style={{background:C.bg2,border:`1px solid ${isSelected?qcol:hasSirius?`${C.gold}66`:C.border}`,
                      borderRadius:3,padding:"10px 12px",cursor:"pointer",
                      borderLeft:`3px solid ${hasSirius?C.gold:qcol}`,
                      transition:"border-color 0.15s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <div style={{fontSize:12,color:hasSirius?C.gold2:qcol,fontFamily:"monospace",fontWeight:"bold"}}>
                          {s.name}
                          {hasSirius && <span style={{fontSize:8,color:C.gold,marginLeft:6}}>★ SIRIUS</span>}
                        </div>
                        {s.aliases.length>0 && <div style={{fontSize:8,color:C.muted,marginTop:1}}>{s.aliases.slice(0,2).join(" · ")}</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:8,color:qcol,fontFamily:"monospace"}}>{s.rank}</div>
                        <div style={{fontSize:8,color:C.dim}}>{s.quarter}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                      <span style={S.tag(qcol)}>{s.zodiac}</span>
                      {s.fixed_stars.map(f=>(
                        <span key={f} style={S.tag(f==="Sirius"?C.gold:f==="Procyon"?C.amber:C.silver)}>{f}</span>
                      ))}
                    </div>
                    <div style={{fontSize:8,color:C.dim,lineHeight:1.5}}>{s.powers[0]}</div>
                    {isSelected && (
                      <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                        <div style={{fontSize:8,color:C.amber,marginBottom:4}}>PLANETS</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                          {s.planets.map(p=><span key={p} style={S.tag(C.gold)}>{p}</span>)}
                        </div>
                        <div style={{fontSize:8,color:C.amber,marginBottom:4}}>DECAN</div>
                        <div style={{fontSize:9,color:C.text,marginBottom:8}}>{s.decan||"—"}</div>
                        <div style={{fontSize:8,color:C.amber,marginBottom:4}}>ALL POWERS</div>
                        {s.powers.map((p,i)=>(
                          <div key={i} style={{fontSize:9,color:C.dim,marginBottom:3,paddingLeft:8,borderLeft:`1px solid ${qcol}55`}}>{p}</div>
                        ))}
                        <div style={{fontSize:8,color:C.muted,marginTop:8,fontStyle:"italic"}}>Source: Stellas Daemonum {s.source}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quarter summary */}
            <div style={{...S.card,marginTop:16}}>
              <span style={S.label}>CARDINAL KING SUMMARY</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                {["East","South","West","North"].map(q=>{
                  const qSpirits=SPIRITS_DB.filter(s=>s.quarter===q);
                  const siriusCount=qSpirits.filter(s=>s.fixed_stars.includes("Sirius")).length;
                  const col=QUARTER_COLOR[q];
                  return (
                    <div key={q} style={{background:C.bg3,borderTop:`2px solid ${col}`,padding:10,borderRadius:2}}>
                      <div style={{fontSize:11,color:col,fontFamily:"monospace",fontWeight:"bold",marginBottom:4}}>{q}</div>
                      <div style={{fontSize:8,color:C.muted,marginBottom:6}}>{QUARTER_KING[q]}</div>
                      <div style={{fontSize:14,color:col,fontFamily:"monospace"}}>{qSpirits.length}</div>
                      <div style={{fontSize:8,color:C.dim}}>spirits</div>
                      {siriusCount>0 && <div style={{fontSize:8,color:C.gold,marginTop:4}}>★ {siriusCount} Sirius-resonant</div>}
                      <hr style={S.rule}/>
                      <div style={{fontSize:8,color:C.muted,marginBottom:3}}>Ranks present:</div>
                      {["King","Queen","Duke","Prince","President","Marquis","Earl","Knight"].filter(r=>qSpirits.some(s=>s.rank.includes(r))).map(r=>(
                        <div key={r} style={{fontSize:7,color:C.dim}}>· {r}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ BEHENIAN FIXED STARS (v8 NEW) ════════════════════════════════════ */}
        {tab==="behenian" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>THE FIFTEEN BEHENIAN FIXED STARS — AGRIPPA DE OCCULTA PHILOSOPHIA · STELLAS DAEMONUM (CROWHURST)</span>
              <div style={S.h2}>Talismanic Recipes — Full Agrippa Canon</div>
              <div style={{fontSize:9,color:C.dim,lineHeight:1.6,marginBottom:10}}>
                Each star requires: Moon conjunct star AND conjunct Ascendant or Midheaven · Moon free from malefic aspects · Moon not combust (within 8°30' of Sun).
                Cast image in appropriate stone; suffumigate with appropriate herb at moment of election.
                <span style={{color:C.gold,marginLeft:8}}>★ Gold border = natal conjunction active</span>
              </div>
              <hr style={S.rule}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
              {BEHENIAN_DB.map(star=>{
                const isSelected=selStar===star.name;
                return (
                  <div key={star.name} onClick={()=>setSelStar(isSelected?null:star.name)}
                    style={{background:C.bg2,
                      border:`2px solid ${star.natal?C.gold:isSelected?C.amber:C.border}`,
                      borderRadius:3,padding:14,cursor:"pointer",transition:"border-color 0.15s",
                      position:"relative"}}>
                    {star.natal && (
                      <div style={{position:"absolute",top:-1,right:8,background:C.bg2,
                        fontSize:8,color:C.gold,padding:"0 4px",fontFamily:"monospace",fontWeight:"bold"}}>
                        ★ NATAL
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:14,color:star.natal?C.gold2:C.text,fontFamily:"monospace",fontWeight:"bold"}}>{star.name}</div>
                        <div style={{fontSize:10,color:C.amber,marginTop:2}}>{star.position}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:9,color:C.silver}}>{star.planet}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                      <span style={{...S.tag(C.amber),padding:"2px 8px"}}>{star.stone}</span>
                      <span style={{...S.tag(C.muted),padding:"2px 8px",fontSize:7}}>{star.herb}</span>
                    </div>
                    {star.natal && star.natal_note && (
                      <div style={{background:`${C.gold}15`,border:`1px solid ${C.gold}44`,borderRadius:2,padding:"4px 8px",marginBottom:8,fontSize:8,color:C.gold,lineHeight:1.4}}>
                        {star.natal_note}
                      </div>
                    )}
                    <div style={{fontSize:9,color:isSelected?C.text:C.dim,lineHeight:1.6}}>
                      {star.talisman}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Natal axis highlight */}
            <div style={{...S.card,marginTop:16}}>
              <span style={S.label}>NATAL STAR ACTIVATION PROTOCOLS</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {BEHENIAN_DB.filter(s=>s.natal).map(star=>(
                  <div key={star.name} style={{background:`${C.gold}10`,border:`1px solid ${C.gold}55`,borderRadius:3,padding:12}}>
                    <div style={{fontSize:11,color:C.gold2,fontFamily:"monospace",fontWeight:"bold",marginBottom:4}}>★ {star.name}</div>
                    <div style={{fontSize:9,color:C.amber,marginBottom:6}}>{star.position} · {star.planet}</div>
                    <div style={{fontSize:9,color:C.text,lineHeight:1.6,marginBottom:8}}>{star.natal_note}</div>
                    <hr style={S.rule}/>
                    <div style={{fontSize:8,color:C.muted,marginBottom:3}}>ELECTION: Moon conjunct {star.name} at Ascendant or MC</div>
                    <div style={{fontSize:8,color:C.muted,marginBottom:3}}>Stone: <span style={{color:C.text}}>{star.stone}</span></div>
                    <div style={{fontSize:8,color:C.muted}}>Herb: <span style={{color:C.text}}>{star.herb}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ DECANS (v8 NEW) ══════════════════════════════════════════════════ */}
        {tab==="decans" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>36 ZODIACAL DECANS — SPIRIT ASSIGNMENTS · STELLAS DAEMONUM APPENDIX VIII (CROWHURST)</span>
              <div style={S.h2}>Decan Spirit Governance Map</div>
              <div style={{fontSize:9,color:C.dim,lineHeight:1.6,marginBottom:8}}>
                Each decan of 10° is governed by specific spirits from the Book of Offices and Lemegeton.
                Cardinal kings (Oriens / Amaymon / Paymon / Egin) appear across multiple decans as governing powers.
                <span style={{color:C.gold,marginLeft:8}}>★ Gold = natal planet active in this decan</span>
              </div>
              <hr style={S.rule}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6,marginBottom:16}}>
              {DECAN_DB.map(d=>{
                const isSelected=selDecan===d.key;
                const qcol=d.key.startsWith("Aries")||d.key.startsWith("Taurus")||d.key.startsWith("Gemini")? C.gold:
                           d.key.startsWith("Cancer")||d.key.startsWith("Leo")||d.key.startsWith("Virgo")? C.crimson2:
                           d.key.startsWith("Libra")||d.key.startsWith("Scorpio")||d.key.startsWith("Sagittarius")? C.silver: C.amber;
                return (
                  <div key={d.key} onClick={()=>setSelDecan(isSelected?null:d.key)}
                    style={{background:C.bg2,
                      border:`1px solid ${d.natal?C.gold:isSelected?C.amber:C.border}`,
                      borderRadius:3,padding:"8px 12px",cursor:"pointer",
                      borderLeft:`3px solid ${d.natal?C.gold:qcol}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{fontSize:10,color:d.natal?C.gold2:C.text,fontFamily:"monospace",fontWeight:"bold"}}>
                        {d.sign} · {d.decan}{d.decan===1?"st":d.decan===2?"nd":"rd"} Decan
                        {d.natal && <span style={{fontSize:8,color:C.gold,marginLeft:5}}>★</span>}
                      </div>
                      <div style={{fontSize:9,color:d.spirits.length>0?C.amber:C.muted,fontFamily:"monospace"}}>
                        {d.spirits.length>0?`${d.spirits.length} spirits`:"—"}
                      </div>
                    </div>
                    {d.natal && d.natal_note && (
                      <div style={{fontSize:7,color:C.gold,fontStyle:"italic",marginBottom:4,lineHeight:1.3}}>{d.natal_note}</div>
                    )}
                    {isSelected && d.spirits.length>0 && (
                      <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                          {d.spirits.map(sp=>{
                            const spiritData=SPIRITS_DB.find(s=>s.name===sp||s.aliases.includes(sp));
                            const isCardinalKing=["Oriens","Amaymon","Paymon","Egin"].includes(sp);
                            return (
                              <span key={sp} style={{
                                fontSize:8,padding:"2px 6px",borderRadius:2,
                                background:isCardinalKing?`${C.gold}22`:C.bg3,
                                border:`1px solid ${isCardinalKing?C.gold:(spiritData?.fixed_stars?.includes("Sirius")?`${C.amber}88`:C.border)}`,
                                color:isCardinalKing?C.gold:(spiritData?.fixed_stars?.includes("Sirius")?C.amber:C.text),
                                fontFamily:"monospace"
                              }}>{sp}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {isSelected && d.spirits.length===0 && (
                      <div style={{marginTop:4,fontSize:8,color:C.muted,fontStyle:"italic"}}>OCR partial — manual verification required</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Natal decan highlight panel */}
            <div style={S.card}>
              <span style={S.label}>NATAL DECAN RESONANCE — ACTIVE SPIRIT CHANNELS</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
                {DECAN_DB.filter(d=>d.natal && d.spirits.length>0).map(d=>(
                  <div key={d.key} style={{background:`${C.gold}10`,border:`1px solid ${C.gold}55`,borderRadius:3,padding:12}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{fontSize:11,color:C.gold2,fontFamily:"monospace",fontWeight:"bold",marginBottom:4}}>
                          ★ {d.sign} · {d.decan}{d.decan===1?"st":d.decan===2?"nd":"rd"} Decan
                        </div>
                        <div style={{fontSize:9,color:C.gold,marginBottom:6,lineHeight:1.4}}>{d.natal_note}</div>
                        <div style={{fontSize:8,color:C.muted}}>
                          Governing spirits for operative work when natal planet is transited:
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {d.spirits.map(sp=>{
                          const sd=SPIRITS_DB.find(s=>s.name===sp||s.aliases.includes(sp));
                          const isKing=["Oriens","Amaymon","Paymon","Egin"].includes(sp);
                          return (
                            <div key={sp} style={{background:C.bg,border:`1px solid ${isKing?C.gold:sd?.fixed_stars?.includes("Sirius")?C.amber:C.border2}`,
                              borderRadius:2,padding:"4px 8px",textAlign:"center"}}>
                              <div style={{fontSize:9,color:isKing?C.gold:sd?.fixed_stars?.includes("Sirius")?C.amber:C.text,fontFamily:"monospace"}}>{sp}</div>
                              {sd && <div style={{fontSize:7,color:C.muted}}>{sd.rank}</div>}
                              {sd?.fixed_stars?.includes("Sirius") && <div style={{fontSize:7,color:C.gold}}>★ Sirius</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ VECTOR FORGE ═════════════════════════════════════════════════════ */}
        {tab==="vector" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>SECTION XV — VISUAL TALISMANIC CONSTRUCTION · LIVING CROSSROADS GRIMOIRE</span>
              <div style={S.h2}>Three Construction Streams</div>
              <hr style={S.rule}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                {CONSTRUCTION_STREAMS.map(s=>(
                  <div key={s.method} style={{background:C.bg3,borderTop:`2px solid ${s.color}`,padding:10,borderRadius:2}}>
                    <div style={{fontSize:9,color:s.color,fontFamily:"monospace",marginBottom:4}}>{s.method}</div>
                    <div style={{fontSize:8,color:C.muted,marginBottom:4}}>{s.source}</div>
                    <div style={{fontSize:9,color:C.dim,lineHeight:1.5}}>{s.register}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={S.card}>
                <span style={S.label}>10-LAYER VECTOR BUILD SYSTEM</span>
                {VECTOR_LAYERS.map(l=>(
                  <div key={l.num} style={{display:"flex",gap:10,padding:"5px 8px",
                    background:C.bg,border:`1px solid ${C.border}`,borderLeft:`3px solid ${l.color}`,
                    borderRadius:2,marginBottom:3}}>
                    <div style={{fontSize:9,color:C.muted,fontFamily:"monospace",width:24,flexShrink:0}}>{l.num}</div>
                    <div style={{fontSize:9,color:l.color,fontFamily:"monospace",width:160,flexShrink:0}}>{l.name}</div>
                    <div style={{fontSize:8,color:C.dim}}>{l.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={S.card}>
                  <span style={S.label}>PLANETARY SEAL VOCABULARY</span>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8}}>
                    {Object.entries(PLANET_DB).map(([name,p])=>(
                      <div key={name} style={{textAlign:"center"}}>
                        <SealSVG planet={name} size={68}/>
                        <div style={{fontSize:8,color:p.color,fontFamily:"monospace",marginTop:3}}>{name}</div>
                        <div style={{fontSize:7,color:C.muted}}>{p.sides===0?"∞":p.sides===9?"☽":`${p.sides}-side`}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <span style={S.label}>ARCHÉOMÈTRE — COLOR · TONE · SIGN</span>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:3}}>
                    {ARCHEOMETER.map(a=>(
                      <div key={a.sign} style={{background:C.bg,border:`1px solid ${C.border}`,borderTop:`2px solid ${a.hex}`,padding:"4px 6px",borderRadius:2}}>
                        <div style={{fontSize:7,color:a.hex,fontFamily:"monospace",fontWeight:"bold"}}>{a.sign.slice(0,3)}</div>
                        <div style={{fontSize:7,color:C.silver}}>♩{a.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={S.card}>
              <span style={S.label}>INTEGRATED VISUAL CREATION WORKFLOW — TEN STEPS</span>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
                {WORKFLOW.map(w=>(
                  <div key={w.n} style={{background:C.bg3,borderLeft:`2px solid ${w.col}`,padding:10,borderRadius:2}}>
                    <div style={{fontSize:14,color:w.col,fontFamily:"monospace",fontWeight:"bold",marginBottom:3}}>{w.n}</div>
                    <div style={{fontSize:9,color:w.col,marginBottom:5}}>{w.title}</div>
                    <div style={{fontSize:8,color:C.dim,lineHeight:1.5}}>{w.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ MAGI CODEX ═══════════════════════════════════════════════════════ */}
        {tab==="codex" && (
          <div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {Object.entries(PLANET_DB).map(([name,p])=>(
                <button key={name} onClick={()=>setSelPlanet(name)} style={{
                  display:"flex",alignItems:"center",gap:6,padding:"5px 10px",
                  background:selPlanet===name?`${p.color}22`:C.bg2,
                  border:`1px solid ${selPlanet===name?p.color:C.border}`,
                  color:selPlanet===name?p.color:C.muted,cursor:"pointer",borderRadius:3,fontSize:11,
                }}>
                  <span style={{color:p.color}}>{p.symbol}</span>{name}
                </button>
              ))}
            </div>
            {planet && (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={S.card}>
                    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                      <SealSVG planet={selPlanet} size={100}/>
                      <div>
                        <div style={{fontSize:22,color:planet.color,fontFamily:"monospace"}}>{selPlanet}</div>
                        <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{planet.symbol} · {planet.metal} · {planet.day}</div>
                        <div style={{fontSize:10,color:C.amber,marginBottom:4}}>{planet.orisha}</div>
                        {planet.natal_note && <div style={{fontSize:9,color:C.gold,marginBottom:4}}>⊕ {planet.natal_note}</div>}
                      </div>
                    </div>
                    <hr style={S.rule}/>
                    <div style={{fontSize:8,color:C.muted,marginBottom:6}}>CLAVES INTELLIGENTIARUM — SLOANE 3821 QUALITIES</div>
                    <div style={{columns:2,gap:10}}>
                      {planet.qualities?.map((q,i)=>(
                        <div key={i} style={{fontSize:9,color:C.dim,marginBottom:3}}>· {q}</div>
                      ))}
                    </div>
                    <hr style={S.rule}/>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={S.tag(planet.color)}>{planet.incense}</span>
                      <span style={S.tag(C.muted)}>{planet.archangel}</span>
                      <span style={S.tag(C.gold)}>{planet.divine}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{...S.card,borderTop:`2px solid ${C.gold}`,marginBottom:10}}>
                      <div style={{fontSize:8,color:C.gold,marginBottom:6}}>INTELLIGENCE (DAEMON BONI)</div>
                      <div style={{fontSize:20,color:C.gold2}}>{planet.intel}</div>
                      <div style={{fontSize:14,color:C.muted,direction:"rtl",fontFamily:"serif",margin:"4px 0"}}>{planet.intel_heb}</div>
                      {planet.magicConst && <div style={{fontSize:10,color:C.amber}}>Row sum: {planet.magicConst} · Total: {planet.total?.toLocaleString()}</div>}
                    </div>
                    <div style={{...S.card,borderTop:`2px solid ${C.crimson2}`}}>
                      <div style={{fontSize:8,color:C.crimson2,marginBottom:6}}>SPIRIT (DAEMON MALI)</div>
                      <div style={{fontSize:20,color:C.crimson2}}>{planet.spirit}</div>
                      <div style={{fontSize:14,color:C.muted,direction:"rtl",fontFamily:"serif",margin:"4px 0"}}>{planet.spirit_heb}</div>
                    </div>
                  </div>
                </div>
                {planet.kamea && (
                  <div style={S.card}>
                    <span style={S.label}>PLANETARY KAMEA — AIQ BEKER SIGIL BASE</span>
                    <KameaGrid kamea={planet.kamea} color={planet.color}/>
                  </div>
                )}
                <div style={S.card}>
                  <span style={S.label}>ABRAMELIN SQUARES — FOUR ARMY ASSIGNMENTS</span>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    {Object.keys(ABRA_DB).map(army=>(
                      <button key={army} onClick={()=>setSelArmy(army)} style={{
                        padding:"4px 10px",fontSize:8,fontFamily:"monospace",cursor:"pointer",
                        background:selArmy===army?C.bg3:C.bg2,
                        border:`1px solid ${selArmy===army?C.gold:C.border}`,
                        color:selArmy===army?C.gold:C.muted,borderRadius:2,
                      }}>{army}</button>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {ABRA_DB[selArmy]?.map(sq=>(
                      <div key={sq.id} style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:3,padding:12}}>
                        <div style={{fontSize:8,color:C.gold,marginBottom:4}}>{sq.id} — {sq.title}</div>
                        <div style={{fontSize:9,color:C.dim,marginBottom:8}}>{sq.intent}</div>
                        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                          <AbraSquare rows={sq.rows} size={11}/>
                          <div>
                            <div style={{fontSize:8,color:C.muted}}>Day: <span style={{color:C.text}}>{sq.day}</span></div>
                            <div style={{fontSize:8,color:C.muted}}>Moon: <span style={{color:C.text}}>{sq.lunar}</span></div>
                            <div style={{fontSize:8,color:C.muted}}>Material: <span style={{color:C.text}}>{sq.material}</span></div>
                            {sq.note && <div style={{fontSize:7,color:C.amber,marginTop:6,fontStyle:"italic"}}>{sq.note}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SYNTHESIS ════════════════════════════════════════════════════════ */}
        {tab==="synthesis" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>THE FOUR ARMIES — OPERATIVE DOCTRINE</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                {FOUR_ARMIES.map(a=>(
                  <div key={a.name} style={{background:C.bg3,borderTop:`3px solid ${a.color}`,borderRadius:3,padding:12}}>
                    <div style={{fontSize:20,color:a.color,marginBottom:4}}>{a.icon}</div>
                    <div style={{fontSize:10,color:a.color,fontFamily:"monospace",fontWeight:"bold",marginBottom:6}}>{a.name}</div>
                    <div style={{fontSize:8,color:C.dim,lineHeight:1.5,marginBottom:6}}>{a.composition}</div>
                    <div style={{fontSize:9,color:C.text,lineHeight:1.5,marginBottom:6}}>{a.function}</div>
                    <hr style={S.rule}/>
                    <div style={{fontSize:8,color:C.muted,marginBottom:2}}>Payment:</div>
                    <div style={{fontSize:8,color:C.dim,lineHeight:1.4,marginBottom:6}}>{a.payment}</div>
                    <div style={{fontSize:8,color:C.muted,marginBottom:3}}>Odu: <span style={{color:a.color}}>{a.odu}</span></div>
                    {a.abramelin.map((sq,i)=>(<div key={i} style={{fontSize:7,color:C.dim,marginBottom:2}}>· {sq}</div>))}
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <span style={S.label}>SEVEN GATES — PLANETARY CORRESPONDENCE TABLE</span>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                  <thead>
                    <tr style={{background:C.bg3}}>
                      {["Planet","Orisha","Intelligence","Spirit","Ajogun","Day","Metal"].map(h=>(
                        <th key={h} style={{padding:"6px 10px",textAlign:"left",color:C.muted,fontSize:8,fontFamily:"monospace",borderBottom:`1px solid ${C.border}`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PLANET_DB).map(([name,p],i)=>(
                      <tr key={name} style={{borderBottom:`1px solid ${C.border}22`,background:i%2===0?"transparent":C.bg3}}>
                        <td style={{padding:"6px 10px",color:p.color,fontFamily:"monospace"}}>{p.symbol} {name}</td>
                        <td style={{padding:"6px 10px",color:C.amber}}>{p.orisha}</td>
                        <td style={{padding:"6px 10px",color:C.gold}}>{p.intel}</td>
                        <td style={{padding:"6px 10px",color:C.crimson2,fontSize:9}}>{p.spirit}</td>
                        <td style={{padding:"6px 10px",color:C.crimson2,fontSize:9}}>{p.ajogun}</td>
                        <td style={{padding:"6px 10px",color:C.muted,fontSize:9}}>{p.day}</td>
                        <td style={{padding:"6px 10px",color:C.text,fontSize:9}}>{p.metal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={S.card}>
              <span style={S.label}>OPERATIVE INVOCATIONS</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  {title:"The Daily Seal",text:`"Esu at the center, Oya in the storm,\nI am the crossroads. I am the breath.\nThe traveler is judged. I stand.\nAse. Oya a je!"`,col:C.gold},
                  {title:"Closing Any Working",text:`"The pact is sealed. The debt is paid.\nEsu, you have witnessed.\nGo in peace. Stay in power.\nAse."`,col:C.amber},
                  {title:"Talisman Sealing",text:`"Esu sees. Sealed. Ase."`,col:C.crimson2},
                  {title:"Return Current",text:`"The work is done. The payment is made.\nThe contract is sealed and closed.\nGo in peace and remain in power."`,col:C.silver},
                ].map(({title,text,col})=>(
                  <div key={title} style={{background:C.bg3,borderLeft:`2px solid ${col}`,padding:14}}>
                    <div style={{fontSize:9,color:col,marginBottom:8,fontFamily:"monospace"}}>{title}</div>
                    <div style={{fontSize:11,color:C.text,fontStyle:"italic",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ORACLE ═══════════════════════════════════════════════════════════ */}
        {tab==="oracle" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12}}>
              <div style={S.card}>
                <span style={S.label}>16-SHELL COWRIE ORACLE · MERINDILOGUN</span>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <button onClick={()=>setCastMode("single")} style={{...S.nb(castMode==="single"),flex:1}}>SINGLE</button>
                  <button onClick={()=>setCastMode("composite")} style={{...S.nb(castMode==="composite"),flex:1}}>COMPOSITE</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4,marginBottom:14}}>
                  {cowries.map((c,i)=>(
                    <div key={i} style={{width:38,height:38,borderRadius:"50%",
                      border:`1px solid ${c?C.gold:C.border2}`,
                      background:c?`${C.gold}20`:C.bg3,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:16,color:c?C.gold:C.muted,transition:"all 0.15s",
                    }}>{c?"○":"·"}</div>
                  ))}
                </div>
                <button onClick={castOdu} disabled={casting} style={{
                  width:"100%",padding:"10px",cursor:casting?"default":"pointer",
                  background:"transparent",border:`1px solid ${C.gold}`,color:C.gold,
                  fontSize:10,letterSpacing:3,fontFamily:"monospace",
                }}>{casting?"CASTING...":"◉ CAST THE SHELLS"}</button>
                {thrown && odu1!==null && (
                  <div style={{marginTop:14}}>
                    {castMode==="single" ? (
                      <div style={{background:`${ODU_DB[odu1]?.color||C.bg3}25`,border:`1px solid ${ODU_DB[odu1]?.color||C.border}`,borderRadius:3,padding:14}}>
                        <div style={{fontSize:16,color:ODU_DB[odu1]?.color||C.gold,fontFamily:"monospace"}}>{ODU_DB[odu1]?.name}</div>
                        <div style={{fontSize:11,color:C.amber,marginBottom:8}}>{ODU_DB[odu1]?.subtitle}</div>
                        <div style={{fontSize:9,color:C.text,lineHeight:1.7,marginBottom:8}}>{ODU_DB[odu1]?.traditional}</div>
                        <div style={{fontSize:9,color:C.dim,fontStyle:"italic"}}>{ODU_DB[odu1]?.american}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                          {[odu1,odu2].filter(o=>o!==null).map((o,idx)=>(
                            <div key={idx} style={{background:`${ODU_DB[o]?.color||C.bg3}20`,border:`1px solid ${ODU_DB[o]?.color||C.border}`,borderRadius:3,padding:10}}>
                              <div style={{fontSize:12,color:ODU_DB[o]?.color||C.gold,fontFamily:"monospace"}}>{ODU_DB[o]?.name}</div>
                              <div style={{fontSize:9,color:C.amber}}>{ODU_DB[o]?.subtitle}</div>
                              <div style={{fontSize:8,color:C.dim,marginTop:4,lineHeight:1.5}}>{ODU_DB[o]?.traditional}</div>
                            </div>
                          ))}
                        </div>
                        {odu1!==null && odu2!==null && (
                          <div style={{background:C.bg3,border:`1px solid ${C.gold}40`,borderRadius:3,padding:10}}>
                            <div style={{fontSize:8,color:C.gold,marginBottom:4}}>CROSSROADS SYNTHESIS · Matrix Cell #{(Math.min(odu1,16)-1)*16+Math.min(odu2,16)}</div>
                            <div style={{fontSize:9,color:C.text}}>{ODU16[Math.min(odu1,16)-1]} × {ODU16[Math.min(odu2,16)-1]}</div>
                            <div style={{fontSize:8,color:C.amber,marginTop:4}}>{ODU_MEANINGS[Math.min(odu1,16)-1]} · crossing · {ODU_MEANINGS[Math.min(odu2,16)-1]}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={S.card}>
                <span style={S.label}>16×16 ESU-ODU MATRIX — 256 CROSSROADS</span>
                <div style={{overflowX:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:`20px repeat(16,20px)`,gap:1,marginBottom:2}}>
                    <div/>
                    {ODU16.map((o,i)=>(
                      <div key={i} style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",
                        background:`${ODU_COLORS[i]}30`,fontSize:6,color:ODU_COLORS[i],fontFamily:"monospace"}}>{i+1}</div>
                    ))}
                  </div>
                  {ODU16.map((_,ri)=>(
                    <div key={ri} style={{display:"grid",gridTemplateColumns:`20px repeat(16,20px)`,gap:1,marginBottom:1}}>
                      <div style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",
                        background:`${ODU_COLORS[ri]}30`,fontSize:6,color:ODU_COLORS[ri],fontFamily:"monospace"}}>{ri+1}</div>
                      {ODU16.map((_,ci)=>{
                        const isDiag=ri===ci; const cell=ri*16+ci+1; const isHov=oduHover===cell;
                        return (
                          <div key={ci} onMouseEnter={()=>setOduHover(cell)} onMouseLeave={()=>setOduHover(null)}
                            style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",
                              background:isHov?`${ODU_COLORS[ri]}60`:isDiag?`${ODU_COLORS[ri]}40`:C.bg3,
                              border:isDiag?`1px solid ${ODU_COLORS[ri]}`:`1px solid ${C.border}20`,
                              fontSize:6,color:isDiag?ODU_COLORS[ri]:C.dim,cursor:"pointer"}}>{cell}</div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {oduHover && (
                  <div style={{marginTop:8,background:C.bg3,border:`1px solid ${C.gold}40`,borderRadius:3,padding:8}}>
                    <div style={{fontSize:9,color:C.gold}}>Cell #{oduHover}</div>
                    <div style={{fontSize:10,color:C.text}}>{ODU16[Math.floor((oduHover-1)/16)]} × {ODU16[(oduHover-1)%16]}</div>
                    <div style={{fontSize:8,color:C.amber}}>{ODU_MEANINGS[Math.floor((oduHover-1)/16)]} · {ODU_MEANINGS[(oduHover-1)%16]}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{padding:"10px 20px",borderTop:`1px solid ${C.border}`,
        fontSize:8,color:C.muted,textAlign:"center",letterSpacing:1}}>
        TALISMAN ENGINE v8 · 77 SPIRITS · 15 BEHENIAN FIXED STARS · 36 DECANS · ESU OSO · LIVING CROSSROADS GRIMOIRE ·
        ASE · OYA A JE · LAROYE · ASE
      </div>
    </div>
  );
}
