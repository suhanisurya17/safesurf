#!/bin/bash

# Build script for SwipeSleuth project

set -e

echo "Building SwipeSleuth..."

# Build web app
echo "Building web application..."
cd web
npm install
npm run build
cd ..

# Create extension package directory
echo "Preparing extension package..."
mkdir -p dist/extension
cp -r extension/* dist/extension/

# Copy web build to extension if needed (for popup)
# Uncomment if you want to embed the web app in extension
# cp -r web/dist/* dist/extension/web/

echo "Build complete!"
echo "Web build: web/dist/"
echo "Extension: dist/extension/"

