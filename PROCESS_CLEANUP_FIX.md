# 進程清理修復說明

## 問題描述

在使用 MCP 專案時，關閉 IDE 對話後 `node` 程序沒有正確終止，導致程序累積。

## 修復內容

### 1. 優雅關閉機制

在 `MCPServer` 類中添加了完整的優雅關閉處理：

- **SIGINT 信號處理**：當用戶按下 Ctrl+C 時
- **SIGTERM 信號處理**：當系統發送終止信號時  
- **標準輸入關閉監聽**：當 IDE 關閉時觸發
- **進程退出監聽**：記錄進程退出狀態

### 2. 清理腳本

新增 `scripts/cleanup-processes.js` 腳本，可以：

- 自動檢測所有 `user-feedback` 相關進程
- 優雅終止進程（先發送 SIGTERM）
- 強制終止頑固進程（發送 SIGKILL）
- 提供詳細的清理報告

## 使用方法

### 清理現有殘留進程

```bash
# 方法 1：使用 npm 腳本
npm run cleanup

# 方法 2：直接運行腳本
node scripts/cleanup-processes.js
```

### 驗證修復效果

1. 啟動 MCP 服務器
2. 正常關閉 IDE
3. 檢查是否還有殘留進程：

```bash
ps aux | grep "node.*user-feedback" | grep -v grep
```

## 技術細節

### 優雅關閉流程

1. 收到終止信號後，設置關閉標誌防止重複處理
2. 調用 `stop()` 方法關閉 Web 服務器和 MCP 服務器
3. 記錄關閉日誌
4. 以適當的退出代碼終止進程

### 信號監聽

```javascript
// 監聽進程終止信號
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 監聽標準輸入關閉（當 IDE 關閉時）
process.stdin.on('close', () => {
  gracefulShutdown('stdin_close');
});
```

## 預防措施

為了避免未來再次出現此問題：

1. **定期清理**：如果發現系統變慢，可以運行 `npm run cleanup`
2. **監控進程**：使用 `ps aux | grep user-feedback` 定期檢查
3. **正常關閉**：盡量通過正常方式關閉 IDE，而不是強制終止

## 故障排除

如果清理腳本無法終止某些進程：

1. **手動終止**：找到 PID 並手動執行 `kill -9 <PID>`
2. **重啟系統**：最後的手段，重啟會清理所有進程
3. **檢查權限**：確保有足夠的權限終止進程

## 版本資訊

- 修復版本：v1.3.5+
- 修復日期：2026-01-28
- 影響範圍：所有使用 MCP 服務器的用戶
