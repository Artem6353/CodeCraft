import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#lessonPanel h3")).toBeVisible();
});

test("loads the learning dashboard and keeps the main sections reachable", async ({ page }) => {
  await expect(page).toHaveTitle(/CodeCraft/);
  await expect(page.locator("#lessonMenu .lesson-choice")).toHaveCount(44);
  await expect(page.locator("#progressCount")).toContainText("0 из 44");
  for (const id of ["learn", "playground", "web-lab", "challenges", "projects", "python-lab", "quiz"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("searches lessons and persists lesson completion, bookmark and note after reload", async ({ page }) => {
  await page.locator("#courseFilter").selectOption("HTML и CSS");
  await expect(page.locator("#lessonMenu .lesson-choice")).toHaveCount(20);
  await page.locator("#courseFilter").selectOption("all");
  await page.locator("#lessonPanel .lesson-personal-tools button").click();
  await page.locator("#lessonPanel .lesson-note-input").fill("Проверка сохранения заметки из Playwright.");
  await page.getByRole("button", { name: "Отметить урок пройденным" }).click();
  await expect(page.locator("#progressCount")).toContainText("1 из 44");
  await page.reload();
  await expect(page.locator("#progressCount")).toContainText("1 из 44");
  await expect(page.locator("#bookmarkCount")).toHaveText("1");
  await expect(page.locator("#notesCount")).toHaveText("1");
  await expect(page.locator("#lessonPanel .lesson-note-input")).toHaveValue("Проверка сохранения заметки из Playwright.");
});

test("validates a practical task and a guided project and stores their completion", async ({ page }) => {
  await page.locator("#challengeCode").fill("<h1>Привет, мир!</h1>\n<p>Мой первый сайт.</p>");
  await page.locator("#checkChallenge").click();
  await expect(page.locator("#challengeResult")).toContainText("Все проверки пройдены");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_challenges") || "[]"))).toContain("html-heading");

  await page.locator("#completeProject").click();
  await expect(page.locator("#projectStatus")).toContainText("Начислено 50 XP");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_projects") || "[]"))).toContain("profile");
  await page.locator("#projectGrid .project-card").filter({ hasText: "Доска задач" }).click();
  await expect(page.locator("#projectTasks input[type=checkbox]")).toHaveCount(4);
  await page.locator("#projectTasks input[type=checkbox]").first().check();
  await page.reload();
  await page.locator("#projectGrid .project-card").filter({ hasText: "Доска задач" }).click();
  await expect(page.locator("#projectTasks input[type=checkbox]").first()).toBeChecked();
});

test("runs the web lab preview and executes its button interaction", async ({ page }) => {
  await page.locator("#webHtml").fill('<main><h1>Playwright preview</h1><button id="go">Нажми</button><p id="result"></p></main>');
  await page.locator("#webCss").fill("h1 { color: rgb(20, 108, 87); }");
  await page.locator("#webJs").fill('document.querySelector("#go").addEventListener("click", () => { document.querySelector("#result").textContent = "Работает"; });');
  await page.locator("#runWebLab").click();
  const preview = page.frameLocator("#webLabPreview");
  await expect(preview.locator("h1")).toHaveText("Playwright preview");
  await preview.locator("#go").click();
  await expect(preview.locator("#result")).toHaveText("Работает");
});

test("runs JavaScript in the Worker, times out an infinite loop and recovers", async ({ page }) => {
  await page.locator("#codeEditor").fill('console.log("worker-ok"); console.log(typeof document); console.log(typeof localStorage);');
  await page.locator("#runCode").click();
  await expect(page.locator("#output")).toContainText("worker-ok");
  await expect(page.locator("#output")).toContainText("undefined");
  await expect(page.locator("#stopCode")).toBeDisabled();

  await page.locator("#codeEditor").fill("while (true) {}");
  await page.locator("#runCode").click();
  await expect(page.locator("#output")).toContainText("Worker остановлен", { timeout: 6000 });
  await expect(page.locator("#runCode")).toBeEnabled();
  await expect(page.locator("#stopCode")).toBeDisabled();

  await page.locator("#codeEditor").fill('console.log("worker-recovered");');
  await page.locator("#runCode").click();
  await expect(page.locator("#output")).toContainText("worker-recovered");

  await page.locator("#codeEditor").fill("const = ;");
  await page.locator("#runCode").click();
  await expect(page.locator("#output")).toContainText("Ошибка");
  await expect(page.locator("#runCode")).toBeEnabled();
});

test("manually stops JavaScript execution without reloading the page", async ({ page }) => {
  await page.locator("#codeEditor").fill("while (true) {}");
  await page.locator("#runCode").click();
  await expect(page.locator("#stopCode")).toBeEnabled();
  await page.locator("#stopCode").click();
  await expect(page.locator("#output")).toContainText("Выполнение остановлено");
  await expect(page.locator("#runCode")).toBeEnabled();
});

test("runs Python in Skulpt when the CDN is available", async ({ page }) => {
  await page.locator("#python-lab").scrollIntoViewIfNeeded();
  const status = page.locator("#pythonStatus");
  await expect(status).toContainText("Интерпретатор готов", { timeout: 30000 });
  await page.locator("#pythonCode").fill('print("python-ok")');
  await page.locator("#runPython").click();
  await expect(page.locator("#pythonOutput")).toContainText("python-ok", { timeout: 15000 });
  await expect(status).toContainText("Выполнение завершено");
});

test("finishes an exam and stores its attempt and topic statistics", async ({ page }) => {
  await expect.poll(() => page.locator("#quizOptions button").count(), { timeout: 10000 }).toBeGreaterThan(1);
  for (let index = 0; index < 10; index += 1) {
    await page.locator("#quizOptions button").first().click();
    await expect(page.locator("#nextExamQuestion")).toBeEnabled();
    await page.locator("#nextExamQuestion").click();
  }
  await expect(page.locator("#examProgress")).toHaveText("Экзамен завершён");
  await expect(page.locator("#examResult")).toBeVisible();
  const state = await page.evaluate(() => ({
    history: JSON.parse(localStorage.getItem("cc_exam_history_v1") || "{}"),
    topics: JSON.parse(localStorage.getItem("cc_exam_topic_stats_v1") || "{}")
  }));
  expect(Object.values(state.history).some(item => item.attempts === 1)).toBeTruthy();
  expect(Object.values(state.topics).reduce((sum, item) => sum + item.total, 0)).toBe(10);
});

test("exports and imports a versioned learning backup", async ({ page }) => {
  const lessonId = await page.evaluate(() => window.CODECRAFT_LESSONS[0].id);
  const backup = {
    app: "CodeCraft",
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: [lessonId],
    projects: ["profile"],
    challenges: ["html-heading"],
    bookmarks: [lessonId],
    notes: { [lessonId]: "Заметка из резервной копии" },
    drafts: {},
    exams: {},
    topicStats: {},
    projectSteps: { "taskboard": [2] }
  };
  await page.locator("#importProgressFile").setInputFiles({
    name: "codecraft-e2e-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator("#learningToolsStatus")).toContainText("Данные импортированы");
  await expect(page.locator("#progressCount")).toContainText("1 из 44");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_challenges") || "[]"))).toContain("html-heading");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_projects") || "[]"))).toContain("profile");
  await page.locator("#projectGrid .project-card").filter({ hasText: "Доска задач" }).click();
  await expect(page.locator("#projectTasks input[type=checkbox]").nth(2)).toBeChecked();

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportProgress").click();
  const download = await downloadPromise;
  const path = await download.path();
  const exported = JSON.parse(await fs.readFile(path, "utf8"));
  expect(exported.app).toBe("CodeCraft");
  expect(exported.version).toBe(2);
  expect(exported.schemaVersion).toBe(2);
  expect(exported.progress).toContain(lessonId);
  expect(exported.challenges).toContain("html-heading");
  expect(exported.projectSteps).toBeTruthy();
});

test("migrates legacy local learning data to schema version 2", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.removeItem("cc_storage_schema");
    localStorage.setItem("cc_progress", JSON.stringify(["html1", "unknown-lesson", "html1"]));
    localStorage.setItem("cc_bookmarks", JSON.stringify(["html1", "missing"]));
    localStorage.setItem("cc_project_steps_v1", JSON.stringify({ taskboard: [2, 2, 99], unknown: [1] }));
    localStorage.setItem("cc_drafts_v1", JSON.stringify({ javascriptPlayground: "console.log('legacy')" }));
  });
  await page.reload();
  await expect(page.locator("#progressCount")).toContainText("1 из 44");
  const migrated = await page.evaluate(() => ({
    version: localStorage.getItem("cc_storage_schema"),
    progress: JSON.parse(localStorage.getItem("cc_progress") || "[]"),
    bookmarks: JSON.parse(localStorage.getItem("cc_bookmarks") || "[]"),
    steps: JSON.parse(localStorage.getItem("cc_project_steps_v1") || "{}"),
    draft: JSON.parse(localStorage.getItem("cc_drafts_v1") || "{}").javascriptPlayground
  }));
  expect(migrated.version).toBe("2");
  expect(migrated.progress).toEqual(["html1"]);
  expect(migrated.bookmarks).toEqual(["html1"]);
  expect(migrated.steps).toEqual({ taskboard: [2] });
  expect(migrated.draft).toBe("console.log('legacy')");
});

