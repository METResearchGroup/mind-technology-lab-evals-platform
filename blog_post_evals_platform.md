# Creating an evals platform from scratch, Pt. I

## Problem statement

As a researcher working with large language models, I found myself constantly needing to evaluate different LLM providers against specific tasks—comparing hallucination rates, accuracy on classification problems, and generation quality across models. The existing solutions were either too complex for rapid iteration or lacked the specific evaluation methods I needed for research workflows.

The core problem: **I needed a way to quickly test hypotheses about LLM performance without getting bogged down in infrastructure.** When you're trying to answer questions like "Which model performs better on medical fact-checking?" or "How do hallucination rates vary across different prompting strategies?", you need something that gets out of your way.

## How I thought about it

### Build versus use something existing

**Caveat**: I always advocate using something off-the-shelf first

I started by evaluating existing solutions. The landscape includes heavyweight platforms like Weights & Biases, MLflow, and custom solutions built on top of frameworks like LangChain. Here's what I found:

**Existing Solutions:**
- **Weights & Biases**: Excellent for ML experiments, but overkill for simple LLM comparisons
- **LangSmith**: Great for LangChain workflows, but tied to their ecosystem
- **Custom Jupyter notebooks**: Flexible but not reproducible or shareable
- **Simple scripts**: Fast to write but hard to maintain and compare results

The existing solutions felt like using a sledgehammer to crack a nut. I needed something that could:
- Handle both classification and generation tasks equally well
- Focus on hallucination detection and accuracy (my primary metrics)
- Allow rapid iteration on evaluation methodologies
- Be reproducible and shareable with research collaborators

**The decision to build**: After spending a day trying to adapt existing tools, I realized I was fighting against their design assumptions. The time investment in building something tailored to my specific needs would pay off quickly.

### Having a UI versus something simplified

This was a crucial architectural decision. I could have built a simple CLI tool or even just improved my Jupyter notebook workflow. But here's why I chose a UI:

**Research workflows are collaborative.** I needed something my lab mates could use without learning command-line tools or Python scripting. A UI makes the platform accessible to researchers with different technical backgrounds.

**Visualization matters for research.** When you're comparing 10 models across 50 tasks, tables of numbers don't tell the story. I needed charts, trend analysis, and interactive filtering to spot patterns.

**Rapid iteration requires immediate feedback.** With a UI, I can add a new task, run an evaluation, and see results in seconds. This enables the kind of exploratory research that leads to insights.

**The UI-first approach**: I designed the platform around 5 core tabs that map directly to my research workflow:
1. **Evaluate**: Pick a task and model, run evaluation, see results
2. **Add Task**: Create new evaluation tasks with ground truth and rubrics
3. **View Tasks**: Browse and filter existing tasks
4. **Add Model**: Configure new LLM providers via OpenRouter
5. **Review Performance**: Analyze results with filtering and visualization

## Actually building a V1 UI

Here's how I approached the technical implementation:

### Architecture Decisions

**Frontend: Next.js 14 + TypeScript + Tailwind CSS**
- Modern React framework with excellent TypeScript support
- Tailwind for rapid UI development without custom CSS
- Server-side rendering for better performance

**Backend: FastAPI + SQLite**
- FastAPI provides auto-generated API documentation (crucial for research reproducibility)
- SQLite for MVP simplicity—can migrate to PostgreSQL later
- Python ecosystem for ML/AI libraries

**LLM Integration: OpenRouter**
- Single API for multiple LLM providers
- Built-in cost tracking and rate limiting
- Abstracts away provider-specific quirks

### The Planning Process

Before writing a single line of code, I spent time on comprehensive planning:

**1. Expert Persona Review**
I used AI personas specialized in evaluation methodology and platform architecture to review my initial design. This caught several critical issues:
- Need for LLM-as-judge validation (>80% human agreement requirement)
- Statistical significance testing for research credibility
- Error categorization taxonomy for systematic analysis

**2. Detailed Specification**
Created a comprehensive spec covering:
- Data models with proper versioning and metadata
- API design with clear error handling
- Testing strategy (>90% coverage, headless for CI/CD)
- Performance requirements (<500ms API response, <2s page load)

**3. Linear Project Setup**
Organized the work into 6 actionable tickets:
- MET-55: Basic stateless UI with dummy data
- MET-56: Vercel deployment
- MET-57: FastAPI backend with SQLite
- MET-58: Frontend-backend integration
- MET-59: Error analysis and hallucination detection
- MET-60: Cost tracking and performance monitoring

### Key Technical Decisions

**Data Model Design**
```sql
-- Core tables with UUIDs and versioning
eval_tasks (id, version, name, description, task_type, ground_truth, rubric, metadata, created_at)
models (id, name, provider, model_id, config, metadata, created_at)
eval_results (id, task_id, model_id, run_id, result, score, error_analysis, cost, created_at)
```

**Evaluation Methodology**
- LLM-as-judge for hallucination detection with human validation
- Error categorization using expert-recommended taxonomy
- Priority scoring: frequency × severity × impact
- Statistical validation with confidence intervals

**Quality Standards**
- >90% test coverage with headless testing for CI/CD
- Pre-commit hooks for code quality
- Performance monitoring and cost tracking
- Security headers and HTTPS enforcement

## Limitations

This V1 approach has several intentional limitations:

**Single-user system**: No authentication or collaboration features yet. This keeps the MVP simple and focused.

**SQLite database**: Will need PostgreSQL migration for production scale, but SQLite enables rapid development and testing.

**No caching layer**: API calls go directly to OpenRouter. Caching can be added later when we understand usage patterns.

**Limited analytics**: Basic cost tracking and performance monitoring. Advanced analytics can be added based on actual usage.

**Manual error analysis**: While we have LLM-as-judge validation, human review is still required for critical decisions.

## Thoughts and next steps

The planning phase revealed that **good architecture decisions upfront save significant time during implementation**. The multi-persona review caught issues that would have been expensive to fix later, and the detailed specification provides a clear roadmap for development.

**What I learned:**
- Domain-specific expertise (via AI personas) provides invaluable insights
- Comprehensive testing criteria upfront prevents quality issues
- Clean separation between frontend and backend enables parallel development
- Research projects have unique requirements (evaluation methodology, cost management, reproducibility)

**Next steps:**
1. Implement the basic stateless UI with dummy data (MET-55)
2. Deploy to Vercel for immediate stakeholder feedback (MET-56)
3. Build the FastAPI backend with OpenRouter integration (MET-57)
4. Connect frontend and backend for end-to-end functionality (MET-58)
5. Add error analysis and hallucination detection (MET-59)
6. Implement cost tracking and performance monitoring (MET-60)

The goal is to have a working platform within a week that enables rapid LLM evaluation and comparison. The detailed planning ensures we're building something that will actually solve the research problem, not just another tool that gets abandoned.

**Key insight**: Sometimes the best way to solve a research problem is to build the right tool. The time invested in planning and building something tailored to your specific needs pays off quickly when it enables the kind of rapid iteration that leads to research insights.

---

*In Part II, I'll cover the actual implementation process, including the challenges of building a production-ready evaluation platform and the lessons learned from the development phase.*
