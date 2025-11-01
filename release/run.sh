#!/bin/bash
set -e

DOCKER_DIR="$(dirname "$0")/../docker"

show_menu() {
    echo "========================================="
    echo "   Gestor de Scripts Docker - Linux/Mac  "
    echo "========================================="
    echo "1) Configurar entorno (setup)"
    echo "2) Iniciar aplicacion (start)"
    echo "3) Mostrar logs (logs)"
    echo "4) Detener aplicacion (stop)"
    echo "5) Ejecutar todo (setup , start , logs , stop)"
    echo "0) Salir"
    echo "-----------------------------------------"
    read -p "Selecciona una opcion: " OPTION
}

execute_script() {
    local script="$1"
    if [ -f "$DOCKER_DIR/$script" ]; then
        chmod +x "$DOCKER_DIR/$script"
        echo ""
        echo ">>> Ejecutando $script..."
        "$DOCKER_DIR/$script"
    else
        echo "No se encontro $script en $DOCKER_DIR"
    fi
}

while true; do
    show_menu
    case $OPTION in
        1)
            execute_script "docker-setup.sh"
            ;;
        2)
            execute_script "docker-start.sh"
            ;;
        3)
            execute_script "docker-logs.sh"
            ;;
        4)
            execute_script "docker-stop.sh"
            ;;
        5)
            execute_script "docker-setup.sh"
            execute_script "docker-start.sh"
            execute_script "docker-logs.sh"
            execute_script "docker-stop.sh"
            ;;
        0)
            echo "Saliendo..."
            exit 0
            ;;
        *)
            echo "Opcion invalida."
            ;;
    esac
    echo ""
    read -p "Presiona Enter para continuar..."
done
