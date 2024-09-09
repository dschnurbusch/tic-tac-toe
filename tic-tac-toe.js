// Gameboard module using IIFE
const Gameboard = (function() {
    let _board = Array(9).fill(null);

    const getBoard = () => [..._board];

    const makeMove = (index, player) => {
        if (index >= 0 && index < 9 && _board[index] === null) {
            _board[index] = player;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        _board = Array(9).fill(null);
    };

    return {
        getBoard,
        makeMove,
        resetBoard
    };
})();

// Player factory function
const Player = (name, marker) => {
    let _name = name;
    const getName = () => _name;
    const setName = (newName) => { _name = newName; };
    const getMarker = () => marker;

    return {
        getName,
        setName,
        getMarker
    };
};

// Create player objects
const player1 = Player('Player 1', 'X');
const player2 = Player('Player 2', 'O');

// Game state module using IIFE
const GameState = (function() {
    let _currentPlayer = player1;
    let _gameOver = false;

    const getCurrentPlayer = () => _currentPlayer;

    const switchPlayer = () => {
        _currentPlayer = _currentPlayer === player1 ? player2 : player1;
    };

    const resetGame = () => {
        _currentPlayer = player1;
        _gameOver = false;
        Gameboard.resetBoard();
    };

    const setGameOver = () => {
        _gameOver = true;
    };

    const isGameOver = () => _gameOver;

    return {
        getCurrentPlayer,
        switchPlayer,
        resetGame,
        setGameOver,
        isGameOver
    };
})();

// DOM manipulation module using IIFE
const DOMHandler = (function() {
    const _container = document.querySelector('.container');
    let _cells = [];

    const _createBoard = () => {
        const board = document.createElement('div');
        board.classList.add('board');
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', _handleCellClick);
            board.appendChild(cell);
            _cells.push(cell);
        }
        _container.appendChild(board);
    };

    const _handleCellClick = (event) => {
        if (GameState.isGameOver()) return;

        const index = event.target.dataset.index;
        const currentPlayer = GameState.getCurrentPlayer();
        if (Gameboard.makeMove(index, currentPlayer.getMarker())) {
            _updateCell(index, currentPlayer.getMarker());
            if (_checkWinner()) {
                GameState.setGameOver();
                _displayResult(`${currentPlayer.getName()} wins!`);
            } else if (_checkDraw()) {
                GameState.setGameOver();
                _displayResult("It's a draw!");
            } else {
                GameState.switchPlayer();
                _updateTurnDisplay();
            }
        }
    };

    const _updateCell = (index, marker) => {
        _cells[index].textContent = marker;
    };

    const _checkWinner = () => {
        const board = Gameboard.getBoard();
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => 
            board[pattern[0]] && 
            board[pattern[0]] === board[pattern[1]] && 
            board[pattern[0]] === board[pattern[2]]
        );
    };

    const _checkDraw = () => {
        return Gameboard.getBoard().every(cell => cell !== null);
    };

    const _displayResult = (message) => {
        const resultDisplay = document.createElement('div');
        resultDisplay.classList.add('result');
        resultDisplay.textContent = message;
        _container.appendChild(resultDisplay);

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'Play Again';
        playAgainButton.addEventListener('click', _resetGame);
        _container.appendChild(playAgainButton);
    };

    const _resetGame = () => {
        GameState.resetGame();
        _cells.forEach(cell => {
            cell.textContent = '';
        });
        _container.innerHTML = '';
        _cells = [];
        initializeGame();
    };

    const _createTurnDisplay = () => {
        const turnDisplay = document.createElement('div');
        turnDisplay.classList.add('turn-display');
        _container.appendChild(turnDisplay);
        _updateTurnDisplay();
    };

    const _updateTurnDisplay = () => {
        const turnDisplay = document.querySelector('.turn-display');
        const currentPlayer = GameState.getCurrentPlayer();
        turnDisplay.textContent = `${currentPlayer.getName()}'s turn (${currentPlayer.getMarker()})`;
    };

    const _createNameInputs = () => {
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('name-inputs');

        const createInput = (player, placeholder) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.addEventListener('change', (e) => {
                player.setName(e.target.value || placeholder);
                _updateTurnDisplay();
            });
            return input;
        };

        inputContainer.appendChild(createInput(player1, 'Player 1'));
        inputContainer.appendChild(createInput(player2, 'Player 2'));

        _container.appendChild(inputContainer);
    };

    const _createRestartButton = () => {
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.classList.add('restart-button');
        restartButton.addEventListener('click', _resetGame);
        _container.appendChild(restartButton);
    };

    const initializeGame = () => {
        _createNameInputs();
        _createBoard();
        _createTurnDisplay();
        _createRestartButton();
    };

    return {
        initializeGame
    };
})();

// Initialize the game
DOMHandler.initializeGame();
