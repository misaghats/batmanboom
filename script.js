const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/**
 * Responsive canvas for mobile and desktop
 */
function resizeCanvas() {
    // Set a max size and keep aspect ratio for mobile/desktop
    const width = Math.min(window.innerWidth * 0.98, 480);
    const height = Math.min(window.innerHeight * 0.75, 700);
    canvas.width = width;
    canvas.height = height;

    // Update pipe/bird settings based on new canvas size
    PIPE_GAP = canvas.height * 0.25;
    PIPE_MIN_HEIGHT = canvas.height * 0.2;
    PIPE_MAX_HEIGHT = canvas.height * 0.6;

    // Reset bird position if game not started
    if (!gameStarted) {
        bird.y = canvas.height * 0.25;
    }
}
window.addEventListener('resize', () => {
    resizeCanvas();
});
resizeCanvas();

// Game constants (some will be reset after resize!)
const GRAVITY = 0.25;
const BIRD_JUMP = -4.5;
const PIPE_WIDTH = 60;
// The following will be updated in resizeCanvas()
let PIPE_GAP = canvas.height * 0.25;
let PIPE_MIN_HEIGHT = canvas.height * 0.2;
let PIPE_MAX_HEIGHT = canvas.height * 0.6;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 40;
const PIPE_SPEED = 3;

let bird = {
    x: 50,
    y: canvas.height * 0.25,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0,
};

let pipes = [];
let score = 0;
let isGameOver = false;
let gameStarted = false;

// برای نمایش صفحه پایان بازی
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");

// Replace the bird with a Batman character image
const batmanImage = new Image();
batmanImage.src = "Batman.png"; // Ensure this image is in the same directory or update the path

function drawBird() {
    ctx.drawImage(batmanImage, bird.x, bird.y, bird.width, bird.height);
}

function moveBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
}

function birdJump() {
    if (!isGameOver) {
        bird.velocity = BIRD_JUMP;
    }
}

// Ensure pipes are spaced correctly and never overlap
function createPillar() {
    let topHeight;

    // Ensure the new pipe does not overlap with the previous one
    if (pipes.length > 0) {
        const lastPipe = pipes[pipes.length - 1];
        const minHeight = Math.max(PIPE_MIN_HEIGHT, lastPipe.top.height - PIPE_GAP / 3);
        const maxHeight = Math.min(PIPE_MAX_HEIGHT, lastPipe.top.height + PIPE_GAP / 3);
        topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
    } else {
        topHeight = Math.floor(Math.random() * (PIPE_MAX_HEIGHT - PIPE_MIN_HEIGHT) + PIPE_MIN_HEIGHT);
    }

    // First pillar is further away
    const startX = pipes.length === 0 ? canvas.width + 100 : canvas.width;
    const topPillar = {
        x: startX,
        y: 0,
        width: PIPE_WIDTH,
        height: topHeight,
        isTop: true,
    };

    const bottomPillar = {
        x: startX,
        y: topHeight + PIPE_GAP,
        width: PIPE_WIDTH,
        height: canvas.height - topHeight - PIPE_GAP,
        isTop: false,
    };

    // Ensure no two pipes are in the same position
    if (pipes.length === 0 || pipes[pipes.length - 1].top.x + PIPE_WIDTH < canvas.width - PIPE_GAP) {
        pipes.push({ top: topPillar, bottom: bottomPillar });
    }
}

let pipeSpeed = 1.5; // Slower initial pipe speed

function movePipes() {
    pipes.forEach((pipe, i) => {
        pipe.top.x -= pipeSpeed;
        pipe.bottom.x -= pipeSpeed;
        if (pipe.top.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            score++;

            if (score === 5) {
                showMessage("Damn, you are good!");
            }

            if (score === 10) {
                showMessage("U are great!");
            } else if (score === 15) {
                showMessage("U are master");
            } else if (score >= 20 && score <= 30) {
                showFixedMessage("No more left sir!! U are the best");
            }
        }
    });
}

