(()=>{
"use strict";
const tasks=Array.isArray(window.CODECRAFT_CHALLENGES)?window.CODECRAFT_CHALLENGES:[];
const list=document.querySelector("#challengeList"),editor=document.querySelector("#challengeCode"),title=document.querySelector("#challengeTitle"),meta=document.querySelector("#challengeMeta"),language=document.querySelector("#challengeLanguage"),description=document.querySelector("#challengeDescription"),hint=document.querySelector("#challengeHint"),checksRoot=document.querySelector("#challengeChecks"),result=document.querySelector("#challengeResult");
let active=tasks[0]||null,completed=[];try{const v=JSON.parse(localStorage.getItem("cc_challenges")||"[]");if(Array.isArray(v))completed=[...new Set(v.filter(id=>tasks.some(t=>t.id===id)))];}catch(_){}
let drafts={};try{const v=JSON.parse(localStorage.getItem("cc_drafts_v1")||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))drafts=v;}catch(_){}
function saveDraft(){drafts["challenge:"+active.id]=editor.value;try{localStorage.setItem("cc_drafts_v1",JSON.stringify(drafts));}catch(_){}}
function renderList(){list.replaceChildren();tasks.forEach((task,index)=>{const button=document.createElement("button");button.type="button";button.className="challenge-pick"+(task.id===active?.id?" active":"");const name=document.createElement("span");name.textContent=(completed.includes(task.id)?"✓ ":"")+task.title;const small=document.createElement("small");small.textContent=task.language+" · "+task.level;button.append(name,small);button.addEventListener("click",()=>select(task.id));list.append(button);});}
function select(id){active=tasks.find(t=>t.id===id)||tasks[0];if(!active)return;title.textContent=active.title;meta.textContent=active.level+" · "+(completed.includes(active.id)?"РЕШЕНО":"ПРАКТИКА");language.textContent=active.language;description.textContent=active.description;hint.textContent=active.hint||"Разбей задачу на небольшие шаги.";editor.value=typeof drafts["challenge:"+active.id]==="string"?drafts["challenge:"+active.id]:active.starter;checksRoot.replaceChildren();result.textContent="Выполни критерии и нажми «Проверить».";result.className="result-box";renderList();}
editor.addEventListener("input",()=>{if(active)saveDraft();});
document.querySelector("#resetChallenge").addEventListener("click",()=>{editor.value=active.starter;saveDraft();});
document.querySelector("#checkChallenge").addEventListener("click",()=>{
 if(!active)return;const outcomes=active.checks.map(([label,test])=>({label,pass:Boolean(test(editor.value))}));checksRoot.replaceChildren();
 outcomes.forEach(item=>{const row=document.createElement("div");row.className="check-item "+(item.pass?"pass":"fail");row.textContent=(item.pass?"✓ ":"○ ")+item.label;checksRoot.append(row);});
 const passed=outcomes.length>0&&outcomes.every(item=>item.pass),isNew=!completed.includes(active.id);
 if(passed&&isNew){completed.push(active.id);try{localStorage.setItem("cc_challenges",JSON.stringify(completed));}catch(_){}}
 result.className="result-box "+(passed?"success":"failure");result.textContent=passed?(isNew?"Отлично! Все критерии выполнены. Начислено 30 XP.":"Все критерии выполнены ✓"):"Пока не всё готово. Исправь пункты без галочки.";
 meta.textContent=active.level+" · "+(completed.includes(active.id)?"РЕШЕНО":"ПРАКТИКА");renderList();
});
select(active?.id);
})();