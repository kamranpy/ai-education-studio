# Domain Pitfalls

**Domain:** AI-powered exam platform (SaaS)
**Researched:** 2026-04-12

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Synchronous AI Evaluation
**What goes wrong:** The platform attempts to grade written answers immediately when the student clicks "Submit".
**Why it happens:** Developers want to provide instant feedback.
**Consequences:** The LLM API takes too long, the browser connection times out, the submission is lost, and the student has to retake the exam. This destroys trust in the platform.
**Prevention:** Always use asynchronous background queues for AI evaluation. The submission should be acknowledged instantly, and grading should happen offline.
**Detection:** High error rates on the submission endpoint, user complaints about lost exams.

### Pitfall 2: Single-Tenant Architecture for a SaaS Product
**What goes wrong:** Building the application assuming only one institute will use it, then trying to retrofit multi-tenancy later.
**Why it happens:** Rushing the MVP without considering the marketplace distribution model.
**Consequences:** A massive, painful rewrite of the database schema, authentication logic, and authorization rules.
**Prevention:** Design the database and application logic with a `tenant_id` (or similar isolation mechanism) from day one.
**Detection:** Code that queries global tables without scoping to the current institute.

## Moderate Pitfalls

### Pitfall 3: Over-Engineered Proctoring
**What goes wrong:** Attempting to build a custom lockdown browser or complex facial recognition system for v1.
**Prevention:** Stick to basic, low-friction tracking (e.g., logging when the browser tab loses focus). This is sufficient for many use cases and drastically reduces technical complexity and privacy concerns.

### Pitfall 4: Hardcoded AI Prompts and Providers
**What goes wrong:** Tying the evaluation logic tightly to a specific prompt structure or a single provider (like OpenAI).
**Prevention:** Build a provider-agnostic interface and allow the buyer (the marketplace customer) to configure their own API keys and potentially adjust the evaluation prompts.

## Minor Pitfalls

### Pitfall 5: Ignoring Rate Limits
**What goes wrong:** The evaluation queue processes jobs too quickly, hitting the AI provider's rate limits and causing evaluations to fail.
**Prevention:** Implement robust retry mechanisms and rate limiting within the queue workers (e.g., using Laravel Horizon's rate limiting features).

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Exam Experience | Data loss during the exam | Implement robust auto-save functionality that writes to local storage and syncs to the server. |
| AI Integration | Unpredictable AI responses | Ensure the AI is instructed to return structured data (e.g., JSON) and validate it before saving the grade. |
| Monetization | Misaligned incentives | Ensure the pay-per-exam model covers the cost of the AI tokens used for evaluation. |

## Sources

- SaaS Development Best Practices
- Common issues with LLM integrations in production
