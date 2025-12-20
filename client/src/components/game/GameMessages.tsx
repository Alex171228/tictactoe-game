import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CatMascot } from "./CatMascot";
import { cn } from "@/lib/utils";
import type { GameState, CatMood } from "@shared/schema";

interface GameMessagesProps {
  gameState: GameState;
  promoCode: string | null;
  promoSent?: boolean;
  alreadyHasPromo?: boolean;
  onPlayAgain: () => void;
  isLoading: boolean;
}

function getMessageText(gameState: GameState): string {
  switch (gameState) {
    case "win":
      return "Поздравляем с победой!";
    case "lose":
      return "Попробуйте ещё раз!";
    case "draw":
      return "Ничья!";
    default:
      return "";
  }
}

function getCatMood(gameState: GameState): CatMood {
  switch (gameState) {
    case "win":
      return "happy";
    case "lose":
      return "sad";
    case "draw":
      return "draw";
    default:
      return "draw";
  }
}

export function GameMessages({ 
  gameState, 
  promoCode, 
  alreadyHasPromo,
  onPlayAgain, 
  isLoading 
}: Omit<GameMessagesProps, "promoSent">) {
  if (gameState === "playing") return null;

  const isWin = gameState === "win";
  const catMood = getCatMood(gameState);

  return (
    <div className="space-y-3">
      {isWin && promoCode && (
        <Card 
          className={cn(
            "bg-gradient-to-br from-[hsl(var(--success)/0.1)] to-background",
            "border-[hsl(var(--success)/0.5)]"
          )}
          data-testid="card-promo"
        >
          <CardContent className="pt-5 text-center">
            <h2 className="font-serif text-lg sm:text-xl font-medium mb-2 text-foreground">
              🎁 Ваш промокод на скидку
            </h2>
            <p 
              className="text-2xl sm:text-3xl font-bold text-[hsl(var(--success))] tracking-wider"
              data-testid="text-promo-code"
            >
              {promoCode}
            </p>
          </CardContent>
        </Card>
      )}

      {isWin && alreadyHasPromo && (
        <Card 
          className={cn(
            "bg-gradient-to-br from-[hsl(var(--muted)/0.5)] to-background",
            "border-[hsl(var(--muted)/0.8)]"
          )}
          data-testid="card-already-has-promo"
        >
          <CardContent className="pt-5 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              ✅ Вы уже выиграли свой промокод. Он отправлен вам в Telegram боте.
            </p>
          </CardContent>
        </Card>
      )}

      <Card 
        className="bg-gradient-to-br from-card to-muted/30 text-center"
        data-testid="card-message"
      >
        <CardContent className="pt-5">
          <CatMascot mood={catMood} />
          <p 
            className="font-serif text-lg sm:text-xl font-medium mt-4 text-foreground"
            data-testid="text-game-message"
          >
            {getMessageText(gameState)}
          </p>
          <Button
            onClick={onPlayAgain}
            disabled={isLoading}
            className="mt-4"
            data-testid="button-play-again"
          >
            {isLoading ? "Загрузка..." : "Попробовать снова"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
