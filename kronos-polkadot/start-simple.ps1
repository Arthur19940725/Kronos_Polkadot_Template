# Simple Startup Script for Kronos Polkadot
# Just start the services - no fancy features

Write-Host "Starting Kronos services..." -ForegroundColor Cyan
Write-Host ""

# Start Docker services
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "Wait 30 seconds for services to be ready..." -ForegroundColor Yellow
    Write-Host ""
    
    # Open browser
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:3000"
} else {
    Write-Host "Failed to start services." -ForegroundColor Red
    Write-Host "Make sure Docker Desktop is running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press Enter to close..."
Read-Host

