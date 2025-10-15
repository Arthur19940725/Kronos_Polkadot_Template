# Kronos Polkadot Windows Startup Script
# PowerShell UTF-8 BOM

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kronos Prediction DApp - Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker Desktop
Write-Host "[1/5] Checking Docker Desktop..." -ForegroundColor Yellow

try {
    docker version | Out-Null
    Write-Host "  [OK] Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker Desktop is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Check existing services
Write-Host ""
Write-Host "[2/5] Checking existing services..." -ForegroundColor Yellow

$existingServices = docker-compose ps -q 2>$null
if ($existingServices) {
    Write-Host "  Found running services, restarting..." -ForegroundColor Yellow
    docker-compose down
    Start-Sleep -Seconds 2
}

# Start services
Write-Host ""
Write-Host "[3/5] Starting Kronos services..." -ForegroundColor Yellow
Write-Host ""

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  [OK] Services started successfully" -ForegroundColor Green
    
    # Wait for services
    Write-Host ""
    Write-Host "[4/5] Waiting for services to be ready (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Verify services
    Write-Host ""
    Write-Host "[5/5] Verifying services..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Backend service (port 5000)" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Backend not ready yet" -ForegroundColor Yellow
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] Frontend service (port 3000)" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Frontend not ready yet" -ForegroundColor Yellow
    }
    
    # Display service info
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SUCCESS! Access your services:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "  AI Service: http://localhost:5001" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Show service status
    Write-Host "Service Status:" -ForegroundColor Yellow
    Write-Host ""
    docker-compose ps
    
    # Test API
    Write-Host ""
    Write-Host "Testing API (fetching BTC price)..." -ForegroundColor Yellow
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing -TimeoutSec 10
        $data = $apiResponse.Content | ConvertFrom-Json
        Write-Host ""
        Write-Host "  [OK] API Test Successful!" -ForegroundColor Green
        Write-Host "  Symbol: $($data.symbol)" -ForegroundColor White
        Write-Host "  Price: `$$($data.currentPrice)" -ForegroundColor White
        Write-Host "  Change 24h: $($data.change24h)%" -ForegroundColor White
        Write-Host "  Data Source: $($data.dataSource)" -ForegroundColor White
    } catch {
        Write-Host "  [WARN] API test failed, service may still be initializing" -ForegroundColor Yellow
    }
    
    # Common commands
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Common Commands" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  View logs:     docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop services: docker-compose down" -ForegroundColor White
    Write-Host "  Restart:       docker-compose restart" -ForegroundColor White
    Write-Host "  Check status:  docker-compose ps" -ForegroundColor White
    Write-Host ""
    
    # Open browser
    Write-Host "Open frontend in browser? (Y/N): " -ForegroundColor Yellow -NoNewline
    $openBrowser = Read-Host
    
    if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y' -or $openBrowser -eq '') {
        Start-Process "http://localhost:3000"
        Write-Host "  [OK] Opened in browser" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Enjoy using Kronos!" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "  [ERROR] Failed to start services" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Docker Desktop is running" -ForegroundColor White
    Write-Host "2. Ports 3000, 5000, 5001 are not in use" -ForegroundColor White
    Write-Host "3. View logs: docker-compose logs" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press Enter to exit..."
Read-Host
