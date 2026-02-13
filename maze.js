class MazeGenerator {
    constructor(width = 10, height = 10) {
        this.width = width;
        this.height = height;
        this.maze = this.generate();
    }

    generate() {
        // Recursive backtracking algorithm implementation
        const maze = Array.from({length: this.height}, () => 
            Array.from({length: this.width}, () => ({
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
            })))
        ;

        const stack = [];
        let startCell = { x: 0, y: 0 };
        maze[startCell.y][startCell.x].visited = true;
        stack.push(startCell);


        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(maze, current);


            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWalls(current, next);
                stack.push(next);
                maze[next.y][next.x].visited = true;
            } else {
                stack.pop();
            }
        }


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