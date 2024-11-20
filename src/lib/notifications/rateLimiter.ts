interface RateLimit {
  count: number;
  firstCall: number;
}

const rateLimits = new Map<string, RateLimit>();

export function checkRateLimit(key: string, maxCalls: number, timeWindowMs: number): boolean {
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit) {
    rateLimits.set(key, { count: 1, firstCall: now });
    return true;
  }

  if (now - limit.firstCall > timeWindowMs) {
    rateLimits.set(key, { count: 1, firstCall: now });
    return true;
  }

  if (limit.count >= maxCalls) {
    return false;
  }

  limit.count++;
  return true;
}

export function getRateLimitKey(context: string, priority: string): string {
  return `${context}:${priority}`;
}
