# 以太坊交易查询服务器

## 🚀 快速开始

### 1. 获取免费的 Infura Project ID

1. 访问 https://infura.io/register 注册账号（完全免费）
2. 创建新项目，选择 **Web3 API**
3. 复制你的 **Project ID**（格式类似：`abc123def456...`）

### 2. 启动服务器

```bash
# 使用环境变量启动（推荐）
INFURA_PROJECT_ID=你的项目ID node server.js

# 示例
INFURA_PROJECT_ID=d646d0b59ff44348a0fe61afb42ef10b node server.js
```

### 3. 测试接口

```bash
# 查询交易信息
curl http://localhost:3000/tx/0xa67f19d1dfeec17151eaf6301920dc30766d02cb46378374185559cae5a51fc8
```

## ⚙️ 环境变量配置

- `INFURA_PROJECT_ID` - **必需** - 你的 Infura 项目 ID
- `NETWORK` - 可选 - 网络名称（默认: `sepolia`）
- `PORT` - 可选 - 服务器端口（默认: `3000`）

## 🚨 常见错误

### TypeError: Cannot read properties of undefined

**原因：** 未设置 `INFURA_PROJECT_ID` 环境变量
**解决：** 启动时必须提供环境变量，见上方"启动服务器"部分

### 403 Forbidden 错误

**原因：** Infura Project ID 有安全限制（allowlist）
**解决：** 创建新的免费项目或修改现有项目设置：https://infura.io/dashboard → Settings → Security → 禁用 Allowlist

---

## The Graph

The Graph 只能查询 已经被某个 Subgraph 索引的数据

查询 ETH 原生交易（如你当前页面通过 RPC getTransaction）

- The Graph 不能索引原生 ETH 交易，除非你自己写自定义 Subgraph Mapping（很罕见）

查询某个 ERC20 Token 转账事件

- 可以使用 The Graph，比如查询 Transfer 事件

查询你自己写的智能合约里的事件

- 可以使用 The Graph，前提：你自己部署 subgraph

用 The Graph 替代 RPC provider 查看余额

- The Graph 查询不到余额，只能查事件数据

## Infura / Alchemy 是怎么读取链上数据的？
