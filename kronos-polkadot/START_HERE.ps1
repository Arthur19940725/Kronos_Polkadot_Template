# Kronos - Complete Windows Startup
# This script will handle everything for you

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Kronos Prediction DApp Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker Desktop is running
Write-Host "[Step 1] Checking Docker Desktop..." -ForegroundColor Yellow

$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "  Docker Desktop is running! [OK]" -ForegroundColor Green
    }
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "  Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "PLEASE DO THE FOLLOWING:" -ForegroundColor Yellow
    Write-Host "1. Click Start Menu" -ForegroundColor White
    Write-Host "2. Search for 'Docker Desktop'" -ForegroundColor White
    Write-Host "3. Start Docker Desktop" -ForegroundColor White
    Write-Host "4. Wait until the icon in system tray shows it's running" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    
    # Try to start Docker Desktop automatically
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host "Attempting to start Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerPath
        Write-Host "  Started! Please wait 30 seconds for Docker to initialize..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Check again
        try {
            docker ps 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Docker is now ready!" -ForegroundColor Green
                $dockerRunning = $true
            }
        } catch {
            Write-Host "  Docker is still starting up..." -ForegroundColor Yellow
            Write-Host "  Please wait a bit longer and run this script again." -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "Please start Docker Desktop manually and run this script again." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

if ($dockerRunning) {
    # Step 2: Start services
    Write-Host ""
    Write-Host "[Step 2] Starting Kronos services..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  Services started successfully! [OK]" -ForegroundColor Green
        
        # Step 3: Wait for initialization
        Write-Host ""
        Write-Host "[Step 3] Waiting for services to initialize (30 seconds)..." -ForegroundColor Yellow
        
        for ($i = 30; $i -gt 0; $i--) {
            Write-Host "  $i seconds remaining..." -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
        
        # Step 4: Verify
        Write-Host ""
        Write-Host "[Step 4] Verifying services..." -ForegroundColor Yellow
        
        $backendOk = $false
        $frontendOk = $false
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5 2>&1
            Write-Host "  Backend API: OK (port 5000)" -ForegroundColor Green
            $backendOk = $true
        } catch {
            Write-Host "  Backend API: Not ready yet" -ForegroundColor Yellow
        }
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 5 2>&1
            Write-Host "  Frontend: OK (port 3000)" -ForegroundColor Green
            $frontendOk = $true
        } catch {
            Write-Host "  Frontend: Not ready yet" -ForegroundColor Yellow
        }
        
        # Display results
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "          STARTUP COMPLETE!" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Access your application:" -ForegroundColor White
        Write-Host ""
        Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  Backend API: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "  AI Service:  http://localhost:5001" -ForegroundColor Cyan
        Write-Host ""
        
        if (-not $backendOk -or -not $frontendOk) {
            Write-Host "Note: Some services may need more time to start." -ForegroundColor Yellow
            Write-Host "Wait another minute and refresh your browser." -ForegroundColor Yellow
            Write-Host ""
        }
        
        # Open browser
        Write-Host "Opening frontend in your browser..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3000"
        
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "Common Commands:" -ForegroundColor White
        Write-Host ""
        Write-Host "  Stop:    docker-compose down" -ForegroundColor Gray
        Write-Host "  Logs:    docker-compose logs -f" -ForegroundColor Gray
        Write-Host "  Status:  docker-compose ps" -ForegroundColor Gray
        Write-Host "  Restart: docker-compose restart" -ForegroundColor Gray
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        
    } else {
        Write-Host ""
        Write-Host "  Failed to start services! [ERROR]" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try:" -ForegroundColor Yellow
        Write-Host "  1. docker-compose down" -ForegroundColor White
        Write-Host "  2. Run this script again" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press Enter to close this window..."
Read-Host

