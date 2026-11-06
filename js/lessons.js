window.CODECRAFT_LESSONS = [
  {
    id: "html1", course: "HTML и CSS", title: "Что такое HTML?", level: "Начальный",
    text: "HTML описывает смысл и структуру страницы: заголовки, абзацы, списки, изображения и ссылки. Браузер читает разметку и строит документ.",
    code: "<h1>Привет, мир!</h1>\n<p>Это мой первый сайт.</p>",
    tip: "HTML — язык разметки, а не язык программирования.",
    question: "Какой тег обычно используют для самого важного заголовка страницы?",
    options: ["<h1>", "<head>", "<title>"], correct: 0,
    explanation: "<h1> обозначает заголовок первого уровня. <title> задаёт название вкладки браузера."
  },
  {
    id: "html2", course: "HTML и CSS", title: "Ссылки и изображения", level: "Начальный",
    text: "Ссылка создаётся тегом a и адресом в href. Изображение вставляют тегом img; атрибут alt описывает его тем, кто не видит картинку.",
    code: '<a href="https://example.com">Открыть сайт</a>\n<img src="photo.jpg" alt="Описание фото">',
    tip: "У содержательных изображений всегда указывай полезный alt-текст.",
    question: "В каком атрибуте тега a указывают адрес ссылки?",
    options: ["src", "href", "alt"], correct: 1,
    explanation: "Атрибут href содержит адрес, на который ведёт ссылка."
  },
  {
    id: "html3", course: "HTML и CSS", title: "Списки и семантика", level: "Начальный",
    text: "Маркированный список создают ul, нумерованный — ol, а каждый пункт помещают в li. Семантические элементы помогают описать назначение частей страницы.",
    code: "<ul>\n  <li>Первый пункт</li>\n  <li>Второй пункт</li>\n</ul>\n<header>Шапка сайта</header>",
    tip: "Выбирай HTML-элемент по смыслу, а не только ради внешнего вида.",
    question: "Какой тег задаёт отдельный пункт списка?",
    options: ["<item>", "<li>", "<ul>"], correct: 1,
    explanation: "<li> означает list item — отдельный пункт списка."
  },
  {
    id: "html4", course: "HTML и CSS", title: "Формы и ввод данных", level: "Начальный",
    text: "Формы собирают данные пользователя. label связывают с полем input через for и id. Атрибут type задаёт вид поля, а required делает его обязательным.",
    code: '<label for="email">Почта</label>\n<input id="email" type="email" required>',
    tip: "Подписывай поля через label — так форма удобнее и доступнее.",
    question: "Какой атрибут делает поле обязательным для заполнения?",
    options: ["placeholder", "required", "checked"], correct: 1,
    explanation: "required сообщает браузеру, что поле должно быть заполнено."
  },
  {
    id: "css1", course: "HTML и CSS", title: "Первые стили CSS", level: "Начальный",
    text: "CSS управляет внешним видом страницы. Селектор выбирает элементы, а свойства внутри фигурных скобок задают цвет, размер, отступы и другие параметры.",
    code: "h1 {\n  color: royalblue;\n  font-size: 32px;\n}\nbody { font-family: Arial, sans-serif; }",
    tip: "Правило CSS состоит из селектора и блока объявлений.",
    question: "Какое свойство меняет цвет текста?",
    options: ["background", "font-size", "color"], correct: 2,
    explanation: "color задаёт цвет текста; background отвечает за фон."
  },
  {
    id: "css2", course: "HTML и CSS", title: "Отступы и блочная модель", level: "Начальный",
    text: "В CSS margin задаёт внешний отступ, padding — внутренний. border рисует границу. Свойство box-sizing: border-box упрощает расчёт размеров блоков.",
    code: ".card {\n  padding: 16px;\n  margin: 12px;\n  border: 1px solid #999;\n  box-sizing: border-box;\n}",
    tip: "Не путай расстояние внутри элемента (padding) и снаружи (margin).",
    question: "Какое свойство создаёт пространство между содержимым и границей элемента?",
    options: ["padding", "margin", "outline"], correct: 0,
    explanation: "padding — внутренний отступ между содержимым и границей."
  },
  {
    id: "css3", course: "HTML и CSS", title: "Flexbox: расположение элементов", level: "Начальный",
    text: "Flexbox помогает размещать элементы в строку или колонку и управлять расстоянием между ними. Для начала задай родителю display: flex.",
    code: ".row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}",
    tip: "Flexbox работает с непосредственными дочерними элементами flex-контейнера.",
    question: "Как включить Flexbox для элемента-контейнера?",
    options: ["position: flex", "display: flex", "flex: display"], correct: 1,
    explanation: "display: flex превращает элемент в flex-контейнер."
  },
  {
    id: "css4", course: "HTML и CSS", title: "Адаптивность и медиазапросы", level: "Начальный",
    text: "Медиазапросы позволяют менять стили в зависимости от ширины экрана. Так карточки могут выстраиваться в три колонки на компьютере и одну на телефоне.",
    code: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); }\n@media (max-width: 600px) {\n  .grid { grid-template-columns: 1fr; }\n}",
    tip: "Проверяй страницу на узком экране и не заставляй пользователя прокручивать её по горизонтали.",
    question: "Как начинается медиазапрос CSS?",
    options: ["@screen", "@media", "@mobile"], correct: 1,
    explanation: "@media применяет правила при выполнении заданного условия."
  },
  {
    id: "js1", course: "JavaScript", title: "Переменные и значения", level: "Начальный",
    text: "Переменная хранит значение. Используй const, если не собираешься переназначать переменную, и let — если значение будет меняться.",
    code: 'const language = "JavaScript";\nlet level = 1;\nlevel = level + 1;\nconsole.log(language, level);',
    tip: "Предпочитай const, а let используй только там, где нужно переназначение.",
    question: "Какое ключевое слово подходит для переменной, которую планируется переназначать?",
    options: ["const", "let", "fixed"], correct: 1,
    explanation: "let позволяет присваивать переменной новое значение."
  },
  {
    id: "js2", course: "JavaScript", title: "Условия if и else", level: "Начальный",
    text: "Условие позволяет выбрать действие. Если выражение после if истинно, выполняется первый блок; иначе можно выполнить блок else.",
    code: "const score = 75;\nif (score >= 60) {\n  console.log('Зачёт!');\n} else {\n  console.log('Попробуй ещё');\n}",
    tip: "Оператор >= означает «больше или равно».",
    question: "Какой блок выполнится, если условие if ложно?",
    options: ["else", "then", "case"], correct: 0,
    explanation: "Блок else выполняется, когда условие if не истинно."
  },
  {
    id: "js3", course: "JavaScript", title: "Циклы for", level: "Начальный",
    text: "Цикл повторяет действие. В for обычно задают начальное значение, условие продолжения и изменение счётчика.",
    code: "for (let i = 1; i <= 3; i++) {\n  console.log('Шаг ' + i);\n}",
    tip: "Следи, чтобы условие цикла в какой-то момент стало ложным.",
    question: "Сколько раз выполнится тело цикла for (let i = 0; i < 4; i++)?",
    options: ["3", "4", "5"], correct: 1,
    explanation: "Значения i будут 0, 1, 2 и 3 — всего четыре итерации."
  },
  {
    id: "js4", course: "JavaScript", title: "Функции", level: "Начальный",
    text: "Функция объединяет инструкции в повторно используемый блок. Параметры принимают входные значения, а return возвращает результат.",
    code: "function double(number) {\n  return number * 2;\n}\nconsole.log(double(5));",
    tip: "Одна функция — одна понятная задача. Давай ей имя, описывающее действие.",
    question: "Какое ключевое слово возвращает результат из функции?",
    options: ["send", "return", "break"], correct: 1,
    explanation: "return завершает выполнение функции и возвращает значение вызывающему коду."
  },
  {
    id: "py1", course: "Python", title: "Переменные и print", level: "Начальный",
    text: "Python позволяет хранить значения в переменных и выводить их с помощью print. Тип значения часто определяется автоматически.",
    code: 'name = "Мир"\ncount = 3\nprint("Привет,", name)\nprint(count)',
    tip: "В Python обычно не нужно объявлять тип переменной заранее.",
    question: "Какая команда выводит текст в консоль Python?",
    options: ["echo()", "print()", "console.log()"], correct: 1,
    explanation: "В Python для вывода используют встроенную функцию print()."
  },
  {
    id: "py2", course: "Python", title: "Условия", level: "Начальный",
    text: "Условие начинается с if и заканчивается двоеточием. Вложенный код выделяется отступом. Альтернативная ветка задаётся словом else.",
    code: 'age = 18\nif age >= 18:\n    print("Можно")\nelse:\n    print("Пока рано")',
    tip: "Отступы — часть синтаксиса Python. Обычно используют четыре пробела.",
    question: "Что ставят в конце строки if перед блоком кода?",
    options: ["Точку с запятой", "Двоеточие", "Фигурную скобку"], correct: 1,
    explanation: "После условия в Python ставится двоеточие, а блок выделяется отступом."
  },
  {
    id: "py3", course: "Python", title: "Цикл for", level: "Начальный",
    text: "Цикл for перебирает элементы последовательности. Функция range(n) создаёт последовательность чисел от 0 до n, не включая n.",
    code: "for number in range(3):\n    print(number)",
    tip: "range(3) выдаёт 0, 1 и 2 — верхняя граница не включается.",
    question: "Какие числа выдаёт range(3)?",
    options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3"], correct: 1,
    explanation: "range(3) начинается с нуля и не включает конечное значение 3."
  },
  {
    id: "py4", course: "Python", title: "Функции def", level: "Начальный",
    text: "Функцию объявляют с помощью def. Она может принимать параметры и возвращать результат через return.",
    code: "def greet(name):\n    return 'Привет, ' + name\n\nprint(greet('Аня'))",
    tip: "Функции помогают не повторять один и тот же код.",
    question: "Как объявить функцию в Python?",
    options: ["function greet():", "def greet():", "new greet()"], correct: 1,
    explanation: "Объявление функции в Python начинается с ключевого слова def."
  }
];

