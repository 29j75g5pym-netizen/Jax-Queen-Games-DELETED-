// Device detection
function checkDeviceSupport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
    
    // Show warning if mobile or tablet or small screen
    if (isMobile || isTablet || width < 901) {
        document.getElementById('deviceWarning').classList.add('show');
        return false;
    }
    
    document.getElementById('deviceWarning').classList.remove('show');
    return true;
}

// Check on load and on resize
window.addEventListener('load', checkDeviceSupport);
window.addEventListener('resize', checkDeviceSupport);

// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    maxSpeed: 8
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        resetBall();
    }
});

// Ball reset
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 8;
}

// Update player paddle position
function updatePlayer() {
    // Mouse control
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    
    // Arrow keys control
    if (keys['arrowup'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['arrowdown'] && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }
    
    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: track the ball
    const diffThreshold = 35;
    
    if (ballCenter < computerCenter - diffThreshold) {
        computer.y -= computer.speed;
    } else if (ballCenter > computerCenter + diffThreshold) {
        computer.y += computer.speed;
    }
    
    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }
}

// Collision detection
function checkCollisions() {
    // Player paddle collision
    if (
        ball.dx < 0 &&
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;
        ball.dy = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.dy));
    }
    
    // Computer paddle collision
    if (
        ball.dx > 0 &&
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
        ball.dy = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.dy));
    }
    
    // Ball out of bounds (scoring)
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        gameRunning = false;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        gameRunning = false;
        resetBall();
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
        checkCollisions();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
