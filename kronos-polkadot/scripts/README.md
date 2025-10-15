# 部署脚本说明

本目录包含用于部署和管理 Kronos Prediction DApp 的自动化脚本。

## 文件列表

| 文件 | 说明 | 平台 |
|------|------|------|
| `deploy.sh` | 部署脚本 | Linux/Mac |
| `deploy.ps1` | 部署脚本 | Windows |
| `config.json` | 配置文件 | 所有平台 |

## 使用方法

### Linux/Mac

```bash
# 赋予执行权限
chmod +x scripts/deploy.sh

# 检查依赖
./scripts/deploy.sh check

# 完整部署
./scripts/deploy.sh full
```

### Windows

```powershell
# 检查依赖
.\scripts\deploy.ps1 check

# 完整部署
.\scripts\deploy.ps1 full
```

## 命令说明

| 命令 | 功能 |
|------|------|
| `check` | 检查系统依赖是否安装 |
| `install` | 安装项目依赖 |
| `build` | 构建智能合约 |
| `test` | 运行合约测试 |
| `deploy` | 部署合约到链上 |
| `start` | 启动服务 |
| `stop` | 停止服务 |
| `full` | 完整部署流程 |
| `help` | 显示帮助信息 |

## 配置文件

`config.json` 包含部署配置：

```json
{
  "network": "westend",
  "rpc_url": "wss://westend-rpc.polkadot.io",
  "deployer_account": "//Alice",
  "contract": {
    "name": "kronos_prediction",
    "version": "0.1.0",
    "constructor": "new",
    "gas_limit": 30000000000
  }
}
```

### 配置项说明

- **network**: 目标网络（westend/polkadot/local）
- **rpc_url**: RPC 节点地址
- **deployer_account**: 部署账户（助记词/密钥/开发账户）
- **gas_limit**: Gas 限制

### 网络选项

| 网络 | RPC URL | 说明 |
|------|---------|------|
| Westend | wss://westend-rpc.polkadot.io | 测试网 |
| Polkadot | wss://rpc.polkadot.io | 主网 |
| Local | ws://127.0.0.1:9944 | 本地节点 |

## 部署流程

### 1. 准备环境

确保已安装：
- Rust (nightly)
- cargo-contract ≥ 3.0.0
- Node.js ≥ 18
- Python ≥ 3.10

### 2. 配置账户

编辑 `config.json`：

**开发环境：**
```json
"deployer_account": "//Alice"
```

**生产环境：**
```json
"deployer_account": "//你的助记词或密钥"
```

### 3. 执行部署

```bash
# Linux/Mac
./scripts/deploy.sh full

# Windows
.\scripts\deploy.ps1 full
```

### 4. 验证部署

部署成功后会显示：
- 合约地址
- 区块哈希
- 交易详情

## 故障排除

### 依赖检查失败

**问题**: `cargo-contract not found`

**解决**:
```bash
cargo install cargo-contract --force
```

### 构建失败

**问题**: Contract build failed

**解决**:
```bash
rustup install nightly
rustup default nightly
cargo clean
cargo +nightly contract build
```

### 部署失败

**问题**: Insufficient balance

**解决**: 
1. 确保账户有足够余额
2. 访问水龙头获取测试币：https://faucet.polkadot.io/westend

**问题**: Gas estimation failed

**解决**: 增加 `config.json` 中的 `gas_limit`

### 服务启动失败

**问题**: Port already in use

**解决**:
```bash
# Linux/Mac
./scripts/deploy.sh stop

# Windows
.\scripts\deploy.ps1 stop
```

## 高级用法

### 自定义 Gas 限制

编辑 `config.json`：
```json
"contract": {
  "gas_limit": 50000000000  // 增加到 50B
}
```

### 使用本地节点

1. 启动本地 Substrate Contracts Node：
```bash
substrate-contracts-node --dev
```

2. 修改 `config.json`：
```json
"rpc_url": "ws://127.0.0.1:9944"
```

### 部署到主网

⚠️ **警告**: 主网部署需要真实资金

1. 修改 `config.json`：
```json
"network": "polkadot",
"rpc_url": "wss://rpc.polkadot.io",
"deployer_account": "你的主网账户"
```

2. 确保账户有足够 DOT
3. 执行部署

## 持续集成

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Contract

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: nightly
      - name: Install cargo-contract
        run: cargo install cargo-contract
      - name: Build Contract
        run: ./scripts/deploy.sh build
      - name: Deploy
        run: ./scripts/deploy.sh deploy
        env:
          DEPLOYER_KEY: ${{ secrets.DEPLOYER_KEY }}
```

## 安全建议

1. ✅ 永远不要在配置文件中存储真实私钥
2. ✅ 使用环境变量管理敏感信息
3. ✅ 在主网部署前充分测试
4. ✅ 定期备份部署记录
5. ✅ 使用多签账户管理重要合约

## 许可证

MIT License

