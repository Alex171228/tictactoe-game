import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();

  const displayName = user 
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : "";

  return (
    <header className="text-center py-4 sm:py-5 flex-shrink-0">
      <h1 
        className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-foreground"
        data-testid="text-game-title"
      >
        Крестики-нолики
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base mt-1">
        Выиграйте и получите подарок
      </p>
      
      {user && (
        <div 
          className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground"
          data-testid="user-info"
        >
          <User className="w-4 h-4" />
          <span data-testid="text-user-name">{displayName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="ml-1 h-7 px-2"
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Выйти
          </Button>
        </div>
      )}
    </header>
  );
}
