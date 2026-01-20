/**
 * Simple logging utility for client-side debugging and production monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.sessionId,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.formatMessage(level, message, data);

    // Always log to console in development
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';

      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp} - ${message}`, data || '');
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && level !== 'debug') {
      this.sendToExternalService(entry);
    }

    // Store recent logs in localStorage for debugging
    this.storeLog(entry);
  }

  private sendToExternalService(entry: LogEntry) {
    // Placeholder for external logging service
    // You can integrate with services like:
    // - Sentry: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.data })
    // - LogRocket: LogRocket.captureMessage(entry.message, { level: entry.level, extra: entry.data })
    // - Custom endpoint: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })

    // For now, just store in localStorage as backup
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  private storeLog(entry: LogEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      // Keep only last 50 logs in development
      if (logs.length > (this.isDevelopment ? 50 : 20)) {
        logs.shift();
      }
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // User action tracking
  userAction(action: string, data?: any) {
    this.info(`User Action: ${action}`, data);
  }

  // API call logging
  apiCall(endpoint: string, method: string, success: boolean, duration?: number, error?: any) {
    const level = success ? 'info' : 'error';
    const message = `API ${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`;
    const data = { endpoint, method, success, duration, error };

    this.log(level, message, data);
  }

  // Performance logging
  performance(metric: string, value: number, data?: any) {
    this.info(`Performance: ${metric}`, { value, ...data });
  }

  // Error boundary logging
  errorBoundary(error: Error, errorInfo: any) {
    this.error('Error Boundary Caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  // Get recent logs for debugging
  getRecentLogs(limit = 20): LogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      return logs.slice(-limit);
    } catch (error) {
      return [];
    }
  }

  // Clear logs
  clearLogs() {
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      // Ignore
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
export const logApiCall = logger.apiCall.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logErrorBoundary = logger.errorBoundary.bind(logger);