#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install libssl1.1 dependency (required for MongoDB)
echo "Installing libssl1.1 dependency..."
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
rm libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Verify MongoDB installation succeeded
if [ $? -ne 0 ]; then
    echo "MongoDB installation failed. Exiting."
    exit 1
fi

# Check if MongoDB config file exists before modifying
if [ -f /etc/mongod.conf ]; then
    # Configure MongoDB to only bind to specific IPs
    sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 127.0.0.1,10.12.49.35/' /etc/mongod.conf
else
    echo "Error: MongoDB configuration file not found at /etc/mongod.conf"
    echo "Check if MongoDB was installed correctly."
    exit 1
fi

# Ensure MongoDB data and log directories exist with correct permissions
echo "Setting up MongoDB directories..."
sudo mkdir -p /var/lib/mongodb
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chmod 755 /var/lib/mongodb
sudo chmod 755 /var/log/mongodb

# Fix the MongoDB configuration - append security settings properly
# Replace the current authentication block with this:
echo "Configuring MongoDB security settings..."
sudo bash -c 'cat > /tmp/mongodb_security.conf << EOL
security:
  authorization: enabled
EOL'
sudo bash -c 'cat /tmp/mongodb_security.conf >> /etc/mongod.conf'
rm /tmp/mongodb_security.conf

# Verify mongod.conf is correctly formatted
echo "Verifying MongoDB configuration..."
if ! sudo grep -q "security:" /etc/mongod.conf; then
    echo "Error: Security configuration not properly added to mongod.conf"
    exit 1
fi

# Configure MongoDB data directory path correctly
echo "Checking MongoDB directory configuration..."
DBPATH=$(grep -A1 "storage:" /etc/mongod.conf | grep "dbPath:" | awk '{print $2}')
if [ -z "$DBPATH" ]; then
    DBPATH="/var/lib/mongodb"
    echo "Using default database path: $DBPATH"
else
    echo "Found configured database path: $DBPATH"
fi

# Make sure MongoDB directories exist with correct permissions
echo "Setting up MongoDB directories..."
sudo mkdir -p $DBPATH
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb $DBPATH
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chmod 755 $DBPATH
sudo chmod 755 /var/log/mongodb

# Check system limits
echo "Checking system limits for MongoDB..."
sudo bash -c 'cat > /etc/security/limits.d/mongodb.conf << EOL
mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc 32000
mongodb hard nproc 32000
EOL'

# Perform thorough repair
echo "Performing thorough MongoDB database repair..."
sudo systemctl stop mongod
sudo rm -f $DBPATH/mongod.lock
sudo -u mongodb mongod --repair --dbpath $DBPATH

# Start MongoDB with verbose logging
echo "Starting MongoDB with additional diagnostics..."
sudo systemctl start mongod
if [ $? -ne 0 ]; then
    echo "MongoDB failed to start. Checking detailed logs..."
    echo "--- Last 50 lines of MongoDB log ---"
    sudo cat /var/log/mongodb/mongod.log | tail -n 50
    echo "--- System journal logs for MongoDB ---"
    sudo journalctl -u mongod -n 50
    echo "ERROR: MongoDB failed to start. Please check the logs above for specific errors."
    exit 1
else
    echo "MongoDB successfully started!"
fi

# Verify MongoDB is running
if ! sudo systemctl status mongod > /dev/null; then
    echo "ERROR: MongoDB failed to start even after repair attempts."
    echo "Check MongoDB logs for more details: sudo journalctl -u mongod"
    exit 1
else
    echo "MongoDB successfully started!"
fi

# Configure firewall - only allow connections from backend
sudo ufw allow ssh
sudo ufw allow from 10.12.49.33 to any port 27017
sudo ufw deny from any to any port 27017
sudo ufw enable

# Set up SSH match blocks for security
sudo bash -c 'cat > /etc/ssh/sshd_config.d/match-blocks.conf << EOL
# Allow SSH only from specific IPs for admin users
Match User admin
    PasswordAuthentication no
    PubkeyAuthentication yes
    PermitRootLogin no
    AllowUsers admin

# Regular user restrictions
Match Group developers
    PasswordAuthentication yes
    X11Forwarding no
    AllowTcpForwarding no
EOL'

# Restart SSH service
sudo systemctl restart ssh

# Create database user (need to do this manually due to authentication requirements)
echo "Please run these commands to create a database user:"
echo "----------------------------------------------------"
echo "mongo"
echo "use admin"
echo "db.createUser({user: 'admin', pwd: 'secure_password_here', roles: ['root']})"
echo "exit"
echo "mongo -u admin -p secure_password_here --authenticationDatabase admin"
echo "use helpdesk"
echo "db.createUser({user: 'helpdesk_user', pwd: 'another_secure_password', roles: [{role: 'readWrite', db: 'helpdesk'}]})"
echo "exit"
echo "----------------------------------------------------"

echo "Database server setup complete!"
