# ViralOS — Ubuntu 部署与远程验证

> **原则**：构建与运行放在 **Ubuntu**（CPU/内存充足），macOS 仅改代码 + rsync，避免本机 `next build` OOM。

> **当前阻塞（2026-05-27）**：跨公网 SSH/tunnel 不稳定时 **先不要** 跑 `deploy:ubuntu:sync`。等同局域网后再执行本文档；此前在 macOS 用 `npm run verify:local-design`。

## 架构

```text
macOS (开发)  ──rsync──►  Ubuntu ~/ViralOS
                              │
                              ├─ npm ci && npm run build   (在 Ubuntu 上)
                              ├─ PORT=3010 npm run start
                              └─ ANTHROPIC_API_KEY in .env
```

默认端口 **3010**（避免与 llm-gateway `:3000` 冲突）。

---

## 1. 首次部署（Ubuntu 上已有代码）

```bash
ssh ssh.datapro.asia   # 或 ssh ubuntu (LAN)
cd ~/ViralOS
cp .env.example .env
# 编辑 .env：ANTHROPIC_API_KEY=sk-ant-...
# 可选：API_PROXY_BASE_URL=http://127.0.0.1:8001

chmod +x scripts/ubuntu/*.sh
./scripts/ubuntu/deploy-viralos.sh
```

---

## 2. 从 macOS 同步并部署（推荐）

```bash
cd ~/Desktop/ViralOS
# 外网 Tunnel（默认）
npm run deploy:ubuntu:sync

# 仅局域网
REMOTE=ubuntu npm run deploy:ubuntu:sync
```

环境变量：

| 变量 | 默认 | 说明 |
|------|------|------|
| `REMOTE` | `jack@ssh.datapro.asia` | SSH 目标 |
| `REMOTE_DIR` | `~/ViralOS` | Ubuntu 上的目录 |
| `VIRALOS_PORT` | `3010` | 监听端口 |

---

## 3. 验证（针对 Ubuntu，不是 localhost 开发机）

### 3.1 在 Ubuntu 本机验证

```bash
cd ~/ViralOS
npm run verify:func
curl -s http://127.0.0.1:3010/api/health   # {"service":"viralOS","status":"ok",...}
SMOKE_TEST_URL=http://127.0.0.1:3010 npm run smoke-test
```

### 3.2 从 macOS 打 Ubuntu（LAN）

```bash
VIRALOS_URL=http://192.168.1.4:3010 npm run verify:ubuntu
```

### 3.2.1 CCR / OpenRouter（无 `sk-ant-` 时）

密钥来自 `~/.claude-code-router/config.json` 的 `providers[0].api_key`，经 CCR 代理 `:3456`。

**一键（Mac）：**

```bash
npm run ops:ccr:start          # ccr start + SSH -R 3456 + 同步 Ubuntu .env
npm run ops:ccr:env-local        # 写入本项目 .env.local
npm run ops:ccr:status           # 检查 CCR 与隧道
npm run ops:ubuntu:llm           # CCR + deploy + verify:e2e-real
```

手动等价步骤见 `scripts/ops/ccr-tunnel.sh`。

### 3.3 真实 Anthropic 端到端（无 mock）

服务器 `.env` 与客户端均需有效 `ANTHROPIC_API_KEY`：

```bash
# Ubuntu 上（推荐：构建与推理同机）
cd ~/ViralOS
export ANTHROPIC_API_KEY=sk-ant-...
SMOKE_TEST_URL=http://127.0.0.1:3010 npm run verify:e2e-real

# 或从 mac 只测 HTTP/SSE（key 在 Ubuntu .env，客户端可不设）
VIRALOS_URL=http://192.168.1.4:3010 npm run verify:ubuntu:real
```

`verify:e2e-real` 校验：4 个 agent SSE、`complete`、**真实 token usage**、`real-ai-guard` 无 mock 文案。

### 3.4 无 mock 静态门禁

```bash
npm run verify:no-mock   # lib/ + pages/ 无 mock 实现字符串
npm run verify:func      # no-mock + 13 单元测试（无需 API key）
```

---

## 4. 与 invest-ai / llm-gateway 的关系

| 服务 | 端口 | 说明 |
|------|------|------|
| llm-gateway | 3000 | NeuraDesk 控制台 |
| **ViralOS** | **3010** | 本仓 campaign API |
| dataproai gateway | 8001 | 可选 `API_PROXY_BASE_URL` |

跨仓 live E2E（gateway ingest）：

```bash
# Ubuntu，gateway 已起
API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live
```

---

## 5. 故障排查

| 现象 | 处理 |
|------|------|
| macOS build OOM | **不要**在 mac 上 `verify:full`；用 `deploy:ubuntu:sync` |
| `502` / 连接拒绝 | Ubuntu 上 `tail ~/ViralOS/viralos.log`，重跑 `deploy-viralos.sh` |
| POST 503 | 在 Ubuntu `.env` 设置 `ANTHROPIC_API_KEY` 后重启 |
| smoke 404 | 等待启动完成；确认 `SMOKE_TEST_URL` 端口为 **3010** |

---

## 6. 相关文档

- [system-design-architecture.md](./system-design-architecture.md) §6 Deployment  
- [issue.md](./issue.md) — 部署 retro  
- [cross-repo-reuse-and-roadmap.md](./cross-repo-reuse-and-roadmap.md)
