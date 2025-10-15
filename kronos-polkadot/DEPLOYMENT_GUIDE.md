# 🚀 Kronos Prediction DApp 完整部署指南

本指南将帮助您从零开始部署 Kronos Prediction DApp 到 Polkadot Westend 测试网。

## 📋 目录

1. [环境准备](#环境准备)
2. [安装依赖](#安装依赖)
3. [配置项目](#配置项目)
4. [构建合约](#构建合约)
5. [部署合约](#部署合约)
6. [启动服务](#启动服务)
7. [测试验证](#测试验证)
8. [常见问题](#常见问题)

---

## 1. 环境准备

### 1.1 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **内存**: 至少 8GB RAM
- **磁盘**: 至少 10GB 可用空间
- **网络**: 稳定的互联网连接

### 1.2 安装必需软件

#### Rust (nightly)

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 nightly 版本
rustup install nightly
rustup default nightly

# 添加 wasm 目标
rustup target add wasm32-unknown-unknown --toolchain nightly
```

#### cargo-contract

```bash
cargo install cargo-contract --force --locked
```

#### Node.js (18+)

```bash
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 或者从官网下载
# https://nodejs.org/
```

#### Python (3.10+)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3.10 python3-pip

# macOS
brew install python@3.10

# Windows
# 从 https://python.org 下载安装
```

#### Polkadot.js Extension

- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org
- 搜索 "Polkadot.js extension"

### 1.3 验证安装

```bash
rustc --version     # 应该是 nightly 版本
cargo --version
cargo-contract --version
node --version      # 应该 >= 18
python3 --version   # 应该 >= 3.10
```

---

## 2. 安装依赖

### 2.1 克隆项目

```bash
git clone https://github.com/your-repo/kronos-polkadot.git
cd kronos-polkadot
```

### 2.2 使用自动化脚本

#### Linux/Mac

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh install
```

#### Windows

```powershell
.\scripts\deploy.ps1 install
```

### 2.3 手动安装（可选）

#### 后端依赖

```bash
cd backend

# Node.js 依赖
npm install

# Python 依赖
pip install -r requirements.txt

# 复制 Kronos 模型（如果还没有）
# 模型文件应该已经在 backend/model/ 目录
```

#### 前端依赖

```bash
cd frontend
npm install
```

---

## 3. 配置项目

### 3.1 后端配置

创建 `backend/.env`:

```bash
cd backend
cp .env.example .env
```

编辑 `.env`:

```bash
# 服务端口
PORT=5000

# Polkadot 节点
WS_PROVIDER=wss://westend-rpc.polkadot.io

# Kronos 模型配置
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base

# 设备配置
DEVICE=cpu
# 如果有 GPU: DEVICE=cuda:0

# Python 服务端口
PYTHON_SERVICE_PORT=5001

# CoinGecko API Key (可选，提高请求限制)
# 获取: https://www.coingecko.com/en/api
COINGECKO_API_KEY=

# 合约地址（部署后填写）
CONTRACT_ADDRESS=
```

### 3.2 前端配置

创建 `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

编辑 `.env`:

```bash
# 后端 API
VITE_BACKEND_URL=http://localhost:5000

# Polkadot WebSocket
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io

# 合约地址（部署后填写）
VITE_CONTRACT_ADDRESS=
```

### 3.3 部署脚本配置

编辑 `scripts/config.json`:

```json
{
  "network": "westend",
  "rpc_url": "wss://westend-rpc.polkadot.io",
  "deployer_account": "//Alice",  // 开发环境用
  "contract": {
    "name": "kronos_prediction",
    "version": "0.1.0",
    "constructor": "new",
    "gas_limit": 30000000000
  }
}
```

⚠️ **生产环境**: 将 `deployer_account` 改为您的助记词或使用环境变量

---

## 4. 构建合约

### 4.1 自动构建

```bash
# Linux/Mac
./scripts/deploy.sh build

# Windows
.\scripts\deploy.ps1 build
```

### 4.2 手动构建

```bash
cd contracts/kronos_prediction

# 清理之前的构建
cargo clean

# 构建合约
cargo +nightly contract build --release

# 验证构建产物
ls -la target/ink/
# 应该看到 kronos_prediction.contract, kronos_prediction.wasm
```

### 4.3 运行测试

```bash
# 在 contracts/kronos_prediction 目录
cargo test

# 或使用脚本
./scripts/deploy.sh test
```

---

## 5. 部署合约

### 5.1 准备部署账户

#### 创建账户

1. 打开 Polkadot.js Extension
2. 点击 "+"
3. 选择 "Create new account"
4. 备份助记词（非常重要！）
5. 设置账户名称和密码

#### 获取测试币

1. 访问 https://faucet.polkadot.io/westend
2. 输入您的 Westend 地址
3. 完成验证
4. 等待接收测试 WND

验证余额：
```bash
# 使用 Polkadot.js Apps
https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts
```

### 5.2 配置部署账户

**方法 1: 使用助记词（推荐）**

编辑 `scripts/config.json`:
```json
{
  "deployer_account": "bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice"
}
```

**方法 2: 使用环境变量**

```bash
export DEPLOYER_SEED="your-12-word-mnemonic"
```

### 5.3 执行部署

#### 使用脚本

```bash
# Linux/Mac
./scripts/deploy.sh deploy

# Windows
.\scripts\deploy.ps1 deploy
```

#### 手动部署

```bash
cd contracts/kronos_prediction

cargo contract instantiate \
  --url wss://westend-rpc.polkadot.io \
  --suri "你的助记词" \
  --constructor new \
  --execute
```

### 5.4 记录部署信息

部署成功后，您会看到类似输出：

```
Contract 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
Block hash 0x1234...5678
```

**立即保存**:
1. 合约地址: `5FHneW46...`
2. 区块哈希: `0x1234...5678`
3. 交易哈希

### 5.5 更新配置

更新 `backend/.env`:
```bash
CONTRACT_ADDRESS=5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
```

更新 `frontend/.env`:
```bash
VITE_CONTRACT_ADDRESS=5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
```

---

## 6. 启动服务

### 6.1 使用脚本启动

```bash
# Linux/Mac
./scripts/deploy.sh start

# Windows
.\scripts\deploy.ps1 start
```

### 6.2 手动启动

#### 启动后端

```bash
cd backend

# 启动 Node.js 服务
node server.js

# 或使用 npm
npm start
```

后端会自动启动 Python 预测服务。

#### 启动前端

```bash
cd frontend

# 启动开发服务器
npm run dev
```

### 6.3 验证服务

打开浏览器：

- 前端: http://localhost:5173
- 后端: http://localhost:5000/health
- Python 服务: http://localhost:5001/health

---

## 7. 测试验证

### 7.1 后端 API 测试

```bash
# 健康检查
curl http://localhost:5000/health

# 获取 BTC 预测
curl "http://localhost:5000/api/predict?symbol=BTC"

# 获取历史数据
curl "http://localhost:5000/api/history?symbol=BTC&days=7"

# 支持的资产
curl http://localhost:5000/api/assets
```

### 7.2 前端功能测试

1. **连接钱包**
   - 点击右上角 "Connect Wallet"
   - 选择账户
   - 授权连接

2. **查看预测**
   - 选择资产（如 BTC）
   - 查看当前价格
   - 查看 AI 预测
   - 查看图表

3. **提交预测**
   - 输入预测价格
   - 点击 "Submit to Chain"
   - 在 Extension 中确认交易
   - 等待确认

### 7.3 合约交互测试

使用 Polkadot.js Apps:

1. 访问 https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io
2. Developer → Contracts
3. 添加已部署的合约
4. 测试合约方法：
   - `submit_prediction`
   - `get_prediction`
   - `get_reward_balance`

---

## 8. 常见问题

### Q1: 合约构建失败

**问题**: `error: package `ink_env v4.x.x` cannot be built`

**解决**:
```bash
rustup update nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
cargo clean
cargo +nightly contract build
```

### Q2: 部署时余额不足

**问题**: `Inability to pay some fees`

**解决**:
1. 访问 https://faucet.polkadot.io/westend
2. 获取更多测试 WND
3. 等待余额到账
4. 重新部署

### Q3: 前端无法连接钱包

**问题**: Extension not found

**解决**:
1. 安装 Polkadot.js Extension
2. 创建至少一个账户
3. 刷新页面
4. 点击 "Connect Wallet"

### Q4: Python 服务启动失败

**问题**: `ModuleNotFoundError: No module named 'model'`

**解决**:
```bash
cd backend

# 确认模型文件存在
ls -la model/

# 重新安装依赖
pip install -r requirements.txt

# 检查 Python 路径
python3 -c "import sys; print(sys.path)"
```

### Q5: API 请求超时

**问题**: Prediction timeout

**解决**:
1. 检查 Python 服务是否运行
2. 增加超时时间（routes/predict.js）
3. 使用 CPU 时预测较慢，考虑使用 GPU

### Q6: 合约调用失败

**问题**: `ContractTrapped` 错误

**解决**:
1. 检查 gas 限制是否足够
2. 验证合约地址是否正确
3. 确认账户有足够余额
4. 查看浏览器控制台详细错误

### Q7: 模型下载慢

**问题**: Kronos model download slow

**解决**:
```bash
# 使用镜像源
export HF_ENDPOINT=https://hf-mirror.com

# 或手动下载模型
# 从 https://huggingface.co/NeoQuasar/Kronos-small
```

---

## 🎉 部署完成！

恭喜！您已成功部署 Kronos Prediction DApp。

### 后续步骤

1. 📚 阅读 [API 文档](./docs/API.md)
2. 🔧 自定义前端界面
3. 🚀 优化预测算法
4. 📊 添加更多资产支持
5. 🌐 部署到生产环境

### 获取帮助

- 📖 [完整文档](./README.md)
- 💬 [Discord 社区](#)
- 🐛 [报告问题](https://github.com/your-repo/issues)
- 📧 [联系我们](mailto:support@kronos.dev)

---

**祝您使用愉快！** 🚀✨

