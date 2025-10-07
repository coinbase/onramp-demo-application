import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitMap.entries()).forEach(([key, record]) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): RateLimitResult {
  // Get IP address from various headers
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    request.headers.get('x-real-ip') || 
    'anonymous';
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record exists or the window has expired, create a new one
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { 
      success: true, 
      remaining: config.limit - 1,
      resetTime 
    };
  }

  // If limit exceeded, reject the request
  if (record.count >= config.limit) {
    return { 
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  // Increment the count
  record.count++;
  return { 
    success: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime
  };
}
