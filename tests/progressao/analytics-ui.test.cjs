const assert=require('node:assert/strict');
const {createApp}=require('./harness.cjs');
const cases=require('./cases.cjs');
const input=cases.find(c=>c.name.startsWith('Elizangela')).input;
let checks=0;
function check(value,why){assert.ok(value,why);checks++;}
async function main(){
 const app=createApp(),events=[],$=app.$;app.root.faroMeasure=e=>events.push(e);
 await $('fa-start').emit('click');
 check(events.join(',')==='form_start','Start is a real start action');
 await $('fa-example').emit('click');await $('fa-example-old').emit('click');
 check(!events.includes('result_view'),'Fictitious examples are excluded from real diagnostic completions');
 app.fill({...input,entry:'31/02/2010'});app.run();
 check(!events.includes('result_view'),'Validation failure does not count a completed result');
 app.fill(input);app.run();
 check(events.includes('result_view'),'A completed real result counts');
 await $('fa-contact-next').emit('click');
 check(!events.includes('lead_saved'),'Missing send authorization never counts a lead');
 $('fa-send-consent').checked=true;app.root.faroLeadClient.submit=async()=>{throw Error('Teste de falha');};
 await $('fa-contact-next').emit('click');
 check(!events.includes('lead_saved'),'A click or failed network request never counts a lead');
 app.root.faroLeadClient.submit=async()=>({id:'00000000-0000-4000-8000-000000000001'});
 await $('fa-contact-next').emit('click');
 check(events.filter(e=>e==='lead_saved').length===1,'Only confirmed save counts a lead');
 await $('fa-contact-back').emit('click');await $('fa-contact-next').emit('click');
 check(events.filter(e=>e==='lead_saved').length===1,'Reopening WhatsApp screen does not create another lead event');
 check(events.every(e=>['form_start','result_view','lead_saved'].includes(e)),'UI emits only fixed stage keys, without career or contact data');
 console.log(checks+' true-completion tracking checks passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
