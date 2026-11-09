(()=>{
"use strict";
const root=document.querySelector("#lessonRoot");
if(!root)return;
const lessons=Array.isArray(window.CODECRAFT_LESSONS)?window.CODECRAFT_LESSONS:[];
const id=new URLSearchParams(location.search).get("id");
const lesson=lessons.find(item=>item.id===id);
const courseUrl={"HTML и CSS":"/courses/html-css/","JavaScript":"/courses/javascript/","Python":"/courses/python/"};
function readArray(key){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==="string"))]:[];}catch(_){return[];}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}}
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
if(!lesson){
 root.replaceChildren(node("div","lesson-main","Урок не найден."));
 return;
}
const done=readArray("cc_progress"),bookmarks=readArray("cc_bookmarks");
document.title=lesson.title+" · CodeCraft";
document.querySelector("#lessonCourseCrumb").textContent=lesson.course;
const main=node("article","lesson-main");
const meta=node("div","lesson-meta");meta.append(node("span","pill",lesson.course),node("span","pill",lesson.level));
const heading=node("h1","",lesson.title);
const lead=node("p","lesson-lead",lesson.text);
const code=node("pre","",lesson.code||"");
const tip=node("p","lesson-tip","Запомни: "+(lesson.tip||"Повтори пример самостоятельно и попробуй изменить его."));
main.append(meta,heading,lead,code,tip);
if(lesson.question&&Array.isArray(lesson.options)){
 const question=node("section","lesson-question");question.append(node("div","eyebrow","ПРОВЕРЬ СЕБЯ"),node("h3","",lesson.question));
 const options=node("div","answer-options");const feedback=node("p","status-text","Выбери один вариант ответа.");
 lesson.options.forEach((option,index)=>{
  const button=node("button","answer-option",option);button.type="button";
  button.addEventListener("click",()=>{
   options.querySelectorAll("button").forEach((b,i)=>{b.disabled=true;if(i===lesson.correct)b.classList.add("correct");});
   if(index!==lesson.correct)button.classList.add("wrong");
   feedback.textContent=index===lesson.correct?"Верно! "+(lesson.explanation||"Отличная работа."):"Пока неверно. "+(lesson.explanation||"Вернись к примеру и попробуй ещё раз.");
  });
  options.append(button);
 });
 question.append(options,feedback);main.append(question);
}
const nextIndex=lessons.findIndex(item=>item.id===lesson.id)+1;
const actions=node("div","hero-actions");
const complete=node("button","button button-primary",done.includes(id)?"Урок пройден ✓":"Отметить урок пройденным");complete.type="button";complete.addEventListener("click",()=>{
 const current=readArray("cc_progress");if(!current.includes(id))current.push(id);write("cc_progress",current);complete.textContent="Урок пройден ✓";complete.disabled=true;
});
const bookmark=node("button","button button-quiet",bookmarks.includes(id)?"★ В избранном":"☆ В избранное");bookmark.type="button";bookmark.setAttribute("aria-pressed",String(bookmarks.includes(id)));bookmark.addEventListener("click",()=>{
 const current=readArray("cc_bookmarks"),next=current.includes(id)?current.filter(x=>x!==id):[...current,id];write("cc_bookmarks",next);bookmark.textContent=next.includes(id)?"★ В избранном":"☆ В избранное";bookmark.setAttribute("aria-pressed",String(next.includes(id)));
});
actions.append(complete,bookmark);
if(nextIndex<lessons.length){const next=node("a","button button-quiet","Следующий урок →");next.href="/lesson.html?id="+encodeURIComponent(lessons[nextIndex].id);actions.append(next);}
main.append(actions);
const aside=node("aside","lesson-aside");aside.append(node("h3","","Личные заметки"),node("p","","Заметка сохраняется автоматически в этом браузере."));
const note=node("textarea");note.maxLength=5000;note.setAttribute("aria-label","Личная заметка к уроку");let notes={};try{const v=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))notes=v;}catch(_){}note.value=typeof notes[id]==="string"?notes[id]:"";
const status=node("p","status-text","");note.addEventListener("input",()=>{let v={};try{const old=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(old&&typeof old==="object"&&!Array.isArray(old))v=old;}catch(_){}if(note.value.trim())v[id]=note.value;else delete v[id];status.textContent=write("cc_notes_v1",v)?"Сохранено ✓":"Не удалось сохранить. Проверь свободное место в браузере.";});
aside.append(note,status);
root.replaceChildren(main,aside);
})();