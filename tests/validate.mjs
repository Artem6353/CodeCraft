import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const read = path => fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
const html = read("index.html");
const css = read("css/style.css");
const app = read("js/app.js");
const lessonsSource = read("js/lessons.js");
const sandbox = read("sandbox.html");
const pythonSandbox = read("python-sandbox.html");
const serviceWorker = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const icon = read("assets/icon.svg");
new vm.Script(serviceWorker, { filename: "sw.js" });

const context = { window: {} };
vm.runInNewContext(lessonsSource, context, { filename: "js/lessons.js" });
const lessons = context.window.CODECRAFT_LESSONS;
assert.ok(Array.isArray(lessons), "lesson catalog must be an array");
assert.equal(lessons.length, 32, "expected 32 lessons");
const lessonIds = lessons.map(item => item.id);
assert.equal(new Set(lessonIds).size, lessonIds.length, "lesson IDs must be unique");
for (const lesson of lessons) {
  assert.ok(lesson.id && lesson.title && lesson.course && lesson.text && lesson.code, "lesson content is incomplete");
  assert.ok(Array.isArray(lesson.options) && lesson.options.length >= 2, "lesson needs answer options");
  assert.ok(Number.isInteger(lesson.correct) && lesson.correct >= 0 && lesson.correct < lesson.options.length, "lesson answer index is invalid");
  assert.ok(lesson.question && lesson.explanation, "lesson question or explanation is missing");
}
for (const [course, count] of [["HTML и CSS", 16], ["JavaScript", 8], ["Python", 8]]) {
  assert.equal(lessons.filter(item => item.course === course).length, count, "unexpected lesson count: " + course);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
const idSet = new Set(ids);
for (const match of app.matchAll(/\$\("#([^"]+)"\)/g)) {
  assert.ok(idSet.has(match[1]), "app.js refers to missing HTML id #" + match[1]);
}
for (const section of ["paths", "learn", "playground", "web-lab", "challenges", "projects", "quiz"]) {
  assert.ok(html.includes('id="' + section + '"'), "missing page section " + section);
}
assert.match(html, /id="jsSandbox"[^>]*sandbox="allow-scripts"/);
assert.match(html, /id="webLabPreview"[^>]*sandbox="allow-scripts"/);
assert.match(html, /id="projectPreview"[^>]*sandbox=""/);
assert.match(html, /id="pythonSandbox"[^>]*sandbox="allow-scripts"/);
assert.ok(html.includes('id="python-lab"'), "Python training section is missing");
assert.ok(html.includes('id="student-dashboard"'), "student dashboard section is missing");
assert.ok(html.includes('id="projectChecks"'), "project criteria output is missing");
assert.ok(html.includes('id="bookmarkList"') && html.includes('id="notesList"'), "saved learning materials UI is missing");
assert.match(pythonSandbox, /skulpt@1\.2\.0\/dist\/skulpt\.min\.js/);
assert.match(pythonSandbox, /skulpt-stdlib\.js/);
assert.match(pythonSandbox, /execLimit: 3000/);
assert.match(pythonSandbox, /CODECRAFT_PYTHON_RUN/);
assert.match(css, /\.python-workbench/);
assert.ok(manifest.name && manifest.short_name && manifest.start_url === "./", "web app manifest is invalid");
assert.ok(manifest.icons.some(item => item.src === "assets/icon.svg"), "manifest icon is missing");
assert.match(serviceWorker, /addAll\(CORE_FILES\)/);
assert.match(serviceWorker, /clients\.claim/);
assert.match(app, /navigator\.serviceWorker\.register/);
assert.match(icon, /<svg/);
assert.match(app, /connect-src[^;]*none/, "web preview must block network requests");

const challengeMatch = app.match(/const challengeTasks = (\[[\s\S]*?\n\]);/);
assert.ok(challengeMatch, "challenge task registry was not found");
const challengeContext = {};
const challenges = vm.runInNewContext("(" + challengeMatch[1] + ")", challengeContext);
assert.equal(challenges.length, 10, "expected 10 practical tasks");
assert.equal(new Set(challenges.map(item => item.id)).size, challenges.length, "challenge IDs must be unique");
const examples = {
  "html-heading": "<h1>Hello</h1><p>Welcome</p>",
  "html-link": '<a href="https://example.com">Example</a>',
  "css-flex": ".cards { display: flex; gap: 12px; }",
  "js-function": "function double(number) { return number * 2; }\nconsole.log(double(5));",
  "js-condition": 'const score = 75; if (score >= 60) { console.log("Зачёт"); } else { console.log("Попробуй ещё"); }',
  "html-semantic": "<header>Header</header><main><h1>Title</h1></main><footer>Footer</footer>",
  "css-grid": ".gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }",
  "js-array": 'const fruits = ["apple", "pear", "plum"]; fruits.push("orange");',
  "py-loop": "for number in range(5):\n    print(number)",
  "py-dict": 'profile = {"name": "Аня", "level": 1}\nprint(profile["name"])'
};
for (const task of challenges) {
  assert.ok(Array.isArray(task.checks) && task.checks.length > 0, "challenge checks missing: " + task.id);
  const sample = examples[task.id];
  assert.ok(sample, "sample solution missing: " + task.id);
  for (const [label, check] of task.checks) {
    assert.equal(check(sample), true, "sample failed " + task.id + " / " + label);
  }
}
assert.match(css, /@media\(max-width:520px\)/);
assert.match(css, /\.web-lab/);
assert.match(app, /function exportLearningData/);
assert.match(app, /function renderStudentDashboard/);
assert.match(app, /function validateProject/);
const projectStart = app.indexOf("const projectTemplates = [");
const projectEnd = app.indexOf("let activeProject", projectStart);
assert.ok(projectStart >= 0 && projectEnd > projectStart, "project templates are missing");
const projectSource = app.slice(projectStart, projectEnd).replace("const projectTemplates = ", "");
const projectTemplates = vm.runInNewContext(projectSource);
assert.equal(projectTemplates.length, 3, "expected three guided projects");
for (const project of projectTemplates) {
  assert.ok(Array.isArray(project.checks) && project.checks.length >= 4, "project checks missing: " + project.id);
  for (const [label, check] of project.checks) {
    assert.equal(check(project.code), true, "starter project fails " + project.id + " / " + label);
  }
}
assert.match(app, /activeProject\.checks\.map/);
assert.match(app, /Начислено 50 XP/);
assert.match(app, /cc_bookmarks/);
assert.match(app, /cc_notes_v1/);
assert.match(app, /lesson-personal-tools/);
assert.match(app, /bookmarks:safeStoredArray/);
assert.match(app, /notes:\(\(\)=>/);
assert.match(app, /function startExam/);
assert.match(html, /id="examCourse"/);
assert.match(html, /id="examLevel"/);
assert.match(html, /id="examHistory"/);
assert.match(app, /function shuffleExamItems/);
assert.match(app, /function finishExam/);
assert.match(app, /examMissed\.push\(question\)/);
assert.match(app, /exam-review-item/);
assert.match(app, /Повторить только ошибки/);
assert.match(app, /startExam\(examMissed\.slice\(\)\)/);
assert.match(css, /\.exam-review-item/);
assert.match(app, /cc_exam_history_v1/);
assert.match(app, /exams:readExamHistory\(\)/);
assert.match(app, /data\.exams/);
assert.match(app, /function renderExamHistory/);
assert.match(css, /\.exam-settings/);
assert.match(css, /\.exam-history-card/);
for (const course of ["HTML и CSS", "JavaScript", "Python"]) {
  const pool = lessons.filter(item => item.course === course && Array.isArray(item.options) && item.options.length >= 2 && Number.isInteger(item.correct));
  assert.ok(pool.length >= 5, "exam track must contain at least five questions: " + course);
}
for (const level of ["Начальный", "Начальный+"]) {
  assert.ok(lessons.some(item => item.level === level), "exam difficulty is missing: " + level);
}
assert.match(app, /function saveDraft/);
assert.match(app, /CODECRAFT_PYTHON_PING/);
assert.match(app, /file\.size>2\*1024\*1024/);
assert.match(app, /cleanDrafts/);
assert.match(sandbox, /CODECRAFT_RUN/);
assert.match(sandbox, /new Function/);

console.log("CodeCraft quality checks passed:");
console.log("- 32 lessons, 3 tracks, valid answer data");
console.log("- unique HTML IDs and complete app selectors");
console.log("- 10 practical tasks and 100% passing sample checks");
console.log("- isolated sandboxes, responsive styles, track/difficulty exams, score history, backups and drafts");
