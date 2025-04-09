#!/bin/bash

# Deploy script for Helpdesk System

echo "Deploying Helpdesk System..."

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

# Create a production package
echo "Creating production package..."
mkdir -p deploy
cp -r server deploy/
cp -r client/build deploy/client
cp package.json deploy/
cp .env deploy/

echo "Deployment package ready in ./deploy directory"
echo "Copy this directory to your server and run 'npm install --production' followed by 'npm start'"
