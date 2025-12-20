// Экраны
const authScreen = document.getElementById('authScreen');
const gameScreen = document.getElementById('gameScreen');
const userInfoElement = document.getElementById('userInfo');

// Игровые элементы
const boardElement = document.getElementById('board');
const currentPlayerLabel = document.getElementById('currentPlayerLabel');
const resetBtn = document.getElementById('resetBtn');
const promoCard = document.getElementById('promoCard');
const promoCodeElement = document.getElementById('promoCode');
const messageCard = document.getElementById('messageCard');
const messageText = document.getElementById('messageText');
const catContainer = document.getElementById('catContainer');
const catMessage = document.getElementById('catMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const playerWinsElement = document.getElementById('playerWins');
const computerWinsElement = document.getElementById('computerWins');
const drawsElement = document.getElementById('draws');

// Данные авторизованного пользователя
let currentUser = null;

// Проверяем сохранённую сессию
function checkSavedSession() {
  const saved = localStorage.getItem('tg_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showGameScreen();
    } catch (e) {
      localStorage.removeItem('tg_user');
    }
  }
}

// Callback для Telegram Login Widget
window.onTelegramAuth = function(user) {
  currentUser = user;
  localStorage.setItem('tg_user', JSON.stringify(user));
  showGameScreen();
};

// Показать игровой экран
function showGameScreen() {
  authScreen.hidden = true;
  gameScreen.hidden = false;
  
  const name = currentUser.first_name + (currentUser.last_name ? ' ' + currentUser.last_name : '');
  userInfoElement.innerHTML = `👤 ${name} <button class="btn-logout" onclick="logout()">Выйти</button>`;
  
  initBoard();
}

// Выход
function logout() {
  localStorage.removeItem('tg_user');
  currentUser = null;
  authScreen.hidden = false;
  gameScreen.hidden = true;
}

// Котики и их фразы
const CATS = {
  happy: {
    faces: ['(=^･ω･^=)', '(=^-ω-^=)', 'ฅ^•ﻌ•^ฅ', '(=①ω①=)', '(^・ω・^)', '(=^･^=)'],
    messages: [
      'Мяу! Ты просто супер! ♡',
      'Мур-мур! Так держать!',
      'Ты лучшая! Мяяяу~',
      'Победа! Угости меня вкусняшкой~',
      'Я знал(а), что ты справишься!',
      'Браво! Мур-р-р~'
    ]
  },
  sad: {
    faces: ['(=ㅇ︿ㅇ=)', '(=;ェ;=)', '(=･ｪ･=)', '(=｡ェ｡=)', '(=T_T=)'],
    messages: [
      'Не грусти! Попробуй ещё раз~',
      'Мяу... В следующий раз точно получится!',
      'Я верю в тебя! Давай ещё разок?',
      'Ничего страшного! Я тебя поддержу~',
      'Мур... Ты всё равно молодец!'
    ]
  },
  draw: {
    faces: ['(=･ω･=)', '(=^･ｪ･^=)', '(=｀ω´=)', 'ฅ(^ω^ฅ)'],
    messages: [
      'Ничья — тоже неплохо, мяу!',
      'Достойная игра! Мур~',
      'Вы оба молодцы!',
      'Хм, интересная партия! Ещё?'
    ]
  }
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showCat(type) {
  const cat = CATS[type];
  catContainer.textContent = getRandomItem(cat.faces);
  catContainer.className = 'cat-container ' + type;
  catMessage.textContent = getRandomItem(cat.messages);
}

let board, gameOver, isPlayerTurn;
let stats = { player: 0, computer: 0, draw: 0 };

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
  [0, 4, 8], [2, 4, 6]             // диагонали
];

function initBoard() {
  board = Array(9).fill(null);
  boardElement.innerHTML = '';
  gameOver = false;
  isPlayerTurn = true;
  promoCard.hidden = true;
  messageCard.hidden = true;
  currentPlayerLabel.textContent = 'вы';

  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'cell';
    c.dataset.index = i;
    c.onclick = onCellClick;
    boardElement.appendChild(c);
  }
}

function onCellClick(e) {
  if (!isPlayerTurn || gameOver) return;
  const i = e.target.dataset.index;
  if (board[i]) return;
  move(i, 'X');

  let w = checkWinner(board);
  if (w !== null) return end(w);

  isPlayerTurn = false;
  currentPlayerLabel.textContent = 'соперник';
  setTimeout(() => { computerTurn(); }, 500);
}

function move(i, s) {
  board[i] = s;
  const c = boardElement.querySelector(`[data-index="${i}"]`);
  c.textContent = s;
  c.classList.add('disabled', s === 'X' ? 'x-mark' : 'o-mark', 'pop');
}

// Проверка победителя: возвращает 'X', 'O', 'draw' или null (игра продолжается)
function checkWinner(b) {
  for (const [a, x, c] of WIN_LINES) {
    if (b[a] && b[a] === b[x] && b[a] === b[c]) return b[a];
  }
  if (b.every(v => v)) return 'draw';
  return null;
}

