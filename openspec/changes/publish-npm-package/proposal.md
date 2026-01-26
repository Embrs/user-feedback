# Change: 發佈 NPM 套件

## Why
讓其他開發者可以透過 npm/npx 安裝並使用此 MCP 反饋收集工具，擴大專案的使用範圍和影響力。

## What Changes
- 更新 `package.json` 套件名稱為 `@embrs/user-feedback`（scoped package）
- 完善 `README.md` 包含安裝、使用、卸載說明
- 新增 GitHub Actions workflow 實現 CI/CD 自動發佈到 npm
- 新增 `.npmignore` 或調整 `files` 欄位確保只發佈必要檔案

## Impact
- Affected specs: 新增 `npm-distribution` 能力規格
- Affected code: `package.json`, `README.md`, `.github/workflows/publish.yml`
