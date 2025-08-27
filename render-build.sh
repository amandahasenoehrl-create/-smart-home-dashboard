#!/bin/bash
# Custom build script for Render

echo "Starting build process..."

# Install dependencies
npm ci --production=false

# Set environment variables
export NODE_ENV=production
export SKIP_ENV_VALIDATION=1
export NEXTAUTH_URL=https://smart-home-dashboard.onrender.com

# Build the application
echo "Building Next.js app..."
npm run build

echo "Build completed successfully!"