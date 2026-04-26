---
phase: 4
slug: ai-evaluation-and-grading
status: draft
shadcn_initialized: true
preset: new-york
created: 2026-04-26
---

# Phase 4 — UI Design Contract

> Visual and interaction contract for AI Evaluation & Grading. Inherits the design system established in Phase 1; adds only the new surfaces this phase introduces.

---

## Surface Inventory

| # | Surface | Route | Audience | New? |
|---|---------|-------|----------|------|
| 1 | LLM Provider Settings | `/super-admin/llm` | Super Admin only | New |
| 2 | LLM Audit Log (drawer) | within surface 1 | Super Admin only | New |
| 3 | Exam Attempts List | `/admin/exams/{exam}/attempts` | Institute Admin | New |
| 4 | Attempt Drill-In + Override | `/admin/exams/{exam}/attempts/{attempt}` | Institute Admin | New |
| 5 | Student Results Page | `/student/exams/{exam}/attempts/{attempt}` | Student (own attempts only) | New |
| 6 | Submission "Grading" Interstitial | post-submit redirect on existing exam-take page | Student | New |

All routes are typed via Wayfinder. Tenant scope (`HasInstitute`) applies to surfaces 3-6; surface 1-2 are global super-admin.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (already initialized — `components.json` confirmed) |
| Preset | new-york |
| Component library | Radix (via shadcn) |
| Icon library | lucide-react |
| Font | Instrument Sans (already loaded via `@theme` in `resources/css/app.css`) |
| Color tokens | OKLCH variables in `:root` and `.dark` — **DO NOT add new color tokens this phase** |
| Border radius | `--radius: 0.625rem` (already set; lg = 0.625rem, md = 0.5rem, sm = 0.375rem) |
| Dark mode | Already wired via `@custom-variant dark (&:is(.dark *))` |

