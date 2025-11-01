@echo off
chcp 65001 >nul
echo 🧹 Limpiando y reconstruyendo contenedores...
echo.

echo [1/4] Deteniendo contenedores...
docker-compose down
if %errorlevel% neq 0 docker compose down

echo [2/4] Eliminando contenedores e imágenes...
docker rm -f app_tizadas 2>nul
docker rmi -f docker-app 2>nul

echo [3/4] Eliminando node_modules y package-lock.json...
cd ..
if exist backend\package-lock.json del backend\package-lock.json
if exist backend\node_modules rmdir /s /q backend\node_modules

echo [4/4] Reconstruyendo...
cd docker
docker-compose build --no-cache
if %errorlevel% neq 0 docker compose build --no-cache

echo.
echo ✅ Limpieza completada. Ejecuta: docker-compose up
pause