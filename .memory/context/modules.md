# 功能模組清單

> 根據實際源碼分析生成（2026-02-24）

## 核心模組

| 模組 | 路徑 | 行數 | 說明 |
|------|------|------|------|
| 主入口 | `src/index.ts` | 16 | 統一匯出所有模組 |
| CLI | `src/cli.ts` | 144 | Commander CLI，支援 start/health/config 命令 |
| MCP 服務器 | `src/server/mcp-server.ts` | 330 | MCP 協議實現，註冊 `collect_feedback` 工具 |
| Web 服務器 | `src/server/web-server.ts` | 550 | Express + Socket.IO，反饋收集 Web 介面 |
| 配置管理 | `src/config/index.ts` | 134 | dotenv 載入 + 驗證 |
| 類型定義 | `src/types/index.ts` | 129 | 所有介面、錯誤類、型別 |
| 日誌工具 | `src/utils/logger.ts` | 220 | 多級日誌 + 檔案記錄 + 顏色控制 |

## 前端模組

| 模組 | 路徑 | 說明 |
|------|------|------|
| HTML 頁面 | `src/static/index.html` | 反饋收集頁面骨架 |
| 樣式 | `src/static/styles.css` | 頁面樣式 |
| 前端邏輯 | `src/static/app.js` | Socket.IO 客戶端 + 反饋提交邏輯 |

## 輔助模組

| 模組 | 路徑 | 說明 |
|------|------|------|
| 進程清理 | `scripts/cleanup-processes.js` | 清理殘留 Node 進程 |

## 模組關係圖

```
CLI (cli.ts)
 │
 ├── start (預設) ──→ MCPServer
 │                      │
 │                      ├── McpServer (@modelcontextprotocol/sdk)
 │                      │     └── StdioServerTransport
 │                      │
 │                      └── WebServer (組合)
 │                            ├── Express (HTTP 路由 + 靜態檔案)
 │                            ├── Socket.IO (即時通訊)
 │                            └── 會話管理 (Map<string, Session>)
 │
 ├── start --web ────→ MCPServer.startWebOnly()
 │                      └── 僅啟動 WebServer
 │
 ├── health ─────────→ 配置驗證
 └── config ─────────→ 顯示配置
```

## MCP 工具清單

| 工具名稱 | 參數 | 說明 |
|----------|------|------|
| `collect_feedback` | `work_summary: string` | 開啟 Web 介面收集使用者反饋 |
