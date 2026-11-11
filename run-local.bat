@echo off
setlocal
cd /d "%~dp0"

set "NPM_CMD=npm.cmd"
where npm.cmd >nul 2>&1
if not errorlevel 1 goto npm_ready
if exist "C:\Program Files\nodejs\npm.cmd" (
  set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
  goto npm_ready
)
echo Node.js with npm was not found. Install the Node.js LTS release first.
pause
exit /b 1

:npm_ready
if not exist ".env" (
  powershell -NoProfile -Command "$secret=[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(48)); $text=Get-Content '.env.example' -Raw; $text=$text -replace 'change-this-to-a-long-random-secret',$secret; Set-Content -Path '.env' -Value $text -Encoding ascii"
  if errorlevel 1 (
    echo Could not create the local environment file.
    pause
    exit /b 1
  )
)

sc query MongoDB | findstr /I "RUNNING" >nul
if errorlevel 1 (
  echo MongoDB is not running. Open services.msc, start the MongoDB service, and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\mongoose\package.json" (
  echo Installing project packages. This may take a few minutes the first time.
  call "%NPM_CMD%" ci --no-audit --no-fund
  if errorlevel 1 (
    echo Package installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

call "%NPM_CMD%" run seed
if errorlevel 1 (
  echo Could not prepare the database. Check that MongoDB is running.
  pause
  exit /b 1
)

echo Starting Core / Field Guide...
start "Core / Field Guide server" cmd /k call "%NPM_CMD%" start
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
exit /b 0
