# Project Research Summary

**Project:** AI Education Studio
**Domain:** AI-powered exam platform (SaaS)
**Researched:** 2026-04-12
**Confidence:** HIGH

## Executive Summary

The AI Education Studio is a multi-tenant B2B SaaS platform designed to deliver and evaluate exams using asynchronous AI processing. Experts build these platforms using robust backend frameworks capable of handling complex queues and multi-tenancy, paired with reactive frontends for a seamless student experience.

The recommended approach is a monolithic web application utilizing Laravel 11.x for its built-in queue management and multi-tenancy support, combined with React 18.x and Inertia.js to rapidly build a monolithic SPA without a separate API. The core value proposition is provider-agnostic, asynchronous AI grading that evaluates written answers based on concepts rather than just keywords.

The key risks involve synchronous AI calls leading to timeouts and data loss, and failing to design for multi-tenancy from day one. These are mitigated by enforcing asynchronous background queues for all AI interactions and implementing a strict `tenant_id` isolation strategy at the database level from the project's inception.

## Key Findings

### Recommended Stack

The platform relies on a robust PHP/Node.js infrastructure, utilizing Laravel for backend logic and React/Inertia for the frontend. PostgreSQL serves as the primary data store, essential for multi-tenant schemas, while Redis manages the critical asynchronous AI evaluation queues.

**Core technologies:**
- Laravel 11.x: Backend API & Routing — Robust ecosystem, excellent queue management, built-in multi-tenancy support.
- React 18.x & Inertia.js: Frontend UI — Component-based architecture, eliminates the need for a separate API.
- PostgreSQL 16.x: Primary Data Store — Reliable, supports JSONB, excellent for multi-tenant schemas.
- Redis 7.x: Queue & Cache — Essential for managing asynchronous AI evaluation jobs.

### Expected Features

**Must have (table stakes):**
- Multi-tenant architecture — Standard for any B2B SaaS platform.
- Role-based access control — Essential for security and workflow separation.
- Exam creation & Student exam experience — Core functionality with auto-save and timers.
- Basic anti-cheat — Logging tab/window switching to maintain basic integrity.

**Should have (competitive):**
- Async AI evaluation — Automates grading of written answers based on concepts.
- Dynamic AI model configuration — Allows buyers to control costs and choose their preferred LLM.
- Pay-per-exam monetization — Aligns platform costs with revenue.
- Teacher override — Builds trust in AI grading.

**Defer (v2+):**
- Generative AI Content Creation — Auto-generating questions.
- Native Mobile App — Web-first is sufficient for validation.
- Strict lockdown proctoring — High technical complexity and friction.

### Architecture Approach

The architecture follows a multi-tenant, monolithic pattern with a strong emphasis on asynchronous job processing.

**Major components:**
1. Tenant Manager — Isolates data and configuration per institute.
2. Exam Engine — Handles exam creation, delivery, and basic anti-cheat tracking.
3. Evaluation Queue — Manages asynchronous AI grading requests via external APIs.
4. Billing Module — Manages pay-per-exam credits and subscriptions.

### Critical Pitfalls

1. **Synchronous AI Evaluation** — Always use asynchronous background queues for AI evaluation to prevent browser timeouts and data loss.
2. **Single-Tenant Architecture** — Design the database and application logic with a `tenant_id` from day one to avoid massive rewrites.
3. **Over-Engineered Proctoring** — Stick to basic, low-friction tracking (e.g., tab focus) for v1 to reduce complexity.
4. **Hardcoded AI Prompts and Providers** — Build a provider-agnostic interface allowing buyers to configure their own API keys.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Multi-Tenancy
**Rationale:** Multi-tenancy and RBAC are foundational and must be implemented before any domain logic to avoid retrofitting.
**Delivers:** Core application skeleton, tenant isolation, and user roles (Admin, Student).
**Addresses:** Multi-tenant architecture, Role-based access control.
**Avoids:** Single-Tenant Architecture for a SaaS Product.

### Phase 2: Exam Engine & Delivery
**Rationale:** Core domain functionality required before AI can evaluate anything.
**Delivers:** Exam creation interface, student taking experience with auto-save, and basic anti-cheat.
**Uses:** React, Inertia.js, PostgreSQL JSONB.
**Implements:** Exam Engine component.

### Phase 3: Async AI Evaluation & Configuration
**Rationale:** The core differentiator, dependent on the Exam Engine existing.
**Delivers:** Provider-agnostic AI integration, background evaluation queues, and dynamic model configuration.
**Addresses:** Async AI evaluation, Dynamic AI model configuration.
**Avoids:** Synchronous AI Evaluation, Hardcoded AI Prompts and Providers.

### Phase 4: Monetization & Billing
**Rationale:** Required for the business model, relies on tenant structure and exam completion metrics.
**Delivers:** Pay-per-exam credit system and Stripe integration.
**Addresses:** Pay-per-exam monetization.
**Avoids:** Misaligned incentives.

### Phase 5: Review & Analytics (Optional v1.x)
**Rationale:** Enhances trust and provides value after exams are completed.
**Delivers:** Teacher override capabilities and basic performance dashboards.
**Addresses:** Teacher override, Performance analytics.

### Phase Ordering Rationale

- Foundation must come first because retrofitting multi-tenancy is a critical pitfall.
- Exam Engine precedes AI Evaluation because the AI needs actual submissions to grade.
- Monetization follows core functionality to ensure the value proposition is solid before billing.
- This structure strictly adheres to the dependency graph: Multi-tenant -> Exam Engine -> Async AI -> Monetization.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Complex integration, needs specific research on AI provider SDKs and prompt engineering for grading rubrics.
- **Phase 4:** Needs specific research on Stripe integration for a credit-based, pay-per-exam model within a multi-tenant setup.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Well-documented Laravel multi-tenancy patterns.
- **Phase 2:** Standard CRUD and React state management.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on official Laravel/Inertia documentation and standard SaaS practices. |
| Features | HIGH | Clear consensus on table stakes vs. differentiators for AI ed-tech. |
| Architecture | HIGH | Standard asynchronous queue patterns are well-established for LLM integrations. |
| Pitfalls | HIGH | Common issues with LLM integrations and SaaS multi-tenancy are well-documented. |

**Overall confidence:** HIGH

### Gaps to Address

- Prompt Engineering: Specific prompt structures for accurate AI grading need validation during implementation.
- Rate Limit Handling: Exact rate limit strategies for different AI providers need to be defined during Phase 3 planning.

## Sources

### Primary (HIGH confidence)
- Project Context (`.planning/PROJECT.md`)
- Laravel Documentation — Queues, Interfaces
- Inertia.js Documentation

### Secondary (MEDIUM confidence)
- Web Search: "AI-powered exam platform features 2026"
- Web Search: "SaaS exam platform features 2026"
- Standard SaaS Architecture Patterns

### Tertiary (LOW confidence)
- Common issues with LLM integrations in production

---
*Research completed: 2026-04-12*
*Ready for roadmap: yes*
