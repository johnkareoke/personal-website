# Deployment Guide

This guide explains how to deploy your personal website to a virtual server using GitHub Actions and Caddy.

## Prerequisites

- Virtual server with Docker and Docker Compose installed
- Caddy web server installed
- Domain `archive.johncarolin.com` pointing to your server

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 2. Install Caddy

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Start and enable Caddy
sudo systemctl start caddy
sudo systemctl enable caddy
```

### 3. Create Application Directory

```bash
# Create app directory
sudo mkdir -p /opt/apps
sudo chown $USER:$USER /opt/apps
cd /opt/apps

# Copy production docker-compose file
# (You'll need to copy docker-compose.prod.yml to this directory)
```

### 4. Configure Caddy

```bash
# Copy Caddyfile to Caddy config directory
sudo cp Caddyfile /etc/caddy/sites/

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

## GitHub Actions Setup

### 1. Repository Secrets

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

- `SERVER_SSH_KEY`: Your private SSH key for server access
- `SERVER_HOST`: Your server's IP address or hostname
- `SERVER_USER`: Username for SSH access (usually your server username)

### 2. Generate SSH Key Pair

```bash
# On your local machine, generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions-deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github-actions-deploy.pub user@your-server

# Copy private key content to GitHub secret SERVER_SSH_KEY
cat ~/.ssh/github-actions-deploy
```

## Deployment Process

### 1. Automatic Deployment

The GitHub Action will automatically:
1. Build the Docker image when you push to `main` branch
2. Push the image to GitHub Container Registry (GHCR)
3. Deploy to your server via SSH
4. Restart the container with the new image

### 2. Manual Deployment

You can also trigger deployment manually:
1. Go to your GitHub repository
2. Click `Actions` tab
3. Select `Build and Deploy Personal Website`
4. Click `Run workflow`

### 3. Server Deployment Commands

The action will run these commands on your server:

```bash
cd /opt/apps
docker compose pull personal-website
docker compose up -d personal-website
docker image prune -f
```

## Monitoring and Maintenance

### 1. Check Container Status

```bash
cd /opt/apps
docker compose ps
docker compose logs personal-website
```

### 2. Check Caddy Status

```bash
sudo systemctl status caddy
sudo journalctl -u caddy -f
```

### 3. View Application Logs

```bash
# Container logs
docker logs personalwebsite-website-1

# Caddy access logs
sudo tail -f /var/log/caddy/archive.johncarolin.com.log
```

### 4. Health Checks

The application includes health checks:
- Container health check: `/api/posts` endpoint
- Caddy health check: Monitors the reverse proxy

## Troubleshooting

### Common Issues

1. **Container won't start**: Check logs with `docker compose logs personal-website`
2. **Caddy won't start**: Validate config with `sudo caddy validate --config /etc/caddy/Caddyfile`
3. **Permission denied**: Ensure proper ownership of `/opt/apps` directory
4. **Port conflicts**: Ensure port 5001 is available on localhost

### Rollback

If deployment fails, you can rollback:

```bash
cd /opt/apps
docker compose down
docker compose up -d personal-website:previous-tag
```

## Security Considerations

- The Flask app only binds to localhost (127.0.0.1:5001)
- Caddy handles all external connections
- Security headers are configured in Caddy
- SSH key authentication for deployment
- Health checks ensure service availability

## Performance

- Static assets are cached for 1 year
- HTML files are not cached for dynamic content
- Gzip compression enabled
- Health checks every 30 seconds
- Automatic container restart on failure
