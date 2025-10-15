# 🚀 Windows 快速启动指南

> ⏱️ 5分钟快速启动 | 适用于 Windows 10/11

---

## 🎯 推荐方式：使用 Docker（最简单）

### ✅ 前置要求
- Docker Desktop for Windows（已安装✓）
- Git for Windows

### 🚀 一键启动

#### 1. 打开 PowerShell
```powershell
# 进入项目目录
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

# 启动所有服务（一条命令搞定！）
docker-compose up -d
```

#### 2. 等待服务启动（约30秒）
```powershell
# 查看服务状态
docker-compose ps
```

#### 3. 访问应用
- 🌐 前端应用: http://localhost:3000
- 🔌 后端API: http://localhost:5000
- 🤖 AI服务: http://localhost:5001

### 🎉 完成！

现在您可以：
1. 打开浏览器访问 http://localhost:3000
2. 查看实时加密货币预测
3. 测试币安API数据

---

## 📊 查看服务状态

```powershell
# 查看所有容器
docker-compose ps

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend

# 查看所有日志
docker-compose logs -f
```

---

## 🧪 测试 API

### 测试健康检查
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

### 获取BTC预测
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### 获取ETH历史数据
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/history?symbol=ETH&days=7" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## ⏹️ 停止服务

```powershell
# 停止所有服务
docker-compose down

# 停止并删除所有数据（谨慎使用）
docker-compose down -v
```

---

## 🔄 重启服务

```powershell
# 重启所有服务
docker-compose restart

# 仅重启后端
docker-compose restart backend

# 仅重启前端
docker-compose restart frontend
```

---

## 🛠️ 原生方式（开发者选项）

如果您想不使用Docker，可以按以下步骤操作：

### 1️⃣ 安装依赖

#### 安装 Node.js（已安装 ✓）
```powershell
node --version  # v24.5.0
```

#### 安装 Python（已安装 ✓）
```powershell
python --version  # Python 3.11.8
```

#### 安装 Rust
```powershell
# 使用 winget 安装
winget install --id Rustlang.Rustup

# 安装完成后，重新打开PowerShell
rustup install nightly
rustup default nightly
```

### 2️⃣ 安装项目依赖

#### 后端依赖
```powershell
cd backend

# Node.js 依赖
npm install

# Python 依赖
pip install -r requirements.txt
```

#### 前端依赖
```powershell
cd ..\frontend
npm install
```

### 3️⃣ 配置环境变量

创建后端配置文件 `backend\.env`:
```bash
PORT=5000
PYTHON_SERVICE_PORT=5001
WS_PROVIDER=wss://westend-rpc.polkadot.io
KRONOS_MODEL=NeoQuasar/Kronos-small
KRONOS_TOKENIZER=NeoQuasar/Kronos-Tokenizer-base
DEVICE=cpu
```

创建前端配置文件 `frontend\.env`:
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_WS_PROVIDER=wss://westend-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=
```

### 4️⃣ 启动服务

#### 启动后端（新建PowerShell窗口1）
```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot\backend
node server.js
```

#### 启动前端（新建PowerShell窗口2）
```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot\frontend
npm run dev
```

访问: http://localhost:5173

---

## 🐛 常见问题排查

### ❌ Docker 服务无法启动

**检查 Docker Desktop**
```powershell
# 检查Docker是否运行
docker version

# 如果失败，启动 Docker Desktop
# 然后重试 docker-compose up -d
```

### ❌ 端口被占用

**查找并关闭占用端口的程序**
```powershell
# 查看 5000 端口占用
netstat -ano | findstr :5000

# 查看 3000 端口占用
netstat -ano | findstr :3000

# 结束进程（替换 PID）
taskkill /PID <进程ID> /F
```

### ❌ Python 模块找不到

**重新安装依赖**
```powershell
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### ❌ 前端构建失败

**清理并重新安装**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### ❌ Kronos 模型下载慢

**使用国内镜像**
```powershell
# 设置 HuggingFace 镜像
$env:HF_ENDPOINT="https://hf-mirror.com"

# 然后重启后端服务
```

---

## 📈 性能优化建议

### 使用 GPU 加速（如果有 NVIDIA 显卡）

```powershell
# 安装 CUDA 版本的 PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 修改 backend\.env
# DEVICE=cuda:0
```

### 增加 Node.js 内存限制

```powershell
# 在 backend\package.json 的 scripts 中添加
# "start": "node --max-old-space-size=4096 server.js"
```

---

## 🎯 快速命令参考

### Docker 方式（推荐）

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker-compose up -d` |
| 停止服务 | `docker-compose down` |
| 查看状态 | `docker-compose ps` |
| 查看日志 | `docker-compose logs -f` |
| 重启服务 | `docker-compose restart` |
| 重新构建 | `docker-compose build` |

### 测试命令

| 操作 | 命令 |
|------|------|
| 健康检查 | `Invoke-WebRequest http://localhost:5000/health` |
| 测试预测 | `Invoke-WebRequest "http://localhost:5000/api/predict?symbol=BTC"` |
| 访问前端 | 浏览器打开 http://localhost:3000 |

---

## 📚 相关文档

- [Docker 使用指南](./DOCKER_USAGE.md) - 详细的Docker使用说明
- [主项目 README](./README.md) - 完整项目文档
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署

---

## ✅ 验证安装

运行以下命令验证所有服务正常：

```powershell
# 1. 检查后端健康
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing

# 2. 测试API
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/predict?symbol=BTC" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
Write-Host "当前BTC价格: $($data.currentPrice)"
Write-Host "数据源: $($data.dataSource)"

# 3. 检查前端
Invoke-WebRequest -Uri "http://localhost:3000" -Method Head
```

如果所有命令都成功执行，说明安装完成！🎉

---

**快速启动时间**: < 5分钟  
**推荐方式**: Docker  
**支持系统**: Windows 10/11  
**更新日期**: 2025-10-15

