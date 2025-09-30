"""OpenRouter API client with retry logic and error handling."""

import logging
import threading
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

    # Class-level circuit breaker state (shared across all instances)
    _consecutive_failures = 0
    _circuit_breaker_threshold = 5
    _last_failure_time: float | None = None
    _cb_lock = threading.Lock()

    def __init__(self, api_key: str | None = None) -> None:
        """Initialize OpenRouter client.

        Args:
            api_key: OpenRouter API key (defaults to settings)

        Raises:
            OpenRouterError: If API key is not configured
        """
        self.api_key = api_key or settings.openrouter_api_key
        if not self.api_key:
            raise OpenRouterError("OpenRouter API key is not configured.")
        self.base_url = settings.openrouter_base_url
        self.max_retries = 5

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
        # Check circuit breaker (shared across all instances)
        with OpenRouterClient._cb_lock:
            if (
                OpenRouterClient._consecutive_failures
                >= OpenRouterClient._circuit_breaker_threshold
            ):
                # Auto-reset after 60 seconds
                if (
                    OpenRouterClient._last_failure_time
                    and time.time() - OpenRouterClient._last_failure_time > 60
                ):
                    logger.info("Circuit breaker auto-reset after 60 seconds")
                    OpenRouterClient._consecutive_failures = 0
                    OpenRouterClient._last_failure_time = None
                else:
                    raise OpenRouterError(
                        f"Circuit breaker open: {OpenRouterClient._consecutive_failures} "
                        f"consecutive failures (resets after 60s)"
                    )

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
                with OpenRouterClient._cb_lock:
                    OpenRouterClient._consecutive_failures = 0  # Reset on success
                    OpenRouterClient._last_failure_time = None
                return response
            except RateLimitError:
                if attempt < self.max_retries - 1:
                    wait_time = 2**attempt  # Exponential backoff: 1s, 2s, 4s, 8s, 16s
                    logger.warning(
                        f"Rate limit hit, retrying in {wait_time}s (attempt {attempt + 1}/{self.max_retries})"
                    )
                    time.sleep(wait_time)
                else:
                    with OpenRouterClient._cb_lock:
                        OpenRouterClient._consecutive_failures += 1
                        OpenRouterClient._last_failure_time = time.time()
                    raise
            except Exception as e:
                with OpenRouterClient._cb_lock:
                    OpenRouterClient._consecutive_failures += 1
                    OpenRouterClient._last_failure_time = time.time()
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
            "Referer": "https://github.com/METResearchGroup/mind-technology-lab-evals-platform",
            "X-Title": "MET Evals Platform",
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

                # Calculate cost using model-specific pricing
                from app.utils.pricing import calculate_cost

                cost_usd = calculate_cost(
                    model_name=payload["model"],
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                )

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
