# 技術決策記錄

> 根據實際 package.json 與源碼分析生成（2026-02-24）

## 核心技術棧

| 決策 | 選擇 | 原因 |
|------|------|------|
| 語言 | TypeScript 5.2+ | 型別安全、嚴格模式全開 |
| 模組系統 | ESM (`"type": "module"`) | 現代 Node.js 標準 |
| 編譯目標 | ES2022 | 支援 top-level await、private fields |
| 執行環境 | Node.js >= 18 | LTS 穩定版 |

## 框架與庫

| 決策 | 選擇 | 版本 | 原因 |
|------|------|------|------|
| MCP 協議 | `@modelcontextprotocol/sdk` | ^1.12.1 | 官方 MCP SDK |
| HTTP 框架 | Express | ^4.18.2 | 成熟穩定、生態豐富 |
| 即時通訊 | Socket.IO | ^4.7.2 | 可靠的 WebSocket 抽象 |
| CLI 框架 | Commander | ^11.1.0 | 標準 CLI 解析方案 |
| Schema 驗證 | Zod | ^3.22.4 | MCP SDK 原生整合 |
| 圖片處理 | Jimp | ^0.22.10 | 純 JS 圖片處理（無原生依賴） |
| 環境變數 | dotenv | ^16.3.1 | `.env` 檔案載入 |
| 安全 | Helmet | ^7.1.0 | HTTP 安全標頭 |
| 壓縮 | Compression | ^1.7.4 | 回應壓縮 |
| 瀏覽器開啟 | open | ^9.1.0 | 跨平台開啟瀏覽器 |

## 架構決策

| 決策 | 選擇 | 原因 |
|------|------|------|
| 前端技術 | 原生 HTML/CSS/JS | 輕量、無建構步驟、MCP 場景不需複雜前端 |
| 傳輸層 | stdio (MCP) + HTTP/WS (Web) | MCP 標準 + 瀏覽器互動 |
| 會話管理 | 記憶體 Map | 短生命週期反饋會話，無需持久化 |
| 端口策略 | 動態端口尋找 | 避免端口衝突，依序嘗試相鄰端口 |
| 進程管理 | 優雅關閉 (SIGINT/SIGTERM/stdin) | 確保資源正確釋放 |
| 日誌 | 自建 Logger | 支援 MCP 模式（無色彩）+ 檔案記錄 |
| 錯誤處理 | 自訂 MCPError 類 | 統一錯誤碼與訊息格式 |
| 配置管理 | 環境變數 + 預設值 | 靈活部署、敏感資訊不入代碼 |

## 編碼風格

| 項目 | 慣例 |
|------|------|
| 縮排 | 2 空格 |
| 引號 | 單引號 |
| 分號 | 有 |
| 命名 | camelCase（變數/函數）、PascalCase（類/介面） |
| 註解語言 | 繁體中文 |
| 文件結構 | JSDoc 區塊註解 + 行內說明 |
| TypeScript | strict 全開（noImplicitAny, strictNullChecks 等） |

## 待評估項目

- [ ] 是否引入單元測試覆蓋（Jest 已配置但無測試檔案）
- [ ] 是否支援多語言介面
- [ ] 是否遷移前端到 React/Vue（目前原生 JS 足夠）
