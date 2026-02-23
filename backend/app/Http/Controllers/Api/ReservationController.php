<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

/**
 * Reservation Controller
 * Handles attendee reservations and ticket generation
 */
class ReservationController extends Controller
{
    /**
     * Create a new reservation
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'role' => 'required|in:Student,Employee',
            'institution_name' => 'required_if:role,Student|nullable|string|max:255',
            'days' => 'required|array|min:1',
            'days.*' => 'in:Day 1,Day 2,Day 3',
            'seat_numbers' => 'required|array|min:1',
            'seat_numbers.*' => 'required|string',
        ]);

        // Check if seats are available
        foreach ($validated['days'] as $index => $day) {
            $seatNumber = $validated['seat_numbers'][$index];

            $seat = Seat::where('seat_number', $seatNumber)
                ->where('day', $day)
                ->where('is_available', true)
                ->first();

            if (!$seat) {
                return response()->json([
                    'message' => "Seat {$seatNumber} is not available for {$day}"
                ], 422);
            }
        }

        // Generate unique ticket code
        $ticketCode = 'ITRI-' . strtoupper(Str::random(8));

        // Generate QR code data
        $qrData = json_encode([
            'ticket_code' => $ticketCode,
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'days' => $validated['days'],
            'seats' => $validated['seat_numbers']
        ]);

        // Create reservation
        $reservation = Reservation::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'institution_name' => $validated['institution_name'] ?? null,
            'days' => $validated['days'],
            'seat_numbers' => $validated['seat_numbers'],
            'ticket_code' => $ticketCode,
            'qr_code' => $qrData,
            'is_used' => false,
        ]);

        // Mark seats as unavailable
        foreach ($validated['days'] as $index => $day) {
            $seatNumber = $validated['seat_numbers'][$index];

            Seat::where('seat_number', $seatNumber)
                ->where('day', $day)
                ->update(['is_available' => false]);
        }

        // Generate QR code image
        $qrCodeImage = base64_encode(QrCode::format('png')->size(200)->generate($qrData));



        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation,
            'qr_code' => $qrCodeImage
        ], 201);
    }

    /**
     * Get all reservations (admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Reservation::query();

        // Filter by day if provided
        if ($request->has('day')) {
            $query->whereJsonContains('days', $request->input('day'));
        }

        // Filter by role if provided
        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $reservations = $query->orderBy('created_at', 'desc')->get();

        return response()->json($reservations);
    }

    /**
     * Get a single reservation
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found'
            ], 404);
        }

        return response()->json($reservation);
    }

    /**
     * Get reservation by ticket code
     * 
     * @param string $ticketCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByTicketCode($ticketCode)
    {
        $reservation = Reservation::where('ticket_code', $ticketCode)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json($reservation);
    }

    /**
     * Delete a reservation (admin only)
     * Also frees up the reserved seats
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found'
            ], 404);
        }

        // Free up the seats
        foreach ($reservation->days as $index => $day) {
            $seatNumber = $reservation->seat_numbers[$index];

            Seat::where('seat_number', $seatNumber)
                ->where('day', $day)
                ->update(['is_available' => true]);
        }

        $reservation->delete();

        return response()->json([
            'message' => 'Reservation deleted successfully'
        ]);
    }

    /**
     * Get reservation statistics (admin only)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalReservations = Reservation::count();
        $studentReservations = Reservation::where('role', 'Student')->count();
        $employeeReservations = Reservation::where('role', 'Employee')->count();

        $day1Reservations = Reservation::whereJsonContains('days', 'Day 1')->count();
        $day2Reservations = Reservation::whereJsonContains('days', 'Day 2')->count();
        $day3Reservations = Reservation::whereJsonContains('days', 'Day 3')->count();

        $usedTickets = Reservation::where('is_used', true)->count();
        $unusedTickets = Reservation::where('is_used', false)->count();

        return response()->json([
            'total_reservations' => $totalReservations,
            'student_reservations' => $studentReservations,
            'employee_reservations' => $employeeReservations,
            'day_1_reservations' => $day1Reservations,
            'day_2_reservations' => $day2Reservations,
            'day_3_reservations' => $day3Reservations,
            'used_tickets' => $usedTickets,
            'unused_tickets' => $unusedTickets,
        ]);
    }
}
