# Requirements: AI Education Studio

**Defined:** 2026-04-12
**Core Value:** A reliable digital assessment platform with AI-assisted evaluation that focuses on conceptual understanding rather than exact wording.

## v1 Requirements

### Multi-Tenancy

- [ ] **TENT-01**: System isolates database records per institute (tenant)
- [ ] **TENT-02**: Tenant admins can configure their own institute settings
- [x] **TENT-03**: Tenant admins can manage their own users (students/teachers)

### Authentication & Roles

- [ ] **AUTH-01**: User can sign up and log in with email and password
- [ ] **AUTH-02**: System enforces Role-Based Access Control (Super Admin, Institute Admin, Student)
- [ ] **AUTH-03**: Institute Admin can access the admin dashboard
- [ ] **AUTH-04**: Student can access the student portal

### Exam Management

- [x] **EXAM-01**: Admin can create a new exam with a title, description, and settings
- [x] **EXAM-02**: Admin can add Multiple Choice questions
- [x] **EXAM-03**: Admin can add True/False questions
- [x] **EXAM-04**: Admin can add Written Answer questions
- [x] **EXAM-05**: Admin can publish or unpublish an exam

### Exam Taking Experience

- [ ] **TAKE-01**: Student can view available exams and start an exam
- [ ] **TAKE-02**: System enforces a server-side countdown timer for the exam
- [ ] **TAKE-03**: System auto-saves student answers periodically during the exam
- [ ] **TAKE-04**: Student can resume an incomplete exam if they disconnect (within the time limit)
- [ ] **TAKE-05**: System randomizes question order per student
- [ ] **TAKE-06**: System logs when a student leaves the browser tab/window (basic tracking)
- [ ] **TAKE-07**: Student can submit the completed exam

### AI Evaluation

- [ ] **AIEV-01**: Admin can configure their preferred LLM provider and API key
- [ ] **AIEV-02**: System automatically grades Multiple Choice and True/False questions
- [ ] **AIEV-03**: System dispatches asynchronous jobs to evaluate Written Answers using the configured LLM
- [ ] **AIEV-04**: AI evaluation returns a score, confidence level, and explanation based on conceptual understanding
- [ ] **AIEV-05**: Admin/Teacher can view AI-generated grades and explanations
- [ ] **AIEV-06**: Admin/Teacher can manually override the AI-generated grade

### Super Admin & Global Management

- [ ] **SADM-01**: Super Admin can oversee and manage all registered institutes
- [ ] **SADM-02**: Super Admin can manage global billing configurations (e.g., Stripe/PayPal keys, credit packages)
- [ ] **SADM-03**: Super Admin can view global analytics across all institutes

### Quality & Documentation

- [x] **TEST-01**: Write and run unit tests at the end of every phase to ensure a bug-free script
- [x] **DOCS-01**: Maintain an INTEGRATION_GUIDE.md (API contract) throughout the project for future mobile/frontend integrations

### Monetization

- [ ] **BILL-01**: Institute Admin can purchase exam credits
- [ ] **BILL-02**: System deducts credits per student exam attempt before allowing the exam to start
- [ ] **BILL-03**: System prevents exam starts if the institute has insufficient credits

## v2 Requirements

### Advanced Features

- **FEAT-01**: Detailed analytics dashboard for student performance trends
- **FEAT-02**: Question banks/pools for reusing questions across exams
- **FEAT-03**: Exporting exam results to CSV/PDF
- **FEAT-04**: OAuth login (Google, Microsoft)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Strict lockdown proctoring | Introduces unnecessary friction and technical complexity for v1. Basic tracking is sufficient. |
| Synchronous AI evaluation | High risk of HTTP timeouts and poor user experience during exam submission. |
| Mobile app | Web-first SaaS focus for v1. Mobile apps require separate codebases and app store approvals. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TENT-01 | Phase 1 | Pending |
| TENT-02 | Phase 1 | Pending |
| TENT-03 | Phase 2 | Complete |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| EXAM-01 | Phase 2 | Complete |
| EXAM-02 | Phase 2 | Complete |
| EXAM-03 | Phase 2 | Complete |
| EXAM-04 | Phase 2 | Complete |
| EXAM-05 | Phase 2 | Complete |
| TAKE-01 | Phase 3 | Pending |
| TAKE-02 | Phase 3 | Pending |
| TAKE-03 | Phase 3 | Pending |
| TAKE-04 | Phase 3 | Pending |
| TAKE-05 | Phase 3 | Pending |
| TAKE-06 | Phase 3 | Pending |
| TAKE-07 | Phase 3 | Pending |
| AIEV-01 | Phase 4 | Pending |
| AIEV-02 | Phase 4 | Pending |
| AIEV-03 | Phase 4 | Pending |
| AIEV-04 | Phase 4 | Pending |
| AIEV-05 | Phase 4 | Pending |
| AIEV-06 | Phase 4 | Pending |
| BILL-01 | Phase 5 | Pending |
| BILL-02 | Phase 5 | Pending |
| BILL-03 | Phase 5 | Pending |
| SADM-01 | Phase 6 | Pending |
| SADM-02 | Phase 6 | Pending |
| SADM-03 | Phase 6 | Pending |
| TEST-01 | All Phases | Complete |
| DOCS-01 | All Phases | Complete |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*