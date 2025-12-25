// Sudoku Game
document.addEventListener('DOMContentLoaded', function() {
    const sudokuBoard = document.getElementById('sudoku-board');
    const controls = document.getElementById('controls');
    
    let currentSize = 9; // Default size
    let notesMode = false;
    let currentPuzzle = [];
    let solution = [];
    let userBoard = [];
    let moveHistory = [];
    let difficulty = 'medium'; // easy, medium, hard
    let notesBoard = []; // Separate board for notes
    let selectedCell = null;
    
    // Initialize the game
    initializeGame();
    
    // Button event listeners
    document.getElementById('new-game').addEventListener('click', () => {
        generateNewPuzzle();
    });
    
    document.getElementById('check-solution').addEventListener('click', checkSolution);
    
    document.getElementById('solve-puzzle').addEventListener('click', solveCurrentPuzzle);
    
    document.getElementById('reset-puzzle').addEventListener('click', resetPuzzle);
    
    document.getElementById('hint').addEventListener('click', provideHint);
    
    document.getElementById('toggle-notes').addEventListener('click', toggleNotesMode);
    
    document.getElementById('change-difficulty').addEventListener('click', changeDifficulty);
    
    document.getElementById('undo-move').addEventListener('click', undoMove);
    
    function initializeGame() {
        // Create size selector
        const sizeSelector = document.createElement('div');
        sizeSelector.id = 'size-selector';
        sizeSelector.style.margin = '20px 0';
        sizeSelector.style.textAlign = 'center';
        
        const sizes = [4, 9, 16];
        sizes.forEach(size => {
            const button = document.createElement('button');
            button.textContent = `${size}x${size}`;
            button.style.margin = '0 10px';
            button.addEventListener('click', () => changeBoardSize(size));
            sizeSelector.appendChild(button);
        });
        
        controls.insertBefore(sizeSelector, controls.firstChild);
        
        // Create difficulty display
        const difficultyDisplay = document.createElement('div');
        difficultyDisplay.id = 'difficulty-display';
        difficultyDisplay.style.textAlign = 'center';
        difficultyDisplay.style.margin = '10px 0';
        difficultyDisplay.style.fontWeight = 'bold';
        difficultyDisplay.style.color = '#333';
        controls.insertBefore(difficultyDisplay, document.getElementById('new-game'));
        
        updateDifficultyDisplay();
        generateNewPuzzle();
        
        // Add floating decorative elements
        addFloatingElements();
    }
    
    function addFloatingElements() {
        const symbols = ['♡', '☆', '★', '✿'];
        symbols.forEach((symbol, index) => {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = symbol;
            element.style.position = 'fixed';
            element.style.fontSize = `${30 + index * 10}px`;
            element.style.color = ['#ff3399', '#ffcc00', '#33ccff', '#ff66cc'][index];
            element.style.pointerEvents = 'none';
            element.style.zIndex = '-1';
            element.style.animation = `floatAround ${20 + index * 5}s infinite linear`;
            element.style.animationDelay = `${-index * 5}s`;
            element.style.opacity = '0.6';
            document.body.appendChild(element);
        });
    }
    
    function changeBoardSize(size) {
        currentSize = size;
        generateNewPuzzle();
    }
    
    function updateDifficultyDisplay() {
        const display = document.getElementById('difficulty-display');
        if (display) {
            display.textContent = `Difficulty: ${difficulty.toUpperCase()} | Size: ${currentSize}x${currentSize}`;
        }
    }
    
    function changeDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(difficulty);
        difficulty = difficulties[(currentIndex + 1) % difficulties.length];
        updateDifficultyDisplay();
        generateNewPuzzle();
    }
    
    function generateNewPuzzle() {
        // Generate a complete solution first
        solution = generateCompleteBoard(currentSize);
        
        // Create a puzzle by removing numbers based on difficulty
        currentPuzzle = removeNumbers(solution, difficulty);
        
        // Initialize user board with the puzzle
        userBoard = currentPuzzle.map(row => [...row]);
        
        // Initialize empty notes board
        notesBoard = Array(currentSize).fill().map(() => 
            Array(currentSize).fill().map(() => [])
        );
        
        moveHistory = [];
        selectedCell = null;
        
        renderBoard();
    }
    
    function generateCompleteBoard(size) {
        const board = Array(size).fill().map(() => Array(size).fill(0));
        fillBoard(board, 0, 0, size);
        return board;
    }
    
    function fillBoard(board, row, col, size) {
        if (row === size - 1 && col === size) return true;
        if (col === size) {
            row++;
            col = 0;
        }
        
        const numbers = shuffleArray([...Array(size).keys()].map(n => n + 1));
        
        for (let num of numbers) {
            if (isValidPlacement(board, row, col, num, size)) {
                board[row][col] = num;
                if (fillBoard(board, row, col + 1, size)) {
                    return true;
                }
                board[row][col] = 0;
            }
        }
        return false;
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function isValidPlacement(board, row, col, num, size) {
        const subSize = Math.sqrt(size);
        
        // Check row
        for (let x = 0; x < size; x++) {
            if (board[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < size; x++) {
            if (board[x][col] === num) return false;
        }
        
        // Check subgrid
        const startRow = row - (row % subSize);
        const startCol = col - (col % subSize);
        
        for (let i = 0; i < subSize; i++) {
            for (let j = 0; j < subSize; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        
        return true;
    }
    
    function removeNumbers(solutionBoard, difficultyLevel) {
        const size = solutionBoard.length;
        let cellsToRemove;
        
        switch(difficultyLevel) {
            case 'easy':
                cellsToRemove = Math.floor(size * size * 0.3);
                break;
            case 'medium':
                cellsToRemove = Math.floor(size * size * 0.5);
                break;
            case 'hard':
                cellsToRemove = Math.floor(size * size * 0.7);
                break;
            default:
                cellsToRemove = Math.floor(size * size * 0.5);
        }
        
        const puzzle = solutionBoard.map(row => [...row]);
        const cells = [];
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                cells.push([i, j]);
            }
        }
        
        shuffleArray(cells);
        
        for (let i = 0; i < Math.min(cellsToRemove, cells.length); i++) {
            const [row, col] = cells[i];
            puzzle[row][col] = 0;
        }
        
        return puzzle;
    }
    
    function renderBoard() {
        sudokuBoard.innerHTML = '';
        const table = document.createElement('table');
        table.id = 'sudoku-table';
        table.style.margin = '0 auto';
        table.style.borderCollapse = 'collapse';
        table.style.border = '3px solid #333';
        
        const subSize = Math.sqrt(currentSize);
        
        for (let i = 0; i < currentSize; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < currentSize; j++) {
                const cell = document.createElement('td');
                cell.style.border = '1px solid #999';
                cell.style.width = `${400 / currentSize}px`;
                cell.style.height = `${400 / currentSize}px`;
                cell.style.textAlign = 'center';
                cell.style.verticalAlign = 'middle';
                cell.style.fontSize = `${Math.max(12, 24 - currentSize)}px`;
                cell.style.fontWeight = 'bold';
                cell.style.cursor = 'pointer';
                cell.style.position = 'relative';
                
                // Add class for styling
                if (currentPuzzle[i][j] !== 0) {
                    cell.classList.add('original');
                } else if (userBoard[i][j] !== 0) {
                    cell.classList.add('user');
                }
                
                // Add thicker borders for subgrids
                if (i % subSize === 0) cell.style.borderTop = '2px solid #333';
                if (j % subSize === 0) cell.style.borderLeft = '2px solid #333';
                if ((i + 1) % subSize === 0) cell.style.borderBottom = '2px solid #333';
                if ((j + 1) % subSize === 0) cell.style.borderRight = '2px solid #333';
                
                if (currentPuzzle[i][j] !== 0) {
                    cell.textContent = currentPuzzle[i][j];
                    cell.style.backgroundColor = '#f0f0f0';
                    cell.style.color = '#000';
                } else if (userBoard[i][j] !== 0) {
                    cell.textContent = userBoard[i][j];
                    cell.style.backgroundColor = '#fff';
                    cell.style.color = '#0066cc';
                } else {
                    // Show notes if notesMode is ON and there are notes for this cell
                    if (notesBoard[i][j] && notesBoard[i][j].length > 0) {
                        const notesDiv = createNotesDisplay(notesBoard[i][j], subSize);
                        cell.appendChild(notesDiv);
                    }
                }
                
                if (currentPuzzle[i][j] === 0) {
                    cell.addEventListener('click', () => handleCellClick(i, j));
                }
                
                // Highlight if selected
                if (selectedCell && selectedCell.row === i && selectedCell.col === j) {
                    cell.style.backgroundColor = '#ffccff';
                    cell.classList.add('selected');
                }
                
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        
        sudokuBoard.appendChild(table);
        
        // Add number selector for input
        addNumberSelector();
    }
    
    function createNotesDisplay(notesArray, subSize) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'notes';
        notesDiv.style.fontSize = `${Math.max(8, 12 - currentSize/2)}px`;
        notesDiv.style.position = 'absolute';
        notesDiv.style.top = '2px';
        notesDiv.style.left = '2px';
        notesDiv.style.right = '2px';
        notesDiv.style.bottom = '2px';
        notesDiv.style.display = 'grid';
        notesDiv.style.gridTemplateColumns = `repeat(${subSize}, 1fr)`;
        notesDiv.style.gridTemplateRows = `repeat(${subSize}, 1fr)`;
        notesDiv.style.gap = '1px';
        notesDiv.style.padding = '3px';
        notesDiv.style.boxSizing = 'border-box';
        notesDiv.style.color = '#666';
        
        // Create a grid of notes
        for (let num = 1; num <= currentSize; num++) {
            const noteSpan = document.createElement('span');
            noteSpan.style.display = 'flex';
            noteSpan.style.alignItems = 'center';
            noteSpan.style.justifyContent = 'center';
            noteSpan.style.fontSize = '0.8em';
            noteSpan.style.borderRadius = '2px';
            noteSpan.style.background = 'rgba(255, 255, 255, 0.7)';
            
            if (notesArray.includes(num)) {
                noteSpan.textContent = num;
                noteSpan.style.color = '#9933cc';
            } else {
                noteSpan.textContent = '·';
                noteSpan.style.color = 'transparent';
            }
            
            notesDiv.appendChild(noteSpan);
        }
        
        return notesDiv;
    }
    
    function addNumberSelector() {
        let selector = document.getElementById('number-selector');
        if (selector) selector.remove();
        
        const numberSelector = document.createElement('div');
        numberSelector.id = 'number-selector';
        numberSelector.style.textAlign = 'center';
        numberSelector.style.margin = '20px 0';
        
        for (let i = 1; i <= currentSize; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.style.margin = '5px';
            button.style.padding = '10px 15px';
            button.addEventListener('click', () => {
                if (selectedCell) {
                    if (notesMode) {
                        // In notes mode, toggle the note
                        toggleNote(selectedCell.row, selectedCell.col, i);
                    } else {
                        // In normal mode, place the number
                        makeMove(selectedCell.row, selectedCell.col, i);
                    }
                }
            });
            numberSelector.appendChild(button);
        }
        
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.style.margin = '5px';
        clearButton.style.padding = '10px 15px';
        clearButton.addEventListener('click', () => {
            if (selectedCell) {
                if (notesMode) {
                    // Clear all notes in the cell
                    clearAllNotes(selectedCell.row, selectedCell.col);
                } else {
                    // Clear the number in the cell
                    makeMove(selectedCell.row, selectedCell.col, 0);
                }
            }
        });
        numberSelector.appendChild(clearButton);
        
        sudokuBoard.appendChild(numberSelector);
    }
    
    function handleCellClick(row, col) {
        if (currentPuzzle[row][col] !== 0) return; // Can't select original clues
        
        // Clear previous selection
        const cells = document.querySelectorAll('#sudoku-table td');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.classList.remove('selected');
        });
        
        // Highlight selected cell
        const cellIndex = row * currentSize + col;
        cells[cellIndex].style.backgroundColor = '#ffccff';
        cells[cellIndex].classList.add('selected');
        
        selectedCell = { row, col };
    }
    
    function makeMove(row, col, value) {
        if (currentPuzzle[row][col] !== 0) return; // Can't modify original clues
        
        // Save to history
        moveHistory.push({
            row,
            col,
            previousValue: userBoard[row][col],
            newValue: value,
            previousNotes: [...notesBoard[row][col]]
        });
        
        // Update user board
        userBoard[row][col] = value;
        
        // Clear notes when placing a number
        notesBoard[row][col] = [];
        
        renderBoard();
    }
    
    function toggleNote(row, col, noteValue) {
        if (currentPuzzle[row][col] !== 0 || userBoard[row][col] !== 0) return;
        
        // Save to history
        moveHistory.push({
            row,
            col,
            previousValue: userBoard[row][col],
            newValue: userBoard[row][col],
            previousNotes: [...notesBoard[row][col]]
        });
        
        const currentNotes = notesBoard[row][col];
        const index = currentNotes.indexOf(noteValue);
        
        if (index === -1) {
            // Add note
            currentNotes.push(noteValue);
            currentNotes.sort((a, b) => a - b);
        } else {
            // Remove note
            currentNotes.splice(index, 1);
        }
        
        renderBoard();
    }
    
    function clearAllNotes(row, col) {
        if (currentPuzzle[row][col] !== 0 || userBoard[row][col] !== 0) return;
        
        // Save to history
        moveHistory.push({
            row,
            col,
            previousValue: userBoard[row][col],
            newValue: userBoard[row][col],
            previousNotes: [...notesBoard[row][col]]
        });
        
        notesBoard[row][col] = [];
        renderBoard();
    }
    
    function toggleNotesMode() {
        notesMode = !notesMode;
        const button = document.getElementById('toggle-notes');
        button.textContent = notesMode ? 'Notes Mode: ON' : 'Notes Mode: OFF';
        button.style.backgroundColor = notesMode ? '#ff3399' : 'pink';
        
        // Re-render board to show/hide notes
        renderBoard();
    }
    
    function checkSolution() {
        let isCorrect = true;
        
        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                if (userBoard[i][j] !== solution[i][j]) {
                    isCorrect = false;
                    break;
                }
            }
            if (!isCorrect) break;
        }
        
        if (isCorrect) {
            alert('Congratulations! The solution is correct!');
            createConfetti();
        } else {
            alert('There are errors in your solution. Keep trying!');
        }
    }
    
    function createConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.backgroundColor = ['#ff3399', '#ffcc00', '#33ccff'][Math.floor(Math.random() * 3)];
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
    
    function solveCurrentPuzzle() {
        if (confirm('This will automatically solve the puzzle. Continue?')) {
            userBoard = solution.map(row => [...row]);
            // Clear all notes when solving
            notesBoard = Array(currentSize).fill().map(() => 
                Array(currentSize).fill().map(() => [])
            );
            renderBoard();
        }
    }
    
    function resetPuzzle() {
        if (confirm('Reset all your entries and notes?')) {
            userBoard = currentPuzzle.map(row => [...row]);
            notesBoard = Array(currentSize).fill().map(() => 
                Array(currentSize).fill().map(() => [])
            );
            moveHistory = [];
            selectedCell = null;
            renderBoard();
        }
    }
    
    function provideHint() {
        // Find an empty cell and fill it with the correct value
        const emptyCells = [];
        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                if (userBoard[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            makeMove(randomCell.row, randomCell.col, solution[randomCell.row][randomCell.col]);
            alert(`Hint placed at row ${randomCell.row + 1}, column ${randomCell.col + 1}`);
        } else {
            alert('No empty cells to provide a hint for!');
        }
    }
    
    function undoMove() {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            userBoard[lastMove.row][lastMove.col] = lastMove.previousValue;
            notesBoard[lastMove.row][lastMove.col] = lastMove.previousNotes || [];
            renderBoard();
        } else {
            alert('No moves to undo!');
        }
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        if (!selectedCell) return;
        
        const row = selectedCell.row;
        const col = selectedCell.col;
        
        if (/^[1-9]$/.test(event.key)) {
            const num = parseInt(event.key);
            if (num <= currentSize) {
                if (notesMode) {
                    toggleNote(row, col, num);
                } else {
                    makeMove(row, col, num);
                }
            }
        } else if (/^[0-9]$/.test(event.key) && currentSize > 9) {
            // Handle numbers for larger boards
            const num = parseInt(event.key);
            if (num <= currentSize) {
                if (notesMode) {
                    toggleNote(row, col, num);
                } else {
                    makeMove(row, col, num);
                }
            }
        } else if (event.key === '0' || event.key === 'Delete' || event.key === 'Backspace') {
            if (notesMode) {
                clearAllNotes(row, col);
            } else {
                makeMove(row, col, 0);
            }
        }
    });
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

setFavicon('🔢');