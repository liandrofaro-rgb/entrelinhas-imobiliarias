// Interface da triagem de progressão do professor estadual do Pará.
// Transcrita da versão criada no ChatGPT Sites; o rastreamento do clique
// no WhatsApp fica por conta de consentimento.js (atributo data-wa no link).
(function(){
'use strict';
const root=document.getElementById('faro-progressao-mobile'),E=root.faroEngine,G=root.faroRegimes,$=id=>root.querySelector('#'+id),screens=Array.from(root.querySelectorAll('[data-fa-step]'));let step=-1,lastResult=null;
const error=$('fa-error'),progress=root.querySelector('.fa-progress'),isBenefit=s=>['retired','pensioner'].includes(s),hasTitle=t=>['specialist','master','doctor'].includes(t);
const labels=['Identificação','Ingresso','Regime anterior','PCCR','Formação','Conferência'];
function period(){return $('fa-period-old').checked?'legacy':$('fa-period-new').checked?'pccr':'';}
function path(){return ['temporary','other'].includes($('fa-status').value)?[0,1,6]:period()==='legacy'?[0,1,2,3,4,5,6]:[0,1,3,4,5,6];}
function dateInput(value){const s=String(value||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s.slice(8)+'/'+s.slice(5,7)+'/'+s.slice(0,4);return /^\d{8}$/.test(s)?s.slice(0,2)+'/'+s.slice(2,4)+'/'+s.slice(4):/^\d{6}$/.test(s)?s.slice(0,2)+'/'+s.slice(2):s;}
const dateFields=['fa-entry','fa-career-end','fa-death','fa-historical-date','fa-anchor-date'];
function formatDateTyping(el){
const raw=el.value,iso=/^\d{4}-\d{2}-\d{2}$/.test(raw),precision=el.id==='fa-entry'?$('fa-entry-precision').value:'day';
const normalized=iso?dateInput(raw):raw;
const max=precision==='year'?4:precision==='month'?6:8;
const digits=normalized.replace(/\D/g,'').slice(0,max);
let formatted=precision==='year'?digits:precision==='month'?digits.slice(0,2)+(digits.length>2?'/'+digits.slice(2):''):digits.slice(0,2)+(digits.length>2?'/'+digits.slice(2,4):'')+(digits.length>4?'/'+digits.slice(4):'');
if(formatted===raw)return;
const caret=Number.isInteger(el.selectionStart)?el.selectionStart:raw.length;
const before=raw.slice(0,caret).replace(/\D/g,'').length;
let nextCaret=formatted.length;
if(!iso&&before<digits.length){let seen=0;nextCaret=0;while(nextCaret<formatted.length&&seen<before){if(/\d/.test(formatted[nextCaret]))seen++;nextCaret++;}}
el.value=formatted;
if(typeof el.setSelectionRange==='function')el.setSelectionRange(nextCaret,nextCaret);
}
function syncDatePrecision(convert=false){
const el=$('fa-entry'),precision=$('fa-entry-precision').value,raw=dateInput(el.value),parsed=E.parseDate(raw);
if(convert&&raw){
if(precision==='year')el.value=parsed?raw.slice(-4):'';
else if(precision==='month')el.value=parsed&&parsed.precision!=='year'?raw.slice(-7):'';
else el.value=parsed?.precision==='day'?raw:'';
}
el.setAttribute('maxlength',precision==='year'?'4':precision==='month'?'7':'10');
el.setAttribute('placeholder',precision==='year'?'AAAA':precision==='month'?'MM/AAAA':'DD/MM/AAAA');
$('fa-entry-help').textContent=precision==='year'?'Informe os quatro dígitos do ano. A data incompleta pode gerar cenários alternativos.':precision==='month'?'Digite mês e ano, só com números. A barra aparece automaticamente.':'Digite só os números da data de início do exercício. As barras aparecem automaticamente.';
}
function clearError(){error.hidden=true;error.textContent='';root.querySelectorAll('.fa-field-error').forEach(e=>e.remove());root.querySelectorAll('[aria-invalid]').forEach(e=>{e.removeAttribute('aria-invalid');const ids=(e.getAttribute('aria-describedby')||'').split(' ').filter(x=>x&&x!==e.id+'-error');if(ids.length)e.setAttribute('aria-describedby',ids.join(' '));else e.removeAttribute('aria-describedby');});}
function focusHeading(section){const h=section.querySelector('h1,h2');if(!h)return;h.setAttribute('tabindex','-1');h.focus({preventScroll:true});h.scrollIntoView({block:'start',behavior:'auto'});}
function show(n,focus=true){clearError();step=n;const route=path(),index=route.indexOf(n),total=route.length-1;$('fa-cover').hidden=true;progress.hidden=n>=6;screens.forEach((s,i)=>s.hidden=i!==n);root.querySelectorAll('.fa-progress span').forEach((s,i)=>{s.hidden=i>=total;s.classList.toggle('fa-active',i<=index);});$('fa-step-status').textContent=n===7?'Contato com o advogado':n===6?'Resultado da simulação':'Etapa '+(index+1)+' de '+total+': '+labels[n];if(n<6){const over=screens[n].querySelector('.fa-overline');if(over)over.textContent=labels[n].toLocaleUpperCase('pt-BR')+' · '+(index+1)+' DE '+total;}if(focus)focusHeading(screens[n]);}
function showCover(focus=true){clearError();step=-1;screens.forEach(s=>s.hidden=true);progress.hidden=true;$('fa-cover').hidden=false;$('fa-step-status').textContent='';if(focus)focusHeading($('fa-cover'));}
function fail(id,message){const el=id?$(id):null;if(el){const section=el.closest('[data-fa-step]');if(section&&Number(section.getAttribute('data-fa-step'))!==step)show(Number(section.getAttribute('data-fa-step')),false);const details=el.closest('details');if(details)details.open=true;}clearError();if(el){const note=document.createElement('div');note.id=el.id+'-error';note.className='fa-field-error';note.textContent=message;el.insertAdjacentElement('afterend',note);el.setAttribute('aria-invalid','true');const ids=(el.getAttribute('aria-describedby')||'').split(' ').filter(Boolean);el.setAttribute('aria-describedby',[...ids,note.id].join(' '));el.focus({preventScroll:true});el.scrollIntoView({block:'center',behavior:'auto'});error.textContent='Revise o campo destacado: '+message;}else{error.textContent=message;}error.hidden=false;if(!el)error.focus();return false;}
function values(){const old=period()==='legacy',other=$('fa-class').value==='other'||$('fa-ref').value==='other';return {name:$('fa-name').value.trim(),phone:$('fa-phone').value.trim(),email:$('fa-email').value.trim(),status:$('fa-status').value,period:period(),entry:dateInput($('fa-entry').value),paidClass:$('fa-class').value==='other'?'':$('fa-class').value,ref:$('fa-ref').value==='other'?'':$('fa-ref').value,positionOther:other,title:$('fa-title').value||'unknown',titleYear:$('fa-title-year').value.trim(),titleValid:$('fa-title-valid').value,base:'',monthlyHours:'',hours:'',month:$('fa-month').value,continuous:$('fa-continuous').checked,anchorDate:dateInput($('fa-anchor-date').value),anchorLevel:$('fa-anchor-level').value,oldPaidRef:old?$('fa-old-paid-ref').value:'',oldContinuous:old&&$('fa-old-continuous').checked,historicalDate:old?dateInput($('fa-historical-date').value):'',historicalRef:old?$('fa-anchor-old-ref').value:'',careerEnd:dateInput($('fa-career-end').value),death:dateInput($('fa-death').value),origin:$('fa-origin').value,benefitRule:$('fa-benefit-rule').value};}
function syncHistory(){const d=E.parseDate(dateInput($('fa-entry').value)),route=d?E.regime(d):period();$('fa-entry-era').hidden=!route;$('fa-entry-era-title').textContent=route==='legacy'?'Vamos analisar os dois regimes':route==='pccr'?'Vamos analisar o PCCR':'Complete a data de ingresso';$('fa-entry-era-help').textContent=route==='legacy'?'Primeiro: referências e percentuais anteriores a 2010. Depois: níveis e classes do PCCR.':route==='pccr'?'Seu percurso começa na Lei nº 7.442/2010.':'Dia e mês são necessários para distinguir os regimes em 2010.';}
function syncFields(){
const s=$('fa-status').value,benefit=isBenefit(s),pension=s==='pensioner',name=$('fa-name').value.trim().split(/\s+/)[0].slice(0,25);
$('fa-career-heading').textContent=name?name+', conte sobre sua carreira.':'Conte sobre sua carreira.';
$('fa-benefit-fields').hidden=!benefit;$('fa-pension-fields').hidden=!pension;$('fa-retirement-field').hidden=pension&&$('fa-origin').value!=='retired';$('fa-benefit-rule-field').hidden=pension;
root.querySelector('label[for="fa-entry"]').textContent=pension?'Quando o professor começou como efetivo?':benefit?'Quando você começou como efetivo? (se souber)':'Quando você começou como efetivo?';$('fa-entry').setAttribute('aria-required',s==='effective'?'true':'false');
root.querySelector('label[for="fa-class"]').textContent=pension?'Classe do professor':'Classe atual';
['fa-class','fa-ref'].forEach(id=>$(id).setAttribute('aria-required',s==='effective'?'true':'false'));
$('fa-position-help').textContent=benefit?'Use a posição que aparece na folha ou no ato do benefício. Se o documento usar outro código, selecione “Outra identificação”.':'Escolha o que consta hoje no contracheque. Ex.: “Professor Classe II / 02C” → Classe II e nível C. Se houver outro código, selecione “Outra identificação”.';
syncHistory();
$('fa-title-heading').textContent=pension?'Formação do professor':'Qual a sua formação?';root.querySelector('label[for="fa-title"]').textContent=pension?'Maior pós-graduação concluída pelo professor:':'Sua maior pós-graduação concluída:';
const title=$('fa-title').value;$('fa-title-fields').hidden=!hasTitle(title);$('fa-title-year').setAttribute('aria-required',hasTitle(title)?'true':'false');
$('fa-title-help').textContent=title==='specialist'?'Confira a licenciatura, a área da pós e a carga mínima de 360 horas. Se tiver dúvida, escolha “Preciso conferir”.':'Confira a licenciatura e a área da pós no diploma. Se tiver dúvida, escolha “Preciso conferir”.';
$('fa-pay-heading').textContent='Última conferência.';
const help=$('fa-status-help');help.hidden=!['temporary','other','pensioner','retired'].includes(s);help.textContent=s==='temporary'?'O contrato temporário exige análise própria. Você verá essa orientação ao continuar.':s==='other'?'Vamos indicar quais informações precisam ser conferidas.':pension?'Use os dados do professor que originou a pensão. A projeção da carreira não determina o reajuste da pensão.':'A análise considera a carreira até a aposentadoria.';
}
function validate(n){const v=values(),payDate=E.monthEnd(v.month),entry=E.parseDate(v.entry);
if(n===0){if(v.name.length<2)return fail('fa-name','Informe seu nome para personalizar o resultado.');const digits=v.phone.replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');if(!/^\d{10,11}$/.test(digits))return fail('fa-phone','Informe seu telefone com DDD: 10 ou 11 dígitos.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))return fail('fa-email','Informe um e-mail válido, como nome@email.com.');}
if(n===1){
if(!v.status)return fail('fa-status','Selecione sua situação.');if(['temporary','other'].includes(v.status))return true;
if((v.status==='effective'||v.entry)&&!v.period)return fail('fa-period-old','Marque se começou antes ou a partir de 02/07/2010.');
if((v.status==='effective'||v.entry)&&!entry)return fail('fa-entry','Informe o início do exercício efetivo. Não inclua contrato temporário.');
if(entry&&(entry.min<Date.UTC(1900,0,1)||entry.min>E.MAX))return fail('fa-entry','Confira o início da carreira, até outubro de 2026.');
if(entry&&E.regime(entry)==='ambiguous')return fail('fa-entry','Em 2010, informe dia e mês para separar os dois regimes.');
if(entry&&v.period&&E.regime(entry)!==v.period)return fail('fa-entry','A data não corresponde à opção marcada. Confira a data ou altere a opção de período.');
if(isBenefit(v.status)){
const ids=v.status==='pensioner'?(v.origin==='retired'?['fa-career-end','fa-death']:['fa-death']):['fa-career-end'];
for(const id of ids){const t=dateInput($(id).value),d=E.parseDate(t);if(t&&(!d||d.precision!=='day'))return fail(id,'Informe a data completa ou deixe em branco.');if(d&&(d.min>E.MAX||(payDate!==null&&d.min>payDate)))return fail(id,'A data deve ser anterior ou igual ao mês consultado.');}
const end=E.parseDate(v.status==='pensioner'&&v.origin==='active'?v.death:v.careerEnd),death=E.parseDate(v.death);
if(entry&&end&&entry.min>end.min)return fail('fa-entry','O ingresso deve ser anterior ao encerramento da atividade.');
if(v.status==='pensioner'&&v.origin==='retired'&&end&&death&&end.min>death.min)return fail('fa-career-end','A aposentadoria não pode começar depois do falecimento.');
}
}
if(n===2&&v.period==='legacy'){
if(v.oldPaidRef&&!G.ROMAN.includes(v.oldPaidRef))return fail('fa-old-paid-ref','Escolha a referência antiga na lista.');
if(v.historicalDate&&isBenefit(v.status)){const d=E.parseDate(v.historicalDate),end=E.parseDate(v.status==='retired'||v.origin==='retired'?v.careerEnd:v.origin==='active'?v.death:'');if(d&&end&&d.min>(v.status==='pensioner'&&v.origin==='active'?end.min:end.min-86400000))return fail('fa-historical-date','Os efeitos informados são posteriores ao encerramento da atividade. Confira a data; efeitos após esse marco exigem análise própria.');}
if(v.historicalDate||v.historicalRef){const d=E.parseDate(v.historicalDate);if(!d||d.precision!=='day'||d.min>=Date.UTC(2010,6,2)||(entry&&d.min<entry.min)||(payDate!==null&&d.min>payDate))return fail('fa-historical-date','Use a data do ato antigo, entre o ingresso e 01/07/2010, até a folha consultada.');if(!G.ROMAN.includes(v.historicalRef))return fail('fa-anchor-old-ref','Escolha a referência que consta nesse ato antigo.');}
}
if(n===3){
if(v.status==='effective'&&!$('fa-class').value)return fail('fa-class','Escolha a classe no contracheque ou “Outra identificação”.');
if(v.status==='effective'&&!$('fa-ref').value)return fail('fa-ref','Escolha o nível no contracheque ou “Outra identificação”.');
if(v.ref&&!/^[A-L]$/.test(v.ref))return fail('fa-ref','Selecione o nível na lista.');
if(v.anchorDate||v.anchorLevel){const d=E.parseDate(v.anchorDate);if(!d||d.precision!=='day'||d.min<Date.UTC(2010,6,2)||(entry&&d.min<entry.min)||(payDate!==null&&d.min>payDate))return fail('fa-anchor-date','Use a data de um ato do PCCR, desde 02/07/2010, entre o ingresso e a folha.');if(E.level(v.anchorLevel)===null)return fail('fa-anchor-level','Escolha o nível reconhecido no ato do PCCR.');}
}
if(n===4){if(!$('fa-title').value)return fail('fa-title','Selecione sua formação. Se não souber, escolha “Não sei informar”.');if(hasTitle(v.title)&&(!/^\d{4}$/.test(v.titleYear)||+v.titleYear<1900||+v.titleYear>2026))return fail('fa-title-year','Informe o ano de conclusão com quatro dígitos, até 2026.');}
if(n===5){if(payDate===null||payDate>E.MAX)return fail('fa-month','Escolha um mês até outubro de 2026.');if(entry&&entry.min>payDate)return fail('fa-entry','O ingresso não pode ser posterior à folha.');}
return true;
}
function classLabel(c){return c===0?'Classe Especial':'Classe '+['','I','II','III','IV'][c];}
// Percentual normativo da posição, não conferência da folha efetivamente paga.
// Lei 7.442/2010, art. 25 §2: passos horizontais ADITIVOS sobre o nível A.
function horizontalPercent(n){return (n*0.5).toLocaleString('pt-BR',{maximumFractionDigits:1})+'% sobre o nível A';}
function verticalPercent(c){return c===1?'Base inicial da carreira':c>=2&&c<=4?'+1,5% sobre a base da '+classLabel(c-1):'';}
function render(r,v){
const trajectory=G.analyze(v,r);renderHistory(trajectory,v);$('fa-application-box').hidden=false;
const inactiveMissing=isBenefit(v.status)&&!r.route,priorOnly=trajectory.applies&&r.route&&r.asOf<Date.UTC(2010,6,2);
$('fa-pccr-result').hidden=priorOnly||inactiveMissing;$('fa-no-pccr-note').hidden=!priorOnly&&!inactiveMissing;$('fa-no-pccr-note').textContent=priorOnly?'A atividade terminou antes do PCCR. Não foram criados novos interstícios após esse encerramento.':'Informe o encerramento da atividade para separar os períodos da carreira.';
if(priorOnly||inactiveMissing)$('fa-two-regime-note').hidden=true;
$('fa-current-regime-title').textContent=trajectory.applies?'2. A partir de 02/07/2010':'Sua posição na carreira';
const benefit=isBenefit(v.status),supported=v.status==='effective'||benefit,legacy=r.route==='legacy',ambiguous=r.route==='ambiguous';
const currentLevel=E.level(v.ref),currentClass=v.paidClass===''?null:Number(v.paidClass);
const horizontalKnown=!v.positionOther&&supported&&r.route&&!ambiguous&&(!legacy||v.anchorDate)&&v.continuous&&!r.horizontalPending&&!r.levelConflict&&r.levels.length===1&&!(currentLevel!==null&&r.levels[0]<currentLevel);
const horizontalAlternatives=!v.positionOther&&supported&&r.route&&!ambiguous&&(!legacy||v.anchorDate)&&v.continuous&&!r.horizontalPending&&!r.levelConflict&&r.levels.length>1&&r.levels.every(n=>currentLevel===null||n>=currentLevel);
const positionAhead=currentLevel!==null&&r.levels.some(n=>n<currentLevel);
const verticalConditional=!v.positionOther&&supported&&r.route&&!ambiguous&&r.classes.length>1&&v.title!=='unknown'&&currentClass!==null&&currentClass!==0;
const verticalKnown=!v.positionOther&&supported&&r.route&&!ambiguous&&r.classes.length===1&&v.title!=='unknown'&&currentClass!==null&&currentClass!==0;
$('fa-example-note').hidden=true;$('fa-review').textContent='Revisar meus dados';$('fa-result-name').textContent=v.name.split(/\s+/)[0].slice(0,25)+',';$('fa-result-heading').textContent='veja sua comparação.';
$('fa-horizontal-current').textContent=currentLevel===null?(v.positionOther?'Outro código':'Não informado'):'Nível '+E.LEVELS[currentLevel];
$('fa-vertical-current').textContent=currentClass===null?(v.positionOther?'Outro código':'Não informada'):classLabel(currentClass);
$('fa-horizontal-current-percent').textContent=!v.positionOther&&supported&&r.route&&!ambiguous&&!legacy&&currentLevel!==null?(currentLevel===0?'Nível inicial da classe':horizontalPercent(currentLevel)):'';
$('fa-vertical-current-percent').textContent=!v.positionOther&&supported&&r.route&&!ambiguous&&!legacy&&currentClass!==null?verticalPercent(currentClass):'';
$('fa-horizontal').textContent=!supported?'Análise do vínculo':horizontalKnown?'Nível '+E.LEVELS[r.levels[0]]:horizontalAlternatives?'Nível '+r.levels.map(n=>E.LEVELS[n]).join(' ou '):v.positionOther?'Análise do documento':ambiguous?'Complete o ingresso':legacy&&!v.anchorDate?'Nível a confirmar':r.levelConflict||positionAhead?'Confira o marco':'A conferir';
$('fa-horizontal-percent').textContent=horizontalKnown?horizontalPercent(r.levels[0]):horizontalAlternatives?r.levels.map(n=>(n*0.5).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%').join(' ou ')+' sobre o nível A':positionAhead?'O nível informado supera o cenário calculado.':legacy&&!v.anchorDate?'Falta o ato de enquadramento no PCCR.':!v.continuous&&supported?'Condições de tempo não confirmadas.':'';
$('fa-vertical').textContent=!supported?'Análise do vínculo':currentClass===0?'Análise específica':v.title==='unknown'?'Formação a conferir':verticalKnown?classLabel(r.classes[0]):verticalConditional?'Possível '+classLabel(Math.max(...r.classes)):'A conferir';
$('fa-vertical-percent').textContent=r.verticalReason==='probation'?'Probatório ou dispensa individual a confirmar.':r.verticalReason==='future'?'Título posterior ao período analisado; não aplicado.':r.verticalReason==='academic'&&v.titleValid==='no'?'Título não aplicado aos requisitos declarados.':verticalConditional?(r.verticalReason==='conditions'?'Confirme as condições do probatório e da progressão.':v.titleValid!=='yes'?'Confirme os requisitos do título.':'Confirme a data do título e seus efeitos.'):verticalKnown?verticalPercent(r.classes[0]):'';
$('fa-qualifier').textContent=trajectory.applies?'Trajetória por regime · projeção preliminar.':!supported?'Este vínculo exige análise específica.':benefit?'Projeção da carreira na atividade, até seu encerramento.':legacy||ambiguous?'O enquadramento anterior precisa ser conferido.':'Percentuais da posição informada e do cenário projetado.';
const rules=[];
if(trajectory.oldCounts.length)rules.push('Regime antigo: 3,5% da base inicial antiga por avanço.');
if(trajectory.newCounts.length&&!horizontalKnown)rules.push('Novos avanços: 0,5% por interstício, no cenário temporal indicado.');
if(horizontalKnown||horizontalAlternatives)rules.push('Horizontal: cada avanço acrescenta 0,5% da base do nível A da respectiva classe.');
if(verticalKnown&&r.classes[0]>currentClass)rules.push('Vertical: 1,5% entre classes sucessivas, mantendo o mesmo nível.');
if(!rules.length)rules.push('Confira os dados pendentes para identificar a regra aplicável.');
$('fa-application').textContent=rules.join('\n');
let note='Simulação preliminar. Percentuais sobre a base; não sobre o total do contracheque.';
if(benefit)note='A projeção da carreira não define o reajuste da aposentadoria ou pensão. Confira o ato do benefício.';
else if(v.status==='temporary')note='A progressão do efetivo não se aplica automaticamente ao contrato temporário.';
else if(v.status==='other')note='Confirme seu vínculo com a rede estadual.';
else if(v.positionOther)note='O código do seu documento exige identificação antes de projetar classe e nível.';
else if(v.historicalDate)note='Ato de '+v.historicalDate.slice(-4)+' informado: referência '+v.historicalRef+'. Para projetar o nível atual, falta conferir o enquadramento no PCCR.';
else if(legacy&&!v.anchorDate)note='A classe e o nível de hoje não substituem o ato de entrada no PCCR. Procure esse ato na sua ficha funcional.';
else if(ambiguous)note='Complete dia e mês do ingresso para identificar o plano aplicável.';
else if(horizontalAlternatives)note=E.parseDate(v.entry)?.precision!=='day'?'A data incompleta gera níveis alternativos. Informe dia e mês do ingresso.':'O caso está no limite de um interstício. Confira o marco e o critério de contagem.';
else if(positionAhead)note='O nível informado supera o cenário pelo tempo. Confira o ato de progressão; nenhuma redução foi projetada.';
else if(horizontalKnown&&v.anchorDate)note='Cenário desde o ato informado de '+v.anchorDate+', nível '+v.anchorLevel+'.';
else if(horizontalKnown&&r.route==='pccr'&&!v.anchorDate)note='Cenário desde '+v.entry+'. Confirme o exercício efetivo e eventuais atos de progressão.';
else if(!horizontalKnown)note=!v.continuous?'As condições de tempo do PCCR não foram confirmadas.':'Falta definir o marco de progressão no histórico funcional.';
const context={supported,benefit,legacy,currentClass,currentLevel,horizontalKnown,horizontalAlternatives,verticalKnown,verticalConditional,positionAhead};
renderGain(r,v,context);
note=renderConclusion(r,v,context,trajectory,note);
$('fa-result-note').textContent=note;lastResult={values:{...v},sample:false,state:{},receipt:null};$('fa-send-consent').checked=false;$('fa-send-authorization').hidden=false;$('fa-contact-next').textContent='Enviar para análise do meu caso →';
}
// Art. 25: horizontais aditivas sobre A da classe; bases entre classes sucessivas.
// Esta é a relação normativa das posições, sem usar grades ou presumir pagamento.
function positionFactor(c,n){return Math.pow(1.015,c-1)*(1+n*0.005);}
function precisePercent(n){return (Math.abs(n)<1e-9?0:n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';}
function percentRange(a){const low=Math.min(...a),high=Math.max(...a);return precisePercent(low)+(Math.abs(high-low)>1e-9?' a '+precisePercent(high):'');}
function renderGain(r,v,k){
$('fa-gain').hidden=!k.supported;$('fa-retro').hidden=!k.supported;$('fa-gain-breakdown').hidden=true;
$('fa-gain-numbers').hidden=true;$('fa-gain-pending').hidden=false;
['fa-gain-value','fa-gain-current','fa-gain-target','fa-gain-description'].forEach(id=>$(id).textContent='');
$('fa-gain-title').textContent='O que isso pode representar';
if(!k.supported){$('fa-gain-pending').textContent='';$('fa-gain-note').textContent='';return;}
const comparable=!k.benefit&&!v.positionOther&&k.currentClass>=1&&k.currentClass<=4&&k.currentLevel!==null&&(k.horizontalKnown||k.horizontalAlternatives)&&(k.verticalKnown||k.verticalConditional)&&!k.positionAhead&&r.classes.every(c=>c>=k.currentClass&&c<=4);
if(!comparable){
$('fa-gain').hidden=true;
$('fa-gain-pending').textContent=k.benefit?'O efeito no benefício precisa ser analisado.':k.legacy&&!v.anchorDate?'Falta conferir o enquadramento no PCCR.':'Faltam dados para calcular a diferença.';
$('fa-gain-note').textContent=k.benefit?'Classe e nível da carreira não determinam, sozinhos, o reajuste da aposentadoria ou pensão.':k.positionAhead?'A posição informada supera um cenário projetado. Nenhuma redução foi presumida.':'Confira as pendências da tabela. Um percentual desconhecido não é tratado como zero.';
return;
}
const current=positionFactor(k.currentClass,k.currentLevel),targets=[];
for(const c of r.classes)for(const n of r.levels)targets.push(positionFactor(c,n));
const differences=targets.map(x=>(x/current-1)*100),positive=Math.max(...differences)>1e-9;
$('fa-gain-numbers').hidden=false;$('fa-gain-pending').hidden=true;$('fa-gain-breakdown').hidden=false;
$('fa-gain-current').textContent=precisePercent((current-1)*100);
$('fa-gain-target').textContent=percentRange(targets.map(x=>(x-1)*100));
$('fa-gain-value').textContent=percentRange(differences);
$('fa-gain-description').textContent=positive?'a mais no vencimento-base, neste cenário':'de diferença entre as posições neste cenário';
if(!positive){$('fa-gain').hidden=true;if(!k.legacy)$('fa-retro').hidden=true;}
const conditional=k.verticalConditional||k.horizontalAlternatives;
$('fa-gain-note').textContent=(conditional?'Cenários condicionais: confirme as pendências da tabela. ':'')+'Sobre o salário-base, não sobre o total do contracheque. Confira a implantação na folha.'+(k.legacy?' Somente PCCR; percentuais antigos não foram somados.':'');
}
function renderConclusion(r,v,k,t,note){
let heading='Há pontos da sua progressão para conferir.',intro='Compare a posição que você informou com o cenário indicado abaixo.',nextTitle='O que falta conferir';
const hHigher=k.horizontalKnown&&k.currentLevel!==null&&r.levels[0]>k.currentLevel;
const vHigher=k.verticalKnown&&r.classes[0]>k.currentClass;
const same=k.horizontalKnown&&k.verticalKnown&&r.levels[0]===k.currentLevel&&r.classes[0]===k.currentClass;
$('fa-pccr-result').hidden=$('fa-pccr-result').hidden||!k.supported;
if(!k.supported){
 heading='Vamos conferir seu vínculo.';
 intro=v.status==='temporary'?'O contrato temporário precisa de análise própria. As progressões do cargo efetivo não se aplicam automaticamente.':'Precisamos identificar seu vínculo antes de analisar a progressão.';
 note='Envie o caso para conferir o contrato ou ato de vínculo com a rede estadual.';
}else if(k.benefit){
 heading=r.route?'Veja a projeção da carreira.':'Precisamos do histórico da carreira.';
 intro=r.route?'A contagem considera o período de atividade. O efeito na aposentadoria ou pensão precisa de análise própria.':'Ainda não foi possível definir até quando contar o tempo de atividade.';
 note=!r.route?'Precisamos da data de aposentadoria. Na pensão, informe também se o professor faleceu em atividade ou já aposentado.':'Precisamos do ato de aposentadoria ou pensão para conferir a regra do benefício. A projeção da carreira não confirma, sozinha, um reajuste.';
}else if(v.positionOther){
 heading='Precisamos identificar sua posição.';
 intro='O código do documento não permitiu identificar a classe e o nível para a comparação.';
 note='Precisamos conferir o campo “Cargo” e a “Referência” no contracheque ou na ficha funcional.';
}else if(r.route==='ambiguous'){
 heading='Complete sua data de ingresso.';
 intro='O dia e o mês definem se a análise começa no regime anterior ou no PCCR de 2010.';
}else if(t.applies&&!v.anchorDate){
 heading=t.oldCounts.some(n=>n>0)||t.newCounts.some(n=>n>0)?'Encontramos avanços para conferir.':'Seu caso tem dois períodos de análise.';
 intro='Veja primeiro o período até 2010 e depois os avanços no novo plano.';
 note='Para concluir o nível atual, precisamos do ato de enquadramento no PCCR, disponível na ficha funcional.'+(t.oldPaid===null?' As folhas da época também ajudam a conferir se os avanços antigos já foram pagos.':'');
}else if(hHigher||vHigher){
 heading='Há possíveis progressões a revisar.';
 intro=hHigher&&vHigher?'A projeção indica avanço por tempo de serviço e pela formação.':hHigher?'A projeção indica avanço por tempo de serviço.':'A projeção indica avanço pela formação.';
 if(!k.horizontalKnown||!k.verticalKnown)intro+=' Há outra parte da análise que ainda depende de confirmação.';
 nextTitle='Para confirmar a projeção';
 if(k.horizontalKnown&&k.verticalKnown)note='Precisamos conferir a ficha funcional, os atos de progressão e o contracheque.';
}else if(same&&t.applies){
 heading='No PCCR, as posições coincidem.';
 intro='A posição atual coincide com a projeção do novo plano. O período anterior a 2010 continua sendo analisado separadamente.';
 nextTitle='Conferir o período antigo';
 note='Precisamos das folhas e dos atos do período anterior a 2010 para conferir se os avanços antigos já foram implantados.';
}else if(same){
 heading='Não identificamos diferença neste cenário.';
 intro='A classe e o nível informados coincidem com a projeção. Isso não confirma os valores efetivamente pagos.';
 nextTitle='Conferência da folha';
 note='A análise documental pode conferir se a posição informada foi corretamente aplicada no contracheque.';
}else if(k.horizontalAlternatives||k.verticalConditional){
 heading='Sua projeção depende de uma confirmação.';
 intro='Veja o que já conseguimos identificar. As possibilidades indicadas dependem dos dados abaixo.';
}
if(k.supported&&!k.benefit&&!v.positionOther&&r.route!=='ambiguous'&&!(t.applies&&!v.anchorDate)&&!same){
 const missing=[];
 if(!v.continuous)missing.push('Confirme o estágio probatório, as avaliações e eventuais interrupções na ficha funcional.');
 if(v.title==='unknown')missing.push('Precisamos identificar sua maior formação concluída.');
 if(k.verticalConditional&&v.titleValid!=='yes')missing.push('Confira a licenciatura, a área do título e, na especialização, as 360 horas.');
 if(k.verticalConditional&&v.titleValid==='yes'&&v.continuous)missing.push('Precisamos da data completa de conclusão do título e dos seus efeitos.');
 if(k.positionAhead)missing.push('A posição informada supera um cenário pelo tempo. Confira o ato de progressão; não projetamos redução.');
 if(missing.length)note=missing.join(' ')+(k.horizontalAlternatives?' '+note:'');
}
if(k.supported&&!k.benefit&&k.horizontalKnown&&(v.anchorDate||v.entry))note+=v.anchorDate?' Contagem desde o ato de '+v.anchorDate+', nível '+v.anchorLevel+'.':' Contagem desde '+v.entry+'.';
$('fa-result-heading').textContent=heading;$('fa-qualifier').textContent=intro;$('fa-next-title').textContent=nextTitle;
return note;
}
function pct(value){return value.toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';}
function fmtDate(value){return new Date(value).toLocaleDateString('pt-BR',{timeZone:'UTC'});}
function renderHistory(t,v){
$('fa-legacy-result').hidden=!t.applies;$('fa-two-regime-note').hidden=!t.applies;$('fa-new-phase-result').hidden=!t.applies;
if(!t.applies)return;
$('fa-old-period').textContent=t.oldEnd!==undefined?'Período: '+(E.parseDate(v.entry).precision==='day'?fmtDate(t.oldStart):v.entry)+' até '+fmtDate(t.oldEnd):'Período de atividade anterior à mudança de 2010.';
$('fa-old-current').textContent=t.oldPaid===null?'Não informado':'Referência '+G.ROMAN[t.oldPaid];
$('fa-old-current-percent').textContent=t.oldPaid===null?'Precisamos da folha da época.':pct(t.oldPaid*3.5)+' · conforme referência declarada';
$('fa-old-target').textContent=t.oldCounts.length?'Referência '+t.oldCounts.map(n=>G.ROMAN[n]).join(' ou '):'Histórico a conferir';
$('fa-old-target-percent').textContent=t.oldCounts.length?t.oldCounts.map(n=>pct(n*3.5)).join(' a ')+' sobre a base inicial antiga':'';
$('fa-old-summary').textContent=t.oldCounts.length?t.oldCounts.join(' ou ')+' avanço'+(t.oldCounts.length===1&&t.oldCounts[0]===1?'':'s')+' estimado'+(t.oldCounts.length===1&&t.oldCounts[0]===1?'':'s')+' até a mudança de 2010. Confira se já foram implantados.':t.oldReason;
$('fa-old-note').textContent=t.oldApproximate?'A data incompleta pode alterar os marcos. Cenário sujeito à conferência do histórico.':v.historicalDate?'Ato informado: '+v.historicalDate+' · referência '+v.historicalRef+'. Conferir sua implantação e efeitos.':'';
if(t.oldPaid!==null&&t.oldCounts.length&&t.oldPaid>Math.max(...t.oldCounts))$('fa-old-note').textContent='A referência informada supera a estimativa. Confira o ato e o histórico; nenhuma redução foi projetada.';
$('fa-old-note').hidden=!$('fa-old-note').textContent;
$('fa-new-context').textContent=t.newScope==='anchor'?'Contados desde o ato informado. Confira a implantação no contracheque.':'Estimativa de avanços neste período. Não confirma o nível atual nem a implantação.';
$('fa-new-count').textContent=t.newCounts.length?t.newCounts.join(' ou ')+' avanço'+(t.newCounts.length===1&&t.newCounts[0]===1?'':'s'):'Marco a conferir';
$('fa-new-percent').textContent=t.newCounts.length?t.newCounts.map(n=>pct(n*0.5)).join(' a ')+' · somente esta etapa'+(t.newScope==='anchor'?' desde o ato declarado':'; cenário temporal'):t.newReason||'A primeira etapa precisa ser definida.';
}
function openContact(){
if(!lastResult||lastResult.sample){syncFields();show(0);return;}
if(!lastResult.receipt)return;
$('fa-send-confirmation').textContent='Seus dados foram recebidos pelo escritório. Protocolo: '+lastResult.receipt.id.slice(0,8)+'.';
const v=lastResult.values,name=v.name.split(/\s+/)[0].slice(0,25);
const message=['Olá, Dr. Liandro. Gostaria de conversar sobre minha progressão e uma possível estimativa de diferenças mensais.','',
'Nome: '+v.name,'Telefone: '+v.phone,'E-mail: '+v.email,
'Situação: '+({effective:'Efetivo em atividade',retired:'Aposentado',pensioner:'Pensionista',temporary:'Temporário',other:'Outro / não sei'}[v.status]||v.status),
'Ingresso informado: '+(v.entry||'Não informado'),'Folha consultada: '+v.month];
if(!$('fa-legacy-result').hidden)message.push('', 'Regime anterior — informado: '+$('fa-old-current').textContent+'; projeção: '+$('fa-old-target').textContent+' ('+$('fa-old-target-percent').textContent+').', $('fa-old-summary').textContent,$('fa-old-note').textContent);
if(!$('fa-pccr-result').hidden){message.push('', 'PCCR — posição informada: '+$('fa-horizontal-current').textContent+' / '+$('fa-vertical-current').textContent+'.',
'Projeção de tempo: '+$('fa-horizontal').textContent+'. '+$('fa-horizontal-percent').textContent,
'Projeção de formação: '+$('fa-vertical').textContent+'. '+$('fa-vertical-percent').textContent);
if(!$('fa-new-phase-result').hidden)message.push('Etapa posterior a 2010: '+$('fa-new-count').textContent+'. '+$('fa-new-percent').textContent);
}
if(!$('fa-gain-numbers').hidden)message.push('', 'Diferença estimada na base: '+$('fa-gain-value').textContent+'. '+$('fa-gain-description').textContent,$('fa-gain-note').textContent);
if(!$('fa-retro').hidden)message.push('Eventuais retroativos dos últimos 5 anos não calculados; período sujeito ao início do direito e à prescrição.');
message.push('', $('fa-qualifier').textContent,$('fa-result-note').textContent,'Simulação preliminar, sem valores monetários e sujeita à análise dos documentos.');
$('fa-whatsapp').setAttribute('href','https://wa.me/5591984529721?text='+encodeURIComponent(message.join('\n')));
$('fa-contact-intro').textContent=['temporary','other'].includes(v.status)?'Seu vínculo precisa de uma análise individual. Vamos conferir seus documentos?':'Quer saber o que essa projeção pode representar por mês?';
$('fa-contact-heading').textContent=name+', vamos conversar?';show(7);
}
 async function sendResult(){
  if(!lastResult||lastResult.sample){syncFields();show(0);return;}
  if(lastResult.receipt){openContact();return;}
  if(lastResult.sending)return;
  if(!$('fa-send-consent').checked){fail('fa-send-consent','Autorize o envio dos dados para continuar.');return;}
  const state=lastResult,button=$('fa-contact-next');state.sending=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Enviando seus dados…';clearError();
  const summary={currentLevel:$('fa-horizontal-current').textContent,currentClass:$('fa-vertical-current').textContent,projectedLevel:$('fa-pccr-result').hidden?'':$('fa-horizontal').textContent,projectedClass:$('fa-pccr-result').hidden?'':$('fa-vertical').textContent,horizontalNote:$('fa-horizontal-percent').textContent,verticalNote:$('fa-vertical-percent').textContent,gain:$('fa-gain-numbers').hidden?'':$('fa-gain-value').textContent,gainNote:$('fa-gain-note').textContent,oldCurrent:$('fa-legacy-result').hidden?'':$('fa-old-current').textContent,oldTarget:$('fa-legacy-result').hidden?'':$('fa-old-target').textContent,oldPercent:$('fa-legacy-result').hidden?'':$('fa-old-target-percent').textContent,oldNote:$('fa-legacy-result').hidden?'':$('fa-old-note').textContent,newAdvances:$('fa-new-phase-result').hidden?'':$('fa-new-count').textContent,newPercent:$('fa-new-phase-result').hidden?'':$('fa-new-percent').textContent,note:$('fa-result-note').textContent};
  const {base,monthlyHours,hours,...input}=state.values;
  try{
   state.receipt=await root.faroLeadClient.submit({input,summary,consent:true,consentVersion:'2026-11-03',website:$('fa-send-website').value},state.state);
   if(lastResult===state){button.textContent='Dados enviados. Continuar →';openContact();}
  }catch(error){if(lastResult===state)fail(null,error.message||'O envio não foi confirmado. Tente novamente.');}
  finally{state.sending=false;if(lastResult===state){button.disabled=false;button.removeAttribute('aria-busy');if(!state.receipt)button.textContent='Tentar enviar novamente →';}}
 }
function calculate(){try{for(const n of path().filter(n=>n!==6)){if(!validate(n))return;}const v=values(),r=E.analyze(v);if(r.error){const id=/marco horizontal/.test(r.error)?'fa-anchor-date':/conclusão/.test(r.error)?'fa-title-year':/ingresso|exercício/.test(r.error)?'fa-entry':isBenefit(v.status)?(v.status==='pensioner'&&v.origin==='active'?'fa-death':'fa-career-end'):'fa-month';fail(id,r.error);return;}render(r,v);show(6);}catch(_){fail(null,'Não foi possível concluir. Seus dados continuam nos campos; tente novamente.');}}
function advance(){if(!validate(step))return;const route=path(),next=route[route.indexOf(step)+1];if(next===6){const v=values();render(E.analyze(v),v);show(6);return;}show(next);}
function example(old=false){const v={name:'Professora — exemplo',phone:'',status:'effective',period:old?'legacy':'pccr',entry:old?'29/03/1994':'01/01/2014',paidClass:'1',ref:'A',title:'specialist',titleYear:'2018',titleValid:'yes',base:'',monthlyHours:'',hours:'',month:'2026-10',continuous:true,oldContinuous:true,oldPaidRef:'',anchorDate:'',anchorLevel:'',historicalDate:'',historicalRef:''};render(E.analyze(v),v);$('fa-example-note').hidden=false;lastResult.sample=true;$('fa-send-authorization').hidden=true;$('fa-contact-next').textContent='Conferir meu próprio caso →';$('fa-review').textContent='Preencher meus dados';show(6);}
root.querySelectorAll('[data-fa-next]').forEach(b=>b.addEventListener('click',advance));root.querySelectorAll('[data-fa-back]').forEach(b=>b.addEventListener('click',()=>{const route=path();show(route[route.indexOf(step)-1]);}));
['fa-title','fa-status','fa-origin','fa-class','fa-ref'].forEach(id=>$(id).addEventListener('change',()=>{clearError();syncFields();}));
dateFields.forEach(id=>{$(id).addEventListener('input',event=>{if(!event.isComposing)formatDateTyping($(id));});$(id).addEventListener('blur',()=>{$(id).value=dateInput($(id).value);syncHistory();});});
$('fa-entry-precision').addEventListener('change',()=>{clearError();syncDatePrecision(true);syncHistory();});
['fa-entry','fa-anchor-date'].forEach(id=>$(id).addEventListener('change',()=>{clearError();syncHistory();}));
['fa-period-old','fa-period-new'].forEach(id=>$(id).addEventListener('change',()=>{if($(id).checked)$(id==='fa-period-old'?'fa-period-new':'fa-period-old').checked=false;clearError();syncHistory();}));
$('fa-contact-next').addEventListener('click',sendResult);$('fa-contact-back').addEventListener('click',()=>show(6));$('fa-name').addEventListener('input',syncFields);
$('fa-analyze').addEventListener('click',calculate);$('fa-form').addEventListener('submit',event=>{event.preventDefault();if(step<0)show(0);else if(step===5)calculate();else if(step<6)advance();});
$('fa-example').addEventListener('click',()=>example(false));$('fa-example-old').addEventListener('click',()=>example(true));$('fa-review').addEventListener('click',()=>{syncFields();show(0);});$('fa-start').addEventListener('click',()=>show(0));$('fa-back-cover').addEventListener('click',()=>showCover());
$('fa-month').value='2026-10';syncDatePrecision();syncFields();showCover(false);
})();
