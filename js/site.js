(()=>{
"use strict";
const headerButton=document.querySelector("#menuBtn");
const nav=document.querySelector("#mainNav");
function setMenu(open,returnFocus=false){
 if(!headerButton||!nav)return;
 nav.classList.toggle("open",open);
 headerButton.setAttribute("aria-expanded",String(open));
 headerButton.setAttribute("aria-label",open?"Закрыть меню":"Открыть меню");
 if(open)nav.querySelector("a")?.focus();
 if(!open&&returnFocus)headerButton.focus();
}
headerButton?.addEventListener("click",()=>setMenu(!nav.classList.contains("open")));
nav?.addEventListener("click",event=>{if(event.target.closest("a"))setMenu(false);});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&nav?.classList.contains("open"))setMenu(false,true);});
document.addEventListener("pointerdown",event=>{if(nav?.classList.contains("open")&&!nav.contains(event.target)&&!headerButton?.contains(event.target))setMenu(false);});
const desktop=window.matchMedia("(min-width: 821px)");
const closeOnDesktop=event=>{if(event.matches&&nav?.classList.contains("open"))setMenu(false);};
desktop.addEventListener?desktop.addEventListener("change",closeOnDesktop):desktop.addListener(closeOnDesktop);
const active=document.body.dataset.active;
const map={home:"/",courses:"/courses/",practice:"/practice.html",projects:"/projects.html",playground:"/playground.html",python:"/python.html",exam:"/exam.html",dashboard:"/dashboard.html"};
if(nav&&map[active])nav.querySelectorAll("a").forEach(link=>{if(link.getAttribute("href")===map[active])link.setAttribute("aria-current","page");});
document.querySelectorAll("[data-year]").forEach(node=>node.textContent=String(new Date().getFullYear()));
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
})();