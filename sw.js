const SHELL_CACHE = "codecraft-shell-v2";
const RUNTIME_CACHE = "codecraft-runtime-v2";
const CACHE_PREFIX = "codecraft-";
const CORE_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/lessons.js",
  "./js/app.js",
  "./sandbox.html",
  "./python-sandbox.html",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response || !response.ok || response.type === "opaque") return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > 80) await cache.delete(keys[0]);
}

self.addEventListener("message", event => {
  if (event.data && event.data.type === "CODECRAFT_SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match("./index.html")) ||
          new Response("CodeCraft пока недоступен офлайн. Открой сайт с интернетом один раз.", {
            status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cacheResponse(request, response);
      return response;
    } catch (error) {
      return new Response("Ресурс недоступен офлайн.", {
        status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
