#!/bin/bash

# Clean restart - remove existing MongoDB installation
echo "Cleaning previous installation..."
sudo systemctl stop mongod
sudo apt purge -y mongodb-org*
sudo rm -rf /var/lib/mongodb
sudo rm -rf /var/log/mongodb
sudo rm -f /etc/mongod.conf

# System diagnostics - check for common issues
echo "Running system diagnostics..."
echo "- Disk space:"
df -h
echo "- Memory:"
free -m
echo "- AppArmor status:"
sudo aa-status || echo "AppArmor not installed"

# Install libssl1.1 dependency
echo "Installing dependencies..."
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
rm libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Install MongoDB (fresh)
echo "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Create data directories with proper permissions
echo "Setting up directories..."
sudo mkdir -p /var/lib/mongodb
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chmod 755 /var/lib/mongodb
sudo chmod 755 /var/log/mongodb

# Update MongoDB configuration - simplified version
echo "Configuring MongoDB (simplified)..."
sudo bash -c 'cat > /etc/mongod.conf << EOL
storage:
  dbPath: /var/lib/mongodb
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
net:
  port: 27017
  bindIp: 127.0.0.1
EOL'

# Try to start MongoDB with minimal configuration first
echo "Attempting to start MongoDB with minimal configuration..."
sudo systemctl start mongod
sudo systemctl status mongod --no-pager

# Check if MongoDB started with minimal config
if systemctl is-active --quiet mongod; then
    echo "Basic MongoDB instance started successfully. Adding more configuration..."
    
    # Now update to full configuration
    sudo systemctl stop mongod
    
    sudo bash -c 'cat > /etc/mongod.conf << EOL
# mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1,10.12.49.35
security:
  authorization: enabled
EOL'
    
    sudo systemctl start mongod
    sudo systemctl enable mongod
    sudo systemctl status mongod --no-pager
else
    echo "MongoDB failed to start with minimal config. Trying manual start..."
    sudo -u mongodb mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
    
    echo "Checking MongoDB logs:"
    echo "======================="
    if [ -f /var/log/mongodb/mongod.log ]; then
        tail -n 50 /var/log/mongodb/mongod.log
    else
        echo "Log file not found!"
    fi
    
    echo "Trying alternative MongoDB version (4.4)..."
    sudo apt purge -y mongodb-org*
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
    sudo apt update
    sudo apt install -y mongodb-org
    
    # Configure for 4.4
    sudo mkdir -p /var/lib/mongodb
    sudo mkdir -p /var/log/mongodb
    sudo chown -R mongodb:mongodb /var/lib/mongodb
    sudo chown -R mongodb:mongodb /var/log/mongodb
    
    sudo bash -c 'cat > /etc/mongod.conf << EOL
# mongod.conf - 4.4 version
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
EOL'
    
    echo "Starting MongoDB 4.4..."
    sudo systemctl start mongod
    sudo systemctl status mongod --no-pager
fi

# Display diagnostic information
echo "===== DIAGNOSTIC INFORMATION ====="
echo "1. System information:"
uname -a

echo "2. MongoDB package information:"
dpkg -l | grep mongodb

echo "3. MongoDB process check:"
ps aux | grep mongo

echo "4. MongoDB log content (last 20 lines):"
if [ -f /var/log/mongodb/mongod.log ]; then
    tail -n 20 /var/log/mongodb/mongod.log
else
    echo "MongoDB log file not found!"
fi

echo "5. Suggested troubleshooting:"
echo "   - Check system requirements: https://www.mongodb.com/docs/v5.0/administration/production-notes/"
echo "   - Try starting MongoDB manually: sudo -u mongodb mongod --dbpath /var/lib/mongodb"
echo "   - Check for additional errors: sudo journalctl -u mongod"

echo "6. Alternative setup command (try if everything else fails):"
echo "   sudo apt install -y mongodb"
echo "   (This installs the default Ubuntu MongoDB package instead of official MongoDB packages)"
