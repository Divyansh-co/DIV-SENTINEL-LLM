"""
SentinelPrompt - Request Tracing & Structured Logging Middleware
Injects correlation IDs, tracks microsecond-accurate response latency, and logs structured telemetry.
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("sentinelprompt.access")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class TracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID") or f"sp_{uuid.uuid4().hex[:12]}"
        request.state.request_id = req_id
        
        start_time = time.perf_counter()
        
        response: Response = await call_next(request)
        
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)
        
        # Structured access log
        if not request.url.path.startswith("/docs") and not request.url.path.startswith("/openapi"):
            logger.info(
                f"method={request.method} path={request.url.path} "
                f"status={response.status_code} latency_ms={duration_ms} request_id={req_id}"
            )

        return response
