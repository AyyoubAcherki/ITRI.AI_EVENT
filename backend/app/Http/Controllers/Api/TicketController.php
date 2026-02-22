<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Ticket Controller
 * Handles PDF ticket generation and download
 */
class TicketController extends Controller
{
    /**
     * Generate and download PDF ticket
     * 
     * @param string $ticketCode
     * @return \Illuminate\Http\Response
     */
    public function downloadTicket($ticketCode)
    {
        // Find reservation by ticket code
        $reservation = Reservation::where('ticket_code', $ticketCode)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        // Generate QR code image as base64
        $qrCodeImage = base64_encode(QrCode::format('png')->size(200)->generate($reservation->qr_code));

        // Prepare ticket data
        $ticketData = [
            'event_name' => 'AI ITRI NTIC EVENT',
            'event_location' => 'Tanger, Morocco',
            'full_name' => $reservation->full_name,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'role' => $reservation->role,
            'institution_name' => $reservation->institution_name,
            'days' => $reservation->days,
            'seat_numbers' => $reservation->seat_numbers,
            'ticket_code' => $reservation->ticket_code,
            'qr_code' => $qrCodeImage,
            'reservation_date' => $reservation->created_at->format('d/m/Y'),
        ];

        // Generate PDF
        $pdf = Pdf::loadView('tickets.ticket', $ticketData);
        $pdf->setPaper('A4', 'portrait');

        // Download PDF
        return $pdf->download("ticket-{$ticketCode}.pdf");
    }

    /**
     * Preview ticket in browser
     * 
     * @param string $ticketCode
     * @return \Illuminate\Http\Response
     */
    public function previewTicket($ticketCode)
    {
        $reservation = Reservation::where('ticket_code', $ticketCode)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        // Generate QR code image as base64
        $qrCodeImage = base64_encode(QrCode::format('png')->size(200)->generate($reservation->qr_code));

        $ticketData = [
            'event_name' => 'AI ITRI NTIC EVENT',
            'event_location' => 'Tanger, Morocco',
            'full_name' => $reservation->full_name,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'role' => $reservation->role,
            'institution_name' => $reservation->institution_name,
            'days' => $reservation->days,
            'seat_numbers' => $reservation->seat_numbers,
            'ticket_code' => $reservation->ticket_code,
            'qr_code' => $qrCodeImage,
            'reservation_date' => $reservation->created_at->format('d/m/Y'),
        ];

        $pdf = Pdf::loadView('tickets.ticket', $ticketData);
        $pdf->setPaper('A4', 'portrait');

        // Stream PDF to browser
        return $pdf->stream("ticket-{$ticketCode}.pdf");
    }

    /**
     * Get ticket data as JSON (for frontend generation)
     * 
     * @param string $ticketCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTicketData($ticketCode)
    {
        $reservation = Reservation::where('ticket_code', $ticketCode)->first();

        if (!$reservation) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        // Generate QR code image as base64
        $qrCodeImage = base64_encode(QrCode::format('png')->size(200)->generate($reservation->qr_code));

        return response()->json([
            'event_name' => 'AI ITRI NTIC EVENT',
            'event_location' => 'Tanger, Morocco',
            'full_name' => $reservation->full_name,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'role' => $reservation->role,
            'institution_name' => $reservation->institution_name,
            'days' => $reservation->days,
            'seat_numbers' => $reservation->seat_numbers,
            'ticket_code' => $reservation->ticket_code,
            'qr_code' => $qrCodeImage,
            'reservation_date' => $reservation->created_at->format('d/m/Y'),
        ]);
    }
}
