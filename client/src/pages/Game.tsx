import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { GameBoard } from "@/components/game/GameBoard";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { InfoPanel } from "@/components/game/InfoPanel";
import { GameResultDialog } from "@/components/game/GameResultDialog";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkWinner, findBestMove } from "@/lib/game-logic";
import { apiRequest } from "@/lib/queryClient";
import type { Board, GameState, GameStats, GameResultResponse } from "@shared/schema";

function createEmptyBoard(): Board {
  return Array(9).fill(null);
}

export default function Game() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [stats, setStats] = useState<GameStats>({ player: 0, computer: 0, draw: 0 });
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [alreadyHasPromo, setAlreadyHasPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sendResult = useCallback(async (result: "win" | "lose" | "draw") => {
    try {
      const response = await apiRequest("POST", "/api/result", {
        result,
        telegramId: user?.id ?? null,
        firstName: user?.first_name ?? null,
      });
      const data = await response.json() as GameResultResponse;
      return data;
    } catch {
      return { status: "error" as const, promoCode: null };
    }
  }, [user]);

  const endGame = useCallback(async (winner: "X" | "O" | "draw") => {
    setIsLoading(true);
    
    if (winner === "X") {
      setGameState("win");
      setStats(prev => ({ ...prev, player: prev.player + 1 }));
      const response = await sendResult("win");
      if (response.promoCode) {
        setPromoCode(response.promoCode);
        setAlreadyHasPromo(false);
      } else if (response.alreadyHasPromo) {
        setPromoCode(null);
        setAlreadyHasPromo(true);
      }
    } else if (winner === "O") {
      setGameState("lose");
      setStats(prev => ({ ...prev, computer: prev.computer + 1 }));
      await sendResult("lose");
    } else {
      setGameState("draw");
      setStats(prev => ({ ...prev, draw: prev.draw + 1 }));
      await sendResult("draw");
    }
    
    setIsLoading(false);
    
    // Открываем модальное окно на мобильных устройствах
    if (isMobile) {
      setIsDialogOpen(true);
    }
  }, [sendResult, isMobile]);

  const computerTurn = useCallback((currentBoard: Board) => {
    const bestMove = findBestMove([...currentBoard]);
    
    if (bestMove !== undefined) {
      const newBoard = [...currentBoard];
      newBoard[bestMove] = "O";
      setBoard(newBoard);
      
      const winner = checkWinner(newBoard);
      if (winner !== null) {
        endGame(winner);
        return;
      }
    }
    
    setIsPlayerTurn(true);
  }, [endGame]);

  const handleCellClick = useCallback((index: number) => {
    if (!isPlayerTurn || gameState !== "playing" || board[index] !== null) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner !== null) {
      endGame(winner);
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => computerTurn(newBoard), 500);
  }, [isPlayerTurn, gameState, board, endGame, computerTurn]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameState("playing");
    setPromoCode(null);
    setAlreadyHasPromo(false);
    setIsDialogOpen(false);
  }, []);

  // Закрываем модальное окно, когда игра начинается заново
  useEffect(() => {
    if (gameState === "playing") {
      setIsDialogOpen(false);
    }
  }, [gameState]);

  return (
    <div 
      className="min-h-screen flex flex-col p-4 sm:p-6 max-w-4xl mx-auto"
      data-testid="screen-game"
    >
      <Header />

      <main className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 overflow-hidden">
        <section className="flex flex-col gap-4 md:flex-1 md:max-w-md">
          <Card data-testid="card-game-panel">
            <CardContent className="pt-5 space-y-4">
              <TurnIndicator
                isPlayerTurn={isPlayerTurn}
                gameState={gameState}
                onReset={resetGame}
              />
              
              <GameBoard
                board={board}
                onCellClick={handleCellClick}
                disabled={!isPlayerTurn || gameState !== "playing"}
              />
              
              <ScoreBoard stats={stats} />
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3 md:flex-1 md:max-w-sm">
          {/* На десктопе показываем InfoPanel, на мобильных скрываем */}
          {!isMobile && (
            <InfoPanel
              gameState={gameState}
              promoCode={promoCode}
              alreadyHasPromo={alreadyHasPromo}
              onPlayAgain={resetGame}
              isLoading={isLoading}
            />
          )}
        </section>
      </main>

      {/* Модальное окно для мобильных устройств */}
      {isMobile && (
        <GameResultDialog
          gameState={gameState}
          promoCode={promoCode}
          alreadyHasPromo={alreadyHasPromo}
          onPlayAgain={resetGame}
          isLoading={isLoading}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
