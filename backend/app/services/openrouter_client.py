"""OpenRouter API client with retry logic and error handling."""

import logging
import time
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class OpenRouterError(Exception):
    """Base exception for OpenRouter errors."""

    pass


class RateLimitError(OpenRouterError):
    """Rate limit exceeded."""

    pass


class APIError(OpenRouterError):
    """API request failed."""

    pass


class OpenRouterClient:
    """Client for interacting with OpenRouter API."""

    def __init__(self, api_key: str | None = None) -> None:
        """Initialize OpenRouter client.

        Args:
            api_key: OpenRouter API key (defaults to settings)
        """
        self.api_key = api_key or settings.openrouter_api_key
        self.base_url = settings.openrouter_base_url
        self.max_retries = 5
        self.circuit_breaker_threshold = 5
        self.consecutive_failures = 0

    def generate(
        self,
        prompt: str,
        model: str,
        config: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Generate text using OpenRouter API.

        Args:
            prompt: Input prompt for the model
            model: Model name (e.g., 'gpt-4', 'claude-3-opus')
            config: Model configuration (temperature, max_tokens, etc.)

        Returns:
            Dictionary with response data including text, tokens, and cost

        Raises:
            RateLimitError: If rate limit is exceeded
            APIError: If API request fails
            OpenRouterError: For other errors
        """
        if self.consecutive_failures >= self.circuit_breaker_threshold:
            raise OpenRouterError("Circuit breaker open: too many consecutive failures")

        config = config or {}

        # Prepare request payload
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": config.get("temperature", 0.7),
            "max_tokens": config.get("max_tokens", 1000),
        }

        # Retry logic with exponential backoff
        for attempt in range(self.max_retries):
            try:
                response = self._call_api(payload)
                self.consecutive_failures = 0  # Reset on success
                return response
            except RateLimitError:
                if attempt < self.max_retries - 1:
                    wait_time = 2**attempt  # Exponential backoff: 1s, 2s, 4s, 8s, 16s
                    logger.warning(
                        f"Rate limit hit, retrying in {wait_time}s (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(wait_time)
                else:
                    self.consecutive_failures += 1
                    raise
            except Exception as e:
                self.consecutive_failures += 1
                logger.error(f"OpenRouter API error: {e}")
                raise APIError(f"Failed to generate text: {e}") from e

        raise OpenRouterError("Max retries exceeded")

    def _call_api(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Make API call to OpenRouter.

        Args:
            payload: Request payload

        Returns:
            Response data

        Raises:
            RateLimitError: If rate limit exceeded
            APIError: If request fails
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/METResearchGroup/evals-platform",
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 429:
                    raise RateLimitError("Rate limit exceeded")

                response.raise_for_status()
                data = response.json()

                # Extract response and calculate cost
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)

                # Cost calculation (placeholder - actual rates vary by model)
                # This is a rough estimate; real implementation should use model-specific pricing
                cost_usd = prompt_tokens * 0.00001 + completion_tokens * 0.00003

                logger.info(
                    f"OpenRouter API call successful: {prompt_tokens + completion_tokens} tokens, "
                    f"${cost_usd:.6f}"
                )

                return {
                    "content": content,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens,
                    "cost_usd": cost_usd,
                }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise RateLimitError("Rate limit exceeded") from e
            raise APIError(f"HTTP error {e.response.status_code}: {e.response.text}") from e
        except httpx.RequestError as e:
            raise APIError(f"Request error: {e}") from e
        except Exception as e:
            raise APIError(f"Unexpected error: {e}") from e
