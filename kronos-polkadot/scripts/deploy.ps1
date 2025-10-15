# Kronos Prediction DApp - Windows PowerShell 部署脚本

param(
    [Parameter(Position=0)]
    [ValidateSet('check', 'install', 'build', 'test', 'deploy', 'start', 'stop', 'full', 'help')]
    [string]$Command = 'help'
)

$ErrorActionPreference = "Stop"

# 配置
$CONFIG_FILE = ".\scripts\config.json"
$ROOT_DIR = $PSScriptRoot | Split-Path -Parent

# 颜色输出函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 检查依赖
function Check-Dependencies {
    Write-Info "Checking dependencies..."
    
    # 检查 Rust
    if (!(Get-Command rustc -ErrorAction SilentlyContinue)) {
        Write-Error "Rust is not installed. Please install from https://rustup.rs/"
        exit 1
    }
    
    # 检查 cargo-contract
    if (!(Get-Command cargo-contract -ErrorAction SilentlyContinue)) {
        Write-Error "cargo-contract is not installed. Run: cargo install cargo-contract --force"
        exit 1
    }
    
    # 检查 Node.js
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    }
    
    # 检查 Python
    if (!(Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Error "Python is not installed. Please install Python 3.10+"
        exit 1
    }
    
    Write-Success "All dependencies are installed"
}

# 构建智能合约
function Build-Contract {
    Write-Info "Building smart contract..."
    
    Set-Location "$ROOT_DIR\contracts\kronos_prediction"
    
    # 清理
    cargo clean
    
    # 构建
    cargo +nightly contract build --release
    
    if (!(Test-Path "target\ink\kronos_prediction.contract")) {
        Write-Error "Contract build failed"
        exit 1
    }
    
    Write-Success "Contract built successfully"
    Write-Info "Contract file: $(Get-Location)\target\ink\kronos_prediction.contract"
    
    Set-Location $ROOT_DIR
}

# 测试合约
function Test-Contract {
    Write-Info "Running contract tests..."
    
    Set-Location "$ROOT_DIR\contracts\kronos_prediction"
    cargo test
    Set-Location $ROOT_DIR
    
    Write-Success "Contract tests passed"
}

# 安装依赖
function Install-Dependencies {
    Write-Info "Installing project dependencies..."
    
    # 后端依赖
    Write-Info "Installing backend dependencies..."
    Set-Location "$ROOT_DIR\backend"
    npm install
    pip install -r requirements.txt
    Set-Location $ROOT_DIR
    
    # 前端依赖
    Write-Info "Installing frontend dependencies..."
    Set-Location "$ROOT_DIR\frontend"
    npm install
    Set-Location $ROOT_DIR
    
    Write-Success "All dependencies installed"
}

# 启动服务
function Start-Services {
    Write-Info "Starting services..."
    
    # 启动后端
    Write-Info "Starting backend service..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT_DIR\backend'; npm start"
    
    Start-Sleep -Seconds 3
    
    # 启动前端
    Write-Info "Starting frontend service..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT_DIR\frontend'; npm run dev"
    
    Write-Success "Services started"
    Write-Info "Frontend URL: http://localhost:5173"
    Write-Info "Backend URL: http://localhost:5000"
}

# 停止服务
function Stop-Services {
    Write-Info "Stopping services..."
    
    # 停止 Node.js 进程
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # 停止 Python 进程
    Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*predict_service*"} | Stop-Process -Force
    
    Write-Success "Services stopped"
}

# 部署合约
function Deploy-Contract {
    Write-Info "Deploying contract to Polkadot Westend..."
    
    if (!(Test-Path $CONFIG_FILE)) {
        Write-Error "Config file not found: $CONFIG_FILE"
        exit 1
    }
    
    $config = Get-Content $CONFIG_FILE | ConvertFrom-Json
    
    Write-Info "RPC URL: $($config.rpc_url)"
    Write-Info "Deployer: $($config.deployer_account)"
    
    Set-Location "$ROOT_DIR\contracts\kronos_prediction"
    
    Write-Warning "Please confirm the transaction..."
    
    cargo contract instantiate `
        --url $config.rpc_url `
        --suri $config.deployer_account `
        --constructor new `
        --execute
    
    Write-Success "Contract deployed successfully"
    
    Set-Location $ROOT_DIR
}

# 完整部署
function Full-Deployment {
    Write-Info "Starting full deployment..."
    
    Check-Dependencies
    Install-Dependencies
    Build-Contract
    Test-Contract
    
    $deploy = Read-Host "Deploy contract to Westend? (y/n)"
    if ($deploy -eq 'y') {
        Deploy-Contract
    }
    
    $start = Read-Host "Start services? (y/n)"
    if ($start -eq 'y') {
        Start-Services
    }
    
    Write-Success "Full deployment completed!"
}

# 显示帮助
function Show-Help {
    Write-Host @"
Kronos Prediction DApp - Deployment Script (Windows)

Usage: .\deploy.ps1 [command]

Commands:
  check       - Check dependencies
  install     - Install project dependencies
  build       - Build smart contract
  test        - Run contract tests
  deploy      - Deploy contract to Westend
  start       - Start backend and frontend services
  stop        - Stop all services
  full        - Full deployment (build + deploy + start)
  help        - Show this help message

Examples:
  .\deploy.ps1 check
  .\deploy.ps1 full
"@
}

# 主逻辑
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Kronos Prediction DApp - Deployment Tool   " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

switch ($Command) {
    'check'     { Check-Dependencies }
    'install'   { Install-Dependencies }
    'build'     { Build-Contract }
    'test'      { Test-Contract }
    'deploy'    { Deploy-Contract }
    'start'     { Start-Services }
    'stop'      { Stop-Services }
    'full'      { Full-Deployment }
    'help'      { Show-Help }
    default     { Show-Help }
}

Write-Host ""
Write-Info "Done!"

