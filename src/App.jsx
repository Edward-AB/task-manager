import { useState, useRef, useCallback, useMemo, useEffect } from "react";

const SLOT_H=16,SPH=4,HOUR_H=SLOT_H*SPH,CAL_S=6,CAL_E=24;
const CAL_HOURS=Array.from({length:CAL_E-CAL_S},(_,i)=>i+CAL_S);
const CAL_SLOTS=(CAL_E-CAL_S)*SPH,CAL_OFF=CAL_S*SPH,TOT_SLOTS=24*SPH,CAL_H=CAL_SLOTS*SLOT_H,CL=46;
const SK="pinetask";
const LEGACY=["5ground_v10","5ground_v9","5ground_v8","5ground_v7","5ground_v6","5ground_v5","5ground_v4","5ground_tasks_v3","5ground_tasks_v2","5ground_tasks_v1","taskdash_v6","taskdash_v5","taskdash_v4","taskdash_v3","taskdash_v2","taskdash_v1"];

const TH={
  forest:{hBg:"#FFFFFF",hBorder:"#E8E5DE",hText:"#2C2C2A",bg:"#F0EDE6",cBg:"#FFFFFF",border:"#D3CFC0",tP:"#2C2C2A",tS:"#5F5E5A",tT:"#B4B2A9",acc:"#3B6D11",accBg:"#EAF3DE",accTx:"#27500A",accBd:"#97C459",aBtn:"#27500A",aBtnTx:"#EAF3DE",sBg:"#F7F5F0",calBg:"#FAFAF8",hr:"#E8E5DE",dash:"#EAE7E0",todL:"#E24B4A",selD:"#EAF3DE",selDB:"#639922",selDT:"#27500A",todDB:"#F5F3EE",rBar:"#97C459",nowL:"#E24B4A"},
  dark:{hBg:"#1A4A35",hBorder:"#2A5A42",hText:"#E8E0D0",bg:"#151718",cBg:"#1E2225",border:"#2E3438",tP:"#E8EAEB",tS:"#9AA3A8",tT:"#4A5558",acc:"#5DCAA5",accBg:"#1A3530",accTx:"#5DCAA5",accBd:"#2D6B5A",aBtn:"#2D6B5A",aBtnTx:"#C0F0E0",sBg:"#252A2D",calBg:"#1A1E20",hr:"#2A3035",dash:"#252A2D",todL:"#FF6B6B",selD:"#1A3530",selDB:"#5DCAA5",selDT:"#5DCAA5",todDB:"#1E2428",rBar:"#5DCAA5",nowL:"#FF6B6B"},
};

const GP=th=>th==="dark"?{
  high:{bg:"#1C2E14",border:"#4A7A25",text:"#8FD44A",dot:"#6DB830"},
  medium:{bg:"#0D1E30",border:"#2A5A8A",text:"#60AEDD",dot:"#3D8FC5"},
  low:{bg:"#1A1535",border:"#5A52C0",text:"#B0A8F8",dot:"#7F77DD"},
}:{
  high:{bg:"#EAF3DE",border:"#97C459",text:"#27500A",dot:"#639922"},
  medium:{bg:"#E6F1FB",border:"#85B7EB",text:"#0C447C",dot:"#378ADD"},
  low:{bg:"#EEEDFE",border:"#AFA9EC",text:"#3C3489",dot:"#7F77DD"},
};

const GD=th=>th==="dark"?[
  {bg:"#2A1F08",border:"#A07820",text:"#F5C87A",dot:"#C49A30"},
  {bg:"#2A1020",border:"#9A4570",text:"#E890B8",dot:"#C05080"},
  {bg:"#0A2520",border:"#2A8060",text:"#60C0A0",dot:"#1D9E75"},
  {bg:"#2A0F0F",border:"#8A3030",text:"#E08080",dot:"#C05050"},
  {bg:"#1A1E20",border:"#4A5558",text:"#9AA3A8",dot:"#6A7880"},
  {bg:"#0D1835",border:"#3A52A0",text:"#80A8F8",dot:"#4A72C8"},
]:[
  {bg:"#FAEEDA",border:"#EF9F27",text:"#633806",dot:"#BA7517"},
  {bg:"#FBEAF0",border:"#ED93B1",text:"#72243E",dot:"#D4537E"},
  {bg:"#E1F5EE",border:"#5DCAA5",text:"#085041",dot:"#1D9E75"},
  {bg:"#FCEBEB",border:"#F09595",text:"#791F1F",dot:"#E24B4A"},
  {bg:"#F1EFE8",border:"#B4B2A9",text:"#2C2C2A",dot:"#888780"},
  {bg:"#EAF3DE",border:"#97C459",text:"#27500A",dot:"#639922"},
];

function getTaskColor(task, deadlines, DLC, theme) {
  if (task.deadlineId) {
    const dl = deadlines.find(d => d.id === task.deadlineId);
    if (dl) return DLC[dl.colorIdx % DLC.length];
  }
  if (task.colorId) {
    const darkMap = {
      brown:  {bg:"#2A1508",border:"#A0522D",text:"#E8A87A",dot:"#C07040"},
      purple: {bg:"#1D1535",border:"#6A4ABF",text:"#C0A8F8",dot:"#8B6FDD"},
      black:  {bg:"#1A1A1A",border:"#555555",text:"#DDDDDD",dot:"#AAAAAA"},
    };
    if (theme === "dark" && darkMap[task.colorId]) return darkMap[task.colorId];
    const tc = TASK_COLORS.find(c => c.id === task.colorId);
    if (tc) return tc;
  }
  return theme === "dark"
    ? {bg:"#252A2D",border:"#3A4045",text:"#C8CDD0",dot:"#9AA3A8"}
    : {bg:"#F7F5F0",border:"#C8C4B0",text:"#2C2C2A",dot:"#888780"};
}

const TASK_COLORS = [
  { id:"brown",  bg:"#EDD5C0", border:"#8B4513", text:"#3A1200", dot:"#7A3010" },
  { id:"purple", bg:"#D8D0F5", border:"#5A3FAF", text:"#1E0E55", dot:"#3B1F8E" },
  { id:"black",  bg:"#B8B8B8", border:"#111111", text:"#000000", dot:"#000000" },
];

function hasRealData(p){if(!p||typeof p!=="object")return false;return Object.keys(p).some(k=>{if(k==="_deadlines")return Array.isArray(p[k])&&p[k].length>0;return /^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(p[k])&&p[k].length>0;});}

