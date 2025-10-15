# 贡献指南

感谢您对 Kronos Prediction DApp 项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告 Bug

如果您发现了 bug，请：

1. 检查 [Issues](https://github.com/your-repo/issues) 是否已有相关报告
2. 如果没有，创建新 Issue，包含：
   - 清晰的标题
   - 详细的复现步骤
   - 预期行为 vs 实际行为
   - 环境信息（OS、浏览器、版本等）
   - 错误日志或截图

### 提出新功能

1. 创建 Feature Request Issue
2. 描述功能需求和使用场景
3. 等待社区讨论和反馈

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/kronos-polkadot.git
   cd kronos-polkadot
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **进行修改**
   - 遵循项目代码风格
   - 添加必要的测试
   - 更新文档

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add new feature" 
   # 或
   git commit -m "fix: resolve bug"
   ```

5. **推送到 GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 填写 PR 模板
   - 关联相关 Issues
   - 等待代码审查

## 📝 代码规范

### Rust (智能合约)

- 使用 `rustfmt` 格式化代码
- 遵循 [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- 添加文档注释
- 编写单元测试

```rust
/// 提交预测
/// 
/// # Arguments
/// * `symbol` - 资产符号
/// * `value` - 预测值
#[ink(message)]
pub fn submit_prediction(&mut self, symbol: String, value: u128) {
    // ...
}
```

### TypeScript/JavaScript

- 使用 ESLint 和 Prettier
- 遵循 Airbnb Style Guide
- 使用 TypeScript 类型注解
- 编写单元测试

```typescript
/**
 * 获取预测数据
 * @param symbol 资产符号
 * @returns 预测结果
 */
async function getPrediction(symbol: string): Promise<PredictionData> {
  // ...
}
```

### Python

- 遵循 PEP 8
- 使用 type hints
- 添加 docstrings
- 使用 Black 格式化

```python
def predict(symbol: str, data: pd.DataFrame) -> Dict[str, Any]:
    """
    执行预测
    
    Args:
        symbol: 资产符号
        data: 历史数据
        
    Returns:
        预测结果字典
    """
    pass
```

## 🧪 测试

### 运行测试

```bash
# 合约测试
cd contracts/kronos_prediction
cargo test

# 前端测试
cd frontend
npm test

# 后端测试
cd backend
npm test
```

### 测试覆盖率

确保新代码有足够的测试覆盖：
- 单元测试覆盖率 > 80%
- 关键路径 100% 覆盖

## 📋 Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: add BTC price prediction
fix: resolve wallet connection issue
docs: update API documentation
```

## 🔄 Pull Request 流程

1. **确保 PR 描述清晰**
   - 解决了什么问题
   - 如何解决的
   - 有哪些影响

2. **通过所有检查**
   - CI/CD 测试通过
   - 代码审查通过
   - 无冲突

3. **响应反馈**
   - 及时回复审查意见
   - 进行必要的修改

4. **合并要求**
   - 至少 1 个维护者批准
   - 所有检查通过
   - 无未解决的对话

## 🏗️ 开发环境

### 必需工具

- Rust nightly
- Node.js 18+
- Python 3.10+
- cargo-contract 3.0+

### 推荐工具

- VS Code + Rust Analyzer
- Polkadot.js Extension
- Git

### 环境设置

```bash
# 安装依赖
./scripts/deploy.sh install

# 启动开发环境
./scripts/deploy.sh start
```

## 🐛 调试技巧

### 智能合约

```bash
# 查看详细日志
RUST_LOG=debug cargo test

# 使用 ink! 调试工具
cargo contract build --debug
```

### 前端

```bash
# 启用详细日志
VITE_LOG_LEVEL=debug npm run dev

# 使用 React DevTools
```

### 后端

```bash
# Python 调试
python -m pdb predict_service.py

# Node.js 调试
node --inspect server.js
```

## 📚 资源

- [Polkadot Wiki](https://wiki.polkadot.network/)
- [Ink! Documentation](https://use.ink/)
- [Substrate Docs](https://docs.substrate.io/)
- [React Documentation](https://react.dev/)
- [Kronos Model](https://github.com/shiyu-coder/Kronos)

## 💬 社区

- Discord: [Join our server](#)
- Telegram: [Join our group](#)
- Forum: [Discussion board](#)

## 🎖️ 贡献者

感谢所有贡献者！

<!-- 
贡献者列表会自动更新
-->

## 📄 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

---

再次感谢您的贡献！ 🙏

