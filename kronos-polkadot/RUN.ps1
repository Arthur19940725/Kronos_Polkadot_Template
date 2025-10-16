# Kronos Polkadot - Docker Run Script
# Complete automation for running the codebase

param(
    [string]$Action = "start"
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Kronos Polkadot - Docker Runner" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Docker
Write-Host "[1/6] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "  ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running!" -ForegroundColor Red
    Write-Host "`nPlease start Docker Desktop and run this script again.`n" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

switch ($Action.ToLower()) {
    "start" {
        Write-Host "`n[2/6] Checking existing services..." -ForegroundColor Yellow
        $running = docker-compose ps -q 2>$null
        if ($running) {
            Write-Host "  ⚠️  Services already running" -ForegroundColor Yellow
            Write-Host "`nRestart services? (Y/N): " -NoNewline
            $restart = Read-Host
            if ($restart -eq 'Y' -or $restart -eq 'y') {
                docker-compose down
            } else {
                Write-Host "`nServices already running. Access at http://localhost:3000`n" -ForegroundColor Green
                exit 0
            }
        }

        Write-Host "`n[3/6] Starting Kronos services..." -ForegroundColor Yellow
        docker-compose up -d

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Services started" -ForegroundColor Green

            Write-Host "`n[4/6] Waiting for initialization (30s)..." -ForegroundColor Yellow
            for ($i = 30; $i -gt 0; $i--) {
                Write-Progress -Activity "Initializing services" -Status "$i seconds remaining" -PercentComplete ((30-$i)/30*100)
                Start-Sleep -Seconds 1
            }
            Write-Progress -Activity "Initializing services" -Completed

            Write-Host "`n[5/6] Verifying services..." -ForegroundColor Yellow
            
            Start-Sleep -Seconds 5
            
            $backendOk = $false
            $frontendOk = $false

            try {
                $r = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
                Write-Host "  ✅ Backend API (port 5000)" -ForegroundColor Green
                $backendOk = $true
            } catch {
                Write-Host "  ⚠️  Backend not ready yet" -ForegroundColor Yellow
            }

            try {
                $r = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
                Write-Host "  ✅ Frontend (port 3000)" -ForegroundColor Green
                $frontendOk = $true
            } catch {
                Write-Host "  ⚠️  Frontend not ready yet" -ForegroundColor Yellow
            }

            Write-Host "`n[6/6] Testing API..." -ForegroundColor Yellow
            if ($backendOk) {
                try {
                    $api = Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
                    $data = $api.Content | ConvertFrom-Json
                    Write-Host "  ✅ API Test: BTC Price = `$$($data.currentPrice)" -ForegroundColor Green
                    Write-Host "     Data Source: $($data.dataSource)" -ForegroundColor Gray
                } catch {
                    Write-Host "  ⚠️  API still initializing" -ForegroundColor Yellow
                }
            }

            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "        🎉 STARTUP COMPLETE!" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Cyan

            Write-Host "Access your services:" -ForegroundColor White
            Write-Host "  🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  🔌 Backend:   http://localhost:5000" -ForegroundColor Cyan
            Write-Host "  🤖 AI Model:  http://localhost:5001" -ForegroundColor Cyan
            Write-Host ""

            Write-Host "Common commands:" -ForegroundColor White
            Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor Gray
            Write-Host "  Stop:         docker-compose down" -ForegroundColor Gray
            Write-Host "  Restart:      docker-compose restart" -ForegroundColor Gray
            Write-Host ""

            Write-Host "Open in browser? (Y/N): " -ForegroundColor Yellow -NoNewline
            $open = Read-Host
            if ($open -eq 'Y' -or $open -eq 'y' -or $open -eq '') {
                Start-Process "http://localhost:3000"
            }
        } else {
            Write-Host "  ❌ Failed to start services" -ForegroundColor Red
        }
    }

    "stop" {
        Write-Host "`nStopping all services..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "  ✅ Services stopped`n" -ForegroundColor Green
    }

    "restart" {
        Write-Host "`nRestarting services..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "  ✅ Services restarted`n" -ForegroundColor Green
        Write-Host "Access at: http://localhost:3000`n" -ForegroundColor Cyan
    }

    "logs" {
        Write-Host "`nShowing logs (Ctrl+C to exit)...`n" -ForegroundColor Yellow
        docker-compose logs -f
    }

    "status" {
        Write-Host "`nService Status:" -ForegroundColor Yellow
        docker-compose ps
    }

    "rebuild" {
        Write-Host "`nRebuilding services..." -ForegroundColor Yellow
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host "  ✅ Rebuild complete`n" -ForegroundColor Green
    }

    default {
        Write-Host "Usage: .\RUN.ps1 [action]`n" -ForegroundColor Yellow
        Write-Host "Actions:" -ForegroundColor White
        Write-Host "  start    - Start all services (default)" -ForegroundColor Gray
        Write-Host "  stop     - Stop all services" -ForegroundColor Gray
        Write-Host "  restart  - Restart services" -ForegroundColor Gray
        Write-Host "  logs     - View logs" -ForegroundColor Gray
        Write-Host "  status   - Show service status" -ForegroundColor Gray
        Write-Host "  rebuild  - Rebuild and restart" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "Press Enter to exit..."
Read-Host

