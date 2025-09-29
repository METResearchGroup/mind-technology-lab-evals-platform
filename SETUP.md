# Setup Guide

This guide will help you set up the Mind and Technology Lab Evals Platform development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### 1. Python 3.12+
This project requires Python 3.12 or later. You can check your Python version with:
```bash
python --version
```

If you need to install or upgrade Python, visit [python.org](https://www.python.org/downloads/) or use a version manager like [pyenv](https://github.com/pyenv/pyenv).

### 2. uv Package Manager
This project uses [uv](https://github.com/astral-sh/uv) as the Python package and project manager. Install it using one of the following methods:

**macOS/Linux (recommended):**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Alternative installation methods:**
```bash
# Using pip
pip install uv

# Using homebrew (macOS)
brew install uv

# Using pipx
pipx install uv
```

After installation, restart your terminal or run:
```bash
source $HOME/.local/bin/env
```

Verify the installation:
```bash
uv --version
```

## Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mind_technology_lab_evals_platform
```

### 2. Create and Activate Virtual Environment
uv will automatically create and manage a virtual environment for you:

```bash
# Install dependencies and create virtual environment
uv sync
```

This command will:
- Create a virtual environment (if it doesn't exist)
- Install all project dependencies
- Set up the project in development mode

### 3. Activate the Virtual Environment
To activate the virtual environment manually:

```bash
# Activate the virtual environment
source .venv/bin/activate

# On Windows (if using Windows)
# .venv\Scripts\activate
```

Alternatively, you can run commands directly with uv without activating:
```bash
uv run python your_script.py
uv run pytest
```

### 4. Verify Installation
To verify everything is set up correctly:

```bash
# Check Python version in the virtual environment
uv run python --version

# List installed packages
uv pip list
```

## Development Workflow

### Adding Dependencies
To add new dependencies to the project:

```bash
# Add a runtime dependency
uv add package-name

# Add a development dependency
uv add --dev package-name

# Add a specific version
uv add "package-name>=1.0.0,<2.0.0"
```

### Running Code
```bash
# Run Python scripts
uv run python script.py

# Run with specific module
uv run python -m module_name
```

### Development Tools
Common development commands:

```bash
# Run tests (when test framework is added)
uv run pytest

# Run linting (when linter is added)
uv run ruff check

# Format code (when formatter is added)
uv run ruff format

# Type checking (when mypy is added)
uv run mypy .
```

### Updating Dependencies
```bash
# Update all dependencies
uv sync --upgrade

# Update a specific package
uv add package-name --upgrade
```

## Project Structure

After setup, your project structure should look like this:

```
mind_technology_lab_evals_platform/
├── .venv/              # Virtual environment (auto-created)
├── pyproject.toml      # Project configuration and dependencies
├── README.md           # Project overview
├── SETUP.md            # This setup guide
└── src/                # Source code (when added)
```

## Troubleshooting

### Common Issues

1. **Python version mismatch**: Ensure you have Python 3.12+ installed
2. **uv not found**: Make sure uv is properly installed and in your PATH
3. **Permission errors**: Try running commands with appropriate permissions

### Getting Help

- Check the [uv documentation](https://docs.astral.sh/uv/)
- Run `uv --help` for command-line help
- Check project-specific issues in the repository

## Next Steps

Once you have completed the setup:

1. Familiarize yourself with the project structure
2. Review the main README.md for project-specific information
3. Check for any additional configuration files
4. Start developing!

For any setup issues, please check the project's issue tracker or contact the development team.
