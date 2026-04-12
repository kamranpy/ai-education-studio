# Architecture Patterns

**Domain:** AI-powered exam platform (SaaS)
**Researched:** 2026-04-12

## Recommended Architecture

A multi-tenant, monolithic web application using Laravel and Inertia.js, with a strong emphasis on asynchronous job processing for AI interactions.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Tenant Manager | Isolates data and configuration per institute | Database, Cache |
| Exam Engine | Handles exam creation, delivery, and basic anti-cheat tracking | Frontend UI, Database |
| Evaluation Queue | Manages asynchronous AI grading requests | Exam Engine, External AI APIs (OpenAI, Anthropic) |
| Billing Module | Manages pay-per-exam credits and subscriptions | Payment Gateway (Stripe), Tenant Manager |

### Data Flow

1.  **Exam Creation:** Admin creates an exam, configuring question types and AI grading parameters.
2.  **Exam Delivery:** Student takes the exam. The frontend auto-saves progress to the backend periodically.
3.  **Submission & Evaluation:**
    *   Student submits the exam.
    *   The backend immediately acknowledges receipt and queues an evaluation job.
    *   A background worker processes the job, calling the configured AI API.
    *   The AI returns a score, confidence level, and explanation.
    *   The backend updates the exam record and notifies the student/admin (e.g., via email or dashboard update).

## Patterns to Follow

### Pattern 1: Asynchronous AI Processing
**What:** Offloading slow, unpredictable LLM API calls to background queues.
**When:** Whenever evaluating written answers or generating content.
**Example:**
```php
// In a controller
public function submit(ExamSubmissionRequest $request, Exam $exam)
{
    $submission = $exam->submissions()->create($request->validated());
    
    // Dispatch the job to evaluate written answers
    EvaluateExamSubmission::dispatch($submission);
    
    return redirect()->route('exams.completed')->with('success', 'Exam submitted successfully. Results will be available shortly.');
}
```

### Pattern 2: Provider-Agnostic AI Integration
**What:** Abstracting the AI service so buyers can plug in their own API keys for different providers.
**When:** Implementing the evaluation logic.
**Example:**
```php
interface AiEvaluator {
    public function evaluate(string $question, string $answer, string $rubric): EvaluationResult;
}

class OpenAiEvaluator implements AiEvaluator { /* ... */ }
class AnthropicEvaluator implements AiEvaluator { /* ... */ }
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Synchronous AI Calls in User Flows
**What:** Calling an LLM API directly during a web request (e.g., when the user clicks "Submit").
**Why bad:** LLM APIs are slow and prone to timeouts. If the API takes 30 seconds to respond, the user's browser might time out, leading to data loss and a terrible experience.
**Instead:** Always use background queues for AI tasks.

### Anti-Pattern 2: Hardcoding AI Providers
**What:** Tying the entire evaluation logic to a specific version of the OpenAI API.
**Why bad:** The SaaS buyer might prefer a cheaper or different model (e.g., Claude 3 Haiku). Locking them in reduces the product's appeal.
**Instead:** Use an interface and allow dynamic configuration via the admin panel.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Database Multi-tenancy | Single database with `tenant_id` columns | Single database, optimized indexes | Database per tenant or sharded databases |
| AI Evaluation Queue | Single Redis worker | Multiple workers, prioritized queues | Dedicated worker clusters, rate limit management |
| Exam Auto-save | Direct DB writes | Redis caching with periodic DB sync | Distributed caching layer, optimistic UI updates |

## Sources

- Laravel Documentation (Queues, Interfaces)
- Standard SaaS Architecture Patterns
