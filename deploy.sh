#!/bin/bash

# Maze Ball Game - GitHub Pages Deployment Script
# This script helps you deploy the game to GitHub Pages

echo "🚀 Maze Ball Game - GitHub Pages Deployment"
echo "============================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if current directory is a git repository
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Maze Ball game"
    git branch -M main
    echo "✅ Git repository initialized."
else
    echo "✅ Git repository already exists."
fi

# Check if remote is set
if [ -z "$(git remote -v)" ]; then
    echo "⚠️  No remote repository configured."
    echo ""
    echo "To deploy to GitHub Pages:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin YOUR_GITHUB_REPO_URL"
    echo "3. Run: ./deploy.sh"
    echo ""
    echo "Example: git remote add origin https://github.com/your-username/maze-ball-game.git"
    exit 1
fi

# Add nojekyll file
if [ ! -f "nojekyll" ]; then
    touch nojekyll
    git add nojekyll
    echo "✅ Added nojekyll file for GitHub Pages."
fi

# Commit any changes
echo "📝 Committing changes..."
git add .
git commit -m "Deploy Maze Ball game to GitHub Pages" || echo "No changes to commit."

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings > Pages"
echo "3. Under 'Build and deployment', select 'Deploy from a branch'"
echo "4. Select 'main' branch and '/ (root)' directory"
echo "5. Click Save"
echo ""
echo "Your game will be available at: https://your-username.github.io/your-repo-name"