window.CODECRAFT_LESSONS.push(
 {id:"html5",course:"HTML и CSS",title:"Таблицы данных",level:"Начальный+",text:"Таблицы подходят для табличных данных: строки создают tr, заголовочные ячейки — th, обычные — td. Не используй таблицы для построения макета страницы.",code:"<table>\n  <thead><tr><th>Имя</th><th>Баллы</th></tr></thead>\n  <tbody><tr><td>Аня</td><td>95</td></tr></tbody>\n</table>",tip:"Добавляй caption или понятные заголовки столбцов, чтобы таблица была доступнее.",question:"Какой тег создаёт строку таблицы?",options:["<td>","<tr>","<th>"],correct:1,explanation:"tr означает table row — строка таблицы."},
 {id:"html6",course:"HTML и CSS",title:"Доступность интерфейса",level:"Начальный+",text:"Доступный интерфейс можно использовать клавиатурой и вспомогательными технологиями. У кнопок должны быть понятные названия, у изображений — alt, у полей — label.",code:'<label for="userName">Имя</label>\n<input id="userName" name="name">\n<button type="button" aria-label="Открыть меню">☰</button>',tip:"Не полагайся только на цвет: состояние должно быть понятно и по тексту или форме.",question:"Для чего нужен атрибут alt у изображения?",options:["Задаёт ширину","Описывает изображение","Добавляет ссылку"],correct:1,explanation:"alt предоставляет текстовую альтернативу изображению."},
 {id:"html7",course:"HTML и CSS",title:"Аудио и видео",level:"Начальный+",text:"HTML умеет встраивать мультимедиа без сторонних плееров. Атрибут controls показывает элементы управления, а source позволяет указать файл и MIME-тип.",code:'<video controls width="480">\n  <source src="movie.mp4" type="video/mp4">\n  Ваш браузер не поддерживает видео.\n</video>',tip:"Добавляй текстовую альтернативу и субтитры, когда они нужны аудитории.",question:"Как показать стандартные кнопки управления видео?",options:["controls","autoplay","poster"],correct:0,explanation:"Атрибут controls включает встроенные элементы управления."},
 {id:"html8",course:"HTML и CSS",title:"Метаданные и структура документа",level:"Начальный+",text:"В head размещают метаданные, название вкладки и подключения стилей. viewport помогает браузеру правильно масштабировать страницу на телефонах.",code:'<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Мой сайт</title>\n</head>',tip:"Кодировка UTF-8 и корректный viewport — базовые настройки почти каждой страницы.",question:"Какой meta-тег задаёт масштабирование под ширину устройства?",options:["description","viewport","author"],correct:1,explanation:"viewport сообщает браузеру, как соотносить ширину страницы с шириной устройства."},
 {id:"css5",course:"HTML и CSS",title:"CSS Grid",level:"Начальный+",text:"Grid помогает создавать двумерные сетки. Родитель становится grid-контейнером через display: grid, а grid-template-columns задаёт колонки.",code:".cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}",tip:"Для адаптивной сетки попробуй repeat(auto-fit, minmax(220px, 1fr)).",question:"Как включить CSS Grid?",options:["display: grid","position: grid","grid: display"],correct:0,explanation:"display: grid превращает элемент в grid-контейнер."},
 {id:"css6",course:"HTML и CSS",title:"Псевдоклассы и состояния",level:"Начальный+",text:"Псевдоклассы описывают состояние элемента. :hover срабатывает при наведении, :focus-visible помогает показать клавиатурный фокус, :disabled — отключённое состояние.",code:"button:hover { transform: translateY(-2px); }\nbutton:focus-visible { outline: 3px solid orange; }\nbutton:disabled { opacity: .5; }",tip:"Не убирай outline без равноценного заметного индикатора фокуса.",question:"Какой псевдокласс отвечает за клавиатурный фокус?",options:[":hover",":focus-visible",":active"],correct:1,explanation:":focus-visible позволяет выделить элемент, когда браузер считает фокус визуально необходимым."},
 {id:"css7",course:"HTML и CSS",title:"CSS-переменные",level:"Начальный+",text:"Пользовательские свойства CSS помогают хранить повторяющиеся значения. Обычно их объявляют в :root и используют через var().",code:":root {\n  --accent: #20c997;\n  --radius: 14px;\n}\n.card {\n  border-radius: var(--radius);\n  border-color: var(--accent);\n}",tip:"Переменные упрощают смену темы и поддержку единой дизайн-системы.",question:"Как получить значение CSS-переменной?",options:["value(--accent)","var(--accent)","get(--accent)"],correct:1,explanation:"Функция var() подставляет значение пользовательского свойства."},
 {id:"css8",course:"HTML и CSS",title:"Переходы и анимация",level:"Начальный+",text:"transition делает изменение CSS-свойства плавным. Для сложных последовательностей используют @keyframes и animation. Учитывай настройку prefers-reduced-motion.",code:".card {\n  transition: transform .2s ease;\n}\n.card:hover {\n  transform: translateY(-4px);\n}",tip:"Анимация должна помогать понять интерфейс, а не мешать работе.",question:"Какое свойство задаёт плавный переход между состояниями?",options:["transition","transform","position"],correct:0,explanation:"transition задаёт длительность и характер изменения CSS-свойств."},
 {id:"js5",course:"JavaScript",title:"Массивы и методы",level:"Начальный+",text:"Массив хранит упорядоченную коллекцию значений. push добавляет элемент, map создаёт новый массив преобразованных значений, filter оставляет подходящие элементы.",code:"const scores = [4, 7, 9];\nconst doubled = scores.map(score => score * 2);\nconst high = scores.filter(score => score >= 7);\nconsole.log(doubled, high);",tip:"map и filter не изменяют исходный массив — они возвращают новый.",question:"Как добавить элемент в конец массива?",options:["push()","pop()","shift()"],correct:0,explanation:"Метод push() добавляет один или несколько элементов в конец массива."},
 {id:"js6",course:"JavaScript",title:"Объекты и свойства",level:"Начальный+",text:"Объект объединяет связанные данные в пары ключ–значение. Свойства читают через точку или квадратные скобки.",code:'const user = { name: "Аня", level: 2 };\nconsole.log(user.name);\nuser.level = 3;',tip:"Используй объекты, когда значения описывают одну сущность.",question:"Как прочитать свойство name объекта user?",options:["user->name","user.name","user(name)"],correct:1,explanation:"Точечная запись user.name читает свойство name."},
 {id:"js7",course:"JavaScript",title:"DOM: изменение страницы",level:"Начальный+",text:"DOM — объектное представление HTML-документа. querySelector находит первый подходящий элемент, а textContent безопасно меняет его текст.",code:'const title = document.querySelector("h1");\ntitle.textContent = "Новый заголовок";',tip:"Для вывода обычного текста предпочитай textContent, а не innerHTML.",question:"Что возвращает document.querySelector('.card')?",options:["Первый элемент с классом card","Все элементы card","Строку HTML"],correct:0,explanation:"querySelector возвращает первый найденный элемент или null."},
 {id:"js8",course:"JavaScript",title:"События и обработчики",level:"Начальный+",text:"События сообщают о действиях пользователя и изменениях среды. addEventListener регистрирует обработчик, который срабатывает при наступлении события.",code:'const button = document.querySelector("button");\nbutton.addEventListener("click", () => {\n  console.log("Нажатие!");\n});',tip:"Не назначай обработчик клика через строковый атрибут onclick — используй addEventListener.",question:"Как зарегистрировать обработчик клика?",options:["button.on('click')","addEventListener('click', handler)","listen('click')"],correct:1,explanation:"addEventListener добавляет обработчик указанного события."},
 {id:"py5",course:"Python",title:"Списки и операции",level:"Начальный+",text:"Список хранит упорядоченную последовательность. append добавляет элемент, len возвращает длину, а индексы начинаются с нуля.",code:'tasks = ["учиться", "практиковаться"]\ntasks.append("создать проект")\nprint(len(tasks))\nprint(tasks[0])',tip:"Обращение к несуществующему индексу вызовет IndexError.",question:"Как добавить элемент в конец списка?",options:["append()","addEnd()","push()"],correct:0,explanation:"Метод append() добавляет один элемент в конец списка."},
 {id:"py6",course:"Python",title:"Словари",level:"Начальный+",text:"Словарь хранит пары ключ–значение. Ключи используют для доступа к данным, а метод get позволяет задать значение по умолчанию.",code:'user = {"name": "Аня", "level": 2}\nprint(user["name"])\nprint(user.get("city", "Не указан"))',tip:"Проверяй наличие ключа или используй get(), если ключ может отсутствовать.",question:"Как получить значение по ключу name?",options:["user.name","user['name']","user(name)"],correct:1,explanation:"Квадратные скобки с ключом читают соответствующее значение словаря."},
 {id:"py7",course:"Python",title:"Цикл while",level:"Начальный+",text:"while повторяет блок, пока условие истинно. Внутри цикла важно изменять состояние так, чтобы условие когда-нибудь стало ложным.",code:"count = 3\nwhile count > 0:\n    print(count)\n    count -= 1",tip:"Проверяй, что цикл не становится бесконечным.",question:"Когда завершается цикл while?",options:["Когда условие становится ложным","После одного повторения","Только при break"],correct:0,explanation:"while продолжает работу, пока условие истинно."},
 {id:"py8",course:"Python",title:"Обработка ошибок",level:"Начальный+",text:"try/except позволяет обработать ожидаемые ошибки и не завершать программу аварийно. Перехватывай конкретные типы исключений, когда это возможно.",code:'try:\n    number = int("42")\n    print(number)\nexcept ValueError:\n    print("Нужно ввести число")',tip:"Не используй пустой except без причины: он может скрыть настоящие ошибки.",question:"Какой блок перехватывает исключение?",options:["catch","except","error"],correct:1,explanation:"В Python блок except обрабатывает исключения, возникшие в try."}
);
