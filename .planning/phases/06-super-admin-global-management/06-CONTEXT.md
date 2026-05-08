# Phase 06: Super Admin & Global Management — Context

**Phase Goal:** Super Admin can oversee all institutes, manage global billing, and view global analytics.
**Requirements:** SADM-01, SADM-02, SADM-03
**Depends on:** Phase 5

---

## Domain Boundary

This phase completes the Super Admin control center. The SuperAdmin shell already exists (Dashboard, LLM settings, Credit Packages CRUD). This phase adds:
1. Institutes list with full management actions
2. Global analytics dashboard (stats + charts)
3. Stripe billing config UI + global transaction log

---

## Decisions

### 1. Institutes List & Management (SADM-01)

- **Display:** Table with columns: Name, Status, Credit Balance, Exam Count, User Count, Actions
- **Actions:** All inline in the table row (no separate detail page)
  - Suspend / Activate (toggle institute status)
  - Adjust Credits — opens a dialog with amount + optional reason field; reason stored in transactions table
  - Delete institute — with confirmation dialog
- **Credit adjustment:** Dialog with amount (positive = add, negative = subtract) + optional reason/note. Stored as a transaction record (type: `manual_adjustment`).

### 2. Analytics Dashboard (SADM-03)

- **Location:** Super Admin Dashboard page (currently a placeholder — fill it in)
- **Stat cards (top):**
  - Total Institutes
  - Total Exams Run (all time)
  - Total Revenue (sum of completed transactions)
  - Total Credits Sold
- **Charts (below stats):**
  - Exams run over time (line chart)
  - Revenue over time (line chart)
  - New institutes over time (bar chart)
- **Time range filter:** Preset ranges — Last 7 days / Last 30 days / Last 90 days / All time
- **No drill-down** — charts are summary only, no click-through to per-institute detail

### 3. Billing Config & Transaction Log (SADM-02)

- **Stripe keys:** Super Admin can set/update Stripe Secret Key and Webhook Secret from the UI. Keys stored encrypted in DB (same pattern as LLM keys — `Crypt::encryptString()`). Currently these come from `.env`; this phase moves them to DB-managed config.
- **Credit packages CRUD:** Already built in Phase 5 — no changes needed.
- **Global transaction log:** A table showing all credit purchase transactions across all institutes. Columns: Institute, Package, Amount, Credits Added, Date, Status. Read-only, no actions.

---

## Carrying Forward from Prior Phases

- LLM keys are stored encrypted via `Crypt::encryptString()` keyed off `APP_KEY` — use the same pattern for Stripe keys (Phase 04 D-02)
- `EnsureSuperAdmin` middleware already protects all `/super-admin` routes (Phase 01)
- Consistent UI: use the same table/card patterns established in prior admin pages
- Institute `status` column is boolean (active/inactive) — already exists on the `institutes` table

---

## Canonical Refs

- `.planning/REQUIREMENTS.md` — SADM-01, SADM-02, SADM-03
- `.planning/ROADMAP.md` — Phase 6 success criteria
- `app/Models/Institute.php` — Institute model with status, credits
- `app/Models/Transaction.php` — Transaction model (reuse for manual adjustments)
- `app/Http/Controllers/SuperAdmin/LlmSettingController.php` — Pattern for encrypted key storage
- `app/Http/Controllers/SuperAdmin/CreditPackageController.php` — Existing SuperAdmin controller pattern
- `resources/js/pages/SuperAdmin/Dashboard.tsx` — Placeholder to be replaced with analytics
- `resources/js/pages/SuperAdmin/Llm.tsx` — UI pattern for settings forms

---

## Out of Scope (Deferred)

- Per-institute detail page (drill-down from institutes list)
- PayPal integration (keys UI deferred — Stripe only for v1)
- Custom date range picker (preset ranges are sufficient for v1)
- Export analytics to CSV/PDF (v2 — FEAT-03)
