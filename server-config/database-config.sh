#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Configure MongoDB to only bind to specific IPs
sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 127.0.0.1,10.12.49.35/' /etc/mongod.conf

# Enable MongoDB authentication
sudo bash -c 'cat >> /etc/mongod.conf << EOL
security:
  authorization: enabled
EOL'

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

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
