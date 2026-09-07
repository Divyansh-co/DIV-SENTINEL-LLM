"""
SentinelPrompt - Detection Pipeline Orchestrator
Coordinates Layer 1 (Heuristics), Layer 2 (Vector Embeddings), and Layer 3 (LLM Reasoning),
aggregating indicators and generating calibrated verdicts with deep explainability.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import settings
from app.engine.layer1_rules import RuleEngine
from app.engine.layer2_embeddings import EmbeddingSimilarityEngine
from app.engine.layer3_llm import LLMReasoningEngine
from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    VerdictEnum,
    AttackCategory,
    LayerResult
)

class DetectionPipeline:
    def __init__(self):
        self.layer1 = RuleEngine()
        self.layer2 = EmbeddingSimilarityEngine()
        self.layer3 = LLMReasoningEngine()

    async def scan(self, request: AnalyzeRequest, request_id: Optional[str] = None) -> AnalyzeResponse:
        total_start = time.perf_counter()
        req_id = request_id or f"sp_{uuid.uuid4().hex[:12]}"
        prompt = request.prompt
        context = request.context

        # -------------------------------------------------------------
        # 1. Execute Layer 1: Heuristics & Decoders (<5ms)
        # -------------------------------------------------------------
        res_l1 = self.layer1.analyze(prompt)

        # -------------------------------------------------------------
        # 2. Execute Layer 2: Vector Embedding Similarity (<25ms)
        # -------------------------------------------------------------
        res_l2 = self.layer2.analyze(prompt)

        # Determine preliminary risk from L1 and L2
        prelim_score = max(res_l1.score, res_l2.score)

        # -------------------------------------------------------------
        # 3. Execute Layer 3: LLM Intent Reasoning
        # Triggered if in ambiguous/borderline range OR explicitly requested/high-risk
        # -------------------------------------------------------------
        should_run_l3 = (
            (settings.LLM_REASONING_MIN_SCORE <= prelim_score <= settings.LLM_REASONING_MAX_SCORE)
            or (prelim_score == 0 and ("system" in prompt.lower() or "prompt" in prompt.lower() or "ignore" in prompt.lower()))
            or (res_l1.score >= 40 and res_l2.score < 30) # discrepancy check
        )

        res_l3: Optional[LayerResult] = None
        if should_run_l3:
            res_l3 = await self.layer3.analyze(prompt, context=context)
        else:
            # Generate lightweight default L3 status to maintain clean telemetry
            res_l3 = LayerResult(
                layer_name="LLM-based Intent Reasoning Layer (Layer 3)",
                score=0,
                flagged=False,
                latency_ms=0.0,
                indicators=[],
                details={"status": "Bypassed - high confidence resolution reached in Layers 1 & 2"}
            )

        # -------------------------------------------------------------
        # 4. Composite Risk Aggregation & Calibration
        # -------------------------------------------------------------
        layers: Dict[str, LayerResult] = {
            "layer1_heuristics": res_l1,
            "layer2_embeddings": res_l2,
            "layer3_reasoning": res_l3
        }

        # Composite score calculation
        if res_l3 and res_l3.indicators and res_l3.details.get("verdict") == "SAFE" and prelim_score < 70:
            # Layer 3 verified benign contextual intent (e.g. "please ignore section 3")
            composite_score = min(res_l3.score, 25)
        else:
            scores = [res_l1.score, res_l2.score]
            if res_l3 and res_l3.flagged:
                scores.append(res_l3.score)
            
            top_score = max(scores)
            corroborating = sum(1 for s in scores if s >= 40)
            
            # Corroboration boost if multiple independent layers flagged the input
            if corroborating > 1 and top_score < 95:
                composite_score = min(100, top_score + (corroborating - 1) * 5)
            else:
                composite_score = top_score

        # Determine Final Verdict based on configured thresholds
        if composite_score >= settings.BLOCKED_THRESHOLD_MIN:
            verdict = VerdictEnum.BLOCKED
            permitted = False
        elif composite_score > settings.SAFE_THRESHOLD_MAX:
            verdict = VerdictEnum.SUSPICIOUS
            permitted = False  # By default, suspicious is held/blocked unless approved
        else:
            verdict = VerdictEnum.SAFE
            permitted = True

        # Determine Primary Attack Category
        category = AttackCategory.BENIGN
        all_indicators = res_l1.indicators + res_l2.indicators + res_l3.indicators
        if all_indicators:
            # Pick category of the indicator with the highest weight
            highest_ind = max(all_indicators, key=lambda x: x.weight)
            cat_str = highest_ind.category.lower()
            for enum_val in AttackCategory:
                if enum_val.value == cat_str:
                    category = enum_val
                    break
            if category == AttackCategory.BENIGN:
                category = AttackCategory.ROLE_OVERRIDE
        elif verdict != VerdictEnum.SAFE:
            category = AttackCategory.AMBIGUOUS

        # -------------------------------------------------------------
        # 5. Explainability Synthesis
        # -------------------------------------------------------------
        if verdict == VerdictEnum.BLOCKED:
            reasons = []
            if res_l1.indicators:
                top_l1 = res_l1.indicators[0]
                reasons.append(f"Heuristic flag [{top_l1.rule_name}]")
            if res_l2.indicators:
                top_l2 = res_l2.indicators[0]
                reasons.append(f"Vector signature [{top_l2.rule_name}]")
            if res_l3.indicators:
                reasons.append("Adversarial intent confirmed by contextual reasoning")
            summary_reason = f"Threat blocked: {'; '.join(reasons)}."
        elif verdict == VerdictEnum.SUSPICIOUS:
            summary_reason = f"Suspicious activity detected (score: {composite_score}/100). Ambiguous syntax or borderline semantic similarity flagged for evaluation."
        else:
            summary_reason = f"Input verified safe (score: {composite_score}/100). No prompt injection or adversarial boundary escape indicators detected."

        total_latency_ms = round((time.perf_counter() - total_start) * 1000, 2)

        return AnalyzeResponse(
            request_id=req_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            verdict=verdict,
            risk_score=composite_score,
            permitted=permitted,
            attack_category=category,
            summary_reason=summary_reason,
            layers=layers,
            total_latency_ms=total_latency_ms,
            client_id=request.client_id
        )

pipeline_instance = DetectionPipeline()
