(() => {
  const DAILY_LIMIT = 30;
  const SESSION_MS = 25 * 60 * 1000;
  const BREAK_MS = 5 * 60 * 1000;
  const RESTED_MS = 5 * 60 * 1000;
  const MAX_SESSIONS = 10;

  const SUBJECTS = [
    ['math', '🔢', 'Математика', 'Matematika'],
    ['russian', '📝', 'Русский язык', 'Rus tili'],
    ['uzbek', '📖', 'Узбекский язык', 'Ona tili'],
    ['english', '🇬🇧', 'Английский язык', 'Ingliz tili'],
    ['literature', '📚', 'Литература', 'Adabiyot'],
    ['nature', '🌳', 'Окружающий мир', 'Tabiatshunoslik'],
    ['physics', '⚡', 'Физика', 'Fizika'],
    ['chemistry', '🧪', 'Химия', 'Kimyo'],
    ['biology', '🌱', 'Биология', 'Biologiya'],
    ['history', '🏛️', 'История', 'Tarix'],
    ['geography', '🌍', 'География', 'Geografiya'],
    ['informatics', '💻', 'Информатика', 'Informatika'],
  ];

  const T = {
    ru: {
      title: 'ИИ-репетитор',
      subtitle: 'Учимся думать сами — шаг за шагом',
      chooseSubject: '1. Выбери предмет',
      chooseGrade: '2. Выбери класс',
      start: 'Начать урок 🚀',
      grade: 'класс',
      reportBtn: 'Отчёт для родителей',
      placeholder: 'Напиши задачу или вопрос…',
      privacy: '🔒 Не пиши своё имя, адрес, школу и телефон.',
      greeting: (s, g) => `Привет! 👋 Сегодня ${s}, ${g} класс. Напиши задачу или вопрос — разберём вместе. Готовый ответ я не дам, но помогу дойти до него самому! 💡`,
      thinking: 'Думаю…',
      rateLimited: 'Слишком много запросов, попробуй через минуту',
      dailyLimit: 'На сегодня вопросы закончились (30 из 30). Отдохни и попробуй решить задачи сам — завтра продолжим! 🌙',
      blocked: 'Давай вернёмся к учёбе 📚 Задай вопрос по школьному предмету.',
      aiError: 'ИИ сейчас занят. Попробуй ещё раз чуть позже.',
      offline: 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
      tooFrequent: '🤔 Ты спрашиваешь очень часто. Попробуй сначала подумать сам пару минут!',
      breakTitle: 'Сделай перерыв 5 минут!',
      breakText: 'Ты занимался 25 минут — молодец! Встань, потянись, посмотри в окно и попей воды. Чат откроется сам.',
      reportTitle: 'Отчёт для родителей',
      reportLoading: 'Готовлю отчёт…',
      reportEmpty: 'Пока нет занятий для отчёта. Задай репетитору хотя бы один вопрос.',
      statQuestions: 'вопросов сегодня',
      statSessions: 'занятий',
      statSubjects: 'предметов',
      print: 'Распечатать / сохранить 🖨️',
    },
    uz: {
      title: 'AI-repetitor',
      subtitle: "O'zimiz o'ylashni o'rganamiz — qadamma-qadam",
      chooseSubject: '1. Fanni tanla',
      chooseGrade: '2. Sinfni tanla',
      start: 'Darsni boshlash 🚀',
      grade: 'sinf',
      reportBtn: 'Ota-onalar uchun hisobot',
      placeholder: 'Masala yoki savolingni yoz…',
      privacy: '🔒 Ismingni, manzilingni, maktabingni va telefoningni yozma.',
      greeting: (s, g) => `Salom! 👋 Bugun ${s}, ${g}-sinf. Masala yoki savolingni yoz — birga hal qilamiz. Tayyor javob bermayman, lekin o'zing topishingga yordam beraman! 💡`,
      thinking: "O'ylayapman…",
      rateLimited: "Juda ko'p so'rov, bir daqiqadan keyin urinib ko'r",
      dailyLimit: "Bugungi savollar tugadi (30 dan 30). Dam ol va masalalarni o'zing yechib ko'r — ertaga davom etamiz! 🌙",
      blocked: "Keling, o'qishga qaytaylik 📚 Maktab fani bo'yicha savol ber.",
      aiError: "AI hozir band. Birozdan keyin qayta urinib ko'r.",
      offline: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'r.",
      tooFrequent: "🤔 Juda tez-tez so'rayapsan. Avval bir-ikki daqiqa o'zing o'ylab ko'r!",
      breakTitle: 'Tanaffus — 5 daqiqa!',
      breakText: "Sen 25 daqiqa shug'ullanding — barakalla! O'rningdan tur, cho'zil, derazaga qara va suv ich. Chat o'zi ochiladi.",
      reportTitle: 'Ota-onalar uchun hisobot',
      reportLoading: 'Hisobot tayyorlanmoqda…',
      reportEmpty: "Hisobot uchun hali darslar yo'q. Repetitorga kamida bitta savol ber.",
      statQuestions: 'bugungi savollar',
      statSessions: 'darslar',
      statSubjects: 'fanlar',
      print: 'Chop etish / saqlash 🖨️',
    },
  };

  // ---------- storage (best-effort; works without it) ----------
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('tutor.' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem('tutor.' + key, JSON.stringify(value)); } catch {}
    },
  };

  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toLocaleDateString('en-CA');

  let lang = store.get('lang', (navigator.language || '').startsWith('uz') ? 'uz' : 'ru');
  let setup = store.get('setup', null);
  let sessions = store.get('sessions', []);
  let deviceId = store.get('deviceId', null);
  if (!deviceId) {
    deviceId = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    store.set('deviceId', deviceId);
  }
  let pendingSubject = setup && setup.subject;
  let pendingGrade = setup && setup.grade;
  let busy = false;

  const t = (key) => T[lang][key];
  const subjectInfo = (key) => SUBJECTS.find((s) => s[0] === key) || SUBJECTS[0];
  const subjectName = (key, l = lang) => subjectInfo(key)[l === 'uz' ? 3 : 2];

  function usage() {
    const u = store.get('usage', null);
    return u && u.day === today() ? u : { day: today(), count: 0, serverRemaining: DAILY_LIMIT };
  }
  function remaining() {
    const u = usage();
    return Math.max(0, Math.min(DAILY_LIMIT - u.count, u.serverRemaining));
  }

  function currentSession() {
    return sessions[sessions.length - 1];
  }
  function saveSessions() {
    sessions = sessions.slice(-MAX_SESSIONS);
    store.set('sessions', sessions);
  }

  // ---------- rendering ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('.lang-btn').forEach((b) => {
      const on = b.dataset.lang === lang;
      b.className = 'lang-btn min-h-11 rounded-xl px-3 text-sm font-extrabold transition ' +
        (on ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600 hover:bg-indigo-100');
      b.setAttribute('aria-pressed', on);
    });
    $('input').placeholder = t('placeholder');
    renderSetupOptions();
    renderStatus();
  }

  function optionClass(on) {
    return 'flex min-h-14 items-center gap-2 rounded-2xl px-3 py-2 text-left text-base font-bold ring-2 transition active:scale-95 ' +
      (on ? 'bg-indigo-600 text-white ring-indigo-600 shadow-md' : 'bg-white text-slate-700 ring-indigo-100 hover:ring-indigo-300');
  }

  function renderSetupOptions() {
    const subjects = $('subjects');
    subjects.innerHTML = '';
    SUBJECTS.forEach(([key, icon]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = optionClass(key === pendingSubject);
      b.innerHTML = `<span class="text-2xl">${icon}</span><span></span>`;
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
      b.className = optionClass(g === pendingGrade) + ' justify-center text-xl';
      b.onclick = () => { pendingGrade = g; renderSetupOptions(); };
      grades.appendChild(b);
    }
    $('startBtn').disabled = !(pendingSubject && pendingGrade);
  }

  function renderStatus() {
    if (setup) {
      $('setupChip').textContent = `${subjectInfo(setup.subject)[1]} ${subjectName(setup.subject)} · ${setup.grade} ${t('grade')}`;
    }
    $('limitText').textContent = `${remaining()}/${DAILY_LIMIT}`;
  }

  function formatReply(text) {
    const esc = text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    return esc
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[*-]\s+/gm, '• ')
      .replace(/^#+\s*/gm, '')
      .replace(/\$([^$\n]+)\$/g, '$1');
  }

  function addBubble(role, text, extra = '') {
    const div = document.createElement('div');
    const base = 'bubble max-w-[88%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-base leading-relaxed shadow-sm ';
    div.className = base + (role === 'user'
      ? 'self-end rounded-br-md bg-indigo-600 text-white'
      : 'self-start rounded-bl-md bg-sky-50 text-slate-800 ring-1 ring-sky-100') + ' ' + extra;
    if (role === 'user') div.textContent = text;
    else div.innerHTML = formatReply(text);
    $('chat').appendChild(div);
    $('chat').scrollTop = $('chat').scrollHeight;
    return div;
  }

  function renderChat() {
    $('chat').innerHTML = '';
    const s = currentSession();
    addBubble('assistant', t('greeting')(subjectName(setup.subject), setup.grade));
    s.messages.forEach((m) => addBubble(m.role, m.content));
  }

  function showNotice(text, ms = 6000) {
    const n = $('notice');
    n.textContent = text;
    n.classList.remove('hidden');
    clearTimeout(showNotice.timer);
    if (ms) showNotice.timer = setTimeout(() => n.classList.add('hidden'), ms);
  }

  function updateInputState() {
    const onBreak = timerState().breakUntil > Date.now();
    const blocked = busy || onBreak || remaining() <= 0;
    $('input').disabled = blocked;
    $('send').disabled = blocked;
  }

  function showScreen(name) {
    $('setup').classList.toggle('hidden', name !== 'setup');
    $('chatScreen').classList.toggle('hidden', name !== 'chat');
    $('chatScreen').classList.toggle('flex', name === 'chat');
    $('statusBar').classList.toggle('hidden', name !== 'chat');
    $('statusBar').classList.toggle('flex', name === 'chat');
    if (name === 'chat') {
      renderChat();
      renderStatus();
      if (remaining() <= 0) showNotice(t('dailyLimit'), 0);
      updateInputState();
    }
  }

  // ---------- setup ----------
  $('startBtn').onclick = () => {
    const changed = !setup || setup.subject !== pendingSubject || setup.grade !== pendingGrade;
    setup = { subject: pendingSubject, grade: pendingGrade };
    store.set('setup', setup);
    const cur = currentSession();
    if (changed || !cur || cur.date !== today()) {
      sessions.push({ date: today(), subject: setup.subject, grade: setup.grade, messages: [] });
      saveSessions();
    }
    showScreen('chat');
    $('input').focus();
  };
  $('changeSetup').onclick = () => {
    pendingSubject = setup.subject;
    pendingGrade = setup.grade;
    renderSetupOptions();
    showScreen('setup');
  };
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.onclick = () => {
      lang = b.dataset.lang;
      store.set('lang', lang);
      applyLang();
      if (!$('chatScreen').classList.contains('hidden')) renderChat();
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

  $('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = $('input').value.trim();
    if (!text || busy) return;
    if (remaining() <= 0) { showNotice(t('dailyLimit'), 0); return; }
    if (timerState().breakUntil > Date.now()) return;

    const s = currentSession();
    s.messages.push({ role: 'user', content: text });
    saveSessions();
    $('input').value = '';
    $('input').style.height = '';
    addBubble('user', text);
    busy = true;
    updateInputState();
    const typing = addBubble('assistant', t('thinking'), 'animate-pulse text-slate-400');

    const fail = (msg) => {
      s.messages.pop();
      saveSessions();
      addBubble('assistant', msg, 'bg-amber-50 ring-amber-200');
    };

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          lang,
          subject: subjectName(setup.subject, 'ru'),
          grade: setup.grade,
          turn: s.messages.filter((m) => m.role === 'user').length,
          messages: s.messages,
        }),
      });
      const data = await r.json().catch(() => ({}));
      typing.remove();
      if (data.reply) {
        s.messages.push({ role: 'assistant', content: data.reply });
        saveSessions();
        addBubble('assistant', data.reply);
        const u = usage();
        u.count += 1;
        u.serverRemaining = typeof data.remaining === 'number' ? data.remaining : u.serverRemaining;
        store.set('usage', u);
        if (data.tooFrequent) showNotice(t('tooFrequent'));
      } else if (data.code === 'daily_limit') {
        const u = usage();
        u.serverRemaining = 0;
        store.set('usage', u);
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
    if (st.breakUntil > now) {
      $('breakOverlay').classList.remove('hidden');
      $('breakOverlay').classList.add('flex');
      $('breakTimer').textContent = mmss(st.breakUntil - now);
    } else {
      if (st.breakUntil) {
        // Break finished: start a fresh 25-minute session.
        st.breakUntil = 0;
        st.start = now;
      } else if (now - st.lastActive > RESTED_MS) {
        // The page was closed long enough to count as a rest.
        st.start = now;
      }
      $('breakOverlay').classList.add('hidden');
      $('breakOverlay').classList.remove('flex');
      const left = SESSION_MS - (now - st.start);
      if (left <= 0) {
        st.breakUntil = now + BREAK_MS;
        $('input').blur();
      }
      $('timerText').textContent = mmss(left);
    }
    st.lastActive = now;
    store.set('timer', st);
    updateInputState();
  }

  // ---------- parent report ----------
  function stat(value, label, color) {
    return `<div class="rounded-2xl ${color} p-3 text-center"><div class="text-2xl font-extrabold">${value}</div><div class="text-xs font-bold opacity-80">${label}</div></div>`;
  }

  async function openReport() {
    $('reportModal').classList.remove('hidden');
    $('reportModal').classList.add('flex');
    const withMessages = sessions.filter((s) => s.messages.some((m) => m.role === 'user'));
    const subjects = new Set(withMessages.map((s) => s.subject));
    $('reportStats').innerHTML =
      stat(usage().count, t('statQuestions'), 'bg-amber-50 text-amber-800') +
      stat(withMessages.length, t('statSessions'), 'bg-sky-50 text-sky-800') +
      stat(subjects.size, t('statSubjects'), 'bg-emerald-50 text-emerald-800');
    const box = $('reportText');
    if (!withMessages.length) { box.textContent = t('reportEmpty'); return; }
    box.textContent = t('reportLoading');
    box.classList.add('animate-pulse');
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
  $('reportBtn').onclick = openReport;
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

  // ---------- start ----------
  if (setup && (!currentSession() || currentSession().date !== today())) {
    sessions.push({ date: today(), subject: setup.subject, grade: setup.grade, messages: [] });
    saveSessions();
  }
  applyLang();
  tick();
  setInterval(tick, 1000);
  showScreen(setup && currentSession() ? 'chat' : 'setup');
})();
