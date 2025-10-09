type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private sanitize(data: any): any {
    if (typeof data === 'string') {
      // Redact potential secrets (long alphanumeric strings)
      return data.replace(/([a-zA-Z0-9_-]{32,})/g, '***REDACTED***');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      for (const key in data) {
        // Redact sensitive keys
        if (/key|secret|token|password|credential|auth|private/i.test(key)) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = this.sanitize(data[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }
  
  private log(level: LogLevel, message: string, data?: any) {
    // Don't log debug in production
    if (!this.isDevelopment && level === 'debug') {
      return;
    }
    
    const sanitizedData = data ? this.sanitize(data) : undefined;
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case 'error':
        console.error(`[${timestamp}] [${level.toUpperCase()}]`, message, sanitizedData || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] [${level.toUpperCase()}]`, message, sanitizedData || '');
        break;
      case 'info':
        console.info(`[${timestamp}] [${level.toUpperCase()}]`, message, sanitizedData || '');
        break;
      case 'debug':
        console.log(`[${timestamp}] [${level.toUpperCase()}]`, message, sanitizedData || '');
        break;
    }
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
  
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
