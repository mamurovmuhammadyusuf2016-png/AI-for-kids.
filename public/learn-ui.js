// Learning sections: home, training, topic tests, reading, word cards,
// counting games, progress and homework diary. Uses window.Nimi from app.js.
(() => {
  const N = window.Nimi;
  const $ = (id) => document.getElementById(id);
  const DAY = 24 * 3600 * 1000;
  const CARD_INTERVALS = [0, 0, 1, 3, 7, 14]; // days until the next review, by box

  const L = {
    ru: {
      hello: 'Привет!',
      todayIs: (s) => `Сегодня: ${s}`,
      streak: (n) => (n ? `${n} ${plural(n, 'день', 'дня', 'дней')} подряд` : 'Начни серию сегодня'),
      dailyTitle: 'Тренировка дня',
      dailyDesc: (lvl) => `6 коротких заданий · уровень ${lvl} из 5`,
      dailyDone: (score) => `Сегодня сделано: ${score} верно`,
      start: 'Начать',
      again: 'Ещё раз',
      tiles: {
        test: ['Тест по теме', '10 вопросов и оценка'],
        cards: ['Карточки слов', 'Английский, русский, узбекский'],
        reading: ['Чтение', 'Текст и вопросы'],
        games: ['Игры на счёт', 'Умножение, устный счёт'],
        chat: ['Спросить учителя', 'Разберём задачу вместе'],
        exam: ['Экзамены', 'Аттестация и вступительный тест'],
        olympiad: ['Олимпиада', 'Задачи на смекалку'],
        photo: ['Фото задачи', 'Сфотографируй — разберём'],
        diary: ['Дневник', 'Домашние задания'],
      },
      undone: (n) => (n ? `Не сделано: ${n}` : 'Всё сделано'),
      back: 'Назад',
      home: 'На главную',
      training: 'Тренировка',
      test: 'Тест по теме',
      reading: 'Чтение',
      cards: 'Карточки слов',
      games: 'Игры на счёт',
      exam: 'Экзамены',
      examFinal: ['Итоговая аттестация', '15 вопросов · 30 минут'],
      examDtm: ['Вступительный тест (DTM)', '15 вопросов · 30 минут'],
      examIntro: (s) => `Пробный экзамен по предмету: ${s}. Ответы и разбор — в конце. Предмет и класс меняются в шапке.`,
      timeLeft: 'Осталось',
      timeOver: 'Время вышло. Вопросы без ответа засчитаны как неверные.',
      olympiad: 'Олимпиада',
      olympiadIntro: '5 нестандартных задач. Не торопись: здесь важна догадка.',
      noAnswer: '(нет ответа)',
      listen: 'Послушать',
      loadingTasks: 'Готовлю задания… Это займёт до 30 секунд.',
      loadingText: 'Подбираю текст… Это займёт до 30 секунд.',
      loadingWords: 'Составляю набор слов…',
      loadingTopics: 'Загружаю темы…',
      errors: {
        learn_limit: 'На сегодня новые задания закончились (20 наборов). Повтори карточки или поиграй в игры на счёт.',
        rate_limited: 'Слишком много запросов, попробуй через минуту',
        unauthorized: 'Нужно войти снова.',
        default: 'Не получилось подготовить задания. Попробуй ещё раз.',
      },
      retry: 'Попробовать снова',
      questionOf: (i, n) => `Вопрос ${i} из ${n}`,
      yourAnswer: 'Твой ответ',
      check: 'Проверить',
      next: 'Дальше',
      finish: 'Результат',
      correct: 'Верно!',
      wrong: (a) => `Неверно. Правильный ответ: ${a}`,
      rule: 'Правило',
      text: 'Текст',
      score: (ok, n) => `${ok} из ${n} верно`,
      levelUp: 'Отлично! Следующая тренировка будет чуть сложнее.',
      levelDown: 'Ничего страшного. Следующая будет чуть проще.',
      levelSame: 'Хорошая работа! Продолжай в том же темпе.',
      moreTraining: 'Ещё тренировка',
      chooseTopic: 'Выбери тему',
      ownTopic: 'Или напиши свою тему',
      ownTopicPh: 'Например: Дроби',
      startTest: 'Начать тест',
      grade: 'Оценка',
      mistakes: 'Разбор ошибок',
      noMistakes: 'Ошибок нет. Молодец!',
      correctAnswer: 'Правильно',
      newQuestions: 'Новые вопросы',
      otherTopic: 'Другая тема',
      newText: 'Новый текст',
      learnLang: 'Какой язык учим?',
      langs: { en: 'Английский', ru: 'Русский', uz: 'Узбекский' },
      reviewDue: (n) => (n ? `Повторить слова (${n})` : 'Все слова повторены — загляни завтра'),
      newDeck: 'Новый набор слов',
      deckOwnPh: 'Своя тема, например: Спорт',
      deckTopics: ['Животные', 'Семья', 'Школа', 'Еда', 'Цвета', 'Числа', 'Природа', 'Город', 'Одежда', 'Погода'],
      deckMeta: (n, learned, due) => `${n} слов · выучено ${learned} · повторить ${due}`,
      study: 'Учить',
      showBack: 'Показать перевод',
      remember: 'Помню',
      forgot: 'Не помню',
      cardsDone: (n) => `Готово! Всего выучено слов: ${n}`,
      noDecks: 'Наборов пока нет. Выбери тему ниже — и я составлю 12 слов.',
      gameMult: ['Таблица умножения', 'Сколько примеров решишь за 60 секунд?'],
      gameMental: ['Устный счёт', '10 примеров на время'],
      gameMistake: ['Найди ошибку', 'Отметь неверные примеры'],
      best: (n) => `Рекорд: ${n}`,
      seconds: 'сек',
      timeUp: 'Время вышло!',
      solved: (n) => `Решено верно: ${n}`,
      newRecord: 'Новый рекорд!',
      play: 'Играть',
      playAgain: 'Сыграть ещё',
      markWrong: 'Нажми на примеры с ошибкой',
      roundOf: (i, n) => `Раунд ${i} из ${n}`,
      roundOk: 'Все ошибки найдены!',
      roundBad: 'Не всё верно: зелёные — найденные ошибки, жёлтые — пропущенные, красные — верные примеры.',
      tookTime: (s) => `Время: ${s} сек`,
      streakTitle: 'Серия занятий',
      totalDays: (n) => `Всего дней с занятиями: ${n}`,
      statTasks: 'заданий решено',
      statCorrect: 'верных ответов',
      statTests: 'тестов пройдено',
      levelTitle: 'Уровень сложности',
      topicMap: (s) => `Карта тем: ${s}`,
      legend: { good: 'освоено', mid: 'повторить', bad: 'трудно', none: 'не начато' },
      tapTopic: 'Нажми на тему, чтобы потренироваться.',
      badges: 'Значки',
      parentReport: 'Отчёт для родителей',
      diaryTitle: 'Дневник',
      whatAssigned: 'Что задали?',
      whatAssignedPh: 'Например: стр. 45, упр. 3',
      dueDate: 'Сдать до',
      add: 'Добавить',
      todo: (n) => `Нужно сделать (${n})`,
      doneList: (n) => `Сделано (${n})`,
      diaryEmpty: 'Пока ничего не записано. Добавь первое задание.',
      overdue: 'просрочено',
      todayWord: 'сегодня',
      tomorrowWord: 'завтра',
      until: (d) => `до ${d}`,
      del: 'Удалить',
      badgeList: {
        first: ['Первый шаг', 'Реши первое задание'],
        tasks50: ['Полсотни', 'Реши 50 заданий'],
        streak3: ['Три дня подряд', 'Занимайся 3 дня подряд'],
        streak7: ['Неделя учёбы', 'Занимайся 7 дней подряд'],
        test5: ['Отличник', 'Получи 5 за тест'],
        reader: ['Читатель', 'Прочитай 3 текста'],
        words30: ['Словарь', 'Выучи 30 слов'],
        mult20: ['Быстрый счёт', '20 примеров за минуту'],
      },
    },
    uz: {
      hello: 'Salom!',
      todayIs: (s) => `Bugun: ${s}`,
      streak: (n) => (n ? `${n} kun ketma-ket` : 'Bugun seriyani boshla'),
      dailyTitle: 'Kunlik mashq',
      dailyDesc: (lvl) => `6 ta qisqa topshiriq · daraja ${lvl} / 5`,
      dailyDone: (score) => `Bugun bajarildi: ${score} to'g'ri`,
      start: 'Boshlash',
      again: 'Yana bir bor',
      tiles: {
        test: ['Mavzu bo\'yicha test', '10 ta savol va baho'],
        cards: ["So'z kartochkalari", 'Ingliz, rus, o\'zbek'],
        reading: ["O'qish", 'Matn va savollar'],
        games: ["Hisob o'yinlari", "Ko'paytirish, og'zaki hisob"],
        chat: ["O'qituvchidan so'rash", 'Masalani birga yechamiz'],
        exam: ['Imtihonlar', 'Attestatsiya va kirish testi'],
        olympiad: ['Olimpiada', 'Zukkolik masalalari'],
        photo: ['Masala surati', 'Suratga ol — birga yechamiz'],
        diary: ['Kundalik', 'Uy vazifalari'],
      },
      undone: (n) => (n ? `Bajarilmagan: ${n}` : 'Hammasi bajarildi'),
      back: 'Orqaga',
      home: 'Bosh sahifa',
      training: 'Mashq',
      test: "Mavzu bo'yicha test",
      reading: "O'qish",
      cards: "So'z kartochkalari",
      games: "Hisob o'yinlari",
      exam: 'Imtihonlar',
      examFinal: ['Yakuniy attestatsiya', '15 ta savol · 30 daqiqa'],
      examDtm: ['Kirish testi (DTM)', '15 ta savol · 30 daqiqa'],
      examIntro: (s) => `Fan bo'yicha sinov imtihoni: ${s}. Javoblar va tahlil — oxirida. Fan va sinf yuqorida o'zgartiriladi.`,
      timeLeft: 'Qoldi',
      timeOver: "Vaqt tugadi. Javobsiz savollar noto'g'ri deb hisoblandi.",
      olympiad: 'Olimpiada',
      olympiadIntro: "5 ta nostandart masala. Shoshilma: bu yerda topqirlik muhim.",
      noAnswer: "(javob yo'q)",
      listen: 'Tinglash',
      loadingTasks: 'Topshiriqlar tayyorlanmoqda… 30 soniyagacha.',
      loadingText: 'Matn tanlanmoqda… 30 soniyagacha.',
      loadingWords: "So'zlar to'plami tuzilmoqda…",
      loadingTopics: 'Mavzular yuklanmoqda…',
      errors: {
        learn_limit: "Bugungi yangi topshiriqlar tugadi (20 ta to'plam). Kartochkalarni takrorla yoki hisob o'yinlarini o'yna.",
        rate_limited: "Juda ko'p so'rov, bir daqiqadan keyin urinib ko'r",
        unauthorized: 'Qaytadan kirish kerak.',
        default: "Topshiriqlarni tayyorlab bo'lmadi. Qayta urinib ko'r.",
      },
      retry: "Qayta urinish",
      questionOf: (i, n) => `Savol ${i} / ${n}`,
      yourAnswer: 'Javobing',
      check: 'Tekshirish',
      next: 'Keyingisi',
      finish: 'Natija',
      correct: "To'g'ri!",
      wrong: (a) => `Noto'g'ri. To'g'ri javob: ${a}`,
      rule: 'Qoida',
      text: 'Matn',
      score: (ok, n) => `${n} tadan ${ok} tasi to'g'ri`,
      levelUp: 'Ajoyib! Keyingi mashq biroz qiyinroq bo\'ladi.',
      levelDown: "Hechqisi yo'q. Keyingisi biroz osonroq bo'ladi.",
      levelSame: 'Yaxshi ish! Shunday davom et.',
      moreTraining: 'Yana mashq',
      chooseTopic: 'Mavzuni tanla',
      ownTopic: "Yoki o'z mavzungni yoz",
      ownTopicPh: 'Masalan: Kasrlar',
      startTest: 'Testni boshlash',
      grade: 'Baho',
      mistakes: 'Xatolar tahlili',
      noMistakes: "Xato yo'q. Barakalla!",
      correctAnswer: "To'g'ri javob",
      newQuestions: 'Yangi savollar',
      otherTopic: 'Boshqa mavzu',
      newText: 'Yangi matn',
      learnLang: "Qaysi tilni o'rganamiz?",
      langs: { en: 'Ingliz tili', ru: 'Rus tili', uz: "O'zbek tili" },
      reviewDue: (n) => (n ? `So'zlarni takrorlash (${n})` : "Hamma so'zlar takrorlandi — ertaga kel"),
      newDeck: "Yangi so'zlar to'plami",
      deckOwnPh: "O'z mavzung, masalan: Sport",
      deckTopics: ['Hayvonlar', 'Oila', 'Maktab', 'Ovqat', 'Ranglar', 'Sonlar', 'Tabiat', 'Shahar', 'Kiyim', 'Ob-havo'],
      deckMeta: (n, learned, due) => `${n} so'z · o'rganildi ${learned} · takrorlash ${due}`,
      study: "O'rganish",
      showBack: "Tarjimani ko'rsatish",
      remember: 'Eslayman',
      forgot: 'Eslay olmayman',
      cardsDone: (n) => `Tayyor! Jami o'rganilgan so'zlar: ${n}`,
      noDecks: "Hozircha to'plam yo'q. Pastdan mavzu tanla — 12 ta so'z tuzib beraman.",
      gameMult: ["Ko'paytirish jadvali", '60 soniyada nechta misol yechasan?'],
      gameMental: ["Og'zaki hisob", 'Vaqtga 10 ta misol'],
      gameMistake: ['Xatoni top', "Noto'g'ri misollarni belgila"],
      best: (n) => `Rekord: ${n}`,
      seconds: 'son',
      timeUp: 'Vaqt tugadi!',
      solved: (n) => `To'g'ri yechildi: ${n}`,
      newRecord: 'Yangi rekord!',
      play: "O'ynash",
      playAgain: "Yana o'ynash",
      markWrong: 'Xato bor misollarni bos',
      roundOf: (i, n) => `Raund ${i} / ${n}`,
      roundOk: 'Hamma xatolar topildi!',
      roundBad: "Hammasi to'g'ri emas: yashil — topilgan xatolar, sariq — o'tkazib yuborilganlar, qizil — to'g'ri misollar.",
      tookTime: (s) => `Vaqt: ${s} son`,
      streakTitle: "Mashg'ulotlar seriyasi",
      totalDays: (n) => `Jami mashg'ulot kunlari: ${n}`,
      statTasks: 'topshiriq yechildi',
      statCorrect: "to'g'ri javoblar",
      statTests: "test topshirildi",
      levelTitle: 'Qiyinlik darajasi',
      topicMap: (s) => `Mavzular xaritasi: ${s}`,
      legend: { good: "o'zlashtirildi", mid: 'takrorlash', bad: 'qiyin', none: 'boshlanmagan' },
      tapTopic: 'Mashq qilish uchun mavzuni bos.',
      badges: 'Nishonlar',
      parentReport: 'Ota-onalar uchun hisobot',
      diaryTitle: 'Kundalik',
      whatAssigned: 'Nima berildi?',
      whatAssignedPh: 'Masalan: 45-bet, 3-mashq',
      dueDate: 'Muddat',
      add: "Qo'shish",
      todo: (n) => `Bajarish kerak (${n})`,
      doneList: (n) => `Bajarildi (${n})`,
      diaryEmpty: "Hozircha hech narsa yozilmagan. Birinchi vazifani qo'sh.",
      overdue: "muddati o'tgan",
      todayWord: 'bugun',
      tomorrowWord: 'ertaga',
      until: (d) => `${d} gacha`,
      del: "O'chirish",
      badgeList: {
        first: ['Birinchi qadam', 'Birinchi topshiriqni yech'],
        tasks50: ['Ellikta', '50 ta topshiriq yech'],
        streak3: ['Uch kun ketma-ket', "3 kun ketma-ket shug'ullan"],
        streak7: ["O'qish haftasi", "7 kun ketma-ket shug'ullan"],
        test5: ["A'lochi", 'Testdan 5 ol'],
        reader: ["Kitobxon", "3 ta matn o'qi"],
        words30: ["Lug'at", "30 ta so'z o'rgan"],
        mult20: ['Tez hisob', 'Bir daqiqada 20 ta misol'],
      },
    },
  };
  const t = (key) => L[N.lang][key];
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  // ---------- tiny DOM helper: h('div', {class, onclick, ...attrs}, ...children) ----------
  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  // Element whose text may contain **bold** and $formulas$ (escaped, KaTeX).
  const R = (tag, props, text) => { const el = h(tag, props); el.innerHTML = N.formatReply(String(text ?? '')); return el; };
  const ico = (name, cls = 'icon') => { const s = h('span', { class: 'inline-flex shrink-0' }); s.innerHTML = N.icon(name, cls); return s; };
  const CARD = 'rounded-3xl bg-night-900/80 p-4 ring-1 ring-white/5';
  const BTN = 'flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400 active:scale-[.98] disabled:bg-night-700 disabled:text-slate-500 disabled:shadow-none';
  const BTN2 = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-night-800 px-4 text-[15px] font-medium text-slate-100 ring-1 ring-white/10 transition hover:bg-night-700 active:scale-[.98]';
  const INPUT = 'min-h-14 w-full rounded-2xl bg-night-800 px-4 text-base text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/60';

  // ---------- saved data (per account; server when available, else this device) ----------
  const blank = () => ({
    progress: { days: [], topics: {}, levels: {}, stats: { tasks: 0, correct: 0, tests: 0, best5: 0, reading: 0, games: {} }, daily: {} },
    diary: [],
    cards: { decks: [] },
  });
  let data = blank();
  const saveTimers = {};

  function normalize(d) {
    const b = blank();
    return {
      progress: { ...b.progress, ...(d?.progress || {}), stats: { ...b.progress.stats, ...(d?.progress?.stats || {}) } },
      diary: Array.isArray(d?.diary) ? d.diary : [],
      cards: { decks: Array.isArray(d?.cards?.decks) ? d.cards.decks : [] },
    };
  }

  async function load() {
    data = normalize(N.store.get('learn', null));
    if (!N.accounts || !N.user?.email) return;
    try {
      const remote = await N.postJson('/api/data', {});
      if (remote && !remote.code && Object.keys(remote).length) data = normalize({ ...data, ...remote });
      N.store.set('learn', data);
    } catch {}
  }

  function save(key) {
    N.store.set('learn', data);
    if (!N.accounts || !N.user?.email) return;
    clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(() => N.postJson('/api/data', { key, value: data[key] }).catch(() => {}), 600);
  }

  const todayStr = () => N.today();
  function markDay() {
    const d = todayStr();
    if (!data.progress.days.includes(d)) {
      data.progress.days = [...data.progress.days, d].slice(-400);
      save('progress');
    }
  }
  function streak() {
    const days = new Set(data.progress.days);
    const fmt = (dt) => dt.toLocaleDateString('en-CA');
    let d = new Date();
    if (!days.has(fmt(d))) d = new Date(d.getTime() - DAY);
    let n = 0;
    while (days.has(fmt(d))) { n++; d = new Date(d.getTime() - DAY); }
    return n;
  }

  const subj = () => N.setup.subject;
  const grade = () => N.setup.grade;
  const subjRu = () => N.subjectName(subj(), 'ru');
  const levelKey = () => `${subj()}|${grade()}`;
  const level = () => data.progress.levels[levelKey()] || 2;
  const topicKey = (topic) => `${subj()}|${grade()}|${topic}`;

  // ---------- server calls ----------
  async function gen(kind, body) {
    let res;
    try {
      res = await N.postJson(`/api/learn/${kind}`, { subject: subjRu(), grade: grade(), lang: N.lang, ...body });
    } catch {
      throw new Error('default');
    }
    if (res.code) throw new Error(res.code);
    return res;
  }
  const topicCache = {};
  async function getTopics() {
    const key = `${subj()}|${grade()}|${N.lang}`;
    if (!topicCache[key]) topicCache[key] = gen('topics', {}).then((r) => r.topics).catch((e) => { delete topicCache[key]; throw e; });
    return topicCache[key];
  }

  // ---------- shared pieces ----------
  let stopActive = null; // cleanup for timers of the current activity
  function clearActive() { if (stopActive) { stopActive(); stopActive = null; } }

  function screen(id) {
    clearActive();
    if (id === 'activity') N.showScreen('activity');
    const el = $(id);
    el.innerHTML = '';
    el.scrollTop = 0;
    return el;
  }
  function titleBar(title, onBack = () => N.showScreen('home')) {
    return h('div', { class: 'flex items-center gap-2' },
      h('button', { type: 'button', class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-slate-200 ring-1 ring-white/5 hover:bg-night-700', 'aria-label': t('back'), onclick: onBack }, ico('arrow-left')),
      h('h2', { class: 'min-w-0 flex-1 truncate text-xl font-semibold text-white' }, title));
  }
  function loading(text) {
    return h('div', { class: `${CARD} flex flex-col items-center gap-4 py-10 text-center text-slate-300` },
      h('div', { class: 'h-10 w-10 animate-spin rounded-full border-4 border-night-600 border-t-brand-400' }),
      h('p', {}, text));
  }
  function errorBox(code, retry) {
    const msg = t('errors')[code] || t('errors').default;
    return h('div', { class: `${CARD} flex flex-col gap-3` },
      h('div', { class: 'flex items-start gap-2 text-rose-200' }, ico('circle-alert'), h('p', {}, msg)),
      retry && code !== 'learn_limit' ? h('button', { type: 'button', class: BTN2, onclick: retry }, ico('repeat'), t('retry')) : null,
      h('button', { type: 'button', class: BTN2, onclick: () => N.showScreen('home') }, t('home')));
  }

  // ---------- answer checking ----------
  const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/,/g, '.').replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '');
  const num = (s) => (/^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null);
  function isCorrect(task, given) {
    const a = norm(task.answer), g = norm(given);
    if (!g) return false;
    if (a === g) return true;
    const an = num(a), gn = num(g);
    if (an !== null && gn !== null) return Math.abs(an - gn) < 1e-9;
    const lead = a.match(/^-?\d+(\.\d+)?/); // "24 см" accepts "24"
    return gn !== null && !!lead && Math.abs(Number(lead[0]) - gn) < 1e-9;
  }
  function record(task, ok) {
    const p = data.progress;
    if (task.topic && task.topic !== 'reading') {
      const k = topicKey(task.topic);
      const cur = p.topics[k] || { ok: 0, total: 0 };
      p.topics[k] = { ok: cur.ok + (ok ? 1 : 0), total: cur.total + 1, last: todayStr() };
    }
    p.stats.tasks += 1;
    p.stats.correct += ok ? 1 : 0;
    markDay();
    save('progress');
  }

  // ---------- task runner (training, test, reading) ----------
  function runTasks(root, tasks, { mode, title, passage, onFinish, timeLimit }) {
    const results = [];
    let i = 0;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; clearActive(); onFinish(results); };
    const clock = h('span', { class: 'tabular-nums' });
    if (timeLimit) {
      const endAt = Date.now() + timeLimit;
      const tick = () => {
        const left = Math.max(0, endAt - Date.now());
        clock.textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
        if (left <= 0) {
          for (let k = results.length; k < tasks.length; k++) results.push({ task: tasks[k], given: t('noAnswer'), ok: false, timeout: true });
          finish();
        }
      };
      tick();
      const id = setInterval(tick, 500);
      stopActive = () => clearInterval(id);
    }
    const show = () => {
      root.innerHTML = '';
      const task = tasks[i];
      root.append(titleBar(title));
      if (timeLimit) root.append(h('div', { class: 'flex items-center gap-2 self-start rounded-full bg-night-800 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/5' }, ico('hourglass', 'h-4 w-4'), `${t('timeLeft')}: `, clock));
      root.append(h('div', { class: 'flex flex-col gap-2' },
        h('div', { class: 'flex justify-between text-sm text-slate-400' }, h('span', {}, t('questionOf')(i + 1, tasks.length)), h('span', {}, task.topic && task.topic !== 'reading' ? task.topic : '')),
        h('div', { class: 'h-2 overflow-hidden rounded-full bg-night-800' }, h('div', { class: 'h-full rounded-full bg-brand-500 transition-all', style: `width:${(i / tasks.length) * 100}%` }))));
      if (passage) {
        root.append(h('details', { class: `${CARD} group`, open: i === 0 },
          h('summary', { class: 'flex cursor-pointer list-none items-center gap-2 font-semibold text-white' }, ico('book-open'), passage.title || t('text'), ico('chevron-down', 'icon ml-auto transition group-open:rotate-180')),
          h('p', { class: 'mt-3 whitespace-pre-wrap leading-relaxed text-slate-200' }, passage.text)));
      }
      root.append(R('div', { class: `${CARD} bubble text-lg leading-relaxed text-white whitespace-pre-wrap` }, task.question));
      const answerBox = h('div', { class: 'flex flex-col gap-2' });
      const feedback = h('div', { class: 'flex flex-col gap-3' });
      root.append(answerBox, feedback);

      const submit = (given, chosenBtn) => {
        const ok = isCorrect(task, given);
        results.push({ task, given, ok });
        if (mode !== 'reading') record(task, ok); else { markDay(); }
        answerBox.querySelectorAll('button, input').forEach((el) => { el.disabled = true; });
        if (mode === 'test') return next();
        answerBox.querySelectorAll('[data-option]').forEach((b) => {
          if (b.dataset.option === task.answer) b.classList.add('bg-emerald-500/20!', 'ring-emerald-400!', 'text-emerald-100!');
        });
        if (chosenBtn && !ok) chosenBtn.classList.add('bg-rose-500/20!', 'ring-rose-400!', 'text-rose-100!');
        const ruleP = !ok && task.rule ? R('p', { class: 'bubble mt-2 text-sm text-slate-300' }, `**${t('rule')}:** ${task.rule}`) : null;
        feedback.append(h('div', { class: `rounded-2xl p-4 ring-1 ${ok ? 'bg-emerald-500/10 ring-emerald-400/30 text-emerald-100' : 'bg-rose-500/10 ring-rose-400/30 text-rose-100'}` },
          h('div', { class: 'flex items-start gap-2 font-semibold' }, ico(ok ? 'circle-check' : 'circle-x'), R('span', { class: 'bubble' }, ok ? t('correct') : t('wrong')(task.answer))),
          task.explanation ? R('p', { class: 'bubble mt-2 text-slate-200' }, task.explanation) : null,
          ruleP));
        const nextBtn = h('button', { type: 'button', class: BTN, onclick: next }, i + 1 < tasks.length ? t('next') : t('finish'), ico('chevron-right'));
        feedback.append(nextBtn);
        nextBtn.focus();
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      const next = () => { if (finished) return; i += 1; if (i < tasks.length) show(); else finish(); };

      if (task.type === 'choice') {
        task.options.forEach((opt) => {
          const b = R('button', { type: 'button', 'data-option': opt, class: 'bubble min-h-14 w-full rounded-2xl bg-night-800 px-4 py-3 text-left text-base text-slate-100 ring-1 ring-white/10 transition hover:bg-night-700 active:scale-[.99] disabled:cursor-default' }, opt);
          b.onclick = () => submit(opt, b);
          answerBox.append(b);
        });
      } else {
        const numeric = num(norm(task.answer)) !== null;
        const input = h('input', { type: 'text', class: INPUT, placeholder: t('yourAnswer'), inputmode: numeric ? 'decimal' : 'text', autocomplete: 'off', maxlength: '120' });
        const go = h('button', { type: 'button', class: BTN }, t('check'));
        const send = () => { if (input.value.trim()) submit(input.value, null); };
        go.onclick = send;
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
        answerBox.append(input, go);
        setTimeout(() => input.focus(), 50);
      }
    };
    show();
  }

  // ---------- training ----------
  async function startTraining(topic) {
    const root = screen('activity');
    root.append(titleBar(t('training')), loading(t('loadingTasks')));
    try {
      const topics = topic ? [] : await Promise.race([getTopics().catch(() => []), new Promise((r) => setTimeout(() => r([]), 45000))]);
      const { tasks } = await gen('training', { level: level(), topic, topics });
      runTasks(root, tasks, { mode: 'training', title: topic || t('training'), onFinish: (r) => finishTraining(root, r, topic) });
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, () => startTraining(topic)));
    }
  }
  function finishTraining(root, results, topic) {
    const ok = results.filter((r) => r.ok).length;
    const ratio = ok / results.length;
    const p = data.progress;
    let msg = t('levelSame');
    if (ratio >= 0.8 && level() < 5) { p.levels[levelKey()] = level() + 1; msg = t('levelUp'); }
    else if (ratio < 0.5 && level() > 1) { p.levels[levelKey()] = level() - 1; msg = t('levelDown'); }
    if (!topic) p.daily = { date: todayStr(), score: `${ok}/${results.length}` };
    save('progress');
    root.innerHTML = '';
    root.append(titleBar(t('training')),
      h('div', { class: `${CARD} flex flex-col items-center gap-2 py-8 text-center` },
        h('div', { class: `flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${ratio >= 0.5 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-400/15 text-amber-200'}` }, `${ok}/${results.length}`),
        h('p', { class: 'text-lg font-semibold text-white' }, t('score')(ok, results.length)),
        h('p', { class: 'text-slate-300' }, msg)),
      h('button', { type: 'button', class: BTN, onclick: () => startTraining(topic) }, ico('repeat'), t('moreTraining')),
      h('button', { type: 'button', class: BTN2, onclick: () => N.showScreen('home') }, t('home')));
  }

  // ---------- topic test ----------
  async function openTestPicker() {
    const root = screen('activity');
    root.append(titleBar(t('test')));
    const list = h('div', { class: 'grid gap-2' }, loading(t('loadingTopics')));
    const own = h('input', { type: 'text', class: INPUT, placeholder: t('ownTopicPh'), maxlength: '80' });
    const startOwn = h('button', { type: 'button', class: BTN, onclick: () => own.value.trim() && startTest(own.value.trim()) }, t('startTest'));
    own.addEventListener('keydown', (e) => { if (e.key === 'Enter') startOwn.click(); });
    root.append(h('p', { class: 'text-slate-300' }, t('chooseTopic')), list,
      h('div', { class: `${CARD} flex flex-col gap-2` }, h('p', { class: 'text-sm text-slate-400' }, t('ownTopic')), own, startOwn));
    try {
      const topics = await getTopics();
      list.innerHTML = '';
      topics.forEach((tp) => list.append(h('button', { type: 'button', class: 'flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-night-800 px-4 text-left text-[15px] text-slate-100 ring-1 ring-white/5 hover:bg-night-700', onclick: () => startTest(tp) }, h('span', { class: 'min-w-0' }, tp), ico('chevron-right', 'icon text-slate-500'))));
    } catch (e) {
      list.innerHTML = '';
      list.append(h('p', { class: 'text-sm text-slate-400' }, t('errors')[e.message] || t('errors').default));
    }
  }
  async function startTest(topic) {
    const root = screen('activity');
    root.append(titleBar(t('test'), openTestPicker), loading(t('loadingTasks')));
    try {
      const { tasks } = await gen('test', { topic });
      runTasks(root, tasks, { mode: 'test', title: topic, onFinish: (r) => finishTest(root, r, topic) });
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, () => startTest(topic)));
    }
  }
  function finishTest(root, results, topic, { onBack = openTestPicker, again = () => startTest(topic), note } = {}) {
    const ok = results.filter((r) => r.ok).length;
    const pct = ok / results.length;
    const mark = pct >= 0.9 ? 5 : pct >= 0.7 ? 4 : pct >= 0.5 ? 3 : 2;
    const s = data.progress.stats;
    s.tests += 1;
    if (mark === 5) s.best5 += 1;
    save('progress');
    const color = { 5: 'bg-emerald-500/15 text-emerald-300', 4: 'bg-sky-500/15 text-sky-300', 3: 'bg-amber-400/15 text-amber-200', 2: 'bg-rose-500/15 text-rose-300' }[mark];
    const wrong = results.filter((r) => !r.ok);
    root.innerHTML = '';
    root.append(titleBar(topic, onBack),
      ...(note ? [h('p', { class: 'rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100' }, note)] : []),
      h('div', { class: `${CARD} flex items-center gap-4` },
        h('div', { class: `flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ${color}` }, h('span', { class: 'text-xs' }, t('grade')), h('span', { class: 'text-3xl font-bold' }, String(mark))),
        h('div', {}, h('p', { class: 'text-lg font-semibold text-white' }, t('score')(ok, results.length)), h('p', { class: 'text-slate-400' }, topic))),
      h('h3', { class: 'mt-1 text-lg font-semibold text-white' }, t('mistakes')),
      wrong.length ? h('div', { class: 'flex flex-col gap-3' }, wrong.map(({ task, given }) =>
        h('div', { class: `${CARD} flex flex-col gap-2` },
          R('p', { class: 'bubble whitespace-pre-wrap text-white' }, task.question),
          h('div', { class: 'flex items-start gap-2 text-sm text-rose-200' }, ico('circle-x'), R('span', { class: 'bubble' }, `${t('yourAnswer')}: ${given}`)),
          h('div', { class: 'flex items-start gap-2 text-sm text-emerald-200' }, ico('circle-check'), R('span', { class: 'bubble' }, `${t('correctAnswer')}: ${task.answer}`)),
          task.rule ? R('p', { class: 'bubble rounded-xl bg-night-800 p-3 text-sm text-slate-200' }, `**${t('rule')}:** ${task.rule}`) : null,
          task.explanation ? R('p', { class: 'bubble text-sm text-slate-400' }, task.explanation) : null)))
        : h('p', { class: `${CARD} text-emerald-200` }, t('noMistakes')),
      h('button', { type: 'button', class: BTN, onclick: again }, ico('repeat'), t('newQuestions')),
      h('button', { type: 'button', class: BTN2, onclick: onBack }, onBack === openTestPicker ? t('otherTopic') : t('back')));
  }

  // ---------- exam practice (timed, review at the end) ----------
  function openExams() {
    const root = screen('activity');
    root.append(titleBar(t('exam')), h('p', { class: 'text-slate-300' }, t('examIntro')(`${N.subjectName(subj())} · ${N.gradeLabel(grade())}`)));
    [['final', 'graduation-cap', t('examFinal')], ['dtm', 'clipboard-check', t('examDtm')]].forEach(([type, icon, [name, desc]]) => {
      root.append(h('button', { type: 'button', class: `${CARD} flex items-center gap-4 text-left transition hover:bg-night-800`, onclick: () => startExam(type, name) },
        h('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400' }, ico(icon)),
        h('div', { class: 'min-w-0 flex-1' }, h('p', { class: 'font-semibold text-white' }, name), h('p', { class: 'text-sm text-slate-400' }, desc)),
        ico('chevron-right', 'icon text-slate-500')));
    });
  }
  async function startExam(examType, name) {
    const root = screen('activity');
    root.append(titleBar(name, openExams), loading(t('loadingTasks')));
    try {
      const { tasks } = await gen('exam', { examType });
      runTasks(root, tasks, {
        mode: 'test', title: name, timeLimit: 30 * 60 * 1000,
        onFinish: (r) => finishTest(root, r, name, { onBack: openExams, again: () => startExam(examType, name), note: r.some((x) => x.timeout) ? t('timeOver') : null }),
      });
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, () => startExam(examType, name)));
    }
  }

  // ---------- olympiad problems (feedback after each) ----------
  async function startOlympiad() {
    const root = screen('activity');
    root.append(titleBar(t('olympiad')), h('p', { class: 'text-slate-300' }, t('olympiadIntro')), loading(t('loadingTasks')));
    try {
      const { tasks } = await gen('olympiad', {});
      runTasks(root, tasks, {
        mode: 'training', title: t('olympiad'),
        onFinish: (results) => {
          const ok = results.filter((x) => x.ok).length;
          root.innerHTML = '';
          root.append(titleBar(t('olympiad')),
            h('div', { class: `${CARD} flex flex-col items-center gap-2 py-8 text-center` },
              h('span', { class: 'flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-200' }, ico('puzzle', 'h-8 w-8')),
              h('p', { class: 'text-lg font-semibold text-white' }, t('score')(ok, results.length))),
            h('button', { type: 'button', class: BTN, onclick: startOlympiad }, ico('repeat'), t('newQuestions')),
            h('button', { type: 'button', class: BTN2, onclick: () => N.showScreen('home') }, t('home')));
        },
      });
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, startOlympiad));
    }
  }

  // ---------- reading ----------
  async function startReading() {
    const root = screen('activity');
    root.append(titleBar(t('reading')), loading(t('loadingText')));
    try {
      const r = await gen('reading', {});
      runTasks(root, r.tasks, {
        mode: 'reading', title: t('reading'), passage: { title: r.title, text: r.text },
        onFinish: (results) => {
          data.progress.stats.reading += 1;
          save('progress');
          const ok = results.filter((x) => x.ok).length;
          root.innerHTML = '';
          root.append(titleBar(t('reading')),
            h('div', { class: `${CARD} flex flex-col items-center gap-2 py-8 text-center` },
              h('div', { class: 'flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-2xl font-bold text-emerald-300' }, `${ok}/${results.length}`),
              h('p', { class: 'text-lg font-semibold text-white' }, t('score')(ok, results.length))),
            h('button', { type: 'button', class: BTN, onclick: startReading }, ico('book-open'), t('newText')),
            h('button', { type: 'button', class: BTN2, onclick: () => N.showScreen('home') }, t('home')));
        },
      });
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, startReading));
    }
  }

  // ---------- word cards (spaced repetition by boxes) ----------
  let cardsLang = 'en';
  const learnLangs = () => ['en', N.lang === 'uz' ? 'ru' : 'uz'];
  const nowTs = () => Date.now();
  const learnedCount = () => data.cards.decks.reduce((n, d) => n + d.words.filter((w) => w.box >= 3).length, 0);
  const dueWords = (decks) => decks.flatMap((d) => d.words.filter((w) => w.due <= nowTs()).map((w) => ({ w, d })));

  function openCards() {
    if (!learnLangs().includes(cardsLang)) cardsLang = 'en';
    const root = screen('activity');
    root.append(titleBar(t('cards')));
    root.append(h('p', { class: 'text-slate-300' }, t('learnLang')),
      h('div', { class: 'grid grid-cols-2 gap-1 rounded-2xl bg-night-800 p-1 ring-1 ring-white/5' }, learnLangs().map((l) =>
        h('button', { type: 'button', class: `min-h-12 rounded-xl text-[15px] font-medium ${l === cardsLang ? 'bg-brand-500 text-white' : 'text-slate-300'}`, onclick: () => { cardsLang = l; openCards(); } }, t('langs')[l]))));
    const decks = data.cards.decks.filter((d) => d.learn === cardsLang && d.native === N.lang);
    const due = dueWords(decks);
    root.append(h('button', { type: 'button', class: BTN, disabled: !due.length, onclick: () => review(due.slice(0, 15)) }, ico('repeat'), t('reviewDue')(due.length)));
    if (!decks.length) root.append(h('p', { class: `${CARD} text-slate-300` }, t('noDecks')));
    decks.forEach((d) => {
      const dueHere = d.words.filter((w) => w.due <= nowTs()).length;
      root.append(h('div', { class: `${CARD} flex items-center gap-3` },
        h('span', { class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-night-700 text-brand-400' }, ico('layers')),
        h('div', { class: 'min-w-0 flex-1' }, h('p', { class: 'truncate font-semibold text-white' }, d.title), h('p', { class: 'text-xs text-slate-400' }, t('deckMeta')(d.words.length, d.words.filter((w) => w.box >= 3).length, dueHere))),
        h('button', { type: 'button', class: 'min-h-11 shrink-0 rounded-xl bg-night-700 px-4 text-sm font-medium text-white hover:bg-night-600', onclick: () => {
          const list = d.words.filter((w) => w.due <= nowTs());
          const pick = (list.length ? list : [...d.words].sort((a, b) => a.box - b.box).slice(0, 10)).map((w) => ({ w, d }));
          review(pick);
        } }, t('study'))));
    });
    const own = h('input', { type: 'text', class: INPUT, placeholder: t('deckOwnPh'), maxlength: '60' });
    own.addEventListener('keydown', (e) => { if (e.key === 'Enter' && own.value.trim()) newDeck(own.value.trim()); });
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
      h('p', { class: 'font-semibold text-white' }, t('newDeck')),
      h('div', { class: 'flex flex-wrap gap-2' }, t('deckTopics').map((tp) => h('button', { type: 'button', class: 'min-h-11 rounded-full bg-night-800 px-4 text-sm text-slate-100 ring-1 ring-white/10 hover:bg-night-700', onclick: () => newDeck(tp) }, tp))),
      own));
  }
  async function newDeck(topic) {
    const root = screen('activity');
    root.append(titleBar(t('cards'), openCards), loading(t('loadingWords')));
    try {
      const r = await gen('cards', { learn: cardsLang, native: N.lang, topic });
      const deck = { id: String(Date.now()), learn: cardsLang, native: N.lang, title: r.title || topic, words: r.words.map((w) => ({ ...w, box: 0, due: 0 })) };
      data.cards.decks = [...data.cards.decks, deck].slice(-30);
      save('cards');
      review(deck.words.map((w) => ({ w, d: deck })));
    } catch (e) {
      root.lastChild.replaceWith(errorBox(e.message, () => newDeck(topic)));
    }
  }
  function review(queue) {
    const root = screen('activity');
    const items = [...queue];
    const retried = new Set();
    let done = 0;
    const total = items.length;
    const show = () => {
      root.innerHTML = '';
      root.append(titleBar(t('cards'), openCards));
      if (!items.length) {
        markDay();
        root.append(h('div', { class: `${CARD} flex flex-col items-center gap-3 py-8 text-center` },
          h('span', { class: 'flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300' }, ico('circle-check', 'h-8 w-8')),
          h('p', { class: 'text-lg font-semibold text-white' }, t('cardsDone')(learnedCount()))),
          h('button', { type: 'button', class: BTN, onclick: openCards }, t('cards')));
        return;
      }
      const { w } = items[0];
      root.append(h('div', { class: 'h-2 overflow-hidden rounded-full bg-night-800' }, h('div', { class: 'h-full rounded-full bg-brand-500', style: `width:${(done / Math.max(total, 1)) * 100}%` })));
      const back = h('div', { class: 'hidden flex-col items-center gap-2' },
        h('p', { class: 'text-2xl font-semibold text-brand-400' }, w.back),
        w.example ? h('p', { class: 'text-sm italic text-slate-400' }, w.example) : null);
      const say = h('button', { type: 'button', class: 'flex h-11 items-center gap-2 rounded-full bg-night-700 px-4 text-sm text-slate-200 hover:bg-night-600', 'aria-label': t('listen') }, ico('volume-2', 'h-4 w-4'), t('listen'));
      say.onclick = (e) => { e.stopPropagation(); N.speak(w.front, items[0].d.learn); };
      const card = h('div', { class: 'flex min-h-56 flex-col items-center justify-center gap-4 rounded-3xl bg-night-800 p-6 text-center ring-1 ring-white/10' },
        h('p', { class: 'text-3xl font-semibold text-white' }, w.front), 'speechSynthesis' in window ? say : null, back);
      const reveal = h('button', { type: 'button', class: BTN }, t('showBack'));
      const answers = h('div', { class: 'hidden grid-cols-2 gap-2' },
        h('button', { type: 'button', class: 'min-h-14 rounded-2xl bg-rose-500/15 font-semibold text-rose-200 ring-1 ring-rose-400/30', onclick: () => grade_(false) }, t('forgot')),
        h('button', { type: 'button', class: 'min-h-14 rounded-2xl bg-emerald-500/15 font-semibold text-emerald-200 ring-1 ring-emerald-400/30', onclick: () => grade_(true) }, t('remember')));
      reveal.onclick = () => { back.classList.replace('hidden', 'flex'); reveal.classList.add('hidden'); answers.classList.replace('hidden', 'grid'); };
      card.onclick = () => reveal.click();
      root.append(card, reveal, answers);
    };
    const grade_ = (ok) => {
      const item = items.shift();
      const { w } = item;
      if (ok) {
        w.box = Math.min(5, (w.box || 0) + 1);
        w.due = nowTs() + CARD_INTERVALS[w.box] * DAY;
        done += 1;
      } else {
        w.box = 1;
        w.due = nowTs();
        if (!retried.has(w)) { retried.add(w); items.push(item); } else done += 1;
      }
      save('cards');
      show();
    };
    show();
  }

  // ---------- counting games (no AI) ----------
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function mentalExample(g) {
    if (g <= 2) { const a = rnd(1, 15), b = rnd(1, 9); return Math.random() < 0.5 ? [`${a} + ${b}`, a + b] : [`${a + b} − ${b}`, a]; }
    if (g <= 4) {
      const r = Math.random();
      if (r < 0.35) { const a = rnd(10, 89), b = rnd(2, 99 - a); return [`${a} + ${b}`, a + b]; }
      if (r < 0.7) { const a = rnd(20, 99), b = rnd(2, a - 1); return [`${a} − ${b}`, a - b]; }
      const a = rnd(2, 9), b = rnd(2, 9); return [`${a} × ${b}`, a * b];
    }
    const r = Math.random();
    if (r < 0.3) { const a = rnd(100, 899), b = rnd(10, 99); return [`${a} + ${b}`, a + b]; }
    if (r < 0.55) { const a = rnd(100, 999), b = rnd(10, 99); return [`${a} − ${b}`, a - b]; }
    if (r < 0.8) { const a = rnd(11, 30), b = rnd(2, 9); return [`${a} × ${b}`, a * b]; }
    const b = rnd(2, 9), q = rnd(3, 25); return [`${b * q} : ${b}`, q];
  }
  function bestGame(key, value) {
    const g = data.progress.stats.games;
    const isNew = value > (g[key] || 0);
    if (isNew) { g[key] = value; }
    markDay();
    save('progress');
    return isNew;
  }

  function openGames() {
    const root = screen('activity');
    const g = data.progress.stats.games;
    root.append(titleBar(t('games')));
    [['mult', 'timer', t('gameMult'), playMult], ['mental', 'brain', t('gameMental'), playMental], ['mistake', 'sparkles', t('gameMistake'), playMistake]].forEach(([key, ic, [name, desc], fn]) => {
      root.append(h('button', { type: 'button', class: `${CARD} flex items-center gap-4 text-left transition hover:bg-night-800`, onclick: fn },
        h('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400' }, ico(ic)),
        h('div', { class: 'min-w-0 flex-1' }, h('p', { class: 'font-semibold text-white' }, name), h('p', { class: 'text-sm text-slate-400' }, desc)),
        g[key] ? h('span', { class: 'shrink-0 rounded-full bg-night-700 px-3 py-1 text-xs text-slate-200' }, t('best')(g[key])) : null));
    });
  }

  function gameResult(root, title, lines, isNew, again) {
    root.innerHTML = '';
    root.append(titleBar(title, openGames),
      h('div', { class: `${CARD} flex flex-col items-center gap-2 py-8 text-center` },
        h('span', { class: 'flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-200' }, ico('trophy', 'h-8 w-8')),
        lines.map((l) => h('p', { class: 'text-lg font-semibold text-white' }, l)),
        isNew ? h('p', { class: 'text-emerald-300' }, t('newRecord')) : null),
      h('button', { type: 'button', class: BTN, onclick: again }, ico('repeat'), t('playAgain')),
      h('button', { type: 'button', class: BTN2, onclick: openGames }, t('games')));
  }

  function numberPad(onSubmit) {
    const input = h('input', { type: 'text', inputmode: 'numeric', class: `${INPUT} text-center text-2xl`, autocomplete: 'off', maxlength: '6' });
    const go = h('button', { type: 'button', class: BTN }, t('check'));
    const send = () => { const v = input.value.trim(); if (v) { onSubmit(v); input.value = ''; input.focus(); } };
    go.onclick = send;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
    setTimeout(() => input.focus(), 50);
    return [input, go];
  }
  const flash = (el, ok) => { el.classList.remove('ring-emerald-400', 'ring-rose-400'); el.classList.add(ok ? 'ring-emerald-400' : 'ring-rose-400'); setTimeout(() => el.classList.remove('ring-emerald-400', 'ring-rose-400'), 400); };

  function playMult() {
    const root = screen('activity');
    const [name] = t('gameMult');
    let score = 0, a, b;
    const endAt = Date.now() + 60000;
    const timer = h('span', { class: 'tabular-nums' }, '60');
    const scoreEl = h('span', { class: 'tabular-nums' }, '0');
    const q = h('div', { class: 'flex min-h-40 items-center justify-center rounded-3xl bg-night-800 text-5xl font-bold text-white ring-2 ring-transparent transition' });
    const nextQ = () => { a = rnd(2, 9); b = rnd(2, 9); q.textContent = `${a} × ${b}`; };
    const [input, go] = numberPad((v) => { const ok = Number(v) === a * b; if (ok) score += 1; scoreEl.textContent = score; flash(q, ok); nextQ(); });
    root.append(titleBar(name, openGames),
      h('div', { class: 'flex justify-between text-slate-300' }, h('span', { class: 'flex items-center gap-1.5' }, ico('timer'), timer, ` ${t('seconds')}`), h('span', { class: 'flex items-center gap-1.5' }, ico('check'), scoreEl)),
      q, input, go);
    nextQ();
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      timer.textContent = left;
      if (left <= 0) { clearActive(); gameResult(root, name, [t('timeUp'), t('solved')(score)], bestGame('mult', score), playMult); }
    }, 250);
    stopActive = () => clearInterval(id);
  }

  function playMental() {
    const root = screen('activity');
    const [name] = t('gameMental');
    const list = Array.from({ length: 10 }, () => mentalExample(N.setup.grade));
    let i = 0, ok = 0;
    const started = Date.now();
    const counter = h('span', { class: 'tabular-nums' });
    const q = h('div', { class: 'flex min-h-40 items-center justify-center rounded-3xl bg-night-800 text-4xl font-bold text-white ring-2 ring-transparent transition' });
    const show = () => { counter.textContent = `${i + 1} / 10`; q.textContent = list[i][0]; };
    const [input, go] = numberPad((v) => {
      const right = Number(v) === list[i][1];
      if (right) ok += 1;
      flash(q, right);
      i += 1;
      if (i < list.length) return show();
      const secs = Math.round((Date.now() - started) / 1000);
      gameResult(root, name, [t('solved')(`${ok} / 10`), t('tookTime')(secs)], bestGame('mental', ok), playMental);
    });
    root.append(titleBar(name, openGames), h('div', { class: 'text-slate-300' }, counter), q, input, go);
    show();
  }

  function playMistake() {
    const root = screen('activity');
    const [name] = t('gameMistake');
    const ROUNDS = 5;
    let round = 0, score = 0;
    const makeRound = () => {
      const rows = Array.from({ length: 6 }, () => { const [expr, val] = mentalExample(N.setup.grade); return { expr, val, shown: val, wrong: false }; });
      const wrongCount = rnd(1, 2);
      for (let k = 0; k < wrongCount; k++) {
        const r = rows[k];
        r.wrong = true;
        r.shown = r.val + (Math.random() < 0.5 ? -1 : 1) * rnd(1, r.val > 20 ? 10 : 2);
        if (r.shown < 0) r.shown = r.val + rnd(1, 3);
      }
      return rows.sort(() => Math.random() - 0.5);
    };
    const show = () => {
      const rows = makeRound();
      root.innerHTML = '';
      root.append(titleBar(name, openGames), h('div', { class: 'flex justify-between text-sm text-slate-300' }, h('span', {}, t('roundOf')(round + 1, ROUNDS)), h('span', {}, t('markWrong'))));
      const grid = h('div', { class: 'grid grid-cols-2 gap-2' });
      rows.forEach((r) => {
        const b = h('button', { type: 'button', class: 'min-h-16 rounded-2xl bg-night-800 text-xl font-semibold tabular-nums text-white ring-2 ring-white/10 transition', 'aria-pressed': 'false' }, `${r.expr} = ${r.shown}`);
        b.onclick = () => { r.marked = !r.marked; b.setAttribute('aria-pressed', r.marked); b.classList.toggle('ring-brand-400', r.marked); b.classList.toggle('bg-brand-500/20', r.marked); };
        r.btn = b;
        grid.append(b);
      });
      const fb = h('div', {});
      const checkBtn = h('button', { type: 'button', class: BTN }, t('check'));
      checkBtn.onclick = () => {
        let perfect = true;
        rows.forEach((r) => {
          r.btn.disabled = true;
          r.btn.classList.remove('ring-brand-400', 'bg-brand-500/20', 'ring-white/10');
          if (r.wrong && r.marked) r.btn.classList.add('ring-emerald-400', 'bg-emerald-500/15');
          else if (r.wrong) { r.btn.classList.add('ring-amber-400', 'bg-amber-400/15'); perfect = false; }
          else if (r.marked) { r.btn.classList.add('ring-rose-400', 'bg-rose-500/15'); perfect = false; }
          else r.btn.classList.add('ring-white/5');
        });
        if (perfect) score += 1;
        fb.append(h('p', { class: `rounded-2xl p-4 ${perfect ? 'bg-emerald-500/10 text-emerald-100' : 'bg-amber-400/10 text-amber-100'}` }, perfect ? t('roundOk') : t('roundBad')));
        checkBtn.replaceWith(h('button', { type: 'button', class: BTN, onclick: () => {
          round += 1;
          if (round < ROUNDS) show();
          else gameResult(root, name, [t('solved')(`${score} / ${ROUNDS}`)], bestGame('mistake', score), playMistake);
        } }, round + 1 < ROUNDS ? t('next') : t('finish'), ico('chevron-right')));
      };
      root.append(grid, fb, checkBtn);
    };
    show();
  }

  // ---------- home ----------
  function renderHome() {
    const root = screen('home');
    const p = data.progress;
    const n = streak();
    const daily = p.daily?.date === todayStr() ? p.daily : null;
    const undone = data.diary.filter((d) => !d.done).length;

    root.append(h('div', { class: 'flex flex-col items-start gap-2' },
      h('h2', { class: 'text-2xl font-semibold text-white' }, t('hello')),
      h('span', { class: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${n ? 'bg-amber-400/15 text-amber-200' : 'bg-night-800 text-slate-400'}` }, ico('flame', 'h-4 w-4'), t('streak')(n))));

    root.append(h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-white shadow-lg shadow-brand-500/30' },
      h('div', { class: 'flex items-center gap-3' },
        h('span', { class: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15' }, ico('dumbbell')),
        h('div', { class: 'min-w-0' }, h('p', { class: 'text-lg font-semibold' }, t('dailyTitle')), h('p', { class: 'text-sm text-white/80' }, daily ? t('dailyDone')(daily.score) : t('dailyDesc')(level())))),
      h('button', { type: 'button', class: 'flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-brand-600 transition hover:bg-white/90 active:scale-[.98]', onclick: () => startTraining() }, daily ? ico('repeat') : ico('chevron-right'), daily ? t('again') : t('start'))));

    const tiles = t('tiles');
    const tile = (key, icon, onclick, extra) => h('button', { type: 'button', class: `${CARD} flex min-h-32 flex-col items-start gap-3 text-left transition hover:bg-night-800 active:scale-[.98]`, onclick },
      h('span', { class: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-night-700 text-brand-400' }, ico(icon)),
      h('span', { class: 'min-w-0' }, h('span', { class: 'block font-semibold text-white' }, tiles[key][0]), h('span', { class: 'block text-xs text-slate-400' }, extra || tiles[key][1])));
    // Older students get exams; younger ones keep the chat tile. Always 8 tiles.
    root.append(h('div', { class: 'grid grid-cols-2 gap-3' },
      tile('photo', 'camera', N.askWithPhoto),
      tile('test', 'clipboard-check', openTestPicker),
      grade() >= 8 ? tile('exam', 'graduation-cap', openExams) : tile('chat', 'message-circle', () => N.showScreen('chat')),
      tile('olympiad', 'puzzle', startOlympiad),
      tile('cards', 'layers', openCards),
      tile('reading', 'book-open', startReading),
      tile('games', 'gamepad-2', openGames),
      tile('diary', 'notebook-pen', () => N.showScreen('diary'), t('undone')(undone))));
  }

  // ---------- progress ----------
  const BADGES = [
    ['first', 'award', (s) => s.tasks >= 1],
    ['tasks50', 'trophy', (s) => s.tasks >= 50],
    ['streak3', 'flame', (s, n) => n >= 3],
    ['streak7', 'flame', (s, n) => n >= 7],
    ['test5', 'star', (s) => s.best5 >= 1],
    ['reader', 'book-open', (s) => s.reading >= 3],
    ['words30', 'layers', () => learnedCount() >= 30],
    ['mult20', 'timer', (s) => (s.games.mult || 0) >= 20],
  ];
  function topicColor(st) {
    if (!st || !st.total) return ['bg-slate-500', 'none'];
    const r = st.ok / st.total;
    if (r >= 0.8 && st.total >= 3) return ['bg-emerald-400', 'good'];
    if (r >= 0.5) return ['bg-amber-400', 'mid'];
    return ['bg-rose-400', 'bad'];
  }

  function renderProgress() {
    const root = screen('progress');
    const p = data.progress, s = p.stats;
    const n = streak();
    const daySet = new Set(p.days);
    const week = Array.from({ length: 7 }, (_, k) => {
      const d = new Date(Date.now() - (6 - k) * DAY);
      const key = d.toLocaleDateString('en-CA');
      return h('div', { class: 'flex flex-1 flex-col items-center gap-1' },
        h('span', { class: `h-8 w-full max-w-10 rounded-xl ${daySet.has(key) ? 'bg-amber-400' : 'bg-night-700'}` }),
        h('span', { class: 'text-[11px] text-slate-500' }, d.toLocaleDateString(N.lang === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }).slice(0, 2)));
    });
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
      h('div', { class: 'flex items-center gap-3' },
        h('span', { class: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200' }, ico('flame')),
        h('div', {}, h('p', { class: 'font-semibold text-white' }, t('streak')(n)), h('p', { class: 'text-sm text-slate-400' }, t('totalDays')(p.days.length)))),
      h('div', { class: 'flex gap-1.5' }, week)));

    const pct = s.tasks ? Math.round((s.correct / s.tasks) * 100) : 0;
    const stat = (v, label) => h('div', { class: 'rounded-2xl bg-night-900/80 p-3 text-center ring-1 ring-white/5' }, h('p', { class: 'text-2xl font-semibold tabular-nums text-white' }, String(v)), h('p', { class: 'text-xs text-slate-400' }, label));
    root.append(h('div', { class: 'grid grid-cols-3 gap-2' }, stat(s.tasks, t('statTasks')), stat(`${pct}%`, t('statCorrect')), stat(s.tests, t('statTests'))));

    root.append(h('div', { class: `${CARD} flex items-center justify-between gap-3` },
      h('div', { class: 'min-w-0' }, h('p', { class: 'font-semibold text-white' }, t('levelTitle')), h('p', { class: 'truncate text-sm text-slate-400' }, `${N.subjectName(subj())} · ${N.gradeLabel(grade())}`)),
      h('div', { class: 'flex shrink-0 gap-1' }, [1, 2, 3, 4, 5].map((k) => h('span', { class: `h-3 w-6 rounded-full ${k <= level() ? 'bg-brand-400' : 'bg-night-700'}` })))));

    const legend = t('legend');
    const mapBox = h('div', { class: 'flex flex-col gap-2' }, loading(t('loadingTopics')));
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
      h('p', { class: 'font-semibold text-white' }, t('topicMap')(N.subjectName(subj()))),
      h('div', { class: 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400' },
        [['bg-emerald-400', 'good'], ['bg-amber-400', 'mid'], ['bg-rose-400', 'bad'], ['bg-slate-500', 'none']].map(([c, k]) => h('span', { class: 'flex items-center gap-1.5' }, h('span', { class: `h-2.5 w-2.5 rounded-full ${c}` }), legend[k]))),
      h('p', { class: 'text-xs text-slate-500' }, t('tapTopic')),
      mapBox));
    const prefix = `${subj()}|${grade()}|`;
    const practiced = Object.keys(p.topics).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
    const drawMap = (topics) => {
      mapBox.innerHTML = '';
      const all = [...topics, ...practiced.filter((x) => !topics.includes(x))];
      all.forEach((tp) => {
        const st = p.topics[prefix + tp];
        const [c] = topicColor(st);
        mapBox.append(h('button', { type: 'button', class: 'flex min-h-12 items-center gap-3 rounded-2xl bg-night-800 px-4 text-left text-[15px] text-slate-100 ring-1 ring-white/5 hover:bg-night-700', onclick: () => startTraining(tp) },
          h('span', { class: `h-3 w-3 shrink-0 rounded-full ${c}` }), h('span', { class: 'min-w-0 flex-1' }, tp),
          st ? h('span', { class: 'shrink-0 text-xs tabular-nums text-slate-400' }, `${st.ok}/${st.total}`) : null));
      });
    };
    getTopics().then(drawMap).catch(() => drawMap([]));

    root.append(h('p', { class: 'mt-1 font-semibold text-white' }, t('badges')),
      h('div', { class: 'grid grid-cols-2 gap-2 sm:grid-cols-4' }, BADGES.map(([key, icon, test]) => {
        const got = test(s, n);
        const [title, desc] = t('badgeList')[key];
        return h('div', { class: `flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center ring-1 ${got ? 'bg-amber-400/10 ring-amber-400/30' : 'bg-night-900/60 ring-white/5 opacity-50'}` },
          h('span', { class: `flex h-11 w-11 items-center justify-center rounded-full ${got ? 'bg-amber-400/20 text-amber-200' : 'bg-night-700 text-slate-500'}` }, ico(icon)),
          h('p', { class: 'text-sm font-semibold text-white' }, title), h('p', { class: 'text-[11px] text-slate-400' }, desc));
      })));

    root.append(h('button', { type: 'button', class: BTN2, onclick: N.openReport }, ico('file-text'), t('parentReport')));
  }

  // ---------- diary ----------
  function fmtDate(iso) { const [, m, d] = iso.split('-'); return `${d}.${m}`; }
  function renderDiary() {
    const root = screen('diary');
    root.append(h('h2', { class: 'text-2xl font-semibold text-white' }, t('diaryTitle')));
    const text = h('input', { id: 'diaryText', type: 'text', class: INPUT, placeholder: t('whatAssignedPh'), maxlength: '200' });
    const subject = h('select', { id: 'diarySubject', class: `${INPUT} appearance-none` }, N.SUBJECTS.map(([k]) => h('option', { value: k, selected: k === subj() }, N.subjectName(k))));
    const tomorrow = new Date(Date.now() + DAY).toLocaleDateString('en-CA');
    const due = h('input', { id: 'diaryDue', type: 'date', class: INPUT, value: tomorrow });
    const add = () => {
      if (!text.value.trim()) return text.focus();
      data.diary = [...data.diary, { id: String(Date.now()), subject: subject.value, text: text.value.trim().slice(0, 200), due: due.value || tomorrow, done: false }].slice(-200);
      save('diary');
      renderDiary();
    };
    text.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    root.append(h('div', { class: `${CARD} flex flex-col gap-2` },
      h('label', { class: 'text-sm text-slate-400', for: 'diaryText' }, t('whatAssigned')), text,
      h('div', { class: 'grid grid-cols-2 gap-2' }, subject, h('div', {}, due)),
      h('button', { type: 'button', class: BTN, onclick: add }, ico('plus'), t('add'))));

    const today = todayStr();
    const tomorrowIso = tomorrow;
    const row = (item) => {
      const overdue = !item.done && item.due < today;
      const when = item.due === today ? t('todayWord') : item.due === tomorrowIso ? t('tomorrowWord') : t('until')(fmtDate(item.due));
      return h('div', { class: `flex items-center gap-3 rounded-2xl bg-night-900/80 p-3 ring-1 ${overdue ? 'ring-rose-400/40' : 'ring-white/5'}` },
        h('button', { type: 'button', class: `flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ${item.done ? 'bg-emerald-500 text-white ring-emerald-500' : 'text-transparent ring-slate-500 hover:ring-brand-400'}`, 'aria-label': item.done ? 'done' : 'todo', onclick: () => { item.done = !item.done; if (item.done) markDay(); save('diary'); renderDiary(); } }, ico('check')),
        h('div', { class: 'min-w-0 flex-1' },
          h('p', { class: `break-words ${item.done ? 'text-slate-500 line-through' : 'text-white'}` }, item.text),
          h('p', { class: `text-xs ${overdue ? 'text-rose-300' : 'text-slate-400'}` }, `${N.subjectName(item.subject)} · ${overdue ? `${t('overdue')} (${fmtDate(item.due)})` : when}`)),
        h('button', { type: 'button', class: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white/5 hover:text-rose-300', 'aria-label': t('del'), onclick: () => { data.diary = data.diary.filter((d) => d !== item); save('diary'); renderDiary(); } }, ico('trash-2')));
    };
    const todo = data.diary.filter((d) => !d.done).sort((a, b) => a.due.localeCompare(b.due));
    const done = data.diary.filter((d) => d.done).sort((a, b) => b.due.localeCompare(a.due)).slice(0, 20);
    if (!data.diary.length) root.append(h('p', { class: 'text-center text-slate-400' }, t('diaryEmpty')));
    if (todo.length) root.append(h('p', { class: 'font-semibold text-white' }, t('todo')(todo.length)), ...todo.map(row));
    if (done.length) root.append(h('p', { class: 'font-semibold text-slate-400' }, t('doneList')(done.length)), ...done.map(row));
  }

  // ---------- entry points used by app.js ----------
  function render(name, arg) {
    if (!N.setup) return;
    if (name === 'home') renderHome();
    else if (name === 'progress') renderProgress();
    else if (name === 'diary') renderDiary();
    else if (name === 'activity' && arg) arg();
  }

  window.NimiLearn = { load, render, markDay };
})();
