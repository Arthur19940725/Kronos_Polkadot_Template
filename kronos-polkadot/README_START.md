# 🚀 快速启动（仅需1步）

## Windows 用户

### 方式1：一键启动（推荐）

**双击运行**:
```
start-windows.ps1
```

或在 PowerShell 中运行:
```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot
.\start-windows.ps1
```

### 方式2：手动启动

1. **启动 Docker Desktop**（如果未运行）

2. **打开 PowerShell**，运行：
```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot
docker-compose up -d
```

3. **等待约30秒**，然后访问：
   - 🌐 前端: http://localhost:3000
   - 🔌 后端: http://localhost:5000

---

## 验证服务

```powershell
# 查看服务状态
docker-compose ps

# 测试API
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

---

## 停止服务

```powershell
docker-compose down
```

---

## 查看日志

```powershell
# 所有日志
docker-compose logs -f

# 仅后端
docker-compose logs -f backend

# 仅前端
docker-compose logs -f frontend
```

---

## 常见问题

### Docker Desktop 未运行

**解决方法**:
1. 点击开始菜单
2. 搜索 "Docker Desktop"
3. 启动应用
4. 等待右下角图标显示为绿色
5. 重新运行启动脚本

### 端口被占用

**查看端口占用**:
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

**结束占用的进程**:
```powershell
# 替换 <PID> 为实际的进程ID
taskkill /PID <PID> /F
```

---

## 更多文档

- [Windows 详细指南](./QUICKSTART_WINDOWS.md)
- [Docker 使用指南](./DOCKER_USAGE.md)
- [完整项目文档](./README.md)

---

**祝您使用愉快！** 🎉

