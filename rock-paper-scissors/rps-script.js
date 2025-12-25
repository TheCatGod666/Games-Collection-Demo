// Rock Paper Scissors Game - Gyaru Edition
document.addEventListener('DOMContentLoaded', function() {
    const rpsBoard = document.getElementById('rps-board');
    const controls = document.getElementById('controls');
    
    let playerScore = 0;
    let computerScore = 0;
    let ties = 0;
    let moves = 0;
    const maxMoves = 10;
    
    // Initialize the game
    initializeGame();
    
    // Button event listeners
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('reset-score').addEventListener('click', resetScore);
    
    function initializeGame() {
        // Create score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.style.textAlign = 'center';
        scoreDisplay.style.margin = '20px 0';
        scoreDisplay.style.color = '#fff';
        scoreDisplay.style.fontSize = '1.5em';
        scoreDisplay.style.fontWeight = 'bold';
        scoreDisplay.style.textShadow = '2px 2px 0 #ff3399';
        controls.insertBefore(scoreDisplay, controls.firstChild);
        
        // Create moves display
        const movesDisplay = document.createElement('div');
        movesDisplay.id = 'moves-display';
        movesDisplay.style.textAlign = 'center';
        movesDisplay.style.margin = '10px 0';
        movesDisplay.style.color = '#fff';
        movesDisplay.style.fontSize = '1.2em';
        movesDisplay.style.fontWeight = 'bold';
        controls.insertBefore(movesDisplay, scoreDisplay);
        
        updateScoreDisplay();
        updateMovesDisplay();
        createGameBoard();
        startNewGame();
    }
    
    function createGameBoard() {
        rpsBoard.innerHTML = '';
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.gap = '30px';
        gameContainer.style.margin = '30px auto';
        
        // Create choices section
        const choicesSection = document.createElement('div');
        choicesSection.id = 'choices-section';
        choicesSection.style.textAlign = 'center';
        
        const choicesTitle = document.createElement('h2');
        choicesTitle.textContent = 'CHOOSE YOUR MOVE';
        choicesTitle.style.color = '#ff3399';
        choicesTitle.style.textShadow = '2px 2px 0 #ffcc00';
        choicesTitle.style.marginBottom = '30px';
        choicesTitle.style.fontSize = '2em';
        
        const choicesContainer = document.createElement('div');
        choicesContainer.id = 'choices-container';
        choicesContainer.style.display = 'flex';
        choicesContainer.style.justifyContent = 'center';
        choicesContainer.style.gap = '50px';
        choicesContainer.style.flexWrap = 'wrap';
        
        // Create choice buttons
        const choices = [
            { name: 'rock', emoji: '✊', color: '#ff3399' },
            { name: 'paper', emoji: '✋', color: '#33ccff' },
            { name: 'scissors', emoji: '✌️', color: '#ffcc00' }
        ];
        
        choices.forEach(choice => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = `choice-btn ${choice.name}`;
            choiceBtn.dataset.choice = choice.name;
            
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = choice.emoji;
            emojiSpan.style.fontSize = '4em';
            emojiSpan.style.display = 'block';
            emojiSpan.style.marginBottom = '10px';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = choice.name.toUpperCase();
            textSpan.style.fontSize = '1.2em';
            textSpan.style.fontWeight = 'bold';
            
            choiceBtn.appendChild(emojiSpan);
            choiceBtn.appendChild(textSpan);
            
            // Style the button
            choiceBtn.style.background = `linear-gradient(145deg, ${choice.color}, ${lightenColor(choice.color, 30)})`;
            choiceBtn.style.border = '6px solid white';
            choiceBtn.style.borderRadius = '50%';
            choiceBtn.style.width = '180px';
            choiceBtn.style.height = '180px';
            choiceBtn.style.display = 'flex';
            choiceBtn.style.flexDirection = 'column';
            choiceBtn.style.alignItems = 'center';
            choiceBtn.style.justifyContent = 'center';
            choiceBtn.style.cursor = 'pointer';
            choiceBtn.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            choiceBtn.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
            
            choiceBtn.addEventListener('mouseenter', () => {
                choiceBtn.style.transform = 'scale(1.1) rotate(5deg)';
                choiceBtn.style.boxShadow = `0 20px 40px ${darkenColor(choice.color, 20)}`;
            });
            
            choiceBtn.addEventListener('mouseleave', () => {
                choiceBtn.style.transform = 'scale(1) rotate(0deg)';
                choiceBtn.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
            });
            
            choiceBtn.addEventListener('click', () => handlePlayerChoice(choice.name));
            
            choicesContainer.appendChild(choiceBtn);
        });
        
        choicesSection.appendChild(choicesTitle);
        choicesSection.appendChild(choicesContainer);
        
        // Create battle arena
        const arenaSection = document.createElement('div');
        arenaSection.id = 'arena-section';
        arenaSection.style.width = '100%';
        arenaSection.style.maxWidth = '800px';
        arenaSection.style.margin = '40px auto';
        
        const arenaContainer = document.createElement('div');
        arenaContainer.id = 'arena-container';
        arenaContainer.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,240,250,0.9))';
        arenaContainer.style.borderRadius = '30px';
        arenaContainer.style.padding = '40px';
        arenaContainer.style.boxShadow = '0 20px 40px rgba(255, 51, 153, 0.3)';
        arenaContainer.style.border = '8px double #ff66cc';
        arenaContainer.style.position = 'relative';
        
        arenaContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #ff3399; text-shadow: 2px 2px 0 #ffcc00; font-size: 1.8em;">BATTLE ARENA</h2>
            </div>
            <div id="players-display" style="display: flex; justify-content: space-between; align-items: center; gap: 40px;">
                <div id="player-choice" class="choice-display" style="flex: 1; text-align: center;">
                    <div class="choice-emoji" style="font-size: 5em; margin-bottom: 10px;">❓</div>
                    <div class="choice-label" style="font-size: 1.5em; font-weight: bold; color: #3366ff;">YOU</div>
                </div>
                <div id="vs-display" style="font-size: 3em; color: #ff3399; font-weight: bold; text-shadow: 3px 3px 0 #ffcc00;">VS</div>
                <div id="computer-choice" class="choice-display" style="flex: 1; text-align: center;">
                    <div class="choice-emoji" style="font-size: 5em; margin-bottom: 10px;">❓</div>
                    <div class="choice-label" style="font-size: 1.5em; font-weight: bold; color: #ff0066;">COMPUTER</div>
                </div>
            </div>
            <div id="result-display" style="text-align: center; margin-top: 40px; min-height: 80px;">
                <div id="result-text" style="font-size: 2em; font-weight: bold; color: #ff3399; text-shadow: 2px 2px 0 white;">Choose your move!</div>
                <div id="result-details" style="font-size: 1.2em; color: #666; margin-top: 10px;"></div>
            </div>
        `;
        
        arenaSection.appendChild(arenaContainer);
        
        // Create history section
        const historySection = document.createElement('div');
        historySection.id = 'history-section';
        historySection.style.width = '100%';
        historySection.style.maxWidth = '800px';
        historySection.style.margin = '40px auto';
        
        const historyContainer = document.createElement('div');
        historyContainer.id = 'history-container';
        historyContainer.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,204,0.9))';
        historyContainer.style.borderRadius = '20px';
        historyContainer.style.padding = '20px';
        historyContainer.style.boxShadow = '0 10px 20px rgba(255, 204, 0, 0.3)';
        historyContainer.style.border = '5px solid #ffcc00';
        
        historyContainer.innerHTML = `
            <h3 style="text-align: center; color: #ff9900; text-shadow: 1px 1px 0 white; margin-bottom: 20px;">ROUND HISTORY</h3>
            <div id="history-list" style="max-height: 200px; overflow-y: auto; padding: 10px;">
                <!-- History items will be added here -->
            </div>
        `;
        
        historySection.appendChild(historyContainer);
        
        // Assemble the game board
        gameContainer.appendChild(choicesSection);
        gameContainer.appendChild(arenaSection);
        gameContainer.appendChild(historySection);
        
        rpsBoard.appendChild(gameContainer);
    }
    
    function lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
    
    function darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (
            0x1000000 +
            (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
            (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
            (B > 0 ? (B < 255 ? B : 255) : 0)
        ).toString(16).slice(1);
    }
    
    function updateScoreDisplay() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.innerHTML = `
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                    <div style="background: linear-gradient(45deg, #3366ff, #6699ff); padding: 15px 30px; border-radius: 20px; border: 4px solid white;">
                        <div style="font-size: 0.8em;">PLAYER</div>
                        <div style="font-size: 2em;">${playerScore}</div>
                    </div>
                    <div style="background: linear-gradient(45deg, #ff0066, #ff3399); padding: 15px 30px; border-radius: 20px; border: 4px solid white;">
                        <div style="font-size: 0.8em;">COMPUTER</div>
                        <div style="font-size: 2em;">${computerScore}</div>
                    </div>
                    <div style="background: linear-gradient(45deg, #666, #999); padding: 15px 30px; border-radius: 20px; border: 4px solid white;">
                        <div style="font-size: 0.8em;">TIES</div>
                        <div style="font-size: 2em;">${ties}</div>
                    </div>
                </div>
            `;
        }
    }
    
    function updateMovesDisplay() {
        const movesDisplay = document.getElementById('moves-display');
        if (movesDisplay) {
            movesDisplay.innerHTML = `
                <div style="background: linear-gradient(45deg, #00cc66, #00ff99); padding: 10px 20px; border-radius: 15px; border: 3px solid white; display: inline-block;">
                    MOVES: ${moves} / ${maxMoves}
                </div>
            `;
        }
    }
    
    function startNewGame() {
        playerScore = 0;
        computerScore = 0;
        ties = 0;
        moves = 0;
        
        updateScoreDisplay();
        updateMovesDisplay();
        
        // Reset arena display
        const playerEmoji = document.querySelector('#player-choice .choice-emoji');
        const computerEmoji = document.querySelector('#computer-choice .choice-emoji');
        const resultText = document.getElementById('result-text');
        const resultDetails = document.getElementById('result-details');
        
        if (playerEmoji) playerEmoji.textContent = '❓';
        if (computerEmoji) computerEmoji.textContent = '❓';
        if (resultText) resultText.textContent = 'Choose your move!';
        if (resultDetails) resultDetails.textContent = '';
        
        // Clear history
        const historyList = document.getElementById('history-list');
        if (historyList) historyList.innerHTML = '';
        
        // Re-enable choice buttons
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });
        
        // Add floating elements
        addFloatingElements();
    }
    
    function resetScore() {
        if (confirm('Reset all scores to zero?')) {
            startNewGame();
        }
    }
    
    function handlePlayerChoice(playerChoice) {
        if (moves >= maxMoves) return;
        
        moves++;
        updateMovesDisplay();
        
        // Computer's random choice
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        // Update display with choices
        updateChoiceDisplay(playerChoice, computerChoice);
        
        // Determine winner
        const result = determineWinner(playerChoice, computerChoice);
        
        // Update scores and display result
        updateScores(result);
        displayResult(result, playerChoice, computerChoice);
        
        // Add to history
        addToHistory(playerChoice, computerChoice, result);
        
        // Check if game is over
        if (moves >= maxMoves) {
            setTimeout(endGame, 1000);
        }
    }
    
    function updateChoiceDisplay(playerChoice, computerChoice) {
        const emojis = {
            'rock': '✊',
            'paper': '✋',
            'scissors': '✌️'
        };
        
        const playerEmoji = document.querySelector('#player-choice .choice-emoji');
        const computerEmoji = document.querySelector('#computer-choice .choice-emoji');
        
        if (playerEmoji) {
            playerEmoji.textContent = emojis[playerChoice];
            playerEmoji.style.animation = 'bounceIn 0.5s';
        }
        
        if (computerEmoji) {
            computerEmoji.textContent = emojis[computerChoice];
            computerEmoji.style.animation = 'bounceIn 0.5s';
        }
        
        // Remove animation after it completes
        setTimeout(() => {
            if (playerEmoji) playerEmoji.style.animation = '';
            if (computerEmoji) computerEmoji.style.animation = '';
        }, 500);
    }
    
    function determineWinner(player, computer) {
        if (player === computer) return 'tie';
        
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'player';
        }
        
        return 'computer';
    }
    
    function updateScores(result) {
        switch (result) {
            case 'player':
                playerScore++;
                break;
            case 'computer':
                computerScore++;
                break;
            case 'tie':
                ties++;
                break;
        }
        updateScoreDisplay();
    }
    
    function displayResult(result, playerChoice, computerChoice) {
        const resultText = document.getElementById('result-text');
        const resultDetails = document.getElementById('result-details');
        
        const messages = {
            'player': { 
                text: '🎉 YOU WIN! 🎉', 
                color: '#00cc66',
                details: `${capitalize(playerChoice)} beats ${computerChoice}!`
            },
            'computer': { 
                text: '💻 COMPUTER WINS! 💻', 
                color: '#ff0066',
                details: `${capitalize(computerChoice)} beats ${playerChoice}!`
            },
            'tie': { 
                text: '🤝 IT\'S A TIE! 🤝', 
                color: '#6666ff',
                details: `Both chose ${playerChoice}!`
            }
        };
        
        const message = messages[result];
        
        if (resultText) {
            resultText.textContent = message.text;
            resultText.style.color = message.color;
            resultText.style.textShadow = '2px 2px 0 white';
            resultText.style.animation = 'pulse 0.5s';
        }
        
        if (resultDetails) {
            resultDetails.textContent = message.details;
        }
        
        // Add confetti for win
        if (result === 'player') {
            createConfetti();
        }
        
        // Remove animation after it completes
        setTimeout(() => {
            if (resultText) resultText.style.animation = '';
        }, 500);
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    function addToHistory(playerChoice, computerChoice, result) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        const emojis = {
            'rock': '✊',
            'paper': '✋',
            'scissors': '✌️'
        };
        
        const resultIcons = {
            'player': '✅',
            'computer': '❌',
            'tie': '⚪'
        };
        
        const historyItem = document.createElement('div');
        historyItem.style.display = 'flex';
        historyItem.style.justifyContent = 'space-between';
        historyItem.style.alignItems = 'center';
        historyItem.style.padding = '10px';
        historyItem.style.margin = '5px 0';
        historyItem.style.background = 'rgba(255,255,255,0.7)';
        historyItem.style.borderRadius = '10px';
        historyItem.style.borderLeft = `5px solid ${
            result === 'player' ? '#00cc66' : 
            result === 'computer' ? '#ff0066' : '#6666ff'
        }`;
        
        historyItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5em;">${emojis[playerChoice]}</span>
                <span>YOU</span>
            </div>
            <div style="font-size: 1.2em; color: #666;">vs</div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5em;">${emojis[computerChoice]}</span>
                <span>COMP</span>
            </div>
            <div style="font-size: 1.5em; margin-left: 20px;">${resultIcons[result]}</div>
        `;
        
        // Add at the top of the list
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Limit history to last 10 items
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    function endGame() {
        const resultText = document.getElementById('result-text');
        const resultDetails = document.getElementById('result-details');
        const choiceBtns = document.querySelectorAll('.choice-btn');
        
        // Disable choice buttons
        choiceBtns.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });
        
        // Display final result
        let finalMessage = '';
        let finalColor = '';
        
        if (playerScore > computerScore) {
            finalMessage = '🎊 VICTORY! YOU WON THE GAME! 🎊';
            finalColor = '#00cc66';
            createConfetti();
            createConfetti();
        } else if (computerScore > playerScore) {
            finalMessage = '😢 DEFEAT! COMPUTER WON THE GAME! 😢';
            finalColor = '#ff0066';
        } else {
            finalMessage = '🤝 THE GAME ENDS IN A TIE! 🤝';
            finalColor = '#6666ff';
        }
        
        if (resultText) {
            resultText.textContent = finalMessage;
            resultText.style.color = finalColor;
            resultText.style.fontSize = '1.5em';
            resultText.style.animation = 'pulse 1s infinite';
        }
        
        if (resultDetails) {
            resultDetails.textContent = `Final Score: You ${playerScore} - ${computerScore} Computer (${ties} ties)`;
            resultDetails.style.fontSize = '1.3em';
            resultDetails.style.fontWeight = 'bold';
        }
    }
    
    function createConfetti() {
        const colors = ['#ff3399', '#ffcc00', '#33ccff', '#00cc66'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.width = `${Math.random() * 20 + 5}px`;
            confetti.style.height = `${Math.random() * 20 + 5}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
    
    function addFloatingElements() {
        // Remove existing floating elements
        const existing = document.querySelectorAll('.floating-element');
        existing.forEach(el => el.remove());
        
        const symbols = ['✊', '✋', '✌️', '🎮', '⭐', '❤️'];
        symbols.forEach((symbol, index) => {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.textContent = symbol;
            element.style.position = 'fixed';
            element.style.fontSize = `${30 + index * 10}px`;
            element.style.color = ['#ff3399', '#ffcc00', '#33ccff', '#ff66cc', '#00cc66', '#9966ff'][index];
            element.style.pointerEvents = 'none';
            element.style.zIndex = '-1';
            element.style.animation = `floatAround ${20 + index * 5}s infinite linear`;
            element.style.animationDelay = `${-index * 5}s`;
            element.style.opacity = '0.6';
            document.body.appendChild(element);
        });
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .choice-display {
            transition: all 0.3s ease;
        }
        
        .choice-display:hover {
            transform: translateY(-10px);
        }
    `;
    document.head.appendChild(style);
    
    // Start the game
    startNewGame();
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

setFavicon('✌️');