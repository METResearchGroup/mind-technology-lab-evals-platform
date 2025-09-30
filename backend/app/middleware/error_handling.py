"""Global error handling middleware."""

import logging
from collections.abc import Callable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.openrouter_client import APIError, OpenRouterError, RateLimitError
from app.utils.exceptions import ModelNotFoundError, RunNotFoundError, TaskNotFoundError

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for handling exceptions globally."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> JSONResponse:
        """Process request and handle exceptions.

        Args:
            request: FastAPI request
            call_next: Next middleware/route handler

        Returns:
            Response or error response
        """
        try:
            response = await call_next(request)
            return response

        except TaskNotFoundError as e:
            logger.warning(f"Task not found: {e}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": str(e), "error": "task_not_found"},
            )

        except ModelNotFoundError as e:
            logger.warning(f"Model not found: {e}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": str(e), "error": "model_not_found"},
            )

        except RunNotFoundError as e:
            logger.warning(f"Run not found: {e}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": str(e), "error": "run_not_found"},
            )

        except RateLimitError as e:
            logger.error(f"Rate limit error: {e}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": str(e), "error": "rate_limit_exceeded"},
            )

        except APIError as e:
            logger.error(f"API error: {e}")
            return JSONResponse(
                status_code=status.HTTP_502_BAD_GATEWAY,
                content={"detail": str(e), "error": "api_error"},
            )

        except OpenRouterError as e:
            logger.error(f"OpenRouter error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": str(e), "error": "openrouter_error"},
            )

        except Exception as e:
            logger.exception(f"Unhandled exception: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error", "error": "internal_error"},
            )
