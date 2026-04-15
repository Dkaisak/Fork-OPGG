const RATE_LIMIT_WINDOW = 2 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 100;

interface RateLimitState {
  requests: number[];
}

const rateLimitState: RateLimitState = {
  requests: []
};

export function isRateLimited(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  rateLimitState.requests = rateLimitState.requests.filter(ts => ts > windowStart);
  
  if (rateLimitState.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  rateLimitState.requests.push(now);
  return false;
}

export function getRemainingRequests(): number {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  const recentRequests = rateLimitState.requests.filter(ts => ts > windowStart);
  return MAX_REQUESTS_PER_WINDOW - recentRequests.length;
}