// Initialize
function setup() {
    createCanvas(800, 600);
    resetGame();
}

// Reset game
function resetGame() {
    player.x = width / 2;
    player.y = height - 100;
    player.velocityY = player.jumpForce;
    platforms = [];
    score = 0;
