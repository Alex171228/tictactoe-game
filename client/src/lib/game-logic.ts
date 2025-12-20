import type { Board, CellValue, CatMood, CatData } from "@shared/schema";

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkWinner(board: Board): CellValue | "draw" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(v => v !== null)) return "draw";
  return null;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const result = checkWinner(board);
  
  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const evalScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const evalScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

const MISTAKE_CHANCE = 0.30;

export function findBestMove(board: Board): number | undefined {
  const moves: { index: number; score: number }[] = [];
  
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "O";
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      moves.push({ index: i, score });
    }
  }
  
  if (moves.length === 0) return undefined;
  
  moves.sort((a, b) => b.score - a.score);
  
  const bestScore = moves[0].score;
  const bestMoves = moves.filter(m => m.score === bestScore);
  
  const playerCanWin = moves.some(m => {
    board[m.index] = "X";
    const result = checkWinner(board);
    board[m.index] = null;
    return result === "X";
  });
  
  const canWinNow = bestScore >= 9;
  
  if (canWinNow || playerCanWin) {
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
  }
  
  if (Math.random() < MISTAKE_CHANCE && moves.length > 1) {
    const notBestMoves = moves.filter(m => m.score < bestScore);
    if (notBestMoves.length > 0) {
      const midIndex = Math.floor(notBestMoves.length / 2);
      const reasonableMoves = notBestMoves.slice(0, midIndex + 1);
      return reasonableMoves[Math.floor(Math.random() * reasonableMoves.length)].index;
    }
  }
  
  return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
}

export const CATS: Record<CatMood, CatData> = {
  happy: {
    faces: ["(=^･ω･^=)", "(=^-ω-^=)", "ฅ^•ﻌ•^ฅ", "(=①ω①=)", "(^・ω・^)", "(=^･^=)"],
    messages: [
      "Мяу! Ты просто супер!",
      "Мур-мур! Так держать!",
      "Ты лучшая! Мяяяу~",
      "Победа! Угости меня вкусняшкой~",
      "Я знал(а), что ты справишься!",
      "Браво! Мур-р-р~"
    ]
  },
  sad: {
    faces: ["(=ㅇ︿ㅇ=)", "(=;ェ;=)", "(=･ｪ･=)", "(=｡ェ｡=)", "(=T_T=)"],
    messages: [
      "Не грусти! Попробуй ещё раз~",
      "Мяу... В следующий раз точно получится!",
      "Я верю в тебя! Давай ещё разок?",
      "Ничего страшного! Я тебя поддержу~",
      "Мур... Ты всё равно молодец!"
    ]
  },
  draw: {
    faces: ["(=･ω･=)", "(=^･ｪ･^=)", "(=｀ω´=)", "ฅ(^ω^ฅ)"],
    messages: [
      "Ничья — тоже неплохо, мяу!",
      "Достойная игра! Мур~",
      "Вы оба молодцы!",
      "Хм, интересная партия! Ещё?"
    ]
  }
};

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
