"""
SentinelPrompt - /rules Firewall Rules Management Endpoint
View and update firewall signatures, regex rules, sensitivity weights, and toggles.
"""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import RuleItem, RuleUpdateRequest
from app.database import get_all_rules, update_rule_state
from app.engine.pipeline import pipeline_instance

router = APIRouter()

@router.get("/rules", response_model=List[RuleItem], summary="Get all active firewall rules and signatures")
async def list_rules():
    return await get_all_rules()

@router.patch("/rules/{rule_id}", summary="Toggle or adjust weight of a rule")
async def modify_rule(rule_id: str, update_req: RuleUpdateRequest):
    rules = await get_all_rules()
    target_rule = next((r for r in rules if r["id"] == rule_id), None)
    if not target_rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Rule {rule_id} not found")

    await update_rule_state(rule_id, update_req.is_enabled, update_req.weight)
    
    # Synchronize in-memory pipeline
    pipeline_instance.layer1.update_rule(
        rule_id=rule_id,
        is_enabled=update_req.is_enabled,
        weight=update_req.weight
    )

    return {"status": "success", "rule_id": rule_id, "updated": update_req.model_dump(exclude_none=True)}
