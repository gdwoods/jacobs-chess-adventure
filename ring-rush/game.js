// Ring Rush - Game Logic

// Game state
let canvas, ctx;
let gameRunning = false;
let score = 0;
let distance = 0;
let speed = 5;
let baseSpeed = 5;
let highScore = parseInt(localStorage.getItem('ringRushHighScore') || '0');

// Player
const player = {
    x: 80,
    y: 0,
    width: 50,
    height: 60,
    velocityY: 0,
    isJumping: false,
    jumpPower: -22,        // Higher jump
    gravity: 0.7,          // Floatier feel
    groundY: 0,
    canDoubleJump: true,   // Double jump for kids!
    hasDoubleJumped: false
};

// Game objects
let rings = [];
let obstacles = [];
let particles = [];
let clouds = [];

// Spawn timers
let ringSpawnTimer = 0;
let obstacleSpawnTimer = 0;

// Animation frame
let animFrame = 0;
let lastTime = 0;

// Initialize
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
    
    // Buttons
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('retryBtn').addEventListener('click', startGame);
    document.getElementById('menuBtn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // Show high score
    document.getElementById('bestScore').textContent = highScore;
    
    // Initialize clouds
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.4),
            size: 30 + Math.random() * 40,
            speed: 0.5 + Math.random() * 1
        });
    }
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = Math.min(800, window.innerWidth - 40);
    canvas.height = Math.min(400, window.innerHeight - 200);
    player.groundY = canvas.height - 80;
    player.y = player.groundY;
}

function handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
}

function handleKeyUp(e) {
    // Could add for variable jump height later
}

function jump() {
    if (!gameRunning) return;
    
    // First jump from ground
    if (!player.isJumping) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
        player.hasDoubleJumped = false;
        playSound('jump');
    }
    // Double jump in air
    else if (!player.hasDoubleJumped && player.canDoubleJump) {
        player.velocityY = player.jumpPower * 0.85;  // Slightly weaker double jump
        player.hasDoubleJumped = true;
        playSound('jump');
    }
}

function startGame() {
    // Reset game state
    score = 0;
    distance = 0;
    speed = baseSpeed;
    rings = [];
    obstacles = [];
    particles = [];
    
    player.y = player.groundY;
    player.velocityY = 0;
    player.isJumping = false;
    player.hasDoubleJumped = false;
    
    ringSpawnTimer = 0;
    obstacleSpawnTimer = 0;
    
    // Update UI
    document.getElementById('score').textContent = '0';
    document.getElementById('distance').textContent = '0';
    document.getElementById('speedDisplay').textContent = '1x';
    
    // Switch screens
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameoverScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    gameRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    
    playSound('start');
}

