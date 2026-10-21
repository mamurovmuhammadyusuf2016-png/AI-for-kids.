// Generated learning content: training tasks, topic tests, reading texts,
// word cards and the topic list of a school year. Gemini returns JSON that
// is checked and trimmed here; arithmetic answers are re-computed in code.
const { evaluate, fmt } = require('./math');

// Used as "на <name> языке". Russian must stay Cyrillic; Uzbek is Latin with apostrophes.
const LANG_NAME = {
  ru: 'русском (только кириллицей, без транслита)',
  uz: "узбекском (латиницей; буквы o' и g' и знак ' всегда с апострофом: go'zal, yo'li, ma'no)",
  en: 'английском',
};

const TASK_SCHEMA = {
  type: 'OBJECT',
  properties: {
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING' },
          question: { type: 'STRING' },
          type: { type: 'STRING', enum: ['choice', 'input'] },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          answer: { type: 'STRING' },
          explanation: { type: 'STRING' },
          rule: { type: 'STRING' },
        },
        required: ['topic', 'question', 'type', 'answer', 'explanation', 'rule'],
      },
    },
  },
  required: ['tasks'],
};

const READING_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    text: { type: 'STRING' },
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          answer: { type: 'STRING' },
          explanation: { type: 'STRING' },
        },
        required: ['question', 'options', 'answer', 'explanation'],
      },
    },
  },
  required: ['title', 'text', 'questions'],
};

const CARDS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    words: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { front: { type: 'STRING' }, back: { type: 'STRING' }, example: { type: 'STRING' } },
        required: ['front', 'back'],
      },
    },
  },
  required: ['title', 'words'],
};

const TOPICS_SCHEMA = {
  type: 'OBJECT',
  properties: { topics: { type: 'ARRAY', items: { type: 'STRING' } } },
  required: ['topics'],
};

const COMMON = `Ты составляешь учебные материалы для школьников Узбекистана (школьная программа, 1–11 класс).
Материалы должны быть безопасными и подходящими для детей, без эмодзи и без Markdown.
Простую арифметику пиши обычным текстом (3 × 4, 12 : 3). Формулы (дроби, степени, корни, уравнения) пиши в LaTeX внутри знаков доллара: $\\frac{3}{4}$, $x^2$, $\\sqrt{16}$.
В JSON обратный слеш внутри строк пиши двойным: "$\\\\frac{3}{4}$".
Поле answer у заданий type "input" — без LaTeX: число или короткие слова. У type "choice" answer дословно совпадает с одним из options.
Все факты и ответы должны быть точными. Если не уверен в факте — не используй его.`;

const LEVELS = ['', 'очень лёгкий', 'лёгкий', 'средний', 'выше среднего', 'сложный'];

// LaTeX inside JSON is often written with one backslash, so "\frac" arrives as a
// form feed + "rac", "\times" as a tab + "imes", "\beta" as a backspace + "eta".
// Turn those control characters back into the LaTeX commands.
function repairLatex(v) {
  if (typeof v === 'string') {
    return v
      .replace(/\f/g, '\\f')
      .replace(/\x08/g, '\\b')
      .replace(/\t(?=[a-zA-Z])/g, '\\t')
      .replace(/\r(?=[a-zA-Z])/g, '\\r')
      .replace(/\$[^$]*\$/g, (m) => m.replace(/\n(?=[a-zA-Z])/g, '\\n'));
  }
  if (Array.isArray(v)) return v.map(repairLatex);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, repairLatex(x)]));
  return v;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Re-checks "what is 25 × 4"-style tasks in code and fixes a wrong answer.
