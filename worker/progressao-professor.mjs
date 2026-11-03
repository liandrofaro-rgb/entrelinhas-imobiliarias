// Only the public intake endpoints are relayed. Administrative routes are never proxied.
const BACKEND='https://faro-progressao-professor-para.liandrofaro.chatgpt.site';
const PREFIX='/progressao-professor/api/';
const PRIVATE_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
function error(message,status){return new Response(JSON.stringify({error:message}),{status,headers:PRIVATE_HEADERS});}
async function bodyText(request){
 const reader=request.body?.getReader();if(!reader)return '';
 const decoder=new TextDecoder();let text='',size=0;
 for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>24000){await reader.cancel();return null;}text+=decoder.decode(chunk.value,{stream:true});}
 return text+decoder.decode();
}
export function createHandler(upstreamFetch=fetch){return async function handler(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith(PREFIX))return env.ASSETS.fetch(request);
 const endpoint=path.slice(PREFIX.length);
 if(!['form-token','leads'].includes(endpoint))return error('Rota não encontrada.',404);
 const required=endpoint==='form-token'?'GET':'POST';if(request.method!==required)return error('Método não permitido.',405);
 const origin=request.headers.get('origin'),fetchSite=request.headers.get('sec-fetch-site');
 if((request.method==='POST'&&origin!==url.origin)||(origin&&origin!==url.origin)||['cross-site','same-site'].includes(fetchSite))return error('Acesso não permitido.',403);
 const target=new URL('/api/'+endpoint,BACKEND);
 if(endpoint==='form-token'&&url.searchParams.has('request')){
  const id=url.searchParams.get('request');if(!/^[a-f0-9-]{36}$/i.test(id))return error('Identificador de envio inválido.',400);target.searchParams.set('request',id);
 }
 const headers=new Headers();
 const formCookie=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-faro-form='));
 if(formCookie)headers.set('Cookie',formCookie);
 let body;
 if(request.method==='POST'){
  if(!request.headers.get('content-type')?.startsWith('application/json'))return error('Formato não permitido.',415);
  if(Number(request.headers.get('content-length')||0)>24000)return error('Envio muito grande.',413);
  body=await bodyText(request);if(body===null)return error('Envio muito grande.',413);
  headers.set('Content-Type','application/json');
  // Same-origin checks were performed above; the upstream uses its own origin.
  headers.set('Origin',target.origin);
 }
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),13000);
 try{
  const result=await upstreamFetch(target.toString(),{method:request.method,headers,body,redirect:'manual',signal:controller.signal});
  if(result.status>=300&&result.status<400)return error('O envio está indisponível agora. Seus dados não foram confirmados.',503);
  if(!result.headers.get('content-type')?.startsWith('application/json'))return error('Não foi possível confirmar o envio. Tente novamente.',503);
  const replyHeaders=new Headers(PRIVATE_HEADERS);
  const cookies=typeof result.headers.getSetCookie==='function'?result.headers.getSetCookie():[result.headers.get('set-cookie')].filter(Boolean);
  for(const value of cookies)if(value.startsWith('__Host-faro-form=')&&!/;\s*Domain=/i.test(value))replyHeaders.append('Set-Cookie',value);
  return new Response(result.body,{status:result.status,headers:replyHeaders});
 }catch{return error('Não foi possível confirmar o envio. Confira sua conexão e tente novamente.',503);}
 finally{clearTimeout(timer);}
};}
export default {fetch:createHandler()};
