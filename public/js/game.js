// Game state and configuration
let characters = [
    {
        id: 'budiono',
        activeImage: '../asset/TBudiono.png',
        waitingImage: '../asset/WBudiono.png',
        statement: 'Saya selalu berusaha untuk menghargai dan menghormati perbedaan agama serta kepercayaan yang ada di sekitar saya.',
        correctZone: 'pancasila1'
    }
];

let dialogues = [
    {
        characters: [
            {
                id: 'budiono',
                activeImage: '../asset/TBudiono.png',
                waitingImage: '../asset/WBudiono.png',
                position: 'right'
            },
            {
                id: 'fufafu',
                activeImage: '../asset/TFufafu.png',
                waitingImage: '../asset/WFufafu.png',
                position: 'left'
            }
        ],
        messages: [
            {
                speaker: 'budiono',
                text: "Kita akan mengadakan rapat hari Minggu pagi, tetapi saya dengar kamu butuh waktu untuk ibadah di pagi hari?"
            },
            {
                speaker: 'fufafu',
                text: "Iya, saya butuh waktu sedikit di pagi hari untuk beribadah. Kalau bisa, rapat dimulai sedikit lebih siang."
            },
            {
                speaker: 'budiono',
                text: "Baik, saya akan mengatur agar rapat dimulai setelah waktu ibadah selesai."
            }
        ],
        correctZone: 'pancasila1'
    },
    {
        characters: [
            {
                id: 'siregar',
                activeImage: '../asset/TSiregar.png',
                waitingImage: '../asset/WSiregar.png',
                position: 'right'
            },
            {
                id: 'fafafu',
                activeImage: '../asset/TFafafu.png',
                waitingImage: '../asset/WFafafu.png',
                position: 'left'
            }
        ],
        messages: [
            {
                speaker: 'siregar',
                text: "Kemarin, aku melihat ada anak kecil yang membutuhkan bantuan di pinggir jalan. Aku memberikan makanan dan air padanya."
            },
            {
                speaker: 'fafafu',
                text: "Bagus sekali, kita memang harus peduli terhadap sesama dan membantu mereka yang sedang dalam kesulitan."
            }
        ],
        correctZone: 'pancasila2'
    }
];

let gameState = {
    currentType: null,
    dialogueState: {
        currentDialogue: null,
        currentIndex: 0,
        isComplete: false
    },
    characterState: {
        currentCharacter: null
    },
    score: 0,
    lives: 3,
    isDragging: false
};


let currentCharacterIndex = 0;
let score = 0;
let lives = 3;
let isDragging = false;
let isCooldownActive = false; // Add cooldown flag

// Initialize game audio
let gameTheme, dialogueSound, cashRegister, wrongSound, clickSound;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio elements
    gameTheme = document.getElementById('gameTheme');
    dialogueSound = document.getElementById('dialogueSound');
    cashRegister = document.getElementById('cashRegister');
    wrongSound = document.getElementById('wrongSound');
    clickSound = document.getElementById('clickSound');
    
    // Start game music
    gameTheme.play();
    
    initializeGame();
});

// Initialize game with random state
function initializeGame() {
    setupRandomState();
    updateScore(0);
    setupLives();
    setupDragAndDrop();
    setupGameClickHandler();
    setupKeyboardControls();
    updateKeyVisibility();
}

// Update the setupRandomState function to include key position update
// Ensure the key is hidden at the start of a new dialogue or character
function setupRandomState() {
    gameState.currentType = Math.random() < 0.5 ? 'character' : 'dialogue';

    // Reset dialogue state when starting new dialogue
    gameState.dialogueState.isComplete = false;
    updateKeyVisibility(); // Ensure key is hidden initially

    if (gameState.currentType === 'dialogue') {
        gameState.dialogueState.currentDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        gameState.dialogueState.currentIndex = 0;
        showDialogue();
    } else {
        gameState.characterState.currentCharacter = characters[Math.floor(Math.random() * characters.length)];
        showCharacter(gameState.characterState.currentCharacter);
    }

    // Update key position after setting up the new state
    updateKeyPosition();
}

