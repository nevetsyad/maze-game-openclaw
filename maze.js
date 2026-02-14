class MazeGenerator {
    constructor(width = 10, height = 10) {
        this.width = width;
        this.height = height;
        this.maze = this.generate();
    }

    generate() {
        // Create a simple maze with guaranteed path from start to goal
        // 0 = path, 1 = wall
        const maze = Array.from({length: this.height}, () => 
            Array.from({length: this.width}, () => 1)
        );
        
        // Create guaranteed path from start to goal
        // Simple horizontal then vertical path
        for (let x = 0; x < this.width; x++) {
            maze[0][x] = 0; // Top row path
        }
        for (let y = 0; y < this.height; y++) {
            maze[y][this.width - 1] = 0; // Right column path
        }
        
        // Add some additional paths to make it more interesting
        for (let i = 0; i < Math.floor(this.width * this.height * 0.3); i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            maze[y][x] = 0;
        }
        
        // Ensure start and goal positions are clear
        maze[0][0] = 0; // Start position
        maze[this.height - 1][this.width - 1] = 0; // Goal position
        
        return maze;
    }


    getUnvisitedNeighbors(maze, cell) {
        const { x, y } = cell;
        const neighbors = [];

        // Check all four directions
        if (x > 0 && !maze[y][x-1].visited) neighbors.push({ x: x-1, y });
        if (x < this.width - 1 && !maze[y][x+1].visited) neighbors.push({ x: x+1, y });
        if (y > 0 && !maze[y-1][x].visited) neighbors.push({ x, y: y-1 });
        if (y < this.height - 1 && !maze[y+1][x].visited) neighbors.push({ x, y: y+1 });

        return neighbors;
    }

    removeWalls(cellA, cellB) {
        const dx = cellB.x - cellA.x;
        const dy = cellB.y - cellA.y;

        // Remove wall between cellA and cellB
        if (dx === 1) {
            // CellA is to the left of cellB
            maze[cellA.y][cellA.x].walls.right = false;
            maze[cellB.y][cellB.x].walls.left = false;
        } else if (dx === -1) {
            // CellA is to the right of cellB
            maze[cellA.y][cellA.x].walls.left = false;
            maze[cellB.y][cellB.x].walls.right = false;
        } else if (dy === 1) {
            // CellA is above cellB
            maze[cellA.y][cellA.x].walls.bottom = false;
            maze[cellB.y][cellB.x].walls.top = false;
        } else if (dy === -1) {
            // CellA is below cellB
            maze[cellA.y][cellA.x].walls.top = false;
            maze[cellB.y][cellB.x].walls.bottom = false;
        }
    }
}

// Export for use in game.js
export { MazeGenerator };