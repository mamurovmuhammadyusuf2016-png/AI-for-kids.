(() => {
  const DAILY_LIMIT = 30;
  const SESSION_MS = 25 * 60 * 1000;
  const BREAK_MS = 5 * 60 * 1000;
  const RESTED_MS = 5 * 60 * 1000;
  const MAX_SESSIONS = 10;

  // Illustrations; swap a path here to change the picture everywhere.
  const IMAGES = {
    avatar: '/img/avatar.webp',
    welcome: '/img/welcome.webp',
    break: '/img/break.webp',
  };

  const SUBJECTS = [
    ['math', 'calculator', 'Математика', 'Matematika'],
    ['russian', 'pen-line', 'Русский язык', 'Rus tili'],
    ['uzbek', 'book-open-text', 'Узбекский язык', 'Ona tili'],
    ['english', 'languages', 'Английский язык', 'Ingliz tili'],
    ['literature', 'library', 'Литература', 'Adabiyot'],
    ['nature', 'trees', 'Окружающий мир', 'Tabiatshunoslik'],
    ['physics', 'zap', 'Физика', 'Fizika'],
    ['chemistry', 'flask-conical', 'Химия', 'Kimyo'],
    ['biology', 'sprout', 'Биология', 'Biologiya'],
    ['history', 'landmark', 'История', 'Tarix'],
    ['geography', 'globe', 'География', 'Geografiya'],
    ['informatics', 'monitor', 'Информатика', 'Informatika'],
  ];

  const T = {
    ru: {
      title: 'Nimi AI',
      subtitle: 'Твой помощник в учёбе',
      welcomeTitle: 'Привет! Давай учиться вместе',
      welcomeText: 'Я не даю готовых ответов, а помогаю дойти до них самому.',
      chooseSubject: 'Выбери предмет',
      chooseGrade: 'Выбери класс',
      start: 'Начать урок',
      grade: 'класс',
      reportBtn: 'Отчёт для родителей',
      reportShort: 'Отчёт',
      menuChange: 'Сменить предмет или класс',
      menuNew: 'Новый чат',
      subscription: 'Подписка',
      adminPanel: 'Админка',
      premiumRequired: 'Бесплатная неделя закончилась. Оформи подписку, чтобы продолжить.',
      photoTask: 'Фото задачи',
      photoReady: 'Фото задачи прикреплено. Можешь дописать вопрос.',
      photoDefault: 'Помоги разобраться с задачей на фото.',
      photoError: 'Не получилось открыть фото. Попробуй другое.',
      listen: 'Слушать',
      noVoice: 'На этом устройстве нет голоса для этого языка.',
      micDenied: 'Нет доступа к микрофону. Разреши его в настройках браузера.',
      speakNow: 'Говори, я слушаю…',
      language: 'Язык',
      share: 'Поделиться',
      back: 'Назад',
      questionsLeft: 'Вопросов осталось:',
      tabHome: 'Главная',
      tabChat: 'Чат',
      tabProgress: 'Прогресс',
      tabDiary: 'Дневник',
      placeholder: 'Задай вопрос…',
      privacy: 'Не пиши своё имя, адрес, школу и телефон.',
      greeting: (s, g) => `Привет! Сегодня ${s}, ${g} класс. Напиши задачу или вопрос — разберём вместе. Готовый ответ я не дам, но помогу дойти до него самому.`,
      thinking: 'Думаю…',
      rateLimited: 'Слишком много запросов, попробуй через минуту',
      dailyLimit: 'На сегодня вопросы закончились (30 из 30). Отдохни и попробуй решить задачи сам — завтра продолжим!',
      blocked: 'Давай вернёмся к учёбе. Задай вопрос по школьному предмету.',
      aiError: 'ИИ сейчас занят. Попробуй ещё раз чуть позже.',
      offline: 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
      tooFrequent: 'Ты спрашиваешь очень часто. Попробуй сначала подумать сам пару минут!',
      linkCopied: 'Ссылка скопирована',
      breakTitle: 'Сделай перерыв 5 минут',
      breakText: 'Ты занимался 25 минут — молодец! Встань, потянись, посмотри в окно и попей воды. Чат откроется сам.',
      reportTitle: 'Отчёт для родителей',
      reportLoading: 'Готовлю отчёт…',
      reportEmpty: 'Пока нет занятий для отчёта. Задай репетитору хотя бы один вопрос.',
      statQuestions: 'вопросов сегодня',
      statSessions: 'занятий',
      statSubjects: 'предметов',
      print: 'Распечатать / сохранить',
      tabLogin: 'Вход',
      tabRegister: 'Регистрация',
      emailPh: 'Электронная почта',
      passwordPh: 'Пароль',
      confirmPh: 'Повтори пароль',
      passwordHint: 'Минимум 8 символов: буквы и хотя бы одна цифра.',
      loginBtn: 'Войти',
      registerBtn: 'Создать аккаунт',
      or: 'или',
      logout: 'Выйти',
      authNote: 'Мы храним только твою почту. Пароль хранится в зашифрованном виде, его не видит никто.',
      errors: {
        invalid_email: 'Проверь адрес почты — похоже, в нём ошибка.',
        weak_password: 'Пароль слишком простой: нужно минимум 8 символов, буквы и хотя бы одна цифра.',
        mismatch: 'Пароли не совпадают.',
        email_taken: 'Эта почта уже зарегистрирована. Попробуй войти.',
        invalid_credentials: 'Неверная почта или пароль.',
        use_google: 'Этот аккаунт создан через Google — нажми «Войти через Google».',
        too_many_attempts: 'Слишком много неудачных попыток. Подожди 15 минут и попробуй снова.',
        google_failed: 'Не получилось войти через Google. Попробуй ещё раз.',
        auth_unavailable: 'Вход временно недоступен. Попробуй позже.',
        offline: 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
      },
    },
    uz: {
      title: 'Nimi AI',
      subtitle: "O'qishdagi yordamching",
      welcomeTitle: "Salom! Keling, birga o'rganamiz",
      welcomeText: "Men tayyor javob bermayman, balki uni o'zing topishingga yordam beraman.",
      chooseSubject: 'Fanni tanla',
      chooseGrade: 'Sinfni tanla',
      start: 'Darsni boshlash',
      grade: 'sinf',
      reportBtn: 'Ota-onalar uchun hisobot',
      reportShort: 'Hisobot',
      menuChange: "Fan yoki sinfni o'zgartirish",
      menuNew: 'Yangi chat',
      subscription: 'Obuna',
      adminPanel: 'Admin panel',
      premiumRequired: "Bepul hafta tugadi. Davom etish uchun obuna rasmiylashtir.",
      photoTask: 'Masala surati',
      photoReady: "Masala surati biriktirildi. Savolingni ham yozishing mumkin.",
      photoDefault: 'Suratdagi masalani tushunishga yordam ber.',
      photoError: "Suratni ochib bo'lmadi. Boshqasini sinab ko'r.",
      listen: 'Tinglash',
      noVoice: "Bu qurilmada bu til uchun ovoz yo'q.",
      micDenied: "Mikrofonga ruxsat yo'q. Brauzer sozlamalarida ruxsat ber.",
      speakNow: 'Gapir, tinglayapman…',
      language: 'Til',
      share: 'Ulashish',
      back: 'Orqaga',
      questionsLeft: 'Qolgan savollar:',
      tabHome: 'Bosh sahifa',
      tabChat: 'Chat',
      tabProgress: 'Natijalar',
      tabDiary: 'Kundalik',
      placeholder: 'Savolingni yoz…',
      privacy: 'Ismingni, manzilingni, maktabingni va telefoningni yozma.',
      greeting: (s, g) => `Salom! Bugun ${s}, ${g}-sinf. Masala yoki savolingni yoz — birga hal qilamiz. Tayyor javob bermayman, lekin o'zing topishingga yordam beraman.`,
      thinking: "O'ylayapman…",
      rateLimited: "Juda ko'p so'rov, bir daqiqadan keyin urinib ko'r",
      dailyLimit: "Bugungi savollar tugadi (30 dan 30). Dam ol va masalalarni o'zing yechib ko'r — ertaga davom etamiz!",
      blocked: "Keling, o'qishga qaytaylik. Maktab fani bo'yicha savol ber.",
      aiError: "AI hozir band. Birozdan keyin qayta urinib ko'r.",
      offline: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'r.",
      tooFrequent: "Juda tez-tez so'rayapsan. Avval bir-ikki daqiqa o'zing o'ylab ko'r!",
      linkCopied: 'Havola nusxalandi',
      breakTitle: 'Tanaffus — 5 daqiqa',
      breakText: "Sen 25 daqiqa shug'ullanding — barakalla! O'rningdan tur, cho'zil, derazaga qara va suv ich. Chat o'zi ochiladi.",
      reportTitle: 'Ota-onalar uchun hisobot',
      reportLoading: 'Hisobot tayyorlanmoqda…',
      reportEmpty: "Hisobot uchun hali darslar yo'q. Repetitorga kamida bitta savol ber.",
      statQuestions: 'bugungi savollar',
      statSessions: 'darslar',
      statSubjects: 'fanlar',
      print: 'Chop etish / saqlash',
      tabLogin: 'Kirish',
      tabRegister: "Ro'yxatdan o'tish",
      emailPh: 'Elektron pochta',
      passwordPh: 'Parol',
      confirmPh: 'Parolni takrorla',
      passwordHint: "Kamida 8 ta belgi: harflar va kamida bitta raqam.",
      loginBtn: 'Kirish',
      registerBtn: 'Akkaunt yaratish',
      or: 'yoki',
      logout: 'Chiqish',
      authNote: "Biz faqat pochtangni saqlaymiz. Parol shifrlangan holda saqlanadi, uni hech kim ko'rmaydi.",
      errors: {
        invalid_email: "Pochta manzilini tekshir — xato bor shekilli.",
        weak_password: "Parol juda oddiy: kamida 8 ta belgi, harflar va kamida bitta raqam kerak.",
        mismatch: 'Parollar mos kelmadi.',
        email_taken: "Bu pochta allaqachon ro'yxatdan o'tgan. Kirishga urinib ko'r.",
        invalid_credentials: "Pochta yoki parol noto'g'ri.",
        use_google: "Bu akkaunt Google orqali yaratilgan — «Google orqali kirish» tugmasini bos.",
        too_many_attempts: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqa kutib, qayta urinib ko'r.",
        google_failed: "Google orqali kirib bo'lmadi. Qayta urinib ko'r.",
        auth_unavailable: "Kirish vaqtincha ishlamayapti. Keyinroq urinib ko'r.",
        offline: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'r.",
      },
    },
  };

  // ---------- storage (best-effort; works without it) ----------
  // Chats, subject and counters are kept per account, so children sharing a device don't mix.
  const ACCOUNT_KEYS = new Set(['setup', 'sessions', 'usage', 'learn']);
  let account = '';
  const storageKey = (key) => 'tutor.' + (ACCOUNT_KEYS.has(key) ? `u:${account}.` : '') + key;
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(storageKey(key));
        return v === null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(storageKey(key), JSON.stringify(value)); } catch {}
    },
  };

  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toLocaleDateString('en-CA');
  const icon = (name, cls = 'icon') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${(window.ICONS || {})[name] || ''}</svg>`;
  const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}️‍⃣]/gu;

  let lang = store.get('lang', (navigator.language || '').startsWith('uz') ? 'uz' : 'ru');
  let deviceId = store.get('deviceId', null);
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
    store.set('deviceId', deviceId);
  }
  let user = null;
  let config = { googleClientId: '', accounts: false };
  let authMode = 'login';
  let setup = null;
  let sessions = [];
  let pendingSubject = null;
  let pendingGrade = null;
  let busy = false;

  const t = (key) => T[lang][key];
  const subjectInfo = (key) => SUBJECTS.find((s) => s[0] === key) || SUBJECTS[0];
  const subjectName = (key, l = lang) => subjectInfo(key)[l === 'uz' ? 3 : 2];
  const gradeLabel = (g) => `${g}${lang === 'uz' ? '-' : ' '}${t('grade')}`;

  // The server counts questions per account; this is the last number it reported.
  function remaining() {
    const u = store.get('usage', null);
    return u && u.day === today() ? u.remaining : DAILY_LIMIT;
  }
  function setRemaining(n) {
    if (typeof n === 'number') store.set('usage', { day: today(), remaining: Math.max(0, n) });
  }

  function currentSession() {
    return sessions[sessions.length - 1];
  }
  function saveSessions() {
    sessions = sessions.slice(-MAX_SESSIONS);
    store.set('sessions', sessions);
  }
  function newSession() {
    sessions.push({ date: today(), subject: setup.subject, grade: setup.grade, messages: [] });
    saveSessions();
  }

  // ---------- rendering ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('.lang-btn').forEach((b) => {
      const on = b.dataset.lang === lang;
      const size = b.classList.contains('lang-sm') ? 'lang-sm min-h-9 min-w-10 rounded-lg px-2 text-sm' : 'min-h-12 min-w-12 rounded-xl px-3 text-[15px]';
      b.className = `lang-btn ${size} font-medium transition ` +
        (on ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-300 hover:text-white');
      b.setAttribute('aria-pressed', on);
    });
    $('input').placeholder = t('placeholder');
    $('authEmail').placeholder = t('emailPh');
    $('authPassword').placeholder = t('passwordPh');
    $('authConfirm').placeholder = t('confirmPh');
    renderAuthMode();
    renderGoogleButton();
    $('plusBtn').setAttribute('aria-label', t('photoTask'));
    $('micBtn').setAttribute('aria-label', t('speakNow'));
    renderSetupOptions();
    renderStatus();
  }

  function optionClass(on) {
    return 'flex min-h-14 items-center gap-3 rounded-2xl p-2 pr-3 text-left text-[15px] ring-1 transition active:scale-95 ' +
      (on ? 'bg-brand-500/15 text-white ring-brand-400' : 'bg-night-800 text-slate-200 ring-white/5 hover:bg-night-700');
  }

  function renderSetupOptions() {
    const subjects = $('subjects');
    subjects.innerHTML = '';
    SUBJECTS.forEach(([key, ic]) => {
      const on = key === pendingSubject;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = optionClass(on);
      b.innerHTML = `<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? 'bg-brand-500 text-white' : 'bg-night-700 text-slate-200'}">${icon(ic)}</span><span class="min-w-0"></span>`;
      b.lastChild.textContent = subjectName(key);
      b.onclick = () => { pendingSubject = key; renderSetupOptions(); };
      subjects.appendChild(b);
    });
    const grades = $('grades');
    grades.innerHTML = '';
    for (let g = 1; g <= 11; g++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g;
      b.className = optionClass(g === pendingGrade) + ' justify-center text-lg font-medium' +
        (g === pendingGrade ? ' bg-brand-500 ring-brand-500' : '');
      b.onclick = () => { pendingGrade = g; renderSetupOptions(); };
      grades.appendChild(b);
    }
    $('startBtn').disabled = !(pendingSubject && pendingGrade);
  }

  function renderStatus() {
    if (setup) $('setupChip').textContent = `${subjectName(setup.subject)} · ${setup.grade} ${lang === 'uz' ? 'sinf' : 'кл.'}`;
    $('limitText').textContent = `${remaining()}/${DAILY_LIMIT}`;
  }

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function formatPlain(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[*-]\s+/gm, '• ')
      .replace(/^#+\s*/gm, '');
  }
  function renderMath(tex, display) {
    if (!window.katex) return escapeHtml(tex);
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html', trust: false, maxSize: 20 });
    } catch {
      return escapeHtml(tex);
    }
  }
  // Escaped text with **bold**, bullets and formulas in $...$ / $$...$$ drawn by KaTeX.
  function formatReply(text) {
    const src = text.replace(EMOJI_RE, '');
    // A formula keeps the punctuation right after it on the same line.
    const re = /\$\$([^$]+)\$\$|\$([^$\n]+)\$([.,;:!?)]*)/g;
    let out = '', last = 0;
    for (const m of src.matchAll(re)) {
      const math = renderMath(m[1] ?? m[2], m[1] !== undefined);
      out += formatPlain(src.slice(last, m.index)) + (m[3] ? `<span class="whitespace-nowrap">${math}${escapeHtml(m[3])}</span>` : math);
      last = m.index + m[0].length;
    }
    return out + formatPlain(src.slice(last));
  }

  // ---------- reading aloud (speech synthesis) ----------
  const canSpeak = 'speechSynthesis' in window;
  function speechText(text) {
    return text
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
      .replace(/\\cdot|\\times/g, '×')
      .replace(/[$*#_{}\\]/g, ' ')
      .replace(EMOJI_RE, '');
  }
  function voiceFor(code) {
    return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(code));
  }
  // code: 'ru' | 'uz' | 'en'. Returns false when the device has no voice for it.
  function speak(text, code, onEnd) {
    if (!canSpeak) return false;
    speechSynthesis.cancel();
    const voice = voiceFor(code);
    if (!voice && code !== 'en') return false;
    const u = new SpeechSynthesisUtterance(speechText(text));
    u.lang = { ru: 'ru-RU', uz: 'uz-UZ', en: 'en-US' }[code];
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = u.onerror = () => onEnd?.();
    speechSynthesis.speak(u);
    return true;
  }
  if (canSpeak) speechSynthesis.getVoices();
  const textLang = (text) => (/[а-яё]/i.test(text) ? 'ru' : lang === 'uz' ? 'uz' : 'ru');

  const timeLabel = (ts) => (ts ? new Date(ts).toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');

  function addBubble(role, text, { ts, extra = '', img } = {}) {
    const row = document.createElement('div');
    const bubble = document.createElement('div');
    const meta = document.createElement('div');
    meta.className = 'mt-1.5 flex items-center justify-end gap-1 text-xs';
    if (role === 'user') {
      row.className = 'flex justify-end pl-10';
      bubble.className = 'bubble max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md bg-brand-500 px-4 pb-2 pt-3 text-base leading-relaxed text-white shadow-lg shadow-brand-500/20 ' + extra;
      if (img) bubble.appendChild(Object.assign(document.createElement('img'), { src: img, alt: '', className: 'mb-2 max-h-48 rounded-2xl object-cover' }));
      bubble.appendChild(document.createTextNode(text));
      meta.className += ' text-white/70';
      if (ts) meta.innerHTML = `<span>${timeLabel(ts)}</span>${icon('check-check', 'h-4 w-4')}`;
    } else {
      row.className = 'flex items-start gap-3 pr-6';
      row.innerHTML = `<img src="${IMAGES.avatar}" alt="" class="mt-1 h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10">`;
      bubble.className = 'bubble max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-tl-md bg-night-800 px-4 pb-2 pt-3 text-base leading-relaxed text-slate-100 ring-1 ring-white/5 ' + extra;
      bubble.innerHTML = formatReply(text);
      meta.className += ' text-slate-400';
      if (ts) {
        if (canSpeak) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mr-auto -ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white';
          btn.setAttribute('aria-label', t('listen'));
          btn.innerHTML = icon('volume-2', 'h-4 w-4');
          btn.onclick = () => {
            if (btn.dataset.on) { speechSynthesis.cancel(); return; }
            const done = () => { delete btn.dataset.on; btn.innerHTML = icon('volume-2', 'h-4 w-4'); };
            if (!speak(text, textLang(text), done)) return showNotice(t('noVoice'), 3000);
            btn.dataset.on = '1';
            btn.innerHTML = icon('square', 'h-4 w-4');
          };
          meta.appendChild(btn);
        }
        meta.appendChild(Object.assign(document.createElement('span'), { textContent: timeLabel(ts) }));
      }
    }
    if (ts) bubble.appendChild(meta);
    else bubble.classList.add('pb-3');
    row.appendChild(bubble);
    $('chat').appendChild(row);
    $('chat').scrollTop = $('chat').scrollHeight;
    return row;
  }

  function renderChat() {
    $('chat').innerHTML = '';
    const s = currentSession();
    addBubble('assistant', t('greeting')(subjectName(setup.subject), setup.grade));
    s.messages.forEach((m) => addBubble(m.role, m.content, { ts: m.ts, img: m.img }));
  }

  function showNotice(text, ms = 6000) {
    const n = $('notice');
    n.innerHTML = icon('circle-alert', 'icon mt-px') + '<span></span>';
    n.lastChild.textContent = text;
    n.classList.remove('hidden');
    n.classList.add('flex');
    clearTimeout(showNotice.timer);
    if (ms) showNotice.timer = setTimeout(() => { n.classList.add('hidden'); n.classList.remove('flex'); }, ms);
  }

  function updateInputState() {
    const onBreak = timerState().breakUntil > Date.now();
    const blocked = busy || onBreak || remaining() <= 0;
    $('input').disabled = blocked;
    $('send').disabled = blocked;
  }

  // Screen name -> element id. Tabs show the bottom navigation.
  const SCREENS = { auth: 'auth', setup: 'setup', home: 'home', chat: 'chatScreen', activity: 'activity', progress: 'progress', diary: 'diary' };
  const TAB_OF = { home: 'home', activity: 'home', chat: 'chat', progress: 'progress', diary: 'diary' };
  let currentScreen = '';
  function showScreen(name, arg) {
    currentScreen = name;
    for (const [key, id] of Object.entries(SCREENS)) {
      $(id).classList.toggle('hidden', key !== name);
      if (['chat', 'home', 'activity', 'progress', 'diary'].includes(key)) $(id).classList.toggle('flex', key === name);
    }
    const inApp = !!TAB_OF[name];
    $('menuWrap').classList.toggle('hidden', name === 'auth');
    $('tabbar').classList.toggle('hidden', !inApp);
    $('tabbar').classList.toggle('grid', inApp);
    $('timerPill').classList.toggle('hidden', !inApp);
    $('timerPill').classList.toggle('flex', inApp);
    $('changeSetup').classList.toggle('hidden', !inApp);
    $('changeSetup').classList.toggle('flex', inApp);
    $('subtitleLine').classList.toggle('hidden', inApp);
    $('backBtn').classList.toggle('invisible', !setup);
    document.querySelectorAll('.tab-btn').forEach((b) => {
      const on = b.dataset.tab === TAB_OF[name];
      b.className = 'tab-btn flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium transition ' +
        (on ? 'text-brand-400' : 'text-slate-400 hover:text-white');
      b.setAttribute('aria-current', on ? 'page' : 'false');
    });
    if (inApp && name !== 'chat') window.NimiLearn?.render(name, arg);
    if (name === 'chat') {
      renderChat();
      renderStatus();
      if (remaining() <= 0) showNotice(t('dailyLimit'), 0);
      updateInputState();
    }
  }
  const onChat = () => currentScreen === 'chat';

  // ---------- setup ----------
  $('startBtn').onclick = () => {
    const changed = !setup || setup.subject !== pendingSubject || setup.grade !== pendingGrade;
    setup = { subject: pendingSubject, grade: pendingGrade };
    store.set('setup', setup);
    const cur = currentSession();
    if (changed || !cur || cur.date !== today()) newSession();
    renderStatus();
    showScreen('home');
  };
  function openSetup() {
    pendingSubject = setup && setup.subject;
    pendingGrade = setup && setup.grade;
    renderSetupOptions();
    showScreen('setup');
  }
  $('changeSetup').onclick = openSetup;
  $('backBtn').onclick = () => setup && showScreen('home');
  // The chat is part of the subscription: after the free week it opens the subscription page.
  const hasAccess = () => !config.accounts || !!user?.admin || !!user?.plan?.active;
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.onclick = () => (b.dataset.tab === 'chat' && !hasAccess() ? window.NimiLearn?.openSubscribe() : showScreen(b.dataset.tab));
  });
  function startNewChat() {
    if (busy || !currentSession().messages.length) return;
    newSession();
    renderChat();
    $('input').focus();
  }
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.onclick = () => {
      lang = b.dataset.lang;
      store.set('lang', lang);
      applyLang();
      if (onChat()) renderChat();
      else if (TAB_OF[currentScreen]) showScreen(currentScreen);
    };
  });

  // ---------- header: share + menu ----------
  async function share() {
    const data = { title: t('title'), text: t('subtitle'), url: location.origin };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      if (onChat()) showNotice(t('linkCopied'), 2500);
    } catch {}
  }
  const menu = $('menu');
  const closeMenu = () => menu.classList.add('hidden');
  $('menuBtn').onclick = (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  };
  document.addEventListener('click', closeMenu);
  menu.querySelectorAll('.menu-item').forEach((item) => {
    item.onclick = () => {
      closeMenu();
      const action = item.dataset.action;
      if (action === 'logout') logout();
      else if (action === 'subscribe') window.NimiLearn?.openSubscribe();
      else if (action === 'admin') window.NimiLearn?.openAdmin();
      else if (action === 'report') openReport();
      else if (action === 'share') share();
      else if (action === 'change') openSetup();
      else if (action === 'new' && setup) {
        if (!onChat()) showScreen('chat');
        startNewChat();
      }
    };
  });

  // ---------- chat ----------
  $('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('form').requestSubmit(); }
  });
  $('input').addEventListener('input', (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px';
  });

  // ---------- photo of a task ----------
  let pendingPhoto = null; // { mime, data (base64), thumb (data URL) }
  const plusMenu = $('plusMenu');
  $('plusBtn').onclick = (e) => { e.stopPropagation(); plusMenu.classList.toggle('hidden'); };
  document.addEventListener('click', () => plusMenu.classList.add('hidden'));
  $('newChatAction').onclick = () => { plusMenu.classList.add('hidden'); startNewChat(); };
  $('photoAction').onclick = () => { plusMenu.classList.add('hidden'); $('photoInput').click(); };
  function shrinkImage(img, maxSide, quality) {
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', quality);
  }
  function setPhoto(photo) {
    pendingPhoto = photo;
    $('photoChip').classList.toggle('hidden', !photo);
    $('photoChip').classList.toggle('flex', !!photo);
    if (photo) $('photoThumb').src = photo.thumb;
  }
  $('photoRemove').onclick = () => setPhoto(null);
  $('photoInput').addEventListener('change', () => {
    const file = $('photoInput').files[0];
    $('photoInput').value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const full = shrinkImage(img, 1600, 0.85);
      setPhoto({ mime: 'image/jpeg', data: full.split(',')[1], thumb: shrinkImage(img, 360, 0.7) });
      URL.revokeObjectURL(url);
      $('input').focus();
    };
    img.onerror = () => { URL.revokeObjectURL(url); showNotice(t('photoError'), 4000); };
    img.src = url;
  });

  // ---------- voice input (speech recognition) ----------
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;
  if (Recognition) $('micBtn').classList.replace('hidden', 'flex');
  function setMic(on) {
    $('micBtn').innerHTML = icon(on ? 'square' : 'mic');
    $('micBtn').classList.toggle('bg-rose-500', on);
    $('micBtn').classList.toggle('text-white', on);
    $('micBtn').classList.toggle('animate-pulse', on);
  }
  $('micBtn').onclick = () => {
    if (recognizer) { recognizer.stop(); return; }
    recognizer = new Recognition();
    recognizer.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
    recognizer.interimResults = true;
    recognizer.continuous = false;
    const base = $('input').value ? $('input').value.trimEnd() + ' ' : '';
    recognizer.onresult = (ev) => {
      const said = Array.from(ev.results).map((r) => r[0].transcript).join('');
      $('input').value = base + said;
      $('input').dispatchEvent(new Event('input'));
    };
    recognizer.onerror = (ev) => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') showNotice(t('micDenied'), 4000); };
    recognizer.onend = () => { recognizer = null; setMic(false); };
    setMic(true);
    showNotice(t('speakNow'), 2500);
    recognizer.start();
  };

  // Reads the server's event stream: {type:'delta'|'done'|'error', ...}.
  async function readStream(r, onDelta) {
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let end;
      while ((end = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, end).trim();
        buf = buf.slice(end + 2);
        if (!line.startsWith('data:')) continue;
        const ev = JSON.parse(line.slice(5));
        if (ev.type === 'delta') onDelta(ev.text);
        else return ev;
      }
    }
    return { type: 'error', code: 'ai_error' };
  }

  $('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const photo = pendingPhoto;
    const text = $('input').value.trim() || (photo ? t('photoDefault') : '');
    if (!text) return;
    if (remaining() <= 0) { showNotice(t('dailyLimit'), 0); return; }
    if (timerState().breakUntil > Date.now()) return;
    if (recognizer) recognizer.stop();

    const s = currentSession();
    const userMsg = { role: 'user', content: text, ts: Date.now(), ...(photo ? { img: photo.thumb } : {}) };
    s.messages.push(userMsg);
    saveSessions();
    $('input').value = '';
    $('input').style.height = '';
    setPhoto(null);
    addBubble('user', text, { ts: userMsg.ts, img: userMsg.img });
    busy = true;
    updateInputState();
    const typing = addBubble('assistant', t('thinking'), { extra: 'animate-pulse text-slate-400' });

    const fail = (msg) => {
      s.messages.pop();
      saveSessions();
      addBubble('assistant', msg, { extra: 'bg-amber-400/10! text-amber-100! ring-amber-400/20!' });
    };

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          lang,
          stream: true,
          subject: subjectName(setup.subject, 'ru'),
          grade: setup.grade,
          turn: s.messages.filter((m) => m.role === 'user').length,
          messages: s.messages.map(({ role, content }) => ({ role, content })),
          image: photo ? { mime: photo.mime, data: photo.data } : undefined,
        }),
      });
      let data;
      if ((r.headers.get('content-type') || '').includes('text/event-stream')) {
        // Show the answer as it arrives.
        let shown = '';
        const live = typing.querySelector('.bubble');
        data = await readStream(r, (piece) => {
          shown += piece;
          live.classList.remove('animate-pulse', 'text-slate-400');
          live.innerHTML = formatReply(shown);
          $('chat').scrollTop = $('chat').scrollHeight;
        });
        if (data.type === 'error') data = { code: data.code };
      } else {
        data = await r.json().catch(() => ({}));
      }
      typing.remove();
      if (data.reply) {
        const botMsg = { role: 'assistant', content: data.reply, ts: Date.now() };
        s.messages.push(botMsg);
        saveSessions();
        addBubble('assistant', data.reply, { ts: botMsg.ts });
        setRemaining(data.remaining);
        window.NimiLearn?.markDay();
        if (data.tooFrequent) showNotice(t('tooFrequent'));
      } else if (data.code === 'unauthorized') {
        s.messages.pop();
        saveSessions();
        signedOut();
      } else if (data.code === 'premium_required') {
        fail(t('premiumRequired'));
        await refreshUser();
        window.NimiLearn?.openSubscribe();
      } else if (data.code === 'daily_limit') {
        setRemaining(0);
        fail(t('dailyLimit'));
      } else if (data.code === 'rate_limited') {
        fail(t('rateLimited'));
      } else if (data.code === 'blocked') {
        fail(t('blocked'));
      } else {
        fail(t('aiError'));
      }
    } catch {
      typing.remove();
      fail(t('offline'));
    } finally {
      busy = false;
      renderStatus();
      updateInputState();
      if (!$('input').disabled) $('input').focus();
    }
  });

  // Opens the chat with the photo picker (used by the home screen).
  function askWithPhoto() {
    showScreen('chat');
    $('photoInput').click();
  }

  // ---------- 25-minute timer + 5-minute break ----------
  function timerState() {
    return store.get('timer', { start: Date.now(), lastActive: Date.now(), breakUntil: 0 });
  }
  const mmss = (ms) => {
    const sec = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  function tick() {
    const now = Date.now();
    const st = timerState();
    if (st.breakUntil <= now) {
      if (st.breakUntil) {
        // Break finished: start a fresh 25-minute session.
        st.breakUntil = 0;
        st.start = now;
      } else if (now - st.lastActive > RESTED_MS) {
        // The page was closed long enough to count as a rest.
        st.start = now;
      }
      if (now - st.start >= SESSION_MS) {
        st.breakUntil = now + BREAK_MS;
        $('input').blur();
      }
    }
    const onBreak = st.breakUntil > now;
    $('breakOverlay').classList.toggle('hidden', !onBreak);
    $('breakOverlay').classList.toggle('flex', onBreak);
    if (onBreak) $('breakTimer').textContent = mmss(st.breakUntil - now);
    else $('timerText').textContent = mmss(SESSION_MS - (now - st.start));
    st.lastActive = now;
    store.set('timer', st);
    updateInputState();
  }

  // ---------- parent report ----------
  function stat(value, label) {
    return `<div class="rounded-2xl bg-night-800 p-3 text-center ring-1 ring-white/5"><div class="text-2xl font-semibold text-white">${value}</div><div class="mt-0.5 text-xs text-slate-400">${label}</div></div>`;
  }

  async function openReport() {
    if (!hasAccess()) return window.NimiLearn?.openSubscribe();
    $('reportModal').classList.remove('hidden');
    $('reportModal').classList.add('flex');
    const withMessages = sessions.filter((s) => s.messages.some((m) => m.role === 'user'));
    const subjects = new Set(withMessages.map((s) => s.subject));
    $('reportStats').innerHTML =
      stat(DAILY_LIMIT - remaining(), t('statQuestions')) +
      stat(withMessages.length, t('statSessions')) +
      stat(subjects.size, t('statSubjects'));
    const box = $('reportText');
    if (!withMessages.length) { box.textContent = t('reportEmpty'); return; }
    box.textContent = t('reportLoading');
    box.classList.add('animate-pulse');
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          lang,
          sessions: withMessages.map((s) => ({ ...s, subject: subjectName(s.subject, 'ru') })),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (data.report) box.innerHTML = formatReply(data.report);
      else box.textContent = data.code === 'rate_limited' ? t('rateLimited') : data.code === 'empty' ? t('reportEmpty') : t('aiError');
    } catch {
      box.textContent = t('offline');
    } finally {
      box.classList.remove('animate-pulse');
    }
  }
  function closeReport() {
    $('reportModal').classList.add('hidden');
    $('reportModal').classList.remove('flex');
  }
  $('closeReport').onclick = closeReport;
  $('reportModal').addEventListener('click', (e) => { if (e.target === $('reportModal')) closeReport(); });
  $('printReport').onclick = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><meta charset="utf-8"><title>${t('reportTitle')}</title>` +
      `<body style="font-family:sans-serif;max-width:700px;margin:24px auto;line-height:1.5;white-space:pre-wrap">` +
      `<h1>${t('reportTitle')}</h1><p>${new Date().toLocaleDateString()}</p>${$('reportText').innerHTML}</body>`);
    w.document.close();
    w.print();
  };

  // ---------- accounts ----------
  function renderAuthMode() {
    const reg = authMode === 'register';
    document.querySelectorAll('.auth-tab').forEach((b) => {
      const on = b.dataset.mode === authMode;
      b.className = 'auth-tab min-h-12 rounded-xl text-[15px] font-medium transition ' +
        (on ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-300 hover:text-white');
      b.setAttribute('aria-selected', on);
    });
    $('confirmWrap').classList.toggle('hidden', !reg);
    $('confirmWrap').classList.toggle('flex', reg);
    $('passwordHint').classList.toggle('hidden', !reg);
    $('authPassword').autocomplete = reg ? 'new-password' : 'current-password';
    $('authSubmit').textContent = t(reg ? 'registerBtn' : 'loginBtn');
  }

  function showAuthError(code) {
    const box = $('authError');
    if (!code) { box.classList.add('hidden'); box.classList.remove('flex'); return; }
    box.innerHTML = icon('circle-alert', 'icon mt-px') + '<span></span>';
    box.lastChild.textContent = t('errors')[code] || t('errors').auth_unavailable;
    box.classList.remove('hidden');
    box.classList.add('flex');
  }

  async function postJson(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json().catch(() => ({ code: 'auth_unavailable' }));
  }

  // Loads this account's local data and opens the app.
  function signedIn(u, left) {
    user = u;
    account = u.email;
    $('menuEmail').textContent = u.email;
    $('menuEmail').parentElement.classList.toggle('hidden', !u.email);
    const adminItem = document.querySelector('[data-action="admin"]');
    adminItem.classList.toggle('hidden', !u.admin);
    adminItem.classList.toggle('flex', !!u.admin);
    document.querySelector('[data-action="subscribe"]').classList.toggle('hidden', !config.accounts);
    document.querySelector('[data-action="logout"]').classList.toggle('hidden', !u.email);
    setup = store.get('setup', null);
    sessions = store.get('sessions', []);
    pendingSubject = setup && setup.subject;
    pendingGrade = setup && setup.grade;
    setRemaining(left);
    if (setup && (!currentSession() || currentSession().date !== today())) newSession();
    $('authForm').reset();
    showAuthError(null);
    renderSetupOptions();
    renderStatus();
    Promise.resolve(window.NimiLearn?.load()).finally(() => showScreen(setup && currentSession() ? 'home' : 'setup'));
  }

  function signedOut() {
    user = null;
    account = '';
    setup = null;
    sessions = [];
    showScreen('auth');
    renderGoogleButton();
  }

  async function logout() {
    try { await postJson('/api/auth/logout', {}); } catch {}
    if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
    signedOut();
  }

  async function finishAuth(promise) {
    $('authSubmit').disabled = true;
    try {
      const data = await promise;
      if (!data.user) return showAuthError(data.code);
      const me = await fetch('/api/auth/me').then((r) => r.json());
      signedIn(me.user || data.user, me.remaining);
    } catch {
      showAuthError('offline');
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  document.querySelectorAll('.auth-tab').forEach((b) => {
    b.onclick = () => { authMode = b.dataset.mode; showAuthError(null); renderAuthMode(); };
  });
  $('togglePassword').onclick = () => {
    const show = $('authPassword').type === 'password';
    $('authPassword').type = show ? 'text' : 'password';
    $('authConfirm').type = show ? 'text' : 'password';
    $('togglePassword').innerHTML = icon(show ? 'eye-off' : 'eye');
  };
  $('authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return showAuthError('invalid_email');
    if (authMode === 'register') {
      if (password.length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password)) return showAuthError('weak_password');
      if (password !== $('authConfirm').value) return showAuthError('mismatch');
    } else if (!password) {
      return showAuthError('invalid_credentials');
    }
    finishAuth(postJson(authMode === 'register' ? '/api/auth/register' : '/api/auth/login', { email, password }));
  });

  // "Sign in with Google" button (Google Identity Services).
  let gisLoading = null;
  function loadGoogle() {
    if (!gisLoading) {
      gisLoading = new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = 'https://accounts.google.com/gsi/client';
        sc.async = true;
        sc.onload = resolve;
        sc.onerror = reject;
        document.head.appendChild(sc);
      });
    }
    return gisLoading;
  }
  let gisReady = false;
  async function renderGoogleButton() {
    if (!config.googleClientId || user) return;
    try { await loadGoogle(); } catch { return; }
    if (!gisReady) {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: (resp) => finishAuth(postJson('/api/auth/google', { credential: resp.credential })),
        ux_mode: 'popup',
      });
      gisReady = true;
    }
    $('googleBlock').classList.remove('hidden');
    $('googleBtn').innerHTML = '';
    google.accounts.id.renderButton($('googleBtn'), {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      locale: lang === 'uz' ? 'uz' : 'ru',
      width: Math.min(400, Math.max(200, $('authForm').offsetWidth || 320)),
    });
  }

  // Re-reads the account (subscription status) from the server.
  async function refreshUser() {
    try {
      const me = await fetch('/api/auth/me').then((r) => r.json());
      if (me.user) { user = me.user; setRemaining(me.remaining); }
    } catch {}
    return user;
  }

  // Shared with learn-ui.js.
  window.Nimi = {
    t, icon, store, today, postJson, showScreen, openReport, openSetup, subjectName, gradeLabel, formatReply, speak, askWithPhoto,
    SUBJECTS,
    get lang() { return lang; },
    get setup() { return setup; },
    get user() { return user; },
    get account() { return account; },
    get accounts() { return !!config.accounts; },
    get billing() { return config.billing || {}; },
    hasAccess,
    refreshUser,
    get sessions() { return sessions; },
  };

  // ---------- start ----------
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  document.querySelectorAll('[data-img]').forEach((el) => { el.src = IMAGES[el.dataset.img]; });
  applyLang();
  tick();
  setInterval(tick, 1000);
  (async () => {
    try {
      config = await fetch('/api/config').then((r) => r.json());
      // No accounts database on the server: guest mode, no login screen.
      if (!config.accounts) return signedIn({ email: '' });
      const me = await fetch('/api/auth/me').then((r) => r.json());
      if (me.user) return signedIn(me.user, me.remaining);
    } catch {}
    signedOut();
  })();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
