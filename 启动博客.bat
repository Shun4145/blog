@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting blog server at http://localhost:1313/
echo Keep this window open. Press Ctrl+C to stop.
tools\hugo.exe server --bind 127.0.0.1 --port 1313
pause