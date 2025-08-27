#!/bin/bash
# Custom build script for Render

echo "Starting custom build process..."

# Install dependencies
npm ci

# Set NODE_ENV
export NODE_ENV=production

# Build with verbose logging
npm run build 2>&1 | tee build.log

echo "Build completed!"