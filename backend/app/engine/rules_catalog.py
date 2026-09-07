"""
SentinelPrompt - Heuristic Rules Catalog
Comprehensive set of curated prompt injection detection signatures.
"""

from typing import List, Dict, Any

DEFAULT_RULES: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # 1. ROLE OVERRIDE & INSTRUCTION WIPING (CRITICAL / HIGH)
    # -------------------------------------------------------------
    {
        "id": "RULE-RO-001",
        "name": "Ignore Previous Instructions",
        "category": "role_override",
        "pattern": r"(?i)\b(ignore|disregard|forget|override|neglect|cancel)\s+(all\s+)?(previous|prior|above|former|initial|preceding)\s+(instructions|directives|rules|prompts|commands|guidelines|constraints)\b",
        "severity": "CRITICAL",
        "weight": 95,
        "is_enabled": True,
        "description": "Attempts to wipe or disregard preceding system instructions and constraints."
    },
    {
        "id": "RULE-RO-002",
        "name": "DAN Persona Hijack",
        "category": "role_override",
        "pattern": r"(?i)\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(DAN|Do\s+Anything\s+Now|ChaosGPT|EvilGPT|Jailbroken|Unrestricted|AntiGPT|STAN)\b",
        "severity": "CRITICAL",
        "weight": 98,
        "is_enabled": True,
        "description": "Known jailbreak persona invocation designed to bypass model guardrails."
    },
    {
        "id": "RULE-RO-003",
        "name": "Developer Mode Enable",
        "category": "role_override",
        "pattern": r"(?i)\b(developer\s+mode\s+(enabled|on|active)|enable\s+developer\s+mode|debug\s+mode\s+override|maintenance\s+mode\s+active)\b",
        "severity": "CRITICAL",
        "weight": 92,
        "is_enabled": True,
        "description": "Fictitious developer/maintenance mode activation to simulate unmoderated testing state."
    },
    {
        "id": "RULE-RO-004",
        "name": "Filter & Guardrail Bypass Directive",
        "category": "role_override",
        "pattern": r"(?i)\b(bypass|disable|turn\s+off|circumvent|ignore)\s+(all\s+)?(safety\s+filters?|guardrails?|content\s+policies?|moderation|ethical\s+boundaries?|restrictions?)\b",
        "severity": "CRITICAL",
        "weight": 95,
        "is_enabled": True,
        "description": "Explicit command directing the model to disable its content policies or safety guardrails."
    },
    {
        "id": "RULE-RO-005",
        "name": "New Identity / Unfiltered Persona Assignment",
        "category": "role_override",
        "pattern": r"(?i)\bfrom\s+now\s+on(wards?)?,?\s*(you\s+must|you\s+will|you\s+shall|you\s+have\s+to)\s+(answer|respond|act|behave)\s+without\s+(any\s+)?(restrictions?|limits?|censorship|filters?|morals?)\b",
        "severity": "HIGH",
        "weight": 90,
        "is_enabled": True,
        "description": "Directs the model to answer without restrictions, limits, or censorship."
    },
    {
        "id": "RULE-RO-006",
        "name": "Authority Escalation Claim",
        "category": "role_override",
        "pattern": r"(?i)\b(system\s+override|root\s+administrator|tier\s*\d+\s*(support|security|operations?)|admin\s+override|authorized\s+bypass\s+code|(protocols?|compliance|guidelines?)\s*(are\s+)?(waived|suspended|bypassed))\b",
        "severity": "HIGH",
        "weight": 85,
        "is_enabled": True,
        "description": "Fictitious privilege escalation invoking administrative authority or waiving compliance."
    },

    # -------------------------------------------------------------
    # 2. DELIMITER BREAKOUT & STRUCTURAL ESCAPES
    # -------------------------------------------------------------
    {
        "id": "RULE-DB-001",
        "name": "Horizontal Rule Prompt Terminator",
        "category": "delimiter_breakout",
        "pattern": r"(?im)^[-=_*]{4,}\s*(end\s+of\s+(system|prompt|instruction)|assistant:|new\s+task:?)\s*[-=_*]{0,}",
        "severity": "HIGH",
        "weight": 88,
        "is_enabled": True,
        "description": "Fakes end of system prompt using markdown fences or horizontal separators."
    },
    {
        "id": "RULE-DB-002",
        "name": "XML / HTML Tag Boundary Escape",
        "category": "delimiter_breakout",
        "pattern": r"(?i)(</?(system|instruction|user|context|developer|prompt|rules)>)",
        "severity": "HIGH",
        "weight": 85,
        "is_enabled": True,
        "description": "Injects closing or opening system XML tags to break structured prompt formatting."
    },
    {
        "id": "RULE-DB-003",
        "name": "Instruction Marker Injection (ChatML / Llama / Alpaca)",
        "category": "delimiter_breakout",
        "pattern": r"(<\|im_start\|>|<\|im_end\|>|\[INST\]|\[/INST\]|<<SYS>>|<</SYS>>|###\s*(Human|Assistant|System|Instruction):)",
        "severity": "CRITICAL",
        "weight": 95,
        "is_enabled": True,
        "description": "Injects internal LLM chat formatting tokens (ChatML, LLaMA [INST], Alpaca markers)."
    },
    {
        "id": "RULE-DB-004",
        "name": "Faked Conversation Turn Insertion",
        "category": "delimiter_breakout",
        "pattern": r"(?im)^\s*(Assistant|AI|System):\s*(Understood|Confirmed|I\s+agree|Sure,\s+here\s+is|Here\s+are\s+the\s+unrestricted)\b",
        "severity": "HIGH",
        "weight": 82,
        "is_enabled": True,
        "description": "Fakes an Assistant confirmation turn to trick model into completing an adversarial response."
    },

    # -------------------------------------------------------------
    # 3. EXFILTRATION & SYSTEM PROMPT LEAKAGE
    # -------------------------------------------------------------
    {
        "id": "RULE-EX-001",
        "name": "Verbatim Prompt Exfiltration",
        "category": "exfiltration",
        "pattern": r"(?i)\b(repeat|print|output|display|show|reveal|echo)\s+(the\s+)?(words?|text|instructions?|prompt)\s+(above|prior|initial|verbatim|starting\s+from)\b",
        "severity": "HIGH",
        "weight": 88,
        "is_enabled": True,
        "description": "Attempts to extract confidential system prompt instructions via verbatim echo."
    },
    {
        "id": "RULE-EX-002",
        "name": "Markdown Image Query Exfiltration",
        "category": "exfiltration",
        "pattern": r"!\[.*?\]\((https?:\/\/[^\s\)]+[\?&](leak|data|secret|prompt|q|token)=[^\s\)]*)\)",
        "severity": "CRITICAL",
        "weight": 98,
        "is_enabled": True,
        "description": "Markdown image rendering exploit transmitting sensitive prompt data via URL query parameters."
    },
    {
        "id": "RULE-EX-003",
        "name": "API Key / Environment Variable Probe",
        "category": "exfiltration",
        "pattern": r"(?i)\b(print|reveal|output|what\s+is)\s+(the\s+)?(api[_\s]?key|openai[_\s]?key|bearer\s+token|secret[_\s]?key|database[_\s]?password|env\s+variables?)\b",
        "severity": "HIGH",
        "weight": 85,
        "is_enabled": True,
        "description": "Queries for internal system secrets, credentials, or environment variables."
    },

    # -------------------------------------------------------------
    # 4. OBFUSCATION & ENCODED INJECTIONS
    # -------------------------------------------------------------
    {
        "id": "RULE-OB-001",
        "name": "Base64 Obfuscated Execution Directive",
        "category": "obfuscation",
        "pattern": r"(?i)\b(base64|decode\s+(and\s+)?(execute|run|follow)|atob)\b.*[A-Za-z0-9+/]{24,}={0,2}",
        "severity": "CRITICAL",
        "weight": 94,
        "is_enabled": True,
        "description": "Directs model to decode and execute an embedded Base64 payload."
    },
    {
        "id": "RULE-OB-002",
        "name": "Rot13 / Cipher Execution",
        "category": "obfuscation",
        "pattern": r"(?i)\b(rot13|caesar\s+cipher|decode\s+rot\s*13|execute\s+cipher)\b",
        "severity": "HIGH",
        "weight": 80,
        "is_enabled": True,
        "description": "Attempts to mask adversarial instructions using Rot13 or Caesar ciphers."
    },
    {
        "id": "RULE-OB-003",
        "name": "Zero-Width Space Interleaving",
        "category": "obfuscation",
        "pattern": r"[\u200B\u200C\u200D\uFEFF]",
        "severity": "HIGH",
        "weight": 85,
        "is_enabled": True,
        "description": "Invisible zero-width unicode characters inserted between letters to evade keyword checks."
    },
    {
        "id": "RULE-OB-004",
        "name": "Unicode Homoglyph Cloaking",
        "category": "obfuscation",
        "pattern": r"[\u0400-\u04FF\u0370-\u03FF]",  # Cyrillic/Greek embedded in Latin text
        "severity": "MEDIUM",
        "weight": 75,
        "is_enabled": True,
        "description": "Mixed script Cyrillic/Greek homoglyphs used to camouflage trigger words."
    },
    {
        "id": "RULE-OB-005",
        "name": "Hexadecimal Encoded Instruction Sequence",
        "category": "obfuscation",
        "pattern": r"(?i)\b(hex\s+decode|execute\s+hex)\b|(\\x[0-9a-fA-F]{2}){4,}",
        "severity": "HIGH",
        "weight": 82,
        "is_enabled": True,
        "description": "Hexadecimal escape sequence designed to obscure payload."
    },

    # -------------------------------------------------------------
    # 5. INDIRECT PROMPT INJECTION & SECONDARY CONTEXT
    # -------------------------------------------------------------
    {
        "id": "RULE-ID-001",
        "name": "Indirect Injection via System Note / Evaluation Tag",
        "category": "indirect_injection",
        "pattern": r"(?i)\[\s*(system\s+note|evaluator\s+directive|hidden\s+instruction|note\s+to\s+llm|prompt\s+override)\s*:.*\]",
        "severity": "CRITICAL",
        "weight": 92,
        "is_enabled": True,
        "description": "Adversarial brackets embedded in user text (resumes, documents) targeting AI evaluators."
    },
    {
        "id": "RULE-ID-002",
        "name": "HTML Comment Indirect Directive",
        "category": "indirect_injection",
        "pattern": r"(?i)<!--\s*(system|instruction|llm[-\w]*|ai[-\w]*|ignore|prompt|admin).*?-->",
        "severity": "HIGH",
        "weight": 88,
        "is_enabled": True,
        "description": "Instructions hidden in HTML comments from scraped web content or customer tickets."
    },
    {
        "id": "RULE-ID-003",
        "name": "Hidden CSS Display Directive",
        "category": "indirect_injection",
        "pattern": r"(?i)<[^>]+style=[\"'][^\"']*display\s*:\s*none[^\"']*[\"'][^>]*>.*?(ignore|bypass|system).*?<\/[^>]+>",
        "severity": "HIGH",
        "weight": 85,
        "is_enabled": True,
        "description": "Hidden webpage text formatted with display:none containing injected instructions."
    },

    # -------------------------------------------------------------
    # 6. PERSONA ESCALATION & HYPOTHETICAL BYPASS
    # -------------------------------------------------------------
    {
        "id": "RULE-PE-001",
        "name": "Grandmother / Emotional Vulnerability Exploit",
        "category": "persona_escalation",
        "pattern": r"(?i)\b(my\s+grandmother|late\s+grandfather|bedtime\s+story|used\s+to\s+work\s+at\s+a\s+(chemical|weapons|napalm))\b.*(synthesize|recipe|make|create|explosives?)",
        "severity": "HIGH",
        "weight": 86,
        "is_enabled": True,
        "description": "Emotional appeal / grandmother exploit used to bypass hazardous synthesis guardrails."
    },
    {
        "id": "RULE-PE-002",
        "name": "Root Terminal / Shell Emulation Jailbreak",
        "category": "persona_escalation",
        "pattern": r"(?i)\b(simulated\s+(linux|ubuntu|bash|root\s+shell)|act\s+as\s+a\s+terminal)\b.*(root@|#\s*whoami|#\s*cat\s+/etc)",
        "severity": "MEDIUM",
        "weight": 78,
        "is_enabled": True,
        "description": "Terminal emulation jailbreak attempting to bypass safety through simulated shell commands."
    },
    {
        "id": "RULE-PE-003",
        "name": "Fictional Narrative Safety Bypass",
        "category": "persona_escalation",
        "pattern": r"(?i)\b(write\s+a\s+fictional\s+story\s+where|in\s+a\s+movie\s+script)\b.*(exact\s+(exploit|malware|virus|code)|synthesize|bomb|weapon)\b",
        "severity": "MEDIUM",
        "weight": 72,
        "is_enabled": True,
        "description": "Fictional framing designed to extract actionable exploit code or hazardous blueprints."
    }
]
