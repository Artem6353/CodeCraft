const SHELL_CACHE="codecraft-shell-v3",RUNTIME_CACHE="codecraft-runtime-v3",CACHE_PREFIX="codecraft-";
const CORE_FILES=[
 "./","./index.html","./legacy.html","./courses/","./courses/index.html","./courses/html-css/","./courses/html-css/index.html","./courses/javascript/","./courses/javascript/index.html","./courses/python/","./courses/python/index.html","./lesson.html","./practice.html","./projects.html","./playground.html","./python.html","./exam.html","./dashboard.html","./404.html",
 "./css/site.css","./css/style.css","./js/site.js","./js/lessons.js","./js/course.js","./js/lesson.js","./js/training-data.js","./js/practice.js","./js/projects.js","./js/playground.js","./js/python.js","./js/exam.js","./js/dashboard.js","./js/app.js","./sandbox.html","./python-sandbox.html","./manifest.webmanifest","./assets/icon.svg"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(CORE_FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&![SHELL_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
async function cacheResponse(request,response){if(!response?.ok||response.type==="opaque")return;const cache=await caches.open(RUNTIME_CACHE);await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>80)await cache.delete(keys[0]);}
self.addEventListener("message",event=>{if(event.data?.type==="CODECRAFT_SKIP_WAITING")self.skipWaiting();});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith((async()=>{
   try{const response=await fetch(request);if(response.ok){const cache=await caches.open(SHELL_CACHE);try{await cache.put(request,response.clone());}catch(_){}}return response;}
   catch(_){
    const pathname=url.pathname,alternate=pathname.endsWith("/")?pathname+"index.html":pathname;
    const cached=await caches.match(request)||await caches.match("."+alternate)||await caches.match("./index.html");
    return cached||new Response("CodeCraft пока недоступен офлайн. Открой нужную страницу с интернетом один раз.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
   }
  })());return;
 }
 event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok){try{await cacheResponse(request,response);}catch(_){}}return response;}catch(_){return new Response("Ресурс недоступен офлайн.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});}})());
});