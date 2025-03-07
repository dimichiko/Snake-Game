// HTML Elements
const board = document.getElementById('board');
const scoreBoard = document.getElementById('scoreBoard');
const highScoreBoard = document.getElementById('highScoreBoard');
const levelDisplay = document.getElementById('level');
const easyButton = document.getElementById('easy');
const mediumButton = document.getElementById('medium');
const hardButton = document.getElementById('hard');
const pauseButton = document.getElementById('pause');
const restartButton = document.getElementById('restart');
const gameOverSign = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const timerDisplay = document.getElementById('timer');
const foodSound = document.getElementById('foodSound');
const gameOverSound = document.getElementById('gameOverSound');

// Game settings
const boardSize = 10;
const initialGameSpeeds = {
    easy: 200,
    medium: 150,
    hard: 100
};
const speedIncrease = 5;
const levels = {
    easy: [5, 10, 15, 20],
    medium: [3, 6, 9, 12],
    hard: [2, 4, 6, 8]
};
const squareTypes = {
    emptySquare: 0,
    snakeSquare: 1,
    foodSquare: 2
};
const directions = {
    ArrowUp: -10,
    ArrowDown: 10,
    ArrowRight: 1,
    ArrowLeft: -1,
};

// Game variables
let snake;
let score;
let highScore = localStorage.getItem('highScore') || 0;
let direction;
let boardSquares;
let emptySquares;
let moveInterval;
let isPaused = false;
let startTime;
let difficulty;
let currentLevel = 1;

const drawSnake = () => {
    snake.forEach(square => drawSquare(square, 'snakeSquare'));
}

const drawSquare = (square, type) => {
    const [row, column] = square.split('');
    boardSquares[row][column] = squareTypes[type];
    const squareElement = document.getElementById(square);
    squareElement.setAttribute('class', `square ${type}`);

    if (type === 'emptySquare') {
        emptySquares.push(square);
    } else {
        if (emptySquares.indexOf(square) !== -1) {
            emptySquares.splice(emptySquares.indexOf(square), 1);
        }
    }
}

const moveSnake = () => {
    if (isPaused) return;

    const newSquare = String(
        Number(snake[snake.length - 1]) + directions[direction])
        .padStart(2, '0');
    const [row, column] = newSquare.split('');

    if (newSquare < 0 ||
        newSquare > boardSize * boardSize ||
        (direction === 'ArrowRight' && column == 0) ||
        (direction === 'ArrowLeft' && column == 9 ||
            boardSquares[row][column] === squareTypes.snakeSquare)) {
        gameOver();
    } else {
        snake.push(newSquare);
        if (boardSquares[row][column] === squareTypes.foodSquare) {
            addFood();
            foodSound.play();
        } else {
            const emptySquare = snake.shift();
            drawSquare(emptySquare, 'emptySquare');
        }
        drawSnake();
    }
}

const addFood = () => {
    score++;
    updateScore();
    checkLevelUp();
    createRandomFood();
}

const checkLevelUp = () => {
    const levelThresholds = levels[difficulty];
    if (levelThresholds && score >= levelThresholds[currentLevel - 1]) {
        currentLevel++;
        levelDisplay.innerText = currentLevel;
        clearInterval(moveInterval);
        moveInterval = setInterval(moveSnake, initialGameSpeeds[difficulty] - (speedIncrease * currentLevel));
    }
}

const gameOver = () => {
    gameOverSound.play();
    gameOverSign.style.display = 'block';
    clearInterval(moveInterval);
    startButton.disabled = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreBoard.innerText = highScore;
    }
}

const setDirection = newDirection => {
    direction = newDirection;
}

const directionEvent = key => {
    switch (key.code) {
        case 'ArrowUp':
            direction != 'ArrowDown' && setDirection(key.code);
            break;
        case 'ArrowDown':
            direction != 'ArrowUp' && setDirection(key.code);
            break;
        case 'ArrowLeft':
            direction != 'ArrowRight' && setDirection(key.code);
            break;
        case 'ArrowRight':
            direction != 'ArrowLeft' && setDirection(key.code);
            break;
        case 'Space':
            togglePause();
            break;
    }
}

const createRandomFood = () => {
    const randomEmptySquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    drawSquare(randomEmptySquare, 'foodSquare');
}

const updateScore = () => {
    scoreBoard.innerText = score;
    highScoreBoard.innerText = highScore;
}

const createBoard = () => {
    boardSquares.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            const squareValue = `${rowIndex}${columnIndex}`;
            const squareElement = document.createElement('div');
            squareElement.setAttribute('class', 'square emptySquare');
            squareElement.setAttribute('id', squareValue);
            board.appendChild(squareElement);
            emptySquares.push(squareValue);
        })
    })
}

const setGame = () => {
    snake = ['00', '01', '02', '03'];
    score = snake.length;
    direction = 'ArrowRight';
    boardSquares = Array.from(Array(boardSize), () => new Array(boardSize).fill(squareTypes.emptySquare));
    board.innerHTML = '';
    emptySquares = [];
    createBoard();
    startTime = Date.now();
    updateTimer();
    currentLevel = 1;
    levelDisplay.innerText = currentLevel;
}

const startGame = (selectedDifficulty) => {
    difficulty = selectedDifficulty;
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    setGame();
    gameOverSign.style.display = 'none';
    drawSnake();
    updateScore();
    createRandomFood();
    document.addEventListener('keydown', directionEvent);
    moveInterval = setInterval(() => moveSnake(), initialGameSpeeds[difficulty]);
    setInterval(updateTimer, 1000);
}

const togglePause = () => {
    isPaused = !isPaused;
    pauseButton.innerText = isPaused ? 'Resume' : 'Pause';
}

const updateTimer = () => {
    if (!isPaused) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.innerText = elapsedTime;
    }
}

easyButton.addEventListener('click', () => startGame('easy'));
mediumButton.addEventListener('click', () => startGame('medium'));
hardButton.addEventListener('click', () => startGame('hard'));
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => startGame(difficulty));