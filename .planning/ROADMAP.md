# Project Roadmap

**Project:** AI Education Studio
**Created:** 2026-04-12

## Milestones

- ✅ **v1.0 MVP** — Phases 1–6 (shipped 2026-05-09)
- 🚧 **v2.0 UI Revamp** — Phases 7–14 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–6) — SHIPPED 2026-05-09</summary>

- [x] Phase 1: Foundation & Multi-Tenancy (4/4 plans) — completed 2026-04-12
- [x] Phase 2: User Management & Exam Creation (4/4 plans) — completed 2026-04-24
- [x] Phase 3: Student Exam Experience (4/4 plans) — completed 2026-04-25
- [x] Phase 4: AI Evaluation & Grading (4/4 plans) — completed 2026-04-26
- [x] Phase 4.1: Exam Creation Enhancements & Evaluation Settings (1/1 plan) — completed 2026-04-30
- [x] Phase 5: Monetization & Billing (4/4 plans) — completed 2026-05-09
- [x] Phase 6: Super Admin & Global Management (4/4 plans) — completed 2026-05-09

</details>

### � v2.0 UI Revamp (In Progress)

- [x] Phase 7: Public Homepage & Auth Pages
- [x] Phase 8: Student Layout, Dashboard & Exam List
- [x] Phase 9: Student Exam Taking & Results
- [x] Phase 10: Admin Layout, Dashboard & Exam List
- [ ] Phase 11: Admin Exam Builder & Attempt Views
- [ ] Phase 12: Admin Users & Billing
- [ ] Phase 13: Super Admin Layout, Dashboard & Institutes
- [ ] Phase 14: Super Admin Settings & Credit Packages

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Multi-Tenancy | v1.0 | 4/4 | Complete | 2026-04-12 |
| 2. User Management & Exam Creation | v1.0 | 4/4 | Complete | 2026-04-24 |
| 3. Student Exam Experience | v1.0 | 4/4 | Complete | 2026-04-25 |
| 4. AI Evaluation & Grading | v1.0 | 4/4 | Complete | 2026-04-26 |
| 4.1. Enhancements & Settings | v1.0 | 1/1 | Complete | 2026-04-30 |
| 5. Monetization & Billing | v1.0 | 4/4 | Complete | 2026-05-09 |
| 6. Super Admin & Global Management | v1.0 | 4/4 | Complete | 2026-05-09 |
| 7. Public Homepage & Auth Pages | v2.0 | 1/1 | Complete | 2026-05-11 |
| 8. Student Layout, Dashboard & Exam List | v2.0 | 1/1 | Complete | 2026-05-11 |
| 9. Student Exam Taking & Results | v2.0 | 1/1 | Complete | 2026-05-11 |
| 10. Admin Layout, Dashboard & Exam List | v2.0 | 1/1 | Complete | 2026-05-16 |
| 11. Admin Exam Builder & Attempt Views | v2.0 | 0/1 | Not started | — |
| 12. Admin Users & Billing | v2.0 | 0/1 | Not started | — |
| 13. Super Admin Layout, Dashboard & Institutes | v2.0 | 0/1 | Not started | — |
| 14. Super Admin Settings & Credit Packages | v2.0 | 0/1 | Not started | — |

## Phase Details

### Phase 7: Public Homepage & Auth Pages
**Goal**: A branded public homepage and fully redesigned auth pages replace the default Breeze UI
**Depends on**: v1.0 complete
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, DS-01, DS-02, DS-03
**Success Criteria**:
  1. `/` renders a branded homepage with hero, features, and CTA
  2. Login and register pages match the new design system
  3. All secondary auth pages (forgot password, reset, verify email, 2FA) are redesigned
  4. Design is responsive and supports dark mode
**UI Prompt**: Yes — AI generates prompt, user provides HTML

### Phase 8: Student Layout, Dashboard & Exam List
**Goal**: Student portal shell (layout, nav) and primary landing pages are redesigned
**Depends on**: Phase 7 (design system established)
**Requirements**: STU-01, STU-02, STU-03, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Student sidebar/topbar layout matches new design system
  2. Student dashboard renders with new design
  3. Available exams list renders with new design
**UI Prompt**: Yes

### Phase 9: Student Exam Taking & Results
**Goal**: The exam-taking flow and all result surfaces are redesigned
**Depends on**: Phase 8
**Requirements**: STU-04, STU-05, STU-06, STU-07, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Exam taking screen is redesigned for focus and clarity
  2. Results, results history, interstitial, and pending pages are redesigned
**UI Prompt**: Yes

### Phase 10: Admin Layout, Dashboard & Exam List
**Goal**: Institute Admin portal shell and primary pages are redesigned
**Depends on**: Phase 7
**Requirements**: ADM-01, ADM-02, ADM-03, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Admin sidebar/topbar layout matches new design system
  2. Admin dashboard renders with new design
  3. Exam list page renders with new design
**UI Prompt**: Yes

### Phase 11: Admin Exam Builder & Attempt Views
**Goal**: The exam builder and attempt management pages are redesigned
**Depends on**: Phase 10
**Requirements**: ADM-04, ADM-05, ADM-06, ADM-07, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Exam builder (create/edit) renders with new design
  2. Exam detail/show page renders with new design
  3. Attempts list and attempt detail pages render with new design
**UI Prompt**: Yes

### Phase 12: Admin Users & Billing
**Goal**: User management and billing pages in the admin portal are redesigned
**Depends on**: Phase 10
**Requirements**: ADM-08, ADM-09, ADM-10, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Users list and invite pages render with new design
  2. Admin billing/credits page renders with new design
**UI Prompt**: Yes

### Phase 13: Super Admin Layout, Dashboard & Institutes
**Goal**: Super Admin portal shell and primary management pages are redesigned
**Depends on**: Phase 7
**Requirements**: SUP-01, SUP-02, SUP-03, DS-01, DS-02, DS-03
**Success Criteria**:
  1. Super Admin sidebar/topbar layout matches new design system
  2. Global analytics dashboard renders with new design
  3. Institutes management page renders with new design
**UI Prompt**: Yes

### Phase 14: Super Admin Settings & Credit Packages
**Goal**: Super Admin settings and credit package pages are redesigned
**Depends on**: Phase 13
**Requirements**: SUP-04, SUP-05, SUP-06, DS-01, DS-02, DS-03
**Success Criteria**:
  1. LLM settings page renders with new design
  2. Stripe billing settings page renders with new design
  3. Credit packages (index, create, edit) render with new design
**UI Prompt**: Yes
