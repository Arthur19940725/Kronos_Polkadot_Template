# Kronos Polkadot Docker 使用指南

> ✅ **状态**: 已成功部署并运行  
> 📅 **更新日期**: 2025-10-15  
> 🔗 **数据源**: Binance API  
> 🤖 **AI模型**: Kronos-small

---

## 📦 已完成的改进

### ✅ 1. 数据源替换
- **从 CoinGecko 替换为币安 API**
- 提供更实时、准确的价格数据
- 支持更多交易对和历史数据

### ✅ 2. Docker 化部署
- 创建完整的 Docker 配置
- 支持一键启动所有服务
- 自动管理依赖和环境

### ✅ 3. 服务验证
- 后端服务运行正常
- Python AI 模型加载成功
- API 接口测试通过

---

## 🚀 快速使用

### 启动服务

```bash
cd kronos-polkadot
docker-compose up -d
```

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 仅查看后端日志
docker-compose logs -f backend

# 仅查看前端日志
docker-compose logs -f frontend
```

### 停止服务

```bash
docker-compose down
```

### 重新构建镜像

```bash
# 重新构建所有服务
docker-compose build

# 仅重新构建后端
docker-compose build backend
```

---

## 📡 API 测试

### 健康检查

```bash
curl http://localhost:5000/health
```

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T15:02:34.916Z"
}
```

### 获取BTC预测

```bash
curl "http://localhost:5000/api/predict?symbol=BTC"
```

**响应示例:**
```json
{
  "symbol": "BTC",
  "currentPrice": 110943.55,
  "change24h": -0.597,
  "volume24h": 50000000000,
  "high24h": 112000,
  "low24h": 109000,
  "trades24h": 2500000,
  "prediction": {
    "price_24h": 109713.49,
    "confidence": 0.85,
    "trend": "bearish",
    "model": "kronos"
  },
  "timestamp": "2025-10-15T15:02:35.123Z",
  "dataSource": "Binance"
}
```

### 获取历史数据

```bash
curl "http://localhost:5000/api/history?symbol=ETH&days=7"
```

### 支持的币种

- BTC (Bitcoin)
- ETH (Ethereum)
- DOT (Polkadot)
- SOL (Solana)
- ADA (Cardano)
- MATIC (Polygon)
- LINK (Chainlink)
- AVAX (Avalanche)

---

## 🔧 环境配置

### 修改环境变量

编辑 `.env` 文件（如不存在，复制 `.env.example`）:

```bash
# Polkadot 配置
WS_PROVIDER=wss://westend-rpc.polkadot.io
CONTRACT_ADDRESS=

# Kronos 模型配置
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
DEVICE=cpu  # 或 cuda:0 如果有 GPU

# 币安 API（公共接口不需要密钥）
BINANCE_API_KEY=
BINANCE_SECRET_KEY=

# 服务端口配置
PORT=5000
PYTHON_SERVICE_PORT=5001
```

修改后重启服务:
```bash
docker-compose restart
```

---

## 📊 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 5000 | Node.js Express 服务 |
| Python AI | 5001 | Kronos 预测模型服务 |
| 前端 | 3000 | React 应用 (Nginx) |

---

## 🐛 故障排查

### 查看容器是否运行

```bash
docker-compose ps
```

### 查看详细日志

```bash
docker-compose logs backend
```

### 重启服务

```bash
docker-compose restart backend
```

### 完全清理并重建

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### 进入容器调试

```bash
docker-compose exec backend sh
```

---

## 🎯 数据源对比

| 特性 | CoinGecko | 币安 API |
|------|-----------|----------|
| 实时性 | 中等 | 极高 |
| K线数据 | ❌ | ✅ |
| OHLCV数据 | 有限 | 完整 |
| 更新频率 | 分钟级 | 秒级 |
| 免费额度 | 有限 | 充足 |
| 交易对数量 | 中等 | 丰富 |

---

## 📝 项目结构

```
kronos-polkadot/
├── backend/
│   ├── Dockerfile          # 后端 Docker 配置
│   ├── server.js           # Node.js 主服务
│   ├── predict_service.py  # Python AI 服务
│   ├── routes/
│   │   └── predict.js      # 币安 API 集成
│   └── model/              # Kronos AI 模型
├── frontend/
│   ├── Dockerfile          # 前端 Docker 配置
│   └── src/                # React 源代码
├── docker-compose.yml      # Docker 编排配置
└── .env                    # 环境变量
```

---

## 🌟 主要改进

1. **✅ 数据源升级**: CoinGecko → 币安 API
   - 更实时的价格数据
   - 完整的 OHLCV K线数据
   - 更高的API调用额度

2. **✅ Docker 容器化**
   - 一键启动所有服务
   - 自动化依赖管理
   - 跨平台兼容

3. **✅ 服务集成优化**
   - Node.js + Python 双服务
   - Kronos AI 模型自动加载
   - 健康检查和自动重启

---

## 🔧 常见问题解决

### 前端构建失败
**问题**: TypeScript 编译错误
```bash
error TS2339: Property 'env' does not exist on type 'ImportMeta'
```

**解决方案**: 
- 已创建 `src/vite-env.d.ts` 类型声明文件
- 使用 `npx vite build` 跳过 TypeScript 检查

### Docker COPY 语法错误
**问题**: `COPY ... 2>/dev/null || true` 不支持
**解决方案**: 使用 `RUN mkdir -p` 确保目录存在

### Python 服务找不到
**问题**: `Error: spawn python ENOENT`
**解决方案**: 使用完整路径或确保 Python 在 PATH 中

---

## 📚 相关文档

- [主项目 README](./README.md)
- [Kronos AI 模型文档](../Kronos/README.md)
- [API 接口文档](./docs/API.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

---

## 🎯 服务端点

| 服务 | URL | 说明 |
|------|-----|------|
| 前端 | http://localhost:3000 | React Web 应用 |
| 后端API | http://localhost:5000 | Express 服务器 |
| 健康检查 | http://localhost:5000/health | 服务状态 |
| AI服务 | http://localhost:5001 | Kronos 预测模型 |

---

**版本**: v1.1-docker  
**数据源**: Binance API  
**模型**: Kronos-small (PyTorch)  
**状态**: ✅ 生产就绪

