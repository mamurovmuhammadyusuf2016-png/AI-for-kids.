// Server-side arithmetic check: finds simple expressions in text and computes
// them exactly in code, so the tutor does not rely on the model for math.

const NUM = String.raw`\d+(?:[.,]\d+)?`;
const EXPR_RE = new RegExp(String.raw`[(\-]*${NUM}(?:\s*\)*\s*[-+*/^]\s*[(\-]*\s*${NUM}\s*\)*)+`, 'g');
const CLAIM_RE = new RegExp(String.raw`(${EXPR_RE.source})\s*=\s*(-?${NUM})(?![\d.,]*\s*[-+*/^]\s*\d)`, 'g');

function normalize(text) {
  return text
    .replace(/[−–—]/g, '-')
    .replace(/[×·⋅∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d)\s*[xXхХ]\s*(?=\d)/g, '$1*')
    .replace(/(\d)\s*:\s*(?=\d)/g, '$1/')
    .replace(/,\s+/g, ' ; ');
}

function tokenize(src) {
  const tokens = [];
  const re = /\s*(\d+(?:[.,]\d+)?|[-+*/^()])/y;
  let m;
  while (re.lastIndex < src.length) {
    const start = re.lastIndex;
    m = re.exec(src);
    if (!m) {
      if (/^\s*$/.test(src.slice(start))) break;
      return null;
    }
    tokens.push(m[1]);
  }
  return tokens;
}

// Recursive-descent parser: expr = term (+|- term)*, term = power (*|/ power)*,
// power = unary (^ power)?, unary = -unary | primary.
function evaluate(src) {
  const tokens = tokenize(src);
  if (!tokens || !tokens.length) return null;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function primary() {
    const t = next();
    if (t === '(') {
      const v = expr();
      if (next() !== ')') throw new Error('paren');
      return v;
    }
    if (t !== undefined && /^\d/.test(t)) return parseFloat(t.replace(',', '.'));
    throw new Error('token');
  }
  function unary() {
    if (peek() === '-') { next(); return -unary(); }
    return primary();
  }
  function power() {
    const base = unary();
    if (peek() === '^') { next(); return base ** power(); }
    return base;
  }
  function term() {
    let v = power();
    while (peek() === '*' || peek() === '/') v = next() === '*' ? v * power() : v / power();
    return v;
  }
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') v = next() === '+' ? v + term() : v - term();
    return v;
  }

  try {
    const v = expr();
    if (i !== tokens.length || !Number.isFinite(v)) return null;
    return v;
  } catch {
    return null;
  }
}

function fmt(n) {
  return String(Math.round(n * 1e9) / 1e9);
}

function sameNumber(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

function findExpressions(text) {
  const out = [];
  const norm = normalize(text);
  for (const m of norm.matchAll(EXPR_RE)) {
    const src = m[0].trim();
    // Skip phone numbers and dates like 123-45-67 or 20-10-2026.
    if (src.length > 80 || /^\d+(?:-\d+){2,}$/.test(src)) continue;
    const value = evaluate(src);
    if (value !== null) out.push({ src, value });
  }
  return out;
}

function findClaims(text) {
  const out = [];
  for (const m of normalize(text).matchAll(CLAIM_RE)) {
    const src = m[1].trim();
    const value = evaluate(src);
    const claimed = parseFloat(m[m.length - 1].replace(',', '.'));
    if (value !== null && Number.isFinite(claimed)) out.push({ src, value, claimed, ok: sameNumber(value, claimed) });
  }
  return out;
}

// Facts about the student's messages, passed to the model as hidden context.
function verifyStudentMessages(userTexts) {
  const lines = [];
  const seen = new Set();
  for (const text of userTexts) {
    for (const c of findClaims(text)) {
      const key = `claim:${c.src.replace(/\s/g, '')}=${c.claimed}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(c.ok
        ? `Ученик написал ${c.src} = ${fmt(c.claimed)} — ВЕРНО.`
        : `Ученик написал ${c.src} = ${fmt(c.claimed)} — НЕВЕРНО (правильно ${fmt(c.value)}).`);
    }
    for (const e of findExpressions(text)) {
      const key = `expr:${e.src.replace(/\s/g, '')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`${e.src} = ${fmt(e.value)}`);
    }
  }
  return lines.slice(-10);
}

// Wrong "a op b = c" statements in the model's own reply.
function findWrongClaims(reply) {
  return findClaims(reply).filter((c) => !c.ok);
}

module.exports = { evaluate, findExpressions, findClaims, verifyStudentMessages, findWrongClaims, fmt };
