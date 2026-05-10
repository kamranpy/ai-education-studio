# UI Designs — v2.0 UI Revamp

Drop your generated HTML files into the appropriate phase folder before implementation begins.

## Folder Structure

```
ui-designs/
├── phase-07-homepage-auth/       ← Homepage + all auth pages
├── phase-08-student-shell/       ← Student layout, dashboard, exam list
├── phase-09-student-exam/        ← Exam taking, results, history
├── phase-10-admin-shell/         ← Admin layout, dashboard, exam list
├── phase-11-admin-exam-builder/  ← Exam builder, show, attempts
├── phase-12-admin-users-billing/ ← Users, invite, billing
├── phase-13-superadmin-shell/    ← SA layout, dashboard, institutes
└── phase-14-superadmin-settings/ ← LLM, Stripe, credit packages
```

## Naming Convention

Name your HTML files clearly, e.g.:
- `homepage.html`
- `login.html`
- `register.html`
- `auth-secondary.html` (forgot password, reset, verify, 2FA)

## Workflow

1. AI gives you a UI prompt
2. You generate the HTML design
3. Drop the HTML file into the correct phase folder
4. AI implements the design into React/Inertia pages
