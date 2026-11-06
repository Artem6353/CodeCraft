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
  output.textContent = event.data.error ? (result ? result + "\\n" : "") + "Ошибка: " + event.data.error : result;
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
showLesson(0); progress();
})();