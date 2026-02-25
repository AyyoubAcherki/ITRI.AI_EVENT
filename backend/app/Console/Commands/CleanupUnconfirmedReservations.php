<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Models\Waitlist;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Mail\WaitlistSpotAvailableMailable;
use Carbon\Carbon;

class CleanupUnconfirmedReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:cleanup-unconfirmed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove reservations that have been pending for more than 48 hours and notify waitlist';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of unconfirmed reservations...');

        // Find reservations pending for more than 48 hours AFTER receiving the March 25th email
        $threshold = Carbon::now()->subHours(48);

        $expiredReservations = Reservation::where('status', 'pending')
            ->whereNotNull('notified_at_reminder')
            ->where('notified_at_reminder', '<', $threshold)
            ->get();

        if ($expiredReservations->isEmpty()) {
            $this->info('No expired reservations found.');
            return;
        }

        $count = 0;
        foreach ($expiredReservations as $reservation) {
            Log::info("Auto-cancelling expired reservation ID {$reservation->id} for {$reservation->email}");

            // Delete associated seats first to free them up
            DB::table('reservation_seats')->where('reservation_id', $reservation->id)->delete();

            // Delete the reservation entirely (or mark as expired)
            $reservation->delete();
            $count++;

            // Notify waitlist
            $this->notifyNextOnWaitlist();
        }

        $this->info("Successfully cleaned up {$count} expired reservations.");
    }

    /**
     * Notify the next person on the waitlist.
     */
    protected function notifyNextOnWaitlist()
    {
        $nextInLine = Waitlist::where('status', 'waiting')
            ->orderBy('created_at', 'asc')
            ->first();

        if ($nextInLine) {
            try {
                // Send email notification
                $reservationUrl = config('app.frontend_url', 'http://localhost:3000') . '/reservation';
                Mail::to($nextInLine->email)->send(new WaitlistSpotAvailableMailable($nextInLine, $reservationUrl));

                // Update status to notified
                $nextInLine->update([
                    'status' => 'notified',
                    'notified_at' => now(),
                ]);

                $this->info("Notified waitlist user: {$nextInLine->email}");
                Log::info("Waitlist spot available sent to {$nextInLine->email}");
            } catch (\Exception $e) {
                Log::error('Failed to notify waitlist user ' . $nextInLine->email . ': ' . $e->getMessage());
            }
        }
    }
}
