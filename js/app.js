(()=>{
"use strict";
const $ = selector => document.querySelector(selector);
const lessons = Array.isArray(window.CODECRAFT_LESSONS) ? window.CODECRAFT_LESSONS : [];
const validIds = new Set(lessons.filter(item => item && typeof item.id === "string").map(item => item.id));
let done = [];
try {
  const stored = JSON.parse(localStorage.getItem("cc_progress") || "[]");
  if (Array.isArray(stored)) done = [...new Set(stored.filter(id => typeof id === "string" && validIds.has(id)))];
} catch (_) { done = []; }
let active = 0;
function saveProgress() {
  try { localStorage.setItem("cc_progress", JSON.stringify(done)); } catch (_) { /* Хранилище может быть недоступно. */ }
}
const levels = [{name:"Новичок",min:0},{name:"Практик",min:100},{name:"Создатель",min:220},{name:"Мастер",min:360},{name:"Наставник",min:470}];
function calculateLearningXP(lessonCount,projectCount,challengeCount){return lessonCount*20+projectCount*50+challengeCount*30;}
function getKnownChallengeIds(tasks){return new Set(tasks.map(task=>task.id));}
function sanitizeKnownIds(value,allowed){return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==="string"&&allowed.has(id)))]:[];}
const achievementDefinitions = [
 {id:"first-lesson",icon:"🌱",title:"Первый шаг",detail:"Заверши первый урок",test:()=>done.length>=1},
 {id:"four-lessons",icon:"📘",title:"Вошёл в ритм",detail:"Заверши 4 урока",test:()=>done.length>=4},
 {id:"eight-lessons",icon:"🧠",title:"Уверенный ученик",detail:"Заверши 8 уроков",test:()=>done.length>=8},
 {id:"all-lessons",icon:"🏆",title:"Полный курс",detail:"Заверши все уроки",test:()=>done.length===lessons.length&&lessons.length>0},
 {id:"first-project",icon:"🛠️",title:"Создатель",detail:"Заверши первый мини-проект",test:()=>completedProjects.length>=1},
 {id:"all-projects",icon:"🚀",title:"Портфолио готово",detail:"Заверши все мини-проекты",test:()=>completedProjects.length===projectTemplates.length},
 {id:"first-challenge",icon:"🧩",title:"Решатель задач",detail:"Реши первое практическое задание",test:()=>completedChallenges.length>=1},
 {id:"all-challenges",icon:"🎯",title:"Мастер практики",detail:"Реши все практические задания",test:()=>completedChallenges.length===challengeTasks.length}
];
function renderAchievements(){
 const xp=calculateLearningXP(done.length,completedProjects.length,completedChallenges.length);
 let current=levels[0],next=null;
 levels.forEach((level,index)=>{if(xp>=level.min)current=level;if(xp<level.min&&!next)next=level;});
 const base=current.min, target=next?next.min:current.min;
 const pct=next?Math.max(0,Math.min(100,Math.round((xp-base)/(target-base)*100))):100;
 const summary=$("#achievementSummary");summary.replaceChildren();
 const stats=[[""+xp+" XP","Опыт за обучение"],[current.name,"Текущий уровень"],[done.length+" / "+lessons.length,"Пройдено уроков"]];
 stats.forEach((stat,index)=>{const card=document.createElement("div");card.className="achievement-stat";const strong=document.createElement("strong");strong.textContent=stat[0];const label=document.createElement("span");label.textContent=stat[1];card.append(strong,label);if(index===1){const track=document.createElement("div");track.className="achievement-track";const fill=document.createElement("span");fill.style.width=pct+"%";track.append(fill);card.append(track);const note=document.createElement("span");note.textContent=next?(next.min-xp)+" XP до уровня «"+next.name+"»":"Максимальный уровень";card.append(note);}summary.append(card);});
 const list=$("#achievementList");list.replaceChildren();
 achievementDefinitions.forEach(item=>{const unlocked=item.test();const card=document.createElement("div");card.className="achievement-item"+(unlocked?"":" locked");const icon=document.createElement("span");icon.className="achievement-icon";icon.textContent=unlocked?item.icon:"🔒";const copy=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title;const detail=document.createElement("small");detail.textContent=unlocked?"Получено ✓":item.detail;copy.append(title,detail);card.append(icon,copy);list.append(card);});
}

/* Поиск уроков, резервное копирование и восстановление учебных данных */
function safeStoredArray(key,allowed){try{return sanitizeKnownIds(JSON.parse(localStorage.getItem(key)||"[]"),allowed);}catch(_){return[];}}
const knownProjectIds=new Set(["profile","portfolio","landing","taskboard","quiz-builder","data-dashboard"]);
function normalizeProjectSteps(value){const clean={};if(!value||typeof value!=="object"||Array.isArray(value))return clean;Object.entries(value).slice(0,20).forEach(([id,steps])=>{if(!knownProjectIds.has(id)||!Array.isArray(steps))return;clean[id]=[...new Set(steps.filter(n=>Number.isInteger(n)&&n>=0&&n<20))].slice(0,20);});return clean;}
let projectSteps={};try{projectSteps=normalizeProjectSteps(JSON.parse(localStorage.getItem("cc_project_steps_v1")||"{}"));}catch(_){}
function exportLearningData(){
 const payload={app:"CodeCraft",version:1,exportedAt:new Date().toISOString(),progress:done,projects:safeStoredArray("cc_projects",knownProjectIds),challenges:safeStoredArray("cc_challenges",getKnownChallengeIds(challengeTasks)),bookmarks:safeStoredArray("cc_bookmarks",validIds),notes:(()=>{try{const value=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(!value||typeof value!=="object"||Array.isArray(value))return{};const clean={};Object.entries(value).slice(0,100).forEach(([key,note])=>{if(validIds.has(key)&&typeof note==="string"&&note.length<=5000)clean[key]=note;});return clean;}catch(_){return{};}})(),drafts:(()=>{try{return JSON.parse(localStorage.getItem("cc_drafts_v1")||"{}");}catch(_){return{};}})(),exams:readExamHistory(),topicStats:readExamTopicStats(),projectSteps};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="codecraft-progress.json";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $("#learningToolsStatus").textContent="Резервная копия подготовлена. Сохрани файл в удобное место.";
}
$("#exportProgress").addEventListener("click",exportLearningData);
$("#importProgressButton").addEventListener("click",()=>$("#importProgressFile").click());
$("#importProgressFile").addEventListener("change",event=>{
 const file=event.target.files&&event.target.files[0];if(!file)return;
 if(file.size>2*1024*1024){$("#learningToolsStatus").textContent="Файл слишком большой. Максимальный размер резервной копии — 2 МБ.";event.target.value="";return;}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const data=JSON.parse(String(reader.result||""));
   if(!data||data.app!=="CodeCraft"||data.version!==1)throw new Error("Это не файл резервной копии CodeCraft версии 1.");
   const importedLessons=Array.isArray(data.progress)?data.progress.filter(id=>validIds.has(id)):[];
   const importedProjects=Array.isArray(data.projects)?data.projects.filter(id=>knownProjectIds.has(id)):[];
   const importedChallenges=sanitizeKnownIds(data.challenges,getKnownChallengeIds(challengeTasks));
   done=[...new Set([...done,...importedLessons])];const importedBookmarks=Array.isArray(data.bookmarks)?[...new Set(data.bookmarks.filter(id=>validIds.has(id)))]:[];try{localStorage.setItem("cc_bookmarks",JSON.stringify([...new Set([...safeStoredArray("cc_bookmarks",validIds),...importedBookmarks])]));}catch(_){}if(data.notes&&typeof data.notes==="object"&&!Array.isArray(data.notes)){const cleanNotes={};Object.entries(data.notes).slice(0,100).forEach(([key,note])=>{if(validIds.has(key)&&typeof note==="string"&&note.length<=5000)cleanNotes[key]=note;});try{const existing=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");localStorage.setItem("cc_notes_v1",JSON.stringify({...existing,...cleanNotes}));}catch(_){localStorage.setItem("cc_notes_v1",JSON.stringify(cleanNotes));}}completedProjects=[...new Set([...completedProjects,...importedProjects])];const importedSteps=normalizeProjectSteps(data.projectSteps);Object.entries(importedSteps).forEach(([id,steps])=>{projectSteps[id]=[...new Set([...(projectSteps[id]||[]),...steps])].sort((a,b)=>a-b);});try{localStorage.setItem("cc_project_steps_v1",JSON.stringify(projectSteps));}catch(_){}completedChallenges=[...new Set([...completedChallenges,...importedChallenges])];if(data.exams&&typeof data.exams==="object"&&!Array.isArray(data.exams)){const merged=readExamHistory();Object.entries(data.exams).slice(0,30).forEach(([key,item])=>{if(!/^[a-zA-Zа-яА-Я0-9 +:-]{1,100}$/.test(key)||!item||typeof item!=="object")return;const attempts=Number.isInteger(item.attempts)?Math.max(0,Math.min(100000,item.attempts)):0,best=Number.isInteger(item.best)?Math.max(0,Math.min(100,item.best)):0,last=Number.isInteger(item.last)?Math.max(0,Math.min(100,item.last)):0;if(attempts){const old=merged[key]||{attempts:0,best:0,last:0};merged[key]={attempts:Math.min(100000,old.attempts+attempts),best:Math.max(old.best,best),last};}});try{localStorage.setItem(examHistoryKey,JSON.stringify(merged));}catch(_){}}
   if(data.topicStats&&typeof data.topicStats==="object"&&!Array.isArray(data.topicStats)){const merged=readExamTopicStats();Object.entries(data.topicStats).slice(0,20).forEach(([key,item])=>{if(!/^(html-structure|html-document|css-foundation|css-layout|js-foundation|js-browser|py-foundation|py-data|other)$/.test(key)||!item||typeof item!=="object")return;const total=Number.isInteger(item.total)?Math.max(0,Math.min(100000,item.total)):0,correct=Number.isInteger(item.correct)?Math.max(0,Math.min(total,item.correct)):0;if(total){const old=merged[key]||{correct:0,total:0};merged[key]={total:Math.min(100000,old.total+total),correct:Math.min(100000,old.correct+correct)};}});try{localStorage.setItem(examTopicStatsKey,JSON.stringify(merged));}catch(_){}}
   saveProgress();localStorage.setItem("cc_projects",JSON.stringify(completedProjects));localStorage.setItem("cc_challenges",JSON.stringify(completedChallenges));
   if(data.drafts&&typeof data.drafts==="object"&&!Array.isArray(data.drafts)){
    const cleanDrafts={};
    Object.entries(data.drafts).slice(0,100).forEach(([key,value])=>{
     if(key!=="__proto__"&&key!=="constructor"&&key!=="prototype"&&/^[a-zA-Z0-9:_-]{1,120}$/.test(key)&&typeof value==="string"&&value.length<=150000)cleanDrafts[key]=value;
    });
    savedDrafts=cleanDrafts;localStorage.setItem("cc_drafts_v1",JSON.stringify(cleanDrafts));
   }
   editor.value=restoreDraft("javascriptPlayground",starter);
   webHtml.value=restoreDraft("webHtml",webDefaults.html);webCss.value=restoreDraft("webCss",webDefaults.css);webJs.value=restoreDraft("webJs",webDefaults.js);runWebLab();
   pythonEditor.value=restoreDraft("python:"+activePythonExample,pythonExamples[activePythonExample]||"");
   $("#challengeCode").value=restoreDraft("challenge:"+activeChallenge.id,activeChallenge.starter);
   $("#projectCode").value=restoreDraft("project:"+activeProject.id,activeProject.code);renderProjectPreview();
   renderMenu();progress();renderProjectCards();renderChallengeMenu();updateProjectStatus();renderExamHistory();renderExamTopicStats();
   $("#learningToolsStatus").textContent="Данные импортированы. Существующий прогресс сохранён и объединён с копией.";
  }catch(error){$("#learningToolsStatus").textContent="Не удалось импортировать файл: "+error.message;}
  event.target.value="";
 };
 reader.onerror=()=>{$("#learningToolsStatus").textContent="Не удалось прочитать выбранный файл.";event.target.value="";};
 reader.readAsText(file);
});


