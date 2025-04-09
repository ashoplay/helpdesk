#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm (updated to v18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git
# Check node version
node --version

# Install Nginx
sudo apt install -y nginx

# Configure firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
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
mkdir -p /var/www/helpdesk-frontend

# Clone the application (replace with your actual repo URL)
cd /var/www/helpdesk-frontend
git clone https://github.com/yourusername/helpdesk.git .

# Set proper ownership of the application directory
sudo chown -R $(whoami):$(whoami) /var/www/helpdesk-frontend

# Install dependencies
cd client
npm install

# Create .env file for production build
cat > .env.production << EOL
REACT_APP_API_URL=https://support.civet.ikt-fag.no/api
EOL

# Build the React app
npm run build

# Configure Nginx to serve static React files
sudo bash -c 'cat > /etc/nginx/sites-available/helpdesk-frontend << EOL
server {
    listen 80;
    server_name support.YOUR-ALIAS.ikt-fag.no;
    root /var/www/helpdesk-frontend/client/build;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    # Proxy API requests to backend server
    location /api {
        proxy_pass http://10.12.49.33:5000;
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
sudo ln -s /etc/nginx/sites-available/helpdesk-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Frontend server setup complete!"
