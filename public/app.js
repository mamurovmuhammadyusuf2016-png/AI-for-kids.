(() => {
  // Inside the Android app (android/) the page gets window.NimiAndroid: the phone's text-to-speech,
  // voice input, Google sign-in through Chrome and the colour of the system bars.
  const AndroidApp = window.NimiAndroid || null;
  if (AndroidApp) {
    // Reading aloud for every section (chat, cards, games) goes to the phone's text-to-speech.
    let current = null;
    const done = () => { const u = current; current = null; u?.onend?.(); };
    window.NimiSpeakDone = done;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true, writable: true,
      value: function SpeechSynthesisUtterance(text) { this.text = text; this.lang = ''; this.rate = 1; this.voice = null; },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => { try { return JSON.parse(AndroidApp.voices()).map((l) => ({ lang: l, name: l })); } catch { return []; } },
        speak(u) { current = u; if (!AndroidApp.speak(String(u.text), u.voice?.lang || u.lang || 'ru-RU')) { current = null; u.onerror?.(); } },
        cancel() { AndroidApp.stop(); done(); },
      },
    });
  }
  const DEFAULT_LIMIT = 30;
  const SESSION_MS = 25 * 60 * 1000;
  const BREAK_MS = 5 * 60 * 1000;
  const RESTED_MS = 5 * 60 * 1000;
  const MAX_SESSIONS = 10;

  // Illustrations; swap a path here to change the picture everywhere.
  // logo: the Nimi mascot with its rays (header, sign-in); avatar: the mascot's face in the chat.
  const IMAGES = {
    logo: '/img/logo-mark.png',
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
    ['spanish', 'languages', 'Испанский язык', 'Ispan tili'],
    ['french', 'languages', 'Французский язык', 'Fransuz tili'],
    ['german', 'languages', 'Немецкий язык', 'Nemis tili'],
    ['chinese', 'languages', 'Китайский язык', 'Xitoy tili'],
    ['japanese', 'languages', 'Японский язык', 'Yapon tili'],
    ['korean', 'languages', 'Корейский язык', 'Koreys tili'],
    ['arabic', 'languages', 'Арабский язык', 'Arab tili'],
    ['turkish', 'languages', 'Турецкий язык', 'Turk tili'],
    ['italian', 'languages', 'Итальянский язык', 'Italyan tili'],
    ['portuguese', 'languages', 'Португальский язык', 'Portugal tili'],
    ['hindi', 'languages', 'Язык хинди', 'Hind tili'],
    ['dutch', 'languages', 'Нидерландский язык', 'Niderland tili'],
    ['polish', 'languages', 'Польский язык', 'Polyak tili'],
    ['swedish', 'languages', 'Шведский язык', 'Shved tili'],
  ];
  // On the setup screen these are inside the "Languages" button (the 17 most studied languages).
  const LANGUAGE_SUBJECTS = {
    english: 'EN', russian: 'RU', uzbek: 'UZ', spanish: 'ES', french: 'FR', german: 'DE', chinese: 'ZH', japanese: 'JA', korean: 'KO',
    arabic: 'AR', turkish: 'TR', italian: 'IT', portuguese: 'PT', hindi: 'HI', dutch: 'NL', polish: 'PL', swedish: 'SV',
  };

  const T = {
    ru: {
      title: 'Nimi AI',
      subtitle: 'Твой помощник в учёбе',
      welcomeTitle: 'Привет! Давай учиться вместе',
      welcomeText: 'Я не даю готовых ответов, а помогаю дойти до них самому.',
      chooseSubject: 'Выбери предмет',
      languages: 'Языки',
      chooseGrade: 'Выбери класс',
      start: 'Начать урок',
      grade: 'класс',
      reportBtn: 'Отчёт для родителей',
      reportShort: 'Отчёт',
      menuChange: 'Сменить предмет или класс',
      menuNew: 'Новый чат',
      subscription: 'Подписка',
      adminPanel: 'Админка',
      premiumRequired: 'Этот раздел открывается с бесплатной неделей или подпиской.',
      chatFreeLeft: (n) => `Бесплатных вопросов осталось: ${n}`,
      chatFreeOver: 'Бесплатные вопросы закончились. Чтобы продолжить, оформи подписку или попроси бесплатную неделю: меню ⋮ → «Подписка».',
      historyMenu: 'История чатов',
      photoMark: 'Фото задачи',
      photoTask: 'Фото задачи',
      photoReady: 'Фото задачи прикреплено. Можешь дописать вопрос.',
      photoDefault: 'Помоги разобраться с задачей на фото.',
      photoError: 'Не получилось открыть фото. Попробуй другое.',
      listen: 'Слушать',
      noVoice: 'На этом устройстве нет голоса для этого языка.',
      voiceLimit: 'Голос на сегодня закончился. Попробуй завтра.',
      micDenied: 'Нет доступа к микрофону. Разреши его в настройках браузера.',
      googleInApp: 'Продолжить с Google',
      googleEmbedded: 'Вход через Google не работает во встроенном браузере Telegram, Instagram и других приложений. Откройте сайт в Chrome или Safari (меню ⋮ или … → «Открыть в браузере») или войдите по почте.',
      openInChrome: 'Открыть в Chrome',
      speakNow: 'Говори, я слушаю…',
      language: 'Язык',
      themeToLight: 'Светлая тема',
      themeToDark: 'Тёмная тема',
      share: 'Поделиться',
      back: 'Назад',
      questionsLeft: 'Вопросов осталось:',
      freeQuestionsLeft: 'Бесплатных вопросов:',
      tabHome: 'Главная',
      tabChat: 'Чат',
      tabProgress: 'Прогресс',
      tabDiary: 'Дневник',
      placeholder: 'Задай вопрос…',
      privacy: 'Не пиши своё имя, адрес, школу и телефон.',
      greeting: (s, g) => `Привет! Сегодня ${s}, ${g} класс. Напиши задачу или вопрос — разберём вместе. Готовый ответ я не дам, но помогу дойти до него самому.`,
      thinking: 'Думаю…',
      rateLimited: 'Слишком много запросов, попробуй через минуту',
      dailyLimit: 'На сегодня вопросы закончились. Отдохни и попробуй решить задачи сам — завтра продолжим!',
      tokensOut: 'Токены твоего тарифа на этот месяц закончились. Выбери тариф побольше: меню ⋮ → «Подписка». Или подожди начала следующего месяца.',
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
      emailPh: 'Телефон, почта или логин',
      emailOnlyPh: 'Почта',
      resetPh: 'Телефон или почта',
      getCode: 'Получить код',
      codeSentSms: (p) => `Мы отправили код в SMS на номер ${p}. Введи его ниже.`,
      codeSentEmail: (e) => `Мы отправили код на почту ${e}. Если письма нет, проверь папку «Спам».`,
      codeBack: '← Изменить',
      codeResend: 'Отправить код ещё раз',
      codeResendIn: (s) => `Отправить ещё раз через ${s} с`,
      savePassword: 'Сохранить новый пароль',
      newPasswordPh: 'Новый пароль',
      viaEmail: 'Зарегистрироваться через почту',
      viaPhone: 'Зарегистрироваться по номеру телефона',
      loginViaEmail: 'Войти через почту или логин',
      loginViaPhone: 'Войти по номеру телефона',
      resetByCode: 'Получить код и поставить новый пароль',
      consentTitle: 'Ещё один шаг',
      consentText: 'Чтобы продолжить, отметь согласие с правилами. Второй пункт — по желанию.',
      consentContinue: 'Продолжить',
      passkeyTitle: 'Подтвердите вход',
      passkeyText: 'Пароль верный. Теперь подтвердите, что это вы: Face ID, отпечаток пальца или Windows Hello.',
      passkeyBtn: 'Войти по Face ID',
      passkeyInApp: 'Откроется Chrome: подтвердите там Face ID или отпечаток — и вернётесь в приложение.',
      setupTitle: 'Включите Face ID',
      setupText: 'В админку теперь входят только по Face ID или отпечатку пальца — одного пароля мало. Добавьте свой телефон: дальше войти сможете только вы, с этим телефоном. На компьютере — Windows Hello, Touch ID или телефон по QR-коду.',
      setupBtn: 'Включить Face ID',
      forgot: 'Забыли пароль?',
      forgotText: 'Не переживай! Вот как вернуть вход:',
      forgotParent: 'Если у тебя есть аккаунт родителя — мама или папа могут поставить новый пароль в своём кабинете.',
      forgotWrite: 'Или напиши нам — мы сбросим пароль и пришлём новый:',
      forgotGoogle: 'Если ты входил через Google — просто нажми «Вход с аккаунтом Google».',
      forgotMessage: (email) => `Здравствуйте! Я забыл пароль от Nimi. Моя почта: ${email || '…'}`,
      writeTelegram: 'Написать в Telegram',
      callUs: 'Позвонить',
      privacyLink: 'Правила и конфиденциальность',
      settings: 'Настройки',
      parentCabinet: 'Кабинет родителя',
      adminCabinet: 'Админ-панель',
      passwordPh: 'Пароль',
      confirmPh: 'Повтори пароль',
      passwordHint: 'Минимум 8 символов: буквы и хотя бы одна цифра.',
      loginBtn: 'Войти',
      registerBtn: 'Создать аккаунт',
      or: 'или',
      logout: 'Выйти',
      authNote: 'Мы храним только твой телефон или почту. Пароль хранится в зашифрованном виде, его не видит никто.',
      errors: {
        invalid_email: 'Проверь адрес почты — похоже, в нём ошибка.',
        weak_password: 'Пароль слишком простой: нужно минимум 8 символов, буквы и хотя бы одна цифра.',
        mismatch: 'Пароли не совпадают.',
        email_taken: 'Эта почта уже зарегистрирована. Попробуй войти.',
        invalid_credentials: 'Неверный телефон, почта или пароль.',
        invalid_phone: 'Проверь номер: нужен узбекский номер, например 90 123 45 67.',
        phone_taken: 'Этот номер уже зарегистрирован. Попробуй войти.',
        terms_required: 'Чтобы продолжить, отметь согласие с правилами и политикой конфиденциальности.',
        code_wait: 'Код уже отправлен. Подожди минуту и попробуй снова.',
        code_limit: 'Слишком много запросов кода. Попробуй позже.',
        code_send_failed: 'Не получилось отправить код. Попробуй ещё раз чуть позже.',
        code_expired: 'Код устарел или был введён неверно слишком много раз. Запроси новый.',
        code_wrong: 'Неверный код. Проверь и попробуй снова.',
        use_google: 'Этот аккаунт создан через Google — нажми «Войти через Google».',
        too_many_attempts: 'Слишком много неудачных попыток. Подожди 15 минут и попробуй снова.',
        google_failed: 'Не получилось войти через Google. Попробуй ещё раз.',
        auth_unavailable: 'Вход временно недоступен. Попробуй позже.',
        offline: 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
        passkey_failed: 'Не получилось подтвердить Face ID. Попробуйте ещё раз.',
        passkey_expired: 'Время вышло. Войдите с паролем ещё раз.',
        passkey_unsupported: 'Этот браузер не умеет Face ID. Откройте сайт в Safari или Chrome.',
        passkey_update_app: 'Для Face ID нужна новая версия приложения Nimi. Скачайте её на сайте Nimi (кнопка «Скачать приложение для Android») или войдите через Safari/Chrome.',
      },
    },
    uz: {
      title: 'Nimi AI',
      subtitle: "O'qishdagi yordamching",
      welcomeTitle: "Salom! Keling, birga o'rganamiz",
      welcomeText: "Men tayyor javob bermayman, balki uni o'zing topishingga yordam beraman.",
      chooseSubject: 'Fanni tanla',
      languages: 'Tillar',
      chooseGrade: 'Sinfni tanla',
      start: 'Darsni boshlash',
      grade: 'sinf',
      reportBtn: 'Ota-onalar uchun hisobot',
      reportShort: 'Hisobot',
      menuChange: "Fan yoki sinfni o'zgartirish",
      menuNew: 'Yangi chat',
      subscription: 'Obuna',
      adminPanel: 'Admin panel',
      premiumRequired: "Bu bo'lim bepul hafta yoki obuna bilan ochiladi.",
      chatFreeLeft: (n) => `Qolgan bepul savollar: ${n}`,
      chatFreeOver: "Bepul savollar tugadi. Davom etish uchun obuna rasmiylashtir yoki bepul haftani so'ra: ⋮ menyu → «Obuna».",
      historyMenu: 'Chatlar tarixi',
      photoMark: 'Masala surati',
      photoTask: 'Masala surati',
      photoReady: "Masala surati biriktirildi. Savolingni ham yozishing mumkin.",
      photoDefault: 'Suratdagi masalani tushunishga yordam ber.',
      photoError: "Suratni ochib bo'lmadi. Boshqasini sinab ko'r.",
      listen: 'Tinglash',
      noVoice: "Bu qurilmada bu til uchun ovoz yo'q.",
      voiceLimit: "Bugun uchun ovoz tugadi. Ertaga urinib ko'ring.",
      micDenied: "Mikrofonga ruxsat yo'q. Brauzer sozlamalarida ruxsat ber.",
      googleInApp: 'Google orqali davom etish',
      googleEmbedded: "Google orqali kirish Telegram, Instagram va boshqa ilovalarning ichki brauzerida ishlamaydi. Saytni Chrome yoki Safari'da oching (⋮ yoki … menyusi → «Brauzerda ochish») yoki pochta orqali kiring.",
      openInChrome: "Chrome'da ochish",
      speakNow: 'Gapir, tinglayapman…',
      language: 'Til',
      themeToLight: 'Yorug\' rejim',
      themeToDark: 'Qorong\'i rejim',
      share: 'Ulashish',
      back: 'Orqaga',
      questionsLeft: 'Qolgan savollar:',
      freeQuestionsLeft: 'Bepul savollar:',
      tabHome: 'Bosh sahifa',
      tabChat: 'Chat',
      tabProgress: 'Natijalar',
      tabDiary: 'Kundalik',
      placeholder: 'Savolingni yoz…',
      privacy: 'Ismingni, manzilingni, maktabingni va telefoningni yozma.',
      greeting: (s, g) => `Salom! Bugun ${s}, ${g}-sinf. Masala yoki savolingni yoz — birga hal qilamiz. Tayyor javob bermayman, lekin o'zing topishingga yordam beraman.`,
      thinking: "O'ylayapman…",
      rateLimited: "Juda ko'p so'rov, bir daqiqadan keyin urinib ko'r",
      dailyLimit: "Bugungi savollar tugadi. Dam ol va masalalarni o'zing yechib ko'r — ertaga davom etamiz!",
      tokensOut: "Tarifingning bu oydagi tokenlari tugadi. Kattaroq tarifni tanla: ⋮ menyu → «Obuna». Yoki keyingi oy boshlanishini kut.",
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
      emailPh: 'Telefon, pochta yoki login',
      emailOnlyPh: 'Pochta',
      resetPh: 'Telefon yoki pochta',
      getCode: 'Kodni olish',
      codeSentSms: (p) => `${p} raqamiga SMS orqali kod yubordik. Uni pastga kirit.`,
      codeSentEmail: (e) => `${e} pochtasiga kod yubordik. Xat kelmagan bo'lsa, «Spam» papkasini tekshir.`,
      codeBack: "← O'zgartirish",
      codeResend: 'Kodni qayta yuborish',
      codeResendIn: (s) => `${s} soniyadan keyin qayta yuborish`,
      savePassword: 'Yangi parolni saqlash',
      newPasswordPh: 'Yangi parol',
      viaEmail: "Pochta orqali ro'yxatdan o'tish",
      viaPhone: "Telefon raqam orqali ro'yxatdan o'tish",
      loginViaEmail: 'Pochta yoki login orqali kirish',
      loginViaPhone: 'Telefon raqam orqali kirish',
      resetByCode: "Kod olib, yangi parol qo'yish",
      consentTitle: 'Yana bir qadam',
      consentText: "Davom etish uchun qoidalarga roziligingni belgila. Ikkinchi band — xohishga ko'ra.",
      consentContinue: 'Davom etish',
      passkeyTitle: 'Kirishni tasdiqlang',
      passkeyText: "Parol to'g'ri. Endi bu siz ekaningizni tasdiqlang: Face ID, barmoq izi yoki Windows Hello.",
      passkeyBtn: 'Face ID orqali kirish',
      passkeyInApp: "Chrome ochiladi: u yerda Face ID yoki barmoq izini tasdiqlang — keyin ilovaga qaytasiz.",
      setupTitle: "Face ID'ni yoqing",
      setupText: "Adminkaga endi faqat Face ID yoki barmoq izi bilan kiriladi — parolning o'zi yetmaydi. O'z telefoningizni qo'shing: keyin faqat siz, shu telefon bilan kira olasiz. Kompyuterda — Windows Hello, Touch ID yoki QR-kod orqali telefon.",
      setupBtn: "Face ID'ni yoqish",
      forgot: 'Parolni unutdingmi?',
      forgotText: "Xavotir olma! Kirishni shunday qaytarish mumkin:",
      forgotParent: "Agar ota-ona akkaunting bo'lsa — onang yoki otang o'z kabinetida yangi parol qo'yishi mumkin.",
      forgotWrite: "Yoki bizga yoz — parolni tiklab, yangisini yuboramiz:",
      forgotGoogle: "Agar Google orqali kirgan bo'lsang — «Google orqali kirish» tugmasini bos.",
      forgotMessage: (email) => `Assalomu alaykum! Nimi'dagi parolimni unutdim. Pochtam: ${email || '…'}`,
      writeTelegram: 'Telegramda yozish',
      callUs: "Qo'ng'iroq qilish",
      privacyLink: 'Qoidalar va maxfiylik',
      settings: 'Sozlamalar',
      parentCabinet: 'Ota-ona kabineti',
      adminCabinet: 'Admin panel',
      passwordPh: 'Parol',
      confirmPh: 'Parolni takrorla',
      passwordHint: "Kamida 8 ta belgi: harflar va kamida bitta raqam.",
      loginBtn: 'Kirish',
      registerBtn: 'Akkaunt yaratish',
      or: 'yoki',
      logout: 'Chiqish',
      authNote: "Biz faqat telefoningni yoki pochtangni saqlaymiz. Parol shifrlangan holda saqlanadi, uni hech kim ko'rmaydi.",
      errors: {
        invalid_email: "Pochta manzilini tekshir — xato bor shekilli.",
        weak_password: "Parol juda oddiy: kamida 8 ta belgi, harflar va kamida bitta raqam kerak.",
        mismatch: 'Parollar mos kelmadi.',
        email_taken: "Bu pochta allaqachon ro'yxatdan o'tgan. Kirishga urinib ko'r.",
        invalid_credentials: "Telefon, pochta yoki parol noto'g'ri.",
        invalid_phone: "Raqamni tekshir: O'zbekiston raqami kerak, masalan 90 123 45 67.",
        phone_taken: "Bu raqam allaqachon ro'yxatdan o'tgan. Kirishga urinib ko'r.",
        terms_required: 'Davom etish uchun qoidalar va maxfiylik siyosatiga roziligingni belgila.',
        code_wait: "Kod allaqachon yuborilgan. Bir daqiqa kutib, qayta urinib ko'r.",
        code_limit: "Kod juda ko'p so'raldi. Keyinroq urinib ko'r.",
        code_send_failed: "Kodni yuborib bo'lmadi. Birozdan keyin qayta urinib ko'r.",
        code_expired: "Kod eskirgan yoki ko'p marta noto'g'ri kiritilgan. Yangi kod so'ra.",
        code_wrong: "Kod noto'g'ri. Tekshirib, qayta urinib ko'r.",
        use_google: "Bu akkaunt Google orqali yaratilgan — «Google orqali kirish» tugmasini bos.",
        too_many_attempts: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqa kutib, qayta urinib ko'r.",
        google_failed: "Google orqali kirib bo'lmadi. Qayta urinib ko'r.",
        auth_unavailable: "Kirish vaqtincha ishlamayapti. Keyinroq urinib ko'r.",
        offline: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'r.",
        passkey_failed: "Face ID tasdiqlanmadi. Qayta urinib ko'ring.",
        passkey_expired: 'Vaqt tugadi. Parol bilan qayta kiring.',
        passkey_unsupported: "Bu brauzer Face ID'ni bilmaydi. Saytni Safari yoki Chrome'da oching.",
        passkey_update_app: "Face ID uchun Nimi ilovasining yangi versiyasi kerak. Uni Nimi saytidan yuklab oling («Android uchun ilovani yuklab olish» tugmasi) yoki Safari/Chrome orqali kiring.",
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
  let childEmail = null; // for a parent account: the child's email
  let config = { googleClientId: '', accounts: false };
  let authMode = 'login'; // 'login', 'register' or 'reset' (a new password with a code)
  let regMethod = 'phone'; // sign-up by 'phone' (SMS code) or 'email'
  let loginMethod = 'phone'; // sign-in by 'phone' (+998 field) or 'email' (email or login)
  let authStep = 'form'; // 'form' or 'code'
  let codeCtx = null; // { channel: 'sms' | 'email', to, purpose }
  let resendTimer = null;
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
    return u && u.day === today() ? u.remaining : dailyLimit();
  }
  // Questions per day depend on the plan: Pro 30, Gold 40, MAX 50.
  const dailyLimit = () => user?.plan?.questions || DEFAULT_LIMIT;
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
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function newSession() {
    sessions.push({ id: newId(), created: Date.now(), date: today(), subject: setup.subject, grade: setup.grade, messages: [] });
    saveSessions();
  }

  // ---------- chat history in the account (texts only; photos stay on this device) ----------
  const chatUploads = {};
  const isStudent = () => !!user?.email && (user.role || 'student') === 'student';
  function uploadChat(s) {
    if (!config.accounts || !isStudent() || !s?.id || !s.messages.length) return;
    clearTimeout(chatUploads[s.id]);
    chatUploads[s.id] = setTimeout(() => {
      const chat = {
        id: s.id, date: s.date, subject: s.subject, grade: s.grade,
        messages: s.messages.map((m) => ({ role: m.role, content: m.content, ts: m.ts, ...(m.img || m.photo ? { photo: true } : {}) })),
      };
      postJson('/api/chats/save', { chat }).catch(() => {});
    }, 400);
  }
  // When the chat was last used: its newest message, else when it was started.
  const lastUsed = (s) => Math.max(0, ...s.messages.map((m) => m.ts || 0)) || s.created || Date.parse(s.date) || 0;
  // After sign-in: chats from other devices come here; chats only on this device go to the account.
  async function syncChats() {
    if (!config.accounts || !isStudent()) return;
    let remote;
    try { remote = (await postJson('/api/chats/recent', {})).chats; } catch { return; }
    if (!Array.isArray(remote)) return;
    const local = new Map(sessions.map((x) => [x.id, x]));
    const remoteCount = new Map(remote.map((r) => [r.id, r.messages.length]));
    for (const r of remote) {
      const mine = local.get(r.id);
      if (!mine) { sessions.push({ ...r }); continue; }
      if (r.messages.length > mine.messages.length) {
        const imgs = new Map(mine.messages.filter((m) => m.img).map((m) => [m.ts, m.img]));
        mine.messages = r.messages.map((m) => (imgs.has(m.ts) ? { ...m, img: imgs.get(m.ts) } : m));
      }
    }
    sessions.forEach((x) => { if (x.messages.length > (remoteCount.get(x.id) ?? 0)) uploadChat(x); });
    sessions.sort((a, b) => lastUsed(a) - lastUsed(b));
    saveSessions();
    const cur = currentSession();
    if (setup && (!cur || cur.date !== today() || cur.subject !== setup.subject || cur.grade !== setup.grade)) newSession();
  }
  // Opens a chat from the history and continues it (its subject and class become the current ones).
  function continueChat(chat) {
    let s = sessions.find((x) => x.id === chat.id);
    if (!s) s = { ...chat };
    else if (chat.messages.length > s.messages.length) s.messages = chat.messages;
    s.date = today();
    sessions = sessions.filter((x) => x !== s && (x.messages.length || x !== currentSession()));
    sessions.push(s);
    setup = { subject: s.subject, grade: s.grade };
    store.set('setup', setup);
    saveSessions();
    renderStatus();
    if (!canUse('chat')) return window.NimiLearn?.openSubscribe('chat');
    showScreen('chat');
  }
  function forgetChat(id) {
    const wasCurrent = currentSession()?.id === id;
    sessions = sessions.filter((x) => x.id !== id);
    if (wasCurrent && setup) newSession();
    else saveSessions();
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
        (on ? 'bg-brand-500 text-onfill shadow-lg shadow-brand-500/30' : 'text-slate-300 hover:text-white');
      b.setAttribute('aria-pressed', on);
    });
    renderThemeBtn();
    $('input').placeholder = t('placeholder');
    $('authPassword').placeholder = t('passwordPh');
    $('authConfirm').placeholder = t('confirmPh');
    renderAuthMode();
    renderGoogleButton();
    $('plusBtn').setAttribute('aria-label', t('photoTask'));
    $('micBtn').setAttribute('aria-label', t('speakNow'));
    renderSetupOptions();
    renderStatus();
  }

  // ---------- theme: dark (black, white, blue) or light (white, green) ----------
  const theme = () => document.documentElement.dataset.theme;
  AndroidApp?.setTheme(theme());
  function renderThemeBtn() {
    const label = t(theme() === 'light' ? 'themeToDark' : 'themeToLight');
    $('themeBtn').innerHTML = icon(theme() === 'light' ? 'moon' : 'sun');
    $('themeBtn').setAttribute('aria-label', label);
    $('themeBtn').title = label;
  }
  $('themeBtn').onclick = () => {
    const next = theme() === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'light' ? '#faf7ef' : '#000000';
    try { localStorage.setItem('nimi-theme', next); } catch {}
    AndroidApp?.setTheme(next);
    renderThemeBtn();
    if (!$('auth').classList.contains('hidden')) renderGoogleButton();
  };

  function optionClass(on) {
    return 'flex min-h-14 items-center gap-3 rounded-2xl p-2 pr-3 text-left text-[15px] ring-1 transition active:scale-95 ' +
      (on ? 'bg-brand-500/15 text-white ring-brand-400' : 'bg-night-800 text-slate-200 ring-white/5 hover:bg-night-700');
  }

  let languagesOpen = false;
  function subjectButton(key, badge, label, on, onclick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = optionClass(on);
    b.innerHTML = `<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${on ? 'bg-brand-500 text-onfill' : 'bg-night-700 text-slate-200'}">${badge}</span><span class="min-w-0"></span>`;
    b.lastChild.textContent = label;
    b.onclick = onclick;
    return b;
  }
  function renderSetupOptions() {
    const subjects = $('subjects');
    subjects.innerHTML = '';
    const langPicked = Object.hasOwn(LANGUAGE_SUBJECTS, pendingSubject || '');
    SUBJECTS.filter(([key]) => !Object.hasOwn(LANGUAGE_SUBJECTS, key)).forEach(([key, ic], i) => {
      subjects.appendChild(subjectButton(key, icon(ic), subjectName(key), key === pendingSubject, () => { pendingSubject = key; renderSetupOptions(); }));
      if (i !== 0) return;
      // "Languages" right after math: opens the list of all languages.
      const open = languagesOpen;
      const lb = subjectButton('languages', icon('languages'), langPicked ? `${t('languages')} · ${subjectName(pendingSubject)}` : t('languages'), langPicked,
        () => { languagesOpen = !open; renderSetupOptions(); });
      lb.setAttribute('aria-expanded', String(open));
      lb.insertAdjacentHTML('beforeend', `<span class="ml-auto shrink-0 transition ${open ? 'rotate-180' : ''}">${icon('chevron-down')}</span>`);
      subjects.appendChild(lb);
      if (!open) return;
      const panel = document.createElement('div');
      panel.className = 'col-span-2 grid grid-cols-2 gap-2 rounded-2xl bg-night-900/80 p-2 ring-1 ring-white/5 sm:col-span-3 sm:grid-cols-3';
      Object.entries(LANGUAGE_SUBJECTS).forEach(([key, code]) => {
        // Inside "Languages" the word "язык" is not repeated: "Испанский", "Хинди".
        const short = lang === 'uz' ? subjectName(key) : subjectName(key).replace(/^Язык (.)/, (m, c) => c.toUpperCase()).replace(/ язык$/, '');
        const b = subjectButton(key, code, short, key === pendingSubject, () => { pendingSubject = key; renderSetupOptions(); });
        b.classList.replace('gap-3', 'gap-2');
        b.classList.replace('text-[15px]', 'text-sm');
        b.firstChild.classList.replace('h-10', 'h-8');
        b.firstChild.classList.replace('w-10', 'w-8');
        b.firstChild.classList.replace('text-sm', 'text-xs');
        panel.appendChild(b);
      });
      subjects.appendChild(panel);
    });
    const grades = $('grades');
    grades.innerHTML = '';
    for (let g = 1; g <= 11; g++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g;
      b.className = optionClass(g === pendingGrade) + ' justify-center text-lg font-medium' +
        (g === pendingGrade ? ' bg-brand-500! text-onfill! ring-brand-500' : '');
      b.onclick = () => { pendingGrade = g; renderSetupOptions(); };
      grades.appendChild(b);
    }
    $('startBtn').disabled = !(pendingSubject && pendingGrade);
  }

  function renderStatus() {
    if (setup) $('setupChip').textContent = `${subjectName(setup.subject)} · ${setup.grade} ${lang === 'uz' ? 'sinf' : 'кл.'}`;
    // Without a subscription the chat has a number of free questions for the whole account (20),
    // so the counter shows those instead of the plan's questions per day.
    const free = config.accounts && user && (user.role || 'student') === 'student' && !hasAccess();
    $('limitLabel').textContent = t(free ? 'freeQuestionsLeft' : 'questionsLeft');
    $('limitText').textContent = free ? `${freeLeft('chat')}/${config.billing?.freeTries?.chat || 20}` : `${remaining()}/${dailyLimit()}`;
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
  // Google's voice through the Nimi server, for languages the device has no voice for (almost
  // always Uzbek). One audio element for the whole page: it is "unlocked" right in the tap, so the
  // phone lets it play when the sound arrives a few seconds later.
  const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  let cloudEl = null, cloudUrl = '', cloudDone = null, cloudSeq = 0;
  function cloudFinish(seq) {
    if (seq !== undefined && seq !== cloudSeq) return;
    if (cloudUrl) { URL.revokeObjectURL(cloudUrl); cloudUrl = ''; }
    const d = cloudDone; cloudDone = null; d?.();
  }
  function stopSpeaking() {
    cloudSeq++;
    if (cloudEl) cloudEl.pause();
    cloudFinish();
    if (canSpeak) speechSynthesis.cancel();
  }
  function speakCloud(text, code, onEnd) {
    if (!config.accounts || !user || !window.Audio) return false;
    const seq = ++cloudSeq;
    cloudDone = onEnd || null;
    if (!cloudEl) {
      cloudEl = new Audio();
      cloudEl.onended = () => { if (!cloudEl.src.startsWith('data:')) cloudFinish(cloudSeq); };
      cloudEl.onerror = () => { if (cloudUrl && cloudEl.src === cloudUrl) { cloudFinish(cloudSeq); showNotice(t('noVoice'), 3500); } };
    }
    cloudEl.src = SILENT_WAV;
    cloudEl.play().catch(() => {});
    const fail = (msg) => { if (seq !== cloudSeq) return; cloudFinish(seq); showNotice(msg, 3500); };
    fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: speechText(text), lang: code }) })
      .then(async (r) => {
        if (seq !== cloudSeq) return;
        if (!r.ok) return fail(r.status === 429 ? t('voiceLimit') : t('noVoice'));
        const blob = await r.blob();
        if (seq !== cloudSeq) return;
        cloudUrl = URL.createObjectURL(blob);
        cloudEl.src = cloudUrl;
        await cloudEl.play();
      })
      .catch(() => fail(t('noVoice')));
    return true;
  }
  // code: 'ru' | 'uz' | 'en' | …. Returns false when neither the device nor the server can speak it.
  function speak(text, code, onEnd) {
    stopSpeaking();
    if (!canSpeak) return speakCloud(text, code, onEnd);
    const voice = voiceFor(code);
    if (!voice && code !== 'en') return speakCloud(text, code, onEnd);
    const u = new SpeechSynthesisUtterance(speechText(text));
    u.lang = { ru: 'ru-RU', uz: 'uz-UZ', en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA', tr: 'tr-TR', it: 'it-IT', pt: 'pt-BR', hi: 'hi-IN', nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE' }[code] || code;
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = u.onerror = () => onEnd?.();
    speechSynthesis.speak(u);
    return true;
  }
  if (canSpeak) speechSynthesis.getVoices();
  const textLang = (text) => (/[а-яё]/i.test(text) ? 'ru' : lang === 'uz' ? 'uz' : 'ru');

  const timeLabel = (ts) => (ts ? new Date(ts).toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');

  function addBubble(role, text, { ts, extra = '', img, photo } = {}) {
    const row = document.createElement('div');
    const bubble = document.createElement('div');
    const meta = document.createElement('div');
    meta.className = 'mt-1.5 flex items-center justify-end gap-1 text-xs';
    if (role === 'user') {
      row.className = 'flex justify-end pl-10';
      bubble.className = 'bubble max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md bg-brand-500 px-4 pb-2 pt-3 text-base leading-relaxed text-onfill shadow-lg shadow-brand-500/20 ' + extra;
      if (img) bubble.appendChild(Object.assign(document.createElement('img'), { src: img, alt: '', className: 'mb-2 max-h-48 rounded-2xl object-cover' }));
      else if (photo) {
        const mark = document.createElement('span');
        mark.className = 'mb-1 flex items-center gap-1.5 text-xs text-onfill/80';
        mark.innerHTML = icon('camera', 'h-4 w-4');
        mark.appendChild(document.createTextNode(t('photoMark')));
        bubble.appendChild(mark);
      }
      bubble.appendChild(document.createTextNode(text));
      meta.className += ' text-onfill/70';
      if (ts) meta.innerHTML = `<span>${timeLabel(ts)}</span>${icon('check-check', 'h-4 w-4')}`;
    } else {
      row.className = 'flex items-start gap-3 pr-6';
      row.innerHTML = `<img src="${IMAGES.avatar}" alt="" class="mt-1 h-10 w-10 shrink-0 object-contain">`;
      bubble.className = 'bubble max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-tl-md bg-night-800 px-4 pb-2 pt-3 text-base leading-relaxed text-slate-100 ring-1 ring-white/5 ' + extra;
      bubble.innerHTML = formatReply(text);
      meta.className += ' text-slate-400';
      if (ts) {
        if (canSpeak || config.accounts) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mr-auto -ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white';
          btn.setAttribute('aria-label', t('listen'));
          btn.innerHTML = icon('volume-2', 'h-4 w-4');
          btn.onclick = () => {
            if (btn.dataset.on) { stopSpeaking(); return; }
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
    s.messages.forEach((m) => addBubble(m.role, m.content, { ts: m.ts, img: m.img, photo: m.photo }));
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
  const SCREENS = { landing: 'landing', auth: 'auth', setup: 'setup', home: 'home', chat: 'chatScreen', activity: 'activity', progress: 'progress', diary: 'diary', parent: 'parentHome', admin: 'adminHome' };
  const FLEX_SCREENS = ['landing', 'chat', 'home', 'activity', 'progress', 'diary', 'parent', 'admin'];
  const TAB_OF = { home: 'home', activity: 'home', chat: 'chat', progress: 'progress', diary: 'diary' };
  let currentScreen = '';
  function showScreen(name, arg) {
    currentScreen = name;
    for (const [key, id] of Object.entries(SCREENS)) {
      $(id).classList.toggle('hidden', key !== name);
      if (FLEX_SCREENS.includes(key)) $(id).classList.toggle('flex', key === name);
    }
    const inApp = !!TAB_OF[name];
    $('menuWrap').classList.toggle('hidden', name === 'auth' || name === 'landing');
    $('subtitleLine').textContent = name === 'parent' ? t('parentCabinet') : name === 'admin' ? t('adminCabinet') : t('subtitle');
    if (name === 'landing') window.NimiLearn?.renderLanding();
    if (name === 'parent') window.NimiLearn?.renderParent();
    if (name === 'admin') window.NimiLearn?.openAdmin('adminHome');
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
    languagesOpen = Object.hasOwn(LANGUAGE_SUBJECTS, pendingSubject || '');
    pendingGrade = setup && setup.grade;
    renderSetupOptions();
    showScreen('setup');
  }
  $('changeSetup').onclick = openSetup;
  $('backBtn').onclick = () => setup && showScreen('home');
  // The chat is part of the subscription: after the free week it opens the subscription page.
  const hasAccess = () => !config.accounts || !!user?.admin || !!user?.plan?.active;
  // Without a subscription each paid section has free tries (the server counts them).
  const freeLeft = (key) => Number(user?.free?.[key]) || 0;
  const canUse = (key) => hasAccess() || freeLeft(key) > 0;
  function setFreeLeft(key, n) {
    if (user?.free && typeof n === 'number') user.free[key] = Math.max(0, n);
    renderStatus();
  }
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.onclick = () => (b.dataset.tab === 'chat' && !canUse('chat') ? window.NimiLearn?.openSubscribe('chat') : showScreen(b.dataset.tab));
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
      else if (TAB_OF[currentScreen] || ['landing', 'parent'].includes(currentScreen)) showScreen(currentScreen);
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
  // The Android app's back button: true when the page handled it, false to leave the app.
  window.NimiBack = () => {
    if (!$('reportModal').classList.contains('hidden')) { closeReport(); return true; }
    if (!menu.classList.contains('hidden')) { closeMenu(); return true; }
    if (['activity', 'chat', 'progress', 'diary'].includes(currentScreen) || (currentScreen === 'setup' && setup)) { showScreen('home'); return true; }
    if (currentScreen === 'auth' && config.accounts) { showScreen('landing'); return true; }
    return false;
  };
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
      else if (action === 'settings') window.NimiLearn?.openSettings();
      else if (action === 'admin') window.NimiLearn?.openAdmin();
      else if (action === 'report') openReport();
      else if (action === 'history') window.NimiLearn?.openHistory();
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
  $('historyAction').onclick = () => { plusMenu.classList.add('hidden'); window.NimiLearn?.openHistory(); };
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
  if (Recognition || AndroidApp) $('micBtn').classList.replace('hidden', 'flex');
  function setMic(on) {
    $('micBtn').innerHTML = icon(on ? 'square' : 'mic');
    $('micBtn').classList.toggle('bg-rose-500', on);
    $('micBtn').classList.toggle('text-onfill', on);
    $('micBtn').classList.toggle('animate-pulse', on);
  }
  $('micBtn').onclick = () => {
    if (recognizer) { recognizer.stop(); return; }
    if (!Recognition && AndroidApp) {
      // The phone's own voice input; the result comes back in NimiVoiceResult.
      const before = $('input').value ? $('input').value.trimEnd() + ' ' : '';
      window.NimiVoiceResult = (said) => {
        setMic(false);
        if (!said) return;
        $('input').value = before + said;
        $('input').dispatchEvent(new Event('input'));
      };
      setMic(true);
      AndroidApp.listen(lang === 'uz' ? 'uz-UZ' : 'ru-RU');
      return;
    }
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
    const tryKey = photo ? 'photo' : 'chat';
    if (!canUse(tryKey)) { window.NimiLearn?.openSubscribe(tryKey); return; }
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
        uploadChat(s);
        addBubble('assistant', data.reply, { ts: botMsg.ts });
        setRemaining(data.remaining);
        window.NimiLearn?.markDay();
        if (data.tooFrequent) showNotice(t('tooFrequent'));
        if (typeof data.freeLeft === 'number') {
          setFreeLeft(tryKey, data.freeLeft);
          if (tryKey === 'chat') showNotice(data.freeLeft ? t('chatFreeLeft')(data.freeLeft) : t('chatFreeOver'), data.freeLeft ? 4000 : 0);
        }
      } else if (data.code === 'unauthorized') {
        s.messages.pop();
        saveSessions();
        signedOut();
      } else if (data.code === 'premium_required') {
        fail(t('premiumRequired'));
        await refreshUser();
        window.NimiLearn?.openSubscribe(data.feature || tryKey);
      } else if (data.code === 'daily_limit') {
        setRemaining(0);
        fail(t('dailyLimit'));
      } else if (data.code === 'tokens_out') {
        fail(t('tokensOut'));
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
    // Screen time is for students; parents and staff are not interrupted.
    if (user && user.role && user.role !== 'student') {
      $('breakOverlay').classList.add('hidden');
      $('breakOverlay').classList.remove('flex');
      return;
    }
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
    if (!canUse('report')) return window.NimiLearn?.openSubscribe('report');
    $('reportModal').classList.remove('hidden');
    $('reportModal').classList.add('flex');
    const withMessages = sessions.filter((s) => s.messages.some((m) => m.role === 'user'));
    const subjects = new Set(withMessages.map((s) => s.subject));
    $('reportStats').innerHTML =
      stat(dailyLimit() - remaining(), t('statQuestions')) +
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
      if (typeof data.freeLeft === 'number') setFreeLeft('report', data.freeLeft);
      if (data.code === 'premium_required') { closeReport(); window.NimiLearn?.openSubscribe('report'); return; }
      if (data.report) box.innerHTML = formatReply(data.report);
      else box.textContent = data.code === 'rate_limited' ? t('rateLimited') : data.code === 'tokens_out' ? t('tokensOut') : data.code === 'empty' ? t('reportEmpty') : t('aiError');
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
  if (AndroidApp) $('printReport').classList.add('hidden');
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
  const verify = () => config.verify || {};
  // Phone sign-up shows only once SMS sending is set up on the server.
  const regBy = () => regMethod;
  const loginBy = () => loginMethod;
  // A code at sign-up only when it is turned on (REGISTER_CODES) and that channel can send it.
  const signupCode = (byPhone) => !!verify().register && (byPhone ? !!verify().sms : !!verify().email);
  const PHONE_RE = /^[\d\s+()-]{9,20}$/;
  const phoneDigits = (v) => { const d = String(v || '').replace(/\D/g, ''); return d.length === 9 ? `998${d}` : d; };
  const isPhone = (v) => PHONE_RE.test(String(v || '').trim()) && /^998\d{9}$/.test(phoneDigits(v));
  const isEmailAddr = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  // "998901234567" -> "+998 90 123 45 67" (phone accounts use the number as their name).
  const prettyAccount = (v) => (/^998\d{9}$/.test(v || '') ? `+998 ${v.slice(3, 5)} ${v.slice(5, 8)} ${v.slice(8, 10)} ${v.slice(10)}` : v || '');
  const show = (id, on, display = 'flex') => { $(id).classList.toggle('hidden', !on); $(id).classList.toggle(display, on); };

  function renderAuthMode() {
    const reg = authMode === 'register';
    const reset = authMode === 'reset';
    const code = authStep === 'code';
    document.querySelectorAll('.auth-tab').forEach((b) => {
      const on = b.dataset.mode === (reset ? 'login' : authMode);
      b.className = 'auth-tab min-h-12 rounded-xl text-[15px] font-medium transition ' +
        (on ? 'bg-brand-500 text-onfill shadow-lg shadow-brand-500/30' : 'text-slate-300 hover:text-white');
      b.setAttribute('aria-selected', on);
    });
    const login = authMode === 'login';
    const byPhone = (reg && regBy() === 'phone') || (login && loginBy() === 'phone');
    show('codeStep', code);
    show('phoneWrap', byPhone && !code);
    show('emailWrap', !code && !byPhone);
    show('passwordWrap', reset ? code : !code);
    show('confirmWrap', reset ? code : reg && !code);
    show('passwordHint', reset ? code : reg && !code, 'block');
    show('consentBox', reg && !code);
    show('forgotLink', authMode === 'login', 'block');
    show('methodSwitch', (reg || login) && !code);
    if (!reg || code) $('forgotBox').classList.add('hidden');
    $('authEmail').placeholder = t(reg ? 'emailOnlyPh' : reset ? (verify().sms ? 'resetPh' : 'emailOnlyPh') : 'emailPh');
    $('authEmail').inputMode = reg ? 'email' : 'text';
    $('authPassword').placeholder = t(reset ? 'newPasswordPh' : 'passwordPh');
    $('authPassword').autocomplete = reg || reset ? 'new-password' : 'current-password';
    const needsCode = reg && signupCode(byPhone);
    $('authSubmit').textContent = t(code ? (reset ? 'savePassword' : 'registerBtn') : reset || needsCode ? 'getCode' : reg ? 'registerBtn' : 'loginBtn');
    const way = reg ? regBy() : loginBy();
    $('methodSwitch').innerHTML = icon(way === 'phone' ? 'mail' : 'phone') + '<span></span>';
    $('methodSwitch').lastChild.textContent = t(reg ? (way === 'phone' ? 'viaEmail' : 'viaPhone') : (way === 'phone' ? 'loginViaEmail' : 'loginViaPhone'));
    $('authPhone').autocomplete = login ? 'username' : 'tel-national';
    if (reg) renderConsentBox($('consentBox'));
    if ($('consentGate')) renderConsentBox($('consentGate').querySelector('.flex.flex-col.gap-2'), 'gate');
    // Google sign-in sits under the email way of signing up.
    if (config.googleClientId) $('googleBlock').classList.toggle('hidden', !googleVisible());
    renderResend();
  }

  // The two checkboxes, with the texts the server records: the rules (required) and news (optional).
  function renderConsentBox(box, prefix = 'consent') {
    const texts = config.consent && config.consent.texts;
    if (!texts) return box.replaceChildren();
    const was = { terms: $(`${prefix}Terms`)?.checked, marketing: $(`${prefix}Marketing`)?.checked };
    const row = (id, text, link, checked) => {
      const input = h2('input', { type: 'checkbox', id, className: 'mt-0.5 h-5 w-5 shrink-0 accent-brand-500' });
      input.checked = !!checked;
      const label = h2('label', { className: 'flex cursor-pointer items-start gap-3 rounded-2xl bg-night-800 p-3 text-sm leading-snug text-slate-300 ring-1 ring-white/10' });
      const span = h2('span', { textContent: `${text} ` });
      if (link) span.append(h2('a', { href: '/privacy.html', target: '_blank', className: 'text-brand-400 underline', textContent: t('privacyLink') }));
      label.append(input, span);
      return label;
    };
    box.replaceChildren(
      row(`${prefix}Terms`, texts.terms[lang] || texts.terms.uz, true, was.terms),
      row(`${prefix}Marketing`, texts.marketing[lang] || texts.marketing.uz, false, was.marketing));
  }

  // Accounts made before the consents (or through Google in the app) are asked once after sign-in.
  function askConsent() {
    if ($('consentGate') || !config.consent) return;
    const err = h2('p', { className: 'hidden text-sm text-rose-200' });
    const boxes = h2('div', { className: 'flex flex-col gap-2' });
    renderConsentBox(boxes, 'gate');
    const go = h2('button', { type: 'button', textContent: t('consentContinue'), className: 'min-h-14 rounded-2xl bg-brand-500 text-lg font-semibold text-onfill disabled:bg-night-700' });
    const out = h2('button', { type: 'button', textContent: t('logout'), className: 'min-h-10 text-sm text-slate-400 hover:text-white' });
    const card = h2('div', { className: 'flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-3xl bg-night-900 p-5 ring-1 ring-white/10' });
    card.append(h2('p', { className: 'text-xl font-semibold text-white', textContent: t('consentTitle') }),
      h2('p', { className: 'text-sm text-slate-300', textContent: t('consentText') }), boxes, err, go, out);
    const gate = h2('div', { id: 'consentGate', className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4' });
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.append(card);
    document.body.append(gate);
    go.onclick = async () => {
      if (!$('gateTerms').checked) { err.textContent = t('errors').terms_required; err.classList.remove('hidden'); return; }
      go.disabled = true;
      const r = await postJson('/api/account/consent', { terms: true, marketing: $('gateMarketing').checked, lang }).catch(() => ({}));
      go.disabled = false;
      if (!r.ok) { err.textContent = t('errors').offline; err.classList.remove('hidden'); return; }
      if (user) { user.terms = true; user.marketing = $('gateMarketing').checked; }
      gate.remove();
    };
    out.onclick = () => { gate.remove(); logout(); };
  }
  // ---------- Face ID / fingerprint (WebAuthn passkeys): the second sign-in step for admins ----------
  const b64u = {
    toBuf: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0)).buffer,
    from: (buf) => (buf ? btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : undefined),
  };
  const passkeysSupported = () => !!window.PublicKeyCredential && !!navigator.credentials;
  // Inside the Android app the WebView cannot use passkeys: the app opens /app-passkey.html in Chrome
  // with a one-time ticket and comes back signed in (app 1.2+, Bridge.openPasskey).
  // Returns an error code, or '' when Chrome was opened.
  async function passkeyViaApp(enroll, name) {
    if (!AndroidApp?.openPasskey) return 'passkey_update_app';
    const r = await postJson('/api/auth/passkey/app-ticket', { enroll: !!enroll }).catch(() => ({ code: 'offline' }));
    if (!r.ticket) return r.code || 'passkey_failed';
    AndroidApp.openPasskey(`/app-passkey.html?mode=${enroll ? 'enroll' : 'login'}&lang=${lang}&t=${encodeURIComponent(r.ticket)}${name ? `&name=${encodeURIComponent(name)}` : ''}`);
    return '';
  }
  // Registration: options from the server -> Face ID -> the answer for the server.
  async function passkeyCreate(o) {
    const cred = await navigator.credentials.create({ publicKey: {
      ...o,
      challenge: b64u.toBuf(o.challenge),
      user: { ...o.user, id: b64u.toBuf(o.user.id) },
      excludeCredentials: (o.excludeCredentials || []).map((c) => ({ ...c, id: b64u.toBuf(c.id) })),
    } });
    const r = cred.response;
    return { id: cred.id, rawId: b64u.from(cred.rawId), type: cred.type, clientExtensionResults: cred.getClientExtensionResults(),
      authenticatorAttachment: cred.authenticatorAttachment || undefined,
      response: { clientDataJSON: b64u.from(r.clientDataJSON), attestationObject: b64u.from(r.attestationObject), transports: r.getTransports ? r.getTransports() : [] } };
  }
  async function passkeyGet(o) {
    const cred = await navigator.credentials.get({ publicKey: {
      ...o,
      challenge: b64u.toBuf(o.challenge),
      allowCredentials: (o.allowCredentials || []).map((c) => ({ ...c, id: b64u.toBuf(c.id) })),
    } });
    const r = cred.response;
    return { id: cred.id, rawId: b64u.from(cred.rawId), type: cred.type, clientExtensionResults: cred.getClientExtensionResults(),
      authenticatorAttachment: cred.authenticatorAttachment || undefined,
      response: { clientDataJSON: b64u.from(r.clientDataJSON), authenticatorData: b64u.from(r.authenticatorData), signature: b64u.from(r.signature), userHandle: b64u.from(r.userHandle) } };
  }
  // The password was right and the account has Face ID: one more tap (Safari needs a tap to start it).
  // setup: an admin without Face ID yet adds this device first (the password alone never opens the admin panel).
  function askPasskey(setup = false) {
    $('passkeyGate')?.remove();
    const err = h2('p', { className: 'hidden text-sm text-rose-200' });
    const fail = (code) => { err.textContent = t('errors')[code] || t('errors').passkey_failed; err.classList.remove('hidden'); };
    const go = h2('button', { type: 'button', textContent: t(setup ? 'setupBtn' : 'passkeyBtn'), className: 'min-h-14 rounded-2xl bg-brand-500 text-lg font-semibold text-onfill disabled:bg-night-700' });
    const out = h2('button', { type: 'button', textContent: t('logout'), className: 'min-h-10 text-sm text-slate-400 hover:text-white' });
    const card = h2('div', { className: 'flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-3xl bg-night-900 p-5 ring-1 ring-white/10' });
    card.append(h2('p', { className: 'text-xl font-semibold text-white', textContent: t(setup ? 'setupTitle' : 'passkeyTitle') }),
      h2('p', { className: 'text-sm text-slate-300', textContent: t(setup ? 'setupText' : 'passkeyText') }), err, go, out);
    const gate = h2('div', { id: 'passkeyGate', className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4' });
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.append(card);
    document.body.append(gate);
    if (AndroidApp) card.insertBefore(h2('p', { className: 'text-xs text-slate-400', textContent: t('passkeyInApp') }), err);
    else if (!passkeysSupported()) fail('passkey_unsupported');
    go.onclick = async () => {
      if (AndroidApp) {
        go.disabled = true;
        const code = await passkeyViaApp(setup, setup ? 'Android' : '');
        go.disabled = false;
        return code ? fail(code) : undefined;
      }
      if (!passkeysSupported()) return fail('passkey_unsupported');
      go.disabled = true;
      err.classList.add('hidden');
      try {
        const opts = await postJson(setup ? '/api/auth/passkey/setup-options' : '/api/auth/passkey/options', {});
        if (!opts.challenge) return fail(opts.code);
        let response;
        try { response = await (setup ? passkeyCreate(opts) : passkeyGet(opts)); } catch { return fail('passkey_failed'); }
        const data = await postJson(setup ? '/api/auth/passkey/setup-verify' : '/api/auth/passkey/verify', { response, name: setup ? deviceName() : undefined });
        if (!data.user) return fail(data.code);
        const me = await fetch('/api/auth/me').then((r) => r.json());
        gate.remove();
        childEmail = me.child || null;
        signedIn(me.user || data.user, me.remaining);
      } catch {
        fail('offline');
      } finally {
        go.disabled = false;
      }
    };
    out.onclick = () => { gate.remove(); logout(); };
  }
  // A short name for the device in the admin list ("iPhone", "Android", "Windows"...).
  function deviceName() {
    const ua = navigator.userAgent;
    return /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : '';
  }
  const googleVisible = () => !(authStep === 'code' || authMode === 'reset' || (authMode === 'register' && regBy() === 'phone'));
  function h2(tag, props) { return Object.assign(document.createElement(tag), props); }

  function renderResend() {
    const btn = $('codeResend');
    clearInterval(resendTimer);
    if (!codeCtx || authStep !== 'code') return;
    const tick = () => {
      const left = Math.ceil((codeCtx.until - Date.now()) / 1000);
      btn.disabled = left > 0;
      btn.textContent = left > 0 ? t('codeResendIn')(left) : t('codeResend');
      if (left <= 0) clearInterval(resendTimer);
    };
    tick();
    resendTimer = setInterval(tick, 1000);
  }

  // Asks the server to send a code; on success shows the code step.
  async function requestCode(ctx) {
    $('authSubmit').disabled = true;
    try {
      const r = await postJson('/api/auth/send-code', { channel: ctx.channel, to: ctx.to, purpose: ctx.purpose, lang });
      if (!r.sent) {
        if (r.code === 'code_wait' && authStep === 'code') return;
        return showAuthError(r.code);
      }
      codeCtx = { ...ctx, until: Date.now() + (r.retry || 60) * 1000 };
      authStep = 'code';
      showAuthError(null);
      $('codeSentText').textContent = ctx.channel === 'sms' ? t('codeSentSms')(prettyAccount(ctx.to)) : t('codeSentEmail')(ctx.to);
      $('authCode').value = '';
      renderAuthMode();
      $('authCode').focus();
    } catch {
      showAuthError('offline');
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  function resetAuthFlow() {
    authStep = 'form';
    codeCtx = null;
    clearInterval(resendTimer);
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
    $('menuEmail').textContent = prettyAccount(u.email);
    $('menuEmail').parentElement.classList.toggle('hidden', !u.email);
    const adminItem = document.querySelector('[data-action="admin"]');
    adminItem.classList.toggle('hidden', !u.admin);
    adminItem.classList.toggle('flex', !!u.admin);
    const student = (u.role || 'student') === 'student';
    document.querySelectorAll('.student-only').forEach((el) => {
      el.classList.toggle('hidden', !student);
      el.classList.toggle('flex', student);
    });
    if (u.role === 'admin') { adminItem.classList.add('hidden'); adminItem.classList.remove('flex'); }
    document.querySelector('[data-action="subscribe"]').classList.toggle('hidden', !config.accounts || !student);
    document.querySelector('[data-action="logout"]').classList.toggle('hidden', !u.email);
    $('authForm').reset();
    resetAuthFlow();
    showAuthError(null);
    // Parents and staff have their own single screen.
    if (u.role === 'parent' || u.role === 'admin') return showScreen(u.role);
    setup = store.get('setup', null);
    sessions = store.get('sessions', []);
    sessions.forEach((x) => { if (!x.id) x.id = newId(); });
    pendingSubject = setup && setup.subject;
    languagesOpen = Object.hasOwn(LANGUAGE_SUBJECTS, pendingSubject || '');
    pendingGrade = setup && setup.grade;
    setRemaining(left);
    if (setup && (!currentSession() || currentSession().date !== today())) newSession();
    renderSetupOptions();
    renderStatus();
    Promise.allSettled([window.NimiLearn?.load(), syncChats()]).finally(() => {
      showScreen(setup && currentSession() ? 'home' : 'setup');
      if (!u.terms) askConsent();
    });
  }

  function signedOut() {
    user = null;
    account = '';
    setup = null;
    sessions = [];
    showScreen('landing');
    renderGoogleButton();
  }

  // Opens the sign-in form: mode 'login' or 'register'; way 'email' for logins like parent-123456.
  function showAuth(mode = 'login', way) {
    authMode = mode;
    if (way) loginMethod = way;
    resetAuthFlow();
    renderAuthMode();
    showAuthError(null);
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
      if (data.twoFactor === 'passkey' || data.twoFactor === 'passkey_setup') return askPasskey(data.twoFactor === 'passkey_setup');
      if (!data.user) return showAuthError(data.code);
      const me = await fetch('/api/auth/me').then((r) => r.json());
      childEmail = me.child || null;
      signedIn(me.user || data.user, me.remaining);
    } catch {
      showAuthError('offline');
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  // "Forgot password": the parent can set a new one, or the owner resets it on request.
  $('forgotLink').onclick = () => {
    const box = $('forgotBox');
    const show = box.classList.contains('hidden');
    box.classList.toggle('hidden', !show);
    box.classList.toggle('flex', show);
    if (!show) return;
    const b = config.billing || {};
    const msg = t('forgotMessage')($('authEmail').value.trim());
    const p = (text, cls = 'text-sm text-slate-300') => Object.assign(document.createElement('p'), { className: cls, textContent: text });
    const link = (href, label, primary) => Object.assign(document.createElement('a'), {
      href, target: '_blank', rel: 'noopener', textContent: label,
      className: `flex min-h-12 items-center justify-center rounded-2xl px-4 font-semibold ${primary ? 'bg-brand-500 text-onfill' : 'bg-night-700 text-slate-100'}`,
    });
    box.replaceChildren(p(t('forgotText'), 'font-semibold text-white'));
    if (verify().sms || verify().email) {
      const byCode = Object.assign(document.createElement('button'), {
        type: 'button', textContent: t('resetByCode'),
        className: 'flex min-h-12 items-center justify-center rounded-2xl bg-brand-500 px-4 font-semibold text-onfill',
      });
      byCode.onclick = () => { authMode = 'reset'; resetAuthFlow(); showAuthError(null); renderAuthMode(); $('authEmail').focus(); };
      box.append(byCode);
    }
    box.append(p(`1. ${t('forgotParent')}`), p(`2. ${t('forgotWrite')}`));
    if (b.telegram) box.append(link(`https://t.me/${encodeURIComponent(b.telegram)}?text=${encodeURIComponent(msg)}`, t('writeTelegram'), true));
    if (b.phone) box.append(link(`tel:${b.phone.replace(/[^\d+]/g, '')}`, `${t('callUs')}: ${b.phone}`, false));
    box.append(p(t('forgotGoogle'), 'text-xs text-slate-400'));
  };

  document.querySelectorAll('.auth-tab').forEach((b) => {
    b.onclick = () => { authMode = b.dataset.mode; resetAuthFlow(); showAuthError(null); renderAuthMode(); };
  });
  $('methodSwitch').onclick = () => {
    if (authMode === 'login') loginMethod = loginMethod === 'phone' ? 'email' : 'phone';
    else regMethod = regMethod === 'phone' ? 'email' : 'phone';
    showAuthError(null);
    renderAuthMode();
  };
  $('codeBack').onclick = () => { resetAuthFlow(); showAuthError(null); renderAuthMode(); };
  $('codeResend').onclick = () => { if (codeCtx) requestCode(codeCtx); };
  $('authCode').addEventListener('input', () => { $('authCode').value = $('authCode').value.replace(/\D/g, '').slice(0, 6); });
  $('togglePassword').onclick = () => {
    const show = $('authPassword').type === 'password';
    $('authPassword').type = show ? 'text' : 'password';
    $('authConfirm').type = show ? 'text' : 'password';
    $('togglePassword').innerHTML = icon(show ? 'eye-off' : 'eye');
  };
  function passwordProblem() {
    const password = $('authPassword').value;
    if (password.length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password)) return 'weak_password';
    if (password !== $('authConfirm').value) return 'mismatch';
    return null;
  }

  $('authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = $('authPassword').value;
    const id = $('authEmail').value.trim();
    // A new password with a code.
    if (authMode === 'reset') {
      if (authStep === 'form') {
        const channel = isPhone(id) ? 'sms' : 'email';
        if (channel === 'sms' ? !verify().sms : !isEmailAddr(id) || !verify().email) return showAuthError(isPhone(id) || !isEmailAddr(id) ? 'invalid_email' : 'auth_unavailable');
        return requestCode({ channel, to: channel === 'sms' ? phoneDigits(id) : id, purpose: 'reset' });
      }
      const problem = passwordProblem();
      if (problem) return showAuthError(problem);
      return finishAuth(postJson('/api/auth/reset', { channel: codeCtx.channel, to: codeCtx.to, code: $('authCode').value, password }));
    }
    if (authMode === 'register') {
      if (authStep === 'code') {
        const body = { password, code: $('authCode').value, terms: true, marketing: !!$('consentMarketing')?.checked, lang };
        body[codeCtx.channel === 'sms' ? 'phone' : 'email'] = codeCtx.to;
        return finishAuth(postJson('/api/auth/register', body));
      }
      const byPhone = regBy() === 'phone';
      const to = byPhone ? phoneDigits($('authPhone').value) : id;
      if (byPhone ? !isPhone($('authPhone').value) : !isEmailAddr(id)) return showAuthError(byPhone ? 'invalid_phone' : 'invalid_email');
      const problem = passwordProblem();
      if (problem) return showAuthError(problem);
      if (!$('consentTerms')?.checked) return showAuthError('terms_required');
      if (signupCode(byPhone)) return requestCode({ channel: byPhone ? 'sms' : 'email', to, purpose: 'register' });
      const fields = byPhone ? { phone: to } : { email: to };
      return finishAuth(postJson('/api/auth/register', { ...fields, password, terms: true, marketing: !!$('consentMarketing')?.checked, lang }));
    }
    if (loginBy() === 'phone') {
      if (!isPhone($('authPhone').value)) return showAuthError('invalid_phone');
      if (!password) return showAuthError('invalid_credentials');
      return finishAuth(postJson('/api/auth/login', { email: phoneDigits($('authPhone').value), password }));
    }
    const isLogin = /^[a-z0-9][a-z0-9-]{2,31}$/i.test(id);
    if (!isEmailAddr(id) && !isLogin && !isPhone(id)) return showAuthError('invalid_email');
    if (!password) return showAuthError('invalid_credentials');
    finishAuth(postJson('/api/auth/login', { email: isPhone(id) ? phoneDigits(id) : id, password }));
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
    if (AndroidApp) {
      // Google does not allow its sign-in inside an app: the app opens it in Chrome and comes back signed in.
      $('googleBlock').classList.toggle('hidden', !googleVisible());
      $('googleBtn').innerHTML = '';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'flex min-h-11 w-full max-w-[400px] items-center justify-center gap-3 rounded-full bg-night-800 px-5 text-[15px] font-medium text-white ring-1 ring-white/15 hover:bg-night-700';
      b.innerHTML = '<svg viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
      b.appendChild(document.createTextNode(t('googleInApp')));
      b.onclick = () => AndroidApp.googleLogin(lang);
      $('googleBtn').appendChild(b);
      return;
    }
    // Telegram, Instagram and other apps open links in their own browser, where Google blocks sign-in.
    const embedded = /; wv\)|Instagram|FBAN|FBAV|FB_IAB|Telegram|TikTok|musical_ly|Line\//i.test(navigator.userAgent);
    $('googleNote')?.remove();
    if (embedded) {
      const note = document.createElement('div');
      note.id = 'googleNote';
      note.className = 'mb-3 flex flex-col gap-2 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100 ring-1 ring-amber-400/30';
      note.appendChild(Object.assign(document.createElement('p'), { textContent: t('googleEmbedded') }));
      if (/Android/i.test(navigator.userAgent)) {
        const a = document.createElement('a');
        a.className = 'flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-4 font-semibold text-onfill';
        a.href = `intent://${location.host}/#Intent;scheme=https;package=com.android.chrome;end`;
        a.textContent = t('openInChrome');
        note.appendChild(a);
      }
      $('googleBlock').prepend(note);
    }
    try { await loadGoogle(); } catch { return; }
    if (!gisReady) {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: (resp) => {
          if (authMode === 'register' && !$('consentTerms')?.checked) return showAuthError('terms_required');
          const consent = authMode === 'register' ? { terms: true, marketing: !!$('consentMarketing')?.checked, lang } : {};
          finishAuth(postJson('/api/auth/google', { credential: resp.credential, ...consent }));
        },
        ux_mode: 'popup',
      });
      gisReady = true;
    }
    $('googleBlock').classList.toggle('hidden', !googleVisible());
    $('googleBtn').innerHTML = '';
    google.accounts.id.renderButton($('googleBtn'), {
      theme: theme() === 'light' ? 'outline' : 'filled_black',
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
  // The question field on the home screen: opens the chat and sends the question.
  function askText(text) {
    if (!canUse('chat')) { window.NimiLearn?.openSubscribe('chat'); return; }
    showScreen('chat');
    if (!text) { $('input').focus(); return; }
    $('input').value = text;
    $('input').dispatchEvent(new Event('input'));
    $('form').requestSubmit();
  }

  window.Nimi = {
    t, icon, store, today, postJson, showScreen, openReport, openSetup, subjectName, gradeLabel, formatReply, speak, askWithPhoto,
    SUBJECTS,
    get lang() { return lang; },
    get setup() { return setup; },
    get user() { return user; },
    get account() { return account; },
    get accounts() { return !!config.accounts; },
    get faceId() { return !!config.faceId; },
    get billing() { return config.billing || {}; },
    hasAccess,
    canUse,
    freeLeft,
    setFreeLeft,
    continueChat,
    forgetChat,
    refreshUser,
    showAuth,
    prettyAccount,
    askText,
    passkeyCreate,
    passkeysSupported,
    passkeyViaApp,
    get inApp() { return !!AndroidApp; },
    remaining,
    dailyLimit,
    get child() { return childEmail; },
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
      childEmail = me.child || null;
      if (me.user) return signedIn(me.user, me.remaining);
      if (me.twoFactor === 'passkey' || me.twoFactor === 'passkey_setup') { signedOut(); return askPasskey(me.twoFactor === 'passkey_setup'); }
    } catch {}
    signedOut();
  })();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
