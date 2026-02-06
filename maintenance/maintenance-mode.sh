#!/bin/bash

# Maintenance Mode Toggle Script for Mixtape Battle
# Usage: ./maintenance-mode.sh on  OR  ./maintenance-mode.sh off

APP_CONTAINER="app"
MAINTENANCE_CONTAINER="maintenance"
PORT="3000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAINTENANCE_HTML="$SCRIPT_DIR/index.html"

enable_maintenance() {
    echo ""
    echo -e "\033[1;33m🔧 Enabling maintenance mode...\033[0m"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Stop the app container
    echo -e "\n\033[1;36m1. Stopping application...\033[0m"
    if docker stop $APP_CONTAINER 2>/dev/null; then
        echo -e "   \033[1;32m✅ Application stopped\033[0m"
    else
        echo -e "   \033[1;33m⚠️  Application container not found or already stopped\033[0m"
    fi
    
    # Start maintenance container
    echo -e "\n\033[1;36m2. Starting maintenance page...\033[0m"
    if docker run -d --name $MAINTENANCE_CONTAINER -p "$PORT:80" nginx:alpine >/dev/null 2>&1; then
        echo -e "   \033[1;32m✅ Maintenance container started\033[0m"
    else
        echo -e "   \033[1;31m❌ Failed to start maintenance container\033[0m"
        return 1
    fi
    
    # Copy maintenance page
    echo -e "\n\033[1;36m3. Deploying maintenance page...\033[0m"
    if [ -f "$MAINTENANCE_HTML" ]; then
        docker cp "$MAINTENANCE_HTML" "$MAINTENANCE_CONTAINER:/usr/share/nginx/html/index.html" 2>/dev/null
        echo -e "   \033[1;32m✅ Custom maintenance page deployed\033[0m"
    else
        echo -e "   \033[1;33m⚠️  Custom page not found, using default\033[0m"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\033[1;42m✅ MAINTENANCE MODE ENABLED\033[0m"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\n\033[1;36m🌐 View at: http://localhost:$PORT\033[0m"
    echo -e "\033[0;90m📝 To restore: ./maintenance-mode.sh off\033[0m\n"
}

disable_maintenance() {
    echo ""
    echo -e "\033[1;33m🚀 Disabling maintenance mode...\033[0m"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Stop maintenance container
    echo -e "\n\033[1;36m1. Stopping maintenance page...\033[0m"
    if docker stop $MAINTENANCE_CONTAINER 2>/dev/null; then
        echo -e "   \033[1;32m✅ Maintenance page stopped\033[0m"
    else
        echo -e "   \033[1;33m⚠️  Maintenance container not found\033[0m"
    fi
    
    docker rm $MAINTENANCE_CONTAINER 2>/dev/null
    echo -e "   \033[1;32m✅ Maintenance container removed\033[0m"
    
    # Start app container
    echo -e "\n\033[1;36m2. Starting application...\033[0m"
    if docker start $APP_CONTAINER 2>/dev/null; then
        echo -e "   \033[1;32m✅ Application started\033[0m"
        
        echo -e "\n\033[1;36m3. Waiting for application to be ready...\033[0m"
        sleep 2
        echo -e "   \033[1;32m✅ Application should be ready\033[0m"
    else
        echo -e "   \033[1;31m❌ Failed to start application\033[0m"
        echo -e "   \033[1;33m💡 Try: docker start $APP_CONTAINER\033[0m"
        return 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\033[1;42m✅ SITE IS BACK ONLINE\033[0m"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\n\033[1;36m🌐 Visit: http://localhost:$PORT\033[0m\n"
}

show_status() {
    echo ""
    echo -e "\033[1;36m📊 Current Status:\033[0m"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    app_running=$(docker ps --filter "name=$APP_CONTAINER" --format "{{.Names}}" 2>/dev/null)
    maintenance_running=$(docker ps --filter "name=$MAINTENANCE_CONTAINER" --format "{{.Names}}" 2>/dev/null)
    
    if [ -n "$app_running" ]; then
        echo -e "\033[1;32m🟢 Application: RUNNING\033[0m"
    else
        echo -e "\033[1;31m🔴 Application: STOPPED\033[0m"
    fi
    
    if [ -n "$maintenance_running" ]; then
        echo -e "\033[1;33m🟡 Maintenance: ACTIVE\033[0m"
    else
        echo -e "\033[0;37m⚪ Maintenance: INACTIVE\033[0m"
    fi
    
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
}

# Main execution
case "$1" in
    on|ON|enable)
        enable_maintenance
        show_status
        ;;
    off|OFF|disable)
        disable_maintenance
        show_status
        ;;
    status)
        show_status
        ;;
    *)
        echo ""
        echo -e "\033[1;31m❌ Error: Please specify on or off\033[0m"
        echo ""
        echo -e "\033[1;33mUsage:\033[0m"
        echo -e "  \033[1;36m./maintenance-mode.sh on\033[0m   # Enable maintenance mode"
        echo -e "  \033[1;36m./maintenance-mode.sh off\033[0m  # Disable maintenance mode"
        echo -e "  \033[1;36m./maintenance-mode.sh status\033[0m  # Show current status"
        echo ""
        show_status
        ;;
esac
