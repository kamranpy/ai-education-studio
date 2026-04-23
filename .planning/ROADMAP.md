# Project Roadmap

**Project:** AI Education Studio
**Created:** 2026-04-12
**Granularity:** standard

## Phases

- [x] **Phase 1: Foundation & Multi-Tenancy** - Institutes can onboard and access their isolated environments
- [ ] **Phase 2: User Management & Exam Creation** - Admins can manage their users and build complete exams
- [ ] **Phase 3: Student Exam Experience** - Students can securely take and submit exams with resilience against interruptions
- [ ] **Phase 4: AI Evaluation & Grading** - Exams are automatically evaluated and graded using configured AI models
- [ ] **Phase 5: Monetization & Billing** - Institutes are billed per exam attempt using a credit system
- [ ] **Phase 6: Super Admin & Global Management** - Super Admin oversees institutes, manages global billing, and views global analytics

## Phase Details

### Phase 1: Foundation & Multi-Tenancy
**Goal**: Institutes can onboard and access their isolated environments
**Depends on**: Nothing
**Requirements**: TENT-01, TENT-02, AUTH-01, AUTH-02, AUTH-03, AUTH-04, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. User can sign up as an institute admin and log in securely
  2. Institute admin can view their isolated dashboard and configure institute settings
  3. Student can log in and view their dedicated student portal
  4. Unit tests are written and pass for all phase features
  5. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: 4 plans
**UI hint**: yes

### Phase 2: User Management & Exam Creation
**Goal**: Admins can manage their users and build complete exams
**Depends on**: Phase 1
**Requirements**: TENT-03, EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. Admin can invite and manage students within their institute
  2. Admin can create an exam with multiple choice, true/false, and written questions
  3. Admin can publish an exam to make it available to students
  4. Unit tests are written and pass for all phase features
  5. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: 4 plans
Plans:
- [x] 02-01-PLAN.md — User Management & Invites
- [ ] 02-02-PLAN.md — Exam Models & API
- [ ] 02-03-PLAN.md — Exam Builder UI Shell & Index
- [ ] 02-04-PLAN.md — Exam Builder Dynamic Form
**UI hint**: yes

### Phase 3: Student Exam Experience
**Goal**: Students can securely take and submit exams with resilience against interruptions
**Depends on**: Phase 2
**Requirements**: TAKE-01, TAKE-02, TAKE-03, TAKE-04, TAKE-05, TAKE-06, TAKE-07, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. Student can start an available exam with randomized question order
  2. Student can answer questions while a server-enforced timer counts down
  3. Student can close the browser, return, and resume their exam without losing progress
  4. Admin can see a log of when the student left the exam tab
  5. Student can successfully submit their completed exam
  6. Unit tests are written and pass for all phase features
  7. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: TBD
**UI hint**: yes

### Phase 4: AI Evaluation & Grading
**Goal**: Exams are automatically evaluated and graded using configured AI models
**Depends on**: Phase 3
**Requirements**: AIEV-01, AIEV-02, AIEV-03, AIEV-04, AIEV-05, AIEV-06, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. Admin can configure their specific LLM provider and API keys
  2. System instantly grades multiple choice and true/false questions upon submission
  3. System asynchronously grades written answers and provides a conceptual score and explanation
  4. Admin can view the AI-generated grades and manually override them if necessary
  5. Unit tests are written and pass for all phase features
  6. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: TBD
**UI hint**: yes

### Phase 5: Monetization & Billing
**Goal**: Institutes are billed per exam attempt using a credit system
**Depends on**: Phase 3
**Requirements**: BILL-01, BILL-02, BILL-03, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. Admin can purchase exam credits for their institute
  2. System automatically deducts a credit when a student starts an exam
  3. Student is prevented from starting an exam if the institute has zero credits
  4. Unit tests are written and pass for all phase features
  5. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: TBD
**UI hint**: yes

### Phase 6: Super Admin & Global Management
**Goal**: Super Admin can oversee all institutes, manage global billing, and view global analytics
**Depends on**: Phase 5
**Requirements**: SADM-01, SADM-02, SADM-03, TEST-01, DOCS-01
**Success Criteria** (what must be TRUE):
  1. Super Admin can view a list of all registered institutes
  2. Super Admin can configure global billing keys (Stripe/PayPal) and credit packages
  3. Super Admin can view global analytics across all institutes
  4. Unit tests are written and pass for all phase features
  5. INTEGRATION_GUIDE.md is updated with any new API contracts
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Multi-Tenancy | 4/4 | Completed | 2026-04-12 |
| 2. User Management & Exam Creation | 1/4 | In Progress|  |
| 3. Student Exam Experience | 0/0 | Not started | - |
| 4. AI Evaluation & Grading | 0/0 | Not started | - |
| 5. Monetization & Billing | 0/0 | Not started | - |
| 6. Super Admin & Global Management | 0/0 | Not started | - |