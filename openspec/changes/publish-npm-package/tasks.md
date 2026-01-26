## 1. Package 配置
- [x] 1.1 更新 `package.json` 套件名稱為 `@embrs/user-feedback`
- [x] 1.2 補充 `repository`, `homepage`, `bugs` 欄位
- [x] 1.3 更新 `author` 欄位
- [x] 1.4 確認 `files` 欄位只包含必要檔案

## 2. 文件更新
- [x] 2.1 更新 `README.md` 添加安裝說明（npm install / npx）
- [x] 2.2 添加卸載說明
- [x] 2.3 添加 MCP 配置範例
- [ ] 2.4 添加使用範例和截圖（可選）

## 3. GitHub Actions CI/CD
- [x] 3.1 創建 `.github/workflows/publish.yml`
- [x] 3.2 配置版本標籤觸發發佈
- [ ] 3.3 配置 npm OIDC Trusted Publishing

## 4. 首次發佈準備
- [ ] 4.1 確認 npm 帳戶已登入 (`npm login`)
- [ ] 4.2 確認 scope `@embrs` 已創建或有權限
- [ ] 4.3 執行 `npm publish --access public` 首次發佈
- [ ] 4.4 驗證安裝 `npx @embrs/user-feedback`
