// Monster battle: a learning game. Questions come from code (math by grade,
// English words and grammar) or from the AI (the student's subject). A wrong
// answer shows the rule, comes back later in the same battle and goes to the
// "cave of mistakes" to be reviewed on another day. Uses window.NimiLearn.kit.
(() => {
  const N = window.Nimi;
  const K = () => window.NimiLearn.kit;
  const tr = (ru, uz) => (N.lang === 'uz' ? uz : ru);

  // ---------- small helpers ----------
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const M = (tex) => `$${tex}$`;
  // 12000 -> "12 000", negatives with a real minus sign.
  const fmt = (n) => {
    const s = String(Math.abs(n));
    return (n < 0 ? '−' : '') + (Math.abs(n) >= 10000 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s);
  };
  const dstr = (x) => String(Number(x.toFixed(3))).replace('.', ',');
  const dtex = (x) => dstr(x).replace(',', '{,}');
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  // Numeric answer with 3 plausible wrong options (typical mistakes first).
  function numChoice(ans, cands, unit = '', allowNeg = ans < 0, step = 1) {
    const ok = (c) => Number.isInteger(c) && c !== ans && (allowNeg || c >= 0);
    const out = [];
    for (const c of shuffle(cands)) if (out.length < 3 && ok(c) && !out.includes(c)) out.push(c);
    for (let k = 1; out.length < 3; k++) {
      for (const c of [ans + k * step, ans - k * step]) if (out.length < 3 && ok(c) && !out.includes(c)) out.push(c);
    }
    const f = (n) => fmt(n) + unit;
    return { a: f(ans), opts: shuffle([ans, ...out].map(f)) };
  }
  // Text answer with wrong options; duplicates and the right one are skipped.
  function strChoice(ans, cands) {
    const out = [];
    for (const c of shuffle(cands)) if (out.length < 3 && c && c !== ans && !out.includes(c)) out.push(c);
    return { a: ans, opts: shuffle([ans, ...out]) };
  }
  // Fraction answer; wrong options must differ from the right one by value.
  function fracChoice([p, q], cands) {
    const F = (x, y) => M(`\\frac{${x}}{${y}}`);
    const out = [];
    const seen = [[p, q]];
    const fill = [[p + 1, q], [p, q + 1], [p + 2, q], [Math.max(0, p - 1), q]];
    for (const [x, y] of [...shuffle(cands), ...fill]) {
      if (out.length >= 3 || !(y > 0) || x < 0 || !Number.isInteger(x) || !Number.isInteger(y)) continue;
      if (seen.some(([sx, sy]) => sx * y === x * sy)) continue;
      seen.push([x, y]);
      out.push(F(x, y));
    }
    return { a: F(p, q), opts: shuffle([F(p, q), ...out]) };
  }

  // ---------- math by grade (no AI) ----------
  const NAMES = [['Азиза', 'Aziz'], ['Малики', 'Malika'], ['Али', 'Ali'], ['Лайло', 'Laylo'], ['Тимура', 'Timur'], ['Мадины', 'Madina']];
  const ITEMS = [['яблоко', 'яблока', 'яблок', 'olma'], ['конфета', 'конфеты', 'конфет', 'konfet'], ['карандаш', 'карандаша', 'карандашей', 'qalam'], ['книга', 'книги', 'книг', 'kitob'], ['орех', 'ореха', 'орехов', "yong'oq"]];

  function wordProblem(g) {
    const [ru, uz] = pick(NAMES);
    const it = pick(ITEMS);
    const pl = (n) => `${n} ${plural(n, it[0], it[1], it[2])}`;
    const kinds = g <= 2 ? ['add', 'sub'] : g <= 3 ? ['add', 'sub', 'mul', 'div'] : g <= 4 ? ['mul', 'div', 'money', 'speed'] : ['money', 'speed', 'div'];
    const kind = pick(kinds);
    if (kind === 'add') {
      const a = rnd(3, 12), b = rnd(2, 8), s = a + b;
      return { q: tr(`У ${ru} было ${pl(a)}. Мама дала ещё ${pl(b)}. Сколько ${it[2]} стало у ${ru}?`, `${uz}da ${a} ta ${it[3]} bor edi. Onasi yana ${b} ta ${it[3]} berdi. Endi ${uz}da nechta ${it[3]} bor?`),
        ...numChoice(s, [a - b, s + 1, s - 1, s + 10]),
        rule: tr('Слова «ещё», «стало больше» подсказывают сложение.', "«Yana», «ko'paydi» so'zlari qo'shishni bildiradi."),
        explain: M(`${a} + ${b} = ${s}`) };
    }
    if (kind === 'sub') {
      const a = rnd(8, 18), b = rnd(2, a - 2), r = a - b;
      return { q: tr(`У ${ru} было ${pl(a)}. Из них ${pl(b)} отдали друзьям. Сколько ${it[2]} осталось?`, `${uz}da ${a} ta ${it[3]} bor edi. U do'stlariga ${b} ta ${it[3]} berdi. Nechta ${it[3]} qoldi?`),
        ...numChoice(r, [a + b, r + 1, r - 1, r + 2]),
        rule: tr('Слова «осталось», «отдали», «меньше» подсказывают вычитание.', "«Qoldi», «berdi», «kamaydi» so'zlari ayirishni bildiradi."),
        explain: M(`${a} - ${b} = ${r}`) };
    }
    if (kind === 'mul') {
      const a = rnd(3, 9), b = rnd(2, 9), p = a * b;
      return { q: tr(`В одной коробке ${pl(a)}. Сколько ${it[2]} в ${b} таких коробках?`, `Bitta qutida ${a} ta ${it[3]} bor. ${b} ta shunday qutida nechta ${it[3]} bor?`),
        ...numChoice(p, [a + b, a * (b + 1), a * (b - 1), p + 1]),
        rule: tr('Одинаковое количество повторяется несколько раз — это умножение.', "Bir xil miqdor bir necha marta takrorlansa — bu ko'paytirish."),
        explain: M(`${a} \\times ${b} = ${p}`) };
    }
    if (kind === 'div') {
      const b = rnd(2, 6), each = rnd(2, 9), n = b * each;
      return { q: tr(`${pl(n)[0].toUpperCase()}${pl(n).slice(1)} разделили поровну между ${b} детьми. Сколько ${it[2]} получил каждый?`, `${n} ta ${it[3]} ${b} ta bolaga teng bo'lib berildi. Har biri nechta ${it[3]} oldi?`),
        ...numChoice(each, [n - b, n * b, each + 1, each - 1]),
        rule: tr('Слово «поровну» подсказывает деление.', "«Teng bo'lib» so'zi bo'lishni bildiradi."),
        explain: M(`${n} : ${b} = ${each}`) };
    }
    if (kind === 'money') {
      const p = pick([1500, 2000, 2500, 3000, 3500, 4000, 5000]), k = rnd(2, 6), s = p * k;
      return { q: tr(`Тетрадь стоит ${fmt(p)} сум. Сколько стоят ${k} ${plural(k, 'тетрадь', 'тетради', 'тетрадей')}?`, `Bitta daftar ${fmt(p)} so'm turadi. ${k} ta daftar necha so'm turadi?`),
        ...numChoice(s, [p + k, p * (k + 1), p * (k - 1), s + 1000], tr(' сум', " so'm"), false, 500),
        rule: tr('Стоимость = цена × количество.', 'Qiymat = narx × miqdor.'),
        explain: `${fmt(p)} × ${k} = ${fmt(s)}${tr(' сум', " so'm")}` };
    }
    const v = pick([40, 50, 60, 70, 80, 90]), t = rnd(2, 5), s = v * t;
    return { q: tr(`Машина едет со скоростью ${v} км/ч. Какое расстояние она проедет за ${t} ч?`, `Mashina ${v} km/soat tezlik bilan yurmoqda. U ${t} soatda qancha masofani bosib o'tadi?`),
      ...numChoice(s, [v + t, v * (t + 1), s + 10, s - 10], tr(' км', ' km'), false, 10),
      rule: tr('Расстояние = скорость × время: $S = v \\cdot t$.', 'Masofa = tezlik × vaqt: $S = v \\cdot t$.'),
      explain: `${M(`S = ${v} \\cdot ${t} = ${s}`)} ${tr('км', 'km')}` };
  }

  // Topics in the order they are learned. g: [first grade, last grade].
  const MATH = [
    { id: 'add20', g: [1, 2], name: ['Сложение до 20', "20 gacha qo'shish"], gen() {
      const a = rnd(3, 9), b = rnd(2, 9), s = a + b;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} + ${b}`)}`, ...numChoice(s, [s - 1, s + 1, s - 2, s + 2, s + 10]),
        rule: tr('Дополни первое число до 10, а потом прибавь то, что осталось.', "Birinchi sonni 10 gacha to'ldir, keyin qolganini qo'sh."),
        explain: M(s > 10 ? `${a} + ${b} = ${a} + ${10 - a} + ${b - (10 - a)} = 10 + ${s - 10} = ${s}` : `${a} + ${b} = ${s}`) };
    } },
    { id: 'sub20', g: [1, 2], name: ['Вычитание до 20', '20 gacha ayirish'], gen() {
      const a = rnd(11, 18), b = rnd(Math.max(2, a - 9), 9), r = a - b, k = a - 10;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} - ${b}`)}`, ...numChoice(r, [r - 1, r + 1, r + 2, r - 2, a + b]),
        rule: tr('Сначала вычти столько, чтобы получилось 10, а потом — остальное.', "Avval 10 qolguncha ayir, keyin qolganini ayir."),
        explain: M(`${a} - ${b} = ${a} - ${k} - ${b - k} = 10 - ${b - k} = ${r}`) };
    } },
    { id: 'compare', g: [1, 1], name: ['Сравнение чисел', 'Sonlarni taqqoslash'], gen() {
      const a = rnd(10, 99);
      const r = Math.random();
      const b = r < 0.15 ? a : r < 0.5 ? Math.floor(a / 10) * 10 + rnd(0, 9) : rnd(10, 99);
      const sign = a > b ? '>' : a < b ? '<' : '=';
      const ta = Math.floor(a / 10), tb = Math.floor(b / 10);
      let explain = `${a} = ${b}`;
      if (a !== b && ta !== tb) explain = tr(`У числа ${a} — ${ta} дес., у числа ${b} — ${tb} дес. Значит, ${a} ${sign} ${b}.`, `${a} sonida ${ta} ta o'nlik, ${b} sonida ${tb} ta o'nlik bor. Demak, ${a} ${sign} ${b}.`);
      else if (a !== b) explain = tr(`Десятков поровну, сравниваем единицы: ${a % 10} и ${b % 10}. Значит, ${a} ${sign} ${b}.`, `O'nliklar teng, birliklarni solishtiramiz: ${a % 10} va ${b % 10}. Demak, ${a} ${sign} ${b}.`);
      return { q: `${tr('Какой знак поставить?', "Qaysi belgi qo'yiladi?")} ${M(`${a} \\;\\square\\; ${b}`)}`, a: sign, opts: ['<', '=', '>'],
        rule: tr('Сначала сравни десятки, если они равны — единицы. Знак «>» открытой стороной смотрит на большее число.', "Avval o'nliklarni, ular teng bo'lsa — birliklarni solishtir. «>» belgisining ochiq tomoni katta songa qaraydi."),
        explain };
    } },
    { id: 'missing', g: [1, 3], name: ['Неизвестное слагаемое', "Noma'lum qo'shiluvchi"], gen(g) {
      const c = g <= 1 ? rnd(8, 20) : rnd(20, 99), b = rnd(2, c - 2), x = c - b;
      return { q: `${tr('Найди пропущенное число', 'Tushirib qoldirilgan sonni top')}: ${M(`\\square + ${b} = ${c}`)}`, ...numChoice(x, [c + b, x + 1, x - 1, x + 10, x - 10]),
        rule: tr('Неизвестное слагаемое = сумма − известное слагаемое.', "Noma'lum qo'shiluvchi = yig'indi − ma'lum qo'shiluvchi."),
        explain: M(`\\square = ${c} - ${b} = ${x}`) };
    } },
    { id: 'add100', g: [2, 3], name: ['Сложение до 100', "100 gacha qo'shish"], gen() {
      let a, b;
      do { a = rnd(15, 75); b = rnd(12, 99 - a); } while ((a % 10) + (b % 10) < 10 && Math.random() < 0.6);
      const ta = a - (a % 10), tb = b - (b % 10), ua = a % 10, ub = b % 10, s = a + b;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} + ${b}`)}`, ...numChoice(s, [ta + tb + ((ua + ub) % 10), s + 10, s - 10, s + 1, s - 1]),
        rule: tr('Складывай отдельно десятки и единицы. Если единиц больше 10 — получился ещё один десяток.', "O'nliklar va birliklarni alohida qo'sh. Birliklar 10 dan oshsa — yana bitta o'nlik hosil bo'ladi."),
        explain: M(`${a} + ${b} = (${ta} + ${tb}) + (${ua} + ${ub}) = ${ta + tb} + ${ua + ub} = ${s}`) };
    } },
    { id: 'sub100', g: [2, 3], name: ['Вычитание до 100', '100 gacha ayirish'], gen() {
      const a = rnd(41, 99), b = rnd(12, a - 10), tb = b - (b % 10), ub = b % 10, r = a - b;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} - ${b}`)}`, ...numChoice(r, [(Math.floor(a / 10) - Math.floor(b / 10)) * 10 + Math.abs((a % 10) - ub), r + 10, r - 10, r + 1, r - 1]),
        rule: tr('Вычитай по частям: сначала десятки, потом единицы.', "Qismlab ayir: avval o'nliklarni, keyin birliklarni."),
        explain: M(ub ? `${a} - ${b} = ${a} - ${tb} - ${ub} = ${a - tb} - ${ub} = ${r}` : `${a} - ${b} = ${r}`) };
    } },
    { id: 'mult', g: [2, 4], name: ['Таблица умножения', "Ko'paytirish jadvali"], gen(g, hard) {
      const a = g <= 2 ? rnd(2, 5) : rnd(2, 9), b = hard ? rnd(6, 9) : rnd(2, 9), p = a * b;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} \\times ${b}`)}`, ...numChoice(p, [a * (b + 1), a * (b - 1), (a + 1) * b, p + 1, p - 1, a + b]),
        rule: tr('Умножение — это сложение одинаковых чисел. Множители можно переставлять: $a \\times b = b \\times a$.', "Ko'paytirish — bir xil sonlarni qo'shish. Ko'paytuvchilar o'rnini almashtirish mumkin: $a \\times b = b \\times a$."),
        explain: M(b > 5 ? `${a} \\times ${b} = ${a} \\times 5 + ${a} \\times ${b - 5} = ${a * 5} + ${a * (b - 5)} = ${p}` : `${a} \\times ${b} = ${Array(b).fill(a).join(' + ')} = ${p}`) };
    } },
    { id: 'perim', g: [2, 5], name: ['Периметр', 'Perimetr'], gen(g) {
      const a = rnd(3, g <= 3 ? 9 : 15), b = rnd(2, a), p = 2 * (a + b), u = tr(' см', ' sm');
      return { q: tr(`Найди периметр прямоугольника со сторонами ${a} см и ${b} см.`, `Tomonlari ${a} sm va ${b} sm bo'lgan to'g'ri to'rtburchakning perimetrini top.`),
        ...numChoice(p, [a * b, a + b, 2 * a + b, p + 2, p - 2], u),
        rule: tr('Периметр — сумма длин всех сторон. У прямоугольника $P = 2 \\cdot (a + b)$.', "Perimetr — barcha tomonlar uzunliklari yig'indisi. To'g'ri to'rtburchakda $P = 2 \\cdot (a + b)$."),
        explain: `${M(`P = 2 \\cdot (${a} + ${b}) = 2 \\cdot ${a + b} = ${p}`)}${u}` };
    } },
    { id: 'units', g: [2, 5], name: ['Единицы измерения', "O'lchov birliklari"], gen(g) {
      const U = [[['м', 'm'], ['см', 'sm'], 100], [['дм', 'dm'], ['см', 'sm'], 10], [['м', 'm'], ['дм', 'dm'], 10], [['ч', 'soat'], ['мин', 'daqiqa'], 60],
        [['км', 'km'], ['м', 'm'], 1000], [['кг', 'kg'], ['г', 'g'], 1000], [['мин', 'daqiqa'], ['с', 'soniya'], 60], [['т', 't'], ['кг', 'kg'], 1000]];
      const [from, to, f] = pick(g <= 2 ? U.slice(0, 4) : U);
      const k = rnd(2, 9), ans = k * f, fr = tr(...from), tu = tr(...to);
      return { q: `${k} ${fr} = ? ${tu}`, ...numChoice(ans, [ans / 10, ans * 10, k + f, k * 100, k * 10]),
        rule: tr(`Запомни: 1 ${fr} = ${f} ${tu}. Большие единицы переводим в маленькие умножением.`, `Yodda tut: 1 ${fr} = ${f} ${tu}. Katta birlikni kichigiga o'tkazish uchun ko'paytiramiz.`),
        explain: tr(`1 ${fr} = ${f} ${tu}, значит ${k} ${fr} = ${k} × ${f} = ${fmt(ans)} ${tu}.`, `1 ${fr} = ${f} ${tu}, demak ${k} ${fr} = ${k} × ${f} = ${fmt(ans)} ${tu}.`) };
    } },
    { id: 'word', g: [1, 6], name: ['Текстовые задачи', 'Matnli masalalar'], gen: (g) => wordProblem(g) },
    { id: 'div', g: [3, 5], name: ['Деление', "Bo'lish"], gen(g, hard) {
      const b = rnd(2, 9), q = rnd(2, hard || g >= 4 ? 12 : 9), n = b * q;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${n} : ${b}`)}`, ...numChoice(q, [q + 1, q - 1, q + 2, b, n - b]),
        rule: tr('Деление проверяй умножением: частное × делитель = делимое.', "Bo'lishni ko'paytirish bilan tekshir: bo'linma × bo'luvchi = bo'linuvchi."),
        explain: `${M(`${n} : ${b} = ${q}`)}, ${tr('потому что', 'chunki')} ${M(`${b} \\times ${q} = ${n}`)}` };
    } },
    { id: 'order', g: [3, 6], name: ['Порядок действий', 'Amallar tartibi'], gen(g) {
      const kind = rnd(0, g >= 5 ? 3 : 2);
      const first = (x) => `${tr('сначала', 'avval')} ${x}`, then = (x) => `${tr('потом', 'keyin')} ${x}`;
      const mul = tr('умножение', "ko'paytirish"), add = tr('сложение', "qo'shish"), sub = tr('вычитание', 'ayirish'), dv = tr('деление', "bo'lish");
      let expr, ans, wrong, steps;
      if (kind === 0) {
        const a = rnd(2, 20), b = rnd(2, 9), c = rnd(2, 9);
        expr = `${a} + ${b} \\times ${c}`; ans = a + b * c; wrong = (a + b) * c;
        steps = [`${first(mul)}: ${M(`${b} \\times ${c} = ${b * c}`)}`, `${then(add)}: ${M(`${a} + ${b * c} = ${ans}`)}`];
      } else if (kind === 1) {
        const a = rnd(2, 12), b = rnd(2, 9), c = rnd(2, 9);
        expr = `(${a} + ${b}) \\times ${c}`; ans = (a + b) * c; wrong = a + b * c;
        steps = [`${first(tr('скобки', 'qavs ichidagi amal'))}: ${M(`${a} + ${b} = ${a + b}`)}`, `${then(mul)}: ${M(`${a + b} \\times ${c} = ${ans}`)}`];
      } else if (kind === 2) {
        const c = rnd(2, 9), q = rnd(2, 9), b = c * q, a = rnd(q + 1, 40);
        expr = `${a} - ${b} : ${c}`; ans = a - q; wrong = (a - b) / c;
        steps = [`${first(dv)}: ${M(`${b} : ${c} = ${q}`)}`, `${then(sub)}: ${M(`${a} - ${q} = ${ans}`)}`];
      } else {
        let a, b, c, d;
        do { a = rnd(3, 9); b = rnd(3, 9); c = rnd(2, 6); d = rnd(2, 6); } while (a * b <= c * d + 1);
        expr = `${a} \\times ${b} - ${c} \\times ${d}`; ans = a * b - c * d; wrong = (a * b - c) * d;
        steps = [`${first(mul)}: ${M(`${a} \\times ${b} = ${a * b}`)}, ${M(`${c} \\times ${d} = ${c * d}`)}`, `${then(sub)}: ${M(`${a * b} - ${c * d} = ${ans}`)}`];
      }
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(expr)}`, ...numChoice(ans, [wrong, ans + 1, ans - 1, ans + 10]),
        rule: tr('Порядок действий: сначала скобки, потом умножение и деление, потом сложение и вычитание.', "Amallar tartibi: avval qavs ichidagisi, keyin ko'paytirish va bo'lish, so'ng qo'shish va ayirish."),
        explain: `${steps.join('; ')}.` };
    } },
    { id: 'area', g: [3, 6], name: ['Площадь', 'Yuz'], gen(g) {
      const a = rnd(3, g <= 3 ? 9 : 15), b = rnd(2, a), s = a * b, u = tr(' см²', ' sm²');
      return { q: tr(`Найди площадь прямоугольника со сторонами ${a} см и ${b} см.`, `Tomonlari ${a} sm va ${b} sm bo'lgan to'g'ri to'rtburchakning yuzini top.`),
        ...numChoice(s, [2 * (a + b), a + b, s + a, s - b], u),
        rule: tr('Площадь прямоугольника $S = a \\cdot b$ (длина × ширина). Не путай с периметром — суммой сторон.', "To'g'ri to'rtburchak yuzi $S = a \\cdot b$ (bo'yi × eni). Perimetr — tomonlar yig'indisi bilan adashtirma."),
        explain: `${M(`S = ${a} \\cdot ${b} = ${s}`)}${u}` };
    } },
    { id: 'mult2', g: [4, 5], name: ['Умножение на однозначное', "Bir xonali songa ko'paytirish"], gen(g, hard) {
      let a;
      do { a = hard ? rnd(51, 99) : rnd(12, 49); } while (a % 10 === 0);
      const b = rnd(3, 9), ta = a - (a % 10), ua = a % 10, p = a * b;
      return { q: `${tr('Реши', 'Yech')}: ${M(`${a} \\times ${b}`)}`, ...numChoice(p, [ta * b + ua, p + 10, p - 10, p + b, p - b]),
        rule: tr('Разложи число на десятки и единицы, умножь каждую часть и сложи.', "Sonni o'nlik va birliklarga ajrat, har birini ko'paytirib, natijalarni qo'sh."),
        explain: M(`${a} \\times ${b} = ${ta} \\times ${b} + ${ua} \\times ${b} = ${ta * b} + ${ua * b} = ${p}`) };
    } },
    { id: 'fracSame', g: [4, 6], name: ['Дроби с одинаковым знаменателем', 'Maxrajlari bir xil kasrlar'], gen() {
      const n = rnd(5, 12), plus = Math.random() < 0.6;
      let a, b;
      if (plus) { a = rnd(1, n - 2); b = rnd(1, n - 1 - a); } else { a = rnd(2, n - 1); b = rnd(1, a - 1); }
      const r = plus ? a + b : a - b, op = plus ? '+' : '-';
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`\\frac{${a}}{${n}} ${op} \\frac{${b}}{${n}}`)}`,
        ...fracChoice([r, n], plus ? [[r, 2 * n], [r + 1, n], [a * b, n], [r, n + 1]] : [[a + b, n], [r + 1, n], [r, 2 * n], [r - 1, n]]),
        rule: tr('Если знаменатели одинаковые, складывают (вычитают) только числители, а знаменатель не меняется.', "Maxrajlar bir xil bo'lsa, faqat suratlar qo'shiladi (ayiriladi), maxraj o'zgarmaydi."),
        explain: M(`\\frac{${a}}{${n}} ${op} \\frac{${b}}{${n}} = \\frac{${a} ${op} ${b}}{${n}} = \\frac{${r}}{${n}}`) };
    } },
    { id: 'fracOf', g: [4, 6], name: ['Дробь от числа', 'Sonning kasr qismi'], gen() {
      const d = pick([2, 3, 4, 5, 10]), k = rnd(1, d - 1), m = rnd(2, 12), base = d * m, ans = m * k;
      return { q: tr(`Найди ${M(`\\frac{${k}}{${d}}`)} от числа ${base}.`, `${base} sonining ${M(`\\frac{${k}}{${d}}`)} qismini top.`),
        ...numChoice(ans, [m, base - ans, base * k, ans + m, base / k]),
        rule: tr('Чтобы найти дробь от числа, раздели число на знаменатель и умножь на числитель.', "Sonning kasr qismini topish uchun sonni maxrajga bo'lib, suratga ko'paytir."),
        explain: M(`${base} : ${d} \\times ${k} = ${m} \\times ${k} = ${ans}`) };
    } },
    { id: 'eq1', g: [4, 7], name: ['Простые уравнения', 'Oddiy tenglamalar'], gen(g) {
      const kind = rnd(0, g >= 5 ? 3 : 1);
      let expr, x, sol, cands, rule;
      if (kind === 0) {
        const a = rnd(5, 60); x = rnd(3, 60); const b = x + a;
        expr = `x + ${a} = ${b}`; sol = `x = ${b} - ${a} = ${x}`; cands = [b + a, x + 1, x - 1, x + 10];
        rule = tr('Неизвестное слагаемое = сумма − известное слагаемое.', "Noma'lum qo'shiluvchi = yig'indi − ma'lum qo'shiluvchi.");
      } else if (kind === 1) {
        const a = rnd(5, 40); x = rnd(a + 2, 90); const b = x - a;
        expr = `x - ${a} = ${b}`; sol = `x = ${b} + ${a} = ${x}`; cands = [b - a, x + 1, x - 1, x - 10];
        rule = tr('Неизвестное уменьшаемое = разность + вычитаемое.', "Noma'lum kamayuvchi = ayirma + ayriluvchi.");
      } else if (kind === 2) {
        const a = rnd(2, 9); x = rnd(2, 12); const b = a * x;
        expr = `${a} \\cdot x = ${b}`; sol = `x = ${b} : ${a} = ${x}`; cands = [b - a, b * a, x + 1, x - 1];
        rule = tr('Неизвестный множитель = произведение : известный множитель.', "Noma'lum ko'paytuvchi = ko'paytma : ma'lum ko'paytuvchi.");
      } else {
        const a = rnd(2, 9), b = rnd(2, 12); x = a * b;
        expr = `x : ${a} = ${b}`; sol = `x = ${b} \\cdot ${a} = ${x}`; cands = [a + b, x + a, x - b];
        rule = tr('Неизвестное делимое = частное × делитель.', "Noma'lum bo'linuvchi = bo'linma × bo'luvchi.");
      }
      return { q: `${tr('Реши уравнение', 'Tenglamani yech')}: ${M(expr)}`, ...numChoice(x, cands), rule, explain: M(sol) };
    } },
    { id: 'dec', g: [5, 7], name: ['Десятичные дроби', "O'nli kasrlar"], gen() {
      if (Math.random() < 0.55) {
        let X = rnd(11, 89), Y = rnd(11, 89);
        if (X % 10 === 0) X += 1;
        if (Y % 10 === 0) Y += 3;
        const S = X + Y;
        const concat = (X % 10) + (Y % 10) >= 10 ? `${Math.floor(X / 10) + Math.floor(Y / 10)},${(X % 10) + (Y % 10)}` : null;
        return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`${dtex(X / 10)} + ${dtex(Y / 10)}`)}`,
          ...strChoice(dstr(S / 10), [concat, dstr((S + 10) / 10), dstr((S - 1) / 10), dstr((S + 1) / 10), dstr(S / 100)]),
          rule: tr('Пиши запятую под запятой и складывай по разрядам: десятые с десятыми, целые с целыми. 10 десятых = 1 целая.', "Vergulni vergul ostiga yoz va xonalab qo'sh: o'ndan birlarni o'ndan birlarga, butunlarni butunlarga. 10 ta o'ndan bir = 1 butun."),
          explain: M(`${dtex(X / 10)} + ${dtex(Y / 10)} = ${dtex(S / 10)}`) };
      }
      let H;
      do { H = rnd(101, 999); } while (H % 10 === 0);
      const v = H / 100, m = pick([10, 100]), shift = m === 10 ? 1 : 2;
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`${dtex(v)} \\times ${m}`)}`,
        ...strChoice(dstr(v * m), [dstr(v / 10), dstr(v * (m === 10 ? 100 : 10)), dstr(v / m), `${dstr(v)}0`]),
        rule: tr('При умножении на 10 запятая сдвигается вправо на 1 знак, на 100 — на 2 знака.', "10 ga ko'paytirganda vergul 1 xona o'ngga, 100 ga — 2 xona o'ngga suriladi."),
        explain: tr(`Запятая сдвигается вправо на ${shift} ${plural(shift, 'знак', 'знака', 'знаков')}: ${dstr(v)} × ${m} = ${dstr(v * m)}.`, `Vergul ${shift} xona o'ngga suriladi: ${dstr(v)} × ${m} = ${dstr(v * m)}.`) };
    } },
    { id: 'gcdlcm', g: [5, 7], name: ['НОД и НОК', 'EKUB va EKUK'], gen() {
      const [m, n] = pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7], [3, 7], [4, 5], [5, 6], [4, 7], [5, 7]]);
      const k = rnd(2, 9), a = k * m, b = k * n, lcm = k * m * n;
      if (Math.random() < 0.5) {
        return { q: tr(`Найди НОД чисел ${a} и ${b}.`, `${a} va ${b} sonlarining EKUBini top.`), ...numChoice(k, [1, m, n, 2 * k, a, b]),
          rule: tr('НОД — наибольшее число, на которое делятся оба числа без остатка.', "EKUB — ikkala son ham qoldiqsiz bo'linadigan eng katta son."),
          explain: tr(`${a} = ${k} · ${m}, ${b} = ${k} · ${n}. Общий множитель — ${k}, значит НОД = ${k}.`, `${a} = ${k} · ${m}, ${b} = ${k} · ${n}. Umumiy ko'paytuvchi — ${k}, demak EKUB = ${k}.`) };
      }
      return { q: tr(`Найди НОК чисел ${a} и ${b}.`, `${a} va ${b} sonlarining EKUKini top.`), ...numChoice(lcm, [a * b, a + b, lcm * 2, a, b]),
        rule: tr('НОК — наименьшее число, которое делится на оба числа без остатка.', "EKUK — ikkala songa ham qoldiqsiz bo'linadigan eng kichik son."),
        explain: tr(`${a} = ${k} · ${m}, ${b} = ${k} · ${n}. НОК = ${k} · ${m} · ${n} = ${lcm}.`, `${a} = ${k} · ${m}, ${b} = ${k} · ${n}. EKUK = ${k} · ${m} · ${n} = ${lcm}.`) };
    } },
    { id: 'percent', g: [5, 9], name: ['Проценты', 'Foizlar'], gen() {
      const p = pick([10, 20, 25, 50, 5, 75, 30, 1, 15]), step = 100 / gcd(p, 100);
      const lo = Math.ceil(20 / step), base = step * rnd(lo, Math.max(lo + 1, Math.floor(600 / step))), ans = (base * p) / 100;
      return { q: tr(`Найди ${p}% от числа ${base}.`, `${base} sonining ${p} foizini top.`), ...numChoice(ans, [(base * p) / 10, base - ans, ans + p, ans * 2, base / p]),
        rule: tr('1% — это сотая часть числа. Чтобы найти p%, умножь число на p и раздели на 100. 50% — половина, 25% — четверть, 10% — десятая часть.', "1% — sonning yuzdan bir qismi. p% ni topish uchun sonni p ga ko'paytirib, 100 ga bo'l. 50% — yarmi, 25% — choragi, 10% — o'ndan biri."),
        explain: M(`${base} \\cdot ${p} : 100 = ${base * p} : 100 = ${ans}`) };
    } },
    { id: 'neg', g: [6, 8], name: ['Отрицательные числа', 'Manfiy sonlar'], gen() {
      const kind = rnd(0, 3);
      if (kind <= 1) {
        const a = rnd(2, 15); let b = rnd(2, 15);
        if (kind === 0) {
          if (b === a) b += 1;
          const ans = b - a;
          return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`-${a} + ${b}`)}`, ...numChoice(ans, [-ans, a + b, -(a + b), ans + 1, ans - 1], '', true),
            rule: tr('Числа с разными знаками: из большего модуля вычти меньший и поставь знак числа с большим модулем.', "Ishoralari har xil sonlar: katta moduldan kichigini ayir va moduli katta sonning ishorasini qo'y."),
            explain: M(b < a ? `-${a} + ${b} = -(${a} - ${b}) = ${ans}` : `-${a} + ${b} = ${b} - ${a} = ${ans}`) };
        }
        const ans = -(a + b);
        return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`-${a} - ${b}`)}`, ...numChoice(ans, [a + b, b - a, a - b, ans + 1, ans - 1], '', true),
          rule: tr('Два отрицательных числа складывают как обычные и ставят минус: $-3 - 4 = -7$.', "Ikki manfiy son odatdagidek qo'shiladi va minus qo'yiladi: $-3 - 4 = -7$."),
          explain: M(`-${a} - ${b} = -(${a} + ${b}) = ${ans}`) };
      }
      const a = rnd(2, 9), b = rnd(2, 9), both = kind === 2, ans = both ? a * b : -a * b;
      const expr = both ? `(-${a}) \\cdot (-${b})` : `(-${a}) \\cdot ${b}`;
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(expr)}`, ...numChoice(ans, [-ans, ans + 1, ans - 1, both ? -(a + b) : a + b], '', true),
        rule: tr('Минус на минус даёт плюс, минус на плюс — минус.', "Minusni minusga ko'paytirsak — plyus, minusni plyusga — minus."),
        explain: M(`${expr} = ${ans}`) };
    } },
    { id: 'fracDiff', g: [6, 7], name: ['Дроби с разными знаменателями', 'Maxrajlari har xil kasrlar'], gen() {
      const D = [2, 3, 4, 5, 6, 8, 10, 12];
      let a = 1, b = 2, c = 1, d = 3, L = 6, num = 5;
      for (let tries = 0; tries < 200; tries++) {
        b = pick(D); d = pick(D);
        if (b === d) continue;
        a = rnd(1, b - 1); c = rnd(1, d - 1);
        if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue;
        L = (b * d) / gcd(b, d); num = (a * L) / b + (c * L) / d;
        if (num < L && L <= 24) break;
      }
      const g2 = gcd(num, L), P = num / g2, Q = L / g2;
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`\\frac{${a}}{${b}} + \\frac{${c}}{${d}}`)}`,
        ...fracChoice([P, Q], [[a + c, b + d], [a + c, L], [a * c, b * d], [P + 1, Q]]),
        rule: tr('Приведи дроби к общему знаменателю (НОК знаменателей), потом сложи числители. Знаменатели между собой не складывают!', "Kasrlarni umumiy maxrajga (maxrajlarning EKUKi) keltir, keyin suratlarni qo'sh. Maxrajlar o'zaro qo'shilmaydi!"),
        explain: M(`\\frac{${a}}{${b}} + \\frac{${c}}{${d}} = \\frac{${(a * L) / b}}{${L}} + \\frac{${(c * L) / d}}{${L}} = \\frac{${num}}{${L}}${g2 > 1 ? ` = \\frac{${P}}{${Q}}` : ''}`) };
    } },
    { id: 'prop', g: [6, 7], name: ['Пропорции', 'Proporsiyalar'], gen() {
      const a = rnd(2, 9), m = rnd(2, 6), b = rnd(2, 12), c = a * m, x = b * m;
      return { q: `${tr('Найди x из пропорции', 'Proporsiyadan x ni top')}: ${M(`${a} : ${b} = ${c} : x`)}`, ...numChoice(x, [b + c - a, x + m, x - m, (c * a) / b, a * c]),
        rule: tr('Произведение крайних членов пропорции равно произведению средних: для $a : b = c : x$ получаем $a \\cdot x = b \\cdot c$.', "Proporsiyaning chetki hadlari ko'paytmasi o'rta hadlari ko'paytmasiga teng: $a : b = c : x$ uchun $a \\cdot x = b \\cdot c$."),
        explain: M(`${a} \\cdot x = ${b} \\cdot ${c}, \\; x = \\dfrac{${b} \\cdot ${c}}{${a}} = ${x}`) };
    } },
    { id: 'powers', g: [7, 10], name: ['Степени', 'Darajalar'], gen() {
      if (Math.random() < 0.5) {
        const b = rnd(2, 5), e = rnd(2, { 2: 8, 3: 5, 4: 4, 5: 3 }[b]), v = b ** e;
        return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`${b}^{${e}}`)}`, ...numChoice(v, [b * e, b ** (e - 1), b ** (e + 1), e ** b, v + b]),
          rule: tr('Степень — это произведение одинаковых множителей: $a^3 = a \\cdot a \\cdot a$. Не путай с умножением: $2^3 = 8$, а не 6.', "Daraja — bir xil ko'paytuvchilar ko'paytmasi: $a^3 = a \\cdot a \\cdot a$. Ko'paytirish bilan adashtirma: $2^3 = 8$, 6 emas."),
          explain: M(`${b}^{${e}} = ${Array(e).fill(b).join(' \\cdot ')} = ${v}`) };
      }
      const kind = rnd(0, 2), n = rnd(2, 7), m = kind === 1 ? n + rnd(1, 6) : rnd(2, 9);
      const [expr, op, ans, wrong, rule] = [
        [`a^{${m}} \\cdot a^{${n}}`, '+', m + n, m * n, tr('При умножении степеней с одинаковым основанием показатели складываются: $a^m \\cdot a^n = a^{m+n}$.', "Asoslari bir xil darajalar ko'paytirilganda ko'rsatkichlar qo'shiladi: $a^m \\cdot a^n = a^{m+n}$.")],
        [`a^{${m}} : a^{${n}}`, '-', m - n, m + n, tr('При делении степеней с одинаковым основанием показатели вычитаются: $a^m : a^n = a^{m-n}$.', "Asoslari bir xil darajalar bo'linganda ko'rsatkichlar ayiriladi: $a^m : a^n = a^{m-n}$.")],
        [`(a^{${m}})^{${n}}`, '\\cdot', m * n, m + n, tr('При возведении степени в степень показатели перемножаются: $(a^m)^n = a^{mn}$.', "Darajani darajaga ko'targanda ko'rsatkichlar ko'paytiriladi: $(a^m)^n = a^{mn}$.")],
      ][kind];
      return { q: `${tr('Найди показатель', "Ko'rsatkichni top")}: ${M(`${expr} = a^{?}`)}`, ...numChoice(ans, [wrong, ans + 1, ans - 1, m]),
        rule, explain: M(`${expr} = a^{${m} ${op} ${n}} = a^{${ans}}`) };
    } },
    { id: 'lin', g: [7, 10], name: ['Линейные уравнения', 'Chiziqli tenglamalar'], gen() {
      let x, a, b;
      do { x = rnd(-6, 12); a = rnd(2, 9); b = rnd(-20, 20); } while (x === 0 || b === 0);
      const c = a * x + b, sb = b < 0 ? '-' : '+', inv = b < 0 ? '+' : '-';
      return { q: `${tr('Реши уравнение', 'Tenglamani yech')}: ${M(`${a}x ${sb} ${Math.abs(b)} = ${c}`)}`, ...numChoice(x, [(c + b) / a, -x, x + 1, x - 1, c - b], '', true),
        rule: tr('Перенеси число в другую часть, поменяв знак, а потом раздели обе части на коэффициент при x.', "Sonni ishorasini o'zgartirib boshqa tomonga o'tkaz, keyin ikkala tomonni x oldidagi koeffitsiyentga bo'l."),
        explain: M(`${a}x = ${c} ${inv} ${Math.abs(b)} = ${c - b}, \\; x = ${c - b} : ${a} = ${x}`) };
    } },
    { id: 'sqf', g: [7, 9], name: ['Формулы сокращённого умножения', "Qisqa ko'paytirish formulalari"], gen() {
      const a = rnd(3, 9), a2 = a * a, a2x = 2 * a;
      const kind = rnd(0, 2);
      const P = (s) => M(s);
      if (kind === 0) {
        return { q: `${tr('Раскрой скобки', 'Qavslarni och')}: ${M(`(x + ${a})^2`)}`,
          ...strChoice(P(`x^2 + ${a2x}x + ${a2}`), [P(`x^2 + ${a2}`), P(`x^2 + ${a}x + ${a2}`), P(`x^2 - ${a2x}x + ${a2}`)]),
          rule: M('(a + b)^2 = a^2 + 2ab + b^2'), explain: M(`(x + ${a})^2 = x^2 + 2 \\cdot x \\cdot ${a} + ${a}^2 = x^2 + ${a2x}x + ${a2}`) };
      }
      if (kind === 1) {
        return { q: `${tr('Раскрой скобки', 'Qavslarni och')}: ${M(`(x - ${a})^2`)}`,
          ...strChoice(P(`x^2 - ${a2x}x + ${a2}`), [P(`x^2 - ${a2}`), P(`x^2 + ${a2x}x + ${a2}`), P(`x^2 - ${a2x}x - ${a2}`)]),
          rule: M('(a - b)^2 = a^2 - 2ab + b^2'), explain: M(`(x - ${a})^2 = x^2 - 2 \\cdot x \\cdot ${a} + ${a}^2 = x^2 - ${a2x}x + ${a2}`) };
      }
      return { q: `${tr('Раскрой скобки', 'Qavslarni och')}: ${M(`(x - ${a})(x + ${a})`)}`,
        ...strChoice(P(`x^2 - ${a2}`), [P(`x^2 + ${a2}`), P(`x^2 - ${a2x}x + ${a2}`), P(`x^2 - ${a2x}`)]),
        rule: M('(a - b)(a + b) = a^2 - b^2'), explain: M(`(x - ${a})(x + ${a}) = x^2 - ${a}^2 = x^2 - ${a2}`) };
    } },
    { id: 'roots', g: [8, 9], name: ['Квадратные корни', 'Kvadrat ildizlar'], gen(g) {
      const rule = tr('$\\sqrt{a} = b$, если $b \\ge 0$ и $b^2 = a$. Корень из произведения: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.', "$\\sqrt{a} = b$, agar $b \\ge 0$ va $b^2 = a$ bo'lsa. Ko'paytmaning ildizi: $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.");
      if (Math.random() < 0.7) {
        const n = rnd(4, g >= 9 ? 25 : 15);
        return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`\\sqrt{${n * n}}`)}`, ...numChoice(n, [(n * n) / 2, n + 1, n - 1, 2 * n, n + 2]), rule,
          explain: `${M(`${n}^2 = ${n * n}`)}, ${tr('значит', 'demak')} ${M(`\\sqrt{${n * n}} = ${n}`)}` };
      }
      const [a, b, r] = pick([[2, 8, 4], [3, 12, 6], [2, 18, 6], [5, 20, 10], [3, 27, 9], [2, 32, 8], [2, 50, 10], [3, 48, 12]]);
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`\\sqrt{${a}} \\cdot \\sqrt{${b}}`)}`, ...numChoice(r, [r + 1, r - 1, r * 2, (a * b) / 2]), rule,
        explain: M(`\\sqrt{${a}} \\cdot \\sqrt{${b}} = \\sqrt{${a * b}} = ${r}`) };
    } },
    { id: 'pyth', g: [8, 9], name: ['Теорема Пифагора', 'Pifagor teoremasi'], gen() {
      const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
      const rule = tr('Теорема Пифагора: $c^2 = a^2 + b^2$, где c — гипотенуза (сторона напротив прямого угла).', "Pifagor teoremasi: $c^2 = a^2 + b^2$, bu yerda c — gipotenuza (to'g'ri burchak qarshisidagi tomon).");
      if (Math.random() < 0.5) {
        return { q: tr(`Катеты прямоугольного треугольника равны ${a} и ${b}. Найди гипотенузу.`, `To'g'ri burchakli uchburchakning katetlari ${a} va ${b} ga teng. Gipotenuzani top.`),
          ...numChoice(c, [a + b, c + 1, c - 1, c + 2]), rule,
          explain: M(`c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}, \\; c = ${c}`) };
      }
      return { q: tr(`Гипотенуза прямоугольного треугольника равна ${c}, один катет — ${a}. Найди другой катет.`, `To'g'ri burchakli uchburchakning gipotenuzasi ${c} ga, bir kateti ${a} ga teng. Ikkinchi katetni top.`),
        ...numChoice(b, [c - a, c + a, b + 1, b - 1]), rule,
        explain: M(`b^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b * b}, \\; b = ${b}`) };
    } },
    { id: 'quad', g: [8, 11], name: ['Квадратные уравнения', 'Kvadrat tenglamalar'], gen() {
      let r1, r2;
      do { r1 = rnd(-6, 8); r2 = rnd(-6, 8); } while (r1 === r2 || !r1 || !r2);
      if (r1 > r2) [r1, r2] = [r2, r1];
      const s = r1 + r2, p = r1 * r2;
      const xTerm = s === 0 ? '' : ` ${-s > 0 ? '+' : '-'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}x`;
      const eq = `x^2${xTerm} ${p < 0 ? '-' : '+'} ${Math.abs(p)} = 0`;
      const pair = (u, v) => (u === v ? null : M(`x_1 = ${Math.min(u, v)}, \\; x_2 = ${Math.max(u, v)}`));
      return { q: `${tr('Реши уравнение', 'Tenglamani yech')}: ${M(eq)}`,
        ...strChoice(pair(r1, r2), [pair(-r1, -r2), pair(r1, -r2), pair(-r1, r2), pair(r1 + 1, r2 + 1), pair(r1 - 1, r2 - 1), pair(r1, r2 + 2), pair(r1 - 2, r2)]),
        rule: tr('Для $x^2 + px + q = 0$ по теореме Виета: $x_1 + x_2 = -p$, $x_1 \\cdot x_2 = q$. Можно решить и через дискриминант $D = p^2 - 4q$.', "$x^2 + px + q = 0$ uchun Viyet teoremasi: $x_1 + x_2 = -p$, $x_1 \\cdot x_2 = q$. Diskriminant orqali ham yechish mumkin: $D = p^2 - 4q$."),
        explain: `${tr('По теореме Виета', "Viyet teoremasiga ko'ra")}: ${M(`x_1 + x_2 = ${s}`)}, ${M(`x_1 \\cdot x_2 = ${p}`)}. ${tr(`Подходят числа ${fmt(r1)} и ${fmt(r2)}.`, `${fmt(r1)} va ${fmt(r2)} sonlari mos keladi.`)}` };
    } },
    { id: 'pctChange', g: [8, 11], name: ['Задачи на проценты', 'Foizga oid masalalar'], gen() {
      const price = pick([20000, 40000, 50000, 60000, 80000, 120000, 150000, 200000]), p = pick([5, 10, 15, 20, 25, 30]);
      const up = Math.random() < 0.5, delta = (price * p) / 100, nw = up ? price + delta : price - delta, cur = tr(' сум', " so'm");
      return { q: tr(`Товар стоил ${fmt(price)} сум. Цену ${up ? 'повысили' : 'снизили'} на ${p}%. Сколько он стоит теперь?`, `Mahsulot ${fmt(price)} so'm turardi. Narxi ${p}% ga ${up ? 'oshirildi' : 'tushirildi'}. Endi u qancha turadi?`),
        ...numChoice(nw, [up ? price - delta : price + delta, delta, up ? price + 2 * delta : price - 2 * delta], cur, false, 1000),
        rule: tr('Сначала найди, сколько составляют проценты: число × p : 100. Потом прибавь (цена выросла) или вычти (цена снизилась).', "Avval foiz qancha ekanini top: son × p : 100. Keyin qo'sh (narx oshsa) yoki ayir (narx tushsa)."),
        explain: tr(`${p}% от ${fmt(price)} = ${fmt(price)} × ${p} : 100 = ${fmt(delta)} сум. ${fmt(price)} ${up ? '+' : '−'} ${fmt(delta)} = ${fmt(nw)} сум.`, `${fmt(price)} ning ${p}% i = ${fmt(price)} × ${p} : 100 = ${fmt(delta)} so'm. ${fmt(price)} ${up ? '+' : '−'} ${fmt(delta)} = ${fmt(nw)} so'm.`) };
    } },
    { id: 'aprog', g: [9, 11], name: ['Арифметическая прогрессия', 'Arifmetik progressiya'], gen() {
      const a1 = rnd(-5, 12), d = pick([-4, -3, -2, 2, 3, 4, 5, 6, 7]), n = rnd(5, 15), an = a1 + (n - 1) * d;
      return { q: tr(`Арифметическая прогрессия: ${M(`a_1 = ${a1}`)}, ${M(`d = ${d}`)}. Найди ${M(`a_{${n}}`)}.`, `Arifmetik progressiya: ${M(`a_1 = ${a1}`)}, ${M(`d = ${d}`)}. ${M(`a_{${n}}`)} ni top.`),
        ...numChoice(an, [a1 + n * d, an + d, an - d, a1 + n - 1 + d], '', true),
        rule: tr('Формула n-го члена: $a_n = a_1 + (n - 1) \\cdot d$.', 'n-hadi formulasi: $a_n = a_1 + (n - 1) \\cdot d$.'),
        explain: M(`a_{${n}} = ${a1} + (${n} - 1) \\cdot ${d < 0 ? `(${d})` : d} = ${an}`) };
    } },
    { id: 'gprog', g: [9, 9], name: ['Геометрическая прогрессия', 'Geometrik progressiya'], gen() {
      const b1 = rnd(1, 5), q = pick([2, 3, -2]), n = rnd(3, q === 3 ? 5 : 6), bn = b1 * q ** (n - 1), qs = q < 0 ? `(${q})` : q;
      return { q: tr(`Геометрическая прогрессия: ${M(`b_1 = ${b1}`)}, ${M(`q = ${q}`)}. Найди ${M(`b_{${n}}`)}.`, `Geometrik progressiya: ${M(`b_1 = ${b1}`)}, ${M(`q = ${q}`)}. ${M(`b_{${n}}`)} ni top.`),
        ...numChoice(bn, [b1 * q ** n, b1 * q * (n - 1), -bn, b1 + (n - 1) * q], '', true),
        rule: tr('Формула n-го члена: $b_n = b_1 \\cdot q^{n-1}$.', 'n-hadi formulasi: $b_n = b_1 \\cdot q^{n-1}$.'),
        explain: M(`b_{${n}} = ${b1} \\cdot ${qs}^{${n - 1}} = ${bn}`) };
    } },
    { id: 'trig', g: [9, 11], name: ['Тригонометрия', 'Trigonometriya'], gen() {
      const half = '\\frac{1}{2}', s2 = '\\frac{\\sqrt{2}}{2}', s3 = '\\frac{\\sqrt{3}}{2}', t3 = '\\frac{\\sqrt{3}}{3}', r3 = '\\sqrt{3}', tg = '\\operatorname{tg}';
      const T = [['\\sin', 0, '0'], ['\\sin', 30, half], ['\\sin', 45, s2], ['\\sin', 60, s3], ['\\sin', 90, '1'], ['\\cos', 0, '1'], ['\\cos', 30, s3], ['\\cos', 45, s2], ['\\cos', 60, half], ['\\cos', 90, '0'], [tg, 30, t3], [tg, 45, '1'], [tg, 60, r3]];
      const [fn, ang, val] = pick(T);
      const f = `${fn} ${ang}^\\circ`;
      return { q: tr(`Чему равен ${M(f)}?`, `${M(f)} nechaga teng?`), ...strChoice(M(val), ['0', half, s2, s3, '1', r3].map(M)),
        rule: tr('Таблица: $\\sin 30^\\circ = \\cos 60^\\circ = \\frac{1}{2}$, $\\sin 45^\\circ = \\cos 45^\\circ = \\frac{\\sqrt{2}}{2}$, $\\sin 60^\\circ = \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$, $\\operatorname{tg} 45^\\circ = 1$.', 'Jadval: $\\sin 30^\\circ = \\cos 60^\\circ = \\frac{1}{2}$, $\\sin 45^\\circ = \\cos 45^\\circ = \\frac{\\sqrt{2}}{2}$, $\\sin 60^\\circ = \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$, $\\operatorname{tg} 45^\\circ = 1$.'),
        explain: M(`${f} = ${val}`) };
    } },
    { id: 'log', g: [10, 11], name: ['Логарифмы', 'Logarifmlar'], gen() {
      const b = pick([2, 3, 5, 10]), e = rnd(1, { 2: 6, 3: 4, 5: 3, 10: 4 }[b]), neg = Math.random() < 0.2;
      const arg = neg ? `\\frac{1}{${b ** e}}` : `${b ** e}`, ans = neg ? -e : e;
      return { q: `${tr('Вычисли', 'Hisobla')}: ${M(`\\log_{${b}} ${arg}`)}`, ...numChoice(ans, [-ans, ans + 1, ans - 1, b * e], '', true),
        rule: tr('$\\log_a b = c$, если $a^c = b$. Логарифм отвечает на вопрос: в какую степень нужно возвести a, чтобы получить b.', "$\\log_a b = c$, agar $a^c = b$ bo'lsa. Logarifm b ni hosil qilish uchun a ni qaysi darajaga ko'tarish kerakligini bildiradi."),
        explain: `${M(`${b}^{${ans}} = ${arg}`)}, ${tr('значит', 'demak')} ${M(`\\log_{${b}} ${arg} = ${ans}`)}` };
    } },
    { id: 'deriv', g: [10, 11], name: ['Производная', 'Hosila'], gen() {
      const k = rnd(2, 9), n = rnd(2, 5);
      const P = (c, p) => (p === 0 ? `${c}` : `${c === 1 ? '' : c}x${p === 1 ? '' : `^{${p}}`}`);
      return { q: `${tr('Найди производную', 'Hosilani top')}: ${M(`f(x) = ${P(k, n)}`)}`,
        ...strChoice(M(P(k * n, n - 1)), [P(k, n - 1), P(k * n, n), P(n, n - 1), P(k * (n - 1), n - 1), P(k * n + k, n - 1)].map(M)),
        rule: tr("$(x^n)' = n \\cdot x^{n-1}$, $(k \\cdot f)' = k \\cdot f'$: показатель выходит множителем вперёд и уменьшается на 1.", "$(x^n)' = n \\cdot x^{n-1}$, $(k \\cdot f)' = k \\cdot f'$: ko'rsatkich oldinga ko'paytuvchi bo'lib chiqadi va 1 ga kamayadi."),
        explain: M(`f'(x) = ${k} \\cdot ${n} ${P(1, n - 1)} = ${P(k * n, n - 1)}`) };
    } },
  ];
  const mathPool = (g) => MATH.filter((t) => g >= t.g[0] && g <= t.g[1]);

  // ---------- English: words and grammar (no AI) ----------
  // [english, russian, uzbek, level 1-3, example]
  const WORDS = [
    ['cat', 'кошка', 'mushuk', 1, 'The cat is sleeping.'], ['dog', 'собака', 'it', 1, 'My dog can run fast.'], ['bird', 'птица', 'qush', 1, 'A bird can fly.'],
    ['fish', 'рыба', 'baliq', 1, 'The fish lives in water.'], ['horse', 'лошадь', 'ot', 1, 'The horse is big and strong.'], ['cow', 'корова', 'sigir', 1, 'The cow gives milk.'],
    ['rabbit', 'кролик', 'quyon', 1, 'The rabbit likes carrots.'], ['red', 'красный', 'qizil', 1, 'The apple is red.'], ['blue', 'синий', "ko'k", 1, 'The sky is blue.'],
    ['green', 'зелёный', 'yashil', 1, 'The grass is green.'], ['yellow', 'жёлтый', 'sariq', 1, 'The sun is yellow.'], ['white', 'белый', 'oq', 1, 'Snow is white.'],
    ['black', 'чёрный', 'qora', 1, 'My bag is black.'], ['mother', 'мама', 'ona', 1, 'My mother is kind.'], ['father', 'папа', 'ota', 1, 'My father is tall.'],
    ['grandmother', 'бабушка', 'buvi', 1, 'My grandmother tells stories.'], ['friend', 'друг', "do'st", 1, 'He is my best friend.'], ['apple', 'яблоко', 'olma', 1, 'I eat an apple.'],
    ['bread', 'хлеб', 'non', 1, 'We buy bread every day.'], ['milk', 'молоко', 'sut', 1, 'I drink milk.'], ['water', 'вода', 'suv', 1, 'Drink some water.'],
    ['egg', 'яйцо', 'tuxum', 1, 'I have an egg for breakfast.'], ['book', 'книга', 'kitob', 1, 'This book is interesting.'], ['pen', 'ручка', 'ruchka', 1, 'I write with a pen.'],
    ['pencil', 'карандаш', 'qalam', 1, 'Give me a pencil, please.'], ['school', 'школа', 'maktab', 1, 'I go to school.'], ['teacher', 'учитель', "o'qituvchi", 1, 'Our teacher is kind.'],
    ['house', 'дом', 'uy', 1, 'This is my house.'], ['sun', 'солнце', 'quyosh', 1, 'The sun is hot.'], ['tree', 'дерево', 'daraxt', 1, 'The tree is tall.'],
    ['flower', 'цветок', 'gul', 1, 'This flower is beautiful.'], ['hand', 'рука', "qo'l", 1, 'Raise your hand.'], ['eye', 'глаз', "ko'z", 1, 'I have two eyes.'],
    ['big', 'большой', 'katta', 1, 'An elephant is big.'], ['small', 'маленький', 'kichik', 1, 'A mouse is small.'], ['happy', 'счастливый', 'xursand', 1, 'I am happy today.'],
    ['run', 'бегать', 'yugurmoq', 2, 'I run in the park.'], ['swim', 'плавать', 'suzmoq', 2, 'Fish can swim.'], ['read', 'читать', "o'qimoq", 2, 'I like to read books.'],
    ['write', 'писать', 'yozmoq', 2, 'Write your name here.'], ['sleep', 'спать', 'uxlamoq', 2, 'Babies sleep a lot.'], ['buy', 'покупать', 'sotib olmoq', 2, 'I want to buy a ball.'],
    ['help', 'помогать', 'yordam bermoq', 2, 'Can you help me?'], ['open', 'открывать', 'ochmoq', 2, 'Open the door, please.'], ['close', 'закрывать', 'yopmoq', 2, 'Close the window.'],
    ['answer', 'ответ', 'javob', 2, 'Your answer is correct.'], ['question', 'вопрос', 'savol', 2, 'I have a question.'], ['weather', 'погода', 'ob-havo', 2, 'The weather is nice today.'],
    ['winter', 'зима', 'qish', 2, 'It is cold in winter.'], ['summer', 'лето', 'yoz', 2, 'We swim in summer.'], ['river', 'река', 'daryo', 2, 'The river is long.'],
    ['mountain', 'гора', "tog'", 2, 'This mountain is very high.'], ['city', 'город', 'shahar', 2, 'Tashkent is a big city.'], ['village', 'деревня', 'qishloq', 2, 'My grandparents live in a village.'],
    ['kitchen', 'кухня', 'oshxona', 2, 'Mom is in the kitchen.'], ['window', 'окно', 'deraza', 2, 'Look out of the window.'], ['door', 'дверь', 'eshik', 2, 'Please close the door.'],
    ['breakfast', 'завтрак', 'nonushta', 2, 'I have breakfast at seven.'], ['hungry', 'голодный', 'och', 2, 'I am hungry.'], ['tired', 'уставший', 'charchagan', 2, 'I am tired after school.'],
    ['quickly', 'быстро', 'tez', 2, 'He runs quickly.'], ['always', 'всегда', 'doim', 2, 'I always do my homework.'], ['yesterday', 'вчера', 'kecha', 2, 'I was at home yesterday.'],
    ['tomorrow', 'завтра', 'ertaga', 2, 'See you tomorrow!'], ['beautiful', 'красивый', 'chiroyli', 2, 'What a beautiful day!'], ['difficult', 'трудный', 'qiyin', 2, 'This task is difficult.'],
    ['easy', 'лёгкий', 'oson', 2, 'The test was easy.'], ['knowledge', 'знания', 'bilim', 3, 'Knowledge is power.'], ['experience', 'опыт', 'tajriba', 3, 'She has a lot of experience.'],
    ['environment', 'окружающая среда', 'atrof-muhit', 3, 'We must protect the environment.'], ['achieve', 'достигать', 'erishmoq', 3, 'You can achieve your goals.'],
    ['improve', 'улучшать', 'yaxshilamoq', 3, 'I want to improve my English.'], ['explain', 'объяснять', 'tushuntirmoq', 3, 'Can you explain this rule?'],
    ['compare', 'сравнивать', 'solishtirmoq', 3, 'Compare these two pictures.'], ['believe', 'верить', 'ishonmoq', 3, 'I believe in you.'],
    ['opportunity', 'возможность', 'imkoniyat', 3, 'This is a great opportunity.'], ['important', 'важный', 'muhim', 3, 'Sleep is important for health.'],
    ['necessary', 'необходимый', 'zarur', 3, 'Water is necessary for life.'], ['healthy', 'здоровый', "sog'lom", 3, 'Eat healthy food.'],
    ['patient', 'терпеливый', 'sabrli', 3, 'Be patient with your little brother.'], ['future', 'будущее', 'kelajak', 3, 'I often think about my future.'],
    ['success', 'успех', 'muvaffaqiyat', 3, 'Hard work leads to success.'], ['science', 'наука', 'fan', 3, 'I am interested in science.'],
    ['develop', 'развивать', 'rivojlantirmoq', 3, 'Reading develops your mind.'], ['suddenly', 'вдруг', "to'satdan", 3, 'Suddenly, it started to rain.'],
    ['skill', 'навык', "ko'nikma", 3, 'Reading is an important skill.'], ['advice', 'совет', 'maslahat', 3, 'Thank you for your advice.'],
    ['journey', 'путешествие', 'sayohat', 3, 'The journey was long but fun.'], ['neighbour', 'сосед', "qo'shni", 3, 'My neighbour has a dog.'],
    ['however', 'однако', 'biroq', 3, 'It was late. However, we continued.'], ['increase', 'увеличивать', 'oshirmoq', 3, 'We need to increase our speed.'],
  ];
  // [level, sentence, right, wrong options, rule ru, rule uz]
  const GRAMMAR = [
    [2, 'She ___ to school every day.', 'goes', ['go', 'going', 'gone'], 'В Present Simple с he / she / it к глаголу добавляется -s или -es: she goes.', "Present Simple'da he / she / it bilan fe'lga -s yoki -es qo'shiladi: she goes."],
    [2, 'I ___ a student.', 'am', ['is', 'are', 'be'], 'Глагол to be: I am, he / she / it is, we / you / they are.', "to be fe'li: I am, he / she / it is, we / you / they are."],
    [2, 'They ___ football now.', 'are playing', ['play', 'plays', 'is playing'], 'Present Continuous (действие идёт сейчас): am / is / are + глагол с -ing.', "Present Continuous (harakat hozir bo'lyapti): am / is / are + -ing qo'shilgan fe'l."],
    [2, 'Yesterday we ___ to the park.', 'went', ['go', 'goes', 'going'], 'Past Simple (вчера, в прошлом). У go прошедшая форма неправильная: went.', "Past Simple (kecha, o'tmishda). go fe'lining o'tgan zamon shakli noto'g'ri: went."],
    [2, 'There ___ three apples on the table.', 'are', ['is', 'am', 'be'], 'There is — когда предмет один, there are — когда их несколько.', "There is — narsa bitta bo'lsa, there are — bir nechta bo'lsa."],
    [2, 'This is ___ apple.', 'an', ['a', 'these'], 'Перед словом, которое начинается с гласного звука, ставят an: an apple, an egg.', "Unli tovush bilan boshlanadigan so'z oldidan an qo'yiladi: an apple, an egg."],
    [2, 'My brother is ___ than me.', 'taller', ['tall', 'tallest', 'more tall'], 'Сравнение коротких прилагательных: + -er и than: tall → taller than.', "Qisqa sifatlarni qiyoslash: + -er va than: tall → taller than."],
    [2, 'It is the ___ day of the year.', 'hottest', ['hotter', 'hot', 'most hot'], 'Превосходная степень: the + прилагательное с -est: hot → the hottest.', "Orttirma daraja: the + -est qo'shilgan sifat: hot → the hottest."],
    [2, 'He ___ TV every evening.', 'watches', ['watch', 'watching', 'to watch'], 'После ch, sh, s, x в Present Simple с he / she / it добавляется -es: watches.', "ch, sh, s, x dan keyin he / she / it bilan -es qo'shiladi: watches."],
    [2, '___ you like ice cream?', 'Do', ['Does', 'Are', 'Is'], 'Вопрос в Present Simple: Do + I / you / we / they, Does + he / she / it.', "Present Simple'da so'roq: Do + I / you / we / they, Does + he / she / it."],
    [2, 'She ___ like coffee.', "doesn't", ["don't", "isn't", 'not'], "Отрицание с he / she / it: doesn't + глагол без -s.", "he / she / it bilan inkor: doesn't + -s siz fe'l."],
    [2, 'He can ___ very fast.', 'run', ['runs', 'running', 'to run'], 'После can глагол стоит без to и без -s: he can run.', "can dan keyin fe'l to siz va -s siz keladi: he can run."],
    [2, 'These are my friends. ___ names are Ali and Tom.', 'Their', ['There', 'They', 'Them'], 'their — «их» (чьи?), there — «там», they — «они».', 'their — «ularning», there — «u yerda», they — «ular».'],
    [2, 'How ___ apples do you need?', 'many', ['much', 'any'], 'many — с тем, что можно посчитать (apples), much — с тем, что нельзя (water, milk).', "many — sanaladigan narsalar bilan (apples), much — sanalmaydiganlar bilan (water, milk)."],
    [2, 'Look! The baby ___.', 'is sleeping', ['sleeps', 'sleep', 'slept'], 'Look! / Listen! / now — признаки Present Continuous: is sleeping.', "Look! / Listen! / now — Present Continuous belgilari: is sleeping."],
    [2, 'She is good ___ math.', 'at', ['in', 'on', 'for'], 'Запомни сочетание: good at — хорошо получается что-то: good at math.', "Birikmani yodla: good at — biror narsani yaxshi bilmoq: good at math."],
    [3, 'I have already ___ my homework.', 'done', ['did', 'do', 'doing'], 'Present Perfect: have / has + третья форма глагола: do — did — done.', "Present Perfect: have / has + fe'lning uchinchi shakli: do — did — done."],
    [3, 'If it rains, we ___ at home.', 'will stay', ['stayed', 'staying', 'stays'], 'Условие о будущем: If + Present Simple, а в главной части will + глагол.', "Kelajak haqidagi shart: If + Present Simple, bosh qismda will + fe'l."],
    [3, 'The letter ___ yesterday.', 'was written', ['wrote', 'is writing', 'writes'], 'Пассив в прошлом: was / were + третья форма глагола: was written.', "O'tgan zamon majhul nisbati: was / were + fe'lning uchinchi shakli: was written."],
    [3, 'We ___ in Tashkent since 2015.', 'have lived', ['live', 'lived', 'are living'], 'Since / for (с какого-то времени и до сих пор) — Present Perfect: have lived.', "Since / for (biror vaqtdan hozirgacha) — Present Perfect: have lived."],
    [3, 'I was reading when the phone ___.', 'rang', ['rings', 'ring', 'ringing'], 'Длительное действие в прошлом прервало короткое: was reading (Past Continuous) when ... rang (Past Simple).', "O'tmishdagi davomli harakatni qisqa harakat bo'ldi: was reading (Past Continuous) when ... rang (Past Simple)."],
    [3, 'He said that he ___ tired.', 'was', ['is', 'be', 'were'], 'В косвенной речи после said время сдвигается в прошлое: is → was.', "Ko'chirma gapda said dan keyin zamon o'tmishga suriladi: is → was."],
    [3, 'This is the boy ___ won the prize.', 'who', ['which', 'what', 'where'], 'who — о людях, which — о предметах и животных.', "who — odamlar haqida, which — narsalar va hayvonlar haqida."],
    [3, 'You ___ wear a helmet when you ride a bike.', 'should', ['shouldn\'t', 'can\'t', 'mustn\'t'], 'should — «следует, стоит» (совет). Отрицательные формы здесь меняют смысл на противоположный.', "should — «kerak, ma'qul» (maslahat). Inkor shakllar ma'noni teskari qiladi."],
  ];
  const enLevel = (g) => (g <= 4 ? 1 : g <= 7 ? 2 : 3);
  const EN_TOPICS = [
    { id: 'en-words', name: ['Слова', "So'zlar"] },
    { id: 'en-grammar', name: ['Грамматика', 'Grammatika'], minLevel: 2 },
  ];
  function englishQuestion(g, topicId) {
    const lvl = enLevel(g);
    if (topicId === 'en-grammar') {
      const [, s, right, wrong, ru, uz] = pick(GRAMMAR.filter((x) => x[0] <= lvl));
      return { q: `${tr('Вставь пропущенное слово', "Tushib qolgan so'zni qo'y")}:\n**${s}**`, ...strChoice(right, wrong), rule: tr(ru, uz),
        explain: `**${s.replace('___', right)}**`, speak: s.replace('___', right) };
    }
    const fresh = WORDS.filter((w) => w[3] === lvl);
    const pool = WORDS.filter((w) => w[3] <= lvl);
    const w = pick(Math.random() < 0.6 && fresh.length ? fresh : pool);
    const native = (x) => tr(x[1], x[2]);
    const others = shuffle(pool.filter((x) => x !== w)).slice(0, 6);
    const explain = `**${w[0]}** — ${native(w)}. ${tr('Пример', 'Misol')}: ${w[4]}`;
    if (Math.random() < 0.55) {
      return { q: tr(`Как переводится слово **${w[0]}**?`, `**${w[0]}** so'zi qanday tarjima qilinadi?`), ...strChoice(native(w), others.map(native)),
        rule: `${tr('Пример', 'Misol')}: ${w[4]}`, explain, speak: w[0] };
    }
    return { q: tr(`Как по-английски «${w[1]}»?`, `«${w[2]}» inglizcha qanday bo'ladi?`), ...strChoice(w[0], others.map((x) => x[0])),
      rule: tr(`Слово начинается на букву «${w[0][0]}».`, `So'z «${w[0][0]}» harfi bilan boshlanadi.`), explain, speak: w[0] };
  }

  // ---------- worlds, monsters, heroes ----------
  const WORLDS = {
    math: { emoji: '🌲', name: ['Числовой лес', "Raqamlar o'rmoni"], tint: 'from-emerald-500/20', bar: 'bg-emerald-400',
      monsters: [['🐍', 'Минус-змей', 'Minus-ilon'], ['🦇', 'Нуль-мышь', "Nol-ko'rshapalak"], ['🐺', 'Волк Ошибкин', "Xatovoy bo'ri"], ['🦂', 'Скорпион Скобка', 'Qavs-chayon'],
        ['🐊', 'Крокодил Дробь', 'Kasr-timsoh'], ['🐗', 'Кабан Счётчик', "Hisobchi to'ng'iz"], ['🦍', 'Горилла Примеров', 'Misol-gorilla'], ['🐻', 'Медведь Делитель', "Bo'luvchi ayiq"]],
      bosses: [['🐲', 'Дракон Таблицы', 'Jadval ajdari'], ['🦖', 'Тирекс Уравнений', 'Tenglama tirannozavri'], ['👹', 'Огр Задач', 'Masala devi']] },
    english: { emoji: '🏝️', name: ["Остров слов", "So'zlar oroli"], tint: 'from-sky-500/20', bar: 'bg-sky-400',
      monsters: [['🦀', 'Краб Буквоед', "Harfxo'r qisqichbaqa"], ['🐙', 'Осьминог Артикль', 'Artikl-sakkizoyoq'], ['🦈', 'Акула Слов', "So'z-akula"], ['🦑', 'Кальмар Глагол', "Fe'l-kalmar"],
        ['🐡', 'Рыба-ёж Время', 'Zamon-baliq'], ['🐢', 'Черепаха Перевод', 'Tarjima-toshbaqa'], ['🦜', 'Попугай Повторюшка', "Takrorchi to'tiqush"], ['🐋', 'Кит Произношение', 'Talaffuz-kit']],
      bosses: [['🐉', 'Морской дракон', 'Dengiz ajdari'], ['🦕', 'Динозавр Грамматики', 'Grammatika dinozavri']] },
    subject: { emoji: '🏰', name: ['Замок знаний', 'Bilimlar qasri'], tint: 'from-violet-500/20', bar: 'bg-violet-400',
      monsters: [['👻', 'Привидение Забывчивости', 'Unutuvchanlik arvohi'], ['👾', 'Пришелец Вопросов', 'Savol-maxluq'], ['🤖', 'Робот Тестов', 'Test-robot'], ['🧟', 'Зомби Лени', 'Dangasalik zombisi'],
        ['🕷️', 'Паук Путаницы', "Chalkashlik o'rgimchagi"], ['🎃', 'Тыква-Лентяйка', 'Dangasa qovoq'], ['🐸', 'Жаба Зубрилка', 'Yodlovchi qurbaqa'], ['🦎', 'Ящерица Шпаргалка', 'Shpargalka kaltakesak']],
      bosses: [['🧛', 'Граф Двоек', 'Ikkichi graf'], ['👺', 'Король Незнания', 'Bilimsizlik qiroli']] },
    cave: { emoji: '🕸️', name: ['Пещера ошибок', "Xatolar g'ori"], tint: 'from-rose-500/20', bar: 'bg-rose-400',
      monsters: [['🦠', 'Вирус Ошибок', 'Xato-virus']], bosses: [] },
  };
  const HEROES = [
    ['kid', '🧒', 0, 'Ученик', "O'quvchi"], ['cat', '🐱', 60, 'Котёнок', 'Mushukcha'], ['fox', '🦊', 120, 'Лисёнок', 'Tulkicha'],
    ['panda', '🐼', 200, 'Панда', 'Panda'], ['tiger', '🐯', 300, 'Тигр', "Yo'lbars"], ['lion', '🦁', 420, 'Лев', 'Sher'],
    ['wizard', '🧙', 560, 'Волшебник', 'Sehrgar'], ['super', '🦸', 750, 'Супергерой', 'Superqahramon'], ['unicorn', '🦄', 1000, 'Единорог', 'Yakkashox'],
  ];
  const isBoss = (lvl) => lvl % 5 === 0;
  function monsterFor(wid, lvl) {
    const W = WORLDS[wid];
    if (isBoss(lvl) && W.bosses.length) return W.bosses[(lvl / 5 - 1) % W.bosses.length];
    return W.monsters[(lvl - 1 - Math.floor((lvl - 1) / 5)) % W.monsters.length];
  }

  // ---------- texts ----------
  const TXT = {
    ru: {
      title: 'Битва с монстрами',
      card: ['Битва с монстрами', 'Отвечай верно — и монстр проиграет. Математика, английский и твой предмет.'],
      play: 'Играть',
      heroes: 'Герои',
      collection: 'Коллекция',
      chestTodo: 'Сундук дня: победи сегодня любого монстра — получишь +30 монет',
      chestDone: 'Сундук дня открыт. Новый будет завтра!',
      howTitle: 'Как играть',
      how: ['Верный ответ — удар по монстру.', 'Ошибка — монстр бьёт тебя, но ты сразу узнаёшь правило.', '3 верных ответа подряд — супер-удар.',
        'Вопрос с ошибкой вернётся через пару ходов. Ответишь верно — двойной удар.', 'Все ошибки попадают в «Пещеру ошибок». Победи их через день-два — так знания запоминаются надолго.'],
      worldDesc: { math: (g) => `Математика · ${g}`, english: () => 'Английский: слова и грамматика', subject: (s) => `${s}: вопросы от ИИ по школьной программе`, cave: (n) => (n ? `Здесь живут твои ошибки: ${n}. Победи их — и правило запомнится.` : 'Ошибок нет — отлично! Они появятся здесь, если ошибёшься в бою.') },
      level: (n) => `Уровень ${n}`,
      chapter: (n) => `Глава ${n}`,
      boss: 'Босс',
      fight: (n) => `В бой! Уровень ${n}`,
      caveFight: 'Сразиться с ошибками',
      skills: 'Что тренируем',
      skillsHint: 'Зелёный — получается, жёлтый — стоит повторить, красный — трудно. Трудные темы игра даёт чаще.',
      unlockAt: (n) => `откроется в главе ${n}`,
      locked: 'Замок знаний открывается с бесплатной неделей или подпиской.',
      hint: 'Подсказка',
      listen: 'Послушать',
      yourAnswer: 'Твой ответ',
      check: 'Ответить',
      correct: 'Верно!',
      combo: (n) => `Супер-удар! ${n} подряд`,
      fixed: 'Исправил ошибку! Двойной удар',
      wrongTitle: 'Монстр атакует!',
      rightAnswer: 'Правильный ответ',
      why: 'Как решать',
      rule: 'Правило',
      gotIt: 'Понятно, дальше',
      win: 'Победа!',
      lose: 'В этот раз монстр сильнее',
      loseText: 'Не сдавайся! Повтори правила ниже и попробуй ещё раз.',
      fled: 'Вопросы закончились, монстр убежал',
      coins: (n) => `+${n} ${plural(n, 'монета', 'монеты', 'монет')}`,
      chestBonus: 'Сундук дня: +30 монет',
      learned: 'Чему ты научился',
      fixedCount: (n) => `Исправлено ошибок: ${n}`,
      missed: 'Где были ошибки',
      repeat: 'Повтори правила',
      next: 'Следующий бой',
      again: 'Попробовать снова',
      toMap: 'К карте',
      toQuest: 'К мирам',
      loading: 'Монстр готовится к бою…',
      choose: 'Выбрать',
      chosen: 'Выбран',
      buy: (n) => `Купить · ${n}`,
      heroesText: 'Монеты дают за победы. Чем больше учишься — тем больше героев!',
      collectionText: (a, b) => `Побеждено монстров: ${a} из ${b}`,
      unknown: 'Ещё не встречался',
      times: (n) => `×${n}`,
      sound: 'Звук',
      newTopic: (s) => `Новая тема: ${s}`,
    },
    uz: {
      title: 'Maxluqlar jangi',
      card: ['Maxluqlar jangi', "To'g'ri javob ber — maxluq yengiladi. Matematika, ingliz tili va o'z faning."],
      play: "O'ynash",
      heroes: 'Qahramonlar',
      collection: 'Kolleksiya',
      chestTodo: "Kun sandig'i: bugun istalgan maxluqni yeng — +30 tanga olasan",
      chestDone: "Kun sandig'i ochildi. Yangisi ertaga!",
      howTitle: "Qanday o'ynaladi",
      how: ["To'g'ri javob — maxluqqa zarba.", "Xato — maxluq seni uradi, lekin qoidani darhol bilib olasan.", "Ketma-ket 3 ta to'g'ri javob — super zarba.",
        "Xato qilingan savol bir necha yurishdan keyin qaytadi. To'g'ri javob bersang — ikki baravar zarba.", "Barcha xatolar «Xatolar g'ori»ga tushadi. Ularni bir-ikki kundan keyin yeng — bilim uzoq esda qoladi."],
      worldDesc: { math: (g) => `Matematika · ${g}`, english: () => "Ingliz tili: so'zlar va grammatika", subject: (s) => `${s}: maktab dasturi bo'yicha sun'iy intellekt savollari`, cave: (n) => (n ? `Bu yerda xatolaring yashaydi: ${n}. Ularni yeng — qoida esda qoladi.` : "Xatolar yo'q — zo'r! Jangda xato qilsang, ular shu yerda paydo bo'ladi.") },
      level: (n) => `${n}-daraja`,
      chapter: (n) => `${n}-bob`,
      boss: 'Boss',
      fight: (n) => `Jangga! ${n}-daraja`,
      caveFight: 'Xatolar bilan jang',
      skills: 'Nimani mashq qilamiz',
      skillsHint: "Yashil — yaxshi chiqyapti, sariq — takrorlash kerak, qizil — qiyin. Qiyin mavzular ko'proq beriladi.",
      unlockAt: (n) => `${n}-bobda ochiladi`,
      locked: 'Bilimlar qasri bepul hafta yoki obuna bilan ochiladi.',
      hint: 'Maslahat',
      listen: 'Tinglash',
      yourAnswer: 'Javobing',
      check: 'Javob berish',
      correct: "To'g'ri!",
      combo: (n) => `Super zarba! Ketma-ket ${n} ta`,
      fixed: "Xatoni tuzatding! Ikki baravar zarba",
      wrongTitle: 'Maxluq hujum qildi!',
      rightAnswer: "To'g'ri javob",
      why: 'Qanday yechiladi',
      rule: 'Qoida',
      gotIt: 'Tushunarli, davom',
      win: "G'alaba!",
      lose: 'Bu safar maxluq kuchliroq',
      loseText: "Taslim bo'lma! Quyidagi qoidalarni takrorla va yana urinib ko'r.",
      fled: 'Savollar tugadi, maxluq qochib ketdi',
      coins: (n) => `+${n} tanga`,
      chestBonus: "Kun sandig'i: +30 tanga",
      learned: "Nimani o'rganding",
      fixedCount: (n) => `Tuzatilgan xatolar: ${n}`,
      missed: 'Qayerda xato bo\'ldi',
      repeat: 'Qoidalarni takrorla',
      next: 'Keyingi jang',
      again: "Yana urinib ko'rish",
      toMap: 'Xaritaga',
      toQuest: 'Olamlarga',
      loading: 'Maxluq jangga tayyorlanmoqda…',
      choose: 'Tanlash',
      chosen: 'Tanlangan',
      buy: (n) => `Sotib olish · ${n}`,
      heroesText: "Tangalar g'alabalar uchun beriladi. Qancha ko'p o'qisang — shuncha ko'p qahramon!",
      collectionText: (a, b) => `Yengilgan maxluqlar: ${a} / ${b}`,
      unknown: 'Hali uchramagan',
      times: (n) => `×${n}`,
      sound: 'Ovoz',
      newTopic: (s) => `Yangi mavzu: ${s}`,
    },
  };
  const t = (key) => TXT[N.lang][key];
  const nm = (pair) => (N.lang === 'uz' ? pair[1] : pair[0]);
  const monsterName = (m) => (N.lang === 'uz' ? m[2] : m[1]);

  // ---------- saved state (synced with the account as data.quest) ----------
  function Q() {
    const kit = K();
    const q = kit.data.quest;
    q.coins = q.coins || 0;
    q.hero = q.hero || 'kid';
    q.heroes = Array.isArray(q.heroes) ? q.heroes : ['kid'];
    q.worlds = q.worlds || {};
    q.beaten = q.beaten || {};
    q.skill = q.skill || {};
    q.mistakes = Array.isArray(q.mistakes) ? q.mistakes : [];
    return q;
  }
  const save = () => K().save('quest');
  const worldState = (wid) => {
    const q = Q();
    q.worlds[wid] = q.worlds[wid] || { lvl: 1, stars: {} };
    return q.worlds[wid];
  };
  const subjWid = () => `subject:${N.setup.subject}`;
  const heroEmoji = () => (HEROES.find((x) => x[0] === Q().hero) || HEROES[0])[1];
  const starsTotal = (ws) => Object.values(ws.stars || {}).reduce((a, b) => a + b, 0);
  const unlockedCount = (len, chapter) => Math.min(len, 4 + 2 * (chapter - 1));
  const chapterOf = (lvl) => Math.ceil(lvl / 5);

  // ---------- sound (tiny synth, no files) ----------
  let audio = null;
  const soundOn = () => N.store.get('questSound', true);
  function beep(freqs, dur = 0.09, type = 'square', vol = 0.04) {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let at = audio.currentTime;
      for (const f of freqs) {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(vol, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g);
        g.connect(audio.destination);
        o.start(at);
        o.stop(at + dur);
        at += dur * 0.85;
      }
    } catch {}
  }
  const SFX = {
    hit: () => beep([520, 780]),
    crit: () => beep([520, 780, 1040, 1320], 0.08),
    hurt: () => beep([220, 150], 0.15, 'sawtooth', 0.03),
    win: () => beep([523, 659, 784, 1047], 0.14, 'triangle', 0.07),
    lose: () => beep([392, 330, 262], 0.2, 'triangle', 0.06),
    coin: () => beep([988, 1319], 0.07, 'square', 0.025),
  };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  // ---------- question sources ----------
  // Weighted by mistakes: topics that go badly come more often.
  function pickTopic(topics) {
    const sk = Q().skill;
    const w = topics.map((tp) => { const s = sk[tp.id]; return !s || s.n < 3 ? 2 : 1 + 4 * (1 - s.ok / s.n); });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < topics.length; i++) { r -= w[i]; if (r <= 0) return topics[i]; }
    return topics[topics.length - 1];
  }
  function worldTopics(wid, chapter) {
    const g = N.setup.grade;
    if (wid === 'math') { const pool = mathPool(g); return pool.slice(0, unlockedCount(pool.length, chapter)); }
    if (wid === 'english') return EN_TOPICS.filter((x) => !x.minLevel || enLevel(g) >= x.minLevel);
    return [];
  }
  function genSource(wid, lvl) {
    const topics = worldTopics(wid, chapterOf(lvl));
    const hard = isBoss(lvl) || chapterOf(lvl) >= 3;
    let lastQ = '';
    return {
      next() {
        for (let tries = 0; tries < 6; tries++) {
          const tp = pickTopic(topics);
          const raw = wid === 'math' ? tp.gen(N.setup.grade, hard && Math.random() < 0.6) : englishQuestion(N.setup.grade, tp.id);
          if (raw.q === lastQ) continue;
          lastQ = raw.q;
          return { ...raw, kind: 'choice', w: wid, topic: tp.id, tname: nm(tp.name) };
        }
        return null;
      },
    };
  }
  function listSource(list) {
    const items = [...list];
    return { next: () => items.shift() || null, size: items.length };
  }
  const fromTask = (task, wid) => ({
    w: wid, topic: task.topic || '', tname: task.topic || '', kind: task.type === 'choice' && task.options?.length ? 'choice' : 'input',
    q: task.question, a: task.answer, opts: task.type === 'choice' ? shuffle(task.options) : null, rule: task.rule || '', explain: task.explanation || '', ai: true,
  });

  // ---------- shared pieces ----------
  const E = (emoji, cls = 'text-5xl') => K().h('span', { class: `q-emoji inline-block ${cls}`, 'aria-hidden': 'true' }, emoji);
  function coinPill() {
    const { h } = K();
    return h('span', { class: 'flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-semibold tabular-nums text-amber-200' }, E('🪙', 'text-base'), String(Q().coins));
  }
  function skillDot(id) {
    const s = Q().skill[id];
    if (!s || !s.n) return 'bg-slate-500';
    const r = s.ok / s.n;
    return r >= 0.8 && s.n >= 3 ? 'bg-emerald-400' : r >= 0.5 ? 'bg-amber-400' : 'bg-rose-400';
  }

  // ---------- quest home: worlds ----------
  function open() {
    const { h, ico, screen, titleBar, CARD, BTN2 } = K();
    const q = Q();
    const root = screen('activity');
    root.append(titleBar(t('title'), () => K().openGames()));
    root.append(h('div', { class: `${CARD} flex items-center gap-4` },
      h('span', { class: 'q-idle' }, E(heroEmoji(), 'text-6xl')),
      h('div', { class: 'flex min-w-0 flex-1 flex-col items-start gap-2' },
        coinPill(),
        h('div', { class: 'grid w-full grid-cols-2 gap-2' },
          h('button', { type: 'button', class: 'min-h-11 rounded-xl bg-night-700 px-3 text-sm font-medium text-white hover:bg-night-600', onclick: openHeroes }, t('heroes')),
          h('button', { type: 'button', class: 'min-h-11 rounded-xl bg-night-700 px-3 text-sm font-medium text-white hover:bg-night-600', onclick: openCollection }, t('collection'))))));
    const chestOpen = q.chest === N.today();
    root.append(h('div', { class: `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ${chestOpen ? 'bg-night-900/80 text-slate-400 ring-white/5' : 'bg-amber-400/10 text-amber-100 ring-amber-400/30'}` },
      E(chestOpen ? '📭' : '🎁', 'text-2xl'), h('span', { class: 'min-w-0 flex-1' }, chestOpen ? t('chestDone') : t('chestTodo'))));

    const locked = !N.hasAccess();
    const worldCard = (wid, stateKey, desc, onclick, extra) => {
      const W = WORLDS[wid];
      const ws = worldState(stateKey);
      return h('button', { type: 'button', class: `${CARD} flex items-center gap-4 bg-gradient-to-br ${W.tint} to-transparent text-left transition hover:bg-night-800 active:scale-[.99]`, onclick },
        E(W.emoji, 'text-5xl'),
        h('div', { class: 'min-w-0 flex-1' },
          h('p', { class: 'font-semibold text-white' }, nm(W.name)),
          h('p', { class: 'text-sm text-slate-400' }, desc),
          extra || h('div', { class: 'mt-2 flex items-center gap-2 text-xs text-slate-300' },
            h('span', { class: 'rounded-full bg-night-700 px-2 py-0.5' }, t('level')(ws.lvl)),
            h('span', {}, `⭐ ${starsTotal(ws)}`))),
        stateKey.startsWith('subject') && locked ? h('span', { class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-200' }, ico('lock', 'h-4 w-4')) : ico('chevron-right', 'icon shrink-0 text-slate-500'));
    };
    root.append(worldCard('math', 'math', t('worldDesc').math(N.gradeLabel(N.setup.grade)), () => openWorld('math')));
    root.append(worldCard('english', 'english', t('worldDesc').english(), () => openWorld('english')));
    root.append(worldCard('subject', subjWid(), t('worldDesc').subject(N.subjectName(N.setup.subject)), () => (locked ? K().openSubscribe() : openWorld('subject'))));
    const nMist = q.mistakes.length;
    root.append(h('button', { type: 'button', class: `${CARD} flex items-center gap-4 bg-gradient-to-br ${WORLDS.cave.tint} to-transparent text-left transition hover:bg-night-800 active:scale-[.99] disabled:opacity-60`, disabled: !nMist, onclick: startCave },
      E(WORLDS.cave.emoji, 'text-5xl'),
      h('div', { class: 'min-w-0 flex-1' },
        h('p', { class: 'flex items-center gap-2 font-semibold text-white' }, nm(WORLDS.cave.name), nMist ? h('span', { class: 'rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-200' }, String(nMist)) : null),
        h('p', { class: 'text-sm text-slate-400' }, t('worldDesc').cave(nMist))),
      nMist ? ico('chevron-right', 'icon shrink-0 text-slate-500') : null));
    root.append(h('details', { class: `${CARD} group` },
      h('summary', { class: 'flex cursor-pointer list-none items-center gap-2 font-semibold text-white' }, ico('circle-help'), t('howTitle'), ico('chevron-down', 'icon ml-auto transition group-open:rotate-180')),
      h('ul', { class: 'mt-3 flex flex-col gap-2 text-sm text-slate-300' }, t('how').map((x) => h('li', { class: 'flex gap-2' }, h('span', { class: 'text-brand-400' }, '•'), x)))));
    root.append(h('button', { type: 'button', class: BTN2, onclick: toggleSound }, ico(soundOn() ? 'volume-2' : 'volume-x'), `${t('sound')}: ${soundOn() ? 'ON' : 'OFF'}`));
  }
  function toggleSound() { N.store.set('questSound', !soundOn()); open(); }

  // ---------- world map: chapter of 5 levels ----------
  function openWorld(wid) {
    const { h, ico, screen, titleBar, CARD, BTN } = K();
    const W = WORLDS[wid];
    const key = wid === 'subject' ? subjWid() : wid;
    const ws = worldState(key);
    const chapter = chapterOf(ws.lvl);
    const root = screen('activity');
    root.append(titleBar(`${W.emoji} ${nm(W.name)}`, open));
    root.append(h('div', { class: 'flex items-center justify-between' },
      h('p', { class: 'text-lg font-semibold text-white' }, t('chapter')(chapter)),
      coinPill()));
    const first = (chapter - 1) * 5 + 1;
    const path = h('div', { class: `relative flex flex-col gap-3 rounded-3xl bg-gradient-to-b ${W.tint} to-transparent p-4` });
    for (let lvl = first; lvl < first + 5; lvl++) {
      const m = monsterFor(wid, lvl);
      const done = lvl < ws.lvl, current = lvl === ws.lvl, boss = isBoss(lvl);
      const stars = ws.stars[lvl] || 0;
      const align = ['self-start', 'self-center', 'self-end', 'self-center', 'self-start'][lvl - first];
      path.append(h('button', { type: 'button', disabled: !done && !current, onclick: () => startBattle(wid, lvl),
        class: `${align} flex w-40 flex-col items-center gap-1 rounded-3xl p-3 transition active:scale-95 disabled:opacity-40 ${current ? 'bg-night-800 ring-2 ring-brand-400' : 'bg-night-900/80 ring-1 ring-white/5'}` },
        h('span', { class: current ? 'q-idle' : '' }, E(done || current ? m[0] : '❔', boss ? 'text-5xl' : 'text-4xl')),
        h('span', { class: 'text-xs font-semibold text-white' }, boss ? `👑 ${t('boss')}` : t('level')(lvl)),
        h('span', { class: 'text-xs' }, done ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : current ? monsterName(m) : '')));
    }
    root.append(path);
    root.append(h('button', { type: 'button', class: BTN, onclick: () => startBattle(wid, ws.lvl) }, ico('swords'), t('fight')(ws.lvl)));

    const topics = wid === 'math' ? mathPool(N.setup.grade) : wid === 'english' ? worldTopics('english', 1) : [];
    if (topics.length) {
      const open_ = unlockedCount(topics.length, chapter);
      root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
        h('p', { class: 'font-semibold text-white' }, t('skills')),
        h('p', { class: 'text-xs text-slate-400' }, t('skillsHint')),
        h('div', { class: 'flex flex-col gap-2' }, topics.map((tp, i) => {
          const s = Q().skill[tp.id];
          const lockedTp = wid === 'math' && i >= open_;
          const needChapter = Math.ceil((i + 1 - 4) / 2) + 1;
          return h('div', { class: `flex min-h-11 items-center gap-3 rounded-2xl bg-night-800 px-4 py-2 text-[15px] ${lockedTp ? 'opacity-50' : ''}` },
            lockedTp ? ico('lock', 'h-4 w-4 text-slate-500') : h('span', { class: `h-3 w-3 shrink-0 rounded-full ${skillDot(tp.id)}` }),
            h('span', { class: 'min-w-0 flex-1 text-slate-100' }, nm(tp.name)),
            h('span', { class: 'shrink-0 text-xs tabular-nums text-slate-400' }, lockedTp ? t('unlockAt')(needChapter) : s ? `${s.ok}/${s.n}` : ''));
        }))));
    }
  }

  // ---------- battle ----------
  function startBattle(wid, lvl) {
    if (wid === 'subject') return startSubjectBattle(lvl);
    battle({ wid, lvl, source: genSource(wid, lvl), hp: isBoss(lvl) ? 8 : 5 });
  }
  async function startSubjectBattle(lvl) {
    const kit = K();
    const root = kit.screen('activity');
    const alive = { dead: false };
    kit.setStop(() => { alive.dead = true; });
    const m = monsterFor('subject', lvl);
    root.append(kit.titleBar(`${WORLDS.subject.emoji} ${nm(WORLDS.subject.name)}`, () => openWorld('subject')),
      kit.h('div', { class: 'flex justify-center py-4' }, kit.h('span', { class: 'q-idle' }, E(m[0], 'text-7xl'))),
      kit.loading(t('loading')));
    try {
      const tasks = await kit.trainingTasks();
      if (alive.dead) return;
      const list = tasks.map((x) => fromTask(x, 'subject'));
      battle({ wid: 'subject', lvl, source: listSource(list), hp: list.length });
    } catch (e) {
      if (alive.dead || e.message === 'premium_required') return;
      root.lastChild.replaceWith(kit.errorBox(e.message, () => startSubjectBattle(lvl)));
    }
  }
  function startCave() {
    const list = Q().mistakes.slice(0, 6).map((x) => ({ ...x, opts: x.opts ? shuffle(x.opts) : null, fromBook: true }));
    if (!list.length) return open();
    battle({ wid: 'cave', lvl: 0, source: listSource(list), hp: list.length });
  }

  function battle({ wid, lvl, source, hp }) {
    const kit = K();
    const { h, ico, R, screen, titleBar, CARD, BTN, BTN2, INPUT } = kit;
    const W = WORLDS[wid];
    const stateKey = wid === 'subject' ? subjWid() : wid;
    const monster = monsterFor(wid, lvl || 1);
    const boss = lvl && isBoss(lvl) && W.bosses.length;
    const st = { hp, maxHp: hp, hearts: 3, streak: 0, turn: 0, mistakes: 0, fixed: 0, hints: boss ? 2 : 1, requeue: [], topics: {}, missed: [], done: false };
    const alive = { dead: false };
    const root = screen('activity');
    kit.setStop(() => { alive.dead = true; });
    const later = (fn, ms) => setTimeout(() => { if (!alive.dead) fn(); }, ms);
    const back = wid === 'cave' ? open : () => openWorld(wid);

    // Arena
    const heartsEl = h('span', { class: 'text-base tracking-tight' });
    const hpFill = h('div', { class: `h-full rounded-full ${W.bar} transition-all duration-500` });
    const heroBox = h('span', { class: 'inline-block' }, E(heroEmoji(), 'text-4xl sm:text-5xl'));
    const monBox = h('span', { class: 'inline-block' }, E(monster[0], boss ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl'));
    const heroWrap = h('div', { class: 'relative flex flex-col items-center gap-1' }, heartsEl, h('span', { class: 'q-idle' }, heroBox));
    const monWrap = h('div', { class: 'relative flex min-w-0 flex-1 flex-col items-center gap-1' },
      h('p', { class: 'max-w-full truncate text-xs font-semibold text-slate-200' }, `${boss ? '👑 ' : ''}${monsterName(monster)}`),
      h('div', { class: 'h-2.5 w-full max-w-40 overflow-hidden rounded-full bg-night-700' }, hpFill),
      h('span', { class: 'q-idle' }, monBox));
    const banner = h('p', { class: 'pointer-events-none absolute inset-x-2 bottom-1.5 truncate text-center text-sm font-semibold text-white', 'aria-live': 'polite' });
    const arena = h('div', { class: `relative rounded-3xl bg-gradient-to-b ${W.tint} to-transparent px-4 pb-6 pt-2 ring-1 ring-white/5` },
      h('div', { class: 'flex items-end justify-between gap-4' }, heroWrap, h('span', { class: 'pb-3 text-lg' }, '⚔️'), monWrap), banner);
    const qBox = h('div', { class: 'flex flex-col gap-2' });
    root.append(titleBar(`${W.emoji} ${lvl ? (boss ? t('boss') : t('level')(lvl)) : nm(W.name)}`, back), arena, qBox);

    const drawStatus = () => {
      heartsEl.textContent = '❤️'.repeat(st.hearts) + '🤍'.repeat(Math.max(0, 3 - st.hearts));
      hpFill.style.width = `${Math.max(0, (st.hp / st.maxHp) * 100)}%`;
    };
    const floatText = (wrap, text, cls) => {
      const f = h('span', { class: `q-float whitespace-nowrap text-xl font-bold ${cls}` }, text);
      wrap.append(f);
      setTimeout(() => f.remove(), 1000);
    };
    const tally = (q, ok) => {
      const name = q.tname || '—';
      const cur = st.topics[name] || { ok: 0, n: 0 };
      st.topics[name] = { ok: cur.ok + (ok ? 1 : 0), n: cur.n + 1 };
      if (q.w === 'math' || q.w === 'english') {
        const sk = Q().skill;
        const s = sk[q.topic] || { ok: 0, n: 0 };
        sk[q.topic] = { ok: s.ok + (ok ? 1 : 0), n: s.n + 1 };
      }
      // Parents see these answers in the topic map and the statistics.
      const subjectKey = q.w === 'math' ? 'math' : q.w === 'english' ? 'english' : N.setup.subject;
      kit.recordAnswer(subjectKey, q.tname, ok);
    };
    const addToBook = (q) => {
      const book = Q().mistakes;
      if (q.fromBook || book.some((x) => x.q === q.q)) return;
      const { w, topic, tname, kind, q: text, a, opts, rule, explain, speak } = q;
      book.push({ w, topic, tname, kind, q: text, a, opts, rule, explain, speak });
      if (book.length > 40) book.splice(0, book.length - 40);
    };
    const removeFromBook = (q) => {
      const q_ = Q();
      q_.mistakes = q_.mistakes.filter((x) => x.q !== q.q);
    };

    function nextQuestion() {
      st.turn += 1;
      const due = st.requeue.findIndex((r) => r.at <= st.turn);
      if (due >= 0) return st.requeue.splice(due, 1)[0].q;
      const q = source.next();
      if (q) return q;
      return st.requeue.length ? st.requeue.shift().q : null;
    }

    function ask() {
      if (st.hp <= 0) return finish(true);
      if (st.hearts <= 0) return finish(false);
      const q = nextQuestion();
      if (!q) return finish(st.hp <= st.maxHp / 2, true);
      TEST.q = q;
      qBox.innerHTML = '';
      root.scrollTo({ top: 0 });
      banner.textContent = q.retry ? '🔁' : '';
      const pill = 'flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-night-800 px-3 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-night-700';
      const tools = h('div', { class: 'flex shrink-0 gap-2' });
      const hintBox = h('div', {});
      if (q.speak && 'speechSynthesis' in window) {
        tools.append(h('button', { type: 'button', class: pill, 'aria-label': t('listen'), onclick: () => N.speak(q.speak, 'en') }, ico('volume-2', 'h-4 w-4'), h('span', { class: 'hidden sm:inline' }, t('listen'))));
      }
      if (q.rule && st.hints > 0) {
        const hb = h('button', { type: 'button', class: pill }, E('💡', 'text-base'), `${t('hint')} (${st.hints})`);
        hb.onclick = () => {
          st.hints -= 1;
          hb.remove();
          hintBox.append(R('p', { class: 'bubble rounded-2xl bg-sky-500/10 p-3 text-sm text-sky-100 ring-1 ring-sky-400/30' }, `**${t('rule')}:** ${q.rule}`));
        };
        tools.append(hb);
      }
      const head = h('div', { class: 'flex items-center justify-between gap-2' },
        h('span', { class: 'min-w-0 truncate text-xs text-slate-400' }, `${st.streak >= 2 ? `🔥 ${st.streak} · ` : ''}${q.tname || ''}`), tools);
      const qCard = R('div', { class: 'bubble whitespace-pre-wrap rounded-3xl bg-night-900/80 px-4 py-2.5 text-lg leading-snug text-white ring-1 ring-white/5' }, q.q);
      qBox.append(head, qCard, hintBox);
      const answers = h('div', { class: 'grid gap-2' });
      qBox.append(answers);
      if (q.kind === 'choice') {
        const short = q.opts.every((o) => o.replace(/\\[a-z]+|[${}^_\\]/g, '').length <= 12);
        if (short) answers.classList.add('grid-cols-2');
        q.opts.forEach((opt) => {
          const b = R('button', { type: 'button', 'data-option': opt, class: 'bubble min-h-12 w-full rounded-2xl bg-night-800 px-4 py-2.5 text-center text-lg font-semibold sm:min-h-14 text-slate-100 ring-1 ring-white/10 transition hover:bg-night-700 active:scale-[.98] disabled:cursor-default' }, opt);
          b.onclick = () => answer(q, opt, opt === q.a, b, answers);
          answers.append(b);
        });
      } else {
        const input = h('input', { type: 'text', class: INPUT, placeholder: t('yourAnswer'), autocomplete: 'off', maxlength: '120' });
        const go = h('button', { type: 'button', class: BTN }, t('check'));
        const send = () => { if (input.value.trim()) answer(q, input.value, kit.isCorrect({ answer: q.a }, input.value), null, answers); };
        go.onclick = send;
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
        answers.append(input, go);
        setTimeout(() => input.focus(), 50);
      }
    }

    function answer(q, given, ok, btn, answers) {
      answers.querySelectorAll('button, input').forEach((el) => { el.disabled = true; });
      answers.querySelectorAll('[data-option]').forEach((b) => {
        if (b.dataset.option === q.a) b.classList.add('bg-emerald-500/20!', 'ring-emerald-400!', 'text-emerald-100!');
      });
      tally(q, ok);
      if (ok) {
        st.streak += 1;
        const crit = q.retry || st.streak % 3 === 0;
        const dmg = crit ? 2 : 1;
        st.hp -= dmg;
        if (q.retry || q.fromBook) st.fixed += 1;
        if (q.fromBook) removeFromBook(q);
        banner.textContent = q.retry ? `💥 ${t('fixed')}` : st.streak % 3 === 0 ? `💥 ${t('combo')(st.streak)}` : `✅ ${t('correct')}`;
        restart(heroBox, 'q-lunge-r');
        later(() => { restart(monBox, 'q-shake'); floatText(monWrap, `−${dmg}`, crit ? 'text-amber-300' : 'text-rose-300'); (crit ? SFX.crit : SFX.hit)(); drawStatus(); }, 180);
        save();
        later(st.hp <= 0 ? () => finish(true) : ask, 1000);
        return;
      }
      st.streak = 0;
      st.mistakes += 1;
      st.hearts -= 1;
      if (btn) btn.classList.add('bg-rose-500/20!', 'ring-rose-400!', 'text-rose-100!');
      if (!q.retry) st.requeue.push({ q: { ...q, retry: true, opts: q.opts ? shuffle(q.opts) : null }, at: st.turn + 2 });
      if (!st.missed.some((x) => x.q === q.q)) st.missed.push(q);
      if (wid !== 'cave') addToBook(q);
      save();
      banner.textContent = `💢 ${t('wrongTitle')}`;
      restart(monBox, 'q-lunge-l');
      later(() => { restart(heroBox, 'q-shake'); floatText(heroWrap, '−❤️', 'text-rose-300'); SFX.hurt(); drawStatus(); try { navigator.vibrate?.(120); } catch {} }, 180);
      const fb = h('div', { class: 'flex flex-col gap-2 rounded-2xl bg-rose-500/10 p-4 text-rose-100 ring-1 ring-rose-400/30' },
        R('p', { class: 'bubble font-semibold' }, `${t('rightAnswer')}: ${q.a}`),
        q.explain ? R('p', { class: 'bubble whitespace-pre-wrap text-slate-200' }, `**${t('why')}:** ${q.explain}`) : null,
        q.rule ? R('p', { class: 'bubble rounded-xl bg-night-800 p-3 text-sm text-slate-200' }, `**${t('rule')}:** ${q.rule}`) : null);
      const go = h('button', { type: 'button', class: BTN, onclick: () => (st.hearts <= 0 ? finish(false) : ask()) }, t('gotIt'), ico('chevron-right'));
      qBox.append(fb, go);
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      later(() => go.focus({ preventScroll: true }), 300);
    }

    function finish(won, fled = false) {
      if (st.done) return;
      st.done = true;
      const q = Q();
      const ws = wid === 'cave' ? null : worldState(stateKey);
      const stars = st.mistakes === 0 ? 3 : st.mistakes <= 2 ? 2 : 1;
      let coins = 5;
      let chest = false;
      if (won) {
        if (wid === 'cave') coins = 10 + 5 * st.fixed;
        else {
          const replay = lvl < ws.lvl;
          coins = Math.round((10 + 5 * stars) * (boss ? 2 : 1) * (replay ? 0.5 : 1));
          ws.stars[lvl] = Math.max(ws.stars[lvl] || 0, stars);
          if (lvl === ws.lvl) ws.lvl += 1;
        }
        q.beaten[monster[0]] = (q.beaten[monster[0]] || 0) + 1;
        if (q.chest !== N.today()) { q.chest = N.today(); chest = true; coins += 30; }
      }
      q.coins += coins;
      save();
      kit.markDay();
      (won ? SFX.win : SFX.lose)();
      if (won) restart(monBox, 'q-defeat');
      later(() => showResult(won, fled, stars, coins, chest, ws), won ? 700 : 300);
    }

    function showResult(won, fled, stars, coins, chest, ws) {
      root.innerHTML = '';
      root.scrollTop = 0;
      root.append(titleBar(`${W.emoji} ${nm(W.name)}`, back));
      root.append(h('div', { class: `flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b ${won ? 'from-amber-400/20' : 'from-rose-500/15'} to-transparent p-6 text-center ring-1 ring-white/5` },
        h('div', { class: 'flex items-end gap-3' }, h('span', { class: 'q-pop' }, E(heroEmoji(), 'text-6xl')), won ? h('span', { class: 'q-pop text-4xl' }, '🏆') : h('span', { class: 'text-5xl opacity-80' }, monster[0])),
        h('p', { class: 'text-2xl font-bold text-white' }, won ? t('win') : fled ? t('fled') : t('lose')),
        won && wid !== 'cave' ? h('p', { class: 'text-3xl' }, [1, 2, 3].map((i) => h('span', { class: 'q-pop inline-block', style: `animation-delay:${i * 0.15}s` }, i <= stars ? '⭐' : '☆'))) : null,
        !won ? h('p', { class: 'text-slate-300' }, t('loseText')) : null,
        h('p', { class: 'flex items-center gap-1.5 text-lg font-semibold text-amber-200' }, E('🪙', 'text-xl'), t('coins')(coins)),
        chest ? h('p', { class: 'text-sm text-amber-100' }, `🎁 ${t('chestBonus')}`) : null));
      setTimeout(SFX.coin, 400);

      const rows = Object.entries(st.topics);
      if (rows.length) {
        root.append(h('div', { class: `${CARD} flex flex-col gap-2` },
          h('p', { class: 'font-semibold text-white' }, t('learned')),
          rows.map(([name, s]) => h('div', { class: 'flex items-center gap-3 rounded-xl bg-night-800 px-3 py-2' },
            h('span', { class: `h-3 w-3 shrink-0 rounded-full ${s.ok === s.n ? 'bg-emerald-400' : s.ok / s.n >= 0.5 ? 'bg-amber-400' : 'bg-rose-400'}` }),
            h('span', { class: 'min-w-0 flex-1 text-sm text-slate-100' }, name),
            h('span', { class: 'text-xs tabular-nums text-slate-400' }, `${s.ok}/${s.n}`))),
          st.fixed ? h('p', { class: 'text-sm text-emerald-200' }, `💥 ${t('fixedCount')(st.fixed)}`) : null));
      }
      if (st.missed.length) {
        root.append(h('div', { class: `${CARD} flex flex-col gap-3` },
          h('p', { class: 'font-semibold text-white' }, won ? t('missed') : t('repeat')),
          st.missed.map((m) => h('div', { class: 'flex flex-col gap-1.5 rounded-2xl bg-night-800 p-3' },
            R('p', { class: 'bubble whitespace-pre-wrap text-sm text-white' }, m.q),
            R('p', { class: 'bubble text-sm text-emerald-200' }, `✔ ${m.a}`),
            m.rule ? R('p', { class: 'bubble text-xs text-slate-400' }, `**${t('rule')}:** ${m.rule}`) : null))));
      }
      if (wid === 'cave') {
        if (Q().mistakes.length) root.append(h('button', { type: 'button', class: BTN, onclick: startCave }, ico('swords'), t('caveFight')));
      } else if (won) {
        root.append(h('button', { type: 'button', class: BTN, onclick: () => startBattle(wid, ws.lvl) }, ico('swords'), `${t('next')} · ${t('level')(ws.lvl)}`));
      } else {
        root.append(h('button', { type: 'button', class: BTN, onclick: () => startBattle(wid, lvl) }, ico('repeat'), t('again')));
      }
      root.append(h('button', { type: 'button', class: BTN2, onclick: back }, wid === 'cave' ? t('toQuest') : t('toMap')));
    }

    drawStatus();
    ask();
  }

  // ---------- heroes shop and monster collection ----------
  function openHeroes() {
    const { h, screen, titleBar, CARD } = K();
    const q = Q();
    const root = screen('activity');
    root.append(titleBar(t('heroes'), open),
      h('div', { class: 'flex items-center justify-between gap-3' }, h('p', { class: 'text-sm text-slate-400' }, t('heroesText')), coinPill()));
    root.append(h('div', { class: 'grid grid-cols-2 gap-3 sm:grid-cols-3' }, HEROES.map(([id, emoji, price, ru, uz]) => {
      const owned = q.heroes.includes(id), chosen = q.hero === id, canBuy = q.coins >= price;
      const btn = h('button', { type: 'button', disabled: chosen || (!owned && !canBuy),
        class: `min-h-11 w-full rounded-xl px-3 text-sm font-semibold transition disabled:opacity-60 ${chosen ? 'bg-emerald-500/20 text-emerald-200' : owned || canBuy ? 'bg-brand-500 text-onfill hover:bg-brand-400' : 'bg-night-700 text-slate-400'}`,
        onclick: () => {
          if (!owned) { q.coins -= price; q.heroes = [...q.heroes, id]; SFX.coin(); }
          q.hero = id;
          save();
          openHeroes();
        } }, chosen ? t('chosen') : owned ? t('choose') : `🪙 ${t('buy')(price)}`);
      return h('div', { class: `${CARD} flex flex-col items-center gap-2 text-center ${chosen ? 'ring-2 ring-emerald-400/60' : ''}` },
        h('span', { class: chosen ? 'q-idle' : '' }, E(emoji, 'text-5xl')), h('p', { class: 'font-semibold text-white' }, tr(ru, uz)), btn);
    })));
  }
  function openCollection() {
    const { h, screen, titleBar, CARD } = K();
    const q = Q();
    const all = Object.values(WORLDS).flatMap((W) => [...W.monsters, ...W.bosses]);
    const got = all.filter((m) => q.beaten[m[0]]).length;
    const root = screen('activity');
    root.append(titleBar(t('collection'), open), h('p', { class: 'text-slate-300' }, t('collectionText')(got, all.length)));
    root.append(h('div', { class: 'grid grid-cols-3 gap-2 sm:grid-cols-4' }, all.map((m) => {
      const n = q.beaten[m[0]] || 0;
      return h('div', { class: `${CARD} flex flex-col items-center gap-1 p-3 text-center` },
        E(n ? m[0] : '❔', 'text-4xl'),
        h('p', { class: 'text-[11px] leading-tight text-slate-300' }, n ? monsterName(m) : t('unknown')),
        n ? h('p', { class: 'text-xs font-semibold text-amber-200' }, t('times')(n)) : null);
    })));
  }

  const TEST = { MATH, mathPool, englishQuestion, q: null }; // for automated checks
  window.NimiQuest = { open, card: () => t('card'), _test: TEST };
})();
