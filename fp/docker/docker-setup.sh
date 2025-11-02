#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Docker Setup - App de Tizadas       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Asegurar directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
echo -e "📁 Directorio base: $PROJECT_DIR"
echo ""

# Verificar Docker
echo -e "${YELLOW}[1/7]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker no está instalado${NC}"
    echo "Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ Docker instalado: $DOCKER_VERSION${NC}"

# Verificar Docker corriendo
echo -e "${YELLOW}[2/7]${NC} Verificando que Docker está corriendo..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker no está corriendo${NC}"
    echo "Por favor inicia Docker Desktop o el daemon de Docker"
    exit 1
fi
echo -e "${GREEN}✓ Docker está corriendo${NC}"

# Verificar Docker Compose
echo -e "${YELLOW}[3/7]${NC} Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose no está instalado${NC}"
    echo "Instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
else
    COMPOSE_VERSION=$(docker compose version)
fi
echo -e "${GREEN}✓ Docker Compose instalado: $COMPOSE_VERSION${NC}"

# Crear estructura de directorios
echo -e "${YELLOW}[4/7]${NC} Creando estructura de directorios..."
mkdir -p data/db
mkdir -p data/storage/svgs
mkdir -p logs
echo -e "${GREEN}✓ Directorios creados${NC}"

# Crear package.json si no existe
echo -e "${YELLOW}[5/7]${NC} Verificando package.json..."
if [ ! -f "backend/package.json" ]; then
    echo -e "${BLUE}→ Creando package.json...${NC}"
    cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Backend para App de Tizadas",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "node --watch main.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "better-sqlite3": "^9.0.0",
    "ws": "^8.16.0"
  }
}
EOF
    echo -e "${GREEN}✓ package.json creado${NC}"
else
    echo -e "${GREEN}✓ package.json ya existe${NC}"
fi

# Crear archivo .env si no existe
echo -e "${YELLOW}[6/7]${NC} Verificando archivo .env..."
if [ ! -f ".env" ]; then
    echo -e "${BLUE}→ Creando archivo .env...${NC}"
    cat > .env << 'EOF'
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5050
DB_PATH=/app/data/db/database.sqlite
DB_NAME=login_app
NODE_ENV=production
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Cambia JWT_SECRET en el archivo .env${NC}"
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# Obtener IP local
echo -e "${YELLOW}[7/7]${NC} Detectando IP local..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi
echo -e "${GREEN}✓ IP local detectada: $LOCAL_IP${NC}"

# Eliminada la sección de actualizar IPs en el código (como en los .bat)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup completado                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Para construir e iniciar la aplicación:${NC}"
echo -e "  ${YELLOW}./docker-start.sh${NC}"
echo ""
echo -e "${BLUE}O manualmente:${NC}"
echo -e "  ${YELLOW}docker-compose up -d --build${NC}"
echo ""
echo -e "${BLUE}URLs de acceso:${NC}"
echo -e "  Local:   ${GREEN}http://localhost:5050${NC}"
echo -e "  Red:     ${GREEN}http://$LOCAL_IP:5050${NC}"
echo ""