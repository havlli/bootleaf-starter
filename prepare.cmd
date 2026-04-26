@echo off
:: Thin shim — delegates to scripts\scaffold.mjs (Node 20+ required).
where node >nul 2>nul
if errorlevel 1 (
    echo [ERR] node 20+ is required but was not found on PATH.
    echo       Run 'mise install' (recommended) or install Node 20 LTS manually.
    exit /b 1
)
node "%~dp0scripts\scaffold.mjs" %*
