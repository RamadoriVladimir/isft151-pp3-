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
echo ║   Deteniendo App de Tizadas (Docker)  ║
echo ╚════════════════════════════════════════╝
echo.

:: Verificar que Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está corriendo
    pause
    exit /b 1
)

echo Deteniendo contenedores...

:: Cambiar al directorio docker antes de ejecutar comandos
pushd "%SCRIPT_DIR%"
docker compose down
if %errorlevel% neq 0 (
    docker-compose down
    if %errorlevel% neq 0 (
        echo ✗ Error deteniendo la aplicación
        popd
        pause
        exit /b 1
    )
)
popd

echo.
echo ✓ Aplicación detenida correctamente
echo.
echo Para iniciar nuevamente:
echo   docker-start.bat
echo.
pause