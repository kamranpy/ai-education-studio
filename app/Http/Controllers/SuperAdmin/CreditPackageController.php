<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreditPackageController extends Controller
{
    public function index()
    {
        $packages = CreditPackage::orderBy('credits')->get();

        return Inertia::render('SuperAdmin/CreditPackages/Index', [
            'packages' => $packages,
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/CreditPackages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1',
            'price_cents' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'is_active' => 'boolean',
        ]);

        CreditPackage::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Credit package created successfully.')]);

        return to_route('super_admin.credit_packages.index');
    }

    public function edit(CreditPackage $package)
    {
        return Inertia::render('SuperAdmin/CreditPackages/Edit', [
            'package' => $package,
        ]);
    }

    public function update(Request $request, CreditPackage $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1',
            'price_cents' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'is_active' => 'boolean',
        ]);

        $package->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Credit package updated successfully.')]);

        return to_route('super_admin.credit_packages.index');
    }

    public function destroy(CreditPackage $package)
    {
        $package->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Credit package deleted successfully.')]);

        return to_route('super_admin.credit_packages.index');
    }
}