function migrateStore(){
  try{
    const cur=localStorage.getItem(SK);
    if(cur){const p=JSON.parse(cur);if(hasRealData(p)){LEGACY.forEach(k=>localStorage.removeItem(k));return p;}}
    for(const k of LEGACY){try{const raw=localStorage.getItem(k);if(!raw)continue;const p=JSON.parse(raw);if(hasRealData(p)){localStorage.setItem(SK,raw);LEGACY.forEach(lk=>localStorage.removeItem(lk));return p;}}catch{}}
    for(const k of Object.keys(localStorage)){if(k===SK||LEGACY.includes(k))continue;try{const raw=localStorage.getItem(k);if(!raw)continue;const p=JSON.parse(raw);if(hasRealData(p)){localStorage.setItem(SK,raw);LEGACY.forEach(lk=>localStorage.removeItem(lk));localStorage.removeItem(k);return p;}}catch{}}
  }catch{}
  return{};
}

function sst(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch{}}
function fd(d){return d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}
function fsd(str){if(!str)return "";return new Date(str+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
function du(str){if(!str)return null;return Math.ceil((new Date(str+"T12:00:00")-new Date())/86400000);}
function dk(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function tk(){return dk(new Date());}
function s2t(s){const h=Math.floor(s/SPH),m=(s%SPH)*15;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;}
function greet(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";}
function fc(d){return d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}
function nowY(){const n=new Date();return((n.getHours()*60+n.getMinutes())-CAL_S*60)/60*HOUR_H;}
let _id=Date.now();function uid(){return String(++_id);}

function computeCols(tasks){
  const sorted=[...tasks].sort((a,b)=>a.slot-b.slot),cols=[],taskCol={};
  sorted.forEach(task=>{let placed=false;for(let c=0;c<cols.length;c++){const last=cols[c][cols[c].length-1];if(last.slot+last.dur<=task.slot){cols[c].push(task);taskCol[task.id]=c;placed=true;break;}}if(!placed){taskCol[task.id]=cols.length;cols.push([task]);}});
  const result={};
  sorted.forEach(task=>{
    const active=new Set([taskCol[task.id]]);
    sorted.forEach(other=>{if(other.id!==task.id&&other.slot<task.slot+task.dur&&other.slot+other.dur>task.slot)active.add(taskCol[other.id]);});
    result[task.id]={col:taskCol[task.id],total:active.size};
  });
  return result;
}

function NpIcon({has,color,size=12}){return <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{flexShrink:0,verticalAlign:"middle"}}><rect x={1} y={1} width={10} height={10} rx={1.5} stroke={color} strokeWidth={1.2} fill={has?"currentColor":"none"} fillOpacity={has?0.18:0}/><line x1={3} y1={4} x2={9} y2={4} stroke={color} strokeWidth={1}/><line x1={3} y1={6.5} x2={9} y2={6.5} stroke={color} strokeWidth={1}/><line x1={3} y1={9} x2={7} y2={9} stroke={color} strokeWidth={1}/></svg>;}

function PriorityTag({priority,P}){const c=P[priority];return <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:c.bg,color:c.text,border:`0.5px solid ${c.border}`,flexShrink:0,whiteSpace:"nowrap"}}>{priority}</span>;}

function SL({text,t}){return <div style={{fontSize:10,fontWeight:500,color:t.tT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{text}</div>;}

function MiniPie({pct,color,size=26}){
  const r=11,cx=14,cy=14;
  if(pct>=100)return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.25}/><circle cx={cx} cy={cy} r={r} fill={color}/><path d="M9 14l3 3 7-7" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
  if(pct<=0)return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.2}/></svg>;
  const sw=(pct/100)*2*Math.PI,x1=cx+r*Math.cos(-Math.PI/2),y1=cy+r*Math.sin(-Math.PI/2),x2=cx+r*Math.cos(-Math.PI/2+sw),y2=cy+r*Math.sin(-Math.PI/2+sw);
  return <svg width={size} height={size} viewBox="0 0 28 28"><circle cx={cx} cy={cy} r={r} fill={color} opacity={0.2}/><path d={`M${cx},${cy} L${x1},${y1} A${r},${r},0,${sw>Math.PI?1:0},1,${x2},${y2} Z`} fill={color}/></svg>;
}

function OverviewPie({tasks,t}){
  const done=tasks.filter(x=>x.done).length,todo=tasks.filter(x=>!x.done),total=tasks.length;
  if(!total)return <div style={{fontSize:12,color:t.tT,textAlign:"center",padding:"16px 0"}}>No tasks yet</div>;
  const sd=[{val:done,color:"#5DCAA5",label:"Done"},{val:todo.filter(x=>x.priority==="high").length,color:"#639922",label:"High"},{val:todo.filter(x=>x.priority==="medium").length,color:"#378ADD",label:"Medium"},{val:todo.filter(x=>x.priority==="low").length,color:"#7F77DD",label:"Low"}].filter(s=>s.val>0);
  const R=44,cx=54,cy=54;let paths=[];
  if(sd.length===1){paths=[{...sd[0],circle:true}];}
  else{let angle=-Math.PI/2;sd.forEach(s=>{const sw=(s.val/total)*2*Math.PI,x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);angle+=sw;const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);paths.push({...s,d:`M${cx},${cy} L${x1},${y1} A${R},${R},0,${sw>Math.PI?1:0},1,${x2},${y2} Z`,circle:false});});}
  return(
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <svg width={108} height={108} viewBox="0 0 108 108" style={{flexShrink:0}}>
        {paths.map((p,i)=>p.circle?<circle key={i} cx={cx} cy={cy} r={R} fill={p.color}/>:<path key={i} d={p.d} fill={p.color} stroke="#ffffff" strokeWidth={0.5}/>)}
        <circle cx={cx} cy={cy} r={27} fill={t.bg}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={17} fontWeight="500" fill={t.tP}>{total}</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize={10} fill={t.tS}>tasks</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
        {sd.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}><span style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0,display:"inline-block"}}/><span style={{color:t.tS,flex:1}}>{s.label}</span><span style={{fontWeight:500,color:t.tP}}>{s.val}</span></div>)}
        <div style={{marginTop:4,height:4,borderRadius:4,background:t.border,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(done/total*100)}%`,background:"#00A86B",borderRadius:4}}/></div>
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
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:3}}>
        {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:t.tT,padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((cell,i)=>{
          const k=dk(cell.d),isSel=k===sk,isToday=k===tk2,cnt=(store[k]||[]).length,dc=(store[k]||[]).filter(x=>x.done).length,hd=deadlines.some(dl=>dl.date===k);
          return(
            <button key={i} onClick={()=>setDate(new Date(cell.d.getFullYear(),cell.d.getMonth(),cell.d.getDate()))}
              style={{padding:"4px 2px",borderRadius:7,border:isSel?`1.5px solid ${t.selDB}`:`0.5px solid transparent`,background:isSel?t.selD:isToday?t.todDB:"transparent",cursor:"pointer",textAlign:"center",opacity:cell.cur?1:0.3,minHeight:32}}>
              <div style={{fontSize:11,fontWeight:isSel?500:400,color:isSel?t.selDT:isToday?t.tP:t.tS}}>{cell.d.getDate()}</div>
              <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:1}}>
                {cnt>0&&<div style={{width:4,height:4,borderRadius:"50%",background:dc===cnt?t.acc:t.accBd}}/>}
                {hd&&<div style={{width:4,height:4,borderRadius:"50%",background:"#E24B4A"}}/>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({date,setDate,store,deadlines,t}){
  const dow=date.getDay(),mon=new Date(date);
  mon.setDate(date.getDate()-((dow===0?7:dow)-1));
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
        {days.map((d,i)=>{
          const k=dk(d),isSel=k===sk,isToday=k===tk2,cnt=(store[k]||[]).length,dc=(store[k]||[]).filter(x=>x.done).length,hd=deadlines.some(dl=>dl.date===k);
          return(
            <button key={i} onClick={()=>setDate(new Date(d.getFullYear(),d.getMonth(),d.getDate()))}
              style={{padding:"6px 2px",borderRadius:9,border:isSel?`1.5px solid ${t.selDB}`:`0.5px solid ${t.border}`,background:isSel?t.selD:isToday?t.todDB:"transparent",cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:10,color:isSel?t.selDT:t.tT,marginBottom:2}}>{["M","T","W","T","F","S","S"][i]}</div>
              <div style={{fontSize:13,fontWeight:isSel?500:400,color:isSel?t.selDT:isToday?t.tP:t.tS}}>{d.getDate()}</div>
              <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:3,height:6}}>
                {cnt>0&&<div style={{width:5,height:5,borderRadius:"50%",background:dc===cnt?t.acc:"#97C459"}}/>}
                {hd&&<div style={{width:5,height:5,borderRadius:"50%",background:"#E24B4A"}}/>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NoteModal({task,t,onSave,onClose}){
  const [val,setVal]=useState(task.note||"");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.38)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:16,padding:28,width:620,maxWidth:"90vw",maxHeight:"80vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontWeight:500,fontSize:14,color:t.tP,flex:1,marginRight:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:20,lineHeight:1,flexShrink:0}}>×</button>
        </div>
        <div style={{fontSize:10,color:t.tT,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase"}}>Notes</div>
        <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Add notes…" style={{flex:1,minHeight:280,fontSize:13,borderRadius:10,border:`0.5px solid ${t.border}`,padding:"11px 13px",background:t.sBg,color:t.tP,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.7}}/>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{fontSize:13,padding:"8px 20px",borderRadius:8,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave(val)} style={{fontSize:13,padding:"8px 20px",borderRadius:8,border:"none",background:t.aBtn,color:t.aBtnTx,cursor:"pointer",fontWeight:500}}>Save note</button>
        </div>
      </div>
    </div>
  );
}

function TimerPopup({t,ts,onConfirm,onClose}){
  const [mins,setMins]=useState(25);const [add,setAdd]=useState(5);
  const running=ts&&ts.state==="running";
  return(
    <div style={{position:"absolute",top:38,left:0,zIndex:300,background:t.cBg,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px 18px",width:210}}>
      <button onClick={onClose} style={{position:"absolute",top:8,right:10,background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:16,lineHeight:1}}>×</button>
      {!ts?(
        <div>
          <div style={{fontSize:10,color:t.tT,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Set timer</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,justifyContent:"center"}}>
            <button onClick={()=>setMins(m=>Math.max(5,m-5))} style={{width:28,height:28,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:16,lineHeight:1}}>−</button>
            <span style={{fontSize:22,fontWeight:500,color:t.tP,minWidth:50,textAlign:"center"}}>{mins}m</span>
            <button onClick={()=>setMins(m=>m+5)} style={{width:28,height:28,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:16,lineHeight:1}}>+</button>
          </div>
          <button onClick={()=>onConfirm(mins*60,null)} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:8,padding:"7px 0",cursor:"pointer",color:t.aBtnTx,fontSize:13,fontWeight:500}}>Start</button>
        </div>
      ):(
        <div>
          <div style={{fontSize:10,color:t.tT,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>{running?"Running":"Paused"}</div>
          <div style={{fontSize:22,fontWeight:500,color:t.tP,textAlign:"center",marginBottom:12,fontFamily:"monospace"}}>{String(Math.floor(ts.remaining/60)).padStart(2,"0")}:{String(ts.remaining%60).padStart(2,"0")}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10,justifyContent:"center"}}>
            <span style={{fontSize:11,color:t.tT}}>Add</span>
            <button onClick={()=>setAdd(m=>Math.max(5,m-5))} style={{width:22,height:22,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:13,lineHeight:1}}>−</button>
            <span style={{fontSize:13,color:t.tP,minWidth:26,textAlign:"center"}}>{add}m</span>
            <button onClick={()=>setAdd(m=>m+5)} style={{width:22,height:22,borderRadius:"50%",border:`0.5px solid ${t.border}`,background:t.sBg,cursor:"pointer",color:t.tP,fontSize:13,lineHeight:1}}>+</button>
            <button onClick={()=>onConfirm(add*60,"add")} style={{fontSize:11,padding:"3px 9px",borderRadius:7,border:"none",background:t.acc,color:t.aBtnTx,cursor:"pointer"}}>Add</button>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>onConfirm(0,"toggle")} style={{flex:1,fontSize:12,padding:"6px 0",borderRadius:8,border:`0.5px solid ${t.border}`,background:t.sBg,color:t.tP,cursor:"pointer"}}>{running?"Pause":"Resume"}</button>
            <button onClick={()=>onConfirm(0,"cancel")} style={{flex:1,fontSize:12,padding:"6px 0",borderRadius:8,border:`0.5px solid ${t.border}`,background:"transparent",color:"#E24B4A",cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DoneToast({t,onClose}){
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:500,background:t.cBg,border:`1.5px solid ${t.acc}`,borderRadius:14,padding:"14px 18px",minWidth:220,display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:t.accBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none"><circle cx={9} cy={9} r={7} stroke={t.acc} strokeWidth={1.5}/><path d="M6 9l2.5 2.5L13 7" stroke={t.acc} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:500,color:t.tP}}>Timer complete!</div>
        <div style={{fontSize:11,color:t.tS,marginTop:2}}>Your timer has finished.</div>
      </div>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.tT,fontSize:18,lineHeight:1,flexShrink:0}}>×</button>
    </div>
  );
}

function DeadlineItem({dl,c,allT,t,P,isExp,onToggle,onRemove,showRemove}){
  const ddn=allT.filter(x=>x.done).length,dtt=allT.length,pct=dtt>0?Math.round(ddn/dtt*100):0;
  const days=du(dl.date),ov=days!==null&&days<0,urg=days!==null&&days<=3&&days>=0;
  return(
    <div style={{borderRadius:10,border:`0.5px solid ${c.border}`,background:c.bg+"99",marginBottom:8,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",cursor:"pointer"}} onClick={onToggle}>
        <MiniPie pct={pct} color={c.dot} size={26}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:500,color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dl.title}</div>
          <div style={{fontSize:10,color:ov?"#E24B4A":urg?"#C07010":c.dot,marginTop:1}}>{ov?`${Math.abs(days)}d overdue`:days===0?"Due today":days===1?"Due tomorrow":`${days}d left`}</div>
        </div>
        <span style={{fontSize:11,color:c.dot,flexShrink:0}}>{isExp?"▴":"▾"}</span>
      </div>
      {isExp&&(
        <div style={{borderTop:`0.5px solid ${c.border}`,padding:"10px"}}>
          {dl.desc&&<div style={{fontSize:11,color:c.text,opacity:0.8,marginBottom:8}}>{dl.desc}</div>}
          <div style={{fontSize:11,color:c.text,marginBottom:6}}>Due: {fsd(dl.date)}</div>
          <div style={{fontSize:11,color:c.text,marginBottom:6}}>{ddn}/{dtt} tasks complete</div>
          <div style={{height:5,borderRadius:4,background:c.border+"44",overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${pct}%`,background:c.dot,borderRadius:4}}/></div>
          {allT.map(x=>(
            <div key={x.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"3px 0",borderBottom:`0.5px solid ${c.border}44`}}>
              <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:P[x.priority].dot,flexShrink:0}}/>
              <span style={{flex:1,color:x.done?t.tT:c.text,textDecoration:x.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.text}</span>
              {x.done&&<span style={{fontSize:10,color:t.acc}}>✓</span>}
            </div>
          ))}
          {showRemove&&<button onClick={onRemove} style={{marginTop:8,fontSize:10,color:"#E24B4A",background:"none",border:"0.5px solid #E24B4A",borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>Remove</button>}
        </div>
      )}
    </div>
  );
}

