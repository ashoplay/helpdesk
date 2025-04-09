#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2 for process management
sudo npm install pm2 -g

# Install Nginx
sudo apt install -y nginx

# Configure firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow from 10.12.49.34 to any port 5000
sudo ufw allow from 127.0.0.1 to any port 5000
sudo ufw deny from any to any port 5000
sudo ufw allow from 10.12.49.35 to any port 27017
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

# Create app directory
mkdir -p /var/www/helpdesk

# Clone the application (replace with your actual repo URL)
cd /var/www/helpdesk
git clone https://github.com/yourusername/helpdesk.git .

# Install dependencies
npm install

# Create environment file
cat > .env << EOL
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://10.12.49.35:27017/helpdesk
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
EOL

# Build the app
npm run build

# Set up PM2 to manage the Node process
pm2 start server.js --name "helpdesk-api"
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# Configure Nginx as a reverse proxy
sudo bash -c 'cat > /etc/nginx/sites-available/helpdesk << EOL
server {
    listen 80;
    server_name support.YOUR-ALIAS.ikt-fag.no;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL'

# Enable the Nginx site
sudo ln -s /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Backend server setup complete!"
