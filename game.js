class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
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
        this.mazeGenerator = new MazeGenerator(10, 10);
        this.maze = this.mazeGenerator.generate();
        this.ball = new Ball();
        this.inputManager = new InputManager();
        this.gameStarted = true;
        requestAnimationFrame(() => this.gameLoop());
    }

    gameLoop() {
        if (!this.gameStarted) return;
        
        const deltaTime = 1000 / 60; // 60fps
        this.inputManager.getInput();
        this.ball.updatePosition(this.inputManager.direction, deltaTime);
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze walls
        this.maze.walls.forEach(wall => {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, 15, 0, Math.PI*2);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
        
        // Draw goal
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.maze.goal.x, this.maze.goal.y, 20, 20);
    }
}

// Start button functionality
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const controlsInfo = document.getElementById('controlsInfo');
    const mobileControls = document.getElementById('mobileControls');
    
    startButton.addEventListener('click', function() {
        // Hide start screen
        startScreen.classList.add('hidden');
        
        // Show game elements
        gameCanvas.classList.remove('hidden');
        controlsInfo.classList.remove('hidden');
        
        // Show mobile controls on mobile devices
        if (window.matchMedia('(pointer: coarse)').matches) {
            mobileControls.style.display = 'block';
        }
        
        // Initialize game
        window.mazeGame = new MazeGame();
    });
});

// Maze generator class
class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // Simple grid-based maze generation
        const walls = [];
        
        // Create vertical walls
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                // Add vertical wall between cells
                if (x < this.width - 1) {
                    walls.push({
                        x: x * 32 + 16, // Assuming 32px cell size
                        y: y *32,
                        width: 1, // Thin wall
                        height: 32
                    });
                }
                
                // Add horizontal wall between cells
                if (y < this.height - 1) {
                    walls.push({
                        x: x *32,
                        y: y *32 + 16, // Middle of cell
                        width: 32,
                        height: 1 // Thin wall
                    });
                }
            }
        }
        
        return {
            walls: walls
        };
    }
}

class Ball {
    constructor() {
        this.x = 16;
        this.y = 16;
        this.speed = 200;
    }

    updatePosition(direction, deltaTime) {
        switch (direction) {
            case 'up':
                this.y -= this.speed * deltaTime/1000;
                break;
            case 'down':
                this.y += this.speed * deltaTime/1000;
                break;
            case 'left':
                this.x -= this.speed * deltaTime/1000;
                break;
            case 'right':
                this.x += this.speed * deltaTime/1000;
                break;
            default:
                // No movement
        }
    }
}

class InputManager {
    constructor() {
        this.direction = 'none'; // Can be 'up', 'down', 'left', 'right', or 'none'
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Add touch and keyboard event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Touch input for mobile
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        
        document.addEventListener('touchmove', (e) => {
            const moveX = e.touches[0].clientX - this.touchStartX;
            const moveY = e.touches[0].clientY - this.touchStartY;
            
            if (Math.abs(moveX) > Math.abs(moveY)) {
                // Horizontal movement
                if (moveX > 0) {
                    this.direction = 'right';
                } else {
                    this.direction = 'left';
                }
            } else {
                // Vertical movement
                if (moveY > 0) {
                    this.direction = 'down';
                } else {
                    this.direction = 'up';
                }
            }
            
            // Update touch start for next move
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });
        
        // Keyboard input for desktop
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.direction = 'up';
                    break;
                case 'ArrowDown':
                    this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    this.direction = 'left';
                    break;
                case 'ArrowRight':
                    this.direction = 'right';
                    break;
                default:
                    this.direction = 'none';
            }
        });
    }

    getInput() {
        return this.direction;
    }
}

// Initialize the game
// Removed automatic game initialization on load
// window.addEventListener('load', () => {
//     new MazeGame();
// });