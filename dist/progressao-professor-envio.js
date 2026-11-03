(function(){
 'use strict';
 const root=document.getElementById('faro-progressao-mobile');
 async function fetchJSON(url,options){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(url,{...options,credentials:'same-origin',cache:'no-store',signal:controller.signal});let data;try{data=await response.json();}catch{throw Error('O envio não foi confirmado. Tente novamente.');}if(!response.ok){const error=Error(data.error||'Não foi possível enviar. Tente novamente.');error.status=response.status;throw error;}return data;}
  catch(error){if(error.name==='AbortError'||error instanceof TypeError)throw Error('Não foi possível confirmar o envio. Confira sua conexão e tente novamente.');throw error;}
  finally{clearTimeout(timer);}
 }
 root.faroLeadClient={async submit(payload,state){
  for(let attempt=0;attempt<2;attempt++){
   if(!state.token){const session=await fetchJSON('/progressao-professor/api/form-token'+(state.requestId?'?request='+encodeURIComponent(state.requestId):''),{});state.token=session.token;state.requestId=session.requestId;}
   try{const result=await fetchJSON('/progressao-professor/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId:state.requestId,token:state.token})});if(result.saved!==true||!result.receipt?.id)throw Error('O envio não foi confirmado. Tente novamente.');return result.receipt;}
   catch(error){if(error.status===403&&attempt===0){state.token=null;continue;}throw error;}
  }
 }};
})();