// ============================================
// УМНЫЙ AI: Алгоритм Minimax
// ============================================

function minimax(b, depth, isMaximizing, alpha, beta) {
  const result = checkWinner(b);
  
  // Терминальные состояния
  if (result === 'O') return 10 - depth;  // Компьютер победил (лучше быстрее)
  if (result === 'X') return depth - 10;  // Игрок победил (хуже)
  if (result === 'draw') return 0;        // Ничья
  
  if (isMaximizing) {
    // Ход компьютера (O) - максимизируем счёт
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = 'O';
        const eval_ = minimax(b, depth + 1, false, alpha, beta);
        b[i] = null;
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break; // Альфа-бета отсечение
      }
    }
    return maxEval;
  } else {
    // Ход игрока (X) - минимизируем счёт
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = 'X';
        const eval_ = minimax(b, depth + 1, true, alpha, beta);
        b[i] = null;
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break; // Альфа-бета отсечение
      }
    }
    return minEval;
  }
}

// Вероятность "ошибки" компьютера (0.0 - 1.0)
// 0.30 = 30% шанс сделать не лучший ход
const MISTAKE_CHANCE = 0.30;

function findBestMove() {
  const moves = [];
  
  // Оцениваем все возможные ходы
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      moves.push({ index: i, score });
    }
  }
  
  // Сортируем по убыванию (лучшие ходы первыми)
  moves.sort((a, b) => b.score - a.score);
  
  // Если нет ходов
  if (moves.length === 0) return undefined;
  
  const bestScore = moves[0].score;
  const bestMoves = moves.filter(m => m.score === bestScore);
  
  // Проверяем, может ли игрок выиграть следующим ходом
  const playerCanWin = moves.some(m => {
    board[m.index] = 'X';
    const result = checkWinner(board);
    board[m.index] = null;
    return result === 'X';
  });
  
  // Проверяем, может ли компьютер выиграть этим ходом
  const canWinNow = bestScore >= 9;
  
  // Не ошибаемся, если можем выиграть или если игрок может выиграть
  if (canWinNow || playerCanWin) {
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
  }
  
  // С некоторой вероятностью делаем не лучший ход
  if (Math.random() < MISTAKE_CHANCE && moves.length > 1) {
    // Выбираем случайный ход из не лучших (но не самый худший)
    const notBestMoves = moves.filter(m => m.score < bestScore);
    if (notBestMoves.length > 0) {
      // Предпочитаем средние ходы, не самые плохие
      const midIndex = Math.floor(notBestMoves.length / 2);
      const reasonableMoves = notBestMoves.slice(0, midIndex + 1);
      return reasonableMoves[Math.floor(Math.random() * reasonableMoves.length)].index;
    }
  }
  
  // Обычно выбираем лучший ход
  return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
}

function computerTurn() {
  const bestMove = findBestMove();
  
  if (bestMove !== undefined) {
    move(bestMove, 'O');
  }
  
  let w = checkWinner(board);
  if (w !== null) return end(w);
  
  isPlayerTurn = true;
  currentPlayerLabel.textContent = 'вы';
}

// ============================================

// Отправка результата на сервер (промокод генерируется на сервере)
async function sendResult(result) {
  try {
    const response = await fetch('/api/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        result,
        telegramId: currentUser ? currentUser.id : null,
        firstName: currentUser ? currentUser.first_name : null
      })
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Ошибка связи с сервером:', e);
    return { status: 'error', promoCode: null };
  }
}

async function end(winner) {
  gameOver = true;
  
  if (winner === 'X') {
    stats.player++;
    showCat('happy');
    
    // Получаем промокод с сервера
    const { status, promoCode } = await sendResult('win');
    
    messageText.textContent = 'Поздравляем с победой!';
    if (status === 'ok') {
      promoCodeElement.textContent = `Промокод ${promoCode} отправлен вам в Telegram ♡`;
    } else {
      promoCodeElement.textContent = `Ваш промокод: ${promoCode}`;
    }
    promoCard.hidden = false;
    
  } else if (winner === 'O') {
    stats.computer++;
    messageText.textContent = 'Попробуйте ещё раз!';
    showCat('sad');
    await sendResult('lose');
  } else {
    stats.draw++;
    messageText.textContent = 'Ничья!';
    showCat('draw');
    await sendResult('draw');
  }
  
  messageCard.hidden = false;
  playAgainBtn.hidden = false;
  currentPlayerLabel.textContent = 'игра окончена';
  
  playerWinsElement.textContent = stats.player;
  computerWinsElement.textContent = stats.computer;
  drawsElement.textContent = stats.draw;
}

resetBtn.onclick = initBoard;
playAgainBtn.onclick = initBoard;

// Проверяем сессию при загрузке
checkSavedSession();
