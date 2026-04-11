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
  const {email,password}=await request.json();
  const enc=new TextEncoder();
  const hashBuf=await crypto.subtle.digest('SHA-256',enc.encode(password+env.SALT));
  const hash=b64url(btoa(String.fromCharCode(...new Uint8Array(hashBuf))));
  const user=await env.DB.prepare('SELECT id,username FROM users WHERE email=? AND password_hash=?')
    .bind(email.toLowerCase(),hash).first();
  if(!user)return Response.json({error:'Invalid email or password'},{status:401});
  const token=await makeToken({userId:user.id,username:user.username||null},env.JWT_SECRET);
  return Response.json({token});
}
