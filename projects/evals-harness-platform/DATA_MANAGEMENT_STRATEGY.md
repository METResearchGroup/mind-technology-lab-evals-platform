# Data Management Strategy
**Platform**: Mind and Technology Lab Evaluation Platform
**Date**: September 30, 2025
**Version**: v1.0

---

## 🎯 **Overview**

This document explains how to manage evaluation data in the platform, both during development and in production.

---

## 🏷️ **Data Categories**

### **1. Mock/Synthetic Data** (Development Only)
- **Purpose**: Testing, development, demonstrations
- **Identification**: Tagged with `["mock", "synthetic"]`
- **Project**: `"dev-testing"`
- **Source**: `backend/scripts/seed_data.py`
- **Usage**: Safe to delete, regenerate, or modify freely

### **2. Real/Production Data** (Research Use)
- **Purpose**: Actual research evaluations, model comparisons, production decisions
- **Identification**: NO `"mock"` or `"synthetic"` tags
- **Project**: Research-specific (e.g., `"reasoning-research"`, `"code-gen-study"`)
- **Source**: Added via UI or API by researchers
- **Usage**: Never delete, version carefully, backup regularly

---

## 📝 **How to Add New Data**

### **Method 1: Via Frontend UI** (Recommended for researchers)

1. **Navigate to http://localhost:3000** (or production URL)
2. **Click "Add Task" button** in View Tasks tab
3. **Fill out form**:
   - Name: Descriptive name for the task
   - Description: Optional context
   - Input: The prompt/question for the LLM
   - Expected Output: What you expect the model to return
   - Ground Truth: Verified correct answer (if applicable)
   - Task Type: classification or generation
   - Evaluation Method: code, llm_judge, or hybrid
   - Tags: **IMPORTANT** - Add descriptive tags (e.g., `["reasoning", "math"]`)
   - Project: Your research project name (e.g., `"reasoning-study-2025"`)

4. **Click Submit** - Task saved to database immediately

5. **Repeat for Models** in View Models tab if needed

**Data Persistence**:
- **Local Development**: Data saved to `backend/evals.db` (SQLite file)
- **Production (Railway)**: ⚠️ **EPHEMERAL** - Database resets on redeploy
- **Production (Future)**: PostgreSQL with persistent volumes (ticket-006)

---

### **Method 2: Via API** (Recommended for bulk import)

**Create a single task**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Research Task",
    "input": "What is the relationship between X and Y?",
    "expected_output": "X causes Y",
    "task_type": "classification",
    "evaluation_method": "code",
    "tags": ["research", "causality", "my-project"],
    "project": "causality-research-2025"
  }'
```

**Bulk import from JSON file**:
```bash
# Create tasks.json with array of tasks
cat tasks.json | jq -c '.[]' | while read task; do
  curl -X POST http://localhost:8000/api/tasks \
    -H "Content-Type: application/json" \
    -d "$task"
done
```

---

### **Method 3: Via Python Script** (For migrations or data transformation)

```python
import requests

API_URL = "http://localhost:8000"

# Read your data source (CSV, JSON, etc.)
import pandas as pd
df = pd.read_csv("my_eval_tasks.csv")

for _, row in df.iterrows():
    task_data = {
        "name": row["name"],
        "input": row["prompt"],
        "expected_output": row["expected"],
        "task_type": "classification",
        "evaluation_method": "code",
        "tags": ["real-data", row["category"]],
        "project": "my-research-project"
    }

    response = requests.post(f"{API_URL}/api/tasks", json=task_data)
    print(f"Created task: {response.json()['id']}")
```

---

## 🔄 **Data Lifecycle**

### **Development Environment** (localhost)

**Database**: `backend/evals.db` (SQLite file)

**Adding Data**:
1. Start servers: `uvicorn app.main:app --reload` + `npm run dev`
2. Add data via UI or API (methods above)
3. Data persists in `evals.db` file

**Resetting Database**:
```bash
cd backend
rm evals.db  # Delete database
uv run python -c "from app.database import init_db; init_db()"  # Recreate schema
uv run python scripts/seed_data.py  # Add mock data (optional)
```

**Backing Up Data**:
```bash
cp evals.db evals_backup_$(date +%Y%m%d).db
```

**Exporting Data**:
```bash
# Export all tasks to JSON
curl http://localhost:8000/api/tasks > tasks_export.json

# Export all results
curl http://localhost:8000/api/results > results_export.json
```

---

### **Production Environment** (Railway)

**Database**: ⚠️ **CURRENTLY EPHEMERAL** (SQLite on temporary filesystem)

**Adding Data**:
1. Navigate to production URL
2. Add data via UI (same as development)
3. Data persists UNTIL next Railway redeploy

**⚠️ CRITICAL LIMITATION**:
- **Railway SQLite resets on every deployment**
- **All data is lost when you redeploy the backend**
- **Workaround**: Export data before deploys, re-import after

**Current Workaround**:
```bash
# BEFORE deploying to Railway
curl https://evals-backend-production.up.railway.app/api/tasks > production_tasks.json
curl https://evals-backend-production.up.railway.app/api/results > production_results.json

# AFTER deploying to Railway
# Re-import tasks
cat production_tasks.json | jq -c '.[]' | while read task; do
  # Strip id and timestamps, then re-create
  echo "$task" | jq 'del(.id, .created_at, .updated_at)' | \
  curl -X POST https://evals-backend-production.up.railway.app/api/tasks \
    -H "Content-Type: application/json" \
    -d @-
