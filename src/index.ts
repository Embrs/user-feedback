/**
 * MCP Feedback Collector - 主入口
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export const VERSION: string = pkg.version;

export { MCPServer } from './server/mcp-server.js';
export { WebServer } from './server/web-server.js';
export { getConfig, createDefaultConfig, validateConfig, displayConfig } from './config/index.js';
export { logger } from './utils/logger.js';
export * from './types/index.js';
