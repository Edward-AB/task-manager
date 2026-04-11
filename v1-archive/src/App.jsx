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
function greet(username){const h=new Date().getHours();const g=h<12?"Good morning":h<17?"Good afternoon":"Good evening";if(username&&username.trim().length>0&&username.trim().length<=20)return`${g}, ${username.trim()}`;return g;}
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
// Decode username from JWT payload
function getUsernameFromToken(){
  try{
    const token=getToken();
    if(!token)return null;
    const payload=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return payload.username||null;
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
  return(
    <div className="cpill trow" draggable onDragStart={e=>onDragStart(e,task)} onDragEnd={onDragEnd} style={{position:"absolute",left:`${lay.leftPct}%`,width:`calc(${lay.colPct}% - 4px)`,top,height,background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:9,padding:"0 6px",cursor:"grab",display:"flex",alignItems:"center",gap:3}}>
      <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{width:10,height:10,flexShrink:0,accentColor:pc.dot}}/>
      <span style={{fontSize:11,fontWeight:500,color:task.done?tc.border:tc.text,textDecoration:task.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,minWidth:0,lineHeight:1.2}}>{task.text}</span>
      <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}><PriorityTag priority={task.priority} P={P}/><span style={{fontSize:9,color:tc.dot,whiteSpace:"nowrap"}}>{s2t(task.slot)}·{task.dur*15}m</span>{dl&&dlC&&<span style={{padding:"1px 4px",borderRadius:5,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,fontSize:9,whiteSpace:"nowrap"}}>{dl.title}</span>}<button onClick={e=>{e.stopPropagation();unschedule(task.id);}} style={{background:"none",border:"none",cursor:"pointer",color:tc.dot,fontSize:10,padding:0,lineHeight:1}}>↩</button></div>
      <div className="rh" onMouseDown={e=>onResize(e,task)}><div style={{width:20,height:2.5,borderRadius:2,background:tc.border,opacity:0.9}}/></div>
    </div>
  );
}

// ── Projects Overlay ──────────────────────────────────────────────────────────
const DL_NAMES=["Amber","Rose","Teal","Coral","Stone","Sage"];

