# 项目结构说明

Kronos Prediction DApp 完整项目结构和文件说明。

## 📁 目录树

```
kronos-polkadot/
├── contracts/                  # 智能合约
│   └── kronos_prediction/
│       ├── lib.rs             # 合约主逻辑
│       ├── Cargo.toml         # Rust 依赖配置
│       ├── tests/             # 合约测试
│       │   └── basic_tests.rs
│       └── .gitignore
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── main.tsx           # 入口文件
│   │   ├── App.tsx            # 主应用组件
│   │   ├── index.css          # 全局样式
│   │   ├── components/        # UI 组件
│   │   │   ├── WalletConnect.tsx
│   │   │   └── PredictionPanel.tsx
│   │   └── api/               # API 交互
│   │       └── backend.ts
│   ├── index.html             # HTML 模板
│   ├── package.json           # NPM 依赖
│   ├── tsconfig.json          # TypeScript 配置
│   ├── vite.config.ts         # Vite 配置
│   ├── .env.example           # 环境变量示例
│   └── README.md              # 前端文档
│
├── backend/                    # Node.js 后端
│   ├── server.js              # Express 服务器
│   ├── predict_service.py     # Python 预测服务
│   ├── routes/                # API 路由
│   │   └── predict.js
│   ├── model/                 # Kronos 模型文件
│   │   ├── __init__.py
│   │   ├── kronos.py
│   │   └── module.py
│   ├── package.json           # NPM 依赖
│   ├── requirements.txt       # Python 依赖
│   ├── .env.example           # 环境变量示例
│   └── README.md              # 后端文档
│
├── scripts/                    # 部署脚本
│   ├── deploy.sh              # Linux/Mac 部署脚本
│   ├── deploy.ps1             # Windows 部署脚本
│   ├── config.json            # 部署配置
│   └── README.md              # 脚本文档
│
├── docs/                       # 项目文档
│   └── API.md                 # API 文档
│
├── README.md                   # 项目说明
├── QUICKSTART.md              # 快速开始指南
├── CONTRIBUTING.md            # 贡献指南
├── LICENSE                     # MIT 许可证
├── .gitignore                 # Git 忽略配置
└── PROJECT_STRUCTURE.md       # 本文件
```

## 📄 核心文件说明

### 智能合约 (contracts/)

| 文件 | 说明 | 技术栈 |
|------|------|--------|
| `lib.rs` | Ink! 智能合约主逻辑 | Rust + Ink! |
| `Cargo.toml` | Rust 项目配置和依赖 | TOML |
| `tests/basic_tests.rs` | 单元测试 | Rust |

**核心功能:**
- `submit_prediction()` - 提交预测
- `update_result()` - 更新实际结果
- `get_prediction()` - 查询预测
- `distribute_reward()` - 发放奖励
- `withdraw_reward()` - 提取奖励

### 前端 (frontend/)

| 文件 | 说明 | 技术栈 |
|------|------|--------|
| `App.tsx` | 主应用组件 | React + TypeScript |
| `WalletConnect.tsx` | 钱包连接组件 | Polkadot.js |
| `PredictionPanel.tsx` | 预测面板组件 | Material-UI + Recharts |
| `backend.ts` | API 和区块链交互 | Axios + Polkadot.js API |

**核心功能:**
- 钱包连接和账户管理
- 实时价格查询
- AI 预测展示
- 链上交易提交
- 数据可视化

### 后端 (backend/)

| 文件 | 说明 | 技术栈 |
|------|------|--------|
| `server.js` | Express 服务器 | Node.js + Express |
| `predict_service.py` | Kronos 预测服务 | Python + Flask |
| `routes/predict.js` | 预测 API 路由 | Express Router |
| `model/` | Kronos 模型文件 | PyTorch |

**核心功能:**
- RESTful API 服务
- Kronos 模型集成
- 价格数据获取（CoinGecko）
- 预测计算和处理

### 部署脚本 (scripts/)

| 文件 | 说明 | 平台 |
|------|------|------|
| `deploy.sh` | Bash 部署脚本 | Linux/Mac |
| `deploy.ps1` | PowerShell 部署脚本 | Windows |
| `config.json` | 部署配置文件 | 所有平台 |

**支持命令:**
- `check` - 检查依赖
- `install` - 安装依赖
- `build` - 构建合约
- `test` - 运行测试
- `deploy` - 部署合约
- `start` - 启动服务
- `stop` - 停止服务
- `full` - 完整部署

## 🔧 配置文件

### 环境变量

**backend/.env**
```bash
PORT=5000
WS_PROVIDER=wss://westend-rpc.polkadot.io
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
DEVICE=cpu
PYTHON_SERVICE_PORT=5001
COINGECKO_API_KEY=
CONTRACT_ADDRESS=
```

