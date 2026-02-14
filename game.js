class MazeGame {
    constructor() {
        console.log('MazeGame constructor called');
        console.log('Looking for game canvas...');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas found:', this.canvas);
        
        if (!this.canvas) {
            console.error('Game canvas not found!');
            return;
        }
        
        console.log('Getting 2D context...');
        this.ctx = this.canvas.getContext('2d');
        console.log('Context obtained:', this.ctx);
        
        console.log('Setting up responsive...');
        this.setupResponsive();
        
        console.log('Initializing game...');
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
            this.mazeGenerator = new MazeGenerator(10, 10);
            this.maze = this.mazeGenerator.generate();
            this.ball = new Ball();
            this.inputManager = new InputManager();
            this.gameStarted = true;
            
            // Connect analog speed from input manager to ball
            this.inputManager.setBallSpeed = (speed) => {
                this.ball.setSpeed(speed);
            };
            
            console.log('Game objects created successfully');
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('Error in initGame:', error);
        }
    }

    gameLoop() {
        if (!this.gameStarted) return;
        
        const deltaTime = 1000 / 60; // 60fps
        
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
    
    // Check if ball has reached the goal
    checkWinCondition() {
        const goalX = this.maze[0].length - 1; // Rightmost column
        const goalY = this.maze.length - 1;   // Bottom row
        
        // Check if ball is at goal position (with some tolerance)
        const tolerance = 0.5; // Grid units
        if (Math.abs(this.ball.x - goalX) < tolerance && 
            Math.abs(this.ball.y - goalY) < tolerance) {
            
            this.gameWon();
        }
    }
    
    // Handle game win
    gameWon() {
        if (!this.gameWon) { // Prevent multiple triggers
            this.gameWon = true;
            this.gameStarted = false;
            
            // Show win message
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎉 You Win! 🎉', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
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
        
        // Convert ball position to pixel coordinates
        const ballX = offsetX + this.ball.x * cellSize + cellSize / 2;
        const ballY = offsetY + this.ball.y * cellSize + cellSize / 2;
        const ballRadius = cellSize / 3;
        
        // Change color based on collision state
        if (this.ball.collisionCooldown > 0) {
            // Flash red when colliding
            const flashIntensity = Math.sin(this.ball.collisionCooldown / 50) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${flashIntensity})`;
        } else {
            this.ctx.fillStyle = '#ff6b6b';
        }
        
        this.ctx.beginPath();
        this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
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
    }

    generate() {
        // Create a more complex maze pattern - 0 = path, 1 = wall
        const maze = [];
        for (let y = 0; y < this.height; y++) {
            maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Create border walls
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    maze[y][x] = 1; // Wall
                } else {
                    // Create internal walls for maze-like structure
                    // Add some randomness but ensure there are paths
                    const random = Math.random();
                    const pattern = (x + y) % 3 === 0;
                    
                    // 30% chance of wall, but ensure connectivity
                    if (random < 0.3 && pattern) {
                        maze[y][x] = 1; // Wall
                    } else {
                        maze[y][x] = 0; // Path
                    }
                }
            }
        }
        
        // Ensure start and end are clear and create a guaranteed path
        maze[1][1] = 0; // Start position
        maze[this.height - 2][this.width - 2] = 0; // Goal position
        
        // Create some guaranteed paths for better gameplay
        maze[1][2] = 0; // Path right from start
        maze[2][1] = 0; // Path down from start
        maze[this.height - 2][this.width - 3] = 0; // Path left to goal
        maze[this.height - 3][this.width - 2] = 0; // Path up to goal
        
        return maze;
    }
}

class Ball {
    constructor() {
        this.x = 1; // Start position
        this.y = 1;
        this.baseSpeed = 200; // Base speed for keyboard controls
        this.currentSpeed = this.baseSpeed;
        this.collisionCooldown = 0; // Prevent collision spam
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
        this.collisionCooldown = 100; // 100ms cooldown
    }

    updatePosition(direction, deltaTime, maze) {
        const movement = this.currentSpeed * deltaTime / 1000;
        const cellSize = 40; // Should match the cell size used in drawing
        
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
        } else if (this.collisionCooldown <= 0) {
            // Trigger collision effect
            this.onCollision();
        }
        
        // Clamp to maze bounds (backup safety)
        this.x = Math.max(0, Math.min(9, this.x));
        this.y = Math.max(0, Math.min(9, this.y));
    }
    
    // Check if ball collides with walls
    checkCollision(x, y, maze) {
        // Get ball position in grid coordinates
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        // Check if the ball would be in a wall cell
        if (gridY >= 0 && gridY < maze.length && 
            gridX >= 0 && gridX < maze[0].length) {
            return maze[gridY][gridX] === 1; // 1 = wall, 0 = path
        }
        
        // If outside maze bounds, consider it a collision
        return true;
    }
}

class InputManager {
    constructor() {
        this.direction = 'none';
        this.setupKeyboardControls();
        this.setupTouchControls();
        
        // Setup gyroscope controls for mobile devices
        if (window.matchMedia('(pointer: coarse)').matches) {
            console.log('Mobile device detected, setting up gyroscope controls...');
            this.setupGyroscopeControls();
        }
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
        // Touch controls removed - gyroscope now used instead
        console.log('Touch controls disabled, using gyroscope for mobile devices');
    }

    setupGyroscopeControls() {
        console.log('Setting up gyroscope controls...');
        
        // Check if device orientation is available
        if (typeof DeviceOrientationEvent === 'undefined') {
            console.log('Device orientation not supported');
            return;
        }
        
        // Check if we're on a mobile device
        if (!window.matchMedia('(pointer: coarse)').matches) {
            console.log('Not a mobile device, skipping gyroscope setup');
            return;
        }
        
        // Request permission for iOS devices
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            console.log('Requesting iOS device orientation permission...');
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    console.log('iOS permission response:', response);
                    if (response === 'granted') {
                        this.startGyroscopeListening();
                    } else {
                        console.log('iOS permission denied');
                    }
                })
                .catch(error => {
                    console.error('Error requesting iOS permission:', error);
                });
        } else {
            // Android and other devices
            console.log('Starting gyroscope listening for Android/other devices');
            this.startGyroscopeListening();
        }
    }

    startGyroscopeListening() {
        console.log('Starting analog gyroscope listening...');
        
        // Analog control parameters
        this.deadZone = 5; // Minimum tilt to trigger movement
        this.maxTilt = 30; // Maximum active tilt range
        this.maxSpeed = 10; // Maximum ball speed (units per second)
        
        // Current analog values
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.currentDirection = { x: 0, y: 0 };
        
        window.addEventListener('deviceorientation', (event) => {
            const gamma = event.gamma; // Left-right tilt (-90 to 90)
            const beta = event.beta;   // Front-back tilt (-180 to 180)
            
            if (gamma !== null && beta !== null) {
                console.log(`Tilt - Gamma: ${gamma}°, Beta: ${beta}°`);
                
                // Calculate movement direction and magnitude
                let moveX = 0, moveY = 0;
                
                // Left-right movement with analog magnitude
                if (Math.abs(gamma) > this.deadZone) {
                    moveX = gamma > 0 ? gamma / this.maxTilt : -Math.abs(gamma) / this.maxTilt;
                    moveX = Math.max(-1, Math.min(1, moveX)); // Clamp to -1 to 1
                }
                
                // Front-back movement with analog magnitude
                if (Math.abs(beta) > this.deadZone) {
                    moveY = beta > 0 ? beta / this.maxTilt : -Math.abs(beta) / this.maxTilt;
                    moveY = Math.max(-1, Math.min(1, moveY)); // Clamp to -1 to 1
                }
                
                // Calculate total speed magnitude
                const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
                this.targetSpeed = magnitude * this.maxSpeed;
                
                // Store direction
                this.currentDirection = { x: moveX, y: moveY };
                
                console.log(`Analog input - Speed: ${this.targetSpeed.toFixed(2)}, Direction: (${moveX.toFixed(2)}, ${moveY.toFixed(2)})`);
            }
        });
        
        // Smooth speed interpolation
        setInterval(() => {
            this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1; // Smooth interpolation
            
            // Convert analog input to digital direction for ball movement
            if (this.currentSpeed > 0.1) {
                const { x, y } = this.currentDirection;
                
                // Determine primary direction based on which axis has more influence
                if (Math.abs(x) > Math.abs(y)) {
                    this.direction = x > 0 ? 'right' : 'left';
                } else {
                    this.direction = y > 0 ? 'down' : 'up';
                }
                
                // Update ball speed with analog value
                if (this.setBallSpeed) {
                    this.setBallSpeed(this.currentSpeed * 20); // Scale for appropriate movement
                }
            } else {
                this.direction = 'none';
                
                // Reset to base speed when no tilt input
                if (this.setBallSpeed) {
                    this.setBallSpeed(200); // Base speed for keyboard controls
                }
            }
        }, 16); // ~60Hz update rate
    }

    getInput() {
        return this.direction;
    }
}

// Start button functionality
function initializeStartButton() {
    console.log('initializeStartButton called');
    
    const startButton = document.getElementById('startButton');
    console.log('Start button element:', startButton);
    
    if (!startButton) {
        console.error('Start button not found!');
        return;
    }
    
    console.log('Start button found, adding click listener');
    
    startButton.addEventListener('click', function() {
        console.log('Start button clicked!');
        
        const startScreen = document.getElementById('startScreen');
        const gameCanvas = document.getElementById('gameCanvas');
        const controlsInfo = document.getElementById('controlsInfo');
        const mobileControls = document.getElementById('mobileControls');
        
        console.log('Start screen element:', startScreen);
        console.log('Game canvas element:', gameCanvas);
        
        // Hide start screen
        if (startScreen) {
            startScreen.classList.add('hidden');
            console.log('Start screen hidden');
        } else {
            console.error('Start screen not found!');
        }
        
        // Show game elements
        if (gameCanvas) {
            gameCanvas.classList.remove('hidden');
            console.log('Game canvas shown');
        } else {
            console.error('Game canvas not found!');
        }
        
        if (controlsInfo) {
            controlsInfo.classList.remove('hidden');
            console.log('Controls info shown');
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
        } catch (error) {
            console.error('Error initializing game:', error);
            console.error('Error details:', error.stack);
        }
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