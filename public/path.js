// Learning path in the spirit of Duolingo: units of short lessons, no AI.
// Courses: math by grade, school subjects by grade (path-subjects.js), English (words with
// examples and grammar) and 15 more languages (basic words from path-words.js). The path follows
// the subject and grade the student chose; another course can be picked until the subject changes. Each unit is one topic with three lessons: "learn" (the rule and worked examples,
// then easy practice), "practice" and "check". Questions come from code (the bank of
// quest.js): math by grade, English words and grammar. A wrong answer comes back at the
// end of the lesson until it is right. XP, a daily goal and the streak keep the habit.
// Progress is saved with the account as data.path. Uses window.NimiLearn.kit.
(() => {
  const N = window.Nimi;
  const K = () => window.NimiLearn.kit;
  const bank = () => window.NimiQuest.bank;
  const tr = (ru, uz) => (N.lang === 'uz' ? uz : ru);

  const DAILY_GOAL = 30;
  const LESSONS = ['learn', 'practice', 'check'];
  const SIZE = { learn: 6, practice: 8, check: 10 };
  const XP = { learn: 10, practice: 10, check: 15 };
  const PERFECT_BONUS = 5;

  const T = {
    ru: {
      title: 'Путь знаний',
      lead: 'Уроки по шагам: правило, примеры и упражнения. Без ИИ, работает всегда.',
      math: 'Математика',
      english: 'Английский',
      course: 'Курс',
      langNames: { en: 'Английский', ru: 'Русский', uz: 'Узбекский', es: 'Испанский', fr: 'Французский', de: 'Немецкий', it: 'Итальянский', pt: 'Португальский', nl: 'Нидерландский', pl: 'Польский', sv: 'Шведский', tr: 'Турецкий', zh: 'Китайский', ja: 'Японский', ko: 'Корейский', ar: 'Арабский', hi: 'Хинди' },
      typeIn: 'Напиши перевод',
      typeQIn: (w) => `Напиши перевод: «${w}»`,
      chooseIn: (w) => `Как сказать «${w}»?`,
      unit: (n) => `Раздел ${n}`,
      lessons: { learn: 'Новая тема', practice: 'Практика', check: 'Проверка' },
      start: 'Начать',
      again: 'Повторить',
      locked: 'Сначала пройди предыдущий урок',
      subLesson: 'Подписка',
      subNote: 'Первый урок — бесплатно. Дальше «Путь знаний» открывается с подпиской или бесплатной неделей.',
      nextSub: 'Следующий урок — с подпиской',
      heroFree: 'Первый урок бесплатно',
      heroPaid: 'С подпиской · без ИИ',
      today: (x) => `Сегодня ${x} / ${DAILY_GOAL} XP`,
      goalDone: 'Цель дня выполнена!',
      xpTotal: (x) => `${x} XP всего`,
      homeTitle: 'Путь знаний',
      homeDesc: (u, n) => `Раздел ${u} из ${n} · уроки без ИИ`,
      homeAll: 'Все разделы пройдены — можно повторять',
      lessonsNoAi: 'Уроки без ИИ',
      heroUnit: (u, n) => `Раздел ${u} из ${n}`,
      heroGo: 'Продолжить урок',
      heroOf: `из ${DAILY_GOAL} XP`,
      heroRing: (x) => `Цель дня: ${x} из ${DAILY_GOAL} XP`,
      cont: 'Продолжить',
      rule: 'Правило',
      example: 'Пример',
      solution: 'Решение',
      newTopic: 'Новая тема',
      gotIt: 'Понятно, к упражнениям',
      words: 'Новые слова',
      listenHint: 'Нажми, чтобы послушать',
      check: 'Проверить',
      next: 'Дальше',
      right: ['Верно!', 'Отлично!', 'Молодец!', 'Так держать!'],
      wrong: 'Не совсем',
      answerIs: 'Правильный ответ:',
      typeHere: 'Напиши по-английски',
      typeQ: (w) => `Напиши по-английски: «${w}»`,
      listenQ: 'Что ты услышал?',
      matchQ: 'Найди пары',
      chooseTr: (w) => `Как переводится **${w}**?`,
      chooseEn: (w) => `Как по-английски «${w}»?`,
      fillQ: 'Вставь пропущенное слово',
      wordsUnit: (list) => `Слова: ${list}`,
      grammarUnit: (n) => `Грамматика ${n}`,
      doneTitle: 'Урок пройден!',
      doneUnit: 'Раздел пройден!',
      accLabel: 'Точность',
      perfect: 'Без ошибок — бонус +5 XP',
      streak: (n) => `Серия: ${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'}`,
      backToPath: 'К пути',
      nextLesson: 'Следующий урок',
      leaders: 'Рейтинг по XP',
      quit: 'Выйти из урока',
      mistakeBack: 'Эта ошибка вернётся в конце урока',
      review: (g) => `Повторение · ${g} класс`,
      forGrade: (c, g) => `${c} · ${g} класс`,
      startsFrom: (n, g) => `Предмет «${n}» начинается с ${g} класса — пока здесь первые темы.`,
      allGrades: 'Слова для начинающих — подходят для любого класса.',
      reviewNote: 'Сначала темы твоего класса, потом повторение прошлых классов.',
      pastOnly: (n, a, b) => `«${n}» проходят в ${a}–${b} классе — здесь повторение.`,
    },
    uz: {
      title: "Bilim yo'li",
      lead: "Bosqichma-bosqich darslar: qoida, misollar va mashqlar. SI siz, doim ishlaydi.",
      math: 'Matematika',
      english: 'Ingliz tili',
      course: 'Kurs',
      langNames: { en: 'Ingliz tili', ru: 'Rus tili', uz: "O'zbek tili", es: 'Ispan tili', fr: 'Fransuz tili', de: 'Nemis tili', it: 'Italyan tili', pt: 'Portugal tili', nl: 'Niderland tili', pl: 'Polyak tili', sv: 'Shved tili', tr: 'Turk tili', zh: 'Xitoy tili', ja: 'Yapon tili', ko: 'Koreys tili', ar: 'Arab tili', hi: 'Hind tili' },
      typeIn: 'Tarjimasini yoz',
      typeQIn: (w) => `Tarjimasini yoz: «${w}»`,
      chooseIn: (w) => `«${w}» qanday aytiladi?`,
      unit: (n) => `${n}-bo'lim`,
      lessons: { learn: 'Yangi mavzu', practice: 'Mashq', check: 'Tekshiruv' },
      start: 'Boshlash',
      again: 'Takrorlash',
      locked: 'Avval oldingi darsni tugat',
      subLesson: 'Obuna',
      subNote: "Birinchi dars — bepul. Keyin «Bilim yo'li» obuna yoki bepul hafta bilan ochiladi.",
      nextSub: 'Keyingi dars — obuna bilan',
      heroFree: 'Birinchi dars bepul',
      heroPaid: 'Obuna bilan · SI siz',
      today: (x) => `Bugun ${x} / ${DAILY_GOAL} XP`,
      goalDone: 'Kunlik maqsad bajarildi!',
      xpTotal: (x) => `Jami ${x} XP`,
      homeTitle: "Bilim yo'li",
      homeDesc: (u, n) => `${n} ta bo'limdan ${u}-bo'lim · SI siz darslar`,
      homeAll: "Hamma bo'limlar tugadi — takrorlash mumkin",
      lessonsNoAi: 'SI siz darslar',
      heroUnit: (u, n) => `${n} ta bo'limdan ${u}-bo'lim`,
      heroGo: 'Darsni davom ettirish',
      heroOf: `/ ${DAILY_GOAL} XP`,
      heroRing: (x) => `Kunlik maqsad: ${x} / ${DAILY_GOAL} XP`,
      cont: 'Davom etish',
      rule: 'Qoida',
      example: 'Misol',
      solution: 'Yechim',
      newTopic: 'Yangi mavzu',
      gotIt: 'Tushunarli, mashqlarga',
      words: "Yangi so'zlar",
      listenHint: 'Eshitish uchun bos',
      check: 'Tekshirish',
      next: 'Davom etish',
      right: ["To'g'ri!", "Zo'r!", 'Barakalla!', 'Shunday davom et!'],
      wrong: "Unchalik emas",
      answerIs: "To'g'ri javob:",
      typeHere: 'Inglizcha yoz',
      typeQ: (w) => `Inglizcha yoz: «${w}»`,
      listenQ: 'Nimani eshitding?',
      matchQ: 'Juftlarini top',
      chooseTr: (w) => `**${w}** so'zi qanday tarjima qilinadi?`,
      chooseEn: (w) => `«${w}» inglizcha qanday bo'ladi?`,
      fillQ: "Tushib qolgan so'zni qo'y",
      wordsUnit: (list) => `So'zlar: ${list}`,
      grammarUnit: (n) => `Grammatika ${n}`,
      doneTitle: 'Dars tugadi!',
      doneUnit: "Bo'lim tugadi!",
      accLabel: 'Aniqlik',
      perfect: 'Xatosiz — bonus +5 XP',
      streak: (n) => `Seriya: ${n} kun`,
      backToPath: "Yo'lga qaytish",
      nextLesson: 'Keyingi dars',
      leaders: "XP bo'yicha reyting",
      quit: 'Darsdan chiqish',
      mistakeBack: 'Bu savol dars oxirida yana chiqadi',
      review: (g) => `Takrorlash · ${g}-sinf`,
      forGrade: (c, g) => `${c} · ${g}-sinf`,
      startsFrom: (n, g) => `«${n}» fani ${g}-sinfdan boshlanadi — hozircha birinchi mavzular.`,
      allGrades: "Boshlovchilar uchun so'zlar — har qanday sinfga mos.",
      reviewNote: "Avval sening sinfing mavzulari, keyin oldingi sinflarni takrorlash.",
      pastOnly: (n, a, b) => `«${n}» ${a}–${b}-sinflarda o'tiladi — bu yerda takrorlash.`,
    },
  };
  const t = (k) => T[N.lang === 'uz' ? 'uz' : 'ru'][k];

  // ---------- saved state ----------
  function P() {
    const d = K().data;
    const p = d.path;
    p.xp = p.xp || 0;
    p.days = p.days && typeof p.days === 'object' ? p.days : {};
    p.done = p.done && typeof p.done === 'object' ? p.done : {};
    if (p.course === 'english') p.course = 'en';
    // The path follows the chosen subject: when the subject changes, the course changes too.
    const subject = N.setup?.subject;
    if (subject && p.subjectSeen !== subject) { p.course = courseForSubject(); p.subjectSeen = subject; }
    if (!courses().includes(p.course)) p.course = courseForSubject();
    return p;
  }
  const save = () => K().save('path');
  // Courses: math, school subjects, English and the other languages (not the language of the
  // site itself). Russian grammar is for the Russian site, Ona tili for the Uzbek one.
  const W = () => window.NimiPathWords;
  const SUBJ = () => window.NimiPathSubjects || {};
  const subjectCourses = () => Object.keys(SUBJ()).filter((k) => !SUBJ()[k].lang || SUBJ()[k].lang === (N.lang === 'uz' ? 'uz' : 'ru'));
  const courses = () => ['math', ...subjectCourses(), 'en', ...W().langs.filter((l) => l !== 'en' && l !== (N.lang === 'uz' ? 'uz' : 'ru'))];
  const SUBJECT_LANG = { english: 'en', russian: 'ru', uzbek: 'uz', spanish: 'es', french: 'fr', german: 'de', chinese: 'zh', japanese: 'ja', korean: 'ko', arabic: 'ar', turkish: 'tr', italian: 'it', portuguese: 'pt', hindi: 'hi', dutch: 'nl', polish: 'pl', swedish: 'sv' };
  function courseForSubject() {
    const s = N.setup?.subject;
    if (s && SUBJ()[s] && courses().includes(s)) return s;
    const code = SUBJECT_LANG[s];
    return code && courses().includes(code) ? code : 'math';
  }
  const courseName = (c) => (c === 'math' ? t('math') : SUBJ()[c] ? N.subjectName(c) : t('langNames')[c] || c);
  const todayXp = () => P().days[N.today()] || 0;
  const grade = () => Number(N.setup?.grade) || 5;

  // ---------- courses: units built from the question bank ----------
  const shuffle = (a) => bank().shuffle(a);
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

  function mathUnits() {
    return bank().mathPool(grade()).map((tp) => ({ id: `m:${tp.id}`, kind: 'math', topic: tp, name: () => tp.name[N.lang === 'uz' ? 1 : 0] }));
  }
  // English follows the grade: the words of the student's grade band first (with grammar of that
  // level between them), then the words of earlier bands as review, nearest first.
  function englishUnits() {
    const { WORDS, GRAMMAR, enLevel, enBand, BAND_TOP } = bank();
    const band = enBand(grade()), lvl = enLevel(grade());
    // Units of 6 words; a short remainder joins the unit before it.
    const sixes = (list) => { const c = chunk(list, 6); if (c.length > 1 && c[c.length - 1].length < 4) c[c.length - 2].push(...c.pop()); return c; };
    const wordUnits = (b, review) => sixes(WORDS.filter((w) => w[3] === b)).map((ws) => ({
      id: `w:${ws[0][0]}`, kind: 'words', words: ws, tag: review ? t('review')(BAND_TOP[b]) : null,
      name: () => t('wordsUnit')(ws.slice(0, 3).map((w) => w[0]).join(', ')),
    }));
    const grammar = [...chunk(GRAMMAR.filter((g) => g[0] === lvl), 4), ...chunk(GRAMMAR.filter((g) => g[0] < lvl && g[0] > 1), 4)];
    const units = [];
    let gi = 0;
    const addGrammar = () => { const gs = grammar[gi++]; const n = gi; units.push({ id: `g:${lvl}:${n}`, kind: 'grammar', items: gs, name: () => t('grammarUnit')(n) }); };
    wordUnits(band, false).forEach((u, i) => {
      units.push(u);
      if (i % 2 === 1 && gi < grammar.length) addGrammar();
    });
    while (gi < grammar.length) addGrammar();
    for (let b = band - 1; b >= 1; b--) units.push(...wordUnits(b, true));
    return units;
  }
  // A word of another language: shown with its pronunciation when the script is not Latin.
  const LATIN = new Set(['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'tr', 'uz']);
  function vocabUnits(code) {
    const { langs, themes } = W();
    const i = langs.indexOf(code);
    return themes.map((th) => ({
      id: `v:${th.id}`, kind: 'vocab', code,
      entries: th.words.map((w) => {
        const [script, rom] = String(w[i]).split('|');
        return { t: rom ? `${script} (${rom})` : script, say: script, n: N.lang === 'uz' ? w[1] : w[0] };
      }),
      name: () => th[N.lang === 'uz' ? 'uz' : 'ru'],
    }));
  }
  // A school subject: the topics of the student's grade first, then the earlier grades as review.
  // Topics of later grades are not shown. When the subject starts later than the student's
  // grade, its first topics are shown with a note.
  const pick = (v) => (Array.isArray(v) ? v[N.lang === 'uz' ? 1 : 0] : v);
  function subjectPlan(key) {
    const sj = SUBJ()[key];
    const g = grade();
    const now = sj.topics.filter((tp) => tp.g[0] <= g && g <= tp.g[1]);
    const past = sj.topics.filter((tp) => tp.g[1] < g).sort((a, b) => b.g[1] - a.g[1]);
    if (now.length || past.length) return { now, past, early: false };
    const first = [...sj.topics].sort((a, b) => a.g[0] - b.g[0]).slice(0, 3);
    return { now: first, past: [], early: first[0].g[0] };
  }
  function subjectUnits(key) {
    const sj = SUBJ()[key];
    const { now, past } = subjectPlan(key);
    const unit = (tp, review) => ({
      id: `t:${tp.id}`, kind: 'quiz', subj: sj, topic: tp,
      name: () => pick(tp.name),
      tag: review ? t('review')(tp.g[1]) : null,
    });
    return [...now.map((tp) => unit(tp, false)), ...past.map((tp) => unit(tp, true))];
  }
  const courseKey = (c) => (c === 'math' ? `math:${grade()}` : c === 'en' ? `en:b${bank().enBand(grade())}` : SUBJ()[c] ? `sub:${c}` : `lang:${c}`);
  const unitsOf = (c) => (c === 'math' ? mathUnits() : c === 'en' ? englishUnits() : SUBJ()[c] ? subjectUnits(c) : vocabUnits(c));
  // Without a subscription only the first lesson of each course is free (since 08.11.2026).
  const freeLesson = (unitIndex, lessonIndex) => unitIndex === 0 && lessonIndex === 0;
  const needsSub = (unitIndex, lessonIndex) => !freeLesson(unitIndex, lessonIndex) && !N.hasAccess();
  const toSubscribe = () => window.NimiLearn?.openSubscribe('path');
  const doneMap = (c) => { const p = P(); p.done[courseKey(c)] = p.done[courseKey(c)] || {}; return p.done[courseKey(c)]; };
  // The first unit that still has lessons to take (or -1 when all are done).
  function position(c) {
    const units = unitsOf(c), done = doneMap(c);
    const i = units.findIndex((u) => (done[u.id] || 0) < LESSONS.length);
    return { units, done, unit: i, lesson: i < 0 ? -1 : done[units[i].id] || 0 };
  }

  // ---------- exercises ----------
  const native = (w) => (N.lang === 'uz' ? w[2] : w[1]);
  function mathExercise(unit) {
    const x = unit.topic.gen();
    return { type: 'choice', q: x.q, a: x.a, opts: x.opts, rule: x.rule, explain: x.explain };
  }
  function wordExercise(unit, kind) {
    const { WORDS, enBand, strChoice } = bank();
    const pool = WORDS.filter((w) => w[3] <= enBand(grade()));
    const w = unit.words[Math.floor(Math.random() * unit.words.length)];
    const others = shuffle(pool.filter((x) => x !== w)).slice(0, 6);
    const explain = `**${w[0]}** — ${native(w)}. ${t('example')}: ${w[4]}`;
    const canHear = 'speechSynthesis' in window;
    const k = kind || (canHear ? ['tr', 'en', 'en', 'listen', 'type'] : ['tr', 'en', 'en', 'type'])[Math.floor(Math.random() * (canHear ? 5 : 4))];
    if (k === 'tr') return { type: 'choice', q: t('chooseTr')(w[0]), ...strChoice(native(w), others.map(native)), explain, speak: w[0] };
    if (k === 'listen') return { type: 'choice', listen: w[0], q: t('listenQ'), ...strChoice(w[0], others.map((x) => x[0])), explain, speak: w[0] };
    if (k === 'type') return { type: 'input', q: t('typeQ')(native(w)), a: w[0], explain, speak: w[0] };
    return { type: 'choice', q: t('chooseEn')(native(w)), ...strChoice(w[0], others.map((x) => x[0])), explain, speak: w[0] };
  }
  function matchExercise(words) {
    const four = shuffle(words).slice(0, 4);
    return { type: 'match', q: t('matchQ'), pairs: four.map((w) => [w[0], native(w)]) };
  }
  // Is there a voice for this language on the device? (Listening exercises need one.)
  const hasVoice = (code) => code === 'en' || ('speechSynthesis' in window && speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(code)));
  function vocabExercise(unit, kind) {
    const all = vocabUnits(unit.code).flatMap((u) => u.entries);
    const e = unit.entries[Math.floor(Math.random() * unit.entries.length)];
    const others = shuffle(all.filter((x) => x.t !== e.t && x.n !== e.n)).slice(0, 6);
    const kinds = ['tr', 'to', 'to'];
    if (hasVoice(unit.code)) kinds.push('listen');
    if (LATIN.has(unit.code)) kinds.push('type');
    const k = kind || kinds[Math.floor(Math.random() * kinds.length)];
    const sc = bank().strChoice;
    const base = { explain: `**${e.t}** — ${e.n}`, speak: e.say, code: unit.code };
    if (k === 'tr') return { type: 'choice', q: t('chooseTr')(e.t), ...sc(e.n, others.map((x) => x.n)), ...base };
    if (k === 'listen') return { type: 'choice', listen: e.say, q: t('listenQ'), ...sc(e.t, others.map((x) => x.t)), ...base };
    if (k === 'type') return { type: 'input', q: t('typeQIn')(e.n), a: e.t, ...base };
    return { type: 'choice', q: t('chooseIn')(e.n), ...sc(e.t, others.map((x) => x.t)), ...base };
  }
  // A question of a school subject: one language for Russian / Ona tili, otherwise ru or uz.
  function quizItem(unit, raw) {
    if (unit.subj.lang) { const [q, opts, why] = raw; return { q, opts, why }; }
    const uz = N.lang === 'uz';
    return { q: raw[uz ? 1 : 0], opts: raw[uz ? 3 : 2], why: raw[uz ? 5 : 4] };
  }
  function quizExercise(unit, raw) {
    const it = quizItem(unit, raw);
    return { type: 'choice', q: it.q, ...bank().strChoice(it.opts[0], it.opts.slice(1)), rule: pick(unit.topic.rule), explain: it.why };
  }
  // All questions of the topic in random order, then again, never the same one twice in a row.
  function quizLesson(unit, n) {
    const out = [];
    while (out.length < n) {
      let round = shuffle(unit.topic.qs.slice());
      if (out.length && round[0] === out[out.length - 1] && round.length > 1) round = [...round.slice(1), round[0]];
      out.push(...round);
    }
    return out.slice(0, n).map((raw) => quizExercise(unit, raw));
  }
  function grammarExercise(unit) {
    const g = unit.items[Math.floor(Math.random() * unit.items.length)];
    const [, s, right, wrong, ru, uz] = g;
    return { type: 'choice', q: `${t('fillQ')}:\n**${s}**`, ...bank().strChoice(right, wrong), rule: tr(ru, uz), explain: `**${s.replace('___', right)}**`, speak: s.replace('___', right) };
  }
  // A lesson's questions; similar ones are not repeated back to back.
  function buildLesson(unit, lessonType) {
    const n = SIZE[lessonType];
    if (unit.kind === 'quiz') return quizLesson(unit, n);
    const out = [];
    const seen = new Set();
    for (let tries = 0; out.length < n && tries < n * 8; tries++) {
      let ex;
      if (unit.kind === 'math') ex = mathExercise(unit);
      else if (unit.kind === 'grammar') ex = grammarExercise(unit);
      else if (unit.kind === 'vocab') ex = out.length === 3 || (lessonType === 'check' && out.length === 7) ? { type: 'match', q: t('matchQ'), code: unit.code, pairs: shuffle(unit.entries).slice(0, 4).map((x) => [x.t, x.n, x.say]) } : vocabExercise(unit, lessonType === 'learn' && out.length < 2 ? 'tr' : null);
      else if (out.length === 3 || (lessonType === 'check' && out.length === 7)) ex = matchExercise(unit.words);
      else ex = wordExercise(unit, lessonType === 'learn' && out.length < 2 ? 'tr' : null);
      const key = ex.q + (ex.a || '') + (ex.listen || '');
      if (seen.has(key) && tries < n * 6) continue;
      seen.add(key);
      out.push(ex);
    }
    return out;
  }

  // ---------- sound ----------
  let audio = null;
  function beep(freqs, dur = 0.09, vol = 0.05) {
    if (!N.store.get('questSound', true)) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let at = audio.currentTime;
      for (const f of freqs) {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(vol, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g); g.connect(audio.destination);
        o.start(at); o.stop(at + dur);
        at += dur * 0.85;
      }
    } catch {}
  }
  const SFX = { right: () => beep([660, 880]), wrong: () => beep([300, 220], 0.14, 0.04), done: () => beep([523, 659, 784, 1047], 0.13, 0.06) };
  const say = (text, code = 'en') => N.speak && N.speak(text, code);

  // ---------- small view helpers ----------
  const H = (...a) => K().h(...a);
  const ico = (...a) => K().ico(...a);
  const html = (tag, cls, text) => { const el = H(tag, { class: cls }); el.innerHTML = N.formatReply(String(text)); return el; };
  // A typed word is right with or without its article ("die Mutter" or "Mutter", "to go" or "go").
  const ARTICLES = /^(the|to|el|la|los|las|le|les|l'|der|die|das|il|lo|gli|i|o|a|os|as|de|het)\s+|^l'/;
  const typedRight = (given, right) => {
    const g = norm(given), r = norm(right);
    return g === r || g.replace(ARTICLES, '') === r.replace(ARTICLES, '');
  };
  const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[.!?,]+$/g, '').replace(/\s+/g, ' ').trim();

  // ---------- the path screen ----------
  function open() {
    const k = K();
    const p = P();
    const root = k.screen('activity');
    root.append(k.titleBar(t('title')));
    root.append(H('p', { class: 'text-sm text-slate-400' }, t('lead')));
    const x = todayXp();
    root.append(H('div', { class: 'flex flex-wrap items-center gap-2 text-sm' },
      H('span', { class: 'flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-200' }, ico('flame', 'h-4 w-4'), t('streak')(streakDays())),
      H('span', { class: `flex items-center gap-1.5 rounded-full px-3 py-1.5 ${x >= DAILY_GOAL ? 'bg-emerald-500/15 text-emerald-200' : 'bg-night-800 text-slate-300'}` }, ico('zap', 'h-4 w-4'), x >= DAILY_GOAL ? t('goalDone') : t('today')(x)),
      H('span', { class: 'rounded-full bg-night-800 px-3 py-1.5 text-slate-300' }, t('xpTotal')(p.xp))));
    const pickCourse = H('select', { id: 'pathCourse', class: `${k.INPUT} appearance-none font-semibold`, 'aria-label': t('course') },
      ...courses().map((c) => { const o = H('option', { value: c }, courseName(c)); if (c === p.course) o.selected = true; return o; }));
    pickCourse.onchange = () => { P().course = pickCourse.value; save(); open(); };
    root.append(H('label', { class: 'flex flex-col gap-1' }, H('span', { class: 'px-1 text-xs font-semibold uppercase tracking-wide text-slate-400' }, t('course')), pickCourse));
    if (N.accounts) root.append(H('button', { type: 'button', class: k.BTN2, onclick: () => window.NimiLearn.openLeaderboard('path', open) }, ico('trophy'), t('leaders')));
    root.append(gradeLine(p.course));

    const pos = position(p.course);
    if (!N.hasAccess()) root.append(H('p', { class: 'flex items-start gap-2 rounded-2xl bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ring-1 ring-amber-400/30' }, ico('lock', 'icon mt-0.5'), t('subNote')));
    pos.units.forEach((u, ui) => {
      const doneN = pos.done[u.id] || 0;
      const finished = doneN >= LESSONS.length;
      const isCurrent = ui === pos.unit;
      const box = H('section', { class: `flex flex-col gap-4 rounded-3xl p-4 ring-1 ${isCurrent ? 'bg-brand-500/10 ring-brand-400/40' : 'bg-night-900/80 ring-white/5'}` });
      box.append(H('div', { class: 'flex items-center justify-between gap-3' },
        H('div', { class: 'min-w-0' },
          H('p', { class: 'text-xs font-semibold uppercase tracking-wide text-brand-400' }, u.tag ? `${t('unit')(ui + 1)} · ${u.tag}` : t('unit')(ui + 1)),
          H('p', { class: 'font-semibold text-white' }, u.name())),
        finished ? H('span', { class: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-onfill', title: t('doneUnit') }, ico('crown', 'h-5 w-5')) : H('span', { class: 'shrink-0 text-sm tabular-nums text-slate-400' }, `${doneN}/${LESSONS.length}`)));
      // Lesson nodes in a gentle zigzag, like a path.
      const offsets = ['self-center', 'self-center -translate-x-12', 'self-center translate-x-12'];
      const nodes = H('div', { class: 'flex flex-col gap-3 pb-1' });
      LESSONS.forEach((lt, li) => {
        const state = li < doneN ? 'done' : isCurrent && li === doneN ? (needsSub(ui, li) ? 'sub' : 'current') : 'locked';
        const node = H('button', {
          type: 'button',
          'aria-label': `${u.name()}: ${t('lessons')[lt]}`,
          class: `flex h-16 w-16 items-center justify-center rounded-full border-b-4 transition active:translate-y-0.5 active:border-b-0 ${
            state === 'done' ? 'border-amber-500 bg-amber-400 text-onfill' : state === 'current' ? 'border-brand-600 bg-brand-500 text-onfill ring-4 ring-brand-400/30' : state === 'sub' ? 'border-amber-400/40 bg-amber-400/15 text-amber-200 ring-4 ring-amber-400/20' : 'border-night-700 bg-night-800 text-slate-500'}`,
          onclick: () => (state === 'locked' ? hint(nodes, t('locked')) : state === 'sub' ? toSubscribe() : startLesson(p.course, ui, li)),
        }, ico(state === 'done' ? 'check' : state === 'current' ? (lt === 'learn' ? 'book-open' : lt === 'check' ? 'trophy' : 'dumbbell') : 'lock', 'h-7 w-7'));
        nodes.append(H('div', { class: `flex flex-col items-center gap-1 ${offsets[li]}` }, node,
          H('span', { class: `text-xs ${state === 'current' || state === 'sub' ? 'font-semibold text-white' : 'text-slate-400'}` }, state === 'current' ? `${t('lessons')[lt]} · ${t('start')}` : state === 'sub' ? `${t('lessons')[lt]} · ${t('subLesson')}` : t('lessons')[lt])));
      });
      if (isCurrent || finished || ui < pos.unit || pos.unit < 0) box.append(nodes);
      root.append(box);
      if (isCurrent) setTimeout(() => box.scrollIntoView({ block: 'center' }), 50);
    });
  }
  // "Physics · 8th grade" and, when needed, a note on how the topics were chosen.
  function gradeLine(c) {
    const box = H('div', { class: 'flex flex-col gap-1 rounded-2xl bg-night-900/80 px-4 py-3 ring-1 ring-white/5' },
      H('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('graduation-cap', 'h-5 w-5 shrink-0 text-brand-400'), t('forGrade')(courseName(c), grade())));
    let note = null;
    if (SUBJ()[c]) {
      const plan = subjectPlan(c);
      if (plan.early) note = t('startsFrom')(courseName(c), plan.early);
      else if (plan.past.length && plan.now.length) note = t('reviewNote');
      else if (plan.past.length) { const tps = SUBJ()[c].topics; note = t('pastOnly')(courseName(c), Math.min(...tps.map((x) => x.g[0])), Math.max(...tps.map((x) => x.g[1]))); }
    } else if (c !== 'math' && c !== 'en') note = t('allGrades');
    if (note) box.append(H('p', { class: 'text-sm text-slate-400' }, note));
    return box;
  }
  function hint(container, text) {
    const old = container.querySelector('[data-hint]');
    if (old) old.remove();
    const el = H('p', { 'data-hint': '1', class: 'text-center text-sm text-amber-200' }, text);
    container.append(el);
    setTimeout(() => el.remove(), 2200);
  }
  function streakDays() {
    const days = new Set(K().data.progress.days || []);
    const f = (dt) => dt.toLocaleDateString('en-CA');
    let d = new Date();
    if (!days.has(f(d))) d = new Date(d.getTime() - 86400000);
    let n = 0;
    while (days.has(f(d))) { n++; d = new Date(d.getTime() - 86400000); }
    return n;
  }

  // ---------- a lesson ----------
  function startLesson(course, unitIndex, lessonIndex) {
    if (needsSub(unitIndex, lessonIndex)) return toSubscribe();
    const units = unitsOf(course);
    const unit = units[unitIndex];
    const lessonType = LESSONS[lessonIndex];
    const queue = buildLesson(unit, lessonType);
    const total = queue.length;
    const state = { course, unit, unitIndex, lessonIndex, lessonType, queue, total, solved: 0, firstTry: 0, mistakes: 0, retried: new Set() };
    if (lessonType === 'learn') intro(state); else next(state);
  }

  function frame(state) {
    const k = K();
    const root = k.screen('activity');
    const pct = Math.round((state.solved / state.total) * 100);
    root.append(H('div', { class: 'flex items-center gap-3' },
      H('button', { type: 'button', class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-slate-300 ring-1 ring-white/5 hover:bg-night-700', 'aria-label': t('quit'), onclick: open }, ico('x')),
      H('div', { class: 'h-4 flex-1 overflow-hidden rounded-full bg-night-700', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct) },
        H('div', { class: 'h-full rounded-full bg-brand-500 transition-all duration-500', style: `width:${pct}%` }))));
    return root;
  }

  // The "learn" lesson starts with the rule and worked examples (math, grammar) or the new words.
  function intro(state) {
    const root = frame(state);
    const { unit } = state;
    root.append(H('p', { class: 'text-xs font-semibold uppercase tracking-wide text-brand-400' }, t('newTopic')));
    root.append(H('h2', { class: 'text-2xl font-semibold text-white' }, unit.name()));
    if (unit.kind === 'math') {
      const a = unit.topic.gen(), b = unit.topic.gen();
      root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-brand-500/10 p-4 ring-1 ring-brand-400/30' },
        H('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('lightbulb', 'icon text-amber-300'), t('rule')),
        html('div', 'text-slate-200', a.rule || '')));
      for (const x of [a, b]) {
        root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-night-900/80 p-4 ring-1 ring-white/5' },
          H('p', { class: 'text-sm font-semibold text-slate-400' }, t('example')),
          html('div', 'text-slate-100', x.q),
          H('p', { class: 'text-sm font-semibold text-slate-400' }, t('solution')),
          html('div', 'text-emerald-200', x.explain || `${t('answerIs')} ${x.a}`)));
      }
    } else if (unit.kind === 'quiz') {
      root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-brand-500/10 p-4 ring-1 ring-brand-400/30' },
        H('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('lightbulb', 'icon text-amber-300'), t('rule')),
        html('div', 'text-slate-200', pick(unit.topic.rule))));
      for (const raw of shuffle(unit.topic.qs.slice()).slice(0, 2)) {
        const it = quizItem(unit, raw);
        root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-night-900/80 p-4 ring-1 ring-white/5' },
          H('p', { class: 'text-sm font-semibold text-slate-400' }, t('example')),
          html('div', 'text-slate-100', it.q),
          html('div', 'font-semibold text-emerald-200', `${t('answerIs')} **${it.opts[0]}**`),
          html('div', 'text-sm text-slate-300', it.why)));
      }
    } else if (unit.kind === 'grammar') {
      for (const g of unit.items) {
        root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-night-900/80 p-4 ring-1 ring-white/5' },
          html('div', 'text-slate-200', tr(g[4], g[5])),
          html('div', 'text-emerald-200', `${t('example')}: **${g[1].replace('___', g[2])}**`)));
      }
    } else if (unit.kind === 'vocab') {
      const voice = hasVoice(unit.code);
      if (voice) root.append(H('p', { class: 'text-sm text-slate-400' }, t('listenHint')));
      root.append(H('div', { class: 'grid grid-cols-2 gap-2' }, ...unit.entries.map((e) => H('button', {
        type: 'button', class: 'flex flex-col items-start gap-1 rounded-2xl bg-night-900/80 p-3 text-left ring-1 ring-white/5 transition hover:bg-night-800 active:scale-[.98]', onclick: () => voice && say(e.say, unit.code),
      }, H('span', { class: 'flex items-center gap-2 text-lg font-semibold text-white' }, e.t, voice ? ico('volume-2', 'h-4 w-4 shrink-0 text-brand-400') : null), H('span', { class: 'text-sm text-slate-300' }, e.n)))));
    } else {
      root.append(H('p', { class: 'text-sm text-slate-400' }, t('listenHint')));
      root.append(H('div', { class: 'grid grid-cols-2 gap-2' }, ...unit.words.map((w) => H('button', {
        type: 'button', class: 'flex flex-col items-start gap-1 rounded-2xl bg-night-900/80 p-3 text-left ring-1 ring-white/5 transition hover:bg-night-800 active:scale-[.98]', onclick: () => say(w[0]),
      }, H('span', { class: 'flex items-center gap-2 text-lg font-semibold text-white' }, w[0], ico('volume-2', 'h-4 w-4 text-brand-400')), H('span', { class: 'text-sm text-slate-300' }, native(w)), H('span', { class: 'text-xs text-slate-500' }, w[4])))));
    }
    root.append(H('button', { type: 'button', class: K().BTN, onclick: () => next(state) }, t('gotIt')));
  }

  function next(state) {
    if (!state.queue.length) return finish(state);
    const ex = state.queue.shift();
    if (ex.type === 'match') return askMatch(state, ex);
    ask(state, ex);
  }

  function ask(state, ex) {
    const k = K();
    const root = frame(state);
    let chosen = null;
    root.append(html('div', 'text-xl font-semibold leading-snug text-white', ex.q));
    if (ex.listen) {
      root.append(H('button', { type: 'button', class: 'flex h-20 w-20 items-center justify-center self-center rounded-3xl border-b-4 border-brand-600 bg-brand-500 text-onfill active:translate-y-0.5', 'aria-label': t('listenHint'), onclick: () => say(ex.listen, ex.code) }, ico('volume-2', 'h-9 w-9')));
      setTimeout(() => say(ex.listen, ex.code), 250);
    }
    const checkBtn = H('button', { type: 'button', class: k.BTN, disabled: true }, t('check'));
    let input = null;
    let optButtons = [];
    if (ex.type === 'input') {
      const ph = ex.code && ex.code !== 'en' ? t('typeIn') : t('typeHere');
      input = H('input', { type: 'text', class: k.INPUT, placeholder: ph, autocapitalize: 'none', autocomplete: 'off', spellcheck: 'false', 'aria-label': ph });
      input.addEventListener('input', () => { checkBtn.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) checkBtn.click(); });
      root.append(input);
      setTimeout(() => input.focus(), 50);
    } else {
      const opts = H('div', { class: 'flex flex-col gap-2' });
      ex.opts.forEach((o) => {
        const b = H('button', { type: 'button', class: 'min-h-14 rounded-2xl border-b-4 border-night-700 bg-night-800 px-4 py-3 text-left text-lg text-slate-100 ring-1 ring-white/10 transition active:translate-y-0.5' });
        b.innerHTML = N.formatReply(String(o));
        b.onclick = () => {
          chosen = o;
          for (const x of opts.children) x.classList.remove('ring-2!', 'ring-brand-400!', 'bg-brand-500/15!');
          b.classList.add('ring-2!', 'ring-brand-400!', 'bg-brand-500/15!');
          checkBtn.disabled = false;
        };
        opts.append(b);
        optButtons.push([b, o]);
      });
      root.append(opts);
    }
    root.append(checkBtn);
    checkBtn.onclick = () => {
      const given = ex.type === 'input' ? input.value : chosen;
      const ok = ex.type === 'input' ? typedRight(given, ex.a) : given === ex.a;
      checkBtn.remove();
      if (input) input.disabled = true;
      // Show the right option in green and a wrong choice in red; no more taps.
      for (const [b, o] of optButtons) {
        b.disabled = true;
        b.classList.remove('ring-2!', 'ring-brand-400!', 'bg-brand-500/15!');
        if (o === ex.a) b.classList.add('ring-2!', 'ring-emerald-400!', 'bg-emerald-500/15!');
        else if (o === given) b.classList.add('ring-2!', 'ring-rose-400!', 'bg-rose-500/15!');
        else b.classList.add('opacity-60');
      }
      grade1(state, ex, ok);
      feedback(root, state, ex, ok);
    };
  }

  // Counts the answer: a mistake comes back at the end of the lesson.
  function grade1(state, ex, ok) {
    if (ok) {
      state.solved++;
      if (!state.retried.has(ex)) state.firstTry++;
    } else {
      state.mistakes++;
      state.retried.add(ex);
      state.queue.push(ex);
    }
    const s = K().data.progress.stats;
    s.tasks = (s.tasks || 0) + 1;
    if (ok) s.correct = (s.correct || 0) + 1;
  }

  function feedback(root, state, ex, ok) {
    const k = K();
    (ok ? SFX.right : SFX.wrong)();
    const praise = t('right')[Math.floor(Math.random() * t('right').length)];
    const box = H('div', { class: `flex flex-col gap-2 rounded-3xl p-4 ring-1 ${ok ? 'bg-emerald-500/15 ring-emerald-400/30' : 'bg-rose-500/15 ring-rose-400/30'}`, role: 'status' },
      H('p', { class: `flex items-center gap-2 text-lg font-semibold ${ok ? 'text-emerald-200' : 'text-rose-200'}` }, ico(ok ? 'circle-check' : 'circle-alert'), ok ? praise : t('wrong')));
    if (!ok && ex.type !== 'match') box.append(html('div', 'text-slate-100', `${t('answerIs')} **${ex.a}**`));
    if (!ok && ex.rule) box.append(html('div', 'text-sm text-slate-300', ex.rule));
    if (ex.explain && (!ok || ex.type === 'input')) box.append(html('div', 'text-sm text-slate-300', ex.explain));
    if (ex.speak && hasVoice(ex.code || 'en')) box.append(H('button', { type: 'button', class: 'flex items-center gap-2 self-start text-sm text-brand-400', onclick: () => say(ex.speak, ex.code || 'en') }, ico('volume-2', 'h-4 w-4'), ex.speak));
    if (!ok) box.append(H('p', { class: 'text-xs text-slate-400' }, t('mistakeBack')));
    root.append(box);
    const go = H('button', { type: 'button', class: k.BTN, onclick: () => next(state) }, t('next'));
    root.append(go);
    go.focus();
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Four words and four translations: tap one on each side.
  function askMatch(state, ex) {
    const k = K();
    const root = frame(state);
    root.append(H('p', { class: 'text-xl font-semibold text-white' }, ex.q));
    const left = shuffle(ex.pairs.map((p) => p[0]));
    const right = shuffle(ex.pairs.map((p) => p[1]));
    const pairOf = new Map(ex.pairs.map(([a, b]) => [a, b]));
    const sayOf = new Map(ex.pairs.map(([a, , s]) => [a, s || a]));
    const voice = hasVoice(ex.code || 'en');
    let pick = null;
    let matched = 0;
    let missed = false;
    const cls = 'min-h-14 rounded-2xl border-b-4 border-night-700 bg-night-800 px-3 py-2 text-[15px] text-slate-100 ring-1 ring-white/10 transition';
    const colL = H('div', { class: 'flex flex-col gap-2' });
    const colR = H('div', { class: 'flex flex-col gap-2' });
    const mark = (b, on) => { b.classList.toggle('ring-brand-400!', on); b.classList.toggle('ring-2!', on); };
    const mk = (text, side) => {
      const b = H('button', { type: 'button', class: cls }, text);
      b.onclick = () => {
        if (side === 'L' && voice) say(sayOf.get(text), ex.code || 'en');
        if (!pick || pick.side === side) {
          if (pick) mark(pick.b, false);
          pick = { b, text, side };
          mark(b, true);
          return;
        }
        const [en, nat] = side === 'R' ? [pick.text, text] : [text, pick.text];
        const other = pick.b;
        mark(other, false);
        pick = null;
        if (pairOf.get(en) === nat) {
          SFX.right();
          for (const x of [b, other]) { x.disabled = true; x.classList.add('opacity-40'); }
          matched++;
          if (matched === ex.pairs.length) {
            state.solved++;
            if (!missed) state.firstTry++;
            const s = K().data.progress.stats;
            s.tasks = (s.tasks || 0) + 1;
            if (!missed) s.correct = (s.correct || 0) + 1;
            root.append(H('div', { class: 'rounded-3xl bg-emerald-500/15 p-4 text-lg font-semibold text-emerald-200 ring-1 ring-emerald-400/30', role: 'status' }, t('right')[0]));
            const go = H('button', { type: 'button', class: k.BTN, onclick: () => next(state) }, t('next'));
            root.append(go);
            go.focus();
          }
        } else {
          SFX.wrong();
          if (!missed) { missed = true; state.mistakes++; }
          for (const x of [b, other]) { x.classList.add('ring-2!', 'ring-rose-400!'); setTimeout(() => x.classList.remove('ring-2!', 'ring-rose-400!'), 600); }
        }
      };
      return b;
    };
    left.forEach((x) => colL.append(mk(x, 'L')));
    right.forEach((x) => colR.append(mk(x, 'R')));
    root.append(H('div', { class: 'grid grid-cols-2 gap-3' }, colL, colR));
  }

  function finish(state) {
    const k = K();
    const p = P();
    const done = doneMap(state.course);
    const prev = done[state.unit.id] || 0;
    if (state.lessonIndex >= prev) done[state.unit.id] = Math.max(prev, state.lessonIndex + 1);
    const perfect = state.mistakes === 0;
    const xp = XP[state.lessonType] + (perfect ? PERFECT_BONUS : 0);
    p.xp += xp;
    // The leaderboard is counted by the server (it checks the amount and how often lessons end).
    if (N.accounts) N.postJson('/api/leaderboard/add', { board: 'path', amount: xp }).catch(() => {});
    const day = N.today();
    p.days[day] = (p.days[day] || 0) + xp;
    for (const key of Object.keys(p.days)) if (key < new Date(Date.now() - 60 * 86400000).toLocaleDateString('en-CA')) delete p.days[key];
    save();
    k.markDay();
    k.save('progress');
    SFX.done();
    const unitDone = (done[state.unit.id] || 0) >= LESSONS.length;
    const acc = Math.round((state.firstTry / Math.max(1, state.total)) * 100);
    const root = k.screen('activity');
    root.append(H('div', { class: 'flex flex-col items-center gap-3 pt-6 text-center' },
      H('span', { class: 'flex h-24 w-24 items-center justify-center rounded-full bg-amber-400 text-onfill shadow-lg' }, ico(unitDone ? 'crown' : 'trophy', 'h-12 w-12')),
      H('h2', { class: 'text-3xl font-semibold text-white' }, unitDone ? t('doneUnit') : t('doneTitle')),
      H('p', { class: 'text-slate-300' }, state.unit.name())));
    root.append(H('div', { class: 'grid grid-cols-3 gap-2' },
      ...[[`+${xp}`, 'XP'], [`${acc}%`, t('accLabel')], [String(streakDays()), ico('flame', 'h-4 w-4 text-amber-300')]].map(([v, l]) => H('div', { class: 'flex flex-col items-center gap-1 rounded-2xl bg-night-900/80 p-3 ring-1 ring-white/5' },
        H('span', { class: 'text-2xl font-semibold tabular-nums text-white' }, v), H('span', { class: 'flex items-center gap-1 text-xs text-slate-400' }, l)))));
    if (perfect) root.append(H('p', { class: 'text-center text-sm font-semibold text-emerald-200' }, t('perfect')));
    const x = todayXp();
    root.append(H('div', { class: 'flex flex-col gap-2 rounded-2xl bg-night-900/80 p-3 ring-1 ring-white/5' },
      H('p', { class: 'text-sm text-slate-300' }, x >= DAILY_GOAL ? t('goalDone') : t('today')(x)),
      H('div', { class: 'h-3 overflow-hidden rounded-full bg-night-700' }, H('div', { class: 'h-full rounded-full bg-amber-400', style: `width:${Math.min(100, (x / DAILY_GOAL) * 100)}%` }))));
    const pos = position(state.course);
    if (pos.unit >= 0) root.append(H('button', { type: 'button', class: k.BTN, onclick: () => startLesson(state.course, pos.unit, pos.lesson) }, needsSub(pos.unit, pos.lesson) ? t('nextSub') : t('nextLesson')));
    root.append(H('button', { type: 'button', class: k.BTN2, onclick: open }, t('backToPath')));
  }

  // ---------- the card on the home screen ----------
  function homeCard() {
    const p = P();
    const pos = position(p.course);
    const x = todayXp();
    return H('button', { type: 'button', class: 'flex flex-col gap-3 rounded-3xl bg-night-900/80 p-4 text-left ring-1 ring-brand-400/30 transition hover:bg-night-800 active:scale-[.99]', onclick: open },
      H('div', { class: 'flex items-center gap-3' },
        H('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-brand-600 bg-brand-500 text-onfill' }, ico('route', 'h-6 w-6')),
        H('div', { class: 'min-w-0 flex-1' },
          H('p', { class: 'text-lg font-semibold text-white' }, t('homeTitle')),
          H('p', { class: 'text-sm text-slate-400' }, `${t('forGrade')(courseName(p.course), grade())} · ${pos.unit < 0 ? t('homeAll') : t('homeDesc')(pos.unit + 1, pos.units.length)}`)),
        ico('chevron-right', 'icon text-slate-500')),
      H('div', { class: 'flex items-center gap-2' },
        H('div', { class: 'h-2.5 flex-1 overflow-hidden rounded-full bg-night-700' }, H('div', { class: 'h-full rounded-full bg-amber-400', style: `width:${Math.min(100, (x / DAILY_GOAL) * 100)}%` })),
        H('span', { class: 'shrink-0 text-xs tabular-nums text-slate-400' }, x >= DAILY_GOAL ? t('goalDone') : t('today')(x))));
  }

  // The big green card at the top of the home screen: the path, today's XP ring and "continue".
  function heroCard() {
    const p = P();
    const pos = position(p.course);
    const x = todayXp();
    const len = 2 * Math.PI * 38;
    const ring = H('span', { class: 'relative block h-[92px] w-[92px] shrink-0' });
    ring.innerHTML = `<svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label="${t('heroRing')(x)}">` +
      '<circle cx="46" cy="46" r="38" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="9"/>' +
      `<circle cx="46" cy="46" r="38" fill="none" stroke="var(--color-mint)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(Math.min(1, x / DAILY_GOAL) * len).toFixed(1)} ${len.toFixed(1)}" transform="rotate(-90 46 46)"/></svg>`;
    ring.append(H('span', { class: 'absolute inset-0 flex flex-col items-center justify-center' },
      H('span', { class: 'text-xl font-bold tabular-nums' }, String(x)),
      H('span', { class: 'text-[11px] text-onfill/80' }, t('heroOf'))));
    return H('button', { type: 'button', class: 'flex w-full items-center gap-4 rounded-[28px] bg-brand-500 p-5 text-left text-onfill shadow-lg shadow-brand-500/30 transition hover:bg-brand-400 active:scale-[.99]', onclick: open },
      H('span', { class: 'flex min-w-0 flex-1 flex-col items-start gap-2' },
        H('span', { class: 'rounded-full bg-onfill/15 px-2.5 py-1 text-[11px] font-semibold' }, N.hasAccess() ? t('lessonsNoAi') : pos.unit === 0 && pos.lesson === 0 ? t('heroFree') : t('heroPaid')),
        H('span', { class: 'text-[22px] font-bold leading-tight tracking-tight' }, t('homeTitle')),
        H('span', { class: 'text-sm text-onfill/80' }, `${t('forGrade')(courseName(p.course), grade())} · ${pos.unit < 0 ? t('homeAll') : t('heroUnit')(pos.unit + 1, pos.units.length)}`),
        H('span', { class: 'mt-1.5 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-onfill px-4 text-sm font-semibold text-brand-600' }, t('heroGo'), ico('chevron-right', 'h-4 w-4'))),
      ring);
  }

  window.NimiPath = { open, homeCard, heroCard };
})();
