<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

/**
 * ProgramController handles CRUD operations for event sessions
 */
class ProgramController extends Controller
{
    /**
     * Get all programs grouped by day
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $programs = Program::with('speaker')->orderBy('day')->orderBy('start_time')->get();

        // Add formatted time field
        $programs->transform(function ($program) {
            $start = date('H:i', strtotime($program->start_time));
            $end = date('H:i', strtotime($program->end_time));
            $program->time = $start . ' - ' . $end;
            return $program;
        });

        // Group programs by day
        $grouped = [
            'day1' => $programs->where('day', 'day1')->values(),
            'day2' => $programs->where('day', 'day2')->values(),
            'day3' => $programs->where('day', 'day3')->values(),
        ];

        return response()->json($grouped);
    }

    /**
     * Get all programs as flat list (for admin)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function all()
    {
        $programs = Program::with('speaker')->orderBy('day')->orderBy('start_time')->get();

        $programs->transform(function ($program) {
            $start = date('H:i', strtotime($program->start_time));
            $end = date('H:i', strtotime($program->end_time));
            $program->time = $start . ' - ' . $end;
            return $program;
        });

        return response()->json($programs);
    }

    /**
     * Get a single program
     * 
     * @param Program $program
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Program $program)
    {
        return response()->json($program->load('speaker'));
    }

    /**
     * Create a new program session (Admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate request data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'day' => 'required|in:day1,day2,day3',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'speaker_id' => 'nullable|exists:speakers,id',
        ]);

        // Create program
        $program = Program::create($validated);

        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program->load('speaker'),
        ], 201);
    }

    /**
     * Update an existing program session (Admin only)
     * 
     * @param Request $request
     * @param Program $program
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Program $program)
    {
        // Validate request data
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'day' => 'sometimes|required|in:day1,day2,day3',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i',
            'speaker_id' => 'nullable|exists:speakers,id',
        ]);

        // Update program
        $program->update($validated);

        return response()->json([
            'message' => 'Program updated successfully',
            'program' => $program->load('speaker'),
        ]);
    }

    /**
     * Delete a program session (Admin only)
     * 
     * @param Program $program
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Program $program)
    {
        $program->delete();

        return response()->json([
            'message' => 'Program deleted successfully',
        ]);
    }
}
