@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM === Asegurar directorio base ===
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%\.."
cd /d "%PROJECT_DIR%"
echo 📁 Directorio base: %PROJECT_DIR%
echo.

echo ╔════════════════════════════════════════╗
echo ║   Logs - App de Tizadas (Docker)      ║
echo ╚════════════════════════════════════════╝
echo.
echo Mostrando logs en tiempo real...
echo Presiona Ctrl+C para salir
echo.

:: Verificar que Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está corriendo
    pause
    exit /b 1
)

:: Cambiar al directorio docker antes de ejecutar comandos
pushd "%SCRIPT_DIR%"
docker compose logs -f --tail=100
if %errorlevel% neq 0 (
    docker-compose logs -f --tail=100
)
popd