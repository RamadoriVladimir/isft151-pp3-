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
echo -e "📁 Directorio del proyecto: $PROJECT_DIR"
echo -e "📁 Directorio de Docker:    $SCRIPT_DIR"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Iniciando App de Tizadas (Docker)   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker no está corriendo${NC}"
    echo "Por favor inicia Docker Desktop o el daemon de Docker"
    exit 1
fi

# Verificar configuración
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}✗ El proyecto no está configurado${NC}"
    echo -e "${YELLOW}→ Ejecuta primero: ./docker-setup.sh${NC}"
    exit 1
fi

if [ ! -d "data/db" ]; then
    echo -e "${RED}✗ Directorios de datos no encontrados${NC}"
    echo -e "${YELLOW}→ Ejecuta primero: ./docker-setup.sh${NC}"
    exit 1
fi

# Obtener IP local
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo -e "${YELLOW}[1/3]${NC} Deteniendo contenedores anteriores..."
cd "$SCRIPT_DIR"
if command -v docker-compose &> /dev/null; then
    docker-compose down >/dev/null 2>&1
else
    docker compose down >/dev/null 2>&1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Contenedores detenidos${NC}"

echo -e "${YELLOW}[2/3]${NC} Construyendo imagen Docker..."
cd "$SCRIPT_DIR"
if command -v docker-compose &> /dev/null; then
    docker-compose build
else
    docker compose build
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error construyendo la imagen${NC}"
    cd "$PROJECT_DIR"
    exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Imagen construida${NC}"

echo -e "${YELLOW}[3/3]${NC} Iniciando contenedor..."
cd "$SCRIPT_DIR"
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error iniciando el contenedor${NC}"
    cd "$PROJECT_DIR"
    exit 1
fi
cd "$PROJECT_DIR"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Aplicación iniciada               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}URLs de acceso:${NC}"
echo -e "  Local:   ${GREEN}http://localhost:5050${NC}"
echo -e "  Red:     ${GREEN}http://$LOCAL_IP:5050${NC}"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo -e "  Ver logs:        ${YELLOW}./docker-logs.sh${NC}"
echo -e "  Detener:         ${YELLOW}./docker-stop.sh${NC}"
echo -e "  Estado:          ${YELLOW}docker compose ps${NC}"
echo -e "  Reiniciar:       ${YELLOW}docker compose restart${NC}"
echo ""

echo -e "${BLUE}Esperando a que la aplicación esté lista...${NC}"
sleep 3

# Verificar health check
for i in {1..10}; do
    if curl -s http://localhost:5050/ws-status > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Aplicación lista y funcionando${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠ La aplicación está iniciando, puede tardar unos segundos más${NC}"
    fi
    sleep 2
done

echo ""