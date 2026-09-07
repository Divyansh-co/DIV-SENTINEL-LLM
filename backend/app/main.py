"""
SentinelPrompt - Main FastAPI Application
Production-grade LLM Prompt Injection Firewall middleware.
Serves both the unified SOC Security Dashboard frontend and the REST API.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html
from app.config import settings
from app.database import init_db
from app.middleware.tracing import TracingMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.api.v1 import analyze, history, stats, rules, feedback, playground

# Resolve frontend dist directory (supporting local dev, root/backend launches, and containers)
_app_file = Path(__file__).resolve()
_candidate_dists = [
    _app_file.parent.parent.parent / "frontend" / "dist",
    _app_file.parent.parent.parent / "frontend_dist",
    _app_file.parent.parent / "frontend" / "dist",
    _app_file.parent.parent / "frontend_dist",
    Path.cwd() / "frontend" / "dist",
    Path.cwd() / "frontend_dist",
    Path("/app/frontend_dist"),
    Path("/app/frontend/dist"),
]
FRONTEND_DIST = next(
    (d.resolve() for d in _candidate_dists if d.exists() and (d / "index.html").exists()),
    _candidate_dists[0].resolve()
)

_base_dir = _app_file.parent.parent.parent
DASHBOARD_HTML = (_base_dir / "dashboard.html").resolve()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite schema and seed baseline SOC telemetry
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade LLM Prompt Injection Firewall & Security Middleware",
    docs_url=None,  # Custom docs endpoint below
    redoc_url="/redoc",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time-Ms", "X-RateLimit-Limit", "X-RateLimit-Remaining"]
)

# Tracing & Telemetry Middleware
app.add_middleware(TracingMiddleware)

# Rate Limiting Middleware (120 req/min token-bucket)
app.add_middleware(RateLimitMiddleware)

# V1 API Routes
api_router = APIRouter(prefix=settings.API_V1_STR)
api_router.include_router(analyze.router, tags=["Analyze"])
api_router.include_router(history.router, tags=["History & Incidents"])
api_router.include_router(stats.router, tags=["SOC Analytics"])
api_router.include_router(rules.router, tags=["Firewall Rules"])
api_router.include_router(feedback.router, tags=["Feedback Loop"])
api_router.include_router(playground.router, tags=["Playground Presets"])

app.include_router(api_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SentinelPrompt Firewall",
        "version": settings.VERSION,
        "engine": "Hybrid 3-Layer (Heuristics + Vector Embeddings + LLM Reasoning)"
    }

# Interactive Swagger UI with Obsidian Ember styling & header bar linking back to dashboard
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    raw_html = get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="SentinelPrompt - API Docs & Schema",
        swagger_favicon_url="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF6B35'%3E%3Cpath d='M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z'/%3E%3C/svg%3E"
    )
    custom_banner = """
    <div style="background:#121215; border-bottom:1px solid #242429; padding:12px 24px; display:flex; justify-content:space-between; align-items:center; font-family:'JetBrains Mono', monospace;">
      <a href="/" style="display:flex; align-items:center; gap:8px; color:#FF6B35; font-size:13px; font-weight:bold; text-decoration:none;">
        <span style="font-size:16px;">&larr;</span> Return to SentinelPrompt SOC Security Dashboard
      </a>
      <span style="color:#3FA796; font-size:11px; font-weight:bold;">GATEWAY INTERACTIVE SPECIFICATION</span>
    </div>
    """
    styled_content = raw_html.body.decode("utf-8").replace("<body>", f"<body>{custom_banner}")
    return HTMLResponse(content=styled_content)

# Mount static files if frontend distribution exists
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/standalone-dashboard", include_in_schema=False)
    async def serve_standalone_dashboard():
        if DASHBOARD_HTML.exists():
            return FileResponse(DASHBOARD_HTML)
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/dashboard", include_in_schema=False)
    async def serve_dashboard():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        potential_file = FRONTEND_DIST / full_path
        if potential_file.is_file():
            return FileResponse(potential_file)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "SentinelPrompt LLM Prompt Injection Firewall is operational.",
            "docs_url": "/docs",
            "health_url": "/health",
            "api_v1": settings.API_V1_STR
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
