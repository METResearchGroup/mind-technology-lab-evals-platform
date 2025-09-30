"""Unit tests for API endpoints."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check(client: TestClient) -> None:
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


# Task API Tests


def test_create_task(client: TestClient) -> None:
    """Test creating a new task."""
    task_data = {
        "task_version": "v1.0",
        "name": "Test Classification Task",
        "description": "A test task",
        "input": "What is 2+2?",
        "expected_output": "4",
        "task_type": "classification",
        "evaluation_method": "code",
        "tags": ["math", "test"],
        "project": "test-project",
    }

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == task_data["name"]
    assert data["id"] is not None


def test_list_tasks(client: TestClient) -> None:
    """Test listing tasks."""
    # Create a task first
    task_data = {
        "name": "Test Task",
        "input": "test input",
        "task_type": "classification",
        "evaluation_method": "code",
    }
    client.post("/api/tasks", json=task_data)

    # List tasks
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_task(client: TestClient) -> None:
    """Test getting a specific task."""
    # Create a task
    task_data = {
        "name": "Test Task",
        "input": "test input",
        "task_type": "classification",
        "evaluation_method": "code",
    }
    create_response = client.post("/api/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Get the task
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["name"] == task_data["name"]


def test_get_task_not_found(client: TestClient) -> None:
    """Test getting a non-existent task."""
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404


def test_update_task(client: TestClient) -> None:
    """Test updating a task."""
    # Create a task
    task_data = {
        "name": "Original Name",
        "input": "test input",
        "task_type": "classification",
        "evaluation_method": "code",
    }
    create_response = client.post("/api/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Update the task
    update_data = {"name": "Updated Name"}
    response = client.put(f"/api/tasks/{task_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


def test_delete_task(client: TestClient) -> None:
    """Test deleting a task."""
    # Create a task
    task_data = {
        "name": "Task to Delete",
        "input": "test input",
        "task_type": "classification",
        "evaluation_method": "code",
    }
    create_response = client.post("/api/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(f"/api/tasks/{task_id}")
    assert response.status_code == 204

    # Verify it's deleted
    get_response = client.get(f"/api/tasks/{task_id}")
    assert get_response.status_code == 404


# Model API Tests


def test_create_model(client: TestClient) -> None:
    """Test creating a new model."""
    model_data = {
        "provider": "openrouter",
        "model_name": "gpt-4",
        "prompt_version": "v1.0",
        "config": {"temperature": 0.7, "max_tokens": 1000},
    }

    response = client.post("/api/models", json=model_data)
    assert response.status_code == 201
    data = response.json()
    assert data["model_name"] == model_data["model_name"]
    assert data["id"] is not None


def test_list_models(client: TestClient) -> None:
    """Test listing models."""
    # Create a model first
    model_data = {
        "provider": "openrouter",
        "model_name": "gpt-4",
        "prompt_version": "v1.0",
    }
    client.post("/api/models", json=model_data)

    # List models
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_model(client: TestClient) -> None:
    """Test getting a specific model."""
    # Create a model
    model_data = {
        "provider": "openrouter",
        "model_name": "gpt-4",
        "prompt_version": "v1.0",
    }
    create_response = client.post("/api/models", json=model_data)
    model_id = create_response.json()["id"]

    # Get the model
    response = client.get(f"/api/models/{model_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == model_id


def test_update_model(client: TestClient) -> None:
    """Test updating a model."""
    # Create a model
    model_data = {
        "provider": "openrouter",
        "model_name": "gpt-4",
        "prompt_version": "v1.0",
    }
    create_response = client.post("/api/models", json=model_data)
    model_id = create_response.json()["id"]

    # Update the model
    update_data = {"prompt_version": "v2.0"}
    response = client.put(f"/api/models/{model_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["prompt_version"] == "v2.0"


# Results API Tests


def test_list_results_empty(client: TestClient) -> None:
    """Test listing results when none exist."""
    response = client.get("/api/results")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_list_results_with_filters(client: TestClient) -> None:
    """Test listing results with filters."""
    response = client.get("/api/results?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
