// GYARU STYLE CHECKERS GAME - COMPLETE RULES
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        board: [],
        currentPlayer: 'red', // red starts
        selectedPiece: null,
        possibleMoves: [],
        forcedCaptures: [],
        moveHistory: [],
        redoHistory: [],
        scores: { red: 0, black: 0, draws: 0 },
        aiEnabled: false,
        gameOver: false,
        multiCaptureEnabled: false,
        kingPieceSymbol: '♔'
    };

    // Initialize the game
    function initGame() {
        createBoard();
        setupInitialPosition();
        renderBoard();
        updateGameInfo();
        createFloatingElements();
        setupEventListeners();
    }

    // Create checkers board squares
    function createBoard() {
        const board = document.getElementById('checkers-board');
        board.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `checker-square ${(row + col) % 2 === 0 ? 'checker-light' : 'checker-dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Only dark squares are playable in checkers
                if ((row + col) % 2 !== 0) {
                    square.addEventListener('click', () => handleSquareClick(row, col));
                }
                
                board.appendChild(square);
            }
        }
    }

    // Setup initial checkers position
    function setupInitialPosition() {
        gameState.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Setup red pieces (top three rows)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 !== 0) {
                    gameState.board[row][col] = { type: 'normal', color: 'red' };
                }
            }
        }
        
        // Setup black pieces (bottom three rows)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 !== 0) {
                    gameState.board[row][col] = { type: 'normal', color: 'black' };
                }
            }
        }
        
        // Reset game state
        gameState.currentPlayer = 'red';
        gameState.selectedPiece = null;
        gameState.possibleMoves = [];
        gameState.forcedCaptures = [];
        gameState.gameOver = false;
        
        // Check for forced captures at start
        checkForcedCaptures();
    }

    // Render the board with pieces
    function renderBoard() {
        const squares = document.querySelectorAll('.checker-square');
        
        // Reset all squares
        squares.forEach(square => {
            square.classList.remove('selected', 'possible-move', 'possible-capture');
            square.innerHTML = '';
        });
        
        // Render pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                const square = document.querySelector(`.checker-square[data-row="${row}"][data-col="${col}"]`);
                
                if (piece) {
                    const pieceDiv = document.createElement('div');
                    pieceDiv.className = `piece piece-${piece.color}`;
                    if (piece.type === 'king') {
                        pieceDiv.classList.add('king');
                    }
                    square.appendChild(pieceDiv);
                }
            }
        }
        
        // Highlight selected piece and possible moves
        if (gameState.selectedPiece) {
            const { row, col } = gameState.selectedPiece;
            const selectedSquare = document.querySelector(`.checker-square[data-row="${row}"][data-col="${col}"]`);
            selectedSquare.classList.add('selected');
            
            gameState.possibleMoves.forEach(move => {
                const moveSquare = document.querySelector(`.checker-square[data-row="${move.row}"][data-col="${move.col}"]`);
                if (move.capture) {
                    moveSquare.classList.add('possible-capture');
                } else {
                    moveSquare.classList.add('possible-move');
                }
            });
        }
    }

    // Handle square click
    function handleSquareClick(row, col) {
        if (gameState.gameOver) return;
        
        const piece = gameState.board[row][col];
        
        // If a piece is selected
        if (gameState.selectedPiece) {
            const { row: sr, col: sc } = gameState.selectedPiece;
            
            // Check if clicked on a possible move
            const moveIndex = gameState.possibleMoves.findIndex(
                move => move.row === row && move.col === col
            );
            
            if (moveIndex !== -1) {
                const move = gameState.possibleMoves[moveIndex];
                makeMove(sr, sc, row, col, move.capture);
                return;
            }
            
            // If clicked on another piece of current player and it has forced captures
            if (piece && piece.color === gameState.currentPlayer) {
                // Check if this piece has forced captures
                const pieceForcedCaptures = getForcedCapturesForPiece(row, col);
                if (pieceForcedCaptures.length > 0 || gameState.forcedCaptures.length === 0) {
                    selectPiece(row, col);
                }
            } else {
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                renderBoard();
            }
        } 
        // If no piece is selected and clicked on current player's piece
        else if (piece && piece.color === gameState.currentPlayer) {
            selectPiece(row, col);
        }
    }

    // Select a piece
    function selectPiece(row, col) {
        const forcedCaptures = getForcedCapturesForPiece(row, col);
        
        // If there are forced captures, only allow selection of pieces that can capture
        if (gameState.forcedCaptures.length > 0 && forcedCaptures.length === 0) {
            return;
        }
        
        gameState.selectedPiece = { row, col };
        gameState.possibleMoves = calculatePossibleMoves(row, col);
        renderBoard();
    }

    // Calculate possible moves for a piece
    function calculatePossibleMoves(row, col) {
        const piece = gameState.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const direction = piece.color === 'red' ? 1 : -1;
        
        // Check normal moves
        if (gameState.forcedCaptures.length === 0) {
            // Forward left
            let newRow = row + direction;
            let newCol = col - 1;
            if (isValidSquare(newRow, newCol) && !gameState.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            }
            
            // Forward right
            newRow = row + direction;
            newCol = col + 1;
            if (isValidSquare(newRow, newCol) && !gameState.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            }
            
            // If king, check backward moves too
            if (piece.type === 'king') {
                // Backward left
                newRow = row - direction;
                newCol = col - 1;
                if (isValidSquare(newRow, newCol) && !gameState.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // Backward right
                newRow = row - direction;
                newCol = col + 1;
                if (isValidSquare(newRow, newCol) && !gameState.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        // Check capture moves
        const captureMoves = getCaptureMoves(row, col, piece, []);
        moves.push(...captureMoves);
        
        // If there are forced captures for other pieces, only return capture moves for this piece
        if (gameState.forcedCaptures.length > 0) {
            const pieceForcedCaptures = getForcedCapturesForPiece(row, col);
            return pieceForcedCaptures;
        }
        
        return moves;
    }

    // Get capture moves for a piece (recursive for multi-capture)
    function getCaptureMoves(row, col, piece, visited = []) {
        const moves = [];
        const directions = [
            { dr: 1, dc: -1 },  // forward left
            { dr: 1, dc: 1 },   // forward right
            { dr: -1, dc: -1 }, // backward left
            { dr: -1, dc: 1 }   // backward right
        ];
        
        // Normal pieces can only move forward (unless they're kings)
        const allowedDirections = piece.type === 'king' 
            ? directions 
            : piece.color === 'red' 
                ? [directions[0], directions[1]]  // red moves down
                : [directions[2], directions[3]]; // black moves up
        
        for (const { dr, dc } of allowedDirections) {
            const jumpRow = row + dr;
            const jumpCol = col + dc;
            const landRow = row + 2 * dr;
            const landCol = col + 2 * dc;
            
            // Check if jump square has opponent piece
            if (isValidSquare(jumpRow, jumpCol) && 
                gameState.board[jumpRow][jumpCol] &&
                gameState.board[jumpRow][jumpCol].color !== piece.color) {
                
                // Check if landing square is empty
                if (isValidSquare(landRow, landCol) && 
                    !gameState.board[landRow][landCol]) {
                    
                    // Check if we've already visited this position in multi-capture
                    const visitedKey = `${landRow},${landCol}`;
                    if (!visited.includes(visitedKey)) {
                        const move = { 
                            row: landRow, 
                            col: landCol, 
                            capture: true,
                            capturedRow: jumpRow,
                            capturedCol: jumpCol
                        };
                        
                        // If multi-capture is enabled, check for further captures
                        if (gameState.multiCaptureEnabled) {
                            // Temporarily make the move
                            const capturedPiece = gameState.board[jumpRow][jumpCol];
                            gameState.board[landRow][landCol] = piece;
                            gameState.board[row][col] = null;
                            gameState.board[jumpRow][jumpCol] = null;
                            
                            // Check for additional captures from new position
                            const furtherCaptures = getCaptureMoves(landRow, landCol, piece, [...visited, visitedKey]);
                            
                            // Undo temporary move
                            gameState.board[row][col] = piece;
                            gameState.board[landRow][landCol] = null;
                            gameState.board[jumpRow][jumpCol] = capturedPiece;
                            
                            if (furtherCaptures.length > 0) {
                                // Mark this move as having further captures
                                move.furtherCaptures = furtherCaptures;
                            }
                        }
                        
                        moves.push(move);
                    }
                }
            }
        }
        
        return moves;
    }

    // Check for forced captures for all pieces of current player
    function checkForcedCaptures() {
        gameState.forcedCaptures = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === gameState.currentPlayer) {
                    const captureMoves = getCaptureMoves(row, col, piece);
                    if (captureMoves.length > 0) {
                        gameState.forcedCaptures.push({ row, col, moves: captureMoves });
                    }
                }
            }
        }
    }

    // Get forced captures for a specific piece
    function getForcedCapturesForPiece(row, col) {
        const forcedCapture = gameState.forcedCaptures.find(
            fc => fc.row === row && fc.col === col
        );
        return forcedCapture ? forcedCapture.moves : [];
    }

    // Make a move
    function makeMove(fromRow, fromCol, toRow, toCol, isCapture = false) {
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: JSON.parse(JSON.stringify(gameState.board[fromRow][fromCol])),
            captured: null,
            becameKing: false
        };
        
        const movingPiece = gameState.board[fromRow][fromCol];
        
        // Handle capture
        if (isCapture) {
            move.captured = {
                piece: JSON.parse(JSON.stringify(gameState.board[toRow - (toRow - fromRow) / 2][toCol - (toCol - fromCol) / 2])),
                row: toRow - (toRow - fromRow) / 2,
                col: toCol - (toCol - fromCol) / 2
            };
            
            // Remove captured piece
            gameState.board[move.captured.row][move.captured.col] = null;
            
            // Update score
            gameState.scores[gameState.currentPlayer] += 1;
        }
        
        // Move the piece
        gameState.board[toRow][toCol] = movingPiece;
        gameState.board[fromRow][fromCol] = null;
        
        // Check for king promotion
        if ((movingPiece.color === 'red' && toRow === 7) || 
            (movingPiece.color === 'black' && toRow === 0)) {
            if (movingPiece.type !== 'king') {
                movingPiece.type = 'king';
                move.becameKing = true;
                showConfetti();
            }
        }
        
        // Save to history
        gameState.moveHistory.push(move);
        gameState.redoHistory = [];
        
        // Check for multi-capture continuation
        let furtherCaptures = [];
        if (isCapture && gameState.multiCaptureEnabled) {
            furtherCaptures = getCaptureMoves(toRow, toCol, movingPiece);
        }
        
        // If no further captures, switch player
        if (furtherCaptures.length === 0) {
            gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
            gameState.selectedPiece = null;
            gameState.possibleMoves = [];
            
            // Check for forced captures for next player
            checkForcedCaptures();
        } else {
            // Continue with multi-capture
            gameState.selectedPiece = { row: toRow, col: toCol };
            gameState.possibleMoves = furtherCaptures;
        }
        
        renderBoard();
        updateGameInfo();
        
        // Check for game end
        checkGameEnd();
        
        // If AI is enabled and it's AI's turn
        if (gameState.aiEnabled && gameState.currentPlayer === 'black' && furtherCaptures.length === 0) {
            setTimeout(makeAIMove, 500);
        }
    }

    // Check if game should end
    function checkGameEnd() {
        let redPieces = 0;
        let blackPieces = 0;
        let redMoves = 0;
        let blackMoves = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece) {
                    if (piece.color === 'red') {
                        redPieces++;
                        if (redMoves === 0) {
                            const moves = calculatePossibleMoves(row, col);
                            redMoves += moves.length;
                        }
                    } else {
                        blackPieces++;
                        if (blackMoves === 0) {
                            const moves = calculatePossibleMoves(row, col);
                            blackMoves += moves.length;
                        }
                    }
                }
            }
        }
        
        if (redPieces === 0) {
            endGame('black');
        } else if (blackPieces === 0) {
            endGame('red');
        } else if (redMoves === 0 && gameState.currentPlayer === 'red') {
            endGame('black');
        } else if (blackMoves === 0 && gameState.currentPlayer === 'black') {
            endGame('red');
        }
    }

    // End the game
    function endGame(winner) {
        gameState.gameOver = true;
        gameState.scores[winner]++;
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h2 style="color: white; font-size: 3em; margin-bottom: 20px;">GAME OVER!</h2>
                <p style="color: white; font-size: 2em; margin-bottom: 30px;">${winner.toUpperCase()} WINS!</p>
                <button id="play-again" style="background: linear-gradient(145deg, #ff9900, #ffcc00); 
                    border-color: #ffff00 !important; padding: 20px 40px; font-size: 1.5em;">
                    PLAY AGAIN
                </button>
            </div>
        `;
        
        document.body.appendChild(gameOverDiv);
        
        document.getElementById('play-again').addEventListener('click', () => {
            gameOverDiv.remove();
            setupInitialPosition();
            renderBoard();
            updateGameInfo();
        });
        
        showConfetti();
    }

    // Make AI move
    function makeAIMove() {
        if (gameState.gameOver) return;
        
        const moves = [];
        
        // Find all black pieces and their possible moves
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === 'black') {
                    const pieceMoves = calculatePossibleMoves(row, col);
                    pieceMoves.forEach(move => {
                        let score = 0;
                        
                        if (move.capture) {
                            score += 10; // Prioritize captures
                            
                            // Extra points for capturing kings
                            const capturedPiece = gameState.board[move.capturedRow][move.capturedCol];
                            if (capturedPiece && capturedPiece.type === 'king') {
                                score += 5;
                            }
                        }
                        
                        // Points for becoming king
                        if (move.row === 0 && piece.type !== 'king') {
                            score += 8;
                        }
                        
                        // Points for center control
                        if (move.row >= 3 && move.row <= 4 && move.col >= 2 && move.col <= 5) {
                            score += 2;
                        }
                        
                        // Avoid moving to edges (can be trapped)
                        if (move.col === 0 || move.col === 7) {
                            score -= 1;
                        }
                        
                        moves.push({
                            from: { row, col },
                            to: move,
                            score: score
                        });
                    });
                }
            }
        }
        
        if (moves.length > 0) {
            // Sort by score (highest first)
            moves.sort((a, b) => b.score - a.score);
            
            // Pick a move, preferring higher scores
            const bestMoves = moves.filter(m => m.score === moves[0].score);
            const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            
            makeMove(selectedMove.from.row, selectedMove.from.col, 
                    selectedMove.to.row, selectedMove.to.col, 
                    selectedMove.to.capture);
        }
    }

    // Check if square is valid
    function isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Update game info display
    function updateGameInfo() {
        let turnText = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)}'s Turn`;
        
        if (gameState.forcedCaptures.length > 0) {
            turnText += " - FORCED CAPTURE!";
        }
        
        document.getElementById('turn-indicator').textContent = turnText;
        document.getElementById('red-score').textContent = gameState.scores.red;
        document.getElementById('black-score').textContent = gameState.scores.black;
        document.getElementById('draw-score').textContent = gameState.scores.draws;
    }

    // Create floating decorative elements
    function createFloatingElements() {
        const elements = ['●', '◯', '◎', '◉', '○', '◌', '◍'];
        
        for (let i = 0; i < 10; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = elements[Math.floor(Math.random() * elements.length)];
            element.style.cssText = `
                font-size: ${Math.random() * 40 + 20}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                color: ${['#ff3399', '#ffcc00', '#33ccff'][Math.floor(Math.random() * 3)]};
                animation-delay: ${Math.random() * 5}s;
                animation-duration: ${Math.random() * 20 + 20}s;
            `;
            document.body.appendChild(element);
        }
    }

    // Show celebration confetti
    function showConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // Setup event listeners for buttons
    function setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => {
            setupInitialPosition();
            renderBoard();
            updateGameInfo();
            document.getElementById('status-message').textContent = 'New game started!';
            setTimeout(() => {
                document.getElementById('status-message').textContent = 'Make your move!';
            }, 2000);
        });

        document.getElementById('reset-score').addEventListener('click', () => {
            gameState.scores = { red: 0, black: 0, draws: 0 };
            updateGameInfo();
            document.getElementById('status-message').textContent = 'Score reset!';
            setTimeout(() => {
                document.getElementById('status-message').textContent = 'Make your move!';
            }, 2000);
        });

        document.getElementById('undo-move').addEventListener('click', () => {
            if (gameState.moveHistory.length > 0) {
                const move = gameState.moveHistory.pop();
                gameState.redoHistory.push(move);
                
                // Restore moved piece
                gameState.board[move.from.row][move.from.col] = move.piece;
                gameState.board[move.to.row][move.to.col] = null;
                
                // Restore captured piece if any
                if (move.captured) {
                    gameState.board[move.captured.row][move.captured.col] = move.captured.piece;
                    // Adjust score
                    gameState.scores[gameState.currentPlayer] = Math.max(0, gameState.scores[gameState.currentPlayer] - 1);
                }
                
                // Switch player back
                gameState.currentPlayer = move.piece.color;
                
                // Reset selection
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                
                // Check for forced captures
                checkForcedCaptures();
                
                renderBoard();
                updateGameInfo();
                document.getElementById('status-message').textContent = 'Move undone!';
                setTimeout(() => {
                    document.getElementById('status-message').textContent = 'Make your move!';
                }, 2000);
            }
        });

        document.getElementById('redo-move').addEventListener('click', () => {
            if (gameState.redoHistory.length > 0) {
                const move = gameState.redoHistory.pop();
                makeMove(move.from.row, move.from.col, move.to.row, move.to.col, move.captured !== null);
            }
        });

        document.getElementById('save-game').addEventListener('click', () => {
            const gameData = {
                board: gameState.board,
                currentPlayer: gameState.currentPlayer,
                scores: gameState.scores,
                gameOver: gameState.gameOver
            };
            localStorage.setItem('gyaruCheckers', JSON.stringify(gameData));
            document.getElementById('status-message').textContent = 'Game saved!';
            setTimeout(() => {
                document.getElementById('status-message').textContent = 'Make your move!';
            }, 2000);
        });

        document.getElementById('load-game').addEventListener('click', () => {
            const savedData = localStorage.getItem('gyaruCheckers');
            if (savedData) {
                const gameData = JSON.parse(savedData);
                gameState.board = gameData.board;
                gameState.currentPlayer = gameData.currentPlayer || 'red';
                gameState.scores = gameData.scores || { red: 0, black: 0, draws: 0 };
                gameState.gameOver = gameData.gameOver || false;
                
                checkForcedCaptures();
                renderBoard();
                updateGameInfo();
                document.getElementById('status-message').textContent = 'Game loaded!';
                setTimeout(() => {
                    document.getElementById('status-message').textContent = 'Make your move!';
                }, 2000);
            } else {
                document.getElementById('status-message').textContent = 'No saved game found!';
                setTimeout(() => {
                    document.getElementById('status-message').textContent = 'Make your move!';
                }, 2000);
            }
        });

        document.getElementById('toggle-ai').addEventListener('click', function() {
            gameState.aiEnabled = !gameState.aiEnabled;
            this.textContent = gameState.aiEnabled ? 'AI: ON' : 'AI: OFF';
            this.style.background = gameState.aiEnabled ? 
                'linear-gradient(145deg, #00ff00, #33ff33)' : 
                'linear-gradient(145deg, #ff3399, #ff66cc)';
            
            document.getElementById('status-message').textContent = 
                gameState.aiEnabled ? 'AI opponent enabled!' : 'AI opponent disabled!';
            setTimeout(() => {
                document.getElementById('status-message').textContent = 'Make your move!';
            }, 2000);
            
            // If AI is enabled and it's black's turn
            if (gameState.aiEnabled && gameState.currentPlayer === 'black') {
                setTimeout(makeAIMove, 500);
            }
        });

        document.getElementById('hint-move').addEventListener('click', () => {
            // Find a good move for current player
            const moves = [];
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = gameState.board[row][col];
                    if (piece && piece.color === gameState.currentPlayer) {
                        const pieceMoves = calculatePossibleMoves(row, col);
                        pieceMoves.forEach(move => {
                            let score = 0;
                            
                            if (move.capture) {
                                score += 10;
                                const capturedPiece = gameState.board[move.capturedRow][move.capturedCol];
                                if (capturedPiece && capturedPiece.type === 'king') {
                                    score += 5;
                                }
                            }
                            
                            moves.push({
                                from: { row, col },
                                to: move,
                                score: score
                            });
                        });
                    }
                }
            }
            
            if (moves.length > 0) {
                // Sort by score and pick a good move
                moves.sort((a, b) => b.score - a.score);
                const goodMoves = moves.slice(0, Math.min(3, moves.length));
                const hint = goodMoves[Math.floor(Math.random() * goodMoves.length)];
                
                const fromSquare = document.querySelector(`.checker-square[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
                const toSquare = document.querySelector(`.checker-square[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
                
                // Flash the hint
                fromSquare.style.boxShadow = '0 0 20px #ffff00';
                toSquare.style.boxShadow = '0 0 20px #00ffff';
                
                setTimeout(() => {
                    fromSquare.style.boxShadow = '';
                    toSquare.style.boxShadow = '';
                }, 1000);
                
                document.getElementById('status-message').textContent = 'Hint shown!';
                setTimeout(() => {
                    document.getElementById('status-message').textContent = 'Make your move!';
                }, 2000);
            }
        });

        document.getElementById('multi-capture').addEventListener('click', function() {
            gameState.multiCaptureEnabled = !gameState.multiCaptureEnabled;
            this.textContent = gameState.multiCaptureEnabled ? 'Multi-Capture: ON' : 'Multi-Capture: OFF';
            this.style.background = gameState.multiCaptureEnabled ? 
                'linear-gradient(145deg, #ff9900, #ffcc00)' : 
                'linear-gradient(145deg, #ff3399, #ff66cc)';
            
            document.getElementById('status-message').textContent = 
                gameState.multiCaptureEnabled ? 'Multi-capture enabled!' : 'Multi-capture disabled!';
            setTimeout(() => {
                document.getElementById('status-message').textContent = 'Make your move!';
            }, 2000);
        });
    }

    // Initialize the game
    initGame();
});




// Source - https://stackoverflow.com/q
// Posted by norbitrial, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-24, License - CC BY-SA 4.0

const setFavicon = (emoji) => {
  const canvas = document.createElement('canvas');
  canvas.height = 32;
  canvas.width = 32;

  const ctx = canvas.getContext('2d');
  ctx.font = '28px serif';
  ctx.fillText(emoji, -2, 24);

  const favicon = document.querySelector('link[rel=icon]');
  if (favicon) { favicon.href = canvas.toDataURL(); }
}

setFavicon('⛀');
