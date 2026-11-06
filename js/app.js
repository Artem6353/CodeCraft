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
function progress() {
  const count = done.length;
  const percent = lessons.length ? Math.max(0, Math.min(100, Math.round(count / lessons.length * 100))) : 0;
  $("#progressRing").style.setProperty("--p", percent + "%");
  $("#progressPct").textContent = percent + "%";
  $("#progressCount").textContent = count + " из " + lessons.length + " уроков";
}
function renderMenu() {
  const menu = $("#lessonMenu");
  menu.replaceChildren();
  lessons.forEach((lesson, index) => {
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
const editor = $("#codeEditor"); const output = $("#output"); const starter = editor.value; const sandboxFrame = $("#jsSandbox");
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
$("#resetEditor").addEventListener("click", () => { editor.value = starter; output.textContent = "Пример восстановлен."; });
$("#clearOutput").addEventListener("click", () => { output.textContent = "Вывод очищен."; });
$("#quizOptions").addEventListener("click", event => {
  const button = event.target.closest("button[data-answer]"); if (!button) return;
  document.querySelectorAll("#quizOptions button").forEach(item => item.classList.remove("correct", "wrong"));
  if (button.dataset.answer === "1") { button.classList.add("correct"); $("#quizFeedback").textContent = "Правильно! Тег <a> создаёт гиперссылку."; }
  else { button.classList.add("wrong"); $("#quizFeedback").textContent = "Пока неверно. Подсказка: нужный тег короткий и обозначает anchor."; }
});
$("#retryQuiz").addEventListener("click", () => { document.querySelectorAll("#quizOptions button").forEach(item => item.classList.remove("correct", "wrong")); $("#quizFeedback").textContent = "Выбери один вариант."; });
$("#menuBtn").addEventListener("click", () => { const isOpen = $("#nav").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", String(isOpen)); });
$("#nav").addEventListener("click", event => { if (event.target.closest("a")) { $("#nav").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false"); } });

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
function selectProject(id){const project=projectTemplates.find(item=>item.id===id);if(!project)return;activeProject=project;$("#projectLevel").textContent="Практика · "+project.level;$("#projectTitle").textContent=project.title;$("#projectDescription").textContent=project.description;const list=$("#projectTasks");list.replaceChildren();project.tasks.forEach(task=>{const li=document.createElement("li");li.textContent=task;list.append(li);});$("#projectCode").value=project.code;updateProjectStatus();renderProjectCards();renderProjectPreview();}
$("#previewProject").addEventListener("click",renderProjectPreview);
$("#resetProject").addEventListener("click",()=>{$("#projectCode").value=activeProject.code;renderProjectPreview();});
$("#completeProject").addEventListener("click",()=>{if(!completedProjects.includes(activeProject.id))completedProjects.push(activeProject.id);try{localStorage.setItem("cc_projects",JSON.stringify(completedProjects));}catch(_){}updateProjectStatus();renderProjectCards();});
renderProjectCards();selectProject(activeProject.id);
showLesson(0); progress();
})();