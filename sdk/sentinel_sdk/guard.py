"""
SentinelPrompt - @sentinel_guard Security Decorator
Seamlessly shields any Python LLM function, LangChain chain, or agent handler from injection attacks.
"""

import functools
import inspect
from typing import Callable, Optional, Any
from sentinel_sdk.client import SentinelClient
from sentinel_sdk.exceptions import PromptInjectionBlockedError

DEFAULT_BLOCKED_MESSAGE = (
    "🛡️ SentinelPrompt Security Notice: Request blocked. The submitted prompt violated "
    "safety policies (detected prompt injection / jailbreak attempt)."
)

def sentinel_guard(
    client: Optional[SentinelClient] = None,
    on_blocked: str = "raise",  # "raise" | "fallback" | "custom"
    fallback_message: str = DEFAULT_BLOCKED_MESSAGE,
    fallback_handler: Optional[Callable[[dict], Any]] = None,
    block_suspicious: bool = True
):
    """
    Decorator to shield any function accepting a prompt string from adversarial injection.
    Usage:
        @sentinel_guard(on_blocked="raise")
        def query_model(prompt: str) -> str:
            ...
    """
    sentinel = client or SentinelClient()

    def decorator(fn: Callable):
        is_async = inspect.iscoroutinefunction(fn)

        def _extract_prompt(*args, **kwargs) -> str:
            if "prompt" in kwargs:
                return str(kwargs["prompt"])
            if "user_input" in kwargs:
                return str(kwargs["user_input"])
            if "message" in kwargs:
                return str(kwargs["message"])
            if args:
                return str(args[0])
            raise ValueError("Could not locate prompt string in function arguments.")

        def _handle_block(result: dict):
            if on_blocked == "raise":
                raise PromptInjectionBlockedError(
                    f"Blocked prompt injection threat [{result.get('attack_category')}]: {result.get('summary_reason')}",
                    scan_result=result
                )
            elif on_blocked == "fallback":
                return fallback_message
            elif on_blocked == "custom" and fallback_handler:
                return fallback_handler(result)
            return fallback_message

        if is_async:
            @functools.wraps(fn)
            async def async_wrapper(*args, **kwargs):
                prompt = _extract_prompt(*args, **kwargs)
                result = await sentinel.analyze_async(prompt)
                
                is_blocked = result.get("verdict") == "BLOCKED" or (
                    block_suspicious and result.get("verdict") == "SUSPICIOUS"
                )

                if is_blocked:
                    return _handle_block(result)

                return await fn(*args, **kwargs)
            return async_wrapper
        else:
            @functools.wraps(fn)
            def sync_wrapper(*args, **kwargs):
                prompt = _extract_prompt(*args, **kwargs)
                result = sentinel.analyze(prompt)

                is_blocked = result.get("verdict") == "BLOCKED" or (
                    block_suspicious and result.get("verdict") == "SUSPICIOUS"
                )

                if is_blocked:
                    return _handle_block(result)

                return fn(*args, **kwargs)
            return sync_wrapper

    return decorator