document.addEventListener('DOMContentLoaded', function() {
    const cloudL = document.getElementById('cloudL');
    const cloudR = document.getElementById('cloudR');
    const playButton = document.getElementById('play-button');
    const learnButton = document.getElementById('learn-button');
    
    // Block pointer events initially
    playButton.style.pointerEvents = 'none';
    learnButton.style.pointerEvents = 'none';
    
    document.body.addEventListener('click', function() {
        const chestOpen = document.getElementById('chestOpen');
        const pirateTheme = document.getElementById('pirateTheme');
        
        // Play sounds simultaneously
        chestOpen.currentTime = 0;
        chestOpen.play();
        pirateTheme.currentTime = 0;
        pirateTheme.play();
        
        // Remove clouds with a curtain effect
        cloudL.style.transition = 'left 1s ease';
        cloudR.style.transition = 'right 1s ease';
        cloudL.style.left = '-100%';
        cloudR.style.right = '-100%';
        
        // Enable buttons after clouds disappear
        setTimeout(() => {
            playButton.style.pointerEvents = 'auto';
            learnButton.style.pointerEvents = 'auto';
        }, 1000); // Adjust delay based on transition speed
    }, { once: true });
});

// Update the drag and drop handlers
function setupDragAndDrop() {
    const floatingKey = document.getElementById('floating-key');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    floatingKey.addEventListener('mousedown', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
    
    floatingKey.addEventListener('dragstart', handleDragStart);
    floatingKey.addEventListener('dragend', handleDragEnd);
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
                zone.classList.add('drag-over');
            }
        });
        
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
                zone.classList.add('drag-over');
            }
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', handleDrop);
    });
}

// Update the key position based on game state
function updateKeyPosition() {
    const keyContainer = document.getElementById('key-container');
    
    if (gameState.currentType === 'dialogue') {
        // For dialogue state, position the key near the dialogue box
        keyContainer.style.top = "25%";
        keyContainer.style.left = "50%";
    } else {
        // For character state, position the key near the statement
        keyContainer.style.top = "25%";
        keyContainer.style.left = "50%";
    }
}

// Update showCharacter function to handle key position
function showCharacter(character) {
    const container = document.getElementById("character-container");
    container.innerHTML = '';

    // Create character image with updated positioning
    const characterImg = document.createElement("img");
    characterImg.src = character.activeImage;
    characterImg.alt = "Karakter";
    characterImg.style.position = "absolute";
    characterImg.style.right = "-5%";
    characterImg.style.top = "-100%";
    characterImg.style.transform = "none";
    characterImg.style.width = "70%"; // Set width to 20% of container
    characterImg.style.height = "auto"; // Maintain aspect ratio
    characterImg.draggable = false;

    // Create statement box with existing styling
    const statementBox = document.createElement("div");
    statementBox.id = "statement-box";
    statementBox.style.position = "absolute";
    statementBox.style.left = "45%";
    statementBox.style.top = "80%";
    statementBox.style.width = "600px";
    statementBox.style.transform = "none";
    statementBox.style.textAlign = "left";
    statementBox.style.padding = "10px";
    statementBox.style.borderRadius = "8px";
    statementBox.style.fontFamily = "Helvetica, Arial, sans-serif";
    statementBox.style.fontWeight = "bold";
    statementBox.style.fontSize = "16px";
    statementBox.style.color = "#000";
    statementBox.style.background = "none";
    
    const statementP = document.createElement("p");
    statementP.id = "statement";
    statementP.textContent = character.statement;
    statementBox.appendChild(statementP);

    container.appendChild(characterImg);
    container.appendChild(statementBox);

    // Update key position
    updateKeyPosition();
}

