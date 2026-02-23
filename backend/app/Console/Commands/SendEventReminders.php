<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendEventReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-event-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp reminders to pending reservations 10 days before the event';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $eventDate = \Carbon\Carbon::create(2026, 5, 14); // Event Date: May 14, 2026
        $today = \Carbon\Carbon::now();

        // Calculate difference in days
        // We want to send it exactly 10 days before
        // diffInDays returns integer, absolute value usually, so we check precise date comparison or diff
        $diffDays = $today->diffInDays($eventDate, false); // false = return negative if today is after event

        // Logic from user request: if (diffDays === 10)
        // Note: diffInDays might return 9 or 10 depending on time. 
        // Safer to check if today is the specific date: 2026-05-04
        $reminderDate = $eventDate->copy()->subDays(10);

        // For testing/demonstration purposes, we might want to allow forcing it or check exact date
        // But strict implementation of "10 days before":
        if (!$today->isSameDay($reminderDate)) {
            $this->info("Today is not the reminder date ({$reminderDate->toDateString()}). No reminders sent.");
            return;
        }

        $this->info("Running reminder for event date: {$eventDate->toDateString()}");

        $pendingReservations = \App\Models\Reservation::where('status', 'pending')
            ->whereNull('notified_at_reminder')
            ->get();

        $count = 0;
        $whatsAppService = new \App\Services\WhatsAppService();

        foreach ($pendingReservations as $reservation) {
            try {
                $message = "Rappel : Il ne reste que 10 jours avant l'événement AI ITRI NTIC ! Veuillez confirmer votre présence en vérifiant votre email.";

                $sent = $whatsAppService->send($reservation->phone, $message);

                if ($sent) {
                    $reservation->update(['notified_at_reminder' => now()]);
                    $count++;
                    $this->info("Reminder sent to: {$reservation->email}");
                } else {
                    $this->error("Failed to send to: {$reservation->email}");
                }
            } catch (\Exception $e) {
                $this->error("Error sending to {$reservation->email}: " . $e->getMessage());
            }
        }

        $this->info("Sent {$count} reminders.");
    }
}