**Inheritance rule:** Every surface MUST use existing CSS variables. No `bg-blue-500`, no raw hex, no inline `style={{ color: '#abc' }}`. Use `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, etc.

---

## Spacing Scale

Tailwind 4 spacing unit is `0.25rem` = 4px (multiples-of-4 invariant satisfied).

| Token | Tailwind class | Value | Usage in this phase |
|-------|----------------|-------|---------------------|
| xs | `gap-1` / `p-1` | 4px | Icon-to-text gap inside badges and buttons |
| sm | `gap-2` / `p-2` | 8px | Compact element spacing (badge internals, table cell padding) |
| md | `gap-4` / `p-4` | 16px | Default form field spacing, card body padding |
| lg | `gap-6` / `p-6` | 24px | Section padding within cards (LLM settings sections) |
| xl | `gap-8` / `p-8` | 32px | Page-shell vertical rhythm between cards |
| 2xl | `gap-12` / `py-12` | 48px | Major page-section breaks (rare) |
| 3xl | `gap-16` / `py-16` | 64px | Empty-state vertical centering |

Page container: `mx-auto max-w-5xl px-4 py-8` for super-admin LLM and admin attempts list. Drill-in uses `max-w-6xl`. Student results uses `max-w-3xl` (single-column reading flow).

Exceptions: none.

---

## Typography

Inherits Instrument Sans across all weights. Scale aligns with Tailwind defaults (no custom sizes).

| Role | Tailwind class | Size / Weight / Leading | Usage |
|------|----------------|-------------------------|-------|
| Display | `text-3xl font-semibold tracking-tight` | 30px / 600 / 1.2 | Page titles ("LLM Provider Settings", "Exam Attempts") |
| Heading | `text-xl font-semibold` | 20px / 600 / 1.4 | Card titles (`CardTitle`) |
| Subheading | `text-base font-medium` | 16px / 500 / 1.5 | Section labels inside cards |
| Body | `text-sm` | 14px / 400 / 1.5 | Default for forms, tables, descriptions |
| Body-strong | `text-sm font-medium` | 14px / 500 / 1.5 | Table column headers, form labels (`Label` component) |
| Caption | `text-xs text-muted-foreground` | 12px / 400 / 1.5 | Helper text under inputs, audit-log timestamps, "Last graded by …" |
| Mono | `font-mono text-xs` | 12px monospaced | API key mask (`sk-•••XYZ`), model names (`gpt-4o-2024-08-06`), token counts |

**Reading width cap:** AI explanation text and student answer rendering use `max-w-prose` (~65ch) for legibility.

---

## Color

All values inherit `:root` / `.dark` variables. Application of the 60/30/10 rule:

| Role | Token | Usage in this phase |
|------|-------|---------------------|
| Dominant (60%) | `--background` / `bg-background` | Page background |
| Secondary (30%) | `--card`, `--secondary`, `--muted` | Cards, table rows, sidebar (existing), badge backgrounds |
| Accent (10%) | `--primary` (`bg-primary text-primary-foreground`) | **Reserved for:** the single primary CTA per surface (Save / Override / Submit). No accent on table rows, no accent borders, no accent backgrounds elsewhere. |
| Destructive | `--destructive` / `bg-destructive text-destructive-foreground` | Destructive confirmations only (Deactivate provider, Delete override) |

**Status badge palette** — uses existing tokens, no new colors:

| Status | Background | Foreground | Variant |
|--------|------------|------------|---------|
| `pending` | `bg-muted` | `text-muted-foreground` | shadcn `Badge variant="secondary"` |
| `grading` | `bg-muted` | `text-foreground` + spinner icon | `secondary` + `Loader2` icon `animate-spin` |
| `graded` | `bg-secondary` | `text-secondary-foreground` | `secondary` |
| `needs_review` | `bg-destructive/10` | `text-destructive` | custom subtle variant — uses opacity modifier on existing token, no new color |
| `failed` (terminal) | `bg-destructive/10` | `text-destructive` | same as `needs_review` with `AlertTriangle` icon |

**Confidence indicator** (in attempt drill-in, beside written-answer score):
- ≥ 0.85 → `text-foreground` no decoration
- 0.70–0.84 → `text-muted-foreground` with `Info` icon
- < 0.70 → `text-destructive` with `AlertTriangle` icon and `needs_review` badge

This is the only place the destructive token is used outside of confirmations — and it carries a literal warning meaning, not just decoration.

Accent reserved for: primary CTA buttons only (`<Button>` default variant). Explicit list:
- Surface 1: "Save settings" (single primary), "Test connection" is `variant="secondary"`
- Surface 4: "Save override" (single primary per row), "Mark reviewed" is `variant="ghost"`
- Surface 5: "Back to exams" is `variant="link"` (no accent)

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| **Surface 1 — LLM Settings** | |
| Page title | `LLM Provider Settings` |
| Page subtitle | `Configure the AI model used to grade written answers across all institutes.` |
| Primary CTA | `Save settings` |
| Secondary CTA | `Test connection` |
| Provider dropdown label | `Provider` |
| Model field label | `Model` |
| API key field label | `API key` |
| API key placeholder (saved state) | `sk-•••XYZ — click Replace to change` |
| Replace key button | `Replace key` |
| Base URL field label (only when provider = openai-compatible) | `Base URL` |
| Base URL helper | `Used for OpenAI-compatible providers (DeepSeek, Qwen, Together, OpenRouter, Groq, Ollama, …).` |
| Test success toast | `Connection successful — model responded in {ms}ms.` |
| Test failure toast | `Connection failed: {error}. Check your API key, model name, and base URL.` |
| Save success toast | `LLM settings saved. New gradings will use this configuration.` |
| Empty state heading | `No LLM provider configured` |
| Empty state body | `Written answers won't be auto-graded until you set up a provider. Choose one above to get started.` |
| Audit log section heading | `Recent changes` |
| Audit log row template | `{actor name} updated {field} — {relative time}` |
| Activate confirmation | `Activate {provider}: This will deactivate the current provider and route all new gradings through {provider}.` |
| **Surface 3 — Attempts List** | |
| Page title | `Attempts — {exam title}` |
| Page subtitle | `{count} student attempts` |
| Empty state heading | `No attempts yet` |
| Empty state body | `Once students submit this exam, their attempts and AI grades will appear here.` |
| Column headers | `Student`, `Submitted`, `Status`, `Score`, `` (actions) |
| Row action | `Review` (text link, not button) |
| Header action | `Download CSV` |
| Filter (status) | `All`, `Grading`, `Needs review`, `Graded` |
| **Surface 4 — Attempt Drill-In** | |
| Page title | `{Student name} — {exam title}` |
| Page subtitle | `Submitted {date} · Final score {final}/{total}` |
| Section heading per question | `Question {n} of {N}` |
| AI block label | `AI grading` |
| Confidence label | `Confidence: {0.00}` |
| Explanation label | `Explanation` |
| Axes labels | `Concept`, `Logic`, `Terminology` |
| Override input label | `Override score` |
| Override input helper | `Leave blank to keep AI score. Range 0–{max_marks}.` |
| Override comment label | `Note (optional)` |
| Override comment placeholder | `Why are you overriding this grade?` |
| Save override CTA | `Save override` |
| Save override success | `Override saved. Final score updated.` |
| Mark reviewed action | `Mark reviewed` |
| Mark reviewed success | `Marked as reviewed — kept AI score of {score}.` |
| Provider/model footer per answer | `Graded by {provider} · {model} · {tokens_in}/{tokens_out} tokens` (font-mono, caption size) |
| Re-grade action | `Re-grade with AI` |
| Re-grade confirmation | `Re-grade question {n}: This will discard the current AI score and request a new evaluation. Existing overrides will be kept.` |
| Status banner — `grading` | `Grading in progress — written answers usually take under a minute.` (with spinner) |
| Status banner — `needs_review` | `{n} answer(s) need your review.` |
| Status banner — `failed` | `One or more answers failed to grade. Check the LLM provider settings and re-grade individual answers.` |
| **Surface 5 — Student Results** | |
| Page title | `Your results — {exam title}` |
| Page subtitle (graded) | `Submitted {date} · Score {final}/{total}` |
| Pending banner (`needs_review`) | `Your exam is being reviewed. We'll let you know once your final grade is ready.` |
| Pending banner (`grading`) | `We're grading your written answers. This usually takes under a minute — check back shortly.` |
| Per-question heading | `Question {n}` |
| Per-question score row | `Score {final}/{max}` |
| Correct indicator | `Correct` (with `CheckCircle2` icon, `text-foreground`) |
| Incorrect indicator | `Incorrect` (with `XCircle` icon, `text-muted-foreground`) |
| Written-answer score row | `Score {final}/{max}` (no AI explanation shown — admin only per CONTEXT D-25) |
| Empty answer note | `(no answer submitted)` |
| Footer link | `Back to exams` |
| **Surface 6 — Submission Interstitial** | |
| Heading | `Exam submitted` |
| Body | `We're grading your answers now. Your results will appear in a moment.` |
| Skeleton CTA | `View results` (disabled until status leaves `grading`; auto-enables on poll or refresh) |
| **Destructive confirmations** | |
| Deactivate provider | `Deactivate {provider}: New gradings will fail until another provider is activated. This does not affect existing graded attempts.` |
| Delete override | `Remove override: The grade will revert to the AI score of {ai_score}. The override history will still be visible in the audit log.` |

