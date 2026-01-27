# MCP 反饋收集器架構

> MCP Feedback Collector - 基於 Node.js 的現代化反饋收集系統

## 整體結構

```
@embrs/user-feedback/
├── src/                    # 原始碼
│   ├── cli.ts             # CLI 入口點
│   ├── index.ts           # 主要模組
│   ├── config/            # 配置管理
│   │   └── index.ts       # 環境變數與配置
│   ├── server/            # 服務器實作
│   │   ├── mcp-server.ts  # MCP 服務器
│   │   └── web-server.ts  # Web 服務器
│   ├── static/            # 前端靜態資源
│   │   ├── index.html     # 反饋收集頁面
│   │   ├── app.js         # 前端 JavaScript
│   │   └── styles.css     # 樣式表
│   ├── types/             # TypeScript 類型定義
│   │   └── index.ts       # 核心類型
│   └── utils/             # 工具函數
│       └── logger.ts      # 日誌系統
│
├── dist/                   # 編譯輸出
│   ├── cli.js             # 編譯後 CLI
│   ├── static/            # 複製的靜態資源
│   └── ...                # 其他編譯檔案
│
├── openspec/              # OpenSpec 規範管理
│   ├── active/            # 進行中的規範
│   ├── applied/          # 已應用的規範
│   └── archive/           # 歸檔的規範
│
├── .windsurf/             # AI Agent 配置
│   ├── skills/            # Agent Skills
│   └── workflows/         # 工作流程
│
├── .memory/               # AI 記憶庫
│   ├── archive/           # 歷史歸檔
│   └── context/           # 業務規則
│
└── package.json           # 專案配置
```

## 分層設計

```
┌─────────────────────────────────────┐
│           CLI (cli.ts)              │
│         命令行介面與參數解析          │
│              ↓                      │
┌─────────────────────────────────────┐
│         MCP 服務器層                 │
│    MCP 協議處理 ↔ AI 工具整合        │
│              ↓                      │
┌─────────────────────────────────────┐
│         Web 服務器層                 │
│   Express + Socket.IO + 靜態檔案     │
│              ↓ HTTP/WebSocket        │
┌─────────────────────────────────────┐
│         前端 (static/)              │
│   HTML + CSS + JavaScript (Vanilla) │
│              ↓                      │
┌─────────────────────────────────────┐
│         用戶瀏覽器                   │
│     拖放上傳 + 反饋表單             │
└─────────────────────────────────────┘
```

## 核心功能模組

| 模組 | 檔案 | 功能描述 |
|------|------|----------|
| MCP 服務器 | `server/mcp-server.ts` | MCP 協議實作、工具函數註冊 |
| Web 服務器 | `server/web-server.ts` | HTTP 服務、WebSocket、靜態檔案 |
| 前端介面 | `static/app.js` | 反饋收集 UI、拖放功能、即時通訊 |
| 配置管理 | `config/index.ts` | 環境變數、預設配置、驗證 |
| 類型定義 | `types/index.ts` | TypeScript 類型、介面定義 |
| 日誌系統 | `utils/logger.ts` | 結構化日誌、等級管理 |

## 關鍵配置檔案

| 檔案 | 用途 |
|------|------|
| `package.json` | 專案依賴與腳本 |
| `tsconfig.json` | TypeScript 編譯配置 |
| `.env.example` | 環境變數範本 |
| `DEV.md` | 開發指南 |

## 前端特色功能

### 全螢幕拖放系統
- **全域監聽**: `dragenter`, `dragleave`, `dragover`, `drop` 事件
- **視覺回饋**: 全螢幕覆蓋層、動畫效果、模糊背景
- **響應式設計**: 支援各種螢幕尺寸
- **無縫整合**: 與現有拖放功能完美結合

### 即時通訊系統
- **WebSocket**: Socket.IO 即時雙向通訊
- **會話管理**: 動態會話分配與超時處理
- **狀態同步**: 反饋狀態即時更新

## 同步檢查

執行 `scripts/sync-check.sh` 可查看實際數量統計：
```bash
bash .windsurf/skills/project-knowledge/scripts/sync-check.sh
```
