@echo off
:loop
w32tm /resync
timeout /t 60 >nul
goto loop
