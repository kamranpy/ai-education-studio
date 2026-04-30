# Phase 4: AI Evaluation & Grading - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `04-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 04-ai-evaluation-and-grading
**Areas discussed:** LLM provider configuration & key storage; (Areas 2, 3, 4 resolved with recommended defaults — no Q&A)

---

## LLM Provider Configuration & Key Storage

### Question 1: Configuration scope (per-institute vs global)

The original plan, drawn from PROJECT.md / AIEV-01, was per-institute LLM configuration. The user redirected this during discussion:

> "I will only be setting the key as a super admin, because I am charging the institutes for the services, therefore they don't need to provide their own AI model."

| Option | Description | Selected |
|--------|-------------|----------|
| Per-institute | Each institute admin configures their own provider + key (original wording of AIEV-01) | |
| Super-Admin global | The deployment owner sets one provider + key; institutes consume it and pay for usage (Phase 5 billing) | ✓ |
| Hybrid | Global default with per-institute override | |

**User's choice:** Super-Admin global.
**Notes:** Aligns with the CodeCanyon-script business model — buyer absorbs LLM cost and bills institutes per attempt. AIEV-01 wording in REQUIREMENTS.md / PROJECT.md will be updated to reflect "Super Admin can configure …".

---

### Question 2: API key storage mechanism

User proposed storing keys only in `.env`, edited from a Super-Admin panel, "this is the most secure way I could think of, if you have any better way do let me know."

| Option | Description | Selected |
|--------|-------------|----------|
| A — `.env`-only, panel rewrites the file | Plaintext key never touches DB. Standard Laravel `config()` access. Risks: PHP-FPM write permission on `.env` (fails on Forge / managed hosts), `config:cache` / OPcache invalidation complexity, no native audit / transactional updates, single-file failure mode if the editor mis-writes. | |
| B — Encrypted in DB via `Crypt::encryptString()` keyed off `APP_KEY` | DB dump alone is useless without `APP_KEY` (which stays in `.env` and never in DB) — same threat model as A. Fixes A's host-compatibility, audit, and OPcache problems. Standard Laravel pattern. | ✓ |
| C — Encrypted file at `storage/app/private/llm-config.json` | Same threat model as B, file-based instead of DB. No real advantage over B. | |

**User's choice:** B (recommended).
**Notes:** User said "go with the recommended settings." A `settings`-style table stores ciphertext; `APP_KEY` remains in `.env`; UI never re-displays the key (masked `sk-•••XYZ` with explicit "Replace key" action); separate `llm_settings_audit` table records who/when/field (NOT the value).

---

### Question 3: Provider drivers shipped in v1

User asked for broad provider support:

> "I would like to have google ai, qwen ai, deepseek, and many options, giving the buyers more authority to choose their preferred ai and frequently change it based on availability."

| Option | Description | Selected |
|--------|-------------|----------|
| Single OpenAI driver only, others added later | Smallest v1 surface | |
| Three named drivers: OpenAI, Anthropic, Google + a generic `openai-compatible` for the long tail | OpenAI-compatible covers DeepSeek, Qwen via DashScope OpenAI-compat, Mistral, Together, OpenRouter, Groq, Ollama, LM Studio with zero code per provider; named drivers exist where the API shape genuinely differs (Anthropic Messages, Gemini `generateContent`) | ✓ |
| Per-vendor named driver for every provider | Maximum control, maximum maintenance burden, no real benefit when many providers already speak the OpenAI shape | |

**User's choice:** Implicitly accepted by going with recommended.
**Notes:** Driver layer is an interface (`LlmProvider`) resolved via a Laravel manager pattern. Adding a new dedicated driver later is a class + registration — no migration needed. This is what makes "buyers can frequently change provider based on availability" cheap.

---

## Areas resolved with recommended defaults (no per-question Q&A)

User said: "go with the recommended settings."

### Grading Dispatch & Status Flow
Recommended path locked: instant grade MC/TF inside submit transaction, dispatch one queued `GradeAttemptJob` via `afterCommit()`, status moves submitted → grading → graded / needs_review. See `04-CONTEXT.md` D-08 … D-11.

### AI Prompt & Output Contract
Recommended path locked: structured JSON `{score, confidence, explanation, axes}`, provider-native JSON mode where available, prompt-side JSON instruction + 1 retry for `openai-compatible`. One LLM call per written answer. See D-12 … D-15.

### Failures, Retries, Confidence
Recommended path locked: 3 outer queue retries with backoff, 2 inner per-call retries on transient errors, terminal failure → `needs_review`, confidence < 0.7 → flag. See D-16 … D-19.

### Admin Override UI & Audit
Recommended path locked: `/admin/exams/{exam}/attempts` list and drill-in, immutable `ai_*` columns, nullable `override_*` columns, row-level `exam_attempt_answer_overrides` audit table, `final_score = override_score ?? ai_score`. See D-20 … D-23.

---

## Claude's Discretion

- Exact backoff timings (10s / 30s / 90s) — to be confirmed during planning based on chosen queue driver.
- Whether the Super-Admin layout / shell already exists from earlier phases (audit during planning; create if needed).
- Whether `is_active` is enforced via partial unique index (Postgres) vs application guard (MySQL) — DB-driver dependent.

## Deferred Ideas

- Token / cost usage tracking per attempt (Phase 5 needs it; capture as v2 backlog now).
- Manual "Release results" gate per exam (v2).
- Showing AI explanation to students (hidden in v1).
- Re-grade after rubric edit (blocked by P02 D-04).
- Per-institute LLM key override (explicitly rejected).
- Multi-language grading prompts (v2).
- Streaming partial admin updates during grading (v2).

## Open Default to Confirm

- **D-24 (Student-side results visibility):** Not on the original menu. Default chosen: results auto-release once `ExamAttempt.status = graded`; `needs_review` shows a "being reviewed" banner; AI `explanation` hidden from students (admin-only). Easy to revise during planning if you'd rather gate behind a manual release toggle or expose the explanation.
