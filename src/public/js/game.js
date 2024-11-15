let characters = [
    {
        id: 'budiono',
        activeImage: '/asset/TBudiono.png',
        waitingImage: '/asset/WBudiono.png',
        statement: 'Saya selalu berusaha untuk menghargai dan menghormati perbedaan agama serta kepercayaan yang ada di sekitar saya.',
        correctZone: 'pancasila1'
    }
];

let dialogues = [
    {
        characters: [
            {
                id: 'budiono',
                activeImage: '/asset/TBudiono.png',
                waitingImage: '/asset/WBudiono.png',
                position: 'right'
            },
            {
                id: 'fufafu',
                activeImage: '/asset/TFufafu.png',
                waitingImage: '/asset/WFufafu.png',
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
                activeImage: '/asset/TSiregar.png',
                waitingImage: '/asset/WSiregar.png',
                position: 'right'
            },
            {
                id: 'fafafu',
                activeImage: '/asset/TFafafu.png',
                waitingImage: '/asset/WFafafu.png',
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

let isMobileDevice = false;
let currentCharacterIndex = 0;
let score = 0;
let lives = 3;
let isDragging = false;
let isCooldownActive = false;
let gameTheme, dialogueSound, cashRegister, wrongSound, clickSound;

document.addEventListener('DOMContentLoaded', function() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    initializeAudio();
    initializeGame();
});

function initializeAudio() {
    gameTheme = document.getElementById('gameTheme');
    dialogueSound = document.getElementById('dialogueSound');
    cashRegister = document.getElementById('cashRegister');
    wrongSound = document.getElementById('wrongSound');
    clickSound = document.getElementById('clickSound');
    gameTheme.play();
}

function initializeGame() {
    setupRandomState();
    updateScore(0);
    setupLives();
    setupDragAndDrop();
    setupGameClickHandler();
    setupKeyboardControls();
    updateKeyVisibility();
}

function setupRandomState() {
    isCooldownActive = false;
    gameState.currentType = Math.random() < 0.5 ? 'character' : 'dialogue';
    gameState.dialogueState.isComplete = false;
    updateKeyVisibility();

    if (gameState.currentType === 'dialogue') {
        gameState.dialogueState.currentDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        gameState.dialogueState.currentIndex = 0;
        showDialogue();
    } else {
        gameState.characterState.currentCharacter = characters[Math.floor(Math.random() * characters.length)];
        showCharacter(gameState.characterState.currentCharacter);
    }
    updateKeyPosition();
}

function setupDragAndDrop() {
    const floatingKey = document.getElementById('floating-key');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    if (!isMobileDevice) {
        setupDesktopDragAndDrop(floatingKey, dropZones);
    } else {
        setupMobileDragAndDrop(floatingKey, dropZones);
    }
}

function setupDesktopDragAndDrop(floatingKey, dropZones) {
    floatingKey.addEventListener('mousedown', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
    
    floatingKey.addEventListener('dragstart', handleDragStart);
    floatingKey.addEventListener('dragend', handleDragEnd);
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function setupMobileDragAndDrop(floatingKey, dropZones) {
    floatingKey.style.display = 'none';
    dropZones.forEach(zone => {
        zone.addEventListener('touchstart', handleMobileChestTap);
        zone.addEventListener('click', handleMobileChestTap);
    });
}

function handleDragStart(e) {
    gameState.isDragging = true;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', 'key');
    setupDragImage(e);
}

function setupDragImage(e) {
    const dragImage = new Image();
    dragImage.src = '/asset/key.png';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 32;
    dragImage.onload = () => ctx.drawImage(dragImage, 0, 0, 32, 32);
    e.dataTransfer.setDragImage(canvas, 16, 16);
}

function handleDragEnd(e) {
    gameState.isDragging = false;
    e.target.classList.remove('dragging');
}

function handleDragEnter(e) {
    e.preventDefault();
    if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
        this.classList.add('drag-over');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    if (gameState.dialogueState.isComplete || gameState.currentType === 'character') {
        this.classList.add('drag-over');
    }
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if ((gameState.dialogueState.isComplete || gameState.currentType === 'character') && !isCooldownActive) {
        const correctZone = getCorrectZone();
        this.id === correctZone ? handleCorrectDrop(this) : handleIncorrectDrop();
    }
}

function getCorrectZone() {
    return gameState.currentType === 'dialogue' 
        ? gameState.dialogueState.currentDialogue.correctZone
        : gameState.characterState.currentCharacter.correctZone;
}

function handleMobileChestTap(e) {
    e.preventDefault();
    if ((gameState.dialogueState.isComplete || gameState.currentType === 'character') && !isCooldownActive) {
        const correctZone = getCorrectZone();
        this.id === correctZone ? handleCorrectDrop(this) : handleIncorrectDrop();
    }
}

function handleCorrectDrop(dropZone) {
    if (isCooldownActive) return;
    isCooldownActive = true;

    const chestImg = dropZone.querySelector('img');
    chestImg.src = '/asset/opened_chest.png';
    cashRegister.currentTime = 0;
    cashRegister.play();

    createPlusAnimation(chestImg);
    updateScore(100);

    setTimeout(() => {
        chestImg.src = `/asset/c${dropZone.id.slice(-1)}.png`;
        setupRandomState();
        isCooldownActive = false;
    }, 1500);
}

function createPlusAnimation(chestImg) {
    const plusImg = document.createElement('img');
    plusImg.src = '/asset/plus.png';
    plusImg.className = 'plus-animation';

    const chestRect = chestImg.getBoundingClientRect();
    plusImg.style.top = `${chestRect.top - (chestRect.height * 30 / 100)}px`;
    plusImg.style.left = `${chestRect.left + (chestRect.width * 60 / 100)}px`;

    document.body.appendChild(plusImg);
    setTimeout(() => plusImg.classList.add('visible'), 100);
    setTimeout(() => {
        plusImg.classList.add('removing');
        setTimeout(() => plusImg.remove(), 500);
    }, 1000);
}

function handleIncorrectDrop() {
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

function showCharacter(character) {
    const container = document.getElementById("character-container");
    container.innerHTML = '';
    
    const characterImg = document.createElement("img");
    characterImg.src = character.activeImage;
    characterImg.alt = "Karakter";
    characterImg.classList.add('character-image', 'active', 'right');
    characterImg.draggable = false;
    
    const statementBox = document.createElement("div");
    statementBox.classList.add("dialogue-container", "right");
    statementBox.id = "statement-box";
    
    const statementP = document.createElement("p");
    statementP.id = "statement";
    statementP.textContent = character.statement;
    statementBox.appendChild(statementP);
    
    container.appendChild(characterImg);
    container.appendChild(statementBox);
    
    updateKeyPosition();
}

function showDialogue() {
    gameState.isDragging = false;
    const container = document.getElementById("character-container");
    container.innerHTML = '';
    
    const currentDialogue = gameState.dialogueState.currentDialogue;
    const currentMessage = currentDialogue.messages[gameState.dialogueState.currentIndex];
    
    setupCharacters(container, currentDialogue, currentMessage);
    createDialogueBox(container, currentMessage, currentDialogue);
    
    if (gameState.dialogueState.currentIndex === currentDialogue.messages.length - 1) {
        gameState.dialogueState.isComplete = true;
        addReplayButton();
    }
    
    updateKeyVisibility();
}

function setupCharacters(container, dialogue, currentMessage) {
    dialogue.characters.forEach(char => {
        const charImg = document.createElement("img");
        charImg.src = char.waitingImage;
        charImg.alt = char.id;
        charImg.classList.add('character-image', char.position, 'inactive');
        container.appendChild(charImg);
    });

    const speakingChar = dialogue.characters.find(char => char.id === currentMessage.speaker);
    const speakingCharImg = container.querySelector(`img[alt="${currentMessage.speaker}"]`);
    if (speakingCharImg) {
        speakingCharImg.src = speakingChar.activeImage;
        speakingCharImg.classList.remove('inactive');
        speakingCharImg.classList.add('active');
    }
}

function createDialogueBox(container, message, dialogue) {
    const speakingChar = dialogue.characters.find(char => char.id === message.speaker);
    const dialogueBox = document.createElement("div");
    dialogueBox.classList.add("dialogue-box", speakingChar.position);
    dialogueBox.id = "dialogue-box";
    
    const dialogueText = document.createElement("p");
    dialogueText.id = "dialogue-text";
    dialogueText.textContent = message.text;
    dialogueBox.appendChild(dialogueText);
    
    container.appendChild(dialogueBox);
}

function updateKeyPosition() {
    const keyContainer = document.getElementById('key-container');
    keyContainer.style.top = "25%";
    keyContainer.style.left = "50%";
}

function setupGameClickHandler() {
    const gameArea = document.getElementById('game-area');
    const eventType = isMobileDevice ? 'touchstart' : 'click';
    gameArea.addEventListener(eventType, handleGameInteraction);
}

function handleGameInteraction() {
    if (gameState.currentType === 'dialogue' && 
        !gameState.isDragging && 
        !gameState.dialogueState.isComplete) {
        dialogueSound.currentTime = 0;
        dialogueSound.play();
        progressDialogue();
    }
}

function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.currentType === 'dialogue' && !gameState.isDragging) {
            progressDialogue();
        }
        
        if ((gameState.dialogueState.isComplete || gameState.currentType === 'character') 
            && e.key >= '1' && e.key <= '6') {
            handleNumberKeySelection(parseInt(e.key));
        }
    });
}

function handleNumberKeySelection(num) {
    const correctZone = getCorrectZone();
    const targetZone = num === 6 
        ? document.getElementById('not-pancasila')
        : document.getElementById(`pancasila${num}`);
    
    targetZone.id === correctZone ? handleCorrectDrop(targetZone) : handleIncorrectDrop();
}

function updateKeyVisibility() {
    const keyContainer = document.getElementById('key-container');
    const isInteractive = gameState.dialogueState.isComplete || gameState.currentType === 'character';
    
    keyContainer.style.display = isInteractive && !isMobileDevice ? 'block' : 'none';
    
    if (isMobileDevice) {
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.toggle('tappable', isInteractive);
        });
    }
}

