"""
SentinelPrompt - /stats SOC Analytics Endpoint
Computes aggregate metrics, block rates, latency percentiles, and threat breakdowns.
"""

from fastapi import APIRouter
from app.models.schemas import StatsResponse
from app.database import get_stats_summary

router = APIRouter()

@router.get("/stats", response_model=StatsResponse, summary="Retrieve SOC dashboard metrics and statistics")
async def get_stats():
    data = await get_stats_summary()
    return StatsResponse(**data)
