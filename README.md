# User Feedback

[![npm version](https://badge.fury.io/js/%40embrs%2Fuser-feedback.svg)](https://www.npmjs.com/package/@embrs/user-feedback)

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

**📦 npm 套件**: [https://www.npmjs.com/package/@embrs/user-feedback](https://www.npmjs.com/package/@embrs/user-feedback?activeTab=readme)

```bash
# 全域安裝
npm install -g @embrs/user-feedback

# 更新到最新版本
npm update -g @embrs/user-feedback

# 或使用 npx 直接執行（無需安裝，自動使用最新版）
npx @embrs/user-feedback@latest --help
```

## 解除安裝

```bash
npm uninstall -g @embrs/user-feedback
```

**注意**：解除安裝後，請記得從 MCP 客戶端配置中移除相關設定。

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

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": ["-y", "@embrs/user-feedback"],
      "env": {
        "MCP_WEB_PORT": "3000",
        "MCP_DIALOG_TIMEOUT": "60000",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

5. 重啟 Cursor 使配置生效

**💡 提示**：可以在 `env` 中設定任何環境變數，優先順序高於 `.env` 文件。

### Claude Desktop

在 `~/Library/Application Support/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": ["-y", "@embrs/user-feedback"],
      "env": {
        "MCP_WEB_PORT": "3000",
        "MCP_DIALOG_TIMEOUT": "60000",
        "LOG_LEVEL": "warn"
      }
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
      "command": "npx",
      "args": ["-y", "@embrs/user-feedback"],
      "env": {
        "MCP_WEB_PORT": "3000",
        "MCP_DIALOG_TIMEOUT": "60000",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## 環境變數配置

### 🎯 推薦方式：MCP 客戶端配置

直接在 MCP 客戶端配置中設定環境變數，優先順序最高：

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": ["-y", "@embrs/user-feedback"],
      "env": {
        "MCP_WEB_PORT": "3000",
        "MCP_DIALOG_TIMEOUT": "60000",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

### 📁 備用方式：.env 文件

複製 `.env.example` 為 `.env` 並根據需要修改：

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `MCP_WEB_PORT` | Web 服務器端口 | 3239 |
| `MCP_DIALOG_TIMEOUT` | 反饋超時時間（秒） | 60000 |
| `LOG_LEVEL` | 日誌級別（silent/error/warn/info/debug） | info |
| `MCP_MAX_FILE_SIZE` | 最大檔案大小（位元組） | 10485760 (10MB) |

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

詳見 [DEV.md](DEV.md)。

## 授權

MIT License