/* Личный учебный кабинет: закладки и заметки */
function renderStudentDashboard(){
 const stats=$("#studentStats");if(!stats)return;
 const bookmarks=safeStoredArray("cc_bookmarks",validIds);let notes={};
 try{const value=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(value&&typeof value==="object"&&!Array.isArray(value))notes=value;}catch(_){}
 const noteIds=Object.keys(notes).filter(id=>validIds.has(id)&&typeof notes[id]==="string"&&notes[id].trim());
 const xp=calculateLearningXP(done.length,completedProjects.length,completedChallenges.length);
 const cards=[[done.length+" / "+lessons.length,"уроков пройдено"],[bookmarks.length,"уроков в избранном"],[noteIds.length,"личных заметок"],[xp+" XP","заработано опыта"]];
 stats.replaceChildren();cards.forEach(([value,label])=>{const card=document.createElement("div");card.className="student-stat";const strong=document.createElement("strong");strong.textContent=value;const small=document.createElement("span");small.textContent=label;card.append(strong,small);stats.append(card);});
 $("#bookmarkCount").textContent=String(bookmarks.length);$("#notesCount").textContent=String(noteIds.length);
 const bookmarkList=$("#bookmarkList");bookmarkList.replaceChildren();
 if(!bookmarks.length){const empty=document.createElement("p");empty.className="student-empty";empty.textContent="Пока пусто. Добавляй уроки в избранное из учебной панели.";bookmarkList.append(empty);}
 bookmarks.forEach(id=>{const lesson=lessons.find(item=>item.id===id);if(!lesson)return;const button=document.createElement("button");button.type="button";button.className="saved-lesson";const title=document.createElement("strong");title.textContent=lesson.title;const meta=document.createElement("small");meta.textContent=lesson.course;button.append(title,meta);button.addEventListener("click",()=>{const index=lessons.findIndex(item=>item.id===id);showLesson(index);$("#learn").scrollIntoView({behavior:"smooth"});});bookmarkList.append(button);});
 const notesList=$("#notesList");notesList.replaceChildren();
 if(!noteIds.length){const empty=document.createElement("p");empty.className="student-empty";empty.textContent="Здесь появятся твои заметки к урокам.";notesList.append(empty);}
 noteIds.forEach(id=>{const lesson=lessons.find(item=>item.id===id);if(!lesson)return;const button=document.createElement("button");button.type="button";button.className="saved-lesson";const title=document.createElement("strong");title.textContent=lesson.title;const snippet=document.createElement("small");snippet.textContent=notes[id].trim().replace(/\\s+/g," ").slice(0,105);button.append(title,snippet);button.addEventListener("click",()=>{showLesson(lessons.findIndex(item=>item.id===id));$("#learn").scrollIntoView({behavior:"smooth"});});notesList.append(button);});
}

