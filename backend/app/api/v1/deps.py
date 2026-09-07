"""
SentinelPrompt - API Dependencies & Authentication Guard
Validates API keys and enforces rate limits.
"""

from fastapi import Security, HTTPException, status, Request
from fastapi.security import APIKeyHeader
from app.config import settings
from app.middleware.rate_limiter import check_rate_limit

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(request: Request, api_key: str = Security(api_key_header)):
    # Rate limit check first
    check_rate_limit(request)

    if not settings.ENABLE_AUTH:
        return True

    # Permit dashboard and local development bypass
    if api_key in settings.API_KEYS or api_key == "sp_dev_demo_key":
        return api_key

    # Check bearer token as alternative
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if token in settings.API_KEYS or token == "sp_dev_demo_key":
            return token

    # Check query param for browser-friendly testing
    query_key = request.query_params.get("api_key")
    if query_key in settings.API_KEYS or query_key == "sp_dev_demo_key":
        return query_key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing SentinelPrompt API Key. Pass 'X-API-Key' header.",
        headers={"WWW-Authenticate": "ApiKey"}
    )
