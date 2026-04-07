import { useState, useRef, useEffect, useCallback } from "react";
import logoLight from "./assets/logo-light.png";
import logoDark from "./assets/logo-dark.png";

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_H=16,SPH=4,HOUR_H=SLOT_H*SPH,CAL_E=24;
const CAL_HOURS=Array.from({length:CAL_E},(_,i)=>i);
const TOT_SLOTS=24*SPH,CAL_H=CAL_E*SPH*SLOT_H,CL=46;

const TH={
  forest:{hBg:"#DADCD0",hBorder:"#C4C6BA",hText:"#2C2C2A",bg:"#FFFFFF",cBg:"#F7F5F1",border:"#D3CFC0",tP:"#2C2C2A",tS:"#5F5E5A",tT:"#B4B2A9",acc:"#3B6D11",accBg:"#EAF3DE",accTx:"#27500A",accBd:"#97C459",aBtn:"#27500A",aBtnTx:"#EAF3DE",sBg:"#FFFFFF",calBg:"#FAFAF8",hr:"#E8E5DE",dash:"#EAE7E0",todL:"#E24B4A",selD:"#EAF3DE",selDB:"#639922",selDT:"#27500A",todDB:"#F5F3EE",rBar:"#97C459",nowL:"#E24B4A"},
  dark:{hBg:"#1A2420",hBorder:"#2A3530",hText:"#E8E0D0",bg:"#151718",cBg:"#1E2225",border:"#2E3438",tP:"#E8EAEB",tS:"#9AA3A8",tT:"#4A5558",acc:"#5DCAA5",accBg:"#1A3530",accTx:"#5DCAA5",accBd:"#2D6B5A",aBtn:"#2D6B5A",aBtnTx:"#C0F0E0",sBg:"#252A2D",calBg:"#1A1E20",hr:"#2A3035",dash:"#252A2D",todL:"#FF6B6B",selD:"#1A3530",selDB:"#5DCAA5",selDT:"#5DCAA5",todDB:"#1E2428",rBar:"#5DCAA5",nowL:"#FF6B6B"},
};
const GP=th=>th==="dark"?{none:{bg:"#222628",border:"#4A5558",text:"#9AA3A8",dot:"#6A7880"},high:{bg:"#1C2E14",border:"#4A7A25",text:"#8FD44A",dot:"#6DB830"},medium:{bg:"#131E2A",border:"#7AAAD4",text:"#A8C8F0",dot:"#A8C8F0"},low:{bg:"#1A1830",border:"#9A90D4",text:"#C5B8F0",dot:"#C5B8F0"}}:{none:{bg:"#F1EFE8",border:"#C8C4B8",text:"#6A6860",dot:"#A8A49C"},high:{bg:"#EAF3DE",border:"#97C459",text:"#27500A",dot:"#639922"},medium:{bg:"#EAF2FC",border:"#88B8E8",text:"#1A4A7A",dot:"#A8C8F0"},low:{bg:"#F0EDF9",border:"#B0A4E0",text:"#3A2E70",dot:"#C5B8F0"}};
const GD=th=>th==="dark"?[{bg:"#2A1F08",border:"#A07820",text:"#F5C87A",dot:"#C49A30"},{bg:"#2A1020",border:"#9A4570",text:"#E890B8",dot:"#C05080"},{bg:"#0A2218",border:"#2A7048",text:"#60C0A0",dot:"#1D9E75"},{bg:"#2A0F0F",border:"#8A3030",text:"#E08080",dot:"#C05050"},{bg:"#1A1E20",border:"#4A5558",text:"#9AA3A8",dot:"#6A7880"},{bg:"#152210",border:"#3A6020",text:"#90C870",dot:"#4A8830"}]:[{bg:"#FAEEDA",border:"#EF9F27",text:"#633806",dot:"#BA7517"},{bg:"#FBEAF0",border:"#ED93B1",text:"#72243E",dot:"#D4537E"},{bg:"#E1F5EE",border:"#5DCAA5",text:"#085041",dot:"#1D9E75"},{bg:"#FCEBEB",border:"#F09595",text:"#791F1F",dot:"#E24B4A"},{bg:"#F1EFE8",border:"#B4B2A9",text:"#2C2C2A",dot:"#888780"},{bg:"#EAF3DE",border:"#97C459",text:"#27500A",dot:"#639922"}];
const TASK_COLORS=[{id:"white",bg:"#F5F3EE",border:"#C8C4B8",text:"#2C2C2A",dot:"#A8A49C"},{id:"brown",bg:"#EDD5C0",border:"#8B4513",text:"#3A1200",dot:"#7A3010"},{id:"orange",bg:"#FDEBD0",border:"#C8721A",text:"#5C2E00",dot:"#C8721A"},{id:"green",bg:"#D4EDD9",border:"#3A7D44",text:"#0F3318",dot:"#3A7D44"},{id:"purple",bg:"#D8D0F5",border:"#5A3FAF",text:"#1E0E55",dot:"#3B1F8E"},{id:"black",bg:"#B8B8B8",border:"#111111",text:"#000000",dot:"#000000"}];
const TASK_COLORS_DARK=[{id:"white",bg:"#2A2A28",border:"#6A6860",text:"#C8C4BC",dot:"#888480"},{id:"brown",bg:"#2A1A0C",border:"#7A3A10",text:"#C89070",dot:"#9A5030"},{id:"orange",bg:"#2A1E08",border:"#8A5010",text:"#C88840",dot:"#A86820"},{id:"green",bg:"#0E1F10",border:"#2A5A2A",text:"#70A870",dot:"#3A7A3A"},{id:"purple",bg:"#1A1228",border:"#4A3488",text:"#9080C8",dot:"#6050A8"},{id:"black",bg:"#181818",border:"#404040",text:"#B0B0B0",dot:"#707070"}];

