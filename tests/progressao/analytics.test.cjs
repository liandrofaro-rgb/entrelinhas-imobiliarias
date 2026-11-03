const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../../dist/consentimento.js'),'utf8');
let checks=0;
function check(condition,why){assert.ok(condition,why);checks++;}
function boot(choice=null,{professor=true,search='?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=progressao_professor'}={}){
 const data=new Map(),scripts=[],elements=[],listeners={},root={};
 if(choice)data.set('lf-consentimento',JSON.stringify({v:2,...choice}));
 function element(tag){return {tag,attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;},remove(){this.removed=true;}};}
 const document={readyState:'complete',cookie:'',getElementById:()=>professor?root:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn,createElement:element,head:{appendChild:e=>scripts.push(e)},body:{appendChild:e=>elements.push(e)}};
 const window={},location={search,hostname:'liandrofaro.adv.br',reload(){this.reloaded=true;}};
 vm.runInNewContext(source,{document,window,location,URLSearchParams,Date,JSON,Object,localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}});
 const commands=provider=>Array.from(window[provider]?.queue||window[provider]?.q||window.dataLayer||[],c=>Array.from(c));
 return {root,window,scripts,commands,accept(){const banner=elements.findLast(e=>!e.removed);banner.listeners.click({target:{closest:()=>({getAttribute:()=> 'aceitar'})}});},choice(c){data.set('lf-consentimento',JSON.stringify({v:2,...c}));},events(provider){return commands(provider).filter(c=>['event','track','trackCustom'].includes(c[0]));}};
}
let app=boot();
app.root.faroMeasure('form_start');app.root.faroMeasure('form_start');
check(app.scripts.every(s=>s.tag!=='script'),'No external provider loads before consent');
check(!app.window.fbq&&!app.window.gtag&&!app.window.clarity,'No provider is invoked before consent');
app.accept();
check(app.events('fbq').filter(c=>c[1]==='PageView').length===1,'Existing page view is initialized once');
check(app.events('fbq').filter(c=>c[1]==='ProfessorPageView').length===1,'Teacher page can be counted separately');
check(app.events('fbq').filter(c=>c[1]==='ProfessorFormStart').length===1,'Late consent flushes one start, without double clicks');
check(app.events('gtag').some(c=>c[1]==='professor_page_view'),'GA4 receives a page-specific event');
app.root.faroMeasure('result_view');app.root.faroMeasure('result_view');app.root.faroMeasure('lead_saved');app.root.faroMeasure('lead_saved');
check(app.events('fbq').filter(c=>c[1]==='ProfessorResultView').length===1,'Reopening a result does not inflate the visit funnel');
check(app.events('fbq').filter(c=>c[0]==='track'&&c[1]==='Lead').length===1,'One saved-data conversion per page visit');
check(app.events('gtag').filter(c=>c[1]==='generate_lead').length===1,'GA4 receives the confirmed lead');
check(app.events('clarity').some(c=>c[1]==='professor_lead_saved'),'Clarity can segment successful submissions');
const count=app.events('fbq').length;
app.root.faroMeasure('__proto__');app.root.faroMeasure('diagnostico_4_porcento');
check(app.events('fbq').length===count,'Arbitrary event names cannot transmit form values');
const parameters=app.events('fbq').filter(c=>c[2]).map(c=>c[2]);
check(parameters.every(p=>JSON.stringify(Object.keys(p).sort())===JSON.stringify(['content_name','form_name','origem'])),'Only fixed nonpersonal parameters are transmitted');
check(parameters.every(p=>p.origem==='whatsapp'),'Tagged WhatsApp source is retained');
app=boot({medicao:true,anuncios:false});app.root.faroMeasure('result_view');
check(!app.window.fbq&&app.events('gtag').length===2,'Measurement permission does not enable the advertising pixel');
app=boot({medicao:false,anuncios:true});app.root.faroMeasure('result_view');
check(!!app.window.fbq&&!app.window.gtag&&!app.window.clarity,'Advertising permission does not enable measurement providers');
app=boot({medicao:false,anuncios:false});app.root.faroMeasure('lead_saved');
check(app.scripts.every(s=>s.tag!=='script'),'Refusal keeps all external tracking disabled');
app=boot({medicao:true,anuncios:true});app.choice({medicao:false,anuncios:false});app.root.faroMeasure('result_view');
check(!app.events('fbq').some(c=>c[1]==='ProfessorResultView')&&!app.events('gtag').some(c=>c[1]==='professor_result_view'),'Latest refusal is respected even while provider stubs exist');
app=boot({medicao:true,anuncios:true},{professor:false});
check(!app.root.faroMeasure&&!app.events('fbq').some(c=>c[0]==='trackCustom'),'Other website pages get no teacher funnel events');
app=boot({medicao:true,anuncios:true},{search:'?utm_source=docente%40example.invalid'});
check(app.events('fbq').filter(c=>c[2]).every(c=>c[2].origem==='outro'),'Unrecognized source is not copied into event parameters');
console.log(checks+' consent, deduplication and measurement-boundary checks passed.');
