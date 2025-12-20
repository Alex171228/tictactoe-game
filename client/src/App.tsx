import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthScreen } from "@/components/auth/AuthScreen";
import Game from "@/pages/Game";
import NotFound from "@/pages/not-found";

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "";

function AuthenticatedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen botUsername={TELEGRAM_BOT_USERNAME} />;
  }

  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AuthenticatedRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