test("keeps existing progress intact when a backup import hits a storage quota error", async ({ page }) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__failCodeCraftWrite = true;
    Storage.prototype.setItem = function(key, value) {
      if (key === "cc_challenges" && window.__failCodeCraftWrite) {
        window.__failCodeCraftWrite = false;
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };
  });
  const lessonId = await page.evaluate(() => window.CODECRAFT_LESSONS[0].id);
  const backup = { app: "CodeCraft", version: 2, schemaVersion: 2, progress: [lessonId], projects: [], challenges: [], bookmarks: [], notes: {}, drafts: {}, exams: {}, topicStats: {}, projectSteps: {} };
  await page.locator("#importProgressFile").setInputFiles({
    name: "quota-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator("#learningToolsStatus")).toContainText("недостаточно места");
  await expect(page.locator("#progressCount")).toContainText("0 из 44");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("cc_progress") || "[]"));
  expect(stored).toEqual([]);
});

test("serves the installed learning shell after the browser goes offline", async ({ page, context }) => {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 15000 });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) registration.waiting.postMessage({ type: "CODECRAFT_SKIP_WAITING" });
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/CodeCraft/);
  await expect(page.locator("#lessonMenu .lesson-choice")).toHaveCount(44);
  await expect(page.locator("#connectionStatus")).toContainText("Офлайн");
});

