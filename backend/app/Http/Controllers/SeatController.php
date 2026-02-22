<?php

namespace App\Http\Controllers;

use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * SeatController handles seat availability operations
 */
class SeatController extends Controller
{
    /**
     * Get all seats with their availability status for a specific day
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $day = $request->query('day', 'day1');
        
        // Get all seats ordered by block, row, and seat index
        $seats = Seat::orderBy('block')
            ->orderBy('row_number')
            ->orderBy('seat_index')
            ->get();
        
        // Get reserved seat IDs for the specified day - only for pending or confirmed reservations
        $reservedSeatIds = DB::table('reservation_seats')
            ->join('reservations', 'reservation_seats.reservation_id', '=', 'reservations.id')
            ->where('reservation_seats.day', $day)
            ->whereIn('reservations.status', ['pending', 'confirmed'])
            ->pluck('reservation_seats.seat_id')
            ->toArray();
        
        // Add availability status to each seat
        $seatsWithStatus = $seats->map(function ($seat) use ($reservedSeatIds) {
            return [
                'id' => $seat->id,
                'seat_number' => $seat->seat_number,
                'block' => $seat->block,
                'row_number' => $seat->row_number,
                'seat_index' => $seat->seat_index,
                'type' => $seat->type,
                'is_available' => !in_array($seat->id, $reservedSeatIds),
            ];
        });
        
        // Group by block then by row for easier display
        $leftBlock = $seatsWithStatus->where('block', 'left')->groupBy('row_number');
        $rightBlock = $seatsWithStatus->where('block', 'right')->groupBy('row_number');

        return response()->json([
            'seats' => $seatsWithStatus,
            'leftBlock' => $leftBlock,
            'rightBlock' => $rightBlock,
        ]);
    }

    /**
     * Get seats availability for multiple days
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function availability(Request $request)
    {
        $days = $request->query('days', ['day1', 'day2', 'day3']);
        
        if (is_string($days)) {
            $days = explode(',', $days);
        }
        
        $result = [];
        
        foreach ($days as $day) {
            // Get reserved seat IDs for this day - only for pending or confirmed reservations
            $reservedSeatIds = DB::table('reservation_seats')
                ->join('reservations', 'reservation_seats.reservation_id', '=', 'reservations.id')
                ->where('reservation_seats.day', $day)
                ->whereIn('reservations.status', ['pending', 'confirmed'])
                ->pluck('reservation_seats.seat_id')
                ->toArray();
            
            $result[$day] = $reservedSeatIds;
        }

        return response()->json($result);
    }
}
