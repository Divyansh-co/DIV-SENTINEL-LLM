"""
SentinelPrompt SDK Exceptions
"""

from typing import Dict, Any, Optional

class SecurityViolationError(Exception):
    """Base exception for firewall violations."""
    pass

class PromptInjectionBlockedError(SecurityViolationError):
    """Raised when an untrusted prompt is blocked by SentinelPrompt firewall."""
    def __init__(self, message: str, scan_result: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.scan_result = scan_result or {}
        self.verdict = self.scan_result.get("verdict", "BLOCKED")
        self.risk_score = self.scan_result.get("risk_score", 100)
        self.attack_category = self.scan_result.get("attack_category", "unknown")
        self.reason = self.scan_result.get("summary_reason", message)
