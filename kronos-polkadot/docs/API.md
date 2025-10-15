# API 文档

Kronos Prediction DApp 后端 API 完整文档。

## 基础信息

- **Base URL**: `http://localhost:5000`
- **API 版本**: v1.0
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

当前版本不需要认证。未来版本将支持 API Key 和 JWT。

## 错误处理

### 错误响应格式

```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "code": "ERROR_CODE"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

## 端点列表

### 1. 健康检查

检查服务状态。

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

---

### 2. 获取预测

获取指定资产的价格预测。

**请求:**
```
GET /api/predict?symbol={SYMBOL}
```

**参数:**

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| symbol | string | 是 | 资产符号 | BTC, ETH, DOT |

**响应:**
```json
{
  "symbol": "BTC",
  "currentPrice": 45000.50,
  "change24h": 2.5,
  "volume24h": 25000000000,
  "marketCap": 850000000000,
  "prediction": {
    "price_24h": 46200.30,
    "confidence": 0.85,
    "trend": "bullish",
    "predictions": [
      {
        "hour": 1,
        "price": 45150.20,
        "high": 45250.00,
        "low": 45050.00,
        "volume": 500000000,
        "timestamp": "2025-10-15T13:00:00Z"
      },
      ...
    ],
    "model": "kronos"
  },
  "timestamp": "2025-10-15T12:00:00Z"
}
```

**字段说明:**

- `currentPrice`: 当前价格（USD）
- `change24h`: 24小时涨跌幅（%）
- `volume24h`: 24小时交易量（USD）
- `marketCap`: 市值（USD）
- `prediction.price_24h`: 24小时后预测价格
- `prediction.confidence`: 预测置信度 (0-1)
- `prediction.trend`: 趋势（bullish/bearish）
- `prediction.predictions`: 逐小时预测数组
- `prediction.model`: 使用的模型（kronos/simple）

**错误响应:**
```json
{
  "error": "Invalid symbol",
  "message": "Symbol XYZ is not supported"
}
```

---

### 3. 获取历史数据

获取资产历史价格数据。

**请求:**
```
GET /api/history?symbol={SYMBOL}&days={DAYS}
```

**参数:**

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| symbol | string | 是 | - | 资产符号 |
| days | integer | 否 | 7 | 历史天数 (1-90) |

**响应:**
```json
{
  "symbol": "BTC",
  "days": 7,
  "data": {
    "prices": [
      [1697385600000, 44500.25],
      [1697472000000, 44800.50],
      ...
    ],
    "volumes": [
      [1697385600000, 24500000000],
      [1697472000000, 25200000000],
      ...
    ],
    "marketCaps": [
      [1697385600000, 840000000000],
      [1697472000000, 845000000000],
      ...
    ]
  },
  "timestamp": "2025-10-15T12:00:00Z"
}
```

**字段说明:**

- `prices`: [时间戳, 价格] 数组
- `volumes`: [时间戳, 交易量] 数组
- `marketCaps`: [时间戳, 市值] 数组
- 时间戳为 Unix 毫秒时间戳

---

### 4. 获取支持的资产

获取所有支持的资产列表。

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
    {
      "symbol": "ETH",
      "name": "ethereum",
      "supported": true
    },
    ...
  ],
  "count": 8
}
```

---

### 5. Python 预测服务

内部使用的 Python 预测服务 API。

**Base URL**: `http://localhost:5001`

#### 5.1 健康检查

**请求:**
```
GET /health
```

**响应:**
```json
{
  "status": "ok",
  "kronos_available": true,
  "timestamp": "2025-10-15T12:00:00Z"
}
```

#### 5.2 执行预测

**请求:**
```
POST /predict
Content-Type: application/json

{
  "symbol": "BTC",
  "data": {
    "prices": [[timestamp, price], ...],
    "volumes": [[timestamp, volume], ...]
  },
  "pred_hours": 24
}
```

**响应:**
```json
{
  "price_24h": 46200.30,
  "confidence": 0.85,
  "trend": "bullish",
  "predictions": [...],
  "model": "kronos"
}
```

## 使用示例

### cURL

```bash
# 获取 BTC 预测
curl "http://localhost:5000/api/predict?symbol=BTC"

# 获取 7 天历史数据
curl "http://localhost:5000/api/history?symbol=ETH&days=7"

# 获取支持的资产
curl "http://localhost:5000/api/assets"
```

### JavaScript/TypeScript

```typescript
// 使用 axios
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// 获取预测
async function getPrediction(symbol: string) {
  const response = await axios.get(`${API_BASE}/api/predict`, {
    params: { symbol }
  });
  return response.data;
}

// 获取历史数据
async function getHistory(symbol: string, days: number = 7) {
  const response = await axios.get(`${API_BASE}/api/history`, {
    params: { symbol, days }
  });
  return response.data;
}
```

### Python

```python
import requests

API_BASE = 'http://localhost:5000'

# 获取预测
def get_prediction(symbol):
    response = requests.get(f'{API_BASE}/api/predict', 
                          params={'symbol': symbol})
    return response.json()

# 获取历史数据
def get_history(symbol, days=7):
    response = requests.get(f'{API_BASE}/api/history',
                          params={'symbol': symbol, 'days': days})
    return response.json()
```

## 速率限制

当前版本无速率限制。生产环境建议：

- 每个 IP: 100 请求/分钟
- 每个 API Key: 1000 请求/分钟

## WebSocket API

未来版本将支持 WebSocket 实时数据推送：

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.on('message', (data) => {
  const prediction = JSON.parse(data);
  console.log('Real-time prediction:', prediction);
});
```

## 数据源

- **价格数据**: CoinGecko API
- **预测模型**: Kronos AI Model
- **区块链数据**: Polkadot.js API

## 版本历史

### v1.0.0 (2025-10-15)
- ✅ 基础预测 API
- ✅ 历史数据查询
- ✅ Kronos 模型集成

### v1.1.0 (计划中)
- ⏳ WebSocket 实时推送
- ⏳ 批量预测接口
- ⏳ API 认证系统

## 许可证

MIT License

