# TicTacToe with Telegram Authentication

Web application for playing tic-tac-toe with Telegram integration. Implements Telegram authentication system, promo code distribution, and game AI opponent.

## Table of Contents

- [Description](#description)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Telegram Bot Setup](#telegram-bot-setup)
- [Environment Variables](#environment-variables)
- [Server Deployment](#server-deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Design Guidelines](#design-guidelines)
- [Development](#development)

## Description

Web application for playing tic-tac-toe with Telegram integration. Supports authentication via Telegram Web App and authorization code. When a user wins, a promo code is generated and sent via Telegram API.

### Key Features

- Telegram authentication (Web App or code)
- Game against AI with minimax algorithm
- Promo code system
- Game statistics tracking
- Animated mascot
- Responsive design
- Authentication with temporary codes

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Wouter
- TanStack Query
- Framer Motion

### Backend
- Express.js + TypeScript
- WebSocket (ws)
- In-memory storage

### Telegram Bot
- node-telegram-bot-api

## Features

### Game Logic
- Minimax algorithm with alpha-beta pruning for optimal AI gameplay
- AI error probability: 30%
- Win condition checking
- Draw state handling

### Authentication
- Telegram Web App: automatic login when opened from Telegram
- Authorization code: login via regular browser
- Demo mode: testing without Telegram

### Promo Code System
- Automatic promo code generation on user victory
- Limitation: one promo code per user
- Promo code delivery via Telegram API
- Administrator notifications about game results

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd tictactoe-game-main
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in the required variables (see [Environment Variables](#environment-variables) section).

### 3. Run in Development Mode

```bash
# Start dev server (frontend + backend)
npm run dev

# In another terminal - start Telegram bot
npm run bot
```

The application will be available at `http://localhost:5000` (or the port from `PORT` in `.env`).

### 4. Build for Production

```bash
npm run build
npm start
```

## Telegram Bot Setup

### Option 1: Telegram Web App

Configure menu button in bot to open site from Telegram:

1. In @BotFather, select your bot
2. Bot Settings → Menu Button → Edit Menu Button
3. Enter button text: `Play`
4. Enter URL: `https://your-domain.com`

Advantages:
- Automatic authentication without code
- Immediate operation
- Minimal configuration

### Option 2: Authorization Code

Login via regular browser requires an authorization code.

#### Bot Configuration

The project includes `bot.cjs` script for generating authorization codes.

**On Server:**

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Verify that `.env` contains bot token:
   ```bash
   # Should be: TELEGRAM_BOT_TOKEN=your_token
   ```

3. Start bot via PM2:
   ```bash
   pm2 start bot.cjs --name "telegram-bot" --interpreter node
   pm2 save
   ```

4. Check status:
   ```bash
   pm2 status
   pm2 logs telegram-bot
   ```

**Locally (for testing):**

```bash
npm run bot
```

The bot performs the following functions:
- Handles `/start` command with instructions
- Generates and sends authorization code to user
- Calls API to create authorization code

### Recommendations

It is recommended to use both authentication methods:
1. Telegram Web App — for users opening site from Telegram
2. Authorization code — for users opening site in browser

This ensures support for all usage scenarios.

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
SITE_URL=https://your-domain.com

# Security
AUTH_BOT_SECRET=your_secret_key_here
```

### Optional

```env
# Server
PORT=5000
NODE_ENV=production

# Telegram notifications
TELEGRAM_CHAT_ID=your_chat_id_for_admin_notifications

# Authentication
AUTH_CODE_TTL_SECONDS=300

# HTTPS (for production)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
SSL_CA_PATH=/path/to/ca.pem

# Frontend
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Variable Descriptions

- `TELEGRAM_BOT_TOKEN` — bot token from @BotFather
- `SITE_URL` — your site URL (for link generation)
- `AUTH_BOT_SECRET` — secret key for API protection from bot (must match in bot and server)
- `PORT` — server port (default: 5000)
- `TELEGRAM_CHAT_ID` — chat ID for sending administrator notifications
- `AUTH_CODE_TTL_SECONDS` — authorization code lifetime in seconds (default: 300)
- `SSL_*` — paths to SSL certificates for HTTPS
- `VITE_TELEGRAM_BOT_USERNAME` — bot username (without @) for UI display

## Server Deployment

### Deployment on Ubuntu (HTTPS on port 443)

#### 1. Install Node.js (18+)

Install Node.js version 18 or higher. It is recommended to use nvm or NodeSource:
- https://github.com/nodesource/distributions

#### 2. Install Dependencies

```bash
npm ci
npm run build
```

#### 3. Create .env

```bash
cp .env.example .env
nano .env
```

Configure the following variables:
- `PORT=443`
- `SSL_CERT_PATH`, `SSL_KEY_PATH` (Cloudflare Origin cert or Let's Encrypt)
- `TELEGRAM_BOT_TOKEN`
- `SITE_URL=https://your-domain.com`
- `AUTH_BOT_SECRET` (must match the key in bot)

#### 4. Manual Start

Web server (one terminal):
```bash
npm start
```

Telegram bot (another terminal):
```bash
npm run bot
```

#### 5. Start with systemd (recommended)

Create `/etc/systemd/system/tictactoe-web.service`:

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

Create `/etc/systemd/system/tictactoe-bot.service`:

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

Enable services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tictactoe-web
sudo systemctl enable --now tictactoe-bot
```

> **Note:** binding to port 443 typically requires root or CAP_NET_BIND_SERVICE.

## API Documentation

### POST /api/auth/code

Create authorization code (called by bot).

**Headers:**
```
X-Bot-Secret: <AUTH_BOT_SECRET>
Content-Type: application/json
```

**Request Body:**
```json
{
  "telegramId": 123456789,
  "firstName": "Name",
  "lastName": "Surname",
  "username": "username",
  "photoUrl": "https://..."
}
```

**Response:**
```json
{
  "code": "123456"
}
```

### POST /api/auth/verify

Verify authorization code.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": 123456789,
    "first_name": "Name",
    "last_name": "Surname",
    "username": "username",
    "photo_url": "https://...",
    "auth_date": 1234567890,
    "hash": "auth_123456"
  }
}
```

Or if code is invalid/expired:
```json
{
  "user": null
}
```

### POST /api/result

Submit game result.

**Request Body:**
```json
{
  "result": "win" | "lose" | "draw",
  "telegramId": 123456789,
  "firstName": "Name"
}
```

**Response:**
```json
{
  "status": "ok" | "error",
  "promoCode": "12345" | null,
  "alreadyHasPromo": false
}
```

## Project Structure

```
tictactoe-game-main/
├── client/                 # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── game/       # Game components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # Base UI components (shadcn/ui)
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and logic
│   │   │   ├── auth-context.tsx
│   │   │   ├── game-logic.ts
│   │   │   └── queryClient.ts
│   │   └── hooks/          # React hooks
│   ├── index.html
│   └── public/             # Static files
├── server/                 # Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── static.ts          # Static files
│   └── vite.ts            # Vite middleware (dev)
├── shared/                 # Shared types and schemas
│   └── schema.ts
├── script/                 # Build scripts
│   └── build.ts
├── bot.cjs                 # Telegram bot
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Design Guidelines

### Design Approach

Custom aesthetic with pastel color palette and animated mascot.

### Design Principles

- Pastel color palette
- Serif typography for headings
- Animated feedback system via mascot
- Mobile-first approach with desktop adaptation

### Typography

**Font Families:**
- Headings: 'Cormorant Garamond', Georgia, serif
- Body/UI: 'Nunito', sans-serif
- Game marks (X/O): 'Cormorant Garamond'

**Type Scale:**
- H1: 2.5rem desktop, 1.8rem mobile
- H2: 1.25rem desktop, 1.1rem mobile
- Body: 0.95rem desktop, 0.85rem mobile
- Use `clamp()` for fluid responsive scaling

### Color Palette

Pastel pink and beige tones with green accents for success states.

### Animations

**Mascot Animations:**
- Win: bounce entry + continuous wiggle
- Lose: fade-up appearance
- Draw: tilt animation
- Duration: 0.5-0.6s for entries, 2s for loops

**Game Interactions:**
- Cell click: scale animation (0.8 → 1.1 → 1.0)
- Button hover: translateY(-2px) + shadow enhancement
- Transitions: 0.25s for all interactive elements

**Restraint:** Animations are used minimally, without excessive motion.

### Responsiveness

**Mobile (< 640px):**
- Single column layout
- Board scales to fit width (max 280px)
- Full-width cards
- Reduced spacing

**Desktop (≥ 640px):**
- Two-column layout (game panel | info panel)
- Fixed max widths for optimal proportions
- Increased padding and gaps

**Landscape Mobile (height < 600px):**
- Compressed vertical spacing
- Hide subtitle
- Smaller board (180px max)
- Reduced padding

### UX Patterns

- Session Persistence: LocalStorage for saving login state
- Emotional Feedback: Mascot provides visual feedback on game results
- Progressive Disclosure: Transition from authentication screen to game screen
- Instant Feedback: Animations confirm user actions
- Clear State Communication: Turn indicator, disabled states, game-over messages

## Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server (frontend + backend)

# Telegram bot
npm run bot          # Start Telegram bot

# Build
npm run build        # Build for production
npm start            # Start production build

# Type checking
npm run check        # TypeScript type checking

# Database (if used)
npm run db:push      # Apply migrations
```

### Component Structure

- `client/src/components/auth/` — authentication components
- `client/src/components/game/` — game components (board, score, messages)
- `client/src/components/layout/` — layout components (header)
- `client/src/components/ui/` — base UI components (shadcn/ui)

### Game Logic

Main game logic is located in `client/src/lib/game-logic.ts`:
- `checkWinner()` — winner checking
- `findBestMove()` — optimal move search for AI (minimax algorithm)
- `CATS` — mascot data

### Authentication

Authentication system:
- LocalStorage for session persistence
- Telegram Web App API for automatic login
- Temporary authorization codes (stored in memory, TTL 5 minutes)

## License

MIT

---

# Крестики-Нолики с Telegram Authentication

Веб-приложение для игры в крестики-нолики с интеграцией Telegram. Реализована система авторизации через Telegram, выдача промокодов и игровой ИИ-противник.

## Содержание

- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Функциональность](#функциональность)
- [Быстрый старт](#быстрый-старт)
- [Настройка Telegram бота](#настройка-telegram-бота)
- [Переменные окружения](#переменные-окружения)
- [Деплой на сервер](#деплой-на-сервер)
- [API документация](#api-документация-1)
- [Структура проекта](#структура-проекта-1)
- [Дизайн-гайдлайны](#дизайн-гайдлайны-1)
- [Разработка](#разработка-1)

## Описание

Веб-приложение для игры в крестики-нолики с интеграцией Telegram. Поддерживается авторизация через Telegram Web App и код авторизации. При победе пользователя генерируется промокод, который отправляется через Telegram API.

### Основные возможности

- Авторизация через Telegram (Web App или код)
- Игра против ИИ с алгоритмом minimax
- Система промокодов
- Отслеживание статистики игр
- Анимированный маскот
- Адаптивный дизайн
- Авторизация с временными кодами

## Технологический стек

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Wouter
- TanStack Query
- Framer Motion

### Backend
- Express.js + TypeScript
- WebSocket (ws)
- In-memory storage

### Telegram Bot
- node-telegram-bot-api

## Функциональность

### Игровая логика
- Алгоритм minimax с alpha-beta pruning для оптимальной игры ИИ
- Вероятность ошибки ИИ: 30%
- Проверка победных комбинаций
- Обработка состояния ничьей

### Авторизация
- Telegram Web App: автоматический вход при открытии из Telegram
- Код авторизации: вход через обычный браузер
- Демо-режим: тестирование без Telegram

### Система промокодов
- Автоматическая генерация промокодов при победе пользователя
- Ограничение: один промокод на пользователя
- Отправка промокодов через Telegram API
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

### Вариант 1: Telegram Web App

Настройка кнопки меню в боте для открытия сайта из Telegram:

1. В @BotFather выберите бота
2. Bot Settings → Menu Button → Edit Menu Button
3. Введите текст кнопки: `Играть`
4. Введите URL: `https://your-domain.com`

Преимущества:
- Автоматическая авторизация без кода
- Немедленная работа
- Минимальная настройка

### Вариант 2: Код авторизации

Для входа через обычный браузер требуется код авторизации.

#### Настройка бота

В проекте включен скрипт `bot.cjs` для генерации кодов авторизации.

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

Бот выполняет следующие функции:
- Обработка команды `/start` с инструкцией
- Генерация и отправка кода авторизации пользователю
- Вызов API для создания кода авторизации

### Рекомендации

Рекомендуется использовать оба варианта авторизации:
1. Telegram Web App — для пользователей, открывающих сайт из Telegram
2. Код авторизации — для пользователей, открывающих сайт в браузере

Это обеспечивает поддержку всех сценариев использования.

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

Установите Node.js версии 18 или выше. Рекомендуется использовать nvm или NodeSource:
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

Настройте следующие переменные:
- `PORT=443`
- `SSL_CERT_PATH`, `SSL_KEY_PATH` (Cloudflare Origin cert или Let's Encrypt)
- `TELEGRAM_BOT_TOKEN`
- `SITE_URL=https://your-domain.com`
- `AUTH_BOT_SECRET` (должен совпадать с ключом в боте)

#### 4. Запуск (вручную)

Веб-сервер (один терминал):
```bash
npm start
```

Telegram бот (другой терминал):
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

Применена кастомная эстетика с пастельной цветовой палитрой и анимированным маскотом.

### Design Principles

- Пастельная цветовая палитра
- Serif типографика для заголовков
- Анимированная система обратной связи через маскота
- Mobile-first подход с адаптацией для десктопа

### Типографика

**Семейства шрифтов:**
- Заголовки: 'Cormorant Garamond', Georgia, serif
- Основной текст/UI: 'Nunito', sans-serif
- Игровые метки (X/O): 'Cormorant Garamond'

**Масштаб:**
- H1: 2.5rem desktop, 1.8rem mobile
- H2: 1.25rem desktop, 1.1rem mobile
- Body: 0.95rem desktop, 0.85rem mobile
- Используйте `clamp()` для плавного масштабирования

### Цветовая палитра

Пастельные розовые и бежевые тона с зелёными акцентами для состояний успеха.

### Анимации

**Анимации маскота:**
- Победа: bounce вход + непрерывное покачивание
- Поражение: fade-up появление
- Ничья: анимация наклона
- Длительность: 0.5-0.6s для входов, 2s для циклов

**Игровые взаимодействия:**
- Клик по ячейке: scale анимация (0.8 → 1.1 → 1.0)
- Hover кнопки: translateY(-2px) + усиление тени
- Переходы: 0.25s для всех интерактивных элементов

**Ограничение:** Анимации используются минимально, без избыточного движения.

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

- Session Persistence: LocalStorage для сохранения состояния входа
- Emotional Feedback: Маскот предоставляет визуальную обратную связь на результаты игры
- Progressive Disclosure: Переход от экрана авторизации к игровому экрану
- Instant Feedback: Анимации подтверждают действия пользователя
- Clear State Communication: Индикатор хода, отключённые состояния, сообщения об окончании игры

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
- `checkWinner()` — проверка победителя
- `findBestMove()` — поиск оптимального хода для ИИ (алгоритм minimax)
- `CATS` — данные для маскота

### Авторизация

Система авторизации:
- LocalStorage для сохранения сессии
- Telegram Web App API для автоматического входа
- Временные коды авторизации (хранятся в памяти, TTL 5 минут)

## Лицензия

MIT
