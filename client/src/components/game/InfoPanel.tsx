import { Card, CardContent } from "@/components/ui/card";
import { GameMessages } from "./GameMessages";
import type { GameState } from "@shared/schema";

interface InfoPanelProps {
  gameState: GameState;
  promoCode: string | null;
  alreadyHasPromo?: boolean;
  onPlayAgain: () => void;
  isLoading: boolean;
}

export function InfoPanel({ 
  gameState, 
  promoCode, 
  alreadyHasPromo,
  onPlayAgain, 
  isLoading 
}: InfoPanelProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
      <Card data-testid="card-info">
        <CardContent className="pt-5">
          <h2 className="font-serif text-base sm:text-lg font-medium mb-1.5 text-foreground">
            Условия промокода
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Обыграйте соперника и получите персональный промокод на скидку
          </p>
        </CardContent>
      </Card>

      <GameMessages
        gameState={gameState}
        promoCode={promoCode}
        alreadyHasPromo={alreadyHasPromo}
        onPlayAgain={onPlayAgain}
        isLoading={isLoading}
      />
    </div>
  );
}
