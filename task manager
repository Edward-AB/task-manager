import { useState, useRef, useCallback } from "react";

const SLOT_H = 16;
const SLOTS_PER_HOUR = 4;
const HOUR_H = SLOT_H * SLOTS_PER_HOUR;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const TOTAL_SLOTS = HOURS.length * SLOTS_PER_HOUR;
const STORAGE_KEY = "taskdash_v4";

const P = {
  high:   { bg:"#EAF3DE", border:"#97C459", text:"#27500A", dot:"#639922" },
  medium: { bg:"#E6F1FB", border:"#85B7EB", text:"#0C447C", dot:"#378ADD" },
  low:    { bg:"#EEEDFE", border:"#AFA9EC", text:"#3C3489", dot:"#7F77DD" },
};

function loadStore() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"); } catch { return {}; } }
function saveStore(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

function fmtDate(d) { return d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
function dKey(d) { return d.toISOString().slice(0,10); }
function slotToTime(s) {
  const h=Math.floor(s/SLOTS_PER_HOUR)+HOURS[0], m=(s%SLOTS_PER_HOUR)*15;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function greet() {
  const h=new Date().getHours();
  return h<12?"Good morning":h<17?"Good afternoon":"Good evening";
}
let _id=Date.now(); const uid=()=>String(++_id);

function PieDonut({ tasks }) {
  const done=tasks.filter(t=>t.done).length;
  const todo=tasks.filter(t=>!t.done);
  const segs=[
    {val:done, color:"#5DCAA5", label:"Done"},
    {val:todo.filter(t=>t.priority==="high").length,   color:"#639922", label:"High"},
    {val:todo.filter(t=>t.priority==="medium").length, color:"#378ADD", label:"Medium"},
    {val:todo.filter(t=>t.priority==="low").length,    color:"#7F77DD", label:"Low"},
  ].filter(s=>s.val>0);
  const total=tasks.length;
  if (!total) return <div style={{fontSize:12,color:"#B4B2A9",textAlign:"center",padding:"16px 0"}}>No tasks yet</div>;
  const R=44,cx=54,cy=54; let angle=-Math.PI/2;
  const paths=segs.map(s=>{
    const sweep=(s.val/total)*2*Math.PI;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    angle+=sweep;
    const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);
    return {...s,d:`M${cx},${cy} L${x1},${y1} A${R},${R},0,${sweep>Math.PI?1:0},1,${x2},${y2} Z`};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <svg width={108} height={108} viewBox="0 0 108 108" style={{flexShrink:0}}>
        {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} stroke="#EDEAE2" strokeWidth={1.5}/>)}
        <circle cx={cx} cy={cy} r={27} fill="#EDEAE2"/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={17} fontWeight="500" fill="#2C2C2A">{total}</text>
        <text x={cx} y={cx+9} textAnchor="middle" fontSize={10} fill="#888780">tasks</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
        {segs.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
            <span style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0,display:"inline-block"}}/>
            <span style={{color:"#5F5E5A",flex:1}}>{s.label}</span>
            <span style={{fontWeight:500,color:"#2C2C2A"}}>{s.val}</span>
          </div>
        ))}
        <div style={{marginTop:4,height:4,borderRadius:4,background:"#D3D1C7",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.round(done/total*100)}%`,background:"#5DCAA5",borderRadius:4,transition:"width 0.4s"}}/>
        </div>
        <div style={{fontSize:11,color:"#888780"}}>{Math.round(done/total*100)}% complete</div>
      </div>
    </div>
  );
}

function WeekStrip({ date, setDate, store }) {
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((dow===0?7:dow)-1));
  const days = Array.from({length:7},(_,i)=>{ const d=new Date(monday); d.setDate(monday.getDate()+i); return d; });
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button onClick={()=>{ const d=new Date(date); d.setDate(d.getDate()-7); setDate(d); }} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#888780",fontSize:12}}>‹</button>
        <span style={{fontSize:11,color:"#888780",fontWeight:500}}>
          {monday.toLocaleDateString("en-GB",{month:"short",day:"numeric"})} – {days[6].toLocaleDateString("en-GB",{month:"short",day:"numeric"})}
        </span>
        <button onClick={()=>{ const d=new Date(date); d.setDate(d.getDate()+7); setDate(d); }} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#888780",fontSize:12}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {days.map((d,i)=>{
          const k=dKey(d), isToday=dKey(d)===dKey(new Date()), isSel=dKey(d)===dKey(date);
          const cnt=(store[k]||[]).length;
          const doneCnt=(store[k]||[]).filter(t=>t.done).length;
          return (
            <button key={i} onClick={()=>setDate(new Date(d))} style={{padding:"6px 2px",borderRadius:9,border:isSel?"1.5px solid #639922":"0.5px solid #D3D1C7",background:isSel?"#EAF3DE":isToday?"#F5F3EE":"transparent",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:10,color:isSel?"#3B6D11":"#B4B2A9",marginBottom:2}}>{"MTWTFSS"[i]}</div>
              <div style={{fontSize:13,fontWeight:isSel?500:400,color:isSel?"#27500A":isToday?"#2C2C2A":"#5F5E5A"}}>{d.getDate()}</div>
              {cnt>0
                ? <div style={{width:6,height:6,borderRadius:"50%",background:doneCnt===cnt?"#5DCAA5":"#97C459",margin:"3px auto 0"}}/>
                : <div style={{width:6,height:6,margin:"3px auto 0"}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const today=new Date();
  const [store,setStore]=useState(()=>loadStore());
  const [date,setDate]=useState(today);
  const [newText,setNewText]=useState("");
  const [newPri,setNewPri]=useState("medium");
  const [newDur,setNewDur]=useState(2);
  const [editId,setEditId]=useState(null);
  const [editText,setEditText]=useState("");
  const [editPri,setEditPri]=useState("medium");
  const [editDur,setEditDur]=useState(2);
  const [ghost,setGhost]=useState(null);
  const calRef=useRef(null);
  const dragInfo=useRef(null);

  const key=dKey(date);
  function persist(ns){setStore(ns);saveStore(ns);}
  const tasks=store[key]||[];
  function setTasks(fn){
    const cur=store[key]||[];
    const next=typeof fn==="function"?fn(cur):fn;
    persist({...store,[key]:next});
  }

  const unscheduled=tasks.filter(t=>t.slot==null);
  const scheduled=tasks.filter(t=>t.slot!=null).sort((a,b)=>a.slot-b.slot);
  const done=tasks.filter(t=>t.done).length;
  const total=tasks.length;

  function addTask(){
    if(!newText.trim())return;
    setTasks(t=>[...t,{id:uid(),text:newText.trim(),priority:newPri,dur:newDur,slot:null,done:false}]);
    setNewText("");
  }
  function toggleDone(id){setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));}
  function removeTask(id){setTasks(t=>t.filter(x=>x.id!==id));}
  function unschedule(id){setTasks(t=>t.map(x=>x.id===id?{...x,slot:null}:x));}
  function startEdit(task){setEditId(task.id);setEditText(task.text);setEditPri(task.priority);setEditDur(task.dur);}
  function saveEdit(){
    setTasks(t=>t.map(x=>x.id===editId?{...x,text:editText.trim()||x.text,priority:editPri,dur:editDur}:x));
    setEditId(null);
  }

  function getSlot(y){
    const rect=calRef.current.getBoundingClientRect();
    return Math.max(0,Math.min(Math.floor((y-rect.top)/SLOT_H),TOTAL_SLOTS-1));
  }
  function onDragStart(e,task){
    dragInfo.current=task; e.dataTransfer.effectAllowed="move";
    const el=document.createElement("div");
    el.style.cssText=`position:absolute;top:-999px;padding:5px 10px;background:${P[task.priority].bg};border:1px solid ${P[task.priority].border};border-radius:8px;font-size:12px;color:${P[task.priority].text};white-space:nowrap;max-width:200px;overflow:hidden;`;
    el.textContent=task.text; document.body.appendChild(el);
    e.dataTransfer.setDragImage(el,0,0);
    setTimeout(()=>document.body.removeChild(el),0);
  }
  const onCalDragOver=useCallback(e=>{
    e.preventDefault();
    if(!dragInfo.current||!calRef.current)return;
    setGhost({slot:getSlot(e.clientY),dur:dragInfo.current.dur,priority:dragInfo.current.priority});
  },[]);
  const onCalDrop=useCallback(e=>{
    e.preventDefault();
    if(!dragInfo.current||!calRef.current)return;
    const slot=getSlot(e.clientY),id=dragInfo.current.id;
    setTasks(t=>t.map(x=>x.id===id?{...x,slot}:x));
    setGhost(null);dragInfo.current=null;
  },[key,store]);
  const onCalDragLeave=useCallback(e=>{if(!calRef.current?.contains(e.relatedTarget))setGhost(null);},[]);
  const onDragEnd=useCallback(()=>{setGhost(null);dragInfo.current=null;},[]);

  const sectionLabel = txt => (
    <div style={{fontSize:10,fontWeight:500,color:"#B4B2A9",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{txt}</div>
  );

  function TaskItem({ task, isScheduled }) {
    return (
      <div className="trow" draggable={!isScheduled} onDragStart={!isScheduled?e=>onDragStart(e,task):undefined} onDragEnd={onDragEnd}
        style={{display:"flex",alignItems:"flex-start",gap:8,borderLeft:`3px solid ${P[task.priority].dot}`,borderRadius:"0 10px 10px 0",background:isScheduled?"#F7F5F0":P[task.priority].bg+"44",padding:"8px 10px",marginBottom:6,cursor:isScheduled?"default":"grab",userSelect:"none",border:`0.5px solid ${isScheduled?"#D3D1C7":P[task.priority].border}`,borderLeftWidth:3}}>
        <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{marginTop:2}}/>
        <div style={{flex:1,minWidth:0}}>
          {editId===task.id ? (
            <div>
              <input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit()} autoFocus
                style={{width:"100%",fontSize:12,borderRadius:6,border:"0.5px solid #D3D1C7",padding:"4px 7px",marginBottom:5,boxSizing:"border-box",background:"#fff",color:"#2C2C2A"}}/>
              <div style={{display:"flex",gap:3,marginBottom:5}}>
                {["high","medium","low"].map(p=>(
                  <button key={p} onClick={()=>setEditPri(p)} style={{flex:1,fontSize:10,padding:"3px 0",borderRadius:20,border:`1px solid ${editPri===p?P[p].border:"#D3D1C7"}`,background:editPri===p?P[p].bg:"transparent",color:editPri===p?P[p].text:"#888",cursor:"pointer"}}>{p}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:10,color:"#888"}}>Duration</span>
                <select value={editDur} onChange={e=>setEditDur(Number(e.target.value))} style={{fontSize:11,flex:1,borderRadius:6,border:"0.5px solid #D3D1C7",padding:"3px",background:"#F7F5F0",color:"#2C2C2A"}}>
                  {[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:4}}>
                <button onClick={saveEdit} style={{flex:1,fontSize:11,padding:"4px 0",borderRadius:6,border:"none",background:"#27500A",color:"#EAF3DE",cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditId(null)} style={{flex:1,fontSize:11,padding:"4px 0",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888",cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{fontSize:13,color:task.done?"#B4B2A9":P[task.priority].text,textDecoration:task.done?"line-through":"none",lineHeight:1.35,wordBreak:"break-word"}}>{task.text}</div>
              <div style={{display:"flex",gap:5,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:P[task.priority].bg,color:P[task.priority].text,border:`0.5px solid ${P[task.priority].border}`}}>{task.priority}</span>
                <span style={{fontSize:10,color:"#B4B2A9"}}>{task.dur*15} min</span>
                {isScheduled&&<span style={{fontSize:10,color:"#B4B2A9"}}>{slotToTime(task.slot)}</span>}
              </div>
            </>
          )}
        </div>
        <div className="ta" style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
          {editId!==task.id&&<button onClick={e=>{e.stopPropagation();startEdit(task);}} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:5,padding:"2px 6px",fontSize:10,cursor:"pointer",color:"#5F5E5A"}}>Edit</button>}
          {isScheduled&&<button onClick={()=>unschedule(task.id)} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:5,padding:"2px 6px",fontSize:10,cursor:"pointer",color:"#888"}}>↩</button>}
          <button onClick={e=>{e.stopPropagation();removeTask(task.id);}} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:5,padding:"2px 6px",fontSize:10,cursor:"pointer",color:"#A32D2D"}}>×</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#EDEAE2",minHeight:"700px",fontSize:14,color:"#2C2C2A"}}>
      <style>{`
        .trow:hover .ta{opacity:1!important}
        .ta{opacity:0;transition:opacity .15s}
        .cpill:hover{opacity:.82}
        input[type=checkbox]{width:13px;height:13px;accent-color:#5DCAA5;cursor:pointer;flex-shrink:0;margin:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#C5C3BB;border-radius:4px}
        button:active{transform:scale(.97)}
      `}</style>

      <div style={{background:"#ffffff",borderBottom:"0.5px solid #D3D1C7",padding:"11px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,borderRadius:7,background:"#EAF3DE",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <rect x={1} y={3} width={14} height={11} rx={2} stroke="#639922" strokeWidth={1.3}/>
              <path d="M5 1v3M11 1v3M1 7h14" stroke="#639922" strokeWidth={1.3} strokeLinecap="round"/>
              <circle cx={5} cy={10} r={1} fill="#639922"/><circle cx={8} cy={10} r={1} fill="#639922"/><circle cx={11} cy={10} r={1} fill="#639922"/>
            </svg>
          </div>
          <span style={{fontSize:15,fontWeight:500,color:"#2C2C2A"}}>DayFlow</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d);}} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:7,padding:"4px 10px",cursor:"pointer",color:"#5F5E5A",fontSize:13}}>‹</button>
          <span style={{fontSize:13,color:"#5F5E5A",minWidth:220,textAlign:"center"}}>{fmtDate(date)}</span>
          <button onClick={()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d);}} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:7,padding:"4px 10px",cursor:"pointer",color:"#5F5E5A",fontSize:13}}>›</button>
          <button onClick={()=>setDate(new Date(today))} style={{background:"none",border:"0.5px solid #D3D1C7",borderRadius:7,padding:"4px 9px",cursor:"pointer",color:"#5F5E5A",fontSize:12,marginLeft:2}}>Today</button>
        </div>
        <div style={{width:120}}/>
      </div>

      <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"25% minmax(0,37.5%) minmax(0,37.5%)",gap:14,alignItems:"start",boxSizing:"border-box"}}>

        {/* COL 1 — week strip + overview */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fff",border:"0.5px solid #D3D1C7",borderRadius:14,padding:"16px 16px"}}>
            <div style={{fontSize:16,fontWeight:500,color:"#2C2C2A",marginBottom:2}}>{greet()}</div>
            <div style={{fontSize:12,color:"#888780",marginBottom:14}}>{total>0?`${done} of ${total} tasks done today`:"Nothing planned yet"}</div>
            <WeekStrip date={date} setDate={setDate} store={store}/>
          </div>

          <div style={{background:"#fff",border:"0.5px solid #D3D1C7",borderRadius:14,padding:"16px 16px"}}>
            {sectionLabel("Overview")}
            <PieDonut tasks={tasks}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
              {[{l:"Total",v:total},{l:"Done",v:done},{l:"Remaining",v:total-done},{l:"Scheduled",v:scheduled.length}].map(s=>(
                <div key={s.l} style={{background:"#F7F5F0",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:20,fontWeight:500,color:"#2C2C2A"}}>{s.v}</div>
                  <div style={{fontSize:11,color:"#888780",marginTop:1}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COL 2 — add task + task list */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fff",border:"0.5px solid #D3D1C7",borderRadius:14,padding:"16px 18px"}}>
            {sectionLabel("Add task")}
            <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}
              placeholder="What needs to be done?" autoFocus
              style={{width:"100%",fontSize:13,borderRadius:8,boxSizing:"border-box",border:"0.5px solid #D3D1C7",padding:"8px 11px",background:"#F7F5F0",color:"#2C2C2A",outline:"none",marginBottom:10}}/>
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {["high","medium","low"].map(p=>(
                <button key={p} onClick={()=>setNewPri(p)} style={{flex:1,fontSize:12,padding:"6px 0",borderRadius:20,border:`1px solid ${newPri===p?P[p].border:"#D3D1C7"}`,background:newPri===p?P[p].bg:"transparent",color:newPri===p?P[p].text:"#888780",cursor:"pointer",fontWeight:newPri===p?500:400,transition:"all .15s"}}>
                  <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:P[p].dot,marginRight:5,verticalAlign:"middle"}}/>
                  {p}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#B4B2A9",marginBottom:4}}>Duration</div>
                <select value={newDur} onChange={e=>setNewDur(Number(e.target.value))}
                  style={{width:"100%",fontSize:12,borderRadius:8,border:"0.5px solid #D3D1C7",padding:"7px 8px",background:"#F7F5F0",color:"#5F5E5A"}}>
                  {[1,2,3,4,6,8].map(s=><option key={s} value={s}>{s*15} min</option>)}
                </select>
              </div>
              <button onClick={addTask}
                style={{background:"#27500A",border:"none",borderRadius:8,padding:"0 22px",height:36,cursor:"pointer",color:"#EAF3DE",fontSize:13,fontWeight:500,alignSelf:"flex-end",whiteSpace:"nowrap"}}>
                Add task
              </button>
            </div>
          </div>

          <div style={{background:"#fff",border:"0.5px solid #D3D1C7",borderRadius:14,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              {sectionLabel(`Unscheduled${unscheduled.length>0?" · "+unscheduled.length:""}`)}
            </div>
            {tasks.length===0&&<div style={{fontSize:12,color:"#B4B2A9",padding:"6px 0"}}>Add a task above to get started.</div>}
            {unscheduled.length===0&&tasks.length>0&&<div style={{fontSize:12,color:"#B4B2A9",padding:"6px 0"}}>All tasks scheduled!</div>}
            {unscheduled.map(task=><TaskItem key={task.id} task={task} isScheduled={false}/>)}

            {scheduled.length>0&&(
              <>
                <div style={{height:"0.5px",background:"#E8E5DE",margin:"12px 0"}}/>
                {sectionLabel(`Scheduled · ${scheduled.length}`)}
                {scheduled.map(task=><TaskItem key={task.id} task={task} isScheduled={true}/>)}
              </>
            )}
          </div>
        </div>

        {/* COL 3 — calendar */}
        <div style={{background:"#fff",border:"0.5px solid #D3D1C7",borderRadius:14,padding:"16px 18px"}}>
          {sectionLabel("Day schedule — drag tasks here")}
          <div ref={calRef} onDragOver={onCalDragOver} onDrop={onCalDrop} onDragLeave={onCalDragLeave}
            style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",position:"relative",userSelect:"none",background:"#FAFAF8"}}>
            {HOURS.map((h,hi)=>(
              <div key={h} style={{display:"flex",borderBottom:hi<HOURS.length-1?"0.5px solid #EDEAE2":"none",height:HOUR_H}}>
                <div style={{width:44,flexShrink:0,paddingTop:4,paddingRight:7,fontSize:10,color:"#C5C3BB",textAlign:"right",boxSizing:"border-box"}}>{String(h).padStart(2,"0")}:00</div>
                <div style={{flex:1,position:"relative",borderLeft:"0.5px solid #EDEAE2"}}>
                  {[1,2,3].map(q=><div key={q} style={{position:"absolute",top:q*SLOT_H,left:0,right:0,borderTop:"0.5px dashed #EAE7E0",opacity:0.7}}/>)}
                </div>
              </div>
            ))}
            {ghost&&<div style={{position:"absolute",left:46,right:4,top:ghost.slot*SLOT_H,height:ghost.dur*SLOT_H,background:P[ghost.priority].bg,border:`1.5px dashed ${P[ghost.priority].border}`,borderRadius:8,opacity:0.8,pointerEvents:"none",boxSizing:"border-box"}}/>}
            {scheduled.map(task=>{
              const top=task.slot*SLOT_H,height=Math.max(task.dur*SLOT_H,SLOT_H),c=P[task.priority];
              return (
                <div key={task.id} className="cpill trow" draggable onDragStart={e=>onDragStart(e,task)} onDragEnd={onDragEnd}
                  style={{position:"absolute",left:46,right:4,top,height,background:c.bg,border:`1px solid ${c.border}`,borderRadius:9,padding:"3px 8px",boxSizing:"border-box",cursor:"grab",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <input type="checkbox" checked={task.done} onChange={()=>toggleDone(task.id)} onClick={e=>e.stopPropagation()} style={{width:11,height:11,flexShrink:0,accentColor:c.dot}}/>
                    <span style={{fontSize:11,fontWeight:500,color:task.done?c.border:c.text,textDecoration:task.done?"line-through":"none",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:height>SLOT_H*2?"normal":"nowrap",lineHeight:1.3}}>{task.text}</span>
                    <button className="ta" onClick={e=>{e.stopPropagation();unschedule(task.id);}} style={{background:"none",border:"none",cursor:"pointer",color:c.border,fontSize:12,padding:0,lineHeight:1,flexShrink:0}}>↩</button>
                  </div>
                  {height>=SLOT_H*2&&<div style={{fontSize:10,color:c.border,marginTop:1,paddingLeft:16}}>{slotToTime(task.slot)} · {task.dur*15} min</div>}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
