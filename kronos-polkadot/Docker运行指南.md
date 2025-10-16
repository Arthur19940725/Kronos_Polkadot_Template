# 🐳 Docker 运行完整指南

## 🚀 快速启动（一条命令）

### Windows PowerShell

```powershell
# 进入项目目录
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 📋 详细步骤

### 第 1 步：确保 Docker Desktop 正在运行

**检查方法**：
```powershell
docker --version
```

如果返回版本号（如 `Docker version 28.3.2`）→ ✅ Docker 正在运行

如果报错 → ❌ 需要启动 Docker Desktop

**启动 Docker Desktop**：
1. 点击开始菜单
2. 搜索 "Docker Desktop"
3. 启动应用
4. 等待右下角图标显示绿色（约 30 秒）

---

### 第 2 步：启动 Kronos 服务

```powershell
# 进入项目目录
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

# 启动所有服务（后台运行）
docker-compose up -d
```

**预期输出**：
```
Creating network "kronos-polkadot_kronos-network"
Creating volume "kronos-polkadot_model-cache"
Creating kronos-backend  ... done
Creating kronos-frontend ... done
```

---

### 第 3 步：等待服务启动（约 30-60 秒）

服务需要时间初始化：
- 后端：加载 Node.js 和 Python 服务
- AI 模型：首次下载 Kronos 模型（约 100MB）
- 前端：启动 Nginx 服务器

**等待命令**：
```powershell
Start-Sleep -Seconds 30
```

---

### 第 4 步：检查服务状态

```powershell
docker-compose ps
```

**预期输出**：
```
NAME              STATUS                    PORTS
kronos-backend    Up (healthy)             0.0.0.0:5000-5001->5000-5001/tcp
kronos-frontend   Up (health: starting)    0.0.0.0:3000->80/tcp
```

**状态说明**：
- `Up` = 运行中
- `(healthy)` = 健康检查通过
- `(health: starting)` = 正在初始化

---

### 第 5 步：访问应用

在浏览器中打开：

| 服务 | URL | 说明 |
|------|-----|------|
| **前端应用** | http://localhost:3000 | React Web 界面 |
| **后端 API** | http://localhost:5000 | Express 服务器 |
| **健康检查** | http://localhost:5000/health | 服务状态 |
| **AI 服务** | http://localhost:5001 | Kronos 预测模型 |

---

## 🔍 查看服务日志

### 查看所有日志（实时滚动）

```powershell
docker-compose logs -f
```

按 `Ctrl + C` 退出日志查看

### 仅查看后端日志

```powershell
docker-compose logs -f backend
```

### 仅查看前端日志

```powershell
docker-compose logs -f frontend
```

### 查看最近 50 行日志

```powershell
docker-compose logs --tail=50
```

---

## 🛠️ 常用命令

### 启动服务

```powershell
# 后台启动所有服务
docker-compose up -d

# 前台启动（可以看到实时日志）
docker-compose up

# 仅启动后端
docker-compose up -d backend

# 仅启动前端
docker-compose up -d frontend
```

### 停止服务

```powershell
# 停止所有服务
docker-compose down

# 停止但保留数据
docker-compose stop

# 停止并删除所有数据（包括模型缓存）
docker-compose down -v
```

### 重启服务

```powershell
# 重启所有服务
docker-compose restart

# 仅重启后端
docker-compose restart backend

# 仅重启前端
docker-compose restart frontend
```

### 重新构建

```powershell
# 重新构建所有镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 强制重新构建（不使用缓存）
docker-compose build --no-cache

# 仅重新构建前端
docker-compose build frontend
```

---

## 🧪 测试服务

### 测试后端健康检查

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

**预期结果**：
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T00:20:54.000Z"
}
```

### 测试 API 预测

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
Write-Host "BTC Price: $($data.currentPrice)"
Write-Host "Data Source: $($data.dataSource)"
```

### 测试前端页面

```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing
```

返回 `StatusCode: 200` → ✅ 前端正常

---

## 🐛 故障排查

### 问题 1：容器无法启动

**查看错误日志**：
```powershell
docker-compose logs backend
docker-compose logs frontend
```

**常见原因**：
- 端口被占用（5000、5001、3000）
- Docker Desktop 未运行
- 镜像构建失败

**解决方法**：
```powershell
# 检查端口占用
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 如果被占用，停止占用的进程
taskkill /PID <进程ID> /F

