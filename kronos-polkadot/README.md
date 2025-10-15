# Kronos Prediction DApp

## 📘 项目简介

**Kronos Prediction DApp** 是一个基于 Polkadot 生态的去中心化预测应用，集成了先进的 Kronos AI 预测模型，用于加密货币价格预测。该项目部署在 **Polkadot 测试链 (Westend)** 上，实现链上预测提交、结果验证和奖励分发功能。

## 🏗️ 项目架构

```
kronos-polkadot/
├── contracts/           # Ink! 智能合约
│   └── kronos_prediction/
│       ├── Cargo.toml
│       ├── lib.rs
│       └── tests/
│           └── basic_tests.rs
│
├── frontend/            # React + Polkadot.js 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   └── PredictionPanel.tsx
│   │   └── api/
│   │       └── backend.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── backend/             # Node.js + Python API 服务
│   ├── server.js
│   ├── predict_service.py  # Kronos 模型预测服务
│   ├── routes/
│   │   └── predict.js
│   ├── model/           # Kronos 模型文件（从主项目复制）
│   ├── package.json
│   ├── requirements.txt
│   └── .env
│
├── scripts/             # 自动化脚本
│   ├── deploy.sh
│   └── config.json
│
└── README.md
```

## 🚀 技术栈

### 智能合约
- **语言**: Rust + Ink! v4
- **链**: Polkadot Westend 测试网
- **功能**: 预测提交、结果更新、奖励分发

### 前端
- **框架**: React 18 + TypeScript + Vite
- **Web3**: Polkadot.js API + Extension
- **UI**: Material-UI / Tailwind CSS

### 后端
- **API 服务**: Node.js + Express
- **AI 模型**: Python + Kronos-Tokenizer-base
- **数据源**: CoinGecko / Binance API

## ⚙️ 快速开始

### 1. 环境要求

| 组件 | 版本要求 |
|------|-----------|
| Rust | nightly |
| cargo-contract | ≥ 3.0.0 |
| Node.js | ≥ 18 |
| Python | ≥ 3.10 |
| Substrate Contracts Node | ≥ 0.28 |
| Polkadot.js Extension | 最新版 |

### 2. 安装依赖

#### 安装 Rust 和 cargo-contract
```bash
# 安装 Rust nightly
rustup install nightly
rustup default nightly

# 安装 cargo-contract
cargo install cargo-contract --force
```

#### 安装后端依赖
```bash
cd backend
npm install
pip install -r requirements.txt
```

#### 安装前端依赖
```bash
cd frontend
npm install
```

### 3. 配置环境变量

#### 后端 `.env`
```bash
PORT=5000
WS_PROVIDER=wss://westend-rpc.polkadot.io
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
COINGECKO_API_KEY=your_api_key_here
```

#### 前端 `.env`
```bash
VITE_CONTRACT_ADDRESS=5Fg9...YourContractAddress
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io
VITE_BACKEND_URL=http://localhost:5000
```

### 4. 编译和部署合约

```bash
cd contracts/kronos_prediction
cargo +nightly contract build
cargo contract instantiate --args 0 --suri //Alice --execute
```

### 5. 启动后端服务

```bash
cd backend
npm run start
```

后端将在 http://localhost:5000 启动

### 6. 启动前端

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:5173 启动

## 📡 API 接口

### 获取预测
```
GET /api/predict?symbol=ETH
```

**响应示例:**
```json
{
  "symbol": "ETH",
  "currentPrice": 2500.50,
  "prediction": {
    "price_24h": 2580.30,
    "confidence": 0.85,
    "timestamp": "2025-10-16T00:00:00Z"
  }
}
```

### 获取历史数据
```
GET /api/history?symbol=BTC&days=7
```

## 🔗 智能合约接口

### 提交预测
```rust
#[ink(message)]
pub fn submit_prediction(&mut self, symbol: String, value: u128)
```

### 更新结果
```rust
#[ink(message)]
pub fn update_result(&mut self, symbol: String, actual_value: u128)
```

### 查询预测
```rust
#[ink(message)]
pub fn get_prediction(&self, account: AccountId, symbol: String) -> Option<PredictionInfo>
```

### 发放奖励
```rust
#[ink(message)]
pub fn reward(&mut self, account: AccountId, amount: Balance)
```

## 🧪 测试

### 合约测试
```bash
cd contracts/kronos_prediction
cargo test
```

### 后端测试
```bash
cd backend
npm test
```

### 前端测试
```bash
cd frontend
npm test
```

## 📈 使用 Kronos 模型

Kronos 是一个专门用于金融市场预测的基础模型，支持多种加密货币的价格预测。

### 模型特点
- 基于 Transformer 架构
- 支持 OHLCV 数据输入
- 上下文长度: 512
- 参数量: 24.7M (Kronos-small)

### 预测示例
```python
from model import Kronos, KronosTokenizer, KronosPredictor

# 加载模型
tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
model = Kronos.from_pretrained("NeoQuasar/Kronos-small")

# 创建预测器
predictor = KronosPredictor(model, tokenizer, device="cuda:0", max_context=512)

# 进行预测
pred_df = predictor.predict(
    df=historical_data,
    x_timestamp=x_timestamp,
    y_timestamp=y_timestamp,
    pred_len=24,
    T=1.0,
    top_p=0.9,
    sample_count=1
)
```

## 🎯 功能特性

- ✅ 钱包连接 (Polkadot.js Extension)
- ✅ 实时价格预测
- ✅ 链上预测提交
- ✅ 自动结果验证
- ✅ 奖励分发机制
- ✅ 历史记录查询
- ✅ 多资产支持 (BTC, ETH, DOT, etc.)

## 🔮 路线图

### v1.0 (当前)
- [x] 基础预测功能
- [x] 智能合约部署
- [x] 前后端集成

### v1.1 (计划中)
- [ ] 高级预测算法
- [ ] 多时间维度预测 (1h, 4h, 24h)
- [ ] 社交功能 (排行榜)

### v2.0 (未来)
- [ ] 平行链集成
- [ ] XCMP 跨链通信
- [ ] 主网部署 (Astar/Moonbeam)

## 📚 文档

- [智能合约文档](./contracts/README.md)
- [前端文档](./frontend/README.md)
- [后端文档](./backend/README.md)
- [API 文档](./docs/API.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

## 🙏 致谢

- [Kronos](https://github.com/shiyu-coder/Kronos) - AI 预测模型
- [Polkadot](https://polkadot.network/) - 区块链基础设施
- [Ink!](https://use.ink/) - 智能合约框架

---

**版本**: v1.0  
**作者**: Kronos 团队  
**日期**: 2025-10-15