// ── Spreadsheet-style Gantt ───────────────────────────────────────────────────
function GanttChart({deadlines,tasks,projStart,projEnd,t,DLC}){
  const dated=[...deadlines].filter(dl=>dl.date).sort((a,b)=>a.date.localeCompare(b.date));
  if(!dated.length)return(
    <div style={{padding:"32px 0",textAlign:"center",color:t.tT,fontSize:13}}>
      Add deadlines with dates to see the Gantt chart.
    </div>
  );

  // Date range: use project start/end if set, otherwise derive from deadlines
  const allD=[
    ...(projStart?[projStart]:[]),
    ...(projEnd?[projEnd]:[]),
    ...dated.map(d=>d.startDate||d.date),
    ...dated.map(d=>d.date),
  ];
  const minMs=Math.min(...allD.map(d=>new Date(d+"T12:00:00").getTime()));
  const maxMs=Math.max(...allD.map(d=>new Date(d+"T12:00:00").getTime()));
  const pad=3*86400000;
  const rangeStart=new Date(minMs-pad);
  const rangeEnd  =new Date(maxMs+pad);
  const totalMs=rangeEnd-rangeStart;
  const totalDays=Math.ceil(totalMs/86400000);

  function xpct(dateStr){
    const ms=new Date(dateStr+"T12:00:00").getTime();
    return Math.max(0,Math.min(100,((ms-rangeStart)/totalMs)*100));
  }

  const todayPct=(()=>{const ms=Date.now();return Math.max(0,Math.min(100,((ms-rangeStart)/totalMs)*100));})();

  // Build weekly / daily ticks
  const ticks=[];
  const tickDate=new Date(rangeStart);tickDate.setHours(12,0,0,0);
  // Choose tick interval based on range
  const tickStep = totalDays<=21?1:totalDays<=90?7:30;
  while(tickDate<=rangeEnd){
    const p=((tickDate-rangeStart)/totalMs)*100;
    if(p>=0&&p<=100){
      const lbl=tickStep<7
        ? tickDate.toLocaleDateString("en-GB",{day:"numeric",month:"short"})
        : tickStep===7
          ? tickDate.toLocaleDateString("en-GB",{day:"numeric",month:"short"})
          : tickDate.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
      ticks.push({p,lbl,isMonth:tickStep===30});
    }
    if(tickStep===30){tickDate.setMonth(tickDate.getMonth()+1);}
    else{tickDate.setDate(tickDate.getDate()+tickStep);}
  }

  const LABEL_W=180;
  const ROW_H=38;
  const BAR_Y=10;
  const BAR_H=18;

  return(
    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:520}}>
        {/* ── Header row: date ticks ── */}
        <div style={{display:"flex",marginBottom:0}}>
          <div style={{width:LABEL_W,flexShrink:0}}/>
          <div style={{flex:1,position:"relative",height:28,borderBottom:`1px solid ${t.border}`,background:t.bg,borderRadius:"6px 6px 0 0"}}>
            {ticks.map((tk,i)=>(
              <div key={i} style={{position:"absolute",left:`${tk.p}%`,top:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{flex:1,borderLeft:`1px solid ${t.border}`,opacity:0.5}}/>
                <div style={{fontSize:9,color:t.tT,whiteSpace:"nowrap",transform:"translateX(-50%)",paddingBottom:3,fontWeight:tk.isMonth?500:400}}>{tk.lbl}</div>
              </div>
            ))}
            {/* Today tick in header */}
            <div style={{position:"absolute",left:`${todayPct}%`,top:0,bottom:0,borderLeft:`2px solid ${t.todL}`,opacity:0.8}}/>
          </div>
        </div>

        {/* ── Deadline rows ── */}
        {dated.map((dl,ri)=>{
          const dc=DLC[dl.colorIdx%DLC.length];
          const dlTasks=tasks.filter(tk=>tk.deadlineId===dl.id);
          const doneCnt=dlTasks.filter(x=>x.done).length;
          const pctDone=dlTasks.length>0?doneCnt/dlTasks.length:0;
          const barStart=dl.startDate?xpct(dl.startDate):xpct(dl.date);
          const barEnd=xpct(dl.date);
          const barW=Math.max(0.5,barEnd-barStart);
          const days=du(dl.date);
          const overdue=days!==null&&days<0;
          const urgent=days!==null&&days>=0&&days<=3;

          return(
            <div key={dl.id} style={{display:"flex",alignItems:"stretch",borderBottom:`1px solid ${t.border}`,minHeight:ROW_H}}>
              {/* Label cell */}
              <div style={{width:LABEL_W,flexShrink:0,padding:"0 12px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${t.border}`,background:t.bg}}>
                <div style={{fontSize:12,fontWeight:500,color:dc.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:1}}>{dl.title}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:overdue?"#E24B4A":urgent?"#C07010":t.tT}}>{days===null?"":overdue?`${Math.abs(days)}d overdue`:days===0?"Due today":days===1?"Due tomorrow":`${days}d`}</span>
                  {dlTasks.length>0&&<span style={{fontSize:10,color:t.tT}}>{doneCnt}/{dlTasks.length}</span>}
                </div>
              </div>
              {/* Bar cell */}
              <div style={{flex:1,position:"relative",background:ri%2===0?t.bg:t.cBg}}>
                {/* Grid lines */}
                {ticks.map((tk,i)=><div key={i} style={{position:"absolute",left:`${tk.p}%`,top:0,bottom:0,borderLeft:`1px solid ${t.border}`,opacity:0.3}}/>)}
                {/* Today vertical line */}
                <div style={{position:"absolute",left:`${todayPct}%`,top:0,bottom:0,borderLeft:`2px solid ${t.todL}`,opacity:0.7,zIndex:3}}/>
                {/* Bar */}
                {barW>0&&(
                  <div style={{position:"absolute",left:`${barStart}%`,width:`${barW}%`,top:BAR_Y,height:BAR_H,borderRadius:4,background:dc.bg,border:`1.5px solid ${dc.border}`,overflow:"hidden",zIndex:2}}>
                    <div style={{height:"100%",width:`${pctDone*100}%`,background:dc.dot,opacity:0.5,borderRadius:4,transition:"width 0.3s"}}/>
                  </div>
                )}
                {/* Due date diamond marker */}
                <div title={`Due: ${fsd(dl.date)}`} style={{position:"absolute",left:`${xpct(dl.date)}%`,top:"50%",transform:"translate(-50%,-50%) rotate(45deg)",width:10,height:10,background:dc.dot,border:`1.5px solid ${t.bg}`,zIndex:4}}/>
                {/* Task dots along bar */}
                {dlTasks.map((tk,ti)=>(
                  <div key={tk.id} title={tk.text} style={{position:"absolute",left:`${barStart+(barW*(ti+1)/(dlTasks.length+1))}%`,top:BAR_Y+BAR_H/2,transform:"translate(-50%,-50%)",width:7,height:7,borderRadius:"50%",background:tk.done?dc.dot:t.bg,border:`1.5px solid ${dc.dot}`,zIndex:5,cursor:"default"}}/>
                ))}
              </div>
            </div>
          );
        })}

        {/* Legend row */}
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"8px 0",marginLeft:LABEL_W}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:16,height:2,background:t.todL,borderRadius:1}}/>
            <span style={{fontSize:10,color:t.tT}}>Today</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,background:"transparent",border:`1.5px solid ${t.tT}`,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:10,color:t.tT}}>Due date</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:24,height:10,borderRadius:3,background:t.border,overflow:"hidden"}}><div style={{height:"100%",width:"50%",background:t.tS}}/></div>
            <span style={{fontSize:10,color:t.tT}}>Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ProjectDetail ─────────────────────────────────────────────────────────────
