# Evals Harness Platform

## Problem Statement
Lab researchers currently lack a rapid, in-house evaluation platform to compare LLM performance across classification and generation tasks. Existing solutions are either too complex for rapid iteration or lack the specific evaluation methods needed for research workflows, particularly hallucination detection and accuracy measurement. This limits the team's ability to quickly test hypotheses about LLM performance and iterate on evaluation methodologies.

## Objective & Success Criteria
- Researchers can add evaluation tasks and run comparisons across multiple LLM providers within 5 minutes
- Platform handles 100+ tasks and 10+ models without performance degradation
- Evaluation results are reproducible and statistically meaningful for research decisions
- Hallucination detection and accuracy measurement are primary evaluation methods
- Technical users can add new tasks and models without extensive documentation

## Scope & Deliverables

**In Scope:**
- Next.js frontend with 5 core tabs (Evaluate, Add Task, View Tasks, Add Model, Review Performance)
- FastAPI backend with SQLite database
- OpenRouter integration for LLM provider abstraction
- Classification and generation evaluation methods
- Hallucination detection and accuracy measurement
- Error categorization and analysis
- Cost tracking and API usage monitoring

**Out of Scope:**
- Multi-user authentication and collaboration features
- Advanced analytics and reporting dashboards
- Caching layer (MVP focus)
- PostgreSQL migration (start with SQLite)
- Real-time collaboration features

## Timeline & Milestones
- **Week 1**: MVP with stateless UI, Vercel deployment, and FastAPI backend
  - Day 1-2: Basic stateless UI with dummy data (JSON)
  - Day 3: Vercel deployment setup
  - Day 4-5: FastAPI backend with SQLite
  - Day 6-7: Integration and testing

## Team & Stakeholders
- **Lead Developer**: @mark (AI agent implementation)
- **Research Team**: Lab researchers (primary users)
- **Stakeholders**: Project leads needing performance overviews

## Risks & Mitigations
- **Risk**: API rate limits from OpenRouter → Mitigation: Implement exponential backoff and retry logic
- **Risk**: Cost overruns from LLM API calls → Mitigation: Set spending limits and alerts
- **Risk**: Evaluation reproducibility issues → Mitigation: Version all prompts and configurations
- **Risk**: Performance degradation with scale → Mitigation: Monitor query performance, plan PostgreSQL migration

## Related Tickets & Projects
- **Specification**: `/spec.md`
- **Brain Dump**: `/braindump.md`
- **Related Projects**: Lab research evaluation infrastructure

## Priority Setup Order
1. **Basic stateless UI** with dummy data (JSON) for immediate testing
2. **Vercel deployment** for immediate UI availability
3. **FastAPI backend** with full functionality
