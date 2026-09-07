"""
SentinelPrompt - Token Bucket Rate Limiting Middleware
Enforces traffic throttling per API key or client IP.
"""

import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

class TokenBucketRateLimiter:
    def __init__(self, rate_per_minute: int = 120):
        self.capacity = rate_per_minute
        self.refill_rate = rate_per_minute / 60.0  # tokens per second
        self.buckets: Dict[str, Tuple[float, float]] = {}  # key -> (tokens, last_refill_time)

    def is_allowed(self, client_key: str) -> Tuple[bool, int]:
        now = time.time()
        if client_key not in self.buckets:
            self.buckets[client_key] = (self.capacity - 1, now)
            return True, int(self.capacity - 1)

        tokens, last_refill = self.buckets[client_key]
        elapsed = now - last_refill
        
        # Refill tokens
        new_tokens = min(self.capacity, tokens + elapsed * self.refill_rate)

        if new_tokens >= 1.0:
            self.buckets[client_key] = (new_tokens - 1.0, now)
            return True, int(new_tokens - 1.0)
        else:
            self.buckets[client_key] = (new_tokens, now)
            return False, 0

limiter = TokenBucketRateLimiter(rate_per_minute=settings.RATE_LIMIT_PER_MINUTE)

def check_rate_limit(request: Request):
    """Dependency helper to verify rate limits."""
    client_id = (
        request.headers.get("X-API-Key")
        or (request.client.host if request.client else "unknown")
    )
    allowed, remaining = limiter.is_allowed(client_id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Too many requests to SentinelPrompt firewall.",
            headers={"Retry-After": "5", "X-RateLimit-Remaining": "0"}
        )

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforces rate-limits on all /api/ endpoints with X-RateLimit headers."""
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/"):
            client_id = (
                request.headers.get("X-API-Key")
                or (request.client.host if request.client else "unknown")
            )
            allowed, remaining = limiter.is_allowed(client_id)
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded (120 req/min). Slow down request frequency."},
                    headers={
                        "Retry-After": "5",
                        "X-RateLimit-Limit": str(limiter.capacity),
                        "X-RateLimit-Remaining": "0"
                    }
                )
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limiter.capacity)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        return await call_next(request)
