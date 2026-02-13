@echo off

echo ==================================
echo DeltaHash Bot Installer (Windows)
echo ==================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is installed
    node -v
) else (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo.
    pause
    exit /b 1
)

echo.

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] npm is installed
    npm -v
) else (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
echo.

npm install axios ws https-proxy-agent

echo.
echo ==================================
echo Installation completed!
echo ==================================
echo.
echo Next steps:
echo 1. Edit accounts_config.json with your tokens
echo 2. Run: node deltahash_pro.cjs
echo.
pause
