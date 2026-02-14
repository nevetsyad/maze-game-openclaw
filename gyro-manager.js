class GyroManager {
    constructor() {
        this.enabled = false;
        this.sensitivity = 0.3; // Tilt sensitivity multiplier
        this.deadZone = 2; // Degrees of tilt before movement starts
        this.maxTilt = 15; // Maximum tilt angle for full movement
        this.calibrationData = { alpha: 0, beta: 0, gamma: 0 };
        this.isCalibrated = false;
        this.permissionRequested = false;
        this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.android = /Android/.test(navigator.userAgent);
        
        // Movement state
        this.currentMovement = { x: 0, y: 0 };
        this.targetMovement = { x: 0, y: 0 };
        this.movementSmoothing = 0.15; // Smooth movement transitions
        
        // Try to initialize immediately
        this.init();
    }
    
    async init() {
        try {
            console.log('GyroManager initializing...');
            console.log('Device:', this.getDeviceInfo());
            
            // Check if device motion/orientation is supported
            if (!this.isSupported()) {
                console.log('Device motion/orientation not supported');
                return false;
            }
            
            // Request permissions if needed (iOS)
            if (this.iOS && !this.permissionRequested) {
                await this.requestPermission();
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Enable gyroscope controls
            this.enabled = true;
            console.log('Gyroscope controls enabled');
            return true;
            
        } catch (error) {
            console.error('Error initializing GyroManager:', error);
            return false;
        }
    }
    
    isSupported() {
        return (
            'DeviceOrientationEvent' in window ||
            'DeviceMotionEvent' in window
        );
    }
    
    getDeviceInfo() {
        let deviceType = 'unknown';
        if (this.iOS) deviceType = 'iOS';
        else if (this.android) deviceType = 'Android';
        else deviceType = 'Desktop';
        
        return {
            type: deviceType,
            hasOrientation: 'DeviceOrientationEvent' in window,
            hasMotion: 'DeviceMotionEvent' in window,
            userAgent: navigator.userAgent
        };
    }
    
    async requestPermission() {
        if (!this.iOS) return true;
        
        try {
            console.log('Requesting device motion permission for iOS...');
            
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission();
                this.permissionRequested = true;
                
                if (permission === 'granted') {
                    console.log('Device motion permission granted');
                    return true;
                } else {
                    console.log('Device motion permission denied');
                    return false;
                }
            } else {
                // Non-iOS or older iOS versions
                this.permissionRequested = true;
                return true;
            }
        } catch (error) {
            console.error('Error requesting device motion permission:', error);
            this.permissionRequested = true;
            return false;
        }
    }
    
    setupEventListeners() {
        // Use deviceorientation for tilt-based control
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (event) => {
                this.handleDeviceOrientation(event);
            });
        }
        
        // Fallback to devicemotion for acceleration data
        else if ('DeviceMotionEvent' in window) {
            window.addEventListener('devicemotion', (event) => {
                this.handleDeviceMotion(event);
            });
        }
        
        // Handle visibility changes to pause/resume when app is backgrounded
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    handleDeviceOrientation(event) {
        if (!this.enabled) return;
        
        const { alpha, beta, gamma } = event;
        
        // Filter out invalid data
        if (alpha === null || beta === null || gamma === null) return;
        
        // Apply calibration if available
        const calibratedBeta = beta - (this.isCalibrated ? this.calibrationData.beta : 0);
        const calibratedGamma = gamma - (this.isCalibrated ? this.calibrationData.gamma : 0);
        
        // Convert tilt to movement
        this.calculateMovement(calibratedBeta, calibratedGamma);
    }
    
    handleDeviceMotion(event) {
        if (!this.enabled) return;
        
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;
        
        const { x, y, z } = acceleration;
        
        // Use acceleration data as fallback for tilt calculation
        const beta = Math.atan2(x, z) * (180 / Math.PI); // Front/back tilt
        const gamma = Math.atan2(y, z) * (180 / Math.PI); // Left/right tilt
        
        this.calculateMovement(beta, gamma);
    }
    
    calculateMovement(beta, gamma) {
        // Calculate tilt strength with dead zone
        const tiltX = Math.max(0, Math.abs(gamma) - this.deadZone) / (this.maxTilt - this.deadZone);
        const tiltY = Math.max(0, Math.abs(beta) - this.deadZone) / (this.maxTilt - this.deadZone);
        
        // Determine movement direction based on tilt direction
        let moveX = 0;
        let moveY = 0;
        
        if (Math.abs(gamma) > this.deadZone) {
            moveX = gamma > 0 ? tiltX : -tiltX;
        }
        
        if (Math.abs(beta) > this.deadZone) {
            moveY = beta > 0 ? tiltY : -tiltY;
        }
        
        // Apply sensitivity multiplier
        this.targetMovement = {
            x: moveX * this.sensitivity,
            y: moveY * this.sensitivity
        };
    }
    
    updateMovement() {
        // Smooth movement transitions
        this.currentMovement.x += (this.targetMovement.x - this.currentMovement.x) * this.movementSmoothing;
        this.currentMovement.y += (this.targetMovement.y - this.currentMovement.y) * this.movementSmoothing;
        
        return this.currentMovement;
    }
    
    getMovement() {
        return this.currentMovement;
    }
    
    calibrate() {
        // Reset calibration data
        this.calibrationData = { alpha: 0, beta: 0, gamma: 0 };
        this.isCalibrated = false;
        
        // Get current orientation as calibration baseline
        if ('DeviceOrientationEvent' in window) {
            const event = {
                alpha: 0,
                beta: 0,
                gamma: 0
            };
            
            // Try to get current orientation
            if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
                // For iOS, we might need to trigger a permission request first
                console.log('Calibration - requesting permission...');
            } else {
                // Use current device orientation if available
                if (window.deviceOrientation) {
                    event.alpha = window.deviceOrientation.alpha || 0;
                    event.beta = window.deviceOrientation.beta || 0;
                    event.gamma = window.deviceOrientation.gamma || 0;
                }
            }
            
            this.calibrationData = {
                alpha: event.alpha || 0,
                beta: event.beta || 0,
                gamma: event.gamma || 0
            };
            
            this.isCalibrated = true;
            console.log('Gyroscope calibrated:', this.calibrationData);
        }
    }
    
    pause() {
        this.enabled = false;
        this.currentMovement = { x: 0, y: 0 };
        this.targetMovement = { x: 0, y: 0 };
        console.log('Gyroscope paused');
    }
    
    resume() {
        if (this.enabled) {
            this.enabled = true;
            console.log('Gyroscope resumed');
        }
    }
    
    setSensitivity(sensitivity) {
        this.sensitivity = Math.max(0.1, Math.min(1.0, sensitivity));
        console.log('Gyroscope sensitivity set to:', this.sensitivity);
    }
    
    setDeadZone(deadZone) {
        this.deadZone = Math.max(0, Math.min(10, deadZone));
        console.log('Gyroscope dead zone set to:', this.deadZone);
    }
    
    setMaxTilt(maxTilt) {
        this.maxTilt = Math.max(5, Math.min(45, maxTilt));
        console.log('Gyroscope max tilt set to:', this.maxTilt);
    }
    
    // Utility method to check if gyroscope is working
    testConnection() {
        if (!this.enabled) {
            return { supported: false, enabled: false, reason: 'Not enabled' };
        }
        
        return {
            supported: this.isSupported(),
            enabled: this.enabled,
            iOS: this.iOS,
            android: this.android,
            movement: this.currentMovement,
            hasRecentData: Math.abs(this.currentMovement.x) > 0.01 || Math.abs(this.currentMovement.y) > 0.01
        };
    }
}

export { GyroManager };