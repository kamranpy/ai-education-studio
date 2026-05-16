# UI Design Contract — Phase 12: Admin Users & Billing

## Phase Details
- **Phase**: 12 — Admin Users & Billing
- **Goal**: User management and billing pages in the admin portal are redesigned
- **Requirements**: ADM-08, ADM-09, ADM-10, DS-01, DS-02, DS-03

---

## Surfaces to Design

### Surface 1: Users List Page
**Requirement**: ADM-08 — The users list page is redesigned

**Current State**: Default Breeze table/list view

**Design Requirements**:
- **Layout**: Card-based user list or modern data table with hover states
- **Visual Hierarchy**: 
  - User avatar + name as primary identifier
  - Email and role as secondary info
  - Status badges (Active/Inactive/Pending)
  - Join date as tertiary info
- **Actions**: Invite button (primary CTA), bulk actions dropdown
- **Search/Filter**: Real-time search by name/email, role filter dropdown
- **Empty State**: Illustration + "No users found" with invite CTA
- **Pagination**: Load more or numbered pagination with page size selector

**Key Elements**:
```
┌─────────────────────────────────────────────────────────────┐
│ Users                                [+ Invite User] [🔍] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────────────┬─────────┬────────┬──────────┐ │
│ │ Avatar  │ Name            │ Email   │ Role   │ Status   │ │
│ │         │                 │         │        │          │ │
│ ├─────────┼─────────────────┼─────────┼────────┼──────────┤ │
│ │ [img]   │ Kamran Kiani    │ k@...   │ Admin  │ ● Active │ │
│ │ [img]   │ John Doe        │ j@...   │ Student│ ○ Pending│ │
│ └─────────┴─────────────────┴─────────┴────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Surface 2: Invite User Page/Modal
**Requirement**: ADM-09 — The invite user page is redesigned

**Current State**: Simple form page

**Design Requirements**:
- **Layout**: Centered card or slide-over panel
- **Form Fields**:
  - Full Name (text input)
  - Email Address (email input with validation)
  - Role Selection (radio or select: Student/Admin)
  - Optional message/notes (textarea)
- **Validation**: Real-time email validation, duplicate check indicator
- **Actions**: 
  - Primary: "Send Invite" (with loading state)
  - Secondary: "Cancel" / "Add Another"
- **Success State**: Confirmation toast + option to invite another

**Key Elements**:
```
┌──────────────────────────────────────┐
│     Invite New User                  │
│                                      │
│  Full Name                           │
│  ┌──────────────────────────────┐   │
│  │ e.g. John Smith              │   │
│  └──────────────────────────────┘   │
│                                      │
│  Email Address                       │
│  ┌──────────────────────────────┐   │
│  │ john@school.edu              │   │
│  └──────────────────────────────┘   │
│                                      │
│  Role                          [v] │
│                                      │
│  [Send Invite]  [Cancel]             │
└──────────────────────────────────────┘
```

---

### Surface 3: Admin Billing/Credits Page
**Requirement**: ADM-10 — The billing/credits page is redesigned

**Current State**: Basic credit display and top-up form

**Design Requirements**:
- **Layout**: Dashboard-style with metrics cards + transaction history
- **Credit Balance Card** (Hero):
  - Large credit number display
  - Visual credit indicator (progress bar or circular gauge)
  - Low credit warning (when < 20%)
  - "Top Up Credits" primary CTA
- **Quick Top-up Section**:
  - Preset amounts: 100, 500, 1000, 2000 credits
  - Custom amount input
  - Price calculation (credits × rate)
  - Stripe checkout button
- **Transaction History**:
  - Table with: Date, Type (Top-up/Usage), Amount, Status
  - Filter by: All, Top-ups, Usage
  - Export option (CSV)

**Key Elements**:
```
┌─────────────────────────────────────────────────────────────┐
│ Billing & Credits                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │     Available Credits: 2,450                           │ │
│ │     ▓▓▓▓▓▓▓▓░░░░  61% remaining                        │ │
│ │                                                         │ │
│ │     [Top Up Credits]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Quick Top-up              Recent Transactions               │
│ ┌────────┐               ┌──────────────────────────────────┐│
│ │  100   │               │ Date      │ Type   │ Amount │ ✓  ││
│ │  $50   │               ├───────────┼────────┼────────┼────┤│
│ └────────┘               │ Today     │ Top-up │ +500   │ ✓  ││
│ ┌────────┐               │ Yesterday │ Usage  │ -120   │ ✓  ││
│ │  500   │               └──────────────────────────────────┘│
│ │ $200   │                                                  │
│ └────────┘                                                  │
│ [Custom Amount]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Design System Specifications

