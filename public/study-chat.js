(() => {
  const adjectives = ['Смелый', 'Умный', 'Добрый', 'Яркий', 'Быстрый', 'Звёздный', 'Любознательный', 'Тихий'];
  const animals = ['Лисёнок', 'Тигр', 'Кит', 'Сова', 'Панда', 'Ёжик', 'Дельфин', 'Коала'];
  const nicknameEl = document.querySelector('#nickname');
  const noticeEl = document.querySelector('#notice');
  const messagesEl = document.querySelector('#messages');
  const form = document.querySelector('#message-form');
  const input = document.querySelector('#message');
  const sendButton = document.querySelector('#send');
  let nickname = sessionStorage.getItem('study-chat-nickname') || '';

  function newNickname() {
    nickname = adjectives[Math.floor(Math.random() * adjectives.length)] + '-' + animals[Math.floor(Math.random() * animals.length)];
    sessionStorage.setItem('study-chat-nickname', nickname);
    nicknameEl.textContent = nickname;
  }
  function notice(message, kind) {
    noticeEl.textContent = message;
    noticeEl.className = 'study-chat-notice' + (kind ? ' ' + kind : '');
  }
  function render(messages) {
    messagesEl.replaceChildren();
    if (!messages.length) {
      const empty = document.createElement('p');
      empty.className = 'study-chat-empty';
      empty.textContent = 'Здесь появятся проверенные учебные сообщения.';
      messagesEl.append(empty);
      return;
    }
    for (const message of messages) {
      const article = document.createElement('article');
      article.className = 'study-chat-message';
      const author = document.createElement('strong');
      author.textContent = message.nickname;
      const content = document.createElement('p');
      content.textContent = message.text;
      article.append(author, content);
      messagesEl.append(article);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  async function refresh() {
    try {
      const response = await fetch('/api/study-chat/messages', { cache: 'no-store' });
      const data = await response.json();
      render(data.messages || []);
    } catch {
      notice('Не удалось обновить чат. Проверь соединение.', 'error');
    }
  }
  document.querySelector('#new-nickname').addEventListener('click', newNickname);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    sendButton.disabled = true;
    notice('ИИ проверяет, относится ли сообщение к учёбе…');
    try {
      const response = await fetch('/api/study-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, text })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Сообщение не прошло проверку.');
      input.value = '';
      notice('Сообщение опубликовано.', 'success');
      await refresh();
    } catch (error) {
      notice(error.message, 'error');
    } finally {
      sendButton.disabled = false;
      input.focus();
    }
  });
  if (!nickname) newNickname(); else nicknameEl.textContent = nickname;
  refresh();
  setInterval(refresh, 5000);
})();