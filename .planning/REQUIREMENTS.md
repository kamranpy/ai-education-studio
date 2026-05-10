# Requirements: AI Education Studio — v2.0 UI Revamp

**Defined:** 2026-05-10
**Core Value:** A reliable digital assessment platform with AI-assisted evaluation that focuses on conceptual understanding rather than exact wording.
**Milestone Goal:** Replace the entire UI with a polished, brand-new design across all surfaces — homepage, auth pages, and all three role portals.

---

## UI Revamp Workflow

Each phase follows this design-first process:
1. AI generates a detailed UI prompt for the surface
2. User generates the HTML design from that prompt
3. User hands the HTML file to the AI
4. AI implements the design into the actual React/Inertia pages

---

## v2.0 Requirements

### Public & Auth

- [ ] **PUB-01**: A branded public homepage exists at `/` with hero, features, and CTA sections
- [ ] **PUB-02**: The login page has a custom branded design (not the default Breeze/Fortify UI)
- [ ] **PUB-03**: The register page has a custom branded design matching the login page
- [ ] **PUB-04**: The forgot password, reset password, verify email, and confirm password pages are redesigned to match the auth design system
- [ ] **PUB-05**: The two-factor challenge page is redesigned to match the auth design system

### Student Portal

- [ ] **STU-01**: The student layout (sidebar/topbar, navigation) is redesigned with a new visual identity
- [ ] **STU-02**: The student dashboard is redesigned with a clean, modern look
- [ ] **STU-03**: The exam list / available exams view is redesigned
- [ ] **STU-04**: The exam taking screen (ExamTake) is redesigned for focus and clarity
- [ ] **STU-05**: The exam results page is redesigned
- [ ] **STU-06**: The results history page is redesigned
- [ ] **STU-07**: The grading interstitial and results pending pages are redesigned

### Institute Admin Portal

- [ ] **ADM-01**: The admin layout (sidebar/topbar, navigation) is redesigned with a new visual identity
- [ ] **ADM-02**: The admin dashboard is redesigned
- [ ] **ADM-03**: The exam list page is redesigned
- [ ] **ADM-04**: The exam builder (create/edit) is redesigned
- [ ] **ADM-05**: The exam detail/show page is redesigned
- [ ] **ADM-06**: The exam attempts list page is redesigned
- [ ] **ADM-07**: The exam attempt detail page is redesigned
- [ ] **ADM-08**: The users list page is redesigned
- [ ] **ADM-09**: The invite user page is redesigned
- [ ] **ADM-10**: The billing/credits page is redesigned

### Super Admin Portal

- [ ] **SUP-01**: The super admin layout (sidebar/topbar, navigation) is redesigned
- [ ] **SUP-02**: The super admin dashboard (global analytics) is redesigned
- [ ] **SUP-03**: The institutes management page is redesigned
- [ ] **SUP-04**: The LLM settings page is redesigned
- [ ] **SUP-05**: The billing/Stripe settings page is redesigned
- [ ] **SUP-06**: The credit packages pages (index, create, edit) are redesigned

### Design System

- [ ] **DS-01**: A consistent design language (colors, typography, spacing, component style) is applied across all surfaces
- [ ] **DS-02**: All redesigned pages are responsive (mobile-friendly)
- [ ] **DS-03**: Dark mode is supported across all redesigned surfaces

---

## Out of Scope for v2.0

| Feature | Reason |
|---------|--------|
| New functional features | v2.0 is UI-only — no new backend logic or data models |
| Analytics dashboards (v1.1 backlog) | Deferred to v2.1 or v1.1 |
| Question banks | Deferred |
| CSV/PDF exports | Deferred |
| OAuth login | Deferred |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PUB-01 | Phase 7 | Pending |
| PUB-02 | Phase 7 | Pending |
| PUB-03 | Phase 7 | Pending |
| PUB-04 | Phase 7 | Pending |
| PUB-05 | Phase 7 | Pending |
| STU-01 | Phase 8 | Pending |
| STU-02 | Phase 8 | Pending |
| STU-03 | Phase 8 | Pending |
| STU-04 | Phase 9 | Pending |
| STU-05 | Phase 9 | Pending |
| STU-06 | Phase 9 | Pending |
| STU-07 | Phase 9 | Pending |
| ADM-01 | Phase 10 | Pending |
| ADM-02 | Phase 10 | Pending |
| ADM-03 | Phase 10 | Pending |
| ADM-04 | Phase 11 | Pending |
| ADM-05 | Phase 11 | Pending |
| ADM-06 | Phase 11 | Pending |
| ADM-07 | Phase 11 | Pending |
| ADM-08 | Phase 12 | Pending |
| ADM-09 | Phase 12 | Pending |
| ADM-10 | Phase 12 | Pending |
| SUP-01 | Phase 13 | Pending |
| SUP-02 | Phase 13 | Pending |
| SUP-03 | Phase 13 | Pending |
| SUP-04 | Phase 14 | Pending |
| SUP-05 | Phase 14 | Pending |
| SUP-06 | Phase 14 | Pending |
| DS-01 | All Phases | Pending |
| DS-02 | All Phases | Pending |
| DS-03 | All Phases | Pending |

---
*Requirements defined: 2026-05-10*
