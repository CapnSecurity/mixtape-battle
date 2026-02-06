#!/bin/bash
# Nginx-based maintenance mode toggle for Mixtape Battle
# This is SAFE for production - it does NOT stop the app container

NGINX_CONTAINER="mixtape-nginx"
MAINTENANCE_FLAG="/usr/share/nginx/html/.maintenance"
MAINTENANCE_HTML="/usr/share/nginx/html/maintenance.html"
LOCAL_MAINTENANCE_HTML="./nginx/maintenance.html"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

show_status() {
    echo -e "\n${CYAN}📊 Maintenance Mode Status${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check if nginx container is running
    if ! docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>/dev/null | grep -q "$NGINX_CONTAINER"; then
        echo -e "${RED}❌ ERROR: Nginx container not running!${NC}\n"
        return 1
    fi
    
    echo -e "${GREEN}✓ Nginx container: RUNNING${NC}"
    
    # Check if maintenance flag exists
    if docker exec "$NGINX_CONTAINER" test -f "$MAINTENANCE_FLAG" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Maintenance Mode: ACTIVE${NC}"
        echo -e "${GRAY}   Users will see the maintenance page${NC}"
    else
        echo -e "${GREEN}✓ Maintenance Mode: INACTIVE${NC}"
        echo -e "${GRAY}   Site is operating normally${NC}"
    fi
    
    # Check if app is running
    if docker ps --filter "name=app" --filter "status=running" --format "{{.Names}}" 2>/dev/null | grep -q "^app$"; then
        echo -e "${GREEN}✓ App container: RUNNING${NC}"
    else
        echo -e "${RED}❌ App container: STOPPED${NC}"
    fi
    
    echo ""
}

enable_maintenance() {
    echo -e "\n${YELLOW}🔧 Enabling Maintenance Mode...${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check if nginx container exists
    if ! docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>/dev/null | grep -q "$NGINX_CONTAINER"; then
        echo -e "${RED}❌ ERROR: Nginx container '$NGINX_CONTAINER' not found or not running!${NC}\n"
        return 1
    fi
    
    # Copy maintenance page to nginx if it doesn't exist
    echo -e "${CYAN}📄 Checking maintenance page...${NC}"
    if ! docker exec "$NGINX_CONTAINER" test -f "$MAINTENANCE_HTML" 2>/dev/null; then
        echo -e "${GRAY}   Copying maintenance.html to nginx container...${NC}"
        if [ ! -f "$LOCAL_MAINTENANCE_HTML" ]; then
            echo -e "${RED}❌ ERROR: Local maintenance.html not found at $LOCAL_MAINTENANCE_HTML${NC}\n"
            return 1
        fi
        if docker cp "$LOCAL_MAINTENANCE_HTML" "${NGINX_CONTAINER}:${MAINTENANCE_HTML}" 2>/dev/null; then
            echo -e "${GREEN}   ✓ Maintenance page deployed${NC}"
        else
            echo -e "${RED}   ❌ Failed to copy maintenance page${NC}\n"
            return 1
        fi
    else
        echo -e "${GREEN}   ✓ Maintenance page already exists${NC}"
    fi
    
    # Create maintenance flag file
    echo -e "${CYAN}🚩 Activating maintenance flag...${NC}"
    if docker exec "$NGINX_CONTAINER" touch "$MAINTENANCE_FLAG" 2>/dev/null; then
        echo -e "${GREEN}   ✓ Maintenance flag created${NC}"
    else
        echo -e "${RED}   ❌ Failed to create maintenance flag${NC}\n"
        return 1
    fi
    
    echo -e "\n${GREEN}✅ MAINTENANCE MODE ENABLED${NC}"
    echo -e "${GRAY}   Visitors will now see the maintenance page${NC}"
    echo -e "${GRAY}   App container is still running (safe for production)${NC}\n"
}

disable_maintenance() {
    echo -e "\n${GREEN}🔓 Disabling Maintenance Mode...${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check if nginx container exists
    if ! docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>/dev/null | grep -q "$NGINX_CONTAINER"; then
        echo -e "${RED}❌ ERROR: Nginx container '$NGINX_CONTAINER' not found or not running!${NC}\n"
        return 1
    fi
    
    # Remove maintenance flag file
    echo -e "${CYAN}🚩 Removing maintenance flag...${NC}"
    if docker exec "$NGINX_CONTAINER" rm -f "$MAINTENANCE_FLAG" 2>/dev/null; then
        echo -e "${GREEN}   ✓ Maintenance flag removed${NC}"
    else
        # It's okay if the file doesn't exist
        echo -e "${GREEN}   ✓ No maintenance flag to remove${NC}"
    fi
    
    echo -e "\n${GREEN}✅ MAINTENANCE MODE DISABLED${NC}"
    echo -e "${GRAY}   Site is now live and serving traffic normally${NC}\n"
}

show_help() {
    echo -e "\n${MAGENTA}Mixtape Battle - Nginx Maintenance Mode${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./toggle-maintenance.sh on       Enable maintenance mode"
    echo "  ./toggle-maintenance.sh off      Disable maintenance mode"
    echo "  ./toggle-maintenance.sh status   Show current status"
    echo ""
    echo -e "${GRAY}Note: This script uses nginx-level maintenance (safe for production)${NC}"
    echo -e "${GRAY}      The app container keeps running, only nginx shows maintenance page${NC}\n"
}

# Main execution
case "${1:-}" in
    on)
        enable_maintenance
        show_status
        ;;
    off)
        disable_maintenance
        show_status
        ;;
    status)
        show_status
        ;;
    *)
        show_help
        ;;
esac
