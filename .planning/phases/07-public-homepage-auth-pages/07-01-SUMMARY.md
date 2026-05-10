---
plan: 07-01
phase: 7
status: complete
completed: "2026-05-11"
---

# Summary: Public Homepage & Auth Pages UI Implementation

**One-liner**: Implemented branded public homepage and all 7 auth pages with the v2.0 dark design system, replacing default Breeze UI.

## What Was Built

- **Public homepage** (`welcome.tsx`): Full-featured marketing page with scroll-spy navbar (animated sliding underline indicator), hero section with custom-coded dashboard mockup (bar chart, stat cards, exam rows), trust bar, features bento grid (6 cards), how-it-works steps, solutions by segment, 3-tier pricing with gradient-border highlighted Starter card, testimonials, FAQ accordion, and final CTA banner. Wayfinder-typed `login()` / `register()` route links throughout.
- **Login page**: Email/password form, remember me checkbox, forgot password link, dark design system styling.
- **Register page**: Institute name, full name, work email, password + confirm fields, ToS note, dark design system styling.
- **Forgot password page**: Email form with icon header, back to login link.
- **Reset password page**: New password + confirm, pre-filled read-only email field.
- **Two-factor challenge page**: OTP input slots (6 digits) + recovery code toggle mode.
- **Verify email page**: Resend button + logout link, icon header.
- **Confirm password page**: Password confirmation for secure areas.

## Design System Established

- Dark background: `#131313` / `#0e0e0e`
- Primary: `#c3c0ff` (indigo-lavender)
- Primary container: `#4f46e5`
- Secondary: `#4fdbc8` (teal)
- Surface borders: `#464555`
- Text: `#e5e2e1` / `#c7c4d8`
- Glass card effect: `rgba(26,26,26,0.6)` + `backdrop-blur`
- AI gradient border: indigo → teal

## Key Files

- `resources/js/pages/welcome.tsx`
- `resources/js/pages/auth/login.tsx`
- `resources/js/pages/auth/register.tsx`
- `resources/js/pages/auth/forgot-password.tsx`
- `resources/js/pages/auth/reset-password.tsx`
- `resources/js/pages/auth/two-factor-challenge.tsx`
- `resources/js/pages/auth/verify-email.tsx`
- `resources/js/pages/auth/confirm-password.tsx`

## Notes

Auth pages use inline hex colors rather than Tailwind token names — functional but slightly inconsistent with the token-based approach in the HTML designs. Can be unified in a future cleanup pass.
