class MazeGame {
    constructor() {
        console.log('MazeGame constructor called');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Game canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupResponsive();
        
        // Game settings
        this.difficulty = 'medium'; // easy, medium, hard
        this.mazeSize = this.getMazeSizeByDifficulty();
        this.score = 0;
        this.startTime = Date.now();
        
        console.log('Initializing game with difficulty:', this.difficulty);
        this.initGame();
    }
    
    // Get maze size based on difficulty
    getMazeSizeByDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                return { width: 10, height: 10 };
            case 'medium':
                return { width: 15, height: 15 };
            case 'hard':
                return { width: 20, height: 20 };
            default:
                return { width: 15, height: 15 };
        }
    }
    
    // Set difficulty level
    setDifficulty(level) {
        this.difficulty = level;
        this.mazeSize = this.getMazeSizeByDifficulty();
        this.restartGame();
    }
    
    // Restart game with new settings
    restartGame() {
        this.gameStarted = false;
        this.score = 0;
        this.startTime = Date.now();
        this.initGame();
    }

    setupResponsive() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    initGame() {
        console.log('Initializing game...');
        try {
            // Use dynamic maze size based on difficulty
            this.mazeGenerator = new MazeGenerator(this.mazeSize.width, this.mazeSize.height);
            this.maze = this.mazeGenerator.generate();
            this.ball = new Ball();
            this.inputManager = new InputManager();
            this.gameStarted = true;
            this.score = 0;
            this.startTime = Date.now();
            
            console.log(`Game objects created successfully - Maze size: ${this.mazeSize.width}x${this.mazeSize.height}`);
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('Error in initGame:', error);
        }
    }

    gameLoop() {
        if (!this.gameStarted) return;
        
        const deltaTime = 1000 / 60; // 60fps
        
        // Update score and time
        this.updateScore();
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        this.drawMaze();
        
        // Update ball position
        const direction = this.inputManager.getInput();
        if (direction !== 'none') {
            this.ball.updatePosition(direction, deltaTime, this.maze);
        }
        
        // Draw ball
        this.drawBall();
        
        // Draw goal
        this.drawGoal();
        
        // Check win condition
        this.checkWinCondition();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Update score and display
    updateScore() {
        if (!this.gameStarted) return;
        
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        // Update time display
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update score (based on time and difficulty)
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        };
        
        this.score = Math.max(0, 1000 - elapsedTime * difficultyMultiplier[this.difficulty]);
        
        const scoreDisplay = document.getElementById('scoreValue');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
        
        // Update difficulty display
        const difficultyDisplay = document.getElementById('difficultyDisplay');
        if (difficultyDisplay) {
            const difficultyNames = {
                'easy': 'Easy',
                'medium': 'Medium', 
                'hard': 'Hard'
            };
            difficultyDisplay.textContent = difficultyNames[this.difficulty];
        }
    }

    drawMaze() {
        const cellSize = 40;
        const offsetX = (this.canvas.width - this.maze[0].length * cellSize) / 2;
        const offsetY = (this.canvas.height - this.maze.length * cellSize) / 2;
        
        this.ctx.fillStyle = '#4a4a6a';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const cellX = offsetX + x * cellSize;
                const cellY = offsetY + y * cellSize;
                
                if (this.maze[y][x] === 1) { // Wall
                    this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    this.ctx.strokeRect(cellX, cellY, cellSize, cellSize);
                }
            }
        }
    }

    drawBall() {
        const cellSize = 40;
        const offsetX = (this.canvas.width - this.maze[0].length * cellSize) / 2;
        const offsetY = (this.canvas.height - this.maze.length * cellSize) / 2;
        
        // Draw ball trail
        this.drawTrail(offsetX, offsetY, cellSize);
        
        // Convert ball position to pixel coordinates
        const ballX = offsetX + this.ball.x * cellSize + cellSize / 2;
        const ballY = offsetY + this.ball.y * cellSize + cellSize / 2;
        const ballRadius = cellSize * this.ball.radius;
        
        // Change color based on collision state
        if (this.ball.collisionCooldown > 0) {
            // Flash red when colliding
            const flashIntensity = Math.sin(this.ball.collisionCooldown / 50) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${flashIntensity})`;
        } else {
            this.ctx.fillStyle = '#ff6b6b';
        }
        
        // Draw ball with glow effect
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw collision particles
        this.drawCollisionParticles(offsetX, offsetY, cellSize);
    }
    
    // Draw ball trail
    drawTrail(offsetX, offsetY, cellSize) {
        if (this.ball.trail.length < 2) return;
        
        this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        for (let i = 0; i < this.ball.trail.length; i++) {
            const point = this.ball.trail[i];
            const x = offsetX + point.x * cellSize + cellSize / 2;
            const y = offsetY + point.y * cellSize + cellSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
    }
    
    // Draw collision particles
    drawCollisionParticles(offsetX, offsetY, cellSize) {
        this.ball.collisionParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const x = offsetX + particle.x * cellSize + cellSize / 2;
            const y = offsetY + particle.y * cellSize + cellSize / 2;
            const radius = 3 * alpha;
            
            this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGoal() {
        const cellSize = 40;
        const offsetX = (this.canvas.width - this.maze[0].length * cellSize) / 2;
        const offsetY = (this.canvas.height - this.maze.length * cellSize) / 2;
        
        // Draw goal at bottom right
        const goalX = offsetX + (this.maze[0].length - 1) * cellSize + cellSize / 2;
        const goalY = offsetY + (this.maze.length - 1) * cellSize + cellSize / 2;
        const goalSize = cellSize / 2;
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(goalX - goalSize/2, goalY - goalSize/2, goalSize, goalSize);
    }
}

class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.complexity = Math.min(0.3, (width * height) / 1000); // Complexity based on size
    }

    // Generate maze using recursive backtracking algorithm
    generate() {
        // Initialize maze with all walls
        const maze = Array(this.height).fill().map(() => Array(this.width).fill(1));
        
        // Carve paths using recursive backtracking
        this.carvePath(maze, 1, 1);
        
        // Ensure start and goal positions are clear
        maze[1][1] = 0; // Start position
        maze[this.height - 2][this.width - 2] = 0; // Goal position
        
        // Create some additional paths for better gameplay
        this.createAdditionalPaths(maze);
        
        // Add some strategic dead ends and challenges
        this.addDeadEnds(maze);
        
        return maze;
    }

    // Recursive backtracking maze generation
    carvePath(maze, x, y) {
        maze[y][x] = 0; // Carve path
        
        // Define directions: up, right, down, left
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ];
        
        // Shuffle directions for random maze
        this.shuffleArray(directions);
        
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            // Check if the new position is valid and unvisited
            if (this.isValidPosition(newX, newY) && maze[newY][newX] === 1) {
                // Carve the wall between current and new position
                maze[y + dy/2][x + dx/2] = 0;
                // Recursively carve from new position
                this.carvePath(maze, newX, newY);
            }
        }
    }

    // Create additional paths for better gameplay
    createAdditionalPaths(maze) {
        const numPaths = Math.floor(this.width * this.height * 0.05); // 5% of cells
        
        for (let i = 0; i < numPaths; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            // Only carve if it creates a meaningful path
            if (maze[y][x] === 1 && this.hasPathNeighbor(maze, x, y)) {
                maze[y][x] = 0;
            }
        }
    }

    // Add strategic dead ends and challenges
    addDeadEnds(maze) {
        const numDeadEnds = Math.floor(this.width * this.height * 0.1); // 10% of cells
        
        for (let i = 0; i < numDeadEnds; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            // Create dead ends away from start and goal
            if (maze[y][x] === 0 && 
                !this.isNearStartOrGoal(x, y) && 
                this.canCreateDeadEnd(maze, x, y)) {
                maze[y][x] = 1;
            }
        }
    }

    // Helper methods
    isValidPosition(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }

    hasPathNeighbor(maze, x, y) {
        const neighbors = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
        ];
        
        return neighbors.some(([nx, ny]) => 
            this.isValidPosition(nx, ny) && maze[ny][nx] === 0
        );
    }

    isNearStartOrGoal(x, y) {
        const startDistance = Math.abs(x - 1) + Math.abs(y - 1);
        const goalDistance = Math.abs(x - (this.width - 2)) + Math.abs(y - (this.height - 2));
        return startDistance < 3 || goalDistance < 3;
    }

    canCreateDeadEnd(maze, x, y) {
        // Check if creating a dead end won't completely isolate areas
        const pathNeighbors = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
        ].filter(([nx, ny]) => 
            this.isValidPosition(nx, ny) && maze[ny][nx] === 0
        );
        
        return pathNeighbors.length >= 2;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

class Ball {
    constructor() {
        this.x = 1; // Start position
        this.y = 1;
        this.baseSpeed = 200; // Base speed for keyboard controls
        this.currentSpeed = this.baseSpeed;
        this.radius = 0.3; // Ball radius in grid units (0.3 = 30% of cell)
        this.collisionCooldown = 0; // Prevent collision spam
        this.collisionParticles = []; // Visual collision effects
        this.trail = []; // Ball trail for visual effect
        this.maxTrailLength = 10;
    }

    setSpeed(speed) {
        this.currentSpeed = speed;
    }

    // Update collision cooldown
    updateCooldown(deltaTime) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
        }
    }

    // Trigger collision effect
    onCollision() {
        if (this.collisionCooldown <= 0) {
            this.collisionCooldown = 100; // 100ms cooldown
            this.createCollisionParticles();
        }
    }

    // Create visual collision particles
    createCollisionParticles() {
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles;
            this.collisionParticles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 500, // 500ms lifetime
                maxLife: 500
            });
        }
    }

    // Update collision particles
    updateParticles(deltaTime) {
        this.collisionParticles = this.collisionParticles.filter(particle => {
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= deltaTime;
            return particle.life > 0;
        });
    }

    // Add to trail
    addToTrail() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    updatePosition(direction, deltaTime, maze) {
        const movement = this.currentSpeed * deltaTime / 1000;
        
        // Update collision cooldown
        this.updateCooldown(deltaTime);
        
        // Calculate new position
        let newX = this.x;
        let newY = this.y;
        
        switch (direction) {
            case 'up':
                newY -= movement / 40; // Convert to grid units
                break;
            case 'down':
                newY += movement / 40;
                break;
            case 'left':
                newX -= movement / 40;
                break;
            case 'right':
                newX += movement / 40;
                break;
        }
        
        // Check collision with maze walls before updating position
        if (!this.checkCollision(newX, newY, maze)) {
            this.x = newX;
            this.y = newY;
            this.addToTrail(); // Add to trail when moving
        } else if (this.collisionCooldown <= 0) {
            // Trigger collision effect
            this.onCollision();
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Clamp to maze bounds (backup safety)
        this.x = Math.max(this.radius, Math.min(maze[0].length - 1 - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(maze.length - 1 - this.radius, this.y));
    }
    
    // Advanced collision detection
    checkCollision(x, y, maze) {
        // Get ball bounds in grid coordinates
        const left = x - this.radius;
        const right = x + this.radius;
        const top = y - this.radius;
        const bottom = y + this.radius;
        
        // Check if ball would be in a wall cell
        for (let gridY = Math.floor(top); gridY <= Math.ceil(bottom); gridY++) {
            for (let gridX = Math.floor(left); gridX <= Math.ceil(right); gridX++) {
                // Check if the grid cell is within bounds
                if (gridY >= 0 && gridY < maze.length && 
                    gridX >= 0 && gridX < maze[0].length) {
                    
                    // If this cell is a wall, check collision
                    if (maze[gridY][gridX] === 1) {
                        // Calculate the actual intersection
                        const cellLeft = gridX;
                        const cellRight = gridX + 1;
                        const cellTop = gridY;
                        const cellBottom = gridY + 1;
                        
                        // Check if ball intersects with this wall cell
                        if (right > cellLeft && left < cellRight &&
                            bottom > cellTop && top < cellBottom) {
                            return true; // Collision detected
                        }
                    }
                }
            }
        }
        
        // If outside maze bounds, consider it a collision
        return x < 0 || x >= maze[0].length || y < 0 || y >= maze.length;
    }
}

class InputManager {
    constructor() {
        this.direction = 'none';
        this.setupKeyboardControls();
        this.setupTouchControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.direction = 'right';
                    break;
                default:
                    this.direction = 'none';
            }
        });
    }

    setupTouchControls() {
        const touchArea = document.getElementById('touchArea');
        if (!touchArea) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        touchArea.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        touchArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.direction = deltaX > 0 ? 'right' : 'left';
            } else {
                this.direction = deltaY > 0 ? 'down' : 'up';
            }
        });
        
        touchArea.addEventListener('touchend', () => {
            this.direction = 'none';
        });
    }

    getInput() {
        return this.direction;
    }
}

// Start button functionality
function initializeStartButton() {
    const startButton = document.getElementById('startButton');
    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const controlsInfo = document.getElementById('controlsInfo');
    const mobileControls = document.getElementById('mobileControls');
    
    if (!startButton) {
        console.error('Start button not found!');
        return;
    }
    
    console.log('Start button found, adding click listener');
    
    startButton.addEventListener('click', function() {
        console.log('Start button clicked!');
        
        // Hide start screen
        if (startScreen) {
            startScreen.classList.add('hidden');
            console.log('Start screen hidden');
        }
        
        // Show game elements
        if (gameCanvas) {
            gameCanvas.classList.remove('hidden');
            console.log('Game canvas shown');
        }
        
        if (controlsInfo) {
            controlsInfo.classList.remove('hidden');
            console.log('Controls info shown');
        }
        
        // Show score and difficulty selector
        const scoreDisplay = document.getElementById('scoreDisplay');
        const difficultySelector = document.getElementById('difficultySelector');
        
        if (scoreDisplay) {
            scoreDisplay.classList.remove('hidden');
            console.log('Score display shown');
        }
        
        if (difficultySelector) {
            difficultySelector.classList.remove('hidden');
            console.log('Difficulty selector shown');
        }
        
        // Hide mobile controls on desktop
        if (mobileControls) {
            if (window.matchMedia('(pointer: coarse)').matches) {
                mobileControls.style.display = 'block';
                console.log('Mobile controls shown for mobile device');
            } else {
                mobileControls.style.display = 'none';
                console.log('Mobile controls hidden for desktop');
            }
        }
        
        // Initialize game
        console.log('Initializing game...');
        try {
            window.mazeGame = new MazeGame();
            console.log('Game initialized successfully!');
            
            // Setup difficulty selector
            setupDifficultySelector();
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    });
}

// Setup difficulty selector
function setupDifficultySelector() {
    console.log('Setting up difficulty selector...');
    
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const difficulty = this.dataset.difficulty;
            console.log('Difficulty changed to:', difficulty);
            
            // Update active button
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update game difficulty
            if (window.mazeGame) {
                window.mazeGame.setDifficulty(difficulty);
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    initializeStartButton();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStartButton);
} else {
    console.log('DOM already loaded, initializing start button');
    initializeStartButton();
}