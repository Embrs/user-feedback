# 目錄結構與分層設計

> 根據實際專案結構生成（2026-02-24）

## 整體結構

```
user-feedback/
├── src/                        # 源代碼（7 個 TS 檔 + 3 個靜態檔）
│   ├── index.ts               # 主入口，統一匯出
│   ├── cli.ts                 # CLI 入口（Commander）
│   ├── server/                # 服務器實現
│   │   ├── mcp-server.ts      # MCP 服務器（330 行）
│   │   └── web-server.ts      # Web 服務器（550 行）
│   ├── config/                # 配置管理
│   │   └── index.ts           # 環境變數 + dotenv
│   ├── types/                 # TypeScript 類型定義
│   │   └── index.ts           # 所有介面與錯誤類
│   ├── utils/                 # 工具函數
│   │   └── logger.ts          # 日誌工具（支援檔案記錄）
│   └── static/                # 前端靜態資源
│       ├── index.html         # 反饋收集頁面
│       ├── styles.css         # 樣式
│       └── app.js             # 前端邏輯（Socket.IO 客戶端）
│
├── scripts/                    # 輔助腳本
│   └── cleanup-processes.js   # 進程清理工具
│
├── dist/                       # 編譯輸出（gitignored）
├── openspec/                   # OpenSpec 規範管理
│
├── .windsurf/                  # AI Agent 配置
│   ├── skills/                # Agent Skills
│   └── workflows/             # 工作流程
│
├── .memory/                    # 專案知識庫（跨 AI 工具共享）
│   ├── context/               # 核心知識
│   └── archive/               # 歷史歸檔
│
├── package.json               # 專案配置（ESM, bin: user-feedback）
├── tsconfig.json              # TypeScript 配置（strict 全開）
├── .env.example               # 環境變數範本
└── README.md                  # 專案說明
```

## 分層設計

```
┌─────────────────────────────────────────┐
│          CLI 層 (cli.ts)                │
│  Commander 解析命令 → 啟動對應模式       │
├─────────────────────────────────────────┤
│          服務層 (server/)               │
│  MCPServer: MCP 協議 + 工具註冊         │
│  WebServer: Express + Socket.IO         │
│  兩者為組合關係（MCPServer 持有 WebServer）│
├─────────────────────────────────────────┤
│          基礎層                          │
│  Config: 環境變數管理                    │
│  Types: 統一類型定義                     │
│  Logger: 日誌輸出（console + file）      │
├─────────────────────────────────────────┤
│          前端層 (static/)               │
│  原生 HTML/CSS/JS + Socket.IO 客戶端    │
└─────────────────────────────────────────┘
```

## 資料流

```
AI (IDE) ─── stdio ──→ MCPServer
                          │
                    collect_feedback()
                          │
                    WebServer.start()
                          │
                    開啟瀏覽器 → 前端頁面
                          │
              使用者填寫反饋 ← Socket.IO → WebServer
                          │
                    格式化為 MCP 內容
                          │
AI (IDE) ←── stdio ──── 回傳結果
```

## 關鍵配置檔案

| 檔案 | 用途 |
|------|------|
| `package.json` | 專案配置、依賴、npm scripts |
| `tsconfig.json` | TypeScript 嚴格模式配置 |
| `.env` / `.env.example` | 環境變數（端口、超時、API Key 等） |
| `AGENTS.md` | OpenSpec 指令入口 |
