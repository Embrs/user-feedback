#!/usr/bin/env node

/**
 * 清理殘留的 user-feedback 進程
 */

import { execSync } from 'child_process';

/**
 * 獲取所有 user-feedback 相關進程
 */
function getUserFeedbackProcesses() {
  try {
    const result = execSync('ps aux | grep "node.*user-feedback" | grep -v grep', { 
      encoding: 'utf8' 
    });
    
    return result
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[1]; // PID 是第二列
      })
      .filter(pid => pid && /^\d+$/.test(pid));
  } catch (error) {
    return [];
  }
}

/**
 * 殺死進程
 */
function killProcess(pid) {
  try {
    execSync(`kill ${pid}`, { stdio: 'ignore' });
    console.log(`✓ 已終止進程 ${pid}`);
    return true;
  } catch (error) {
    console.log(`✗ 終止進程 ${pid} 失敗:`, error.message);
    return false;
  }
}

/**
 * 強制殺死進程
 */
function forceKillProcess(pid) {
  try {
    execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    console.log(`✓ 已強制終止進程 ${pid}`);
    return true;
  } catch (error) {
    console.log(`✗ 強制終止進程 ${pid} 失敗:`, error.message);
    return false;
  }
}

/**
 * 主清理函數
 */
function main() {
  console.log('🧹 清理殘留的 user-feedback 進程...\n');
  
  const pids = getUserFeedbackProcesses();
  
  if (pids.length === 0) {
    console.log('✅ 沒有發現殘留的 user-feedback 進程');
    return;
  }
  
  console.log(`發現 ${pids.length} 個殘留進程: ${pids.join(', ')}\n`);
  
  let successCount = 0;
  
  // 嘗試優雅終止
  console.log('🔄 嘗試優雅終止進程...');
  for (const pid of pids) {
    if (killProcess(pid)) {
      successCount++;
    }
  }
  
  // 等待一下
  setTimeout(() => {
    // 檢查還有哪些進程沒有被終止
    const remainingPids = getUserFeedbackProcesses();
    
    if (remainingPids.length > 0) {
      console.log('\n⚠️  部分進程未能優雅終止，嘗試強制終止...');
      for (const pid of remainingPids) {
        if (forceKillProcess(pid)) {
          successCount++;
        }
      }
    }
    
    // 最終檢查
    const finalPids = getUserFeedbackProcesses();
    
    if (finalPids.length === 0) {
      console.log(`\n🎉 清理完成！成功終止了 ${successCount} 個進程`);
    } else {
      console.log(`\n❌ 清理失敗，仍有 ${finalPids.length} 個進程殘留: ${finalPids.join(', ')}`);
      console.log('請手動終止這些進程或重啟系統');
    }
  }, 2000);
}

// 運行清理
main();