function updateScore(points) {
    const scoreElement = document.getElementById('score');
    const startScore = score;
    const targetScore = score + points;
    const incrementSpeed = 10;
    let currentScore = startScore;
    
    const incrementInterval = setInterval(() => {
        if (currentScore < targetScore) {
            currentScore++;
            scoreElement.textContent = `Score: ${currentScore.toString().padStart(4, '0')}`;
        } else {
            clearInterval(incrementInterval);
        }
    }, incrementSpeed);
    
    score = targetScore;
}

function setupLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const lifeImg = document.createElement('img');
        lifeImg.src = '/asset/life.png';
        lifeImg.classList.add('life');
        lifeImg.alt = 'Nyawa';
        livesContainer.appendChild(lifeImg);
    }
}

function updateLives() {
    const livesImages = document.querySelectorAll('.life');
    livesImages.forEach((img, i) => {
        img.src = i < lives ? '/asset/life.png' : '/asset/unlife.png';
    });
}

function addReplayButton() {
    const replayButton = document.createElement('img');
    replayButton.src = '/asset/replay.png';
    replayButton.id = 'replay-button';
    
    replayButton.addEventListener('mousedown', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });

    replayButton.addEventListener('mouseup', () => {
        restartDialogue();
        replayButton.remove();
    });

    document.getElementById('character-container').appendChild(replayButton);
}

