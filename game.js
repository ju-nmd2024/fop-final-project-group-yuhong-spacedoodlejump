// Game variables
let player = {
    x: 0,
    y: 0,
    velocityY: 0,
    speed: 5,
    size: 30,
    jumpForce: -12
};

let platforms = [];
let score = 0;
let highScore = 0;
let gameState = 'start';

// Constants
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const PLATFORM_SPACING = 45;
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    MOVING: 'moving',
    BREAKING: 'breaking'
};

function setup() {
    createCanvas(800, 600);
    resetGame();
}

function draw() {
    background(25, 25, 50);
    
    switch (gameState) {
        case 'start':
            drawStartScreen();
            break;
        case 'playing':
            updateGame();
            drawGame();
            break;
        case 'gameover':
            drawGameOverScreen();
            break;
    }
}

function resetGame() {
    player.x = width / 2;
    player.y = height - 100;
    player.velocityY = player.jumpForce;
    platforms = [];
    score = 0;
    
    // Create initial platforms
    for (let i = 0; i < height / PLATFORM_SPACING; i++) {
        createPlatform(height - i * PLATFORM_SPACING);
    }
}
