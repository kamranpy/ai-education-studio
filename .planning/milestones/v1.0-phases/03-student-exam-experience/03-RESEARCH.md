# Phase 3: Student Exam Experience - Research

**Phase:** 03-student-exam-experience
**Mode:** ecosystem
**Date:** 2026-04-24

## Standard Stack

- **React `useEffect` & `document.visibilitychange`**: For detecting when the user leaves the tab/window. This is the web standard for modern tab focus tracking.
- **Inertia.js Router (`router.post` / `router.put`)**: With `preserveState: true` and `preserveScroll: true` for the auto-save functionality on blur/navigation, avoiding full page reloads and keeping the timer undisturbed.
- **Laravel Scheduler (`Console/Kernel.php` or `routes/console.php` in Laravel 11+)**: To run a `everyMinute()` job for automatically reaping and marking expired exam attempts as "submitted" based on the server time context, since the server cannot inherently push state without WebSockets.
- **MySQL/Postgres JSON fields**: For storing the randomized sequence of question IDs and the array of tab-blur tracking logs on the `exam_attempts` model, avoiding complex relational mapping tables for simple document-like data.

## Architecture Patterns

### The Exam Attempt Model
The core entity tying this together is the `ExamAttempt` model. It acts as the source of truth for the server-enforced timer.
- **Columns needed:** `id`, `exam_id`, `user_id` (student), `started_at`, `status` (`in_progress`, `submitted`, `abandoned`), `question_order` (JSON array of shuffled question IDs), `tracking_logs` (JSON array of `{ type, timestamp }`).
- By storing the `question_order` as a JSON array when the attempt is created, you ensure stable randomization across page reloads without needing a separate mapping table for every student-question relationship.

### Safe Auto-Saving (Blur/Navigation)
When rendering one question at a time, the client requests the next/previous question ID. 
- On click (Next/Prev) or on input blur, the client sends an async payload `[ { question_id, answer_data } ]` to an update endpoint (e.g., `PUT /attempts/{uuid}/answers`).
- The controller validates the attempt is still `in_progress` and `Carbon::now() < started_at + duration_minutes`. If expired, it rejects the save and returns an `expired` status flag, which the frontend uses to auto-redirect to the completion page.

### Automatic Expiry (The Lazy + Scheduled Approach)
- **Lazy evaluation:** Every time the student pings the server (saving an answer), check the time difference. If `now() > expires_at`, mark submitted immediately.
- **Scheduled evaluation:** A cron job running `ExamAttempt::where('status', 'in_progress')->whereRaw('time_limit reaches threshold')->update(['status' => 'submitted'])` handles the edge case where a student literally closes their laptop and never fires another request.

## Don't Hand-Roll

- **Client-Side Authoritative Timers:** Never trust `Date.now()` or JavaScript `setTimeout` to enforce the absolute deadline. The client timer is purely visual; the server must rely strictly on `started_at` in the database and block updates past the duration limit.
- **Custom Event Listeners for Tab Tracking:** Do not use `window.onblur` or `window.onfocus` as they are unreliable across devices (e.g. they fire if you click an iframe). Use the Page Visibility API (`document.hidden` and `visibilitychange` event).
- **On-the-Fly Randomization (`ORDER BY RAND()`):** Do not randomize with SQL on the fly. You will serve the same question twice across pagination. Save the randomized sequence when the attempt begins.

## Common Pitfalls

- **Timer drift:** `setInterval` in JavaScript pauses or slows down when tabs are backgrounded. A naively decremented integer variable will quickly fall behind real time. The timer component *must* calculate the remaining time in its render cycle by subtracting `Date.now()` from an absolute `expiresAtTime` passed securely from the server.
- **Race conditions on submission:** A student clicking "Submit" at the exact same time an auto-save triggers could cause locking issues or duplicate answers. You must wrap the final submission inside a DB transaction and verify the `status` isn't already `submitted`.
- **Losing the last answer:** If the timer expires and forces an auto-submit, the student's *current keystrokes* might not have blurred out yet to trigger a save. Before calling the final submit, fire the auto-save payload manually.

## Code Examples

**1. Accurate Visual Timer Component (React):**
```tsx
import { useState, useEffect } from 'react';

export function ExamTimer({ expiresAtIso }: { expiresAtIso: string }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const expiresAt = new Date(expiresAtIso).getTime();
        
        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) onExpire();
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500); // 500ms ensures we don't miss the 0 second mark
        return () => clearInterval(interval);
    }, [expiresAtIso]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return <div className="font-mono text-xl">{minutes}:{seconds.toString().padStart(2, '0')}</div>;
}
```

**2. Anti-Cheat Tracking (React):**
```tsx
useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            // Student backgrounded the tab
            router.post(route('api.exam.log-event'), {
                attempt_id: attemptId,
                event: 'tab_hidden',
                timestamp: Date.now()
            }, { preserveState: true, preserveScroll: true });
        } else if (document.visibilityState === 'visible') {
            // Student returned
            toast({
                title: "Warning",
                description: "Your session was backgrounded. This has been logged.",
                variant: "destructive"
            });
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);
```

**3. Initializing the Attempt Randomization (Laravel):**
```php
public function store(Exam $exam, Request $request) 
{
    // Ensure active attempt doesn't exist
    
    $shuffledQuestionIds = $exam->questions()->pluck('id')->shuffle()->toArray();
    
    $attempt = ExamAttempt::create([
        'user_id' => $request->user()->id,
        'exam_id' => $exam->id,
        'started_at' => now(),
        'status' => 'in_progress',
        'question_order' => $shuffledQuestionIds,
        'tracking_logs' => [],
    ]);
    
    return redirect()->route('student.exams.take', ['attempt' => $attempt->id]);
}
```
