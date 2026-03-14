<?php

namespace App\Http\Controllers;

use App\Models\EmailSent;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailSentController extends Controller
{
    /**
     * Get paginated email logs with statistics.
     */
    public function index(Request $request)
    {
        $query = EmailSent::with('reservation');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email_to', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $emails = $query->orderBy('created_at', 'desc')->paginate(20);

        $stats = [
            'total' => EmailSent::count(),
            'delivered' => EmailSent::where('status', 'delivered')->count(),
            'failed' => EmailSent::where('status', 'failed')->count(),
            'pending' => EmailSent::where('status', 'pending')->count(),
        ];

        return response()->json([
            'emails' => $emails,
            'stats' => $stats
        ]);
    }

    /**
     * Retry sending a failed email.
     */
    public function retry($id)
    {
        $emailLog = EmailSent::with('reservation')->findOrFail($id);
        
        if ($emailLog->status === 'delivered') {
            return response()->json(['message' => 'L\'email a déjà été livré avec succès.'], 400);
        }

        $reservation = $emailLog->reservation;

        if (!$reservation) {
             return response()->json(['message' => 'Impossible de réessayer: la réservation associée n\'existe plus.'], 404);
        }

        try {
            // Re-evaluating which email to send based on the subject (simplistic approach for now)
            if (str_contains($emailLog->subject, 'Confirmation de votre réservation')) {
                 $confirmationUrl = config('app.frontend_url', 'http://localhost:3000') . '/confirm-reservation?token=' . $reservation->confirmation_token;
                 $cancellationUrl = config('app.frontend_url', 'http://localhost:3000') . '/cancel-reservation?token=' . $reservation->confirmation_token;
                 Mail::to($emailLog->email_to)->send(new \App\Mail\ReservationConfirmationMailable($reservation, $confirmationUrl, $cancellationUrl));
            } elseif (str_contains($emailLog->subject, 'Confirmation Finale')) {
                 Mail::to($emailLog->email_to)->send(new \App\Mail\FinalConfirmationMailable($reservation));
            } elseif (str_contains($emailLog->subject, 'Action Requise')) {
                 $confirmationUrl = config('app.frontend_url', 'http://localhost:3000') . '/confirm-reservation?token=' . $reservation->confirmation_token;
                 $cancellationUrl = config('app.frontend_url', 'http://localhost:3000') . '/cancel-reservation?token=' . $reservation->confirmation_token;
                 Mail::to($emailLog->email_to)->send(new \App\Mail\ActionRequiredMailable($reservation, $confirmationUrl, $cancellationUrl));
            } else {
                 return response()->json(['message' => 'Type d\'email non reconnu pour la relance.'], 400);
            }

            // Update log
            $emailLog->update([
                'status' => 'delivered',
                'error_message' => null
            ]);

            return response()->json(['message' => 'Email renvoyé avec succès.', 'email' => $emailLog]);

        } catch (\Exception $e) {
             // Update log with new error
             $emailLog->update([
                 'status' => 'failed',
                 'error_message' => $e->getMessage()
             ]);

             return response()->json([
                 'message' => 'Échec lors du renvoi de l\'email.', 
                 'error' => $e->getMessage()
             ], 500);
        }
    }
}
