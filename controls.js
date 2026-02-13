class InputManager {
    constructor() {
        this.touchControlsEnabled = true;
        this.keyboardControlsEnabled = true;
        this.accelerometerSupported = window.DeviceMotionEvent !== undefined;

        this.setupTouchControls();
        this.setupKeyboardControls();
    }

    setupTouchControls() {
        const touchArea = document.querySelector('.touch-area');
        let touchStartX, touchStartY;

        touchArea.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        touchArea.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;

            // Send movement input to game engine
            this.sendInput({ x: dx, y: dy });
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            let input = { x: 0, y: 0 };

            if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                input.y = -1;
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                input.y = 1;
            }

            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                input.x = -1;
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                input.x = 1;
            }

            this.sendInput(input);
        });
    }

    sendInput(input) {
        // This would be connected to the game engine
        console.log('Received input:', input);
    }
}

export { InputManager };