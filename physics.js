class Ball {
    constructor() {
        this.radius = 10;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
    }

    updatePosition(input, deltaTime) {
        // Basic physics simulation with collision detection
        const acceleration = 0.1;
        this.velocity.y += acceleration * deltaTime;
        
        // Apply input
        if (input) {
            this.position.x += input.x * deltaTime;
            this.position.y += input.y * deltaTime;
        }

        // Simple collision detection with maze boundaries
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x *= -0.5; // Bounce with damping
        }

        if (this.position.x > canvas.width) {
            this.position.x = canvas.width;
            this.velocity.x *= -0.5;
        }

        // Add more collision detection with maze walls here
    }
}

export { Ball };