# 重新启动
docker-compose down
docker-compose up -d
```

### 问题 2：服务一直重启

**检查日志**：
```powershell
docker-compose logs backend
```

**常见原因**：
- Python 依赖缺失
- 配置文件错误
- 内存不足

**解决方法**：
```powershell
# 重新构建
docker-compose build --no-cache backend
docker-compose up -d
```

### 问题 3：前端显示 502 错误

**原因**：后端服务未就绪

**解决**：
```powershell
# 检查后端状态
docker-compose ps backend

# 查看后端日志
docker-compose logs backend

# 重启后端
docker-compose restart backend
```

### 问题 4：首次启动很慢

**原因**：需要下载 Kronos AI 模型（约 100MB）

**解决**：
- 耐心等待
- 查看日志了解进度：
  ```powershell
  docker-compose logs -f backend
  ```

**日志中会显示**：
```
Loading tokenizer from NeoQuasar/Kronos-Tokenizer-base...
Loading model from NeoQuasar/Kronos-small...
Initializing predictor on cpu...
✅ Kronos model initialized successfully
```

---

## 📊 监控服务

### 查看容器资源使用

```powershell
docker stats
```

显示：
- CPU 使用率
- 内存使用
- 网络 I/O
- 磁盘 I/O

按 `Ctrl + C` 退出

### 进入容器内部调试

```powershell
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh

# 退出容器
exit
```

---

## 🔄 更新代码后重启

### 如果修改了代码

```powershell
# 停止服务
docker-compose down

# 重新构建相关服务
docker-compose build <service-name>

# 示例：修改了后端代码
docker-compose build backend

# 启动服务
docker-compose up -d

# 查看日志确认
docker-compose logs -f backend
```

### 如果只是修改了配置

```powershell
# 简单重启即可
docker-compose restart
```

---

## 📦 数据管理

### 查看 Docker 卷

```powershell
docker volume ls
```

会看到：
- `kronos-polkadot_model-cache` - AI 模型缓存

### 清理未使用的资源

```powershell
# 清理停止的容器
docker container prune

# 清理未使用的镜像
docker image prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune
```

⚠️ **注意**：`docker system prune` 会删除所有未使用的资源！

---

## 🎯 完整生命周期命令

### 首次启动

```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 等待启动
Start-Sleep -Seconds 30

# 检查状态
docker-compose ps

# 访问应用
start http://localhost:3000
```

### 日常使用

```powershell
# 启动
docker-compose up -d

# 停止
docker-compose down
```

### 开发调试

```powershell
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 重新构建
docker-compose build
docker-compose up -d
```

### 完全清理

```powershell
# 停止并删除所有资源
docker-compose down -v

# 删除镜像
docker rmi kronos-polkadot-backend kronos-polkadot-frontend

# 清理 Docker 缓存
docker system prune -a
```

---

## 🌟 高级用法

### 自定义配置

创建 `.env` 文件（如果不存在）：

```bash
# Polkadot 配置
WS_PROVIDER=wss://westend-rpc.polkadot.io
CONTRACT_ADDRESS=

# Kronos 模型
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
DEVICE=cpu

# 服务端口
PORT=5000
PYTHON_SERVICE_PORT=5001
```

修改后重启：
```powershell
docker-compose restart
```

### 使用 GPU 加速

如果有 NVIDIA GPU，修改 `.env`：
```bash
DEVICE=cuda:0
```

然后需要使用支持 GPU 的基础镜像（需要修改 Dockerfile）

### 扩展服务

```powershell
# 运行多个后端实例（负载均衡）
docker-compose up -d --scale backend=3
```

---

## 📝 一键启动脚本

我已为您创建：

```powershell
# 使用启动脚本
.\START_HERE.ps1
```

或者：

```powershell
.\start-simple.ps1
```

---

## ✅ 验证服务运行

### 快速验证脚本

```powershell
# 运行此脚本验证所有服务
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

Write-Host "检查 Docker 服务..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n测试后端 API..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
    Write-Host "✅ 后端正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端未就绪" -ForegroundColor Red
}

Write-Host "`n测试前端..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing
    Write-Host "✅ 前端正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端未就绪" -ForegroundColor Red
}

Write-Host "`n测试 API 预测..." -ForegroundColor Yellow
try {
    $api = Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing
    $data = $api.Content | ConvertFrom-Json
    Write-Host "✅ API 正常 - BTC 价格: $($data.currentPrice)" -ForegroundColor Green
    Write-Host "   数据源: $($data.dataSource)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  API 可能还在初始化" -ForegroundColor Yellow
}
```

---

## 🎯 现在就运行

执行以下命令启动整个 Kronos 代码库：

