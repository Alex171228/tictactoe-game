# Deploy on Ubuntu (HTTPS on port 443)

## 1) Install Node.js (18+)
Use your preferred method (nvm, NodeSource, etc.). Example with NodeSource:
- https://github.com/nodesource/distributions

## 2) Install dependencies
```bash
npm ci
npm run build
```

## 3) Create .env
```bash
cp .env.example .env
nano .env
```

Set:
- PORT=443
- SSL_CERT_PATH, SSL_KEY_PATH (Cloudflare Origin cert or Let's Encrypt)
- TELEGRAM_BOT_TOKEN
- SITE_URL=https://asukaeva2.com
- AUTH_BOT_SECRET (same value used by the bot)

## 4) Run (one terminal)
Web server:
```bash
npm start
```

Bot (another terminal):
```bash
npm run bot
```

## 5) Run with systemd (recommended)
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

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tictactoe-web
sudo systemctl enable --now tictactoe-bot
```

> Note: binding to port 443 typically requires root or CAP_NET_BIND_SERVICE.
