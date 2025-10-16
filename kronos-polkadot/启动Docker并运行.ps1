# Kronos - Auto Start Docker Desktop and Services

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Kronos Docker Auto Starter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if Docker Desktop is running
Write-Host "[Step 1] Checking Docker Desktop..." -ForegroundColor Yellow

$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
} catch {}

if ($dockerRunning) {
    Write-Host "  ✅ Docker Desktop is already running`n" -ForegroundColor Green
} else {
    Write-Host "  ❌ Docker Desktop is NOT running`n" -ForegroundColor Red
    
    # Try to find and start Docker Desktop
    Write-Host "[Step 2] Starting Docker Desktop..." -ForegroundColor Yellow
    
    $dockerPaths = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    )
    
    $dockerFound = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Write-Host "  Found Docker Desktop at: $path" -ForegroundColor Gray
            Start-Process $path
            $dockerFound = $true
            break
        }
    }
    
    if (-not $dockerFound) {
        Write-Host "  ❌ Docker Desktop not found!" -ForegroundColor Red
        Write-Host "`nPlease install Docker Desktop:" -ForegroundColor Yellow
        Write-Host "  https://www.docker.com/products/docker-desktop`n" -ForegroundColor Cyan
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "  ⏳ Waiting for Docker Desktop to start (60 seconds)...`n" -ForegroundColor Yellow
    
    # Wait for Docker to be ready
    $maxWait = 60
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 5
        $waited += 5
        
        Write-Host "  Checking... ($waited/$maxWait seconds)" -ForegroundColor Gray
        
        try {
            docker ps 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Docker Desktop is now running!`n" -ForegroundColor Green
                $dockerRunning = $true
                break
            }
        } catch {}
    }
    
    if (-not $dockerRunning) {
        Write-Host "  ⚠️  Docker Desktop is still starting..." -ForegroundColor Yellow
        Write-Host "  Please wait another minute and run this script again.`n" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check current directory
$currentDir = Get-Location
$expectedDir = "D:\code\Kronos_Polkadot_Template\kronos-polkadot"

if ($currentDir.Path -ne $expectedDir) {
    Write-Host "[Step 3] Changing directory..." -ForegroundColor Yellow
    Set-Location $expectedDir
    Write-Host "  ✅ In project directory`n" -ForegroundColor Green
}

# Check if services are already running
Write-Host "[Step 4] Checking services..." -ForegroundColor Yellow
$existingServices = docker-compose ps -q 2>$null
if ($existingServices) {
    Write-Host "  Found running services`n" -ForegroundColor Yellow
    docker-compose ps
    Write-Host "`n  Services already running!" -ForegroundColor Green
    Write-Host "  Access at: http://localhost:3000`n" -ForegroundColor Cyan
} else {
    # Start services
    Write-Host "[Step 5] Starting Kronos services...`n" -ForegroundColor Yellow
    docker-compose up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n  ✅ Services started successfully!`n" -ForegroundColor Green

        Write-Host "[Step 6] Waiting for services to be ready (30s)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30

        # Verify
        Write-Host "`n[Step 7] Verifying services...`n" -ForegroundColor Yellow
        docker-compose ps

        # Test backend
        Write-Host "`n[Step 8] Testing services..." -ForegroundColor Yellow
        try {
            $health = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Backend API is responding" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Backend may need more time" -ForegroundColor Yellow
        }

        try {
            $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Frontend is responding" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Frontend may need more time" -ForegroundColor Yellow
        }
    }
}

# Final summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "        KRONOS IS READY!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Access your application:" -ForegroundColor White
Write-Host "  🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🔌 Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "  🤖 AI Service: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  View logs:   docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Stop all:    docker-compose down" -ForegroundColor Gray
Write-Host "  Restart:     docker-compose restart" -ForegroundColor Gray
Write-Host "  Status:      docker-compose ps" -ForegroundColor Gray
Write-Host ""

Write-Host "Diagnostic tools:" -ForegroundColor White
Write-Host "  Wallet debug: http://localhost:3000/wallet-debug.html" -ForegroundColor Gray
Write-Host "  Wallet setup: http://localhost:3000/wallet-setup-guide.html" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Open frontend in browser? (Y/N): " -ForegroundColor Yellow -NoNewline
$openBrowser = Read-Host

if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y' -or $openBrowser -eq '') {
    Start-Process "http://localhost:3000"
    Write-Host "`n✅ Opening browser...`n" -ForegroundColor Green
}

Write-Host "Press Enter to close..."
Read-Host

