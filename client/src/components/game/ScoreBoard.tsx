import type { GameStats } from "@shared/schema";

interface ScoreBoardProps {
  stats: GameStats;
}

interface ScoreItemProps {
  label: string;
  value: number;
  testId: string;
}

function ScoreItem({ label, value, testId }: ScoreItemProps) {
  return (
    <div className="text-center flex-1 max-w-[110px] py-2.5 px-2 bg-muted/50 rounded-xl border border-border">
      <span className="block text-[0.65rem] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
        {label}
      </span>
      <strong 
        className="text-xl sm:text-2xl font-bold text-foreground"
        data-testid={testId}
      >
        {value}
      </strong>
    </div>
  );
}

export function ScoreBoard({ stats }: ScoreBoardProps) {
  return (
    <div className="flex justify-center gap-2 sm:gap-4" data-testid="score-board">
      <ScoreItem 
        label="Мои победы" 
        value={stats.player} 
        testId="text-player-wins" 
      />
      <ScoreItem 
        label="Победы соперника" 
        value={stats.computer} 
        testId="text-computer-wins" 
      />
      <ScoreItem 
        label="Ничьи" 
        value={stats.draw} 
        testId="text-draws" 
      />
    </div>
  );
}
