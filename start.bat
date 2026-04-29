@echo off
cd /d "%~dp0"
title Career Mentor Server
echo Starting Career Mentor...
echo.
echo Open your browser and go to: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
npx http-server dist -p 8080 -c-1
