// Game variables
let player = {
    x: 0,
    y: 0,
    velocityY: 0,
    speed: 5,
    size: 30,
    jumpForce: -12
};

// Ocean particles
let particles = [];
const PARTICLE_COUNT = 50;

// Background fish
let fishes = [];
const FISH_COUNT = 8;

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
    // Create ocean particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            size: random(2, 5),
            speed: random(1, 3)
        });
    }
    // Create background fish
    for (let i = 0; i < FISH_COUNT; i++) {
        fishes.push({
            x: random(width),
            y: random(height),
            size: random(20, 40),
            speed: random(1, 3),
            direction: random([-1, 1]),
            color: color(random(200, 255), random(100, 200), random(100, 200)),
            yOffset: 0,
            ySpeed: random(0.02, 0.05)
        });
    }
    resetGame();
}

function draw() {
    // Ocean background
    background(0, 50, 100);
    drawOceanEffect();
    drawFishes();
    
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

function drawOceanEffect() {
    // Update and draw particles
    for (let particle of particles) {
        particle.y += particle.speed;
        if (particle.y > height) {
            particle.y = 0;
            particle.x = random(width);
        }
        fill(255, 255, 255, 100);
        noStroke();
        ellipse(particle.x, particle.y, particle.size);
    }
}

function drawFishes() {
    // Update and draw fish
    for (let fish of fishes) {
        // Update fish position
        fish.x += fish.speed * fish.direction;
        fish.yOffset += fish.ySpeed;
        fish.y += sin(fish.yOffset) * 0.5;
        
        // Wrap around screen
        if (fish.x > width + fish.size) {
            fish.x = -fish.size;
        } else if (fish.x < -fish.size) {
            fish.x = width + fish.size;
        }
        
        // Draw fish
        push();
        translate(fish.x, fish.y);
        scale(fish.direction, 1);
        
        fill(fish.color);
        noStroke();
        
        // Body
        ellipse(0, 0, fish.size, fish.size * 0.6);
        
        // Tail
        triangle(-fish.size/2, 0, 
                -fish.size*0.8, -fish.size*0.3, 
                -fish.size*0.8, fish.size*0.3);
        
        // Eye
        fill(255);
        ellipse(fish.size*0.2, -fish.size*0.1, fish.size*0.2);
        fill(0);
        ellipse(fish.size*0.2, -fish.size*0.1, fish.size*0.1);
        
        pop();
    }
}
