# Quick Setup Script for ScholarStream Backend

Write-Host "🚀 Setting up ScholarStream Backend..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (!$pgService -or $pgService.Status -ne 'Running') {
    Write-Host "⚠️  PostgreSQL service not found or not running. Please make sure PostgreSQL is installed and running." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file from template..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your configuration." -ForegroundColor Green
    Write-Host "🔧 Don't forget to set your database credentials and JWT secret!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists." -ForegroundColor Green
}

# Build the project
Write-Host "🔨 Building TypeScript project..." -ForegroundColor Blue
npm run build

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit the .env file with your database credentials"
Write-Host "2. Create PostgreSQL database: CREATE DATABASE scholarstream;"
Write-Host "3. Run migrations: npm run db:migrate"
Write-Host "4. Seed initial data: npm run db:seed"
Write-Host "5. Start development server: npm run dev"
Write-Host ""
Write-Host "🌐 The API will be available at: http://localhost:3001/api" -ForegroundColor Green
