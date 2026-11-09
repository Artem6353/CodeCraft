(()=>{
"use strict";
const $=selector=>document.querySelector(selector);
const lessons=Array.isArray(window.CODECRAFT_LESSONS)?window.CODECRAFT_LESSONS:[];
function array(key){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?[...new Set(v.filter(x=>typeof x==="string"))]:[];}catch(_){return[];}}
function object(key){try{const v=JSON.parse(localStorage.getItem(key)||"{}");return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}catch(_){return{};}}
const done=array("cc_progress"),projects=array("cc_projects"),challenges=array("cc_challenges"),bookmarks=array("cc_bookmarks"),notes=object("cc_notes_v1");
const xp=done.length*20+projects.length*50+challenges.length*30;
const stats=[[""+xp+" XP","ОПЫТ"],[done.length+" / "+lessons.length,"УРОКИ"],[projects.length+" / 6","ПРОЕКТЫ"],[challenges.length+" / 20","ЗАДАНИЯ"]];
$("#dashboardStats").replaceChildren(...stats.map(([value,label])=>{const card=document.createElement("div");card.className="stat-card";const small=document.createElement("small");small.textContent=label;const b=document.createElement("b");b.textContent=value;card.append(small,b);return card;}));
const courses=["HTML и CSS","JavaScript","Python"],coursePaths={"HTML и CSS":"/courses/html-css/","JavaScript":"/courses/javascript/","Python":"/courses/python/"};
const courseList=$("#dashboardCourses");
courses.forEach(name=>{
 const items=lessons.filter(item=>item.course===name),complete=items.filter(item=>done.includes(item.id)).length,pct=items.length?Math.round(complete/items.length*100):0;
 const card=document.createElement("article");card.className="dashboard-course";const h=document.createElement("h3");h.textContent=name;const p=document.createElement("p");p.textContent=complete+" из "+items.length+" уроков · "+pct+"%";const track=document.createElement("div");track.className="progress-track";const fill=document.createElement("i");fill.style.width=pct+"%";track.append(fill);const link=document.createElement("a");link.className="text-link";link.href=coursePaths[name];link.textContent="Продолжить →";card.append(h,p,track,link);courseList.append(card);
});
function renderSaved(){
 const bookmarkRoot=$("#bookmarkList");bookmarkRoot.replaceChildren();
 bookmarks.forEach(id=>{const item=lessons.find(l=>l.id===id);if(!item)return;const a=document.createElement("a");a.className="saved-row";a.href="/lesson.html?id="+encodeURIComponent(id);a.textContent=item.title;bookmarkRoot.append(a);});
 if(!bookmarks.length){const p=document.createElement("p");p.className="muted-copy";p.textContent="Пока нет избранных уроков.";bookmarkRoot.append(p);}
 $("#bookmarkCount").textContent=String(bookmarks.length);
 const noteRoot=$("#noteList");noteRoot.replaceChildren();
 Object.entries(notes).forEach(([id,value])=>{if(typeof value!=="string"||!value.trim())return;const item=lessons.find(l=>l.id===id);if(!item)return;const a=document.createElement("a");a.className="saved-row";a.href="/lesson.html?id="+encodeURIComponent(id);const copy=document.createElement("span");const title=document.createElement("b");title.textContent=item.title;const small=document.createElement("small");small.textContent=value.slice(0,90);copy.append(title,small);a.append(copy);noteRoot.append(a);});
 if(!noteRoot.children.length){const p=document.createElement("p");p.className="muted-copy";p.textContent="Заметок пока нет. Открой урок и добавь свою.";noteRoot.append(p);}
 $("#noteCount").textContent=String(noteRoot.querySelectorAll("a").length);
}
renderSaved();
function exportData(){
 const payload={app:"CodeCraft",version:2,schemaVersion:2,exportedAt:new Date().toISOString(),progress:array("cc_progress"),projects:array("cc_projects"),challenges:array("cc_challenges"),bookmarks:array("cc_bookmarks"),notes:object("cc_notes_v1"),drafts:object("cc_drafts_v1"),exams:object("cc_exam_history_v1"),topicStats:object("cc_exam_topic_stats_v1"),projectSteps:object("cc_project_steps_v1")};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="codecraft-progress.json";a.click();URL.revokeObjectURL(url);$("#backupStatus").textContent="Резервная копия подготовлена.";
}
$("#exportProgress").addEventListener("click",exportData);
$("#importProgressFile").addEventListener("change",event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>2*1024*1024){$("#backupStatus").textContent="Файл больше 2 МБ. Импорт отменён.";event.target.value="";return;}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const data=JSON.parse(String(reader.result||""));
   if(!data||data.app!=="CodeCraft"||![1,2].includes(data.version))throw new Error("Неподдерживаемый формат CodeCraft.");
   const allowed=new Set(lessons.map(l=>l.id));
   const mergeArray=(key,incoming,valid=null)=>{const current=array(key),next=Array.isArray(incoming)?incoming.filter(x=>typeof x==="string"&&(!valid||valid.has(x))):[];localStorage.setItem(key,JSON.stringify([...new Set([...current,...next])]));};
   const mergeObject=(key,incoming)=>{const current=object(key),next=incoming&&typeof incoming==="object"&&!Array.isArray(incoming)?incoming:{};localStorage.setItem(key,JSON.stringify({...current,...next}));};
   mergeArray("cc_progress",data.progress,allowed);mergeArray("cc_bookmarks",data.bookmarks,allowed);
   mergeArray("cc_projects",data.projects);mergeArray("cc_challenges",data.challenges);
   mergeObject("cc_notes_v1",data.notes);mergeObject("cc_drafts_v1",data.drafts);mergeObject("cc_exam_history_v1",data.exams);mergeObject("cc_exam_topic_stats_v1",data.topicStats);mergeObject("cc_project_steps_v1",data.projectSteps);
   $("#backupStatus").textContent="Данные объединены. Обновляю кабинет…";setTimeout(()=>location.reload(),300);
  }catch(error){$("#backupStatus").textContent="Импорт отменён: "+error.message;}
  event.target.value="";
 };
 reader.onerror=()=>{$("#backupStatus").textContent="Не удалось прочитать файл.";event.target.value="";};
 reader.readAsText(file);
});
})();