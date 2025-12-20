import { cn } from "@/lib/utils";
import type { Board, CellValue } from "@shared/schema";

interface GameBoardProps {
  board: Board;
  onCellClick: (index: number) => void;
  disabled: boolean;
}

interface CellProps {
  value: CellValue;
  index: number;
  onClick: () => void;
  disabled: boolean;
  isNew: boolean;
}

function Cell({ value, index, onClick, disabled, isNew }: CellProps) {
  const isDisabled = disabled || value !== null;
  
  return (
    <button
      data-testid={`cell-${index}`}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "aspect-square rounded-xl border-2 flex items-center justify-center font-serif transition-all duration-250",
        "text-4xl sm:text-5xl md:text-6xl font-semibold select-none",
        "bg-[hsl(var(--cell-bg))] border-border",
        !isDisabled && "hover:bg-[hsl(var(--cell-hover))] hover:border-primary hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        isDisabled && value && "cursor-default",
        isDisabled && !value && "cursor-not-allowed opacity-60",
        value === "X" && "text-[hsl(var(--x-mark))]",
        value === "O" && "text-[hsl(var(--o-mark))]",
        isNew && value && "animate-pop"
      )}
    >
      {value}
    </button>
  );
}

export function GameBoard({ board, onCellClick, disabled }: GameBoardProps) {
  return (
    <div 
      className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px] sm:max-w-[300px] mx-auto"
      data-testid="game-board"
    >
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          onClick={() => onCellClick(index)}
          disabled={disabled}
          isNew={value !== null}
        />
      ))}
    </div>
  );
}
