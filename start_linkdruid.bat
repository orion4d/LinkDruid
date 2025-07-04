@echo off
REM Lanceur pour LinkDruid

TITLE LinkDruid Launcher

SET "PROJECT_DIR=%~dp0"
SET "PORT=3000"
SET "URL=http://localhost:%PORT%"

echo Changement de répertoire vers : %PROJECT_DIR%
cd /d "%PROJECT_DIR%"

REM Optionnel: Vérifier node_modules et faire npm install si besoin
IF NOT EXIST "node_modules" (
    echo Le dossier node_modules n'existe pas.
    echo Tentative d'installation des dépendances avec 'npm install'...
    npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo Erreur lors de l'installation des dépendances. Veuillez vérifier et relancer.
        pause
        exit /b 1
    )
    echo Dépendances installées.
)

echo Lancement du serveur LinkDruid...
REM Lance le serveur dans une NOUVELLE fenêtre de console.
REM Le nom "LinkDruid Server Process" apparaîtra comme titre de cette nouvelle fenêtre.
start "LinkDruid Server Process" node server.js

echo Attente de quelques secondes pour le démarrage du serveur...
REM Donne 3 secondes au serveur pour démarrer. Ajustez si nécessaire.
timeout /t 3 /nobreak >nul

echo Ouverture de LinkDruid (%URL%) dans le navigateur par défaut...
start "" "%URL%"

echo.
echo Le serveur LinkDruid a été lancé dans une fenêtre séparée.
echo L'application devrait s'ouvrir dans votre navigateur.
echo Vous pouvez fermer cette fenêtre de lancement.
echo Pour arrêter le serveur, fermez la fenêtre "LinkDruid Server Process".
echo.

REM Vous pouvez ajouter une pause ici si vous voulez que cette fenêtre reste ouverte plus longtemps
REM pause
exit /b 0