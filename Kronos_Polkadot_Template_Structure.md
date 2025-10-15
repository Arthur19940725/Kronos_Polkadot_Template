# Kronos DApp — Polkadot 测试链部署模板大纲

## 📘 一、项目简介
**项目名称：** Kronos Prediction DApp  
**目标：** 将基于 Kronos 模型的加密货币预测系统部署到 **Polkadot 测试链 (Westend)**，实现链上预测、奖励、与数据交互功能。  

---

## 🧱 二、总体结构
```
kronos-polkadot/
├── contracts/           # 智能合约 (Ink!)
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
├── backend/             # Node.js API 服务
│   ├── server.js
│   ├── routes/
│   │   └── predict.js
│   ├── package.json
│   └── .env
│
├── scripts/             # 自动化脚本与配置
│   ├── deploy.sh
│   └── config.json
│
└── README.md
```

---

## ⚙️ 三、模块说明

### 1️⃣ contracts/kronos_prediction
- **语言**：Rust + Ink!
- **功能**：  
  - 提交预测 (`submit_prediction`)  
  - 更新结果 (`update_result`)  
  - 查询预测 (`get_prediction`)  
  - 奖励发放 (`reward`)  
- **关键文件：**
  - `lib.rs`：智能合约主逻辑  
  - `Cargo.toml`：依赖与构建配置  
  - `basic_tests.rs`：合约单元测试  

---

### 2️⃣ frontend/
- **技术栈**：React + TypeScript + Polkadot.js  
- **主要功能**：
  - 用户连接钱包  
  - 提交预测表单  
  - 实时展示预测结果  
  - 调用后端预测API  
- **关键组件：**
  - `WalletConnect.tsx`：钱包登录与账户选择  
  - `PredictionPanel.tsx`：预测交互界面  
  - `App.tsx`：主入口文件  
  - `.env`：链地址与合约配置  

---

### 3️⃣ backend/
- **语言**：Node.js (Express)
- **功能**：
  - 调用外部行情API (CoinGecko / Binance)
  - 模拟或连接AI预测模型
  - 提供REST API供前端调用
- **关键文件**：
  - `server.js`：主服务入口  
  - `routes/predict.js`：预测路由逻辑  
  - `.env`：服务配置变量（端口、AI模型URL等）

---

### 4️⃣ scripts/
- **文件：**
  - `deploy.sh`：自动化部署合约脚本  
  - `config.json`：测试链配置、节点RPC、账户信息  

---

## 🧩 四、核心代码片段概览

### 🦀 `lib.rs` 核心逻辑摘要
```rust
#[ink::contract]
mod kronos_prediction {
    #[ink(storage)]
    pub struct KronosPrediction {
        predictions: Mapping<(AccountId, String), u128>,
        actual_results: Mapping<String, u128>,
    }

    #[ink(message)]
    pub fn submit_prediction(&mut self, symbol: String, value: u128) { ... }

    #[ink(message)]
    pub fn get_prediction(&self, account: AccountId, symbol: String) -> Option<u128> { ... }
}
```

---

### ⚛️ `App.tsx` 前端核心逻辑摘要
```tsx
const contract = new ContractPromise(api, abi, contractAddress);
await contract.tx.submitPrediction({ value: 0, gasLimit: 30000000000 }, symbol, value);
```

---

### 🧠 `server.js` 后端核心逻辑摘要
```js
app.get("/api/predict", async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase() || "ETH";
  const data = await fetchPrice(symbol);
  const prediction = data * (1 + (Math.random() - 0.5) * 0.1);
  res.json({ symbol, prediction });
});
```

---

## 🧰 五、环境配置

### 系统要求
| 组件 | 版本要求 |
|------|-----------|
| Rust | nightly |
| cargo-contract | ≥ 3.0.0 |
| Node.js | ≥ 18 |
| Substrate Contracts Node | ≥ 0.28 |
| Polkadot.js Extension | 最新版 |

### 环境变量（`.env`）
```bash
VITE_CONTRACT_ADDRESS=5Fg9...PolkadotContractAddress
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io
PORT=5000
AI_MODEL_URL=https://api.kronosai.dev/predict
```

---

## 🧠 六、任务阶段规划
| 阶段 | 内容 | 输出 |
|------|------|------|
| 第1周 | 环境搭建 + Ink! 合约编译 | 合约 `.contract` 文件 |
| 第2周 | 前后端联调 + 钱包连接 | UI + API交互验证 |
| 第3周 | 测试与部署到 Westend | 链上运行版本 |
| 第4周 | 优化预测逻辑与奖励机制 | 版本 v1.1 |

---

## ☁️ 七、运行命令示例
```bash
# 启动后端
cd backend
npm install && npm run start

# 启动前端
cd ../frontend
npm install && npm run dev

# 构建合约
cd ../contracts/kronos_prediction
cargo +nightly contract build
```

---

## ✅ 八、交付成果
- ✅ Ink! 合约在 Polkadot Testnet 上成功部署  
- ✅ 前端交互界面与钱包连接正常  
- ✅ 后端AI预测接口可调用  
- ✅ 提交预测交易链上可验证  
- ✅ 提供完整文档与视频演示  

---

## 🔮 九、未来扩展方向
- 多资产预测支持 (BTC, DOT, SOL, 等)
- 平行链集成与 XCMP 跨链通信
- AI 模型与奖励算法升级
- 上线至 Astar / Moonbeam 主网

---

**版本：** v1.0  
**作者：** Kronos 团队  
**日期：** 2025-10-15  
