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
        inside: ['Чат с учителем', 'Фото задачи', 'Голос', 'Тренировки', 'Тесты', 'Экзамены и DTM', 'Олимпиада', 'Чтение', 'Карточки слов', 'Игры на счёт', 'Дневник'],
        howTitle: 'Как начать',
        how: ['Зарегистрируйтесь — это бесплатно. Карточки, игры и дневник открыты сразу.', 'Напишите нам в Telegram — познакомимся и подключим бесплатную неделю.', 'Понравится — оформите подписку.'],
        priceTitle: 'Подписка',
        priceText: 'Все разделы, 30 вопросов в день, фото задачи, экзамены, отчёты для родителей.',
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
      sub: {
        title: 'Подписка Nimi',
        price: (p) => `${p} в месяц`,
        includes: ['Чат с учителем — 30 вопросов в день', 'Фото задачи и голос', 'Тренировки, тесты, чтение', 'Экзамены и олимпиада', 'Отчёт для родителей'],
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
        message: (m, id, email) => `Здравствуйте! Хочу подписку Nimi на ${m} мес. Заявка №${id}, аккаунт: ${email}`,
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
      gamesTitle: '13 Обучающих игр',
      gamesDesc: 'Играй, тренируйся и соревнуйся с друзьями',
      qBuilderTitle: 'Конструктор вопросов',
      qBuilderDesc: 'Создавай свои наборы вопросов для игр',
      gTug: ['Перетягивание каната', 'Командное соревнование по вопросам'],
      gDrum: ['Барабан знаний', 'Случайный выбор ученика и вопроса'],
      gPair: ['Найди пару', 'Карточки на память и совпадения'],
      gGroup: ['Группировка', 'Распределение слов и картинок по категориям'],
      gJeopardy: ['Своя игра', 'Викторина с вопросами разной стоимости'],
      gTickets: ['Билеты', 'Наборы экзаменационных билетов'],
      gTF: ['Правда или Ложь', 'Проверь верность утверждения'],
      gColor: ['Найди цвет', 'Найди отличающийся оттенок'],
      gMemory: ['Тренировка памяти', 'Запомни и повтори последовательность'],
      gMental: ['Ментальная арифметика', 'Быстрый устный счёт'],
      gFlags: ['Найди флаг', 'Угадай страну по её флагу'],
      gOnlineTug: ['Онлайн Канат', 'Живое многопользовательское перетягивание'],
      gOnlineQuiz: ['Онлайн Викторина', 'Живая викторина с кодом комнаты'],

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
        inside: ["O'qituvchi bilan chat", 'Masala surati', 'Ovoz', 'Mashqlar', 'Testlar', 'Imtihonlar va DTM', 'Olimpiada', "O'qish", "So'z kartochkalari", "Hisob o'yinlari", 'Kundalik'],
        howTitle: 'Qanday boshlash kerak',
        how: ["Ro'yxatdan o'ting — bu bepul. Kartochkalar, o'yinlar va kundalik darhol ochiladi.", 'Bizga Telegramda yozing — tanishamiz va bepul haftani yoqamiz.', "Yoqsa — obuna rasmiylashtiring."],
        priceTitle: 'Obuna',
        priceText: "Barcha bo'limlar, kuniga 30 ta savol, masala surati, imtihonlar, ota-onalar uchun hisobot.",
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
      sub: {
        title: 'Nimi obunasi',
        price: (p) => `oyiga ${p}`,
        includes: ["O'qituvchi bilan chat — kuniga 30 ta savol", 'Masala surati va ovoz', 'Mashqlar, testlar, o\'qish', 'Imtihonlar va olimpiada', 'Ota-onalar uchun hisobot'],
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
        message: (m, id, email) => `Assalomu alaykum! Nimi obunasini ${m} oyga olmoqchiman. Ariza №${id}, akkaunt: ${email}`,
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
      gamesTitle: "13 ta ta'limiy o'yin",
      gamesDesc: "O'yna, mashq qil va do'stlaring bilan bellash",
      qBuilderTitle: 'Savollar konstruktori',
      qBuilderDesc: "O'yinlar uchun o'z savol toplamlaringni yarat",
      gTug: ["Arqon tortish", "Savollar bo'yicha jamoaviy musobaqa"],
      gDrum: ["Bilim barabani", "O'quvchi va savolni tasodifiy tanlash"],
      gPair: ["Juftini top", "Xotira va moslik kartochkalari"],
      gGroup: ["Guruhlash", "So'z va rasmlarni guruhlarga ajratish"],
      gJeopardy: ["O'z o'yining (Jeopardy)", "Har xil qiymatli savollar viktorinasi"],
      gTickets: ["Biletlar", "Savolli imtihon biletlari to'plami"],
      gTF: ["Rost yoki Yolg'on", "Tasdiqning to'g'riligini aniqla"],
      gColor: ["Rangni top", "Boshqa rang tusini topish"],
      gMemory: ["Xotira mashqi", "Ketma-ketlikni eslab qol va takrorla"],
      gMental: ["Mental arifmetika", "Tezkor og'zaki hisob"],
      gFlags: ["Bayroqni top", "Mamlakatni bayrog'iga qarab top"],
      gOnlineTug: ["Onlayn Arqon", "Real vaqtdagi ko'p foydalanuvchili arqon tortish"],
      gOnlineQuiz: ["Onlayn Viktorina", "Xona kodi bilan ko'p foydalanuvchili viktorina"],

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
      questionSets: Array.isArray(d?.questionSets) ? d.questionSets : [],
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


  // =========================================================================
  // 13 EDUCATIONAL GAMES & QUESTION SETS BUILDER FOR NIMI AI
  // =========================================================================

  // Default question sets in RU & UZ
  const DEFAULT_QUESTION_SETS = [
    {
      id: 'default_math',
      title: 'Математика: Базовый счет / Matematika',
      subject: 'math',
      items: [
        { q: 'Сколько будет 7 × 8?', a: '56', options: ['48', '54', '56', '64'], category: 'Умножение' },
        { q: 'Чему равен корень из 144?', a: '12', options: ['10', '12', '14', '16'], category: 'Алгебра' },
        { q: 'Сколько градусов в сумме углов треугольника?', a: '180°', options: ['90°', '180°', '270°', '360°'], category: 'Геометрия' },
        { q: 'Сколько будет 15% от 200?', a: '30', options: ['20', '25', '30', '35'], category: 'Проценты' },
        { q: 'Какое число является простым?', a: '17', options: ['15', '17', '21', '27'], category: 'Числа' },
        { q: 'Чему равно 2 в 5-й степени?', a: '32', options: ['16', '25', '32', '64'], category: 'Степени' },
        { q: 'Сколько минут в 2.5 часах?', a: '150', options: ['120', '130', '150', '160'], category: 'Время' },
        { q: 'Периметр квадрата со стороной 6 см равен:', a: '24 см', options: ['12 см', '18 см', '24 см', '36 см'], category: 'Геометрия' },
        { q: 'Чему равно 100 : 4 × 2?', a: '50', options: ['12.5', '25', '50', '100'], category: 'Порядок действий' },
        { q: 'Найдите неизвестное x: 3x + 5 = 20', a: '5', options: ['3', '4', '5', '6'], category: 'Уравнения' }
      ]
    },
    {
      id: 'default_geo',
      title: 'География мира / Dunyo geografiyasi',
      subject: 'geography',
      items: [
        { q: 'Какая самая длинная река в мире?', a: 'Амазонка', options: ['Нил', 'Амазонка', 'Янцзы', 'Миссисипи'], category: 'Реки' },
        { q: 'Столица Франции:', a: 'Париж', options: ['Лондон', 'Берлин', 'Париж', 'Мадрид'], category: 'Столицы' },
        { q: 'Какое самое глубокое озеро на Земле?', a: 'Байкал', options: ['Виктория', 'Танганьика', 'Байкал', 'Верхнее'], category: 'Озера' },
        { q: 'Столица Узбекистана:', a: 'Ташкент', options: ['Самарканд', 'Ташкент', 'Бухара', 'Наманган'], category: 'Столицы' },
        { q: 'Какой самый большой материк на Земле?', a: 'Евразия', options: ['Африка', 'Евразия', 'Северная Америка', 'Антарктида'], category: 'Материки' },
        { q: 'Самый большой океан на Земле:', a: 'Тихий', options: ['Атлантический', 'Индийский', 'Тихий', 'Северный Ледовитый'], category: 'Океаны' },
        { q: 'В какой стране находятся Великие пирамиды?', a: 'Египет', options: ['Мексика', 'Египет', 'Греция', 'Италия'], category: 'Страны' },
        { q: 'Какой горный хребет самый высокий в мире?', a: 'Гималаи', options: ['Анды', 'Альпы', 'Гималаи', 'Кордильеры'], category: 'Горы' }
      ]
    },
    {
      id: 'default_science',
      title: 'Естествознание и Природа / Tabiatshunoslik',
      subject: 'science',
      items: [
        { q: 'Какой газ необходим людям для дыхания?', a: 'Кислород', options: ['Азот', 'Кислород', 'Углекислый газ', 'Водород'], category: 'Газы' },
        { q: 'Какая планета находится ближе всего к Солнцу?', a: 'Меркурий', options: ['Венера', 'Земля', 'Марс', 'Меркурий'], category: 'Космос' },
        { q: 'Процесс образования питательных веществ растениями под действием света:', a: 'Фотосинтез', options: ['Дыхание', 'Фотосинтез', 'Испарение', 'Брожение'], category: 'Растения' },
        { q: 'Сколько планет в Солнечной системе?', a: '8', options: ['7', '8', '9', '10'], category: 'Космос' },
        { q: 'Самое твёрдое природное вещество на Земле:', a: 'Алмаз', options: ['Гранит', 'Железо', 'Алмаз', 'Кварц'], category: 'Минералы' },
        { q: 'Температура кипения воды при нормальном давлении:', a: '100°C', options: ['80°C', '90°C', '100°C', '120°C'], category: 'Физика' }
      ]
    },
    {
      id: 'default_tf',
      title: 'Интересные факты (Правда/Ложь) / Faktlar',
      subject: 'general',
      items: [
        { q: 'Солнце — это звезда.', a: 'Правда', isTrue: true, explanation: 'Солнце — это желтый карлик, единственная звезда Солнечной системы.' },
        { q: 'Страусы прячут голову в песок при опасности.', a: 'Ложь', isTrue: false, explanation: 'Это миф! При опасности страусы убегают или ложатся на землю.' },
        { q: 'Великая Китайская стена видна из космоса невооруженным глазом.', a: 'Ложь', isTrue: false, explanation: 'Без специальной оптики или на низкой орбите её увидеть практически невозможно.' },
        { q: 'Вода расширяется при замерзании.', a: 'Правда', isTrue: true, explanation: 'Плотность льда меньше плотности жидкой воды, поэтому лед плавает.' },
        { q: 'У китов есть зубы.', a: 'Ложь', isTrue: false, explanation: 'У усатых китов вместо зубов китовый ус.' },
        { q: 'Земля вращается вокруг Солнца.', a: 'Правда', isTrue: true, explanation: 'Один оборот вокруг Солнца происходит за 365.25 дней.' }
      ]
    }
  ];

  // Country Flags Dataset with RU & UZ names and SVG/Emoji flags
  const COUNTRY_FLAGS_DATA = [
    { code: 'UZ', flag: '🇺🇿', ru: 'Узбекистан', uz: "O'zbekiston" },
    { code: 'RU', flag: '🇷🇺', ru: 'Россия', uz: 'Rossiya' },
    { code: 'US', flag: '🇺🇸', ru: 'США', uz: 'AQSh' },
    { code: 'GB', flag: '🇬🇧', ru: 'Великобритания', uz: 'Buyuk Britaniya' },
    { code: 'DE', flag: '🇩🇪', ru: 'Германия', uz: 'Germaniya' },
    { code: 'FR', flag: '🇫🇷', ru: 'Франция', uz: 'Fransiya' },
    { code: 'IT', flag: '🇮🇹', ru: 'Италия', uz: 'Italiya' },
    { code: 'ES', flag: '🇪🇸', ru: 'Испания', uz: 'Ispaniya' },
    { code: 'CN', flag: '🇨🇳', ru: 'Китай', uz: 'Xitoy' },
    { code: 'JP', flag: '🇯🇵', ru: 'Япония', uz: 'Yaponiya' },
    { code: 'TR', flag: '🇹🇷', ru: 'Турция', uz: 'Turkiya' },
    { code: 'KZ', flag: '🇰🇿', ru: 'Казахстан', uz: "Qozog'iston" },
    { code: 'KG', flag: '🇰🇬', ru: 'Кыргызстан', uz: "Qirg'iziston" },
    { code: 'TJ', flag: '🇹🇯', ru: 'Таджикистан', uz: 'Tojikiston' },
    { code: 'TM', flag: '🇹🇲', ru: 'Туркменистан', uz: 'Turkmaniston' },
    { code: 'EG', flag: '🇪🇬', ru: 'Египет', uz: 'Misr' },
    { code: 'KR', flag: '🇰🇷', ru: 'Южная Корея', uz: 'Janubiy Koreya' },
    { code: 'IN', flag: '🇮🇳', ru: 'Индия', uz: 'Hindiston' },
    { code: 'CA', flag: '🇨🇦', ru: 'Канада', uz: 'Kanada' },
    { code: 'BR', flag: '🇧🇷', ru: 'Бразилия', uz: 'Braziliya' },
    { code: 'AR', flag: '🇦🇷', ru: 'Аргентина', uz: 'Argentina' },
    { code: 'AU', flag: '🇦🇺', ru: 'Австралия', uz: 'Avstraliya' },
    { code: 'AE', flag: '🇦🇪', ru: 'ОАЭ', uz: 'Birlashgan Arab Amirliklari' },
    { code: 'SA', flag: '🇸🇦', ru: 'Саудовская Аравия', uz: 'Saudiya Arabistoni' },
    { code: 'CH', flag: '🇨🇭', ru: 'Швейцария', uz: 'Shveytsariya' },
    { code: 'SE', flag: '🇸🇪', ru: 'Швеция', uz: 'Shvetsiya' },
    { code: 'NL', flag: '🇳🇱', ru: 'Нидерланды', uz: 'Niderlandiya' },
    { code: 'AZ', flag: '🇦🇿', ru: 'Азербайджан', uz: 'Ozarbayjon' },
    { code: 'GE', flag: '🇬🇪', ru: 'Грузия', uz: 'Gruziya' },
    { code: 'AM', flag: '🇦🇲', ru: 'Армения', uz: 'Armaniston' }
  ];

  function getQuestionSets() {
    const custom = data.questionSets || [];
    return [...DEFAULT_QUESTION_SETS, ...custom];
  }

  function selectQuestionSetModal(title, onSelect) {
    const sets = getQuestionSets();
    const modal = h('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm' });
    const content = h('div', { class: CARD + ' w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col gap-4 p-6 bg-night-900 border border-white/10 shadow-2xl rounded-3xl' },
      h('div', { class: 'flex items-center justify-between' },
        h('h3', { class: 'text-xl font-bold text-white' }, title || 'Выберите набор вопросов'),
        h('button', { type: 'button', class: 'text-slate-400 hover:text-white', onclick: () => modal.remove() }, ico('x'))
      ),
      h('div', { class: 'flex flex-col gap-2' },
        sets.map(s => h('button', {
          type: 'button',
          class: 'flex items-center justify-between p-4 rounded-2xl bg-night-800 hover:bg-night-700 text-left border border-white/5 transition',
          onclick: () => { modal.remove(); onSelect(s); }
        },
        h('div', { class: 'min-w-0 flex-1' },
          h('p', { class: 'font-semibold text-white' }, s.title),
          h('p', { class: 'text-xs text-slate-400' }, 'Вопросов: ' + s.items.length)
        ),
        ico('chevron-right', 'text-slate-500')
        ))
      ),
      h('button', {
        type: 'button',
        class: BTN2,
        onclick: () => { modal.remove(); openQBuilder(); }
      }, ico('plus'), 'Создать свой набор вопросов')
    );
    modal.append(content);
    document.body.append(modal);
  }

  // -------------------------------------------------------------------------
  // MAIN GAMES HUB (Renders all 13 Games + Question Set Builder)
  // -------------------------------------------------------------------------
  function openGames() {
    const root = screen('activity');
    const g = data.progress.stats.games || {};

    root.append(titleBar(t('gamesTitle') || '13 Обучающих игр'));

    // Question Builder Banner
    root.append(
      h('button', {
        type: 'button',
        class: 'mb-4 flex w-full items-center gap-4 rounded-3xl bg-gradient-to-r from-brand-600/30 to-purple-600/30 p-4 border border-brand-500/30 text-left transition hover:border-brand-500/60',
        onclick: openQBuilder
      },
      h('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md' }, ico('notebook-pen')),
      h('div', { class: 'min-w-0 flex-1' },
        h('p', { class: 'font-bold text-white' }, t('qBuilderTitle') || 'Конструктор вопросов'),
        h('p', { class: 'text-xs text-slate-300' }, t('qBuilderDesc') || 'Создавай свои наборы вопросов для всех игр')
      ),
      ico('chevron-right', 'text-brand-300')
      )
    );

    const ALL_GAMES = [
      ['tug', 'repeat', t('gTug') || ['Перетягивание каната', 'Командное соревнование по вопросам'], playTugOfWar],
      ['drum', 'sparkles', t('gDrum') || ['Барабан знаний', 'Случайный выбор ученика и вопроса'], playDrum],
      ['pair', 'layers', t('gPair') || ['Найди пару', 'Карточки на память и совпадения'], playPair],
      ['group', 'puzzle', t('gGroup') || ['Группировка', 'Распределение по категориям'], playGrouping],
      ['jeopardy', 'award', t('gJeopardy') || ['Своя игра', 'Викторина с вопросами разной стоимости'], playJeopardy],
      ['tickets', 'file-text', t('gTickets') || ['Билеты', 'Наборы экзаменационных билетов'], playTickets],
      ['tf', 'check-check', t('gTF') || ['Правда или Ложь', 'Проверь верность утверждения'], playTrueFalse],
      ['color', 'eye', t('gColor') || ['Найди цвет', 'Найди отличающийся оттенок'], playColor],
      ['memory', 'brain', t('gMemory') || ['Тренировка памяти', 'Запомни и повтори последовательность'], playMemory],
      ['mental', 'calculator', t('gMental') || ['Ментальная арифметика', 'Быстрый устный счёт'], playMentalMath],
      ['flags', 'globe', t('gFlags') || ['Найди флаг', 'Угадай страну по её флагу'], playFlags],
      ['onlineTug', 'zap', t('gOnlineTug') || ['Онлайн Канат', 'Живое многопользовательское перетягивание'], playOnlineTug],
      ['onlineQuiz', 'users', t('gOnlineQuiz') || ['Онлайн Викторина', 'Живая викторина с кодом комнаты'], playOnlineQuiz]
    ];

    const listGrid = h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' });

    ALL_GAMES.forEach(([key, ic, [name, desc], fn]) => {
      listGrid.append(
        h('button', {
          type: 'button',
          class: CARD + ' flex items-center gap-4 text-left transition hover:bg-night-800 cursor-pointer border border-white/5 hover:border-white/20',
          onclick: fn
        },
        h('span', { class: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400' }, ico(ic || 'gamepad-2')),
        h('div', { class: 'min-w-0 flex-1' },
          h('p', { class: 'font-semibold text-white text-base' }, name),
          h('p', { class: 'text-xs text-slate-400 line-clamp-1' }, desc)
        ),
        g[key] ? h('span', { class: 'shrink-0 rounded-full bg-night-700 px-3 py-1 text-xs text-slate-200' }, 'Рекорд: ' + g[key]) : null,
        ico('chevron-right', 'text-slate-500')
        )
      );
    });

    root.append(listGrid);
  }

  // -------------------------------------------------------------------------
  // QUESTION SETS EDITOR (CONSTRUCTOR)
  // -------------------------------------------------------------------------
  function openQBuilder() {
    const root = screen('activity');
    root.append(titleBar('Конструктор вопросов', openGames));

    const sets = data.questionSets || [];

    const header = h('div', { class: 'flex items-center justify-between mb-4' },
      h('h2', { class: 'text-lg font-bold text-white' }, 'Мои наборы вопросов'),
      h('button', { type: 'button', class: 'flex items-center gap-1.5 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white', onclick: createNewSet }, ico('plus'), 'Новый набор')
    );

    root.append(header);

    if (!sets.length) {
      root.append(
        h('div', { class: CARD + ' text-center py-12 text-slate-400' },
          ico('notebook-pen', 'h-12 w-12 mx-auto mb-3 text-slate-600'),
          h('p', { class: 'text-white font-semibold' }, 'У вас пока нет созданных наборов'),
          h('p', { class: 'text-sm mt-1' }, 'Создайте свой набор вопросов для викторин и игр!')
        )
      );
      return;
    }

    const setList = h('div', { class: 'flex flex-col gap-3' });
    sets.forEach((s, idx) => {
      setList.append(
        h('div', { class: CARD + ' flex items-center justify-between p-4 bg-night-800' },
          h('div', { class: 'min-w-0 flex-1' },
            h('p', { class: 'font-bold text-white' }, s.title),
            h('p', { class: 'text-xs text-slate-400' }, 'Вопросов: ' + s.items.length)
          ),
          h('div', { class: 'flex items-center gap-2' },
            h('button', { type: 'button', class: 'p-2 text-slate-300 hover:text-white', onclick: () => editSet(idx) }, ico('pencil')),
            h('button', { type: 'button', class: 'p-2 text-rose-400 hover:text-rose-300', onclick: () => deleteSet(idx) }, ico('trash-2'))
          )
        )
      );
    });
    root.append(setList);

    function createNewSet() {
      data.questionSets = data.questionSets || [];
      const newS = {
        id: 'custom_' + Date.now(),
        title: 'Новый набор вопросов',
        items: []
      };
      data.questionSets.push(newS);
      save('questionSets');
      editSet(data.questionSets.length - 1);
    }

    function deleteSet(idx) {
      if (confirm('Удалить этот набор вопросов?')) {
        data.questionSets.splice(idx, 1);
        save('questionSets');
        openQBuilder();
      }
    }

    function editSet(idx) {
      const s = data.questionSets[idx];
      root.innerHTML = '';
      root.append(titleBar('Редактирование набора', openQBuilder));

      const titleInput = h('input', { type: 'text', class: INPUT + ' mb-4 text-lg font-bold', value: s.title, placeholder: 'Название набора' });

      const qContainer = h('div', { class: 'flex flex-col gap-3 mb-6' });

      const renderQuestions = () => {
        qContainer.innerHTML = '';
        s.items.forEach((qItem, qIdx) => {
          qContainer.append(
            h('div', { class: CARD + ' bg-night-800 p-4 flex flex-col gap-2 relative' },
              h('div', { class: 'flex justify-between items-center' },
                h('span', { class: 'text-xs font-bold text-brand-400' }, 'Вопрос ' + (qIdx + 1)),
                h('button', { type: 'button', class: 'text-rose-400 p-1', onclick: () => { s.items.splice(qIdx, 1); save('questionSets'); renderQuestions(); } }, ico('trash-2'))
              ),
              h('input', {
                type: 'text',
                class: INPUT + ' text-sm',
                value: qItem.q || '',
                placeholder: 'Текст вопроса',
                onchange: (e) => { qItem.q = e.target.value; save('questionSets'); }
              }),
              h('input', {
                type: 'text',
                class: INPUT + ' text-sm border-emerald-500/50',
                value: qItem.a || '',
                placeholder: 'Правильный ответ',
                onchange: (e) => { qItem.a = e.target.value; save('questionSets'); }
              }),
              h('input', {
                type: 'text',
                class: INPUT + ' text-xs',
                value: (qItem.options || []).join(', '),
                placeholder: 'Варианты ответа через запятую (необязательно)',
                onchange: (e) => { qItem.options = e.target.value.split(',').map(x => x.trim()).filter(Boolean); save('questionSets'); }
              })
            )
          );
        });
      };

      renderQuestions();

      const addQBtn = h('button', {
        type: 'button',
        class: BTN2,
        onclick: () => {
          s.items.push({ q: '', a: '', options: [] });
          save('questionSets');
          renderQuestions();
        }
      }, ico('plus'), 'Добавить вопрос');

      const saveBtn = h('button', {
        type: 'button',
        class: BTN + ' mt-4',
        onclick: () => {
          s.title = titleInput.value.trim() || 'Набор вопросов';
          save('questionSets');
          openQBuilder();
        }
      }, ico('check'), 'Сохранить набор');

      root.append(titleInput, qContainer, addQBtn, saveBtn);
    }
  }

  // -------------------------------------------------------------------------
  // GAME 1: TUG OF WAR (ПЕРЕТЯГИВАНИЕ КАНАТА)
  // -------------------------------------------------------------------------
  function playTugOfWar() {
    selectQuestionSetModal('Перетягивание каната: Выберите набор', (qSet) => {
      const root = screen('activity');
      let team1 = 'Команда А';
      let team2 = 'Команда Б';
      let pos = 0; // -5 to +5
      let turn = 1; // 1 or 2
      let qIndex = 0;
      const questions = [...qSet.items];

      root.append(titleBar('Перетягивание каната', openGames));

      const ropeBar = h('div', { class: 'relative w-full h-12 bg-night-800 rounded-full my-6 flex items-center justify-between px-4 overflow-hidden border border-white/10' });
      const ribbon = h('div', { class: 'absolute w-8 h-8 rounded-full bg-brand-500 shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold transition-all duration-500' }, '🚩');

      const updateRope = () => {
        const pct = 50 + (pos * 9);
        ribbon.style.left = 'calc(' + pct + '% - 16px)';
      };

      ropeBar.append(ribbon);

      const statusBox = h('div', { class: 'text-center my-4 font-bold text-lg text-white' });
      const qBox = h('div', { class: CARD + ' p-6 text-center text-xl font-bold text-white mb-4 bg-night-800' });
      const optionsBox = h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' });

      const renderTurn = () => {
        updateRope();
        if (pos <= -5) {
          gameResult(root, 'Перетягивание каната', ['🎉 Победила ' + team1 + '!'], bestGame('tug', 10), playTugOfWar);
          return;
        }
        if (pos >= 5) {
          gameResult(root, 'Перетягивание каната', ['🎉 Победила ' + team2 + '!'], bestGame('tug', 10), playTugOfWar);
          return;
        }
        if (qIndex >= questions.length) {
          const winner = pos < 0 ? team1 : pos > 0 ? team2 : 'Ничья!';
          gameResult(root, 'Перетягивание каната', ['Игра окончена!', 'Результат: ' + winner], bestGame('tug', 5), playTugOfWar);
          return;
        }

        const currQ = questions[qIndex];
        statusBox.textContent = 'Ход: ' + (turn === 1 ? team1 : team2);
        statusBox.className = 'text-center my-4 font-bold text-lg ' + (turn === 1 ? 'text-rose-400' : 'text-sky-400');
        qBox.textContent = currQ.q;

        optionsBox.innerHTML = '';
        const opts = currQ.options && currQ.options.length ? currQ.options : [currQ.a, 'Другой ответ'];

        opts.forEach(opt => {
          optionsBox.append(
            h('button', {
              type: 'button',
              class: BTN2 + ' py-4 text-base font-semibold',
              onclick: () => {
                const ok = (opt.trim().toLowerCase() === String(currQ.a).trim().toLowerCase());
                if (ok) {
                  pos += (turn === 1 ? -1 : 1);
                }
                turn = turn === 1 ? 2 : 1;
                qIndex++;
                renderTurn();
              }
            }, opt)
          );
        });
      };

      root.append(
        h('div', { class: 'flex justify-between font-bold text-sm px-2 text-slate-300' },
          h('span', { class: 'text-rose-400' }, '🔴 ' + team1),
          h('span', { class: 'text-sky-400' }, '🔵 ' + team2)
        ),
        ropeBar,
        statusBox,
        qBox,
        optionsBox
      );

      renderTurn();
    });
  }

  // -------------------------------------------------------------------------
  // GAME 2: DRUM / WHEEL OF FORTUNE (БАРАБАН)
  // -------------------------------------------------------------------------
  function playDrum() {
    selectQuestionSetModal('Барабан знаний: Выберите вопросы', (qSet) => {
      const root = screen('activity');
      root.append(titleBar('Барабан знаний', openGames));

      let names = ['Алишер', 'Мадина', 'Тимур', 'Сардор', 'Елена', 'Шахзод'];
      let activePool = [...names];
      let isSpinning = false;
      const questions = [...qSet.items];

      const canvas = h('canvas', { width: '300', height: '300', class: 'mx-auto my-4 rounded-full shadow-2xl border-4 border-amber-400' });
      const ctx = canvas.getContext('2d');

      const drawWheel = (angle = 0) => {
        const len = activePool.length || 1;
        const slice = (2 * Math.PI) / len;
        ctx.clearRect(0, 0, 300, 300);

        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

        for (let i = 0; i < len; i++) {
          ctx.beginPath();
          ctx.fillStyle = colors[i % colors.length];
          ctx.moveTo(150, 150);
          ctx.arc(150, 150, 140, angle + i * slice, angle + (i + 1) * slice);
          ctx.fill();
          ctx.stroke();

          ctx.save();
          ctx.translate(150, 150);
          ctx.rotate(angle + (i + 0.5) * slice);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(activePool[i] || 'Никого', 130, 5);
          ctx.restore();
        }
      };

      drawWheel();

      const spinBtn = h('button', {
        type: 'button',
        class: BTN + ' max-w-xs mx-auto my-4',
        onclick: () => {
          if (isSpinning || !activePool.length) return;
          isSpinning = true;
          let curAngle = 0;
          const totalRotation = Math.PI * 8 + Math.random() * Math.PI * 2;
          const start = Date.now();
          const duration = 3000;

          const anim = setInterval(() => {
            const now = Date.now();
            const progress = Math.min(1, (now - start) / duration);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            curAngle = totalRotation * easeOut;
            drawWheel(curAngle);

            if (progress >= 1) {
              clearInterval(anim);
              isSpinning = false;
              const len = activePool.length;
              const slice = (2 * Math.PI) / len;
              const normalized = (2 * Math.PI - (curAngle % (2 * Math.PI))) % (2 * Math.PI);
              const idx = Math.floor(normalized / slice) % len;
              const chosen = activePool[idx];

              activePool.splice(idx, 1);
              showQuestionModal(chosen);
            }
          }, 30);
        }
      }, ico('sparkles'), 'Крутить барабан');

      const resetPoolBtn = h('button', {
        type: 'button',
        class: BTN2 + ' max-w-xs mx-auto',
        onclick: () => {
          activePool = [...names];
          drawWheel();
        }
      }, ico('repeat'), 'Сбросить круг учеников');

      function showQuestionModal(studentName) {
        const randQ = questions[Math.floor(Math.random() * questions.length)];
        const modal = h('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm' });
        const box = h('div', { class: CARD + ' w-full max-w-md p-6 bg-night-900 border border-white/10 text-center flex flex-col gap-4 rounded-3xl shadow-2xl' },
          h('span', { class: 'text-3xl' }, '🎯'),
          h('h3', { class: 'text-2xl font-extrabold text-amber-300' }, studentName),
          h('p', { class: 'text-lg font-bold text-white' }, randQ.q),
          h('div', { class: 'flex gap-3 mt-4' },
            h('button', { type: 'button', class: BTN + ' bg-emerald-600 hover:bg-emerald-500', onclick: () => { modal.remove(); drawWheel(); } }, ico('check'), 'Верно (+1)'),
            h('button', { type: 'button', class: BTN2 + ' border-rose-500/50 text-rose-300', onclick: () => { modal.remove(); drawWheel(); } }, ico('x'), 'Неверно')
          )
        );
        modal.append(box);
        document.body.append(modal);
      }

      root.append(canvas, spinBtn, resetPoolBtn);
    });
  }

  // -------------------------------------------------------------------------
  // GAME 3: FIND A PAIR (НАЙДИ ПАРУ)
  // -------------------------------------------------------------------------
  function playPair() {
    const root = screen('activity');
    root.append(titleBar('Найди пару', openGames));

    const PAIRS_DATA = [
      ['🍎', 'Яблоко'], ['🐶', 'Собака'], ['🚗', 'Машина'], ['🚀', 'Ракета'],
      ['⚽', 'Мяч'], ['📚', 'Книга'], ['🎨', 'Краски'], ['🎸', 'Гитара']
    ];

    let cards = [];
    PAIRS_DATA.slice(0, 6).forEach(([icon, text], pairId) => {
      cards.push({ id: pairId * 2, pairId, val: icon, type: 'icon', flipped: false, matched: false });
      cards.push({ id: pairId * 2 + 1, pairId, val: text, type: 'text', flipped: false, matched: false });
    });

    cards.sort(() => Math.random() - 0.5);

    let flippedCards = [];
    let moves = 0;
    let matchedCount = 0;

    const movesEl = h('div', { class: 'text-center font-bold text-slate-300 mb-4' }, 'Ходов: 0');
    const grid = h('div', { class: 'grid grid-cols-3 md:grid-cols-4 gap-3 max-w-lg mx-auto' });

    const renderGrid = () => {
      grid.innerHTML = '';
      cards.forEach((c) => {
        const cardBtn = h('button', {
          type: 'button',
          class: 'h-24 rounded-2xl font-bold text-lg flex items-center justify-center p-2 transition-all duration-300 ' + (
            c.matched ? 'bg-emerald-600/30 border-2 border-emerald-500 text-emerald-200 cursor-default' :
            c.flipped ? 'bg-brand-600 text-white border-2 border-brand-400' :
            'bg-night-800 text-transparent border border-white/10 hover:bg-night-700'
          ),
          onclick: () => {
            if (c.flipped || c.matched || flippedCards.length >= 2) return;
            c.flipped = true;
            flippedCards.push(c);
            renderGrid();

            if (flippedCards.length === 2) {
              moves++;
              movesEl.textContent = 'Ходов: ' + moves;
              const [c1, c2] = flippedCards;

              if (c1.pairId === c2.pairId) {
                c1.matched = true;
                c2.matched = true;
                matchedCount++;
                flippedCards = [];
                renderGrid();
                if (matchedCount === PAIRS_DATA.slice(0, 6).length) {
                  setTimeout(() => gameResult(root, 'Найди пару', ['Победа! Ходов: ' + moves], bestGame('pair', 100 - moves), playPair), 500);
                }
              } else {
                setTimeout(() => {
                  c1.flipped = false;
                  c2.flipped = false;
                  flippedCards = [];
                  renderGrid();
                }, 800);
              }
            }
          }
        }, c.flipped || c.matched ? c.val : '❓');

        grid.append(cardBtn);
      });
    };

    root.append(movesEl, grid);
    renderGrid();
  }

  // -------------------------------------------------------------------------
  // GAME 4: GROUPING (ГРУППИРОВКА)
  // -------------------------------------------------------------------------
  function playGrouping() {
    const root = screen('activity');
    root.append(titleBar('Группировка', openGames));

    const categories = ['Живое', 'Неживое'];
    const items = [
      { text: '🐕 Собака', cat: 'Живое' },
      { text: '🚗 Автомобиль', cat: 'Неживое' },
      { text: '🌳 Дерево', cat: 'Живое' },
      { text: '🪨 Камень', cat: 'Неживое' },
      { text: '🦅 Орел', cat: 'Живое' },
      { text: '💻 Компьютер', cat: 'Неживое' }
    ].sort(() => Math.random() - 0.5);

    let assignments = {};
    let selectedItem = null;

    const container = h('div', { class: 'flex flex-col gap-4 max-w-lg mx-auto' });

    const render = () => {
      container.innerHTML = '';

      const itemsBox = h('div', { class: CARD + ' p-4 bg-night-800' },
        h('p', { class: 'text-xs font-bold text-slate-400 mb-2' }, 'Выберите элемент:'),
        h('div', { class: 'flex flex-wrap gap-2' },
          items.map((it, idx) => {
            const isAssigned = assignments[idx] !== undefined;
            return h('button', {
              type: 'button',
              class: 'px-3 py-2 rounded-xl text-sm font-semibold border transition ' + (
                selectedItem === idx ? 'bg-amber-400 text-slate-900 border-amber-300 ring-2 ring-amber-400' :
                isAssigned ? 'bg-night-700 text-slate-400 border-transparent opacity-50' :
                'bg-night-900 text-white border-white/10 hover:bg-night-700'
              ),
              onclick: () => { selectedItem = idx; render(); }
            }, it.text);
          })
        )
      );

      const catGrid = h('div', { class: 'grid grid-cols-2 gap-3' });

      categories.forEach(cat => {
        catGrid.append(
          h('button', {
            type: 'button',
            class: CARD + ' p-4 bg-night-900 border-2 border-dashed border-white/20 min-h-36 flex flex-col items-center gap-2 text-left hover:border-brand-500 transition',
            onclick: () => {
              if (selectedItem !== null) {
                assignments[selectedItem] = cat;
                selectedItem = null;
                render();
              }
            }
          },
          h('span', { class: 'font-bold text-brand-300 text-base' }, cat),
          h('div', { class: 'flex flex-col gap-1 w-full mt-2' },
            Object.entries(assignments)
              .filter(([_, c]) => c === cat)
              .map(([idx, _]) => h('span', { class: 'text-xs bg-night-800 text-white px-2 py-1 rounded-lg border border-white/5' }, items[idx].text))
          )
          )
        );
      });

      const checkBtn = h('button', {
        type: 'button',
        class: BTN,
        onclick: () => {
          let correct = 0;
          items.forEach((it, idx) => {
            if (assignments[idx] === it.cat) correct++;
          });
          gameResult(root, 'Группировка', ['Результат: ' + correct + ' из ' + items.length + ' верно!'], bestGame('group', correct), playGrouping);
        }
      }, ico('check'), 'Проверить распределение');

      container.append(itemsBox, catGrid, checkBtn);
    };

    root.append(container);
    render();
  }

  // -------------------------------------------------------------------------
  // GAME 5: JEOPARDY (СВОЯ ИГРА)
  // -------------------------------------------------------------------------
  function playJeopardy() {
    const root = screen('activity');
    root.append(titleBar('Своя игра', openGames));

    const board = [
      {
        category: 'Математика',
        questions: [
          { pts: 100, q: '5 × 5 = ?', a: '25' },
          { pts: 200, q: 'Корень из 81:', a: '9' },
          { pts: 300, q: '12 × 12 = ?', a: '144' }
        ]
      },
      {
        category: 'Природа',
        questions: [
          { pts: 100, q: 'Какая планета 3-я от Солнца?', a: 'Земля' },
          { pts: 200, q: 'Самое быстрое животное на суше:', a: 'Гепард' },
          { pts: 300, q: 'Формула воды:', a: 'H2O' }
        ]
      }
    ];

    let score = 0;
    const played = new Set();

    const scoreEl = h('div', { class: 'text-center font-bold text-amber-300 text-xl mb-4' }, 'Счёт: 0');
    const grid = h('div', { class: 'grid grid-cols-2 gap-3 max-w-lg mx-auto' });

    board.forEach((col, colIdx) => {
      const colBox = h('div', { class: 'flex flex-col gap-2' },
        h('div', { class: 'p-3 bg-brand-600 rounded-2xl text-center font-bold text-white text-sm shadow-md' }, col.category)
      );

      col.questions.forEach((qObj, qIdx) => {
        const qKey = colIdx + '_' + qIdx;
        colBox.append(
          h('button', {
            type: 'button',
            class: 'h-16 rounded-2xl font-bold text-lg transition ' + (
              played.has(qKey) ? 'bg-night-800 text-slate-600 cursor-default' : 'bg-night-900 text-amber-400 border border-amber-400/30 hover:bg-night-800'
            ),
            onclick: () => {
              if (played.has(qKey)) return;
              played.add(qKey);
              showQModal(qObj, qKey);
            }
          }, played.has(qKey) ? '✓' : qObj.pts)
        );
      });

      grid.append(colBox);
    });

    function showQModal(qObj, qKey) {
      const modal = h('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm' });
      const box = h('div', { class: CARD + ' w-full max-w-md p-6 bg-night-900 border border-white/10 text-center flex flex-col gap-4 rounded-3xl shadow-2xl' },
        h('span', { class: 'text-xs font-bold text-amber-400' }, 'Вопрос на ' + qObj.pts + ' очков'),
        h('p', { class: 'text-xl font-bold text-white' }, qObj.q),
        h('div', { class: 'flex gap-3 mt-4' },
          h('button', { type: 'button', class: BTN + ' bg-emerald-600 hover:bg-emerald-500', onclick: () => { score += qObj.pts; scoreEl.textContent = 'Счёт: ' + score; modal.remove(); } }, 'Верно (+' + qObj.pts + ')'),
          h('button', { type: 'button', class: BTN2 + ' border-rose-500/50 text-rose-300', onclick: () => { score -= qObj.pts; scoreEl.textContent = 'Счёт: ' + score; modal.remove(); } }, 'Ошибка (-' + qObj.pts + ')')
        )
      );
      modal.append(box);
      document.body.append(modal);
    }

    root.append(scoreEl, grid);
  }

  // -------------------------------------------------------------------------
  // GAME 6: TICKETS (БИЛЕТЫ)
  // -------------------------------------------------------------------------
  function playTickets() {
    selectQuestionSetModal('Билеты: Выберите наборы', (qSet) => {
      const root = screen('activity');
      root.append(titleBar('Билеты', openGames));

      const tickets = [];
      const items = [...qSet.items];
      for (let i = 0; i < items.length; i += 2) {
        tickets.push(items.slice(i, i + 2));
      }

      const grid = h('div', { class: 'grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto' });

      tickets.forEach((tGroup, idx) => {
        grid.append(
          h('button', {
            type: 'button',
            class: CARD + ' p-6 bg-night-800 border border-white/10 flex flex-col items-center gap-2 hover:border-brand-400 transition',
            onclick: () => openTicketModal(idx + 1, tGroup)
          },
          ico('file-text', 'h-8 w-8 text-brand-400'),
          h('span', { class: 'font-bold text-white text-base' }, 'Билет №' + (idx + 1)),
          h('span', { class: 'text-xs text-slate-400' }, tGroup.length + ' вопроса')
          )
        );
      });

      function openTicketModal(tNum, qList) {
        root.innerHTML = '';
        root.append(titleBar('Билет №' + tNum, playTickets));

        const container = h('div', { class: 'flex flex-col gap-4 max-w-lg mx-auto' });

        qList.forEach((q, i) => {
          container.append(
            h('div', { class: CARD + ' p-4 bg-night-800' },
              h('p', { class: 'font-bold text-brand-300 text-sm mb-1' }, 'Вопрос ' + (i + 1) + ':'),
              h('p', { class: 'text-white font-semibold mb-3' }, q.q),
              h('input', { type: 'text', class: INPUT, placeholder: 'Ваш ответ' })
            )
          );
        });

        container.append(
          h('button', {
            type: 'button',
            class: BTN,
            onclick: () => gameResult(root, 'Билет №' + tNum, ['Билет успешно сдан!'], bestGame('tickets', 1), playTickets)
          }, ico('check'), 'Сдать билет')
        );

        root.append(container);
      }

      root.append(grid);
    });
  }

  // -------------------------------------------------------------------------
  // GAME 7: TRUE / FALSE (ПРАВДА ИЛИ ЛОЖЬ)
  // -------------------------------------------------------------------------
  function playTrueFalse() {
    selectQuestionSetModal('Правда или Ложь: Выберите набор', (qSet) => {
      const root = screen('activity');
      root.append(titleBar('Правда или Ложь', openGames));

      const items = qSet.items.filter(x => x.isTrue !== undefined || x.a);
      let idx = 0;
      let score = 0;

      const renderCard = () => {
        if (idx >= items.length) {
          gameResult(root, 'Правда или Ложь', ['Результат: ' + score + ' из ' + items.length], bestGame('tf', score), playTrueFalse);
          return;
        }

        const curr = items[idx];
        root.innerHTML = '';
        root.append(titleBar('Правда или Ложь', openGames));

        const card = h('div', { class: CARD + ' p-8 text-center flex flex-col gap-6 bg-night-800 max-w-lg mx-auto border border-white/10 shadow-2xl' },
          h('span', { class: 'text-xs font-bold text-brand-400' }, 'Утверждение ' + (idx + 1) + ' из ' + items.length),
          h('p', { class: 'text-xl font-bold text-white leading-relaxed' }, curr.q),
          h('div', { class: 'grid grid-cols-2 gap-4 mt-4' },
            h('button', {
              type: 'button',
              class: BTN + ' bg-emerald-600 hover:bg-emerald-500 text-lg',
              onclick: () => check(true)
            }, 'ПРАВДА'),
            h('button', {
              type: 'button',
              class: BTN + ' bg-rose-600 hover:bg-rose-500 text-lg',
              onclick: () => check(false)
            }, 'ЛОЖЬ')
          )
        );

        function check(userAns) {
          const expected = curr.isTrue !== undefined ? curr.isTrue : String(curr.a).toLowerCase().includes('правда');
          const isOk = (userAns === expected);
          if (isOk) score++;

          const modal = h('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm' });
          const box = h('div', { class: CARD + ' w-full max-w-md p-6 bg-night-900 border border-white/10 text-center flex flex-col gap-4 rounded-3xl' },
            h('span', { class: 'text-4xl' }, isOk ? '🎉' : '❌'),
            h('h3', { class: 'text-2xl font-bold ' + (isOk ? 'text-emerald-400' : 'text-rose-400') }, isOk ? 'Верно!' : 'Неверно!'),
            curr.explanation ? h('p', { class: 'text-sm text-slate-300' }, curr.explanation) : null,
            h('button', { type: 'button', class: BTN, onclick: () => { modal.remove(); idx++; renderCard(); } }, 'Далее')
          );
          modal.append(box);
          document.body.append(modal);
        }

        root.append(card);
      };

      renderCard();
    });
  }

  // -------------------------------------------------------------------------
  // GAME 8: FIND DIFFERENT COLOR (НАЙДИТЕ ДРУГОЙ ЦВЕТ)
  // -------------------------------------------------------------------------
  function playColor() {
    const root = screen('activity');
    root.append(titleBar('Найди цвет', openGames));

    let level = 1;
    let score = 0;

    const renderLevel = () => {
      root.innerHTML = '';
      root.append(titleBar('Найди цвет', openGames));

      const size = Math.min(6, 2 + Math.floor(level / 2));
      const total = size * size;
      const oddIdx = Math.floor(Math.random() * total);

      const hVal = Math.floor(Math.random() * 360);
      const sVal = 70;
      const lVal = 50;

      const diff = Math.max(3, 25 - level * 2);
      const oddL = lVal + (Math.random() > 0.5 ? diff : -diff);

      const scoreBox = h('div', { class: 'text-center font-bold text-slate-300 mb-4' }, 'Уровень: ' + level + ' | Очки: ' + score);
      const grid = h('div', {
        class: 'grid gap-2 max-w-sm mx-auto p-4 bg-night-900 rounded-3xl border border-white/10',
        style: 'grid-template-columns: repeat(' + size + ', minmax(0, 1fr));'
      });

      for (let i = 0; i < total; i++) {
        const isOdd = (i === oddIdx);
        const bg = isOdd ? 'hsl(' + hVal + ', ' + sVal + '%, ' + oddL + '%)' : 'hsl(' + hVal + ', ' + sVal + '%, ' + lVal + '%)';

        grid.append(
          h('button', {
            type: 'button',
            class: 'w-full aspect-square rounded-xl transition transform active:scale-95 shadow-md flex items-center justify-center',
            style: 'background-color: ' + bg,
            onclick: () => {
              if (isOdd) {
                score += 10;
                level++;
                renderLevel();
              } else {
                gameResult(root, 'Найди цвет', ['Игра окончена! Достигнут уровень: ' + level], bestGame('color', score), playColor);
              }
            }
          })
        );
      }

      root.append(scoreBox, grid);
    };

    renderLevel();
  }

  // -------------------------------------------------------------------------
  // GAME 9: MEMORY TRAINING (ТРЕНИРОВКА ПАМЯТИ)
  // -------------------------------------------------------------------------
  function playMemory() {
    const root = screen('activity');
    root.append(titleBar('Тренировка памяти', openGames));

    let sequence = [];
    let userSeq = [];
    let level = 1;

    const colors = [
      { id: 0, bg: 'bg-rose-500' },
      { id: 1, bg: 'bg-sky-500' },
      { id: 2, bg: 'bg-emerald-500' },
      { id: 3, bg: 'bg-amber-500' }
    ];

    const statusEl = h('div', { class: 'text-center font-bold text-white text-lg mb-4' }, 'Уровень ' + level);
    const padGrid = h('div', { class: 'grid grid-cols-2 gap-4 max-w-xs mx-auto my-6' });

    const pads = colors.map((c) => {
      const btn = h('button', {
        type: 'button',
        class: 'h-32 rounded-3xl ' + c.bg + ' shadow-lg transition active:scale-95'
      });
      padGrid.append(btn);
      return btn;
    });

    const nextRound = () => {
      sequence.push(Math.floor(Math.random() * 4));
      userSeq = [];
      statusEl.textContent = 'Запоминайте... (Уровень ' + level + ')';
      playSequence();
    };

    const playSequence = () => {
      let i = 0;
      const interval = setInterval(() => {
        if (i >= sequence.length) {
          clearInterval(interval);
          statusEl.textContent = 'Ваша очередь!';
          return;
        }
        flashPad(sequence[i]);
        i++;
      }, 700);
    };

    const flashPad = (padIdx) => {
      const p = pads[padIdx];
      p.classList.add('brightness-150', 'scale-105');
      setTimeout(() => p.classList.remove('brightness-150', 'scale-105'), 350);
    };

    pads.forEach((pBtn, pIdx) => {
      pBtn.onclick = () => {
        flashPad(pIdx);
        userSeq.push(pIdx);

        const currStep = userSeq.length - 1;
        if (userSeq[currStep] !== sequence[currStep]) {
          gameResult(root, 'Тренировка памяти', ['Ошибка! Ваш уровень: ' + level], bestGame('memory', level), playMemory);
          return;
        }

        if (userSeq.length === sequence.length) {
          level++;
          setTimeout(nextRound, 1000);
        }
      };
    });

    root.append(statusEl, padGrid);
    nextRound();
  }

  // -------------------------------------------------------------------------
  // GAME 10: MENTAL ARITHMETIC (МЕНТАЛЬНАЯ АРИФМЕТИКА)
  // -------------------------------------------------------------------------
  function playMentalMath() {
    playMental();
  }

  // -------------------------------------------------------------------------
  // GAME 11: FIND FLAGS (НАЙДИТЕ ФЛАГИ)
  // -------------------------------------------------------------------------
  function playFlags() {
    const root = screen('activity');
    root.append(titleBar('Найди флаг', openGames));

    let score = 0;
    let round = 0;

    const nextFlag = () => {
      round++;
      if (round > 10) {
        gameResult(root, 'Найди флаг', ['Отлично! Счёт: ' + score + ' из 10'], bestGame('flags', score), playFlags);
        return;
      }

      root.innerHTML = '';
      root.append(titleBar('Найди флаг', openGames));

      const randCountry = COUNTRY_FLAGS_DATA[Math.floor(Math.random() * COUNTRY_FLAGS_DATA.length)];

      const wrongOpts = COUNTRY_FLAGS_DATA.filter(c => c.code !== randCountry.code)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOpts = [randCountry, ...wrongOpts].sort(() => Math.random() - 0.5);

      const card = h('div', { class: CARD + ' p-8 text-center flex flex-col items-center gap-6 bg-night-800 max-w-lg mx-auto border border-white/10 shadow-2xl' },
        h('span', { class: 'text-xs font-bold text-brand-400' }, 'Флаг ' + round + ' из 10'),
        h('span', { class: 'text-8xl my-4 drop-shadow-md' }, randCountry.flag),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3 w-full' },
          allOpts.map(opt => h('button', {
            type: 'button',
            class: BTN2 + ' py-4 text-base font-bold',
            onclick: () => {
              if (opt.code === randCountry.code) score++;
              nextFlag();
            }
          }, opt.ru))
        )
      );

      root.append(card);
    };

    nextFlag();
  }

  // -------------------------------------------------------------------------
  // GAME 12: ONLINE TUG OF WAR (ОНЛАЙН ПЕРЕТЯГИВАНИЕ)
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // GAME 12: ONLINE TUG OF WAR (ОНЛАЙН ПЕРЕТЯГИВАНИЕ) - REAL-TIME
  // -------------------------------------------------------------------------
  function playOnlineTug() {
    const root = screen('activity');
    root.append(titleBar('Онлайн Канат', openGames));

    const box = h('div', { class: CARD + ' p-6 text-center max-w-md mx-auto flex flex-col gap-4 bg-night-800' },
      h('span', { class: 'text-4xl' }, '⚡'),
      h('h3', { class: 'text-xl font-bold text-white' }, 'Онлайн Перетягивание Каната'),
      h('p', { class: 'text-xs text-slate-300' }, 'Многопользовательский режим в реальном времени'),
      h('input', { id: 'tugPlayerName', type: 'text', class: INPUT + ' text-center', placeholder: 'Ваше имя', value: (data.profile && data.profile.name) || 'Ученик' }),
      h('input', { id: 'tugRoomCode', type: 'text', class: INPUT + ' text-center font-mono text-xl tracking-widest', placeholder: 'Код комнаты (6 цифр)' }),
      h('div', { class: 'flex gap-3' },
        h('button', { type: 'button', class: BTN, onclick: joinTug }, 'Войти в комнату'),
        h('button', { type: 'button', class: BTN2, onclick: createTug }, 'Создать комнату')
      )
    );

    root.append(box);

    async function createTug() {
      selectQuestionSetModal('Выберите набор вопросов для комнаты', async (qSet) => {
        try {
          const res = await N.postJson('/api/games/online/create', { type: 'tug', questions: qSet.items });
          if (res && res.code) {
            joinRoomLobby(res.code, true, qSet.items);
          } else {
            alert('Не удалось создать комнату');
          }
        } catch {
          alert('Ошибка соединения с сервером');
        }
      });
    }

    async function joinTug() {
      const code = document.getElementById('tugRoomCode').value.trim();
      const name = document.getElementById('tugPlayerName').value.trim() || 'Игрок';
      if (!code) return alert('Введите код комнаты!');

      try {
        const res = await N.postJson('/api/games/online/join', { code, playerName: name });
        if (res && res.ok) {
          joinRoomLobby(code, false, res.room.questions, res.player);
        } else {
          alert(res?.message || 'Комната не найдена');
        }
      } catch {
        alert('Ошибка подключения');
      }
    }

    function joinRoomLobby(code, isHost, questions, playerInfo) {
      root.innerHTML = '';
      root.append(titleBar('Комната #' + code, playOnlineTug));

      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(window.location.origin + '?room=' + code);

      let currentPos = 0;
      let pollTimer = null;

      const ropeBar = h('div', { class: 'relative w-full h-12 bg-night-800 rounded-full my-6 flex items-center justify-between px-4 overflow-hidden border border-white/10' });
      const ribbon = h('div', { class: 'absolute w-8 h-8 rounded-full bg-brand-500 shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold transition-all duration-500' }, '🚩');
      ropeBar.append(ribbon);

      const updateRope = (pos) => {
        const pct = 50 + (pos * 9);
        ribbon.style.left = 'calc(' + pct + '% - 16px)';
      };

      const playersList = h('div', { class: 'text-xs text-slate-300 font-bold mb-4' }, 'Игроки в комнате: подключение...');
      const qBox = h('div', { class: CARD + ' p-6 text-center text-xl font-bold text-white mb-4 bg-night-800' });
      const optionsBox = h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' });

      let qIndex = 0;

      const showQuestion = () => {
        if (!questions || qIndex >= questions.length) {
          qBox.textContent = 'Вопросы закончились!';
          optionsBox.innerHTML = '';
          return;
        }

        const currQ = questions[qIndex];
        qBox.textContent = currQ.q;
        optionsBox.innerHTML = '';

        const opts = currQ.options && currQ.options.length ? currQ.options : [currQ.a, 'Другой ответ'];

        opts.forEach(opt => {
          optionsBox.append(
            h('button', {
              type: 'button',
              class: BTN2 + ' py-4 text-base font-semibold',
              onclick: async () => {
                try {
                  const res = await N.postJson('/api/games/online/answer', {
                    code,
                    playerId: playerInfo?.id || 'host',
                    answer: opt,
                    questionIndex: qIndex
                  });
                  if (res && res.ok) {
                    if (res.isCorrect) flash(qBox, true);
                    else flash(qBox, false);
                    qIndex++;
                    showQuestion();
                  }
                } catch {}
              }
            }, opt)
          );
        });
      };

      // Poll room state
      pollTimer = setInterval(async () => {
        try {
          const res = await N.postJson('/api/games/online/state', { code });
          if (res && res.ok) {
            currentPos = res.room.ropePos;
            updateRope(currentPos);
            playersList.textContent = 'Игроков в комнате: ' + (res.room.players.length || 1);
            if (currentPos <= -5 || currentPos >= 5) {
              clearInterval(pollTimer);
              const winner = currentPos <= -5 ? 'Красная команда' : 'Синяя команда';
              gameResult(root, 'Онлайн Канат', ['🎉 Победила ' + winner + '!'], bestGame('onlineTug', 10), playOnlineTug);
            }
          }
        } catch {}
      }, 1500);

      stopActive = () => clearInterval(pollTimer);

      const lobbyHeader = h('div', { class: CARD + ' p-4 text-center mb-4 bg-night-800' },
        h('p', { class: 'text-xs text-amber-400 font-bold' }, 'КОД ДЛЯ ПОДКЛЮЧЕНИЯ ПО ТЕЛЕФОНУ:'),
        h('h2', { class: 'text-3xl font-mono font-extrabold text-white tracking-widest my-1' }, code),
        h('img', { src: qrUrl, class: 'w-28 h-28 mx-auto rounded-xl bg-white p-2 my-2' })
      );

      root.append(lobbyHeader, ropeBar, playersList, qBox, optionsBox);
      showQuestion();
    }
  }

  // -------------------------------------------------------------------------
  // GAME 13: ONLINE QUIZ (ОНЛАЙН ВИКТОРИНА) - REAL-TIME
  // -------------------------------------------------------------------------
  function playOnlineQuiz() {
    const root = screen('activity');
    root.append(titleBar('Онлайн Викторина', openGames));

    const box = h('div', { class: CARD + ' p-6 text-center max-w-md mx-auto flex flex-col gap-4 bg-night-800' },
      h('span', { class: 'text-4xl' }, '🏆'),
      h('h3', { class: 'text-xl font-bold text-white' }, 'Онлайн Викторина'),
      h('p', { class: 'text-xs text-slate-300' }, 'Соревнуйтесь по коду комнаты с реальным подсчетом очков на сервере'),
      h('input', { id: 'quizPlayerName', type: 'text', class: INPUT + ' text-center', placeholder: 'Ваше имя', value: (data.profile && data.profile.name) || 'Ученик' }),
      h('input', { id: 'quizRoomCode', type: 'text', class: INPUT + ' text-center font-mono text-xl tracking-widest', placeholder: 'Код викторины' }),
      h('div', { class: 'flex gap-3' },
        h('button', { type: 'button', class: BTN, onclick: joinQuiz }, 'Присоединиться'),
        h('button', { type: 'button', class: BTN2, onclick: createQuiz }, 'Создать викторину')
      )
    );

    async function createQuiz() {
      selectQuestionSetModal('Выберите вопросы для викторины', async (qSet) => {
        try {
          const res = await N.postJson('/api/games/online/create', { type: 'quiz', questions: qSet.items });
          if (res && res.code) {
            startQuizSession(res.code, true, qSet.items);
          } else {
            alert('Ошибка создания викторины');
          }
        } catch {
          alert('Ошибка соединения с сервером');
        }
      });
    }

    async function joinQuiz() {
      const code = document.getElementById('quizRoomCode').value.trim();
      const name = document.getElementById('quizPlayerName').value.trim() || 'Игрок';
      if (!code) return alert('Введите код викторины!');

      try {
        const res = await N.postJson('/api/games/online/join', { code, playerName: name });
        if (res && res.ok) {
          startQuizSession(code, false, res.room.questions, res.player);
        } else {
          alert(res?.message || 'Комната не найдена');
        }
      } catch {
        alert('Ошибка подключения');
      }
    }

    function startQuizSession(code, isHost, questions, playerInfo) {
      root.innerHTML = '';
      root.append(titleBar('Викторина #' + code, playOnlineQuiz));

      let qIndex = 0;
      let score = 0;

      const card = h('div', { class: CARD + ' p-6 text-center max-w-lg mx-auto bg-night-800' });

      const showNext = () => {
        if (!questions || qIndex >= questions.length) {
          gameResult(root, 'Онлайн Викторина', ['Викторина окончена!', 'Ваш счет: ' + score], bestGame('onlineQuiz', score), playOnlineQuiz);
          return;
        }

        card.innerHTML = '';
        const currQ = questions[qIndex];

        card.append(
          h('span', { class: 'text-xs font-bold text-amber-400' }, 'Вопрос ' + (qIndex + 1) + ' из ' + questions.length),
          h('p', { class: 'text-xl font-bold text-white my-4' }, currQ.q)
        );

        const opts = currQ.options && currQ.options.length ? currQ.options : [currQ.a, 'Другой вариант'];
        const grid = h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3 mt-4' });

        opts.forEach(opt => {
          grid.append(
            h('button', {
              type: 'button',
              class: BTN2 + ' py-4 text-base font-bold',
              onclick: async () => {
                try {
                  const res = await N.postJson('/api/games/online/answer', {
                    code,
                    playerId: playerInfo?.id || 'host',
                    answer: opt,
                    questionIndex: qIndex
                  });
                  if (res && res.isCorrect) score += 100;
                } catch {}
                qIndex++;
                showNext();
              }
            }, opt)
          );
        });

        card.append(grid);
      };

      root.append(card);
      showNext();
    }

    root.append(box);
  }

  window.NimiLearn = { load, render, markDay, openSubscribe, openAdmin, openSettings, renderParent, renderLanding };
})();
