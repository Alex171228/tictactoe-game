import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Предзагружаем скрипт Telegram виджета сразу, до рендера React
const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
if (botUsername && botUsername !== "YOUR_BOT_USERNAME") {
  // Загружаем скрипт в кэш браузера сразу
  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.async = true;
  script.crossOrigin = "anonymous";
  // Помечаем что скрипт уже загружается
  (window as any).__telegramWidgetPreloading = true;
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
