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
echo [1/8] Verificando Docker...
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
echo [2/8] Verificando que Docker está corriendo...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker no está corriendo
    echo Por favor inicia Docker Desktop
    pause
    exit /b 1
)
echo ✓ Docker está corriendo

REM === Verificar Docker Compose ===
echo [3/8] Verificando Docker Compose...
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
echo [4/8] Creando estructura de directorios...
if not exist data mkdir data
if not exist data\db mkdir data\db
if not exist data\storage mkdir data\storage
if not exist data\storage\svgs mkdir data\storage\svgs
if not exist docker\logs mkdir docker\logs
echo ✓ Directorios creados

REM === Verificar package.json ===
echo [5/8] Verificando package.json...
if not exist backend\package.json (
    echo ✗ package.json no encontrado en backend\
    echo El archivo debe existir en el repositorio
    pause
    exit /b 1
)
echo ✓ package.json existe

REM === Crear archivo .env si no existe ===
echo [6/8] Verificando archivo .env...
if not exist docker\.env (
    echo → Creando archivo .env...
    (
        echo JWT_SECRET=your_super_secret_jwt_key_change_in_production
        echo PORT=5050
        echo DB_PATH=/app/data/db/database.sqlite
        echo DB_NAME=login_app
        echo NODE_ENV=production
        echo LOG_LEVEL=info
    ) > docker\.env
    echo ✓ Archivo .env creado
    echo ⚠ IMPORTANTE: Cambia JWT_SECRET en el archivo docker\.env
) else (
    echo ✓ Archivo .env ya existe
)

REM === Verificar archivos críticos ===
echo [7/8] Verificando archivos críticos del backend...
set "CRITICAL_ERROR=0"

if not exist backend\main.js (
    echo ✗ Falta: backend\main.js
    set "CRITICAL_ERROR=1"
)
if not exist backend\server.js (
    echo ✗ Falta: backend\server.js
    set "CRITICAL_ERROR=1"
)
if not exist backend\db\db.js (
    echo ✗ Falta: backend\db\db.js
    set "CRITICAL_ERROR=1"
)
if not exist backend\websocket\websocketServer.js (
    echo ✗ Falta: backend\websocket\websocketServer.js
    set "CRITICAL_ERROR=1"
)

if "%CRITICAL_ERROR%"=="1" (
    echo.
    echo ✗ Faltan archivos críticos del backend
    pause
    exit /b 1
)
echo ✓ Archivos críticos verificados

REM === Obtener IP local ===
echo [8/8] Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP_TEMP=%%a
    set LOCAL_IP=!IP_TEMP: =!
    goto :found_ip
)
:found_ip
if "!LOCAL_IP!"=="" set LOCAL_IP=localhost
echo ✓ IP local detectada: !LOCAL_IP!

echo.
echo ╔════════════════════════════════════════╗
echo ║   ✓ Setup completado                  ║
echo ╚════════════════════════════════════════╝
echo.
echo Para construir e iniciar la aplicación:
echo   docker-start.bat
echo.
echo O manualmente (desde el directorio docker):
echo   cd docker
echo   docker-compose up -d --build
echo.
echo URLs de acceso:
echo   Local:   http://localhost:5050
echo   Red:     http://!LOCAL_IP!:5050
echo.
echo NOTAS IMPORTANTES:
echo   - La base de datos se creará automáticamente en data/db/
echo   - Los archivos SVG se guardarán en data/storage/svgs/
echo   - Los logs están en docker/logs/
echo   - La aplicación usa better-sqlite3 (no requiere servidor DB)
echo.
pause