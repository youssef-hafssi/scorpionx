#!/bin/bash

echo "🚀 Pushing changes to GitHub repository..."

# Configure git user (if not already done)
git config --global user.email "youssef_hafssi@emsi-edu.ma"
git config --global user.name "Youssef Hafssi"

# Check current status
echo "📋 Current git status:"
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: enhance product page with size guide and improved layout

- Add size guide section with collapsible interface
- Move product information sections below checkout button
- Add Arabic translation for shipping & returns
- Update footer to center logo and remove unnecessary sections
- Keep only Instagram and TikTok social links
- Add size guide images support (small.jpg, large.jpg, xlarge.jpg, 2xl.jpg)"

# Set up remote if needed (uncomment if first time)
# git remote add origin https://github.com/youssef-hafssi/scorpionx.git
# git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed successfully to https://github.com/youssef-hafssi/scorpionx"
