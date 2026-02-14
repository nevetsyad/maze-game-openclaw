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
        this.mazeSize = { width: 10, height: 10 }; // Fixed size maze
        this.score = 0;
        this.startTime = Date.now();
        
        console.log('Initializing game with maze size:', this.mazeSize);
        this.initGame();
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
            // Use fixed maze size
            this.mazeGenerator = new MazeGenerator(this.mazeSize.width, this.mazeSize.height);
            this.maze = this.mazeGenerator.generate('medium');
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
        const input = this.inputManager.getInput();
        this.ball.updatePosition(input, deltaTime, this.maze);
        
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
        
        // Update score (based on time)
        
        this.score = Math.max(0, 1000 - elapsedTime);
        
        const scoreDisplay = document.getElementById('scoreValue');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
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
        
        // Define difficulty levels
        this.difficulties = {
            easy: { width: 10, height: 10 },
            medium: { width: 15, height: 15 },
            hard: { width: 20, height: 20 }
        };
        
        // Predefined solvable mazes
        this.predefinedMazes = {
            easy: this.createPredefinedEasy(),
            medium: this.createPredefinedMedium(),
            hard: this.createPredefinedHard()
        };
    }

    // Check if we should use predefined maze or generate random
    shouldUsePredefined(difficulty) {
        // Use predefined mazes 70% of the time, random 30% for variety
        return Math.random() < 0.7;
    }

    // Generate maze using predefined or random approach
    generate(difficulty = 'medium') {
        // Check if we should use predefined maze
        if (this.shouldUsePredefined(difficulty) && this.predefinedMazes[difficulty]) {
            console.log(`Using predefined ${difficulty} maze`);
            let maze = this.predefinedMazes[difficulty];
            // Ensure predefined maze is solvable
            if (!this.isMazeSolvable(maze)) {
                console.log(`Predefined maze not solvable, fixing...`);
                maze = this.ensureSolvable(JSON.parse(JSON.stringify(maze)));
            }
            return maze;
        }
        
        console.log(`Generating random ${difficulty} maze`);
        let maze = this.generateRandom();
        // Ensure random maze is solvable
        if (!this.isMazeSolvable(maze)) {
            console.log(`Random maze not solvable, fixing...`);
            maze = this.ensureSolvable(JSON.parse(JSON.stringify(maze)));
        }
        return maze;
    }
    
    // Generate random maze using recursive backtracking algorithm
    generateRandom() {
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
    
    // Create predefined easy maze (10x10)
    createPredefinedEasy() {
        const maze = Array(10).fill().map(() => Array(10).fill(1));
        
        // Create a simple but interesting maze with guaranteed path
        const path = [
            [1,1], [1,2], [1,3], [2,3], [3,3], [3,4], [3,5], [4,5], [5,5], [5,6],
            [5,7], [6,7], [7,7], [7,8], [7,9], [8,9]
        ];
        
        // Carve main path
        path.forEach(([x, y]) => {
            if (x < 10 && y < 10) maze[y][x] = 0;
        });
        
        // Add some additional paths for variety
        const extraPaths = [[2,1], [2,2], [4,3], [4,4], [6,5], [6,6], [8,7], [8,8]];
        extraPaths.forEach(([x, y]) => {
            if (x < 10 && y < 10) maze[y][x] = 0;
        });
        
        // Ensure borders are walls
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (x === 0 || x === 9 || y === 0 || y === 9) {
                    maze[y][x] = 1;
                }
            }
        }
        
        // Guarantee start and goal are clear
        maze[1][1] = 0; // Start
        maze[8][9] = 0; // Goal
        
        return maze;
    }
    
    // Create predefined medium maze (15x15)
    createPredefinedMedium() {
        const maze = Array(15).fill().map(() => Array(15).fill(1));
        
        // Create a more complex but guaranteed solvable maze
        const mainPath = [
            [1,1], [1,2], [1,3], [2,3], [3,3], [3,4], [3,5], [4,5], [5,5], [5,6],
            [5,7], [6,7], [7,7], [7,8], [7,9], [8,9], [8,10], [8,11], [9,11],
            [10,11], [11,11], [11,12], [11,13], [12,13], [13,13], [13,14]
        ];
        
        // Carve main path
        mainPath.forEach(([x, y]) => {
            if (x < 15 && y < 15) maze[y][x] = 0;
        });
        
        // Add branch paths for complexity
        const branches = [
            [2,1], [2,2], [4,3], [4,4], [4,6], [6,5], [6,6], [6,8], [6,9],
            [9,10], [9,9], [9,8], [10,10], [10,9], [12,12], [12,11]
        ];
        branches.forEach(([x, y]) => {
            if (x < 15 && y < 15) maze[y][x] = 0;
        });
        
        // Ensure borders are walls
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (x === 0 || x === 14 || y === 0 || y === 14) {
                    maze[y][x] = 1;
                }
            }
        }
        
        // Guarantee start and goal are clear
        maze[1][1] = 0; // Start
        maze[13][14] = 0; // Goal
        
        return maze;
    }
    
    // Create predefined hard maze (20x20)
    createPredefinedHard() {
        const maze = Array(20).fill().map(() => Array(20).fill(1));
        
        // Create a complex maze with multiple possible routes
        const mainPath = [
            [1,1], [1,2], [1,3], [1,4], [1,5], [2,5], [3,5], [3,6], [3,7], [4,7],
            [5,7], [5,8], [5,9], [6,9], [7,9], [7,10], [7,11], [8,11], [9,11],
            [10,11], [11,11], [11,12], [11,13], [11,14], [12,14], [13,14], [13,15],
            [13,16], [14,16], [15,16], [15,17], [15,18], [16,18], [17,18], [18,18]
        ];
        
        // Carve main path
        mainPath.forEach(([x, y]) => {
            if (x < 20 && y < 20) maze[y][x] = 0;
        });
        
        // Add multiple alternative routes
        const altRoutes = [
            // Upper route
            [2,1], [2,2], [2,3], [2,4], [4,4], [4,3], [4,2], [4,1],
            // Middle route
            [6,8], [6,7], [6,6], [8,10], [8,9], [8,8], [8,7], [10,10],
            // Lower route
            [14,15], [14,14], [14,13], [16,15], [16,14], [16,13], [17,17], [17,16],
            // Side branches
            [3,1], [5,1], [7,1], [9,1], [11,1], [13,1], [15,1], [17,1],
            [3,19], [5,19], [7,19], [9,19], [11,19], [13,19], [15,19], [17,19]
        ];
        altRoutes.forEach(([x, y]) => {
            if (x < 20 && y < 20) maze[y][x] = 0;
        });
        
        // Ensure borders are walls
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 20; x++) {
                if (x === 0 || x === 19 || y === 0 || y === 19) {
                    maze[y][x] = 1;
                }
            }
        }
        
        // Guarantee start and goal are clear
        maze[1][1] = 0; // Start
        maze[18][18] = 0; // Goal
        
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
    
    // Verify maze is solvable using BFS
    isMazeSolvable(maze) {
        const width = maze[0].length;
        const height = maze.length;
        const start = [1, 1];
        const goal = [height - 2, width - 2];
        
        // BFS to check if there's a path from start to goal
        const queue = [start];
        const visited = new Set();
        visited.add(`${start[0]},${start[1]}`);
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // down, right, up, left
        
        while (queue.length > 0) {
            const [y, x] = queue.shift();
            
            // Check if we reached the goal
            if (y === goal[0] && x === goal[1]) {
                return true;
            }
            
            // Explore all directions
            for (const [dy, dx] of directions) {
                const newY = y + dy;
                const newX = x + dx;
                const key = `${newY},${newX}`;
                
                // Check if new position is valid and not visited
                if (newY >= 0 && newY < height && 
                    newX >= 0 && newX < width && 
                    maze[newY][newX] === 0 && 
                    !visited.has(key)) {
                    
                    visited.add(key);
                    queue.push([newY, newX]);
                }
            }
        }
        
        return false; // No path found
    }
    
    // Ensure maze is solvable by creating guaranteed paths
    ensureSolvable(maze) {
        const width = maze[0].length;
        const height = maze.length;
        
        // Create a simple guaranteed path from start to goal
        for (let i = 1; i < width - 1; i++) {
            // Top row path
            if (maze[1][i] === 1) maze[1][i] = 0;
            // Bottom row path  
            if (maze[height - 2][i] === 1) maze[height - 2][i] = 0;
        }
        
        for (let i = 1; i < height - 1; i++) {
            // Left column path
            if (maze[i][1] === 1) maze[i][1] = 0;
            // Right column path
            if (maze[i][width - 2] === 1) maze[i][width - 2] = 0;
        }
        
        // Ensure start and goal positions are clear
        maze[1][1] = 0; // Start
        maze[height - 2][width - 2] = 0; // Goal
        
        return maze;
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
        
        // Handle different input types
        if (typeof direction === 'string') {
            // Traditional directional input (keyboard/touch)
            switch (direction) {
                case 'up':
                    newY -= movement / 10; // Convert to grid units
                    break;
                case 'down':
                    newY += movement / 10;
                    break;
                case 'left':
                    newX -= movement / 10;
                    break;
                case 'right':
                    newX += movement / 10;
                    break;
            }
        } else if (typeof direction === 'object' && direction.x !== undefined && direction.y !== undefined) {
            // Gyroscope-style continuous movement
            const movementMultiplier = 0.5; // Adjust gyroscope sensitivity
            newX += direction.x * movement * movementMultiplier / 10;
            newY += direction.y * movement * movementMultiplier / 10;
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
        this.gyroMovement = { x: 0, y: 0 };
        this.inputMode = 'keyboard'; // keyboard, touch, gyro
        this.isMobile = false;
        this.gyroEnabled = false;
        
        // Detect mobile device
        this.detectDevice();
        
        // Setup gyroscope if mobile
        if (this.isMobile) {
            this.setupGyroscope();
        }
        
        // Setup other control methods
        this.setupKeyboardControls();
        this.setupTouchControls();
    }
    
    detectDevice() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('Device detected:', this.isMobile ? 'Mobile' : 'Desktop');
        
        // Set input mode based on device type
        this.inputMode = this.isMobile ? 'gyro' : 'keyboard';
        
        // Show mobile controls on mobile devices
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls && this.isMobile) {
            mobileControls.style.display = 'block';
            console.log('Mobile controls enabled');
        }
    }
    
    async setupGyroscope() {
        try {
            // Import GyroManager
            const { GyroManager } = await import('./gyro-manager.js');
            this.gyroManager = new GyroManager();
            
            // Initialize gyroscope
            const success = await this.gyroManager.init();
            
            if (success) {
                this.gyroEnabled = true;
                console.log('Gyroscope enabled successfully');
                
                // Show calibration instructions
                this.showCalibrationInstructions();
            } else {
                console.log('Gyroscope not available, falling back to touch controls');
            }
        } catch (error) {
            console.error('Error setting up gyroscope:', error);
        }
    }
    
    showCalibrationInstructions() {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls && this.gyroEnabled) {
            mobileControls.innerHTML = `
                <div class="gyro-info">
                    <div>🎯 Tilt your device to move the ball</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; opacity: 0.8;">
                        Calibrate: Tilt device to level position
                    </div>
                </div>
            `;
        }
    }
    
    updateGyroMovement() {
        if (this.gyroManager && this.gyroEnabled) {
            this.gyroMovement = this.gyroManager.updateMovement();
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Use keyboard controls on desktop
            if (!this.isMobile) {
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
            }
        });
        
        document.addEventListener('keyup', () => {
            if (!this.isMobile) {
                this.direction = 'none';
            }
        });
    }

    setupTouchControls() {
        // For mobile devices that don't have gyroscope or it's disabled
        if (this.isMobile) {
            // Create touch area overlay for mobile devices
            const touchArea = document.createElement('div');
            touchArea.id = 'touchArea';
            touchArea.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 5;
                background: transparent;
            `;
            document.body.appendChild(touchArea);
            
            let touchStartX = 0;
            let touchStartY = 0;
            
            touchArea.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.inputMode = 'touch';
            });
            
            touchArea.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                const deltaX = touchX - touchStartX;
                const deltaY = touchY - touchStartY;
                
                const threshold = 30; // Minimum distance to register movement
                
                if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        this.direction = deltaX > 0 ? 'right' : 'left';
                    } else {
                        this.direction = deltaY > 0 ? 'down' : 'up';
                    }
                }
            });
            
            touchArea.addEventListener('touchend', () => {
                this.direction = 'none';
            });
        }
    }

    getInput() {
        // Priority order: Gyroscope > Touch > Keyboard
        if (this.gyroEnabled && this.inputMode === 'gyro') {
            this.updateGyroMovement();
            
            // Convert gyro movement to direction
            const { x, y } = this.gyroMovement;
            
            // Threshold for movement detection
            const threshold = 0.1;
            
            if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
                return 'none';
            }
            
            // Determine primary direction
            if (Math.abs(x) > Math.abs(y)) {
                return x > 0 ? 'right' : 'left';
            } else {
                return y > 0 ? 'down' : 'up';
            }
        } else if (this.inputMode === 'touch') {
            return this.direction;
        } else {
            // For keyboard mode (desktop)
            return this.direction;
        }
    }
    
    getGyroStatus() {
        if (this.gyroManager) {
            return this.gyroManager.testConnection();
        }
        return { supported: false, enabled: false };
    }
    
    calibrateGyroscope() {
        if (this.gyroManager) {
            this.gyroManager.calibrate();
            this.showCalibrationInstructions();
        }
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
            
            // Add click handler to focus canvas
            gameCanvas.addEventListener('click', function() {
                gameCanvas.focus();
            });
            
            // Focus the canvas to capture keyboard events
            gameCanvas.focus();
            gameCanvas.tabIndex = 0; // Make it focusable
        }
        
        if (controlsInfo) {
            controlsInfo.classList.remove('hidden');
            console.log('Controls info shown');
        }
        
        // Show score display
        const scoreDisplay = document.getElementById('scoreDisplay');
        
        if (scoreDisplay) {
            scoreDisplay.classList.remove('hidden');
            console.log('Score display shown');
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
            
            // Start the game loop if it's not running
            if (window.mazeGame && window.mazeGame.gameStarted) {
                console.log('Starting game loop...');
                window.mazeGame.gameLoop();
            }
            
            // Focus the canvas to capture keyboard events
            if (gameCanvas) {
                gameCanvas.focus();
                gameCanvas.tabIndex = 0; // Make it focusable
            }
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    });
}


// Setup gyroscope controls
function setupGyroControls() {
    console.log('Setting up gyroscope controls...');
    
    const calibrateBtn = document.getElementById('calibrate-btn');
    const touchModeBtn = document.getElementById('touch-mode-btn');
    const gyroControls = document.getElementById('gyro-controls');
    const gyroStatus = document.getElementById('gyro-status');
    
    if (!calibrateBtn || !touchModeBtn) {
        console.log('Gyro control buttons not found');
        return;
    }
    
    // Calibrate button
    calibrateBtn.addEventListener('click', function() {
        console.log('Calibrating gyroscope...');
        
        if (window.mazeGame && window.mazeGame.inputManager) {
            window.mazeGame.inputManager.calibrateGyroscope();
            
            // Show calibrating status
            gyroStatus.textContent = '🔄 Calibrating...';
            gyroStatus.className = 'gyro-status calibrating';
            
            // Hide after 2 seconds
            setTimeout(() => {
                updateGyroStatus();
            }, 2000);
        }
    });
    
    // Touch mode button
    touchModeBtn.addEventListener('click', function() {
        console.log('Switching to touch mode...');
        
        if (window.mazeGame && window.mazeGame.inputManager) {
            window.mazeGame.inputManager.inputMode = 'touch';
            window.mazeGame.inputManager.gyroEnabled = false;
            
            // Update button states
            touchModeBtn.classList.add('active');
            calibrateBtn.style.display = 'none';
            
            // Update status
            gyroStatus.textContent = '📱 Touch controls enabled';
            gyroStatus.className = 'gyro-status';
            
            console.log('Switched to touch controls');
        }
    });
    
    // Update gyroscope status periodically
    setInterval(updateGyroStatus, 2000);
}

// Update gyroscope status display
function updateGyroStatus() {
    if (!window.mazeGame || !window.mazeGame.inputManager) return;
    
    const gyroStatus = document.getElementById('gyro-status');
    const gyroControls = document.getElementById('gyro-controls');
    const calibrateBtn = document.getElementById('calibrate-btn');
    const touchModeBtn = document.getElementById('touch-mode-btn');
    
    if (!gyroStatus) return;
    
    const status = window.mazeGame.inputManager.getGyroStatus();
    
    if (status.enabled && status.hasRecentData) {
        gyroStatus.textContent = '🎯 Gyroscope working - Tilt to move!';
        gyroStatus.className = 'gyro-status working';
        gyroControls.style.display = 'block';
        calibrateBtn.style.display = 'inline-block';
        touchModeBtn.classList.remove('active');
    } else if (status.enabled) {
        gyroStatus.textContent = '🎯 Tilt your device to move the ball';
        gyroStatus.className = 'gyro-status';
        gyroControls.style.display = 'block';
        calibrateBtn.style.display = 'inline-block';
        touchModeBtn.classList.remove('active');
    } else if (status.supported) {
        gyroStatus.textContent = '⚠️ Gyroscope not available - Using touch controls';
        gyroStatus.className = 'gyro-status error';
        gyroControls.style.display = 'block';
        calibrateBtn.style.display = 'none';
        touchModeBtn.classList.add('active');
    } else {
        gyroStatus.textContent = '📱 Touch controls active';
        gyroStatus.className = 'gyro-status';
        gyroControls.style.display = 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    initializeStartButton();
    setupGyroControls();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeStartButton();
        setupGyroControls();
    });
} else {
    console.log('DOM already loaded, initializing start button and gyro controls');
    initializeStartButton();
    setupGyroControls();
}