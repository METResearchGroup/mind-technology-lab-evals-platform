# Evals Platform for Mind and Technology Lab

A Python-based evaluation platform for the Mind and Technology Lab, built with modern tooling and best practices.

## Quick Start

🚀 **New to this project?** Check out our detailed [SETUP.md](SETUP.md) guide for complete installation and configuration instructions.

### Prerequisites
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

### Quick Setup
```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies and set up the project
uv sync

# Verify installation
uv run python --version
```

## Project Structure

This project uses modern Python tooling:
- **uv**: Fast Python package manager and project management
- **pyproject.toml**: Modern Python project configuration
- **Python 3.12+**: Latest Python features and performance improvements

## Development

```bash
# Add new dependencies
uv add package-name

# Add development dependencies  
uv add --dev package-name

# Run Python code
uv run python script.py

# Update dependencies
uv sync --upgrade
```

## Documentation

- [SETUP.md](SETUP.md) - Complete setup and installation guide
- [pyproject.toml](pyproject.toml) - Project configuration and dependencies

## Getting Help

For detailed setup instructions, troubleshooting, and development workflow, see [SETUP.md](SETUP.md).
