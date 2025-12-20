import type { Express } from "express";
import { createServer, type Server } from "http";
import { gameResultSchema } from "@shared/schema";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const AUTH_BOT_SECRET = process.env.AUTH_BOT_SECRET || "";
const AUTH_CODE_TTL_SECONDS = parseInt(process.env.AUTH_CODE_TTL_SECONDS || "300", 10);

// Хранилище кодов авторизации (в памяти, можно перейти на БД)
interface AuthCodeData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  };
  expiresAt: number;
}

const authCodes = new Map<string, AuthCodeData>();

// Хранилище пользователей, которым уже выдан промокод
// В продакшене лучше использовать БД для персистентности
const usersWithPromoCode = new Set<number>();

// Очистка устаревших кодов каждые 5 минут
// Запускаем только один раз при загрузке модуля
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanupInterval() {
  if (cleanupInterval) return; // Уже запущен
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    authCodes.forEach((data, code) => {
      if (data.expiresAt < now) {
        authCodes.delete(code);
      }
    });
  }, 5 * 60 * 1000);
}

function generatePromoCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendToTelegram(message: string, chatId: string | number): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN or chatId not set");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Telegram send error:", error);
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Запускаем очистку устаревших кодов
  startCleanupInterval();
  
  // Endpoint для бота: создание кода авторизации
  app.post("/api/auth/code", async (req, res) => {
    try {
      // Optional protection: only your bot should call this endpoint.
      // Set AUTH_BOT_SECRET in env and send header X-Bot-Secret from the bot.
      if (AUTH_BOT_SECRET) {
        const headerSecret = (req.headers["x-bot-secret"] as string) || "";
        if (headerSecret !== AUTH_BOT_SECRET) {
          return res.status(403).json({ error: "forbidden" });
        }
      }

      const { telegramId, firstName, lastName, username, photoUrl } = req.body;
      
      console.log("[AUTH CODE] Request received:", { telegramId, firstName, lastName, username });
      
      if (!telegramId || !firstName) {
        console.error("[AUTH CODE] Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const code = generateAuthCode();
      const expiresAt = Date.now() + AUTH_CODE_TTL_SECONDS * 1000; // TTL из env

      authCodes.set(code, {
        user: {
          id: telegramId,
          first_name: firstName,
          last_name: lastName || undefined,
          username: username || undefined,
          photo_url: photoUrl || undefined,
          auth_date: Math.floor(Date.now() / 1000),
          hash: `auth_${code}`, // Упрощённый hash для демо
        },
        expiresAt,
      });

      console.log("[AUTH CODE] Code generated:", code, "Total codes in memory:", authCodes.size);
      res.json({ code });
    } catch (error) {
      console.error("Error creating auth code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint для сайта: проверка кода авторизации
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { code } = req.body;

      console.log("[AUTH VERIFY] Request received, code:", code);
      console.log("[AUTH VERIFY] Available codes:", Array.from(authCodes.keys()));

      if (!code || typeof code !== "string") {
        console.error("[AUTH VERIFY] Invalid code format");
        return res.status(400).json({ user: null, error: "Code is required" });
      }

      const trimmedCode = code.trim();
      const authData = authCodes.get(trimmedCode);

      if (!authData) {
        console.log("[AUTH VERIFY] Code not found:", trimmedCode);
        return res.json({ user: null });
      }

      if (authData.expiresAt < Date.now()) {
        console.log("[AUTH VERIFY] Code expired:", trimmedCode);
        authCodes.delete(trimmedCode);
        return res.json({ user: null });
      }

      console.log("[AUTH VERIFY] Code verified successfully for user:", authData.user.id);
      // Удаляем использованный код
      authCodes.delete(trimmedCode);

      res.json({ user: authData.user });
    } catch (error) {
      console.error("Error verifying auth code:", error);
      res.status(500).json({ user: null, error: "Internal server error" });
    }
  });
  
  app.post("/api/result", async (req, res) => {
    try {
      const parsed = gameResultSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          status: "error", 
          promoCode: null,
          message: "Invalid request body" 
        });
      }

      const { result, telegramId, firstName } = parsed.data;
      
      let promoCode: string | null = null;
      let sent = false;
      let alreadyHasPromo = false;

      if (result === "win") {
        // Проверяем, был ли уже выдан промокод этому пользователю
        if (telegramId && usersWithPromoCode.has(telegramId)) {
          alreadyHasPromo = true;
          
          // Отправляем напоминание игроку
          if (telegramId) {
            const reminderMessage = `🎉 Поздравляем с победой!\n\n✅ Вы уже получили свой промокод ранее. Он был отправлен вам в Telegram боте.\n\n💪 Продолжайте играть!`;
            sent = await sendToTelegram(reminderMessage, telegramId);
          }

          // Уведомляем админа о повторной победе
          if (TELEGRAM_CHAT_ID) {
            await sendToTelegram(
              `Повторная победа (промокод уже выдан)\nИгрок: ${firstName || "Неизвестный"}${telegramId ? ` (ID: ${telegramId})` : ""}`,
              TELEGRAM_CHAT_ID
            );
          }
        } else {
          // Выдаем новый промокод
          promoCode = generatePromoCode();
          
          // Сохраняем информацию о выданном промокоде
          if (telegramId) {
            usersWithPromoCode.add(telegramId);
          }

          // Отправляем промокод игроку в личные сообщения
          if (telegramId) {
            const playerMessage = `🎉 Поздравляем с победой!\n\n🎁 Ваш промокод на скидку: ${promoCode}\n\n✨ Спасибо за игру!`;
            sent = await sendToTelegram(playerMessage, telegramId);
          }

          // Уведомляем админа
          if (TELEGRAM_CHAT_ID) {
            await sendToTelegram(
              `Победа! Промокод выдан: ${promoCode}\nИгрок: ${firstName || "Неизвестный"}${telegramId ? ` (ID: ${telegramId})` : ""}`,
              TELEGRAM_CHAT_ID
            );
          }
        }
      } else if (result === "lose") {
        // Уведомляем игрока о проигрыше
        if (telegramId) {
          const playerMessage = `😔 К сожалению, вы проиграли.\n\n💪 Попробуйте ещё раз!`;
          sent = await sendToTelegram(playerMessage, telegramId);
        }

        // Уведомляем админа
        if (TELEGRAM_CHAT_ID) {
          await sendToTelegram(
            `Проигрыш\nИгрок: ${firstName || "Неизвестный"}${telegramId ? ` (ID: ${telegramId})` : ""}`,
            TELEGRAM_CHAT_ID
          );
        }
      }

      res.json({
        status: sent ? "ok" : "error",
        promoCode,
        alreadyHasPromo,
      });
    } catch (error) {
      console.error("Error processing game result:", error);
      res.status(500).json({ 
        status: "error", 
        promoCode: null 
      });
    }
  });

  return httpServer;
}
