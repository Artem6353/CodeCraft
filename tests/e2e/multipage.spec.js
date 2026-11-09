import { test, expect } from "@playwright/test";

test("home and course pages use independent URLs", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CodeCraft/);
  await expect(page.getByRole("heading", { name: /Не просто учи код/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Выбрать свой маршрут/i })).toHaveAttribute("href", "/courses/");
  await page.goto("/courses/");
  await expect(page.getByRole("heading", { name: /Выбери свой/i })).toBeVisible();
  await expect(page.locator(".course-card")).toHaveCount(3);
  await page.goto("/courses/html-css/");
  await expect(page.locator("#courseLessonList .lesson-row")).toHaveCount(20);
  await expect(page.locator("#courseProgressText")).toContainText("0 из 20");
});

test("lesson page marks progress and stores notes and bookmarks", async ({ page }) => {
  await page.goto("/lesson.html?id=html1");
  await expect(page.locator(".lesson-main h1")).toHaveText("Что такое HTML?");
  await page.locator(".lesson-question .answer-option").nth(0).click();
  await page.locator(".lesson-aside textarea").fill("Проверка заметок на отдельной странице.");
  await expect(page.locator(".lesson-aside .status-text")).toContainText("Сохранено");
  await page.getByRole("button", { name: /Отметить урок пройденным/ }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_progress") || "[]"))).toContain("html1");
  await page.getByRole("button", { name: /В избранное/ }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_bookmarks") || "[]"))).toContain("html1");
});

test("practice validates a solution and keeps the result", async ({ page }) => {
  await page.goto("/practice.html");
  await expect(page.locator("#challengeList .challenge-pick")).toHaveCount(20);
  await page.locator("#challengeCode").fill("<h1>Привет!</h1><p>Моя страница.</p>");
  await page.locator("#checkChallenge").click();
  await expect(page.locator("#challengeResult")).toContainText("Начислено 30 XP");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cc_challenges") || "[]"))).toContain("html-heading");
});

test("project workspace shows six projects and previews without scripts", async ({ page }) => {
  await page.goto("/projects.html");
  await expect(page.locator("#projectList .project-pick")).toHaveCount(6);
  await expect(page.locator("#projectCode")).not.toBeEmpty();
  await page.locator("#previewProject").click();
  await expect(page.frameLocator("#projectPreview").locator("h1")).toBeVisible();
});

test("JavaScript lab runs code outside the parent page", async ({ page }) => {
  await page.goto("/playground.html");
  await expect(page.locator("#jsStatus")).toContainText("Среда готова", { timeout: 10000 });
  await page.locator("#jsCode").fill('console.log("isolated"); console.log(typeof document);');
  await page.locator("#runJs").click();
  await expect(page.locator("#jsOutput")).toContainText("isolated");
  await expect(page.locator("#jsOutput")).toContainText("undefined");
});

test("dashboard displays local progress and backup actions", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cc_progress", JSON.stringify(["html1","html2"])));
  await page.goto("/dashboard.html");
  await expect(page.locator("#dashboardStats")).toContainText("2 / 44");
  await expect(page.locator("#dashboardCourses .dashboard-course")).toHaveCount(3);
  await expect(page.locator("#exportProgress")).toBeVisible();
  await expect(page.locator("#importProgressFile")).toHaveAttribute("type", "file");
});

test("responsive layout stays inside phone and desktop viewports", async ({ page }) => {
  for (const path of ["/", "/courses/", "/courses/html-css/", "/practice.html", "/playground.html", "/dashboard.html"]) {
    await page.goto(path);
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth
      }));
      expect(dimensions.document, "horizontal overflow at "+path+" / "+width).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  }
});

test("Python page loads Skulpt and runs a basic program", async ({ page }) => {
  await page.goto("/python.html");
  await expect(page.locator("#pythonStatus")).toContainText("Интерпретатор готов", { timeout: 30000 });
  await page.locator("#pythonCode").fill('print("python-multipage-ok")');
  await page.locator("#runPython").click();
  await expect(page.locator("#pythonOutput")).toContainText("python-multipage-ok", { timeout: 15000 });
});

test("exam page completes ten questions and stores an attempt", async ({ page }) => {
  await page.goto("/exam.html");
  for (let index = 0; index < 10; index += 1) {
    await expect(page.locator("#examOptions button")).toHaveCount(3);
    await page.locator("#examOptions button").first().click();
    await expect(page.locator("#examNext")).toBeEnabled();
    await page.locator("#examNext").click();
  }
  await expect(page.locator("#examResult")).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const history = JSON.parse(localStorage.getItem("cc_exam_history_v1") || "{}");
    return history["Смешанный экзамен::Все уровни"]?.attempts || 0;
  })).toBe(1);
});

test("mobile menu opens, navigates and returns focus after Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.locator("#menuBtn");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mainNav")).toHaveClass(/open/);
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator("#mainNav a[href='/courses/']").click();
  await expect(page).toHaveURL(/\/courses\/$/);
});
test("SEO files and public pages expose canonical metadata", async ({ page, request }) => {
  const robots = await request.get("/robots.txt");
  const sitemap = await request.get("/sitemap.xml");
  expect(robots.ok()).toBeTruthy();
  expect(sitemap.ok()).toBeTruthy();
  await expect(sitemap.text()).resolves.toContain("/courses/html-css/");
  await page.goto("/courses/html-css/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /courses\/html-css\/$/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "CodeCraft");
});
