# Kronos Prediction Frontend

基于 React + TypeScript + Polkadot.js 构建的 DApp 前端界面。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Material-UI** - UI 组件库
- **Polkadot.js** - 区块链交互
- **Recharts** - 数据可视化
- **Axios** - HTTP 客户端

## 功能特性

✅ Polkadot.js Extension 钱包连接  
✅ 多账户管理  
✅ 实时价格查询  
✅ AI 预测可视化  
✅ 链上预测提交  
✅ 交互式图表展示  
✅ 响应式设计  

## 安装

```bash
npm install
```

## 配置

1. 复制环境变量文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件：

```bash
# 后端 API 地址
VITE_BACKEND_URL=http://localhost:5000

# Polkadot 节点地址
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io

# 智能合约地址（部署后填写）
VITE_CONTRACT_ADDRESS=5Fg9...YourContractAddress
```

## 运行

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建输出在 `dist/` 目录

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── App.tsx                # 主应用组件
│   ├── main.tsx               # 入口文件
│   ├── index.css              # 全局样式
│   ├── components/
│   │   ├── WalletConnect.tsx  # 钱包连接组件
│   │   └── PredictionPanel.tsx # 预测面板组件
│   └── api/
│       └── backend.ts         # API 和区块链交互
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
```

## 组件说明

### WalletConnect

钱包连接和账户管理组件。

**功能：**
- 连接 Polkadot.js Extension
- 账户选择和切换
- 断开连接
- 账户信息显示

### PredictionPanel

主要的预测交互面板。

**功能：**
- 资产选择（BTC, ETH, DOT, etc.）
- 显示当前价格和市场数据
- AI 预测结果展示
- 24小时价格走势图表
- 用户预测提交
- 链上交易处理

### API 模块

`src/api/backend.ts` 提供以下功能：

#### 后端 API 调用

- `getPrediction(symbol)` - 获取 AI 预测
- `getHistory(symbol, days)` - 获取历史数据
- `getSupportedAssets()` - 获取支持的资产列表

#### 区块链交互

- `submitPredictionToChain(account, symbol, value)` - 提交预测到链上
- `queryPrediction(address, symbol)` - 查询链上预测

## 使用说明

### 1. 安装 Polkadot.js Extension

首次使用需要安装浏览器扩展：

- Chrome/Edge: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org

或访问：https://polkadot.js.org/extension/

### 2. 创建/导入账户

在 Polkadot.js Extension 中创建或导入账户。

### 3. 连接钱包

点击右上角 "Connect Wallet" 按钮，授权应用访问。

### 4. 获取测试币

在 Westend 测试网获取测试币：
- 访问 https://faucet.polkadot.io/westend
- 输入您的地址
- 获取免费测试币

### 5. 使用应用

1. 选择要预测的资产（如 BTC）
2. 查看 AI 预测结果和图表
3. 输入您的预测价格
4. 点击 "Submit to Chain" 提交

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_BACKEND_URL` | 后端 API 地址 | http://localhost:5000 |
| `VITE_WS_PROVIDER` | Polkadot 节点 WebSocket | wss://westend-rpc.polkadot.io |
| `VITE_CONTRACT_ADDRESS` | 智能合约地址 | 需要配置 |

## 故障排除

### 无法连接钱包

1. 确保已安装 Polkadot.js Extension
2. 检查扩展是否已启用
3. 刷新页面重试

### 交易失败

1. 检查账户是否有足够余额
2. 确认合约地址配置正确
3. 查看浏览器控制台错误信息

### API 请求失败

1. 确认后端服务正在运行
2. 检查 `VITE_BACKEND_URL` 配置
3. 查看网络请求错误详情

### 图表不显示

1. 检查预测数据是否加载成功
2. 确认后端返回数据格式正确
3. 查看控制台是否有 React 错误

## 开发建议

### 添加新资产

在 `PredictionPanel.tsx` 中添加：

```typescript
const SUPPORTED_ASSETS = [
  ...
  { symbol: 'NEW', name: 'New Asset' },
];
```

### 自定义主题

修改 `App.tsx` 中的 theme 配置：

```typescript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E6007A', // 自定义颜色
    },
  },
});
```

### 添加新的图表

使用 Recharts 组件：

```typescript
import { AreaChart, Area } from 'recharts';

<AreaChart data={data}>
  <Area type="monotone" dataKey="value" stroke="#8884d8" />
</AreaChart>
```

## 性能优化

1. **代码分割**：使用 React.lazy 懒加载组件
2. **状态管理**：考虑使用 Redux 或 Zustand
3. **缓存**：使用 React Query 缓存 API 请求
4. **图片优化**：使用 WebP 格式和懒加载

## 安全建议

⚠️ **重要提示：**

1. 永远不要在前端存储私钥
2. 所有交易都通过 Polkadot.js Extension 签名
3. 验证所有用户输入
4. 使用 HTTPS 部署生产环境
5. 定期更新依赖包

## 部署

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
npm run build
# 将 dist/ 目录部署到 gh-pages 分支
```

## 许可证

MIT License

