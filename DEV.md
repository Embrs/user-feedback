# 開發指南

本文檔說明如何在本地開發和測試此專案。

## 環境需求

- Node.js 18.0.0 或更高版本
- npm 套件管理器

## 從原始碼安裝

```bash
# 克隆專案
git clone https://github.com/Embrs/user-feedback.git
cd user-feedback

# 安裝依賴
npm install

# 建置
npm run build

# 建立全域連結（本地測試用）
npm link
```

## 開發命令

```bash
# 開發模式（監聽變更）
npm run dev

# 建置
npm run build

# 執行測試
npm test

# 程式碼檢查
npm run lint

# 修復程式碼風格
npm run lint:fix

# 清理建置產物
npm run clean
```

## 本地 MCP 客戶端配置

開發時可使用絕對路徑配置 MCP 客戶端：

### Cursor / Windsurf / Claude Desktop

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "node",
      "args": ["/path/to/user-feedback/dist/cli.js"]
    }
  }
}
```

將 `/path/to/user-feedback` 替換為你的本地專案路徑。

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

## 解除本地連結

```bash
# 移除全域連結
npm unlink -g @embrs/user-feedback

# 或直接刪除專案目錄
rm -rf user-feedback
```

## 發佈新版本

1. 更新 `package.json` 中的版本號
2. 提交並推送到 `main` 分支
3. GitHub Actions 會自動發佈到 npm
