#!/usr/bin/env node
// Telegram approval bot for site changes requested by the new employee.
// The owner gets the proposal with screenshots and "Add" / "Don't add" buttons;
// only approved changes are merged into the live branch.
//
//   node tools/tg.js chats                       list chats that pressed Start (to find the owner)
//   node tools/tg.js notify "text"               send a message to the owner
//   node tools/tg.js propose <id> <text-file> [photo ...]   send a proposal with buttons
//   node tools/tg.js wait <id> [minutes]         wait for the owner's answer: prints approved/rejected
//
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_CHAT_ID in the environment (never in the repo).
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER = process.env.TELEGRAM_OWNER_CHAT_ID;
const API = `https://api.telegram.org/bot${TOKEN}`;

async function call(method, body) {
  const isForm = body instanceof FormData;
  const r = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body || {}),
  });
  const data = await r.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

function need(...vars) {
  for (const v of vars) {
    if (!process.env[v]) {
      console.error(`Missing ${v}`);
      process.exit(3);
    }
  }
}

async function sendPhoto(file, caption) {
  const form = new FormData();
  form.append('chat_id', OWNER);
  if (caption) form.append('caption', caption.slice(0, 1000));
  form.append('photo', new Blob([fs.readFileSync(file)]), path.basename(file));
  return call('sendPhoto', form);
}

const buttons = (id) => ({
  inline_keyboard: [[
    { text: '✅ Добавить на сайт', callback_data: `approve:${id}` },
    { text: '❌ Не добавлять', callback_data: `reject:${id}` },
  ]],
});

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  need('TELEGRAM_BOT_TOKEN');

  if (cmd === 'chats') {
    const updates = await call('getUpdates', { timeout: 0 });
    const chats = new Map();
    for (const u of updates) {
      const c = (u.message || u.callback_query?.message)?.chat;
      const from = u.message?.from || u.callback_query?.from;
      if (c) chats.set(c.id, `${c.id}  ${[from?.first_name, from?.last_name].filter(Boolean).join(' ')} @${from?.username || '-'}`);
    }
    console.log(chats.size ? [...chats.values()].join('\n') : 'Nobody has pressed Start yet');
    return;
  }

  need('TELEGRAM_OWNER_CHAT_ID');

  if (cmd === 'notify') {
    await call('sendMessage', { chat_id: OWNER, text: args.join(' ') });
    return;
  }

  if (cmd === 'propose') {
    const [id, textFile, ...photos] = args;
    const text = fs.readFileSync(textFile, 'utf8');
    for (const p of photos) await sendPhoto(p);
    const msg = await call('sendMessage', { chat_id: OWNER, text: text.slice(0, 4000), reply_markup: buttons(id) });
    console.log(`sent message ${msg.message_id}`);
    return;
  }

  if (cmd === 'wait') {
    const [id, minutes = '60'] = args;
    const until = Date.now() + Number(minutes) * 60000;
    let offset;
    while (Date.now() < until) {
      const updates = await call('getUpdates', { offset, timeout: 30, allowed_updates: ['callback_query'] });
      for (const u of updates) {
        offset = u.update_id + 1;
        const q = u.callback_query;
        if (!q || !q.data) continue;
        const [decision, qid] = q.data.split(':');
        // Only the owner's answer to this proposal counts.
        if (qid !== id || String(q.from.id) !== String(OWNER)) {
          await call('answerCallbackQuery', { callback_query_id: q.id, text: 'Решение принимает владелец' }).catch(() => {});
          continue;
        }
        const approved = decision === 'approve';
        await call('answerCallbackQuery', { callback_query_id: q.id, text: approved ? 'Добавляю на сайт' : 'Не добавляю' });
        await call('editMessageReplyMarkup', { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: approved ? '✅ Одобрено' : '❌ Отклонено', callback_data: 'done' }]] } }).catch(() => {});
        await call('getUpdates', { offset, timeout: 0 }); // mark as read
        console.log(approved ? 'approved' : 'rejected');
        process.exit(approved ? 0 : 2);
      }
    }
    console.log('timeout');
    process.exit(4);
  }

  console.error('Usage: chats | notify <text> | propose <id> <text-file> [photos] | wait <id> [minutes]');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
