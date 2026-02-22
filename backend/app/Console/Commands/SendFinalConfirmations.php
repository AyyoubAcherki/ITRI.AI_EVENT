<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Mail\FinalConfirmationMailable;
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
        $eventStartDate = '2026-05-14';
        $reminderDate = date('Y-m-d', strtotime($eventStartDate . ' -10 days')); // 2026-05-04
        $finalConfirmationDate = '2026-03-16';

        // 1. Final Confirmation (on March 16) - for CONFIRMED users
        if ($today === $finalConfirmationDate) {
            $this->sendFinalNotices();
        }

        // 2. Reminder (10 days before event) - for PENDING users
        if ($today === $reminderDate) {
            $this->sendEventReminders();
        }

        // For manual testing/triggering if needed, we could add flags
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

    protected function sendEventReminders()
    {
        $reservations = Reservation::where('status', 'pending')
            ->whereNull('notified_at_reminder')
            ->get();

        $this->info("Envoi de " . $reservations->count() . " emails de rappel (10 jours avant)...");

        foreach ($reservations as $reservation) {
            try {
                $confirmationUrl = config('app.frontend_url', 'http://localhost:3000') . '/confirm-reservation?token=' . $reservation->confirmation_token;
                $cancellationUrl = config('app.frontend_url', 'http://localhost:3000') . '/cancel-reservation?token=' . $reservation->confirmation_token;
                
                // We reuse the same mailable but could use a different one if needed
                Mail::to($reservation->email)->send(new ReservationConfirmationMailable($reservation, $confirmationUrl, $cancellationUrl));
                
                $reservation->update(['notified_at_reminder' => now()]);
                $this->line("Rappel envoyé à: {$reservation->email}");
            } catch (\Exception $e) {
                $this->error("Erreur de rappel pour {$reservation->email}: " . $e->getMessage());
            }
        }
    }
}
