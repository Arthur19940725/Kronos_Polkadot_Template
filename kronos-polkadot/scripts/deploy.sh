#!/bin/bash

##############################################################################
# Kronos Prediction DApp - 自动化部署脚本
# 用于部署智能合约到 Polkadot Westend 测试网
##############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件路径
CONFIG_FILE="./scripts/config.json"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "Checking dependencies..."
    
    # 检查 Rust
    if ! command -v rustc &> /dev/null; then
        log_error "Rust is not installed. Please install from https://rustup.rs/"
        exit 1
    fi
    
    # 检查 cargo-contract
    if ! command -v cargo-contract &> /dev/null; then
        log_error "cargo-contract is not installed. Run: cargo install cargo-contract --force"
        exit 1
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python is not installed. Please install Python 3.10+"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# 构建智能合约
build_contract() {
    log_info "Building smart contract..."
    
    cd contracts/kronos_prediction
    
    # 清理之前的构建
    cargo clean
    
    # 使用 nightly 构建
    cargo +nightly contract build --release
    
    if [ ! -f "target/ink/kronos_prediction.contract" ]; then
        log_error "Contract build failed"
        exit 1
    fi
    
    log_success "Contract built successfully"
    log_info "Contract file: $(pwd)/target/ink/kronos_prediction.contract"
    
    cd ../..
}

# 部署合约
deploy_contract() {
    log_info "Deploying contract to Polkadot Westend..."
    
    # 读取配置
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Config file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # 提取配置参数
    RPC_URL=$(jq -r '.rpc_url' $CONFIG_FILE)
    DEPLOYER_ACCOUNT=$(jq -r '.deployer_account' $CONFIG_FILE)
    
    log_info "RPC URL: $RPC_URL"
    log_info "Deployer: $DEPLOYER_ACCOUNT"
    
    cd contracts/kronos_prediction
    
    # 部署合约
    log_warning "Please confirm the transaction in your terminal..."
    
    cargo contract instantiate \
        --url $RPC_URL \
        --suri "$DEPLOYER_ACCOUNT" \
        --constructor new \
        --execute
    
    log_success "Contract deployed successfully"
    
    cd ../..
}

# 安装依赖
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # 后端依赖
    log_info "Installing backend dependencies..."
    cd backend
    npm install
    pip install -r requirements.txt
    cd ..
    
    # 前端依赖
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "All dependencies installed"
}

# 启动服务
start_services() {
    log_info "Starting services..."
    
    # 启动后端
    log_info "Starting backend service..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 5
    
    # 启动前端
    log_info "Starting frontend service..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_success "Services started"
    log_info "Backend PID: $BACKEND_PID"
    log_info "Frontend PID: $FRONTEND_PID"
    log_info "Frontend URL: http://localhost:5173"
    log_info "Backend URL: http://localhost:5000"
    
    # 保存 PID
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
}

# 停止服务
stop_services() {
    log_info "Stopping services..."
    
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
    fi
    
    log_success "Services stopped"
}

# 测试合约
test_contract() {
    log_info "Running contract tests..."
    
    cd contracts/kronos_prediction
    cargo test
    cd ../..
    
    log_success "Contract tests passed"
}

# 显示帮助
show_help() {
    echo "Kronos Prediction DApp - Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  check       - Check dependencies"
    echo "  install     - Install project dependencies"
    echo "  build       - Build smart contract"
    echo "  test        - Run contract tests"
    echo "  deploy      - Deploy contract to Westend"
    echo "  start       - Start backend and frontend services"
    echo "  stop        - Stop all services"
    echo "  full        - Full deployment (build + deploy + start)"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh check"
    echo "  ./deploy.sh full"
}

# 完整部署
full_deployment() {
    log_info "Starting full deployment..."
    
    check_dependencies
    install_dependencies
    build_contract
    test_contract
    
    read -p "Deploy contract to Westend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_contract
    fi
    
    read -p "Start services? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    fi
    
    log_success "Full deployment completed!"
}

# 主逻辑
main() {
    echo ""
    echo "═══════════════════════════════════════════════"
    echo "   Kronos Prediction DApp - Deployment Tool   "
    echo "═══════════════════════════════════════════════"
    echo ""
    
    case "${1:-help}" in
        check)
            check_dependencies
            ;;
        install)
            install_dependencies
            ;;
        build)
            build_contract
            ;;
        test)
            test_contract
            ;;
        deploy)
            deploy_contract
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        full)
            full_deployment
            ;;
        help|*)
            show_help
            ;;
    esac
    
    echo ""
    log_info "Done!"
}

# 执行主函数
main "$@"

