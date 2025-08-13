#!/bin/bash

echo "🚀 Pushing all changes to GitHub repository..."

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
git commit -m "feat: complete product page enhancement with dynamic pricing

🎯 Product Page Features:
- Add size guide section with collapsible interface and size images support
- Implement dynamic pricing system (1=220DH, 2=400DH, 3=580DH, 4+=220DH each)
- Add special offer pricing table with real-time updates
- Move product information sections below checkout button
- Add Arabic translation for shipping & returns policy
- Add product info, size guide, and shipping collapsible sections

🎨 UI/UX Improvements:
- Update footer to center logo and remove unnecessary sections
- Keep only Instagram and TikTok social media links
- Add bulk pricing visual indicators and savings messages
- Responsive design for mobile and desktop

🔧 Technical Updates:
- Dynamic price calculation based on quantity
- Real-time price updates with quantity changes
- Support for size guide images (small.jpg, large.jpg, xlarge.jpg, 2xl.jpg)
- Improved product page layout and organization

🔐 Admin System:
- Complete admin authentication system
- Login credentials: adminscorpion@scorpionx.com / admin123
- Protected admin routes with JWT authentication
- Orders and stock management functionality"

# Set up remote if needed (uncomment if first time)
# git remote add origin https://github.com/youssef-hafssi/scorpionx.git
# git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ All changes pushed successfully to https://github.com/youssef-hafssi/scorpionx"
echo "🎉 Repository updated with:"
echo "   - Dynamic pricing system"
echo "   - Enhanced product page"
echo "   - Size guide functionality"
echo "   - Admin authentication"
echo "   - Improved footer design"
