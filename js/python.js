(()=>{
"use strict";
const frame=document.querySelector("#pythonSandbox"),editor=document.querySelector("#pythonCode"),output=document.querySelector("#pythonOutput"),status=document.querySelector("#pythonStatus"),run=document.querySelector("#runPython");
const examples={
 hello:'name = "CodeCraft"\nprint("Привет,", name)\nprint("Добро пожаловать в Python!")',
 loops:'for number in range(1, 6):\n    print("Шаг", number)',
 lists:'fruits = ["яблоко", "груша", "слива"]\nfruits.append("апельсин")\nfor fruit in fruits:\n    print(fruit)',
 functions:'def greet(name):\n    return "Привет, " + name\n\nprint(greet("CodeCraft"))'
};
const select=document.querySelector("#pythonExample");let active=select.value,ready=false,pending=null,requestId=0;
function setStatus(text){status.lastChild.textContent=" "+text;}
function reset(){if(pending)clearTimeout(pending.timer);pending=null;ready=false;run.disabled=false;frame.src="/python-sandbox.html";setStatus("Перезапускаю среду…");}
frame.addEventListener("load",()=>frame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_PING"},"*"));
window.addEventListener("message",event=>{
 if(event.source!==frame.contentWindow||!event.data||typeof event.data!=="object")return;
 const msg=event.data;
 if(msg.type==="CODECRAFT_PYTHON_READY"){ready=true;setStatus("Интерпретатор готов");return;}
 if(msg.type==="CODECRAFT_PYTHON_ERROR"){ready=false;if(pending)clearTimeout(pending.timer);pending=null;run.disabled=false;setStatus(String(msg.message||"Ошибка загрузки Python").slice(0,300));return;}
 if(msg.type!=="CODECRAFT_PYTHON_RESULT"||!pending||msg.id!==pending.id)return;
 clearTimeout(pending.timer);pending=null;run.disabled=false;const text=typeof msg.output==="string"?msg.output.slice(0,50100):"";const error=typeof msg.error==="string"?msg.error.slice(0,4000):"";output.textContent=text+(error?"\nОшибка: "+error:"");setStatus(error?"Ошибка выполнения":"Выполнение завершено");
});
select.addEventListener("change",()=>{active=select.value;editor.value=examples[active]||examples.hello;output.textContent="Выбран пример: "+select.options[select.selectedIndex].text;});
document.querySelector("#resetPython").addEventListener("click",()=>{editor.value=examples[active]||examples.hello;output.textContent="Пример восстановлен.";});
document.querySelector("#retryPython").addEventListener("click",reset);
document.querySelector("#clearPython").addEventListener("click",()=>{output.textContent="Вывод очищен.";});
function execute(){
 if(pending)return;
 if(!ready){setStatus("Ожидаю загрузку Skulpt — проверь интернет.");return;}
 if(editor.value.length>100000){output.textContent="Слишком большой код: максимум 100 000 символов.";return;}
 const id=++requestId;run.disabled=true;output.textContent="Выполняю Python…";const timer=setTimeout(()=>{if(pending?.id===id){pending=null;run.disabled=false;output.textContent="Превышено время ожидания (7 секунд).";reset();}},7000);pending={id,timer};frame.contentWindow.postMessage({type:"CODECRAFT_PYTHON_RUN",id,code:editor.value},"*");
}
run.addEventListener("click",execute);editor.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();execute();}});
})();