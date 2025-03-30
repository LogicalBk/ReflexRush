document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameArea = document.querySelector('.game-area');
    const target = document.querySelector('.target');
    const startBtn = document.querySelector('.start-btn');
    const timerDisplay = document.querySelector('.timer');
    const scoreDisplay = document.querySelector('.score-display');
    const instructions = document.querySelector('.instructions');
    const gameResult = document.querySelector('.game-result');
    const finalScoreDisplay = document.querySelector('.final-score');
    const botComparison = document.querySelector('.bot-comparison');
    const playAgainBtn = document.querySelector('.play-again');
    const shareBtns = document.querySelectorAll('.share-btn');
    
    // Mode selection
    const modeBtns = document.querySelectorAll('.mode-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    // Game variables
    let score = 0;
    let timeLeft = 30;
    let gameActive = false;
    let timer;
    let currentMode = 'click';
    let currentDifficulty = 'easy';
    let sequence = [];
    let playerSequence = [];
    let sequenceLevel = 1;
    let targetColor = '#ff6b6b';
    let colors = ['#ff6b6b', '#4a6bff', '#2ecc71', '#f39c12', '#9b59b6'];
    let colorChangeInterval;
    let botScores = {
        click: { easy: 15, medium: 25, hard: 40 },
        color: { easy: 12, medium: 20, hard: 35 },
        sequence: { easy: 5, medium: 8, hard: 12 },
        bot: { easy: 0, medium: 0, hard: 0 }
    };
    
    // Initialize game
    init();
    
    function init() {
        // Event listeners for mode selection
        modeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                modeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentMode = this.dataset.mode;
                resetGame();
                updateInstructions();
            });
        });
        
        // Event listeners for difficulty selection
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentDifficulty = this.dataset.difficulty;
                resetGame();
            });
        });
        
        // Start game button
        startBtn.addEventListener('click', startGame);
        
        // Play again button
        playAgainBtn.addEventListener('click', function() {
            gameResult.style.display = 'none';
            resetGame();
            startGame();
        });
        
        // Target click event
        target.addEventListener('click', handleTargetClick);
        
        // Share buttons
        shareBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                let platform = this.classList.contains('twitter') ? 'twitter' :
                              this.classList.contains('facebook') ? 'facebook' : 'whatsapp';
                shareScore(platform);
            });
        });
        
        updateInstructions();
    }
    
    function updateInstructions() {
        let instructionsText = '';
        
        switch(currentMode) {
            case 'click':
                instructionsText = 'Click the target as many times as you can before time runs out!';
                break;
            case 'color':
                instructionsText = 'Click the target only when it turns GREEN!';
                break;
            case 'sequence':
                instructionsText = 'Memorize and repeat the sequence of colors!';
                break;
            case 'bot':
                instructionsText = 'Compete against our AI bot in a series of reflex challenges!';
                break;
        }
        
        instructions.textContent = instructionsText;
    }
    
    function startGame() {
        if (gameActive) return;
        
        gameActive = true;
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = `Score: ${score}`;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        startBtn.style.display = 'none';
        
        // Start timer
        timer = setInterval(function() {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        // Initialize game mode
        switch(currentMode) {
            case 'click':
                startClickChallenge();
                break;
            case 'color':
                startColorChallenge();
                break;
            case 'sequence':
                startSequenceChallenge();
                break;
            case 'bot':
                startBotChallenge();
                break;
        }
    }
    
    function startClickChallenge() {
        target.style.display = 'flex';
        target.textContent = 'Click!';
        target.style.backgroundColor = '#ff6b6b';
        moveTarget();
    }
    
    function startColorChallenge() {
        target.style.display = 'flex';
        target.textContent = 'Wait...';
        target.style.backgroundColor = '#ff6b6b';
        
        // Adjust interval based on difficulty
        let interval;
        switch(currentDifficulty) {
            case 'easy': interval = 1500; break;
            case 'medium': interval = 1000; break;
            case 'hard': interval = 700; break;
        }
        
        colorChangeInterval = setInterval(changeTargetColor, interval);
    }
    
    function startSequenceChallenge() {
        sequence = [];
        playerSequence = [];
        sequenceLevel = 1;
        target.style.display = 'none';
        showSequence();
    }
    
    function startBotChallenge() {
        // For bot mode, we'll alternate between different challenges
        startClickChallenge();
        // In a full implementation, this would cycle through different modes
    }
    
    function handleTargetClick() {
        if (!gameActive) return;
        
        switch(currentMode) {
            case 'click':
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                moveTarget();
                break;
            case 'color':
                if (target.style.backgroundColor === 'rgb(46, 204, 113)') { // green
                    score++;
                    scoreDisplay.textContent = `Score: ${score}`;
                } else {
                    score = Math.max(0, score - 1);
                    scoreDisplay.textContent = `Score: ${score}`;
                }
                break;
            // Sequence mode handled separately
        }
    }
    
    function moveTarget() {
        const gameRect = gameArea.getBoundingClientRect();
        const maxX = gameRect.width - target.offsetWidth;
        const maxY = gameRect.height - target.offsetHeight;
        
        // Adjust movement speed based on difficulty
        let moveDistance;
        switch(currentDifficulty) {
            case 'easy': moveDistance = 0.7; break;
            case 'medium': moveDistance = 0.5; break;
            case 'hard': moveDistance = 0.3; break;
        }
        
        const randomX = Math.floor(Math.random() * maxX * moveDistance);
        const randomY = Math.floor(Math.random() * maxY * moveDistance);
        
        target.style.position = 'absolute';
        target.style.left = `${randomX}px`;
        target.style.top = `${randomY}px`;
    }
    
    function changeTargetColor() {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        target.style.backgroundColor = randomColor;
        
        if (randomColor === '#2ecc71') { // green
            target.textContent = 'Click!';
        } else {
            target.textContent = 'Wait...';
        }
    }
    
    function showSequence() {
        instructions.textContent = 'Memorize the sequence...';
        target.style.display = 'none';
        
        // Add a new color to the sequence
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(newColor);
        
        // Display the sequence to the player
        let i = 0;
        const sequenceInterval = setInterval(function() {
            if (i < sequence.length) {
                target.style.display = 'flex';
                target.style.backgroundColor = sequence[i];
                target.textContent = '';
                i++;
            } else {
                clearInterval(sequenceInterval);
                target.style.display = 'none';
                setTimeout(function() {
                    instructions.textContent = 'Now repeat the sequence!';
                    playerSequence = [];
                    target.style.display = 'flex';
                    target.style.backgroundColor = '#f5f7fa';
                    target.textContent = 'Click colors in order';
                    
                    // Show all colors for player to click
                    colors.forEach(color => {
                        const colorBtn = document.createElement('div');
                        colorBtn.className = 'target';
                        colorBtn.style.backgroundColor = color;
                        colorBtn.style.margin = '5px';
                        colorBtn.style.display = 'inline-block';
                        colorBtn.style.width = '50px';
                        colorBtn.style.height = '50px';
                        colorBtn.addEventListener('click', function() {
                            playerSequence.push(color);
                            checkSequence();
                        });
                        gameArea.appendChild(colorBtn);
                    });
                }, 1000);
            }
        }, 1000);
    }
    
    function checkSequence() {
        for (let i = 0; i < playerSequence.length; i++) {
            if (playerSequence[i] !== sequence[i]) {
                endGame();
                return;
            }
        }
        
        if (playerSequence.length === sequence.length) {
            // Correct sequence
            score += sequence.length;
            scoreDisplay.textContent = `Score: ${score}`;
            sequenceLevel++;
            
            // Remove color buttons
            document.querySelectorAll('.target').forEach(el => {
                if (el !== target) el.remove();
            });
            
            // Show next sequence
            setTimeout(showSequence, 1000);
        }
    }
    
    function endGame() {
        gameActive = false;
        clearInterval(timer);
        
        if (currentMode === 'color') {
            clearInterval(colorChangeInterval);
        }
        
        target.style.display = 'none';
        startBtn.style.display = 'block';
        
        // Show game result
        finalScoreDisplay.textContent = score;
        
        // Compare with bot
        const botScore = botScores[currentMode][currentDifficulty];
        if (score > botScore) {
            botComparison.textContent = `You beat the bot (${botScore})!`;
            botComparison.style.color = '#2ecc71';
        } else if (score === botScore) {
            botComparison.textContent = `You tied with the bot (${botScore})!`;
            botComparison.style.color = '#4a6bff';
        } else {
            botComparison.textContent = `The bot beat you (${botScore})! Try again!`;
            botComparison.style.color = '#ff6b6b';
        }
        
        gameResult.style.display = 'flex';
        
        // Update leaderboard (in a real app, this would be saved to a database)
        const leaderboard = document.querySelector('.leaderboard tbody');
        if (leaderboard.rows.length > 0) {
            leaderboard.rows[0].cells[2].textContent = score;
            leaderboard.rows[0].cells[3].textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
            leaderboard.rows[0].cells[4].textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
        }
    }
    
    function resetGame() {
        gameActive = false;
        clearInterval(timer);
        if (colorChangeInterval) clearInterval(colorChangeInterval);
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = `Score: ${score}`;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        target.style.display = 'none';
        startBtn.style.display = 'block';
        
        // Remove any color buttons from sequence mode
        document.querySelectorAll('.target').forEach(el => {
            if (el !== target) el.remove();
        });
        
        updateInstructions();
    }
    
    function shareScore(platform) {
        const message = `I scored ${score} in Reflex Rush (${currentMode} mode, ${currentDifficulty} difficulty)! Can you beat me?`;
        let url = '';
        
        switch(platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                break;
        }
        
        window.open(url, '_blank', 'width=600,height=400');
    }
});