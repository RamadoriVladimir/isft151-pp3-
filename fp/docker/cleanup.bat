@echo off
chcp 65001 >nul
echo 🧹 Limpiando y reconstruyendo contenedores...
echo.

echo [1/3] Deteniendo contenedores...
docker-compose down
if %errorlevel% neq 0 docker compose down

echo [2/3] Eliminando contenedores e imágenes...
docker rm -f app_tizadas 2>nul
docker rmi -f docker-app 2>nul

echo [3/3] Reconstruyendo...
cd docker
docker-compose build --no-cache
if %errorlevel% neq 0 docker compose build --no-cache

echo.
echo ✅ Limpieza completada. Ejecuta: docker-compose up
pause