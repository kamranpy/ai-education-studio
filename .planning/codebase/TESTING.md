# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner:**
- PHPUnit 11 (via Laravel)
- Config: `phpunit.xml`

**Assertion Library:**
- PHPUnit assertions and Laravel testing helpers (e.g., `$response->assertOk()`)

**Run Commands:**
```bash
php artisan test       # Run all tests
vendor/bin/phpunit     # Run via PHPUnit directly
```

## Test File Organization

**Location:**
- Separate `tests/` directory at project root.
- Unit tests in `tests/Unit/`
- Feature tests in `tests/Feature/`

**Naming:**
- PascalCase with `Test` suffix (e.g., `tests/Feature/Auth/AuthenticationTest.php`)

**Structure:**
```
tests/
├── Feature/
│   ├── Auth/
│   │   ├── AuthenticationTest.php
│   │   └── ...
│   ├── DashboardTest.php
│   └── ExampleTest.php
├── Unit/
└── TestCase.php
```

## Test Structure

**Suite Organization:**
```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_a_successful_response()
    {
        $response = $this->get(route('home'));

        $response->assertOk();
    }
}
```

**Patterns:**
- **Setup pattern:** Use `RefreshDatabase` trait for database resets.
- **Assertion pattern:** Arrange, Act, Assert (e.g., `$response = $this->get(...)`, `$response->assertOk()`).

## Mocking

**Framework:** Mockery (included with Laravel)

**Patterns:**
```php
// Standard Laravel mocking patterns
```

**What to Mock:**
- External API calls, complex services, queued jobs.

**What NOT to Mock:**
- Database interactions (use `RefreshDatabase` instead).

## Fixtures and Factories

**Test Data:**
```php
// Standard Laravel model factories
$user = User::factory()->create();
```

**Location:**
- `database/factories/`

## Coverage

**Requirements:** None enforced in `phpunit.xml`.

**View Coverage:**
```bash
php artisan test --coverage
```

## Test Types

**Unit Tests:**
- Isolated logic testing in `tests/Unit/`.

**Integration Tests:**
- Handled as Feature tests in `tests/Feature/`.

**E2E Tests:**
- Nightwatch is present in `phpunit.xml` env variables (`NIGHTWATCH_ENABLED="false"`), but no JS testing framework is configured in `package.json`.

## Common Patterns

**Async Testing:**
- Not applicable for PHP tests.

**Error Testing:**
```php
$response->assertStatus(403);
$response->assertSessionHasErrors(['email']);
```

---

*Testing analysis: 2026-04-12*