function ProjectDetail({proj,store,t,theme,DLC,P,onUpdateStore,onDelete}){
  const c=DLC[proj.colorIdx%DLC.length];
  const allDates=Object.keys(store).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k));
  const projDls=(Array.isArray(store._deadlines)?store._deadlines:[]).filter(d=>d.projectId===proj.id);
  const projTasks=allDates.flatMap(k=>(Array.isArray(store[k])?store[k]:[]).filter(x=>x.projectId===proj.id));
  const totalT=projTasks.length,doneT=projTasks.filter(x=>x.done).length;
  const overallPct=totalT>0?Math.round(doneT/totalT*100):0;

  const [tab,setTab]=useState("manage"); // manage | analytics
  const [selDlId,setSelDlId]=useState(null); // for Manage: which deadline is focused
  const [selTask,setSelTask]=useState(null);

  // Editing project itself
  const [editProj,setEditProj]=useState(false);
  const [eProjName,setEProjName]=useState(proj.name);
  const [eProjDesc,setEProjDesc]=useState(proj.desc||"");
  const [eProjStart,setEProjStart]=useState(proj.startDate||"");
  const [eProjEnd,setEProjEnd]=useState(proj.endDate||"");
  const [eProjColor,setEProjColor]=useState(proj.colorIdx);

  // New / edit deadline
  const [dlFormOpen,setDlFormOpen]=useState(false);
  const [editDlId,setEditDlId]=useState(null);
  const [dlTitle,setDlTitle]=useState("");
  const [dlStart,setDlStart]=useState("");
  const [dlDate,setDlDate]=useState("");
  const [dlDesc,setDlDesc]=useState("");
  const [dlColor,setDlColor]=useState(proj.colorIdx);

  // New task
  const [taskFormDlId,setTaskFormDlId]=useState(null); // which deadline's add-task form is open
  const [taskText,setTaskText]=useState("");
  const [taskPri,setTaskPri]=useState(null);
  const [taskDur,setTaskDur]=useState(2);

  // Edit task
  const [editTaskId,setEditTaskId]=useState(null);
  const [eTText,setETText]=useState("");
  const [eTPri,setETPri]=useState(null);
  const [eTDur,setETDur]=useState(2);
  const [eTDlId,setETDlId]=useState(null);

  const ins=(extra={})=>({width:"100%",fontSize:12,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 10px",background:t.sBg,color:t.tP,outline:"none",boxSizing:"border-box",...extra});
  const lbl=(extra={})=>({fontSize:11,color:t.tT,marginBottom:4,display:"block",...extra});

  // ── Save project edits
  function saveProject(){
    const updated=(store._projects||[]).map(p=>p.id===proj.id?{...p,name:eProjName.trim()||p.name,desc:eProjDesc.trim(),startDate:eProjStart||null,endDate:eProjEnd||null,colorIdx:eProjColor}:p);
    onUpdateStore({...store,_projects:updated});setEditProj(false);
  }

  // ── Deadlines
  function openNewDl(){setEditDlId(null);setDlTitle("");setDlStart("");setDlDate("");setDlDesc("");setDlColor(proj.colorIdx);setDlFormOpen(true);}
  function openEditDl(dl){setEditDlId(dl.id);setDlTitle(dl.title);setDlStart(dl.startDate||"");setDlDate(dl.date);setDlDesc(dl.desc||"");setDlColor(dl.colorIdx);setDlFormOpen(true);}
  function saveDl(){
    if(!dlTitle.trim()||!dlDate)return;
    if(editDlId){
      onUpdateStore({...store,_deadlines:(store._deadlines||[]).map(d=>d.id===editDlId?{...d,title:dlTitle.trim(),startDate:dlStart||null,date:dlDate,desc:dlDesc.trim(),colorIdx:dlColor}:d)});
    }else{
      const nd={id:uid(),title:dlTitle.trim(),date:dlDate,startDate:dlStart||null,desc:dlDesc.trim(),colorIdx:dlColor,projectId:proj.id};
      onUpdateStore({...store,_deadlines:[...(store._deadlines||[]),nd]});
    }
    setDlFormOpen(false);setEditDlId(null);
  }
  function removeDl(id){
    const ns={...store};
    allDates.forEach(k=>{ns[k]=(ns[k]||[]).map(x=>x.deadlineId===id?{...x,deadlineId:null}:x);});
    ns._deadlines=(ns._deadlines||[]).filter(x=>x.id!==id);
    onUpdateStore(ns);if(selDlId===id)setSelDlId(null);
  }

  // ── Tasks
  function openTaskForm(dlId){setTaskFormDlId(dlId);setTaskText("");setTaskPri(null);setTaskDur(2);}
  function addTask(dlId){
    if(!taskText.trim())return;
    const today=tk();
    const nt={id:uid(),text:taskText.trim(),priority:taskPri,dur:taskDur,slot:null,done:false,deadlineId:dlId||null,projectId:proj.id,note:"",colorId:null};
    onUpdateStore({...store,[today]:[...(store[today]||[]),nt]});
    setTaskFormDlId(null);setTaskText("");setTaskPri(null);
  }
  function toggleTask(id){
    let found=false;
    const ns={...store};
    allDates.forEach(k=>{if(!found){const idx=(ns[k]||[]).findIndex(x=>x.id===id);if(idx>=0){ns[k]=[...ns[k]];ns[k][idx]={...ns[k][idx],done:!ns[k][idx].done};found=true;}}});
    if(found)onUpdateStore(ns);
  }
  function removeTask(id){
    const ns={...store};
    allDates.forEach(k=>{ns[k]=(ns[k]||[]).filter(x=>x.id!==id);});
    onUpdateStore(ns);if(selTask?.id===id)setSelTask(null);if(editTaskId===id)setEditTaskId(null);
  }
  function openEditTask(tk2){setEditTaskId(tk2.id);setETText(tk2.text);setETPri(tk2.priority||null);setETDur(tk2.dur);setETDlId(tk2.deadlineId||null);}
  function saveEditTask(){
    const ns={...store};
    allDates.forEach(k=>{const idx=(ns[k]||[]).findIndex(x=>x.id===editTaskId);if(idx>=0){ns[k]=[...ns[k]];ns[k][idx]={...ns[k][idx],text:eTText.trim()||ns[k][idx].text,priority:eTPri,dur:eTDur,deadlineId:eTDlId||null};}});
    onUpdateStore(ns);setEditTaskId(null);
  }

  // Tasks visible in Manage right panel
  const visibleTasks=selDlId
    ? projTasks.filter(x=>x.deadlineId===selDlId)
    : projTasks;

  const TabBtn=({id,label})=>(
    <button onClick={()=>setTab(id)} style={{fontSize:13,padding:"7px 22px",borderRadius:20,border:`1px solid ${tab===id?c.border:t.border}`,background:tab===id?c.bg:"transparent",color:tab===id?c.text:t.tS,cursor:"pointer",fontWeight:tab===id?600:400,letterSpacing:"0.01em"}}>
      {label}
    </button>
  );

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>

      {/* ── Project header ── */}
      <div style={{padding:"22px 28px 18px",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        {editProj?(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{flex:2}}>
                <label style={lbl()}>Project name</label>
                <input value={eProjName} onChange={e=>setEProjName(e.target.value)} style={ins()}/>
              </div>
              <div style={{flex:3}}>
                <label style={lbl()}>Description</label>
                <input value={eProjDesc} onChange={e=>setEProjDesc(e.target.value)} placeholder="Optional" style={ins()}/>
              </div>
              <div style={{flex:1}}>
                <label style={lbl()}>Colour</label>
                <select value={eProjColor} onChange={e=>setEProjColor(Number(e.target.value))} style={{...ins(),background:DLC[eProjColor].bg,color:DLC[eProjColor].text,border:`0.5px solid ${DLC[eProjColor].border}`}}>
                  {DLC.map((_,i)=><option key={i} value={i}>{DL_NAMES[i]}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={lbl()}>Project start date</label>
                <input type="date" value={eProjStart} onChange={e=>setEProjStart(e.target.value)} style={ins()}/>
              </div>
              <div style={{flex:1}}>
                <label style={lbl()}>Project end date</label>
                <input type="date" value={eProjEnd} onChange={e=>setEProjEnd(e.target.value)} style={ins()}/>
              </div>
              <div style={{flex:2}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveProject} style={{background:t.aBtn,border:"none",borderRadius:8,padding:"7px 20px",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Save changes</button>
              <button onClick={()=>setEditProj(false)} style={{background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:8,padding:"7px 16px",cursor:"pointer",color:t.tS,fontSize:12}}>Cancel</button>
            </div>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:c.dot,flexShrink:0,marginTop:4}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontSize:22,fontWeight:700,color:t.tP,lineHeight:1.1}}>{proj.name}</div>
                {(proj.startDate||proj.endDate)&&(
                  <div style={{fontSize:12,color:t.tT}}>
                    {proj.startDate&&fsd(proj.startDate)}{proj.startDate&&proj.endDate?" – ":""}{proj.endDate&&fsd(proj.endDate)}
                  </div>
                )}
              </div>
              {proj.desc&&<div style={{fontSize:13,color:t.tS,marginTop:3}}>{proj.desc}</div>}
              {/* Overall progress bar */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
                <div style={{flex:1,maxWidth:300,height:6,borderRadius:6,background:t.border,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${overallPct}%`,background:c.dot,borderRadius:6,transition:"width 0.4s"}}/>
                </div>
                <span style={{fontSize:12,color:c.dot,fontWeight:600}}>{overallPct}%</span>
                <span style={{fontSize:12,color:t.tT}}>{doneT} of {totalT} tasks done</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>setEditProj(true)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Edit</button>
              <button onClick={onDelete} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #E24B4A44",background:"transparent",color:"#E24B4A",cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        )}

        {/* Stats pills */}
        {!editProj&&(
          <div style={{display:"flex",gap:10,marginTop:16}}>
            {[
              {l:"Deadlines",v:projDls.length,col:c.dot},
              {l:"Total tasks",v:totalT,col:t.tP},
              {l:"Done",v:doneT,col:"#2D9B6F"},
              {l:"Remaining",v:totalT-doneT,col:t.tS},
              ...(projDls.length>0?[{l:"On track",v:projDls.filter(d=>{const day=du(d.date);return day!==null&&day>=0;}).length,col:c.dot}]:[]),
            ].map(s=>(
              <div key={s.l} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:70}}>
                <div style={{fontSize:18,fontWeight:700,color:s.col,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:10,color:t.tT,marginTop:2,whiteSpace:"nowrap"}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{padding:"14px 28px 0",borderBottom:`1px solid ${t.border}`,display:"flex",gap:8,flexShrink:0}}>
        <TabBtn id="manage" label="Manage"/>
        <TabBtn id="analytics" label="Analytics"/>
      </div>

      {/* ── Content ── */}
      <div style={{flex:1,overflowY:"auto",minHeight:0}}>

        {/* ══ MANAGE TAB ══ */}
        {tab==="manage"&&(
          <div style={{display:"flex",height:"100%",minHeight:0}}>

            {/* Left: deadlines list */}
            <div style={{width:260,flexShrink:0,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",overflowY:"auto"}}>
              <div style={{padding:"16px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`0.5px solid ${t.border}`,flexShrink:0}}>
                <span style={{fontSize:12,fontWeight:600,color:t.tP}}>Deadlines</span>
                <button onClick={openNewDl} style={{fontSize:11,padding:"4px 10px",borderRadius:7,border:`0.5px solid ${c.border}`,background:c.bg,color:c.text,cursor:"pointer"}}>+ Add</button>
              </div>

              {/* "All tasks" option */}
              <button onClick={()=>setSelDlId(null)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderLeft:`3px solid ${selDlId===null?c.dot:"transparent"}`,background:selDlId===null?c.bg+"66":"transparent",cursor:"pointer",border:"none",textAlign:"left",width:"100%",borderLeft:`3px solid ${selDlId===null?c.dot:"transparent"}`}}>
                <span style={{fontSize:12,color:selDlId===null?c.text:t.tS,fontWeight:selDlId===null?600:400}}>All tasks ({projTasks.length})</span>
              </button>

              {/* Deadline form */}
              {dlFormOpen&&(
                <div style={{padding:"12px 14px",background:t.bg,borderBottom:`0.5px solid ${t.border}`}}>
                  <div style={{fontSize:11,fontWeight:500,color:t.tP,marginBottom:8}}>{editDlId?"Edit deadline":"New deadline"}</div>
                  <input value={dlTitle} onChange={e=>setDlTitle(e.target.value)} placeholder="Title" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:6,boxSizing:"border-box",outline:"none"}}/>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <div style={{flex:1}}><div style={{fontSize:10,color:t.tT,marginBottom:2}}>Start</div><input type="date" value={dlStart} onChange={e=>setDlStart(e.target.value)} style={{width:"100%",fontSize:11,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 6px",background:t.sBg,color:t.tP,boxSizing:"border-box",outline:"none"}}/></div>
                    <div style={{flex:1}}><div style={{fontSize:10,color:t.tT,marginBottom:2}}>Due</div><input type="date" value={dlDate} onChange={e=>setDlDate(e.target.value)} style={{width:"100%",fontSize:11,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 6px",background:t.sBg,color:t.tP,boxSizing:"border-box",outline:"none"}}/></div>
                  </div>
                  <input value={dlDesc} onChange={e=>setDlDesc(e.target.value)} placeholder="Description (optional)" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:6,boxSizing:"border-box",outline:"none"}}/>
                  <select value={dlColor} onChange={e=>setDlColor(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${DLC[dlColor].border}`,padding:"5px 8px",background:DLC[dlColor].bg,color:DLC[dlColor].text,marginBottom:8,outline:"none"}}>
                    {DLC.map((_,i)=><option key={i} value={i}>{DL_NAMES[i]}</option>)}
                  </select>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={saveDl} style={{flex:1,background:t.aBtn,border:"none",borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Save</button>
                    <button onClick={()=>setDlFormOpen(false)} style={{flex:1,background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.tS,fontSize:12}}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Deadline list */}
              {projDls.length===0&&!dlFormOpen&&(
                <div style={{fontSize:12,color:t.tT,textAlign:"center",padding:"24px 16px"}}>No deadlines yet.</div>
              )}
              {[...projDls].sort((a,b)=>a.date.localeCompare(b.date)).map(dl=>{
                const dc=DLC[dl.colorIdx%DLC.length];
                const active=selDlId===dl.id;
                const dlT=projTasks.filter(x=>x.deadlineId===dl.id);
                const dlDone=dlT.filter(x=>x.done).length;
                const days=du(dl.date);
                const ov=days!==null&&days<0;
                const urg=days!==null&&days>=0&&days<=3;
                return(
                  <div key={dl.id} style={{borderLeft:`3px solid ${active?dc.dot:"transparent"}`,background:active?dc.bg+"55":"transparent"}}>
                    <button onClick={()=>setSelDlId(active?null:dl.id)} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",cursor:"pointer",background:"transparent",border:"none",textAlign:"left",width:"100%"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:dc.dot,flexShrink:0,marginTop:3}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:active?600:400,color:active?dc.text:t.tP,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dl.title}</div>
                        <div style={{fontSize:10,color:ov?"#E24B4A":urg?"#C07010":t.tT,marginTop:1}}>
                          {ov?`${Math.abs(days)}d overdue`:days===0?"Due today":days===1?"Tomorrow":`${days}d left`}
                          {dlT.length>0&&<span style={{color:t.tT}}> · {dlDone}/{dlT.length}</span>}
                        </div>
                        {/* Mini progress bar */}
                        {dlT.length>0&&<div style={{height:3,borderRadius:2,background:t.border,overflow:"hidden",marginTop:4}}><div style={{height:"100%",width:`${Math.round(dlDone/dlT.length*100)}%`,background:dc.dot,borderRadius:2}}/></div>}
                      </div>
                    </button>
                    {active&&(
                      <div style={{display:"flex",gap:5,padding:"0 14px 8px",paddingLeft:30}}>
                        <button onClick={()=>openEditDl(dl)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:`0.5px solid ${dc.border}`,background:"transparent",color:dc.text,cursor:"pointer"}}>Edit</button>
                        <button onClick={()=>removeDl(dl.id)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:"0.5px solid #E24B4A44",background:"transparent",color:"#E24B4A",cursor:"pointer"}}>Remove</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: tasks panel */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowY:"auto"}}>
              <div style={{padding:"16px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`0.5px solid ${t.border}`,flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:600,color:t.tP}}>
                  {selDlId?(()=>{const dl=projDls.find(d=>d.id===selDlId);return dl?dl.title:"Tasks";})():"All tasks"}
                  <span style={{fontWeight:400,color:t.tT}}> — {visibleTasks.length} task{visibleTasks.length!==1?"s":""}</span>
                </div>
                <button onClick={()=>openTaskForm(selDlId)} style={{fontSize:11,padding:"4px 12px",borderRadius:7,border:`0.5px solid ${c.border}`,background:c.bg,color:c.text,cursor:"pointer"}}>+ Add task</button>
              </div>

              {/* Add task form */}
              {taskFormDlId!==undefined&&taskFormDlId!==false&&(taskFormDlId===selDlId||taskFormDlId===null)&&taskText!==false&&(
                taskFormDlId===selDlId||taskFormDlId===null
              )&&false===false&&(
                <div/>
              )}
              {taskFormDlId!==undefined&&(
                <div style={{padding:"12px 20px",background:t.bg,borderBottom:`0.5px solid ${t.border}`}}>
                  <input value={taskText} onChange={e=>setTaskText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask(taskFormDlId)} placeholder="Task name…" style={{width:"100%",fontSize:13,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 11px",background:t.sBg,color:t.tP,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Priority</div>
                      <select value={taskPri||""} onChange={e=>setTaskPri(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                        <option value="">None</option>
                        {["high","medium","low"].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                      </select>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Duration</div>
                      <select value={taskDur} onChange={e=>setTaskDur(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                        {[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}
                      </select>
                    </div>
                    {!selDlId&&projDls.length>0&&(
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Deadline</div>
                        <select value={taskFormDlId||""} onChange={e=>setTaskFormDlId(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                          <option value="">None</option>
                          {projDls.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>addTask(taskFormDlId)} style={{flex:1,background:t.aBtn,border:"none",borderRadius:8,padding:"7px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Add task</button>
                    <button onClick={()=>{setTaskFormDlId(undefined);setTaskText("");}} style={{flex:1,background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:8,padding:"7px 0",cursor:"pointer",color:t.tS,fontSize:12}}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Task list */}
              <div style={{padding:"8px 20px 16px"}}>
                {visibleTasks.length===0&&taskFormDlId===undefined&&(
                  <div style={{fontSize:13,color:t.tT,textAlign:"center",padding:"32px 0"}}>
                    {selDlId?"No tasks linked to this deadline.":"No tasks in this project yet."}
                  </div>
                )}
                {visibleTasks.map(tk=>{
                  const pc=P[tk.priority||"none"];
                  const dlLabel=projDls.find(d=>d.id===tk.deadlineId);
                  const dlC=dlLabel?DLC[dlLabel.colorIdx%DLC.length]:null;
                  const isEditingThis=editTaskId===tk.id;
                  const isExpanded=selTask?.id===tk.id&&!isEditingThis;
                  return(
                    <div key={tk.id} style={{borderRadius:10,border:`1px solid ${isExpanded?c.border:t.border}`,background:isExpanded?c.bg+"33":t.bg,marginBottom:6,overflow:"hidden"}}>
                      {isEditingThis?(
                        <div style={{padding:"12px 14px"}}>
                          <input value={eTText} onChange={e=>setETText(e.target.value)} style={{width:"100%",fontSize:13,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 10px",background:t.sBg,color:t.tP,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                          <div style={{display:"flex",gap:8,marginBottom:8}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Priority</div>
                              <select value={eTPri||""} onChange={e=>setETPri(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                                <option value="">None</option>
                                {["high","medium","low"].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                              </select>
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Duration</div>
                              <select value={eTDur} onChange={e=>setETDur(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                                {[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}
                              </select>
                            </div>
                            {projDls.length>0&&(
                              <div style={{flex:1}}>
                                <div style={{fontSize:10,color:t.tT,marginBottom:3}}>Deadline</div>
                                <select value={eTDlId||""} onChange={e=>setETDlId(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"5px 8px",background:t.sBg,color:t.tP,outline:"none"}}>
                                  <option value="">None</option>
                                  {projDls.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={saveEditTask} style={{flex:1,background:t.aBtn,border:"none",borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Save</button>
                            <button onClick={()=>setEditTaskId(null)} style={{flex:1,background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.tS,fontSize:12}}>Cancel</button>
                          </div>
                        </div>
                      ):(
                        <>
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}} onClick={()=>setSelTask(isExpanded?null:tk)}>
                            <input type="checkbox" checked={tk.done} onChange={e=>{e.stopPropagation();toggleTask(tk.id);}} style={{width:14,height:14,flexShrink:0,cursor:"pointer"}}/>
                            <span style={{flex:1,fontSize:13,color:tk.done?t.tT:t.tP,textDecoration:tk.done?"line-through":"none",lineHeight:1.3}}>{tk.text}</span>
                            <PriorityTag priority={tk.priority} P={P}/>
                            <span style={{fontSize:11,color:t.tT,whiteSpace:"nowrap"}}>{tk.dur*15}m</span>
                            {dlLabel&&dlC&&!selDlId&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,whiteSpace:"nowrap",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis"}}>{dlLabel.title}</span>}
                            <div style={{display:"flex",gap:4,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>openEditTask(tk)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Edit</button>
                              <button onClick={()=>removeTask(tk.id)} style={{fontSize:11,background:"none",border:"none",color:"#E24B4A",cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
                            </div>
                          </div>
                          {isExpanded&&(
                            <div style={{padding:"0 14px 12px 38px",borderTop:`0.5px solid ${t.border}`}}>
                              <div style={{display:"flex",gap:16,fontSize:12,color:t.tS,marginTop:8,flexWrap:"wrap"}}>
                                <span>Priority: <strong style={{color:pc.text}}>{tk.priority||"none"}</strong></span>
                                <span>Duration: <strong>{tk.dur*15} min</strong></span>
                                <span>Status: <strong style={{color:tk.done?"#2D9B6F":t.tP}}>{tk.done?"Done":"To do"}</strong></span>
                                {tk.slot!=null&&<span>Scheduled: <strong>{s2t(tk.slot)}</strong></span>}
                                {dlLabel&&<span>Deadline: <strong style={{color:dlC?.text}}>{dlLabel.title}</strong></span>}
                              </div>
                              {tk.note&&<div style={{fontSize:12,color:t.tS,marginTop:8,padding:"8px 10px",background:t.sBg,borderRadius:7,lineHeight:1.6}}>{tk.note}</div>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ ANALYTICS TAB ══ */}
        {tab==="analytics"&&(
          <div style={{padding:"24px 28px"}}>
            {/* Overall donut + stats side by side */}
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:32,alignItems:"start",marginBottom:32}}>
              {/* Pie */}
              <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px"}}>
                <div style={{fontSize:12,fontWeight:600,color:t.tP,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Task breakdown</div>
                <PieDt tasks={projTasks} t={t}/>
              </div>
              {/* Deadline progress bars */}
              <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px"}}>
                <div style={{fontSize:12,fontWeight:600,color:t.tP,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Deadline progress</div>
                {projDls.length===0&&<div style={{fontSize:12,color:t.tT}}>No deadlines yet.</div>}
                {[...projDls].sort((a,b)=>a.date.localeCompare(b.date)).map(dl=>{
                  const dc=DLC[dl.colorIdx%DLC.length];
                  const dlT=projTasks.filter(x=>x.deadlineId===dl.id);
                  const done2=dlT.filter(x=>x.done).length;
                  const p=dlT.length>0?Math.round(done2/dlT.length*100):0;
                  const days=du(dl.date);
                  const ov=days!==null&&days<0;
                  const urg=days!==null&&days>=0&&days<=3;
                  return(
                    <div key={dl.id} style={{marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:5}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:dc.dot,display:"inline-block",flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:500,color:dc.text,flex:1}}>{dl.title}</span>
                        <span style={{fontSize:11,color:ov?"#E24B4A":urg?"#C07010":t.tT,whiteSpace:"nowrap"}}>
                          {ov?`${Math.abs(days)}d overdue`:days===0?"Due today":days===1?"Due tomorrow":`${days}d left`}
                        </span>
                        <span style={{fontSize:12,fontWeight:600,color:dc.dot,minWidth:32,textAlign:"right"}}>{p}%</span>
                      </div>
                      <div style={{height:8,borderRadius:4,background:t.border,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,background:dc.dot,borderRadius:4,transition:"width 0.4s"}}/>
                      </div>
                      <div style={{fontSize:10,color:t.tT,marginTop:3}}>{done2}/{dlT.length} tasks · {fsd(dl.startDate||dl.date)}{dl.startDate?" → ":""}{dl.startDate&&fsd(dl.date)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gantt timeline */}
            <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px",marginBottom:24}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tP,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"}}>Gantt timeline</div>
              <GanttChart deadlines={projDls} tasks={projTasks} projStart={proj.startDate||null} projEnd={proj.endDate||null} t={t} DLC={DLC}/>
            </div>

            {/* Priority breakdown per deadline */}
            {projDls.length>0&&(
              <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px",marginBottom:24}}>
                <div style={{fontSize:12,fontWeight:600,color:t.tP,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Priority distribution</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                  {[...projDls].sort((a,b)=>a.date.localeCompare(b.date)).map(dl=>{
                    const dc=DLC[dl.colorIdx%DLC.length];
                    const dlT=projTasks.filter(x=>x.deadlineId===dl.id);
                    const byPri=["high","medium","low","none"].map(p=>({p,cnt:dlT.filter(x=>(x.priority||"none")===p).length})).filter(x=>x.cnt>0);
                    return(
                      <div key={dl.id} style={{background:dc.bg+"66",border:`0.5px solid ${dc.border}`,borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:12,fontWeight:500,color:dc.text,marginBottom:7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dl.title}</div>
                        {byPri.length===0?<div style={{fontSize:11,color:t.tT}}>No tasks</div>:byPri.map(({p,cnt})=>(
                          <div key={p} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{width:7,height:7,borderRadius:"50%",background:P[p].dot,display:"inline-block",flexShrink:0}}/>
                            <span style={{fontSize:11,color:t.tS,flex:1,textTransform:"capitalize"}}>{p}</span>
                            <span style={{fontSize:11,fontWeight:600,color:t.tP}}>{cnt}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key metrics */}
            <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px"}}>
              <div style={{fontSize:12,fontWeight:600,color:t.tP,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"}}>Key metrics</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                {[
                  {l:"Overall completion",v:`${overallPct}%`,col:c.dot},
                  {l:"Deadlines on track",v:`${projDls.filter(d=>{const d2=du(d.date);return d2!==null&&d2>=0;}).length} / ${projDls.length}`,col:"#2D9B6F"},
                  {l:"Overdue deadlines",v:String(projDls.filter(d=>{const d2=du(d.date);return d2!==null&&d2<0;}).length),col:"#E24B4A"},
                  {l:"Avg tasks/deadline",v:projDls.length>0?(projTasks.length/projDls.length).toFixed(1):"—",col:t.tS},
                  {l:"High priority tasks",v:String(projTasks.filter(x=>x.priority==="high"&&!x.done).length),col:"#639922"},
                  {l:"Scheduled tasks",v:String(projTasks.filter(x=>x.slot!=null).length),col:c.dot},
                ].map(m=>(
                  <div key={m.l} style={{padding:"12px 16px",background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:10}}>
                    <div style={{fontSize:20,fontWeight:700,color:m.col,lineHeight:1}}>{m.v}</div>
                    <div style={{fontSize:11,color:t.tT,marginTop:4}}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ProjectsOverlay shell ─────────────────────────────────────────────────────
function ProjectsOverlay({store,t,theme,DLC,P,onClose,onUpdateStore}){
  const projects=Array.isArray(store._projects)?store._projects:[];
  const [sel,setSel]=useState(projects.length>0?projects[0].id:null);
  const [newName,setNewName]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [newColor,setNewColor]=useState(0);
  const [addOpen,setAddOpen]=useState(false);

  function addProject(){
    if(!newName.trim())return;
    const np={id:uid(),name:newName.trim(),desc:newDesc.trim(),colorIdx:newColor,startDate:null,endDate:null};
    onUpdateStore({...store,_projects:[...projects,np]});
    setNewName("");setNewDesc("");setNewColor(0);setAddOpen(false);setSel(np.id);
  }
  function deleteProject(id){
    const ns={...store};
    allD(ns).forEach(k=>{ns[k]=(ns[k]||[]).map(x=>x.projectId===id?{...x,projectId:null}:x);});
    const dlIds=new Set((ns._deadlines||[]).filter(d=>d.projectId===id).map(d=>d.id));
    allD(ns).forEach(k=>{ns[k]=(ns[k]||[]).map(x=>dlIds.has(x.deadlineId)?{...x,deadlineId:null}:x);});
    ns._deadlines=(ns._deadlines||[]).filter(d=>d.projectId!==id);
    ns._projects=(ns._projects||[]).filter(p=>p.id!==id);
    onUpdateStore(ns);setSel(projects.filter(p=>p.id!==id)[0]?.id||null);
  }
  function allD(s){return Object.keys(s).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k));}

  const selP=sel?projects.find(p=>p.id===sel):null;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.cBg,borderRadius:20,width:"min(1200px,97vw)",height:"min(840px,92vh)",display:"flex",overflow:"hidden",boxShadow:"0 28px 90px rgba(0,0,0,0.32)"}} onClick={e=>e.stopPropagation()}>

        {/* ── Sidebar ── */}
        <div style={{width:220,flexShrink:0,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",background:t.bg}}>
          <div style={{padding:"20px 18px 14px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:700,color:t.tP}}>Projects</span>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:22,lineHeight:1,padding:0}}>×</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"8px 8px 0"}}>
            {projects.length===0&&<div style={{fontSize:12,color:t.tT,textAlign:"center",padding:"24px 8px"}}>No projects yet.</div>}
            {projects.map(p=>{
              const c2=DLC[p.colorIdx%DLC.length];const active=sel===p.id;
              const pDls=(store._deadlines||[]).filter(d=>d.projectId===p.id);
              const pTasks=allD(store).flatMap(k=>(store[k]||[]).filter(x=>x.projectId===p.id));
              const pDone=pTasks.filter(x=>x.done).length;
              const ppct=pTasks.length>0?Math.round(pDone/pTasks.length*100):0;
              return(
                <button key={p.id} onClick={()=>setSel(p.id)} style={{display:"flex",flexDirection:"column",padding:"10px 10px",borderRadius:10,border:`1px solid ${active?c2.border:"transparent"}`,background:active?c2.bg+"BB":"transparent",cursor:"pointer",marginBottom:4,textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{width:9,height:9,borderRadius:"50%",background:c2.dot,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:active?600:400,color:active?c2.text:t.tP,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{p.name}</span>
                  </div>
                  {pTasks.length>0&&(
                    <div style={{paddingLeft:17}}>
                      <div style={{height:3,borderRadius:2,background:t.border,overflow:"hidden",marginBottom:2}}><div style={{height:"100%",width:`${ppct}%`,background:c2.dot,borderRadius:2}}/></div>
                      <div style={{fontSize:10,color:t.tT}}>{ppct}% · {pDls.length} dl · {pTasks.length} tasks</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{padding:"10px 8px",borderTop:`1px solid ${t.border}`}}>
            {addOpen?(
              <div>
                <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProject()} placeholder="Project name" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 8px",background:t.sBg,color:t.tP,marginBottom:5,boxSizing:"border-box",outline:"none"}}/>
                <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description (optional)" style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 8px",background:t.sBg,color:t.tP,marginBottom:5,boxSizing:"border-box",outline:"none"}}/>
                <select value={newColor} onChange={e=>setNewColor(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${DLC[newColor].border}`,padding:"5px 8px",background:DLC[newColor].bg,color:DLC[newColor].text,marginBottom:8,outline:"none"}}>
                  {DLC.map((_,i)=><option key={i} value={i}>{DL_NAMES[i]}</option>)}
                </select>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={addProject} style={{flex:1,background:t.aBtn,border:"none",borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Add</button>
                  <button onClick={()=>setAddOpen(false)} style={{flex:1,background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:7,padding:"6px 0",cursor:"pointer",color:t.tS,fontSize:12}}>Cancel</button>
                </div>
              </div>
            ):(
              <button onClick={()=>setAddOpen(true)} style={{width:"100%",background:"transparent",border:`0.5px solid ${t.border}`,borderRadius:9,padding:"7px 0",cursor:"pointer",color:t.tS,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                <span style={{fontSize:14,lineHeight:1}}>+</span> New project
              </button>
            )}
          </div>
        </div>

        {/* ── Main ── */}
        {!selP?(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:t.tT}}>
            <div style={{fontSize:36,opacity:0.2}}>📋</div>
            <div style={{fontSize:13}}>Select or create a project to get started</div>
          </div>
        ):(
          <ProjectDetail key={selP.id} proj={selP} store={store} t={t} theme={theme} DLC={DLC} P={P} onUpdateStore={onUpdateStore} onDelete={()=>deleteProject(selP.id)}/>
        )}
      </div>
    </div>
  );
}
// ── Auth page ─────────────────────────────────────────────────────────────────
function AuthPage({onLogin}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [username,setUsername]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e){
    e.preventDefault();setError("");setLoading(true);
    try{
      const body=mode==="signup"?{email,password,username:username.trim()}:{email,password};
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
            {mode==="signup"&&<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username (e.g. ed)" required style={inputStyle}/>}
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
  const username=getUsernameFromToken();
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
  function onDragStart(e,task){dragInfo.current=task;e.dataTransfer.effectAllowed="move";const tc2=getTaskColor(task,deadlines,DLC,theme);const el=document.createElement("div");el.style.cssText=`position:fixed;top:-999px;left:-999px;padding:4px 10px;background:${tc2.bg};border:1px solid ${tc2.border};border-radius:8px;font-size:12px;color:${tc2.text};white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;`;el.textContent=task.text;document.body.appendChild(el);e.dataTransfer.setDragImage(el,0,0);setTimeout(()=>document.body.removeChild(el),0);}
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
          <div><div style={{fontSize:16,fontWeight:500,color:t.tP,marginBottom:2}}>{greet(username)}</div><div style={{fontSize:12,color:t.tS}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div></div>
          <div style={{display:"flex",border:`0.5px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0,marginLeft:8}}>{["week","month"].map(v=>(<button key={v} onClick={()=>setCv(v)} style={{padding:"4px 9px",fontSize:11,cursor:"pointer",background:cv===v?t.selDB:"transparent",color:cv===v?"#fff":t.tS,border:"none",fontWeight:cv===v?600:400}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>))}</div>
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

  function TaskListCard(){
    return(
      <div className="col-scroll" onDragOver={e=>{e.preventDefault();setOverUnsch(true);}} onDragLeave={()=>setOverUnsch(false)} onDrop={e=>{setOverUnsch(false);onDropUnschedule(e);}} style={{background:t.cBg,border:`0.5px solid ${overUnsch?t.acc:t.border}`,borderRadius:14,padding:"14px 16px",overflowY:"auto",maxHeight:isNarrow?"none":"calc(100vh - 280px)"}}>
        {DeadlineSections()}
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
        {username&&<span style={{fontSize:12,color:t.hText,opacity:0.75,fontWeight:400,letterSpacing:"0.01em"}}>@{username}</span>}
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
            {LeftColumnContent()}
          </div>
          {/* Middle */}
          <div style={{display:"flex",flexDirection:"column",gap:10,minHeight:0}}>
            {AddTaskCard()}
            {TaskListCard()}
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
              <div><div style={{fontSize:15,fontWeight:500,color:t.tP,marginBottom:1}}>{greet(username)}</div><div style={{fontSize:11,color:t.tS}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div></div>
              <div style={{display:"flex",border:`0.5px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0,marginLeft:8}}>{["week","month"].map(v=>(<button key={v} onClick={()=>setCv(v)} style={{padding:"3px 8px",fontSize:11,cursor:"pointer",background:cv===v?t.selDB:"transparent",color:cv===v?"#fff":t.tS,border:"none",fontWeight:cv===v?600:400}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>))}</div>
            </div>
            {cv==="week"?<WeekStrip date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>:<MonthCal date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>}
          </div>
          {/* Add task */}
          {AddTaskCard()}
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
              {TaskListCard()}
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
