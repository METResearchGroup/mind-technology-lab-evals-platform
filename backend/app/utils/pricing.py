"""Model pricing configuration for OpenRouter API.

Pricing data sourced from OpenRouter.ai and official provider APIs.
Last updated: September 2024

Note: OpenRouter pricing may vary slightly from direct API pricing.
Rates are in USD per million tokens.
"""

# Model pricing: (input_price_per_1M, output_price_per_1M)
MODEL_PRICING: dict[str, tuple[float, float]] = {
    # OpenAI GPT-4 models
    "openai/gpt-4": (30.0, 60.0),
    "openai/gpt-4-turbo": (10.0, 30.0),
    "openai/gpt-4-turbo-preview": (10.0, 30.0),
    "openai/gpt-4-1106-preview": (10.0, 30.0),
    "openai/gpt-4-0125-preview": (10.0, 30.0),
    "openai/gpt-4-32k": (60.0, 120.0),
    "openai/gpt-4o": (2.5, 10.0),  # GPT-4 Omni (latest)
    "openai/gpt-4o-mini": (0.15, 0.6),  # GPT-4 Omni Mini
    # OpenAI GPT-3.5 models
    "openai/gpt-3.5-turbo": (0.5, 1.5),
    "openai/gpt-3.5-turbo-16k": (3.0, 4.0),
    "openai/gpt-3.5-turbo-1106": (1.0, 2.0),
    "openai/gpt-3.5-turbo-0125": (0.5, 1.5),
    # Anthropic Claude 3.5 models (latest)
    "anthropic/claude-3.5-sonnet": (3.0, 15.0),
    "anthropic/claude-3.5-sonnet-20240620": (3.0, 15.0),
    "anthropic/claude-3.5-haiku": (0.8, 4.0),
    # Anthropic Claude 3 models
    "anthropic/claude-3-opus": (15.0, 75.0),
    "anthropic/claude-3-opus-20240229": (15.0, 75.0),
    "anthropic/claude-3-sonnet": (3.0, 15.0),
    "anthropic/claude-3-sonnet-20240229": (3.0, 15.0),
    "anthropic/claude-3-haiku": (0.25, 1.25),
    "anthropic/claude-3-haiku-20240307": (0.25, 1.25),
    # Google Gemini models
    "google/gemini-pro": (0.5, 1.5),
    "google/gemini-pro-1.5": (1.25, 5.0),
    "google/gemini-flash-1.5": (0.075, 0.3),
    # Meta Llama models
    "meta-llama/llama-3.1-405b-instruct": (2.7, 2.7),
    "meta-llama/llama-3.1-70b-instruct": (0.52, 0.75),
    "meta-llama/llama-3.1-8b-instruct": (0.055, 0.055),
    # Mistral models
    "mistralai/mistral-large": (3.0, 9.0),
    "mistralai/mistral-medium": (2.7, 8.1),
    "mistralai/mistral-small": (1.0, 3.0),
    "mistralai/mixtral-8x7b-instruct": (0.24, 0.24),
    # DeepSeek models (very cost-effective)
    "deepseek/deepseek-chat": (0.14, 0.28),
    "deepseek/deepseek-coder": (0.14, 0.28),
}

# Default fallback pricing for unknown models (conservative estimate)
DEFAULT_PRICING: tuple[float, float] = (5.0, 15.0)


def get_model_pricing(model_name: str) -> tuple[float, float]:
    """Get pricing for a specific model.

    Args:
        model_name: Model identifier (e.g., "openai/gpt-4")

    Returns:
        Tuple of (input_price_per_million, output_price_per_million)
    """
    return MODEL_PRICING.get(model_name, DEFAULT_PRICING)


def calculate_cost(model_name: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Calculate the cost in USD for a model invocation.

    Args:
        model_name: Model identifier
        prompt_tokens: Number of input tokens
        completion_tokens: Number of output tokens

    Returns:
        Cost in USD (rounded to 6 decimal places)
    """
    input_price, output_price = get_model_pricing(model_name)

    # Convert to cost (price is per million tokens)
    input_cost = (prompt_tokens / 1_000_000) * input_price
    output_cost = (completion_tokens / 1_000_000) * output_price

    return round(input_cost + output_cost, 6)


def get_all_models() -> dict[str, tuple[float, float]]:
    """Get all available model pricing.

    Returns:
        Dictionary mapping model names to (input, output) pricing
    """
    return MODEL_PRICING.copy()
