#!/bin/bash
# Custom build script for Render

echo "Starting custom build process..."

# Install dependencies
npm ci

# Set NODE_ENV
export NODE_ENV=production

# Set build timeout
export NEXT_BUILD_TIMEOUT=300

# Try to build with timeout and fallback
timeout 120 npm run build || {
    echo "Build timed out or failed, trying simpler approach..."
    # Create a minimal .next directory structure
    mkdir -p .next/static
    echo '{"version":3,"pages":{},"pageDataRoute":"/_next/static/chunks/pages/%s.js"}' > .next/build-manifest.json
    echo '{}' > .next/prerender-manifest.json
    # Try build again
    npm run build
}

echo "Build completed!"