**frontend/.env**
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=
```

### 部署配置

**scripts/config.json**
```json
{
  "network": "westend",
  "rpc_url": "wss://westend-rpc.polkadot.io",
  "deployer_account": "//Alice",
  "contract": {
    "name": "kronos_prediction",
    "gas_limit": 30000000000
  }
}
```

## 🔄 数据流

### 1. 预测流程

```
用户 → 前端 → 后端 API → Python 服务 → Kronos 模型
                  ↓
              CoinGecko API
                  ↓
            历史价格数据
                  ↓
            预测结果 → 前端展示
```

### 2. 链上提交流程

```
用户输入预测 → 前端验证 → Polkadot.js 签名
                              ↓
                        智能合约调用
                              ↓
                        链上存储预测
                              ↓
                        交易确认 → 前端反馈
```

### 3. 奖励流程

```
24小时后 → 系统更新实际结果 → 计算预测准确度
                                    ↓
                            准确度 < 5% → 高额奖励
                            准确度 5-10% → 中等奖励
                            准确度 10-20% → 小额奖励
                            准确度 > 20% → 无奖励
                                    ↓
                            用户提取奖励
```

## 🌐 网络架构

### 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | 5173 | Vite 开发服务器 |
| Backend API | 5000 | Node.js Express |
| Python Service | 5001 | Flask 预测服务 |
| Westend RPC | 443 | WebSocket (wss) |

### 服务通信

```
Frontend (5173)
    ↓ HTTP
Backend API (5000)
    ↓ HTTP
Python Service (5001)
    ↓ HTTP
Kronos Model

Frontend (5173)
    ↓ WebSocket
Polkadot Westend (wss)
    ↓
Smart Contract
```

## 📦 依赖管理

### Rust 依赖

```toml
[dependencies]
ink = "4.3"
scale = "3"
scale-info = "2.6"
```

### Node.js 依赖

```json
{
  "express": "^4.18.2",
  "axios": "^1.6.2",
  "@polkadot/api": "^10.11.2"
}
```

### Python 依赖

```
torch>=2.0.0
pandas>=2.0.0
numpy>=1.24.0
flask>=3.0.0
huggingface_hub==0.33.1
```

### React 依赖

```json
{
  "react": "^18.2.0",
  "@mui/material": "^5.15.0",
  "@polkadot/api": "^10.11.2",
  "recharts": "^2.10.3"
}
```

## 🔐 安全考虑

### 私钥管理

- ✅ 使用环境变量
- ✅ .env 文件加入 .gitignore
- ✅ 通过 Polkadot.js Extension 签名
- ❌ 永不硬编码私钥

### 合约安全

- ✅ 访问控制（仅所有者）
- ✅ 输入验证
- ✅ 防重入保护
- ✅ Gas 限制

### API 安全

- 待实现：速率限制
- 待实现：API Key 认证
- 待实现：CORS 配置
- 待实现：请求签名

## 📊 性能指标

### 预期性能

| 指标 | 目标值 |
|------|--------|
| API 响应时间 | < 500ms |
| 预测计算时间 | < 3s |
| 链上交易确认 | < 30s |
| 前端首屏加载 | < 2s |

### 优化建议

1. **缓存策略**
   - Redis 缓存预测结果
   - 浏览器缓存静态资源
   - 模型结果缓存

2. **并发处理**
   - 批量预测接口
   - 异步任务队列
   - WebSocket 推送

3. **资源优化**
   - 代码分割
   - 懒加载组件
   - CDN 加速

## 📝 开发规范

### Git 工作流

```bash
main (生产)
  ↑
develop (开发)
  ↑
feature/* (功能分支)
fix/* (修复分支)
```

### 代码规范

- Rust: rustfmt + clippy
- TypeScript: ESLint + Prettier
- Python: Black + Flake8

### 测试策略

- 单元测试: 覆盖率 > 80%
- 集成测试: 核心流程
- E2E 测试: 关键路径

## 🚀 部署策略

### 测试网部署

1. 构建合约
2. 部署到 Westend
3. 配置前端
4. 启动服务

### 主网部署

1. 完整测试
2. 安全审计
3. 逐步发布
4. 监控告警

## 📈 扩展计划

### v1.1
- 多时间维度预测
- 批量预测 API
- WebSocket 实时推送

### v2.0
- 平行链集成
- XCMP 跨链
- 去中心化治理

### v3.0
- AI 模型市场
- 策略回测
- 社交功能

## 📚 参考资源

- [Ink! 文档](https://use.ink/)
- [Polkadot.js 文档](https://polkadot.js.org/docs/)
- [Kronos 模型](https://github.com/shiyu-coder/Kronos)
- [Material-UI](https://mui.com/)

---

**最后更新**: 2025-10-15  
**版本**: 1.0.0