function TaskItem({task,isScheduled,deadlines,DLC,P,t,theme,toggleDone,removeTask,unschedule,startEdit,saveEdit,cancelEdit,editId,editText,setEditText,editPri,setEditPri,editDur,setEditDur,editDlId,setEditDlId,editMv,setEditMv,onDragStart,onDragEnd,onNote}){
  const isEd=editId===task.id;
  const tc=getTaskColor(task,deadlines,DLC,theme);
  const pc=P[task.priority];
  const dl=deadlines.find(d=>d.id===task.deadlineId),dlC=dl?DLC[dl.colorIdx%DLC.length]:null;
  const hN=!!(task.note&&task.note.trim());
  return(
    <div className="trow" draggable={!isScheduled} onDragStart={!isScheduled?e=>onDragStart(e,task):undefined} onDragEnd={onDragEnd}
      style={{display:"flex",alignItems:"center",gap:7,borderRadius:"0 8px 8px 0",background:tc.bg+"88",padding:"5px 8px",marginBottom:5,cursor:isScheduled?"default":"grab",userSelect:"none",boxSizing:"border-box",borderTop:`0.5px solid ${tc.border}`,borderRight:`0.5px solid ${tc.border}`,borderBottom:`0.5px solid ${tc.border}`,borderLeft:`3px solid ${pc.dot}`}}>
      <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        {isEd?(
          <div>
            <input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit()} autoFocus style={{width:"100%",fontSize:12,borderRadius:6,border:`0.5px solid ${t.border}`,padding:"3px 7px",marginBottom:4,boxSizing:"border-box",background:t.cBg,color:t.tP}}/>
            <div style={{display:"flex",gap:3,marginBottom:4}}>{["high","medium","low"].map(p=><button key={p} onClick={()=>setEditPri(p)} style={{flex:1,fontSize:10,padding:"2px 0",borderRadius:20,border:`1px solid ${editPri===p?P[p].border:t.border}`,background:editPri===p?P[p].bg:"transparent",color:editPri===p?P[p].text:t.tS,cursor:"pointer"}}>{p}</button>)}</div>
            <select value={editDlId||""} onChange={e=>setEditDlId(e.target.value||null)} style={{width:"100%",fontSize:11,borderRadius:6,border:`0.5px solid ${t.border}`,padding:"3px",background:t.sBg,color:t.tS,marginBottom:4}}><option value="">No deadline</option>{deadlines.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select>
            <div style={{display:"flex",gap:4,marginBottom:4,alignItems:"center"}}><span style={{fontSize:10,color:t.tT,flexShrink:0}}>Move to</span><input type="date" value={editMv||""} onChange={e=>setEditMv(e.target.value||null)} style={{flex:1,fontSize:11,borderRadius:6,border:`0.5px solid ${t.border}`,padding:"2px 5px",background:t.sBg,color:t.tP}}/></div>
            <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:4}}><span style={{fontSize:10,color:t.tT}}>Dur</span><select value={editDur} onChange={e=>setEditDur(Number(e.target.value))} style={{fontSize:11,flex:1,borderRadius:6,border:`0.5px solid ${t.border}`,padding:"2px",background:t.sBg,color:t.tP}}>{[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15}m</option>)}</select></div>
            <div style={{display:"flex",gap:4}}><button onClick={saveEdit} style={{flex:1,fontSize:11,padding:"3px 0",borderRadius:6,border:"none",background:t.aBtn,color:t.aBtnTx,cursor:"pointer"}}>Save</button><button onClick={cancelEdit} style={{flex:1,fontSize:11,padding:"3px 0",borderRadius:6,border:`0.5px solid ${t.border}`,background:"transparent",color:t.tS,cursor:"pointer"}}>Cancel</button></div>
          </div>
        ):(
          <div>
            <div style={{fontSize:12,color:task.done?t.tT:tc.text,textDecoration:task.done?"line-through":"none",lineHeight:1.3,wordBreak:"break-word"}}>{task.text}</div>
            <div style={{display:"flex",gap:4,marginTop:2,alignItems:"center",flexWrap:"wrap"}}>
              <PriorityTag priority={task.priority} P={P}/>
              {task.type&&task.type!=="task"&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:tc.bg,color:tc.text,border:`0.5px solid ${tc.border}`,flexShrink:0}}>{task.type}</span>}
              <span style={{fontSize:10,color:t.tT}}>{task.dur*15}m</span>
              {isScheduled&&<span style={{fontSize:10,color:t.tT}}>{s2t(task.slot)}</span>}
              {hN&&<span onClick={()=>onNote(task)} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",color:tc.dot}}><NpIcon has={true} color={tc.dot}/></span>}
              {dl&&dlC&&<span style={{fontSize:10,padding:"0px 6px",borderRadius:20,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,whiteSpace:"nowrap"}}>{dl.title}</span>}
            </div>
          </div>
        )}
      </div>
      {!isEd&&(
        <div className="ta" style={{display:"flex",gap:3,flexShrink:0,alignItems:"center"}}>
          <button onClick={e=>{e.stopPropagation();startEdit(task);}} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:5,padding:"2px 5px",fontSize:10,cursor:"pointer",color:t.tS}}>Edit</button>
          <button onClick={e=>{e.stopPropagation();onNote(task);}} style={{background:"none",border:`0.5px solid ${tc.dot}`,borderRadius:5,padding:"2px 4px",fontSize:10,cursor:"pointer",color:tc.dot,display:"flex",alignItems:"center"}}><NpIcon has={hN} color={tc.dot} size={11}/></button>
          {isScheduled&&<button onClick={()=>unschedule(task.id)} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:5,padding:"2px 5px",fontSize:10,cursor:"pointer",color:t.tS}}>↩</button>}
          <button onClick={e=>{e.stopPropagation();removeTask(task.id);}} style={{background:"none",border:`0.5px solid ${t.border}`,borderRadius:5,padding:"2px 5px",fontSize:10,cursor:"pointer",color:"#E24B4A"}}>×</button>        </div>
      )}
    </div>
  );
}

