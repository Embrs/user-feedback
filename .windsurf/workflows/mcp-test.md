---
description: mcp 測試
---

## MCP 工具測試流程

### 1. 檢查 chrome-devtools 工具
- 嘗試使用 mcp0_list_pages 檢查工具是否可用
- 如果失敗，記錄錯誤並繼續下一個工具
- 如果成功，前往 https://www.google.com

### 2. 檢查 user-feedback 工具
- 嘗試動態檢測並使用可用的 collect_feedback 工具
- 如果失敗，記錄錯誤
- 如果成功，收集測試回饋

### 執行步驟
1. 測試 chrome-devtools 工具
2. 如果成功，導航到 Google
3. 測試 user-feedback 工具
4. 提供測試結果總結