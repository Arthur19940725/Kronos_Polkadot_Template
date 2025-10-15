# Kronos Prediction Backend

后端服务集成了 Kronos AI 模型，提供加密货币价格预测 API。

## 架构

```
backend/
├── server.js              # Node.js Express 服务器
├── predict_service.py     # Python Flask 预测服务（Kronos 模型）
├── routes/
│   └── predict.js         # 预测路由
├── model/                 # Kronos 模型文件（从主项目复制）
│   ├── __init__.py
│   ├── kronos.py
│   └── module.py
├── package.json
├── requirements.txt
└── .env
```

## 安装

### 1. 安装 Node.js 依赖

```bash
npm install
```

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 3. 复制 Kronos 模型文件

需要将 Kronos 模型文件复制到 `backend/model/` 目录：

```bash
# 从主 Kronos 项目复制
cp -r ../../Kronos/model/* ./model/
```

或者创建符号链接：

```bash
# Linux/Mac
ln -s ../../Kronos/model ./model

# Windows (需要管理员权限)
mklink /D model ..\..\Kronos\model
```

### 4. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的参数。

## 运行

### 启动服务

```bash
npm start
```

这将同时启动：
- Node.js Express 服务器（端口 5000）
- Python Flask 预测服务（端口 5001）

### 开发模式（自动重启）

```bash
npm run dev
```

## API 文档

### 1. 获取预测

**请求:**
```
GET /api/predict?symbol=BTC
```

**响应:**
```json
{
  "symbol": "BTC",
  "currentPrice": 45000.50,
  "change24h": 2.5,
  "volume24h": 25000000000,
  "prediction": {
    "price_24h": 46200.30,
    "confidence": 0.85,
    "trend": "bullish",
    "predictions": [
      {
        "hour": 1,
        "price": 45150.20,
        "timestamp": "2025-10-16T01:00:00Z"
      },
      ...
    ],
    "model": "kronos"
  },
  "timestamp": "2025-10-15T12:00:00Z"
}
```

### 2. 获取历史数据

**请求:**
```
GET /api/history?symbol=BTC&days=7
```

**响应:**
```json
{
  "symbol": "BTC",
  "days": 7,
  "data": {
    "prices": [[timestamp, price], ...],
    "volumes": [[timestamp, volume], ...],
    "marketCaps": [[timestamp, marketCap], ...]
  },
  "timestamp": "2025-10-15T12:00:00Z"
}
```

### 3. 支持的资产列表

**请求:**
```
GET /api/assets
```

**响应:**
```json
{
  "assets": [
    {
      "symbol": "BTC",
      "name": "bitcoin",
      "supported": true
    },
    ...
  ],
  "count": 8
}
```

### 4. 健康检查

**请求:**
```
GET /health
```

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T12:00:00Z"
}
```

## Kronos 模型集成

### 模型配置

在 `.env` 中配置：

```bash
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
DEVICE=cpu  # 或 cuda:0 使用 GPU
```

### 支持的模型

| 模型 | 参数量 | 上下文长度 | 推荐用途 |
|------|--------|-----------|---------|
| Kronos-mini | 4.1M | 2048 | 快速预测 |
| Kronos-small | 24.7M | 512 | 平衡性能 |
| Kronos-base | 102.3M | 512 | 高精度 |

### 预测流程

1. **数据准备**: 从 CoinGecko 获取历史价格数据
2. **格式转换**: 转换为 Kronos 所需的 OHLCV 格式
3. **模型预测**: 调用 Kronos 模型生成预测
4. **结果处理**: 计算置信度、趋势等指标
5. **返回结果**: JSON 格式返回给前端

### 后备机制

如果 Kronos 模型不可用，系统会自动使用简单的统计预测方法：

- 移动平均趋势分析
- 随机游走模拟
- 基于历史波动率的预测区间

## 故障排除

### Python 服务无法启动

检查 Python 环境和依赖：

```bash
python --version  # 需要 3.10+
pip list | grep torch
```

### 模型加载失败

检查模型文件是否正确复制：

```bash
ls -la model/
# 应该包含: __init__.py, kronos.py, module.py
```

### GPU 不可用

如果没有 GPU，在 `.env` 中设置：

```bash
DEVICE=cpu
```

### API 调用超时

增加 Python 服务超时时间，在 `routes/predict.js` 中：

```javascript
timeout: 60000  // 60秒
```

## 性能优化

### 1. 使用 GPU 加速

```bash
# 安装 CUDA 版本的 PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 配置 .env
DEVICE=cuda:0
```

### 2. 模型缓存

模型会自动缓存到 `~/.cache/huggingface/`，首次加载较慢。

### 3. 批量预测

使用 `predict_batch` 方法同时预测多个资产：

```python
pred_df_list = predictor.predict_batch(
    df_list=[df1, df2, df3],
    ...
)
```

## 许可证

MIT License

