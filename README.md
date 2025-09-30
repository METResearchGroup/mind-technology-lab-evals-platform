# Evals Platform for Mind and Technology Lab

A Python-based evaluation platform for the Mind and Technology Lab, built with modern tooling and best practices.

## 📚 **Navigation**

- 🗺️ **[ROUTER.md](ROUTER.md)** - Complete repository navigation guide and file index
- 🚀 **[SETUP.md](SETUP.md)** - Detailed installation and configuration instructions
- 📋 **[BACKLOG.md](BACKLOG.md)** - Technical debt and future improvements

## Quick Start

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

See **[ROUTER.md](ROUTER.md)** for a complete navigation guide to all files and directories in this repository.

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

- **[ROUTER.md](ROUTER.md)** - Repository navigation and file index
- **[SETUP.md](SETUP.md)** - Complete setup and installation guide
- **[BACKLOG.md](BACKLOG.md)** - Technical backlog and improvements

For specific project documentation, see the **[Evals Harness Platform project folder](projects/evals-harness-platform/)**.
