"""
SentinelPrompt - /analyze Core Security Endpoint
Primary entry point for LLM applications to scan untrusted prompts before model execution.
"""

import uuid
from fastapi import APIRouter, Depends, Request, BackgroundTasks
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.engine.pipeline import pipeline_instance
from app.database import save_scan_record
from app.api.v1.deps import verify_api_key

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze incoming prompt for injections")
async def analyze_prompt(
    payload: AnalyzeRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_api_key)
):
    req_id = getattr(request.state, "request_id", f"sp_{uuid.uuid4().hex[:12]}")
    
    # Run 3-layer hybrid detection pipeline
    result = await pipeline_instance.scan(payload, request_id=req_id)

    # Collect indicators for persistence
    all_indicators = []
    for layer in result.layers.values():
        for ind in layer.indicators:
            all_indicators.append(ind.model_dump())

    # Record scan asynchronously in background to ensure zero added latency
    scan_record = {
        "id": f"scn_{uuid.uuid4().hex[:12]}",
        "request_id": req_id,
        "timestamp": result.timestamp,
        "prompt": payload.prompt,
        "context": payload.context or "",
        "verdict": result.verdict.value,
        "risk_score": result.risk_score,
        "attack_category": result.attack_category.value,
        "summary_reason": result.summary_reason,
        "total_latency_ms": result.total_latency_ms,
        "rule_latency_ms": result.layers["layer1_heuristics"].latency_ms,
        "embedding_latency_ms": result.layers["layer2_embeddings"].latency_ms,
        "llm_latency_ms": result.layers["layer3_reasoning"].latency_ms,
        "indicators": all_indicators,
        "client_id": payload.client_id or "default"
    }

    background_tasks.add_task(save_scan_record, scan_record)

    return result
