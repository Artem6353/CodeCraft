(()=>{
"use strict";
const templates=Array.isArray(window.CODECRAFT_PROJECTS)?window.CODECRAFT_PROJECTS:[];
const list=document.querySelector("#projectList"),editor=document.querySelector("#projectCode"),title=document.querySelector("#projectTitle"),level=document.querySelector("#projectLevel"),description=document.querySelector("#projectDescription"),tasksRoot=document.querySelector("#projectTasks"),checksRoot=document.querySelector("#projectChecks"),status=document.querySelector("#projectStatus"),frame=document.querySelector("#projectPreview"),phaseStatus=document.querySelector("#projectPhaseStatus");
let active=templates[0]||null,completed=[];try{const v=JSON.parse(localStorage.getItem("cc_projects")||"[]");if(Array.isArray(v))completed=[...new Set(v.filter(id=>templates.some(t=>t.id===id)))];}catch(_){}
let phases={};try{const v=JSON.parse(localStorage.getItem("cc_project_steps_v1")||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))phases=v;}catch(_){}
let drafts={};try{const v=JSON.parse(localStorage.getItem("cc_drafts_v1")||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))drafts=v;}catch(_){}
function saveDraft(){drafts["project:"+active.id]=editor.value;try{localStorage.setItem("cc_drafts_v1",JSON.stringify(drafts));}catch(_){}}
function renderList(){list.replaceChildren();templates.forEach(project=>{const button=document.createElement("button");button.type="button";button.className="project-pick"+(project.id===active?.id?" active":"");const name=document.createElement("span");name.textContent=(completed.includes(project.id)?"✓ ":"")+project.title;const small=document.createElement("small");small.textContent=project.level+" · "+project.tasks.length+" этапа";button.append(name,small);button.addEventListener("click",()=>select(project.id));list.append(button);});}
function updatePhases(){const current=Array.isArray(phases[active.id])?phases[active.id]:[];phaseStatus.textContent="Этапы проекта: "+current.length+" из "+active.tasks.length;}
function renderTasks(){tasksRoot.replaceChildren();const current=Array.isArray(phases[active.id])?phases[active.id]:[];active.tasks.forEach((task,index)=>{const label=document.createElement("label");label.className="project-phase";const input=document.createElement("input");input.type="checkbox";input.checked=current.includes(index);input.addEventListener("change",()=>{const next=new Set(Array.isArray(phases[active.id])?phases[active.id]:[]);if(input.checked)next.add(index);else next.delete(index);phases[active.id]=[...next].sort((a,b)=>a-b);try{localStorage.setItem("cc_project_steps_v1",JSON.stringify(phases));}catch(_){}updatePhases();});const text=document.createElement("span");text.textContent=task;label.append(input,text);tasksRoot.append(label);});updatePhases();}
function preview(){const policy='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; font-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\';">';const safe=editor.value.replace(/<\/script/gi,"<\\/script");frame.srcdoc='<!doctype html><html lang="ru"><head><meta charset="utf-8">'+policy+'<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+safe+'</body></html>';}
function select(id){active=templates.find(t=>t.id===id)||templates[0];if(!active)return;title.textContent=active.title;level.textContent="ПРОЕКТ · "+active.level;description.textContent=active.description;editor.value=typeof drafts["project:"+active.id]==="string"?drafts["project:"+active.id]:active.code;checksRoot.replaceChildren();status.className="result-box";status.textContent=completed.includes(active.id)?"Проект уже пройден. Можешь улучшить и проверить ещё раз.":"Выполни критерии и проверь проект.";renderTasks();renderList();preview();}
editor.addEventListener("input",()=>{if(active)saveDraft();});
document.querySelector("#resetProject").addEventListener("click",()=>{editor.value=active.code;saveDraft();preview();});
document.querySelector("#previewProject").addEventListener("click",preview);
document.querySelector("#completeProject").addEventListener("click",()=>{
 const outcomes=active.checks.map(([label,test])=>({label,pass:Boolean(test(editor.value))}));checksRoot.replaceChildren();
 outcomes.forEach(item=>{const row=document.createElement("div");row.className="check-item "+(item.pass?"pass":"fail");row.textContent=(item.pass?"✓ ":"○ ")+item.label;checksRoot.append(row);});
 const passed=outcomes.length>0&&outcomes.every(item=>item.pass),isNew=!completed.includes(active.id);
 if(passed&&isNew){completed.push(active.id);try{localStorage.setItem("cc_projects",JSON.stringify(completed));}catch(_){}}
 status.className="result-box "+(passed?"success":"failure");status.textContent=passed?(isNew?"Все критерии выполнены. Начислено 50 XP!":"Все критерии по-прежнему выполнены ✓"):"Пока не всё готово. Исправь пункты без галочки.";
 renderList();
});
select(active?.id);
})();