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

function drawPlayer(x, y) {
    // Draw diver
    push();
    // Body
    fill(50, 50, 50);
    ellipse(x, y, player.size); // Body
    
    // Oxygen tank
    fill(100, 100, 100);
    rect(x - 15, y - 10, 8, 20);
    
    // Mask
    fill(150, 150, 255);
    ellipse(x + 5, y - 5, player.size * 0.5);
    
    // Bubbles
    if (player.velocityY < 0) {
        fill(255, 255, 255, 150);
        ellipse(x - 15, y + 10, 8);
        ellipse(x - 12, y + 15, 6);
        ellipse(x - 10, y + 20, 4);
    }
    pop();
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

function createPlatform(y) {
    let type = random(100) < 70 ? PLATFORM_TYPES.NORMAL : 
               (random(100) < 50 ? PLATFORM_TYPES.MOVING : PLATFORM_TYPES.BREAKING);
    
    platforms.push({
        x: random(width - PLATFORM_WIDTH),
        y: y,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        type: type,
        direction: random([-1, 1]),
        broken: false,
        breakTime: 0
    });
}

function updateGame() {
    // Player movement
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        player.x = max(player.size/2, player.x - player.speed);
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        player.x = min(width - player.size/2, player.x + player.speed);
    }
    
    // Gravity
    player.velocityY += 0.5;
    player.y += player.velocityY;
    
    // Platform collision
    for (let i = platforms.length - 1; i >= 0; i--) {
        let platform = platforms[i];
        
        if (platform.type === PLATFORM_TYPES.MOVING) {
            platform.x += platform.direction * 2;
            if (platform.x <= 0 || platform.x + platform.width >= width) {
                platform.direction *= -1;
            }
        }
        
        if (player.velocityY > 0 && 
            player.x > platform.x && 
            player.x < platform.x + platform.width &&
            player.y > platform.y - player.size/2 && 
            player.y < platform.y + platform.height) {
            
            if (platform.type === PLATFORM_TYPES.BREAKING && !platform.broken) {
                platform.broken = true;
                platform.breakTime = millis() + 200;
            }
            
            if (!platform.broken) {
                player.velocityY = player.jumpForce;
            }
        }
        
        if (platform.broken && millis() > platform.breakTime) {
            platforms.splice(i, 1);
        }
    }
    
    // Camera and scoring
    if (player.y < height/2) {
        let diff = height/2 - player.y;
        player.y += diff;
        
        for (let platform of platforms) {
            platform.y += diff;
        }
        
        score += Math.floor(diff);
        highScore = Math.max(score, highScore);
        
        platforms = platforms.filter(p => p.y < height);
        while (platforms.length < height / PLATFORM_SPACING) {
            createPlatform(0);
        }
    }
    
    if (player.y > height) {
        gameState = 'gameover';
    }
}

function drawGame() {
    // Draw platforms
    for (let platform of platforms) {
        if (platform.broken) {
            fill(255, 0, 0, 100);
        } else {
            switch (platform.type) {
                case PLATFORM_TYPES.NORMAL:
                    fill(100, 200, 255);  // Lighter blue for platforms
                    break;
                case PLATFORM_TYPES.MOVING:
                    fill(100, 255, 200);  // Sea green for moving platforms
                    break;
                case PLATFORM_TYPES.BREAKING:
                    fill(255, 150, 150);  // Coral color for breaking platforms
                    break;
            }
        }
        noStroke();
        rect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Draw player (diver)
    drawPlayer(player.x, player.y);
    
    // Draw score
    fill(255);
    textAlign(LEFT);
    textSize(20);
    text('Depth: ' + score + 'm', 10, 30);
}

function drawStartScreen() {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text('Ocean Explorer', width/2, height/3);
    textSize(16);
    text('Press SPACE to Dive', width/2, height/2);
    text('Use LEFT/RIGHT arrows to swim', width/2, height/2 + 30);
}

function drawGameOverScreen() {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text('Surfaced!', width/2, height/3);
    textSize(24);
    text('Depth Reached: ' + score + 'm', width/2, height/2);
    text('Record Depth: ' + highScore + 'm', width/2, height/2 + 40);
    textSize(16);
    text('Press SPACE to Dive Again', width/2, height/2 + 80);
}

function keyPressed() {
    if (key === ' ') {
        if (gameState === 'start' || gameState === 'gameover') {
            gameState = 'playing';
            resetGame();
        }
    }
} 
