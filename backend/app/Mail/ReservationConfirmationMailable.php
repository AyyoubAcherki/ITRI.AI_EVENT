<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmationMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $confirmationUrl;
    public $cancellationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($reservation, $confirmationUrl, $cancellationUrl)
    {
        $this->reservation = $reservation;
        $this->confirmationUrl = $confirmationUrl;
        $this->cancellationUrl = $cancellationUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmation de votre réservation - AI ITRI NTIC EVENT',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.confirmation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
