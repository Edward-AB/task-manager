function b64url(str){return str.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}

async function makeToken(payload,secret){
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const header=b64url(btoa(JSON.stringify({alg:'HS256',typ:'JWT'})));
  const body=b64url(btoa(JSON.stringify({...payload,exp:Math.floor(Date.now()/1000)+30*24*60*60})));
  const sig=await crypto.subtle.sign('HMAC',key,enc.encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(btoa(String.fromCharCode(...new Uint8Array(sig))))}`;
}

export async function onRequestPost({request,env}){
  const {email,password,username}=await request.json();
  if(!email||!password)return Response.json({error:'Missing fields'},{status:400});
  if(!username||!username.trim())return Response.json({error:'Username is required'},{status:400});
  const uname=username.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  if(uname.length<2||uname.length>24)return Response.json({error:'Username must be 2–24 characters (letters, numbers, _)'},{status:400});
  const enc=new TextEncoder();
  const hashBuf=await crypto.subtle.digest('SHA-256',enc.encode(password+env.SALT));
  const hash=b64url(btoa(String.fromCharCode(...new Uint8Array(hashBuf))));
  const id=crypto.randomUUID();
  try{
    await env.DB.prepare('INSERT INTO users (id,email,password_hash,username,created_at) VALUES (?,?,?,?,?)')
      .bind(id,email.toLowerCase(),hash,uname,Date.now()).run();
  }catch(e){
    const msg=String(e).toLowerCase();
    if(msg.includes('username'))return Response.json({error:'Username already taken'},{status:409});
    return Response.json({error:'Email already in use'},{status:409});
  }
  const token=await makeToken({userId:id,username:uname},env.JWT_SECRET);
  return Response.json({token});
}
