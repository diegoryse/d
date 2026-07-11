# Health Data Parser - Agentic-First Proof of Work

This project demonstrates an agentic-first development workflow for processing veterinary biomarker data.

## Stack
- TypeScript (Zod for validation)
- Node.js architecture
- Agentic Workflow: AI agents (Claude/Cursor) used for architectural scaffolding and implementation.

## Core Logic
The system validates raw JSON lab results and outputs actionable health alerts based on biomarker reference ranges.

## Workflow Strategy
My process involves directing AI agents to handle boilerplate, while I personally verify:
1. Type safety and Zod schema integrity.
2. Resilience of the health-alert logic.
3. Testability of the service layer.