function showDialogue() {
    gameState.isDragging = false;  // Ensure dragging is reset
    const container = document.getElementById("character-container");
    container.innerHTML = '';

    const currentDialogue = gameState.dialogueState.currentDialogue;
    const currentMessage = currentDialogue.messages[gameState.dialogueState.currentIndex];
    
    // Setup characters
    currentDialogue.characters.forEach(char => {
        const charImg = document.createElement("img");
        charImg.src = char.id === currentMessage.speaker ? char.activeImage : char.waitingImage;
        charImg.alt = char.id;
        charImg.style.position = "absolute";
        
        if (char.id !== currentMessage.speaker) {
            charImg.style.filter = 'brightness(0.5)';
        }

        if (char.position === 'right') {
            charImg.style.right = "-5%";
            charImg.style.left = "auto";
        } else {
            charImg.style.left = "-5%";
            charImg.style.right = "auto";
        }

        charImg.style.top = char.id === currentMessage.speaker ? "-100%" : "0%";
        charImg.style.transform = "none";
        charImg.style.width = char.id === currentMessage.speaker ? "70%" : "30%";
        charImg.style.height = "auto";
        charImg.draggable = false;
        container.appendChild(charImg);
    });

    // Create dialogue box with position based on speaker
    const dialogueBox = document.createElement("div");
    dialogueBox.id = "dialogue-box";
    dialogueBox.style.position = "absolute";
    
    // Position dialogue box based on speaker's position
    const speakingChar = currentDialogue.characters.find(char => char.id === currentMessage.speaker);
    if (speakingChar.position === 'right') {
        dialogueBox.style.left = "45%";
        dialogueBox.style.right = "auto";
    } else {
        dialogueBox.style.left = "5%";
        dialogueBox.style.right = "auto";
    }
    
    dialogueBox.style.top = "80%";
    dialogueBox.style.width = "600px"; 
    dialogueBox.style.transform = "none";
    dialogueBox.style.textAlign = "left";
    dialogueBox.style.padding = "10px";
    dialogueBox.style.borderRadius = "8px";
    dialogueBox.style.fontFamily = "Helvetica, Arial, sans-serif";
    dialogueBox.style.fontWeight = "bold";
    dialogueBox.style.fontSize = "16px";
    dialogueBox.style.color = "#000";
    dialogueBox.style.background = "none";
    
    const dialogueText = document.createElement("p");
    dialogueText.id = "dialogue-text";
    dialogueText.textContent = currentMessage.text;
    dialogueBox.appendChild(dialogueText);

    container.appendChild(dialogueBox);

    // Always enable dragging regardless of who's speaking
    const floatingKey = document.getElementById('floating-key');
    floatingKey.draggable = true;

    // Update key position
    updateKeyPosition();

    // Add replay button only when dialogue is complete
    if (gameState.dialogueState.currentIndex === currentDialogue.messages.length - 1) {
        gameState.dialogueState.isComplete = true;
        addReplayButton();
        updateKeyVisibility();
    }

    // Remove the redundant call to updateKeyVisibility here
}

// Modify setupGameClickHandler to prevent unwanted clicks
function setupGameClickHandler() {
    const gameArea = document.getElementById('game-area');
    gameArea.addEventListener('click', (e) => {
        // Only process click if we're in dialogue mode and dialogue isn't complete
        if (gameState.currentType === 'dialogue' && 
            !gameState.isDragging && 
            !gameState.dialogueState.isComplete) {
            dialogueSound.currentTime = 0;
            dialogueSound.play();
            progressDialogue();
        }
    });
}

// New function to handle keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        // Space bar for dialogue progression
        if (e.code === 'Space' && gameState.currentType === 'dialogue' && !gameState.isDragging) {
            progressDialogue();
        }
        
        if ((gameState.dialogueState.isComplete || gameState.currentType === 'character') 
            && e.key >= '1' && e.key <= '6') {
            const num = parseInt(e.key);
            handleNumberKeySelection(num);
        }
    });
}

// Handle number key selection
function handleNumberKeySelection(num) {
    const correctZone = gameState.currentType === 'dialogue' 
        ? gameState.dialogueState.currentDialogue.correctZone
        : gameState.characterState.currentCharacter.correctZone;
    
    let targetZone;
    if (num === 6) {
        targetZone = document.getElementById('not-pancasila');
    } else {
        targetZone = document.getElementById(`pancasila${num}`);
    }
    
    if (targetZone.id === correctZone) {
        handleCorrectDrop(targetZone);
    } else {
        handleIncorrectDrop();
    }
}

