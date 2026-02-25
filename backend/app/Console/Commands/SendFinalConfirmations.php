<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Mail\FinalConfirmationMailable;
use App\Mail\ReservationConfirmationMailable;
use Illuminate\Support\Facades\Mail;

class SendFinalConfirmations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-final-confirmations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie l\'email de confirmation finale aux participants confirmés';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now()->format('Y-m-d');
        $actionDate = '2026-03-25'; // New requested date for confirmation buttons
        $finalConfirmationDate = '2026-03-16';

        // 1. Final Confirmation (on March 16) - for CONFIRMED users
        if ($today === $finalConfirmationDate) {
            $this->sendFinalNotices();
        }

        // 2. Action Required Email (March 25) - for PENDING users
        if ($today === $actionDate) {
            $this->sendMarch25ActionEmails();
        }

        $this->info("Exécution du cron terminée pour le $today.");
    }

    protected function sendFinalNotices()
    {
        $reservations = Reservation::where('status', 'confirmed')
            ->whereNull('notified_at_final')
            ->get();

        $this->info("Envoi de " . $reservations->count() . " emails de confirmation finale...");

        foreach ($reservations as $reservation) {
            try {
                Mail::to($reservation->email)->send(new FinalConfirmationMailable($reservation));
                $reservation->update(['notified_at_final' => now()]);
                $this->line("Envoyé à: {$reservation->email}");
            } catch (\Exception $e) {
                $this->error("Erreur pour {$reservation->email}: " . $e->getMessage());
            }
        }
    }

    protected function sendMarch25ActionEmails()
    {
        $reservations = Reservation::where('status', 'pending')
            ->whereNull('notified_at_reminder') // Reusing this column for the action email
            ->get();

        $this->info("Envoi de " . $reservations->count() . " emails d'action requise (25 Mars)...");

        foreach ($reservations as $reservation) {
            try {
                $confirmationUrl = config('app.frontend_url', 'http://localhost:3000') . '/confirm-reservation?token=' . $reservation->confirmation_token;
                $cancellationUrl = config('app.frontend_url', 'http://localhost:3000') . '/cancel-reservation?token=' . $reservation->confirmation_token;

                Mail::to($reservation->email)->send(new \App\Mail\ActionRequiredMailable($reservation, $confirmationUrl, $cancellationUrl));

                $reservation->update(['notified_at_reminder' => now()]);
                $this->line("Email d'action envoyé à: {$reservation->email}");
            } catch (\Exception $e) {
                $this->error("Erreur d'action pour {$reservation->email}: " . $e->getMessage());
            }
        }
    }
}
