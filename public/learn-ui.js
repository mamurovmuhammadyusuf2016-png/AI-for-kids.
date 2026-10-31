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
        reportNeedsSub: 'Бесплатный отчёт уже использован. Отчёт ИИ доступен с бесплатной неделей или подпиской.',
        reportFree: 'Один отчёт ИИ можно получить бесплатно.',
        childPw: 'Пароль ребёнка',
        childPwText: 'Если ребёнок забыл пароль — задайте новый (минимум 8 символов, буквы и цифра).',
        newChildPwPh: 'Новый пароль ребёнка',
        childPwSave: 'Сохранить пароль',
        childPwDone: 'Готово! Ребёнок может войти с новым паролем.',
        childPwBad: 'Пароль слишком простой: минимум 8 символов, буквы и хотя бы одна цифра.',
      },
      landing: {
        badge: 'ИИ-репетитор для 1–11 класса',
        title: 'Репетитор, который учит думать',
        lead: 'Nimi не даёт списать ответ: он задаёт наводящие вопросы, и ребёнок решает сам. На русском и узбекском, по школьной программе.',
        start: 'Попробовать бесплатно',
        login: 'Войти',
        freeNote: 'Каждый раздел можно попробовать бесплатно. Карта не нужна.',
        demoTitle: 'Как Nimi объясняет',
        demoLabel: 'Пример из чата · Математика, 6 класс',
        demo: [
          ['user', 'Сколько будет $\\frac{3}{4} + \\frac{1}{8}$? Просто скажи ответ.'],
          ['ai', 'Давай решим вместе. У этих дробей одинаковые знаменатели?'],
          ['user', 'Нет. Надо привести к 8?'],
          ['ai', 'Верно! Сколько восьмых в $\\frac{3}{4}$?'],
          ['user', '$\\frac{6}{8}$. Значит, $\\frac{6}{8} + \\frac{1}{8} = \\frac{7}{8}$'],
          ['ai', 'Отлично, ты решил сам! Теперь попробуй: $\\frac{2}{3} + \\frac{1}{6}$.'],
        ],
        stepsTitle: 'Как начать',
        steps: [
          ['Зарегистрируйтесь', 'Через почту или Google — за минуту.'],
          ['Попробуйте всё бесплатно', (c) => `Чат — ${c.chat} вопросов, остальные разделы — по одному разу.`],
          ['Выберите тариф', 'Понравится — оформите подписку. Можно попросить бесплатную неделю.'],
        ],
        featuresTitle: 'Что умеет Nimi',
        features: [
          ['message-circle', 'Чат с учителем', 'Разбирает задачу шаг за шагом'],
          ['camera', 'Фото задачи', 'Сфотографируй задачу из учебника'],
          ['mic', 'Голос', 'Спроси голосом и послушай ответ'],
          ['dumbbell', 'Тренировки', 'Каждый день новые задания по уровню'],
          ['clipboard-check', 'Тесты', '10 вопросов по теме и оценка'],
          ['graduation-cap', 'Экзамены и DTM', 'Пробная аттестация и вступительный тест'],
          ['puzzle', 'Олимпиада', 'Задачи на смекалку'],
          ['book-open', 'Чтение', 'Текст и вопросы на понимание'],
          ['layers', 'Карточки слов', 'Английский, русский, узбекский'],
          ['gamepad-2', 'Игры', 'Битва с монстрами и устный счёт'],
          ['notebook-pen', 'Дневник', 'Домашние задания'],
          ['chart-no-axes-column', 'Прогресс', 'Темы, серии и награды'],
        ],
        parentsTitle: 'Для родителей',
        parents: [
          ['users', 'Кабинет родителя', 'Регулярность занятий, темы, домашние задания и отчёт ИИ.'],
          ['shield-check', 'Только учёба', 'Nimi не отвечает на посторонние темы и не спрашивает личные данные.'],
          ['clock', 'Бережёт глаза', 'После 25 минут занятий — перерыв 5 минут.'],
          ['lightbulb', 'Без списывания', 'Не пишет сочинения за ребёнка и не даёт готовый ответ сразу.'],
        ],
        parentLoginText: 'Логин и пароль родителя ребёнок найдёт в Nimi: меню ⋮ → «Настройки».',
        parentLogin: 'Войти как родитель',
        priceTitle: 'Тарифы',
        priceLead: 'Во всех тарифах все разделы. Чем выше тариф, тем глубже Nimi думает над ответом и тем больше вопросов в день.',
        choose: 'Выбрать',
        allSections: 'Все разделы',
        aboutTitle: 'Кто мы',
        about: [
          'Nimi AI делает небольшая команда из Узбекистана. Мы хотим, чтобы ИИ учил детей думать, а не списывать.',
          'Поэтому Nimi сначала задаёт вопросы и подсказывает, а полное решение показывает только после попыток самого ребёнка. Задания составляются по школьной программе Узбекистана, на русском и узбекском.',
          'Есть вопрос или идея — напишите нам, ответим лично.',
        ],
        faqTitle: 'Вопросы и ответы',
        faq: [
          ['Это бесплатно?', (c) => `Регистрация бесплатная. Карточки слов, игры и дневник бесплатны всегда. Каждый платный раздел можно один раз попробовать бесплатно, чат — ${c.chat} вопросов. Дальше — подписка от ${c.from} в месяц. Бесплатную неделю можно попросить у нас в Telegram.`],
          ['Nimi просто даёт готовые ответы?', 'Нет. Сначала Nimi спрашивает, что дано и что ребёнок уже попробовал, и даёт подсказки по шагам. Полное решение — только после трёх попыток ребёнка и с объяснением каждого шага. Сочинения и доклады за ребёнка не пишет: помогает составить план и находит ошибки.'],
          ['Для какого класса и каких предметов?', '1–11 класс. 12 предметов: математика, русский, узбекский и английский языки, литература, окружающий мир, физика, химия, биология, история, география и информатика. Объяснения подстраиваются под класс.'],
          ['Это по школьной программе?', 'Да. Тренировки, тесты и экзамены составляются по школьной программе Узбекистана. Есть пробная итоговая аттестация и вступительный тест в стиле DTM.'],
          ['На каком языке занимается ребёнок?', 'На русском или узбекском. Nimi отвечает на том языке, на котором пишет ребёнок.'],
          ['Это безопасно для ребёнка?', 'Nimi говорит только об учёбе: на посторонние и взрослые темы вежливо отказывает. Не спрашивает имя, адрес, школу и телефон, а если ребёнок напишет их сам — напомнит, что делиться ими не нужно. После 25 минут занятий Nimi просит сделать перерыв на 5 минут.'],
          ['Как родителю следить за учёбой?', 'Вместе с аккаунтом ребёнка создаётся аккаунт родителя. Логин и пароль ребёнок найдёт в меню ⋮ → «Настройки». В кабинете родителя видно, как регулярно ребёнок занимается, какие темы получаются, домашние задания и отчёт ИИ. Переписку в чате родитель не видит.'],
          ['Какие данные вы храните?', 'Почту, пароль (в зашифрованном виде), прогресс, дневник и историю чатов без фотографий. Историю чатов видит только сам ученик. Чтобы получить ответ, текст вопроса отправляется ИИ-сервису. Подробно — на странице «Правила и конфиденциальность».'],
          ['Чем отличаются тарифы?', (c) => `Во всех тарифах все разделы. Отличаются глубина ответов и вопросы в день: ${c.levels}.`],
          ['Как оплатить?', 'Выберите тариф в Nimi (меню ⋮ → «Подписка») и создайте заявку. Потом напишите нам в Telegram или позвоните — подскажем, как оплатить, и включим подписку после проверки оплаты.'],
          ['Работает на телефоне?', 'Да. Nimi открывается в браузере на телефоне, планшете и компьютере, его можно добавить на главный экран как приложение. Нужен интернет.'],
          ['Ребёнок забыл пароль. Что делать?', 'Родитель может поставить новый пароль в своём кабинете. Или напишите нам — сбросим пароль и пришлём новый.'],
        ],
        contactTitle: 'Остались вопросы?',
        contactText: 'Напишите или позвоните — поможем выбрать тариф и подключим бесплатную неделю.',
        telegram: 'Написать в Telegram',
        call: 'Позвонить',
        footer: 'Nimi AI · ИИ-репетитор для школьников',
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
      history: {
        title: 'История чатов',
        note: 'Чаты сохраняются в твоём аккаунте: их видно на любом устройстве. Родитель их не видит.',
        empty: 'Здесь появятся твои разговоры с Nimi.',
        count: (n) => `${n} ${plural(n, 'сообщение', 'сообщения', 'сообщений')}`,
        cont: 'Продолжить этот чат',
        del: 'Удалить чат',
        delSure: 'Точно удалить? Это нельзя отменить.',
        photo: 'Фото задачи',
      },
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
        none: 'Попробуй всё бесплатно',
        noneText: (n) => `Чат — ${n} вопросов, остальные разделы — по одному разу. Понравится — оформи подписку или попроси бесплатную неделю.`,
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
        level: { pro: 'Умная', gold: 'Очень умная', max: 'Сверхумная' },
        levelText: { pro: 'Понятно объясняет школьные темы', gold: 'Глубже разбирает трудные задачи', max: 'Самый глубокий разбор: олимпиады и DTM' },
        popular: 'Рекомендуем',
        perDayPrice: (p) => `≈ ${p} в день`,
        limitsTitle: 'Лимиты на месяц (токены)',
        freeTitle: 'Бесплатные попытки',
        freeLead: 'Без подписки каждый раздел можно попробовать бесплатно.',
        freeLeftN: (n) => `осталось ${n}`,
        freeUsedWord: 'использовано',
        features: { chat: 'Чат с учителем', photo: 'Фото задачи', training: 'Тренировка', test: 'Тест по теме', exam: 'Экзамен', olympiad: 'Олимпиада', reading: 'Чтение', report: 'Отчёт для родителей' },
        freeUsed: (name) => `Бесплатная попытка «${name}» уже использована. Чтобы продолжить, выбери тариф или попроси бесплатную неделю.`,
        tileFree: 'Бесплатно',
        allUsed: 'Бесплатные попытки закончились',
        allUsedText: 'Карточки, игры и дневник остаются открытыми. Чтобы продолжить, оформи подписку или попроси бесплатную неделю.',
        perMonthShort: 'сум/мес',
        inLabel: 'Вход',
        outLabel: 'Выход',
        allPlans: 'Во всех тарифах',
        tokensHint: 'Токены — это кусочки текста: вход — твои вопросы и фото, выход — ответы Nimi. Обычно лимита хватает на весь месяц.',
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
        tabs: { dash: 'Показатели', manage: 'Ученики и заявки' },
        one: 'Снять подписку',
        oneConfirm: (email) => `Снять подписку у ${email}? Доступ закончится сразу.`,
        oneYes: 'Да, снять',
        revoke: 'Снять подписки у всех, кроме…',
        revokeHint: 'Подписка закончится сразу у всех учеников с активным доступом, кроме почт ниже. Почты — по одной в строке или через запятую.',
        keepPh: 'Почты, которым подписку оставить',
        preview: 'Показать, у кого снимется',
        willRevoke: (n) => `Подписка снимется у ${n}:`,
        keeping: (list) => `Останется у: ${list}`,
        keepNone: 'Исключений нет: подписка снимется у всех.',
        nobody: 'Снимать не у кого: кроме оставленных, активных подписок нет.',
        confirm: (n) => `Да, снять у ${n}`,
        revoked: (n) => `Готово: подписка снята у ${n}.`,
        dash: {
          updated: (time) => `Обновлено в ${time}`,
          refresh: 'Обновить',
          today: 'Сегодня',
          newToday: 'Новых учеников',
          activeToday: 'Занимались',
          chatToday: 'Вопросов в чат',
          learnToday: 'Наборов заданий',
          pending: 'Заявок ждут',
          students: 'Ученики',
          total: 'Всего',
          d7: 'За 7 дней',
          d30: 'За 30 дней',
          google: 'Через Google',
          parents: 'Родителей',
          admins: 'Админов',
          subs: 'Подписки',
          active: 'Активных',
          trial: 'Бесплатная неделя',
          expiring: 'Закончатся за 7 дней',
          expired: 'Закончились',
          never: 'Ни разу не было',
          triedFree: 'Пробовали бесплатно',
          money: 'Деньги',
          monthly: 'Платные подписки сейчас, в месяц',
          paid30: 'Оплачено за 30 дней',
          paidAll: 'Оплачено за всё время',
          paidNote: (n) => `Оплаты считаются по закрытым заявкам (${n}). Подписки, включённые без заявки, сюда не входят.`,
          activity: 'Активность учеников',
          activeUsers: 'Занимались',
          chat: 'Вопросов в чат',
          learn: 'Наборов заданий',
          charts: 'По дням, последние 30 дней',
          chartReg: 'Новые ученики',
          chartUsers: 'Занимались',
          chartChat: 'Вопросы в чат',
          sumAll: (n) => `Всего за 30 дней: ${n}`,
          avg: (n) => `В среднем ${n} в день`,
          peak: (n) => `макс. ${n} в день`,
          sections: 'Пользуются разделами',
          progress: 'Прогресс',
          diary: 'Дневник',
          cards: 'Карточки',
          quest: 'Битва с монстрами',
          tokens: (m) => `Токены ИИ за ${m}`,
          input: 'ИИ прочитал (входящие)',
          output: 'ИИ написал (исходящие)',
          tokenUsers: 'Учеников с расходом',
          top: 'Больше всех тратят в этом месяце',
          share: (n) => `${n}% лимита`,
          noTier: 'без доступа',
          noTop: 'В этом месяце ещё никто не тратил токены.',
        },
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
        reportNeedsSub: "Bepul hisobot ishlatib bo'lingan. AI hisoboti bepul hafta yoki obuna bilan ochiladi.",
        reportFree: 'Bitta AI hisobotini bepul olish mumkin.',
        childPw: 'Farzand paroli',
        childPwText: "Agar farzandingiz parolni unutgan bo'lsa — yangisini qo'ying (kamida 8 ta belgi, harflar va raqam).",
        newChildPwPh: 'Farzandning yangi paroli',
        childPwSave: 'Parolni saqlash',
        childPwDone: 'Tayyor! Farzandingiz yangi parol bilan kira oladi.',
        childPwBad: 'Parol juda oddiy: kamida 8 ta belgi, harflar va kamida bitta raqam.',
      },
      landing: {
        badge: '1–11-sinflar uchun AI-repetitor',
        title: "O'ylashni o'rgatadigan repetitor",
        lead: "Nimi javobni ko'chirishga yo'l qo'ymaydi: u yo'naltiruvchi savollar beradi, bola esa masalani o'zi yechadi. Rus va o'zbek tillarida, maktab dasturi bo'yicha.",
        start: "Bepul sinab ko'rish",
        login: 'Kirish',
        freeNote: "Har bir bo'limni bepul sinab ko'rish mumkin. Karta kerak emas.",
        demoTitle: 'Nimi qanday tushuntiradi',
        demoLabel: 'Chatdan namuna · Matematika, 6-sinf',
        demo: [
          ['user', "$\\frac{3}{4} + \\frac{1}{8}$ nechaga teng? Shunchaki javobini ayt."],
          ['ai', 'Keling, birga yechamiz. Bu kasrlarning maxrajlari bir xilmi?'],
          ['user', "Yo'q. 8 ga keltirish kerakmi?"],
          ['ai', "To'g'ri! $\\frac{3}{4}$ da nechta sakkizdan bir bor?"],
          ['user', '$\\frac{6}{8}$. Demak, $\\frac{6}{8} + \\frac{1}{8} = \\frac{7}{8}$'],
          ['ai', "Barakalla, o'zing yechding! Endi buni sinab ko'r: $\\frac{2}{3} + \\frac{1}{6}$."],
        ],
        stepsTitle: 'Qanday boshlash kerak',
        steps: [
          ["Ro'yxatdan o'ting", 'Pochta yoki Google orqali — bir daqiqada.'],
          ["Hammasini bepul sinab ko'ring", (c) => `Chat — ${c.chat} ta savol, qolgan bo'limlar — bir martadan.`],
          ['Tarifni tanlang', "Yoqsa — obuna rasmiylashtiring. Bepul haftani ham so'rashingiz mumkin."],
        ],
        featuresTitle: 'Nimi nimalarni qila oladi',
        features: [
          ['message-circle', "O'qituvchi bilan chat", 'Masalani qadamma-qadam tahlil qiladi'],
          ['camera', 'Masala surati', 'Darslikdagi masalani suratga ol'],
          ['mic', 'Ovoz', "Ovoz bilan so'ra va javobni tingla"],
          ['dumbbell', 'Mashqlar', 'Har kuni darajaga mos yangi topshiriqlar'],
          ['clipboard-check', 'Testlar', "Mavzu bo'yicha 10 ta savol va baho"],
          ['graduation-cap', 'Imtihonlar va DTM', 'Sinov attestatsiyasi va kirish testi'],
          ['puzzle', 'Olimpiada', 'Zukkolik masalalari'],
          ['book-open', "O'qish", 'Matn va tushunish uchun savollar'],
          ['layers', "So'z kartochkalari", "Ingliz, rus, o'zbek tillari"],
          ['gamepad-2', "O'yinlar", "Maxluqlar jangi va og'zaki hisob"],
          ['notebook-pen', 'Kundalik', 'Uy vazifalari'],
          ['chart-no-axes-column', 'Natijalar', 'Mavzular, seriyalar va mukofotlar'],
        ],
        parentsTitle: 'Ota-onalar uchun',
        parents: [
          ['users', 'Ota-ona kabineti', "Mashg'ulotlar muntazamligi, mavzular, uy vazifalari va AI hisoboti."],
          ['shield-check', "Faqat o'qish", "Nimi begona mavzularga javob bermaydi va shaxsiy ma'lumotlarni so'ramaydi."],
          ['clock', "Ko'zni asraydi", "25 daqiqa mashg'ulotdan keyin — 5 daqiqa tanaffus."],
          ['lightbulb', "Ko'chirishsiz", 'Bola uchun insho yozmaydi va darhol tayyor javob bermaydi.'],
        ],
        parentLoginText: "Ota-ona login va parolini farzandingiz Nimi'da topadi: ⋮ menyu → «Sozlamalar».",
        parentLogin: 'Ota-ona sifatida kirish',
        priceTitle: 'Tariflar',
        priceLead: "Barcha tariflarda hamma bo'limlar bor. Tarif qanchalik yuqori bo'lsa, Nimi javob ustida shunchalik chuqur o'ylaydi va kuniga ko'proq savol berish mumkin.",
        choose: 'Tanlash',
        allSections: "Barcha bo'limlar",
        aboutTitle: 'Biz kimmiz',
        about: [
          "Nimi AI'ni O'zbekistondagi kichik jamoa yaratmoqda. Biz AI bolalarga ko'chirishni emas, o'ylashni o'rgatishini istaymiz.",
          "Shuning uchun Nimi avval savollar beradi va maslahat beradi, to'liq yechimni esa faqat bolaning o'z urinishlaridan keyin ko'rsatadi. Topshiriqlar O'zbekiston maktab dasturi bo'yicha, rus va o'zbek tillarida tuziladi.",
          "Savolingiz yoki taklifingiz bo'lsa — yozing, shaxsan javob beramiz.",
        ],
        faqTitle: 'Savol va javoblar',
        faq: [
          ['Bu bepulmi?', (c) => `Ro'yxatdan o'tish bepul. So'z kartochkalari, o'yinlar va kundalik doim bepul. Har bir pullik bo'limni bir marta bepul sinab ko'rish mumkin, chat — ${c.chat} ta savol. Keyin — oyiga ${c.from}dan obuna. Bepul haftani Telegramda bizdan so'rashingiz mumkin.`],
          ['Nimi shunchaki tayyor javob beradimi?', "Yo'q. Avval Nimi nima berilganini va bola nimani sinab ko'rganini so'raydi, qadamma-qadam maslahat beradi. To'liq yechim — faqat bolaning uchta urinishidan keyin va har bir qadam tushuntirilgan holda. Bola uchun insho va ma'ruza yozmaydi: reja tuzishga yordam beradi va xatolarni topadi."],
          ['Qaysi sinf va qaysi fanlar uchun?', "1–11-sinflar. 12 ta fan: matematika, rus, o'zbek va ingliz tillari, adabiyot, tabiatshunoslik, fizika, kimyo, biologiya, tarix, geografiya va informatika. Tushuntirishlar sinfga moslashadi."],
          ["Bu maktab dasturi bo'yichami?", "Ha. Mashqlar, testlar va imtihonlar O'zbekiston maktab dasturi bo'yicha tuziladi. Sinov yakuniy attestatsiyasi va DTM uslubidagi kirish testi bor."],
          ["Bola qaysi tilda shug'ullanadi?", "Rus yoki o'zbek tilida. Nimi bola qaysi tilda yozsa, o'sha tilda javob beradi."],
          ['Bu bola uchun xavfsizmi?', "Nimi faqat o'qish haqida gapiradi: begona va kattalar mavzularini muloyimlik bilan rad etadi. Ism, manzil, maktab va telefonni so'ramaydi, agar bola o'zi yozsa — ularni ulashish kerak emasligini eslatadi. 25 daqiqa mashg'ulotdan keyin Nimi 5 daqiqa tanaffus qilishni so'raydi."],
          ["Ota-ona o'qishni qanday kuzatadi?", "Farzand akkaunti bilan birga ota-ona akkaunti yaratiladi. Login va parolni farzandingiz ⋮ menyu → «Sozlamalar»da topadi. Ota-ona kabinetida bola qanchalik muntazam shug'ullanayotgani, qaysi mavzular yaxshi chiqayotgani, uy vazifalari va AI hisoboti ko'rinadi. Chatdagi yozishmalarni ota-ona ko'rmaydi."],
          ["Qanday ma'lumotlarni saqlaysiz?", "Pochta, parol (shifrlangan holda), natijalar, kundalik va suratlarsiz chat tarixi. Chat tarixini faqat o'quvchining o'zi ko'radi. Javob olish uchun savol matni AI-xizmatga yuboriladi. Batafsil — «Qoidalar va maxfiylik» sahifasida."],
          ['Tariflar nimasi bilan farq qiladi?', (c) => `Barcha tariflarda hamma bo'limlar bor. Javoblar chuqurligi va kunlik savollar farq qiladi: ${c.levels}.`],
          ["Qanday to'lash mumkin?", "Nimi'da tarifni tanlang (⋮ menyu → «Obuna») va ariza yarating. Keyin bizga Telegramda yozing yoki qo'ng'iroq qiling — qanday to'lashni aytamiz va to'lov tekshirilgach obunani yoqamiz."],
          ['Telefonda ishlaydimi?', "Ha. Nimi telefon, planshet va kompyuterdagi brauzerda ochiladi, uni ilova kabi bosh ekranga qo'shish mumkin. Internet kerak."],
          ['Bola parolni unutdi. Nima qilish kerak?', "Ota-ona o'z kabinetida yangi parol qo'yishi mumkin. Yoki bizga yozing — parolni tiklab, yangisini yuboramiz."],
        ],
        contactTitle: 'Savollaringiz qoldimi?',
        contactText: "Yozing yoki qo'ng'iroq qiling — tarif tanlashga yordam beramiz va bepul haftani yoqib beramiz.",
        telegram: 'Telegramda yozish',
        call: "Qo'ng'iroq qilish",
        footer: "Nimi AI · maktab o'quvchilari uchun AI-repetitor",
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
      history: {
        title: 'Chatlar tarixi',
        note: "Chatlar akkauntingda saqlanadi: ularni istalgan qurilmada ko'rish mumkin. Ota-ona ularni ko'rmaydi.",
        empty: "Bu yerda Nimi bilan suhbatlaring paydo bo'ladi.",
        count: (n) => `${n} ta xabar`,
        cont: 'Shu chatni davom ettirish',
        del: "Chatni o'chirish",
        delSure: "Rostdan o'chirilsinmi? Buni qaytarib bo'lmaydi.",
        photo: 'Masala surati',
      },
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
        none: "Hammasini bepul sinab ko'r",
        noneText: (n) => `Chat — ${n} ta savol, qolgan bo'limlar — bir martadan. Yoqsa — obuna rasmiylashtir yoki bepul haftani so'ra.`,
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
        level: { pro: 'Aqlli', gold: 'Juda aqlli', max: "O'ta aqlli" },
        levelText: { pro: 'Maktab mavzularini tushunarli tushuntiradi', gold: 'Qiyin masalalarni chuqurroq tahlil qiladi', max: 'Eng chuqur tahlil: olimpiada va DTM' },
        popular: 'Tavsiya qilamiz',
        perDayPrice: (p) => `kuniga ≈ ${p}`,
        limitsTitle: 'Oylik limitlar (tokenlar)',
        freeTitle: 'Bepul urinishlar',
        freeLead: "Obunasiz har bir bo'limni bepul sinab ko'rish mumkin.",
        freeLeftN: (n) => `${n} ta qoldi`,
        freeUsedWord: 'ishlatildi',
        features: { chat: "O'qituvchi bilan chat", photo: 'Masala surati', training: 'Mashq', test: "Mavzu bo'yicha test", exam: 'Imtihon', olympiad: 'Olimpiada', reading: "O'qish", report: 'Ota-onalar uchun hisobot' },
        freeUsed: (name) => `«${name}» bepul urinishi ishlatib bo'lingan. Davom etish uchun tarifni tanla yoki bepul haftani so'ra.`,
        tileFree: 'Bepul',
        allUsed: 'Bepul urinishlar tugadi',
        allUsedText: "Kartochkalar, o'yinlar va kundalik ochiq qoladi. Davom etish uchun obuna rasmiylashtir yoki bepul haftani so'ra.",
        perMonthShort: "so'm/oy",
        inLabel: 'Kirish',
        outLabel: 'Chiqish',
        allPlans: 'Barcha tariflarda',
        tokensHint: "Tokenlar — matn bo'laklari: kirish — sening savollaring va suratlaring, chiqish — Nimi javoblari. Odatda limit butun oyga yetadi.",
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
        tabs: { dash: "Ko'rsatkichlar", manage: "O'quvchilar va arizalar" },
        one: 'Obunani bekor qilish',
        oneConfirm: (email) => `${email} obunasi bekor qilinsinmi? Ruxsat darhol tugaydi.`,
        oneYes: 'Ha, bekor qilish',
        revoke: 'Obunani hammadan olish, bulardan tashqari…',
        revokeHint: "Faol obunasi bor barcha o'quvchilarda obuna darhol tugaydi, pastdagi pochtalardan tashqari. Pochtalar — har biri yangi qatorda yoki vergul bilan.",
        keepPh: 'Obunasi qoladigan pochtalar',
        preview: "Kimdan olinishini ko'rsatish",
        willRevoke: (n) => `Obuna ${n} ta o'quvchidan olinadi:`,
        keeping: (list) => `Qoladi: ${list}`,
        keepNone: 'Istisno yo\'q: obuna hammadan olinadi.',
        nobody: "Oladigan hech kim yo'q: qoldirilganlardan boshqa faol obuna yo'q.",
        confirm: (n) => `Ha, ${n} tadan olish`,
        revoked: (n) => `Tayyor: obuna ${n} ta o'quvchidan olindi.`,
        dash: {
          updated: (time) => `${time} da yangilandi`,
          refresh: 'Yangilash',
          today: 'Bugun',
          newToday: "Yangi o'quvchilar",
          activeToday: "Shug'ullandi",
          chatToday: 'Chatga savollar',
          learnToday: "Topshiriqlar to'plami",
          pending: 'Kutayotgan arizalar',
          students: "O'quvchilar",
          total: 'Jami',
          d7: '7 kunda',
          d30: '30 kunda',
          google: 'Google orqali',
          parents: 'Ota-onalar',
          admins: 'Adminlar',
          subs: 'Obunalar',
          active: 'Faol',
          trial: 'Bepul hafta',
          expiring: '7 kunda tugaydi',
          expired: 'Tugagan',
          never: "Hech qachon bo'lmagan",
          triedFree: "Bepul sinab ko'rganlar",
          money: 'Pul',
          monthly: "Hozirgi pullik obunalar, oyiga",
          paid30: "30 kunda to'langan",
          paidAll: "Hammasi bo'lib to'langan",
          paidNote: (n) => `To'lovlar yopilgan arizalar bo'yicha hisoblanadi (${n}). Arizasiz yoqilgan obunalar bu yerga kirmaydi.`,
          activity: "O'quvchilar faolligi",
          activeUsers: "Shug'ullandi",
          chat: 'Chatga savollar',
          learn: "Topshiriqlar to'plami",
          charts: "Kunlar bo'yicha, oxirgi 30 kun",
          chartReg: "Yangi o'quvchilar",
          chartUsers: "Shug'ullandi",
          chartChat: 'Chatga savollar',
          sumAll: (n) => `30 kunda jami: ${n}`,
          avg: (n) => `Kuniga o'rtacha ${n}`,
          peak: (n) => `kuniga eng ko'pi ${n}`,
          sections: "Bo'limlardan foydalanadi",
          progress: 'Natijalar',
          diary: 'Kundalik',
          cards: 'Kartochkalar',
          quest: 'Monstrlar jangi',
          tokens: (m) => `${m} uchun AI tokenlari`,
          input: "AI o'qidi (kiruvchi)",
          output: 'AI yozdi (chiquvchi)',
          tokenUsers: "Sarflagan o'quvchilar",
          top: "Bu oy eng ko'p sarflaganlar",
          share: (n) => `limitning ${n}%`,
          noTier: 'ruxsatsiz',
          noTop: "Bu oy hali hech kim token sarflamagan.",
        },
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
    if (res.code === 'premium_required') { await N.refreshUser(); openSubscribe(res.feature); throw new Error('premium_required'); }
    if (res.code) throw new Error(res.code);
    if (res.freeLeft !== undefined) N.setFreeLeft(kind, res.freeLeft);
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
  // A section could not start: show the error, unless the subscription page took its place.
  function failed(root, e, retry) {
    if (e.message !== 'premium_required') root.lastChild.replaceWith(errorBox(e.message, retry));
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
      failed(root, e, () => startTraining(topic));
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
      failed(root, e, () => startTest(topic));
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
      failed(root, e, () => startExam(examType, name));
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
      failed(root, e, startOlympiad);
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
      failed(root, e, startReading);
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
      failed(root, e, () => newDeck(topic));
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
  // Plans are named by how deeply the AI thinks: Умная / Очень умная / Сверхумная.
  const RECOMMENDED = 'gold';
  const perDay = (price) => sum(Math.round(price / 30 / 100) * 100);
  function planPicker(selected, onSelect) {
    const S = t('sub');
    const row = h('div', { class: 'grid grid-cols-3 gap-2' });
    const note = h('p', { class: 'flex items-start gap-2 px-1 text-sm text-slate-300' });
    const draw = () => {
      row.replaceChildren(...plans().map((p) => {
        const on = p.id === selected;
        return h('button', {
          type: 'button',
          'aria-pressed': String(on),
          class: `relative flex flex-col items-start gap-0.5 rounded-2xl p-3 pt-4 text-left transition active:scale-95 ${on ? 'bg-brand-500/15 ring-2 ring-brand-400' : 'bg-night-800 ring-1 ring-white/5 hover:bg-night-700'}`,
          onclick: () => { selected = p.id; draw(); onSelect(p); },
        },
        p.id === RECOMMENDED ? h('span', { class: 'absolute -top-2 left-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-onfill' }, S.popular) : null,
        h('span', { class: `flex items-center gap-1 text-sm font-semibold ${on ? 'text-brand-400' : 'text-white'}` }, S.level[p.id] || p.name),
        h('span', { class: 'text-[11px] text-slate-500' }, p.name),
        h('span', { class: 'mt-1 text-xl font-semibold tabular-nums text-white' }, money(p.price)),
        h('span', { class: 'text-xs text-slate-400' }, S.perMonthShort),
        h('span', { class: 'mt-1 text-xs text-slate-400' }, S.perDayPrice(perDay(p.price))),
        h('span', { class: 'mt-1 text-xs text-slate-300' }, S.perDay(p.questions)));
      }));
      note.replaceChildren(ico('brain', 'icon mt-0.5 text-brand-400'), h('span', {}, S.levelText[selected] || ''));
    };
    draw();
    return h('div', { class: 'flex flex-col gap-3 pt-2' }, row, note);
  }

  // Monthly token limits of every plan, folded (most parents never need them).
  function limitsDetails() {
    const S = t('sub');
    return h('details', { class: 'group rounded-2xl bg-night-900/60 px-4 py-3 ring-1 ring-white/5' },
      h('summary', { class: 'flex cursor-pointer list-none items-center justify-between gap-2 text-sm text-slate-300' }, S.limitsTitle, ico('chevron-down', 'icon text-slate-500 transition group-open:rotate-180')),
      h('div', { class: 'mt-3 flex flex-col gap-1.5 text-sm text-slate-400' },
        plans().map((p) => h('p', { class: 'flex justify-between gap-3' }, h('span', {}, `${S.level[p.id] || p.name} (${p.name})`), h('span', { class: 'tabular-nums' }, `${S.inLabel} ${tok(p.input)} · ${S.outLabel} ${tok(p.output)}`))),
        h('p', { class: 'mt-1 text-xs text-slate-500' }, S.tokensHint)));
  }

  // What is still free without a subscription: { chat: 5, test: 0, ... } from the server.
  function freeCard() {
    const S = t('sub');
    const free = N.user?.free || {};
    const keys = Object.keys(S.features).filter((k) => free[k] !== undefined);
    if (!keys.length) return null;
    return h('div', { class: `${CARD} flex flex-col gap-2` },
      h('p', { class: 'flex items-center gap-2 font-semibold text-white' }, ico('gift', 'icon text-brand-400'), S.freeTitle),
      h('p', { class: 'text-sm text-slate-400' }, S.freeLead),
      h('div', { class: 'grid grid-cols-1 gap-1.5 sm:grid-cols-2' }, keys.map((k) => h('div', { class: 'flex items-center justify-between gap-2 rounded-xl bg-night-800 px-3 py-2 text-sm' },
        h('span', { class: free[k] ? 'text-slate-100' : 'text-slate-500 line-through' }, S.features[k]),
        h('span', { class: `shrink-0 text-xs ${free[k] ? 'text-emerald-300' : 'text-slate-500'}` }, free[k] ? S.freeLeftN(free[k]) : S.freeUsedWord)))));
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

  // feature: the section the student tried to open (its free try is used up), if any.
  function openSubscribe(feature) {
    if (typeof feature !== 'string') feature = null;
    const root = screen('activity');
    const S = t('sub');
    const st = planStatus();
    const plan = N.user?.plan;
    root.append(titleBar(S.title));
    if (feature && S.features[feature] && !N.hasAccess()) {
      root.append(h('p', { class: 'flex items-start gap-2 rounded-2xl bg-amber-400/10 p-4 text-amber-100 ring-1 ring-amber-400/30' }, ico('lock', 'icon mt-0.5'), S.freeUsed(S.features[feature])));
    }
    if (N.accounts && !N.hasAccess()) { const fc = freeCard(); if (fc) root.append(fc); }
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
    let chosen = planById(paid ? plan.tier : RECOMMENDED);
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
      h('div', { class: `${CARD} flex flex-col gap-2` },
        h('p', { class: 'font-semibold text-white' }, S.allPlans),
        h('ul', { class: 'flex flex-col gap-2 text-slate-200' }, S.includes.map((x) => h('li', { class: 'flex items-start gap-2' }, ico('circle-check', 'icon mt-0.5 text-brand-400'), x))),
        h('p', { class: 'text-sm text-slate-400' }, S.freeLeft)),
      limitsDetails());
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
  let adminTab = 'dash';
  // rootId: 'activity' (from a student admin's menu) or 'adminHome' (the staff account's only screen).
  // tab: 'dash' (numbers) or 'manage' (grant access, students, requests).
  async function openAdmin(rootId = adminRoot, tab = adminTab) {
    adminRoot = rootId;
    adminTab = tab;
    const root = screen(rootId);
    const A = t('admin');
    root.append(rootId === 'activity' ? titleBar(A.title) : h('h2', { class: 'text-2xl font-semibold text-white' }, A.title));
    root.append(h('div', { class: 'grid grid-cols-2 gap-1 rounded-2xl bg-night-800 p-1 ring-1 ring-white/5', role: 'tablist' },
      ['dash', 'manage'].map((id) => h('button', {
        type: 'button', role: 'tab', 'aria-selected': String(adminTab === id),
        class: `min-h-11 rounded-xl px-3 text-sm font-semibold ${adminTab === id ? 'bg-brand-500 text-onfill' : 'text-slate-300 hover:bg-night-700'}`,
        onclick: () => openAdmin(adminRoot, id),
      }, A.tabs[id]))));
    if (adminTab === 'dash') return renderDashboard(root, A);
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
    root.append(revokeBlock(A));
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

  // Admin: take access away from every student except the listed emails. First it shows who
  // would lose access; only that exact list is changed after the admin confirms.
  function revokeBlock(A) {
    const keep = h('textarea', { class: `${INPUT} min-h-24 py-3`, rows: 3, placeholder: A.keepPh, id: 'adminKeep' });
    const out = h('div', { class: 'flex flex-col gap-2' });
    const parse = () => [...new Set(keep.value.split(/[\s,;]+/).map((v) => v.trim().toLowerCase()).filter(Boolean))];
    const preview = async () => {
      const kept = parse();
      out.replaceChildren(loading(t('loadingTopics')));
      const r = await N.postJson('/api/admin/revoke-except', { keep: kept }).catch(() => ({}));
      if (!r.users) { out.replaceChildren(h('p', { class: 'text-sm text-rose-200' }, t('errors').default)); return; }
      if (!r.users.length) { out.replaceChildren(h('p', { class: 'text-sm text-slate-400' }, A.nobody)); return; }
      const emails = r.users.map((u) => u.email);
      const yes = h('button', { type: 'button', class: 'min-h-12 rounded-2xl bg-rose-500 px-3 text-sm font-semibold text-onfill disabled:opacity-50' }, A.confirm(emails.length));
      yes.onclick = async () => {
        yes.disabled = true;
        const res = await N.postJson('/api/admin/revoke-except', { keep: kept, apply: emails }).catch(() => ({}));
        out.replaceChildren(res.revoked
          ? h('p', { class: 'rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-100' }, A.revoked(res.revoked.length))
          : h('p', { class: 'text-sm text-rose-200' }, t('errors').default));
      };
      out.replaceChildren(
        h('p', { class: 'text-sm font-semibold text-rose-200' }, A.willRevoke(emails.length)),
        h('ul', { class: 'flex max-h-64 flex-col gap-1 overflow-y-auto rounded-xl bg-night-800 p-3 text-sm text-slate-200' },
          r.users.map((u) => h('li', { class: 'flex items-baseline justify-between gap-2' },
            h('span', { class: 'min-w-0 truncate' }, u.email),
            h('span', { class: 'shrink-0 text-xs text-slate-400' }, `${u.plan_kind === 'trial' ? A.week : planById(u.plan_tier).name} ${A.until(dateStr(u.premium_until))}`)))),
        h('p', { class: `text-xs ${kept.length ? 'text-slate-400' : 'text-amber-200'}` }, kept.length ? A.keeping(kept.join(', ')) : A.keepNone),
        h('div', { class: 'grid grid-cols-2 gap-2' }, yes,
          h('button', { type: 'button', class: 'min-h-12 rounded-2xl bg-night-700 px-3 text-sm text-white', onclick: () => out.replaceChildren() }, A.cancel)));
    };
    return h('div', { class: `${CARD} flex flex-col gap-2` },
      h('p', { class: 'font-semibold text-white' }, A.revoke),
      h('p', { class: 'text-sm text-slate-400' }, A.revokeHint),
      keep, h('button', { type: 'button', class: BTN2, onclick: preview }, A.preview), out);
  }

  // ---------- admin dashboard ----------
  const shortDay = (day) => `${day.slice(8, 10)}.${day.slice(5, 7)}`;
  const tile = (label, value, note) => h('div', { class: 'flex min-w-0 flex-col gap-1 rounded-2xl bg-night-800 p-3 ring-1 ring-white/5' },
    h('p', { class: 'text-xs leading-tight text-slate-400' }, label),
    h('p', { class: 'truncate text-2xl font-semibold tabular-nums text-white' }, value),
    note ? h('p', { class: 'text-xs text-slate-500' }, note) : null);
  const tiles = (...kids) => h('div', { class: 'grid grid-cols-2 gap-2 sm:grid-cols-3' }, ...kids);
  const section = (title, ...kids) => h('div', { class: `${CARD} flex flex-col gap-3` }, h('p', { class: 'font-semibold text-white' }, title), ...kids);

  // One series per chart, bars from a shared baseline; hover or tap a day to read its value.
  // avg: the caption shows the daily average instead of the 30-day total (for counts of people).
  function dayBars(title, points, key, D, avg = false) {
    const values = points.map((p) => p[key]);
    const max = Math.max(0, ...values);
    const total = values.reduce((a, b) => a + b, 0);
    const caption = () => (avg ? D.avg(money(Math.round(total / points.length))) : D.sumAll(money(total)));
    const readout = h('p', { class: 'min-h-4 text-xs tabular-nums text-slate-400', 'aria-live': 'polite' }, caption());
    const show = (p) => { readout.textContent = `${shortDay(p.day)}: ${money(p[key])}`; };
    const bars = h('div', { class: 'flex h-28 items-end gap-[2px] border-b border-white/15' },
      points.map((p) => h('button', {
        type: 'button', class: 'group flex h-full min-w-0 flex-1 items-end', title: `${shortDay(p.day)}: ${p[key]}`,
        'aria-label': `${shortDay(p.day)}: ${p[key]}`, onmouseenter: () => show(p), onfocus: () => show(p), onclick: () => show(p),
      }, h('span', { class: 'block w-full rounded-t-[4px] bg-brand-500 group-hover:bg-brand-400', style: `height:${p[key] ? Math.max((p[key] / (max || 1)) * 100, 3) : 0}%` }))));
    bars.addEventListener('mouseleave', () => { readout.textContent = caption(); });
    return h('div', { class: 'flex flex-col gap-1' },
      h('div', { class: 'flex items-baseline justify-between gap-2' },
        h('p', { class: 'text-sm font-medium text-slate-200' }, title),
        h('p', { class: 'text-xs text-slate-500' }, D.peak(money(max)))),
      readout, bars,
      h('div', { class: 'flex justify-between text-[11px] text-slate-500' },
        h('span', {}, shortDay(points[0].day)), h('span', {}, shortDay(points[points.length - 1].day))));
  }

  async function renderDashboard(root, A) {
    const D = A.dash;
    const body = h('div', { class: 'flex flex-col gap-4' }, loading(t('loadingTopics')));
    root.append(body);
    const s = await N.postJson('/api/admin/stats', {}).catch(() => ({}));
    if (!s.users) {
      body.replaceChildren(h('div', { class: `${CARD} flex flex-col gap-3` },
        h('p', { class: 'text-rose-200' }, t('errors').default),
        h('button', { type: 'button', class: BTN2, onclick: () => openAdmin() }, ico('repeat'), t('retry'))));
      return;
    }
    const n = (v) => money(v || 0);
    const { users: U, subscriptions: S, money: M, activity: Ac, tokens: T, features: F } = s;
    const tierName = (id) => (id === 'trial' ? A.week : id ? planById(id).name : D.noTier);
    const time = new Date().toLocaleTimeString(N.lang === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });

    const topList = T.top.length
      ? h('div', { class: 'flex flex-col gap-2' }, T.top.map((r) => h('div', { class: 'flex flex-col gap-1.5 rounded-2xl bg-night-800 p-3 ring-1 ring-white/5' },
          h('div', { class: 'flex items-baseline justify-between gap-2' },
            h('p', { class: 'min-w-0 truncate text-sm font-semibold text-white' }, r.email),
            h('p', { class: 'shrink-0 text-xs text-slate-400' }, tierName(r.tier))),
          h('p', { class: 'text-xs tabular-nums text-slate-400' }, `${tok(r.input)} / ${tok(r.output)} · ${D.share(r.share)}`),
          h('div', { class: 'h-1.5 overflow-hidden rounded-full bg-night-700' },
            h('div', { class: 'h-full rounded-full bg-brand-500', style: `width:${Math.min(100, r.share)}%` })))))
      : h('p', { class: 'text-sm text-slate-400' }, D.noTop);

    body.replaceChildren(
      h('div', { class: 'flex items-center justify-between gap-2' },
        h('p', { class: 'text-sm text-slate-400' }, D.updated(time)),
        h('button', { type: 'button', class: 'flex min-h-10 items-center gap-2 rounded-xl bg-night-800 px-3 text-sm text-slate-100 ring-1 ring-white/10 hover:bg-night-700', onclick: () => openAdmin() }, ico('repeat'), D.refresh)),
      section(D.today, tiles(
        tile(D.newToday, n(U.newToday)), tile(D.activeToday, n(Ac.dau)), tile(D.chatToday, n(Ac.chat_today)),
        tile(D.learnToday, n(Ac.learn_today)), tile(D.pending, n(M.pending)))),
      section(D.students, tiles(
        tile(D.total, n(U.students)), tile(D.d7, `+${n(U.new7d)}`), tile(D.d30, `+${n(U.new30d)}`),
        tile(D.google, n(U.google)), tile(D.parents, n(U.parents)), tile(D.admins, n(U.admins)), tile(D.triedFree, n(U.triedFree)))),
      section(D.subs, tiles(
        tile(D.active, n(S.active)), tile(D.trial, n(S.trial)), tile('Pro', n(S.pro)), tile('Gold', n(S.gold)), tile('MAX', n(S.max)),
        tile(D.expiring, n(S.expiring)), tile(D.expired, n(S.expired)), tile(D.never, n(S.never)))),
      section(D.money,
        tiles(tile(D.monthly, sum(M.monthly)), tile(D.paid30, sum(M.paid30d)), tile(D.paidAll, sum(M.paidAll))),
        h('p', { class: 'text-xs text-slate-500' }, D.paidNote(M.paidCount))),
      section(D.activity, tiles(
        tile(D.activeUsers, n(Ac.dau), D.today), tile(D.activeUsers, n(Ac.wau), D.d7), tile(D.activeUsers, n(Ac.mau), D.d30),
        tile(D.chat, n(Ac.chat_7d), D.d7), tile(D.chat, n(Ac.chat_30d), D.d30), tile(D.learn, n(Ac.learn_30d), D.d30))),
      section(D.charts,
        dayBars(D.chartReg, s.series, 'reg', D), dayBars(D.chartUsers, s.series, 'users', D, true), dayBars(D.chartChat, s.series, 'chat', D)),
      section(D.sections, tiles(
        tile(D.progress, n(F.progress)), tile(D.diary, n(F.diary)), tile(D.cards, n(F.cards)), tile(D.quest, n(F.quest)))),
      section(D.tokens(s.month),
        tiles(tile(D.input, tok(T.input)), tile(D.output, tok(T.output)), tile(D.tokenUsers, n(T.users))),
        h('p', { class: 'text-sm font-medium text-slate-200' }, D.top), topList));
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
        const revokeBtn = active ? h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-amber-400/15 px-3 text-sm text-amber-200 ring-1 ring-amber-300/30' }, A.one) : null;
        if (revokeBtn) revokeBtn.onclick = () => {
          out.replaceChildren(h('p', { class: 'text-sm text-amber-200' }, A.oneConfirm(u.email)),
            h('div', { class: 'grid grid-cols-2 gap-2' },
              h('button', { type: 'button', class: 'min-h-10 rounded-xl bg-rose-500 px-3 text-sm font-semibold text-onfill', onclick: async () => { await N.postJson('/api/admin/revoke', { email: u.email }).catch(() => ({})); load(); } }, A.oneYes),
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
            revokeBtn, resetBtn, confirmDelete),
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
    let chosen = planById(paid ? plan.tier : RECOMMENDED);
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
      if (res.report && reportFree) reportFree.remove();
      if (!res.report) reportBox.textContent = res.code === 'premium_required' ? P.reportNeedsSub : t('errors')[res.code] || t('errors').default;
    };
    const reportFree = !plan.active && r.child.free?.report ? h('p', { class: 'text-sm text-emerald-300' }, P.reportFree) : null;
    root.append(h('div', { class: `${CARD} flex flex-col gap-3` }, reportBtn, reportFree, reportBox));
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
  // Minimal page with gentle animations: blocks fade in when they scroll into view,
  // the sample chat types itself once. With "reduce motion" everything is shown at once.
  let landingObserver = null;
  function renderLanding() {
    const root = screen('landing');
    const W = t('landing');
    const S = t('sub');
    const b = N.billing;
    const ctx = {
      chat: b.freeTries?.chat || 5,
      from: plans().length ? sum(minPrice()) : '',
      levels: plans().map((p) => `«${S.level[p.id] || p.name}» — ${S.perDay(p.questions)}`).join(', '),
    };
    const txt = (v) => (typeof v === 'function' ? v(ctx) : v);
    const register = () => N.showAuth('register');
    const reveal = (el) => { el.classList.add('reveal'); return el; };
    const heading = (text) => h('h3', { class: 'text-2xl font-semibold tracking-tight text-white' }, text);
    const block = (title, ...kids) => reveal(h('section', { class: 'flex flex-col gap-4 pt-12' }, heading(title), ...kids));
    const contacts = (cls) => [
      b.telegram ? h('a', { class: `${BTN} ${cls || ''}`, href: `https://t.me/${encodeURIComponent(b.telegram)}`, target: '_blank', rel: 'noopener' }, ico('send'), W.telegram) : null,
      b.phone ? h('a', { class: BTN2, href: `tel:${b.phone.replace(/[^\d+]/g, '')}` }, ico('phone'), `${W.call}: ${b.phone}`) : null,
    ];

    root.append(h('div', { class: 'flex justify-end' }, h('div', { class: 'flex rounded-2xl bg-night-800 p-1 ring-1 ring-white/5' },
      ['uz', 'ru'].map((l) => h('button', { type: 'button', class: `min-h-10 min-w-11 rounded-xl px-3 text-sm font-medium ${N.lang === l ? 'bg-brand-500 text-onfill' : 'text-slate-300'}`, onclick: () => document.querySelector(`.lang-btn[data-lang="${l}"]`).click() }, l.toUpperCase())))));

    // Hero
    root.append(h('section', { class: 'flex flex-col items-center gap-5 pt-2 text-center' },
      h('div', { class: 'fade-up' }, h('img', { src: '/img/logo-mark.png', alt: 'Nimi AI', class: 'float-soft h-28 w-28 object-contain sm:h-32 sm:w-32' })),
      h('span', { class: 'fade-up rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400 ring-1 ring-brand-400/25' }, W.badge),
      h('h2', { class: 'fade-up max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl', style: 'animation-delay:80ms' }, W.title),
      h('p', { class: 'fade-up max-w-md text-[17px] leading-relaxed text-slate-400', style: 'animation-delay:160ms' }, W.lead),
      h('div', { class: 'fade-up flex w-full max-w-sm flex-col gap-1', style: 'animation-delay:240ms' },
        h('button', { type: 'button', class: BTN, onclick: register }, W.start, ico('chevron-right')),
        h('button', { type: 'button', class: 'min-h-12 rounded-2xl text-[15px] font-medium text-slate-300 hover:text-white', onclick: () => N.showAuth('login') }, W.login)),
      h('p', { class: 'fade-up max-w-xs text-xs leading-relaxed text-slate-500', style: 'animation-delay:320ms' }, h('span', { class: 'mr-1 inline-block align-[-3px]' }, ico('gift', 'h-4 w-4')), W.freeNote)));

    // Sample chat: the messages appear one by one, like a real conversation.
    const demo = h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-night-900/80 p-4 ring-1 ring-white/5 sm:p-5' },
      h('p', { class: 'text-xs text-slate-500' }, W.demoLabel),
      W.demo.map(([role, text]) => (role === 'user'
        ? h('div', { class: 'demo-msg flex justify-end pl-10' }, R('div', { class: 'bubble max-w-[85%] rounded-3xl rounded-br-md bg-brand-500 px-4 py-2.5 text-[15px] leading-relaxed text-onfill' }, text))
        : h('div', { class: 'demo-msg flex items-start gap-2.5 pr-6' },
          h('img', { src: '/img/avatar.webp', alt: '', class: 'mt-0.5 h-8 w-8 shrink-0 object-contain' }),
          R('div', { class: 'bubble max-w-[85%] rounded-3xl rounded-tl-md bg-night-800 px-4 py-2.5 text-[15px] leading-relaxed text-slate-100 ring-1 ring-white/5' }, text)))));
    demo.dataset.demo = '1';
    root.append(block(W.demoTitle, demo));

    // How to start
    root.append(block(W.stepsTitle, h('div', { class: 'grid gap-3 sm:grid-cols-3' }, W.steps.map(([title, text], i) => h('div', { class: 'flex gap-3 sm:flex-col' },
      h('span', { class: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-400' }, String(i + 1)),
      h('div', { class: 'min-w-0' }, h('p', { class: 'font-semibold text-white' }, title), h('p', { class: 'text-sm text-slate-400' }, txt(text))))))));

    // Features
    root.append(block(W.featuresTitle, h('div', { class: 'grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3' }, W.features.map(([icon, title, text]) => h('div', { class: 'flex flex-col gap-1.5' },
      h('span', { class: 'text-brand-400' }, ico(icon)),
      h('p', { class: 'font-medium text-white' }, title),
      h('p', { class: 'text-sm leading-snug text-slate-400' }, text))))));

    // Parents
    root.append(block(W.parentsTitle,
      h('div', { class: 'grid gap-3 sm:grid-cols-2' }, W.parents.map(([icon, title, text]) => h('div', { class: `${CARD} flex gap-3` },
        h('span', { class: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400' }, ico(icon)),
        h('div', { class: 'min-w-0' }, h('p', { class: 'font-semibold text-white' }, title), h('p', { class: 'text-sm text-slate-400' }, text))))),
      h('div', { class: 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between' },
        h('p', { class: 'text-sm text-slate-400' }, W.parentLoginText),
        h('button', { type: 'button', class: `${BTN2} sm:w-auto sm:shrink-0`, onclick: () => N.showAuth('login') }, ico('users'), W.parentLogin))));

    // Plans
    root.append(block(W.priceTitle,
      h('p', { class: '-mt-2 text-slate-400' }, W.priceLead),
      h('div', { class: 'grid gap-3 sm:grid-cols-3' }, plans().map((p) => {
        const rec = p.id === RECOMMENDED;
        const li = (text) => h('li', { class: 'flex items-start gap-2' }, ico('check', 'h-4 w-4 mt-0.5 shrink-0 text-brand-400'), text);
        return h('div', { class: `relative flex flex-col gap-3 rounded-3xl p-5 ring-1 ${rec ? 'bg-brand-500/10 ring-brand-400/60' : 'bg-night-900/80 ring-white/5'}` },
          rec ? h('span', { class: 'absolute -top-3 left-5 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-onfill shadow-lg shadow-brand-500/30' }, S.popular) : null,
          h('div', {}, h('p', { class: 'text-lg font-semibold text-white' }, S.level[p.id] || p.name), h('p', { class: 'text-xs text-slate-500' }, p.name)),
          h('p', { class: 'flex items-baseline gap-1' }, h('span', { class: 'text-3xl font-semibold tabular-nums text-white' }, money(p.price)), h('span', { class: 'text-sm text-slate-400' }, S.perMonthShort)),
          h('p', { class: '-mt-2 text-sm text-slate-500' }, S.perDayPrice(perDay(p.price))),
          h('ul', { class: 'flex flex-1 flex-col gap-1.5 text-sm text-slate-300' }, li(S.levelText[p.id] || ''), li(S.perDay(p.questions)), li(W.allSections)),
          h('button', { type: 'button', class: rec ? BTN : BTN2, onclick: register }, W.choose));
      })),
      h('p', { class: 'text-center text-sm text-slate-400' }, h('span', { class: 'mr-1.5 inline-block align-[-3px] text-brand-400' }, ico('gift', 'h-4 w-4')), W.freeNote)));

    // About us
    root.append(block(W.aboutTitle, h('div', { class: 'flex flex-col gap-3 text-[15px] leading-relaxed text-slate-300' }, W.about.map((x) => h('p', {}, x)))));

    // Questions and answers
    root.append(block(W.faqTitle, h('div', { class: 'flex flex-col divide-y divide-white/5 rounded-3xl bg-night-900/80 px-4 ring-1 ring-white/5' },
      W.faq.map(([q, a]) => h('details', { class: 'group py-1' },
        h('summary', { class: 'flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-2 text-left font-medium text-white' }, q, ico('chevron-down', 'icon shrink-0 text-slate-500 transition group-open:rotate-180')),
        h('p', { class: 'pb-4 text-[15px] leading-relaxed text-slate-400' }, txt(a)))))));

    // Contacts
    const links = contacts().filter(Boolean);
    root.append(reveal(h('section', { class: 'mt-12 flex flex-col items-center gap-3 rounded-3xl bg-night-900/80 p-6 text-center ring-1 ring-white/5' },
      h('p', { class: 'text-xl font-semibold text-white' }, W.contactTitle),
      h('p', { class: 'max-w-sm text-sm text-slate-400' }, W.contactText),
      links.length ? h('div', { class: 'flex w-full max-w-sm flex-col gap-2' }, links) : null,
      h('button', { type: 'button', class: 'min-h-11 text-[15px] font-medium text-brand-400 hover:text-white', onclick: register }, W.start))));

    root.append(h('footer', { class: 'mt-8 flex flex-col items-center gap-2 pb-2 text-center text-xs text-slate-500' },
      h('img', { src: '/img/logo-mark.png', alt: '', class: 'h-10 w-10 object-contain opacity-90' }),
      h('p', {}, W.footer),
      h('a', { href: '/privacy.html', target: '_blank', class: 'underline hover:text-white' }, t('privacyTitle')),
      h('p', {}, `© ${new Date().getFullYear()} Nimi AI`)));

    // Blocks appear as they scroll into view; the sample chat plays once when seen.
    if (landingObserver) landingObserver.disconnect();
    const items = root.querySelectorAll('.reveal');
    const playDemo = () => demo.querySelectorAll('.demo-msg').forEach((m, i) => setTimeout(() => m.classList.add('shown'), 250 + i * 750));
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('shown'));
      demo.querySelectorAll('.demo-msg').forEach((m) => m.classList.add('shown'));
      return;
    }
    landingObserver = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('shown');
      landingObserver.unobserve(e.target);
      if (e.target.contains(demo)) playDemo();
    }), { threshold: 0.15 });
    items.forEach((el) => landingObserver.observe(el));
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
    const locked = !N.hasAccess();
    const can = (key) => !locked || N.freeLeft(key) > 0;
    const guard = (fn, key) => (can(key) ? fn : () => openSubscribe(key));
    const anyFree = Object.values(N.user?.free || {}).some((n) => n > 0);
    if (st && (st.tone === 'expired' || st.tone === 'none')) {
      const none = st.tone === 'none';
      const trying = none && anyFree;
      root.append(h('div', { class: `flex flex-col gap-3 rounded-3xl p-5 ring-1 ${trying ? 'bg-brand-500/10 ring-brand-400/30' : 'bg-amber-400/10 ring-amber-400/30'}` },
        h('p', { class: `flex items-center gap-2 text-lg font-semibold ${trying ? 'text-white' : 'text-amber-100'}` }, trying ? ico('gift', 'icon text-brand-400') : null, trying ? S.none : none ? S.allUsed : S.expired),
        h('p', { class: `text-sm ${trying ? 'text-slate-300' : 'text-amber-100/80'}` }, trying ? S.noneText(N.user?.free?.chat ?? 0) : none ? S.allUsedText : S.expiredText),
        h('button', { type: 'button', class: trying ? BTN2 : BTN, onclick: () => openSubscribe() }, ico(none ? 'sparkles' : 'star'), none ? S.trialAsk : `${S.order} · ${S.from(sum(minPrice()))}`)));
    } else if (st) {
      root.append(h('button', { type: 'button', class: `flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm ring-1 ${st.tone === 'ending' ? 'bg-amber-400/10 text-amber-100 ring-amber-400/30' : 'bg-night-900/80 text-slate-300 ring-white/5'}`, onclick: openSubscribe },
        ico('star', 'icon text-amber-300'), h('span', { class: 'min-w-0 flex-1' }, st.text), ico('chevron-right', 'icon text-slate-500')));
    }

    root.append(h('div', { class: 'flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-onfill shadow-lg shadow-brand-500/30' },
      h('div', { class: 'flex items-center gap-3' },
        h('span', { class: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-onfill/15' }, ico(can('training') ? 'dumbbell' : 'lock')),
        h('div', { class: 'min-w-0' }, h('p', { class: 'text-lg font-semibold' }, t('dailyTitle')), h('p', { class: 'text-sm text-onfill/80' }, daily ? t('dailyDone')(daily.score) : t('dailyDesc')(level())))),
      h('button', { type: 'button', class: 'flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-onfill text-base font-semibold text-brand-600 transition hover:bg-onfill/90 active:scale-[.98]', onclick: guard(() => startTraining(), 'training') }, daily ? ico('repeat') : ico('chevron-right'), !can('training') ? S.open : locked ? `${t('start')} · ${S.tileFree}` : daily ? t('again') : t('start'))));

    const tiles = t('tiles');
    // paid: part of the subscription. Without one it shows "free" while its free try is left, then a lock.
    const badge = (key) => (can(key)
      ? h('span', { class: 'absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-300' }, S.tileFree)
      : h('span', { class: 'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/15 text-amber-200', title: S.locked, 'aria-label': S.locked }, ico('lock', 'h-4 w-4')));
    const tile = (key, icon, onclick, extra, paid = true) => h('button', { type: 'button', class: `${CARD} relative flex min-h-32 flex-col items-start gap-3 text-left transition hover:bg-night-800 active:scale-[.98]`, onclick: paid ? guard(onclick, key) : onclick },
      h('span', { class: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-night-700 text-brand-400' }, ico(icon)),
      paid && locked ? badge(key) : null,
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

  // ---------- chat history (saved in the account) ----------
  async function openHistory() {
    const H = t('history');
    const root = screen('activity');
    root.append(titleBar(H.title), h('p', { class: 'text-sm text-slate-400' }, H.note), loading(t('loadingTopics')));
    const r = await N.postJson('/api/chats/list', {}).catch(() => ({}));
    root.lastChild.remove();
    if (!Array.isArray(r.chats)) { root.append(errorBox(r.code || 'default', openHistory)); return; }
    if (!r.chats.length) { root.append(h('p', { class: `${CARD} text-slate-300` }, H.empty)); return; }
    r.chats.forEach((c) => root.append(h('button', { type: 'button', class: `${CARD} flex flex-col items-start gap-1 text-left transition hover:bg-night-800 active:scale-[.99]`, onclick: () => openChat(c.id) },
      h('span', { class: 'text-xs text-slate-400' }, `${N.subjectName(c.subject)} · ${N.gradeLabel(c.grade)} · ${fmtDate(c.date)}`),
      h('span', { class: 'line-clamp-2 break-words text-[15px] text-white' }, c.title || '…'),
      h('span', { class: 'text-xs text-slate-500' }, H.count(c.count)))));
  }

  async function openChat(id) {
    const H = t('history');
    const root = screen('activity');
    root.append(titleBar(H.title, openHistory), loading(t('loadingTopics')));
    const r = await N.postJson('/api/chats/get', { id }).catch(() => ({}));
    root.lastChild.remove();
    const c = r.chat;
    if (!c) { root.append(errorBox(r.code || 'default', () => openChat(id))); return; }
    root.append(h('p', { class: 'text-sm text-slate-400' }, `${N.subjectName(c.subject)} · ${N.gradeLabel(c.grade)} · ${fmtDate(c.date)}`));
    const photo = () => h('span', { class: 'mb-1 flex items-center gap-1.5 text-xs opacity-80' }, ico('camera', 'h-4 w-4'), H.photo);
    root.append(h('div', { class: 'flex flex-col gap-3' }, c.messages.map((m) => (m.role === 'user'
      ? h('div', { class: 'flex justify-end pl-10' }, h('div', { class: 'max-w-[85%] rounded-3xl rounded-br-md bg-brand-500 px-4 py-3 text-onfill' }, m.photo ? photo() : null, R('div', { class: 'bubble whitespace-pre-wrap break-words' }, m.content)))
      : h('div', { class: 'flex pr-6' }, R('div', { class: 'bubble max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-tl-md bg-night-800 px-4 py-3 text-slate-100 ring-1 ring-white/5' }, m.content))))));
    const del = h('button', { type: 'button', class: `${BTN2} text-rose-300` }, ico('trash-2'), H.del);
    del.onclick = async () => {
      if (!del.dataset.sure) { del.dataset.sure = '1'; del.lastChild.textContent = H.delSure; return; }
      del.disabled = true;
      await N.postJson('/api/chats/delete', { id }).catch(() => ({}));
      N.forgetChat(id);
      openHistory();
    };
    root.append(h('button', { type: 'button', class: BTN, onclick: () => N.continueChat(c) }, ico('message-circle'), H.cont), del);
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
    h, R, ico, CARD, BTN, BTN2, INPUT, screen, titleBar, loading, errorBox, failed, save, markDay, isCorrect, recordAnswer, trainingTasks, openGames, openSubscribe,
    get data() { return data; },
    setStop(fn) { stopActive = fn; },
  };

  window.NimiLearn = { load, render, markDay, openSubscribe, openAdmin, openSettings, renderParent, renderLanding, openHistory, kit };
})();
