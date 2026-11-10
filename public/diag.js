// Knowledge check and the smart plan, no AI.
// 1. The student picks a grade and a subject and takes a check of about 15 questions. The check is
//    THE SAME for every student of that grade and subject: the questions come from the banks
//    (quest.js, path-subjects.js, path-words.js) with a fixed seed, so nothing is random.
// 2. The knowledge map: every topic of the check is "knows" / "almost" / "gap".
// 3. The plan for today on the home screen: short practices on the weak topics and a question
//    to the teacher. A good practice lifts the topic one step: gap -> almost -> knows.
// Saved under the "diag" key of the student's data; the parent sees the same map.
// The check and the map are free; practices need a subscription after the first one.
(() => {
  const N = window.Nimi;
  const K = () => window.NimiLearn.kit;
  const bank = () => window.NimiQuest.bank;
  const SUBJ = () => window.NimiPathSubjects || {};
  const W = () => window.NimiPathWords;
  const siteLang = () => (N.lang === 'uz' ? 'uz' : 'ru');
  const tr = (ru, uz) => (N.lang === 'uz' ? uz : ru);
  const pick2 = (v) => (Array.isArray(v) ? v[N.lang === 'uz' ? 1 : 0] : v);

  const T = {
    ru: {
      title: 'Проверка знаний',
      promoTitle: 'Проверка знаний',
      promoText: '10 минут — и Nimi покажет, какие темы ты знаешь отлично, а какие стоит подтянуть. Потом составит план на каждый день.',
      promoGo: 'Начать проверку',
      free: 'Бесплатно',
      introLead: 'Выбери класс и предмет. Nimi задаст вопросы по темам этого класса и покажет твою карту знаний.',
      grade: 'Класс',
      subject: 'Предмет',
      moreLangs: 'Другие языки',
      info: (n) => `${n} ${n % 10 >= 2 && n % 10 <= 4 && (n < 10 || n > 20) ? 'вопроса' : 'вопросов'} · около ${Math.max(5, Math.round(n * 0.6))} минут`,
      same: 'Тест одинаковый для всех учеников этого класса.',
      noHurry: 'Не торопись. Если не знаешь ответ — нажми «Не знаю», это не ошибка, так Nimi точнее поймёт, чему тебя научить.',
      start: 'Начать проверку',
      again: 'Пройти ещё раз',
      resume: (i, n) => `Продолжить · вопрос ${i} из ${n}`,
      openMap: 'Открыть карту знаний',
      mine: 'Мои проверки',
      notYet: (name, g) => `«${name}» в ${g} классе пока не проходят — выбери другой предмет.`,
      qOf: (i, n) => `Вопрос ${i} из ${n}`,
      next: 'Дальше',
      finish: 'Закончить',
      dontKnow: 'Не знаю',
      quit: 'Выйти из теста',
      mapTitle: 'Карта знаний',
      done: 'Проверка пройдена!',
      score: (a, b) => `${a} из ${b}`,
      scoreLabel: 'верных ответов',
      st: { good: 'Знаешь отлично', mid: 'Почти знаешь', gap: 'Стоит подтянуть' },
      stShort: { good: 'Знаешь', mid: 'Почти', gap: 'Подтянуть' },
      sumAll: 'Отлично! По всем темам проверки у тебя крепкие знания.',
      sumGaps: (g, m) => `Nimi нашёл, что подтянуть: ${[g ? `${g} ${plural(g, 'тема', 'темы', 'тем')} — пробел` : '', m ? `${m} — почти` : ''].filter(Boolean).join(', ')}. Это нормально — теперь понятно, чем заняться.`,
      toPlan: 'Смотреть мой план',
      startGap: (name) => `Начать: «${name}»`,
      mistakes: 'Разбор ошибок',
      noMistakes: 'Ошибок нет — отличная работа!',
      yours: 'Твой ответ',
      skipped: 'не знаю',
      right: 'Верно',
      other: 'Другой предмет или класс',
      checked: (d) => `Проверка ${d}`,
      was: (a, b) => `Пробелов было ${a}, осталось ${b}`,
      wasNone: 'Пробелов не было',
      planTitle: 'План на сегодня',
      planSub: (name, g) => `${name} · ${g} класс`,
      stepClose: (name) => `Закрыть пробел: ${name}`,
      stepRepeat: (name) => `Повторить: ${name}`,
      stepSub: '6 вопросов · 5 минут',
      stepAsk: 'Спросить учителя',
      stepAskSub: (name) => `Объяснение темы «${name}»`,
      stepPath: 'Урок в Пути знаний',
      stepPathSub: 'Новая тема · 5 минут',
      planDone: 'План на сегодня выполнен! Возвращайся завтра.',
      planProgress: (a, b) => `${a} из ${b}`,
      allClosed: 'Все темы этой проверки ты знаешь. Проверь другой предмет или следующий класс.',
      gapsLeft: (g, m) => (g ? `пробелов: ${g}` : m ? `повторить: ${m}` : 'пробелов нет'),
      lockNote: 'с подпиской',
      firstFree: 'первое занятие бесплатно',
      askText: (topic, subj, g) => `Объясни мне тему «${topic}» (${subj}, ${g} класс) простыми словами и дай 2 примера.`,
      pracTitle: 'Занятие по теме',
      remember: 'Вспомни',
      example: 'Пример',
      words: 'Слова',
      go: 'Начать',
      check: 'Проверить',
      correct: ['Верно!', 'Отлично!', 'Молодец!', 'Так держать!'],
      wrong: 'Пока не так',
      answerIs: 'Правильный ответ:',
      pracDone: 'Занятие закончено',
      up: { mid: 'Пробел закрывается: тема стала «Почти знаешь». Ещё одно такое занятие — и она твоя!', good: 'Тема закрыта: теперь ты её знаешь!' },
      keep: 'Тема ещё не далась — это нормально. Попробуй ещё раз или спроси учителя.',
      already: 'Ты знаешь эту тему отлично.',
      need: 'Чтобы тема поднялась на ступень, нужно 5 верных ответов из 6.',
      retry: 'Ещё раз',
      toHome: 'На главную',
      askTeacher: 'Спросить учителя',
      feature: 'План занятий',
      fill: 'Вставь пропущенное слово',
      howTr: (w) => `Как переводится слово **${w}**?`,
      howEn: (w) => `Как по-английски «${w}»?`,
      howIn: (lang, w) => `Как на ${lang} «${w}»?`,
      whatMeans: (w) => `Что значит **${w}**?`,
      wordsOf: (list) => `Слова: ${list}…`,
      parentTitle: 'Карта знаний',
      parentNone: 'Ребёнок ещё не проходил проверку знаний. Она есть на главном экране и занимает 10 минут.',
      parentLine: (d, a, b) => `Проверка ${d}: ${a} из ${b} верно`,
      practices: (n) => `Занятий по слабым темам: ${n}`,
      langIn: { en: 'английском', es: 'испанском', fr: 'французском', de: 'немецком', it: 'итальянском', pt: 'португальском', nl: 'нидерландском', pl: 'польском', sv: 'шведском', tr: 'турецком', zh: 'китайском', ja: 'японском', ko: 'корейском', ar: 'арабском', hi: 'хинди', uz: 'узбекском', ru: 'русском' },
    },
    uz: {
      title: 'Bilimni tekshirish',
      promoTitle: 'Bilimni tekshirish',
      promoText: "10 daqiqa — va Nimi qaysi mavzularni a'lo bilishingni, qaysilarini mustahkamlash kerakligini ko'rsatadi. Keyin har kunga reja tuzadi.",
      promoGo: 'Tekshirishni boshlash',
      free: 'Bepul',
      introLead: "Sinf va fanni tanla. Nimi shu sinf mavzulari bo'yicha savol beradi va bilim xaritangni ko'rsatadi.",
      grade: 'Sinf',
      subject: 'Fan',
      moreLangs: 'Boshqa tillar',
      info: (n) => `${n} ta savol · taxminan ${Math.max(5, Math.round(n * 0.6))} daqiqa`,
      same: "Test shu sinfning barcha o'quvchilari uchun bir xil.",
      noHurry: "Shoshilma. Javobni bilmasang — «Bilmayman» tugmasini bos, bu xato emas, shunda Nimi senga nimani o'rgatishni aniqroq biladi.",
      start: 'Tekshirishni boshlash',
      again: 'Qayta topshirish',
      resume: (i, n) => `Davom etish · ${n} tadan ${i}-savol`,
      openMap: 'Bilim xaritasini ochish',
      mine: 'Mening tekshiruvlarim',
      notYet: (name, g) => `«${name}» ${g}-sinfda hali o'tilmaydi — boshqa fanni tanla.`,
      qOf: (i, n) => `${n} tadan ${i}-savol`,
      next: 'Keyingi',
      finish: 'Tugatish',
      dontKnow: 'Bilmayman',
      quit: 'Testdan chiqish',
      mapTitle: 'Bilim xaritasi',
      done: "Tekshiruv o'tildi!",
      score: (a, b) => `${b} tadan ${a}`,
      scoreLabel: "to'g'ri javob",
      st: { good: "A'lo bilasan", mid: 'Deyarli bilasan', gap: 'Mustahkamlash kerak' },
      stShort: { good: 'Bilasan', mid: 'Deyarli', gap: 'Mustahkamla' },
      sumAll: "Zo'r! Tekshiruvdagi barcha mavzular bo'yicha biliming mustahkam.",
      sumGaps: (g, m) => `Nimi nimani mustahkamlash kerakligini topdi: ${[g ? `${g} ta mavzu — bo'shliq` : '', m ? `${m} tasi — deyarli` : ''].filter(Boolean).join(', ')}. Bu normal — endi nima bilan shug'ullanish aniq.`,
      toPlan: "Rejamni ko'rish",
      startGap: (name) => `Boshlash: «${name}»`,
      mistakes: 'Xatolar tahlili',
      noMistakes: "Xato yo'q — ajoyib!",
      yours: 'Sening javobing',
      skipped: 'bilmayman',
      right: "To'g'ri",
      other: 'Boshqa fan yoki sinf',
      checked: (d) => `Tekshiruv ${d}`,
      was: (a, b) => `Bo'shliqlar ${a} ta edi, ${b} ta qoldi`,
      wasNone: "Bo'shliq yo'q edi",
      planTitle: 'Bugungi reja',
      planSub: (name, g) => `${name} · ${g}-sinf`,
      stepClose: (name) => `Bo'shliqni yopish: ${name}`,
      stepRepeat: (name) => `Takrorlash: ${name}`,
      stepSub: '6 ta savol · 5 daqiqa',
      stepAsk: "O'qituvchidan so'rash",
      stepAskSub: (name) => `«${name}» mavzusi tushuntirishi`,
      stepPath: "Bilim yo'lidagi dars",
      stepPathSub: 'Yangi mavzu · 5 daqiqa',
      planDone: 'Bugungi reja bajarildi! Ertaga qaytib kel.',
      planProgress: (a, b) => `${b} tadan ${a}`,
      allClosed: "Bu tekshiruvdagi barcha mavzularni bilasan. Boshqa fanni yoki keyingi sinfni tekshir.",
      gapsLeft: (g, m) => (g ? `bo'shliqlar: ${g}` : m ? `takrorlash: ${m}` : "bo'shliq yo'q"),
      lockNote: 'obuna bilan',
      firstFree: "birinchi mashg'ulot bepul",
      askText: (topic, subj, g) => `Menga «${topic}» mavzusini (${subj}, ${g}-sinf) sodda so'zlar bilan tushuntir va 2 ta misol ber.`,
      pracTitle: "Mavzu bo'yicha mashg'ulot",
      remember: 'Eslab ol',
      example: 'Misol',
      words: "So'zlar",
      go: 'Boshlash',
      check: 'Tekshirish',
      correct: ["To'g'ri!", "Zo'r!", 'Barakalla!', 'Shunday davom et!'],
      wrong: 'Hozircha unday emas',
      answerIs: "To'g'ri javob:",
      pracDone: "Mashg'ulot tugadi",
      up: { mid: "Bo'shliq yopilmoqda: mavzu «Deyarli bilasan» bo'ldi. Yana bitta shunday mashg'ulot — va u seniki!", good: 'Mavzu yopildi: endi uni bilasan!' },
      keep: "Mavzu hali o'zlashmadi — bu normal. Yana urinib ko'r yoki o'qituvchidan so'ra.",
      already: "Bu mavzuni a'lo bilasan.",
      need: "Mavzu bir pog'ona ko'tarilishi uchun 6 tadan 5 ta to'g'ri javob kerak.",
      retry: 'Yana bir bor',
      toHome: 'Bosh sahifaga',
      askTeacher: "O'qituvchidan so'rash",
      feature: "Mashg'ulotlar rejasi",
      fill: "Tushib qolgan so'zni qo'y",
      howTr: (w) => `**${w}** so'zi qanday tarjima qilinadi?`,
      howEn: (w) => `«${w}» inglizcha qanday bo'ladi?`,
      howIn: (lang, w) => `«${w}» ${lang} qanday bo'ladi?`,
      whatMeans: (w) => `**${w}** nimani anglatadi?`,
      wordsOf: (list) => `So'zlar: ${list}…`,
      parentTitle: 'Bilim xaritasi',
      parentNone: "Farzandingiz hali bilim tekshiruvidan o'tmagan. U bosh sahifada, 10 daqiqa vaqt oladi.",
      parentLine: (d, a, b) => `Tekshiruv ${d}: ${b} tadan ${a} tasi to'g'ri`,
      practices: (n) => `Zaif mavzular bo'yicha mashg'ulotlar: ${n}`,
      langIn: { en: 'inglizcha', es: 'ispancha', fr: 'fransuzcha', de: 'nemischa', it: 'italyancha', pt: 'portugalcha', nl: 'gollandcha', pl: 'polyakcha', sv: 'shvedcha', tr: 'turkcha', zh: 'xitoycha', ja: 'yaponcha', ko: 'koreyscha', ar: 'arabcha', hi: 'hindcha', uz: "o'zbekcha", ru: 'ruscha' },
    },
  };
  const t = (k) => T[siteLang()][k];
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  // ---------- the same "random" for everyone ----------
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry(a) {
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Runs fn with Math.random fixed by the seed: the generators of quest.js give the same questions.
  function seeded(seed, fn) {
    const real = Math.random;
    Math.random = mulberry(hash(seed));
    try { return fn(); } finally { Math.random = real; }
  }
  const shuffle = (a) => bank().shuffle(a);
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
  // n items spread evenly over the list (first and last included), order kept.
  function spread(list, n) {
    if (list.length <= n) return list.slice();
    if (n === 1) return [list[0]];
    return Array.from({ length: n }, (_, i) => list[Math.round((i * (list.length - 1)) / (n - 1))]);
  }

  // ---------- which bank a subject uses ----------
  const LANG_CODE = { english: 'en', russian: 'ru', uzbek: 'uz', spanish: 'es', french: 'fr', german: 'de', chinese: 'zh', japanese: 'ja', korean: 'ko', arabic: 'ar', turkish: 'tr', italian: 'it', portuguese: 'pt', hindi: 'hi', dutch: 'nl', polish: 'pl', swedish: 'sv' };
  function kindOf(subject) {
    if (subject === 'math') return 'math';
    const sj = SUBJ()[subject];
    if (sj && (!sj.lang || sj.lang === siteLang())) return 'quiz';
    if (subject === 'english') return 'english';
    const code = LANG_CODE[subject];
    return code && code !== siteLang() && W().langs.includes(code) ? 'vocab' : null;
  }

  // Names of the English grammar groups (GRAMMAR in quest.js, four sentences each, in order).
  const GRAMMAR_NAMES = {
    '2:0': ['Времена и глагол to be', "Zamonlar va to be fe'li"],
    '2:1': ['Артикли, there is / are, сравнение', 'Artikllar, there is / are, qiyoslash'],
    '2:2': ['Present Simple: вопросы и отрицания, can', "Present Simple: so'roq va inkor, can"],
    '2:3': ['Местоимения, many / much, предлоги', "Olmoshlar, many / much, predloglar"],
    '3:0': ['Perfect, условные предложения, пассив', "Perfect, shart gaplar, majhul nisbat"],
    '3:1': ['Косвенная речь, who / which, should', "Ko'chirma gap, who / which, should"],
  };
  const sixes = (list) => { const c = chunk(list, 6); if (c.length > 1 && c[c.length - 1].length < 4) c[c.length - 2].push(...c.pop()); return c; };
  const wordGroups = (band) => sixes(bank().WORDS.filter((w) => w[3] === band)).map((ws, i) => ({
    id: `w:${band}:${i}`, kind: 'words', words: ws, band, name: () => t('wordsOf')(ws.slice(0, 3).map((w) => w[0]).join(', ')),
  }));
  const grammarGroups = (lvl) => chunk(bank().GRAMMAR.filter((g) => g[0] === lvl), 4).map((items, i) => ({
    id: `g:${lvl}:${i}`, kind: 'grammar', items, lvl, name: () => pick2(GRAMMAR_NAMES[`${lvl}:${i}`] || [`Грамматика ${i + 1}`, `Grammatika ${i + 1}`]),
  }));
  function vocabThemes(code) {
    const { langs, themes } = W();
    const i = langs.indexOf(code);
    return themes.map((th) => ({
      id: `v:${th.id}`, kind: 'vocab', code,
      entries: th.words.map((w) => {
        const [script, rom] = String(w[i]).split('|');
        return { t: rom ? `${script} (${rom})` : script, n: N.lang === 'uz' ? w[1] : w[0] };
      }),
      name: () => th[siteLang()],
    }));
  }

  // Every topic that can be in the check of this subject and grade: { now, past }.
  function topicPool(subject, grade) {
    const kind = kindOf(subject);
    const g = Number(grade);
    if (kind === 'math') {
      const wrap = (tp) => ({ id: tp.id, kind: 'math', src: tp, grade: g, name: () => pick2(tp.name) });
      const all = bank().MATH;
      return { now: all.filter((tp) => tp.g[0] <= g && g <= tp.g[1]).map(wrap), past: all.filter((tp) => tp.g[1] < g).sort((a, b) => b.g[1] - a.g[1]).map(wrap) };
    }
    if (kind === 'quiz') {
      const sj = SUBJ()[subject];
      const wrap = (tp) => ({ id: tp.id, kind: 'quiz', src: tp, mono: !!sj.lang, name: () => pick2(tp.name) });
      return { now: sj.topics.filter((tp) => tp.g[0] <= g && g <= tp.g[1]).map(wrap), past: sj.topics.filter((tp) => tp.g[1] < g).sort((a, b) => b.g[1] - a.g[1]).map(wrap) };
    }
    if (kind === 'english') {
      const band = bank().enBand(g), lvl = bank().enLevel(g);
      const words = wordGroups(band);
      if (lvl < 2) return { now: spread(words, 4), past: [] };
      const own = grammarGroups(lvl);
      return lvl === 2
        ? { now: [...spread(words, 3), ...spread(own, 2)], past: [] }
        : { now: [...spread(words, 2), ...own.slice(0, 2)], past: grammarGroups(2).slice(0, 1) };
    }
    if (kind === 'vocab') return { now: spread(vocabThemes(LANG_CODE[subject]), 5), past: [] };
    return { now: [], past: [] };
  }
  // Up to 5 topics: mostly this grade, one of the grade before (to catch old gaps).
  function checkTopics(subject, grade) {
    const { now, past } = topicPool(subject, grade);
    if (!now.length) return [];
    const out = spread(now, past.length ? 4 : 5);
    for (const tp of past) if (out.length < 5) out.push(tp);
    for (const tp of now) if (out.length < 5 && !out.includes(tp)) out.push(tp);
    return out;
  }
  const perTopic = (count) => (count >= 5 ? 3 : count === 4 ? 4 : count === 3 ? 5 : 6);
  // A check needs at least two topics to say anything about gaps.
  const available = (subject, grade) => checkTopics(subject, grade).length >= 2;
  function findTopic(subject, grade, id) {
    const { now, past } = topicPool(subject, grade);
    const hit = [...now, ...past].find((tp) => tp.id === id);
    if (hit) return hit;
    // English: a group outside the ones chosen for the check (kept for old results).
    if (kindOf(subject) === 'english') return [...wordGroups(bank().enBand(Number(grade))), ...grammarGroups(2), ...grammarGroups(3)].find((tp) => tp.id === id) || null;
    if (kindOf(subject) === 'vocab') return vocabThemes(LANG_CODE[subject]).find((tp) => tp.id === id) || null;
    return null;
  }

  // ---------- questions of a topic: { q, a, opts, rule, explain } ----------
  function questions(tp, n, subject) {
    if (tp.kind === 'math') {
      const out = [];
      for (let tries = 0; out.length < n && tries < 60; tries++) {
        const q = tp.src.gen(tp.grade, false);
        if (q && q.opts && !out.some((x) => x.q === q.q)) out.push({ q: q.q, a: q.a, opts: q.opts, rule: q.rule, explain: q.explain });
      }
      return out;
    }
    if (tp.kind === 'quiz') {
      const uz = N.lang === 'uz';
      return shuffle(tp.src.qs.slice()).slice(0, n).map((raw) => {
        const it = tp.mono ? { q: raw[0], opts: raw[1], why: raw[2] } : { q: raw[uz ? 1 : 0], opts: raw[uz ? 3 : 2], why: raw[uz ? 5 : 4] };
        return { q: it.q, a: it.opts[0], opts: shuffle(it.opts.slice()), rule: pick2(tp.src.rule), explain: it.why };
      });
    }
    if (tp.kind === 'words') {
      const native = (w) => (N.lang === 'uz' ? w[2] : w[1]);
      const pool = bank().WORDS.filter((w) => w[3] === tp.band);
      return shuffle(tp.words.slice()).slice(0, n).map((w, i) => {
        const others = [];
        for (const x of shuffle(pool)) if (others.length < 3 && x !== w && native(x) !== native(w) && !others.some((o) => native(o) === native(x))) others.push(x);
        const explain = `**${w[0]}** — ${native(w)}. ${t('example')}: ${w[4]}`;
        return i % 2 === 0
          ? { q: t('howTr')(w[0]), a: native(w), opts: shuffle([native(w), ...others.map(native)]), explain }
          : { q: t('howEn')(native(w)), a: w[0], opts: shuffle([w[0], ...others.map((x) => x[0])]), explain };
      });
    }
    if (tp.kind === 'grammar') {
      let items = shuffle(tp.items.slice());
      if (items.length < n) items = [...items, ...shuffle(bank().GRAMMAR.filter((g) => g[0] === tp.lvl && !tp.items.includes(g)))];
      return items.slice(0, n).map(([, s, right, wrong, ru, uz]) => ({
        q: `${t('fill')}:\n**${s}**`, a: right, opts: shuffle([right, ...wrong]), rule: tr(ru, uz), explain: `**${s.replace('___', right)}**`,
      }));
    }
    // vocab: a theme of another language
    const all = vocabThemes(tp.code).flatMap((th) => th.entries);
    const langIn = t('langIn')[LANG_CODE[subject]] || '';
    return shuffle(tp.entries.slice()).slice(0, n).map((e, i) => {
      const others = [];
      for (const x of shuffle(all)) if (others.length < 3 && x.t !== e.t && x.n !== e.n && !others.some((o) => o.t === x.t || o.n === x.n)) others.push(x);
      return i % 2 === 0
        ? { q: t('howIn')(langIn, e.n), a: e.t, opts: shuffle([e.t, ...others.map((x) => x.t)]), explain: `**${e.t}** — ${e.n}` }
        : { q: t('whatMeans')(e.t), a: e.n, opts: shuffle([e.n, ...others.map((x) => x.n)]), explain: `**${e.t}** — ${e.n}` };
    });
  }
  // The fixed check: the same topics, questions and order of options for everyone.
  function buildCheck(subject, grade) {
    const topics = checkTopics(subject, grade);
    const n = perTopic(topics.length);
    const out = [];
    topics.forEach((tp) => {
      const qs = seeded(`nimi-check|${subject}|${grade}|${tp.id}`, () => questions(tp, n, subject));
      qs.forEach((q) => out.push({ ...q, topic: tp.id }));
    });
    return { topics, list: out };
  }

  // ---------- saved state ----------
  function D() {
    const d = K().data;
    if (!d.diag || typeof d.diag !== 'object' || Array.isArray(d.diag)) d.diag = {};
    const s = d.diag;
    if (!s.tests || typeof s.tests !== 'object') s.tests = {};
    return s;
  }
  const save = () => K().save('diag');
  const keyOf = (subject, grade) => `${subject}|${grade}`;
  const statusOf = (ok, total) => (total && ok / total >= 0.8 ? 'good' : total && ok / total >= 0.5 ? 'mid' : 'gap');
  const count = (test, field, st) => test.topics.filter((x) => x[field] === st).length;
  const activeTest = () => { const s = D(); return s.active && s.tests[s.active] ? s.tests[s.active] : null; };
  const topicName = (test, id) => findTopic(test.subject, test.grade, id)?.name() || id;
  const dateStr = (iso) => new Date(iso).toLocaleDateString(N.lang === 'uz' ? 'uz-UZ' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  // Practices need a subscription after the first one (like the lessons of the learning path).
  const locked = () => !N.hasAccess() && !!D().freeUsed;

  // ---------- small UI pieces ----------
  const H = (...a) => K().h(...a);
  const ico = (...a) => K().ico(...a);
  const html = (tag, cls, text) => { const el = H(tag, { class: cls }); el.innerHTML = N.formatReply(String(text ?? '')); return el; };
  const DOT = { good: 'bg-emerald-400', mid: 'bg-amber-400', gap: 'bg-rose-400' };
  const TONE = { good: 'text-emerald-300', mid: 'text-amber-200', gap: 'text-rose-200' };
  const chip = (on) => `min-h-11 rounded-2xl px-3.5 text-[15px] font-semibold ring-1 transition active:scale-[.97] ${on ? 'bg-brand-500 text-onfill ring-brand-500' : 'bg-night-800 text-slate-200 ring-white/10 hover:bg-night-700'}`;
  const goHome = () => N.showScreen('home');
  function progressBar(root, pct, onQuit, label) {
    root.append(H('div', { class: 'flex items-center gap-3' },
      H('button', { type: 'button', class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-slate-300 ring-1 ring-white/5 hover:bg-night-700', 'aria-label': label, onclick: onQuit }, ico('x')),
      H('div', { class: 'h-4 flex-1 overflow-hidden rounded-full bg-night-700', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct) },
        H('div', { class: 'h-full rounded-full bg-brand-500 transition-all duration-500', style: `width:${pct}%` }))));
  }
  const OPT = 'min-h-14 rounded-2xl border-b-4 border-night-700 bg-night-800 px-4 py-3 text-left text-lg text-slate-100 ring-1 ring-white/10 transition active:translate-y-0.5';
  const PICKED = ['ring-2!', 'ring-brand-400!', 'bg-brand-500/15!'];
  function optionList(q, onPick) {
    const box = H('div', { class: 'flex flex-col gap-2' });
    const buttons = q.opts.map((o) => {
      const b = H('button', { type: 'button', class: OPT });
      b.innerHTML = N.formatReply(String(o));
      b.onclick = () => {
        buttons.forEach(([x]) => x.classList.remove(...PICKED));
        b.classList.add(...PICKED);
        onPick(o);
      };
      box.append(b);
      return [b, o];
    });
    return { box, buttons };
  }

  // ---------- 1. choose the grade and the subject ----------
  let running = null; // the check in progress: { subject, grade, check, i, answers }
  let chosen = null; // { subject, grade } on the intro screen
  function open(subject, grade) {
    const k = K();
    const s = D();
    if (!chosen) {
      const last = activeTest();
      chosen = { grade: Number(N.setup?.grade) || last?.grade || 5, subject: N.setup?.subject || last?.subject || 'math' };
    }
    if (subject) chosen.subject = subject;
    if (grade) chosen.grade = Number(grade);
    if (!available(chosen.subject, chosen.grade)) chosen.subject = 'math';
    const root = k.screen('activity');
    root.append(k.titleBar(t('title'), goHome));
    root.append(H('p', { class: 'text-slate-300' }, t('introLead')));

    root.append(H('div', { class: `${k.CARD} flex flex-col gap-3` },
      H('p', { class: 'font-semibold text-white' }, t('grade')),
      H('div', { class: 'grid grid-cols-6 gap-2', role: 'group', 'aria-label': t('grade') },
        Array.from({ length: 11 }, (_, i) => i + 1).map((g) => H('button', {
          type: 'button', 'aria-pressed': String(g === chosen.grade), class: `${chip(g === chosen.grade)} px-0! tabular-nums`, onclick: () => open(null, g),
        }, String(g))))));

    const all = N.SUBJECTS.map((x) => x[0]);
    const isMore = (key) => kindOf(key) === 'vocab';
    const can = all.filter((key) => available(key, chosen.grade));
    const main = can.filter((key) => !isMore(key));
    const more = can.filter(isMore);
    const subjBtn = (key) => H('button', { type: 'button', 'aria-pressed': String(key === chosen.subject), class: chip(key === chosen.subject), onclick: () => open(key) }, N.subjectName(key));
    const moreOpen = more.includes(chosen.subject) || open.more;
    const subjBox = H('div', { class: `${k.CARD} flex flex-col gap-3` },
      H('p', { class: 'font-semibold text-white' }, t('subject')),
      H('div', { class: 'flex flex-wrap gap-2', role: 'group', 'aria-label': t('subject') }, main.map(subjBtn)));
    if (more.length) {
      subjBox.append(moreOpen
        ? H('div', { class: 'flex flex-wrap gap-2', role: 'group', 'aria-label': t('moreLangs') }, more.map(subjBtn))
        : H('button', { type: 'button', class: 'flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-brand-400', onclick: () => { open.more = true; open(); } }, ico('languages', 'h-4 w-4'), t('moreLangs')));
    }
    root.append(subjBox);

    const check = buildCheck(chosen.subject, chosen.grade);
    const key = keyOf(chosen.subject, chosen.grade);
    const prev = s.tests[key];
    const mine = running && running.subject === chosen.subject && running.grade === chosen.grade && running.i < running.check.list.length;
    root.append(H('div', { class: 'flex flex-col gap-2 rounded-3xl bg-night-800 p-4 text-sm text-slate-300' },
      H('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('clock', 'h-4 w-4'), t('info')(check.list.length)),
      H('p', { class: 'flex items-start gap-2' }, ico('users', 'h-4 w-4 mt-0.5'), t('same')),
      H('p', { class: 'flex items-start gap-2' }, ico('heart', 'h-4 w-4 mt-0.5'), t('noHurry'))));
    if (mine) root.append(H('button', { type: 'button', class: k.BTN, onclick: () => ask() }, ico('play'), t('resume')(running.i + 1, running.check.list.length)));
    root.append(H('button', { type: 'button', class: mine ? k.BTN2 : k.BTN, onclick: () => start(chosen.subject, chosen.grade) }, mine ? null : ico('play'), prev || mine ? t('again') : t('start')));
    if (prev) root.append(H('button', { type: 'button', class: k.BTN2, onclick: () => showMap(key) }, ico('map'), t('openMap')));

    const tests = Object.entries(s.tests).sort((a, b) => String(b[1].date).localeCompare(String(a[1].date)));
    if (tests.length) {
      root.append(H('p', { class: 'mt-2 font-semibold text-white' }, t('mine')));
      tests.forEach(([tk, test]) => root.append(H('button', { type: 'button', class: `${k.CARD} flex items-center gap-3 text-left transition hover:bg-night-800 active:scale-[.99]`, onclick: () => showMap(tk) },
        H('span', { class: 'min-w-0 flex-1' },
          H('span', { class: 'block font-semibold text-white' }, t('planSub')(N.subjectName(test.subject), test.grade)),
          H('span', { class: 'block text-sm text-slate-400' }, `${t('checked')(dateStr(test.date))} · ${t('score')(test.score, test.total)}`)),
        H('span', { class: 'flex shrink-0 gap-1' }, test.topics.map((x) => H('span', { class: `h-2.5 w-2.5 rounded-full ${DOT[x.st]}` }))),
        ico('chevron-right', 'icon text-slate-500'))));
    }
  }

  // ---------- 2. the check itself: no hints, no right / wrong until the end ----------
  function start(subject, grade) {
    running = { subject, grade: Number(grade), check: buildCheck(subject, grade), i: 0, answers: [] };
    ask();
  }
  function ask() {
    const k = K();
    const st = running;
    const total = st.check.list.length;
    const q = st.check.list[st.i];
    const root = k.screen('activity');
    progressBar(root, Math.round((st.i / total) * 100), () => open(), t('quit'));
    root.append(H('p', { class: 'text-sm text-slate-400' }, `${t('qOf')(st.i + 1, total)} · ${t('planSub')(N.subjectName(st.subject), st.grade)}`));
    root.append(html('div', 'whitespace-pre-line text-xl font-semibold leading-snug text-white', q.q));
    let picked = null;
    const last = st.i === total - 1;
    const nextBtn = H('button', { type: 'button', class: k.BTN, disabled: true }, last ? t('finish') : t('next'));
    const { box } = optionList(q, (o) => { picked = o; nextBtn.disabled = false; });
    const answer = (given) => {
      st.answers[st.i] = given;
      st.i++;
      if (st.i >= total) finishCheck(); else ask();
    };
    nextBtn.onclick = () => answer(picked);
    root.append(box, nextBtn,
      H('button', { type: 'button', class: 'min-h-11 self-center px-4 text-[15px] font-medium text-slate-400 hover:text-white', onclick: () => answer(null) }, t('dontKnow')));
  }
  function finishCheck() {
    const st = running;
    const s = D();
    const key = keyOf(st.subject, st.grade);
    const old = s.tests[key];
    const topics = st.check.topics.map((tp) => {
      const idx = st.check.list.map((q, i) => (q.topic === tp.id ? i : -1)).filter((i) => i >= 0);
      const ok = idx.filter((i) => st.answers[i] === st.check.list[i].a).length;
      const status = statusOf(ok, idx.length);
      const before = old?.topics.find((x) => x.id === tp.id);
      return { id: tp.id, ok, total: idx.length, st: status, first: before?.first || status, practice: before?.practice || 0 };
    });
    const score = topics.reduce((a, x) => a + x.ok, 0);
    s.tests[key] = { subject: st.subject, grade: st.grade, date: new Date().toISOString(), firstDate: old?.firstDate || new Date().toISOString(), tries: (old?.tries || 0) + 1, score, total: st.check.list.length, topics };
    s.active = key;
    s.day = null;
    const stats = K().data.progress.stats;
    stats.tasks = (stats.tasks || 0) + st.check.list.length;
    stats.correct = (stats.correct || 0) + score;
    K().save('progress');
    K().markDay();
    save();
    const review = st.check.list.map((q, i) => ({ q, given: st.answers[i] })).filter((x) => x.given !== x.q.a);
    running = null;
    showMap(key, { fresh: true, review });
  }

  // ---------- 3. the knowledge map ----------
  function showMap(key, opts = {}) {
    const k = K();
    const s = D();
    const test = s.tests[key];
    if (!test) return open();
    if (s.active !== key) { s.active = key; s.day = null; save(); }
    const root = k.screen('activity');
    root.append(k.titleBar(t('mapTitle'), goHome));
    const gaps = count(test, 'st', 'gap'), mids = count(test, 'st', 'mid'), goods = count(test, 'st', 'good');
    const pct = Math.round((test.score / test.total) * 100);
    root.append(H('div', { class: 'flex flex-col gap-3 rounded-[28px] bg-brand-500 p-5 text-onfill shadow-lg shadow-brand-500/30' },
      H('span', { class: 'self-start rounded-full bg-onfill/15 px-2.5 py-1 text-[11px] font-semibold' }, opts.fresh ? t('done') : t('checked')(dateStr(test.date))),
      H('p', { class: 'text-[22px] font-bold leading-tight tracking-tight' }, t('planSub')(N.subjectName(test.subject), test.grade)),
      H('div', { class: 'flex items-end gap-2' },
        H('span', { class: 'text-4xl font-bold tabular-nums leading-none' }, t('score')(test.score, test.total)),
        H('span', { class: 'pb-0.5 text-sm text-onfill/80' }, `${t('scoreLabel')} · ${pct}%`))));

    const stat = (n, st) => H('div', { class: 'flex flex-col items-center gap-1 rounded-2xl bg-night-900/80 p-3 text-center ring-1 ring-white/5' },
      H('span', { class: `text-2xl font-bold tabular-nums ${TONE[st]}` }, String(n)),
      H('span', { class: 'text-xs text-slate-400' }, t('stShort')[st]));
    root.append(H('div', { class: 'grid grid-cols-3 gap-2' }, stat(goods, 'good'), stat(mids, 'mid'), stat(gaps, 'gap')));
    root.append(H('p', { class: 'text-slate-300' }, gaps || mids ? t('sumGaps')(gaps, mids) : t('sumAll')));

    const weak = weakTopics(test);
    const list = H('div', { class: `${k.CARD} flex flex-col gap-2` });
    test.topics.forEach((x) => {
      const row = H(x.st === 'good' ? 'div' : 'button', {
        ...(x.st === 'good' ? {} : { type: 'button', onclick: () => practice(key, x.id) }),
        class: `flex items-center gap-3 rounded-2xl bg-night-800 px-3.5 py-3 text-left ${x.st === 'good' ? '' : 'transition hover:bg-night-700 active:scale-[.99]'}`,
      },
      H('span', { class: `h-3 w-3 shrink-0 rounded-full ${DOT[x.st]}` }),
      H('span', { class: 'min-w-0 flex-1' },
        H('span', { class: 'block font-semibold text-white' }, topicName(test, x.id)),
        H('span', { class: `block text-sm ${TONE[x.st]}` }, t('st')[x.st])),
      H('span', { class: 'shrink-0 text-sm tabular-nums text-slate-400' }, `${x.ok}/${x.total}`),
      x.st === 'good' ? null : ico(locked() ? 'lock' : 'chevron-right', 'icon text-slate-500'));
      list.append(row);
    });
    root.append(list);

    if (weak.length) root.append(H('button', { type: 'button', class: k.BTN, onclick: () => practice(key, weak[0].id) }, ico(locked() ? 'lock' : 'play'), t('startGap')(topicName(test, weak[0].id))));
    root.append(H('button', { type: 'button', class: weak.length ? k.BTN2 : k.BTN, onclick: goHome }, ico('list-checks'), t('toPlan')));

    if (opts.review) {
      const box = H('details', { class: `${k.CARD} group` },
        H('summary', { class: 'flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 font-semibold text-white' }, `${t('mistakes')} · ${opts.review.length}`, ico('chevron-down', 'icon text-slate-400 transition group-open:rotate-180')));
      if (!opts.review.length) box.append(H('p', { class: 'mt-2 text-sm text-emerald-300' }, t('noMistakes')));
      opts.review.forEach(({ q, given }) => box.append(H('div', { class: 'mt-3 flex flex-col gap-1.5 border-t border-white/5 pt-3 text-sm' },
        html('div', 'whitespace-pre-line font-semibold text-white', q.q),
        html('div', 'text-rose-200', `${t('yours')}: ${given === null || given === undefined ? t('skipped') : given}`),
        html('div', 'text-emerald-300', `${t('right')}: ${q.a}`),
        q.explain ? html('div', 'text-slate-300', q.explain) : null,
        q.rule ? html('div', 'text-slate-400', q.rule) : null)));
      root.append(box);
    }
    root.append(H('div', { class: 'grid grid-cols-2 gap-2' },
      H('button', { type: 'button', class: k.BTN2, onclick: () => start(test.subject, test.grade) }, ico('repeat'), t('again')),
      H('button', { type: 'button', class: k.BTN2, onclick: () => { chosen = { subject: test.subject, grade: test.grade }; open(); } }, t('other'))));
  }

  // ---------- 4. the plan for today ----------
  // Weak topics, gaps first; inside a group the order of the check.
  const weakTopics = (test) => [...test.topics.filter((x) => x.st === 'gap'), ...test.topics.filter((x) => x.st === 'mid')];
  // The plan of the day is fixed when the day starts: two topics and a question to the teacher.
  function today() {
    const s = D();
    const test = activeTest();
    if (!test) return null;
    if (!s.day || s.day.date !== N.today() || s.day.key !== s.active) {
      s.day = { date: N.today(), key: s.active, ids: weakTopics(test).slice(0, 2).map((x) => x.id), done: [], asked: false };
      save();
    }
    return s.day;
  }
  function askTeacher(test, id) {
    if (!N.canUse('chat')) return window.NimiLearn.openSubscribe('chat');
    const day = today();
    if (day) { day.asked = true; save(); }
    N.askText(t('askText')(topicName(test, id), N.subjectName(test.subject), test.grade));
  }
  function homeCard() {
    const k = K();
    const test = activeTest();
    if (!test) {
      return H('button', { type: 'button', class: 'flex w-full flex-col items-start gap-3 rounded-[28px] bg-night-900/80 p-5 text-left ring-1 ring-brand-400/40 transition hover:bg-night-800 active:scale-[.99]', onclick: () => open() },
        H('span', { class: 'flex w-full items-center justify-between gap-3' },
          H('span', { class: 'flex h-12 w-12 items-center justify-center rounded-full bg-mint text-brand-600' }, ico('clipboard-check', 'h-[22px] w-[22px]')),
          H('span', { class: 'rounded-full bg-night-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-300' }, t('free'))),
        H('span', { class: 'text-[20px] font-bold leading-tight text-white' }, t('promoTitle')),
        H('span', { class: 'text-sm text-slate-400' }, t('promoText')),
        H('span', { class: 'mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-onfill' }, t('promoGo'), ico('chevron-right', 'h-4 w-4')));
    }
    const s = D();
    const day = today();
    const gaps = count(test, 'st', 'gap'), mids = count(test, 'st', 'mid');
    const card = H('div', { class: 'flex flex-col gap-3 rounded-[28px] bg-night-900/80 p-[18px] ring-1 ring-white/5' });
    const steps = [];
    day.ids.forEach((id) => {
      const x = test.topics.find((tp) => tp.id === id);
      if (!x) return;
      const name = topicName(test, id);
      steps.push({ done: day.done.includes(id), icon: 'target', title: (x.first === 'gap' && x.st !== 'good' ? t('stepClose') : t('stepRepeat'))(name), sub: t('stepSub'), lock: locked(), go: () => practice(s.active, id) });
    });
    if (day.ids.length) steps.push({ done: day.asked, icon: 'message-circle', title: t('stepAsk'), sub: t('stepAskSub')(topicName(test, day.ids[0])), go: () => askTeacher(test, day.ids[0]) });
    const doneN = steps.filter((x) => x.done).length;
    card.append(H('div', { class: 'flex items-center gap-3' },
      H('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-brand-600' }, ico('list-checks', 'h-[22px] w-[22px]')),
      H('div', { class: 'flex min-w-0 flex-1 flex-col gap-0.5' },
        H('span', { class: 'text-[17px] font-bold text-white' }, t('planTitle')),
        H('span', { class: 'text-[13px] leading-snug text-slate-400' }, `${t('planSub')(N.subjectName(test.subject), test.grade)} · ${t('gapsLeft')(gaps, mids)}`)),
      steps.length ? H('span', { class: `shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${doneN === steps.length ? 'bg-emerald-500/15 text-emerald-300' : 'bg-night-800 text-slate-300'}` }, t('planProgress')(doneN, steps.length)) : null));
    if (!steps.length) {
      card.append(H('p', { class: 'rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-100 ring-1 ring-emerald-400/30' }, t('allClosed')));
    } else {
      steps.forEach((x, i) => card.append(H('button', { type: 'button', class: 'flex min-h-14 items-center gap-3 rounded-2xl bg-night-800 px-3.5 py-2.5 text-left transition hover:bg-night-700 active:scale-[.99]', onclick: x.go },
        H('span', { class: `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${x.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-night-900 text-slate-300'}` }, x.done ? ico('check', 'h-4 w-4') : String(i + 1)),
        H('span', { class: 'flex min-w-0 flex-1 flex-col' },
          H('span', { class: `text-[15px] font-semibold ${x.done ? 'text-slate-400 line-through' : 'text-white'}` }, x.title),
          H('span', { class: 'text-xs text-slate-400' }, x.lock && !x.done ? `${x.sub} · ${t('lockNote')}` : !N.hasAccess() && !s.freeUsed && x.icon === 'target' && i === 0 ? `${x.sub} · ${t('firstFree')}` : x.sub)),
        ico(x.lock && !x.done ? 'lock' : 'chevron-right', 'icon text-slate-500'))));
      if (doneN === steps.length) card.append(H('p', { class: 'rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-100 ring-1 ring-emerald-400/30' }, t('planDone')));
    }
    card.append(H('div', { class: 'flex items-center justify-between gap-2 text-[13px]' },
      H('button', { type: 'button', class: 'flex min-h-10 items-center gap-1.5 font-semibold text-brand-400 hover:underline', onclick: () => showMap(s.active) }, ico('map', 'h-4 w-4'), t('mapTitle')),
      H('button', { type: 'button', class: 'min-h-10 font-semibold text-slate-400 hover:text-white', onclick: () => { chosen = null; open(); } }, t('other'))));
    return card;
  }
  // A new student is taken to the check once, right after choosing the subject and the grade.
  function offerOnce() {
    const s = D();
    const p = K().data.progress;
    if (s.offered || Object.keys(s.tests).length) return false;
    s.offered = true;
    save();
    if ((p.days || []).length || (p.stats?.tasks || 0) > 0) return false;
    setTimeout(() => open(), 0);
    return true;
  }

  // ---------- 5. a practice on a weak topic ----------
  function practice(key, id) {
    const k = K();
    const s = D();
    const test = s.tests[key];
    const x = test?.topics.find((tp) => tp.id === id);
    const tp = test && findTopic(test.subject, test.grade, id);
    if (!x || !tp) return showMap(key);
    if (locked()) return window.NimiLearn.openSubscribe('plan');
    const list = questions(tp, 6, test.subject);
    const root = k.screen('activity');
    root.append(k.titleBar(t('pracTitle'), () => showMap(key)));
    root.append(H('div', { class: 'flex flex-col gap-1' },
      H('p', { class: 'text-[22px] font-bold leading-tight text-white' }, tp.name()),
      H('p', { class: `text-sm ${TONE[x.st]}` }, t('st')[x.st])));
    // What to remember before the questions: the rule, a worked example or the words.
    const memo = H('div', { class: `${k.CARD} flex flex-col gap-2` }, H('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('lightbulb', 'h-4 w-4'), t('remember')));
    if (tp.kind === 'words') tp.words.forEach((w) => memo.append(html('p', 'text-slate-200', `**${w[0]}** — ${N.lang === 'uz' ? w[2] : w[1]}`)));
    else if (tp.kind === 'vocab') tp.entries.forEach((e) => memo.append(html('p', 'text-slate-200', `**${e.t}** — ${e.n}`)));
    else if (tp.kind === 'grammar') [...new Set(tp.items.map((g) => tr(g[4], g[5])))].forEach((r) => memo.append(html('p', 'text-slate-200', r)));
    else if (tp.kind === 'quiz') memo.append(html('p', 'text-slate-200', pick2(tp.src.rule)));
    else {
      const sample = questions(tp, 1, test.subject)[0];
      if (sample?.rule) memo.append(html('p', 'text-slate-200', sample.rule));
      if (sample?.explain) memo.append(html('div', 'rounded-2xl bg-night-800 p-3 text-slate-200', `${t('example')}: ${sample.q}\n${sample.explain}`));
    }
    root.append(memo, H('p', { class: 'text-sm text-slate-400' }, t('need')),
      H('button', { type: 'button', class: k.BTN, onclick: () => step({ key, id, tp, list, i: 0, ok: 0 }) }, ico('play'), t('go')));
  }
  function step(st) {
    const k = K();
    const q = st.list[st.i];
    const root = k.screen('activity');
    progressBar(root, Math.round((st.i / st.list.length) * 100), () => showMap(st.key), t('toHome'));
    root.append(html('div', 'whitespace-pre-line text-xl font-semibold leading-snug text-white', q.q));
    let picked = null;
    const checkBtn = H('button', { type: 'button', class: k.BTN, disabled: true }, t('check'));
    const { box, buttons } = optionList(q, (o) => { picked = o; checkBtn.disabled = false; });
    root.append(box, checkBtn);
    checkBtn.onclick = () => {
      const ok = picked === q.a;
      if (ok) st.ok++;
      checkBtn.remove();
      buttons.forEach(([b, o]) => {
        b.disabled = true;
        b.classList.remove(...PICKED);
        if (o === q.a) b.classList.add('ring-2!', 'ring-emerald-400!', 'bg-emerald-500/15!');
        else if (o === picked) b.classList.add('ring-2!', 'ring-rose-400!', 'bg-rose-500/15!');
        else b.classList.add('opacity-60');
      });
      const praise = t('correct')[Math.floor(Math.random() * t('correct').length)];
      const fb = H('div', { class: `flex flex-col gap-2 rounded-3xl p-4 ring-1 ${ok ? 'bg-emerald-500/15 ring-emerald-400/30' : 'bg-rose-500/15 ring-rose-400/30'}`, role: 'status' },
        H('p', { class: `flex items-center gap-2 text-lg font-semibold ${ok ? 'text-emerald-200' : 'text-rose-200'}` }, ico(ok ? 'circle-check' : 'circle-alert'), ok ? praise : t('wrong')));
      if (!ok) fb.append(html('div', 'text-slate-100', `${t('answerIs')} **${q.a}**`));
      if (!ok && q.rule) fb.append(html('div', 'text-sm text-slate-300', q.rule));
      if (!ok && q.explain) fb.append(html('div', 'whitespace-pre-line text-sm text-slate-300', q.explain));
      const go = H('button', { type: 'button', class: k.BTN, onclick: () => { st.i++; if (st.i >= st.list.length) finishPractice(st); else step(st); } }, t('next'));
      root.append(fb, go);
      go.focus();
      fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
  }
  function finishPractice(st) {
    const k = K();
    const s = D();
    const test = s.tests[st.key];
    const x = test.topics.find((tp) => tp.id === st.id);
    const before = x.st;
    const passed = st.ok >= Math.ceil(st.list.length * 0.8);
    if (passed && x.st !== 'good') x.st = x.st === 'gap' ? 'mid' : 'good';
    x.practice = (x.practice || 0) + 1;
    x.last = new Date().toISOString();
    if (!N.hasAccess()) s.freeUsed = true;
    const day = today();
    if (day && day.key === st.key && !day.done.includes(st.id)) day.done.push(st.id);
    const stats = k.data.progress.stats;
    stats.tasks = (stats.tasks || 0) + st.list.length;
    stats.correct = (stats.correct || 0) + st.ok;
    k.save('progress');
    k.markDay();
    save();
    const root = k.screen('activity');
    root.append(k.titleBar(t('pracDone'), goHome));
    const moved = x.st !== before;
    root.append(H('div', { class: `flex flex-col items-center gap-3 rounded-[28px] p-6 text-center ring-1 ${moved ? 'bg-emerald-500/10 ring-emerald-400/30' : 'bg-night-900/80 ring-white/5'}` },
      H('span', { class: `flex h-16 w-16 items-center justify-center rounded-full ${moved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-night-800 text-slate-300'}` }, ico(moved ? 'trophy' : 'target', 'h-8 w-8')),
      H('p', { class: 'text-4xl font-bold tabular-nums text-white' }, t('score')(st.ok, st.list.length)),
      H('p', { class: 'font-semibold text-white' }, st.tp.name()),
      H('p', { class: 'flex items-center gap-2 text-sm' }, H('span', { class: `h-3 w-3 rounded-full ${DOT[x.st]}` }), H('span', { class: TONE[x.st] }, t('st')[x.st])),
      H('p', { class: 'text-slate-300' }, moved ? t('up')[x.st] : before === 'good' ? t('already') : t('keep'))));
    const next = weakTopics(test).find((w) => w.id !== st.id && !(day?.done || []).includes(w.id));
    if (next && !locked()) root.append(H('button', { type: 'button', class: k.BTN, onclick: () => practice(st.key, next.id) }, ico('play'), t('startGap')(topicName(test, next.id))));
    if (!moved && before !== 'good') {
      root.append(H('button', { type: 'button', class: next && !locked() ? k.BTN2 : k.BTN, onclick: () => practice(st.key, st.id) }, ico('repeat'), t('retry')),
        H('button', { type: 'button', class: k.BTN2, onclick: () => askTeacher(test, st.id) }, ico('message-circle'), t('askTeacher')));
    }
    root.append(H('button', { type: 'button', class: k.BTN2, onclick: goHome }, t('toHome')));
  }

  // ---------- the parent's view (diag = the child's saved "diag" data) ----------
  function parentCard(diag) {
    const k = K();
    const tests = Object.values(diag?.tests || {}).filter((x) => x && Array.isArray(x.topics)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const box = H('div', { class: `${k.CARD} flex flex-col gap-3` }, H('p', { class: 'font-semibold text-white' }, t('parentTitle')));
    if (!tests.length) { box.append(H('p', { class: 'text-sm text-slate-400' }, t('parentNone'))); return box; }
    tests.forEach((test) => {
      const was = count(test, 'first', 'gap'), left = count(test, 'st', 'gap');
      const done = test.topics.reduce((a, x) => a + (x.practice || 0), 0);
      box.append(H('div', { class: 'flex flex-col gap-2 border-t border-white/5 pt-3' },
        H('p', { class: 'font-semibold text-white' }, t('planSub')(N.subjectName(test.subject), test.grade)),
        H('p', { class: 'text-sm text-slate-400' }, t('parentLine')(dateStr(test.date), test.score, test.total)),
        H('p', { class: `rounded-2xl p-3 text-sm ring-1 ${left ? 'bg-amber-400/10 text-amber-100 ring-amber-400/30' : 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/30'}` }, was ? t('was')(was, left) : t('wasNone')),
        ...test.topics.map((x) => H('div', { class: 'flex items-center gap-3 rounded-xl bg-night-800 px-3 py-2' },
          H('span', { class: `h-3 w-3 shrink-0 rounded-full ${DOT[x.st] || DOT.gap}` }),
          H('span', { class: 'min-w-0 flex-1 text-sm text-slate-100' }, topicName(test, x.id)),
          H('span', { class: `shrink-0 text-xs ${TONE[x.st] || ''}` }, t('stShort')[x.st] || ''))),
        done ? H('p', { class: 'text-xs text-slate-400' }, t('practices')(done)) : null));
    });
    return box;
  }

  window.NimiDiag = { open, homeCard, offerOnce, parentCard, showMap, feature: () => t('feature'), _test: { buildCheck, available, checkTopics, kindOf, questions, findTopic } };
})();
