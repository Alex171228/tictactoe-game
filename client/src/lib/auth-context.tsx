import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { TelegramUser } from "@shared/schema";

interface AuthContextType {
  user: TelegramUser | null;
  login: (user: TelegramUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tg_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (userData: TelegramUser) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Очищаем все cookies которые можем (к сожалению, cookies от telegram.org недоступны из-за CORS)
    // Но очистим sessionStorage и добавим флаг
    sessionStorage.clear();
    sessionStorage.setItem("telegram_logout", "true");
    // Добавляем параметр к URL чтобы при следующей загрузке виджет не использовал кэш
    const url = new URL(window.location.href);
    url.searchParams.set('logout', Date.now().toString());
    // Перезагружаем страницу с новым параметром
    window.location.href = url.toString();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
