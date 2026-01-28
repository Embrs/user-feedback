# 目錄結構

> 動態生成，請根據實際專案結構更新

## 整體結構

```
user-feedback/
├── src/                     # 源代碼
│   ├── server/             # 服務器實現
│   │   ├── mcp-server.ts   # MCP 服務器
│   │   ├── web-server.ts   # Web 服務器
│   │   └── routes/         # API 路由
│   ├── config/             # 配置管理
│   ├── types/              # TypeScript 類型
│   ├── utils/              # 工具函數
│   └── cli.ts              # CLI 入口
│
├── scripts/                # 腳本工具
│   └── cleanup-processes.js # 進程清理腳本
│
├── dist/                   # 編譯輸出
├── node_modules/           # 依賴包
│
├── .windsurf/              # AI Agent 配置
│   ├── skills/             # Agent Skills
│   └── workflows/          # 工作流程
│
├── .memory/                # AI 記憶庫
│   ├── archive/            # 歷史歸檔
│   └── context/            # 業務規則
│
├── openspec/               # OpenSpec 規範
├── package.json           # 專案配置
└── README.md              # 專案說明
```

## 分層設計

```
┌─────────────────────────────────────┐
│           CLI 層 (cli.ts)           │
│              ↓                      │
┌─────────────────────────────────────┐
│         服務層 (server/)           │
│  MCP Server ←→ Web Server         │
│              ↓                      │
┌─────────────────────────────────────┐
│         工具層 (utils/)            │
│  Logger → Config → Types           │
└─────────────────────────────────────┘
```

## 關鍵配置檔案

| 檔案 | 用途 |
|------|------|
| `package.json` | 專案配置和依賴 |
| `tsconfig.json` | TypeScript 配置 |
| `.env.example` | 環境變數範本 |
| `src/cli.ts` | CLI 入口點 |
| `scripts/cleanup-processes.js` | 進程清理工具 |

## 進程管理

專案採用優雅關閉機制：

- **信號監聽**：SIGINT、SIGTERM、stdin 關閉
- **清理腳本**：自動清理殘留進程
- **日誌記錄**：完整的關閉流程記錄

## 同步檢查

定期檢查目錄結構是否與文檔同步：
```bash
find src -name "*.ts" | wc -l  # 統計 TypeScript 檔案
```
