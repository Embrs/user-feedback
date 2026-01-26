# User Feedback

基於 Node.js 的 MCP 反饋收集工具，支援 AI 工作彙報和用戶反饋收集。

## 功能特點

- **MCP 協議支援**：符合 Model Context Protocol 標準，可與 Claude Desktop、Cursor 等 MCP 客戶端整合
- **左右分割介面**：左側顯示 AI 工作彙報，右側為用戶反饋區域
- **圖片處理**：支援拖放上傳、順序調整、彈窗檢視
- **罐頭語快速回覆**：預設常用回覆，支援自訂編輯
- **深色主題**：與 IDE 環境風格一致

## 系統需求

- Node.js 18.0.0 或更高版本
- npm 或 yarn 套件管理器

## 安裝

### 從原始碼安裝（本地開發）

```bash
# 克隆專案
git clone <repository-url>
cd user-feedback

# 安裝依賴並建置
npm install
npm run build

# 建立全域連結（本地測試用）
npm link

# 現在可以在任何地方使用 user-feedback 命令
user-feedback --help
```

### 從 npm 安裝（發布後）

```bash
npm install -g user-feedback
```

## 解除安裝

```bash
# 如果使用 npm 全域安裝
npm uninstall -g user-feedback

# 如果從原始碼安裝，直接刪除專案目錄
rm -rf user-feedback

# 清理 npm 快取（可選）
npm cache clean --force
```

**注意**：解除安裝後，請記得從 MCP 客戶端配置中移除相關設定（如 Claude Desktop 的 `claude_desktop_config.json`）。

## 使用方式

### 作為 MCP 服務器

```bash
# 啟動 MCP 服務器（預設模式）
user-feedback start

# 指定端口
user-feedback start --port 3000

# 啟用除錯模式
user-feedback start --debug
```

### 僅 Web 模式（測試用）

```bash
user-feedback start --web
```

### 其他命令

```bash
# 檢查配置和系統狀態
user-feedback health

# 顯示當前配置
user-feedback config
```

## MCP 客戶端配置

### Cursor

1. 打開 Cursor 設定（`Cmd + ,`）
2. 搜尋 "MCP" 或進入 Features → MCP Servers
3. 點擊 "Edit in settings.json" 或 "Add Server"
4. 添加以下配置：

**方法一：使用絕對路徑（推薦本地開發）**
```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "node",
      "args": ["/Users/embrs/Desktop/Program/self/user-feedback/dist/cli.js"]
    }
  }
}
```

**方法二：使用 npm link 後**
```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "user-feedback"
    }
  }
}
```

5. 重啟 Cursor 使配置生效

### Claude Desktop

在 `~/Library/Application Support/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "node",
      "args": ["/Users/embrs/Desktop/Program/self/user-feedback/dist/cli.js"]
    }
  }
}
```

### Windsurf

在 MCP 設定中添加：

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "node",
      "args": ["/Users/embrs/Desktop/Program/self/user-feedback/dist/cli.js"]
    }
  }
}
```

## 環境變數配置

複製 `.env.example` 為 `.env` 並根據需要修改：

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `MCP_WEB_PORT` | Web 服務器端口 | 3239 |
| `MCP_DIALOG_TIMEOUT` | 反饋超時時間（秒） | 600 |
| `LOG_LEVEL` | 日誌級別（silent/error/warn/info/debug） | info |
| `MAX_IMAGE_SIZE_MB` | 最大圖片大小（MB） | 10 |

## MCP 工具 API

### collect_feedback

收集用戶對 AI 工作的反饋。

**參數：**
- `work_summary` (string, 必填)：AI 工作彙報內容

**返回：**
- 用戶提交的反饋內容（文字和/或圖片）

**範例：**
```
AI 調用 collect_feedback 工具，傳入工作彙報內容
→ 系統開啟 Web 介面
→ 用戶在介面中提交反饋
→ 反饋內容返回給 AI
```

## 開發

```bash
# 安裝依賴
npm install

# 開發模式（監聽變更）
npm run dev

# 建置
npm run build

# 執行測試
npm test

# 程式碼檢查
npm run lint
```

## 專案結構

```
src/
├── cli.ts              # CLI 入口
├── index.ts            # 模組導出
├── config/             # 配置管理
├── server/
│   ├── mcp-server.ts   # MCP 服務器
│   └── web-server.ts   # Web 服務器
├── static/             # 前端資源
│   ├── index.html      # 主頁面
│   ├── styles.css      # 樣式
│   └── app.js          # 前端邏輯
├── types/              # TypeScript 類型
└── utils/              # 工具函數
```

## 授權

MIT License
