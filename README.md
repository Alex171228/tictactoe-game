# Крестики-Нолики с Telegram Authentication

Игра "Крестики-Нолики" с авторизацией через Telegram, системой промокодов и умным ИИ-противником.

## Содержание

- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Функциональность](#функциональность)
- [Быстрый старт](#быстрый-старт)
- [Настройка Telegram бота](#настройка-telegram-бота)
- [Переменные окружения](#переменные-окружения)
- [Деплой на сервер](#деплой-на-сервер)
- [API документация](#api-документация)
- [Структура проекта](#структура-проекта)
- [Дизайн-гайдлайны](#дизайн-гайдлайны)
- [Разработка](#разработка)

## Описание

Веб-приложение для игры в крестики-нолики с интеграцией Telegram. Пользователи могут авторизоваться через Telegram Web App или с помощью кода авторизации. При победе игрок получает промокод, который отправляется в Telegram.

### Основные возможности

- Авторизация через Telegram (Web App или код)
- Игра против ИИ с алгоритмом minimax
- Система промокодов для победителей
- Отслеживание статистики игр
- Анимированный кот-маскот с эмоциональными реакциями
- Полностью адаптивный дизайн
- Безопасная авторизация с временными кодами

## Технологический стек

### Frontend
- **React 18** + **TypeScript** - UI библиотека
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - стилизация
- **shadcn/ui** - компонентная библиотека
- **Wouter** - роутинг
- **TanStack Query** - управление состоянием и запросами
- **Framer Motion** - анимации

### Backend
- **Express.js** + **TypeScript** - сервер
- **WebSocket (ws)** - real-time коммуникация
- **In-memory storage** - хранение кодов авторизации

### Telegram Bot
- **node-telegram-bot-api** - Telegram Bot API

## Функциональность

### Игровая логика
- Алгоритм **minimax** с alpha-beta pruning для оптимальной игры ИИ
- 30% вероятность ошибки ИИ для более интересной игры
- Проверка победных комбинаций
- Обработка ничьих

### Авторизация
- **Telegram Web App** - автоматический вход при открытии из Telegram
- **Код авторизации** - для входа через обычный браузер
- **Демо-режим** - для тестирования без Telegram

### Система промокодов
- Автоматическая генерация промокодов при победе
- Один промокод на пользователя (защита от повторных выдач)
- Отправка промокодов в Telegram
- Уведомления администратора о результатах игр

## Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd tictactoe-game-main
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Заполните необходимые переменные (см. раздел [Переменные окружения](#переменные-окружения)).

### 3. Запуск в режиме разработки

```bash
# Запуск dev-сервера (frontend + backend)
npm run dev

# В другом терминале - запуск Telegram бота
npm run bot
```

Приложение будет доступно по адресу `http://localhost:5000` (или порт из `PORT` в `.env`).

### 4. Сборка для продакшена

```bash
npm run build
npm start
```

## Настройка Telegram бота

### Вариант 1: Telegram Web App (Рекомендуется)

**Самый простой способ** - пользователи открывают сайт прямо из Telegram:

1. В **@BotFather** выберите вашего бота
2. **Bot Settings** → **Menu Button** → **Edit Menu Button**
3. Введите текст кнопки: `Играть`
4. Введите URL: `https://your-domain.com`
5. Готово! Теперь в боте будет кнопка "Играть", которая открывает сайт

**Преимущества:**
- Автоматическая авторизация (не нужен код)
- Работает мгновенно
- Не требует дополнительной настройки

### Вариант 2: Код авторизации (для открытия в браузере)

Если пользователь открывает сайт в обычном браузере (не из Telegram), ему нужен код.

#### Настройка бота

В проекте уже есть готовый скрипт `bot.cjs` для выдачи кодов!

**На сервере:**

1. Убедитесь, что зависимости установлены:
   ```bash
   npm install
   ```

2. Проверьте, что в `.env` есть токен бота:
   ```bash
   # Должно быть: TELEGRAM_BOT_TOKEN=ваш_токен
   ```

3. Запустите бота через PM2:
   ```bash
   pm2 start bot.cjs --name "telegram-bot" --interpreter node
   pm2 save
   ```

4. Проверьте статус:
   ```bash
   pm2 status
   pm2 logs telegram-bot
   ```

**Локально (для тестирования):**

```bash
npm run bot
```

**Готово!** Теперь бот будет:
- Отвечать на `/start` с инструкцией
- Обрабатывать `/start auth` и отправлять код пользователю
- Автоматически вызывать API для создания кода

### Рекомендация

**Используйте оба варианта:**
1. **Telegram Web App** - для пользователей которые открывают из Telegram (автоматический вход)
2. **Код авторизации** - для пользователей которые открывают в браузере (нужен код)

Это обеспечит максимальный удобство для всех пользователей!

## Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

### Обязательные

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
SITE_URL=https://your-domain.com

# Безопасность
AUTH_BOT_SECRET=your_secret_key_here
```

### Опциональные

```env
# Сервер
PORT=5000
NODE_ENV=production

# Telegram уведомления
TELEGRAM_CHAT_ID=your_chat_id_for_admin_notifications

# Авторизация
AUTH_CODE_TTL_SECONDS=300

# HTTPS (для продакшена)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
SSL_CA_PATH=/path/to/ca.pem

# Frontend
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Описание переменных

- `TELEGRAM_BOT_TOKEN` - токен бота от @BotFather
- `SITE_URL` - URL вашего сайта (для генерации ссылок)
- `AUTH_BOT_SECRET` - секретный ключ для защиты API от бота (должен совпадать в боте и сервере)
- `PORT` - порт для запуска сервера (по умолчанию 5000)
- `TELEGRAM_CHAT_ID` - ID чата для отправки уведомлений администратору
- `AUTH_CODE_TTL_SECONDS` - время жизни кода авторизации в секундах (по умолчанию 300)
- `SSL_*` - пути к SSL сертификатам для HTTPS
- `VITE_TELEGRAM_BOT_USERNAME` - username бота (без @) для отображения в UI

## Деплой на сервер

### Деплой на Ubuntu (HTTPS на порту 443)

#### 1. Установка Node.js (18+)

Используйте предпочитаемый метод (nvm, NodeSource, и т.д.). Пример с NodeSource:
- https://github.com/nodesource/distributions

#### 2. Установка зависимостей

```bash
npm ci
npm run build
```

#### 3. Создание .env

```bash
cp .env.example .env
nano .env
```

Установите:
- `PORT=443`
- `SSL_CERT_PATH`, `SSL_KEY_PATH` (Cloudflare Origin cert или Let's Encrypt)
- `TELEGRAM_BOT_TOKEN`
- `SITE_URL=https://your-domain.com`
- `AUTH_BOT_SECRET` (тот же ключ, что используется ботом)

#### 4. Запуск (вручную)

**В одном терминале - веб-сервер:**
```bash
npm start
```

**В другом терминале - бот:**
```bash
npm run bot
```

#### 5. Запуск с systemd (рекомендуется)

Создайте `/etc/systemd/system/tictactoe-web.service`:

```ini
[Unit]
Description=TicTacToe Web
After=network.target

[Service]
WorkingDirectory=/opt/tictactoe-game
EnvironmentFile=/opt/tictactoe-game/.env
ExecStart=/usr/bin/node /opt/tictactoe-game/dist/index.cjs
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Создайте `/etc/systemd/system/tictactoe-bot.service`:

```ini
[Unit]
Description=TicTacToe Telegram Bot
After=network.target

[Service]
WorkingDirectory=/opt/tictactoe-game
EnvironmentFile=/opt/tictactoe-game/.env
ExecStart=/usr/bin/node /opt/tictactoe-game/bot.cjs
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Включите сервисы:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tictactoe-web
sudo systemctl enable --now tictactoe-bot
```

> **Примечание:** привязка к порту 443 обычно требует root или CAP_NET_BIND_SERVICE.

## API документация

### POST /api/auth/code

Создание кода авторизации (вызывается ботом).

**Заголовки:**
```
X-Bot-Secret: <AUTH_BOT_SECRET>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "telegramId": 123456789,
  "firstName": "Имя",
  "lastName": "Фамилия",
  "username": "username",
  "photoUrl": "https://..."
}
```

**Ответ:**
```json
{
  "code": "123456"
}
```

### POST /api/auth/verify

Проверка кода авторизации.

**Тело запроса:**
```json
{
  "code": "123456"
}
```

**Ответ:**
```json
{
  "user": {
    "id": 123456789,
    "first_name": "Имя",
    "last_name": "Фамилия",
    "username": "username",
    "photo_url": "https://...",
    "auth_date": 1234567890,
    "hash": "auth_123456"
  }
}
```

Или если код неверен/истёк:
```json
{
  "user": null
}
```

### POST /api/result

Отправка результата игры.

**Тело запроса:**
```json
{
  "result": "win" | "lose" | "draw",
  "telegramId": 123456789,
  "firstName": "Имя"
}
```

**Ответ:**
```json
{
  "status": "ok" | "error",
  "promoCode": "12345" | null,
  "alreadyHasPromo": false
}
```

## Структура проекта

```
tictactoe-game-main/
├── client/                 # React приложение
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   │   ├── auth/       # Компоненты авторизации
│   │   │   ├── game/       # Игровые компоненты
│   │   │   ├── layout/     # Компоненты макета
│   │   │   └── ui/         # Базовые UI компоненты (shadcn/ui)
│   │   ├── pages/          # Страницы приложения
│   │   ├── lib/            # Утилиты и логика
│   │   │   ├── auth-context.tsx
│   │   │   ├── game-logic.ts
│   │   │   └── queryClient.ts
│   │   └── hooks/          # React хуки
│   ├── index.html
│   └── public/             # Статические файлы
├── server/                 # Express сервер
│   ├── index.ts           # Точка входа сервера
│   ├── routes.ts          # API маршруты
│   ├── static.ts          # Статические файлы
│   └── vite.ts            # Vite middleware (dev)
├── shared/                 # Общие типы и схемы
│   └── schema.ts
├── script/                 # Скрипты сборки
│   └── build.ts
├── bot.cjs                 # Telegram бот
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Дизайн-гайдлайны

### Design Approach

Кастомная эстетика - элегантный пастельный игровой опыт с игривой индивидуальностью.

### Design Principles

- Теплота и доступность через мягкие пастельные тона и дружелюбные анимации
- Элегантность через serif типографику для заголовков
- Индивидуальность через анимированную систему эмоций кота-маскота
- Mobile-first с бесшовной адаптацией для десктопа

### Типографика

**Семейства шрифтов:**
- Заголовки: 'Cormorant Garamond', Georgia, serif (элегантный, мягкий)
- Основной текст/UI: 'Nunito', sans-serif (дружелюбный, округлый)
- Игровые метки (X/O): 'Cormorant Garamond' (драматичный, элегантный)

**Масштаб:**
- H1: 2.5rem desktop, 1.8rem mobile
- H2: 1.25rem desktop, 1.1rem mobile
- Body: 0.95rem desktop, 0.85rem mobile
- Используйте `clamp()` для плавного масштабирования

### Цветовая палитра

Пастельные розовые/бежевые тона с мягкими зелёными акцентами для состояний успеха. Поддерживайте тёплую, доступную эстетику.

### Анимации

**Анимации кота-маскота:**
- Счастливый: Bounce вход + непрерывное покачивание
- Грустный: Простое появление fade-up
- Ничья: Анимация наклона
- Длительность: 0.5-0.6s для входов, 2s для циклов

**Игровые взаимодействия:**
- Клик по ячейке: "Pop" scale анимация (0.8 → 1.1 → 1.0)
- Hover кнопки: Подъём + усиление тени
- Плавные 0.25s переходы для всех интерактивных элементов

**Ограничение:** Анимации усиливают игривость без отвлечения. Без избыточного движения.

### Адаптивность

**Mobile (< 640px):**
- Одноколоночная компоновка
- Доска масштабируется под ширину (max 280px)
- Полноширинные карточки
- Уменьшенные отступы

**Desktop (≥ 640px):**
- Двухколоночная компоновка (игровая панель | информационная панель)
- Фиксированные максимальные ширины для оптимальных пропорций
- Увеличенные отступы и промежутки

**Landscape Mobile (height < 600px):**
- Сжатые вертикальные отступы
- Скрытие подзаголовка
- Меньшая доска (180px max)
- Уменьшенные отступы

### UX паттерны

- **Session Persistence**: LocalStorage поддерживает состояние входа
- **Emotional Feedback**: Кот-маскот предоставляет реакции на результаты игры
- **Progressive Disclosure**: Переход от экрана авторизации к игровому экрану
- **Instant Feedback**: Анимации подтверждают все действия пользователя
- **Clear State Communication**: Индикатор хода, отключённые состояния, сообщения об окончании игры

## Разработка

### Доступные команды

```bash
# Разработка
npm run dev          # Запуск dev-сервера (frontend + backend)

# Telegram бот
npm run bot          # Запуск Telegram бота

# Сборка
npm run build        # Сборка для продакшена
npm start            # Запуск продакшен-сборки

# Проверка типов
npm run check        # Проверка TypeScript

# База данных (если используется)
npm run db:push      # Применить миграции
```

### Структура компонентов

- `client/src/components/auth/` - компоненты авторизации
- `client/src/components/game/` - игровые компоненты (доска, счёт, сообщения)
- `client/src/components/layout/` - компоненты макета (header)
- `client/src/components/ui/` - базовые UI компоненты (shadcn/ui)

### Игровая логика

Основная логика игры находится в `client/src/lib/game-logic.ts`:
- `checkWinner()` - проверка победителя
- `findBestMove()` - поиск лучшего хода для ИИ (minimax)
- `CATS` - данные для кота-маскота

### Авторизация

Система авторизации использует:
- LocalStorage для сохранения сессии
- Telegram Web App API для автоматического входа
- Временные коды авторизации (хранятся в памяти, TTL 5 минут)

## Лицензия

MIT

---

**Создано для игры в крестики-нолики**
