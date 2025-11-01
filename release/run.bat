@echo off
setlocal enabledelayedexpansion

set DOCKER_DIR=%~dp0..\docker

:menu
cls
echo =========================================
echo   Gestor de Scripts Docker - Windows
echo =========================================
echo 1^) Configurar entorno (setup)
echo 2^) Iniciar aplicacion (start)
echo 3^) Mostrar logs (logs)
echo 4^) Detener aplicacion (stop)
echo 5^) Ejecutar todo (setup , start , logs , stop)
echo 0^) Salir
echo -----------------------------------------
set /p OPTION=Selecciona una opcion: 

if "%OPTION%"=="1" call "%DOCKER_DIR%\docker-setup.bat"
if "%OPTION%"=="2" call "%DOCKER_DIR%\docker-start.bat"
if "%OPTION%"=="3" call "%DOCKER_DIR%\docker-logs.bat"
if "%OPTION%"=="4" call "%DOCKER_DIR%\docker-stop.bat"
if "%OPTION%"=="5" (
    call "%DOCKER_DIR%\docker-setup.bat"
    call "%DOCKER_DIR%\docker-start.bat"
    call "%DOCKER_DIR%\docker-logs.bat"
    call "%DOCKER_DIR%\docker-stop.bat"
)
if "%OPTION%"=="0" goto end

echo.
pause
goto menu

:end
echo Saliendo...
exit /b
