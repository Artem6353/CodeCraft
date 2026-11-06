import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const read = path => fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
const html = read("index.html");
const css = read("css/style.css");
const app = read("js/app.js");
const lessonsSource = read("js/lessons.js");
const sandbox = read("sandbox.html");

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
assert.match(app, /function startExam/);
assert.match(app, /function saveDraft/);
assert.match(sandbox, /CODECRAFT_RUN/);
assert.match(sandbox, /new Function/);

console.log("CodeCraft quality checks passed:");
console.log("- 32 lessons, 3 tracks, valid answer data");
console.log("- unique HTML IDs and complete app selectors");
console.log("- 10 practical tasks and 100% passing sample checks");
console.log("- isolated sandboxes, responsive styles, exam, backups and drafts");
