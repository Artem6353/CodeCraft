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
 const xp=done.length*20+completedProjects.length*50+completedChallenges.length*30;
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
function safeStoredArray(key,allowed){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==="string"&&allowed.has(id)))]:[];}catch(_){return[];}}
const knownProjectIds=new Set(["profile","portfolio","landing"]);
function exportLearningData(){
 const payload={app:"CodeCraft",version:1,exportedAt:new Date().toISOString(),progress:done,projects:safeStoredArray("cc_projects",knownProjectIds),challenges:safeStoredArray("cc_challenges",new Set(["html-heading","html-link","css-flex","js-function","js-condition","html-semantic","css-grid","js-array","py-loop","py-dict"])),drafts:(()=>{try{return JSON.parse(localStorage.getItem("cc_drafts_v1")||"{}");}catch(_){return{};}})()};
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
   const allowedChallenges=new Set(["html-heading","html-link","css-flex","js-function","js-condition","html-semantic","css-grid","js-array","py-loop","py-dict"]);
   const importedChallenges=Array.isArray(data.challenges)?data.challenges.filter(id=>allowedChallenges.has(id)):[];
   done=[...new Set([...done,...importedLessons])];completedProjects=[...new Set([...completedProjects,...importedProjects])];completedChallenges=[...new Set([...completedChallenges,...importedChallenges])];
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
   renderMenu();progress();renderProjectCards();renderChallengeMenu();updateProjectStatus();
   $("#learningToolsStatus").textContent="Данные импортированы. Существующий прогресс сохранён и объединён с копией.";
  }catch(error){$("#learningToolsStatus").textContent="Не удалось импортировать файл: "+error.message;}
  event.target.value="";
 };
 reader.onerror=()=>{$("#learningToolsStatus").textContent="Не удалось прочитать выбранный файл.";event.target.value="";};
 reader.readAsText(file);
});

