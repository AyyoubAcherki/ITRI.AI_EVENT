<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ReservationConfirmationMailable;

/**
 * ReservationController handles reservation operations
 */
class ReservationController extends Controller
{
    /**
     * Get all reservations (Admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Reservation::query();

        // Apply filters
        if ($request->has('day')) {
            $query->whereJsonContains('days', $request->day);
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
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
     * @param Reservation $reservation
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Reservation $reservation)
    {
        return response()->json($reservation);
    }

    /**
     * Create a new reservation (Public)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate request data
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'role' => 'required|in:student,employee',
            'institution_name' => 'required_if:role,student|nullable|string|max:255',
            'days' => 'required|array|min:1',
            'days.*' => 'in:day1,day2,day3',
            'seats' => 'required|array',
            'seats.*.seat_id' => 'required|exists:seats,id',
            'seats.*.day' => 'required|in:day1,day2,day3',
        ]);

        // Check if seats are available
        foreach ($validated['seats'] as $seatData) {
            $isReserved = DB::table('reservation_seats')
                ->join('reservations', 'reservation_seats.reservation_id', '=', 'reservations.id')
                ->where('reservation_seats.seat_id', $seatData['seat_id'])
                ->where('reservation_seats.day', $seatData['day'])
                ->whereIn('reservations.status', ['pending', 'confirmed'])
                ->exists();

            if ($isReserved) {
                $seat = Seat::find($seatData['seat_id']);
                return response()->json([
                    'message' => "Seat {$seat->seat_number} is already reserved for {$seatData['day']}",
                ], 422);
            }
        }

        // Generate unique ticket code
        $ticketCode = strtoupper(Str::random(8));

        // Generate QR code data (we'll store the ticket code)
        $qrData = json_encode([
            'ticket_code' => $ticketCode,
            'email' => $validated['email'],
        ]);

        // Get seat numbers for display
        $seatNumbers = [];
        foreach ($validated['seats'] as $seatData) {
            $seat = Seat::find($seatData['seat_id']);
            $seatNumbers[] = [
                'day' => $seatData['day'],
                'seat' => $seat->seat_number,
            ];
        }

        // Create reservation
        $reservation = Reservation::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'institution_name' => $validated['institution_name'] ?? null,
            'days' => $validated['days'],
            'seat_numbers' => $seatNumbers,
            'ticket_code' => $ticketCode,
            'qr_code' => $qrData,
            'is_used' => false,
            'status' => 'pending',
            'confirmation_token' => Str::random(40),
        ]);

        // Create reservation_seats entries
        foreach ($validated['seats'] as $seatData) {
            DB::table('reservation_seats')->insert([
                'reservation_id' => $reservation->id,
                'seat_id' => $seatData['seat_id'],
                'day' => $seatData['day'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Send confirmation email
        try {
            $confirmationUrl = config('app.frontend_url', 'http://localhost:3000') . '/confirm-reservation?token=' . $reservation->confirmation_token;
            $cancellationUrl = config('app.frontend_url', 'http://localhost:3000') . '/cancel-reservation?token=' . $reservation->confirmation_token;
            Mail::to($reservation->email)->send(new ReservationConfirmationMailable($reservation, $confirmationUrl, $cancellationUrl));
        } catch (\Exception $e) {
            Log::error('Error sending confirmation email: ' . $e->getMessage());
        }



        return response()->json([
            'message' => 'Réservation créée. Veuillez vérifier votre email pour confirmer.',
            'reservation' => $reservation,
            'ticket_code' => $ticketCode,
        ], 201);
    }

    /**
     * Download PDF ticket - Returns reservation data for frontend PDF generation
     * 
     * @param string $ticketCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function downloadTicket($ticketCode)
    {
        $reservation = Reservation::where('ticket_code', $ticketCode)->firstOrFail();

        // Return reservation data - frontend handles PDF generation
        return response()->json([
            'reservation' => $reservation,
            'qr_data' => $reservation->qr_code,
        ]);
    }

    /**
     * Validate a QR code (Admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateQR(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string',
        ]);

        try {
            $data = json_decode($request->qr_data, true);

            if (!isset($data['ticket_code'])) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Invalid QR code format',
                ], 400);
            }

            $reservation = Reservation::where('ticket_code', $data['ticket_code'])->first();

            if (!$reservation) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Ticket not found',
                ]);
            }

            if ($reservation->is_used) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Ticket already used',
                    'reservation' => $reservation,
                ]);
            }

            // Check if this is just validation or actual check-in
            $markAsUsed = $request->input('mark_as_used', false);

            // Always track the scan
            $reservation->increment('scan_count');
            $reservation->update([
                'is_scanned' => true,
                'scanned_at' => now(),
            ]);

            if ($markAsUsed) {
                // Mark as used only if explicitly requested
                $reservation->update(['is_used' => true]);
                $message = 'Ticket validated and marked as used';
            } else {
                $message = 'Valid ticket (not yet used)';
            }

            return response()->json([
                'valid' => true,
                'message' => $message,
                'reservation' => $reservation,
                'is_used' => $reservation->is_used,
                'scan_count' => $reservation->scan_count,
                'scanned_at' => $reservation->scanned_at,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid QR code',
            ], 400);
        }
    }

    /**
     * Get dashboard statistics (Admin only)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalReservations = Reservation::count();

        // Reservations per day
        $day1Count = Reservation::whereJsonContains('days', 'day1')->count();
        $day2Count = Reservation::whereJsonContains('days', 'day2')->count();
        $day3Count = Reservation::whereJsonContains('days', 'day3')->count();

        // Role distribution
        $students = Reservation::where('role', 'student')->count();
        $employees = Reservation::where('role', 'employee')->count();

        // Seat occupancy
        $totalSeats = Seat::count();
        $reservedSeatsDay1 = DB::table('reservation_seats')->where('day', 'day1')->count();
        $reservedSeatsDay2 = DB::table('reservation_seats')->where('day', 'day2')->count();
        $reservedSeatsDay3 = DB::table('reservation_seats')->where('day', 'day3')->count();

        // Tickets used vs unused
        $usedTickets = Reservation::where('is_used', true)->count();
        $unusedTickets = Reservation::where('is_used', false)->count();

        return response()->json([
            'total_reservations' => $totalReservations,
            'reservations_per_day' => [
                'day1' => $day1Count,
                'day2' => $day2Count,
                'day3' => $day3Count,
            ],
            'role_distribution' => [
                'students' => $students,
                'employees' => $employees,
            ],
            'seat_occupancy' => [
                'total_seats' => $totalSeats,
                'day1' => [
                    'reserved' => $reservedSeatsDay1,
                    'available' => $totalSeats - $reservedSeatsDay1,
                    'percentage' => $totalSeats > 0 ? round(($reservedSeatsDay1 / $totalSeats) * 100, 1) : 0,
                ],
                'day2' => [
                    'reserved' => $reservedSeatsDay2,
                    'available' => $totalSeats - $reservedSeatsDay2,
                    'percentage' => $totalSeats > 0 ? round(($reservedSeatsDay2 / $totalSeats) * 100, 1) : 0,
                ],
                'day3' => [
                    'reserved' => $reservedSeatsDay3,
                    'available' => $totalSeats - $reservedSeatsDay3,
                    'percentage' => $totalSeats > 0 ? round(($reservedSeatsDay3 / $totalSeats) * 100, 1) : 0,
                ],
            ],
            'ticket_status' => [
                'used' => $usedTickets,
                'unused' => $unusedTickets,
            ]
        ]);
    }

    /**
     * Get scan statistics (Admin only)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function scanStatistics()
    {
        $totalReservations = Reservation::count();
        $totalScanned = Reservation::where('is_scanned', true)->count();
        $totalScans = Reservation::sum('scan_count');

        // Scans per day (last 7 days)
        $scansPerDay = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = Reservation::whereDate('scanned_at', $date)->sum('scan_count');
            $scansPerDay[] = [
                'date' => $date,
                'count' => $count,
            ];
        }

        // Scanned reservations with details
        $scannedReservations = Reservation::where('is_scanned', true)
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'ticket_code' => $reservation->ticket_code,
                    'full_name' => $reservation->first_name . ' ' . $reservation->last_name,
                    'email' => $reservation->email,
                    'scan_count' => $reservation->scan_count,
                    'scanned_at' => $reservation->scanned_at,
                    'is_used' => $reservation->is_used,
                    'days' => $reservation->days,
                ];
            });

        return response()->json([
            'summary' => [
                'total_reservations' => $totalReservations,
                'total_scanned' => $totalScanned,
                'total_scans' => $totalScans,
                'scan_rate' => $totalReservations > 0 ? round(($totalScanned / $totalReservations) * 100, 2) : 0,
            ],
            'scans_per_day' => $scansPerDay,
            'scanned_reservations' => $scannedReservations,
        ]);
    }

    /**
     * Export reservations data
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function export()
    {
        $reservations = Reservation::all()->map(function ($r) {
            return [
                'ID' => $r->id,
                'First Name' => $r->first_name,
                'Last Name' => $r->last_name,
                'Email' => $r->email,
                'Phone' => $r->phone,
                'Role' => $r->role,
                'Institution' => $r->institution_name,
                'Days' => implode(', ', $r->days),
                'Seats' => collect($r->seat_numbers)->map(fn($s) => "{$s['day']}: {$s['seat']}")->implode(', '),
                'Ticket Code' => $r->ticket_code,
                'Status' => $r->is_used ? 'Used' : 'Unused',
                'Created At' => $r->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($reservations);
    }

    /**
     * Confirm reservation with token
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $reservation = Reservation::where('confirmation_token', $request->token)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Lien de confirmation invalide ou expiré.',
            ], 404);
        }

        if ($reservation->status === 'confirmed') {
            return response()->json([
                'message' => 'Cette réservation est déjà confirmée.',
                'reservation' => $reservation,
            ]);
        }

        // Update status to confirmed
        $reservation->update([
            'status' => 'confirmed',
            'confirmation_token' => null, // Clear token after use
        ]);

        return response()->json([
            'message' => 'Votre réservation a été confirmée avec succès !',
            'reservation' => $reservation,
        ]);
    }

    /**
     * Cancel a reservation using a token.
     */
    public function cancel(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $reservation = Reservation::where('confirmation_token', $request->token)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Lien d\'annulation invalide ou expiré.',
            ], 404);
        }

        if ($reservation->status === 'canceled') {
            return response()->json([
                'message' => 'Cette réservation est déjà annulée.',
            ], 400);
        }

        $reservation->update([
            'status' => 'canceled',
            'confirmation_token' => null, // Clear token after use
        ]);

        return response()->json([
            'message' => 'Votre réservation a été annulée avec succès.',
            'status' => 'canceled',
        ]);
    }
}
