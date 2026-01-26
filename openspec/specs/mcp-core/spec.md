# mcp-core Specification

## Purpose
TBD - created by archiving change add-mcp-feedback-tool. Update Purpose after archive.
## Requirements
### Requirement: MCP 服務器核心
系統 SHALL 提供符合 MCP 協議的服務器，支援 AI 助手調用 `collect_feedback` 工具收集用戶反饋。

#### Scenario: AI 調用 collect_feedback 工具
- **WHEN** AI 助手調用 `collect_feedback` 工具並提供 `work_summary` 參數
- **THEN** 系統創建反饋會話並返回會話 ID
- **AND** 系統啟動 Web 介面等待用戶反饋

#### Scenario: 用戶提交反饋
- **WHEN** 用戶在 Web 介面提交反饋內容
- **THEN** 系統將反饋內容返回給 AI 助手
- **AND** AI 助手可根據反饋繼續對話

#### Scenario: 反饋超時處理
- **WHEN** 用戶在設定的超時時間內未提交反饋
- **THEN** 系統返回超時錯誤給 AI 助手
- **AND** 會話自動關閉

### Requirement: MCP 觸發時機
系統 SHALL 在以下情況支援 AI 助手調用反饋收集工具：
- AI 完成回覆時
- AI 提出問題時
- AI 完成工作總結時

#### Scenario: AI 完成回覆後觸發
- **WHEN** AI 助手完成一個任務的回覆
- **THEN** AI 可調用 `collect_feedback` 收集用戶確認或後續指示

#### Scenario: AI 提問時觸發
- **WHEN** AI 助手需要用戶澄清需求
- **THEN** AI 可調用 `collect_feedback` 等待用戶回應

### Requirement: Web 服務器
系統 SHALL 提供 HTTP Web 服務器，用於呈現反饋收集介面。

#### Scenario: 啟動 Web 服務器
- **WHEN** MCP 服務器啟動
- **THEN** Web 服務器在配置的端口啟動
- **AND** 可通過瀏覽器訪問反饋介面

#### Scenario: 動態端口分配
- **WHEN** 配置的端口被佔用
- **THEN** 系統自動選擇可用端口
- **AND** 記錄實際使用的端口

### Requirement: 會話管理
系統 SHALL 管理反饋會話的生命週期，包括創建、等待、完成和超時狀態。

#### Scenario: 創建會話
- **WHEN** 收到 `collect_feedback` 調用
- **THEN** 系統創建唯一會話 ID
- **AND** 會話狀態設為 "pending"

#### Scenario: 會話完成
- **WHEN** 用戶提交反饋
- **THEN** 會話狀態更新為 "completed"
- **AND** 反饋內容可被讀取

### Requirement: CLI 介面
系統 SHALL 提供命令行介面，支援啟動、配置和測試功能。

#### Scenario: 啟動 MCP 服務器
- **WHEN** 用戶執行 `mcp-feedback-collector start`
- **THEN** 系統啟動 MCP 服務器和 Web 服務器

#### Scenario: 僅啟動 Web 模式
- **WHEN** 用戶執行 `mcp-feedback-collector start --web`
- **THEN** 系統僅啟動 Web 服務器（用於測試）

#### Scenario: 測試反饋功能
- **WHEN** 用戶執行 `mcp-feedback-collector test-feedback`
- **THEN** 系統創建測試會話並自動開啟瀏覽器

### Requirement: 配置管理
系統 SHALL 支援通過環境變數和配置文件管理運行時配置。

#### Scenario: 環境變數配置
- **WHEN** 設定 `MCP_WEB_PORT` 環境變數
- **THEN** Web 服務器使用指定端口

#### Scenario: 配置文件載入
- **WHEN** 存在 `.env` 配置文件
- **THEN** 系統自動載入配置值

### Requirement: 跨平台相容
系統 SHALL 在 Windows、macOS、Linux 系統上正常運行。

#### Scenario: macOS 運行
- **WHEN** 在 macOS 系統執行
- **THEN** 所有功能正常運作

#### Scenario: Windows 運行
- **WHEN** 在 Windows 系統執行
- **THEN** 所有功能正常運作
- **AND** 路徑處理正確

#### Scenario: Linux 運行
- **WHEN** 在 Linux 系統執行
- **THEN** 所有功能正常運作