function progress() {
  const count = done.length;
  const percent = lessons.length ? Math.max(0, Math.min(100, Math.round(count / lessons.length * 100))) : 0;
  $("#progressRing").style.setProperty("--p", percent + "%");
  $("#progressPct").textContent = percent + "%";
  $("#progressCount").textContent = count + " из " + lessons.length + " уроков";
  renderAchievements();
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
  panel.append(tag, heading, description, example, tip, exercise, mark);
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
function resetSandbox() { sandboxReady = false; sandboxFrame.src = "sandbox.html"; }
sandboxFrame.addEventListener("load", () => { sandboxReady = true; });
window.addEventListener("message", event => {
  if (event.source !== sandboxFrame.contentWindow || !event.data) return;
  if (event.data.type === "CODECRAFT_READY") { sandboxReady = true; return; }
  if (event.data.type !== "CODECRAFT_RESULT" || !pending || event.data.id !== pending.id) return;
  clearTimeout(pending.timer);
  const result = event.data.output || "";
  output.textContent = event.data.error ? (result ? result + "\n" : "") + "Ошибка: " + event.data.error : result;
  pending = null; $("#runCode").disabled = false;
});
$("#runCode").addEventListener("click", () => {
  if (pending) return;
  if (!sandboxReady) { output.textContent = "Среда запуска ещё загружается. Попробуй через секунду."; return; }
  const id = ++requestId; $("#runCode").disabled = true; output.textContent = "Выполняю код…";
  const timer = setTimeout(() => { if (!pending || pending.id !== id) return; pending = null; output.textContent = "Превышено время выполнения. Среда перезапущена."; $("#runCode").disabled = false; resetSandbox(); }, 1800);
  pending = { id, timer }; sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_RUN", id, code: editor.value }, "*");
});
$("#resetEditor").addEventListener("click", () => { editor.value = starter; saveDraft("javascriptPlayground",starter); output.textContent = "Пример восстановлен."; });
$("#clearOutput").addEventListener("click", () => { output.textContent = "Вывод очищен."; });
let examQuestions=[],examIndex=0,examScore=0,examAnswered=false;
function startExam(){
 const pool=lessons.filter(item=>Array.isArray(item.options)&&item.options.length>=2&&Number.isInteger(item.correct));
 examQuestions=pool.slice().sort(()=>Math.random()-.5).slice(0,Math.min(10,pool.length));
 examIndex=0;examScore=0;examAnswered=false;$("#examResult").hidden=true;renderExamQuestion();
}
function renderExamQuestion(){
 const question=examQuestions[examIndex];if(!question)return;
 $("#examProgress").textContent="Вопрос "+(examIndex+1)+" из "+examQuestions.length;
 $("#examScore").textContent="Баллы: "+examScore;
 $("#examTrackFill").style.width=(examIndex/examQuestions.length*100)+"%";
 $("#quizQuestion").textContent=question.question;
 $("#quizFeedback").textContent="Выбери один вариант ответа.";
 $("#nextExamQuestion").disabled=true;
 $("#nextExamQuestion").textContent=examIndex===examQuestions.length-1?"Показать результат":"Следующий вопрос";
 const options=$("#quizOptions");options.replaceChildren();
 question.options.forEach((option,index)=>{const button=document.createElement("button");button.type="button";button.dataset.answer=String(index);button.textContent=option;options.append(button);});
 examAnswered=false;
}
$("#quizOptions").addEventListener("click",event=>{
 const button=event.target.closest("button[data-answer]");if(!button||examAnswered)return;
 const question=examQuestions[examIndex];if(!question)return;
 examAnswered=true;const chosen=Number(button.dataset.answer);
 [...$("#quizOptions").children].forEach((item,index)=>{item.disabled=true;if(index===question.correct)item.classList.add("correct");if(index===chosen&&chosen!==question.correct)item.classList.add("wrong");});
 if(chosen===question.correct){examScore++;$("#quizFeedback").textContent="Верно! "+question.explanation;}
 else $("#quizFeedback").textContent="Не совсем. Правильный ответ: "+question.options[question.correct]+". "+question.explanation;
 $("#examScore").textContent="Баллы: "+examScore;$("#nextExamQuestion").disabled=false;
});
$("#nextExamQuestion").addEventListener("click",()=>{
 if(!examAnswered)return;
 if(examIndex<examQuestions.length-1){examIndex++;renderExamQuestion();return;}
 $("#examTrackFill").style.width="100%";$("#examProgress").textContent="Экзамен завершён";
 $("#quizQuestion").textContent="Результат экзамена";
 $("#quizOptions").replaceChildren();$("#quizFeedback").textContent="Ты ответил правильно на "+examScore+" из "+examQuestions.length+" вопросов.";
 const result=$("#examResult");result.hidden=false;result.textContent=examScore>=9?"Превосходно! Отличное понимание материала.":examScore>=7?"Хороший результат! Повтори темы, в которых ошибся.":examScore>=5?"Неплохо. Продолжай практиковаться и попробуй ещё раз.":"Это только начало. Вернись к урокам и повтори основы.";
 $("#nextExamQuestion").disabled=true;
});
$("#retryQuiz").addEventListener("click",startExam);
startExam();
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
function resetPythonSandbox(){
 pythonReady=false;pythonFrame.src="python-sandbox.html";
 $("#pythonStatus").textContent="Перезапускаю Python-среду…";
}
window.addEventListener("message",event=>{
 if(event.source!==pythonFrame.contentWindow||!event.data)return;
 if(event.data.type==="CODECRAFT_PYTHON_READY"){
  pythonReady=true;$("#pythonStatus").textContent="Интерпретатор готов. Код выполняется локально в браузере.";
  return;
 }
 if(event.data.type==="CODECRAFT_PYTHON_ERROR"){
  pythonReady=false;$("#pythonStatus").textContent=event.data.message||"Не удалось загрузить Python.";
  return;
 }
 if(event.data.type!=="CODECRAFT_PYTHON_RESULT"||!pythonPending||event.data.id!==pythonPending.id)return;
 clearTimeout(pythonPending.timer);
 pythonOutput.textContent=(event.data.output||"")+(event.data.error?"\nОшибка: "+event.data.error:"");
 $("#runPython").disabled=false;$("#pythonStatus").textContent=event.data.error?"Выполнение завершилось с ошибкой.":"Выполнение завершено.";
 pythonPending=null;
});
pythonFrame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_PING"},"*");
$("#runPython").addEventListener("click",()=>{
 if(pythonPending)return;
 if(!pythonReady){$("#pythonStatus").textContent="Python ещё загружается. Проверь интернет и подожди немного.";return;}
 const id=++pythonRequestId;$("#runPython").disabled=true;pythonOutput.textContent="Выполняю Python-код…";
 const timer=setTimeout(()=>{
  if(!pythonPending||pythonPending.id!==id)return;
  pythonPending=null;$("#runPython").disabled=false;pythonOutput.textContent="Превышено время ожидания. Среда перезапущена.";
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
];
let activeChallenge=challengeTasks[0],completedChallenges=[];
try{const saved=JSON.parse(localStorage.getItem("cc_challenges")||"[]");if(Array.isArray(saved))completedChallenges=[...new Set(saved.filter(id=>challengeTasks.some(task=>task.id===id)))];}catch(_){}
function renderChallengeMenu(){const menu=$("#challengeMenu");menu.replaceChildren();challengeTasks.forEach(task=>{const button=document.createElement("button");button.type="button";button.className="challenge-pick"+(task.id===activeChallenge.id?" active":"");const title=document.createElement("strong");title.textContent=(completedChallenges.includes(task.id)?"✓ ":"")+task.title;const meta=document.createElement("small");meta.textContent=task.language+" · "+(completedChallenges.includes(task.id)?"Решено":"30 XP");button.append(title,meta);button.addEventListener("click",()=>selectChallenge(task.id));menu.append(button);});}
function selectChallenge(id){const task=challengeTasks.find(item=>item.id===id);if(!task)return;activeChallenge=task;$("#challengeLanguage").textContent=task.language;$("#challengeTitle").textContent=task.title;$("#challengeDescription").textContent=task.description;$("#challengeHint").textContent="Подсказка: "+task.hint;$("#challengeFile").textContent=task.file;$("#challengeCode").value=restoreDraft("challenge:"+task.id,task.starter);$("#challengeResult").textContent=completedChallenges.includes(task.id)?"Задание уже решено. Можешь улучшить свой код!":"Напиши решение и запусти проверку.";$("#challengeResult").className="challenge-result";$("#challengeChecks").replaceChildren();renderChallengeMenu();}
function validateChallenge(){const code=$("#challengeCode").value;const checks=activeChallenge.checks.map(([label,test])=>({label,pass:test(code)}));const list=$("#challengeChecks");list.replaceChildren();checks.forEach(check=>{const item=document.createElement("div");item.className="challenge-check "+(check.pass?"pass":"fail");item.textContent=(check.pass?"✓ ":"○ ")+check.label;list.append(item);});const passed=checks.every(item=>item.pass);const result=$("#challengeResult");result.className="challenge-result "+(passed?"success":"failure");if(passed){const isNew=!completedChallenges.includes(activeChallenge.id);if(isNew){completedChallenges.push(activeChallenge.id);try{localStorage.setItem("cc_challenges",JSON.stringify(completedChallenges));}catch(_){}renderAchievements();renderChallengeMenu();}result.textContent="Отлично! Все проверки пройдены."+(isNew?" +30 XP начислено.":" Задание уже было засчитано.");}else{result.textContent="Пока не всё готово: исправь отмеченные пункты и проверь ещё раз.";}}
$("#challengeCode").addEventListener("input",()=>saveDraft("challenge:"+activeChallenge.id,$("#challengeCode").value));
$("#checkChallenge").addEventListener("click",validateChallenge);
$("#challengeReset").addEventListener("click",()=>{$("#challengeCode").value=activeChallenge.starter;saveDraft("challenge:"+activeChallenge.id,activeChallenge.starter);$("#challengeChecks").replaceChildren();$("#challengeResult").className="challenge-result";$("#challengeResult").textContent="Пример восстановлен. Попробуй решить задание.";});
$("#challengeHintButton").addEventListener("click",()=>{$("#challengeHint").hidden=!$("#challengeHint").hidden;});
renderChallengeMenu();selectChallenge(activeChallenge.id);
const projectTemplates = [
 {id:"profile",title:"Карточка профиля",level:"Начальный",description:"Собери карточку с именем, описанием и ссылкой.",tasks:["Добавь своё имя и описание.","Используй заголовок и абзац.","Оформи карточку через CSS.","Сделай ссылку заметной."],code:`<main class="card">
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
 {id:"portfolio",title:"Мини-портфолио",level:"Начальный+",description:"Сделай страницу, на которой представишь себя и свои работы.",tasks:["Создай шапку с названием.","Добавь раздел «Обо мне».","Покажи минимум две работы.","Размести карточки через CSS Grid."],code:`<header><h1>Моё портфолио</h1><p>Первые шаги в веб-разработке</p></header>
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
 {id:"landing",title:"Страница продукта",level:"Средний",description:"Собери презентационную страницу выдуманного приложения или сервиса.",tasks:["Сформулируй заголовок и пользу продукта.","Добавь заметную кнопку действия.","Создай блок из трёх преимуществ.","Проверь адаптивность на узком экране."],code:`<header>
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
</style>`}
];
let activeProject=projectTemplates[0], completedProjects=[];
try{const saved=JSON.parse(localStorage.getItem("cc_projects")||"[]");if(Array.isArray(saved))completedProjects=[...new Set(saved.filter(id=>projectTemplates.some(p=>p.id===id)))];}catch(_){}
function updateProjectStatus(){const done=completedProjects.includes(activeProject.id);$("#projectStatus").textContent=done?"Проект отмечен как выполненный ✓":"Проект ещё не отмечен как выполненный.";$("#completeProject").textContent=done?"Проект выполнен ✓":"Отметить проект выполненным";}
function renderProjectCards(){const grid=$("#projectGrid");grid.replaceChildren();projectTemplates.forEach(project=>{const card=document.createElement("button");card.type="button";card.className="project-card"+(project.id===activeProject.id?" active":"");const title=document.createElement("strong");title.textContent=project.title;const meta=document.createElement("small");meta.textContent=project.level+(completedProjects.includes(project.id)?" · ✓ Готово":" · "+project.tasks.length+" задачи");card.append(title,meta);card.addEventListener("click",()=>selectProject(project.id));grid.append(card);});}
function renderProjectPreview(){const policy="<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'\">";const doc="<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\">"+policy+"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{padding:12px}</style></head><body>"+$("#projectCode").value+"</body></html>";$("#projectPreview").srcdoc=doc;}
function selectProject(id){const project=projectTemplates.find(item=>item.id===id);if(!project)return;activeProject=project;$("#projectLevel").textContent="Практика · "+project.level;$("#projectTitle").textContent=project.title;$("#projectDescription").textContent=project.description;const list=$("#projectTasks");list.replaceChildren();project.tasks.forEach(task=>{const li=document.createElement("li");li.textContent=task;list.append(li);});$("#projectCode").value=restoreDraft("project:"+project.id,project.code);updateProjectStatus();renderProjectCards();renderProjectPreview();}
$("#projectCode").addEventListener("input",()=>saveDraft("project:"+activeProject.id,$("#projectCode").value));
$("#previewProject").addEventListener("click",renderProjectPreview);
$("#resetProject").addEventListener("click",()=>{$("#projectCode").value=activeProject.code;saveDraft("project:"+activeProject.id,activeProject.code);renderProjectPreview();});
$("#completeProject").addEventListener("click",()=>{if(!completedProjects.includes(activeProject.id))completedProjects.push(activeProject.id);try{localStorage.setItem("cc_projects",JSON.stringify(completedProjects));}catch(_){}updateProjectStatus();renderProjectCards();renderAchievements();});
renderProjectCards();selectProject(activeProject.id);
showLesson(0); progress();
})();