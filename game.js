const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    const width = Math.min(800, container.clientWidth - 40);
    canvas.width = width;
    canvas.height = (width / 800) * 400;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Objects
const paddleHeight = 10;
const paddleWidth = 80;
const ballRadius = 8;

let paddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - 20,
    width: paddleWidth,
    height: paddleHeight,
    speed: 7
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speedX: 4,
    speedY: -4
};

let score = 0;
let gameRunning = false;
let mouseX = canvas.width / 2;
let touchX = canvas.width / 2;
let lastTouchX = null;

// Mouse Movement
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// Touch Controls
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
    lastTouchX = touchX;
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
}, { passive: false });

canvas.addEventListener('touchend', () => {
    lastTouchX = null;
}, false);

// Draw Functions
function drawPaddle() {
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 20, 147, 0.5)';
    ctx.shadowBlur = 10;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawBackground() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update Game
function updateGame() {
    if (!gameRunning) return;

    // Move paddle based on input
    const currentX = lastTouchX !== null ? lastTouchX : mouseX;
    
    if (currentX < paddle.x && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (currentX > paddle.x + paddle.width && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    }

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.speedX *= -1;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
        ball.speedY *= -1;
    }

    // Ball collision with paddle
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.speedY *= -1;
        score++;
        document.getElementById('score').textContent = score;

        // Increase ball speed slightly
        ball.speedX *= 1.02;
        ball.speedY *= 1.02;

        // Check if score reached 5
        if (score >= 5) {
            gameRunning = false;
            triggerFireworks();
            setTimeout(() => {
                moveToSlide(3);
            }, 1500);
        }
    }

    // Game Over (ball fell)
    if (ball.y > canvas.height) {
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.speedY = -4;
}

// Main Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateGame();
    drawPaddle();
    drawBall();
    drawScore();
    requestAnimationFrame(gameLoop);
}

// Start Game Session
function startGameSession() {
    score = 0;
    gameRunning = true;
    document.getElementById('score').textContent = '0';
    resetBall();
    paddle.x = canvas.width / 2 - paddleWidth / 2;
}

// Initialize game loop when page loads
window.addEventListener('load', () => {
    gameLoop();
});

// Override startGame function for compatibility
const originalStartGame = typeof startGame === 'function' ? startGame : null;
window.startGame = function() {
    startGameSession();
    if (originalStartGame) {
        originalStartGame();
    }
};