**Tone rules:**
- Address admins as peers ("Save settings", not "Click here to save your changes!").
- Address students reassuringly when they're waiting ("under a minute", not "please wait").
- Errors always pair *problem* + *solution path* (e.g., "Connection failed: invalid API key. Check your API key, model name, and base URL.").
- Never mention "AI", "LLM", or model names to students. Refer to the grading process as just "grading".
- Admin-side, "AI" is fine because admins need to know what graded the answer.

---

## Component Mapping

All components from `@/components/ui` (already installed via shadcn/ui).

| Surface | Components used |
|---------|----------------|
| 1 — LLM Settings | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Form`, `Input`, `Label`, `Select`, `Button`, `Badge`, `Sheet` (audit log drawer), `AlertDialog` (deactivate), `Skeleton` |
| 3 — Attempts List | `Card`, `Table`, `TableHeader`, `TableRow`, `TableCell`, `Badge`, `Tabs` (status filter), `Input` (search), `Skeleton`, empty state via `Card` |
| 4 — Attempt Drill-In | `Card`, `Collapsible` (per-question — consistent with P02 D-04 pattern), `Badge`, `Input`, `Textarea`, `Button`, `Tooltip` (axes hover), `Separator`, `AlertDialog` (re-grade / remove override), `Toast` |
| 5 — Student Results | `Card`, `Separator`, `Badge`, `Alert` (pending banner) |
| 6 — Interstitial | `Card`, `Skeleton`, `Loader2` icon |

**Status icon set** (lucide-react):
- `Loader2` (`animate-spin`) — grading
- `CheckCircle2` — graded / correct
- `AlertTriangle` — needs_review / low confidence
- `XCircle` — incorrect / failed
- `Info` — medium confidence
- `RotateCw` — re-grade action
- `Eye` / `EyeOff` — show/hide API key in input
- `KeyRound` — API key icon
- `Server` — provider/base-url section icon

---

## Interaction Patterns

### LLM API key field (Surface 1)
- **First save:** plain `<Input type="password">` with `Eye` toggle to show.
- **After save:** input is replaced by a read-only display showing `sk-•••XYZ` (last 3 chars only) plus a `Replace key` button. Clicking `Replace key` swaps in the password input again.
- The actual key is **never** sent to the client after save (`$hidden` in the model). Backend exposes only `last4` (or `last3`) for the mask.

### Test-connection button (Surface 1)
- Disabled while saving.
- On click, sends *current form values* (potentially unsaved) to a `POST /super-admin/llm/test` endpoint that runs a 1-token ping using a cheap model. Result shown as toast.
- Rate-limited 5/min/super-admin (research §C.8).

### Override input (Surface 4)
- Numeric input clamped to `[0, max_marks]` via `min` / `max` / `step="0.5"` plus client-side guard.
- Comment is optional but encouraged. Saving without a comment is allowed, but if comment is empty AND override differs from `ai_score` by > 30%, show inline helper: `Consider explaining the override for future audits.` (non-blocking).
- Save uses Inertia `useForm` with optimistic disable; success flashes a toast + updates `final_score` in place without a page reload.

### Status polling (Surfaces 4, 5, 6)
- When attempt status is `grading`, poll the page every 5 seconds via Inertia `router.reload({ only: ['attempt'] })`.
- Stop polling once status leaves `grading`.
- Surface 6 (submission interstitial) is just Surface 5 in `grading` state — same component, same polling.

### Audit log drawer (Surface 1)
- Triggered by a `View audit log` button on the LLM settings card.
- `Sheet` slides in from right; lists `actor · field · time` rows.
- No value column (security — research §C and CONTEXT D-05).

### Empty states
- Centered vertically within their container, max-width `prose`, single illustration icon (lucide outline, `text-muted-foreground`, 48px), heading + body, and a single CTA when actionable.
- Never use accent color in empty states.

---

## Layout Notes

- **Super-admin layout** — `SuperAdmin/Dashboard.tsx` already exists; surface 1 nests under the same shell. If a super-admin sidebar nav item doesn't exist yet, planner adds one labeled `LLM Provider` (icon: `Sparkles` or `Bot` from lucide).
- **Admin attempts list and drill-in** — nested under existing `Admin/Exams/Show.tsx` breadcrumb. Add a `Attempts ({count})` link to the exam detail page header.
- **Student results** — student layout already exists from Phase 3. Results page replaces the exam-take page on the same route family but with a different status path; planner confirms route shape during planning.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `Card`, `Form`, `Input`, `Label`, `Select`, `Button`, `Badge`, `Table`, `Tabs`, `Textarea`, `Tooltip`, `Separator`, `Skeleton`, `Collapsible`, `AlertDialog`, `Sheet`, `Toast`/`Sonner`, `Alert` | not required |
| third-party | none | n/a |

**Rule for executors:** No third-party shadcn registries. No copy-paste components from external sites. If a needed primitive isn't in the official shadcn registry or already in `@/components/ui`, escalate to the user before adding.

---

## Accessibility

- All status badges include both color and icon — color is never the only signal.
- All form fields use `<Label>` with `htmlFor`; inputs have associated `aria-describedby` for helper text.
- Override input announces clamped range via `aria-label="Score 0 to {max_marks}"`.
- Status banners use `role="status"` (polite for `grading`, `assertive` for `failed`/`needs_review`).
- Polling pauses when the tab is hidden (`document.visibilityState === 'hidden'`) to avoid wasting cycles.
- Confidence indicator's `text-destructive` always pairs with `AlertTriangle` icon — meets WCAG 1.4.1 (use of color).

---

## Out of Scope

- No charts in this phase (chart-1..5 tokens stay unused). Phase 6 analytics dashboard will exercise them.
- No data viz for tokens or cost — capture in DB only. Visualization belongs to Phase 5.
- No dark-mode-only assets — palette already covers both modes.
- No email templates (the "your results are ready" notification is deferred to a follow-up phase if needed).

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — every CTA is verb+noun specific; all error copy pairs problem with solution path; tone rules explicit.
- [x] Dimension 2 Visuals: PASS — surface inventory complete; component mapping per surface; layout/container widths specified.
- [x] Dimension 3 Color: PASS — inherits existing OKLCH tokens; accent reserved for single primary CTA per surface; destructive only for confirmations and low-confidence indicator (with icon pairing).
- [x] Dimension 4 Typography: PASS — single font (Instrument Sans, already loaded); roles map to Tailwind defaults; reading-width cap on prose blocks.
- [x] Dimension 5 Spacing: PASS — all values multiples of 4 via Tailwind 4 default unit; explicit container widths.
- [x] Dimension 6 Registry Safety: PASS — only official shadcn registry components named; no third-party blocks.

**Approval:** approved 2026-04-26 (self-checked; user can revise during planning)
