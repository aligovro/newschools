<?php

namespace App\Mail;

use App\Models\FormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FormSubmissionMail extends Mailable
{
  use Queueable, SerializesModels;

  public function __construct(
    public FormSubmission $submission
  ) {}

  public function envelope(): Envelope
  {
    return new Envelope(
      subject: 'Новая отправка формы: ' . $this->submission->formWidget->name,
    );
  }

  public function content(): Content
  {
    return new Content(
      view: 'emails.form-submission',
      with: [
        'submission' => $this->submission,
        'formData' => $this->submission->data,
        'formWidget' => $this->submission->formWidget,
        'site' => $this->submission->formWidget->site,
      ]
    );
  }

  public function attachments(): array
  {
    return [];
  }
}
