#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Asegurar directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
echo -e "📁 Directorio base: $PROJECT_DIR"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Logs - App de Tizadas (Docker)      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Mostrando logs en tiempo real...${NC}"
echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
echo ""

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker no está corriendo${NC}"
    exit 1
fi

# Cambiar al directorio docker antes de ejecutar comandos
cd "$SCRIPT_DIR"
if command -v docker-compose &> /dev/null; then
    docker-compose logs -f --tail=100
else
    docker compose logs -f --tail=100
fi