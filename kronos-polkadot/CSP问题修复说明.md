# 🔒 CSP 问题修复说明

## ❌ 问题

**错误信息**：
```
Content Security Policy (CSP) prevents the evaluation of arbitrary strings as JavaScript
script-src blocked
```

**原因**：
- Polkadot.js 扩展库需要使用 `eval()` 和动态代码执行
- 浏览器的 Content Security Policy 默认阻止这些操作
- 导致钱包扩展无法正常工作

---

## ✅ 已修复

### 修改 1：更新 index.html

添加了 CSP meta 标签，允许：
- ✅ `unsafe-eval` - 允许 eval() 执行（Polkadot.js 需要）
- ✅ `unsafe-inline` - 允许内联脚本
- ✅ WebSocket 连接到 Polkadot 节点
- ✅ 连接到本地后端 API

### 修改 2：更新 Nginx 配置

在 Nginx 响应头中添加 CSP 策略，确保：
- 钱包扩展可以正常工作
- 保持其他安全限制
- 允许必要的第三方资源

---

## 🔄 应用修复

### 重新构建并启动

```powershell
# 停止服务
docker-compose down

# 重新构建前端
docker-compose build frontend

# 启动服务
docker-compose up -d

# 等待启动（30秒）
Start-Sleep -Seconds 30

# 访问应用
# http://localhost:3000
```

---

## 🧪 验证修复

### 方法 1：在浏览器中测试

1. 访问：http://localhost:3000
2. 按 **F12** 打开开发者工具
3. 切换到 **Console** 标签
4. **不应该再看到 CSP 错误**
5. 点击 "Connect Wallet"
6. 应该能正常弹出钱包选择框

### 方法 2：检查 CSP 头

1. 访问：http://localhost:3000
2. 按 F12 打开开发者工具
3. 切换到 **Network** 标签
4. 刷新页面
5. 点击第一个请求（localhost）
6. 查看 **Response Headers**
7. 应该能看到 `Content-Security-Policy` 头

---

## 📋 CSP 策略说明

### 允许的内容

```
default-src 'self'
  → 默认只允许同源内容

script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net
  → 允许：本地脚本、eval()、内联脚本、CDN

connect-src 'self' https: wss: ws: http://localhost:* 
  → 允许：API 连接、WebSocket、本地服务

worker-src 'self' blob:
  → 允许：Web Workers（Polkadot.js 需要）

img-src 'self' data: https: blob:
  → 允许：图片加载
```

### 为什么需要 unsafe-eval？

Polkadot.js 扩展库内部使用了：
- WebAssembly（WASM）动态编译
- 一些加密算法的动态代码生成
- 这些都需要 `eval()` 或类似功能

**安全性**：
- 虽然允许了 `unsafe-eval`
- 但仍然限制了来源（只允许特定域名）
- 这是 DApp 开发的常见做法

---

## 🔍 其他可能的问题

### 如果修复后仍然无法连接

#### 问题 1：浏览器扩展权限
**检查**：
1. 打开 `chrome://extensions/`
2. 找到钱包扩展
3. 点击"详细信息"
4. 确保"允许访问的网站"包含 `localhost`

#### 问题 2：钱包扩展未响应
**解决**：
1. 禁用并重新启用扩展
2. 或重启浏览器
3. 刷新 DApp 页面

#### 问题 3：隐私模式/无痕模式
**说明**：
- 某些浏览器在隐私模式下禁用扩展
- 请在正常模式下使用

---

## 🛠️ 立即修复步骤

### 自动修复（推荐）

我已经修改了配置文件，现在需要重新构建：

```powershell
cd D:\code\Kronos_Polkadot_Template\kronos-polkadot

# 停止服务
docker-compose down

# 重新构建前端
docker-compose build frontend

# 启动所有服务
docker-compose up -d

# 等待 30 秒
timeout /t 30

# 访问应用
start http://localhost:3000
```

---

## 📝 检查清单

修复后请检查：

- [ ] CSP 错误不再出现（F12 Console 中）
- [ ] 能看到"Connect Wallet"按钮
- [ ] 点击按钮能弹出钱包选择对话框
- [ ] 能看到钱包列表（Polkadot.js、OKX 等）
- [ ] 选择钱包后能看到账户列表
- [ ] 能成功连接账户

---

## 🎯 测试脚本

修复后，在浏览器控制台运行此脚本测试：

```javascript
(async () => {
  console.clear();
  console.log('=== 测试钱包连接 ===\n');
  
  try {
    // 动态导入（测试 CSP）
    console.log('1. 测试动态导入...');
    const { web3Enable, web3Accounts } = 
      await import('https://cdn.jsdelivr.net/npm/@polkadot/extension-dapp@0.46.6/+esm');
    console.log('✅ 动态导入成功（CSP 允许）\n');
    
    // 启用扩展
    console.log('2. 启用钱包扩展...');
    const extensions = await web3Enable('CSP Test');
    console.log(`✅ 检测到 ${extensions.length} 个扩展`);
    extensions.forEach(e => console.log(`   - ${e.name} v${e.version}`));
    console.log('');
    
    // 获取账户
    console.log('3. 获取账户列表...');
    const accounts = await web3Accounts();
    console.log(`✅ 找到 ${accounts.length} 个账户`);
    accounts.forEach((a, i) => console.log(`   ${i+1}. ${a.meta.name} (${a.address.slice(0,10)}...)`));
    console.log('');
    
    if (accounts.length > 0) {
      console.log('🎉 完美！CSP 已修复，钱包连接正常！\n');
      console.log('现在可以点击 Connect Wallet 按钮了！');
    } else {
      console.log('⚠️ CSP 正常，但需要创建账户\n');
      console.log('请在钱包扩展中创建账户后重试');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n如果看到 CSP 错误，说明修复未生效');
    console.error('请重新构建前端: docker-compose build frontend');
  }
  
  console.log('\n=== 测试完成 ===');
})();
```

---

## 🔄 现在就修复！

我已经修改了配置，请运行以下命令：

