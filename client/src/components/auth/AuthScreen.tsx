import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import type { TelegramUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthScreenProps {
  botUsername?: string;
}

export function AuthScreen({ botUsername = "" }: AuthScreenProps) {
  const { login } = useAuth();
  const [authCode, setAuthCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isBotConfigured = botUsername && botUsername !== "YOUR_BOT_USERNAME";

  useEffect(() => {
    // Удаляем параметр logout из URL если он есть
    const url = new URL(window.location.href);
    if (url.searchParams.has('logout')) {
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }

    // Проверяем если открыто из Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      const tgUser = tg.initDataUnsafe.user;
      const user: TelegramUser = {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        auth_date: Math.floor(Date.now() / 1000),
        hash: tg.initData || "webapp",
      };
      login(user);
    }
  }, [login]);

  const handleGetCode = () => {
    if (!isBotConfigured) return;
    // Открываем бота в Telegram
    const botUrl = `https://t.me/${botUsername}?start=auth`;
    window.open(botUrl, '_blank');
  };

  const handleSubmitCode = async () => {
    if (!authCode.trim()) {
      setError("Введите код");
      return;
    }

    // Защита от повторных запросов
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/auth/verify", {
        code: authCode.trim(),
      });

      const data = await response.json() as { user: TelegramUser | null };

      if (data.user) {
        login(data.user);
        // Очищаем код после успешной авторизации
        setAuthCode("");
      } else {
        setError("Неверный код. Попробуйте ещё раз");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Ошибка проверки кода. Попробуйте ещё раз");
    } finally {
      setIsLoading(false);
    }
  };

// Автовход по ссылке вида /auth?code=XXXXX
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const codeFromUrl = params.get("code");
  if (codeFromUrl) {
    setAuthCode(codeFromUrl);
    // немного отложим, чтобы стейт применился
    setTimeout(() => {
      handleSubmitCode();
    }, 50);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleDemoLogin = () => {
    const demoUser: TelegramUser = {
      id: 123456789,
      first_name: "Демо",
      last_name: "Пользователь",
      username: "demo_user",
      auth_date: Math.floor(Date.now() / 1000),
      hash: "demo_hash",
    };
    login(demoUser);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5"
      data-testid="screen-auth"
    >
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div>
            <h1 
              className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-3"
              data-testid="text-auth-title"
            >
              Крестики-нолики
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Войдите через Telegram, чтобы получить промокод при победе
            </p>
          </div>

          {isBotConfigured ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleGetCode}
                  className="w-full"
                  size="lg"
                  data-testid="button-get-code"
                >
                  📱 Получить код в Telegram
                </Button>
                
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Введите код из Telegram"
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitCode();
                      }
                    }}
                    className="text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                    data-testid="input-auth-code"
                  />
                  
                  {error && (
                    <p className="text-xs text-destructive text-center">{error}</p>
                  )}
                  
                  <Button
                    onClick={handleSubmitCode}
                    disabled={isLoading || !authCode.trim()}
                    className="w-full"
                    data-testid="button-submit-code"
                  >
                    {isLoading ? "Проверка..." : "Войти"}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground space-y-1">
                <p>💡 Откройте сайт через бота в Telegram для автоматического входа</p>
                <p>Или нажмите кнопку выше, чтобы получить код авторизации</p>
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Telegram бот не настроен
            </p>
          )}
            
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Или попробуйте демо-режим:
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDemoLogin}
              data-testid="button-demo-login"
            >
              Войти как гость
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
