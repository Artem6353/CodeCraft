import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const errors = [];
const requiredFiles = [
  "index.html",
  "css/style.css",
  "js/lessons.js",
  "js/app.js",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) errors.push("Missing required file: " + file);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
const idSet = new Set();

for (const id of ids) {
  if (idSet.has(id)) errors.push("Duplicate HTML id: " + id);
  idSet.add(id);
}

for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
  const value = match[1].trim();
  if (!value || value.startsWith("#") || /^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(value)) continue;
  const pathname = value.split(/[?#]/, 1)[0];
  if (pathname && !existsSync(resolve(root, pathname))) {
    errors.push("Broken local asset reference: " + value);
  }
}

for (const match of html.matchAll(/\bhref\s*=\s*["']#([^"']+)["']/gi)) {
  const target = match[1];
  if (target && !idSet.has(target)) errors.push("Anchor target does not exist: #" + target);
}

const appJs = readFileSync(resolve(root, "js/app.js"), "utf8");
for (const match of appJs.matchAll(/\$\(\s*["']#([\w-]+)["']\s*\)/g)) {
  if (!idSet.has(match[1])) errors.push("JavaScript references missing element id: #" + match[1]);
}

const lessonsJs = readFileSync(resolve(root, "js/lessons.js"), "utf8");
const lessonIds = [...lessonsJs.matchAll(/\bid\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);
if (!lessonIds.length) errors.push("No lesson IDs found in js/lessons.js");
if (new Set(lessonIds).size !== lessonIds.length) errors.push("Duplicate lesson IDs found");

if (errors.length) {
  console.error("CodeCraft validation failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

console.log("CodeCraft validation passed.");
console.log(" - " + requiredFiles.length + " required files present");
console.log(" - " + ids.length + " HTML IDs checked");
console.log(" - " + lessonIds.length + " lesson IDs checked");
