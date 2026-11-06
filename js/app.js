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
  const tag = document.createElement("span");
  tag.className = "pill";
  tag.textContent = lesson.course + " · " + lesson.level;
  const heading = document.createElement("h3");
  heading.textContent = lesson.title;
  const description = document.createElement("p");
  description.textContent = lesson.text;
  const example = document.createElement("pre");
  example.textContent = lesson.code;
  const tip = document.createElement("p");
  tip.textContent = "Запомни: " + lesson.tip;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.textContent = done.includes(lesson.id) ? "Урок пройден ✓" : "Отметить урок пройденным";
  button.addEventListener("click", () => {
    if (!done.includes(lesson.id)) done.push(lesson.id);
    saveProgress();
    renderMenu();
    progress();
    showLesson(index);
  });
  panel.append(tag, heading, description, example, tip, button);
  renderMenu();
}
document.querySelectorAll("[data-course]").forEach(button => button.addEventListener("click", () => {
  const map = { html: 0, js: 3, python: 5 };
  showLesson(map[button.dataset.course] ?? 0);
  $("#learn").scrollIntoView({ behavior: "smooth" });
}));

const editor = $("#codeEditor");
const output = $("#output");
const starter = editor.value;
const sandboxFrame = $("#jsSandbox");
let requestId = 0;
let sandboxReady = false;
let pending = null;
function resetSandbox() {
  sandboxReady = false;
  sandboxFrame.src = "sandbox.html";
}
sandboxFrame.addEventListener("load", () => { sandboxReady = true; });
window.addEventListener("message", event => {
  if (event.source !== sandboxFrame.contentWindow || !event.data) return;
  if (event.data.type === "CODECRAFT_READY") { sandboxReady = true; return; }
  if (event.data.type !== "CODECRAFT_RESULT" || !pending || event.data.id !== pending.id) return;
  clearTimeout(pending.timer);
  const result = event.data.output || "";
  output.textContent = event.data.error ? (result ? result + "\n" : "") + "Ошибка: " + event.data.error : result;
  pending = null;
  $("#runCode").disabled = false;
});
$("#runCode").addEventListener("click", () => {
  if (pending) return;
  if (!sandboxReady) { output.textContent = "Среда запуска ещё загружается. Попробуй через секунду."; return; }
  const id = ++requestId;
  $("#runCode").disabled = true;
  output.textContent = "Выполняю код…";
  const timer = setTimeout(() => {
    if (!pending || pending.id !== id) return;
    pending = null;
    output.textContent = "Превышено время выполнения. Среда перезапущена.";
    $("#runCode").disabled = false;
    resetSandbox();
  }, 1800);
  pending = { id, timer };
  sandboxFrame.contentWindow.postMessage({ type: "CODECRAFT_RUN", id, code: editor.value }, "*");
});
$("#resetEditor").addEventListener("click", () => { editor.value = starter; output.textContent = "Пример восстановлен."; });
$("#clearOutput").addEventListener("click", () => { output.textContent = "Вывод очищен."; });
$("#quizOptions").addEventListener("click", event => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  document.querySelectorAll("#quizOptions button").forEach(item => item.classList.remove("correct", "wrong"));
  if (button.dataset.answer === "1") {
    button.classList.add("correct");
    $("#quizFeedback").textContent = "Правильно! Тег <a> создаёт гиперссылку.";
  } else {
    button.classList.add("wrong");
    $("#quizFeedback").textContent = "Пока неверно. Подсказка: нужный тег короткий и обозначает anchor.";
  }
});
$("#retryQuiz").addEventListener("click", () => {
  document.querySelectorAll("#quizOptions button").forEach(item => item.classList.remove("correct", "wrong"));
  $("#quizFeedback").textContent = "Выбери один вариант.";
});
$("#menuBtn").addEventListener("click", () => {
  const isOpen = $("#nav").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", String(isOpen));
});
$("#nav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#nav").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
  }
});
showLesson(0);
progress();
})();