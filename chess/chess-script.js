// GYARU STYLE CHESS GAME - COMPLETE RULES
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        board: [],
        currentPlayer: 'white',
        selectedSquare: null,
        possibleMoves: [],
        moveHistory: [],
        redoHistory: [],
        scores: { white: 0, black: 0, draws: 0 },
        aiEnabled: false,
        check: false,
        checkmate: false,
        enPassantTarget: null,
        castlingRights: {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        },
        pieces: {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        }
    };

    // Initialize the game
    function initGame() {
        createBoard();
        setupInitialPosition();
        renderBoard();
        updateGameInfo();
        createFloatingElements();
    }

    // Create chess board squares
    function createBoard() {
        const board = document.getElementById('chess-board');
        board.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.index = row * 8 + col;
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                
                board.appendChild(square);
            }
        }
    }

    // Setup initial chess position
    function setupInitialPosition() {
        gameState.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Setup pawns
        for (let col = 0; col < 8; col++) {
            gameState.board[1][col] = { type: 'pawn', color: 'white', hasMoved: false };
            gameState.board[6][col] = { type: 'pawn', color: 'black', hasMoved: false };
        }
        
        // Setup other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let col = 0; col < 8; col++) {
            gameState.board[0][col] = { 
                type: pieceOrder[col], 
                color: 'white',
                hasMoved: false 
            };
            gameState.board[7][col] = { 
                type: pieceOrder[col], 
                color: 'black',
                hasMoved: false 
            };
        }
        
        // Reset game state
        gameState.currentPlayer = 'white';
        gameState.selectedSquare = null;
        gameState.possibleMoves = [];
        gameState.check = false;
        gameState.checkmate = false;
        gameState.enPassantTarget = null;
        gameState.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
    }

    // Render the board with pieces
    function renderBoard() {
        const squares = document.querySelectorAll('.square');
        
        // Reset all squares
        squares.forEach(square => {
            square.classList.remove('selected', 'possible-move', 'check', 'checkmate');
            square.innerHTML = '';
        });
        
        // Render pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                
                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = `piece ${piece.color}-piece`;
                    pieceSpan.textContent = gameState.pieces[piece.color][piece.type];
                    square.appendChild(pieceSpan);
                    
                    // Highlight king in check
                    if (piece.type === 'king' && isKingInCheck(piece.color)) {
                        square.classList.add('check');
                    }
                }
            }
        }
        
        // Highlight selected square and possible moves
        if (gameState.selectedSquare) {
            const { row, col } = gameState.selectedSquare;
            const selectedSquare = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
            selectedSquare.classList.add('selected');
            
            gameState.possibleMoves.forEach(({ row: r, col: c }) => {
                const moveSquare = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
                moveSquare.classList.add('possible-move');
            });
        }
        
        // Highlight checkmate
        if (gameState.checkmate) {
            const kingColor = gameState.currentPlayer;
            const kingPos = findKing(kingColor);
            if (kingPos) {
                const kingSquare = document.querySelector(`.square[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);
                kingSquare.classList.add('checkmate');
            }
        }
    }

    // Handle square click
    function handleSquareClick(row, col) {
        if (gameState.checkmate) return; // No moves in checkmate
        
        const piece = gameState.board[row][col];
        
        // If a square is selected
        if (gameState.selectedSquare) {
            const { row: sr, col: sc } = gameState.selectedSquare;
            
            // Check if clicked on a possible move
            const isPossibleMove = gameState.possibleMoves.some(
                move => move.row === row && move.col === col
            );
            
            if (isPossibleMove) {
                makeMove(sr, sc, row, col);
                return;
            }
            
            // If clicked on another piece of current player
            if (piece && piece.color === gameState.currentPlayer) {
                selectSquare(row, col);
            } else {
                gameState.selectedSquare = null;
                gameState.possibleMoves = [];
                renderBoard();
            }
        } 
        // If no square is selected and clicked on current player's piece
        else if (piece && piece.color === gameState.currentPlayer) {
            selectSquare(row, col);
        }
    }

    // Select a square
    function selectSquare(row, col) {
        gameState.selectedSquare = { row, col };
        gameState.possibleMoves = calculatePossibleMoves(row, col);
        renderBoard();
    }

    // Calculate ALL possible moves for a piece
    function calculatePossibleMoves(row, col) {
        const piece = gameState.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves.push(...getPawnMoves(row, col, piece));
                break;
            case 'rook':
                moves.push(...getRookMoves(row, col, piece));
                break;
            case 'knight':
                moves.push(...getKnightMoves(row, col, piece));
                break;
            case 'bishop':
                moves.push(...getBishopMoves(row, col, piece));
                break;
            case 'queen':
                moves.push(...getQueenMoves(row, col, piece));
                break;
            case 'king':
                moves.push(...getKingMoves(row, col, piece));
                break;
        }
        
        // Filter out moves that would leave king in check
        return moves.filter(move => {
            // Simulate the move
            const originalPiece = gameState.board[move.row][move.col];
            const movedPiece = gameState.board[row][col];
            
            // Make temporary move
            gameState.board[move.row][move.col] = movedPiece;
            gameState.board[row][col] = null;
            
            // Check if king is in check after move
            const leavesKingInCheck = isKingInCheck(piece.color);
            
            // Undo temporary move
            gameState.board[row][col] = movedPiece;
            gameState.board[move.row][move.col] = originalPiece;
            
            return !leavesKingInCheck;
        });
    }

    // Pawn movement and capturing
    function getPawnMoves(row, col, pawn) {
        const moves = [];
        const direction = pawn.color === 'white' ? 1 : -1;
        const startRow = pawn.color === 'white' ? 1 : 6;
        
        // Forward move (one square)
        if (isValidSquare(row + direction, col) && !gameState.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Forward move (two squares) from starting position
            if (row === startRow && !gameState.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Diagonal captures
        const captureCols = [col - 1, col + 1];
        captureCols.forEach(c => {
            if (isValidSquare(row + direction, c)) {
                const targetPiece = gameState.board[row + direction][c];
                if (targetPiece && targetPiece.color !== pawn.color) {
                    moves.push({ row: row + direction, col: c });
                }
                
                // En passant capture
                if (gameState.enPassantTarget && 
                    gameState.enPassantTarget.row === row + direction && 
                    gameState.enPassantTarget.col === c) {
                    moves.push({ row: row + direction, col: c, enPassant: true });
                }
            }
        });
        
        return moves;
    }

    // Rook movement
    function getRookMoves(row, col, rook) {
        const moves = [];
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        
        directions.forEach(([dr, dc]) => {
            let r = row + dr, c = col + dc;
            while (isValidSquare(r, c)) {
                const targetPiece = gameState.board[r][c];
                if (!targetPiece) {
                    moves.push({ row: r, col: c });
                } else if (targetPiece.color !== rook.color) {
                    moves.push({ row: r, col: c });
                    break;
                } else {
                    break;
                }
                r += dr;
                c += dc;
            }
        });
        
        return moves;
    }

    // Knight movement (L-shape)
    function getKnightMoves(row, col, knight) {
        const moves = [];
        const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        
        knightMoves.forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            
            if (isValidSquare(r, c)) {
                const targetPiece = gameState.board[r][c];
                if (!targetPiece || targetPiece.color !== knight.color) {
                    moves.push({ row: r, col: c });
                }
            }
        });
        
        return moves;
    }

    // Bishop movement (diagonals)
    function getBishopMoves(row, col, bishop) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dr, dc]) => {
            let r = row + dr, c = col + dc;
            while (isValidSquare(r, c)) {
                const targetPiece = gameState.board[r][c];
                if (!targetPiece) {
                    moves.push({ row: r, col: c });
                } else if (targetPiece.color !== bishop.color) {
                    moves.push({ row: r, col: c });
                    break;
                } else {
                    break;
                }
                r += dr;
                c += dc;
            }
        });
        
        return moves;
    }

    // Queen movement (rook + bishop)
    function getQueenMoves(row, col, queen) {
        return [
            ...getRookMoves(row, col, queen),
            ...getBishopMoves(row, col, queen)
        ];
    }

    // King movement and castling
    function getKingMoves(row, col, king) {
        const moves = [];
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        
        // Normal king moves
        directions.forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            
            if (isValidSquare(r, c)) {
                const targetPiece = gameState.board[r][c];
                if (!targetPiece || targetPiece.color !== king.color) {
                    moves.push({ row: r, col: c });
                }
            }
        });
        
        // Castling
        if (!king.hasMoved && !isKingInCheck(king.color)) {
            const color = king.color;
            
            // Kingside castling
            if (gameState.castlingRights[color].kingside) {
                const rookCol = 7;
                const rook = gameState.board[row][rookCol];
                if (rook && rook.type === 'rook' && !rook.hasMoved) {
                    // Check if squares between king and rook are empty
                    if (!gameState.board[row][5] && !gameState.board[row][6]) {
                        // Check if king doesn't pass through check
                        if (!isSquareAttacked(row, 5, color) && !isSquareAttacked(row, 6, color)) {
                            moves.push({ row, col: 6, castle: 'kingside' });
                        }
                    }
                }
            }
            
            // Queenside castling
            if (gameState.castlingRights[color].queenside) {
                const rookCol = 0;
                const rook = gameState.board[row][rookCol];
                if (rook && rook.type === 'rook' && !rook.hasMoved) {
                    // Check if squares between king and rook are empty
                    if (!gameState.board[row][1] && !gameState.board[row][2] && !gameState.board[row][3]) {
                        // Check if king doesn't pass through check
                        if (!isSquareAttacked(row, 2, color) && !isSquareAttacked(row, 3, color)) {
                            moves.push({ row, col: 2, castle: 'queenside' });
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    // Check if a square is under attack
    function isSquareAttacked(row, col, defenderColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = gameState.board[r][c];
                if (piece && piece.color !== defenderColor) {
                    const moves = getAllAttackMoves(r, c, piece);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Get all attack moves for a piece (ignoring check restrictions)
    function getAllAttackMoves(row, col, piece) {
        if (!piece) return [];
        
        const moves = [];
        const color = piece.color;
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        switch (piece.type) {
            case 'pawn':
                const direction = color === 'white' ? 1 : -1;
                // Pawn attacks diagonally
                if (isValidSquare(row + direction, col - 1)) {
                    moves.push({ row: row + direction, col: col - 1 });
                }
                if (isValidSquare(row + direction, col + 1)) {
                    moves.push({ row: row + direction, col: col + 1 });
                }
                break;
            case 'knight':
                const knightMoves = [
                    [2, 1], [2, -1], [-2, 1], [-2, -1],
                    [1, 2], [1, -2], [-1, 2], [-1, -2]
                ];
                knightMoves.forEach(([dr, dc]) => {
                    const r = row + dr;
                    const c = col + dc;
                    if (isValidSquare(r, c)) {
                        moves.push({ row: r, col: c });
                    }
                });
                break;
            case 'bishop':
                const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                bishopDirs.forEach(([dr, dc]) => {
                    let r = row + dr, c = col + dc;
                    while (isValidSquare(r, c)) {
                        moves.push({ row: r, col: c });
                        if (gameState.board[r][c]) break;
                        r += dr;
                        c += dc;
                    }
                });
                break;
            case 'rook':
                const rookDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                rookDirs.forEach(([dr, dc]) => {
                    let r = row + dr, c = col + dc;
                    while (isValidSquare(r, c)) {
                        moves.push({ row: r, col: c });
                        if (gameState.board[r][c]) break;
                        r += dr;
                        c += dc;
                    }
                });
                break;
            case 'queen':
                const queenDirs = [
                    [1, 0], [-1, 0], [0, 1], [0, -1],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                queenDirs.forEach(([dr, dc]) => {
                    let r = row + dr, c = col + dc;
                    while (isValidSquare(r, c)) {
                        moves.push({ row: r, col: c });
                        if (gameState.board[r][c]) break;
                        r += dr;
                        c += dc;
                    }
                });
                break;
            case 'king':
                const kingDirs = [
                    [1, 0], [-1, 0], [0, 1], [0, -1],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                kingDirs.forEach(([dr, dc]) => {
                    const r = row + dr;
                    const c = col + dc;
                    if (isValidSquare(r, c)) {
                        moves.push({ row: r, col: c });
                    }
                });
                break;
        }
        
        return moves;
    }

    // Check if king is in check
    function isKingInCheck(kingColor) {
        const kingPos = findKing(kingColor);
        if (!kingPos) return false;
        
        return isSquareAttacked(kingPos.row, kingPos.col, kingColor);
    }

    // Find the king's position
    function findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Check for checkmate
    function isCheckmate(color) {
        // King must be in check
        if (!isKingInCheck(color)) return false;
        
        // Check if any move can get out of check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === color) {
                    const moves = calculatePossibleMoves(row, col);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    // Make a move
    function makeMove(fromRow, fromCol, toRow, toCol) {
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: JSON.parse(JSON.stringify(gameState.board[fromRow][fromCol])),
            captured: gameState.board[toRow][toCol] ? JSON.parse(JSON.stringify(gameState.board[toRow][toCol])) : null,
            enPassantTarget: gameState.enPassantTarget,
            castlingRights: JSON.parse(JSON.stringify(gameState.castlingRights)),
            // Store additional info for undo
            enPassant: false,
            castle: null
        };
        
        const movingPiece = gameState.board[fromRow][fromCol];
        const isCapture = gameState.board[toRow][toCol] !== null;
        
        // Handle en passant capture
        if (gameState.enPassantTarget && 
            movingPiece.type === 'pawn' &&
            toRow === gameState.enPassantTarget.row && 
            toCol === gameState.enPassantTarget.col) {
            const capturedPawnRow = movingPiece.color === 'white' ? toRow - 1 : toRow + 1;
            move.captured = JSON.parse(JSON.stringify(gameState.board[capturedPawnRow][toCol]));
            gameState.board[capturedPawnRow][toCol] = null;
            move.enPassant = true;
        }
        
        // Handle castling
        if (movingPiece.type === 'king') {
            const colDiff = toCol - fromCol;
            if (Math.abs(colDiff) === 2) {
                // Castling move
                move.castle = colDiff > 0 ? 'kingside' : 'queenside';
                if (colDiff > 0) { // Kingside
                    // Move rook from h-file to f-file
                    gameState.board[toRow][5] = gameState.board[toRow][7];
                    gameState.board[toRow][7] = null;
                    gameState.board[toRow][5].hasMoved = true;
                } else { // Queenside
                    // Move rook from a-file to d-file
                    gameState.board[toRow][3] = gameState.board[toRow][0];
                    gameState.board[toRow][0] = null;
                    gameState.board[toRow][3].hasMoved = true;
                }
            }
            
            // Update castling rights
            gameState.castlingRights[movingPiece.color].kingside = false;
            gameState.castlingRights[movingPiece.color].queenside = false;
            movingPiece.hasMoved = true;
        }
        
        // Handle rook movement for castling rights
        if (movingPiece.type === 'rook') {
            const color = movingPiece.color;
            if (fromCol === 0) { // Queenside rook
                gameState.castlingRights[color].queenside = false;
            } else if (fromCol === 7) { // Kingside rook
                gameState.castlingRights[color].kingside = false;
            }
        }
        
        // Execute move
        gameState.board[toRow][toCol] = movingPiece;
        gameState.board[fromRow][fromCol] = null;
        movingPiece.hasMoved = true;
        
        // Handle en passant target
        gameState.enPassantTarget = null;
        if (movingPiece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            gameState.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: fromCol
            };
        }
        
        // Handle pawn promotion
        if (movingPiece.type === 'pawn') {
            if ((movingPiece.color === 'white' && toRow === 7) ||
                (movingPiece.color === 'black' && toRow === 0)) {
                movingPiece.type = 'queen';
                showConfetti();
            }
        }
        
        // Update scores if piece was captured
        if (isCapture && move.captured) {
            const capturedValue = getPieceValue(move.captured.type);
            if (movingPiece.color === 'white') {
                gameState.scores.white += capturedValue;
            } else {
                gameState.scores.black += capturedValue;
            }
        }
        
        // Save to history
        gameState.moveHistory.push(move);
        gameState.redoHistory = [];
        
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        gameState.selectedSquare = null;
        gameState.possibleMoves = [];
        
        // Check for check and checkmate
        gameState.check = isKingInCheck(gameState.currentPlayer);
        gameState.checkmate = isCheckmate(gameState.currentPlayer);
        
        renderBoard();
        updateGameInfo();
        
        // Check for game end
        if (gameState.checkmate) {
            const winner = gameState.currentPlayer === 'white' ? 'Black' : 'White';
            document.getElementById('status-message').textContent = `Checkmate! ${winner} wins!`;
            showConfetti();
            return;
        }
        
        if (gameState.check) {
            document.getElementById('status-message').textContent = 'Check!';
        } else {
            document.getElementById('status-message').textContent = 'Make your move!';
        }
        
        // If AI is enabled and it's AI's turn
        if (gameState.aiEnabled && gameState.currentPlayer === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }

    // Get piece value for scoring
    function getPieceValue(pieceType) {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0
        };
        return values[pieceType] || 0;
    }

    // Make AI move (smarter)
    function makeAIMove() {
        if (gameState.checkmate) return;
        
        const moves = [];
        
        // Find all black pieces and their possible moves
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === 'black') {
                    const pieceMoves = calculatePossibleMoves(row, col);
                    pieceMoves.forEach(move => {
                        // Score the move
                        let score = 0;
                        const targetPiece = gameState.board[move.row][move.col];
                        
                        if (targetPiece) {
                            // Capture moves get higher score
                            score = getPieceValue(targetPiece.type) * 10;
                        }
                        
                        // Prefer moves that put pressure
                        if (isSquareAttacked(move.row, move.col, 'white')) {
                            score += 5;
                        }
                        
                        // Avoid moving pieces to attacked squares
                        if (isSquareAttacked(move.row, move.col, 'black')) {
                            score -= 3;
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
            
            // If no good captures, add some randomness to avoid always same moves
            if (moves[0].score < 10) {
                const randomMove = moves[Math.floor(Math.random() * Math.min(moves.length, 5))];
                makeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
            } else {
                makeMove(selectedMove.from.row, selectedMove.from.col, selectedMove.to.row, selectedMove.to.col);
            }
        }
    }

    // Check if square is valid
    function isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Update game info display
    function updateGameInfo() {
        let turnText = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)}'s Turn`;
        
        if (gameState.checkmate) {
            turnText = "Checkmate!";
        } else if (gameState.check) {
            turnText += " - CHECK!";
        }
        
        document.getElementById('turn-indicator').textContent = turnText;
        document.getElementById('white-score').textContent = gameState.scores.white;
        document.getElementById('black-score').textContent = gameState.scores.black;
        document.getElementById('draw-score').textContent = gameState.scores.draws;
    }

    // Create floating decorative elements
    function createFloatingElements() {
        const elements = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
        
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

    // Event listeners for buttons
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
        gameState.scores = { white: 0, black: 0, draws: 0 };
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
            
            // Restore captured piece (if any) and adjust score
            if (move.captured) {
                gameState.board[move.to.row][move.to.col] = move.captured;
                
                // Adjust score: subtract the value of the captured piece
                const capturedValue = getPieceValue(move.captured.type);
                if (move.piece.color === 'white') {
                    // White captured black's piece, so we subtract from white's score
                    gameState.scores.white = Math.max(0, gameState.scores.white - capturedValue);
                } else {
                    // Black captured white's piece, so we subtract from black's score
                    gameState.scores.black = Math.max(0, gameState.scores.black - capturedValue);
                }
            } else {
                // No capture, just clear the square
                gameState.board[move.to.row][move.to.col] = null;
            }
            
            // Restore the moved piece
            gameState.board[move.from.row][move.from.col] = move.piece;
            
            // Handle en passant capture undo
            if (move.enPassant) {
                // For en passant, we need to restore the pawn
                const capturedPawnRow = move.piece.color === 'white' ? move.to.row - 1 : move.to.row + 1;
                gameState.board[capturedPawnRow][move.to.col] = move.captured;
                
                // Adjust score for en passant capture
                const pawnValue = getPieceValue('pawn');
                if (move.piece.color === 'white') {
                    gameState.scores.white = Math.max(0, gameState.scores.white - pawnValue);
                } else {
                    gameState.scores.black = Math.max(0, gameState.scores.black - pawnValue);
                }
            }
            
            // Handle castling undo
            if (move.castle) {
                if (move.castle === 'kingside') {
                    // Move rook back from f-file to h-file
                    gameState.board[move.to.row][7] = gameState.board[move.to.row][5];
                    gameState.board[move.to.row][5] = null;
                    gameState.board[move.to.row][7].hasMoved = false;
                } else { // queenside
                    // Move rook back from d-file to a-file
                    gameState.board[move.to.row][0] = gameState.board[move.to.row][3];
                    gameState.board[move.to.row][3] = null;
                    gameState.board[move.to.row][0].hasMoved = false;
                }
            }
            
            // Restore en passant target
            gameState.enPassantTarget = move.enPassantTarget;
            
            // Restore castling rights
            gameState.castlingRights = move.castlingRights;
            
            // Restore piece's hasMoved status
            move.piece.hasMoved = move.piece.hasMoved === undefined ? false : move.piece.hasMoved;
            
            // Switch player back
            gameState.currentPlayer = move.piece.color;
            
            // Reset game state
            gameState.check = false;
            gameState.checkmate = false;
            
            // Recalculate check status
            const otherPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
            gameState.check = isKingInCheck(otherPlayer);
            gameState.checkmate = isCheckmate(otherPlayer);
            
            // Clear selection
            gameState.selectedSquare = null;
            gameState.possibleMoves = [];
            
            renderBoard();
            updateGameInfo();
            document.getElementById('status-message').textContent = 'Move undone!';
            setTimeout(() => {
                const checkText = gameState.check ? ' - CHECK!' : '';
                document.getElementById('status-message').textContent = `Make your move!${checkText}`;
            }, 2000);
        }
    });

    document.getElementById('redo-move').addEventListener('click', () => {
        if (gameState.redoHistory.length > 0) {
            const move = gameState.redoHistory.pop();
            // Re-execute the move using makeMove function
            makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
        }
    });

    document.getElementById('save-game').addEventListener('click', () => {
        const gameData = {
            board: gameState.board,
            currentPlayer: gameState.currentPlayer,
            scores: gameState.scores,
            check: gameState.check,
            checkmate: gameState.checkmate,
            enPassantTarget: gameState.enPassantTarget,
            castlingRights: gameState.castlingRights
        };
        localStorage.setItem('gyaruChess', JSON.stringify(gameData));
        document.getElementById('status-message').textContent = 'Game saved!';
        setTimeout(() => {
            document.getElementById('status-message').textContent = 'Make your move!';
        }, 2000);
    });

    document.getElementById('load-game').addEventListener('click', () => {
        const savedData = localStorage.getItem('gyaruChess');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            gameState.board = gameData.board;
            gameState.currentPlayer = gameData.currentPlayer || 'white';
            gameState.scores = gameData.scores || { white: 0, black: 0, draws: 0 };
            gameState.check = gameData.check || false;
            gameState.checkmate = gameData.checkmate || false;
            gameState.enPassantTarget = gameData.enPassantTarget || null;
            gameState.castlingRights = gameData.castlingRights || {
                white: { kingside: true, queenside: true },
                black: { kingside: true, queenside: true }
            };
            
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
                        const targetPiece = gameState.board[move.row][move.col];
                        
                        if (targetPiece) {
                            score = getPieceValue(targetPiece.type) * 10;
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
            
            const fromSquare = document.querySelector(`.square[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
            const toSquare = document.querySelector(`.square[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
            
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

    // Initialize the game
    initGame();
});


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

setFavicon('♕');