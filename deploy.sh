#!/bin/bash
# Production deployment script for mixtape-battle
# Run this on the production server after GitHub Actions builds the image

set -e  # Exit on error

REPO="ghcr.io/capnsecurity/mixtape-battle"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.production.yml"

echo "🚀 Mixtape Battle - Production Deployment"
echo "=========================================="
echo ""

# Check if running in correct directory
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found"
    echo "Please run this script from the mixtape-battle directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: $ENV_FILE not found"
    echo "Make sure environment variables are configured"
fi

# Pull latest code from git
echo "📥 Pulling latest code from GitHub..."
git fetch origin
git pull origin main
echo "✅ Code updated"
echo ""

# Login to GitHub Container Registry (if needed)
echo "🔐 Logging into GitHub Container Registry..."
echo "Enter your GitHub Personal Access Token (PAT) with read:packages permission:"
echo "(or press Enter to skip if already logged in)"
read -s GITHUB_TOKEN
if [ ! -z "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u $(git config user.name) --password-stdin
    echo "✅ Logged in to registry"
else
    echo "⏭️  Skipped login"
fi
echo ""

# Pull latest Docker image
echo "🐳 Pulling latest Docker image..."
docker pull $REPO:latest
echo "✅ Image pulled"
echo ""

# Stop current containers
echo "🛑 Stopping current containers..."
docker compose -f $COMPOSE_FILE down
echo "✅ Containers stopped"
echo ""

# Start new containers
echo "🚀 Starting new containers..."
docker compose -f $COMPOSE_FILE up -d
echo "✅ Containers started"
echo ""

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker compose -f $COMPOSE_FILE ps
echo ""

# Run health check
echo "🏥 Running health check..."
if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check endpoint not responding yet (this may be normal during startup)"
fi
echo ""

# Display logs
echo "📝 Recent logs:"
docker compose -f $COMPOSE_file logs --tail=20 app
echo ""

echo "=========================================="
echo "✨ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Test the application at https://mixtape.levesques.net"
echo "2. Check logs if needed: docker compose -f $COMPOSE_FILE logs -f app"
echo "3. Rollback if issues: docker compose -f $COMPOSE_FILE down && docker compose -f $COMPOSE_FILE up -d"
echo ""
