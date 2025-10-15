# 🚀 快速开始指南

在 15 分钟内启动 Kronos Prediction DApp！

## 📋 前置要求

### 必需软件

| 软件 | 版本 | 安装链接 |
|------|------|----------|
| Rust | nightly | https://rustup.rs/ |
| Node.js | 18+ | https://nodejs.org/ |
| Python | 3.10+ | https://python.org/ |
| cargo-contract | 3.0+ | `cargo install cargo-contract` |

### 浏览器扩展

- [Polkadot.js Extension](https://polkadot.js.org/extension/)

## ⚡ 5 步快速启动

### 1️⃣ 克隆项目

```bash
git clone https://github.com/your-repo/kronos-polkadot.git
cd kronos-polkadot
```

### 2️⃣ 安装依赖

**Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh install
```

**Windows:**
```powershell
.\scripts\deploy.ps1 install
```

### 3️⃣ 构建合约

```bash
# Linux/Mac
./scripts/deploy.sh build

# Windows
.\scripts\deploy.ps1 build
```

### 4️⃣ 配置环境

```bash
# 后端配置
cd backend
cp .env.example .env
# 编辑 .env，配置 API keys

# 前端配置  
cd ../frontend
cp .env.example .env
# 编辑 .env，配置合约地址（部署后）
```

### 5️⃣ 启动服务

```bash
# Linux/Mac
./scripts/deploy.sh start

# Windows
.\scripts\deploy.ps1 start
```

✅ 访问 http://localhost:5173

## 🔗 部署到测试网

### 准备账户

1. 安装 Polkadot.js Extension
2. 创建新账户或导入现有账户
3. 记录助记词（安全保管！）

### 获取测试币

访问 [Westend Faucet](https://faucet.polkadot.io/westend)：
1. 输入您的地址
2. 完成验证
3. 接收测试 WND

### 配置部署账户

编辑 `scripts/config.json`：

```json
{
  "deployer_account": "//你的助记词或密钥"
}
```

⚠️ **警告**: 生产环境请使用环境变量管理私钥！

### 执行部署

```bash
# Linux/Mac
./scripts/deploy.sh deploy

# Windows
.\scripts\deploy.ps1 deploy
```

部署成功后，记录合约地址并更新 `frontend/.env`：

```bash
VITE_CONTRACT_ADDRESS=5Fg9...YourContractAddress
```

## 📱 使用 DApp

### 连接钱包

1. 点击右上角 "Connect Wallet"
2. 选择账户
3. 授权连接

### 进行预测

1. 选择资产（如 BTC）
2. 查看 AI 预测
3. 输入您的预测价格
4. 点击 "Submit to Chain"
5. 在 Polkadot.js Extension 中确认交易

### 查看结果

- 交易成功后会显示区块哈希
- 24小时后系统会计算准确度
- 根据准确度发放奖励

## 🔍 验证部署

### 检查合约

访问 [Polkadot.js Apps](https://polkadot.js.org/apps/):

1. 连接到 Westend
2. Developer → Contracts
3. 查找您的合约地址
4. 测试合约调用

### 测试 API

```bash
# 健康检查
curl http://localhost:5000/health

# 获取预测
curl http://localhost:5000/api/predict?symbol=BTC

# 历史数据
curl http://localhost:5000/api/history?symbol=BTC&days=7
```

## 🐛 常见问题

### Q: 合约构建失败

**A:** 确保使用 Rust nightly：
```bash
rustup install nightly
rustup default nightly
```

### Q: 无法连接钱包

**A:** 
1. 安装 Polkadot.js Extension
2. 创建至少一个账户
3. 刷新页面

### Q: API 请求失败

**A:** 
1. 确认后端服务正在运行
2. 检查端口是否被占用
3. 查看控制台错误日志

### Q: 预测提交失败

**A:**
1. 确保账户有足够余额
2. 检查合约地址是否正确
3. 增加 gas 限制

### Q: Python 服务启动失败

**A:**
```bash
# 安装依赖
pip install -r backend/requirements.txt

# 检查 Kronos 模型
ls backend/model/
```

## 📊 性能优化

### 使用 GPU 加速

如果有 NVIDIA GPU：

```bash
# 安装 CUDA PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 更新配置
# backend/.env
DEVICE=cuda:0
```

### 缓存模型

首次加载 Kronos 模型较慢（下载约 100MB）。模型会缓存到：
- Linux/Mac: `~/.cache/huggingface/`
- Windows: `C:\Users\YourName\.cache\huggingface\`

### 优化前端

```bash
# 构建生产版本
cd frontend
npm run build

# 使用 CDN 加速
# 在 index.html 添加资源预加载
```

## 🔒 安全检查清单

- [ ] 私钥使用环境变量管理
- [ ] 生产环境启用 HTTPS
- [ ] 限制 API 请求频率
- [ ] 定期更新依赖包
- [ ] 启用合约访问控制
- [ ] 设置合理的 gas 限制
- [ ] 监控异常交易

## 📚 下一步

- [ ] 阅读[完整文档](./README.md)
- [ ] 了解[智能合约](./contracts/README.md)
- [ ] 探索[API 文档](./backend/README.md)
- [ ] 自定义[前端界面](./frontend/README.md)
- [ ] 加入[社区讨论](#)

## 🆘 获取帮助

- 📖 [文档](./README.md)
- 💬 [Discord](#)
- 📧 [Email](mailto:support@kronos.dev)
- 🐛 [报告 Bug](https://github.com/your-repo/issues)

---

**祝您使用愉快！** 🎉

如有问题，欢迎随时联系我们。

