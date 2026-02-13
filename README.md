# Maze Ball - Cross-Platform Web Game

A fun and addictive maze ball game that works on both desktop and mobile devices!

## 🎮 Game Features

- **Cross-Platform**: Works on desktop (keyboard controls) and mobile (touch controls)
- **Responsive Design**: Adapts to any screen size
- **Smooth Gameplay**: 60fps rendering with smooth ball movement
- **Progressive Difficulty**: Navigate through increasingly challenging mazes
- **Modern UI**: Beautiful gradient design with intuitive controls

## 🕹️ How to Play

### Desktop Controls
- **Arrow Keys** or **WASD**: Move the ball through the maze
- **Goal**: Navigate the red ball to the green square

### Mobile Controls
- **Touch Controls**: Use the on-screen joystick to move
- **Goal**: Navigate the red ball to the green square

## 🚀 Deployment to GitHub Pages

### Quick Setup (Recommended)

1. **Create a GitHub Repository**
   ```bash
   # Create a new repo on GitHub, then:
   git init
   git add .
   git commit -m "Initial commit: Maze Ball game"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your GitHub repository
   - Click **Settings** > **Pages**
   - Under **Build and deployment**, select **Deploy from a branch**
   - Select **main** branch and **/ (root)** directory
   - Click **Save**

3. **Access Your Game**
   - Your game will be available at: `https://your-username.github.io/your-repo-name`

### Manual Configuration

Create a `nojekyll` file to prevent GitHub Pages from processing your files:

```bash
touch nojekyll
git add nojekyll
git commit -m "Add nojekyll for GitHub Pages"
git push
```

## 📁 Project Structure

```
maze-game/
├── index.html      # Main game HTML with start screen
├── game.js         # Core game logic and rendering
├── maze.js         # Maze generation algorithm
├── physics.js      # Ball physics and movement
├── controls.js     # Input handling (keyboard + touch)
└── styles.css      # Game styling and responsive design
```

## 🛠️ Technical Details

- **Language**: Pure JavaScript (ES6+)
- **Rendering**: HTML5 Canvas
- **Controls**: Keyboard (desktop) + Touch (mobile)
- **Performance**: 60fps animation loop
- **Compatibility**: All modern browsers

## 🎯 Browser Support

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Development

To run locally:

1. Clone the repository
2. Open `index.html` in your browser
3. Click "Start Game" to begin!

## 📱 Mobile Optimization

The game automatically detects the device type and shows appropriate controls:
- **Desktop**: Keyboard controls with on-screen instructions
- **Mobile**: Touch controls with joystick interface

## 🔧 Customization

### Change Game Colors
Edit the CSS in `index.html`:
```css
/* Change gradient background */
body {
    background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
}

/* Change ball color */
this.ctx.fillStyle = 'blue';
```

### Adjust Difficulty
Modify maze size in `game.js`:
```javascript
this.mazeGenerator = new MazeGenerator(15, 15); // Larger maze
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

---

**Deployed with GitHub Pages** - Your game will be live and accessible worldwide! 🌍