<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Speaker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Speaker Controller
 * Handles CRUD operations for speakers
 */
class SpeakerController extends Controller
{
    /**
     * Get all speakers
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $speakers = Speaker::all();
        return response()->json($speakers);
    }

    /**
     * Get a single speaker
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $speaker = Speaker::find($id);
        
        if (!$speaker) {
            return response()->json([
                'message' => 'Speaker not found'
            ], 404);
        }

        return response()->json($speaker);
    }

    /**
     * Create a new speaker
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate incoming data with detailed error catching
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'job_title' => 'required|string|max:255',
                'bio' => 'required|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            \Illuminate\Support\Facades\Log::info('Speaker creation request received', ['has_file' => $request->hasFile('photo')]);
            
            // Handle photo upload if provided
            if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('speakers', 'public');
            \Illuminate\Support\Facades\Log::info('Photo stored', ['path' => $path]);
            $validated['photo'] = $path;
        }

            // Create speaker
            $speaker = Speaker::create($validated);

            return response()->json([
                'message' => 'Speaker created successfully',
                'speaker' => $speaker
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create speaker: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to save speaker: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Update an existing speaker
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $speaker = Speaker::find($id);
        
        if (!$speaker) {
            return response()->json([
                'message' => 'Speaker not found'
            ], 404);
        }

        // Validate incoming data
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'job_title' => 'sometimes|required|string|max:255',
                'bio' => 'sometimes|required|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            \Illuminate\Support\Facades\Log::info('Speaker update request received', ['id' => $id, 'has_file' => $request->hasFile('photo')]);
            
            // Handle photo upload if provided
            if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($speaker->photo) {
                Storage::disk('public')->delete($speaker->photo);
            }
            
            $path = $request->file('photo')->store('speakers', 'public');
            $validated['photo'] = $path;
        }

            // Update speaker
            $speaker->update($validated);

            return response()->json([
                'message' => 'Speaker updated successfully',
                'speaker' => $speaker
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to update speaker: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update speaker: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Delete a speaker
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $speaker = Speaker::find($id);
        
        if (!$speaker) {
            return response()->json([
                'message' => 'Speaker not found'
            ], 404);
        }

        // Delete photo if exists
        if ($speaker->photo) {
            Storage::disk('public')->delete($speaker->photo);
        }

        $speaker->delete();

        return response()->json([
            'message' => 'Speaker deleted successfully'
        ]);
    }
}
