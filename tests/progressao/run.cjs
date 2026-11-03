const fs=require('node:fs'),path=require('node:path');const cases=require('./cases.cjs'),{createApp}=require('./harness.cjs');
const crypto=require('node:crypto');
const expectationsHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'cases.cjs'))).digest('hex');
const label=process.argv[2]||'after',rows=[];let assertions=0;
function text(el){if(el.hidden)return '';return el._text+el.children.map(text).join('');}
function different(a,b){return JSON.stringify(a)!==JSON.stringify(b);}
for(const item of cases){
 const app=createApp(),v={...item.input,name:'Docente fictício '+item.id},r=app.engine.analyze(v),t=app.regimes.analyze(v,r);app.fill(v);app.run();const result=app.$('fa-result-heading').closest('[data-fa-step]'),blocked=result.hidden,invalid=app.root.querySelector('[aria-invalid]');
 const actual={blocked,errorField:invalid?.id||null,error:app.$('fa-error').hidden?'':app.$('fa-error').textContent,old:Array.from(t.oldCounts),later:Array.from(t.newCounts),paidOld:t.oldPaid,levels:Array.from(r.levels),classes:Array.from(r.classes),horizontal:app.$('fa-horizontal').textContent,vertical:app.$('fa-vertical').textContent,verticalReason:app.$('fa-vertical-percent').textContent,oldNote:app.$('fa-old-note').textContent,pccrHidden:app.$('fa-pccr-result').hidden,visible:blocked?'':text(result)};
 const fail=[],expect=item.expect;
 function check(good,description){assertions++;if(!good)fail.push(description);}
 if(expect.block){check(blocked,'Formulário deveria bloquear a conclusão');check(actual.errorField===expect.block,'Campo esperado '+expect.block+'; obtido '+actual.errorField);}
 else{
  check(!blocked,'Conclusão bloqueada indevidamente: '+actual.error);
  for(const key of ['old','later','levels','classes','paidOld'])if(key in expect)check(!different(actual[key],expect[key]),key+': esperado '+JSON.stringify(expect[key])+'; obtido '+JSON.stringify(actual[key]));
  if(expect.horizontal)check(actual.horizontal===expect.horizontal,'Horizontal esperado '+expect.horizontal+'; obtido '+actual.horizontal);
  if(expect.vertical)check(actual.vertical===expect.vertical,'Vertical esperado '+expect.vertical+'; obtido '+actual.vertical);
  if(expect.conditional)check(actual.vertical.startsWith('Possível '),'Titulação deveria permanecer condicional; obtido '+actual.vertical);
  if(expect.verticalReason)check(actual.verticalReason.toLowerCase().includes(expect.verticalReason.toLowerCase()),'Falta motivo vertical: '+expect.verticalReason+'; obtido '+actual.verticalReason);
  if(expect.oldWarning)check(/supera|superior|diverg/i.test(actual.oldNote),'Referência antiga superior deveria ser explicada');
  if(expect.hidePccr||expect.noProjection)check(actual.pccrHidden,'Tabela PCCR deveria ficar sem projeção');
  if(expect.visible)check(actual.visible.includes(expect.visible),'Resultado visível não contém '+expect.visible);
  check(!/R\$|BRL/.test(actual.visible),'Não deveria exibir valores monetários');
  check(!r.amounts.length,'Não deveria produzir cobrança de atrasados nesta interface');
 }
 rows.push({...item,actual,pass:!fail.length,failures:fail});
}
const summary={label,date:'2026-11-03',source:'PR32-working-tree',expectationsHash,total:rows.length,old:rows.filter(r=>r.group==='antes').length,new:rows.filter(r=>r.group==='depois').length,passed:rows.filter(r=>r.pass).length,failed:rows.filter(r=>!r.pass).length,assertions};
fs.writeFileSync(path.resolve(__dirname,'./last-run.json'),JSON.stringify({summary,cases:rows},null,2));
fs.writeFileSync(path.resolve(__dirname,'./last-run-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));for(const r of rows.filter(r=>!r.pass))console.log(r.id+' '+r.name+'\n  '+r.failures.join('\n  '));
if(summary.failed)process.exitCode=1;
