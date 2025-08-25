@echo off
cd /d %~dp0

REM Build Angular en production
ng build --configuration production
IF ERRORLEVEL 1 (
  echo Echec du build Angular
  pause
  exit /b 1
)

REM Lancer le serveur Flask (sert aussi Angular dist)
waitress-serve --host=0.0.0.0 --port=5000 search_files:app 