# Fast Development Setup Script for Windows
Write-Host "🚀 Starting Papers Project with Fast Compilation..." -ForegroundColor Green

# Kill any existing processes on port 3000
Write-Host "🔄 Stopping any existing processes on port 3000..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Stopped existing Node processes" -ForegroundColor Green
} catch {
    Write-Host "No Node processes to kill" -ForegroundColor Gray
}

# Start development server in background
Write-Host "🛠️  Starting development server..." -ForegroundColor Blue
$devProcess = Start-Process npm -ArgumentList "run", "dev" -PassThru -NoNewWindow

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Run warmup to pre-compile all routes
Write-Host "🔥 Pre-compiling all routes (this will take ~6 seconds)..." -ForegroundColor Cyan
npm run warmup

Write-Host ""
Write-Host "✅ Setup complete! All routes are now pre-compiled." -ForegroundColor Green
Write-Host "🌐 Your app is ready at: http://localhost:3000" -ForegroundColor Green
Write-Host "⚡ All pages should now load instantly!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the development server." -ForegroundColor Yellow

# Wait for the development server
try {
    $devProcess.WaitForExit()
} catch {
    Write-Host "Development server stopped." -ForegroundColor Gray
}
