# Phase 4: AI Evaluation & Grading - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Evaluate submitted exam attempts end-to-end:

- Instant-grade Multiple Choice and True/False answers inside the submit transaction.
- Asynchronously grade Written Answers via a configurable LLM, recording `ai_score`, `confidence`, `explanation`.
- Provide a Super-Admin global LLM configuration surface (provider + model + credentials) with a provider-agnostic driver layer.
- Provide an Institute-Admin grading dashboard that surfaces AI output and allows manual override with audit trail.
- Provide a minimal student-side results page that becomes available once the attempt is fully graded.

**Out of scope (deferred to other phases / backlog):**
- Per-attempt billing / credit deduction → Phase 5
- Detailed analytics dashboards → Phase 6 / v2
- Token / cost usage tracking per attempt → v2 backlog (will be needed by Phase 5; capture only)
- Re-grading after rubric edits (P02 D-04 already locks exams once first attempt starts)
- Per-institute LLM keys (explicitly rejected — see D-01)

</domain>

<decisions>
## Implementation Decisions

### LLM Configuration Scope & Storage
- **D-01:** LLM provider configuration is **Super-Admin global**, NOT per-institute. The deployment owner (CodeCanyon buyer) sets one active provider+model and pays the LLM bill; institutes pay the buyer for usage in Phase 5. **AIEV-01 must be re-read as "Super Admin can configure …"** — REQUIREMENTS.md and PROJECT.md to be updated when this CONTEXT.md is committed.
- **D-02:** API keys are stored **encrypted in the database** using `Crypt::encryptString()` (Laravel built-in, AES-256-CBC keyed off `APP_KEY`). `APP_KEY` stays in `.env` and is never written to the DB, so a DB dump alone does not expose keys. Rejected the `.env`-rewrite-from-UI alternative because of host write-permission issues (Forge, managed shared hosting), OPcache / `config:cache` invalidation complexity, and lack of native audit/transactional updates.
- **D-03:** Storage layout: a dedicated `llm_settings` table holds one row per provider with columns `provider`, `model`, `api_key_ciphertext`, `base_url` (nullable, for openai-compatible), `extra` (JSON, nullable), `is_active` (only one row may be active at a time, enforced via unique partial index or app-level guard), `updated_by`, `updated_at`. A separate `llm_settings_audit` table records `who, when, field_changed` (NOT the value).

### Provider Abstraction
- **D-04:** Introduce a `LlmProvider` driver interface (e.g. `App\Services\Llm\Contracts\LlmProvider` with a `gradeWrittenAnswer(GradingPrompt $p): GradingResult` method). Built-in drivers shipped in v1:
  - `openai` — OpenAI Chat Completions (`/v1/chat/completions`)
  - `anthropic` — Anthropic Messages API (`/v1/messages`)
  - `google` — Google Gemini `generateContent`
  - `openai-compatible` — configurable `base_url` + `api_key`; single driver covers **DeepSeek, Qwen (DashScope OpenAI-compat endpoint), Mistral, Together, OpenRouter, Groq, local LM Studio / Ollama with the OpenAI-compatible shim**, and any future provider that exposes an OpenAI-shaped endpoint.
- **D-05:** Drivers resolve via a Laravel manager pattern (similar to `Filesystem` / `Mail` managers): `Llm::driver($name)`. Active driver is selected from `llm_settings` row where `is_active = true`. Adding a new dedicated driver later requires only a new class + manager registration — no migration changes.
- **D-06:** Super-Admin UI: page at `/super-admin/llm` with provider dropdown that reveals provider-specific fields (api_key, model, base_url for openai-compatible, optional org/project for OpenAI). Saved keys are never re-displayed; UI shows masked `sk-•••XYZ`; "Replace key" toggles a fresh password input. A "Test connection" button POSTs to a backend endpoint that calls the driver with a tiny canned prompt and reports success / error inline.
- **D-07:** If no provider is active when an attempt with written answers is submitted, instant grading still runs but written answers stay `pending`; the attempt status becomes `needs_review` after the job runs (no LLM available). Super-Admin sees a banner ("No active LLM provider — written answers will not be auto-graded").

### Grading Dispatch & Status Flow
- **D-08:** On `ExamAttempt` submit (existing Phase 3 controller path), inside the same DB transaction:
  - Iterate `ExamAttemptAnswer` rows.
  - For MC and TF, compute correctness against the question's correct choice / boolean and write `ai_score` (= max marks if correct, 0 if not — keep `ai_*` field naming for symmetry; rename only if it becomes confusing during planning).
  - Per-answer status set to `graded` for objective questions.
  - Attempt status moves to `grading`.
- **D-09:** Dispatch a single queued job `GradeAttemptJob(ExamAttempt $attempt)` via `dispatch(...)->afterCommit()` so it never runs against an unsaved attempt.
- **D-10:** `GradeAttemptJob` iterates written-answer rows in deterministic order, calls the active LLM driver once per answer, persists `ai_score`, `ai_confidence`, `ai_explanation`, `ai_axes` (JSON: concept/logic/terminology), and per-answer status (`graded` or `needs_review`).
- **D-11:** When the job finishes: if any answer has status `needs_review` (low confidence, parse failure, or terminal driver failure), set `ExamAttempt.status = needs_review`; else `graded`. `final_score` is a computed accessor = `override_score ?? ai_score` summed across answers.

