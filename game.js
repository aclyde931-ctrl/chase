const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');

// Grid Configuration (15x15 Maze)
const cols = 15;
const rows = 15;
const size = canvas.width / cols; 

// 1 = Wall, 0 = Path
const maze = [
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
];

let player, enemy, goal;
let isGameRunning = false;
let enemyMoveCounter = 0;

// Fast boyfriend speed configuration
const enemySpeedInterval = 18; 

function initGame() {
    player = { x: 0, y: 0, emoji: "👩‍🦰" };
    enemy = { x: 14, y: 0, emoji: "👦" }; 
    goal = { x: 14, y: 14, emoji: "🚪" };
    enemyMoveCounter = 0;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (maze[r][c] === 1) {
                ctx.fillStyle = '#ffb3c1'; 
                ctx.fillRect(c * size, r * size, size, size);
                ctx.strokeStyle = '#ff85a1';
                ctx.lineWidth = 1;
                ctx.strokeRect(c * size, r * size, size, size);
            }
        }
    }
}

function drawCharacter(char) {
    ctx.font = `${size * 0.7}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char.emoji, (char.x * size) + size / 2, (char.y * size) + size / 2);
}

// BFS Pathfinding Algorithm for AI
function getNextEnemyMove() {
    const start = { x: enemy.x, y: enemy.y };
    const target = { x: player.x, y: player.y };

    if (start.x === target.x && start.y === target.y) return start;

    let queue = [[start]];
    let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[start.y][start.x] = true;

    const directions = [
        { x: 0, y: -1 }, 
        { x: 0, y: 1 },  
        { x: -1, y: 0 }, 
        { x: 1, y: 0 }   
    ];

    while (queue.length > 0) {
        let path = queue.shift();
        let current = path[path.length - 1];

        if (current.x === target.x && current.y === target.y) {
            return path[1]; 
        }

        for (let dir of directions) {
            let nextX = current.x + dir.x;
            let nextY = current.y + dir.y;

            if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows) {
                if (maze[nextY][nextX] === 0 && !visited[nextY][nextX]) {
                    visited[nextY][nextX] = true;
                    let newPath = [...path, { x: nextX, y: nextY }];
                    queue.push(newPath);
                }
            }
        }
    }
    return start; 
}

function gameLoop() {
    if (!isGameRunning) return;

    enemyMoveCounter++;
    if (enemyMoveCounter >= enemySpeedInterval) {
        let nextStep = getNextEnemyMove();
        enemy.x = nextStep.x;
        enemy.y = nextStep.y;
        enemyMoveCounter = 0;
        checkCollisions();
    }

    drawMaze();
    drawCharacter(goal);
    drawCharacter(enemy);
    drawCharacter(player);

    requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    // Defeat Condition
    if (player.x === enemy.x && player.y === enemy.y) {
        endGame(false, "I caught you, now you are forever mine ❤️🔒");
    }
    // Victory Condition
    else if (player.x === goal.x && player.y === goal.y) {
        endGame(true, "You dont love me anymore hayyyyst 💔<br><span style='font-size:1.1rem; font-weight:normal; color:#666;'>Try again!</span>");
    }
}

// Logic execution for moving player character
function movePlayer(dx, dy) {
    if (!isGameRunning) return;

    let nextX = player.x + dx;
    let nextY = player.y + dy;

    if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows) {
        if (maze[nextY][nextX] === 0) {
            player.x = nextX;
            player.y = nextY;
            checkCollisions();
        }
    }
}

// Keyboard Input Handler (Desktop)
window.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;

    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            movePlayer(0, -1); e.preventDefault(); break;
        case 'arrowdown':
        case 's':
            movePlayer(0, 1); e.preventDefault(); break;
        case 'arrowleft':
        case 'a':
            movePlayer(-1, 0); e.preventDefault(); break;
        case 'arrowright':
        case 'd':
            movePlayer(1, 0); e.preventDefault(); break;
    }
});

// Mobile Touch Control Logic
const bindMobileButton = (id, dx, dy) => {
    const el = document.getElementById(id);
    // use pointerdown to handle both mouse clicks and finger touches fast
    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        movePlayer(dx, dy);
    });
};

bindMobileButton('btn-up', 0, -1);
bindMobileButton('btn-down', 0, 1);
bindMobileButton('btn-left', -1, 0);
bindMobileButton('btn-right', 1, 0);


function startGame() {
    initGame();
    overlay.classList.add('hidden');
    isGameRunning = true;
    gameLoop();
}

function endGame(victory, message) {
    isGameRunning = false;
    statusText.innerHTML = message;
    startBtn.innerText = "Try Again";
    overlay.classList.remove('hidden');
}

// Initial Map Compilation Frame
initGame();
drawMaze();
drawCharacter(goal);
drawCharacter(enemy);
drawCharacter(player);