function showFixedMessage(message) {
    let fixedMessageElement = document.getElementById("fixedMessage");

    if (!fixedMessageElement) {
        fixedMessageElement = document.createElement("div");
        fixedMessageElement.id = "fixedMessage";
        fixedMessageElement.style.position = "fixed";
        fixedMessageElement.style.top = "10%";
        fixedMessageElement.style.right = "10%";
        fixedMessageElement.style.color = "#ffcc00";
        fixedMessageElement.style.fontSize = "20px";
        fixedMessageElement.style.fontFamily = "Arial, sans-serif";
        fixedMessageElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        fixedMessageElement.style.padding = "10px 20px";
        fixedMessageElement.style.borderRadius = "5px";
        fixedMessageElement.style.boxShadow = "0 0 10px #ffcc00";
        fixedMessageElement.style.zIndex = "1000";
        document.body.appendChild(fixedMessageElement);
    }

    fixedMessageElement.textContent = message;

    if (score > 30) {
        if (document.body.contains(fixedMessageElement)) {
            document.body.removeChild(fixedMessageElement);
        }
    }
}

// Add a small bat image on top of each sword
const batImage = new Image();
batImage.src = "Batman.png"; // Ensure this image is in the same directory or update the path

function drawPillars() {
    for (let i = 0; i < pipes.length; i++) {
        ctx.save();
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#232526';
        // Draw top pillar as a series of upward spikes
        let spikeCount = Math.floor(pipes[i].top.width / 10);
        let spikeWidth = pipes[i].top.width / spikeCount;
        for (let s = 0; s < spikeCount; s++) {
            ctx.beginPath();
            ctx.moveTo(pipes[i].top.x + s * spikeWidth, pipes[i].top.y);
            ctx.lineTo(pipes[i].top.x + (s + 0.5) * spikeWidth, pipes[i].top.y + pipes[i].top.height);
            ctx.lineTo(pipes[i].top.x + (s + 1) * spikeWidth, pipes[i].top.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        // Draw bottom pillar as a series of downward spikes
        spikeCount = Math.floor(pipes[i].bottom.width / 10);
        spikeWidth = pipes[i].bottom.width / spikeCount;
        for (let s = 0; s < spikeCount; s++) {
            ctx.beginPath();
            ctx.moveTo(pipes[i].bottom.x + s * spikeWidth, pipes[i].bottom.y + pipes[i].bottom.height);
            ctx.lineTo(pipes[i].bottom.x + (s + 0.5) * spikeWidth, pipes[i].bottom.y);
            ctx.lineTo(pipes[i].bottom.x + (s + 1) * spikeWidth, pipes[i].bottom.y + pipes[i].bottom.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}

function triggerFireEffect() {
    const fireInterval = setInterval(() => {
        ctx.fillStyle = "#ff4500";
        ctx.font = "50px Arial";
        ctx.fillText("🔥", bird.x, bird.y);
    }, 100);

    setTimeout(() => {
        clearInterval(fireInterval);
    }, 1000);
}

function showLossAnimation() {
    const animationScreen = document.createElement("div");
    animationScreen.style.position = "fixed";
    animationScreen.style.top = "0";
    animationScreen.style.left = "0";
    animationScreen.style.width = "100%";
    animationScreen.style.height = "100%";
    animationScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    animationScreen.style.display = "flex";
    animationScreen.style.justifyContent = "center";
    animationScreen.style.alignItems = "center";
    animationScreen.style.zIndex = "1000";

    const message = document.createElement("div");
    message.style.color = "#fff";
    message.style.fontSize = "50px";
    message.style.fontFamily = "Arial, sans-serif";
    message.textContent = "Dang! U lost :)";

    animationScreen.appendChild(message);
    document.body.appendChild(animationScreen);

    setTimeout(() => {
        document.body.removeChild(animationScreen);
    }, 2000);
}

function showMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.style.position = "fixed";
    messageElement.style.top = "10%";
    messageElement.style.right = "10%";
    messageElement.style.color = "#ffcc00";
    messageElement.style.fontSize = "20px";
    messageElement.style.fontFamily = "Arial, sans-serif";
    messageElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    messageElement.style.padding = "10px 20px";
    messageElement.style.borderRadius = "5px";
    messageElement.style.boxShadow = "0 0 10px #ffcc00";
    messageElement.style.zIndex = "1000";
    document.body.appendChild(messageElement);

    setTimeout(() => {
        if (document.body.contains(messageElement)) {
            document.body.removeChild(messageElement);
        }
    }, 2000);
}

function checkCollisions() {
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        isGameOver = true;
        showLossAnimation();
    }

    for (let i = 0; i < pipes.length; i++) {
        if (bird.x + bird.width > pipes[i].top.x && bird.x < pipes[i].top.x + pipes[i].top.width) {
            // Collision with top sword
            if (
                bird.y < pipes[i].top.height &&
                bird.x + bird.width / 2 > pipes[i].top.x + pipes[i].top.width / 2 - 10 &&
                bird.x + bird.width / 2 < pipes[i].top.x + pipes[i].top.width / 2 + 10
            ) {
                isGameOver = true;
                showLossAnimation();
            }

            // Collision with bottom sword
            if (
                bird.y + bird.height > pipes[i].bottom.y &&
                bird.x + bird.width / 2 > pipes[i].bottom.x + pipes[i].bottom.width / 2 - 10 &&
                bird.x + bird.width / 2 < pipes[i].bottom.x + pipes[i].bottom.width / 2 + 10
            ) {
                isGameOver = true;
                showLossAnimation();
            }
        }
    }
}

function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Prevent the game from starting before the countdown ends
let countdownActive = true;

function startCountdown(callback, seconds = 5) {
    let countdown = seconds;
    const countdownElement = document.createElement("div");
    countdownElement.style.position = "fixed";
    countdownElement.style.top = "50%";
    countdownElement.style.left = "50%";
    countdownElement.style.transform = "translate(-50%, -50%)";
    countdownElement.style.fontSize = "60px";
    countdownElement.style.color = "white";
    countdownElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    countdownElement.style.padding = "20px 40px";
    countdownElement.style.borderRadius = "10px";
    countdownElement.style.textAlign = "center";
    document.body.appendChild(countdownElement);

    const interval = setInterval(() => {
        countdownElement.textContent = countdown;
        countdown--;

        if (countdown < 0) {
            clearInterval(interval);
            document.body.removeChild(countdownElement);
            countdownActive = false;
            callback();
        }
    }, 1000);
}

function checkWinCondition() {
    if (score >= 30) {
        isGameOver = true;
        showWinMessage();
    }
}

function showWinMessage() {
    const winScreen = document.createElement("div");
    winScreen.style.position = "fixed";
    winScreen.style.top = "0";
    winScreen.style.left = "0";
    winScreen.style.width = "100%";
    winScreen.style.height = "100%";
    winScreen.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    winScreen.style.display = "flex";
    winScreen.style.justifyContent = "center";
    winScreen.style.alignItems = "center";
    winScreen.style.zIndex = "1000";

    const message = document.createElement("div");
    message.style.color = "#ffcc00";
    message.style.fontSize = "60px";
    message.style.fontFamily = "Arial, sans-serif";
    message.style.textAlign = "center";
    message.textContent = "WINNERRRRRRRRR! Happy for u :)";

    winScreen.appendChild(message);
    document.body.appendChild(winScreen);

    setTimeout(() => {
        document.body.removeChild(winScreen);
    }, 5000);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPillars();
    drawScore();

    if (isGameOver) {
        gameOverScreen.style.display = "block";
        finalScore.textContent = score;
    }

    if (!isGameOver) {
        moveBird();
        movePipes();
        checkCollisions();
        checkWinCondition();
        requestAnimationFrame(drawGame);
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        setInterval(createPillar, 2000);
        drawGame();
    }
}

// Add functionality to start the game when Level One is selected
const homeScreen = document.getElementById("homeScreen");
const levelOneButton = document.getElementById("levelOneButton");
const levelTwoButton = document.getElementById("levelTwoButton");

levelOneButton.addEventListener("click", () => {
    homeScreen.style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    resizeCanvas(); // Ensure correct canvas size at game start
    startCountdown(startGame);
});

// مدیریت ورودی‌ها
window.addEventListener("keydown", (e) => {
    if (!countdownActive && (e.key === " " || e.key === "ArrowUp")) {
        birdJump();
    }
});
// کنترل موبایل: لمس یا کلیک صفحه پرنده را بپراند
window.addEventListener("touchstart", (e) => {
    if (!countdownActive) {
        birdJump();
    }
});
window.addEventListener("mousedown", (e) => {
    if (!countdownActive) {
        birdJump();
    }
});

// ریست کردن بازی
restartButton.addEventListener("click", () => {
    bird.y = canvas.height * 0.25;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    pipeSpeed = 2;
    isGameOver = false;
    gameOverScreen.style.display = "none";
    gameStarted = false;
    resizeCanvas();
    startCountdown(() => {
        createPillar();
        startGame();
    }, 3);
});
