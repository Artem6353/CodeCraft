(()=>{
"use strict";
const root=document.querySelector("#courseLessonList");
if(!root)return;
const all=Array.isArray(window.CODECRAFT_LESSONS)?window.CODECRAFT_LESSONS:[];
const course=root.dataset.course;
const lessons=all.filter(item=>item.course===course);
const search=document.querySelector("#lessonSearch");
const progressText=document.querySelector("#courseProgressText");
const progressFill=document.querySelector("#courseProgressFill");
function readArray(key){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==="string"))]:[];}catch(_){return[];}}
function render(){
 const done=readArray("cc_progress");
 const completed=lessons.filter(item=>done.includes(item.id)).length;
 progressText.textContent=completed+" из "+lessons.length+" уроков завершено";
 progressFill.style.width=(lessons.length?completed/lessons.length*100:0)+"%";
 const query=(search?.value||"").trim().toLowerCase();
 const filtered=lessons.filter(item=>(item.title+" "+item.text+" "+item.course).toLowerCase().includes(query));
 root.replaceChildren();
 if(!filtered.length){const p=document.createElement("p");p.className="loading-note";p.textContent="Ничего не найдено. Попробуй другое слово.";root.append(p);return;}
 filtered.forEach((item,index)=>{
  const link=document.createElement("a");link.className="lesson-row"+(done.includes(item.id)?" done":"");link.href="/lesson.html?id="+encodeURIComponent(item.id);
  const number=document.createElement("span");number.className="lesson-index";number.textContent=done.includes(item.id)?"✓":String(lessons.indexOf(item)+1).padStart(2,"0");
  const copy=document.createElement("span");const title=document.createElement("b");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=item.level+" · "+(item.question?"Есть проверка знаний":"Материал");copy.append(title,meta);
  const arrow=document.createElement("span");arrow.className="lesson-arrow";arrow.textContent="↗";link.append(number,copy,arrow);root.append(link);
 });
}
search?.addEventListener("input",render);
window.addEventListener("storage",render);
render();
})();