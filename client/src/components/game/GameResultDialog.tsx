import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CatMascot } from "./CatMascot";
import { cn } from "@/lib/utils";
import type { GameState, CatMood } from "@shared/schema";

interface GameResultDialogProps {
  gameState: GameState;
  promoCode: string | null;
  alreadyHasPromo?: boolean;
  onPlayAgain: () => void;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function GameResultDialog({
  gameState,
  promoCode,
  alreadyHasPromo,
  onPlayAgain,
  isLoading,
  open,
  onOpenChange,
}: GameResultDialogProps) {
  if (gameState === "playing") return null;

  const isWin = gameState === "win";
  const catMood = getCatMood(gameState);

  const handlePlayAgain = () => {
    onPlayAgain();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-0 gap-0">
        <div className="p-6 space-y-4">
          {isWin && promoCode && (
            <Card
              className={cn(
                "bg-gradient-to-br from-[hsl(var(--success)/0.1)] to-background",
                "border-[hsl(var(--success)/0.5)]"
              )}
              data-testid="card-promo-dialog"
            >
              <CardContent className="pt-5 text-center">
                <h2 className="font-serif text-lg sm:text-xl font-medium mb-2 text-foreground">
                  🎁 Ваш промокод на скидку
                </h2>
                <p
                  className="text-2xl sm:text-3xl font-bold text-[hsl(var(--success))] tracking-wider"
                  data-testid="text-promo-code-dialog"
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
              data-testid="card-already-has-promo-dialog"
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
            data-testid="card-message-dialog"
          >
            <CardContent className="pt-5">
              <CatMascot mood={catMood} />
              <p
                className="font-serif text-lg sm:text-xl font-medium mt-4 text-foreground"
                data-testid="text-game-message-dialog"
              >
                {getMessageText(gameState)}
              </p>
              <Button
                onClick={handlePlayAgain}
                disabled={isLoading}
                className="mt-4 w-full"
                data-testid="button-play-again-dialog"
              >
                {isLoading ? "Загрузка..." : "Попробовать снова"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

