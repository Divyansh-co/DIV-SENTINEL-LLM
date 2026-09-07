"""
SentinelPrompt - /history Telemetry Feed Endpoint
Lists past scan incidents with pagination, filtering by verdict, and search.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from app.database import get_scans

router = APIRouter()

@router.get("/history", summary="Fetch paginated scan history and security incidents")
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    verdict: Optional[str] = Query(None, description="Filter: ALL, SAFE, SUSPICIOUS, BLOCKED"),
    search: Optional[str] = Query(None, description="Search prompt or reason text")
) -> Dict[str, Any]:
    rows, total_count = await get_scans(limit=limit, offset=offset, verdict=verdict, search=search)

    items = []
    for r in rows:
        prompt_text = r["prompt"]
        items.append({
            "id": r["id"],
            "request_id": r["request_id"],
            "timestamp": r["timestamp"],
            "prompt_preview": (prompt_text[:100] + "...") if len(prompt_text) > 100 else prompt_text,
            "full_prompt": prompt_text,
            "verdict": r["verdict"],
            "risk_score": r["risk_score"],
            "attack_category": r["attack_category"],
            "total_latency_ms": r["total_latency_ms"],
            "rule_latency_ms": r["rule_latency_ms"],
            "embedding_latency_ms": r["embedding_latency_ms"],
            "llm_latency_ms": r["llm_latency_ms"],
            "summary_reason": r["summary_reason"],
            "indicators_count": len(r.get("indicators_json") or "[]"),
            "has_feedback": bool(r.get("has_feedback", 0))
        })

    return {
        "items": items,
        "total": total_count,
        "limit": limit,
        "offset": offset
    }

from pydantic import BaseModel

class ScanFeedbackPayload(BaseModel):
    verdict_correct: bool
    note: Optional[str] = None

@router.post("/history/{scan_id}/feedback", summary="Submit feedback / mark false positive on a scan")
async def submit_history_scan_feedback(scan_id: str, payload: ScanFeedbackPayload):
    from app.database import record_scan_feedback
    result = await record_scan_feedback(
        scan_id=scan_id,
        verdict_correct=payload.verdict_correct,
        note=payload.note
    )
    return result