// Update drag and drop handlers
function handleDragStart(e) {
    gameState.isDragging = true;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', 'key');
    
    // Create and show smaller drag image
    const dragImage = new Image();
    dragImage.src = '../asset/key.png';
    
    // Create a temporary canvas to resize the drag image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 32;  // Set to desired width
    canvas.height = 32; // Set to desired height
    
    // Draw the image at the smaller size
    dragImage.onload = () => {
        ctx.drawImage(dragImage, 0, 0, 32, 32);
    };
    
    e.dataTransfer.setDragImage(canvas, 16, 16); // Center point of the 32x32 image
}

function handleDragEnd(e) {
    gameState.isDragging = false;
    e.target.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    // Only process drop if dialogue is complete or in character mode
    if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
        const correctZone = gameState.currentType === 'dialogue' 
            ? gameState.dialogueState.currentDialogue.correctZone
            : gameState.characterState.currentCharacter.correctZone;

        if (this.id === correctZone) {
            handleCorrectDrop(this);
        } else {
            handleIncorrectDrop();
        }
    }
}

// Handle correct drop with plus animation
function handleCorrectDrop(dropZone) {
    if (isCooldownActive) return;  // Prevent score increase during cooldown

    isCooldownActive = true;  // Set cooldown active
    
    const chestImg = dropZone.querySelector('img');
    chestImg.src = '../asset/opened_chest.png';
    
    // Play success sound
    cashRegister.currentTime = 0;
    cashRegister.play();

    // Adjustable variables for size and placement
    const plusSizePercentage = 6; // Adjust the size of plus.png in percentage
    const verticalOffsetPercentage = 30; // Vertical offset percentage relative to chest height
    const horizontalOffsetPercentage = 60; // Horizontal offset percentage relative to chest width (now positive for right adjustment)

    // Create and show smaller drag image
    const plusImg = document.createElement('img');
    plusImg.src = '../asset/plus.png';
    plusImg.className = 'plus-animation';
    plusImg.style.position = 'absolute';
    plusImg.style.opacity = '0';
    plusImg.style.transform = 'rotate(15deg)';
    plusImg.style.transition = 'all 1.5s ease';

    // Apply size
    plusImg.style.width = `${plusSizePercentage}%`;
    plusImg.style.height = "auto"; // Maintain aspect ratio

    // Position plus image relative to chest
    const chestRect = chestImg.getBoundingClientRect();
    plusImg.style.top = `${chestRect.top - (chestRect.height * verticalOffsetPercentage / 100)}px`;
    plusImg.style.left = `${chestRect.left + (chestRect.width * horizontalOffsetPercentage / 100)}px`; // Use left instead of right

    document.body.appendChild(plusImg);

    // Animate plus image
    setTimeout(() => {
        plusImg.style.opacity = '1';
        plusImg.style.transform = 'translateY(-50px) rotate(15deg)';
    }, 100);
    
    // Remove plus image
    setTimeout(() => {
        plusImg.style.opacity = '0';
        setTimeout(() => plusImg.remove(), 500);
    }, 1000);
    
    updateScore(100);
    
    // Reset chest image and setup next state
    setTimeout(() => {
        chestImg.src = `../asset/c${dropZone.id.slice(-1)}.png`;
        setupRandomState();
    }, 1500);
}

// Handle incorrect drop
function handleIncorrectDrop() {
    // Play wrong sound
    wrongSound.currentTime = 0;
    wrongSound.play();

    if (lives > 0) {
        lives--;
        updateLives();
    }
    
    if (lives === 0) {
        gameOver();
    }
}

