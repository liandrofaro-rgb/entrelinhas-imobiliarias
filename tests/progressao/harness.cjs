const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process'),path=require('node:path');
const project=path.resolve(__dirname,'../..'),revision=undefined;
if(revision&&!/^[a-f0-9]{40}$/.test(revision))throw Error('Invalid fixed baseline revision');
const source=file=>revision?cp.execFileSync('git',['show',revision+':'+file.replace(/^public\//,'dist/')],{cwd:project,encoding:'utf8'}):fs.readFileSync(path.join(project,file),'utf8');
const html=source('dist/progressao-professor.html'),ui=source('dist/progressao-professor-ui.js');
const parse=`import json,sys
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.root=None
 def handle_starttag(self,t,a):
  n={'tag':t,'attrs':dict(a),'text':'','children':[]}
  if self.stack:self.stack[-1]['children'].append(n)
  if dict(a).get('id')=='faro-progressao-mobile':self.root=n
  if t not in ['input','img','meta','link','br','hr']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i]['tag']==t:self.stack=self.stack[:i];break
 def handle_data(self,d):
  if self.stack:self.stack[-1]['text']+=d
p=P();p.feed(sys.stdin.read());print(json.dumps(p.root))`;
const tree=JSON.parse(cp.execFileSync('python3',['-c',parse],{input:html,encoding:'utf8'}));let focused=null;
class El{
 constructor(t,a={},text=''){this.tag=t;this.attrs={...a};this.children=[];this.parent=null;this._text=text;this.hidden='hidden'in a;this.checked='checked'in a;this.value=a.value||'';this.listeners={};this.className=a.class||'';this.classList={toggle:(c,on)=>{const list=new Set(this.className.split(' ').filter(Boolean));on?list.add(c):list.delete(c);this.className=[...list].join(' ');}};}
 get id(){return this.attrs.id||'';}set id(v){this.attrs.id=v;}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}set textContent(t){this._text=String(t);this.children=[];}
 appendChild(c){c.parent=this;this.children.push(c);return c;}
 insertAdjacentElement(where,c){assert.equal(where,'afterend');c.parent=this.parent;const i=this.parent.children.indexOf(this);this.parent.children.splice(i+1,0,c);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
 focus(){focused=this;}scrollIntoView(){}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}emit(k){return Promise.all((this.listeners[k]||[]).map(fn=>fn({preventDefault(){},target:this})));}
 descendants(){return this.children.flatMap(c=>[c,...c.descendants()]);}
 matches(s){if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.className.split(' ').includes(s.slice(1));const m=s.match(/^([\w-]+)?\[([^=\]]+)(?:="([^"]*)")?\]$/);if(m)return(!m[1]||this.tag===m[1])&&(m[2]in this.attrs)&&(m[3]===undefined||this.attrs[m[2]]===m[3]);return this.tag===s;}
 querySelectorAll(s){if(s.includes(','))return this.descendants().filter(e=>s.split(',').some(q=>e.matches(q)));const bits=s.split(/\s+(?![^[]*\])/);let list=[this];for(const bit of bits)list=list.flatMap(e=>e.descendants().filter(d=>d.matches(bit)));return [...new Set(list)];}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}closest(s){let e=this;while(e){if(e.matches(s))return e;e=e.parent;}return null;}
}
function build(n){const e=new El(n.tag,n.attrs,n.text);n.children.forEach(c=>e.appendChild(build(c)));if(e.tag==='select'){const o=e.children.find(c=>c.tag==='option');e.value=o?(o.attrs.value??o.textContent.trim()):'';}return e;}

function createApp(){
 const root=build(tree),doc={getElementById:id=>root.id===id?root:root.querySelector('#'+id),createElement:t=>new El(t)};
 root.faroLeadClient={submit:async()=>({id:'00000000-0000-4000-8000-000000000001',createdAt:'2026-11-03T00:00:00.000Z'})};
 const context=vm.createContext({document:doc,Date,Math,Number,String,Array,Set,Object});
 vm.runInContext(source('dist/progressao-professor-motor.js'),context);
 vm.runInContext(source('dist/progressao-professor-regimes.js'),context);vm.runInContext(ui,context);
 const $=id=>doc.getElementById(id);
 function fill(v){
  // Contact fixtures for the current UX; frozen legal profiles/expectations remain intact.
  const hasEmail=!!$('fa-email');
  if(hasEmail){v={...v,phone:v.phone||'(91) 90000-0000',email:v.email||'docente@example.invalid'};$('fa-email').value=v.email;}
  const map={name:'fa-name',phone:'fa-phone',status:'fa-status',entry:'fa-entry',paidClass:'fa-class',ref:'fa-ref',title:'fa-title',titleYear:'fa-title-year',titleValid:'fa-title-valid',month:'fa-month',oldPaidRef:'fa-old-paid-ref',anchorDate:'fa-anchor-date',anchorLevel:'fa-anchor-level',historicalDate:'fa-historical-date',historicalRef:'fa-anchor-old-ref',careerEnd:'fa-career-end',death:'fa-death',origin:'fa-origin',benefitRule:'fa-benefit-rule'};
  for(const [key,id] of Object.entries(map))$(id).value=String(v[key]??'');
  $('fa-period-old').checked=v.period==='legacy';$('fa-period-new').checked=v.period==='pccr';$('fa-continuous').checked=!!v.continuous;$('fa-old-continuous').checked=!!v.oldContinuous;
  $('fa-status').emit('change');$('fa-title').emit('change');
 }
 return {root,$,fill,engine:root.faroEngine,regimes:root.faroRegimes,run:()=>{$('fa-analyze').emit('click');},focused:()=>focused};
}
module.exports={createApp};