// ── Helpers ───────────────────────────────────────────────────────────────────
function dk(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function tk(){return dk(new Date());}
function du(str){if(!str)return null;return Math.ceil((new Date(str+"T12:00:00")-new Date())/86400000);}
function fd(d){return d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}
function fsd(str){if(!str)return "";return new Date(str+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
function s2t(s){const h=Math.floor(s/SPH),m=(s%SPH)*15;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;}
function greet(name){const h=new Date().getHours();const g=h<12?"Good morning":h<17?"Good afternoon":"Good evening";if(name&&name.trim().length>0&&name.trim().length<=12)return`${g}, ${name.trim()}`;return g;}
function fc(d){return d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}
function nowY(){const n=new Date();return(n.getHours()*60+n.getMinutes()+n.getSeconds()/60)/60*HOUR_H;}
let _id=Date.now();function uid(){return String(++_id);}

function computeCols(tasks){
  const sorted=[...tasks].sort((a,b)=>a.slot-b.slot),cols=[],taskCol={};
  sorted.forEach(task=>{let placed=false;for(let c=0;c<cols.length;c++){const last=cols[c][cols[c].length-1];if(last.slot+last.dur<=task.slot){cols[c].push(task);taskCol[task.id]=c;placed=true;break;}}if(!placed){taskCol[task.id]=cols.length;cols.push([task]);}});
  const result={};
  sorted.forEach(task=>{const active=new Set([taskCol[task.id]]);sorted.forEach(other=>{if(other.id!==task.id&&other.slot<task.slot+task.dur&&other.slot+other.dur>task.slot)active.add(taskCol[other.id]);});result[task.id]={col:taskCol[task.id],total:active.size};});
  return result;
}
function getTaskColor(task,deadlines,DLC,theme){
  if(task.deadlineId){const dl=deadlines.find(d=>d.id===task.deadlineId);if(dl)return DLC[dl.colorIdx%DLC.length];}
  if(task.colorId){const palette=theme==="dark"?TASK_COLORS_DARK:TASK_COLORS;const tc=palette.find(c=>c.id===task.colorId);if(tc)return tc;}
  return theme==="dark"?{bg:"#252A2D",border:"#3A4045",text:"#C8CDD0",dot:"#9AA3A8"}:{bg:"#FFFFFF",border:"#C8C4B0",text:"#2C2C2A",dot:"#888780"};
}

// ── Auth helpers ───────────────────────────────────────────────────────────────
const TOKEN_KEY="pt_token";
function getToken(){return localStorage.getItem(TOKEN_KEY);}
function setToken(t){localStorage.setItem(TOKEN_KEY,t);}
function clearToken(){localStorage.removeItem(TOKEN_KEY);}
async function apiRequest(path,opts={}){
  const token=getToken();
  return fetch(path,{...opts,headers:{...(opts.headers||{}),"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})}});
}
async function loadStoreFromAPI(){
  try{
    const res=await apiRequest("/api/data");
    if(!res.ok)return{_deadlines:[],_projects:[]};
    const data=await res.json();
    if(typeof data!=="object"||Array.isArray(data))return{_deadlines:[],_projects:[]};
    if(!Array.isArray(data._deadlines))data._deadlines=[];
    if(!Array.isArray(data._projects))data._projects=[];
    return data;
  }catch{return{_deadlines:[],_projects:[]};}
}
async function saveStoreToAPI(data){
  try{await apiRequest("/api/data",{method:"POST",body:JSON.stringify(data)});}catch{}
}
// Decode firstName from JWT payload
function getFirstNameFromToken(){
  try{
    const token=getToken();
    if(!token)return null;
    const payload=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return payload.firstName||null;
  }catch{return null;}
}

// ── useNarrow hook ─────────────────────────────────────────────────────────────
function useNarrow(){
  const [n,setN]=useState(window.innerWidth<900);
  useEffect(()=>{const h=()=>setN(window.innerWidth<900);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return n;
}

// ── Small shared components ────────────────────────────────────────────────────
function NpIcon({has,color,size=12}){return <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{flexShrink:0,verticalAlign:"middle"}}><rect x={1} y={1} width={10} height={10} rx={1.5} stroke={color} strokeWidth={1.2} fill={has?"currentColor":"none"} fillOpacity={has?0.18:0}/><line x1={3} y1={4} x2={9} y2={4} stroke={color} strokeWidth={1}/><line x1={3} y1={6.5} x2={9} y2={6.5} stroke={color} strokeWidth={1}/><line x1={3} y1={9} x2={7} y2={9} stroke={color} strokeWidth={1}/></svg>;}
function PriorityTag({priority,P}){const c=P[priority||"none"];return <span style={{fontSize:9,padding:"1px 5px 1px 4px",borderRadius:20,background:c.bg,color:c.text,border:`0.5px solid ${c.border}`,flexShrink:0,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:c.dot,flexShrink:0,display:"inline-block"}}/>{priority||"none"}</span>;}
function SL({text,t}){return <div style={{fontSize:10,fontWeight:500,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{text}</div>;}

function MiniPie({pct,color,size=26}){
  const r=11,cx=14,cy=14;
  if(pct>=100)return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.25}/><circle cx={cx} cy={cy} r={r} fill={color}/><path d="M9 14l3 3 7-7" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
  if(pct<=0)return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.2}/></svg>;
  const sw=(pct/100)*2*Math.PI,x1=cx+r*Math.cos(-Math.PI/2),y1=cy+r*Math.sin(-Math.PI/2),x2=cx+r*Math.cos(-Math.PI/2+sw),y2=cy+r*Math.sin(-Math.PI/2+sw);
  return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.2}/><path d={`M${cx},${cy} L${x1},${y1} A${r},${r},0,${sw>Math.PI?1:0},1,${x2},${y2} Z`} fill={color}/></svg>;
}

function PieDt({tasks,t}){
  const done=tasks.filter(x=>x.done).length,todo=tasks.filter(x=>!x.done),total=tasks.length;
  if(!total)return <div style={{fontSize:12,color:t.tT,textAlign:"center",padding:"12px 0"}}>No tasks yet</div>;
  const sd=[{val:done,color:"#2D9B6F",label:"Done"},{val:todo.filter(x=>x.priority==="high").length,color:"#639922",label:"High"},{val:todo.filter(x=>x.priority==="medium").length,color:"#A8C8F0",label:"Medium"},{val:todo.filter(x=>x.priority==="low").length,color:"#C5B8F0",label:"Low"},{val:todo.filter(x=>!x.priority||x.priority==="none").length,color:"#C8C4B8",label:"None"}].filter(s=>s.val>0);
  const R=44,cx=54,cy=54;let paths=[];
  if(sd.length===1){paths=[{...sd[0],circle:true}];}
  else{let angle=-Math.PI/2;sd.forEach(s=>{const sw=(s.val/total)*2*Math.PI,x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);angle+=sw;const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);paths.push({...s,d:`M${cx},${cy} L${x1},${y1} A${R},${R},0,${sw>Math.PI?1:0},1,${x2},${y2} Z`,circle:false});});}
  return(
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <svg width={108} height={108} viewBox="0 0 108 108" style={{flexShrink:0}}>
        {paths.map((p,i)=>p.circle?<circle key={i} cx={cx} cy={cy} r={R} fill={p.color}/>:<path key={i} d={p.d} fill={p.color} stroke={t.bg} strokeWidth={0.5}/>)}
        <circle cx={cx} cy={cy} r={27} fill={t.bg}/><text x={cx} y={cy-4} textAnchor="middle" fontSize={17} fontWeight="500" fill={t.tP}>{total}</text><text x={cx} y={cy+9} textAnchor="middle" fontSize={10} fill={t.tS}>tasks</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
        {sd.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}><span style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0,display:"inline-block"}}/><span style={{color:t.tS,flex:1}}>{s.label}</span><span style={{fontWeight:500,color:t.tP}}>{s.val}</span></div>)}
        <div style={{marginTop:4,height:4,borderRadius:4,background:t.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(done/total*100)}%`,background:"#2D9B6F",borderRadius:4}}/></div>
        <div style={{fontSize:11,color:t.tT}}>{Math.round(done/total*100)}% complete</div>
      </div>
    </div>
  );
}

function MonthCal({date,setDate,store,deadlines,t}){
  const [vd,setVd]=useState(new Date(date.getFullYear(),date.getMonth(),1));
  const y=vd.getFullYear(),mo=vd.getMonth(),first=new Date(y,mo,1),sd=first.getDay(),off=(sd===0?6:sd-1),dim=new Date(y,mo+1,0).getDate();
  const cells=[];
  for(let i=0;i<off;i++){const d=new Date(y,mo,1-off+i);cells.push({d,cur:false});}
  for(let i=1;i<=dim;i++)cells.push({d:new Date(y,mo,i),cur:true});
  while(cells.length%7!==0){const last=cells[cells.length-1].d;const d=new Date(last);d.setDate(last.getDate()+1);cells.push({d,cur:false});}
  const tk2=tk(),sk=dk(date);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button onClick={()=>setVd(new Date(y,mo-1,1))} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",color:t.tS,fontSize:12}}>‹</button>
        <span style={{fontSize:12,fontWeight:500,color:t.tS}}>{vd.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setVd(new Date(y,mo+1,1))} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",color:t.tS,fontSize:12}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:3}}>{["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:t.tT,padding:"2px 0"}}>{d}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((cell,i)=>{const k=dk(cell.d),isSel=k===sk,isToday=k===tk2,cnt=(store[k]||[]).length,dc=(store[k]||[]).filter(x=>x.done).length,hd=deadlines.some(dl=>dl.date===k);return(<button key={i} onClick={()=>setDate(new Date(cell.d.getFullYear(),cell.d.getMonth(),cell.d.getDate()))} style={{padding:"4px 2px",borderRadius:7,border:isSel?`1.5px solid ${t.selDB}`:`0.5px solid transparent`,background:isSel?t.selD:isToday?t.todDB:"transparent",cursor:"pointer",textAlign:"center",opacity:cell.cur?1:0.3,minHeight:32}}><div style={{fontSize:11,fontWeight:isSel?500:400,color:isSel?t.selDT:isToday?t.tP:t.tS}}>{cell.d.getDate()}</div><div style={{display:"flex",justifyContent:"center",gap:2,marginTop:1}}>{cnt>0&&<div style={{width:4,height:4,borderRadius:"50%",background:dc===cnt?t.acc:t.accBd}}/>}{hd&&<div style={{width:4,height:4,borderRadius:"50%",background:"#E24B4A"}}/>}</div></button>);})}
      </div>
    </div>
  );
}

function WeekStrip({date,setDate,store,deadlines,t}){
  const dow=date.getDay(),mon=new Date(date);mon.setDate(date.getDate()-((dow===0?7:dow)-1));
  const days=Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d;});
  const tk2=tk(),sk=dk(date);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-7);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",color:t.tS,fontSize:12}}>‹</button>
        <span style={{fontSize:11,fontWeight:500,color:t.tS}}>{mon.toLocaleDateString("en-GB",{month:"short",day:"numeric"})} – {days[6].toLocaleDateString("en-GB",{month:"short",day:"numeric"})}</span>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+7);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",color:t.tS,fontSize:12}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {days.map((d,i)=>{const k=dk(d),isSel=k===sk,isToday=k===tk2,cnt=(store[k]||[]).length,dc=(store[k]||[]).filter(x=>x.done).length,hd=deadlines.some(dl=>dl.date===k);return(<button key={i} onClick={()=>setDate(new Date(d.getFullYear(),d.getMonth(),d.getDate()))} style={{padding:"6px 2px",borderRadius:9,border:isSel?`1.5px solid ${t.selDB}`:`0.5px solid ${t.border}`,background:isSel?t.selD:isToday?t.todDB:"rgba(255,255,255,0.6)",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:10,color:isSel?t.selDT:t.tT,marginBottom:2}}>{["M","T","W","T","F","S","S"][i]}</div><div style={{fontSize:13,fontWeight:isSel?500:400,color:isSel?t.selDT:isToday?t.tP:t.tS}}>{d.getDate()}</div><div style={{display:"flex",justifyContent:"center",gap:2,marginTop:3,height:6}}>{cnt>0&&<div style={{width:5,height:5,borderRadius:"50%",background:dc===cnt?t.acc:"#97C459"}}/>}{hd&&<div style={{width:5,height:5,borderRadius:"50%",background:"#E24B4A"}}/>}</div></button>);})}
      </div>
    </div>
  );
}

function NoteModal({task,t,onSave,onClose}){
  const [val,setVal]=useState(task.note||"");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.38)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:16,padding:28,width:520,maxWidth:"90vw",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{fontWeight:500,fontSize:14,color:t.tP,flex:1,marginRight:12}}>{task.text}</div><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:20}}>×</button></div>
        <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Add notes…" style={{flex:1,minHeight:220,fontSize:13,borderRadius:10,border:`0.5px solid ${t.border}`,padding:"11px 13px",background:t.sBg,color:t.tP,resize:"none",outline:"none",fontFamily:"inherit",lineHeight:1.7}}/>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{fontSize:13,padding:"8px 20px",borderRadius:8,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave(val)} style={{fontSize:13,padding:"8px 20px",borderRadius:8,border:"none",background:t.aBtn,color:t.aBtnTx,cursor:"pointer",fontWeight:500}}>Save note</button>
        </div>
      </div>
    </div>
  );
}

function TimerPopup({t,ts,onConfirm,onClose}){
  const [mins,setMins]=useState(25);
  const [editing,setEditing]=useState(false);
  const [editVal,setEditVal]=useState("25");
  const running=ts&&ts.state==="running";
  const presets=[5,15,30,60,120];
  const pct=ts?Math.max(0,(ts.remaining/ts.total)*100):0;
  const r=54,cx=64,cy=64,circ=2*Math.PI*r,dash=circ*(pct/100);
  function commitEdit(){const v=parseInt(editVal,10);if(!isNaN(v)&&v>0)setMins(Math.min(999,v));setEditing(false);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:20,padding:"28px 32px",width:340,boxShadow:"0 16px 48px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <span style={{fontSize:14,fontWeight:500,color:t.tP}}>Timer</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:18,lineHeight:1}}>×</button>
        </div>
        {!ts?(<>
          <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
            {presets.map(p=><button key={p} onClick={()=>setMins(p)} style={{fontSize:11,padding:"5px 11px",borderRadius:20,border:`0.5px solid ${mins===p?t.acc:t.border}`,background:mins===p?t.accBg:"transparent",color:mins===p?t.acc:t.tS,cursor:"pointer",fontWeight:mins===p?500:400}}>{p}m</button>)}
          </div>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:11,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Duration — double-click to type</div>
            <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center"}}>
              <button onClick={()=>setMins(m=>Math.max(1,m-5))} style={{width:36,height:36,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <div style={{minWidth:80,textAlign:"center"}} onDoubleClick={()=>{setEditing(true);setEditVal(String(mins));}}>
                {editing
                  ?<input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value.replace(/\D/g,""))} onBlur={commitEdit} onKeyDown={e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditing(false);}} style={{width:72,fontSize:38,fontWeight:500,color:t.tP,textAlign:"center",border:"none",borderBottom:`2px solid ${t.acc}`,background:"transparent",outline:"none"}}/>
                  :<div style={{fontSize:40,fontWeight:500,color:t.tP,lineHeight:1,cursor:"default",userSelect:"none"}}>{String(mins).padStart(2,"0")}</div>
                }
                <div style={{fontSize:11,color:t.tT,marginTop:2}}>minutes</div>
              </div>
              <button onClick={()=>setMins(m=>m+5)} style={{width:36,height:36,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
          <button onClick={()=>onConfirm(mins*60)} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",color:t.aBtnTx,fontSize:13,fontWeight:600}}>Start timer</button>
        </>):(<>
          <div style={{display:"flex",justifyContent:"center",marginBottom:20,position:"relative"}}>
            <svg width={128} height={128} style={{transform:"rotate(-90deg)"}}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.border} strokeWidth={6}/>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={running?t.acc:"#97C459"} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{transition:"stroke-dasharray 1s linear"}}/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:500,color:t.tP,fontFamily:"monospace"}}>{String(Math.floor(ts.remaining/60)).padStart(2,"0")}:{String(ts.remaining%60).padStart(2,"0")}</div>
              <div style={{fontSize:11,color:running?t.acc:t.tT,marginTop:2}}>{running?"Running":"Paused"}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,justifyContent:"center"}}>
            <span style={{fontSize:11,color:t.tT,marginRight:2}}>Add:</span>
            {[5,15,30,60,120].map(m=><button key={m} onClick={()=>onConfirm(m*60,"add")} style={{fontSize:11,padding:"4px 9px",borderRadius:20,border:`0.5px solid ${t.border}`,background:t.sBg,color:t.tS,cursor:"pointer"}}>{m}m</button>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onConfirm(0,"toggle")} style={{flex:1,fontSize:12,padding:"9px 0",borderRadius:10,border:`0.5px solid ${t.border}`,background:t.sBg,color:t.tP,cursor:"pointer",fontWeight:500}}>{running?"Pause":"Resume"}</button>
            <button onClick={()=>onConfirm(0,"cancel")} style={{flex:1,fontSize:12,padding:"9px 0",borderRadius:10,border:"0.5px solid #E24B4A",background:"transparent",color:"#E24B4A",cursor:"pointer",fontWeight:500}}>Cancel</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function DlColorPicker({DLC,value,onChange,t}){
  const c=DLC[value];const NAMES=["Amber","Rose","Teal","Coral","Stone","Sage"];
  return(<div style={{position:"relative",marginBottom:8}}><select value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`1.5px solid ${c.border}`,padding:"5px 8px",background:c.bg,color:c.text,cursor:"pointer",outline:"none",appearance:"none"}}>{DLC.map((dc,i)=><option key={i} value={i}>{NAMES[i]}</option>)}</select><div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:c.text}}>▾</div></div>);
}

function DeadlineItem({dl,c,allT,t,P,DLC,isExp,onToggle,onRemove,onSaveEdit,showRemove}){
  const ddn=allT.filter(x=>x.done).length,dtt=allT.length,pct=dtt>0?Math.round(ddn/dtt*100):0;
  const days=du(dl.date),ov=days!==null&&days<0,urg=days!==null&&days<=3&&days>=0;
  const [editing,setEditing]=useState(false);
  const [eTitle,setETitle]=useState(dl.title);const [eDate,setEDate]=useState(dl.date);const [eColor,setEColor]=useState(dl.colorIdx);
  return(
    <div style={{borderRadius:10,border:`0.5px solid ${c.border}`,background:c.bg+"99",marginBottom:8,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",cursor:"pointer"}} onClick={onToggle}>
        <MiniPie pct={pct} color={c.dot} size={26}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dl.title}</div><div style={{fontSize:10,color:ov?"#E24B4A":urg?"#C07010":c.dot,marginTop:1}}>{ov?`${Math.abs(days)}d overdue`:days===0?"Due today":days===1?"Due tomorrow":`${days}d left`}</div></div>
        <span style={{fontSize:11,color:c.dot,flexShrink:0}}>{isExp?"▴":"▾"}</span>
      </div>
      {isExp&&(<div style={{borderTop:`0.5px solid ${c.border}`,padding:"10px"}}>
        {editing?(<div>
          <input value={eTitle} onChange={e=>setETitle(e.target.value)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${c.border}`,padding:"5px 8px",background:"transparent",color:c.text,marginBottom:5,boxSizing:"border-box",outline:"none"}}/>
          <input type="date" value={eDate} onChange={e=>setEDate(e.target.value)} style={{width:"100%",fontSize:11,borderRadius:7,border:`0.5px solid ${c.border}`,padding:"5px 6px",background:"transparent",color:c.text,boxSizing:"border-box",outline:"none",marginBottom:5}}/>
          <DlColorPicker DLC={DLC} value={eColor} onChange={setEColor} t={t}/>
          <div style={{display:"flex",gap:6,marginTop:6}}><button onClick={()=>{onSaveEdit({...dl,title:eTitle,date:eDate,colorIdx:eColor});setEditing(false);}} style={{flex:1,fontSize:11,padding:"5px 0",borderRadius:7,border:"none",background:c.dot,color:"#fff",cursor:"pointer"}}>Save</button><button onClick={()=>setEditing(false)} style={{flex:1,fontSize:11,padding:"5px 0",borderRadius:7,border:`0.5px solid ${c.border}`,background:"transparent",color:c.text,cursor:"pointer"}}>Cancel</button></div>
        </div>):(<>
          {dl.desc&&<div style={{fontSize:11,color:c.text,marginBottom:6,opacity:0.8}}>{dl.desc}</div>}
          <div style={{fontSize:11,color:c.text,marginBottom:6}}>Due: {fsd(dl.date)}</div>
          <div style={{fontSize:11,color:c.text,marginBottom:6}}>{ddn}/{dtt} tasks complete</div>
          <div style={{height:5,borderRadius:4,background:c.border+"44",overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${pct}%`,background:c.dot,borderRadius:4}}/></div>
          {allT.map(x=>(<div key={x.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"3px 0"}}><span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:P[x.priority||"none"].dot,flexShrink:0}}/><span style={{flex:1,color:x.done?t.tT:c.text,textDecoration:x.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.text}</span></div>))}
          <div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>setEditing(true)} style={{fontSize:10,color:c.text,background:"none",border:`0.5px solid ${c.border}`,borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>Edit</button>{showRemove&&<button onClick={onRemove} style={{fontSize:10,color:"#E24B4A",background:"none",border:"0.5px solid #E24B4A",borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>Remove</button>}</div>
        </>)}
      </div>)}
    </div>
  );
}

const AB=(t)=>({width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,border:`0.5px solid ${t.border}`,background:"transparent",cursor:"pointer",flexShrink:0,padding:0,lineHeight:1});

function TaskItem({task,isScheduled,deadlines,DLC,P,t,theme,toggleDone,removeTask,unschedule,startEdit,saveEdit,cancelEdit,editId,editText,setEditText,editPri,setEditPri,editDur,setEditDur,editDlId,setEditDlId,editMv,setEditMv,editColorId,setEditColorId,onDragStart,onDragEnd,onNote,store}){
  const isEd=editId===task.id;const tc=getTaskColor(task,deadlines,DLC,theme);const pc=P[task.priority||"none"];const dl=deadlines.find(d=>d.id===task.deadlineId),dlC=dl?DLC[dl.colorIdx%DLC.length]:null;const hN=!!(task.note&&task.note.trim());
  return(
    <div className="trow" draggable={!isScheduled} onDragStart={!isScheduled?e=>onDragStart(e,task):undefined} onDragEnd={onDragEnd} style={{display:"flex",alignItems:"center",gap:7,borderRadius:"0 8px 8px 0",background:tc.bg+"88",padding:"5px 8px",marginBottom:5,cursor:isScheduled?"default":"grab",userSelect:"none",boxSizing:"border-box",borderTop:`0.5px solid ${tc.border}`,borderRight:`0.5px solid ${tc.border}`,borderBottom:`0.5px solid ${tc.border}`,borderLeft:`3px solid ${pc.dot}`}}>
      <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)}/>
      <div style={{flex:1,minWidth:0}}>
        {isEd?(<div>
          <input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit()} autoFocus style={{width:"100%",fontSize:12,borderRadius:6,border:`0.5px solid ${t.border}`,padding:"3px 7px",marginBottom:4,boxSizing:"border-box",background:t.cBg,color:t.tP}}/>
          <div style={{display:"flex",gap:3,marginBottom:4}}>{["high","medium","low"].map(p=><button key={p} onClick={()=>setEditPri(editPri===p?null:p)} style={{flex:1,fontSize:10,padding:"2px 0",borderRadius:20,border:`1px solid ${editPri===p?P[p].border:t.border}`,background:editPri===p?P[p].bg:"transparent",color:editPri===p?P[p].text:t.tS,cursor:"pointer"}}>{p}</button>)}</div>
          <div style={{display:"flex",gap:4}}><button onClick={saveEdit} style={{flex:1,fontSize:11,padding:"3px 0",borderRadius:6,border:"none",background:t.aBtn,color:t.aBtnTx,cursor:"pointer"}}>Save</button><button onClick={cancelEdit} style={{flex:1,fontSize:11,padding:"3px 0",borderRadius:6,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Cancel</button></div>
        </div>):(<div>
          <div style={{fontSize:12,color:task.done?t.tT:tc.text,textDecoration:task.done?"line-through":"none",lineHeight:1.3,wordBreak:"break-word"}}>{task.text}</div>
          <div style={{display:"flex",gap:7,marginTop:3,alignItems:"center",flexWrap:"wrap"}}><PriorityTag priority={task.priority} P={P}/><span style={{fontSize:10,color:t.tT}}>{task.dur*15}m</span>{isScheduled&&<span style={{fontSize:10,color:t.tT}}>{s2t(task.slot)}</span>}{hN&&<span onClick={()=>onNote(task)} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",color:tc.dot}}><NpIcon has={true} color={tc.dot}/></span>}{dl&&dlC&&<span style={{fontSize:10,padding:"0px 6px",borderRadius:20,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,whiteSpace:"nowrap"}}>{dl.title}</span>}</div>
        </div>)}
      </div>
      {!isEd&&(<div className="ta" style={{display:"flex",gap:3,flexShrink:0,alignItems:"center"}}>
        <button onClick={()=>startEdit(task)} style={{...AB(t),fontSize:10,color:t.tS,fontWeight:500}}>Edit</button>
        <button onClick={()=>onNote(task)} style={{...AB(t),color:tc.dot}}><NpIcon has={hN} color={tc.dot} size={11}/></button>
        <button onClick={isScheduled?()=>unschedule(task.id):undefined} style={{...AB(t),color:isScheduled?t.tS:t.tT,opacity:isScheduled?1:0.35,cursor:isScheduled?"pointer":"default",fontSize:13}}>↩</button>
        <button onClick={()=>removeTask(task.id)} style={{...AB(t),color:"#E24B4A",fontSize:13}}>×</button>
      </div>)}
    </div>
  );
}

function CalTask({task,tc,pc,lay,top,height,dl,dlC,P,toggleDone,unschedule,onDragStart,onDragEnd,onResize,t}){
  const narrow=lay.colPct<=55;
  return(
    <div className="cpill trow" draggable onDragStart={e=>onDragStart(e,task)} onDragEnd={onDragEnd} style={{position:"absolute",left:`${lay.leftPct}%`,width:`calc(${lay.colPct}% - 4px)`,top,height,background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:9,padding:"3px 6px",cursor:"grab",display:"flex",alignItems:narrow?"flex-start":"center",gap:3,overflow:"hidden"}}>
      <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{width:10,height:10,flexShrink:0,accentColor:pc.dot,marginTop:narrow?2:0}}/>
      {narrow?(
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
          <span style={{fontSize:11,fontWeight:500,color:task.done?tc.border:tc.text,textDecoration:task.done?"line-through":"none",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}</span>
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:3}}><PriorityTag priority={task.priority} P={P}/><span style={{fontSize:9,color:tc.dot,whiteSpace:"nowrap"}}>{s2t(task.slot)}·{task.dur*15}m</span>{dl&&dlC&&<span style={{padding:"1px 4px",borderRadius:5,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,fontSize:9,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{dl.title}</span>}</div>
        </div>
      ):(
        <>
          <span style={{fontSize:11,fontWeight:500,color:task.done?tc.border:tc.text,textDecoration:task.done?"line-through":"none",flex:1,minWidth:0,lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{task.text}</span>
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}><PriorityTag priority={task.priority} P={P}/><span style={{fontSize:9,color:tc.dot,whiteSpace:"nowrap"}}>{s2t(task.slot)}·{task.dur*15}m</span>{dl&&dlC&&<span style={{padding:"1px 4px",borderRadius:5,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,fontSize:9,whiteSpace:"nowrap"}}>{dl.title}</span>}</div>
        </>
      )}
      <button onClick={e=>{e.stopPropagation();unschedule(task.id);}} style={{background:"none",border:"none",cursor:"pointer",color:tc.dot,fontSize:10,padding:0,lineHeight:1,flexShrink:0,alignSelf:narrow?"flex-start":"center",marginTop:narrow?1:0}}>↩</button>
      <div className="rh" onMouseDown={e=>onResize(e,task)}><div style={{width:20,height:2.5,borderRadius:2,background:tc.border,opacity:0.9}}/></div>
    </div>
  );
}

function ProjectsOverlay({store,t,theme,DLC,P,onClose,onUpdateStore}){
  const projects=Array.isArray(store._projects)?store._projects:[];
  const [newName,setNewName]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [newColor,setNewColor]=useState(0);
  const [sel,setSel]=useState(null);
  const NAMES=["Amber","Rose","Teal","Coral","Stone","Sage"];

  function addProject(){if(!newName.trim())return;const np={id:uid(),name:newName.trim(),desc:newDesc.trim(),colorIdx:newColor};onUpdateStore({...store,_projects:[...projects,np]});setNewName("");setNewDesc("");setNewColor(0);}
  function removeProject(id){onUpdateStore({...store,_projects:projects.filter(p=>p.id!==id)});}

  const selP=sel?projects.find(p=>p.id===sel):null;
  const selC=selP?DLC[selP.colorIdx%DLC.length]:null;
  const allDates=Object.keys(store).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k));
  const projTasks=selP?allDates.flatMap(k=>(Array.isArray(store[k])?store[k]:[]).filter(t=>t.projectId===selP.id)):[];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.cBg,borderRadius:18,width:680,maxWidth:"94vw",maxHeight:"80vh",display:"flex",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        {/* Sidebar */}
        <div style={{width:220,flexShrink:0,borderRight:`0.5px solid ${t.border}`,padding:"20px 16px",display:"flex",flexDirection:"column",gap:0,overflowY:"auto"}}>
          <div style={{fontWeight:500,fontSize:14,color:t.tP,marginBottom:16}}>Projects</div>
          {projects.length===0&&<div style={{fontSize:12,color:t.tT,marginBottom:12}}>No projects yet.</div>}
          {projects.map(p=>{const c=DLC[p.colorIdx%DLC.length];return(<button key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,border:`0.5px solid ${sel===p.id?c.border:t.border}`,background:sel===p.id?c.bg:"transparent",cursor:"pointer",marginBottom:5,textAlign:"left",width:"100%"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:c.dot,flexShrink:0,display:"inline-block"}}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:sel===p.id?c.text:t.tP,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>{p.desc&&<div style={{fontSize:10,color:t.tT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.desc}</div>}</div>
          </button>);})}
          <div style={{borderTop:`0.5px solid ${t.hr}`,paddingTop:12,marginTop:8}}>
            <div style={{fontSize:10,color:t.tT,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>New project</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProject()} placeholder="Project name" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,marginBottom:5,boxSizing:"border-box",outline:"none"}}/>
            <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description (optional)" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,marginBottom:7,boxSizing:"border-box",outline:"none"}}/>
            <select value={newColor} onChange={e=>setNewColor(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${DLC[newColor].border}`,padding:"5px 8px",background:DLC[newColor].bg,color:DLC[newColor].text,marginBottom:8,outline:"none"}}>
              {DLC.map((_,i)=><option key={i} value={i}>{NAMES[i]}</option>)}
            </select>
            <button onClick={addProject} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Add project</button>
          </div>
        </div>
        {/* Detail */}
        <div style={{flex:1,padding:"20px 20px",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:20,lineHeight:1}}>×</button>
          </div>
          {!selP?(<div style={{textAlign:"center",padding:"40px 0",color:t.tT,fontSize:13}}>Select a project to see details</div>):(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <span style={{width:12,height:12,borderRadius:"50%",background:selC.dot,display:"inline-block"}}/>
                <div style={{fontSize:18,fontWeight:500,color:selP?selC.text:t.tP}}>{selP.name}</div>
                <button onClick={()=>{removeProject(selP.id);setSel(null);}} style={{marginLeft:"auto",fontSize:11,color:"#E24B4A",background:"none",border:"0.5px solid #E24B4A",borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>Remove</button>
              </div>
              {selP.desc&&<div style={{fontSize:13,color:t.tS,marginBottom:16}}>{selP.desc}</div>}
              <div style={{fontSize:10,fontWeight:500,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Tasks in this project</div>
              {projTasks.length===0?(<div style={{fontSize:12,color:t.tT}}>No tasks linked to this project yet.</div>):(projTasks.map(t2=><div key={t2.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,padding:"4px 0",borderBottom:`0.5px solid ${t.hr}`}}><span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:P[t2.priority||"none"].dot,flexShrink:0}}/><span style={{flex:1,color:t2.done?t.tT:t.tP,textDecoration:t2.done?"line-through":"none"}}>{t2.text}</span><PriorityTag priority={t2.priority} P={P}/></div>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Auth page ─────────────────────────────────────────────────────────────────
function AuthPage({onLogin}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [firstName,setFirstName]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e){
    e.preventDefault();setError("");setLoading(true);
    try{
      const body=mode==="signup"?{email,password,firstName:firstName.trim()}:{email,password};
      const res=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok){setError(data.error||"Something went wrong");setLoading(false);return;}
      setToken(data.token);
      await new Promise(r=>setTimeout(r,0));
      onLogin();
    }catch{setError("Network error. Please try again.");setLoading(false);}
  }

  const inputStyle={width:"100%",fontSize:14,borderRadius:10,border:"1px solid #D3CFC0",padding:"11px 14px",background:"#FFFFFF",color:"#2C2C2A",outline:"none",marginBottom:12,boxSizing:"border-box"};
  const t=TH.forest;

  return(
    <div style={{minHeight:"100vh",background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={logoLight} alt="PineTask" style={{height:40,objectFit:"contain"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
          <div style={{display:"none",fontSize:22,fontWeight:600,color:"#27500A",letterSpacing:"-0.5px"}}>🌲 PineTask</div>
        </div>
        <div style={{background:"#F7F5F1",borderRadius:18,padding:"32px",border:"1px solid #E8E5DE"}}>
          <div style={{fontSize:20,fontWeight:600,color:"#2C2C2A",marginBottom:6}}>{mode==="login"?"Welcome back":"Create account"}</div>
          <div style={{fontSize:13,color:"#5F5E5A",marginBottom:24}}>{mode==="login"?"Sign in to your PineTask account":"Get started with PineTask for free"}</div>
          <form onSubmit={handleSubmit}>
            {mode==="signup"&&<input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name (optional)" style={inputStyle}/>}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required style={inputStyle}/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required minLength={6} style={{...inputStyle,marginBottom:16}}/>
            {error&&<div style={{fontSize:13,color:"#E24B4A",marginBottom:12,padding:"8px 12px",background:"rgba(226,75,74,0.08)",borderRadius:8,border:"0.5px solid rgba(226,75,74,0.3)"}}>{error}</div>}
            <button type="submit" disabled={loading} style={{width:"100%",background:"#27500A",border:"none",borderRadius:10,padding:"12px 0",cursor:loading?"wait":"pointer",color:"#EAF3DE",fontSize:14,fontWeight:600,letterSpacing:"0.02em",opacity:loading?0.7:1}}>
              {loading?"Please wait…":mode==="login"?"Sign in":"Create account"}
            </button>
          </form>
          <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"#5F5E5A"}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}} style={{background:"none",border:"none",color:"#27500A",cursor:"pointer",fontWeight:600,fontSize:13,padding:0}}>
              {mode==="login"?"Sign up":"Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Calendar section (shared between wide and narrow layout) ──────────────────
function CalendarColumn({t,sched,calScrollRef,onDragOver,onDrop,onDragLeave,deadlines,DLC,key:_k,ghost,ny,toggleDone,unschedule,onDragStart,onDragEnd,onResize,P,cLayout,theme,tasks}){
  const key=_k;
  return(
    <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px",display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
      <SL text="Day schedule — drag tasks here" t={t}/>
      <div ref={calScrollRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave} style={{flex:1,minHeight:0,overflowY:"scroll",borderRadius:12,border:`0.5px solid ${t.border}`,background:t.calBg}}>
        <div style={{position:"relative",height:CAL_H,width:"100%"}}>
          {CAL_HOURS.map((h,hi)=>(<div key={h} style={{position:"absolute",top:hi*HOUR_H,left:0,right:0,height:HOUR_H,display:"flex",borderBottom:hi<CAL_HOURS.length-1?`0.5px solid ${t.hr}`:"none"}}><div style={{width:CL,flexShrink:0,paddingTop:4,paddingRight:7,fontSize:10,color:t.tT,textAlign:"right"}}>{String(h).padStart(2,"0")}:00</div><div style={{flex:1,position:"relative",borderLeft:`0.5px solid ${t.hr}`}}>{[1,2,3].map(q=><div key={q} style={{position:"absolute",top:q*SLOT_H,left:0,right:0,borderTop:`0.5px dashed ${t.dash}`,opacity:0.7}}/>)}</div></div>))}
          {ny>=0&&ny<=CAL_H&&(<div style={{position:"absolute",left:0,right:0,top:ny,zIndex:20,pointerEvents:"none",transform:"translateY(-50%)"}}><div style={{display:"flex",alignItems:"center"}}><div style={{width:CL,flexShrink:0,display:"flex",justifyContent:"flex-end",alignItems:"center"}}><svg width={11} height={11} viewBox="0 0 11 11"><path d="M1.5 1.5 L10 5.5 L1.5 9.5 Z" fill={t.nowL} stroke={t.nowL} strokeWidth={2}/></svg></div><div style={{flex:1,height:1.5,background:t.nowL,opacity:0.9,marginLeft:-2}}/></div></div>)}
          {deadlines.filter(dl=>dl.date===key).map((dl,i)=>{const c=DLC[dl.colorIdx%DLC.length];return <div key={dl.id} style={{position:"absolute",right:4,top:4+i*22,background:c.bg,border:`1px solid ${c.border}`,borderRadius:6,padding:"2px 8px",fontSize:10,color:c.text,fontWeight:500,pointerEvents:"none",zIndex:5}}>{dl.title} — due today</div>;})}
          {ghost&&(()=>{const gc=getTaskColor({deadlineId:ghost.deadlineId},deadlines,DLC,theme);return <div style={{position:"absolute",left:CL,right:0,top:ghost.slot*SLOT_H,height:ghost.dur*SLOT_H,background:gc.bg,border:`1.5px dashed ${gc.border}`,borderRadius:8,opacity:0.8,pointerEvents:"none"}}/>;})()}
          <div style={{position:"absolute",left:CL,right:0,top:0,bottom:0}}>
            {sched.map(task=>{
              const top=task.slot*SLOT_H,height=Math.max(task.dur*SLOT_H,SLOT_H);
              const tc=getTaskColor(task,deadlines,DLC,theme),pc=P[task.priority||"none"];
              const lay=cLayout[task.id]||{col:0,total:1};const colPct=100/lay.total,leftPct=lay.col*colPct;
              const dl=deadlines.find(d=>d.id===task.deadlineId),dlC=dl?DLC[dl.colorIdx%DLC.length]:null;
              return <CalTask key={task.id} task={task} tc={tc} pc={pc} lay={{colPct,leftPct}} top={top} height={height} dl={dl} dlC={dlC} P={P} toggleDone={toggleDone} unschedule={unschedule} onDragStart={onDragStart} onDragEnd={onDragEnd} onResize={onResize} t={t} tasks={tasks}/>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main app ───────────────────────────────────────────────────────────────────
function MainApp({onLogout}){
  const today=new Date();
  const sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
  // ── ALL hooks first ────────────────────────────────────────────────────────
  const [theme,setTheme]=useState(sysDark?"dark":"forest");
  const [store,setStore]=useState(null);
  const [saving,setSaving]=useState(false);
  const [cv,setCv]=useState("week");
  const [date,setDate]=useState(today);
  const [clock,setClock]=useState(new Date());
  const [ny,setNy]=useState(0);
  const [timerSt,setTimerSt]=useState(null);
  const [timerDone,setTimerDone]=useState(false);
  const [showTP,setShowTP]=useState(false);
  const [showProjects,setShowProjects]=useState(false);
  const [ghost,setGhost]=useState(null);
  const [overUnsch,setOverUnsch]=useState(false);
  const [newText,setNewText]=useState("");
  const [newPri,setNewPri]=useState(null);
  const [newDur,setNewDur]=useState(2);
  const [newDlId,setNewDlId]=useState(null);
  const [newColorId,setNewColorId]=useState(null);
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  const [editPri,setEditPri]=useState(null);
  const [editDur,setEditDur]=useState(2);
  const [editDlId,setEditDlId]=useState(null);
  const [editMv,setEditMv]=useState(null);
  const [editColorId,setEditColorId]=useState(null);
  const [dlTitle,setDlTitle]=useState("");
  const [dlDate,setDlDate]=useState(dk(new Date(Date.now()+7*86400000)));
  const [dlDesc,setDlDesc]=useState("");
  const [dlColorIdx,setDlColorIdx]=useState(0);
  const [dlStartDate,setDlStartDate]=useState("");
  const [expDl,setExpDl]=useState(null);
  const [expTodDl,setExpTodDl]=useState(null);
  const [noteTask,setNoteTask]=useState(null);
  const saveTimeout=useRef(null);
  const timerRef=useRef(null);
  const calScrollRef=useRef(null);
  const dragInfo=useRef(null);
  const isNarrow=useNarrow();

  useEffect(()=>{
    loadStoreFromAPI().then(data=>setStore(data)).catch(()=>setStore({_deadlines:[],_projects:[]}));
  },[]);
  useEffect(()=>{if(calScrollRef.current)calScrollRef.current.scrollTop=6*HOUR_H;},[store]);
  useEffect(()=>{
    setNy(nowY());const id=setInterval(()=>{setClock(new Date());setNy(nowY());},10000);return()=>clearInterval(id);
  },[]);
  useEffect(()=>{
    if(timerSt&&timerSt.state==="running"){
      timerRef.current=setInterval(()=>{
        setTimerSt(prev=>{if(!prev||prev.state!=="running")return prev;if(prev.remaining<=1){clearInterval(timerRef.current);setTimerDone(true);return null;}return{...prev,remaining:prev.remaining-1};});
      },1000);
    }else{if(timerRef.current)clearInterval(timerRef.current);}
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[timerSt?.state]);

  const t=TH[theme],P=GP(theme),DLC=GD(theme);

  // ── Safe to return early now — all hooks above ─────────────────────────────
  if(!store){
    return(
      <div style={{minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:24,marginBottom:12}}>🌲</div><div style={{fontSize:13,color:t.tS}}>Loading…</div></div>
      </div>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const key=dk(date);
  const deadlines=Array.isArray(store._deadlines)?store._deadlines:[];
  const tasks=Array.isArray(store[key])?store[key]:[];

  function persist(ns){
    setStore(ns);
    if(saveTimeout.current)clearTimeout(saveTimeout.current);
    setSaving(true);
    saveTimeout.current=setTimeout(()=>{saveStoreToAPI(ns).finally(()=>setSaving(false));},800);
  }

  function setTasks(fn,dk2){const k=dk2||key,cur=store[k]||[],next=typeof fn==="function"?fn(cur):fn;persist({...store,[k]:next});}
  function setDeadlines(fn){const next=typeof fn==="function"?fn(deadlines):fn;persist({...store,_deadlines:next});}

  const unsch=tasks.filter(x=>x.slot==null);
  const sched=tasks.filter(x=>x.slot!=null).sort((a,b)=>a.slot-b.slot);
  const done=tasks.filter(x=>x.done).length,total=tasks.length;
  const cLayout=computeCols(sched);
  const firstName=getFirstNameFromToken();
  const tmFmt=timerSt?`${String(Math.floor(timerSt.remaining/60)).padStart(2,"0")}:${String(timerSt.remaining%60).padStart(2,"0")}`:null;

  // ── Actions ────────────────────────────────────────────────────────────────
  function handleTimer(secs,action){
    if(!action){setTimerSt({state:"running",remaining:secs,total:secs});setShowTP(false);return;}
    if(action==="add"){setTimerSt(prev=>prev?{...prev,remaining:prev.remaining+secs}:null);return;}
    if(action==="toggle"){setTimerSt(prev=>prev?{...prev,state:prev.state==="running"?"paused":"running"}:null);return;}
    if(action==="cancel"){setTimerSt(null);setShowTP(false);return;}
  }
  function allTFDl(dlId){return Object.entries(store).filter(([k])=>/^\d{4}-\d{2}-\d{2}$/.test(k)).flatMap(([,ts])=>(Array.isArray(ts)?ts:[]).filter(x=>x.deadlineId===dlId));}
  function addTask(){if(!newText.trim())return;setTasks(x=>[...x,{id:uid(),text:newText.trim(),priority:newPri,dur:newDur,slot:null,done:false,deadlineId:newDlId||null,note:"",colorId:newColorId||null}]);setNewText("");setNewColorId(null);}
  function toggleDone(id){setTasks(x=>x.map(v=>v.id===id?{...v,done:!v.done}:v));}
  function removeTask(id){setTasks(x=>x.filter(v=>v.id!==id));}
  function unschedule(id){setTasks(x=>x.map(v=>v.id===id?{...v,slot:null}:v));}
  function startEdit(task){setEditId(task.id);setEditText(task.text);setEditPri(task.priority||null);setEditDur(task.dur);setEditDlId(task.deadlineId||null);setEditMv(null);setEditColorId(task.colorId||null);}
  function saveEdit(){const task=tasks.find(x=>x.id===editId);if(!task){setEditId(null);return;}const upd={...task,text:editText.trim()||task.text,priority:editPri,dur:editDur,deadlineId:editDlId,colorId:editColorId};if(editMv&&editMv!==key){const ns={...store};ns[key]=(ns[key]||[]).filter(x=>x.id!==editId);ns[editMv]=[...(ns[editMv]||[]),{...upd,slot:null}];persist(ns);}else setTasks(x=>x.map(v=>v.id===editId?upd:v));setEditId(null);}
  function cancelEdit(){setEditId(null);}
  function saveNote(id,note){setTasks(x=>x.map(v=>v.id===id?{...v,note}:v));setNoteTask(null);}
  function addDl(){if(!dlTitle.trim()||!dlDate)return;setDeadlines(d=>[...d,{id:uid(),title:dlTitle.trim(),date:dlDate,startDate:dlStartDate||null,desc:dlDesc.trim(),colorIdx:dlColorIdx}]);setDlTitle("");setDlDesc("");setDlStartDate("");}
  function saveDlEdit(updated){setDeadlines(d=>d.map(x=>x.id===updated.id?updated:x));}
  function removeDl(id){const ns={...store};Object.keys(ns).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).forEach(k=>{ns[k]=(ns[k]||[]).map(x=>x.deadlineId===id?{...x,deadlineId:null}:x);});ns._deadlines=(ns._deadlines||[]).filter(x=>x.id!==id);persist(ns);}

  function getSlot(e){if(!calScrollRef.current)return 0;const rect=calScrollRef.current.getBoundingClientRect();const y=e.clientY-rect.top+calScrollRef.current.scrollTop;return Math.max(0,Math.min(Math.floor(y/SLOT_H),TOT_SLOTS-1));}
  function onDragStart(e,task){dragInfo.current=task;e.dataTransfer.effectAllowed="move";const tc2=getTaskColor(task,deadlines,DLC,theme);const el=document.createElement("div");el.style.cssText=`position:absolute;top:-999px;padding:4px 10px;background:${tc2.bg};border:1px solid ${tc2.border};border-radius:8px;font-size:12px;color:${tc2.text};white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;`;el.textContent=task.text;document.body.appendChild(el);e.dataTransfer.setDragImage(el,0,0);setTimeout(()=>document.body.removeChild(el),0);}
  function onDragOver(e){e.preventDefault();if(!dragInfo.current)return;setGhost({slot:getSlot(e),dur:dragInfo.current.dur||2,deadlineId:dragInfo.current.deadlineId});}
  function onDrop(e){e.preventDefault();if(!dragInfo.current)return;const slot=getSlot(e),id=dragInfo.current.id;setTasks(x=>x.map(v=>v.id===id?{...v,slot}:v));setGhost(null);dragInfo.current=null;}
  function onDragLeave(e){if(!calScrollRef.current?.contains(e.relatedTarget))setGhost(null);}
  function onDragEnd(){setGhost(null);dragInfo.current=null;}
  function onDropUnschedule(e){e.preventDefault();if(!dragInfo.current)return;const id=dragInfo.current.id;setTasks(x=>x.map(v=>v.id===id?{...v,slot:null}:v));setGhost(null);dragInfo.current=null;}
  function onResize(e,task){e.preventDefault();e.stopPropagation();const sy=e.clientY,sd=task.dur;function mv(ev){const dy=ev.clientY-sy,nd=Math.max(1,sd+Math.round(dy/SLOT_H));setTasks(x=>x.map(v=>v.id===task.id?{...v,dur:nd}:v));}function up(){document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);}document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);}

  const si={P,t,theme,DLC,deadlines,tasks,store,toggleDone,removeTask,unschedule,startEdit,saveEdit,cancelEdit,editId,editText,setEditText,editPri,setEditPri,editDur,setEditDur,editDlId,setEditDlId,editMv,setEditMv,editColorId,setEditColorId,onDragStart,onDragEnd,onNote:(task)=>setNoteTask(task)};

  // ── Deadline sections (shared) ─────────────────────────────────────────────
  function DeadlineSections(){
    const today2=tk();
    const dueTodayDl=deadlines.filter(dl=>dl.date===key);
    const dueTodayIds=new Set(dueTodayDl.map(d=>d.id));
    const activeDl=deadlines.filter(dl=>tasks.some(task=>task.deadlineId===dl.id&&task.slot!=null));
    const scheduledOnlyDl=activeDl.filter(dl=>!dueTodayIds.has(dl.id));
    const overdueDl=key>=today2?deadlines.filter(dl=>{if(dl.date>=today2)return false;const allT=allTFDl(dl.id);if(allT.length===0)return false;return !allT.every(x=>x.done);}):[];
    if(!dueTodayDl.length&&!scheduledOnlyDl.length&&!overdueDl.length)return null;
    const SH=({text,color})=><div style={{fontSize:10,fontWeight:500,color,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:color}}/>{text}</div>;
    const DIV=<div style={{height:"0.5px",background:t.hr,margin:"8px 0"}}/>;
    return(<>
      {overdueDl.length>0&&<><SH text="Overdue" color="#E24B4A"/>{overdueDl.map(dl=><DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} DLC={DLC} isExp={expTodDl===dl.id} onToggle={()=>setExpTodDl(expTodDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} onSaveEdit={saveDlEdit} showRemove={false}/>)}{DIV}</>}
      {dueTodayDl.length>0&&<><SH text="Due today" color={t.acc}/>{dueTodayDl.map(dl=><DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} DLC={DLC} isExp={expTodDl===dl.id} onToggle={()=>setExpTodDl(expTodDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} onSaveEdit={saveDlEdit} showRemove={false}/>)}{DIV}</>}
      {scheduledOnlyDl.length>0&&<><SH text="Deadline tasks scheduled today" color={t.accBd}/>{scheduledOnlyDl.map(dl=><DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={tasks.filter(task=>task.deadlineId===dl.id&&task.slot!=null)} t={t} P={P} DLC={DLC} isExp={expTodDl===dl.id} onToggle={()=>setExpTodDl(expTodDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} onSaveEdit={saveDlEdit} showRemove={false}/>)}{DIV}</>}
    </>);
  }

  // ── Left column content (shared between wide and narrow) ───────────────────
  function LeftColumnContent(){
    return(<>
      {/* Card 1: Greeting + week/month */}
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={{fontSize:16,fontWeight:500,color:t.tP,marginBottom:2}}>{greet(firstName)}</div><div style={{fontSize:12,color:t.tS}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div></div>
          <div style={{display:"flex",border:`0.5px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0,marginLeft:8}}>{["week","month"].map(v=>(<button key={v} onClick={()=>setCv(v)} style={{padding:"4px 9px",fontSize:11,cursor:"pointer",background:cv===v?t.acc:"transparent",color:cv===v?t.aBtnTx:t.tS,border:"none",fontWeight:cv===v?500:400}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>))}</div>
        </div>
        {cv==="week"?<WeekStrip date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>:<MonthCal date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>}
      </div>
      {/* Card 2: Overview + Deadlines */}
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px",flexShrink:0}}>
        <SL text="Overview" t={t}/>
        <PieDt tasks={tasks} t={t}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:14}}>{[{l:"Total",v:total},{l:"Done",v:done},{l:"Remaining",v:total-done},{l:"Scheduled",v:sched.length}].map(s=>(<div key={s.l} style={{background:t.bg,border:`0.5px solid ${t.border}`,borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}><span style={{fontSize:10,color:t.tT}}>{s.l}</span><span style={{fontSize:15,fontWeight:500,color:t.tP}}>{s.v}</span></div>))}</div>
        <div style={{height:"0.5px",background:t.hr,margin:"16px 0 14px 0"}}/>
        <SL text="Deadlines" t={t}/>
        <div style={{overflowY:"auto",maxHeight:280,scrollbarWidth:"none"}}>
          {deadlines.map(dl=>(<DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} DLC={DLC} isExp={expDl===dl.id} onToggle={()=>setExpDl(expDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} onSaveEdit={saveDlEdit} showRemove={true}/>))}
        </div>
        <div style={{borderTop:`0.5px solid ${t.hr}`,paddingTop:12,marginTop:4}}>
          <input value={dlTitle} onChange={e=>setDlTitle(e.target.value)} placeholder="Deadline title" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:6,boxSizing:"border-box",outline:"none"}}/>
          <input value={dlDesc} onChange={e=>setDlDesc(e.target.value)} placeholder="Description (optional)" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:6,boxSizing:"border-box",outline:"none"}}/>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <div style={{flex:1}}><div style={{fontSize:10,color:t.tT,marginBottom:4}}>Start (optional)</div><input type="date" value={dlStartDate} onChange={e=>setDlStartDate(e.target.value)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,boxSizing:"border-box",outline:"none"}}/></div>
            <div style={{flex:1}}><div style={{fontSize:10,color:t.tT,marginBottom:4}}>Due date</div><input type="date" value={dlDate} onChange={e=>setDlDate(e.target.value)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,boxSizing:"border-box",outline:"none"}}/></div>
          </div>
          <DlColorPicker DLC={DLC} value={dlColorIdx} onChange={setDlColorIdx} t={t}/>
          <button onClick={addDl} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:8,padding:"7px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500,marginTop:4}}>Add deadline</button>
        </div>
      </div>
    </>);
  }

  function AddTaskCard(){
    return(
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px",flexShrink:0}}>
        <SL text="Add task" t={t}/>
        <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="What needs to be done?" style={{width:"100%",fontSize:13,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"8px 11px",background:t.sBg,color:t.tP,outline:"none",marginBottom:10}}/>
        <div style={{display:"flex",gap:5,marginBottom:10}}>{(theme==="dark"?TASK_COLORS_DARK:TASK_COLORS).map(col=>{const active=newColorId===col.id;return(<button key={col.id} onClick={()=>setNewColorId(active?null:col.id)} style={{flex:1,height:28,borderRadius:20,background:col.bg,border:`1.5px solid ${active?col.border:col.border+"88"}`,cursor:"pointer",padding:0,outline:"none",boxShadow:active?`0 0 0 2px ${col.border}`:"none"}}/> );})}</div>
        <div style={{display:"flex",gap:5,marginBottom:10}}>{[["High","high"],["Medium","medium"],["Low","low"]].map(([lbl,val])=>{const active=newPri===val;const pc=P[val];return(<button key={val} onClick={()=>setNewPri(active?null:val)} style={{flex:1,fontSize:12,padding:"6px 0",borderRadius:20,border:`1px solid ${active?pc.border:t.border}`,background:active?pc.bg:"transparent",color:active?pc.text:t.tS,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:active?pc.dot:t.tT,display:"inline-block"}}/>{lbl}</button>);})}</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1}}><div style={{fontSize:11,color:t.tT,marginBottom:4}}>Duration</div><select value={newDur} onChange={e=>setNewDur(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 8px",background:t.sBg,color:t.tS}}>{[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}</select></div>
          <div style={{flex:1}}><div style={{fontSize:11,color:t.tT,marginBottom:4}}>Deadline</div><select value={newDlId||""} onChange={e=>setNewDlId(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 8px",background:t.sBg,color:t.tS}}><option value="">None</option>{deadlines.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
        </div>
        <button onClick={addTask} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:t.aBtnTx,fontSize:13,fontWeight:500}}>Add task</button>
      </div>
    );
  }

  function TaskListCard({dropProps}){
    return(
      <div className="col-scroll" onDragOver={e=>{e.preventDefault();setOverUnsch(true);}} onDragLeave={()=>setOverUnsch(false)} onDrop={e=>{setOverUnsch(false);onDropUnschedule(e);}} style={{background:t.cBg,border:`0.5px solid ${overUnsch?t.acc:t.border}`,borderRadius:14,padding:"14px 16px",overflowY:"auto",maxHeight:isNarrow?"none":"calc(100vh - 280px)"}}>
        <DeadlineSections/>
        {unsch.length>0&&<div style={{fontSize:10,fontWeight:500,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Unscheduled · {unsch.length}</div>}
        {tasks.length===0&&<div style={{fontSize:12,color:t.tT,padding:"4px 0",marginBottom:6}}>Add a task above to get started.</div>}
        {unsch.length===0&&tasks.length>0&&<div style={{fontSize:12,color:t.tT,padding:"4px 0",marginBottom:6}}>All tasks scheduled!</div>}
        {unsch.map(task=><TaskItem key={task.id} task={task} isScheduled={false} {...si}/>)}
        {sched.length>0&&(<div><div style={{height:"0.5px",background:t.hr,margin:"8px 0"}}/><div style={{fontSize:10,fontWeight:500,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Scheduled · {sched.length}</div>{sched.map(task=><TaskItem key={task.id} task={task} isScheduled={true} {...si}/>)}</div>)}
      </div>
    );
  }

  const calProps={t,sched,calScrollRef,onDragOver,onDrop,onDragLeave,deadlines,DLC,key,ghost,ny,toggleDone,unschedule,onDragStart,onDragEnd,onResize,P,cLayout,theme,tasks};

  // ── Header ─────────────────────────────────────────────────────────────────
  const Header=(
    <div style={{background:t.hBg,borderBottom:`0.5px solid ${t.hBorder}`,padding:"0 20px",display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",height:52,flexShrink:0,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <img src={theme==="dark"?logoDark:logoLight} alt="PineTask" style={{height:28,maxWidth:120,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
        <div style={{width:"0.5px",height:18,background:t.hBorder}}/>
        <button onClick={()=>setShowProjects(true)} style={{height:30,borderRadius:8,border:`0.5px solid ${t.hBorder}`,background:"rgba(128,128,128,0.08)",color:t.hText,cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"0 10px",fontSize:11,fontWeight:500}}>
          <svg width={12} height={12} viewBox="0 0 14 14" fill="none"><rect x={0.7} y={0.7} width={5} height={5} rx={1.3} stroke={t.hText} strokeWidth={1.2}/><rect x={8.3} y={0.7} width={5} height={5} rx={1.3} stroke={t.hText} strokeWidth={1.2}/><rect x={0.7} y={8.3} width={5} height={5} rx={1.3} stroke={t.hText} strokeWidth={1.2}/><rect x={8.3} y={8.3} width={5} height={5} rx={1.3} stroke={t.hText} strokeWidth={1.2}/></svg>
          Projects
        </button>
        {saving&&<span style={{fontSize:10,color:t.tT,opacity:0.7}}>Saving…</span>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:14}}>‹</button>
        <span style={{fontSize:12,color:t.hText,minWidth:isNarrow?140:190,textAlign:"center",fontWeight:500}}>{fd(date)}</span>
        <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:14}}>›</button>
        <button onClick={()=>setDate(new Date(today.getFullYear(),today.getMonth(),today.getDate()))} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:11}}>Today</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
        <span style={{fontSize:12,fontWeight:500,color:t.hText,fontVariantNumeric:"tabular-nums"}}>{fc(clock)}</span>
        <div style={{position:"relative"}}>
          {timerDone?(<button onClick={()=>setTimerDone(false)} style={{height:30,borderRadius:15,border:"0.5px solid #E24B4A",background:"rgba(226,75,74,0.1)",color:"#E24B4A",cursor:"pointer",padding:"0 10px",fontSize:11,fontWeight:500}}>Timer done!</button>):(
            <button onClick={()=>setShowTP(v=>!v)} style={{height:30,borderRadius:15,border:`0.5px solid ${timerSt?t.acc:t.hBorder}`,background:timerSt?"rgba(93,202,165,0.1)":"rgba(128,128,128,0.08)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:"0 10px",fontSize:11,fontFamily:tmFmt?"monospace":"inherit",fontWeight:500,color:timerSt?t.acc:t.hText,whiteSpace:"nowrap"}}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6} stroke={timerSt?t.acc:t.hText} strokeWidth={1.3}/><path d="M8 5v3.5l2 1.5" stroke={timerSt?t.acc:t.hText} strokeWidth={1.3} strokeLinecap="round"/></svg>
              {tmFmt?<span>{timerSt.state==="paused"?"⏸ ":""}{tmFmt}</span>:"Timer"}
            </button>
          )}
          {showTP&&!timerDone&&<TimerPopup t={t} ts={timerSt} onConfirm={handleTimer} onClose={()=>setShowTP(false)}/>}
        </div>
        <button onClick={()=>setTheme(theme==="dark"?"forest":"dark")} style={{width:30,height:30,borderRadius:"50%",border:`0.5px solid ${t.hBorder}`,background:"rgba(128,128,128,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {theme==="dark"?<svg width={14} height={14} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={3.5} fill={t.hText}/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={t.hText} strokeWidth={1.2} strokeLinecap="round"/></svg>:<svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" fill={t.hText}/></svg>}
        </button>
        <div style={{width:"0.5px",height:18,background:t.hBorder}}/>
        <button onClick={()=>{clearToken();onLogout();}} style={{height:30,borderRadius:8,border:`0.5px solid ${t.hBorder}`,background:"rgba(128,128,128,0.08)",color:t.hText,cursor:"pointer",padding:"0 10px",fontSize:11}}>Sign out</button>
      </div>
    </div>
  );

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css=`*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;height:100%}.trow:hover .ta{opacity:1!important}.ta{opacity:0;transition:opacity .15s}.cpill:hover{opacity:.9}input[type=checkbox]{width:13px;height:13px;accent-color:${t.acc};cursor:pointer;flex-shrink:0;margin:0}.col-scroll{overflow-y:auto}.col-scroll::-webkit-scrollbar{display:none}.col-scroll{-ms-overflow-style:none;scrollbar-width:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px}button:active{transform:scale(.97)}input[type=date]{color-scheme:${theme==="dark"?"dark":"light"}}.rh{cursor:ns-resize;height:7px;position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;z-index:10}.cpill:hover .rh{opacity:1}div,button,input,select,textarea,span{transition:background-color 0.4s ease,border-color 0.4s ease,color 0.4s ease}`;

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:t.bg,height:isNarrow?"auto":"100vh",minHeight:"100vh",width:"100%",fontSize:14,color:t.tP,display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      {noteTask&&<NoteModal task={noteTask} t={t} onSave={(note)=>saveNote(noteTask.id,note)} onClose={()=>setNoteTask(null)}/>}
      {showProjects&&<ProjectsOverlay store={store} t={t} theme={theme} DLC={DLC} P={P} onClose={()=>setShowProjects(false)} onUpdateStore={ns=>persist(ns)}/>}
      {Header}

      {/* Wide layout */}
      {!isNarrow&&(
        <div style={{flex:1,minHeight:0,padding:"14px 20px",display:"grid",gridTemplateColumns:"25% minmax(0,1fr) minmax(0,1fr)",gap:14,overflow:"hidden"}}>
          {/* Left */}
          <div className="col-scroll" style={{display:"flex",flexDirection:"column",gap:12,paddingRight:2,paddingBottom:14}}>
            <LeftColumnContent/>
          </div>
          {/* Middle */}
          <div style={{display:"flex",flexDirection:"column",gap:10,minHeight:0}}>
            <AddTaskCard/>
            <TaskListCard/>
          </div>
          {/* Right: calendar */}
          <CalendarColumn {...calProps}/>
        </div>
      )}

      {/* Narrow layout */}
      {isNarrow&&(
        <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
          {/* Greeting card */}
          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <div><div style={{fontSize:15,fontWeight:500,color:t.tP,marginBottom:1}}>{greet(firstName)}</div><div style={{fontSize:11,color:t.tS}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div></div>
              <div style={{display:"flex",border:`0.5px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0,marginLeft:8}}>{["week","month"].map(v=>(<button key={v} onClick={()=>setCv(v)} style={{padding:"3px 8px",fontSize:11,cursor:"pointer",background:cv===v?t.acc:"transparent",color:cv===v?t.aBtnTx:t.tS,border:"none"}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>))}</div>
            </div>
            {cv==="week"?<WeekStrip date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>:<MonthCal date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>}
          </div>
          {/* Add task */}
          <AddTaskCard/>
          {/* Two-col: overview+deadlines | calendar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"14px"}}>
                <SL text="Overview" t={t}/>
                <PieDt tasks={tasks} t={t}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:10}}>{[{l:"Total",v:total},{l:"Done",v:done},{l:"Left",v:total-done},{l:"Sched",v:sched.length}].map(s=>(<div key={s.l} style={{background:t.bg,border:`0.5px solid ${t.border}`,borderRadius:7,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:10,color:t.tT}}>{s.l}</span><span style={{fontSize:13,fontWeight:500,color:t.tP}}>{s.v}</span></div>))}</div>
                <div style={{height:"0.5px",background:t.hr,margin:"12px 0"}}/>
                <SL text="Deadlines" t={t}/>
                <div style={{overflowY:"auto",maxHeight:200,scrollbarWidth:"none"}}>
                  {deadlines.map(dl=>(<DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} DLC={DLC} isExp={expDl===dl.id} onToggle={()=>setExpDl(expDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} onSaveEdit={saveDlEdit} showRemove={true}/>))}
                </div>
                <div style={{borderTop:`0.5px solid ${t.hr}`,paddingTop:10,marginTop:4}}>
                  <input value={dlTitle} onChange={e=>setDlTitle(e.target.value)} placeholder="Deadline title" style={{width:"100%",fontSize:11,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,marginBottom:5,boxSizing:"border-box",outline:"none"}}/>
                  <div style={{display:"flex",gap:6,marginBottom:5}}><div style={{flex:1}}><div style={{fontSize:10,color:t.tT,marginBottom:2}}>Due</div><input type="date" value={dlDate} onChange={e=>setDlDate(e.target.value)} style={{width:"100%",fontSize:11,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"4px 6px",background:t.sBg,color:t.tP,boxSizing:"border-box",outline:"none"}}/></div></div>
                  <DlColorPicker DLC={DLC} value={dlColorIdx} onChange={setDlColorIdx} t={t}/>
                  <button onClick={addDl} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500,marginTop:3}}>Add deadline</button>
                </div>
              </div>
              <TaskListCard/>
            </div>
            <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"14px",display:"flex",flexDirection:"column"}}>
              <SL text="Day schedule" t={t}/>
              <div ref={calScrollRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave} style={{height:500,overflowY:"scroll",borderRadius:10,border:`0.5px solid ${t.border}`,background:t.calBg}}>
                <div style={{position:"relative",height:CAL_H,width:"100%"}}>
                  {CAL_HOURS.map((h,hi)=>(<div key={h} style={{position:"absolute",top:hi*HOUR_H,left:0,right:0,height:HOUR_H,display:"flex",borderBottom:hi<CAL_HOURS.length-1?`0.5px solid ${t.hr}`:"none"}}><div style={{width:CL,flexShrink:0,paddingTop:4,paddingRight:7,fontSize:10,color:t.tT,textAlign:"right"}}>{String(h).padStart(2,"0")}:00</div><div style={{flex:1,position:"relative",borderLeft:`0.5px solid ${t.hr}`}}>{[1,2,3].map(q=><div key={q} style={{position:"absolute",top:q*SLOT_H,left:0,right:0,borderTop:`0.5px dashed ${t.dash}`,opacity:0.7}}/>)}</div></div>))}
                  {ny>=0&&ny<=CAL_H&&(<div style={{position:"absolute",left:0,right:0,top:ny,zIndex:20,pointerEvents:"none",transform:"translateY(-50%)"}}><div style={{display:"flex",alignItems:"center"}}><div style={{width:CL,flexShrink:0,display:"flex",justifyContent:"flex-end",alignItems:"center"}}><svg width={11} height={11} viewBox="0 0 11 11"><path d="M1.5 1.5 L10 5.5 L1.5 9.5 Z" fill={t.nowL} stroke={t.nowL} strokeWidth={2}/></svg></div><div style={{flex:1,height:1.5,background:t.nowL,opacity:0.9,marginLeft:-2}}/></div></div>)}
                  {ghost&&(()=>{const gc=getTaskColor({deadlineId:ghost.deadlineId},deadlines,DLC,theme);return <div style={{position:"absolute",left:CL,right:0,top:ghost.slot*SLOT_H,height:ghost.dur*SLOT_H,background:gc.bg,border:`1.5px dashed ${gc.border}`,borderRadius:8,opacity:0.8,pointerEvents:"none"}}/>;})()}
                  <div style={{position:"absolute",left:CL,right:0,top:0,bottom:0}}>
                    {sched.map(task=>{const top=task.slot*SLOT_H,height=Math.max(task.dur*SLOT_H,SLOT_H);const tc=getTaskColor(task,deadlines,DLC,theme),pc=P[task.priority||"none"];const lay=cLayout[task.id]||{col:0,total:1};const colPct=100/lay.total,leftPct=lay.col*colPct;const dl=deadlines.find(d=>d.id===task.deadlineId),dlC=dl?DLC[dl.colorIdx%DLC.length]:null;return <CalTask key={task.id} task={task} tc={tc} pc={pc} lay={{colPct,leftPct}} top={top} height={height} dl={dl} dlC={dlC} P={P} toggleDone={toggleDone} unschedule={unschedule} onDragStart={onDragStart} onDragEnd={onDragEnd} onResize={onResize} t={t} tasks={tasks}/>;})}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [authed,setAuthed]=useState(!!getToken());
  if(!authed)return <AuthPage onLogin={()=>setAuthed(true)}/>;
  return <MainApp onLogout={()=>setAuthed(false)}/>;
}