export default function App(){
  const today=new Date();
  const sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme,setTheme]=useState(sysDark?"dark":"forest");
  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme: dark)");const h=e=>setTheme(e.matches?"dark":"forest");mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);

  const [store,setStore]=useState(()=>{const s=migrateStore();if(!s._deadlines)s._deadlines=[];return s;});
  const [date,setDate]=useState(today);
  const t=TH[theme],P=GP(theme),DLC=GD(theme);
  const [cv,setCv]=useState("week");
  const [clock,setClock]=useState(new Date());
  const [ny,setNy]=useState(0);
  const [timerSt,setTimerSt]=useState(null);const [showTP,setShowTP]=useState(false);const [showDone,setShowDone]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{setNy(nowY());const id=setInterval(()=>{setClock(new Date());setNy(nowY());},10000);return()=>clearInterval(id);},[]);
  useEffect(()=>{
    if(timerSt&&timerSt.state==="running"){timerRef.current=setInterval(()=>{setTimerSt(prev=>{if(!prev||prev.state!=="running")return prev;if(prev.remaining<=1){clearInterval(timerRef.current);setShowDone(true);return null;}return{...prev,remaining:prev.remaining-1};});},1000);}
    else{if(timerRef.current)clearInterval(timerRef.current);}
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[timerSt?.state]);

  function handleTimer(secs,action){
    if(!action){setTimerSt({state:"running",remaining:secs,total:secs});setShowTP(false);return;}
    if(action==="add"){setTimerSt(prev=>prev?{...prev,remaining:prev.remaining+secs}:null);return;}
    if(action==="toggle"){setTimerSt(prev=>prev?{...prev,state:prev.state==="running"?"paused":"running"}:null);return;}
    if(action==="cancel"){setTimerSt(null);setShowTP(false);return;}
  }

  const [newText,setNewText]=useState("");const [newPri,setNewPri]=useState("medium");const [newDur,setNewDur]=useState(2);const [newDlId,setNewDlId]=useState(null);const [newColorId,setNewColorId]=useState(null);
  const [editId,setEditId]=useState(null);const [editText,setEditText]=useState("");const [editPri,setEditPri]=useState("medium");const [editDur,setEditDur]=useState(2);const [editDlId,setEditDlId]=useState(null);const [editMv,setEditMv]=useState(null);const [editColorId,setEditColorId]=useState(null);
  const [ghost,setGhost]=useState(null);
  const [dlTitle,setDlTitle]=useState("");const [dlDate,setDlDate]=useState(tk());const [dlDesc,setDlDesc]=useState("");
  const [expDl,setExpDl]=useState(null);const [expTodDl,setExpTodDl]=useState(null);
  const [noteTask,setNoteTask]=useState(null);
  const calRef=useRef(null);const dragInfo=useRef(null);

  const key=dk(date),deadlines=store._deadlines||[];
  function persist(ns){setStore(ns);sst(ns);}
  const tasks=store[key]||[];
  function setTasks(fn,dk2){const k=dk2||key,cur=store[k]||[],next=typeof fn==="function"?fn(cur):fn;persist({...store,[k]:next});}
  function setDeadlines(fn){const next=typeof fn==="function"?fn(deadlines):fn;persist({...store,_deadlines:next});}

  const unsch=tasks.filter(x=>x.slot==null);
  const sched=tasks.filter(x=>x.slot!=null).sort((a,b)=>a.slot-b.slot);
  const done=tasks.filter(x=>x.done).length,total=tasks.length;
  const todDl=deadlines.filter(dl=>dl.date===key);
  const cLayout=useMemo(()=>computeCols(sched),[JSON.stringify(sched.map(s=>({id:s.id,slot:s.slot,dur:s.dur})))]);

  function allTFDl(dlId){return Object.entries(store).filter(([k])=>k!=="_deadlines"&&/^\d{4}-\d{2}-\d{2}$/.test(k)).flatMap(([,ts])=>(Array.isArray(ts)?ts:[]).filter(x=>x.deadlineId===dlId));}
  function addTask(){if(!newText.trim())return;setTasks(x=>[...x,{id:uid(),text:newText.trim(),priority:newPri,dur:newDur,slot:null,done:false,deadlineId:newDlId||null,note:"",colorId:newColorId||null}]);setNewText("");}
  function toggleDone(id){setTasks(x=>x.map(v=>v.id===id?{...v,done:!v.done}:v));}
  function removeTask(id){setTasks(x=>x.filter(v=>v.id!==id));}
  function unschedule(id){setTasks(x=>x.map(v=>v.id===id?{...v,slot:null}:v));}
  function startEdit(task){setEditId(task.id);setEditText(task.text);setEditPri(task.priority);setEditDur(task.dur);setEditDlId(task.deadlineId||null);setEditMv(null);setEditColorId(task.colorId||null);}
  function saveEdit(){const task=tasks.find(x=>x.id===editId);if(!task){setEditId(null);return;}const upd={...task,text:editText.trim()||task.text,priority:editPri,dur:editDur,deadlineId:editDlId,colorId:editColorId};if(editMv&&editMv!==key){const ns={...store};ns[key]=(ns[key]||[]).filter(x=>x.id!==editId);ns[editMv]=[...(ns[editMv]||[]),{...upd,slot:null}];persist(ns);}else setTasks(x=>x.map(v=>v.id===editId?upd:v));setEditId(null);}
  function cancelEdit(){setEditId(null);}
  function saveNote(id,note){setTasks(x=>x.map(v=>v.id===id?{...v,note}:v));setNoteTask(null);}
  function addDl(){if(!dlTitle.trim()||!dlDate)return;setDeadlines(d=>[...d,{id:uid(),title:dlTitle.trim(),date:dlDate,desc:dlDesc.trim(),colorIdx:deadlines.length%DLC.length}]);setDlTitle("");setDlDate(tk());setDlDesc("");}
  function removeDl(id){const ns={...store};Object.keys(ns).filter(k=>k!=="_deadlines"&&/^\d{4}-\d{2}-\d{2}$/.test(k)).forEach(k=>{ns[k]=(ns[k]||[]).map(x=>x.deadlineId===id?{...x,deadlineId:null}:x);});ns._deadlines=(ns._deadlines||[]).filter(x=>x.id!==id);persist(ns);}

  function getSlot(e){if(!calRef.current)return CAL_OFF;const rect=calRef.current.getBoundingClientRect();return Math.max(CAL_OFF,Math.min(CAL_OFF+Math.floor((e.clientY-rect.top)/SLOT_H),TOT_SLOTS-1));}
  function onDragStart(e,task){
    dragInfo.current=task;e.dataTransfer.effectAllowed="move";
    const tc=getTaskColor(task,deadlines,DLC,theme);
    const el=document.createElement("div");
    el.style.cssText=`position:absolute;top:-999px;padding:5px 10px;background:${tc.bg};border:1px solid ${tc.border};border-radius:8px;font-size:12px;color:${tc.text};white-space:nowrap;`;
    el.textContent=task.text;document.body.appendChild(el);
    e.dataTransfer.setDragImage(el,0,0);
    setTimeout(()=>document.body.removeChild(el),0);
  }
  const onDragOver=useCallback(e=>{e.preventDefault();if(!dragInfo.current)return;setGhost({slot:getSlot(e),dur:dragInfo.current.dur,priority:dragInfo.current.priority,type:dragInfo.current.type,deadlineId:dragInfo.current.deadlineId});},[]);
  const onDrop=useCallback(e=>{e.preventDefault();if(!dragInfo.current)return;const slot=getSlot(e),id=dragInfo.current.id;setTasks(x=>x.map(v=>v.id===id?{...v,slot}:v));setGhost(null);dragInfo.current=null;},[key,store]);
  const onDragLeave=useCallback(e=>{if(!calRef.current?.contains(e.relatedTarget))setGhost(null);},[]);
  const onDragEnd2=useCallback(()=>{setGhost(null);dragInfo.current=null;},[]);
  function onResize(e,task){e.preventDefault();e.stopPropagation();const sy=e.clientY,sd2=task.dur;function mv(ev){const dy=ev.clientY-sy,nd=Math.max(1,sd2+Math.round(dy/SLOT_H));setTasks(x=>x.map(v=>v.id===task.id?{...v,dur:nd}:v));}function up(){document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);}document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);}

  const si={P,t,theme,DLC,deadlines,toggleDone,removeTask,unschedule,startEdit,saveEdit,cancelEdit,editId,editText,setEditText,editPri,setEditPri,editDur,setEditDur,editDlId,setEditDlId,editMv,setEditMv,editColorId,setEditColorId,onDragStart,onDragEnd:onDragEnd2,onNote:(task)=>setNoteTask(task)};
  const tmFmt=timerSt?`${String(Math.floor(timerSt.remaining/60)).padStart(2,"0")}:${String(timerSt.remaining%60).padStart(2,"0")}`:null;

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:t.bg,minHeight:"700px",fontSize:14,color:t.tP,position:"relative"}}>
      <style>{`.trow:hover .ta{opacity:1!important}.ta{opacity:0;transition:opacity .15s}.cpill:hover{opacity:.9}input[type=checkbox]{width:13px;height:13px;accent-color:${t.acc};cursor:pointer;flex-shrink:0;margin:0}::-webkit-scrollbar{display:none}button:active{transform:scale(.97)}input[type=date]{color-scheme:${theme==="dark"?"dark":"light"}}.rh{cursor:ns-resize;height:7px;position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;z-index:10}.cpill:hover .rh{opacity:1}`}</style>

      {noteTask&&<NoteModal task={noteTask} t={t} onSave={(note)=>saveNote(noteTask.id,note)} onClose={()=>setNoteTask(null)}/>}
      {showDone&&<DoneToast t={t} onClose={()=>setShowDone(false)}/>}

      <div style={{background:t.hBg,borderBottom:`0.5px solid ${t.hBorder}`,padding:"0 20px",display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"center",height:48}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>setTheme(theme==="dark"?"forest":"dark")} title={theme==="dark"?"Light mode":"Dark mode"}
            style={{width:30,height:30,borderRadius:"50%",border:`0.5px solid ${t.hBorder}`,background:"rgba(128,128,128,0.1)",color:t.hText,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {theme==="dark"?<svg width={14} height={14} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={3.5} fill={t.hText}/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={t.hText} strokeWidth={1.2} strokeLinecap="round"/></svg>:<svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" fill={t.hText}/></svg>}
          </button>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowTP(v=>!v)}
              style={{height:30,borderRadius:timerSt?14:15,border:`0.5px solid ${timerSt?t.acc:t.hBorder}`,background:timerSt?"rgba(93,202,165,0.12)":"rgba(128,128,128,0.1)",color:t.hText,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:tmFmt?"0 9px":"0",width:tmFmt?"auto":30,fontSize:11,fontFamily:tmFmt?"monospace":"inherit",fontWeight:tmFmt?500:400,flexShrink:0}}>
              {tmFmt?<span>{timerSt.state==="paused"?"⏸ ":""}{tmFmt}</span>:<svg width={14} height={14} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6} stroke={t.hText} strokeWidth={1.2}/><path d="M8 5v3.5l2 1.5" stroke={t.hText} strokeWidth={1.2} strokeLinecap="round"/></svg>}
            </button>
            {showTP&&<TimerPopup t={t} ts={timerSt} onConfirm={handleTimer} onClose={()=>setShowTP(false)}/>}
          </div>
          <span style={{fontSize:12,fontWeight:500,color:t.hText}}>{fc(clock)}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
          <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:14,lineHeight:1}}>‹</button>
          <span style={{fontSize:12,color:t.hText,minWidth:190,textAlign:"center"}}>{fd(date)}</span>
          <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d);}} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:14,lineHeight:1}}>›</button>
          <button onClick={()=>setDate(new Date(today.getFullYear(),today.getMonth(),today.getDate()))} style={{background:"none",border:`0.5px solid ${t.hBorder}`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:t.hText,fontSize:11}}>Today</button>
        </div>
      </div>

      <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"25% minmax(0,1fr) minmax(0,1fr)",gap:14,alignItems:"start",boxSizing:"border-box"}}>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:500,color:t.tP,marginBottom:2}}>{greet()}</div>
                <div style={{fontSize:12,color:t.tS}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div>
              </div>
              <div style={{display:"flex",border:`0.5px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0,marginLeft:8}}>
                {["week","month"].map(v=>(
                  <button key={v} onClick={()=>setCv(v)} style={{padding:"4px 9px",fontSize:11,cursor:"pointer",background:cv===v?t.acc:"transparent",color:cv===v?t.aBtnTx:t.tS,border:"none",fontWeight:cv===v?500:400}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
                ))}
              </div>
            </div>
            {cv==="week"?<WeekStrip date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>:<MonthCal date={date} setDate={setDate} store={store} deadlines={deadlines} t={t}/>}
          </div>

          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px"}}>
            <SL text="Overview" t={t}/>
            <OverviewPie tasks={tasks} t={t}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
              {[{l:"Total",v:total},{l:"Done",v:done},{l:"Remaining",v:total-done},{l:"Scheduled",v:sched.length}].map(s=>(
                <div key={s.l} style={{background:t.sBg,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:20,fontWeight:500,color:t.tP}}>{s.v}</div>
                  <div style={{fontSize:11,color:t.tT,marginTop:1}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px"}}>
            <SL text="Deadlines" t={t}/>
            {!deadlines.length&&<div style={{fontSize:12,color:t.tT,marginBottom:10}}>No deadlines yet.</div>}
            {[...deadlines].sort((a,b)=>a.date.localeCompare(b.date)).map(dl=>(
              <DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} isExp={expDl===dl.id} onToggle={()=>setExpDl(expDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} showRemove={true}/>
            ))}
            <div style={{borderTop:`0.5px solid ${t.hr}`,paddingTop:12,marginTop:4}}>
              <div style={{fontSize:10,color:t.tT,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Add deadline</div>
              {[{v:dlTitle,f:setDlTitle,p:"Deadline title"},{v:dlDesc,f:setDlDesc,p:"Description (optional)"}].map((inp,i)=>(
                <input key={i} value={inp.v} onChange={e=>inp.f(e.target.value)} placeholder={inp.p} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:6,boxSizing:"border-box",outline:"none"}}/>
              ))}
              <input type="date" value={dlDate} onChange={e=>setDlDate(e.target.value)} style={{width:"100%",fontSize:12,borderRadius:7,border:`0.5px solid ${t.border}`,padding:"6px 9px",background:t.sBg,color:t.tP,marginBottom:8,boxSizing:"border-box",outline:"none"}}/>
              <button onClick={addDl} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:8,padding:"7px 0",cursor:"pointer",color:t.aBtnTx,fontSize:12,fontWeight:500}}>Add deadline</button>
            </div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px"}}>
            <SL text="Add task" t={t}/>
            <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="What needs to be done?" style={{width:"100%",fontSize:13,borderRadius:8,boxSizing:"border-box",border:`0.5px solid ${t.border}`,padding:"8px 11px",background:t.sBg,color:t.tP,outline:"none",marginBottom:10}}/>
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[{id:null,bg:t.sBg,border:t.border,dot:t.tT},...TASK_COLORS].map(c=>{
                const active=newColorId===c.id;
                return(
                  <button key={String(c.id)} onClick={()=>setNewColorId(c.id===newColorId&&c.id!==null?null:c.id)}
                    style={{flex:1,height:28,borderRadius:20,background:c.bg,border:active?`2.5px solid ${c.id===null?t.tP:c.border}`:`1px solid ${c.id===null?t.border:c.border}`,cursor:"pointer",padding:0,outline:"none",boxShadow:active?`0 0 0 1.5px ${c.id===null?t.tP:c.border}`:"none"}}/>
                );
              })}
            </div>
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[["High","high"],["Medium","medium"],["Low","low"]].map(([lbl,val])=>(
                <button key={val} onClick={()=>setNewPri(val)} style={{flex:1,fontSize:12,padding:"6px 0",borderRadius:20,border:`1px solid ${newPri===val?P[val].border:t.border}`,background:newPri===val?P[val].bg:"transparent",color:newPri===val?P[val].text:t.tS,cursor:"pointer",fontWeight:newPri===val?500:400}}>
                  <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:P[val].dot,marginRight:5,verticalAlign:"middle"}}/>{lbl}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:t.tT,marginBottom:4}}>Duration</div>
                <select value={newDur} onChange={e=>setNewDur(Number(e.target.value))} style={{width:"100%",fontSize:12,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 8px",background:t.sBg,color:t.tS}}>{[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}</select>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:t.tT,marginBottom:4}}>Link to deadline</div>
                <select value={newDlId||""} onChange={e=>setNewDlId(e.target.value||null)} style={{width:"100%",fontSize:12,borderRadius:8,border:`0.5px solid ${t.border}`,padding:"7px 8px",background:t.sBg,color:t.tS}}><option value="">None</option>{deadlines.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select>
              </div>
            </div>
            <button onClick={addTask} style={{width:"100%",background:t.aBtn,border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",color:t.aBtnTx,fontSize:13,fontWeight:500}}>Add task</button>
          </div>

          {todDl.length>0&&(
            <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px"}}>
              <SL text="Due today" t={t}/>
              {todDl.map(dl=>(
                <DeadlineItem key={dl.id} dl={dl} c={DLC[dl.colorIdx%DLC.length]} allT={allTFDl(dl.id)} t={t} P={P} isExp={expTodDl===dl.id} onToggle={()=>setExpTodDl(expTodDl===dl.id?null:dl.id)} onRemove={()=>removeDl(dl.id)} showRemove={false}/>
              ))}
            </div>
          )}

          <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px"}}>
            <SL text={`Unscheduled${unsch.length>0?" · "+unsch.length:""}`} t={t}/>
            {tasks.length===0&&<div style={{fontSize:12,color:t.tT,padding:"6px 0"}}>Add a task above to get started.</div>}
            {unsch.length===0&&tasks.length>0&&<div style={{fontSize:12,color:t.tT,padding:"6px 0"}}>All tasks scheduled!</div>}
            {unsch.map(task=><TaskItem key={task.id} task={task} isScheduled={false} {...si}/>)}
            {sched.length>0&&(
              <div>
                <div style={{height:"0.5px",background:t.hr,margin:"12px 0"}}/>
                <SL text={`Scheduled · ${sched.length}`} t={t}/>
                {sched.map(task=><TaskItem key={task.id} task={task} isScheduled={true} {...si}/>)}
              </div>
            )}
          </div>
        </div>

        <div style={{background:t.cBg,border:`0.5px solid ${t.border}`,borderRadius:14,padding:"16px 18px"}}>
          <SL text="Day schedule — drag tasks here" t={t}/>
          <div ref={calRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave}
            style={{position:"relative",userSelect:"none",background:t.calBg,height:CAL_H,borderRadius:12,border:`0.5px solid ${t.border}`,overflow:"hidden"}}>
            {CAL_HOURS.map((h,hi)=>(
              <div key={h} style={{position:"absolute",top:hi*HOUR_H,left:0,right:0,height:HOUR_H,display:"flex",borderBottom:hi<CAL_HOURS.length-1?`0.5px solid ${t.hr}`:"none"}}>
                <div style={{width:CL,flexShrink:0,paddingTop:4,paddingRight:7,fontSize:10,color:t.tT,textAlign:"right",boxSizing:"border-box"}}>{String(h).padStart(2,"0")}:00</div>
                <div style={{flex:1,position:"relative",borderLeft:`0.5px solid ${t.hr}`}}>
                  {[1,2,3].map(q=><div key={q} style={{position:"absolute",top:q*SLOT_H,left:0,right:0,borderTop:`0.5px dashed ${t.dash}`,opacity:0.7}}/>)}
                </div>
              </div>
            ))}
            {ny>=0&&ny<=CAL_H&&(
              <div style={{position:"absolute",left:0,right:0,top:ny,zIndex:20,pointerEvents:"none",display:"flex",alignItems:"center"}}>
                <div style={{width:CL,flexShrink:0,display:"flex",justifyContent:"flex-end",paddingRight:0}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:t.nowL,marginRight:-5,zIndex:21}}/>
                </div>
                <div style={{flex:1,height:2,background:t.nowL,opacity:0.85}}/>
              </div>
            )}
            {todDl.map((dl,i)=>{const c=DLC[dl.colorIdx%DLC.length];return <div key={dl.id} style={{position:"absolute",right:4,top:4+i*22,background:c.bg,border:`1px solid ${c.border}`,borderRadius:6,padding:"2px 8px",fontSize:10,color:c.text,fontWeight:500,pointerEvents:"none",zIndex:5}}>{dl.title} — due today</div>;})}
            {ghost&&ghost.slot>=CAL_OFF&&ghost.slot<CAL_OFF+CAL_SLOTS&&(()=>{
              const gc=getTaskColor({type:ghost.type,deadlineId:ghost.deadlineId},deadlines,DLC,theme);
              return <div style={{position:"absolute",left:CL,right:0,top:(ghost.slot-CAL_OFF)*SLOT_H,height:ghost.dur*SLOT_H,background:gc.bg,border:`1.5px dashed ${gc.border}`,borderRadius:8,opacity:0.8,pointerEvents:"none",boxSizing:"border-box"}}/>;
            })()}
            <div style={{position:"absolute",left:CL,right:0,top:0,bottom:0,overflow:"hidden"}}>
              {sched.map(task=>{
                const topSlot=task.slot-CAL_OFF;
                if(topSlot<0||topSlot>=CAL_SLOTS)return null;
                const top=topSlot*SLOT_H,height=Math.max(task.dur*SLOT_H,SLOT_H);
                const tc=getTaskColor(task,deadlines,DLC,theme),pc=P[task.priority];
                const lay=cLayout[task.id]||{col:0,total:1};
                const colPct=100/lay.total,leftPct=lay.col*colPct;
                const dl=deadlines.find(d=>d.id===task.deadlineId),dlC=dl?DLC[dl.colorIdx%DLC.length]:null;
                const hN=!!(task.note&&task.note.trim());
                return(
                  <div key={task.id} className="cpill trow" draggable onDragStart={e=>onDragStart(e,task)} onDragEnd={onDragEnd2}
                    style={                    {position:"absolute",left:`${leftPct}%`,width:`calc(${colPct}% - 4px)`,top,height,background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:9,padding:"0 6px",boxSizing:"border-box",cursor:"grab",overflow:"hidden",display:"flex",alignItems:"center",gap:3}}>
                    <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{width:10,height:10,flexShrink:0,accentColor:pc.dot}}/>
                    <span style={{fontSize:11,fontWeight:500,color:task.done?tc.border:tc.text,textDecoration:task.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,minWidth:0,lineHeight:1.2}}>{task.text}</span>
                    <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                      <PriorityTag priority={task.priority} P={P}/>
                      <span style={{fontSize:9,color:tc.dot,whiteSpace:"nowrap"}}>{s2t(task.slot)}·{task.dur*15}m</span>
                      {hN&&<span style={{display:"inline-flex",alignItems:"center",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setNoteTask(task);}}><NpIcon has color={tc.text} size={9}/></span>}
                      {dl&&dlC&&<span style={{padding:"1px 4px",borderRadius:5,background:dlC.bg,color:dlC.text,border:`0.5px solid ${dlC.border}`,fontSize:9,whiteSpace:"nowrap"}}>{dl.title}</span>}
                      <button onClick={e=>{e.stopPropagation();unschedule(task.id);}} style={{background:"none",border:"none",cursor:"pointer",color:tc.dot,fontSize:10,padding:0,lineHeight:1}}>↩</button>
                    </div>
                    <div className="rh" onMouseDown={e=>onResize(e,task)}>
                      <div style={{width:20,height:2.5,borderRadius:2,background:t.rBar,opacity:0.7}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