function progress() {
  const count = done.length;
  const percent = lessons.length ? Math.max(0, Math.min(100, Math.round(count / lessons.length * 100))) : 0;
  $("#progressRing").style.setProperty("--p", percent + "%");
  $("#progressPct").textContent = percent + "%";
  $("#progressCount").textContent = count + " из " + lessons.length + " уроков";
  renderAchievements();
  renderStudentDashboard();
}
function renderMenu() {
  const menu = $("#lessonMenu");
  menu.replaceChildren();
  const query = ($("#lessonSearch")?.value || "").trim().toLocaleLowerCase("ru");
  const course = $("#courseFilter")?.value || "all";
  const filtered = lessons.map((lesson,index)=>({lesson,index})).filter(({lesson}) =>
    (course === "all" || lesson.course === course) &&
    (!query || [lesson.title,lesson.text,lesson.course,lesson.level].join(" ").toLocaleLowerCase("ru").includes(query))
  );
  if (!filtered.length) {
    const empty = document.createElement("p"); empty.className="empty-state";
    empty.textContent="Ничего не найдено. Измени запрос или выбери другое направление.";
    menu.append(empty); return;
  }
  filtered.forEach(({lesson,index}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-choice" + (index === active ? " active" : "");
    button.textContent = (done.includes(lesson.id) ? "✓ " : "") + lesson.title;
    const small = document.createElement("small");
    small.textContent = lesson.course + " · " + lesson.level;
    button.append(small);
    button.addEventListener("click", () => showLesson(index));
    menu.append(button);
  });
}
$("#lessonSearch").addEventListener("input",renderMenu);
$("#courseFilter").addEventListener("change",renderMenu);
function showLesson(index) {
  if (!Number.isInteger(index) || index < 0 || index >= lessons.length) return;
  active = index;
  const lesson = lessons[index];
  const panel = $("#lessonPanel");
  panel.replaceChildren();
  const tag = document.createElement("span"); tag.className = "pill"; tag.textContent = lesson.course + " · " + lesson.level;
  const heading = document.createElement("h3"); heading.textContent = lesson.title;
  const description = document.createElement("p"); description.textContent = lesson.text;
  const example = document.createElement("pre"); example.textContent = lesson.code;
  const tip = document.createElement("p"); tip.className = "lesson-tip"; tip.textContent = "Запомни: " + lesson.tip;
  const lessonTools=document.createElement("section");lessonTools.className="lesson-personal-tools";
  let bookmarks=safeStoredArray("cc_bookmarks",validIds);let notes={};try{const storedNotes=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(storedNotes&&typeof storedNotes==="object"&&!Array.isArray(storedNotes))notes=storedNotes;}catch(_){}
  const bookmarkButton=document.createElement("button");bookmarkButton.type="button";bookmarkButton.className="small-btn";bookmarkButton.textContent=bookmarks.includes(lesson.id)?"★ В избранном":"☆ Добавить в избранное";
  bookmarkButton.setAttribute("aria-pressed",String(bookmarks.includes(lesson.id)));
  bookmarkButton.addEventListener("click",()=>{const current=safeStoredArray("cc_bookmarks",validIds);const next=current.includes(lesson.id)?current.filter(id=>id!==lesson.id):[...current,lesson.id];try{localStorage.setItem("cc_bookmarks",JSON.stringify(next));}catch(_){}bookmarkButton.textContent=next.includes(lesson.id)?"★ В избранном":"☆ Добавить в избранное";bookmarkButton.setAttribute("aria-pressed",String(next.includes(lesson.id)));renderStudentDashboard();});
  const noteLabel=document.createElement("label");noteLabel.className="lesson-note-label";noteLabel.textContent="Моя заметка к уроку";
  const noteInput=document.createElement("textarea");noteInput.className="lesson-note-input";noteInput.maxLength=5000;noteInput.rows=3;noteInput.placeholder="Запиши важную мысль, вопрос или свой пример…";noteInput.value=typeof notes[lesson.id]==="string"?notes[lesson.id]:"";noteLabel.append(noteInput);
  const noteStatus=document.createElement("span");noteStatus.className="lesson-note-status";noteStatus.setAttribute("aria-live","polite");noteStatus.textContent=noteInput.value?"Заметка сохранена на устройстве.":"Заметок пока нет.";
  noteInput.addEventListener("input",()=>{let current={};try{const value=JSON.parse(localStorage.getItem("cc_notes_v1")||"{}");if(value&&typeof value==="object"&&!Array.isArray(value))current=value;}catch(_){}if(noteInput.value.trim())current[lesson.id]=noteInput.value;else delete current[lesson.id];try{localStorage.setItem("cc_notes_v1",JSON.stringify(current));noteStatus.textContent=noteInput.value.trim()?"Сохранено автоматически ✓":"Заметка удалена."; }catch(_){noteStatus.textContent="Не удалось сохранить заметку: хранилище недоступно.";}renderStudentDashboard();});
  lessonTools.append(bookmarkButton,noteLabel,noteStatus);
  const exercise = document.createElement("section"); exercise.className = "lesson-exercise";
  const exerciseTitle = document.createElement("h4"); exerciseTitle.textContent = "Проверь себя";
  const question = document.createElement("p"); question.textContent = lesson.question;
  const options = document.createElement("div"); options.className = "lesson-options";
  const feedback = document.createElement("p"); feedback.className = "exercise-feedback"; feedback.setAttribute("aria-live", "polite"); feedback.textContent = "Выбери правильный ответ.";
  lesson.options.forEach((option, optionIndex) => {
    const choice = document.createElement("button"); choice.type = "button"; choice.className = "lesson-option"; choice.textContent = option;
    choice.addEventListener("click", () => {
      options.querySelectorAll("button").forEach(item => { item.disabled = true; item.classList.remove("is-correct", "is-wrong"); });
      if (optionIndex === lesson.correct) {
        choice.classList.add("is-correct");
        feedback.textContent = "Верно! " + lesson.explanation;
      } else {
        choice.classList.add("is-wrong");
        options.children[lesson.correct].classList.add("is-correct");
        feedback.textContent = "Не совсем. " + lesson.explanation;
      }
    });
    options.append(choice);
  });
  const retry = document.createElement("button"); retry.type = "button"; retry.className = "small-btn"; retry.textContent = "Повторить задание";
  retry.addEventListener("click", () => { options.querySelectorAll("button").forEach(item => { item.disabled = false; item.classList.remove("is-correct", "is-wrong"); }); feedback.textContent = "Выбери правильный ответ."; });
  exercise.append(exerciseTitle, question, options, feedback, retry);
  const mark = document.createElement("button"); mark.type = "button"; mark.className = "btn"; mark.textContent = done.includes(lesson.id) ? "Урок пройден ✓" : "Отметить урок пройденным";
  mark.addEventListener("click", () => { if (!done.includes(lesson.id)) done.push(lesson.id); saveProgress(); renderMenu(); progress(); showLesson(index); });
  panel.append(tag, heading, description, example, tip, lessonTools, exercise, mark);
  renderMenu();
}
document.querySelectorAll("[data-course]").forEach(button => button.addEventListener("click", () => {
  const firstByCourse = lessons.findIndex(lesson => lesson.course.toLowerCase().includes(button.dataset.course === "python" ? "python" : button.dataset.course === "js" ? "javascript" : "html"));
  showLesson(firstByCourse < 0 ? 0 : firstByCourse);
  $("#learn").scrollIntoView({ behavior: "smooth" });
}));
let savedDrafts={};
try{const value=JSON.parse(localStorage.getItem("cc_drafts_v1")||"{}");if(value&&typeof value==="object"&&!Array.isArray(value))savedDrafts=value;}catch(_){}
function saveDraft(key,value){savedDrafts[key]=value;try{localStorage.setItem("cc_drafts_v1",JSON.stringify(savedDrafts));}catch(_){}}
function restoreDraft(key,fallback){return typeof savedDrafts[key]==="string"?savedDrafts[key]:fallback;}
const editor = $("#codeEditor"); const output = $("#output"); const starter = editor.value; const sandboxFrame = $("#jsSandbox");
editor.value=restoreDraft("javascriptPlayground",starter);editor.addEventListener("input",()=>saveDraft("javascriptPlayground",editor.value));
let requestId = 0; let sandboxReady = false; let pending = null;
const MAX_JS_CODE = 100000;
const MAX_JS_OUTPUT = 50100;
function resetSandbox() {
  sandboxReady = false;
  sandboxFrame.src = "sandbox.html";
}
sandboxFrame.addEventListener("load", () => {
  sandboxReady = false;
  sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_PING" }, "*");
});
sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_PING" }, "*");
function finishJavaScriptRun(message, restart) {
  if (pending) clearTimeout(pending.timer);
  pending = null;
  $("#runCode").disabled = false;
  $("#stopCode").disabled = true;
  output.textContent = message;
  if (restart) resetSandbox();
}
window.addEventListener("message", event => {
  if (event.source !== sandboxFrame.contentWindow || !event.data || typeof event.data !== "object") return;
  if (event.data.type === "CODECRAFT_READY") { sandboxReady = true; return; }
  if (event.data.type === "CODECRAFT_ERROR") {
    if (!pending || event.data.id !== pending.id) return;
    finishJavaScriptRun("Ошибка среды: " + String(event.data.message || "не удалось запустить Worker").slice(0, 4000), true);
    return;
  }
  if (event.data.type !== "CODECRAFT_RESULT" || !pending || event.data.id !== pending.id) return;
  const result = typeof event.data.output === "string" ? event.data.output.slice(0, MAX_JS_OUTPUT) : "";
  const error = typeof event.data.error === "string" ? event.data.error.slice(0, 4000) : "";
  finishJavaScriptRun(error ? (result ? result + "\n" : "") + "Ошибка: " + error : result || "Код выполнен.", false);
});
$("#runCode").addEventListener("click", () => {
  if (pending) return;
  if (!sandboxReady) { output.textContent = "Среда запуска ещё загружается. Попробуй через секунду."; return; }
  if (editor.value.length > MAX_JS_CODE) {
    output.textContent = "Код слишком большой. Максимальный размер — 100 000 символов.";
    return;
  }
  const id = ++requestId;
  $("#runCode").disabled = true;
  $("#stopCode").disabled = false;
  output.textContent = "Выполняю код в отдельном Worker…";
  const timer = setTimeout(() => {
    if (!pending || pending.id !== id) return;
    finishJavaScriptRun("Время выполнения превышено (1,8 с). Worker остановлен, среда перезапущена.", true);
  }, 1800);
  pending = { id, timer };
  sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_RUN", id, code: editor.value }, "*");
});
$("#stopCode").addEventListener("click", () => {
  if (!pending) return;
  try { sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_CANCEL" }, "*"); } catch (_) {}
  finishJavaScriptRun("Выполнение остановлено. Среда перезапущена.", true);
});
$("#resetEditor").addEventListener("click", () => { editor.value = starter; saveDraft("javascriptPlayground",starter); output.textContent = "Пример восстановлен."; });
$("#clearOutput").addEventListener("click", () => { output.textContent = "Вывод очищен."; });
let examQuestions=[],examIndex=0,examScore=0,examAnswered=false,examConfigKey="",examMissed=[];
const examHistoryKey="cc_exam_history_v1";
const examTopicStatsKey="cc_exam_topic_stats_v1";
function topicForQuestion(question){
 const match=String(question&&question.id||"").match(/^(html|css|js|py)(\d+)$/);
 if(!match)return{key:"other",label:"Общие основы",course:question&&question.course||"Другое"};
 const prefix=match[1],number=Number(match[2]);
 const topics={
  html:number<=4?["html-structure","HTML: структура и элементы"]:["html-document","HTML: документы и доступность"],
  css:number<=4?["css-foundation","CSS: стили и адаптивность"]:["css-layout","CSS: сетки и эффекты"],
  js:number<=4?["js-foundation","JavaScript: основы и логика"]:["js-browser","JavaScript: данные и браузер"],
  py:number<=4?["py-foundation","Python: основы и функции"]:["py-data","Python: коллекции и циклы"]
 };
 const [key,label]=topics[prefix];return{key,label,course:question.course};
}
function readExamTopicStats(){
 try{const value=JSON.parse(localStorage.getItem(examTopicStatsKey)||"{}");if(!value||typeof value!=="object"||Array.isArray(value))return{};const clean={};
 Object.entries(value).slice(0,20).forEach(([key,item])=>{if(!/^(html-structure|html-document|css-foundation|css-layout|js-foundation|js-browser|py-foundation|py-data|other)$/.test(key)||!item||typeof item!=="object")return;const correct=Number.isInteger(item.correct)?Math.max(0,Math.min(100000,item.correct)):0;const total=Number.isInteger(item.total)?Math.max(0,Math.min(100000,item.total)):0;if(total)clean[key]={correct:Math.min(correct,total),total};});return clean;
 }catch(_){return{};}
}
function recordExamAnswer(question,correct){
 const topic=topicForQuestion(question),stats=readExamTopicStats(),item=stats[topic.key]||{correct:0,total:0};item.total=Math.min(100000,item.total+1);if(correct)item.correct=Math.min(item.total,item.correct+1);stats[topic.key]=item;
 try{localStorage.setItem(examTopicStatsKey,JSON.stringify(stats));}catch(_){}
}
function renderExamTopicStats(){
 const container=$("#examTopicStats");if(!container)return;const stats=readExamTopicStats();
 const rows=Object.entries(stats).filter(([,item])=>item.total>=1).map(([key,item])=>{const sample=lessons.find(question=>topicForQuestion(question).key===key),topic=topicForQuestion(sample||{});return{key,label:topic.label,correct:item.correct,total:item.total,pct:Math.round(item.correct/item.total*100)};}).sort((a,b)=>a.pct-b.pct||b.total-a.total);
 container.replaceChildren();if(!rows.length){const empty=document.createElement("p");empty.className="student-empty";empty.textContent="После первых ответов здесь появятся темы, которые уже освоены и те, которые стоит повторить.";container.append(empty);return;}
 rows.forEach(row=>{const card=document.createElement("article");card.className="topic-stat-card";const heading=document.createElement("div");heading.className="topic-stat-heading";const name=document.createElement("strong");name.textContent=row.label;const score=document.createElement("span");score.textContent=row.pct+"% · "+row.correct+"/"+row.total;heading.append(name,score);const track=document.createElement("div");track.className="topic-stat-track";const fill=document.createElement("span");fill.style.width=row.pct+"%";track.append(fill);const action=document.createElement("button");action.type="button";action.className="small-btn";action.dataset.topic=row.key;action.textContent=row.pct<70?"Тренировать тему":"Повторить тему";card.append(heading,track,action);container.append(card);});
}

function readExamHistory(){
 try{
  const value=JSON.parse(localStorage.getItem(examHistoryKey)||"{}");
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const clean={};
  Object.entries(value).slice(0,30).forEach(([key,item])=>{
   if(!/^[a-zA-Zа-яА-Я0-9 +:-]{1,100}$/.test(key)||!item||typeof item!=="object")return;
   const attempts=Number.isInteger(item.attempts)?Math.max(0,Math.min(100000,item.attempts)):0;
   const best=Number.isInteger(item.best)?Math.max(0,Math.min(100,item.best)):0;
   const last=Number.isInteger(item.last)?Math.max(0,Math.min(100,item.last)):0;
   if(attempts)clean[key]={attempts,best,last};
  });
  return clean;
 }catch(_){return{};}
}
function renderExamHistory(){
 const history=readExamHistory(),container=$("#examHistory"),entries=Object.entries(history).sort((a,b)=>b[1].best-a[1].best);
 container.replaceChildren();$("#examHistoryCount").textContent=String(entries.length);
 if(!entries.length){const empty=document.createElement("p");empty.className="student-empty";empty.textContent="Пока нет завершённых экзаменов. Пройди первую попытку — здесь появится лучший результат.";container.append(empty);return;}
 entries.forEach(([key,item])=>{
  const card=document.createElement("div");card.className="exam-history-card";
  const title=document.createElement("strong");title.textContent=key.replace("::"," · ");
  const best=document.createElement("span");best.textContent="Лучший результат: "+item.best+"%";
  const meta=document.createElement("small");meta.textContent="Попыток: "+item.attempts+" · Последний: "+item.last+"%";
  card.append(title,best,meta);container.append(card);
 });
}
function shuffleExamItems(items){
 const result=items.slice();
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
function startExam(questionSet){
 const course=$("#examCourse").value,level=$("#examLevel").value;
 const pool=lessons.filter(item=>Array.isArray(item.options)&&item.options.length>=2&&Number.isInteger(item.correct)&&item.correct>=0&&item.correct<item.options.length&&(course==="all"||item.course===course)&&(level==="all"||item.level===level));
 examQuestions=shuffleExamItems(Array.isArray(questionSet)?questionSet:pool).slice(0,Math.min(10,Array.isArray(questionSet)?questionSet.length:pool.length));
 examIndex=0;examScore=0;examAnswered=false;examMissed=[];examConfigKey=(course==="all"?"Смешанный экзамен":course)+"::"+(level==="all"?"Все уровни":level);
 $("#examResult").replaceChildren();$("#examResult").hidden=true;$("#examSettingsHint").textContent=pool.length+" доступных вопросов · в этой попытке: "+examQuestions.length;
 if(!examQuestions.length){$("#quizQuestion").textContent="Для выбранных параметров пока нет вопросов.";$("#quizOptions").replaceChildren();$("#quizFeedback").textContent="Выбери другое направление или сложность.";$("#examProgress").textContent="Нет вопросов";$("#examScore").textContent="Баллы: 0";$("#examTrackFill").style.width="0%";$("#nextExamQuestion").disabled=true;return;}
 renderExamQuestion();
}
function renderExamQuestion(){
 const question=examQuestions[examIndex];if(!question)return;
 $("#examProgress").textContent="Вопрос "+(examIndex+1)+" из "+examQuestions.length;
 $("#examScore").textContent="Баллы: "+examScore;
 $("#examTrackFill").style.width=(examIndex/examQuestions.length*100)+"%";
 $("#quizQuestion").textContent=question.question;$("#quizFeedback").textContent="Выбери один вариант ответа.";
 $("#nextExamQuestion").disabled=true;$("#nextExamQuestion").textContent=examIndex===examQuestions.length-1?"Завершить экзамен":"Следующий вопрос";
 const options=$("#quizOptions");options.replaceChildren();
 question.options.forEach((option,index)=>{const button=document.createElement("button");button.type="button";button.dataset.answer=String(index);button.textContent=option;options.append(button);});
 examAnswered=false;
}
function finishExam(){
 const percent=Math.round(examScore/examQuestions.length*100),history=readExamHistory(),previous=history[examConfigKey]||{attempts:0,best:0,last:0};
 history[examConfigKey]={attempts:Math.min(100000,previous.attempts+1),best:Math.max(previous.best,percent),last:percent};
 try{localStorage.setItem(examHistoryKey,JSON.stringify(history));}catch(_){}
 $("#examTrackFill").style.width="100%";$("#examProgress").textContent="Экзамен завершён";
 $("#quizQuestion").textContent="Результат: "+percent+"%";
 $("#quizOptions").replaceChildren();
 $("#quizFeedback").textContent="Правильных ответов: "+examScore+" из "+examQuestions.length+".";
 const result=$("#examResult");result.replaceChildren();result.hidden=false;
 const summary=document.createElement("p");
 summary.textContent=(percent>=90?"Превосходно! Отличное понимание материала.":percent>=70?"Хороший результат! Повтори темы, в которых ошибся.":percent>=50?"Неплохо. Продолжай практиковаться и попробуй ещё раз.":"Это только начало. Вернись к урокам и повтори основы.")+" Лучший результат для этого набора: "+history[examConfigKey].best+"%.";
 result.append(summary);
 if(examMissed.length){
  const heading=document.createElement("h4");heading.textContent="Разбор ошибок ("+examMissed.length+")";result.append(heading);
  examMissed.forEach((question,index)=>{
   const item=document.createElement("article");item.className="exam-review-item";
   const title=document.createElement("strong");title.textContent=(index+1)+". "+question.question;
   const answer=document.createElement("p");answer.textContent="Правильный ответ: "+question.options[question.correct];
   const explanation=document.createElement("small");explanation.textContent=question.explanation||"Вернись к соответствующему уроку и повтори тему.";
   item.append(title,answer,explanation);result.append(item);
  });
  const retry=document.createElement("button");retry.type="button";retry.className="small-btn";retry.textContent="Повторить только ошибки";
  retry.addEventListener("click",()=>startExam(examMissed.slice()));result.append(retry);
 }else{
  const perfect=document.createElement("p");perfect.textContent="Ошибок нет — отличный результат!";result.append(perfect);
 }
 $("#nextExamQuestion").disabled=true;$("#nextExamQuestion").textContent="Экзамен завершён";renderExamHistory();
}
$("#quizOptions").addEventListener("click",event=>{
 const button=event.target.closest("button[data-answer]");if(!button||examAnswered)return;
 const question=examQuestions[examIndex];if(!question)return;
 examAnswered=true;const chosen=Number(button.dataset.answer);
 [...$("#quizOptions").children].forEach((item,index)=>{item.disabled=true;if(index===question.correct)item.classList.add("correct");if(index===chosen&&chosen!==question.correct)item.classList.add("wrong");});
 recordExamAnswer(question,chosen===question.correct);renderExamTopicStats();
 if(chosen===question.correct){examScore++;$("#quizFeedback").textContent="Верно! "+question.explanation;}
 else {examMissed.push(question);$("#quizFeedback").textContent="Не совсем. Правильный ответ: "+question.options[question.correct]+". "+question.explanation;}
 $("#examScore").textContent="Баллы: "+examScore;$("#nextExamQuestion").disabled=false;
});
$("#nextExamQuestion").addEventListener("click",()=>{
 if(!examAnswered)return;
 if(examIndex<examQuestions.length-1){examIndex++;renderExamQuestion();return;}
 finishExam();
});
$("#retryQuiz").addEventListener("click",startExam);
$("#examTopicStats").addEventListener("click",event=>{const button=event.target.closest("button[data-topic]");if(!button)return;const topic=button.dataset.topic;const questions=lessons.filter(question=>topicForQuestion(question).key===topic);if(questions.length){$("#examCourse").value="all";$("#examLevel").value="all";startExam(questions);$("#examSettingsHint").textContent="Тренировка темы: "+topicForQuestion(questions[0]).label+" · "+questions.length+" вопросов.";}});
$("#examCourse").addEventListener("change",startExam);
$("#examLevel").addEventListener("change",startExam);
renderExamHistory();renderExamTopicStats();startExam();
$("#menuBtn").addEventListener("click", () => { const isOpen = $("#nav").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", String(isOpen)); });
$("#nav").addEventListener("click", event => { if (event.target.closest("a")) { $("#nav").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false"); } });


/* Полноценная HTML/CSS/JS лаборатория */
const webDefaults = {
 html: `<main class="card">
  <h1>Привет, CodeCraft!</h1>
  <p>Это моя первая веб-страница.</p>
  <button id="helloButton">Нажми меня</button>
  <p id="message"></p>
</main>`,
 css: `body { font-family: system-ui, sans-serif; padding: 24px; background: #eef2ff; }
.card { max-width: 440px; margin: 20px auto; padding: 24px; border-radius: 18px; background: white; box-shadow: 0 8px 30px #22335522; }
button { padding: 10px 14px; border: 0; border-radius: 9px; background: #146c57; color: white; }`,
 js: `document.querySelector("#helloButton").addEventListener("click", () => {
  document.querySelector("#message").textContent = "Отличная работа! JavaScript работает.";
});`
};
const webHtml=$("#webHtml"),webCss=$("#webCss"),webJs=$("#webJs"),webPreview=$("#webLabPreview");
function resetWebLab(){webHtml.value=webDefaults.html;webCss.value=webDefaults.css;webJs.value=webDefaults.js;saveDraft("webHtml",webHtml.value);saveDraft("webCss",webCss.value);saveDraft("webJs",webJs.value);runWebLab();}
function runWebLab(){
 const policy='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\';">';
 const safeCss=webCss.value.replace(/<\/style/gi, "<\\/style");
 const safeJs=webJs.value.replace(/<\/script/gi, "<\\/script");
 const documentText='<!doctype html><html lang="ru"><head><meta charset="utf-8">'+policy+'<meta name="viewport" content="width=device-width,initial-scale=1"><style>'+safeCss+'</style></head><body>'+webHtml.value+'<script>'+safeJs+'\n</script></body></html>';
 webPreview.srcdoc=documentText;
 $("#webLabStatus").textContent="Предпросмотр обновлён. Если страница не изменилась, проверь код и запусти ещё раз.";
}
$("#runWebLab").addEventListener("click",runWebLab);
$("#resetWebLab").addEventListener("click",resetWebLab);
[["webHtml",webHtml,"html"],["webCss",webCss,"css"],["webJs",webJs,"js"]].forEach(([key,field,defaultKey])=>{field.value=restoreDraft(key,webDefaults[defaultKey]);field.addEventListener("input",()=>saveDraft(key,field.value));});
runWebLab();

/* Python-тренажёр на Skulpt в отдельном iframe */
const pythonExamples={
 hello:'name = "CodeCraft"\nprint("Привет,", name)\nprint("Добро пожаловать в Python!")',
 loops:'for number in range(1, 6):\n    print("Шаг", number)',
 lists:'fruits = ["яблоко", "груша", "слива"]\nfruits.append("апельсин")\nfor fruit in fruits:\n    print(fruit)',
 functions:'def greet(name):\n    return "Привет, " + name\n\nprint(greet("CodeCraft"))'
};
const pythonEditor=$("#pythonCode"),pythonOutput=$("#pythonOutput"),pythonFrame=$("#pythonSandbox");
let pythonReady=false,pythonPending=null,pythonRequestId=0,activePythonExample=$("#pythonExample").value;
pythonFrame.addEventListener("load",()=>{pythonFrame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_PING"},"*");});
pythonEditor.value=restoreDraft("python:"+activePythonExample,pythonExamples[activePythonExample]||pythonEditor.value);
pythonEditor.addEventListener("input",()=>saveDraft("python:"+activePythonExample,pythonEditor.value));
$("#pythonExample").addEventListener("change",event=>{
 activePythonExample=event.target.value;
 pythonEditor.value=restoreDraft("python:"+activePythonExample,pythonExamples[activePythonExample]||pythonExamples.hello);
 pythonOutput.textContent="Выбран пример: "+event.target.options[event.target.selectedIndex].text;
 saveDraft("python:"+activePythonExample,pythonEditor.value);
});
$("#resetPython").addEventListener("click",()=>{
 pythonEditor.value=pythonExamples[activePythonExample]||pythonExamples.hello;
 saveDraft("python:"+activePythonExample,pythonEditor.value);
 pythonOutput.textContent="Пример восстановлен.";
});
$("#clearPython").addEventListener("click",()=>{pythonOutput.textContent="Вывод очищен.";});
const MAX_PYTHON_CODE=100000,MAX_PYTHON_OUTPUT=50100;
function resetPythonSandbox(){
 if(pythonPending)clearTimeout(pythonPending.timer);
 pythonPending=null;pythonReady=false;$("#runPython").disabled=false;
 pythonFrame.src="python-sandbox.html";
 $("#pythonStatus").textContent="Перезапускаю Python-среду…";
}
$("#retryPython").addEventListener("click",resetPythonSandbox);
window.addEventListener("message",event=>{
 if(event.source!==pythonFrame.contentWindow||!event.data||typeof event.data!=="object")return;
 if(event.data.type==="CODECRAFT_PYTHON_READY"){
  pythonReady=true;$("#pythonStatus").textContent="Интерпретатор готов. Код выполняется локально в браузере.";
  return;
 }
 if(event.data.type==="CODECRAFT_PYTHON_ERROR"){
  pythonReady=false;
  if(pythonPending){clearTimeout(pythonPending.timer);pythonPending=null;$("#runPython").disabled=false;}
  $("#pythonStatus").textContent=String(event.data.message||"Не удалось загрузить Python.").slice(0,500);
  return;
 }
 if(event.data.type!=="CODECRAFT_PYTHON_RESULT"||!pythonPending||event.data.id!==pythonPending.id)return;
 clearTimeout(pythonPending.timer);
 const result=typeof event.data.output==="string"?event.data.output.slice(0,MAX_PYTHON_OUTPUT):"";
 const error=typeof event.data.error==="string"?event.data.error.slice(0,4000):"";
 pythonOutput.textContent=result+(error?"\nОшибка: "+error:"");
 $("#runPython").disabled=false;$("#pythonStatus").textContent=error?"Выполнение завершилось с ошибкой.":"Выполнение завершено.";
 pythonPending=null;
});
pythonFrame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_PING"},"*");
$("#runPython").addEventListener("click",()=>{
 if(pythonPending)return;
 if(!pythonReady){$("#pythonStatus").textContent="Python ещё загружается или CDN недоступен. Проверь интернет и нажми «Перезапустить среду».";return;}
 if(pythonEditor.value.length>MAX_PYTHON_CODE){pythonOutput.textContent="Код слишком большой. Максимальный размер — 100 000 символов.";return;}
 const id=++pythonRequestId;$("#runPython").disabled=true;pythonOutput.textContent="Выполняю Python-код…";
 const timer=setTimeout(()=>{
  if(!pythonPending||pythonPending.id!==id)return;
  pythonPending=null;$("#runPython").disabled=false;pythonOutput.textContent="Превышено время ожидания (7 с). Python-среда перезапущена.";
  resetPythonSandbox();
 },7000);
 pythonPending={id,timer};
 pythonFrame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_RUN",id,code:pythonEditor.value},"*");
});

const challengeTasks = [
 {id:"html-heading",language:"HTML",file:"index.html",title:"Создай заголовок",description:"Добавь на страницу главный заголовок первого уровня и абзац с приветствием. Используй реальные HTML-теги.",hint:"Нужны открывающий и закрывающий теги <h1> и <p>. Текст помести между ними.",starter:"<!-- Напиши здесь HTML -->\n",checks:[["Заголовок h1",code=>/<h1\b[^>]*>[\s\S]*?<\/h1\s*>/i.test(code)],["Абзац p",code=>/<p\b[^>]*>[\s\S]*?<\/p\s*>/i.test(code)],["Заголовок содержит текст",code=>/<h1\b[^>]*>\s*[^<\s][\s\S]*?<\/h1\s*>/i.test(code)]]},
 {id:"html-link",language:"HTML",file:"index.html",title:"Добавь ссылку",description:"Создай ссылку на https://example.com с понятным текстом. Ссылка должна содержать href.",hint:"Используй <a href=\"https://example.com\">Текст ссылки</a>.",starter:"<!-- Создай ссылку -->\n",checks:[["Тег a",code=>/<a\b[^>]*>[\s\S]*?<\/a\s*>/i.test(code)],["Атрибут href",code=>/<a\b[^>]*\bhref\s*=\s*(['\"])https:\/\/example\.com\1/i.test(code)],["Непустой текст ссылки",code=>/<a\b[^>]*>\s*[^<\s][\s\S]*?<\/a\s*>/i.test(code)]]},
 {id:"css-flex",language:"CSS",file:"style.css",title:"Включи Flexbox",description:"Напиши CSS-правило для .cards: включи Flexbox и добавь расстояние между карточками.",hint:"Внутри .cards нужны display: flex и gap с любым ненулевым значением.",starter:".cards {\n  /* Твои стили */\n}\n",checks:[["Селектор .cards",code=>/\.cards\s*\{[\s\S]*?\}/i.test(code)],["display: flex",code=>/\.cards\s*\{[^}]*display\s*:\s*flex\s*;?/i.test(code)],["Отступ gap",code=>/\.cards\s*\{[^}]*gap\s*:\s*(?!0(?:px|rem|em|%)?\s*;?)[^;]+;?/i.test(code)]]},
 {id:"js-function",language:"JavaScript",file:"script.js",title:"Напиши функцию",description:"Создай функцию double, которая принимает число и возвращает его, умноженное на два. Добавь вызов функции.",hint:"Подойдут function double(number) и return number * 2. В конце вызови double(5).",starter:"// Напиши функцию double\n",checks:[["Объявлена функция double",code=>/function\s+double\s*\(/.test(code)],["Есть return",code=>/\breturn\b/.test(code)],["Умножение на 2",code=>/\*\s*2\b/.test(code)],["Есть вызов double",code=>/\bdouble\s*\(/g.test(code.replace(/function\s+double\s*\(/,""))]]},
 {id:"js-condition",language:"JavaScript",file:"script.js",title:"Добавь условие",description:"Создай переменную score и условие: если score не меньше 60, выведи «Зачёт», иначе — «Попробуй ещё».",hint:"Используй if, else, сравнение >= 60 и console.log().",starter:"const score = 75;\n// Добавь условие\n",checks:[["Условие if",code=>/\bif\s*\(/.test(code)],["Ветка else",code=>/\belse\b/.test(code)],["Порог 60",code=>/>=\s*60/.test(code)],["Вывод результата",code=>/console\s*\.\s*log\s*\(/.test(code)]]}
 ,
 {id:"html-semantic",language:"HTML",file:"index.html",title:"Собери семантический блок",description:"Создай структуру страницы с header, main и footer. Внутри main размести заголовок h1.",hint:"Используй три семантических элемента и не забудь закрывающие теги.",starter:"<!-- Семантическая структура -->\n",checks:[["Шапка header",code=>/<header\b[^>]*>[\s\S]*?<\/header\s*>/i.test(code)],["Основная область main",code=>/<main\b[^>]*>[\s\S]*?<\/main\s*>/i.test(code)],["Подвал footer",code=>/<footer\b[^>]*>[\s\S]*?<\/footer\s*>/i.test(code)],["Заголовок h1",code=>/<h1\b[^>]*>[\s\S]*?<\/h1\s*>/i.test(code)]]},
 {id:"css-grid",language:"CSS",file:"style.css",title:"Создай сетку Grid",description:"Для .gallery включи CSS Grid, задай две колонки и расстояние между элементами.",hint:"Нужны display: grid, grid-template-columns и gap.",starter:".gallery {\n  /* Настрой сетку */\n}\n",checks:[["Селектор .gallery",code=>/\.gallery\s*\{[\s\S]*?\}/i.test(code)],["display: grid",code=>/\.gallery\s*\{[^}]*display\s*:\s*grid\s*;?/i.test(code)],["Колонки",code=>/\.gallery\s*\{[^}]*grid-template-columns\s*:/i.test(code)],["Промежуток gap",code=>/\.gallery\s*\{[^}]*gap\s*:\s*(?!0(?:px|rem|em|%)?\s*;?)[^;]+;?/i.test(code)]]},
 {id:"js-array",language:"JavaScript",file:"script.js",title:"Поработай с массивом",description:"Создай массив fruits минимум с тремя элементами и добавь в конец ещё один элемент методом push.",hint:"Объяви const fruits = [...] и вызови fruits.push(...).",starter:"// Создай массив и добавь элемент\n",checks:[["Массив fruits",code=>/(?:const|let|var)\s+fruits\s*=\s*\[[\s\S]*?\]/.test(code)],["Не менее трёх элементов",code=>{const m=code.match(/(?:const|let|var)\s+fruits\s*=\s*\[([\s\S]*?)\]/);return !!m&&m[1].split(",").filter(x=>x.trim()).length>=3;}],["Вызов push",code=>/fruits\s*\.\s*push\s*\(/.test(code)]]},
 {id:"py-loop",language:"Python",file:"main.py",title:"Напиши цикл Python",description:"Создай цикл for, который перебирает range(5) и выводит каждое число через print.",hint:"Шаблон: for number in range(5): затем строка с отступом print(number).",starter:"# Напиши цикл for\n",checks:[["Цикл for",code=>/\bfor\s+\w+\s+in\s+/.test(code)],["Диапазон range(5)",code=>/\brange\s*\(\s*5\s*\)/.test(code)],["Вывод print",code=>/\bprint\s*\(/.test(code)],["Есть отступ внутри цикла",code=>/\n[ \t]+print\s*\(/.test(code)]]},
 {id:"py-dict",language:"Python",file:"main.py",title:"Создай словарь",description:"Создай словарь profile с ключами name и level, затем выведи имя через profile['name'].",hint:"Пример: profile = {'name': 'Аня', 'level': 1}.",starter:"# Создай словарь profile\n",checks:[["Словарь profile",code=>/profile\s*=\s*\{[\s\S]*?\}/.test(code)],["Ключ name",code=>/['"]name['"]\s*:/.test(code)],["Ключ level",code=>/['"]level['"]\s*:/.test(code)],["Доступ profile['name']",code=>/profile\s*\[\s*['"]name['"]\s*\]/.test(code)]]}
 ,
 {id:"html-fix-image",mode:"debug",language:"HTML",file:"index.html",title:"Исправь изображение",description:"У изображения нет альтернативного текста. Исправь разметку, чтобы скринридеры могли понять его содержимое.",hint:"Добавь осмысленный атрибут alt внутрь тега img.",starter:'<img src="avatar.jpg">\n',checks:[["Изображение img",code=>/<img\b[^>]*>/i.test(code)],["Непустой alt",code=>/<img\b[^>]*\balt\s*=\s*(['"])(?!\s*\1)[^'"]+\1/i.test(code)]]},
 {id:"html-fix-form",mode:"debug",language:"HTML",file:"index.html",title:"Свяжи подпись с полем",description:"У поля есть id, но подпись не связана с ним. Исправь label, чтобы нажатие на подпись переводило фокус в поле.",hint:"Значение for у label должно совпадать с id элемента input.",starter:'<label>Электронная почта</label>\n<input id="email" type="email">\n',checks:[["Подпись label",code=>/<label\b[^>]*>/i.test(code)],["Связь for=email",code=>/<label\b[^>]*\bfor\s*=\s*(['"])email\1/i.test(code)],["Поле с id=email",code=>/<input\b[^>]*\bid\s*=\s*(['"])email\1/i.test(code)]]},
 {id:"css-fix-box",mode:"debug",language:"CSS",file:"style.css",title:"Исправь расчёт ширины",description:"Карточка становится шире контейнера из-за padding и border. Добавь правило, которое делает расчёт размеров предсказуемым.",hint:"Используй box-sizing: border-box для универсального селектора *.",starter:"* {\n  /* Исправь модель размеров */\n}\n.card { width: 100%; padding: 24px; border: 2px solid; }\n",checks:[["Универсальный селектор",code=>/\*\s*\{[^}]*box-sizing\s*:/i.test(code)],["box-sizing: border-box",code=>/\*\s*\{[^}]*box-sizing\s*:\s*border-box/i.test(code)]]},
 {id:"css-fix-mobile",mode:"debug",language:"CSS",file:"style.css",title:"Почини мобильную сетку",description:"На узком экране две колонки остаются слишком узкими. Добавь media query, чтобы карточки переходили в одну колонку на телефонах.",hint:"Внутри @media с max-width до 600px задай .cards grid-template-columns: 1fr.",starter:".cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }\n/* На телефоне сетка должна стать одноколоночной */\n",checks:[["Media query для узкого экрана",code=>/@media\s*\([^)]*max-width\s*:\s*(?:[0-5]?\d\d|600)px/i.test(code)],["Одна колонка .cards",code=>/@media[^{]*\{[\s\S]*?\.cards\s*\{[^}]*grid-template-columns\s*:\s*1fr/i.test(code)]]},
 {id:"css-fix-focus",mode:"debug",language:"CSS",file:"style.css",title:"Верни видимый фокус",description:"У кнопок убрали outline, поэтому пользователям клавиатуры трудно понять, какой элемент выбран. Добавь заметный стиль фокуса.",hint:"Создай правило button:focus-visible с outline, отличным от none.",starter:"button:focus { outline: none; }\n/* Добавь доступный стиль фокуса */\n",checks:[["Правило :focus-visible",code=>/button\s*:focus-visible\s*\{/i.test(code)],["Видимый outline",code=>/button\s*:focus-visible\s*\{[^}]*outline\s*:\s*(?!none)[^;}]+/i.test(code)]]},
 {id:"js-fix-equality",mode:"debug",language:"JavaScript",file:"script.js",title:"Исправь сравнение",description:"Условие присваивает значение вместо сравнения. Исправь проверку так, чтобы она сравнивала status со строкой ready.",hint:"Для строгого сравнения используй ===.",starter:'const status = "ready";\nif (status = "ready") {\n  console.log("Можно продолжать");\n}\n',checks:[["Условие if",code=>/if\s*\(/.test(code)],["Строгое сравнение status",code=>/status\s*===\s*["']ready["']/.test(code)],["Нет присваивания в условии",code=>!/if\s*\([^)]*status\s*=(?!=)/.test(code)]]},
 {id:"js-fix-event",mode:"debug",language:"JavaScript",file:"script.js",title:"Почини обработчик кнопки",description:"Код вызывает несуществующий метод addClickListener. Замени его стандартным обработчиком события клика.",hint:'Нужен addEventListener("click", handler).',starter:'const button = document.querySelector("#save");\nbutton.addClickListener("click", () => {\n  console.log("Сохранено");\n});\n',checks:[["Метод addEventListener",code=>/\.addEventListener\s*\(/.test(code)],["Событие click",code=>/addEventListener\s*\(\s*["']click["']/.test(code)],["Старый метод удалён",code=>!/addClickListener/.test(code)]]},
 {id:"js-fix-last-item",mode:"debug",language:"JavaScript",file:"script.js",title:"Исправь последний индекс",description:"Функция должна вернуть последний элемент массива. Сейчас индекс выходит за границы массива.",hint:"Последний индекс массива — length - 1.",starter:"function lastItem(items) {\n  return items[items.length];\n}\n",checks:[["Функция lastItem",code=>/function\s+lastItem\s*\(/.test(code)],["Индекс length - 1",code=>/items\[\s*items\.length\s*-\s*1\s*\]/.test(code)],["Нет выхода за границы",code=>!/items\[\s*items\.length\s*\]/.test(code)]]},
 {id:"py-fix-range",mode:"debug",language:"Python",file:"main.py",title:"Исправь границы range",description:"Цикл должен вывести числа от 1 до 5 включительно. Сейчас верхняя граница range не включает пятёрку.",hint:"В range верхняя граница не включается, поэтому используй range(1, 6).",starter:"for number in range(1, 5):\n    print(number)\n",checks:[["Цикл for",code=>/for\s+\w+\s+in\s+range/.test(code)],["Диапазон от 1 до 6",code=>/range\s*\(\s*1\s*,\s*6\s*\)/.test(code)],["Вывод print",code=>/print\s*\(/.test(code)]]},
 {id:"py-fix-dict",mode:"debug",language:"Python",file:"main.py",title:"Безопасно прочитай ключ",description:'Ключ city может отсутствовать. Исправь доступ к словарю так, чтобы программа вывела значение по умолчанию "Не указан".',hint:'Используй метод profile.get("city", "Не указан").',starter:'profile = {"name": "Аня"}\nprint(profile["city"])\n',checks:[["Метод get",code=>/profile\.get\s*\(/.test(code)],["Ключ city",code=>/get\s*\(\s*["']city["']/.test(code)],["Значение по умолчанию",code=>/get\s*\([^)]*,\s*["']Не указан["']/.test(code)]]}

];
let activeChallenge=challengeTasks[0],completedChallenges=[];
try{const saved=JSON.parse(localStorage.getItem("cc_challenges")||"[]");if(Array.isArray(saved))completedChallenges=[...new Set(saved.filter(id=>challengeTasks.some(task=>task.id===id)))];}catch(_){}
function renderChallengeMenu(){const menu=$("#challengeMenu");menu.replaceChildren();challengeTasks.forEach(task=>{const button=document.createElement("button");button.type="button";button.className="challenge-pick"+(task.id===activeChallenge.id?" active":"");const title=document.createElement("strong");title.textContent=(completedChallenges.includes(task.id)?"✓ ":"")+task.title;const meta=document.createElement("small");meta.textContent=task.language+" · "+(task.mode==="debug"?"Исправление ошибки":"Практика")+" · "+(completedChallenges.includes(task.id)?"Решено":"30 XP");button.append(title,meta);button.addEventListener("click",()=>selectChallenge(task.id));menu.append(button);});}
function selectChallenge(id){const task=challengeTasks.find(item=>item.id===id);if(!task)return;activeChallenge=task;$("#challengeLanguage").textContent=task.language;$("#challengeTitle").textContent=task.title;$("#challengeDescription").textContent=task.description;$("#challengeHint").textContent="Подсказка: "+task.hint;$("#challengeFile").textContent=task.file;$("#challengeCode").value=restoreDraft("challenge:"+task.id,task.starter);$("#challengeResult").textContent=completedChallenges.includes(task.id)?"Задание уже решено. Можешь улучшить свой код!":"Напиши решение и запусти проверку.";$("#challengeResult").className="challenge-result";$("#challengeChecks").replaceChildren();renderChallengeMenu();}
function validateChallenge(){const code=$("#challengeCode").value;const checks=activeChallenge.checks.map(([label,test])=>({label,pass:test(code)}));const list=$("#challengeChecks");list.replaceChildren();checks.forEach(check=>{const item=document.createElement("div");item.className="challenge-check "+(check.pass?"pass":"fail");item.textContent=(check.pass?"✓ ":"○ ")+check.label;list.append(item);});const passed=checks.every(item=>item.pass);const result=$("#challengeResult");result.className="challenge-result "+(passed?"success":"failure");if(passed){const isNew=!completedChallenges.includes(activeChallenge.id);if(isNew){completedChallenges.push(activeChallenge.id);try{localStorage.setItem("cc_challenges",JSON.stringify(completedChallenges));}catch(_){}renderAchievements();renderChallengeMenu();renderStudentDashboard();}result.textContent=(activeChallenge.mode==="debug"?"Отлично! Ошибка исправлена.":"Отлично! Все проверки пройдены.")+(isNew?" +30 XP начислено.":" Задание уже было засчитано.");}else{result.textContent="Пока не всё готово: исправь отмеченные пункты и проверь ещё раз.";}}
$("#challengeCode").addEventListener("input",()=>saveDraft("challenge:"+activeChallenge.id,$("#challengeCode").value));
$("#checkChallenge").addEventListener("click",validateChallenge);
$("#challengeReset").addEventListener("click",()=>{$("#challengeCode").value=activeChallenge.starter;saveDraft("challenge:"+activeChallenge.id,activeChallenge.starter);$("#challengeChecks").replaceChildren();$("#challengeResult").className="challenge-result";$("#challengeResult").textContent="Пример восстановлен. Попробуй решить задание.";});
$("#challengeHintButton").addEventListener("click",()=>{$("#challengeHint").hidden=!$("#challengeHint").hidden;});
renderChallengeMenu();selectChallenge(activeChallenge.id);
const projectTemplates = [
 {id:"profile",checks:[["Заголовок h1",code=>code.includes("<h1")&&code.includes("</h1>")],["Абзац с описанием",code=>code.includes("<p")&&code.includes("</p>")],["Стили карточки .card",code=>code.includes(".card{")||code.includes(".card {")],["Ссылка на странице",code=>code.includes("<a ")&&code.includes("href=")]],title:"Карточка профиля",level:"Начальный",description:"Собери карточку с именем, описанием и ссылкой.",tasks:["Добавь своё имя и описание.","Используй заголовок и абзац.","Оформи карточку через CSS.","Сделай ссылку заметной."],code:`<main class="card">
  <div class="avatar">Я</div>
  <h1>Привет! Я разработчик</h1>
  <p>Изучаю HTML и CSS и создаю первые сайты.</p>
  <a href="#works">Мои проекты</a>
</main>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef2ff;font-family:Arial,sans-serif}
.card{width:min(340px,90%);padding:28px;text-align:center;background:white;border-radius:20px;box-shadow:0 12px 35px #25345a22}
.avatar{margin:auto;width:72px;height:72px;display:grid;place-items:center;border-radius:50%;background:#d8fff1;color:#12634d;font-size:28px;font-weight:bold}
a{display:inline-block;margin-top:10px;padding:10px 16px;border-radius:9px;background:#12634d;color:white;text-decoration:none}
</style>`},
 {id:"portfolio",checks:[["Шапка сайта",code=>code.includes("<header")&&code.includes("</header>")],["Раздел с заголовком",code=>code.includes("<section")&&code.includes("<h2")],["Не менее двух карточек",code=>(code.match(/<article/g)||[]).length>=2],["Сетка CSS Grid",code=>code.includes("display:grid")||code.includes("display: grid")]],title:"Мини-портфолио",level:"Начальный+",description:"Сделай страницу, на которой представишь себя и свои работы.",tasks:["Создай шапку с названием.","Добавь раздел «Обо мне».","Покажи минимум две работы.","Размести карточки через CSS Grid."],code:`<header><h1>Моё портфолио</h1><p>Первые шаги в веб-разработке</p></header>
<main>
 <section><h2>Обо мне</h2><p>Я учусь создавать сайты и люблю экспериментировать.</p></section>
 <section class="works"><article><h3>Проект 1</h3><p>Моя первая страница.</p></article><article><h3>Проект 2</h3><p>Моя вторая идея.</p></article></section>
</main>
<style>
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#17243a}
header{padding:40px 7%;background:#17243a;color:white}
main{max-width:850px;margin:30px auto;padding:0 18px}
.works{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
article{padding:18px;background:white;border-radius:14px;box-shadow:0 5px 18px #17243a12}
</style>`},
 {id:"landing",checks:[["Главный заголовок",code=>code.includes("<h1")&&code.includes("</h1>")],["Кнопка действия",code=>code.includes('class="cta"')],["Три блока преимуществ",code=>(code.match(/<article/g)||[]).length>=3],["Адаптивная сетка",code=>code.includes("auto-fit")&&code.includes("minmax")]],title:"Страница продукта",level:"Средний",description:"Собери презентационную страницу выдуманного приложения или сервиса.",tasks:["Сформулируй заголовок и пользу продукта.","Добавь заметную кнопку действия.","Создай блок из трёх преимуществ.","Проверь адаптивность на узком экране."],code:`<header>
 <nav><strong>FocusApp</strong><a href="#features">Возможности</a></nav>
 <section class="hero"><p>Меньше хаоса — больше результата</p><h1>Планируй день спокойно</h1><a class="cta" href="#features">Посмотреть возможности</a></section>
</header>
<main id="features" class="features">
 <article><h2>Просто</h2><p>Понятный список задач без лишнего.</p></article>
 <article><h2>Удобно</h2><p>Всё важное собрано в одном месте.</p></article>
 <article><h2>Гибко</h2><p>Настраивай план под свой ритм.</p></article>
</main>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#17243a}
header{padding:22px 7%;background:#101d36;color:white}
nav{display:flex;justify-content:space-between}nav a{color:#a9f3dc}
.hero{padding:65px 0;max-width:650px}.hero h1{font-size:clamp(32px,6vw,56px)}
.cta{display:inline-block;padding:12px 18px;border-radius:9px;background:#78e6c3;color:#102033;text-decoration:none;font-weight:bold}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;max-width:950px;margin:35px auto;padding:0 18px}
article{padding:20px;border:1px solid #dce4ef;border-radius:14px}
</style>`},
{"id":"taskboard","title":"Доска задач","level":"Средний","description":"Создай небольшую доску задач: карточки, статусы и адаптивную сетку. Отмечай этапы по мере выполнения.","tasks":["Спроектируй семантическую структуру доски и карточек.","Собери адаптивную сетку через CSS Grid.","Добавь состояния карточек и заметный клавиатурный фокус.","Проверь длинные названия и узкий экран."],"code":"<main class=\"board\">\n <header><p>ПЛАНИРОВАНИЕ</p><h1>Моя доска задач</h1></header>\n <section class=\"columns\" aria-label=\"Статусы задач\">\n  <article><h2>Запланировано</h2><p>Собрать структуру страницы</p></article>\n  <article><h2>В работе</h2><p>Настроить адаптивную сетку</p></article>\n  <article><h2>Готово</h2><p>Проверить фокус клавиатуры</p></article>\n </section>\n</main>\n<style>\n*{box-sizing:border-box}body{margin:0;padding:24px;background:#f2f6fb;color:#17243a;font:16px Arial,sans-serif}\n.board{max-width:1000px;margin:auto}.columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px}\narticle{padding:18px;background:white;border:1px solid #dce4ef;border-radius:14px;overflow-wrap:anywhere}\narticle:focus-visible{outline:3px solid #16745d;outline-offset:3px}\n</style>","checks":[["Есть заголовок и карточки",code=>/<h1\b[\s\S]*?<\/h1>/i.test(code)&&/<article\b[\s\S]*?<\/article>/i.test(code)],["Не менее трёх карточек",code=>(code.match(/<article\b/gi)||[]).length>=3],["Адаптивный Grid",code=>/display\s*:\s*grid/i.test(code)&&/repeat\s*\(|auto-fit|auto-fill/i.test(code)],["Фокус клавиатуры",code=>/focus-visible|:focus\b/i.test(code)]]},
{"id":"quiz-builder","title":"Карточки викторины","level":"Средний","description":"Сверстай экран викторины с вариантами ответа, счётом и понятным состоянием выбора.","tasks":["Добавь вопрос и группу вариантов ответа.","Используй кнопки с понятными подписями.","Оформи выбранное и правильное состояние.","Сделай компоновку удобной на телефоне."],"code":"<main class=\"quiz\">\n <p class=\"eyebrow\">ВОПРОС 01 · HTML</p><h1>Что создаёт структуру страницы?</h1>\n <div class=\"answers\">\n  <button type=\"button\">HTML</button><button type=\"button\">CSS</button>\n  <button type=\"button\">Python</button><button type=\"button\">SQL</button>\n </div><p class=\"score\">Счёт: 0 из 1</p>\n</main>\n<style>\n*{box-sizing:border-box}body{margin:0;padding:24px;background:#eef3f8;color:#17243a;font:16px Arial,sans-serif}\n.quiz{max-width:620px;margin:5vh auto;padding:24px;background:white;border-radius:18px}\n.answers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\nbutton{padding:14px;border:1px solid #9aabc0;border-radius:10px;background:#f5f8fc;color:#17243a}\nbutton:focus-visible{outline:3px solid #16745d;outline-offset:3px}.score{font-weight:bold}\n@media(max-width:420px){.answers{grid-template-columns:1fr}.quiz{padding:16px}}\n</style>","checks":[["Заголовок вопроса",code=>/<h1\b[\s\S]*?<\/h1>/i.test(code)||/<h2\b[\s\S]*?<\/h2>/i.test(code)],["Четыре варианта ответа",code=>(code.match(/<button\b/gi)||[]).length>=4],["Есть счёт или статус",code=>/сч[её]т|балл|результат|статус/i.test(code)],["Адаптивная компоновка",code=>/@media|auto-fit|flex-wrap/i.test(code)]]},
{"id":"data-dashboard","title":"Панель показателей","level":"Средний","description":"Собери информационную панель с показателями, прогрессом и аккуратным отображением данных.","tasks":["Разметь заголовок и три показателя.","Покажи прогресс с текстовой подписью.","Используй Grid и minmax для карточек.","Проверь контраст и перенос длинных значений."],"code":"<main class=\"dashboard\">\n <h1>Мой учебный прогресс</h1>\n <section class=\"metrics\">\n  <article class=\"metric\"><span>Уроки</span><strong>18 / 44</strong></article>\n  <article class=\"metric\"><span>Проекты</span><strong>2 / 6</strong></article>\n  <article class=\"metric\"><span>Опыт</span><strong>420 XP</strong></article>\n </section>\n <label for=\"progress\">Общий прогресс</label><progress id=\"progress\" value=\"41\" max=\"100\">41%</progress>\n</main>\n<style>\n*{box-sizing:border-box}body{margin:0;padding:24px;background:#eef3f8;color:#17243a;font:16px Arial,sans-serif}\n.dashboard{max-width:900px;margin:auto}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:14px}\n.metric{display:grid;gap:8px;padding:20px;background:white;border:1px solid #dce4ef;border-radius:14px;min-width:0;overflow-wrap:anywhere}\n.metric strong{font-size:clamp(20px,4vw,30px)}progress{display:block;width:100%;height:14px;margin-top:10px}\n</style>","checks":[["Три показателя",code=>(code.match(/class=["']metric["']/gi)||[]).length>=3],["Индикатор прогресса",code=>/<progress\b/i.test(code)||/role=["']progressbar["']/i.test(code)],["Grid с minmax",code=>/display\s*:\s*grid/i.test(code)&&/minmax\s*\(/i.test(code)],["Подписи показателей",code=>/урок|проект|опыт|xp/i.test(code)]]}
];
let activeProject=projectTemplates[0], completedProjects=[];
try{const saved=JSON.parse(localStorage.getItem("cc_projects")||"[]");if(Array.isArray(saved))completedProjects=[...new Set(saved.filter(id=>projectTemplates.some(p=>p.id===id)))];}catch(_){}
function updateProjectStatus(){const done=completedProjects.includes(activeProject.id);$("#projectStatus").textContent=done?"Проект успешно проверен и сохранён ✓":"Выполни все критерии и нажми «Проверить проект».";$("#completeProject").textContent=done?"Проверить ещё раз":"Проверить проект";}
function renderProjectTasks(){const list=$("#projectTasks");list.replaceChildren();const completed=projectSteps[activeProject.id]||[];activeProject.tasks.forEach((task,index)=>{const li=document.createElement("li");const label=document.createElement("label");label.className="project-phase";const input=document.createElement("input");input.type="checkbox";input.checked=completed.includes(index);input.setAttribute("aria-label","Этап "+(index+1)+": "+task);const text=document.createElement("span");text.textContent=task;input.addEventListener("change",()=>{const next=new Set(projectSteps[activeProject.id]||[]);if(input.checked)next.add(index);else next.delete(index);projectSteps[activeProject.id]=[...next].sort((a,b)=>a-b);try{localStorage.setItem("cc_project_steps_v1",JSON.stringify(projectSteps));}catch(_){}updateProjectPhaseStatus();});label.append(input,text);li.append(label);list.append(li);});updateProjectPhaseStatus();}
function updateProjectPhaseStatus(){const done=(projectSteps[activeProject.id]||[]).length,total=activeProject.tasks.length;$("#projectPhaseStatus").textContent="Этапы проекта: "+done+" из "+total+" отмечено";}
function validateProject(){
 const checks=activeProject.checks.map(([label,test])=>({label,pass:test($("#projectCode").value)}));
 const list=$("#projectChecks");list.replaceChildren();
 checks.forEach(check=>{const item=document.createElement("div");item.className="project-check "+(check.pass?"pass":"fail");item.textContent=(check.pass?"✓ ":"○ ")+check.label;list.append(item);});
 const passed=checks.every(item=>item.pass),isNew=!completedProjects.includes(activeProject.id);
 if(passed&&isNew){completedProjects.push(activeProject.id);try{localStorage.setItem("cc_projects",JSON.stringify(completedProjects));}catch(_){}renderAchievements();renderProjectCards();renderStudentDashboard();}
 $("#projectStatus").textContent=passed?(isNew?"Отлично! Все критерии выполнены. Начислено 50 XP.":"Все критерии по-прежнему выполнены ✓"):"Пока не всё готово. Исправь пункты без галочки и проверь снова.";
 $("#projectStatus").classList.toggle("success",passed);$("#projectStatus").classList.toggle("failure",!passed);
}
function renderProjectCards(){const grid=$("#projectGrid");grid.replaceChildren();projectTemplates.forEach(project=>{const card=document.createElement("button");card.type="button";card.className="project-card"+(project.id===activeProject.id?" active":"");const title=document.createElement("strong");title.textContent=project.title;const meta=document.createElement("small");meta.textContent=project.level+(completedProjects.includes(project.id)?" · ✓ Готово":" · "+project.tasks.length+" задачи");card.append(title,meta);card.addEventListener("click",()=>selectProject(project.id));grid.append(card);});}
function renderProjectPreview(){const policy="<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'\">";const doc="<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\">"+policy+"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{padding:12px}</style></head><body>"+$("#projectCode").value+"</body></html>";$("#projectPreview").srcdoc=doc;}
function selectProject(id){const project=projectTemplates.find(item=>item.id===id);if(!project)return;activeProject=project;$("#projectChecks").replaceChildren();$("#projectStatus").classList.remove("success","failure");$("#projectLevel").textContent="Практика · "+project.level;$("#projectTitle").textContent=project.title;$("#projectDescription").textContent=project.description;renderProjectTasks();$("#projectCode").value=restoreDraft("project:"+project.id,project.code);updateProjectStatus();renderProjectCards();renderProjectPreview();}
$("#projectCode").addEventListener("input",()=>saveDraft("project:"+activeProject.id,$("#projectCode").value));
$("#previewProject").addEventListener("click",renderProjectPreview);
$("#resetProject").addEventListener("click",()=>{$("#projectCode").value=activeProject.code;saveDraft("project:"+activeProject.id,activeProject.code);renderProjectPreview();});
$("#completeProject").addEventListener("click",validateProject);
renderProjectCards();selectProject(activeProject.id);
// Мобильная рабочая область веб-лаборатории
let activeLabPanel="html",editorFontSize=13;
const labPanelNames=["html","css","js","preview"];
function selectLabPanel(panel){
 if(!labPanelNames.includes(panel))return;
 activeLabPanel=panel;
 document.querySelectorAll("[data-lab-panel]").forEach(button=>{
  const active=button.dataset.labPanel===panel;
  button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));
 });
 document.querySelectorAll("[data-lab-panel-content]").forEach(node=>{
  node.classList.toggle("mobile-active",node.dataset.labPanelContent===panel);
 });
 const editorPanel=$(".web-editors");
 ["html","css","js"].forEach(name=>editorPanel.classList.toggle("panel-"+name+"-active",panel===name));
}
document.querySelectorAll("[data-lab-panel]").forEach(button=>button.addEventListener("click",()=>selectLabPanel(button.dataset.labPanel)));
function applyEditorFontSize(){
 ["#webHtml","#webCss","#webJs"].forEach(selector=>$(selector).style.fontSize=editorFontSize+"px");
 $("#editorFontSize").textContent=editorFontSize+" px";
}
$("#editorFontDown").addEventListener("click",()=>{editorFontSize=Math.max(11,editorFontSize-1);applyEditorFontSize();});
$("#editorFontUp").addEventListener("click",()=>{editorFontSize=Math.min(20,editorFontSize+1);applyEditorFontSize();});
["#webHtml","#webCss","#webJs"].forEach(selector=>{
 const editor=$(selector);
 editor.addEventListener("keydown",event=>{
  if(event.key==="Tab"){
   event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;
   editor.setRangeText("  ",start,end,"end");
   editor.dispatchEvent(new Event("input",{bubbles:true}));
  }else if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){
   event.preventDefault();$("#runWebLab").click();
  }
 });
});
selectLabPanel("html");applyEditorFontSize();
const connectionStatus=$("#connectionStatus");
function updateConnectionStatus(){
 if(!connectionStatus)return;
 const online=navigator.onLine;
 connectionStatus.textContent=online?"Онлайн":"Офлайн · доступен сохранённый контент";
 connectionStatus.classList.toggle("offline",!online);
}
window.addEventListener("online",updateConnectionStatus);
window.addEventListener("offline",updateConnectionStatus);
updateConnectionStatus();
if("serviceWorker" in navigator&&location.protocol!=="file:"){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
showLesson(0); progress(); renderStudentDashboard();
})();