function restartDialogue() {
    gameState.dialogueState.currentIndex = 0;
    gameState.dialogueState.isComplete = false;
    showDialogue();
    updateKeyVisibility();
}

function progressDialogue() {
    if (!gameState.isDragging && 
        gameState.currentType === 'dialogue' && 
        gameState.dialogueState.currentIndex < gameState.dialogueState.currentDialogue.messages.length - 1) {
        
        gameState.dialogueState.currentIndex++;
        showDialogue();
    }
}

function nextCharacter() {
    currentCharacterIndex++;
    
    if (currentCharacterIndex < characters.length) {
        showCharacter(characters[currentCharacterIndex]);
    } else {
        showGameComplete();
    }
}

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

// LOGIC GAMEOVER
let authStatus = null;
let userHighScore = 0;

async function gameOver() {
    clickSound.currentTime = 0;
    clickSound.play();

    // Fetch the user's high score from the server
    try {
        const response = await fetch('/user/score'); // Replace with the actual endpoint to get the user's high score
        authStatus = response.status;
        const data = await response.json();
        if (response.ok) {
            console.log(data.score)
            userHighScore = data.score;
        } else {
            console.error(data.error || 'Failed to fetch high score.');
        }
    } catch (error) {
        console.error('Error fetching high score:', error);
    }

    // Display the game over screen with the current score and high score
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
        <div class="game-over-container">
            <div class="game-over-message">
                <h2>Game Over</h2>
                <p>Skor Akhir: <span id="final-score">${score}</span></p>
                <p style="font-size: 0.8em;">Highscore: ${userHighScore}</p>
            </div>
            <div class="save-score-actions">
                <button onclick="handleSimpanScore(authStatus, score, userHighScore)">Simpan Skor</button>
                <button onclick="location.reload()">Main Lagi</button>
            </div>
        </div>
    `;
}

async function handleSimpanScore(authStatus, score, highscore) {
    if (authStatus == 401) {
        console.log("harus login dl");
        showSaveScoreModal();
    } else {
        console.log("langsung save");
        await saveScore(score, highscore);
    }
}

// Function to handle saving the score
async function saveScore(score, userHighScore) {
    if (score > userHighScore) {
        try {
            const response = await fetch('/user/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score: score })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Score updated successfully!');
            } else {
                alert(data.error || 'Failed to update score.');
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    } else {
        alert('Your current score is not higher than your high score.');
    }
}

function restartGame() {
    clickSound.currentTime = 0;
    clickSound.play();
    score = 0;
    lives = 3;
    currentCharacterIndex = 0;
    initializeGame();
}

document.addEventListener('DOMContentLoaded', () => {
    const cloudL = document.getElementById('cloudL');
    const cloudR = document.getElementById('cloudR');
    const playButton = document.getElementById('play-button');
    const learnButton = document.getElementById('learn-button');
    
    playButton.style.pointerEvents = 'none';
    learnButton.style.pointerEvents = 'none';
    
    document.body.addEventListener('click', () => {
        const chestOpen = document.getElementById('chestOpen');
        const pirateTheme = document.getElementById('pirateTheme');
        
        chestOpen.currentTime = 0;
        chestOpen.play();
        pirateTheme.currentTime = 0;
        pirateTheme.play();
        
        cloudL.style.transition = 'left 1s ease';
        cloudR.style.transition = 'right 1s ease';
        cloudL.style.left = '-100%';
        cloudR.style.right = '-100%';
        
        setTimeout(() => {
            playButton.style.pointerEvents = 'auto';
            learnButton.style.pointerEvents = 'auto';
        }, 1000);
    }, { once: true });
});

function showSaveScoreModal() {
    clickSound.currentTime = 0;
    clickSound.play();

    const gameOverContainer = document.querySelector('.game-over-container');
    gameOverContainer.classList.add('hidden');  // Hide game over screen

    const modal = document.querySelector('.save-score-modal');
    modal.classList.remove('hidden');  // Show save score modal

    modal.innerHTML = `
        <div class="save-score-content">
            <img src="/asset/xbutton.png" class="close-button" onclick="closeSaveScoreModal()" alt="Close">
            <div class="save-score-scroll">
                <h2>Simpan Skor Anda</h2>
                <p>Anda perlu masuk untuk menyimpan skor Anda.</p>
                
                <div class="auth-options">
                    <button class="auth-button" onclick="showLogin()">Login</button>
                    <button class="auth-button" onclick="showSignup()">Sign Up</button>
                </div>

                <div id="login-form" class="auth-form hidden">
                    <h3>Login</h3>
                    <div class="form-group">
                        <label for="login-email">Email:</label>
                        <input type="email" id="login-email" placeholder="Masukkan email">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password:</label>
                        <input type="password" id="login-password" placeholder="Masukkan password">
                    </div>
                    <button class="submit-button" onclick="submitLogin()">Login</button>
                </div>

                <div id="signup-form" class="auth-form hidden">
                    <h3>Sign Up</h3>
                    <div class="form-group">
                        <label for="signup-email">Email:</label>
                        <input type="email" id="signup-email" placeholder="Masukkan email">
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password:</label>
                        <input type="password" id="signup-password" placeholder="Buat password">
                    </div>
                    <button class="submit-button" onclick="submitSignup()">Sign Up</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeSaveScoreModal() {
    clickSound.currentTime = 0;
    clickSound.play();
    
    const modal = document.querySelector('.save-score-modal');
    modal.classList.add('hidden');  // Hide save score modal

    const gameOverContainer = document.querySelector('.game-over-container');
    gameOverContainer.classList.remove('hidden');  // Show game over screen again

}

function closeModal() {
    const modal = document.querySelector('.save-score-modal');
    modal.classList.add('hidden');  // Hide save score modal
    document.getElementById('game-area').classList.remove('hidden');  // Ensure game area visibility
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.querySelector('.game-over-container').classList.add('hidden'); // Hide game over container
}

function showLogin() {
    clickSound.currentTime = 0;
    clickSound.play();
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
}

function showSignup() {
    clickSound.currentTime = 0;
    clickSound.play();
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
}
async function submitLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Validate inputs
    if (!email || !password) {
        alert('Please fill in both email and password fields.');
        return;
    }

    console.log(email, password)

    try {
        // Send login request to the server
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Handle the response
        const data = await response.json();
        if (response.ok) {
            // Login successful
            alert('Login successful!');
            // Optionally, redirect to another page or close the modal
        } else {
            // Login failed
            alert(data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}


async function submitSignup() {
    // Get the email and password values from the form
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Validate inputs
    if (!email || !password) {
        alert('Please fill in both email and password fields.');
        return;
    }

    try {
        // Send signup request to the server
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Handle the response
        const data = await response.json();
        if (response.ok) {
            // Signup successful
            alert('Signup successful! You can now log in.');
            // Close the signup modal
        } else {
            // Signup failed
            alert(data.error || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}
