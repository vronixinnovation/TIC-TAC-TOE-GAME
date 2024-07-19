// game.js
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('game-status');
let gameMode = localStorage.getItem('gameMode');
let currentPlayer;
let player1Name, player2Name;
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const initializeGame = () => {
    if (gameMode === 'multiplayer') {
        player1Name = localStorage.getItem('player1Name') || 'Player 1';
        player2Name = localStorage.getItem('player2Name') || 'Player 2';
        currentPlayer = localStorage.getItem('player1Choice');
    } else {
        currentPlayer = localStorage.getItem('playerChoice');
    }
    updateGameStatus();
};

const updateGameStatus = () => {
    if (gameMode === 'multiplayer') {
        gameStatus.textContent = `${currentPlayer === localStorage.getItem('player1Choice') ? player1Name : player2Name}'s turn (${currentPlayer})`;
    } else {
        gameStatus.textContent = `Your turn (${currentPlayer})`;
    }
};

const handleResultValidation = () => {
    let roundWon = false;
    let winningPlayer;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningPlayer = board[a];
            break;
        }
    }

    if (roundWon) {
        isGameActive = false;
        if (gameMode === 'multiplayer') {
            const winnerName = winningPlayer === localStorage.getItem('player1Choice') ? player1Name : player2Name;
            gameStatus.textContent = `${winnerName} has won!`;
        } else {
            gameStatus.textContent = `Player ${winningPlayer} has won!`;
        }
        return;
    }

    if (!board.includes('')) {
        isGameActive = false;
        gameStatus.textContent = 'Game is a draw!';
    }
};

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
};

const handlePlayerChange = () => {
    if (gameMode === 'multiplayer') {
        currentPlayer = currentPlayer === localStorage.getItem('player1Choice') ? localStorage.getItem('player2Choice') : localStorage.getItem('player1Choice');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
    updateGameStatus();
    if (gameMode !== 'multiplayer' && currentPlayer !== localStorage.getItem('playerChoice')) {
        setTimeout(() => {
            if (gameMode === 'easy') {
                easyMove();
            } else if (gameMode === 'hard') {
                hardMove();
            }
        }, 500);
    }
};

const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !isGameActive || (gameMode !== 'multiplayer' && currentPlayer !== localStorage.getItem('playerChoice'))) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
    if (isGameActive) {
        handlePlayerChange();
    }
};

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

const restartGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = gameMode === 'multiplayer' ? localStorage.getItem('player1Choice') : localStorage.getItem('playerChoice');
    gameStatus.textContent = '';
    cells.forEach(cell => cell.textContent = '');
    updateGameStatus();
};

const easyMove = () => {
    let availableCells = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    let randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    let cell = document.querySelector(`.cell[data-index='${randomIndex}']`);
    handleCellPlayed(cell, randomIndex);
    handleResultValidation();
    if (isGameActive) {
        handlePlayerChange();
    }
};

const minimax = (newBoard, player) => {
    const availSpots = newBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);

    if (checkWin(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWin(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }

    return bestMove;
};

const checkWin = (board, player) => {
    return winningConditions.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
};

const hardMove = () => {
    const bestSpot = minimax([...board], 'O').index;
    let cell = document.querySelector(`.cell[data-index='${bestSpot}']`);
    handleCellPlayed(cell, bestSpot);
    handleResultValidation();
    if (isGameActive) {
        handlePlayerChange();
    }
};

initializeGame();
