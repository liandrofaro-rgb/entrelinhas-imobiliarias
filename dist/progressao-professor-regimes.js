// Regime anterior (Lei 5.351/1986) e transição ao PCCR.
// Transcrito sem alterações de regra da versão criada no ChatGPT Sites.
(function(){
'use strict';
const root=document.getElementById('faro-progressao-mobile'),E=root.faroEngine,DAY=86400000,CUT=Date.UTC(2010,6,2),START=Date.UTC(1986,9,1),ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
// Calendar anniversaries, with 29 February represented by 28 February in a
// non-leap year. This is an explicit simulation convention, not a finding
// about the counting rule in an individual administrative record.
function anniversary(start,years){const d=new Date(start),y=d.getUTCFullYear()+years,m=d.getUTCMonth(),day=d.getUTCDate();return Date.UTC(y,m,Math.min(day,new Date(Date.UTC(y,m+1,0)).getUTCDate()));}
function oldCount(start,end){let count=0;for(let i=1;i<=9;i++)if(anniversary(start,2*i+2)<=end)count=i;return count;}
function unique(values){return [...new Set(values)].sort((a,b)=>a-b);}
function analyze(v,r){
const out={applies:['effective','retired','pensioner'].includes(v.status)&&(v.period==='legacy'||r.route==='legacy'),oldCounts:[],oldPaid:ROMAN.includes(v.oldPaidRef)?ROMAN.indexOf(v.oldPaidRef):null,newCounts:[],newScope:'',oldReason:'',newReason:'',cut:CUT};
if(!out.applies)return out;
const entry=E.parseDate(v.entry);
if(!['effective','retired','pensioner'].includes(v.status)){out.oldReason='O vínculo exige análise própria.';return out;}
if(!entry||!r.route){out.oldReason='Informe o início e, para benefício, o encerramento da atividade.';return out;}
if(E.regime(entry)!=='legacy'){out.oldReason='Complete a data para separar os dois regimes.';return out;}
const anchor=E.parseDate(v.anchorDate),anchorLevel=E.level(v.anchorLevel);
if(v.continuous&&r.asOf>=CUT&&anchor&&anchor.precision==='day'&&anchor.min>=CUT&&anchor.min<=r.asOf&&anchorLevel!==null){out.newCounts=[Math.min(11-anchorLevel,E.cycles(anchor.min,r.asOf,'calendar'))];out.newScope='anchor';out.newStart=anchor.min;}
out.oldStart=entry.min;out.oldEnd=Math.min(r.asOf,CUT-DAY);
if(out.oldEnd<entry.min){out.oldReason='O período consultado é anterior ao ingresso.';return out;}
if(!v.oldContinuous){out.oldReason='Confirme o tempo no mesmo cargo ou apresente o histórico funcional.';return out;}
if(entry.min<START){out.oldReason='Ingresso anterior a outubro de 1986: é preciso identificar o enquadramento inicial.';return out;}
// The supplied judgment, 0906445-12.2023.8.14.0301, uses four years
// to the first advance and two to each subsequent advance (maximum X).
out.oldCounts=unique([oldCount(entry.min,out.oldEnd),oldCount(Math.min(entry.max,out.oldEnd),out.oldEnd)]);
out.oldApproximate=entry.precision!=='day';
if(r.asOf<CUT){out.newReason='A atividade terminou antes do PCCR; não há novos interstícios na aposentadoria.';return out;}
if(!v.continuous){out.newReason='Condições do período posterior ainda não confirmadas.';return out;}
if(out.newCounts.length)return out;
if(entry.precision!=='day'){out.newReason='Complete a data de ingresso para fixar o último marco do regime antigo.';return out;}
const count=out.oldCounts[0];
if(count===0||count===9){out.newReason='O marco de progressão no novo plano precisa ser identificado no ato de enquadramento.';return out;}
// Temporal scenario from the supplied judgment: keep the last completed
// old-regime milestone, then use 3-year intervals; never carry a pending
// 3.5% advance past the legislative change. This is not an A-L mapping.
const lastOld=anniversary(entry.min,2*count+2);
out.newCounts=[E.cycles(lastOld,r.asOf,'calendar')];out.newStart=lastOld;out.newScope='judgment';
return out;
}
root.faroRegimes={analyze,oldCount,anniversary,ROMAN};
})();