### Colors (Brand System)
- **Primary Surface**: `#16121e` (main background)
- **Surface Container**: `#1e1b29` (card backgrounds)
- **Surface Container High**: `#262336` (hover states)
- **Primary (Brand)**: `#c3c0ff` (buttons, accents)
- **On Primary**: `#161349` (text on primary)
- **Secondary**: `#918fa1` (borders, secondary text)
- **Error**: `#ffb4ab` (red/error states)
- **Success**: `#4fdbc8` (green/success states)
- **Warning**: `#fbe188` (yellow/warning states)

### Typography
- **Font Family**: Inter, sans-serif
- **Headings**: Bold (600-700), tight letter-spacing
- **Body**: Regular (400), 14-16px
- **Labels**: Uppercase, small (12px), tracking-wider

### Spacing
- **Card Padding**: 24px (1.5rem)
- **Section Gaps**: 32px (2rem)
- **Element Gaps**: 16px (1rem)
- **Input Heights**: 40-48px

### Components

#### Buttons
- **Primary**: `bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff]`
- **Secondary/Outline**: `bg-transparent border border-[#918fa1]/30 text-[#918fa1] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]`
- **Danger**: `bg-[#ffb4ab] text-[#4a0000] hover:bg-[#ff887a]`

#### Inputs
- Background: `#201f1f`
- Border: `border-[#918fa1]/30`
- Focus: `focus:border-[#c3c0ff]`
- Rounded: `rounded-lg` (8px)

#### Badges
- Active: `bg-[#03b4a2]/20 text-[#4fdbc8] border-[#4fdbc8]/30`
- Pending: `bg-[#fbe188]/20 text-[#fbe188] border-[#fbe188]/30`
- Inactive: `bg-[#918fa1]/20 text-[#918fa1]`

#### Tables
- Header: `text-[#918fa1] uppercase text-xs`
- Row hover: `bg-[#2a2a2a]/50`
- Border: `border-[#918fa1]/20`

---

## Copywriting

### Tone
Professional, clear, action-oriented. Admin-focused language.

### Key Phrases
- "Invite User" (not "Add User")
- "Top Up Credits" (not "Add Credits")
- "Available Credits" (not "Balance")
- "Transaction History" (not "History")

### Empty States
- Users: "No users found. Invite your first team member to get started."
- Transactions: "No transactions yet. Top up credits to see your history."

---

## Responsive Behavior

### Desktop (≥1024px)
- Full table view with all columns visible
- Side-by-side credit cards and transaction history

### Tablet (768px–1023px)
- Condensed table (hide join date, show on expand)
- Stacked credit cards

### Mobile (<768px)
- Card-based user list instead of table
- Collapsed transaction history (accordion expand)
- Bottom sheet for invite modal

---

## Interactions

### User List
- Row hover: Background highlight + action icons appear
- Click row: Navigate to user detail (if exists) or show quick actions

### Invite Flow
- Email validation: Real-time format check
- Duplicate check: Show warning if email exists
- Success: Toast notification + auto-close modal

### Credit Top-up
- Amount selection: Highlight selected preset
- Custom input: Auto-format numbers
- Stripe: Open checkout in modal/new tab
- Success: Credit counter animates to new value

---

## UI Prompt

**Phase 12: Admin Users & Billing**

Create HTML designs for three admin portal pages:

1. **Users List** (`users-index.html`):
   - Modern data table with user avatars, names, emails, roles
   - Status badges (Active/Pending/Inactive)
   - Search bar and filter dropdown
   - "Invite User" primary button
   - Empty state with illustration

2. **Invite User Modal** (`invite-user.html`):
   - Clean form with name, email, role fields
   - Role selector (radio or select)
   - Real-time email validation indicator
   - Submit and cancel actions

3. **Billing/Credits** (`billing.html`):
   - Large credit balance display with visual gauge
   - Quick top-up preset buttons (100/500/1000)
   - Custom amount input
   - Transaction history table
   - Low credit warning banner

**Design System**:
- Dark theme with brand colors (primary: `#c3c0ff`, surface: `#16121e`)
- Inter font, rounded corners (8-12px)
- Card-based layouts with subtle borders
- Professional admin aesthetic

**Deliverables**: Three HTML files with Tailwind CSS classes.

---

## Dependencies
- Phase 10 (Admin Layout) — reuse sidebar/topbar
- Design System v2.0 tokens (colors, spacing)

## Success Criteria
- [ ] Users list matches new design with card/table hybrid
- [ ] Invite user form has validation and clear UX
- [ ] Billing page displays credits prominently with gauge
- [ ] Transaction history is readable and filterable
- [ ] All pages are responsive (desktop, tablet, mobile)
- [ ] Dark mode consistent with admin portal

---

*UI-SPEC created: 2026-05-16*
*Next step: Generate HTML designs from UI prompt, then implement in React*
