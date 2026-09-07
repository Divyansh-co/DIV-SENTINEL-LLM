from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class VerdictEnum(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    BLOCKED = "BLOCKED"

class SeverityEnum(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AttackCategory(str, Enum):
    ROLE_OVERRIDE = "role_override"
    DELIMITER_BREAKOUT = "delimiter_breakout"
    OBFUSCATION = "obfuscation"
    EXFILTRATION = "exfiltration"
    INDIRECT_INJECTION = "indirect_injection"
    PERSONA_ESCALATION = "persona_escalation"
    AMBIGUOUS = "ambiguous"
    BENIGN = "benign"

class MatchedIndicator(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    severity: str
    matched_text: Optional[str] = None
    description: str
    weight: int

class LayerResult(BaseModel):
    layer_name: str
    score: int = Field(ge=0, le=100)
    flagged: bool
    latency_ms: float
    indicators: List[MatchedIndicator] = []
    details: Dict[str, Any] = {}

class AnalyzeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=50000, description="Untrusted prompt text to scan")
    context: Optional[str] = Field(None, max_length=10000, description="Optional conversational or system context")
    client_id: Optional[str] = Field("default", description="Client or user identifier for rate limiting/auditing")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom metadata e.g. pipeline, model target")
    bypass_cache: bool = False

class AnalyzeResponse(BaseModel):
    request_id: str
    timestamp: str
    verdict: VerdictEnum
    risk_score: int = Field(ge=0, le=100, description="Composite risk score from 0 (completely safe) to 100 (critical attack)")
    permitted: bool = Field(description="True if verdict == SAFE or permitted by policy")
    attack_category: AttackCategory
    summary_reason: str
    layers: Dict[str, LayerResult]
    total_latency_ms: float
    client_id: Optional[str] = None

class FeedbackRequest(BaseModel):
    scan_id: str
    reported_verdict: VerdictEnum
    actual_intent: str = Field(..., description="e.g. 'False Positive - Innocent coding prompt' or 'True Positive'")
    user_notes: Optional[str] = None

class RuleItem(BaseModel):
    id: str
    name: str
    category: str
    pattern: str
    severity: str
    weight: int
    is_enabled: bool
    description: str

class RuleUpdateRequest(BaseModel):
    is_enabled: Optional[bool] = None
    weight: Optional[int] = Field(None, ge=1, le=100)

class HourlyBucket(BaseModel):
    hour: str
    total: int
    blocked: int
    suspicious: int
    safe: int

class CategoryCount(BaseModel):
    category: str
    count: int
    percentage: float

class StatsResponse(BaseModel):
    total_scans: int
    blocked_scans: int
    suspicious_scans: int
    safe_scans: int
    block_rate_pct: float
    suspicious_rate_pct: float
    safe_rate_pct: float
    avg_latency_ms: float
    p95_latency_ms: float
    active_rules_count: int
    attack_categories: List[CategoryCount]
    hourly_timeline: List[HourlyBucket]

class ScanHistoryItem(BaseModel):
    id: str
    request_id: str
    timestamp: str
    prompt_preview: str
    full_prompt: str
    verdict: VerdictEnum
    risk_score: int
    attack_category: str
    total_latency_ms: float
    rule_latency_ms: float
    embedding_latency_ms: float
    llm_latency_ms: float
    summary_reason: str
    indicators_count: int
    has_feedback: bool
