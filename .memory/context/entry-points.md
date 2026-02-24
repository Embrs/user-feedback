# 開發入口點

> 根據實際專案結構生成（2026-02-24）

## 啟動方式

```bash
# 開發模式（tsx watch 熱重載）
npm run dev

# MCP 模式（編譯後）
npm run build && npm start

# 僅 Web 模式（方便除錯前端）
npm run dev -- start --web

# 除錯模式（啟用檔案日誌）
npm run dev -- start --debug

# 指定端口
npm run dev -- start --port 3300
```

## CLI 命令

| 命令 | 說明 |
|------|------|
| `start` (預設) | 啟動 MCP 服務器 |
| `start --web` | 僅啟動 Web 模式 |
| `start --debug` | 啟用除錯日誌 |
| `start --port <n>` | 指定 Web 端口 |
| `health` | 檢查配置與系統狀態 |
| `config` | 顯示當前配置 |

## 常見開發任務

### 修改 MCP 工具行為

1. 編輯 `src/server/mcp-server.ts` → `registerTools()` 方法
2. 修改 `collectFeedback()` 或 `formatFeedbackForMCP()` 邏輯

### 修改 Web 介面

1. 頁面結構 → `src/static/index.html`
2. 樣式 → `src/static/styles.css`
3. 互動邏輯 → `src/static/app.js`
4. 後端路由/Socket 事件 → `src/server/web-server.ts`

### 新增 MCP 工具

1. 在 `src/server/mcp-server.ts` 的 `registerTools()` 中新增 `registerTool()` 呼叫
2. 定義參數型別於 `src/types/index.ts`
3. 實現工具邏輯方法

### 修改配置項

1. 在 `src/types/index.ts` 的 `Config` 介面新增欄位
2. 在 `src/config/index.ts` 的 `createDefaultConfig()` 添加環境變數讀取
3. 在 `validateConfig()` 添加驗證規則
4. 更新 `.env.example`

### 新增 API 端點

1. 在 `src/server/web-server.ts` 的 `setupRoutes()` 中新增路由

### 新增 Socket 事件

1. 在 `src/types/index.ts` 的 `SocketEvents` 介面新增事件型別
2. 在 `src/server/web-server.ts` 的 `setupSocketHandlers()` 中新增處理器
3. 前端 `src/static/app.js` 中添加對應事件監聽

## 重要環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `MCP_WEB_PORT` | 3239 | Web 服務器端口 |
| `MCP_DIALOG_TIMEOUT` | 60000 | 反饋超時（秒） |
| `MCP_API_KEY` | - | OpenAI API Key（圖片轉文字用） |
| `MCP_ENABLE_IMAGE_TO_TEXT` | true | 是否啟用圖片轉文字 |
| `LOG_LEVEL` | info | 日誌級別 |
| `MCP_FORCE_PORT` | false | 強制使用指定端口 |
| `MCP_USE_FIXED_URL` | true | 使用固定 URL（無 session 參數） |

## 建構與發布

```bash
npm run build        # TypeScript 編譯 + 複製靜態資源
npm run clean        # 清理 dist/
npm run lint         # ESLint 檢查
npm run lint:fix     # 自動修復
npm run test         # Jest 測試
npm run cleanup      # 清理殘留進程
```
