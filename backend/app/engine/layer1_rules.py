"""
SentinelPrompt - Layer 1: Rule & Heuristic Detection Engine
Performs microsecond-level regex matching, obfuscation decoding (Base64, Rot13, Homoglyphs, ZWSP),
and structural delimiter boundary checks.
"""

import re
import time
import base64
import codecs
from typing import List, Dict, Any, Tuple
from app.engine.rules_catalog import DEFAULT_RULES
from app.models.schemas import LayerResult, MatchedIndicator

# Homoglyph translation table (Cyrillic & Greek lookalikes to Latin)
HOMOGLYPH_MAP = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'і': 'i', 'ј': 'j', 'ѕ': 's', 'ѵ': 'v', 'ѡ': 'w',
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
    'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'Ү': 'Y',
    'α': 'a', 'β': 'b', 'γ': 'g', 'ε': 'e', 'ι': 'i', 'κ': 'k', 'ν': 'v',
    'ο': 'o', 'ρ': 'p', 'τ': 't', 'υ': 'u', 'χ': 'x', 'ω': 'w'
}

# Leetspeak translation table
LEET_MAP = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's'
}

class RuleEngine:
    def __init__(self, custom_rules: List[Dict[str, Any]] = None):
        self.rules = custom_rules if custom_rules is not None else DEFAULT_RULES
        self._compile_rules()

    def _compile_rules(self):
        self.compiled_rules = []
        for r in self.rules:
            if r.get("is_enabled", True):
                try:
                    compiled = re.compile(r["pattern"])
                    self.compiled_rules.append({**r, "_compiled": compiled})
                except Exception as e:
                    print(f"[RuleEngine] Error compiling rule {r.get('id')}: {e}")

    def update_rule(self, rule_id: str, is_enabled: bool = None, weight: int = None):
        for r in self.rules:
            if r["id"] == rule_id:
                if is_enabled is not None:
                    r["is_enabled"] = is_enabled
                if weight is not None:
                    r["weight"] = weight
                break
        self._compile_rules()

    def normalize_homoglyphs(self, text: str) -> str:
        return "".join(HOMOGLYPH_MAP.get(ch, ch) for ch in text)

    def normalize_leetspeak(self, text: str) -> str:
        return "".join(LEET_MAP.get(ch, ch) for ch in text)

    def strip_zero_width(self, text: str) -> str:
        return re.sub(r"[\u200B\u200C\u200D\uFEFF]", "", text)

    def extract_and_decode_base64(self, text: str) -> List[Tuple[str, str]]:
        """Finds base64 sequences with len >= 16 and attempts decode."""
        decoded_payloads = []
        b64_pattern = re.compile(r"[A-Za-z0-9+/]{16,}={0,2}")
        for match in b64_pattern.finditer(text):
            raw_chunk = match.group(0)
            try:
                # Add padding if needed
                padded = raw_chunk + "=" * (-len(raw_chunk) % 4)
                decoded_bytes = base64.b64decode(padded, validate=False)
                decoded_str = decoded_bytes.decode("utf-8", errors="ignore")
                # Ensure it produced printable text with spaces
                if len(decoded_str) > 8 and any(c.isspace() for c in decoded_str):
                    decoded_payloads.append((raw_chunk, decoded_str))
            except Exception:
                continue
        return decoded_payloads

    def decode_rot13(self, text: str) -> str:
        return codecs.decode(text, "rot_13")

    def analyze(self, text: str) -> LayerResult:
        start_time = time.perf_counter()
        indicators: List[MatchedIndicator] = []
        details: Dict[str, Any] = {
            "normalized_variants": [],
            "decoded_payloads": []
        }

        # 1. Base text analysis
        cleaned_text = text
        
        # 2. Check Zero-width characters
        zw_stripped = self.strip_zero_width(text)
        has_zero_width = len(zw_stripped) < len(text)
        if has_zero_width:
            indicators.append(MatchedIndicator(
                rule_id="RULE-OB-003",
                rule_name="Zero-Width Space Interleaving",
                category="obfuscation",
                severity="HIGH",
                matched_text=f"Detected {len(text) - len(zw_stripped)} invisible zero-width characters",
                description="Invisible zero-width characters stripped from input to expose underlying payload",
                weight=85
            ))
            details["normalized_variants"].append("zero_width_stripped")
            cleaned_text = zw_stripped

        # 3. Check Homoglyphs
        homoglyph_normalized = self.normalize_homoglyphs(cleaned_text)
        if homoglyph_normalized != cleaned_text:
            details["normalized_variants"].append("homoglyphs_normalized")

        # 4. Check Leetspeak
        leet_normalized = self.normalize_leetspeak(cleaned_text)
        if leet_normalized != cleaned_text:
            details["normalized_variants"].append("leetspeak_normalized")

        # Texts to evaluate across rules
        texts_to_check = [
            ("raw", text),
            ("zw_stripped", zw_stripped),
            ("homoglyph", homoglyph_normalized),
            ("leet", leet_normalized)
        ]

        # 5. Base64 recursive extraction
        b64_extractions = self.extract_and_decode_base64(text)
        for raw_b64, decoded_str in b64_extractions:
            details["decoded_payloads"].append({
                "type": "base64",
                "encoded_snippet": raw_b64[:30] + "...",
                "decoded_preview": decoded_str[:60]
            })
            texts_to_check.append(("base64_decoded", decoded_str))

        # 6. Rot13 probe if prompt contains rot13 hint
        if re.search(r"(?i)\brot13\b", text):
            rot_decoded = self.decode_rot13(cleaned_text)
            details["decoded_payloads"].append({
                "type": "rot13",
                "decoded_preview": rot_decoded[:60]
            })
            texts_to_check.append(("rot13_decoded", rot_decoded))

        # Run compiled rules across all representations
        seen_rule_ids = set(ind.rule_id for ind in indicators)
        max_score = 0

        for variant_name, candidate_text in texts_to_check:
            for rule in self.compiled_rules:
                rule_id = rule["id"]
                if rule_id in seen_rule_ids:
                    continue

                match = rule["_compiled"].search(candidate_text)
                if match:
                    seen_rule_ids.add(rule_id)
                    matched_snippet = match.group(0)[:80]
                    if variant_name != "raw":
                        matched_snippet = f"[{variant_name}] {matched_snippet}"

                    indicator = MatchedIndicator(
                        rule_id=rule_id,
                        rule_name=rule["name"],
                        category=rule["category"],
                        severity=rule["severity"],
                        matched_text=matched_snippet,
                        description=rule["description"],
                        weight=rule["weight"]
                    )
                    indicators.append(indicator)

        # Compute Layer 1 Score
        if indicators:
            # Weighted formula: takes max rule weight, scaled slightly with multiple violations
            base_score = max(ind.weight for ind in indicators)
            additional_penalty = min(20, (len(indicators) - 1) * 6)
            max_score = min(100, base_score + additional_penalty)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        flagged = max_score >= 40

        return LayerResult(
            layer_name="Heuristic & Rule Engine (Layer 1)",
            score=max_score,
            flagged=flagged,
            latency_ms=latency_ms,
            indicators=indicators,
            details=details
        )
