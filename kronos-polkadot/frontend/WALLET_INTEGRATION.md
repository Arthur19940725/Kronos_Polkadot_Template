# 钱包集成说明

## 🎯 已支持的钱包

### 1. Polkadot.js Extension ✅
- **状态**: 完全支持
- **推荐**: ⭐⭐⭐⭐⭐
- **安装**: https://polkadot.js.org/extension/
- **说明**: 官方扩展，兼容性最好

### 2. OKX Wallet ✅
- **状态**: 完全支持
- **推荐**: ⭐⭐⭐⭐
- **安装**: https://www.okx.com/web3
- **说明**: 支持多链，包括 Polkadot

### 3. SubWallet ✅
- **状态**: 完全支持
- **推荐**: ⭐⭐⭐⭐
- **安装**: https://subwallet.app/
- **说明**: 功能丰富的 Polkadot 钱包

### 4. Talisman ✅
- **状态**: 完全支持
- **推荐**: ⭐⭐⭐⭐
- **安装**: https://talisman.xyz/
- **说明**: 支持 Polkadot 和 Ethereum

## 📝 使用新的多钱包组件

### 更新 App.tsx

将原来的 `WalletConnect` 替换为 `MultiWalletConnect`:

```tsx
// 旧版本
import WalletConnect from './components/WalletConnect';

// 新版本  
import MultiWalletConnect from './components/MultiWalletConnect';

// 在组件中使用
<MultiWalletConnect
  account={account}
  setAccount={setAccount}
  showNotification={showNotification}
/>
```

## 🔍 关于 MetaMask

MetaMask 是以太坊钱包，**不直接支持 Polkadot**。

### 解决方案：

1. **使用 Polkadot Snap（推荐）**
   - 访问: https://polkagate.xyz/snap
   - 安装 Polkadot Snap for MetaMask
   - 在 MetaMask 中管理 Polkadot 账户

2. **使用多链钱包（更简单）**
   - 推荐使用 OKX Wallet 或 Talisman
   - 这些钱包同时支持 Ethereum 和 Polkadot

## 🚀 特性

### ✅ 自动检测
- 自动检测已安装的钱包
- 提示未安装的钱包下载链接

### ✅ 多账户支持
- 支持在多个账户之间切换
- 记住上次选择的账户

### ✅ 友好提示
- 未找到账户时提供创建指引
- 显示钱包安装和设置教程

### ✅ 安全性
- 不存储私钥
- 所有签名在钱包扩展中完成

## 📱 用户体验流程

### 场景 1: 用户已安装钱包并有账户
1. 点击"Connect Wallet"
2. 选择钱包（如果有多个）
3. 选择账户（如果有多个）
4. ✅ 连接成功

### 场景 2: 用户已安装钱包但无账户
1. 点击"Connect Wallet"
2. 系统检测到无账户
3. 显示创建账户指引对话框
4. 用户创建账户后重新连接

### 场景 3: 用户未安装钱包
1. 点击"Connect Wallet"
2. 选择想要的钱包
3. 自动打开钱包下载页面
4. 安装后刷新页面重新连接

## 🔧 技术实现

### 钱包检测
```typescript
const detectPolkadotJS = async () => {
  const extensions = await web3Enable('Your App Name');
  return extensions.some(ext => ext.name === 'polkadot-js');
};

const detectOKX = async () => {
  const extensions = await web3Enable('Your App Name');
  return extensions.some(ext => 
    ext.name?.toLowerCase().includes('okx')
  );
};
```

### 账户获取
```typescript
const allAccounts = await web3Accounts();
// 返回所有可用钱包的所有账户
```

## 🎨 UI 组件

### 钱包选择对话框
- 显示所有支持的钱包
- 标识已安装/未安装
- 提供下载链接

### 无账户对话框
- 分步指导创建账户
- 提供官方文档链接
- 一键跳转钱包安装页

## 📚 文档链接

- [Polkadot.js Extension 官方文档](https://polkadot.js.org/docs/extension/)
- [OKX Wallet 文档](https://www.okx.com/web3/build/docs/sdks/chains/polkadot/provider)
- [SubWallet 文档](https://docs.subwallet.app/)
- [Talisman 文档](https://docs.talisman.xyz/)

## ⚠️ 已知限制

1. **MetaMask 不直接支持**
   - 需要通过 Polkadot Snap
   - 或使用其他多链钱包

2. **浏览器兼容性**
   - 推荐使用 Chrome/Edge/Firefox
   - Safari 支持有限

3. **移动端**
   - 需要使用钱包 APP 的内置浏览器
   - 或使用 WalletConnect（待实现）

## 🔜 未来计划

- [ ] WalletConnect 集成（移动端）
- [ ] Ledger 硬件钱包支持
- [ ] MetaMask Snap 直接集成
- [ ] 更多钱包支持

---

**更新日期**: 2025-10-15

