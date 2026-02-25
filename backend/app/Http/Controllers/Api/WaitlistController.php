<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Waitlist;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'role' => 'required|in:student,employee',
            'institution_name' => 'nullable|string|max:255',
            'days' => 'required|array|min:1',
            'days.*' => 'in:day1,day2,day3',
        ]);

        // Check if user is already on the waitlist with this email
        $existing = Waitlist::where('email', $validated['email'])
            ->whereIn('status', ['waiting', 'notified'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Vous êtes déjà inscrit(e) sur la liste d\'attente.',
            ], 409);
        }

        $waitlist = Waitlist::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'institution_name' => $validated['institution_name'] ?? null,
            'days' => $validated['days'],
            'status' => 'waiting',
        ]);

        return response()->json([
            'message' => 'Vous avez été ajouté(e) avec succès à la liste d\'attente. Nous vous contacterons si une place se libère !',
            'waitlist' => $waitlist,
        ], 201);
    }
}
