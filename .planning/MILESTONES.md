# Milestones

## v1.0 MVP (Shipped: 2026-05-09)

**Timeline:** 2026-04-12 → 2026-05-09 (27 days)
**Phases:** 7 | **Plans:** 25 | **Tasks:** 38

### What Was Shipped

- Multi-tenant SaaS foundation — single-database tenancy via `InstituteScope` global scope with role-based access (Super Admin, Institute Admin, Student)
- Full exam lifecycle — create/publish exams with MCQ, True/False, and Written Answer question types via a dynamic tabbed builder
- Student exam experience — server-enforced countdown timer, auto-save, resume on disconnect, question randomization, and basic anti-cheat tab tracking
- AI evaluation pipeline — async written answer grading via configurable LLM providers (OpenAI, Anthropic, Google, OpenAI-compatible), instant MC/TF grading, manual override, confidence-based flagging
- Exam creation enhancements — class/subject fields, evaluation strategy (instant vs manual release), sectional submission locking, student results history
- Monetization & billing — Stripe-powered credit packages, atomic credit deduction at exam start, zero-credit blocking, webhook idempotency
- Super Admin panel — institute oversight (suspend/activate/delete/adjust credits), global analytics dashboard with range filtering, encrypted Stripe key management, global transaction log

### Stats

- Git range: `22a3190` (Phase 1) → `0761746` (Phase 6)
- Phase branches: `v1/phase-1` through `v1/phase-6`

---
