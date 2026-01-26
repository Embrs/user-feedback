#!/usr/bin/env node

/**
 * MCP Feedback Collector - CLI 入口
 */

import { program } from 'commander';
import { getConfig, displayConfig } from './config/index.js';
import { logger } from './utils/logger.js';
import { MCPServer } from './server/mcp-server.js';
import { MCPError } from './types/index.js';
import { VERSION } from './index.js';

// 檢測 MCP 模式
const isMCPMode = !process.stdin.isTTY ||
                  process.env['NODE_ENV'] === 'mcp' ||
                  process.argv.includes('--mcp-mode');

if (isMCPMode) {
  logger.disableColors();
  // 在 MCP 模式下保持最低級別的日誌以便調試
  logger.setLevel('error');
}

/**
 * 顯示歡迎資訊
 */
function showWelcome(): void {
  console.log('MCP Feedback Collector v' + VERSION);
  console.log('基於 Node.js 的現代化反饋收集器\n');
}

/**
 * 啟動 MCP 服務器
 */
async function startMCPServer(options: {
  port?: number;
  web?: boolean;
  debug?: boolean;
}): Promise<void> {
  try {
    const config = getConfig();

    if (!isMCPMode) {
      showWelcome();
      logger.setLevel(config.logLevel as any);
    }

    if (options.port) {
      config.webPort = options.port;
    }

    if (!isMCPMode && options.debug) {
      config.logLevel = 'debug';
      logger.enableFileLogging();
      logger.setLevel('debug');
      logger.debug('除錯模式已啟用');
    }

    if (logger.getLevel() === 'debug') {
      displayConfig(config);
      console.log('');
    }

    const server = new MCPServer(config);

    if (options.web) {
      logger.info('啟動 Web 模式...');
      await server.startWebOnly();
    } else {
      logger.info('啟動 MCP 服務器...');
      await server.start();
    }

  } catch (error) {
    if (error instanceof MCPError) {
      logger.error(`MCP 錯誤 [${error.code}]: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error('啟動失敗:', error.message);
    } else {
      logger.error('未知錯誤:', error);
    }
    process.exit(1);
  }
}

/**
 * 健康檢查
 */
async function healthCheck(): Promise<void> {
  try {
    const config = getConfig();
    console.log('配置驗證通過');
    console.log(`Web 端口: ${config.webPort}`);
    console.log(`超時時間: ${config.dialogTimeout} 秒`);
  } catch (error) {
    if (error instanceof MCPError) {
      console.error(`配置錯誤 [${error.code}]: ${error.message}`);
    } else {
      console.error('健康檢查失敗:', error);
    }
    process.exit(1);
  }
}

// 配置 CLI 命令
program
  .name('user-feedback')
  .description('基於 Node.js 的 MCP 反饋收集器')
  .version(VERSION);

// 主命令 - 啟動服務器
program
  .command('start', { isDefault: true })
  .description('啟動 MCP 反饋收集器')
  .option('-p, --port <number>', '指定 Web 服務器端口', parseInt)
  .option('-w, --web', '僅啟動 Web 模式（不啟動 MCP 服務器）')
  .option('-d, --debug', '啟用除錯模式')
  .option('--mcp-mode', '強制啟用 MCP 模式')
  .action(startMCPServer);

// 健康檢查命令
program
  .command('health')
  .description('檢查配置和系統狀態')
  .action(healthCheck);

// 配置顯示命令
program
  .command('config')
  .description('顯示當前配置')
  .action(() => {
    try {
      const config = getConfig();
      displayConfig(config);
    } catch (error) {
      console.error('配置載入失敗:', error);
      process.exit(1);
    }
  });

// 解析命令行參數
program.parse();
