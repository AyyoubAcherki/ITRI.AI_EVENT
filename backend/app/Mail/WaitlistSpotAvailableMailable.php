<?php

namespace App\Mail;

use App\Models\Waitlist;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WaitlistSpotAvailableMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $waitlist;
    public $reservationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Waitlist $waitlist, string $reservationUrl)
    {
        $this->waitlist = $waitlist;
        $this->reservationUrl = $reservationUrl;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Une place s\'est libérée - AI ITRI NTIC EVENT')
            ->view('emails.waitlist_spot');
    }
}
