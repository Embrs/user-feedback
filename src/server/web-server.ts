/**
 * MCP Feedback Collector - Web 服務器實現
 */

import express from 'express';
import { createServer, Server } from 'http';
import { createServer as createNetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Config, FeedbackData, MCPError, Session } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Web 服務器類
 */
export class WebServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private config: Config;
  private port: number = 0;
  private isServerRunning = false;
  private sessions: Map<string, Session> = new Map();

  constructor(config: Config) {
    this.config = config;

    // 創建 Express 應用
    this.app = express();
    
    // 創建 HTTP 服務器
    this.server = createServer(this.app);
    
    // 創建 Socket.IO 服務器
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.setupGracefulShutdown();
  }

  /**
   * 設置優雅退出處理
   */
  private setupGracefulShutdown(): void {
    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) return;

      isShuttingDown = true;
      logger.info(`收到 ${signal} 信號，開始優雅關閉...`);

      try {
        await this.stop();
        logger.info('優雅關閉完成');
        process.exit(0);
      } catch (error) {
        logger.error('優雅關閉失敗:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  /**
   * 設置中間件
   */
  private setupMiddleware(): void {
    // 安全中間件
    this.app.use(helmet({
      contentSecurityPolicy: false
    }));
    
    // 壓縮中間件
    this.app.use(compression());
    
    // CORS 中間件
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true
    }));
    
    // JSON 解析中間件
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // 請求日誌中間件
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req.method, req.url, res.statusCode, duration);
      });
      next();
    });
  }

  /**
   * 設置路由
   */
  private setupRoutes(): void {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const staticPath = path.resolve(__dirname, '../static');

    // 靜態檔案服務
    this.app.use(express.static(staticPath));

    // 主頁路由
    this.app.get('/', (req, res) => {
      res.sendFile('index.html', { root: staticPath });
    });

    // 健康檢查路由
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeSessions: this.sessions.size
      });
    });

    // 罐頭語 API - 讀取
    this.app.get('/api/quick-replies', (req, res) => {
      try {
        const replies = this.loadQuickReplies();
        res.json({ success: true, replies });
      } catch (error) {
        logger.error('讀取罐頭語失敗:', error);
        res.status(500).json({ success: false, error: '讀取失敗' });
      }
    });

    // 罐頭語 API - 儲存
    this.app.post('/api/quick-replies', (req, res) => {
      try {
        const { replies } = req.body;
        if (!Array.isArray(replies)) {
          res.status(400).json({ success: false, error: '無效的資料格式' });
          return;
        }
        this.saveQuickReplies(replies);
        res.json({ success: true });
      } catch (error) {
        logger.error('儲存罐頭語失敗:', error);
        res.status(500).json({ success: false, error: '儲存失敗' });
      }
    });

    // 錯誤處理中間件
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express 錯誤:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    });
  }

  /**
   * 設置 Socket.IO 事件處理
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.socket('connect', socket.id);

      // 處理會話請求
      socket.on('request_session', () => {
        const activeSessions = Array.from(this.sessions.entries());
        let latestSession: [string, Session] | null = null;

        for (const [sessionId, session] of activeSessions) {
          if (session.status === 'pending' || session.status === 'active') {
            if (!latestSession || session.startTime > latestSession[1].startTime) {
              latestSession = [sessionId, session];
            }
          }
        }

        if (latestSession) {
          const [sessionId, session] = latestSession;
          session.status = 'active';
          socket.emit('session_assigned', {
            session_id: sessionId,
            work_summary: session.workSummary,
            timeout: session.timeout
          });
        } else {
          socket.emit('no_active_session', {
            message: '當前無活躍的反饋會話'
          });
        }
      });

      // 獲取工作彙報
      socket.on('get_work_summary', (data: { feedback_session_id: string }) => {
        const session = this.sessions.get(data.feedback_session_id);
        if (session) {
          socket.emit('work_summary_data', {
            work_summary: session.workSummary
          });
        } else {
          socket.emit('feedback_error', {
            error: '會話不存在或已過期'
          });
        }
      });

      // 提交反饋
      socket.on('submit_feedback', async (data: FeedbackData) => {
        await this.handleFeedbackSubmission(socket, data);
      });

      // 斷開連接
      socket.on('disconnect', (reason) => {
        logger.socket('disconnect', socket.id, { reason });
      });
    });
  }

  /**
   * 處理反饋提交
   */
  private async handleFeedbackSubmission(socket: any, feedbackData: FeedbackData): Promise<void> {
    const session = this.sessions.get(feedbackData.sessionId);

    if (!session) {
      socket.emit('feedback_error', {
        error: '會話不存在或已過期'
      });
      return;
    }

    try {
      if (!feedbackData.text && (!feedbackData.images || feedbackData.images.length === 0)) {
        socket.emit('feedback_error', {
          error: '請提供文字反饋或上傳圖片'
        });
        return;
      }

      // 儲存反饋
      session.feedback = feedbackData;
      session.status = 'completed';

      // 通知提交成功
      socket.emit('feedback_submitted', {
        success: true,
        message: '反饋提交成功'
      });

      // 解析反饋 Promise
      if (session.resolve) {
        session.resolve(feedbackData);
      }

      // 清理會話
      this.sessions.delete(feedbackData.sessionId);

    } catch (error) {
      logger.error('處理反饋提交時出錯:', error);
      socket.emit('feedback_error', {
        error: '伺服器處理錯誤，請稍後重試'
      });
    }
  }

  /**
   * 收集用戶反饋
   */
  async collectFeedback(workSummary: string, timeoutSeconds: number): Promise<FeedbackData> {
    const sessionId = this.generateSessionId();

    logger.info(`創建反饋會話: ${sessionId}, 超時: ${timeoutSeconds}秒`);

    return new Promise((resolve, reject) => {
      const session: Session = {
        id: sessionId,
        workSummary,
        startTime: Date.now(),
        timeout: timeoutSeconds * 1000,
        status: 'pending',
        resolve,
        reject
      };

      this.sessions.set(sessionId, session);

      // 設置超時
      const timeoutId = setTimeout(() => {
        const s = this.sessions.get(sessionId);
        if (s && s.status === 'pending') {
          s.status = 'timeout';
          this.sessions.delete(sessionId);
          reject(new MCPError('反饋收集超時', 'FEEDBACK_TIMEOUT'));
        }
      }, timeoutSeconds * 1000);

      // 打開瀏覽器
      this.openFeedbackPage(sessionId).catch(error => {
        clearTimeout(timeoutId);
        this.sessions.delete(sessionId);
        reject(error);
      });
    });
  }

  /**
   * 生成反饋頁面 URL
   */
  private generateFeedbackUrl(sessionId: string): string {
    const host = this.config.serverHost || 'localhost';
    if (this.config.useFixedUrl) {
      return `http://${host}:${this.port}`;
    }
    return `http://${host}:${this.port}/?session=${sessionId}`;
  }

  /**
   * 打開反饋頁面
   */
  private async openFeedbackPage(sessionId: string): Promise<void> {
    const url = this.generateFeedbackUrl(sessionId);
    logger.info(`打開反饋頁面: ${url}`);

    try {
      const open = await import('open');
      await open.default(url);
      logger.info('瀏覽器已打開反饋頁面');
    } catch (error) {
      logger.warn('無法自動打開瀏覽器:', error);
      logger.info(`請手動打開瀏覽器訪問: ${url}`);
    }
  }

  /**
   * 獲取罐頭語儲存路徑
   */
  private getQuickRepliesPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, '../../quick-replies.json');
  }

  /**
   * 讀取罐頭語
   */
  private loadQuickReplies(): Array<{ text: string; value: string }> {
    const filePath = this.getQuickRepliesPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    // 預設罐頭語
    return [
      { text: '無', value: '無' },
      { text: '收到', value: '收到' },
      { text: '繼續', value: '繼續' }
    ];
  }

  /**
   * 儲存罐頭語
   */
  private saveQuickReplies(replies: Array<{ text: string; value: string }>): void {
    const filePath = this.getQuickRepliesPath();
    fs.writeFileSync(filePath, JSON.stringify(replies, null, 2), 'utf-8');
  }

  /**
   * 生成會話 ID
   */
  private generateSessionId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 檢查端口是否可用
   */
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createNetServer();
      
      const timeout = setTimeout(() => {
        server.close();
        resolve(false);
      }, 1000);

      server.listen(port, () => {
        clearTimeout(timeout);
        server.close(() => resolve(true));
      });

      server.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * 尋找可用端口
   */
  private async findAvailablePort(preferredPort: number): Promise<number> {
    // 先嘗試首選端口
    if (await this.isPortAvailable(preferredPort)) {
      return preferredPort;
    }

    logger.info(`端口 ${preferredPort} 已被佔用，尋找替代端口...`);

    // 嘗試相鄰端口 (±1 到 ±10)
    for (let offset = 1; offset <= 10; offset++) {
      const ports = [preferredPort + offset, preferredPort - offset]
        .filter(p => p > 1024 && p < 65535);

      for (const port of ports) {
        if (await this.isPortAvailable(port)) {
          logger.info(`找到可用端口: ${port}`);
          return port;
        }
      }
    }

    // 最後嘗試隨機端口
    for (let i = 0; i < 10; i++) {
      const randomPort = Math.floor(Math.random() * (65535 - 3000) + 3000);
      if (await this.isPortAvailable(randomPort)) {
        logger.info(`找到隨機可用端口: ${randomPort}`);
        return randomPort;
      }
    }

    throw new MCPError('無法找到可用端口', 'NO_AVAILABLE_PORT');
  }

  /**
   * 啟動 Web 服務器
   */
  async start(): Promise<void> {
    if (this.isServerRunning) {
      logger.warn('Web 服務器已在運行中');
      return;
    }

    try {
      // 動態尋找可用端口
      this.port = await this.findAvailablePort(this.config.webPort);

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server start timeout'));
        }, 10000);

        this.server.listen(this.port, () => {
          clearTimeout(timeout);
          resolve();
        });

        this.server.on('error', (error: NodeJS.ErrnoException) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.isServerRunning = true;
      logger.info(`Web 服務器啟動成功: http://localhost:${this.port}`);

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
   * 停止 Web 服務器
   */
  async stop(): Promise<void> {
    if (!this.isServerRunning) {
      return;
    }

    logger.info('正在停止 Web 服務器...');

    try {
      // 清理所有會話
      for (const [sessionId, session] of this.sessions) {
        if (session.reject) {
          session.reject(new MCPError('伺服器關閉', 'SERVER_SHUTDOWN'));
        }
      }
      this.sessions.clear();

      // 關閉 Socket.IO
      this.io.close();

      // 關閉 HTTP 服務器
      await new Promise<void>((resolve, reject) => {
        this.server.close((error?: Error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      this.isServerRunning = false;
      logger.info('Web 服務器已停止');

    } catch (error) {
      logger.error('停止 Web 服務器時出錯:', error);
      throw error;
    }
  }

  /**
   * 檢查服務器是否運行
   */
  isRunning(): boolean {
    return this.isServerRunning;
  }

  /**
   * 獲取服務器端口
   */
  getPort(): number {
    return this.port;
  }
}
