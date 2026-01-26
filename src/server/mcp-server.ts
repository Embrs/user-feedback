/**
 * MCP Feedback Collector - MCP 服務器實現
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResult, TextContent, ImageContent } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Config, CollectFeedbackParams, MCPError, FeedbackData, ImageData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { WebServer } from './web-server.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

/**
 * MCP 服務器類
 */
export class MCPServer {
  private mcpServer: McpServer;
  private webServer: WebServer;
  private config: Config;
  private isRunning = false;

  constructor(config: Config) {
    this.config = config;

    // 創建 MCP 服務器實例
    this.mcpServer = new McpServer({
      name: 'user-feedback',
      version: pkg.version
    }, {
      capabilities: {
        tools: {},
        logging: {}
      }
    });

    // 創建 Web 服務器實例
    this.webServer = new WebServer(config);

    // 註冊 MCP 工具函數
    this.registerTools();
  }

  /**
   * 註冊 MCP 工具函數
   */
  private registerTools(): void {
    // 使用類型斷言避免深層類型推斷問題
    (this.mcpServer as any).registerTool(
      'collect_feedback',
      {
        description: 'Collect feedback from users about AI work summary. This tool opens a web interface for users to provide feedback on the AI\'s work.',
        inputSchema: {
          work_summary: z.string().describe('AI 工作彙報內容，描述 AI 完成的工作和結果')
        }
      },
      async (args: { work_summary: string }): Promise<CallToolResult> => {
        const params: CollectFeedbackParams = {
          work_summary: args.work_summary
        };

        logger.mcp('collect_feedback', params);

        try {
          const result = await this.collectFeedback(params);
          logger.mcp('collect_feedback', params, result);
          return result;
        } catch (error) {
          logger.error('collect_feedback 工具調用失敗:', error);

          if (error instanceof MCPError) {
            throw error;
          }

          throw new MCPError(
            'Failed to collect feedback',
            'COLLECT_FEEDBACK_ERROR',
            error
          );
        }
      }
    );

    logger.info('MCP 工具函數註冊完成');
  }

  /**
   * 實現 collect_feedback 功能
   */
  private async collectFeedback(params: CollectFeedbackParams): Promise<CallToolResult> {
    const { work_summary } = params;
    const timeout_seconds = this.config.dialogTimeout;

    logger.info(`開始收集反饋，工作彙報長度: ${work_summary.length} 字符，超時: ${timeout_seconds} 秒`);

    try {
      // 啟動 Web 服務器（如果未運行）
      if (!this.webServer.isRunning()) {
        await this.webServer.start();
      }

      // 收集用戶反饋
      const feedback = await this.webServer.collectFeedback(work_summary, timeout_seconds);

      logger.info('反饋收集完成');

      // 格式化反饋數據為 MCP 內容
      const content = this.formatFeedbackForMCP(feedback);

      return {
        content,
        isError: false
      };

    } catch (error) {
      logger.error('反饋收集失敗:', error);

      const errorMessage = error instanceof MCPError ? error.message : 'Failed to collect user feedback';

      return {
        content: [{
          type: 'text',
          text: `錯誤: ${errorMessage}`
        }],
        isError: true
      };
    }
  }

  /**
   * 將反饋數據格式化為 MCP 內容
   */
  private formatFeedbackForMCP(feedback: FeedbackData): (TextContent | ImageContent)[] {
    const content: (TextContent | ImageContent)[] = [];

    // 添加文字反饋
    if (feedback.text) {
      content.push({
        type: 'text',
        text: `文字反饋: ${feedback.text}`
      });
    }

    // 添加圖片
    if (feedback.images && feedback.images.length > 0) {
      content.push({
        type: 'text',
        text: `圖片數量: ${feedback.images.length}`
      });

      feedback.images.forEach((img: ImageData, imgIndex: number) => {
        content.push({
          type: 'text',
          text: `圖片 ${imgIndex + 1}: ${img.name} (${img.type}, ${(img.size / 1024).toFixed(1)}KB)`
        });

        if (img.data) {
          const base64Data = img.data.replace(/^data:image\/[^;]+;base64,/, '');
          content.push({
            type: 'image',
            data: base64Data,
            mimeType: img.type
          });
        }
      });
    }

    // 添加時間戳
    content.push({
      type: 'text',
      text: `提交時間: ${new Date(feedback.timestamp).toLocaleString()}`
    });

    return content.length > 0 ? content : [{ type: 'text', text: '未收到用戶反饋' }];
  }

  /**
   * 啟動 MCP 服務器
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('MCP 服務器已在運行中');
      return;
    }

    try {
      logger.info('正在啟動 MCP 服務器...');

      // 連接 MCP 傳輸
      const transport = new StdioServerTransport();

      transport.onerror = (error: Error) => {
        logger.error('MCP 傳輸錯誤:', error);
      };

      transport.onclose = () => {
        logger.info('MCP 傳輸連接已關閉');
        this.isRunning = false;
      };

      await this.mcpServer.connect(transport);

      // Web 服務器將在 collect_feedback 被調用時才啟動
      // 這樣可以避免端口衝突

      this.isRunning = true;
      logger.info('MCP 服務器啟動成功');
      
    } catch (error) {
      logger.error('MCP 服務器啟動失敗:', error);
      throw new MCPError(
        'Failed to start MCP server',
        'SERVER_START_ERROR',
        error
      );
    }
  }

  /**
   * 僅啟動 Web 模式
   */
  async startWebOnly(): Promise<void> {
    try {
      logger.info('正在啟動 Web 模式...');
      
      await this.webServer.start();
      
      this.isRunning = true;
      logger.info('Web 服務器啟動成功');
      
      process.stdin.resume();
      
    } catch (error) {
      logger.error('Web 服務器啟動失敗:', error);
      throw new MCPError(
        'Failed to start web server',
        'WEB_SERVER_START_ERROR',
        error
      );
    }
  }

  /**
   * 停止服務器
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.info('正在停止服務器...');
      
      await this.webServer.stop();
      
      if (this.mcpServer) {
        await this.mcpServer.close();
      }
      
      this.isRunning = false;
      logger.info('服務器已停止');
      
    } catch (error) {
      logger.error('停止服務器時出錯:', error);
      throw new MCPError(
        'Failed to stop server',
        'SERVER_STOP_ERROR',
        error
      );
    }
  }

  /**
   * 獲取服務器狀態
   */
  getStatus(): { running: boolean; webPort?: number | undefined } {
    return {
      running: this.isRunning,
      webPort: this.webServer.isRunning() ? this.webServer.getPort() : undefined
    };
  }
}