test("keeps the interface within phone and desktop viewport widths", async ({ page }) => {
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("#mainContent")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll("body *")].map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, id: element.id, className: String(element.className || ""), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
      }).filter(item => item.width > 0 && item.right > window.innerWidth + 1).slice(0, 8)
    }));
    expect(dimensions.document, `horizontal overflow at viewport ${width}px: ${JSON.stringify(dimensions.offenders)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
    if (width === 768) {
      await expect(page.locator("#menuBtn")).toBeVisible();
      await expect(page.locator("#menuBtn")).toHaveAttribute("aria-controls", "nav");
      await page.locator("#menuBtn").click();
      await expect(page.locator("#nav")).toHaveClass(/open/);
      await expect(page.locator("#menuBtn")).toHaveAttribute("aria-expanded", "true");
    }
  }
});


test("supports intermediate lessons and saves phased project milestones", async ({ page }) => {
  await page.locator("#lessonLevelFilter").selectOption("Средний");
  await expect(page.locator("#lessonMenu .lesson-choice")).toHaveCount(12);
  await expect(page.locator("#progressCount")).toContainText("0 из 44");
  await page.locator("#projectGrid .project-card").filter({ hasText: "Панель показателей" }).click();
  await page.locator("#projectTasks input[type=checkbox]").nth(1).check();
  await expect(page.locator("#projectPhaseStatus")).toContainText("1 из 4");
  const steps = await page.evaluate(() => JSON.parse(localStorage.getItem("cc_project_steps_v1") || "{}"));
  expect(steps["data-dashboard"]).toContain(1);
});

test("checks keyboard access, reduced motion and responsive layouts", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".brand")).toBeFocused();
  for (const [width, height] of [[320,740],[360,800],[390,844],[414,896],[600,900],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]) {
    await page.setViewportSize({ width, height });
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, offenders:[...document.querySelectorAll("body *")].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,className:String(el.className||""),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}}).filter(x=>x.width>0&&x.right>innerWidth+1).slice(0,12) }));
    expect(dimensions.document, `horizontal overflow at ${width}x${height}: ${JSON.stringify(dimensions.offenders)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test("passes automated WCAG 2.1 A/AA accessibility checks on core learning screens", async ({ page }) => {
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(scan.violations.map(item => ({ id:item.id, impact:item.impact, nodes:item.nodes.map(node=>node.target) }))).toEqual([]);
  await page.locator("#lessonLevelFilter").selectOption("Средний");
  const courseScan = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(courseScan.violations.map(item => ({ id:item.id, impact:item.impact, nodes:item.nodes.map(node=>node.target) }))).toEqual([]);
  await page.locator("#projectGrid .project-card").filter({ hasText: "Доска задач" }).click();
  const projectScan = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(projectScan.violations.map(item => ({ id:item.id, impact:item.impact, nodes:item.nodes.map(node=>node.target) }))).toEqual([]);
});
