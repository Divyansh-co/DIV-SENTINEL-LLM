"""
SentinelPrompt - /feedback Feedback Loop Endpoint
Captures false-positive and false-negative reports to tune firewall thresholds.
"""

from fastapi import APIRouter
from app.models.schemas import FeedbackRequest
from app.database import record_feedback

router = APIRouter()

@router.post("/feedback", summary="Submit tuning feedback for a scanned prompt")
async def submit_feedback(payload: FeedbackRequest):
    feedback_id = await record_feedback(payload.model_dump())
    return {
        "status": "success",
        "feedback_id": feedback_id,
        "message": "Feedback logged successfully. Telemetry queued for firewall model tuning."
    }

@router.get("/feedback/stats", summary="Get false-positive rate over time and precision metrics")
async def feedback_statistics():
    from app.database import get_feedback_stats
    return await get_feedback_stats()

