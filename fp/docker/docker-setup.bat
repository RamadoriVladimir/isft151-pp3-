@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════╗
echo ║   Docker Setup - App de Tizadas       ║
echo ╚════════════════════════════════════════╝
echo.

REM === Ajustar ruta base ===
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%\.."
cd /d "%PROJECT_DIR%"
echo 📁 Directorio base: %PROJECT_DIR%
echo.

REM === Verificar Docker ===
echo [1/7] Verificando Docker...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está instalado
    echo Instala Docker Desktop desde: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
echo ✓ Docker instalado: %DOCKER_VERSION%

REM === Verificar Docker corriendo ===
echo [2/7] Verificando que Docker está corriendo...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está corriendo
    echo Por favor inicia Docker Desktop
    pause
    exit /b 1
)
echo ✓ Docker está corriendo

REM === Verificar Docker Compose ===
echo [3/7] Verificando Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ✗ Docker Compose no está instalado
        pause
        exit /b 1
    )
)
echo ✓ Docker Compose instalado

REM === Crear estructura de directorios ===
echo [4/7] Creando estructura de directorios...
if not exist data mkdir data
if not exist data\db mkdir data\db
if not exist data\storage mkdir data\storage
if not exist data\storage\svgs mkdir data\storage\svgs
if not exist logs mkdir logs
echo ✓ Directorios creados

REM === Crear package.json si no existe ===
echo [5/7] Verificando package.json...
if not exist backend\package.json (
    echo → Creando package.json...
    (
        echo {
        echo   "name": "backend",
        echo   "version": "1.0.0",
        echo   "type": "module",
        echo   "description": "Backend para App de Tizadas",
        echo   "main": "main.js",
        echo   "scripts": {
        echo     "start": "node main.js",
        echo     "dev": "node --watch main.js"
        echo   },
        echo   "dependencies": {
        echo     "bcrypt": "^5.1.1",
        echo     "cors": "^2.8.5",
        echo     "dotenv": "^16.3.1",
        echo     "express": "^4.18.2",
        echo     "jsonwebtoken": "^9.0.2",
        echo     "sqlite": "^5.1.1",
        echo     "sqlite3": "^5.1.7",
        echo     "ws": "^8.16.0"
        echo   }
        echo }
    ) > backend\package.json
    echo ✓ package.json creado
) else (
    echo ✓ package.json ya existe
)

REM === Crear archivo .env si no existe ===
echo [6/7] Verificando archivo .env...
if not exist .env (
    echo → Creando archivo .env...
    (
        echo JWT_SECRET=your_super_secret_jwt_key_change_in_production
        echo PORT=5050
        echo DB_PATH=/app/backend/db/database.sqlite
        echo DB_NAME=login_app
        echo NODE_ENV=production
        echo LOG_LEVEL=info
    ) > .env
    echo ✓ Archivo .env creado
    echo ⚠ IMPORTANTE: Cambia JWT_SECRET en el archivo .env
) else (
    echo ✓ Archivo .env ya existe
)

REM === Obtener IP local ===
echo [7/7] Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP_TEMP=%%a
    set LOCAL_IP=!IP_TEMP: =!
    goto :found_ip
)
:found_ip
if "!LOCAL_IP!"=="" set LOCAL_IP=localhost
echo ✓ IP local detectada: !LOCAL_IP!

REM === Actualizar IPs si es necesario ===
if not "!LOCAL_IP!"=="localhost" if not "!LOCAL_IP!"=="192.168.100.24" (
    echo → Actualizando URLs en el proyecto...
    powershell -Command "(Get-Content '%PROJECT_DIR%\backend\server.js') -replace '192.168.100.24', '!LOCAL_IP!' | Set-Content '%PROJECT_DIR%\backend\server.js'"
    powershell -Command "(Get-Content '%PROJECT_DIR%\frontend\services\websocketService.js') -replace '192.168.100.24', '!LOCAL_IP!' | Set-Content '%PROJECT_DIR%\frontend\services\websocketService.js'"
    echo ✓ URLs actualizadas
)

echo.
echo ╔════════════════════════════════════════╗
echo ║   ✓ Setup completado                  ║
echo ╚════════════════════════════════════════╝
echo.
echo Para construir e iniciar la aplicación:
echo   docker-start.bat
echo.
echo O manualmente:
echo   docker-compose up -d --build
echo.
echo URLs de acceso:
echo   Local:   http://localhost:5050
echo   Red:     http://!LOCAL_IP!:5050
echo.
pause
