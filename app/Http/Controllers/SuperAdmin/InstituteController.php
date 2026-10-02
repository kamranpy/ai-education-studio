<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Institute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InstituteController extends Controller
{
    /**
     * List all institutes with user and exam counts.
     */
    public function index(): Response
    {
        $institutes = Institute::withCount(['users', 'exams'])
            ->orderBy('name')
            ->get()
            ->map(fn (Institute $institute) => [
                'id'         => $institute->id,
                'name'       => $institute->name,
                'status'     => $institute->status,
                'credits'    => $institute->credits,
                'user_count' => $institute->users_count,
                'exam_count' => $institute->exams_count,
            ]);

        return Inertia::render('SuperAdmin/Institutes/Index', [
            'institutes' => $institutes,
        ]);
    }

    /**
     * Toggle the active/suspended status of an institute.
     */
    public function toggleStatus(Institute $institute): RedirectResponse
    {
        $institute->update(['status' => ! $institute->status]);

        $label = $institute->status ? 'activated' : 'suspended';

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => "Institute {$label}.",
        ]);

        return to_route('super_admin.institutes.index');
    }

    /**
     * Manually adjust an institute's credit balance and record the transaction.
     */
    public function adjustCredits(Request $request, Institute $institute): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'not_in:0'],
            'notes'  => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($validated, $institute) {
            $institute->increment('credits', $validated['amount']);

            $institute->transactions()->create([
                'credits_added'     => $validated['amount'],
                'amount_cents'      => 0,
                'currency'          => 'usd',
                'status'            => 'completed',
                'type'              => 'manual_adjustment',
                'notes'             => $validated['notes'] ?? null,
                'stripe_session_id' => null,
            ]);
        });

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Credits adjusted.',
        ]);

        return to_route('super_admin.institutes.index');
    }

    /**
     * Permanently delete an institute and all its related data (cascades via FK).
     */
    public function destroy(Institute $institute): RedirectResponse
    {
        $institute->delete();

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Institute deleted.',
        ]);

        return to_route('super_admin.institutes.index');
    }
}
