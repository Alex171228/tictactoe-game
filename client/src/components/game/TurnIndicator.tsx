import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { GameState } from "@shared/schema";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  gameState: GameState;
  onReset: () => void;
}

function getTurnText(isPlayerTurn: boolean, gameState: GameState): string {
  if (gameState !== "playing") {
    return "игра окончена";
  }
  return isPlayerTurn ? "вы" : "соперник";
}

export function TurnIndicator({ isPlayerTurn, gameState, onReset }: TurnIndicatorProps) {
  const turnText = getTurnText(isPlayerTurn, gameState);

  return (
    <div className="flex justify-between items-center gap-3 flex-wrap">
      <div className="text-sm sm:text-base text-muted-foreground font-medium">
        Сейчас ходит:{" "}
        <span 
          className="text-primary font-bold"
          data-testid="text-current-turn"
        >
          {turnText}
        </span>
      </div>
      <Button 
        variant="secondary" 
        size="sm"
        onClick={onReset}
        data-testid="button-reset"
      >
        <RotateCcw className="w-4 h-4 mr-1.5" />
        Новая игра
      </Button>
    </div>
  );
}