function fixArithmetic(task) {
  const expr = task.question.match(/[\d\s.,()+\-×x*·:÷/^]+(?==|\?|$)/);
  const answer = Number(task.answer.replace(',', '.'));
  if (!expr || !Number.isFinite(answer)) return task;
  const src = expr[0].replace(/[×x·]/g, '*').replace(/[:÷]/g, '/').replace(/,(\d)/g, '.$1').trim();
  if (!/\d\s*[-+*/^]\s*\(?\s*\d/.test(src)) return task;
  const value = evaluate(src);
  if (value === null || Math.abs(value - answer) < 1e-9) return task;
  const fixed = fmt(value);
  const options = task.options.map((o) => (o === task.answer ? fixed : o));
  if (task.type === 'choice' && !options.includes(fixed)) options[0] = fixed;
  return { ...task, answer: fixed, options };
}

function cleanTasks(data, max) {
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
  return tasks
    .map((t) => {
      const task = {
        topic: str(t.topic, 80),
        question: str(t.question, 600),
        type: t.type === 'choice' ? 'choice' : 'input',
        options: Array.isArray(t.options) ? t.options.map((o) => str(o, 120)).filter(Boolean).slice(0, 5) : [],
        answer: str(t.answer, 120),
        explanation: str(t.explanation, 600),
        rule: str(t.rule, 300),
      };
      if (task.type === 'choice' && (task.options.length < 2 || !task.options.includes(task.answer))) task.type = 'input';
      if (task.type === 'input') task.options = [];
      return fixArithmetic(task);
    })
    .filter((t) => t.question && t.answer)
    .slice(0, max);
}

function trainingPrompt({ subject, grade, lang, level, topic, topics = [] }) {
  return `${COMMON}
Составь 6 коротких заданий для тренировки. Предмет: ${subject}. Класс: ${grade}. Уровень сложности: ${LEVELS[level]} (${level} из 5).
${topic ? `Тема: ${topic}.` : topics.length ? `Темы: выбери разные темы из этого списка и в поле topic пиши название ровно как в списке: ${topics.join('; ')}.` : 'Темы: разные темы этого класса по программе.'}
Язык заданий и объяснений: на ${LANG_NAME[lang]} языке.
Каждое задание решается за 1–2 минуты. Смешивай типы: "choice" (3–4 варианта, ровно один верный, answer совпадает с одним из options дословно) и "input" (короткий ответ: число или одно-два слова).
explanation — 1–2 предложения, почему верный ответ такой (объясни ход решения). rule — правило или формула, которое нужно знать.
topic — короткое название темы задания.`;
}

function testPrompt({ subject, grade, lang, topic }) {
  return `${COMMON}
Составь тест из 10 вопросов. Предмет: ${subject}. Класс: ${grade}. Тема: ${topic}.
Язык: на ${LANG_NAME[lang]} языке. Вопросы от лёгких к сложным, проверяют понимание темы.
Используй тип "choice" (4 варианта, ровно один верный, answer совпадает с одним из options дословно), 2–3 вопроса можно сделать "input" с коротким ответом.
explanation — почему верный ответ такой. rule — какое правило нужно применить (чтобы ученик понял, где ошибся). topic — "${topic}".`;
}

function readingPrompt({ grade, lang }) {
  const words = grade <= 2 ? '60–90' : grade <= 4 ? '100–150' : grade <= 7 ? '150–220' : '220–300';
  return `${COMMON}
Напиши короткий интересный текст для чтения ученику ${grade} класса (${words} слов) на ${LANG_NAME[lang]} языке: природа, наука, история, дружба или жизнь в Узбекистане. Дай ему название.
Затем 4 вопроса на понимание текста (options — 3 варианта, ровно один верный, answer совпадает с одним из options дословно). explanation — где в тексте ответ.`;
}

function cardsPrompt({ learn, native, topic, grade }) {
  return `${COMMON}
Составь набор из 12 слов для изучения ${LANG_NAME[learn]} языка на тему «${topic}» для ученика ${grade} класса.
front — слово на ${LANG_NAME[learn]} языке, back — перевод на ${LANG_NAME[native]} язык, example — короткий пример предложения на ${LANG_NAME[learn]} языке.
title — название набора на ${LANG_NAME[native]} языке.`;
}

const EXAM_NAMES = {
  final: 'итоговая аттестация (выпускной экзамен) по школьной программе Узбекистана',
  dtm: 'вступительный тест в вуз (в стиле тестов DTM / Bilim va malakalarni baholash agentligi)',
};

function examPrompt({ subject, grade, lang, examType }) {
  return `${COMMON}
Составь пробный экзамен: ${EXAM_NAMES[examType]}. Предмет: ${subject}. Класс: ${grade}.
15 вопросов по темам всего учебного года и прошлых лет, от лёгких к сложным, как на настоящем экзамене.
Язык: на ${LANG_NAME[lang]} языке. Все вопросы типа "choice": 4 варианта, ровно один верный, answer совпадает с одним из options дословно.
explanation — краткое решение. rule — правило или формула. topic — тема вопроса.`;
}

function olympiadPrompt({ subject, grade, lang }) {
  return `${COMMON}
Составь 5 олимпиадных задач для сильного ученика ${grade} класса. Предмет: ${subject}. Если предмет не математика, сделай задачи на логику и смекалку по этому предмету.
Задачи нестандартные: нужна догадка, а не только формула, но решаются знаниями ${grade} класса. Без подвоха с формулировкой.
Язык: на ${LANG_NAME[lang]} языке. Тип "input" с коротким ответом (число или слово) или "choice" (4 варианта).
explanation — идея решения по шагам. rule — главная идея, которую стоит запомнить. topic — короткое название типа задачи.`;
}

function topicsPrompt({ subject, grade, lang }) {
  return `${COMMON}
Перечисли 10 основных тем, которые проходят по предмету «${subject}» в ${grade} классе. Короткие названия (2–5 слов) на ${LANG_NAME[lang]} языке, в порядке изучения.`;
}

module.exports = {
  TASK_SCHEMA,
  READING_SCHEMA,
  CARDS_SCHEMA,
  TOPICS_SCHEMA,
  trainingPrompt,
  testPrompt,
  readingPrompt,
  cardsPrompt,
  topicsPrompt,
  examPrompt,
  olympiadPrompt,
  cleanTasks,
  repairLatex,
  str,
};