### AI Prompt & Output Contract
- **D-12:** Prompt template (system + user message):
  - **System:** role description, JSON output schema, scoring rubric (concept / logic / terminology), instruction to refuse if input is empty / non-sensical.
  - **User:** question text, ideal-answer rubric (from P02 D-05 textarea), max marks, student answer.
- **D-13:** Output JSON schema (validated server-side):
  ```
  {
    "score": number (0..max_marks),
    "confidence": number (0..1),
    "explanation": string,
    "axes": { "concept": number (0..1), "logic": number (0..1), "terminology": number (0..1) }
  }
  ```
- **D-14:** Use the provider's structured-output / JSON mode when available — OpenAI `response_format: { type: "json_schema", ... }`, Anthropic tool-use with input schema, Gemini `responseMimeType: application/json` + `responseSchema`. For `openai-compatible` providers without strict schema support, fall back to prompt-side JSON instruction + parse + 1 retry with a "your previous response was invalid JSON; respond again with valid JSON conforming to schema X" follow-up.
- **D-15:** One LLM call per written answer (NOT batched per attempt). Rationale: keeps per-call prompts small and bounded, avoids context-length issues for long answers, isolates failures to a single answer.

### Failures, Retries, Confidence
- **D-16:** Laravel queue retries on `GradeAttemptJob`: 3 attempts with exponential backoff (10s / 30s / 90s — to be confirmed during planning based on chosen queue driver). The job is idempotent: it skips answers that already have an `ai_score` so a retry only re-grades the un-graded tail.
- **D-17:** Per-answer LLM call has its own internal retry: on HTTP 429 / 5xx / transient connection errors, retry up to 2 times within the same job attempt with short backoff before letting the outer job retry handle it.
- **D-18:** Terminal failure (3 outer attempts exhausted, parse failure after 1 in-call retry, or empty / refused response) → answer status `needs_review`, no `ai_score` written, `ai_explanation` captures error message internally (NOT exposed to student).
- **D-19:** Confidence threshold: `confidence < 0.7` → answer flagged `needs_review` even when a score was recorded. Score still surfaces to admin alongside the flag.

### Admin Override UI & Audit Trail
- **D-20:** New Institute-Admin pages:
  - `/admin/exams/{exam}/attempts` — list attempts with student name, submitted-at, status badge (`grading` / `graded` / `needs_review`), final score.
  - `/admin/exams/{exam}/attempts/{attempt}` — drill-in showing per-question table. Written answers display `ai_score`, `confidence`, `explanation`, `axes`. An override input (numeric within 0..max_marks) and a comment textarea allow admin to override.
- **D-21:** Schema: `exam_attempt_answers` gains nullable `override_score`, `override_comment`, `overridden_by` (FK users), `overridden_at`. `ai_*` columns are immutable once written. `final_score` is a computed accessor: `override_score ?? ai_score`.
- **D-22:** Audit log: row-level `exam_attempt_answer_overrides` table records every override mutation (`answer_id`, `from_score`, `to_score`, `comment`, `actor_id`, `created_at`) so a full change history exists even if admin overrides multiple times.
- **D-23:** Admins can ALSO set the per-answer status from `needs_review` back to `graded` (e.g., they reviewed and accepted the AI score) without entering an override; this is a separate "Mark reviewed" action that flips status only.

### Student-side Results Visibility (default — easy to revise)
- **D-24:** Once `ExamAttempt.status` reaches `graded` (NOT `needs_review`), the student's results page becomes available automatically. No manual "release" gate in v1 — keeps the surface area small. If the attempt is `needs_review`, student sees "Your exam is being reviewed" banner.
- **D-25:** Student results page shows: per-question result, student's answer, `final_score`, total. **AI `explanation` is hidden from students in v1** (admin-only) to avoid arguments about AI reasoning that the buyer hasn't vetted.

### Folded Todos
- None — `STATE.md` had only "Plan Phase 4" which IS this scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Project
- `.planning/REQUIREMENTS.md` — AIEV-01 … AIEV-06, TEST-01, DOCS-01. **Note:** AIEV-01 wording will be updated to "Super Admin can configure …" as part of this phase's commit.
- `.planning/PROJECT.md` — Async AI evaluation, optional human override, provider-agnostic LLM constraint, multi-tenant invariant. **Note:** "Active" item "Dynamic AI model configuration via the admin panel" should be reworded to "via the **super admin** panel" when context is committed.

