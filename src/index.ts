/**
 * MCP Feedback Collector - 主入口
 */

export const VERSION = '1.1.1';

export { MCPServer } from './server/mcp-server.js';
export { WebServer } from './server/web-server.js';
export { getConfig, createDefaultConfig, validateConfig, displayConfig } from './config/index.js';
export { logger } from './utils/logger.js';
export * from './types/index.js';
