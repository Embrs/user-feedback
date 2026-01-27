/**
 * MCP Feedback Collector - 配置管理
 */

import { config as dotenvConfig } from 'dotenv';
import { Config, MCPError } from '../types/index.js';

// 載入環境變數
dotenvConfig();

/**
 * 獲取環境變數值，支援預設值
 */
function getEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * 獲取可選的環境變數值
 */
function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key] || undefined;
}

/**
 * 獲取數字類型的環境變數
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid number for ${key}: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }

  return parsed;
}

/**
 * 獲取布林類型的環境變數
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true';
}

/**
 * 創建預設配置
 */
export function createDefaultConfig(): Config {
  return {
    apiKey: getOptionalEnvVar('MCP_API_KEY'),
    apiBaseUrl: getEnvVar('MCP_API_BASE_URL', 'https://api.openai.com/v1'),
    defaultModel: getEnvVar('MCP_DEFAULT_MODEL', 'gpt-4o-mini'),
    webPort: getEnvNumber('MCP_WEB_PORT', 3239),
    dialogTimeout: getEnvNumber('MCP_DIALOG_TIMEOUT', 60000),
    corsOrigin: getEnvVar('MCP_CORS_ORIGIN', '*'),
    maxFileSize: getEnvNumber('MCP_MAX_FILE_SIZE', 10485760), // 10MB
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
    serverHost: getOptionalEnvVar('MCP_SERVER_HOST'),
    serverBaseUrl: getOptionalEnvVar('MCP_SERVER_BASE_URL'),
    forcePort: getEnvBoolean('MCP_FORCE_PORT', false),
    useFixedUrl: getEnvBoolean('MCP_USE_FIXED_URL', true),
    enableImageToText: getEnvBoolean('MCP_ENABLE_IMAGE_TO_TEXT', true),
    imageToTextPrompt: getEnvVar('MCP_IMAGE_TO_TEXT_PROMPT', '請詳細描述這張圖片的內容，包括主要元素、顏色、佈局、文字等資訊。')
  };
}

/**
 * 驗證配置
 */
export function validateConfig(config: Config): void {
  // 驗證端口範圍
  if (config.webPort < 1024 || config.webPort > 65535) {
    throw new MCPError(
      `Invalid port number: ${config.webPort}. Must be between 1024 and 65535.`,
      'INVALID_PORT'
    );
  }

  // 驗證超時時間（10 秒到 60000 秒）
  if (config.dialogTimeout < 10 || config.dialogTimeout > 60000) {
    throw new MCPError(
      `Invalid timeout: ${config.dialogTimeout}. Must be between 10 and 60000 seconds.`,
      'INVALID_TIMEOUT'
    );
  }

  // 驗證文件大小限制（1KB - 100MB）
  if (config.maxFileSize < 1024 || config.maxFileSize > 104857600) {
    throw new MCPError(
      `Invalid max file size: ${config.maxFileSize}. Must be between 1KB and 100MB.`,
      'INVALID_FILE_SIZE'
    );
  }

  // 驗證日誌級別
  const validLogLevels = ['error', 'warn', 'info', 'debug', 'silent'];
  if (!validLogLevels.includes(config.logLevel)) {
    throw new MCPError(
      `Invalid log level: ${config.logLevel}. Must be one of: ${validLogLevels.join(', ')}`,
      'INVALID_LOG_LEVEL'
    );
  }
}

/**
 * 獲取驗證後的配置
 */
export function getConfig(): Config {
  const config = createDefaultConfig();
  validateConfig(config);
  return config;
}

/**
 * 顯示配置資訊（隱藏敏感資訊）
 */
export function displayConfig(config: Config): void {
  console.log('MCP Feedback Collector Configuration:');
  console.log(`  Web Port: ${config.webPort}`);
  console.log(`  Dialog Timeout: ${config.dialogTimeout}s`);
  console.log(`  CORS Origin: ${config.corsOrigin}`);
  console.log(`  Max File Size: ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  Log Level: ${config.logLevel}`);
  console.log(`  API Key: ${config.apiKey ? '***configured***' : 'not set'}`);
  console.log(`  Server Host: ${config.serverHost || '自動檢測'}`);
  console.log(`  Image To Text: ${config.enableImageToText ? 'enabled' : 'disabled'}`);
}
