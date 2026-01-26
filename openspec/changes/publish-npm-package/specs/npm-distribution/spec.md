## ADDED Requirements

### Requirement: NPM 套件發佈
系統 SHALL 作為 npm 套件 `@embrs/user-feedback` 發佈，允許全球開發者安裝使用。

#### Scenario: 全局安裝
- **WHEN** 用戶執行 `npm install -g @embrs/user-feedback`
- **THEN** 套件成功安裝並可透過 `user-feedback` 命令執行

#### Scenario: npx 直接執行
- **WHEN** 用戶執行 `npx @embrs/user-feedback`
- **THEN** 套件下載並直接啟動 MCP 服務

### Requirement: 安裝文件
README.md SHALL 包含完整的安裝與卸載指令。

#### Scenario: 安裝指引
- **WHEN** 用戶查看 README.md
- **THEN** 可找到 npm install 和 npx 的安裝指令

#### Scenario: 卸載指引
- **WHEN** 用戶需要卸載套件
- **THEN** README.md 提供 `npm uninstall -g @embrs/user-feedback` 指令

### Requirement: CI/CD 自動發佈
GitHub Actions SHALL 在版本標籤推送時自動發佈到 npm。

#### Scenario: 版本發佈觸發
- **WHEN** 推送 `v*` 標籤到 GitHub
- **THEN** 自動執行 build 並發佈到 npm registry

#### Scenario: 發佈失敗通知
- **WHEN** npm 發佈失敗
- **THEN** GitHub Actions 顯示錯誤並通知維護者
