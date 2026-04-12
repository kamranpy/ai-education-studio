# Technology Stack

**Project:** AI Education Studio
**Researched:** 2026-04-12

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Laravel | 11.x | Backend API & Routing | Robust ecosystem, excellent queue management for async AI tasks, built-in multi-tenancy support packages. |
| React | 18.x | Frontend UI | Component-based architecture, large ecosystem for complex UI elements like exam interfaces. |
| Inertia.js | 1.x | Frontend/Backend Bridge | Eliminates the need for a separate API, allowing rapid development of monolithic SPAs. |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL | 16.x | Primary Data Store | Reliable, supports JSONB for flexible exam configurations, excellent for multi-tenant schemas. |
| Redis | 7.x | Queue & Cache | Essential for managing the asynchronous AI evaluation jobs and caching configuration. |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PHP | 8.3+ | Server Runtime | Required for Laravel 11. |
| Node.js | 20+ | Frontend Build | Required for compiling React/Inertia assets via Vite. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Laravel Horizon | 5.x | Queue Monitoring | Managing and monitoring the async AI evaluation jobs. |
| Laravel Cashier / Stripe | 15.x | Monetization | Handling the pay-per-exam billing and credit system. |
| Tailwind CSS | 3.x | Styling | Rapid UI development with utility classes. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Frontend | React/Inertia | Vue.js | React has a slightly larger ecosystem for complex interactive components (like rich text editors for exams), though Vue is also a viable option with Inertia. |
| Backend | Laravel | Node.js/Express | Laravel provides more out-of-the-box features (queues, auth, ORM) necessary for a rapid SaaS build compared to assembling a Node.js stack from scratch. |

## Installation

```bash
# Core Backend
composer install

# Core Frontend
npm install

# Build Assets
npm run build
```

## Sources

- Project Context (`.planning/PROJECT.md`)
- Laravel Documentation
- Inertia.js Documentation
