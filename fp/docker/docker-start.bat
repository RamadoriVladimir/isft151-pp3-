@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM === Asegurar directorio base ===
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%\.."
cd /d "%PROJECT_DIR%"
echo 📁 Directorio del proyecto: %PROJECT_DIR%
echo 📁 Directorio de Docker:    %SCRIPT_DIR%
echo.

echo ╔════════════════════════════════════════╗
echo ║   Iniciando App de Tizadas (Docker)   ║
echo ╚════════════════════════════════════════╝
echo.

:: Verificar que Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está corriendo
    echo Por favor inicia Docker Desktop
    pause
    exit /b 1
)

:: Verificar configuración
if not exist backend\package.json (
    echo ✗ El proyecto no está configurado
    echo → Ejecuta primero: docker-setup.bat
    pause
    exit /b 1
)

if not exist data\db (
    echo ✗ Directorios de datos no encontrados
    echo → Ejecuta primero: docker-setup.bat
    pause
    exit /b 1
)

:: Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP_TEMP=%%a
    set LOCAL_IP=!IP_TEMP: =!
    goto :found_ip
)
:found_ip
if "!LOCAL_IP!"=="" set LOCAL_IP=localhost

echo [1/3] Deteniendo contenedores anteriores...
:: Cambiar al directorio docker antes de ejecutar comandos
pushd "%SCRIPT_DIR%"
docker compose down >nul 2>&1
if %errorlevel% neq 0 docker-compose down >nul 2>&1
popd
echo ✓ Contenedores detenidos

echo [2/3] Construyendo imagen Docker...
pushd "%SCRIPT_DIR%"
docker compose build
if %errorlevel% neq 0 (
    docker-compose build
    if %errorlevel% neq 0 (
        echo ✗ Error construyendo la imagen
        popd
        pause
        exit /b 1
    )
)
popd
echo ✓ Imagen construida

echo [3/3] Iniciando contenedor...
pushd "%SCRIPT_DIR%"
docker compose up -d
if %errorlevel% neq 0 (
    docker-compose up -d
    if %errorlevel% neq 0 (
        echo ✗ Error iniciando el contenedor
        popd
        pause
        exit /b 1
    )
)
popd

echo.
echo ╔════════════════════════════════════════╗
echo ║   ✓ Aplicación iniciada               ║
echo ╚════════════════════════════════════════╝
echo.
echo URLs de acceso:
echo   Local:   http://localhost:5050
echo   Red:     http://!LOCAL_IP!:5050
echo.
echo Comandos útiles:
echo   Ver logs:        docker-logs.bat
echo   Detener:         docker-stop.bat
echo   Estado:          docker compose ps
echo   Reiniciar:       docker compose restart
echo.

echo Esperando a que la aplicación esté lista...
timeout /t 3 /nobreak >nul

for /l %%i in (1,1,10) do (
    curl -s http://localhost:5050/ws-status >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Aplicación lista y funcionando
        goto :app_ready
    )
    if %%i equ 10 (
        echo ⚠ La aplicación está iniciando, puede tardar unos segundos más
    )
    timeout /t 2 /nobreak >nul
)
:app_ready
echo.
pause