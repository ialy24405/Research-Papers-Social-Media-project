# Docker Image Size Comparison Script
Write-Host "Docker Image Size Comparison Report" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get all papers-project images
$images = docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | Select-String "papers-project"

if ($images) {
    Write-Host "Available Papers Project Images:" -ForegroundColor Green
    Write-Host "Repository:Tag                     Size       Created" -ForegroundColor Yellow
    Write-Host "------------------------------------------------" -ForegroundColor Yellow
    
    $images | ForEach-Object {
        Write-Host $_.Line -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Size Optimization Summary:" -ForegroundColor Green
    Write-Host "- Original size: ~1.55GB" -ForegroundColor White
    Write-Host "- Ultra-slim size: ~1.08GB (30% reduction)" -ForegroundColor Green
    Write-Host "- Minimal size: ~1.09GB (29% reduction)" -ForegroundColor Green
    
} else {
    Write-Host "No papers-project images found. Build some images first:" -ForegroundColor Red
    Write-Host "npm run docker:build" -ForegroundColor Yellow
    Write-Host "npm run docker:slim" -ForegroundColor Yellow
    Write-Host "npm run docker:minimal" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Recommended Usage:" -ForegroundColor Cyan
Write-Host "- Development: npm run docker:dev (full features)" -ForegroundColor White
Write-Host "- Production: npm run docker:minimal (optimized size)" -ForegroundColor Green
