@echo off
title Cabinet Medical - Demarrage des serveurs
echo ====================================================
echo  DEMARRAGE DU CABINET MEDICAL (LARAVEL + REACT)
echo ====================================================
echo.

echo 1. Lancement du serveur Backend Laravel (Port 8000)...
start "Backend Laravel" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"

timeout /t 2 /nobreak >nul

echo 2. Lancement du serveur Frontend React (Port 5173)...
start "Frontend React" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ====================================================
echo  Serveurs demarres !
echo  Site Public & Espace Medecin : http://localhost:5173
echo  API Laravel : http://127.0.0.1:8000/api
echo  phpMyAdmin : http://localhost/phpmyadmin
echo ====================================================
echo.
start http://localhost:5173
pause
