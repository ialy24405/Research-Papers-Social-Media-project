@echo off
echo.
echo ================================================================
echo 🚀 Papers Project - Development Server with Warmup
echo ================================================================
echo.

echo 📦 Starting Next.js development server...
echo Please wait while the server starts up...
echo.

cd /d "%~dp0.."
start "Papers Dev Server" cmd /k "npm run dev"

echo ⏳ Waiting for server to be ready (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo 🔥 Starting warmup process...
echo This will pre-compile your pages for faster loading
echo.

REM Test if server is ready
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -Method Head -TimeoutSec 5 -ErrorAction Stop; Write-Host '✅ Server is ready!'; exit 0 } catch { Write-Host '❌ Server not ready yet. Please wait and try warmup manually.'; exit 1 }"

if %errorlevel% equ 0 (
    echo.
    echo 🌡️ Warming up essential pages...
    node scripts/quick-warmup.js
) else (
    echo.
    echo 💡 Manual warmup: Once server is ready, run:
    echo    npm run warmup:quick
)

echo.
echo 🎉 Setup complete!
echo 📱 Open: http://localhost:3000
echo.
echo Press any key to continue...
pause >nul
