// Motor de cálculo da triagem de progressão do professor estadual do Pará.
// Transcrito sem alterações de regra da versão criada no ChatGPT Sites.
(function(){
const root=document.getElementById('faro-progressao-mobile');
const DAY=86400000,LEVELS='ABCDEFGHIJKL',CUT=Date.UTC(2010,6,2),IMPL=Date.UTC(2011,8,1),MAX=Date.UTC(2026,10,1)-DAY;
const grades={
old:{start:'2024-04',end:'2026-03',law:'Lei 10.455/2024',
20:{0:[229129,230274,231426,232583,233746,234914,236089,237269,238456,239648,240846,242051],1:[230274,231426,232583,233746,234914,236089,237269,238456,239648,240846,242051,243261],2:[233728,234897,236072,237252,238438,239630,240829,242033,243243,244459,245681,246910],3:[237234,238421,239613,240811,242015,243225,244441,245663,246891,248126,249367,250613],4:[240793,241997,243207,244423,245645,246873,248108,249348,250595,251848,253107,254373]},
40:{0:[458258,460548,462852,465166,467492,469828,472178,474538,476912,479296,481692,484102],1:[460548,462852,465166,467492,469828,472178,474538,476912,479296,481692,484102,486522],2:[467456,469794,472144,474504,476876,479260,481658,484066,486486,488918,491362,493820],3:[474468,476842,479226,481622,484030,486450,488882,491326,493782,496252,498734,501226],4:[481586,483994,486414,488846,491290,493746,496216,498696,501190,503696,506214,508746]}},
current:{start:'2026-04',end:'2026-10',law:'Lei 11.358/2026',
20:{0:[242877,244091,245312,246538,247771,249010,250255,251506,252764,254027,255297,256574],1:[244091,245311,246538,247771,249010,250255,251506,252763,254027,255297,256574,257857],2:[247752,248991,250236,251487,252745,254008,255278,256555,257838,259127,260422,261725],3:[251469,252726,253990,255260,256536,257819,259108,260403,261705,263014,264329,265650],4:[255241,256517,257799,259088,260384,261686,262994,264309,265631,266959,268294,269635]},
40:{0:[485753,488182,490623,493076,495542,498019,500509,503012,505527,508055,510595,513148],1:[488182,490623,493076,495541,498019,500509,503012,505527,508054,510595,513148,515713],2:[495505,497982,500472,502975,505489,508017,510557,513110,515675,518254,520845,523449],3:[502937,505452,507979,510519,513072,515637,518215,520806,523410,526027,528658,531301],4:[510481,513034,515599,518177,520768,523372,525989,528618,531262,533918,536587,539270]}}
};
function validDate(y,m,d){const t=Date.UTC(y,m-1,d),v=new Date(t);return v.getUTCFullYear()===y&&v.getUTCMonth()===m-1&&v.getUTCDate()===d?t:null;}
function parseDate(s){
s=String(s||'').trim();let m;
if((m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))){const t=validDate(+m[3],+m[2],+m[1]);return t===null?null:{min:t,max:t,precision:'day'};}
if((m=s.match(/^(\d{2})\/(\d{4})$/))){const t=validDate(+m[2],+m[1],1);return t===null?null:{min:t,max:Date.UTC(+m[2],+m[1],1)-DAY,precision:'month'};}
if((m=s.match(/^(\d{4})$/))){const y=+m[1];return y<1900?null:{min:Date.UTC(y,0,1),max:Date.UTC(y+1,0,1)-DAY,precision:'year'};}
return null;
}
function monthEnd(s){const m=String(s).match(/^(\d{4})-(\d{2})$/);if(!m||+m[2]<1||+m[2]>12)return null;return Date.UTC(+m[1],+m[2],1)-DAY;}
function money(s){s=String(s||'').trim().replace(/R\$/gi,'').replace(/\s/g,'');if(!s)return null;if(s.includes(',')){if(!/^\d{1,3}(?:\.\d{3})*,\d{1,2}$|^\d+,\d{1,2}$/.test(s))return null;s=s.replace(/\./g,'').replace(',','.');}else if(/^\d{1,3}(?:\.\d{3})+$/.test(s)){s=s.replace(/\./g,'');}else if(!/^\d+(?:\.\d{1,2})?$/.test(s))return null;const n=Math.round(Number(s)*100);return Number.isSafeInteger(n)&&n>0&&n<=100000000?n:null;}
function level(s){s=String(s||'').trim().toUpperCase();const m=s.match(/^(?:\d{1,3}\s*|N[IÍ]VEL\s*)?([A-L])$/);return m?LEVELS.indexOf(m[1]):null;}
function addYears(t,n){const d=new Date(t),y=d.getUTCFullYear()+n,m=d.getUTCMonth(),day=d.getUTCDate();return Date.UTC(y,m,Math.min(day,new Date(Date.UTC(y,m+1,0)).getUTCDate()));}
function cycles(a,b,clock){if(b<a)return 0;if(clock==='days')return Math.floor((b-a)/DAY/1095);let n=0;while(n<100&&addYears(a,(n+1)*3)<=b)n++;return n;}
function bandDays(n){if(n<0)return null;return Math.min(11,Math.max(0,Math.ceil(n/1095)-1));}
function bandCalendar(a,b){if(b<a)return null;let n=0;for(let k=1;k<=11;k++)if(addYears(a,k*3)<b)n++;return n;}
function regime(r){if(r.max<CUT)return 'legacy';if(r.min>=CUT)return 'pccr';return 'ambiguous';}
function gradeFor(m){return Object.values(grades).find(g=>m>=g.start&&m<=g.end)||null;}
function unique(a){return Array.from(new Set(a));}
function monthlyToWeekly(value){return ({'100':'20','150':'30','200':'40'})[String(value)]||'';}
function analyzeActive(input){
const pending=[],assumptions=[],paths=[];const r={pending,assumptions,paths,levels:[],classes:[],amounts:[],decomposition:[],grade:null,route:null,paidLevel:level(input.ref),paidClass:input.paidClass===''?null:Number(input.paidClass),paid:money(input.base),asOf:input.careerAsOf??monthEnd(input.month),heading:'Há informações para conferir.',intro:'Esta é uma triagem baseada nos dados declarados. Nenhum direito é certificado pelo formulário.'};
if(input.status!=='effective'){
r.regimeLabel='Análise específica do vínculo';r.regimeDetail='Este módulo monetário é restrito ao professor efetivo em atividade.';r.heading='Seu vínculo precisa de análise específica.';
pending.push(input.status==='temporary'?'O vínculo temporário não será equiparado automaticamente ao cargo efetivo.':input.status==='retired'?'Conferir a trajetória na atividade, aposentadoria, paridade e regras do benefício.':'Confirme a forma de ingresso e a situação funcional.');return r;
}
const entry=parseDate(input.entry);r.entry=entry;
if(!entry){r.error='Informe uma data de exercício válida.';return r;}
if(r.asOf===null||r.asOf>MAX||entry.min>r.asOf){r.error='Confira o mês da folha e a data de ingresso. A base está conferida até outubro/2026.';return r;}
if(entry.min<Date.UTC(1900,0,1)){r.error='Confira o ano de ingresso.';return r;}
r.route=regime(entry);
const routeLabels={legacy:['Regime anterior + transição ao PCCR','Lei 5.351/1986; enquadramento do Decreto 189/2011; Lei 7.442/2010 na trajetória posterior, quando aplicável.'],pccr:['Percurso do PCCR','Lei 7.442/2010 e alterações. Não se atribuem aquisições antigas de 3,5% ao período posterior.'],ambiguous:['Data necessária para definir o percurso','O intervalo informado atravessa 02/07/2010. Complete a data para distinguir os regimes.']};
[r.regimeLabel,r.regimeDetail]=routeLabels[r.route];
if(entry.precision!=='day')pending.push('Complete dia, mês e ano do início do exercício para fixar os marcos da carreira.');
if(r.route==='legacy')pending.push('Direitos adquiridos no regime anterior, enquadramento e incorporações precisam de conferência. Nenhum percentual antigo foi somado à grade nova.');
if(r.route==='ambiguous')pending.push('A data de ingresso atravessa a mudança de 02/07/2010; o percurso anterior permanece indefinido.');
const anchor=parseDate(input.anchorDate),anchorIdx=level(input.anchorLevel);let manualAnchor=false;
if(input.anchorDate||input.anchorLevel){if(!anchor||anchor.precision!=='day'||anchorIdx===null||anchor.min<CUT||anchor.min>r.asOf||anchor.min<entry.min){r.error='Confira o marco horizontal: use data completa a partir de 02/07/2010, posterior ao ingresso e até a folha, e nível A a L.';return r;}manualAnchor=true;}
if(!input.continuous){pending.push('Tempo aproveitável, probatório e avaliações precisam ser definidos para projetar o nível.');}
else if(manualAnchor){
for(const clock of ['calendar','days'])paths.push({level:Math.min(11,anchorIdx+cycles(anchor.min,r.asOf,clock)),label:'Marco informado: '+input.anchorLevel+' em '+input.anchorDate,clock});
assumptions.push('Marco horizontal declarado pelo usuário; conferir sua validade para o enquadramento atual.');
}else if(r.route==='pccr'){
for(const start of unique([entry.min,Math.min(entry.max,r.asOf)]))for(const clock of ['calendar','days'])paths.push({level:Math.min(11,cycles(start,r.asOf,clock)),label:'Cenário de ingresso regular em I-A',clock});
assumptions.push('Cenário de ingresso regular em I-A; aprovação no probatório e requisitos de cada avanço presumidos para a simulação.');
// A general implementation date is not an individual career milestone.
// Post-cutoff regular entrants use their declared effective-service date.
// A different milestone requires the explicit, documented manual anchor above.
}else if(r.route==='legacy'&&entry.min>=Date.UTC(1986,9,1)&&r.asOf>=IMPL){
for(const start of unique([entry.min,entry.max]))for(const clock of ['calendar','days']){
const initial=clock==='days'?bandDays((IMPL-start)/DAY):bandCalendar(start,IMPL);
if(initial!==null)paths.push({level:Math.min(11,initial+cycles(IMPL,r.asOf,clock)),label:'Cenário: enquadramento em 01/09/2011, nível inicial '+LEVELS[initial],clock});
}
assumptions.push('Enquadramento hipotético em 01/09/2011 pela faixa de tempo do Anexo II, seguido de interstícios; confirmar cargo de origem, inclusão no PCCR e ato individual.');
}else if(r.route==='legacy')pending.push('Este período exige reconstrução histórica específica antes de projetar o nível atual.');
if(input.continuous)assumptions.push('Exercício contínuo; períodos computáveis, probatório, avaliações e demais requisitos precisam de prova.');
r.levels=unique(paths.map(p=>p.level)).sort((a,b)=>a-b);
const clocks=unique(paths.map(p=>p.clock));if(clocks.length>1&&unique(paths.map(p=>p.level)).length>1)assumptions.push('As alternativas refletem marcos/datas e comparação entre contagem por aniversário e por dias de 365. Nenhum marco controvertido foi escolhido como definitivo.');
else if(paths.length)assumptions.push('Contagens por aniversário e por dias de 365 conferidas como cenários; atos e critério aplicável ainda precisam de validação.');
if(r.paidClass===null||!Number.isInteger(r.paidClass)||r.paidClass<0||r.paidClass>4){r.paidClass=null;pending.push('Informe a classe na folha para comparar as posições.');}
if(r.paidLevel===null)pending.push('A referência não foi identificada como nível A a L. Confira o código na folha.');
if(r.paidClass!==null)r.classes=[r.paidClass];
const titleClass={specialist:2,master:3,doctor:4}[input.title];
if(r.paidClass===0){pending.push('Classe Especial: progressão vertical e vantagem por licenciatura exigem tratamento próprio; a matriz comum de titulação não foi aplicada.');}
else if(titleClass&&r.paidClass!==null){
const year=Number(input.titleYear),refYear=new Date(r.asOf).getUTCFullYear();
if(!Number.isInteger(year)||year<1900||year>2026){r.error='Informe um ano de conclusão válido, até 2026.';return r;}
if(year>refYear){r.verticalReason='future';pending.push('O título é posterior ao período de atividade/competência analisado e não foi aplicado.');}
else if(input.titleValid==='no'){r.verticalReason='academic';pending.push('O título informado não foi aplicado à progressão vertical por não atender aos requisitos declarados.');}
else if(titleClass>r.paidClass){
const possibleProbation=addYears(entry.min,3)<=r.asOf,completeProbation=addYears(Math.min(entry.max,r.asOf),3)<=r.asOf;
if(!possibleProbation){r.verticalReason='probation';pending.push('No ingresso regular ainda não se completaram três anos: confirmar aprovação ou eventual dispensa individual do probatório.');}
else if(year<refYear&&input.titleValid==='yes'&&input.continuous&&completeProbation)r.classes=[titleClass];
else{r.classes=unique([r.paidClass,titleClass]);r.verticalReason=!input.continuous||!completeProbation?'conditions':year===refYear?'title-date':'academic';}
pending.push('Classe superior é hipótese de enquadramento: conferir licenciatura, área, carga horária, instituição, probatório, requerimento e efeitos. Receber titularidade não prova implantação da vertical.');
if(year===refYear)pending.push('Conclusão no mesmo ano da folha: faltam dia/mês e marco de efeitos; a classe atual também foi mantida como alternativa.');
if(input.titleValid!=='yes')pending.push('A classe superior é apenas alternativa: requisitos acadêmicos ainda não foram confirmados.');
}
}
if(!r.levels.length&&r.paidLevel!==null&&r.classes.some(c=>c>r.paidClass)){
r.horizontalPending=true;r.levels=[r.paidLevel];paths.push({level:r.paidLevel,label:'Somente hipótese vertical: nível informado na folha',clock:'paid'});pending.push('O nível horizontal está pendente. O valor, quando disponível, considera somente a hipótese vertical no nível já informado.');
}
assumptions.push('A titulação foi avaliada para a classe potencial. Títulos e gratificações de titularidade não foram somados ao vencimento-base.');
r.grade=gradeFor(input.month);
if(!r.grade)pending.push('Grade dessa competência ainda não carregada. A análise legislativa permanece disponível, sem valor monetário.');
if(!['20','40'].includes(String(input.hours)))pending.push(String(input.hours)==='30'?'Carga de 150h mensais (30h semanais): a tabela proporcional ainda precisa de validação neste módulo.':'Confirme a carga mensal do vencimento-base para selecionar a grade.');
if(r.paid===null)pending.push('Informe um vencimento-base positivo para estimar a diferença.');
if(r.grade&&r.paidClass!==null&&r.paidLevel!==null&&['20','40'].includes(String(input.hours))&&r.paid!==null){
const nominal=r.grade[input.hours][r.paidClass][r.paidLevel];r.nominalPaid=nominal;
if(Math.abs(nominal-r.paid)>1){r.payMismatch=true;pending.push('O vencimento informado diverge da grade para classe, nível, jornada e mês. O valor fica suspenso até conferir essa divergência.');}
}
if(r.levels.length&&r.grade&&r.paidClass!==null&&r.paidLevel!==null&&r.paid!==null&&!r.payMismatch&&['20','40'].includes(String(input.hours))){
if(Math.min(...r.levels)<r.paidLevel){pending.push('O nível pago supera ao menos uma projeção. Confira o marco: não se presume dívida nem redução do vencimento.');r.levelConflict=true;}
else{
for(const c of r.classes)for(const n of r.levels){const due=r.grade[input.hours][c][n],delta=due-r.paid,h=r.grade[input.hours][r.paidClass][n]-r.nominalPaid,v=due-r.grade[input.hours][r.paidClass][n],residual=r.nominalPaid-r.paid;r.amounts.push(delta);r.decomposition.push({c,n,due,delta,h,v,residual});}
r.amounts=unique(r.amounts).sort((a,b)=>a-b);
if(r.amounts.some(n=>n<0)){pending.push('Há divergência negativa na comparação; nenhuma compensação ou dívida foi presumida.');r.amounts=[];}
}
}
r.expectedBases=[];
if(r.grade&&r.classes.length&&r.levels.length&&!r.levelConflict&&['20','40'].includes(String(input.hours))){for(const c of r.classes)for(const n of r.levels)r.expectedBases.push(r.grade[input.hours][c][n]);r.expectedBases=unique(r.expectedBases).sort((a,b)=>a-b);}
r.heading='Seu diagnóstico de progressão.';r.intro='Confira a progressão horizontal, a vertical e o vencimento-base indicado pelos seus dados. A conclusão é preliminar e depende das condições informadas.';
if(r.payMismatch)r.intro='O valor indicado é o da grade para a posição projetada. O vencimento informado diverge da grade da posição atual e precisa de conferência.';
if(r.amounts.length&&r.amounts.every(n=>n===0)){r.heading='Enquadramento compatível com a projeção.';r.intro='Os dados informados não indicam uma nova progressão pendente nesta competência, sob as condições da simulação.';}
r.pending=unique(pending);return r;
}
function analyze(input){
const inactive=['retired','pensioner'].includes(input.status);
if(!inactive)return analyzeActive(input);
const pension=input.status==='pensioner',entry=parseDate(input.entry),retirement=parseDate(input.careerEnd),death=parseDate(input.death),payDate=monthEnd(input.month);
const blank={pending:[],assumptions:[],paths:[],levels:[],classes:[],amounts:[],expectedBases:[],decomposition:[],grade:null,paidLevel:level(input.ref),paidClass:null,paid:null,asOf:payDate,benefit:true,heading:'Seu resultado',intro:'',benefitReason:''};
const stop=pension?(input.origin==='retired'?retirement:input.origin==='active'?death:null):retirement;
if(!entry||!stop||stop.precision!=='day'){
blank.benefitReason=!entry?'Informe o início da carreira do professor para indicar o enquadramento.':pension&&input.origin==='unknown'?'Informe se o professor faleceu em atividade ou já aposentado.':pension&&input.origin==='active'?'Informe a data do falecimento para analisar a carreira.':'Informe a data da aposentadoria para analisar a carreira.';
return blank;
}
if(payDate===null||payDate>MAX||stop.min>payDate||entry.min>stop.min||(pension&&death&&death.min>payDate)||(pension&&death&&input.origin==='retired'&&retirement.min>death.min)){
blank.error='Confira as datas de ingresso, aposentadoria, falecimento e mês da folha.';return blank;
}
// Service and education stop at retirement (or death in active service).
// The pay table keeps the selected payroll month; no service accrues in retirement.
const full=input.benefitRule==='full'&&!pension;
let hours=full?input.hours:'';
const grade=gradeFor(input.month),paidClass=input.paidClass===''?null:Number(input.paidClass),paidLevel=level(input.ref),paid=money(input.base);
if(full&&!hours&&grade&&Number.isInteger(paidClass)&&paidClass>=0&&paidClass<=4&&paidLevel!==null&&paid!==null){
const matches=['20','40'].filter(h=>Math.abs(grade[h][paidClass][paidLevel]-paid)<=1);
if(matches.length===1)hours=matches[0];
}
const lastActive=(!pension||input.origin==='retired')?stop.min-DAY:stop.min;
if(entry.min>lastActive){blank.error='O ingresso deve ser anterior ao encerramento da atividade.';return blank;}
const r=analyzeActive({...input,status:'effective',careerAsOf:lastActive,hours,base:full?input.base:''});
r.benefit=true;r.careerEnd=stop.min;r.benefitRule=input.benefitRule;r.inferredHours=hours!==input.hours?hours:'';
// Class and level describe the professor's career. They are not the pension quota.
// Only a declared full/parity retirement can display a nominal base component.
r.amounts=[];r.decomposition=[];
if(lastActive<IMPL&&r.route!=='pccr'){r.levels=[];r.classes=[];r.expectedBases=[];r.benefitReason='O enquadramento anterior ao PCCR precisa ser confirmado no ato do benefício.';return r;}
if(!full||!['20','40'].includes(String(hours))){r.expectedBases=[];}
if(pension)r.benefitReason='O valor da pensão depende da regra de concessão e da sua cota.';
else if(input.benefitRule!=='full')r.benefitReason=input.benefitRule==='average'?'O valor depende da revisão do cálculo pela média.':'O valor depende da regra e da proporção da aposentadoria.';
else if(!hours)r.benefitReason='Para estimar a base mensal, informe a carga anterior ou o vencimento-base da folha.';
else if(!r.expectedBases?.length)r.benefitReason='O valor depende da confirmação do enquadramento e da base do benefício.';
else r.benefitReason='Base mensal estimada; demais parcelas do benefício não incluídas.';
r.assumptions.push('Tempo e titulação limitados ao encerramento da atividade. Integralidade, paridade, proporções e cotas dependem do ato de concessão.');
return r;
}
root.faroEngine={analyze,parseDate,monthEnd,money,level,regime,bandDays,bandCalendar,cycles,grades,monthlyToWeekly,MAX,LEVELS};
})();
