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
      privacyTitle: 'Правила и конфиденциальность',
      settingsPage: {
        title: 'Настройки',
        account: 'Твой аккаунт',
        parentTitle: 'Аккаунт родителя',
        parentText: 'Дай этот логин и пароль маме или папе. Они смогут войти в Nimi и видеть твой прогресс, домашние задания и подписку. Твои сообщения в чате они не видят.',
        login: 'Логин',
        password: 'Пароль',
        show: 'Показать',
        hide: 'Скрыть',
        copy: 'Скопировать',
        copied: 'Скопировано',
        newPw: 'Новый пароль для родителя',
      },
      parentPage: {
        title: 'Кабинет родителя',
        child: 'Ваш ребёнок',
        noAccessYet: 'Все разделы пока закрыты. Напишите нам — подключим бесплатную неделю.',
        accessUntil: (kind, d) => `${kind} до ${d}`,
        streak: 'дней подряд',
        today: 'вопросов сегодня',
        topics: 'Темы',
        noTopics: 'Ребёнок ещё не решал задания. Темы появятся после первой тренировки.',
        homework: 'Домашние задания',
        noHomework: 'Невыполненных заданий нет.',
        reportNeedsSub: 'Отчёт ИИ доступен с бесплатной неделей или подпиской.',
        childPw: 'Пароль ребёнка',
        childPwText: 'Если ребёнок забыл пароль — задайте новый (минимум 8 символов, буквы и цифра).',
        newChildPwPh: 'Новый пароль ребёнка',
        childPwSave: 'Сохранить пароль',
        childPwDone: 'Готово! Ребёнок может войти с новым паролем.',
        childPwBad: 'Пароль слишком простой: минимум 8 символов, буквы и хотя бы одна цифра.',
      },
      landing: {
        title: 'Nimi AI — репетитор, который учит думать',
        lead: 'Помогает школьникам 1–11 класса понять тему, а не списать ответ. На русском и узбекском.',
        start: 'Начать',
        login: 'У меня уже есть аккаунт',
        whyTitle: 'Почему родителям нравится Nimi',
        why: [
          ['lightbulb', 'Не даёт списывать', 'Ведёт вопросами и подсказками — ребёнок доходит до ответа сам.'],
          ['shield-check', 'Безопасно для детей', 'Только учёба. Не спрашивает имя, адрес, школу и телефон.'],
          ['users', 'Отчёты для родителей', 'Свой кабинет: прогресс, темы, домашние задания.'],
          ['clock', 'Бережёт глаза', 'После 25 минут занятий — перерыв 5 минут.'],
        ],
        insideTitle: 'Что внутри',
        inside: ['Чат с учителем', 'Фото задачи', 'Голос', 'Тренировки', 'Тесты', 'Экзамены и DTM', 'Олимпиада', 'Чтение', 'Карточки слов', 'Битва с монстрами', 'Дневник'],
        howTitle: 'Как начать',
        how: ['Зарегистрируйтесь — это бесплатно. Карточки, игры и дневник открыты сразу.', 'Напишите нам в Telegram — познакомимся и подключим бесплатную неделю.', 'Понравится — оформите подписку.'],
        priceTitle: 'Тарифы',
        priceText: 'Во всех тарифах всё включено: чат, фото задачи, голос, тренировки, экзамены, отчёты для родителей. Отличаются скорость ответов, вопросы в день и токены.',
        parentTitle: 'Вы родитель?',
        parentText: 'Логин и пароль родителя ребёнок найдёт у себя в Nimi: меню ⋮ → «Настройки».',
        parentLogin: 'Войти как родитель',
      },
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
        games: ['Игры', 'Битва с монстрами и счёт'],
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
      games: 'Игры',
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
      sub: {
        title: 'Подписка Nimi',
        price: (p) => `${p} в месяц`,
        includes: ['Чат с учителем', 'Фото задачи и голос', 'Тренировки, тесты, чтение', 'Экзамены и олимпиада', 'Отчёт для родителей'],
        freeLeft: 'Без подписки остаются карточки слов, игры на счёт и дневник.',
        trial: (n) => `Бесплатная неделя: осталось ${n} ${plural(n, 'день', 'дня', 'дней')}`,
        active: (d) => `Подписка активна до ${d}`,
        ending: (n) => `Подписка закончится через ${n} ${plural(n, 'день', 'дня', 'дней')} — не забудь продлить`,
        expired: 'Подписка закончилась',
        expiredText: 'Карточки, игры и дневник по-прежнему открыты. Чтобы снова пользоваться чатом и заданиями, продли подписку.',
        none: 'Открой все разделы',
        noneText: 'Напиши нам — подключим бесплатную неделю. Карточки, игры и дневник уже открыты.',
        trialAsk: 'Получить бесплатную неделю',
        trialTitle: 'Бесплатная неделя',
        trialText: 'Напиши или позвони нам — мы познакомимся и включим тебе 7 дней со всеми разделами бесплатно.',
        trialMessage: (id, email) => `Здравствуйте! Хочу бесплатную неделю Nimi. Заявка №${id}, аккаунт: ${email}`,
        trialStep: 'Напиши или позвони — включим бесплатную неделю:',
        orPaid: 'Или сразу оформи подписку:',
        months: 'На сколько месяцев?',
        monthLabel: (m) => `${m} мес.`,
        order: 'Оформить подписку',
        renew: 'Продлить подписку',
        request: (id) => `Заявка №${id} создана`,
        step1: (sum) => `Переведи ${sum} на карту:`,
        copy: 'Скопировать',
        copied: 'Скопировано',
        step2: 'Напиши или позвони — подписку включат после проверки оплаты:',
        telegram: 'Написать в Telegram',
        call: 'Позвонить',
        noContacts: 'Контакты для оплаты скоро появятся. Загляни позже.',
        step3: 'Подписка включится после проверки. Потом нажми «Проверить статус».',
        check: 'Проверить статус',
        message: (m, id, email, plan) => `Здравствуйте! Хочу подписку Nimi ${plan} на ${m} мес. Заявка №${id}, аккаунт: ${email}`,
        plansTitle: 'Выбери тариф',
        perDay: (n) => `${n} вопросов в день`,
        speed: { pro: 'Быстрые ответы', gold: 'Ещё быстрее', max: 'Самые быстрые' },
        perMonthShort: 'сум/мес',
        inLabel: 'Вход',
        outLabel: 'Выход',
        allPlans: 'Во всех тарифах',
        tokensHint: 'Токены — это кусочки текста. Вход — твои вопросы и фото, выход — ответы Nimi. Чем больше тариф, тем больше можно спрашивать за месяц.',
        usageTitle: 'Токены в этом месяце',
        usageIn: 'Вход (твои вопросы)',
        usageOut: 'Выход (ответы Nimi)',
        of: (a, b) => `${a} из ${b}`,
        from: (p) => `от ${p}`,
        million: 'млн',
        thousand: 'тыс.',
        locked: 'По подписке',
        open: 'Подписка',
      },
      admin: {
        title: 'Админка',
        pending: 'Заявки',
        none: 'Новых заявок нет.',
        grant: (m) => (m ? `Включить ${m} мес.` : 'Включить неделю'),
        enable: 'Включить',
        week: 'Бесплатная неделя',
        reject: 'Отклонить',
        manual: 'Включить подписку вручную',
        emailPh: 'Почта ученика',
        done: (email, d) => `Готово: ${email} — подписка до ${d}`,
        status: { pending: 'ждёт', paid: 'оплачено', granted: 'выдано', rejected: 'отклонено' },
        notFound: 'Аккаунт с такой почтой не найден.',
        students: 'Ученики',
        searchPh: 'Поиск по почте',
        noUsers: 'Никого не нашли.',
        registered: (d) => `с ${d}`,
        until: (d) => `до ${d}`,
        noAccess: 'без доступа',
        resetPw: 'Новый пароль',
        newPw: (email) => `Новый пароль для ${email}:`,
        del: 'Удалить',
        delConfirm: (email) => `Удалить ${email} вместе с прогрессом и аккаунтом родителя? Это нельзя отменить.`,
        delYes: 'Да, удалить',
        cancel: 'Отмена',
      },
      loadingTasks: 'Готовлю задания… Это займёт до 30 секунд.',
      loadingText: 'Подбираю текст… Это займёт до 30 секунд.',
      loadingWords: 'Составляю набор слов…',
      loadingTopics: 'Загружаю темы…',
      errors: {
        learn_limit: 'На сегодня новые задания закончились (20 наборов). Повтори карточки или поиграй в игры на счёт.',
        tokens_out: 'Токены твоего тарифа на этот месяц закончились. Выбери тариф побольше: меню ⋮ → «Подписка».',
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
      privacyTitle: 'Qoidalar va maxfiylik',
      settingsPage: {
        title: 'Sozlamalar',
        account: 'Sening akkaunting',
        parentTitle: 'Ota-ona akkaunti',
        parentText: "Bu login va parolni onang yoki otangga ber. Ular Nimi'ga kirib, natijalaring, uy vazifalaring va obunangni ko'ra oladi. Chatdagi xabarlaringni ko'rmaydi.",
        login: 'Login',
        password: 'Parol',
        show: "Ko'rsatish",
        hide: 'Yashirish',
        copy: 'Nusxalash',
        copied: 'Nusxalandi',
        newPw: 'Ota-ona uchun yangi parol',
      },
      parentPage: {
        title: 'Ota-ona kabineti',
        child: 'Farzandingiz',
        noAccessYet: "Hozircha barcha bo'limlar yopiq. Bizga yozing — bepul haftani yoqib beramiz.",
        accessUntil: (kind, d) => `${kind}: ${d} gacha`,
        streak: 'kun ketma-ket',
        today: 'bugungi savollar',
        topics: 'Mavzular',
        noTopics: "Farzandingiz hali topshiriq yechmagan. Mavzular birinchi mashqdan keyin paydo bo'ladi.",
        homework: 'Uy vazifalari',
        noHomework: "Bajarilmagan vazifalar yo'q.",
        reportNeedsSub: 'AI hisoboti bepul hafta yoki obuna bilan ochiladi.',
        childPw: 'Farzand paroli',
        childPwText: "Agar farzandingiz parolni unutgan bo'lsa — yangisini qo'ying (kamida 8 ta belgi, harflar va raqam).",
        newChildPwPh: 'Farzandning yangi paroli',
        childPwSave: 'Parolni saqlash',
        childPwDone: 'Tayyor! Farzandingiz yangi parol bilan kira oladi.',
        childPwBad: 'Parol juda oddiy: kamida 8 ta belgi, harflar va kamida bitta raqam.',
      },
      landing: {
        title: "Nimi AI — o'ylashni o'rgatadigan repetitor",
        lead: "1–11-sinf o'quvchilariga javobni ko'chirishga emas, mavzuni tushunishga yordam beradi. Rus va o'zbek tillarida.",
        start: 'Boshlash',
        login: 'Menda akkaunt bor',
        whyTitle: "Nega ota-onalarga Nimi yoqadi",
        why: [
          ['lightbulb', "Ko'chirishga yo'l qo'ymaydi", "Savol va maslahatlar bilan yo'naltiradi — bola javobni o'zi topadi."],
          ['shield-check', 'Bolalar uchun xavfsiz', "Faqat o'qish. Ism, manzil, maktab va telefonni so'ramaydi."],
          ['users', 'Ota-onalar uchun hisobot', "Alohida kabinet: natijalar, mavzular, uy vazifalari."],
          ['clock', "Ko'zni asraydi", "25 daqiqa mashg'ulotdan keyin — 5 daqiqa tanaffus."],
        ],
        insideTitle: 'Ichida nimalar bor',
        inside: ["O'qituvchi bilan chat", 'Masala surati', 'Ovoz', 'Mashqlar', 'Testlar', 'Imtihonlar va DTM', 'Olimpiada', "O'qish", "So'z kartochkalari", 'Maxluqlar jangi', 'Kundalik'],
        howTitle: 'Qanday boshlash kerak',
        how: ["Ro'yxatdan o'ting — bu bepul. Kartochkalar, o'yinlar va kundalik darhol ochiladi.", 'Bizga Telegramda yozing — tanishamiz va bepul haftani yoqamiz.', "Yoqsa — obuna rasmiylashtiring."],
        priceTitle: 'Tariflar',
        priceText: "Barcha tariflarda hammasi bor: chat, masala surati, ovoz, mashqlar, imtihonlar, ota-onalar uchun hisobot. Javob tezligi, kunlik savollar va tokenlar farq qiladi.",
        parentTitle: 'Siz ota-onamisiz?',
        parentText: "Ota-ona login va parolini farzandingiz Nimi'da topadi: ⋮ menyu → «Sozlamalar».",
        parentLogin: 'Ota-ona sifatida kirish',
      },
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
        games: ["O'yinlar", 'Maxluqlar jangi va hisob'],
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
      games: "O'yinlar",
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
      sub: {
        title: 'Nimi obunasi',
        price: (p) => `oyiga ${p}`,
        includes: ["O'qituvchi bilan chat", 'Masala surati va ovoz', 'Mashqlar, testlar, o\'qish', 'Imtihonlar va olimpiada', 'Ota-onalar uchun hisobot'],
        freeLeft: "Obunasiz so'z kartochkalari, hisob o'yinlari va kundalik ochiq qoladi.",
        trial: (n) => `Bepul hafta: ${n} kun qoldi`,
        active: (d) => `Obuna ${d} gacha faol`,
        ending: (n) => `Obuna ${n} kundan keyin tugaydi — uzaytirishni unutma`,
        expired: 'Obuna tugadi',
        expiredText: "Kartochkalar, o'yinlar va kundalik ochiq. Chat va topshiriqlardan yana foydalanish uchun obunani uzaytir.",
        none: "Barcha bo'limlarni och",
        noneText: "Bizga yoz — bepul haftani yoqib beramiz. Kartochkalar, o'yinlar va kundalik allaqachon ochiq.",
        trialAsk: 'Bepul hafta olish',
        trialTitle: 'Bepul hafta',
        trialText: "Bizga yoz yoki qo'ng'iroq qil — tanishamiz va barcha bo'limlarni 7 kunga bepul yoqib beramiz.",
        trialMessage: (id, email) => `Assalomu alaykum! Nimi bepul haftasini olmoqchiman. Ariza №${id}, akkaunt: ${email}`,
        trialStep: "Yoz yoki qo'ng'iroq qil — bepul haftani yoqamiz:",
        orPaid: 'Yoki darhol obuna rasmiylashtir:',
        months: 'Necha oyga?',
        monthLabel: (m) => `${m} oy`,
        order: 'Obuna rasmiylashtirish',
        renew: 'Obunani uzaytirish',
        request: (id) => `№${id} ariza yaratildi`,
        step1: (sum) => `${sum}ni kartaga o'tkaz:`,
        copy: 'Nusxalash',
        copied: 'Nusxalandi',
        step2: "Yoz yoki qo'ng'iroq qil — to'lov tekshirilgach obuna yoqiladi:",
        telegram: 'Telegramda yozish',
        call: "Qo'ng'iroq qilish",
        noContacts: "To'lov uchun kontaktlar tez orada paydo bo'ladi. Keyinroq kirib ko'r.",
        step3: "Tekshiruvdan keyin obuna yoqiladi. So'ng «Holatni tekshirish»ni bos.",
        check: 'Holatni tekshirish',
        message: (m, id, email, plan) => `Assalomu alaykum! Nimi ${plan} obunasini ${m} oyga olmoqchiman. Ariza №${id}, akkaunt: ${email}`,
        plansTitle: 'Tarifni tanla',
        perDay: (n) => `kuniga ${n} ta savol`,
        speed: { pro: 'Tez javoblar', gold: 'Yanada tez', max: 'Eng tez' },
        perMonthShort: "so'm/oy",
        inLabel: 'Kirish',
        outLabel: 'Chiqish',
        allPlans: 'Barcha tariflarda',
        tokensHint: "Tokenlar — matn bo'laklari. Kirish — sening savollaring va suratlaring, chiqish — Nimi javoblari. Tarif qanchalik katta bo'lsa, oyiga shuncha ko'p so'rash mumkin.",
        usageTitle: 'Bu oydagi tokenlar',
        usageIn: 'Kirish (sening savollaring)',
        usageOut: 'Chiqish (Nimi javoblari)',
        of: (a, b) => `${a} / ${b}`,
        from: (p) => `${p}dan`,
        million: 'mln',
        thousand: 'ming',
        locked: 'Obuna bilan',
        open: 'Obuna',
      },
      admin: {
        title: 'Admin panel',
        pending: 'Arizalar',
        none: "Yangi arizalar yo'q.",
        grant: (m) => (m ? `${m} oyga yoqish` : 'Haftani yoqish'),
        enable: 'Yoqish',
        week: 'Bepul hafta',
        reject: 'Rad etish',
        manual: "Obunani qo'lda yoqish",
        emailPh: "O'quvchi pochtasi",
        done: (email, d) => `Tayyor: ${email} — obuna ${d} gacha`,
        status: { pending: 'kutmoqda', paid: "to'langan", granted: 'berildi', rejected: 'rad etilgan' },
        notFound: 'Bunday pochtali akkaunt topilmadi.',
        students: "O'quvchilar",
        searchPh: "Pochta bo'yicha qidirish",
        noUsers: 'Hech kim topilmadi.',
        registered: (d) => `ro'yxat: ${d}`,
        until: (d) => `${d} gacha`,
        noAccess: "ruxsatsiz",
        resetPw: 'Yangi parol',
        newPw: (email) => `${email} uchun yangi parol:`,
        del: "O'chirish",
        delConfirm: (email) => `${email} natijalari va ota-ona akkaunti bilan birga o'chirilsinmi? Buni qaytarib bo'lmaydi.`,
        delYes: "Ha, o'chirish",
        cancel: 'Bekor qilish',
      },
      loadingTasks: 'Topshiriqlar tayyorlanmoqda… 30 soniyagacha.',
      loadingText: 'Matn tanlanmoqda… 30 soniyagacha.',
      loadingWords: "So'zlar to'plami tuzilmoqda…",
      loadingTopics: 'Mavzular yuklanmoqda…',
      errors: {
        learn_limit: "Bugungi yangi topshiriqlar tugadi (20 ta to'plam). Kartochkalarni takrorla yoki hisob o'yinlarini o'yna.",
        tokens_out: "Tarifingning bu oydagi tokenlari tugadi. Kattaroq tarifni tanla: ⋮ menyu → «Obuna».",
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
      seconds: 'soniya',
      timeUp: 'Vaqt tugadi!',
      solved: (n) => `To'g'ri yechildi: ${n}`,
      newRecord: 'Yangi rekord!',
      play: "O'ynash",
      playAgain: "Yana o'ynash",
      markWrong: 'Xato bor misollarni bos',
      roundOf: (i, n) => `Raund ${i} / ${n}`,
      roundOk: 'Hamma xatolar topildi!',
      roundBad: "Hammasi to'g'ri emas: yashil — topilgan xatolar, sariq — o'tkazib yuborilganlar, qizil — to'g'ri misollar.",
      tookTime: (s) => `Vaqt: ${s} soniya`,
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
  const BTN = 'flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 text-base font-semibold text-onfill shadow-lg shadow-brand-500/30 transition hover:bg-brand-400 active:scale-[.98] disabled:bg-night-700 disabled:text-slate-500 disabled:shadow-none';
  const BTN2 = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-night-800 px-4 text-[15px] font-medium text-slate-100 ring-1 ring-white/10 transition hover:bg-night-700 active:scale-[.98]';
  const INPUT = 'min-h-14 w-full rounded-2xl bg-night-800 px-4 text-base text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/60';

  // ---------- saved data (per account; server when available, else this device) ----------
  const blank = () => ({
    progress: { days: [], topics: {}, levels: {}, stats: { tasks: 0, correct: 0, tests: 0, best5: 0, reading: 0, games: {} }, daily: {} },
    diary: [],
    cards: { decks: [] },
    quest: {},
  });
  let data = blank();
  const saveTimers = {};

  function normalize(d) {
    const b = blank();
    return {
      progress: { ...b.progress, ...(d?.progress || {}), stats: { ...b.progress.stats, ...(d?.progress?.stats || {}) } },
      diary: Array.isArray(d?.diary) ? d.diary : [],
      cards: { decks: Array.isArray(d?.cards?.decks) ? d.cards.decks : [] },
      quest: d?.quest && typeof d.quest === 'object' && !Array.isArray(d.quest) ? d.quest : {},
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

  // ---------- server calls ----------
  async function gen(kind, body) {
    let res;
    try {
      res = await N.postJson(`/api/learn/${kind}`, { subject: subjRu(), grade: grade(), lang: N.lang, ...body });
    } catch {
      throw new Error('default');
    }
    if (res.code === 'premium_required') { await N.refreshUser(); openSubscribe(); throw new Error('premium_required'); }
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
      retry && !['learn_limit', 'tokens_out'].includes(code) ? h('button', { type: 'button', class: BTN2, onclick: retry }, ico('repeat'), t('retry')) : null,
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
    recordAnswer(subj(), task.topic !== 'reading' ? task.topic : '', ok);
  }
  // Also used by the monster battle, where math and English come without AI.
  function recordAnswer(subjectKey, topic, ok) {
    const p = data.progress;
    if (topic) {
      const k = `${subjectKey}|${grade()}|${topic}`;
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
  async function trainingTasks(topic) {
    const topics = topic ? [] : await Promise.race([getTopics().catch(() => []), new Promise((r) => setTimeout(() => r([]), 45000))]);
    return (await gen('training', { level: level(), topic, topics })).tasks;
  }
  async function startTraining(topic) {
    const root = screen('activity');
    root.append(titleBar(t('training')), loading(t('loadingTasks')));
    try {
      const tasks = await trainingTasks(topic);
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
        h('button', { type: 'button', class: `min-h-12 rounded-xl text-[15px] font-medium ${l === cardsLang ? 'bg-brand-500 text-onfill' : 'text-slate-300'}`, onclick: () => { cardsLang = l; openCards(); } }, t('langs')[l]))));
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
    if (window.NimiQuest) {
      const [name, desc] = window.NimiQuest.card();
      root.append(h('button', { type: 'button', class: 'flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-left text-onfill shadow-lg shadow-brand-500/30 transition active:scale-[.98]', onclick: window.NimiQuest.open },
        h('div', { class: 'flex items-center gap-3' },
          h('span', { class: 'q-emoji q-idle text-5xl', 'aria-hidden': 'true' }, '🐲'),
          h('div', { class: 'min-w-0' }, h('p', { class: 'text-lg font-semibold' }, name), h('p', { class: 'text-sm text-onfill/85' }, desc))),
        h('span', { class: 'flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-onfill text-base font-semibold text-brand-600' }, ico('swords'), t('play'))));
    }
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

  // ---------- subscription ----------
  const money = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
  const sum = (n) => `${money(n)} ${N.lang === 'uz' ? "so'm" : 'сум'}`;
  // Plans come from the server: [{ id, name, price, input, output }].
  const plans = () => N.billing.plans || [];
  const planById = (id) => plans().find((p) => p.id === id) || plans()[0];
  const minPrice = () => Math.min(...plans().map((p) => p.price));
  const tok = (n) => {
    const S = t('sub');
    if (n >= 1e6) return `${(n / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ${S.million}`;
    return n >= 1000 ? `${Math.round(n / 1000)} ${S.thousand}` : String(n);
  };
  const dateStr = (iso) => new Date(iso).toLocaleDateString(N.lang === 'uz' ? 'uz-UZ' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const daysLeft = (iso) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY));

  // Status line for the home screen and the subscription page; null in guest mode.
  function planStatus() {
    const plan = N.user?.plan;
    if (!N.accounts || !plan || N.user?.admin) return null;
    const S = t('sub');
    if (!plan.active) return plan.never ? { tone: 'none', text: S.none } : { tone: 'expired', text: S.expired };
    const n = daysLeft(plan.until);
    if (plan.trial) return { tone: 'trial', text: S.trial(n) };
    if (n <= 3) return { tone: 'ending', text: S.ending(n) };
    return { tone: 'active', text: S.active(dateStr(plan.until)) };
  }

  // Three plan cards side by side; onSelect(plan) runs when another one is chosen.
  function planPicker(selected, onSelect) {
    const S = t('sub');
    const row = h('div', { class: 'grid grid-cols-3 gap-2' });
    const draw = () => row.replaceChildren(...plans().map((p) => {
      const on = p.id === selected;
      return h('button', {
        type: 'button',
        'aria-pressed': String(on),
        class: `flex flex-col items-start gap-0.5 rounded-2xl p-3 text-left transition active:scale-95 ${on ? 'bg-brand-500/15 ring-2 ring-brand-400' : 'bg-night-800 ring-1 ring-white/5 hover:bg-night-700'}`,
        onclick: () => { selected = p.id; draw(); onSelect(p); },
      },
      h('span', { class: `text-sm font-semibold ${on ? 'text-brand-400' : 'text-slate-300'}` }, p.name),
      h('span', { class: 'text-xl font-semibold tabular-nums text-white' }, money(p.price)),
      h('span', { class: 'text-xs text-slate-400' }, S.perMonthShort),
      h('span', { class: 'mt-2 flex items-center gap-1 text-xs font-medium text-brand-400' }, ico('zap', 'h-3.5 w-3.5 shrink-0'), S.speed[p.id] || ''),
      h('span', { class: 'text-xs text-slate-300' }, S.perDay(p.questions)),
      h('span', { class: 'text-xs text-slate-300' }, `${S.inLabel}: ${tok(p.input)}`),
      h('span', { class: 'text-xs text-slate-300' }, `${S.outLabel}: ${tok(p.output)}`));
    }));
    draw();
    return row;
  }

  // This month's tokens against the plan limits.
  function usageCard(plan, tokens) {
    const S = t('sub');
    const bar = (label, used, max) => {
      const pct = Math.min(100, Math.round((used / max) * 100));
      return h('div', { class: 'flex flex-col gap-1' },
        h('div', { class: 'flex justify-between gap-2 text-sm' }, h('span', { class: 'text-slate-300' }, label), h('span', { class: 'tabular-nums text-slate-400' }, S.of(tok(used), tok(max)))),
        h('div', { class: 'h-2 overflow-hidden rounded-full bg-night-700' }, h('div', { class: `h-full rounded-full ${pct >= 90 ? 'bg-rose-400' : 'bg-brand-500'}`, style: `width:${pct}%` })));
    };
    return h('div', { class: `${CARD} flex flex-col gap-3` },
      h('div', { class: 'flex items-center justify-between gap-2' },
        h('p', { class: 'font-semibold text-white' }, S.usageTitle),
        h('span', { class: 'rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-400' }, plan.trial ? S.trialTitle : planById(plan.tier).name)),
      bar(S.usageIn, tokens.input, plan.limits.input),
      bar(S.usageOut, tokens.output, plan.limits.output));
  }

  function openSubscribe() {
    const root = screen('activity');
    const S = t('sub');
    const st = planStatus();
    const plan = N.user?.plan;
    root.append(titleBar(S.title));
    if (st && st.tone === 'none') {
      const trialSteps = h('div', { class: 'flex flex-col gap-3' });
      const ask = h('button', { type: 'button', class: BTN }, ico('sparkles'), S.trialAsk);
      ask.onclick = async () => {
        ask.disabled = true;
        const r = await N.postJson('/api/subscribe', { months: 0 }).catch(() => ({}));
        ask.disabled = false;
        if (r.request) showSteps(trialSteps, r.request, 0);
        else trialSteps.replaceChildren(h('p', { class: 'text-rose-200' }, t('errors').default));
      };
      root.append(h('div', { class: `${CARD} flex flex-col gap-3 ring-amber-400/30` },
        h('p', { class: 'text-lg font-semibold text-white' }, S.trialTitle), h('p', { class: 'text-slate-300' }, S.trialText), ask, trialSteps),
        h('p', { class: 'mt-1 font-semibold text-white' }, S.orPaid));
    } else if (st) {
      const tone = { expired: 'bg-rose-500/10 text-rose-100 ring-rose-400/30', ending: 'bg-amber-400/10 text-amber-100 ring-amber-400/30', trial: 'bg-sky-500/10 text-sky-100 ring-sky-400/30', active: 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/30' }[st.tone];
      root.append(h('p', { class: `rounded-2xl p-4 ring-1 ${tone}` }, st.text));
    }
    if (plan?.active && plan.limits && N.user?.tokens) root.append(usageCard(plan, N.user.tokens));
    const paid = plan?.active && !plan.trial;
    let chosen = planById(paid ? plan.tier : 'pro');
    let months = 1;
    const priceBtn = h('button', { type: 'button', class: BTN });
    const monthsRow = h('div', { class: 'grid grid-cols-4 gap-1 rounded-2xl bg-night-800 p-1 ring-1 ring-white/5' });
    const drawMonths = () => {
      monthsRow.innerHTML = '';
      [1, 3, 6, 12].forEach((m) => monthsRow.append(h('button', { type: 'button', class: `min-h-12 rounded-xl text-[15px] font-medium ${m === months ? 'bg-brand-500 text-onfill' : 'text-slate-300'}`, onclick: () => { months = m; drawMonths(); } }, S.monthLabel(m))));
      priceBtn.textContent = `${paid && chosen.id === plan.tier ? S.renew : S.order} · ${sum(chosen.price * months)}`;
    };
    drawMonths();
    root.append(h('p', { class: 'font-semibold text-white' }, S.plansTitle),
      planPicker(chosen.id, (p) => { chosen = p; drawMonths(); }),
      h('p', { class: 'px-1 text-xs text-slate-400' }, S.tokensHint),
      h('div', { class: `${CARD} flex flex-col gap-2` },
        h('p', { class: 'font-semibold text-white' }, S.allPlans),
        h('ul', { class: 'flex flex-col gap-2 text-slate-200' }, S.includes.map((x) => h('li', { class: 'flex items-start gap-2' }, ico('circle-check', 'icon mt-0.5 text-brand-400'), x))),
        h('p', { class: 'text-sm text-slate-400' }, S.freeLeft)));
    const steps = h('div', { class: 'flex flex-col gap-3' });
    priceBtn.onclick = async () => {
      priceBtn.disabled = true;
      try {
        const r = await N.postJson('/api/subscribe', { months, plan: chosen.id });
        if (!r.request) throw new Error(r.code || 'default');
        showSteps(steps, r.request, r.price);
        steps.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        steps.innerHTML = '';
        steps.append(h('p', { class: 'text-rose-200' }, t('errors')[e.message] || t('errors').default));
      } finally {
        priceBtn.disabled = false;
      }
    };
    root.append(h('p', { class: 'font-semibold text-white' }, S.months), monthsRow, priceBtn, steps);
  }

  function showSteps(box, request, total, forEmail) {
    const S = t('sub');
    const b = N.billing;
    const email = forEmail || N.user?.email || '';
    box.innerHTML = '';
    box.append(h('p', { class: 'flex items-center gap-2 font-semibold text-emerald-200' }, ico('circle-check'), S.request(request.id)));
    const trial = Number(request.months) === 0;
    if (b.card && !trial) {
      const copyBtn = h('button', { type: 'button', class: 'min-h-11 shrink-0 rounded-xl bg-night-700 px-4 text-sm text-white hover:bg-night-600' }, S.copy);
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(b.card.replace(/\s/g, '')); copyBtn.textContent = S.copied; } catch {}
      };
      box.append(h('div', { class: `${CARD} flex flex-col gap-2` },
        h('p', { class: 'text-slate-300' }, `1. ${S.step1(sum(total))}`),
        h('div', { class: 'flex items-center gap-3' }, h('p', { class: 'min-w-0 flex-1 select-all text-xl font-semibold tracking-wider tabular-nums text-white' }, b.card), copyBtn)));
    }
    const text = trial ? S.trialMessage(request.id, email) : S.message(request.months, request.id, email, planById(request.plan)?.name || '');
    const links = [];
    if (b.telegram) links.push(h('a', { class: BTN, href: `https://t.me/${encodeURIComponent(b.telegram)}?text=${encodeURIComponent(text)}`, target: '_blank', rel: 'noopener' }, ico('send'), S.telegram));
    if (b.phone) links.push(h('a', { class: BTN2, href: `tel:${b.phone.replace(/[^\d+]/g, '')}` }, ico('message-circle'), `${S.call}: ${b.phone}`));
    box.append(h('div', { class: `${CARD} flex flex-col gap-2` },
      h('p', { class: 'text-slate-300' }, trial ? S.trialStep : `${b.card ? '2. ' : ''}${S.step2}`),
      ...(links.length ? links : [h('p', { class: 'text-amber-200' }, S.noContacts)]),
      h('p', { class: 'select-all rounded-xl bg-night-800 p-3 text-sm text-slate-300' }, text)));
    const check = h('button', { type: 'button', class: BTN2 }, ico('repeat'), S.check);
    check.onclick = async () => { await N.refreshUser(); if (N.user?.role === 'parent') renderParent(); else openSubscribe(); };
    box.append(h('p', { class: 'text-sm text-slate-400' }, S.step3), check);
  }

  // ---------- admin: subscription requests ----------
  let adminRoot = 'activity';
  // rootId: 'activity' (from a student admin's menu) or 'adminHome' (the staff account's only screen).
  async function openAdmin(rootId = adminRoot) {
    adminRoot = rootId;
    const root = screen(rootId);
    const A = t('admin');
    root.append(rootId === 'activity' ? titleBar(A.title) : h('h2', { class: 'text-2xl font-semibold text-white' }, A.title));
    const msg = h('p', { class: 'text-sm' });
    const email = h('input', { type: 'email', class: INPUT, placeholder: A.emailPh, id: 'adminEmail' });
    const months = h('select', { class: `${INPUT} appearance-none`, id: 'adminMonths' }, [0, 1, 3, 6, 12].map((m) => h('option', { value: m }, m ? t('sub').monthLabel(m) : A.week)));
    const tier = h('select', { class: `${INPUT} appearance-none`, id: 'adminPlan' }, plans().map((p) => h('option', { value: p.id }, `${p.name} · ${sum(p.price)}`)));
    const grant = async (mail, m, requestId, plan) => {
      const r = await N.postJson('/api/admin/grant', { email: mail, months: m, requestId, plan });
      if (r.until) { await openAdmin(); $(adminRoot).prepend(h('p', { class: 'rounded-2xl bg-emerald-500/10 p-3 text-emerald-100' }, A.done(r.email, dateStr(r.until)))); }
      else msg.textContent = r.code === 'user_not_found' ? A.notFound : t('errors').default;
    };
    root.append(h('div', { class: `${CARD} flex flex-col gap-2` },
      h('p', { class: 'font-semibold text-white' }, A.manual), email,
      h('div', { class: 'grid gap-2 sm:grid-cols-3' }, months, tier, h('button', { type: 'button', class: BTN, onclick: () => email.value.trim() && grant(email.value.trim(), Number(months.value), null, tier.value) }, A.enable)),
      msg));
    root.append(studentsBlock(A, grant));
    root.append(h('p', { class: 'font-semibold text-white' }, A.pending));
    const list = h('div', { class: 'flex flex-col gap-2' }, loading(t('loadingTopics')));
    root.append(list);
    const r = await N.postJson('/api/admin/requests', {});
    list.innerHTML = '';
    const requests = r.requests || [];
    if (!requests.length) list.append(h('p', { class: 'text-slate-400' }, A.none));
    requests.forEach((q) => {
      const pending = q.status === 'pending';
      list.append(h('div', { class: `${CARD} flex flex-col gap-2 ${pending ? '' : 'opacity-60'}` },
        h('div', { class: 'flex items-center justify-between gap-2' },
          h('p', { class: 'min-w-0 truncate font-semibold text-white' }, `№${q.id} · ${q.email}`),
          h('span', { class: `shrink-0 rounded-full px-2.5 py-1 text-xs ${pending ? 'bg-amber-400/15 text-amber-200' : ['paid', 'granted'].includes(q.status) ? 'bg-emerald-500/15 text-emerald-200' : 'bg-night-700 text-slate-400'}` }, A.status[q.status] || q.status)),
        h('p', { class: 'text-sm text-slate-400' }, `${Number(q.months) ? `${planById(q.plan).name} · ${t('sub').monthLabel(q.months)} · ${sum(planById(q.plan).price * q.months)}` : A.week} · ${dateStr(q.created_at)}${q.premium_until ? ` · ${t('sub').active(dateStr(q.premium_until))}` : ''}`),
        pending ? h('div', { class: 'grid grid-cols-2 gap-2' },
          h('button', { type: 'button', class: BTN, onclick: () => grant(q.email, Number(q.months), q.id, q.plan) }, A.grant(Number(q.months))),
          h('button', { type: 'button', class: BTN2, onclick: async () => { await N.postJson('/api/admin/reject', { requestId: q.id }); openAdmin(); } }, A.reject)) : null));
    });
  }

  // Admin: find a student, give access, reset the password or delete the account.
  function studentsBlock(A, grant) {
    const box = h('div', { class: `${CARD} flex flex-col gap-2` });
    const search = h('input', { type: 'text', class: INPUT, placeholder: A.searchPh, id: 'adminSearch' });
    const list = h('div', { class: 'flex flex-col gap-2' });
    const load = async () => {
      list.replaceChildren(loading(t('loadingTopics')));
      const r = await N.postJson('/api/admin/users', { search: search.value.trim() });
      list.replaceChildren();
      const users = r.users || [];
      if (!users.length) list.append(h('p', { class: 'text-sm text-slate-400' }, A.noUsers));
      users.forEach((u) => {
        const active = u.premium_until && new Date(u.premium_until) > new Date();
        const info = h('p', { class: 'text-xs text-slate-400' },
          `${A.registered(dateStr(u.created_at))} · ${active ? `${u.plan_kind === 'trial' ? A.week : planById(u.plan_tier).name} ${A.until(dateStr(u.premium_until))}` : A.noAccess}${u.google ? ' · Google' : ''}`);
        // Adding a month keeps the student's current plan.
        const userPlan = planById(u.plan_tier);
        const out = h('div', { class: 'flex flex-col gap-2' });
        const confirmDelete = h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-rose-500/15 px-3 text-sm text-rose-200 ring-1 ring-rose-400/30' }, A.del);
        confirmDelete.onclick = () => {
          out.replaceChildren(h('p', { class: 'text-sm text-rose-200' }, A.delConfirm(u.email)),
            h('div', { class: 'grid grid-cols-2 gap-2' },
              h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-rose-500 px-3 text-sm font-semibold text-onfill', onclick: async () => { await N.postJson('/api/admin/delete-user', { email: u.email }); load(); } }, A.delYes),
              h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-night-700 px-3 text-sm text-white', onclick: () => out.replaceChildren() }, A.cancel)));
        };
        const resetBtn = h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-night-700 px-3 text-sm text-white' }, A.resetPw);
        resetBtn.onclick = async () => {
          const res = await N.postJson('/api/admin/reset-password', { email: u.email });
          out.replaceChildren(res.password
            ? h('p', { class: 'rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-100' }, A.newPw(u.email), ' ', h('b', { class: 'select-all text-white' }, res.password))
            : h('p', { class: 'text-sm text-rose-200' }, t('errors').default));
        };
        list.append(h('div', { class: 'flex flex-col gap-2 rounded-2xl bg-night-800 p-3 ring-1 ring-white/5' },
          h('p', { class: 'truncate font-semibold text-white' }, u.email), info,
          h('div', { class: 'flex flex-wrap gap-2' },
            h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-brand-500 px-3 text-sm font-semibold text-onfill', onclick: () => grant(u.email, 0) }, A.grant(0)),
            h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-brand-500/20 px-3 text-sm text-white ring-1 ring-brand-400/40', onclick: () => grant(u.email, 1, null, userPlan.id) }, `${A.grant(1)} · ${userPlan.name}`),
            resetBtn, confirmDelete),
          out));
      });
    };
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
    box.append(h('p', { class: 'font-semibold text-white' }, A.students), h('div', { class: 'flex gap-2' }, search, h('button', { type: 'button', class: 'min-h-14 shrink-0 rounded-2xl bg-night-700 px-4 text-white', onclick: load }, ico('chevron-right'))), list);
    load();
    return box;
  }

  // ---------- student settings: the parent account ----------
  async function openSettings() {
    const root = screen('activity');
    const P = t('settingsPage');
    root.append(titleBar(P.title), loading(t('loadingTopics')));
    const r = await N.postJson('/api/account/settings', {}).catch(() => ({}));
    root.lastChild.remove();
    root.append(h('div', { class: `${CARD} flex flex-col gap-1` }, h('p', { class: 'text-sm text-slate-400' }, P.account), h('p', { class: 'break-all font-semibold text-white' }, N.user?.email || '')));
    if (!r.parent) { root.append(h('p', { class: 'text-rose-200' }, t('errors').default)); return; }
    const pw = h('span', { class: 'select-all font-mono text-lg text-white' }, '••••••••');
    let shown = false;
    const showBtn = h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-night-700 px-3 text-sm text-white' }, P.show);
    const draw = (parent) => { pw.textContent = shown ? parent.password : '••••••••'; showBtn.textContent = shown ? P.hide : P.show; };
    let parent = r.parent;
    showBtn.onclick = () => { shown = !shown; draw(parent); };
    const copyBtn = h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-night-700 px-3 text-sm text-white' }, P.copy);
    copyBtn.onclick = async () => {
      try { await navigator.clipboard.writeText(`${P.login}: ${parent.login}\n${P.password}: ${parent.password}\n${location.origin}`); copyBtn.textContent = P.copied; } catch {}
    };
    const resetBtn = h('button', { type: 'button', class: BTN2 }, ico('repeat'), P.newPw);
    resetBtn.onclick = async () => {
      const res = await N.postJson('/api/account/parent-reset', {});
      if (res.parent) { parent = res.parent; shown = true; draw(parent); }
    };
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
      h('div', { class: 'flex items-center gap-3' }, h('span', { class: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-night-700 text-brand-400' }, ico('users')), h('p', { class: 'text-lg font-semibold text-white' }, P.parentTitle)),
      h('p', { class: 'text-sm text-slate-300' }, P.parentText),
      h('div', { class: 'flex flex-col gap-1 rounded-2xl bg-night-800 p-3' },
        h('p', { class: 'text-xs text-slate-400' }, P.login), h('p', { class: 'select-all font-mono text-lg text-white' }, parent.login),
        h('p', { class: 'mt-2 text-xs text-slate-400' }, P.password), pw),
      h('div', { class: 'flex gap-2' }, showBtn, copyBtn),
      resetBtn));
    root.append(h('a', { href: '/privacy.html', target: '_blank', class: 'text-sm text-slate-400 underline' }, t('privacyTitle')));
  }

  // ---------- parent account: the child's progress, diary and subscription ----------
  async function renderParent() {
    const root = screen('parentHome');
    const P = t('parentPage');
    root.append(h('h2', { class: 'text-2xl font-semibold text-white' }, P.title), loading(t('loadingTopics')));
    const r = await N.postJson('/api/parent/overview', {}).catch(() => ({}));
    root.lastChild.remove();
    if (!r.child) { root.append(h('p', { class: 'text-rose-200' }, t('errors').default)); return; }
    const plan = r.child.plan;
    const p = normalize({ progress: r.progress || {} }).progress;
    const s = p.stats;
    const S = t('sub');
    // Child and access
    const access = plan.active
      ? P.accessUntil(plan.trial ? S.trialTitle : `${S.open} ${planById(plan.tier).name}`, dateStr(plan.until))
      : plan.never ? P.noAccessYet : S.expired;
    const subBox = h('div', { class: 'flex flex-col gap-3' });
    const askBtn = (months, label, getPlan) => h('button', { type: 'button', class: months ? BTN : BTN2, onclick: async () => {
      const res = await N.postJson('/api/parent/subscribe', { months, plan: getPlan?.().id });
      if (res.request) showSteps(subBox, res.request, res.price, res.email);
    } }, label);
    const paid = plan.active && !plan.trial;
    let chosen = planById(paid ? plan.tier : 'pro');
    const orderBtn = askBtn(1, '', () => chosen);
    const drawOrder = () => { orderBtn.textContent = `${paid && chosen.id === plan.tier ? S.renew : S.order} · ${sum(chosen.price)}`; };
    drawOrder();
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
      h('p', { class: 'text-sm text-slate-400' }, P.child), h('p', { class: 'break-all text-lg font-semibold text-white' }, r.child.email),
      h('p', { class: `rounded-2xl p-3 text-sm ring-1 ${plan.active ? 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/30' : 'bg-amber-400/10 text-amber-100 ring-amber-400/30'}` }, access),
      plan.never ? askBtn(0, S.trialAsk) : null,
      planPicker(chosen.id, (p) => { chosen = p; drawOrder(); }),
      orderBtn,
      subBox));
    if (plan.active && plan.limits && r.child.tokens) root.append(usageCard(plan, r.child.tokens));
    // Activity
    const daySet = new Set(p.days || []);
    const n = (() => { let k = 0; let d = new Date(); if (!daySet.has(d.toLocaleDateString('en-CA'))) d = new Date(d.getTime() - DAY); while (daySet.has(d.toLocaleDateString('en-CA'))) { k++; d = new Date(d.getTime() - DAY); } return k; })();
    const pct = s.tasks ? Math.round((s.correct / s.tasks) * 100) : 0;
    const stat = (v, label) => h('div', { class: 'rounded-2xl bg-night-900/80 p-3 text-center ring-1 ring-white/5' }, h('p', { class: 'text-2xl font-semibold tabular-nums text-white' }, String(v)), h('p', { class: 'text-xs text-slate-400' }, label));
    root.append(h('div', { class: 'grid grid-cols-2 gap-2 sm:grid-cols-4' },
      stat(n, P.streak), stat(`${r.usedToday}/${r.limit}`, P.today), stat(s.tasks, t('statTasks')), stat(`${pct}%`, t('statCorrect'))));
    // Topics by subject
    const groups = {};
    Object.entries(p.topics || {}).forEach(([key, st]) => {
      const [subjKey, grade, ...rest] = key.split('|');
      const g = `${N.subjectName(subjKey)} · ${N.gradeLabel(grade)}`;
      (groups[g] = groups[g] || []).push([rest.join('|'), st]);
    });
    const topicsBox = h('div', { class: `${CARD} flex flex-col gap-2` }, h('p', { class: 'font-semibold text-white' }, P.topics));
    if (!Object.keys(groups).length) topicsBox.append(h('p', { class: 'text-sm text-slate-400' }, P.noTopics));
    Object.entries(groups).forEach(([g, list]) => {
      topicsBox.append(h('p', { class: 'mt-1 text-sm text-slate-400' }, g));
      list.forEach(([topic, st]) => {
        const [c] = topicColor(st);
        topicsBox.append(h('div', { class: 'flex items-center gap-3 rounded-xl bg-night-800 px-3 py-2' }, h('span', { class: `h-3 w-3 shrink-0 rounded-full ${c}` }), h('span', { class: 'min-w-0 flex-1 text-sm text-slate-100' }, topic), h('span', { class: 'text-xs tabular-nums text-slate-400' }, `${st.ok}/${st.total}`)));
      });
    });
    root.append(topicsBox);
    // Homework
    const diary = (r.diary || []).filter((d) => !d.done);
    root.append(h('div', { class: `${CARD} flex flex-col gap-2` }, h('p', { class: 'font-semibold text-white' }, P.homework),
      diary.length ? diary.map((d) => h('p', { class: 'text-sm text-slate-200' }, `• ${d.text} — ${N.subjectName(d.subject)}, ${t('until')(fmtDate(d.due))}`)) : h('p', { class: 'text-sm text-slate-400' }, P.noHomework)));
    // AI report
    const reportBox = h('div', { class: 'bubble whitespace-pre-wrap text-sm leading-relaxed text-slate-200' });
    const reportBtn = h('button', { type: 'button', class: BTN2 }, ico('file-text'), t('parentReport'));
    reportBtn.onclick = async () => {
      reportBox.replaceChildren(loading(t('loadingTasks')));
      const res = await N.postJson('/api/parent/report', { lang: N.lang });
      reportBox.innerHTML = res.report ? N.formatReply(res.report) : '';
      if (!res.report) reportBox.textContent = res.code === 'premium_required' ? P.reportNeedsSub : t('errors')[res.code] || t('errors').default;
    };
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` }, reportBtn, reportBox));
    // Child's password
    const newPw = h('input', { type: 'text', class: INPUT, placeholder: P.newChildPwPh, id: 'childPw', autocomplete: 'off' });
    const pwMsg = h('p', { class: 'text-sm' });
    root.append(h('div', { class: `${CARD} flex flex-col gap-2` }, h('p', { class: 'font-semibold text-white' }, P.childPw), h('p', { class: 'text-sm text-slate-400' }, P.childPwText), newPw,
      h('button', { type: 'button', class: BTN, onclick: async () => {
        const res = await N.postJson('/api/parent/child-password', { password: newPw.value });
        pwMsg.className = `text-sm ${res.ok ? 'text-emerald-200' : 'text-rose-200'}`;
        pwMsg.textContent = res.ok ? P.childPwDone : P.childPwBad;
        if (res.ok) newPw.value = '';
      } }, P.childPwSave), pwMsg));
  }

  // ---------- landing for parents (not signed in) ----------
  function renderLanding() {
    const root = screen('landing');
    const W = t('landing');
    const langToggle = h('div', { class: 'flex justify-end' }, h('div', { class: 'flex rounded-2xl bg-night-800 p-1 ring-1 ring-white/5' },
      ['uz', 'ru'].map((l) => h('button', { type: 'button', class: `min-h-11 min-w-12 rounded-xl px-3 text-[15px] font-medium ${N.lang === l ? 'bg-brand-500 text-onfill' : 'text-slate-300'}`, onclick: () => document.querySelector(`.lang-btn[data-lang="${l}"]`).click() }, l.toUpperCase()))));
    root.append(langToggle,
      h('div', { class: 'flex flex-col items-center gap-4 rounded-3xl bg-night-900/80 p-6 text-center ring-1 ring-white/5' },
        h('img', { src: '/img/welcome.webp', alt: '', class: 'h-32 w-32 rounded-3xl object-cover' }),
        h('h2', { class: 'text-3xl font-semibold leading-tight text-white' }, W.title),
        h('p', { class: 'max-w-md text-slate-300' }, W.lead),
        h('button', { type: 'button', class: BTN, onclick: () => N.showAuth('register') }, ico('sparkles'), W.start),
        h('button', { type: 'button', class: BTN2, onclick: () => N.showAuth('login') }, W.login)));
    root.append(h('h3', { class: 'mt-2 text-xl font-semibold text-white' }, W.whyTitle),
      h('div', { class: 'grid gap-3 sm:grid-cols-2' }, W.why.map(([icon, title, text]) => h('div', { class: `${CARD} flex gap-3` },
        h('span', { class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400' }, ico(icon)),
        h('div', { class: 'min-w-0' }, h('p', { class: 'font-semibold text-white' }, title), h('p', { class: 'text-sm text-slate-400' }, text))))));
    root.append(h('h3', { class: 'mt-2 text-xl font-semibold text-white' }, W.insideTitle),
      h('div', { class: 'flex flex-wrap gap-2' }, W.inside.map((x) => h('span', { class: 'rounded-full bg-night-800 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10' }, x))));
    root.append(h('h3', { class: 'mt-2 text-xl font-semibold text-white' }, W.howTitle),
      h('div', { class: 'flex flex-col gap-2' }, W.how.map((x, i) => h('div', { class: 'flex items-start gap-3' },
        h('span', { class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-onfill' }, String(i + 1)),
        h('p', { class: 'pt-1 text-slate-300' }, x)))));
    root.append(h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-onfill' },
      h('p', { class: 'text-sm text-onfill/80' }, W.priceTitle),
      h('div', { class: 'flex flex-col' }, plans().map((p) => h('div', { class: 'flex items-baseline justify-between gap-3 border-b border-onfill/15 py-2 last:border-0' },
        h('span', { class: 'text-xl font-semibold' }, p.name), h('span', { class: 'text-lg font-semibold tabular-nums' }, t('sub').price(sum(p.price)))))),
      h('p', { class: 'text-sm text-onfill/85' }, W.priceText),
      h('button', { type: 'button', class: 'min-h-12 rounded-2xl bg-onfill font-semibold text-brand-600', onclick: () => N.showAuth('register') }, W.start)));
    root.append(h('div', { class: `${CARD} flex flex-col gap-2` }, h('p', { class: 'font-semibold text-white' }, W.parentTitle), h('p', { class: 'text-sm text-slate-400' }, W.parentText),
      h('button', { type: 'button', class: BTN2, onclick: () => N.showAuth('login') }, ico('users'), W.parentLogin)));
    root.append(h('a', { href: '/privacy.html', target: '_blank', class: 'self-center text-sm text-slate-400 underline' }, t('privacyTitle')));
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

    const st = planStatus();
    const S = t('sub');
    if (st && (st.tone === 'expired' || st.tone === 'none')) {
      const none = st.tone === 'none';
      root.append(h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-amber-400/10 p-5 ring-1 ring-amber-400/30' },
        h('p', { class: 'text-lg font-semibold text-amber-100' }, none ? S.none : S.expired),
        h('p', { class: 'text-sm text-amber-100/80' }, none ? S.noneText : S.expiredText),
        h('button', { type: 'button', class: BTN, onclick: openSubscribe }, ico(none ? 'sparkles' : 'star'), none ? S.trialAsk : `${S.order} · ${S.from(sum(minPrice()))}`)));
    } else if (st) {
      root.append(h('button', { type: 'button', class: `flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm ring-1 ${st.tone === 'ending' ? 'bg-amber-400/10 text-amber-100 ring-amber-400/30' : 'bg-night-900/80 text-slate-300 ring-white/5'}`, onclick: openSubscribe },
        ico('star', 'icon text-amber-300'), h('span', { class: 'min-w-0 flex-1' }, st.text), ico('chevron-right', 'icon text-slate-500')));
    }
    const locked = !N.hasAccess();
    const guard = (fn) => (locked ? openSubscribe : fn);

    root.append(h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-onfill shadow-lg shadow-brand-500/30' },
      h('div', { class: 'flex items-center gap-3' },
        h('span', { class: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-onfill/15' }, ico(locked ? 'lock' : 'dumbbell')),
        h('div', { class: 'min-w-0' }, h('p', { class: 'text-lg font-semibold' }, t('dailyTitle')), h('p', { class: 'text-sm text-onfill/80' }, daily ? t('dailyDone')(daily.score) : t('dailyDesc')(level())))),
      h('button', { type: 'button', class: 'flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-onfill text-base font-semibold text-brand-600 transition hover:bg-onfill/90 active:scale-[.98]', onclick: guard(() => startTraining()) }, daily ? ico('repeat') : ico('chevron-right'), locked ? S.open : daily ? t('again') : t('start'))));

    const tiles = t('tiles');
    // paid: part of the subscription (shows a lock after the free week).
    const tile = (key, icon, onclick, extra, paid = true) => h('button', { type: 'button', class: `${CARD} relative flex min-h-32 flex-col items-start gap-3 text-left transition hover:bg-night-800 active:scale-[.98]`, onclick: paid ? guard(onclick) : onclick },
      h('span', { class: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-night-700 text-brand-400' }, ico(icon)),
      paid && locked ? h('span', { class: 'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/15 text-amber-200', title: S.locked, 'aria-label': S.locked }, ico('lock', 'h-4 w-4')) : null,
      h('span', { class: 'min-w-0' }, h('span', { class: 'block font-semibold text-white' }, tiles[key][0]), h('span', { class: 'block text-xs text-slate-400' }, extra || tiles[key][1])));
    // Older students get exams; younger ones keep the chat tile. Always 8 tiles.
    root.append(h('div', { class: 'grid grid-cols-2 gap-3' },
      tile('photo', 'camera', N.askWithPhoto),
      tile('test', 'clipboard-check', openTestPicker),
      grade() >= 8 ? tile('exam', 'graduation-cap', openExams) : tile('chat', 'message-circle', () => N.showScreen('chat')),
      tile('olympiad', 'puzzle', startOlympiad),
      tile('cards', 'layers', openCards, null, false),
      tile('reading', 'book-open', startReading),
      tile('games', 'gamepad-2', openGames, null, false),
      tile('diary', 'notebook-pen', () => N.showScreen('diary'), t('undone')(undone), false)));
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

    root.append(h('button', { type: 'button', class: BTN2, onclick: () => N.openReport() }, ico('file-text'), t('parentReport')));
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
        h('button', { type: 'button', class: `flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ${item.done ? 'bg-emerald-500 text-onfill ring-emerald-500' : 'text-transparent ring-slate-500 hover:ring-brand-400'}`, 'aria-label': item.done ? 'done' : 'todo', onclick: () => { item.done = !item.done; if (item.done) markDay(); save('diary'); renderDiary(); } }, ico('check')),
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

  // Building blocks for the monster battle (quest.js).
  const kit = {
    h, R, ico, CARD, BTN, BTN2, INPUT, screen, titleBar, loading, errorBox, save, markDay, isCorrect, recordAnswer, trainingTasks, openGames, openSubscribe,
    get data() { return data; },
    setStop(fn) { stopActive = fn; },
  };

  window.NimiLearn = { load, render, markDay, openSubscribe, openAdmin, openSettings, renderParent, renderLanding, kit };
})();
