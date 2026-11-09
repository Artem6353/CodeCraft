(()=>{
"use strict";
const frame=document.querySelector("#jsSandbox"),editor=document.querySelector("#jsCode"),output=document.querySelector("#jsOutput"),status=document.querySelector("#jsStatus"),run=document.querySelector("#runJs"),stop=document.querySelector("#stopJs");
const starter=editor.value,MAX_CODE=100000;let requestId=0,ready=false,pending=null;
function setStatus(text){status.lastChild.textContent=" "+text;}
function reset(){ready=false;frame.src="/sandbox.html";setStatus("Перезапускаю среду…");}
frame.addEventListener("load",()=>{ready=false;frame.contentWindow.postMessage({type:"CODECRAFT_PING"},"*");});
window.addEventListener("message",event=>{
 if(event.source!==frame.contentWindow||!event.data||typeof event.data!=="object")return;
 const msg=event.data;
 if(msg.type==="CODECRAFT_READY"){ready=true;setStatus("Среда готова");return;}
 if(msg.type==="CODECRAFT_ERROR"){finish("Ошибка среды: "+String(msg.message||"Worker недоступен"),true);return;}
 if(msg.type!=="CODECRAFT_RESULT"||!pending||msg.id!==pending.id)return;
 const text=typeof msg.output==="string"?msg.output.slice(0,50100):"",error=typeof msg.error==="string"?msg.error.slice(0,4000):"";
 finish((text?text+"\n":"")+(error?"Ошибка: "+error:"Выполнение завершено."),false);
});
function finish(message,restart){if(pending)clearTimeout(pending.timer);pending=null;run.disabled=false;stop.disabled=true;output.textContent=message;setStatus(restart?"Нужен перезапуск":"Выполнение завершено");if(restart)reset();}
function execute(){
 if(pending)return;
 if(!ready){output.textContent="Среда ещё загружается. Попробуй через секунду.";return;}
 if(editor.value.length>MAX_CODE){output.textContent="Слишком большой код: максимум 100 000 символов.";return;}
 const id=++requestId;run.disabled=true;stop.disabled=false;output.textContent="Выполняю в отдельном Worker…";setStatus("Выполняется");
 const timer=setTimeout(()=>{if(pending?.id===id)finish("Время вышло (1,8 с). Worker остановлен.",true);},1800);
 pending={id,timer};frame.contentWindow.postMessage({type:"CODECRAFT_RUN",id,code:editor.value},"*");
}
run.addEventListener("click",execute);
stop.addEventListener("click",()=>{if(!pending)return;try{frame.contentWindow.postMessage({type:"CODECRAFT_CANCEL"},"*");}catch(_){}finish("Выполнение остановлено. Среда перезапущена.",true);});
document.querySelector("#resetJs").addEventListener("click",()=>{editor.value=starter;output.textContent="Пример восстановлен.";});
document.querySelector("#clearJs").addEventListener("click",()=>{output.textContent="Вывод очищен.";});
editor.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();execute();}if(event.key==="Escape"&&pending)stop.click();});
})();