### Prior Phase Context (locked decisions still in force)
- `.planning/phases/01-foundation-multi-tenancy/01-CONTEXT.md` — Distinct React layouts per role (Super Admin layout will be needed here), `shadcn/ui` standard.
- `.planning/phases/02-user-management-exam-creation/02-CONTEXT.md` — **D-04** soft-publish (exam structure locks once first attempt starts; relevant to grade-stability), **D-05** "Grading Guidelines / Ideal Answer" textarea per written question (this is the rubric this phase consumes).
- `.planning/phases/03-student-exam-experience/03-CONTEXT.md` — `ExamAttempt` and `ExamAttemptAnswer` models; auto-submit on expiry path; this phase hooks into the existing submit controller.

### Codebase
- `.planning/codebase/ARCHITECTURE.md` — Inertia + React monolith, Wayfinder typed routes, controller / Action layering.
- `.planning/codebase/CONVENTIONS.md` — kebab-case React filenames, Pint for PHP, Prettier for TS, named exports.
- `.planning/codebase/STACK.md` — Laravel 13, PHP 8.3, queues via Laravel queue (driver to be confirmed during planning).

### External Provider Docs (research phase to consult)
- OpenAI Chat Completions + Structured Outputs (`response_format: json_schema`).
- Anthropic Messages API + Tool Use schema.
- Google Gemini `generateContent` + `responseMimeType: application/json`.
- OpenAI-compatible target endpoints to confirm at planning time: DeepSeek, Qwen DashScope, Mistral, Together, OpenRouter, Groq, Ollama / LM Studio.

### Documentation
- `INTEGRATION_GUIDE.md` (DOCS-01) — must gain endpoints for super-admin LLM config, attempt grading status, and override.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExamAttempt`, `ExamAttemptAnswer` models from Phase 3 — extend with `ai_score`, `ai_confidence`, `ai_explanation`, `ai_axes`, `override_score`, `override_comment`, `overridden_by`, `overridden_at`, per-answer `status`.
- `ExamAttemptController::update()` (submit path) from Phase 3 — extend with instant grading + `GradeAttemptJob::dispatch()->afterCommit()`.
- `EnsureInstituteAdmin` middleware (P02) — gate `/admin/exams/{exam}/attempts*`.
- `shadcn/ui` components — reuse for the Super-Admin LLM config form, masked-key field pattern, attempt list / drill-in tables, override form.
- Laravel Wayfinder — typed routes for new admin and super-admin endpoints.
- `Crypt` facade — for API key encryption / decryption. Do NOT roll a custom cipher.

### Established Patterns
- Multi-tenant `HasInstitute` global scope: applies to attempt list / drill-in (institute admin only sees their own exams). Super-Admin LLM settings is a global table — no tenant scope.
- After-commit job dispatch: already used elsewhere; keep using `dispatch(...)->afterCommit()`.
- Inertia flash toasts on success / error from controllers.

### Integration Points
- New routes: `super-admin.llm.*` (index, update, test) and `admin.exams.attempts.*` (index, show, override, mark-reviewed).
- New job: `App\Jobs\GradeAttemptJob`.
- New service namespace: `App\Services\Llm` (manager, drivers, prompt builder, response validator).
- New super-admin layout (if not already present) — confirm during planning whether Phase 1 already shipped one or if it needs creation.

</code_context>

<specifics>
## Specific Ideas

- The `openai-compatible` driver is intentionally the catch-all for the long tail of providers (DeepSeek, Qwen DashScope OpenAI-compat, Together, OpenRouter, local LM Studio / Ollama, future entrants). Buyers can switch between providers freely without code changes — only credentials + base_url change in the Super-Admin UI.
- API key UI must NEVER re-display the stored key. Show masked `sk-•••XYZ`, require explicit "Replace key" toggle to reveal a fresh input.
- Test-connection button is mandatory — it's the single feature that makes the whole "swap providers without code" promise feel safe.
- All `ai_*` columns are write-once / immutable from controllers (only the job writes them); admin override goes to separate `override_*` columns. This preserves the AI's original output for audit.
- **CSV Export**: The Attempts List will include a "Download CSV" action (added post-planning) to allow Institute Admins to export all candidates and their results for a specific exam as an easy offline report format before Phase 6 analytics arrive.

</specifics>

<deferred>
## Deferred Ideas

- **Token / cost usage tracking per attempt** — needed by Phase 5 billing. Capture as backlog now; design minimally (`tokens_in`, `tokens_out`, `cost_usd`) when Phase 5 is planned.
- **Manual "Release results" gate per exam** — v1 auto-releases on `graded` status. Add an admin toggle in v2 if instructors want to review before students see scores.
- **Re-grade after rubric edit** — blocked by P02 D-04 anyway. Revisit if the rubric-edit lock is loosened.
- **Showing AI explanation to students** — hidden in v1 to avoid arguments about un-vetted AI reasoning. Could be opt-in per institute in v2.
- **Per-institute LLM key override** — explicitly rejected (see D-01). If a future buyer needs it, it's a v2 feature, not a workaround.
- **Multi-language grading prompts** — defer to v2; v1 prompts are English.
- **Streaming responses / partial updates to admin** — overkill for batch grading; defer.

</deferred>

---

*Phase: 04-ai-evaluation-and-grading*
*Context gathered: 2026-04-26*
