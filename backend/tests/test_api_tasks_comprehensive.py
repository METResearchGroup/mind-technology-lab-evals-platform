"""Comprehensive unit tests for Task API endpoints.

Tests cover various scenarios for task creation, including edge cases,
validation, and data serialization to ensure maximal robustness.

Following AI Evals Methodology Expert guidance on comprehensive test coverage.

Uses fixtures from conftest.py for proper database setup.
"""

import time


class TestTaskCreation:
    """Tests for POST /api/tasks endpoint."""

    def test_create_task_with_all_fields(self, client):
        """Test creating task with all fields populated."""
        task_data = {
            "name": "Complete Task Example",
            "description": "A task with all fields filled",
            "input": "What is the capital of France?",
            "expected_output": "Paris",
            "ground_truth": "Paris (verified via Wikipedia)",
            "task_type": "classification",
            "evaluation_method": "code",
            "rubric": "Exact match required",
            "tags": ["geography", "factual", "europe"],
            "project": "knowledge-test",
            "task_version": "v1.0",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["name"] == task_data["name"]
        assert result["description"] == task_data["description"]
        assert result["tags"] == task_data["tags"]
        assert result["project"] == task_data["project"]
        assert "id" in result
        assert "created_at" in result
        assert "updated_at" in result

    def test_create_task_with_empty_tags(self, client):
        """Test creating task with empty tags array (bug fix regression test).

        This is a critical regression test for the bug where empty tags arrays
        caused SQLite errors due to incorrect conversion logic.
        """
        task_data = {
            "name": "Task With Empty Tags",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": [],  # Empty array - was causing SQLite error before fix
            "project": "test-project",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["tags"] == []
        assert result["name"] == task_data["name"]

    def test_create_task_with_single_tag(self, client):
        """Test creating task with single tag."""
        task_data = {
            "name": "Single Tag Task",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": ["production_data"],
            "project": "research-project-alpha",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["tags"] == ["production_data"]
        assert result["project"] == "research-project-alpha"

    def test_create_task_with_many_tags(self, client):
        """Test creating task with many tags (15 tags)."""
        tags = [f"tag_{i}" for i in range(15)]
        task_data = {
            "name": "Many Tags Task",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": tags,
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert len(result["tags"]) == 15
        assert result["tags"] == tags

    def test_create_task_minimal_required_fields(self, client):
        """Test creating task with only required fields."""
        task_data = {
            "name": "Minimal Task",
            "input": "Test input",
            "task_type": "generation",
            "evaluation_method": "llm_judge",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["name"] == "Minimal Task"
        assert result["description"] is None
        assert result["expected_output"] is None
        assert result["ground_truth"] is None
        assert result["rubric"] is None
        assert result["tags"] == []
        assert result["project"] is None

    def test_create_task_with_special_characters(self, client):
        """Test creating task with unicode and special characters."""
        task_data = {
            "name": 'Task with "quotes" and smart quotes',
            "input": "Text with emoji 🚀 and unicode café",
            "expected_output": "Response with © symbol",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": ["unicode", "émojis", "特殊字符"],
            "project": "special-chars-test",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert "🚀" in result["input"]
        assert "café" in result["input"]
        assert "©" in result["expected_output"]
        assert "émojis" in result["tags"]
        assert "特殊字符" in result["tags"]

    def test_create_task_with_very_long_input(self, client):
        """Test creating task with very long input text (5000+ characters)."""
        long_input = "A" * 5000
        task_data = {
            "name": "Long Input Task",
            "input": long_input,
            "task_type": "generation",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert len(result["input"]) == 5000
        assert result["input"] == long_input

    def test_create_task_with_newlines_and_formatting(self, client):
        """Test creating task with multiline input and special formatting."""
        task_data = {
            "name": "Multiline Task",
            "input": "Line 1\nLine 2\n\nLine 4 (after empty line)",
            "expected_output": "Response\twith\ttabs",
            "task_type": "classification",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert "\n" in result["input"]
        assert "\t" in result["expected_output"]


class TestTaskCreationValidation:
    """Tests for task creation validation errors."""

    def test_create_task_missing_name(self, client):
        """Test that missing name field returns 422."""
        task_data = {
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 422
        error = response.json()
        assert "detail" in error
        assert any("name" in str(err).lower() for err in error["detail"])

    def test_create_task_missing_input(self, client):
        """Test that missing input field returns 422."""
        task_data = {
            "name": "Task Name",
            "task_type": "classification",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 422
        error = response.json()
        assert "detail" in error

    def test_create_task_invalid_task_type(self, client):
        """Test that invalid task_type returns 422."""
        task_data = {
            "name": "Invalid Type Task",
            "input": "Test input",
            "task_type": "invalid_type",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 422

    def test_create_task_invalid_evaluation_method(self, client):
        """Test that invalid evaluation_method returns 422."""
        task_data = {
            "name": "Invalid Method Task",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "invalid_method",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 422


class TestTaskCreationRealWorldScenarios:
    """Tests for real-world task creation scenarios."""

    def test_create_production_research_task(self, client):
        """Test creating a production research task with multiple tags.

        This tests real-world scenario of adding actual research data
        with proper tagging for any research project.
        """
        task_data = {
            "name": "Production Research Task",
            "description": "Real research task for active project",
            "input": "Analyze the relationship between X and Y in context Z",
            "expected_output": "X influences Y through mechanism Z",
            "task_type": "generation",
            "evaluation_method": "llm_judge",
            "rubric": "Response should: 1) Identify relationship, 2) Explain mechanism, 3) Provide evidence",
            "tags": ["production_data", "cognitive-science", "research"],
            "project": "research-project-alpha",
            "task_version": "v1.0",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["project"] == "research-project-alpha"
        assert "production_data" in result["tags"]
        assert "cognitive-science" in result["tags"]
        assert len(result["tags"]) == 3

    def test_create_mock_data_task(self, client):
        """Test creating a mock/synthetic task for development."""
        task_data = {
            "name": "Mock Task",
            "input": "What is 2+2?",
            "expected_output": "4",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": ["mock", "synthetic", "math"],
            "project": "dev-testing",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert "mock" in result["tags"]
        assert "synthetic" in result["tags"]
        assert result["project"] == "dev-testing"


class TestTaskListAndFiltering:
    """Tests for GET /api/tasks endpoint with filtering."""

    def test_list_empty_tasks(self, client):
        """Test listing tasks when database is empty."""
        response = client.get("/api/tasks")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_multiple_tasks(self, client):
        """Test listing multiple tasks."""
        # Create 3 tasks
        for i in range(3):
            task_data = {
                "name": f"Task {i}",
                "input": f"Input {i}",
                "task_type": "classification",
                "evaluation_method": "code",
                "tags": [f"tag_{i}"],
            }
            client.post("/api/tasks", json=task_data)

        response = client.get("/api/tasks")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 3
        assert all("id" in task for task in tasks)
        assert all("tags" in task for task in tasks)


class TestTaskUpdate:
    """Tests for PUT /api/tasks/{id} endpoint."""

    def test_update_task_tags(self, client):
        """Test updating task tags array."""
        # Create task
        task_data = {
            "name": "Update Tags Test",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": ["old_tag"],
        }
        create_response = client.post("/api/tasks", json=task_data)
        task_id = create_response.json()["id"]

        # Update tags
        update_data = {"tags": ["new_tag_1", "new_tag_2"]}
        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)

        assert update_response.status_code == 200
        result = update_response.json()
        assert result["tags"] == ["new_tag_1", "new_tag_2"]
        assert "old_tag" not in result["tags"]

    def test_update_task_to_empty_tags(self, client):
        """Test updating task to have empty tags array."""
        # Create task with tags
        task_data = {
            "name": "Clear Tags Test",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
            "tags": ["tag1", "tag2"],
        }
        create_response = client.post("/api/tasks", json=task_data)
        task_id = create_response.json()["id"]

        # Clear tags
        update_data = {"tags": []}
        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)

        assert update_response.status_code == 200
        result = update_response.json()
        assert result["tags"] == []


class TestTaskTimestamps:
    """Tests for timestamp handling in tasks."""

    def test_created_at_populated(self, client):
        """Test that created_at is auto-populated."""
        task_data = {
            "name": "Timestamp Test",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
        }

        response = client.post("/api/tasks", json=task_data)

        assert response.status_code == 201
        result = response.json()
        assert result["created_at"] is not None
        assert result["updated_at"] is not None

    def test_updated_at_changes_on_update(self, client):
        """Test that updated_at changes when task is updated."""
        # Create task
        task_data = {
            "name": "Update Timestamp Test",
            "input": "Test input",
            "task_type": "classification",
            "evaluation_method": "code",
        }
        create_response = client.post("/api/tasks", json=task_data)
        task_id = create_response.json()["id"]
        created_at = create_response.json()["created_at"]
        initial_updated_at = create_response.json()["updated_at"]

        # Small delay to ensure timestamp difference
        time.sleep(0.1)

        # Update task
        update_data = {"description": "Updated description"}
        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)

        result = update_response.json()
        assert result["created_at"] == created_at  # Should not change
        assert result["updated_at"] >= initial_updated_at  # Should be same or newer


class TestTaskConcurrency:
    """Tests for concurrent task operations."""

    def test_rapid_task_creation(self, client):
        """Test creating multiple tasks rapidly."""
        tasks_created = []
        for i in range(5):
            task_data = {
                "name": f"Rapid Task {i}",
                "input": f"Input {i}",
                "task_type": "classification",
                "evaluation_method": "code",
                "tags": [f"rapid_{i}"],
            }
            response = client.post("/api/tasks", json=task_data)
            assert response.status_code == 201
            tasks_created.append(response.json())

        # Verify all have unique IDs
        ids = [task["id"] for task in tasks_created]
        assert len(ids) == len(set(ids))  # All unique

        # Verify all are in database
        list_response = client.get("/api/tasks")
        assert len(list_response.json()) == 5
