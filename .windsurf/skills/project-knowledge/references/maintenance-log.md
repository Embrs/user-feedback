# 知識庫維護日誌

> 記錄所有知識庫變更歷史

## 2026-01

### 2026-01-27
- **[功能]** `src/static/app.js` - 新增全螢幕拖放功能，支援頁面任意位置拖放圖片
- **[樣式]** `src/static/styles.css` - 新增全螢幕拖放覆蓋層樣式與動畫效果
- **[重構]** `items/architecture.md` - 更新為 MCP 反饋收集器實際架構，加入全螢幕拖放系統說明
- **[修改]** `package.json` + `package-lock.json` - 統一專案名稱為 @embrs/user-feedback
- **[修改]** `openspec/specs/mcp-core/spec.md` - 更新命令名稱從 mcp-feedback-collector 改為 user-feedback
- **[修改]** `.windsurf/skills/user-feedback/SKILL.md` - 實作動態 MCP 工具檢測機制，支援順序變動
- **[修改]** `.windsurf/workflows/*` - 更新工作流程以使用動態工具檢測
- **[新增]** `.memory/context/BUSINESS_OVERVIEW.md` - 創建專案業務概覽文件
- **[更新]** `items/modules.md` - 完善 MCP 反饋收集器功能模組清單
- **[格式]** `items/architecture.md` - 調整目錄結構格式對齊
- **[修改]** `src/config/index.ts` - 調整預設超時時間從 600 秒改為 60000 秒
- **[修改]** `.env.example` + `.env` - 更新環境變數預設值與驗證範圍
- **[更新]** `README.md` - 完善環境變數文檔與 MCP 配置範例

### 2026-01-23
- **[重構]** `SKILL.md` - 改為通用模板，移除專案特定內容
- **[新增]** `.memory/context/BUSINESS_OVERVIEW.md` - 專案業務概覽
- **[新增]** `items/knowledge-lifecycle.md` - 知識生命週期管理
- **[新增]** `references/maintenance-log.md` - 維護日誌
- **[歸檔]** `enhance-project-knowledge-skill` - 增強專案知識庫自主運行機制
- **[歸檔]** `create-agent-skills-system` - 建立 Agent Skills 系統（包含 8 個基礎 Skills）
- **[重構]** `.windsurf/skills/*` - 全面移除專案特定內容（享睡寶、硬編碼帳號）
- **[更新]** `items/tech-decisions.md` - 加入 Agent 系統決策
- **[更新]** `nuxt.config.ts` - 恢復預設端口 3000

---

## 記錄格式

```markdown
### YYYY-MM-DD
- **[類型]** `影響文件` - 變更描述
```

### 變更類型
- `[新增]` - 新增文件或內容
- `[更新]` - 更新現有內容
- `[刪除]` - 刪除文件
- `[歸檔]` - 移至歸檔
- `[重構]` - 結構調整
