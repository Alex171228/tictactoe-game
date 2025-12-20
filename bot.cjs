const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = (process.env.SITE_URL || 'https://asukaeva2.com').replace(/\/+$/, '');
const API_URL = process.env.API_URL || `${SITE_URL}/api/auth/code`;
const BOT_SECRET = process.env.AUTH_BOT_SECRET || '';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен (env).');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function safeName(user) {
  return user.first_name || user.username || 'друг';
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(BOT_SECRET ? { 'X-Bot-Secret': BOT_SECRET } : {}),
      },
      body: JSON.stringify({
        telegramId: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ /api/auth/code error ${response.status}: ${errText}`);
      await bot.sendMessage(chatId, '❌ Ошибка генерации кода. Попробуйте позже.');
      return;
    }

    const data = await response.json();
    const code = data.code;

    const url = `${SITE_URL}/auth?code=${encodeURIComponent(code)}`;

    await bot.sendMessage(
      chatId,
      `Привет, ${safeName(user)} 👋\n\n` +
      `Нажми кнопку ниже — откроется сайт и ты войдёшь автоматически.\n\n` +
      `Если кнопка не открылась, можно ввести код вручную: ${code}`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: 'Открыть сайт', url }
          ]]
        }
      }
    );

    console.log(`✅ Auth code issued for ${user.id}: ${code}`);
  } catch (e) {
    console.error('❌ Bot error:', e);
    await bot.sendMessage(chatId, '❌ Ошибка. Попробуйте позже.');
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