function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to ~60fps
    lastTime = currentTime;
    
    update(deltaTime);
    render();
    
    animFrame++;
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Update distance and speed (gradual increase, capped for playability)
    distance += speed * dt * 0.1;
    speed = baseSpeed + Math.floor(distance / 800) * 0.4;  // Slower speed increase
    speed = Math.min(speed, 10); // Lower cap - stays fun for kids
    
    // Update player physics
    player.velocityY += player.gravity * dt;
    player.y += player.velocityY * dt;
    
    if (player.y >= player.groundY) {
        player.y = player.groundY;
        player.velocityY = 0;
        player.isJumping = false;
        player.hasDoubleJumped = false;  // Reset double jump when landing
    }
    
    // Spawn rings
    ringSpawnTimer += dt;
    if (ringSpawnTimer > 60 / speed) {
        spawnRing();
        ringSpawnTimer = 0;
    }
    
    // Spawn obstacles (with minimum spacing)
    obstacleSpawnTimer += dt;
    const minSpawnInterval = Math.max(80, 200 / speed);  // Minimum time between obstacles
    const lastObstacleX = obstacles.length > 0 ? obstacles[obstacles.length - 1].x : canvas.width + 200;
    
    if (obstacleSpawnTimer > minSpawnInterval && distance > 100 && lastObstacleX < canvas.width - 150) {
        if (Math.random() < 0.3) {  // Reduced spawn chance
            spawnObstacle();
        }
        obstacleSpawnTimer = 0;
    }
    
    // Update rings
    for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].x -= speed * dt;
        rings[i].rotation += 0.1 * dt;
        
        // Check collision with player
        if (checkCollision(player, rings[i])) {
            score += 10;
            createParticles(rings[i].x, rings[i].y, '#ffd700', 5);
            rings.splice(i, 1);
            playSound('ring');
            continue;
        }
        
        // Remove off-screen
        if (rings[i].x < -50) {
            rings.splice(i, 1);
        }
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed * dt;
        
        // Check collision with player (very forgiving hitbox for kids!)
        const hitbox = {
            x: player.x + 15,           // More inset from left
            y: player.y + 20,           // More inset from top
            width: player.width - 30,   // Much narrower
            height: player.height - 30  // Much shorter
        };
        
        // Also shrink obstacle hitbox slightly for fairness
        const obsHitbox = {
            x: obstacles[i].x + 5,
            y: obstacles[i].y + 5,
            width: obstacles[i].width - 10,
            height: obstacles[i].height - 10
        };
        
        if (checkCollision(hitbox, obsHitbox)) {
            gameOver();
            return;
        }
        
        // Remove off-screen
        if (obstacles[i].x < -50) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx * dt;
        particles[i].y += particles[i].vy * dt;
        particles[i].vy += 0.3 * dt;
        particles[i].life -= dt;
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update clouds
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed * dt;
        if (cloud.x < -cloud.size) {
            cloud.x = canvas.width + cloud.size;
            cloud.y = Math.random() * (canvas.height * 0.3);
        }
    });
    
    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('distance').textContent = Math.floor(distance);
    document.getElementById('speedDisplay').textContent = (speed / baseSpeed).toFixed(1) + 'x';
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.6, '#98FB98');
    skyGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        drawCloud(cloud.x, cloud.y, cloud.size);
    });
    
    // Draw ground
    ctx.fillStyle = '#1a5c1a';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Draw ground details
    ctx.fillStyle = '#145214';
    for (let x = (animFrame * -speed * 0.5) % 40; x < canvas.width; x += 40) {
        ctx.fillRect(x, canvas.height - 60, 20, 5);
    }
    
    // Draw rings
    rings.forEach(ring => {
        drawRing(ring.x, ring.y, ring.size, ring.rotation);
    });
    
    // Draw obstacles
    obstacles.forEach(obs => {
        drawObstacle(obs);
    });
    
    // Draw particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Draw player
    drawPlayer();
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function drawRing(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    
    // Outer ring
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * Math.abs(Math.cos(rotation)), 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.3, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawObstacle(obs) {
    ctx.fillStyle = '#8B4513';
    
    if (obs.type === 'rock') {
        // Draw rock
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.5, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        
        // Rock details
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.5, obs.y + 10);
        ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
    } else if (obs.type === 'spike') {
        // Draw spikes
        ctx.fillStyle = '#444';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + i * 20, obs.y + obs.height);
            ctx.lineTo(obs.x + i * 20 + 10, obs.y);
            ctx.lineTo(obs.x + i * 20 + 20, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
        }
    }
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const bounce = player.isJumping ? 0 : Math.sin(animFrame * 0.3) * 3;
    
    ctx.save();
    ctx.translate(x + player.width / 2, y + player.height + bounce);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, -5, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (blue)
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.ellipse(0, -35, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Belly (lighter blue)
    ctx.fillStyle = '#66b3ff';
    ctx.beginPath();
    ctx.ellipse(5, -30, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head spikes (for speed effect)
    ctx.fillStyle = '#0044cc';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-15 - i * 3, -40 - i * 2);
        ctx.lineTo(-25 - i * 8, -35 - i * 3);
        ctx.lineTo(-15 - i * 3, -30 - i * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(12, -42, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(15, -42, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(17, -44, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Shoes
    ctx.fillStyle = '#ff0000';
    const legOffset = player.isJumping ? 0 : Math.sin(animFrame * 0.5) * 5;
    ctx.beginPath();
    ctx.ellipse(-8, -5 + legOffset, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -5 - legOffset, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function spawnRing() {
    const ring = {
        x: canvas.width + 30,
        y: player.groundY - 30 - Math.random() * 100,
        size: 15,
        width: 30,
        height: 30,
        rotation: 0
    };
    rings.push(ring);
}

function spawnObstacle() {
    // More variety, but favor smaller obstacles for kids
    const types = ['small_rock', 'small_rock', 'rock', 'spike'];  // Small rocks more common
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width, height;
    if (type === 'small_rock') {
        width = 25;
        height = 25;
    } else if (type === 'rock') {
        width = 35;
        height = 35;
    } else {
        width = 45;  // Narrower spikes
        height = 25;
    }
    
    const obstacle = {
        x: canvas.width + 30,
        y: player.groundY + player.height - height,
        width: width,
        height: height,
        type: type.includes('rock') ? 'rock' : 'spike'
    };
    obstacles.push(obstacle);
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            size: 3 + Math.random() * 4,
            color: color,
            life: 30,
            maxLife: 30
        });
    }
}

function gameOver() {
    gameRunning = false;
    
    const totalScore = score + Math.floor(distance);
    const isNewRecord = totalScore > highScore;
    
    if (isNewRecord) {
        highScore = totalScore;
        localStorage.setItem('ringRushHighScore', highScore.toString());
        document.getElementById('bestScore').textContent = highScore;
    }
    
    // Update game over screen
    document.getElementById('finalRings').textContent = score;
    document.getElementById('finalDistance').textContent = Math.floor(distance) + 'm';
    document.getElementById('finalScore').textContent = totalScore;
    document.getElementById('newRecord').style.display = isNewRecord ? 'block' : 'none';
    
    // Show game over screen
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameoverScreen').style.display = 'flex';
    
    playSound('crash');
}

// Sound effects using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playSound(type) {
    initAudio();
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch(type) {
        case 'jump':
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
        case 'ring':
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
        case 'crash':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'start':
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.setValueAtTime(500, now + 0.1);
            oscillator.frequency.setValueAtTime(600, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
