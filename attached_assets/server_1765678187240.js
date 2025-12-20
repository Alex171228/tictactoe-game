// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация Telegram из .env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в .env');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Генерация промокода на сервере
function generatePromoCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Отправка сообщения в Telegram
async function sendToTelegram(message, chatId) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.error('Не заданы TELEGRAM_BOT_TOKEN или chatId');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  } catch (e) {
    console.error('Ошибка отправки в Telegram:', e);
    return false;
  }
}

// API для обработки результатов игры
app.post('/api/result', async (req, res) => {
  const { result, telegramId, firstName } = req.body;
  
  let promoCode = null;
  let sent = false;
  
  if (result === 'win') {
    promoCode = generatePromoCode();
    
    if (telegramId) {
      // Отправляем промокод игроку в его личный Telegram
      const playerMessage = `🎉 Поздравляем с победой!\n\n🎁 Ваш промокод: ${promoCode}\n\n✨ Спасибо за игру!`;
      sent = await sendToTelegram(playerMessage, telegramId);
      
      // Уведомляем админа (опционально)
      if (TELEGRAM_CHAT_ID) {
        const adminMessage = `Победа! Промокод выдан: ${promoCode}\nИгрок: ${firstName || 'Неизвестный'} (ID: ${telegramId})`;
        await sendToTelegram(adminMessage, TELEGRAM_CHAT_ID);
      }
    }
  } else if (result === 'lose') {
    // Уведомляем админа о проигрыше
    if (TELEGRAM_CHAT_ID) {
      await sendToTelegram(`Проигрыш\nИгрок: ${firstName || 'Неизвестный'}`, TELEGRAM_CHAT_ID);
    }
  } else {
    // Ничья
    if (TELEGRAM_CHAT_ID) {
      await sendToTelegram(`Ничья\nИгрок: ${firstName || 'Неизвестный'}`, TELEGRAM_CHAT_ID);
    }
  }
  
  res.json({ 
    status: sent ? 'ok' : 'error',
    promoCode
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
