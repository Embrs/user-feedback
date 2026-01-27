# 專案業務概覽

> 專案特定的業務邏輯與概念，供 AI 參考。

## 專案定位

**@embrs/user-feedback**
- **定位**：基於 Node.js 的 MCP 反饋收集器，支援 AI 工作彙報和用戶反饋收集
- **技術棧**：Node.js, TypeScript, Express, Socket.IO, MCP SDK
- **部署**：npm 全域安裝，支援 MCP 客戶端整合

## 關鍵概念速查

### MCP 協議
- **Model Context Protocol**：AI 與工具系統的標準通訊協議
- **工具註冊**：`collect_feedback` 工具提供反饋收集功能
- **動態檢測**：支援 `mcp0_` 到 `mcp9_` 服務器順序變動

### 反饋收集流程
1. **AI 觸發**：工作完成後調用 `collect_feedback` 工具
2. **Web 介面**：自動開啟瀏覽器提供反饋表單
3. **多媒體支援**：文字、圖片、拖放上傳
4. **即時通訊**：Socket.IO 實時傳輸反饋數據

### 技術架構
- **CLI 模式**：標準 MCP 服務器運行
- **Web 模式**：獨立 Web 服務器（測試用）
- **雙重介面**：左側 AI 工作彙報，右側用戶反饋區域

## 業務規則索引

| 規則 | 文件 |
|------|------|
| MCP 工具使用時機 | `.windsurf/skills/user-feedback/SKILL.md` |
| 反饋收集觸發條件 | `.windsurf/workflows/user-feedback.md` |
| 專案維護流程 | `.windsurf/workflows/git-commit.md` |
| OpenSpec 規格管理 | `openspec/specs/mcp-core/spec.md` |

## 用戶場景

### 開發者使用
```bash
# 全域安裝
npm install -g @embrs/user-feedback

# MCP 客戶端配置
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": ["-y", "@embrs/user-feedback"]
    }
  }
}
```

### AI 助手使用
- 工作完成後自動觸發反饋收集
- 支援文字澄清和圖片標註
- 提供罐頭語快速回覆選項

## 維護要點

- **版本管理**：遵循 SemVer，每次變更更新版本號
- **名稱一致性**：確保所有文件使用 `@embrs/user-feedback` 和 `user-feedback` 命令
- **MCP 兼容性**：動態檢測機制確保服務器順序變動時正常工作
