# 知識庫維護日誌

> 記錄所有知識庫變更歷史

## 2026-01

### 2026-01-28
- **[更新]** `items/modules.md` - 更新為 MCP 專案實際模組結構
- **[更新]** `items/architecture.md` - 調整為 user-feedback 專案架構
- **[新增]** `PROCESS_CLEANUP_FIX.md` - 進程清理修復說明文檔
- **[新增]** `scripts/cleanup-processes.js` - 進程清理腳本
- **[修復]** `src/server/mcp-server.ts` - 添加優雅關閉機制

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
- `[修復]` - Bug 修復