// Add replay button
function addReplayButton() {
    const replayButton = document.createElement('img');
    replayButton.src = '../asset/replay.png';
    replayButton.id = 'replay-button';
    replayButton.style.position = 'absolute';
    replayButton.style.left = '4%';
    replayButton.style.top = '0%';
    // Adjust size here
    replayButton.style.width = '130px';  // Change width
    replayButton.style.height = 'auto'; // Change height
    replayButton.style.transform = 'scale(8)';
    replayButton.style.transform = 'translate(-50%, -50%)';
    replayButton.style.cursor = 'pointer';
    replayButton.style.animation = 'float 2s ease-in-out infinite';
    
    // Add hover effect
    replayButton.addEventListener('mouseenter', () => {
        replayButton.style.transform = 'scale(3)';
    });
    
    replayButton.addEventListener('mouseleave', () => {
        replayButton.style.transform = 'scale(8)';
    });
    
    // Add click effect
    replayButton.addEventListener('mousedown', () => {
        replayButton.style.transform = 'scale(1.5)';
    });
    
    replayButton.addEventListener('mousedown', () => {
        clickSound.currentTime = 0;
        clickSound.play();
        replayButton.style.transform = 'scale(1.5)'; // Shrink effect on click
    });

    replayButton.addEventListener('mouseup', () => {
        replayButton.style.transform = 'scale(3)';
        restartDialogue();
        replayButton.remove();
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(-50%, -50%); }
            50% { transform: translate(-50%, -60%); }
        }
    `;
    document.head.appendChild(style);
    
    replayButton.addEventListener('click', () => {
        restartDialogue();
        replayButton.remove();
    });
    
    document.getElementById('character-container').appendChild(replayButton);
}

// Restart dialogue
function restartDialogue() {
    gameState.dialogueState.currentIndex = 0;
    gameState.dialogueState.isComplete = false;
    showDialogue();
    updateKeyVisibility();
}

// Prevent multiple clicks from advancing the dialogue too quickly
function progressDialogue() {
    if (gameState.dialogueState.currentIndex < gameState.dialogueState.currentDialogue.messages.length - 1) {
        gameState.dialogueState.currentIndex++;
        showDialogue();
    }
}

// Update key visibility based on game state
function updateKeyVisibility() {
    const keyContainer = document.getElementById('key-container');
    if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
        keyContainer.style.display = 'block';
    } else {
        keyContainer.style.display = 'none';
    }
}

// Update score display
function updateScore(points) {
    const scoreElement = document.getElementById('score');
    const startScore = score;
    const targetScore = score + points;
    const incrementSpeed = 10; // Adjust this to control speed of score increment
    
    let currentScore = startScore;
    
    const incrementInterval = setInterval(() => {
        if (currentScore < targetScore) {
            currentScore++;
            scoreElement.textContent = `Score: ${currentScore.toString().padStart(4, '0')}`;
        } else {
            clearInterval(incrementInterval);
        }
    }, incrementSpeed);
    
    score = targetScore; // Update the score variable
}

// Setup lives display
function setupLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const lifeImg = document.createElement('img');
        lifeImg.src = '../asset/life.png';
        lifeImg.classList.add('life');
        lifeImg.alt = 'Nyawa';
        livesContainer.appendChild(lifeImg);
    }
}

// Update lives display
function updateLives() {
    const livesImages = document.querySelectorAll('.life');
    for (let i = 0; i < 3; i++) {
        livesImages[i].src = i < lives ? '../asset/life.png' : '../asset/unlife.png';
    }
}

// Progress to next character
function nextCharacter() {
    currentCharacterIndex++;
    
    if (currentCharacterIndex < characters.length) {
        showCharacter(characters[currentCharacterIndex]);
    } else {
        showGameComplete();
    }
}

// Show game completion
function showGameComplete() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
        <div class="completion-message">
            <h2>Selamat! Kamu telah menyelesaikan permainan!</h2>
            <p>Skor Akhir: ${score}</p>
            <button onclick="location.reload()">Main Lagi</button>
        </div>
    `;
}

// Game over function
function gameOver() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
        <div class="game-over-message">
            <h2>Game Over</h2>
            <p>Skor Akhir: ${score}</p>
            <button onclick="location.reload()">Main Lagi</button>
        </div>
    `;
}

// Update Main Lagi button click handler
function restartGame() {
    clickSound.currentTime = 0;
    clickSound.play();
    score = 0;
    lives = 3;
    currentCharacterIndex = 0;
    initializeGame();
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', initializeGame);