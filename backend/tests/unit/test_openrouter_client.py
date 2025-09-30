"""Unit tests for OpenRouter client."""

from unittest.mock import MagicMock, patch

import httpx
import pytest

from app.services.openrouter_client import (
    APIError,
    OpenRouterClient,
    OpenRouterError,
    RateLimitError,
)


def test_openrouter_client_initialization() -> None:
    """Test OpenRouter client initializes with correct defaults."""
    client = OpenRouterClient()

    expected_result = {
        "has_api_key": True,
        "base_url": "https://openrouter.ai/api/v1",
        "max_retries": 5,
        "circuit_breaker_threshold": 5,
    }

    assert client.api_key is not None
    assert client.base_url == expected_result["base_url"]
    assert client.max_retries == expected_result["max_retries"]
    assert (
        OpenRouterClient._circuit_breaker_threshold == expected_result["circuit_breaker_threshold"]
    )


@patch("app.services.openrouter_client.httpx.Client")
def test_generate_success(mock_client_class: MagicMock) -> None:
    """Test successful text generation."""
    # Mock response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": "The answer is 4"}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 5},
    }

    mock_client_instance = MagicMock()
    mock_client_instance.post.return_value = mock_response
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")
    result = client.generate(prompt="What is 2+2?", model="gpt-4")

    expected_result = {
        "content": "The answer is 4",
        "prompt_tokens": 10,
        "completion_tokens": 5,
        "total_tokens": 15,
    }

    assert result["content"] == expected_result["content"]
    assert result["prompt_tokens"] == expected_result["prompt_tokens"]
    assert result["completion_tokens"] == expected_result["completion_tokens"]
    assert result["total_tokens"] == expected_result["total_tokens"]
    assert "cost_usd" in result
    assert result["cost_usd"] > 0


@patch("app.services.openrouter_client.httpx.Client")
def test_generate_with_config(mock_client_class: MagicMock) -> None:
    """Test text generation with custom config."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": "Response"}}],
        "usage": {"prompt_tokens": 5, "completion_tokens": 3},
    }

    mock_client_instance = MagicMock()
    mock_client_instance.post.return_value = mock_response
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")
    config = {"temperature": 0.5, "max_tokens": 500}
    client.generate(prompt="Test", model="gpt-4", config=config)

    # Verify the config was passed to the API
    call_args = mock_client_instance.post.call_args
    payload = call_args.kwargs["json"]

    expected_result = {
        "temperature": 0.5,
        "max_tokens": 500,
    }

    assert payload["temperature"] == expected_result["temperature"]
    assert payload["max_tokens"] == expected_result["max_tokens"]


@patch("app.services.openrouter_client.httpx.Client")
@patch("app.services.openrouter_client.time.sleep")
def test_generate_rate_limit_retry(mock_sleep: MagicMock, mock_client_class: MagicMock) -> None:
    """Test retry logic on rate limit errors."""
    # First two calls return 429, third succeeds
    mock_response_429 = MagicMock()
    mock_response_429.status_code = 429

    mock_response_success = MagicMock()
    mock_response_success.status_code = 200
    mock_response_success.json.return_value = {
        "choices": [{"message": {"content": "Success"}}],
        "usage": {"prompt_tokens": 5, "completion_tokens": 3},
    }

    mock_client_instance = MagicMock()
    mock_client_instance.post.side_effect = [
        httpx.HTTPStatusError("429", request=MagicMock(), response=mock_response_429),
        httpx.HTTPStatusError("429", request=MagicMock(), response=mock_response_429),
        mock_response_success,
    ]
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")
    result = client.generate(prompt="Test", model="gpt-4")

    expected_result = {
        "content": "Success",
        "retry_count": 2,  # Should have retried 2 times
    }

    assert result["content"] == expected_result["content"]
    assert mock_sleep.call_count == expected_result["retry_count"]
    # Verify exponential backoff: first sleep(1), then sleep(2)
    assert mock_sleep.call_args_list[0][0][0] == 1
    assert mock_sleep.call_args_list[1][0][0] == 2


@patch("app.services.openrouter_client.httpx.Client")
def test_generate_rate_limit_max_retries(mock_client_class: MagicMock) -> None:
    """Test that max retries are respected."""
    mock_response_429 = MagicMock()
    mock_response_429.status_code = 429

    mock_client_instance = MagicMock()
    mock_client_instance.post.side_effect = httpx.HTTPStatusError(
        "429", request=MagicMock(), response=mock_response_429
    )
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")

    with pytest.raises(RateLimitError):
        client.generate(prompt="Test", model="gpt-4")


@patch("app.services.openrouter_client.httpx.Client")
def test_generate_api_error(mock_client_class: MagicMock) -> None:
    """Test handling of API errors."""
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.text = "Internal Server Error"

    mock_client_instance = MagicMock()
    mock_client_instance.post.side_effect = httpx.HTTPStatusError(
        "500", request=MagicMock(), response=mock_response
    )
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")

    with pytest.raises(APIError):
        client.generate(prompt="Test", model="gpt-4")


@patch("app.services.openrouter_client.httpx.Client")
def test_circuit_breaker(mock_client_class: MagicMock) -> None:
    """Test circuit breaker opens after consecutive failures."""
    # Reset circuit breaker state before test
    OpenRouterClient._consecutive_failures = 0
    OpenRouterClient._last_failure_time = None

    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.text = "Error"

    mock_client_instance = MagicMock()
    mock_client_instance.post.side_effect = httpx.HTTPStatusError(
        "500", request=MagicMock(), response=mock_response
    )
    mock_client_instance.__enter__.return_value = mock_client_instance
    mock_client_instance.__exit__.return_value = None
    mock_client_class.return_value = mock_client_instance

    client = OpenRouterClient(api_key="test-key")

    expected_result = {
        "failure_threshold": 5,
        "should_open_circuit": True,
    }

    # Trigger 5 consecutive failures
    for _ in range(expected_result["failure_threshold"]):
        try:
            client.generate(prompt="Test", model="gpt-4")
        except APIError:
            pass

    # Circuit breaker should now be open
    with pytest.raises(OpenRouterError, match="Circuit breaker open"):
        client.generate(prompt="Test", model="gpt-4")

    # Cleanup: reset circuit breaker state after test
    OpenRouterClient._consecutive_failures = 0
    OpenRouterClient._last_failure_time = None
