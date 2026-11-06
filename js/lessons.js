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