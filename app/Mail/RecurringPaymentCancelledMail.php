<?php

namespace App\Mail;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RecurringPaymentCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Donation $donation,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ваша подписка на автоплатёж отменена',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.recurring-payment-cancelled',
            with: [
                'donation'     => $this->donation,
                'organization' => $this->donation->organization,
                'amountFormatted' => $this->donation->formatted_amount,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
