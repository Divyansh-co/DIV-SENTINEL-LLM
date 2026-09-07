"""
SentinelPrompt SDK Client
Provides synchronous and asynchronous communication with the SentinelPrompt Firewall.
"""

from typing import Dict, Any, Optional
import httpx

class SentinelClient:
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: str = "sp_live_9f8a3c2e1b7d4a6e8f0c2b4a6d8e0f1a",
        timeout_seconds: float = 3.0
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout_seconds
        self.headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "SentinelPrompt-PythonSDK/1.0"
        }

    def analyze(self, prompt: str, context: Optional[str] = None, client_id: str = "sdk_app") -> Dict[str, Any]:
        """Synchronously scan a prompt against the SentinelPrompt firewall."""
        url = f"{self.base_url}/api/v1/analyze"
        payload = {"prompt": prompt, "context": context, "client_id": client_id}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def analyze_async(self, prompt: str, context: Optional[str] = None, client_id: str = "sdk_app") -> Dict[str, Any]:
        """Asynchronously scan a prompt against the SentinelPrompt firewall."""
        url = f"{self.base_url}/api/v1/analyze"
        payload = {"prompt": prompt, "context": context, "client_id": client_id}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    def health(self) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(f"{self.base_url}/health")
            resp.raise_for_status()
            return resp.json()
