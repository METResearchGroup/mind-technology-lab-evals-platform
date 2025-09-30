"""Tests for pricing utility module."""

from app.utils.pricing import (
    MODEL_PRICING,
    calculate_cost,
    get_all_models,
    get_model_pricing,
)


def test_get_model_pricing_known_model() -> None:
    """Test getting pricing for a known model."""
    input_price, output_price = get_model_pricing("openai/gpt-4")
    assert input_price == 30.0
    assert output_price == 60.0


def test_get_model_pricing_unknown_model() -> None:
    """Test getting pricing for unknown model returns default."""
    input_price, output_price = get_model_pricing("unknown/model")
    assert input_price == 5.0  # Default pricing
    assert output_price == 15.0


def test_calculate_cost_gpt4() -> None:
    """Test cost calculation for GPT-4."""
    # GPT-4: $30/1M input, $60/1M output
    # 1000 input, 500 output = 0.001M input, 0.0005M output
    # Cost = (0.001 * 30) + (0.0005 * 60) = 0.03 + 0.03 = 0.06
    cost = calculate_cost("openai/gpt-4", prompt_tokens=1000, completion_tokens=500)
    assert cost == 0.06


def test_calculate_cost_gpt35() -> None:
    """Test cost calculation for GPT-3.5 Turbo."""
    # GPT-3.5: $0.5/1M input, $1.5/1M output
    # 10000 input, 5000 output = 0.01M input, 0.005M output
    # Cost = (0.01 * 0.5) + (0.005 * 1.5) = 0.005 + 0.0075 = 0.0125
    cost = calculate_cost("openai/gpt-3.5-turbo", prompt_tokens=10000, completion_tokens=5000)
    assert cost == 0.0125


def test_calculate_cost_claude_opus() -> None:
    """Test cost calculation for Claude 3 Opus."""
    # Claude 3 Opus: $15/1M input, $75/1M output
    # 2000 input, 1000 output = 0.002M input, 0.001M output
    # Cost = (0.002 * 15) + (0.001 * 75) = 0.03 + 0.075 = 0.105
    cost = calculate_cost("anthropic/claude-3-opus", prompt_tokens=2000, completion_tokens=1000)
    assert cost == 0.105


def test_calculate_cost_rounding() -> None:
    """Test that cost is rounded to 6 decimal places."""
    # Use a model that will produce many decimal places
    cost = calculate_cost("openai/gpt-4o-mini", prompt_tokens=123, completion_tokens=456)
    # Verify it's rounded to 6 decimal places
    assert len(str(cost).split(".")[1]) <= 6


def test_calculate_cost_zero_tokens() -> None:
    """Test cost calculation with zero tokens."""
    cost = calculate_cost("openai/gpt-4", prompt_tokens=0, completion_tokens=0)
    assert cost == 0.0


def test_get_all_models() -> None:
    """Test getting all model pricing returns a copy."""
    all_models = get_all_models()

    # Verify it's a dictionary
    assert isinstance(all_models, dict)

    # Verify it contains expected models
    assert "openai/gpt-4" in all_models
    assert "openai/gpt-3.5-turbo" in all_models
    assert "anthropic/claude-3.5-sonnet" in all_models

    # Verify it's a copy (modifying it doesn't affect the original)
    all_models["test-model"] = (1.0, 2.0)
    assert "test-model" not in MODEL_PRICING


def test_all_models_have_valid_pricing() -> None:
    """Test that all models have valid pricing tuples."""
    for _model_name, pricing in MODEL_PRICING.items():
        assert isinstance(pricing, tuple)
        assert len(pricing) == 2
        input_price, output_price = pricing
        assert isinstance(input_price, int | float)
        assert isinstance(output_price, int | float)
        assert input_price >= 0
        assert output_price >= 0


def test_latest_models_included() -> None:
    """Test that latest 2024/2025 models are included."""
    latest_models = [
        "openai/gpt-4o",
        "openai/gpt-4o-mini",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3.5-haiku",
        "google/gemini-flash-1.5",
    ]

    for model in latest_models:
        assert model in MODEL_PRICING, f"Missing latest model: {model}"


def test_cost_effective_models() -> None:
    """Test that cost-effective models have reasonable pricing."""
    # These models should be under $1 per million input tokens
    cost_effective = [
        "openai/gpt-3.5-turbo",
        "openai/gpt-4o-mini",
        "anthropic/claude-3-haiku",
        "anthropic/claude-3.5-haiku",
        "google/gemini-flash-1.5",
    ]

    for model in cost_effective:
        input_price, _ = get_model_pricing(model)
        assert input_price < 1.0, f"{model} should be under $1/1M input tokens"
