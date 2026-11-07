(()=>{"use strict";const $=s=>document.querySelector(s);const lessons=window.CODECRAFT_LESSONS||[];let done=[];try{done=JSON.parse(localStorage.getItem("cc_progress")||"[]")}catch(e){done=[]}let active=0;
function progress(){const n=done.length,p=Math.round(n/lessons.length*100);$("#progressRing").style.setProperty("--p",p+"%");$("#progressPct").textContent=p+"%";$("#progressCount").textContent=n+" из "+lessons.length+" уроков"}
function renderMenu(){const menu=$("#lessonMenu");menu.innerHTML="";lessons.forEach((l,i)=>{const b=document.createElement("button");b.className="lesson-choice"+(i===active?" active":"");b.innerHTML=(done.includes(l.id)?"✓ ":"")+l.title;const small=document.createElement("small");small.textContent=l.course+" · "+l.level;b.append(small);b.addEventListener("click",()=>showLesson(i));menu.append(b)})}
function showLesson(i){active=i;const l=lessons[i],panel=$("#lessonPanel");panel.innerHTML="";const tag=document.createElement("span");tag.className="pill";tag.textContent=l.course+" · "+l.level;const h=document.createElement("h3");h.textContent=l.title;const p=document.createElement("p");p.textContent=l.text;const pre=document.createElement("pre");pre.textContent=l.code;const tip=document.createElement("p");tip.textContent="Запомни: "+l.tip;const btn=document.createElement("button");btn.className="btn";btn.textContent=done.includes(l.id)?"Урок пройден ✓":"Отметить урок пройденным";btn.addEventListener("click",()=>{if(!done.includes(l.id))done.push(l.id);try{localStorage.setItem("cc_progress",JSON.stringify(done))}catch(e){}renderMenu();progress();showLesson(i)});panel.append(tag,h,p,pre,tip,btn);renderMenu()}
document.querySelectorAll("[data-course]").forEach(b=>b.addEventListener("click",()=>{const map={html:0,js:3,python:5};showLesson(map[b.dataset.course]||0);$("#learn").scrollIntoView({behavior:"smooth"})}));
const starter=$("#codeEditor").value;
let activeFrame=null;
let activeTimer=null;
let activeToken=null;
function closeSandbox(){
  if(activeTimer!==null){clearTimeout(activeTimer);activeTimer=null;}
  if(activeFrame){activeFrame.remove();activeFrame=null;}
  activeToken=null;
}
window.addEventListener("message",event=>{
  if(!activeFrame||event.source!==activeFrame.contentWindow)return;
  const data=event.data;
  if(!data||data.type!=="codecraft-result"||data.token!==activeToken)return;
  $("#output").textContent=data.error?"Ошибка: "+data.error:(data.output||"Код выполнен без вывода.");
  closeSandbox();
});
$("#runCode").addEventListener("click",()=>{
  closeSandbox();
  const frame=document.createElement("iframe");
  const token=Date.now().toString(36)+Math.random().toString(36).slice(2);
  activeFrame=frame;
  activeToken=token;
  frame.setAttribute("sandbox","allow-scripts");
  frame.title="Изолированная среда JavaScript";
  frame.hidden=true;
  const csp="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data: blob:; style-src 'unsafe-inline'";
  const runner=[
    '<!doctype html><meta charset="utf-8">',
    '<meta http-equiv="Content-Security-Policy" content="'+csp+'">',
    '<script>',
    '(function(){',
    'var token='+JSON.stringify(token)+';',
    'window.addEventListener("message",function(event){',
    'if(event.source!==parent||!event.data||event.data.type!=="codecraft-run"||event.data.token!==token)return;',
    'var lines=[];',
    'function format(value){if(typeof value==="string")return value;try{var json=JSON.stringify(value);return json===undefined?String(value):json;}catch(_){return String(value);}}',
    'function write(values){lines.push(Array.prototype.map.call(values,format).join(" "));}',
    'var sandboxConsole={log:function(){write(arguments);},info:function(){write(arguments);},warn:function(){write(arguments);},error:function(){write(arguments);}};',
    'var error=null;',
    'try{(new Function("console", \'"use strict";\\\\n\' + String(event.data.code||"")))(sandboxConsole);}catch(e){error=e&&e.message?String(e.message):String(e);}',
    'parent.postMessage({type:"codecraft-result",token:token,output:lines.join("\\\\n"),error:error},"*");',
    '});',
    '})();',
    '</scr'+'ipt>'
  ].join("");
  frame.srcdoc=runner;
  frame.addEventListener("load",()=>{
    if(activeFrame===frame)frame.contentWindow.postMessage({type:"codecraft-run",token,code:$("#codeEditor").value},"*");
  },{once:true});
  document.body.append(frame);
  $("#output").textContent="Выполнение…";
  activeTimer=setTimeout(()=>{
    if(activeFrame===frame){
      closeSandbox();
      $("#output").textContent="Превышено время выполнения (2 секунды).";
    }
  },2000);
});
$("#resetEditor").addEventListener("click",()=>{$("#codeEditor").value=starter;$("#output").textContent="Пример восстановлен."});$("#clearOutput").addEventListener("click",()=>$("#output").textContent="Вывод очищен.");
$("#quizOptions").addEventListener("click",e=>{const b=e.target.closest("button[data-answer]");if(!b)return;document.querySelectorAll("#quizOptions button").forEach(x=>x.classList.remove("correct","wrong"));if(b.dataset.answer==="1"){b.classList.add("correct");$("#quizFeedback").textContent="Правильно! Тег <a> создаёт гиперссылку."}else{b.classList.add("wrong");$("#quizFeedback").textContent="Пока неверно. Подсказка: нужный тег короткий и обозначает anchor."}});$("#retryQuiz").addEventListener("click",()=>{document.querySelectorAll("#quizOptions button").forEach(x=>x.classList.remove("correct","wrong"));$("#quizFeedback").textContent="Выбери один вариант."});
$("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));$("#nav").addEventListener("click",e=>{if(e.target.closest("a"))$("#nav").classList.remove("open")});showLesson(0);progress()})();