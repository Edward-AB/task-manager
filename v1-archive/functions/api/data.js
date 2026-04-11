function b64url(str){return str.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}
function fromb64url(str){return str.replace(/-/g,'+').replace(/_/g,'/');}

async function verifyToken(token,secret){
  const enc=new TextEncoder();
  const parts=token.split('.');
  if(parts.length!==3)return null;
  const [header,body,sig]=parts;
  const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const sigBytes=Uint8Array.from(atob(fromb64url(sig)),c=>c.charCodeAt(0));
  const valid=await crypto.subtle.verify('HMAC',key,sigBytes,enc.encode(`${header}.${body}`));
  if(!valid)return null;
  const payload=JSON.parse(atob(fromb64url(body)));
  if(payload.exp<Math.floor(Date.now()/1000))return null;
  return payload;
}

async function getUserId(request,secret){
  const auth=request.headers.get('Authorization')||'';
  const token=auth.replace('Bearer ','');
  if(!token)return null;
  try{const p=await verifyToken(token,secret);return p?.userId||null;}
  catch{return null;}
}

export async function onRequestGet({request,env}){
  const userId=await getUserId(request,env.JWT_SECRET);
  if(!userId)return new Response('Unauthorised',{status:401});
  try{
    const row=await env.DB.prepare('SELECT data FROM store WHERE user_id=?').bind(userId).first();
    const data=row?JSON.parse(row.data):{};
    if(typeof data!=='object'||Array.isArray(data))return Response.json({_deadlines:[],_projects:[]});
    if(!Array.isArray(data._deadlines))data._deadlines=[];
    if(!Array.isArray(data._projects))data._projects=[];
    return Response.json(data);
  }catch{return Response.json({_deadlines:[],_projects:[]});}
}

export async function onRequestPost({request,env}){
  const userId=await getUserId(request,env.JWT_SECRET);
  if(!userId)return new Response('Unauthorised',{status:401});
  const data=await request.json();
  await env.DB.prepare('INSERT OR REPLACE INTO store (user_id,data,updated_at) VALUES (?,?,?)')
    .bind(userId,JSON.stringify(data),Date.now()).run();
  return Response.json({ok:true});
}