done
```

**📋 TICKET-006 FIX**: Migrate to Railway PostgreSQL with persistent volumes

---

## 🔄 **After Merging PR #4**

### **What Happens to Data**

1. **Local Development Database** (`backend/evals.db`):
   - ✅ **PERSISTS** - Your local SQLite file is NOT affected by git merge
   - ✅ All data you added locally stays intact
   - ✅ You can continue adding data to your local instance

2. **Production Database** (Railway):
   - ⚠️ **RESETS on Deploy** - Railway filesystem is ephemeral
   - ❌ Data added via production UI will be lost on next deploy
   - **Solution**: Use local development for data entry, OR migrate to PostgreSQL

### **Recommended Post-Merge Workflow**

**Option A: Work Locally, Deploy Manually**
1. Add all your research tasks **locally** (localhost:8000)
2. Data saved to `backend/evals.db`
3. Backup `evals.db` regularly
4. Deploy to Railway only for demos/access (not primary data store)

**Option B: Export/Import Pattern**
1. Add data to production (Railway)
2. Export before each deployment: `curl .../api/tasks > backup.json`
3. Deploy new code
4. Re-import after deployment
5. ⚠️ **Tedious, error-prone** - NOT recommended long-term

**Option C: Migrate to PostgreSQL** (Recommended for Production)
1. Set up Railway PostgreSQL service (ticket-006)
2. Update `DATABASE_URL` environment variable
3. Run migrations
4. Data persists across deployments ✅
5. This is the long-term solution

---

## 📊 **Data Management Best Practices**

### **For Researchers Adding Evaluation Tasks**

1. **Always Tag Your Data**:
   ```json
   {
     "tags": ["my-name", "my-project", "task-category"],
     "project": "my-research-project-2025"
   }
   ```

2. **Use Descriptive Names**:
   - ✅ GOOD: "Causal Reasoning - Physics - Medium Difficulty"
   - ❌ BAD: "Task 1"

3. **Document Ground Truth**:
   - Add description explaining WHY the expected output is correct
   - Reference sources (papers, textbooks, expert validation)

4. **Version Your Tasks**:
   - Task version auto-set to "v1.0" on creation
   - If you update a task's expected_output, consider creating NEW task instead
   - Preserves ability to compare results over time

5. **Filter Out Mock Data**:
   - In frontend: Filter by project != "dev-testing"
   - Or: Exclude tasks with "mock" tag
   - Focus analysis on real research data

---

### **For Platform Administrators**

1. **Regular Backups** (Local Development):
   ```bash
   # Add to crontab (daily backup)
   0 2 * * * cp ~/path/to/backend/evals.db ~/backups/evals_$(date +\%Y\%m\%d).db
   ```

2. **Data Exports** (Before Major Changes):
   ```bash
   # Export everything before risky operations
   ./scripts/export_all_data.sh  # Create this script
   ```

3. **Monitor Data Growth**:
   ```bash
   # Check database size
   du -h backend/evals.db

   # Count records
   curl http://localhost:8000/api/tasks | jq 'length'
   ```

4. **Clean Up Mock Data** (Periodically):
   ```bash
   # Delete all mock data
   curl http://localhost:8000/api/tasks | jq -r '.[] | select(.tags | contains(["mock"])) | .id' | \
   while read id; do
     curl -X DELETE http://localhost:8000/api/tasks/$id
   done
   ```

---

## 🚀 **Production Data Strategy** (Post-Merge)

### **Immediate (Weeks 1-2)**
- **Use local development** as primary data store
- Add real research tasks to local database
- Backup `evals.db` daily
- Deploy to Railway for demos only (expect data loss)

### **Short-term (Ticket-006)**
- Migrate Railway to PostgreSQL
- Set up automated backups
- Production becomes primary data store
- Local development syncs from production

### **Long-term (Future Tickets)**
- Add data import/export features in UI
- Implement versioning and change tracking
- Add collaborative features (multiple researchers)
- Enterprise backup and disaster recovery

---

## 📋 **Quick Reference**

### **Check What Data Exists**
```bash
# Local
curl http://localhost:8000/api/tasks | jq 'length'
curl http://localhost:8000/api/models | jq 'length'
curl http://localhost:8000/api/results | jq 'length'

# Production
curl https://evals-backend-production.up.railway.app/api/tasks | jq 'length'
```

### **Filter Out Mock Data**
```bash
# Get only real (non-mock) tasks
curl http://localhost:8000/api/tasks | \
  jq '[.[] | select(.tags | contains(["mock"]) | not)]'
```

### **Export All Data**
```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Export all entities
curl http://localhost:8000/api/tasks > backups/$(date +%Y%m%d)/tasks.json
curl http://localhost:8000/api/models > backups/$(date +%Y%m%d)/models.json
curl http://localhost:8000/api/results > backups/$(date +%Y%m%d)/results.json
```

---

## ⚠️ **Important Notes**

1. **Railway SQLite is EPHEMERAL**: Data resets on redeploy
2. **Local SQLite is PERSISTENT**: Your `evals.db` file persists across code changes
3. **Always tag mock data**: Use `["mock", "synthetic"]` tags
4. **Real data is precious**: Backup before major operations
5. **PostgreSQL migration is HIGH PRIORITY**: Ticket-006 addresses this

---

**Questions? See**: `backend/README.md` for API documentation, or ask in team chat.
