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
            this.ball.updatePosition(direction, deltaTime);
        }
        
        // Draw ball
        this.drawBall();
        
        // Draw goal
        this.drawGoal();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
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
        
        this.ctx.fillStyle = '#ff6b6b';
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
        // Simple maze pattern - 0 = path, 1 = wall
        const maze = [];
        for (let y = 0; y < this.height; y++) {
            maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Create border walls
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    maze[y][x] = 1; // Wall
                } else {
                    // Create some internal walls for maze-like structure
                    maze[y][x] = (x + y) % 3 === 0 ? 1 : 0;
                }
            }
        }
        
        // Ensure start and end are clear
        maze[1][1] = 0; // Start position
        maze[this.height - 2][this.width - 2] = 0; // Goal position
        
        return maze;
    }
}

class Ball {
    constructor() {
        this.x = 1; // Start position
        this.y = 1;
        this.speed = 200;
    }

    updatePosition(direction, deltaTime) {
        const movement = this.speed * deltaTime / 1000;
        
        switch (direction) {
            case 'up':
                this.y -= movement / 40; // Convert to grid units
                break;
            case 'down':
                this.y += movement / 40;
                break;
            case 'left':
                this.x -= movement / 40;
                break;
            case 'right':
                this.x += movement / 40;
                break;
        }
        
        // Clamp to maze bounds
        this.x = Math.max(0, Math.min(9, this.x));
        this.y = Math.max(0, Math.min(9, this.y));
    }
}

class InputManager {
    constructor() {
        this.direction = 'none';
        this.setupKeyboardControls();
        this.setupTouchControls();
        
        // Setup gyroscope controls for mobile devices
        if (window.matchMedia('(pointer: coarse)').matches) {
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

    setupGyroscopeControls() {
        // Check if device orientation is available
        if (typeof DeviceOrientationEvent !== 'undefined') {
            // Request permission for iOS devices
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            this.startGyroscopeListening();
                        }
                    })
                    .catch(console.error);
            } else {
                // Android and other devices
                this.startGyroscopeListening();
            }
        }
    }

    startGyroscopeListening() {
        let lastDirection = 'none';
        let tiltThreshold = 15; // Degrees of tilt required to trigger movement
        
        window.addEventListener('deviceorientation', (event) => {
            // Get device orientation data
            const gamma = event.gamma; // Left-right tilt (-90 to 90)
            const beta = event.beta;   // Front-back tilt (-180 to 180)
            
            // Convert to directions based on tilt
            let direction = 'none';
            
            // Left-right movement (gamma axis)
            if (Math.abs(gamma) > tiltThreshold) {
                if (gamma > 0) {
                    direction = 'right';
                } else {
                    direction = 'left';
                }
            }
            // Front-back movement (beta axis)
            else if (Math.abs(beta) > tiltThreshold) {
                if (beta > 0) {
                    direction = 'down';
                } else {
                    direction = 'up';
                }
            }
            
            // Only update if direction changed to prevent jitter
            if (direction !== lastDirection) {
                this.direction = direction;
                lastDirection = direction;
            }
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