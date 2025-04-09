#!/bin/bash

# This script fixes permissions and Node.js version for the helpdesk frontend

echo "Fixing permissions for helpdesk frontend..."

# Fix directory permissions
sudo chown -R $(whoami):$(whoami) /var/www/helpdesk-frontend

# Update Node.js to v18
echo "Updating Node.js to v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js version
echo "Node.js version:"
node --version

echo "Now try running 'npm install' again in your client directory"
