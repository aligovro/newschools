<?php

namespace App\Mail;

use App\Models\ClubApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClubApplicationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ClubApplication $application,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Новая заявка на секцию: ' . $this->application->club_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.club-application',
            with: [
                'application'  => $this->application,
                'organization' => $this->application->organization,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
