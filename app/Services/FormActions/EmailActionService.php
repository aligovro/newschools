<?php

namespace App\Services\FormActions;

use App\Models\FormSubmission;
use App\Mail\FormSubmissionMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailActionService
{
    public function execute(FormSubmission $submission, array $config): bool
    {
        try {
            $to = $config['to'] ?? [];
            $subject = $config['subject'] ?? 'Новая отправка формы';
            $template = $config['template'] ?? 'emails.form-submission';

            if (empty($to)) {
                Log::error('Email action: No recipients specified', [
                    'submission_id' => $submission->id,
                    'config' => $config
                ]);
                return false;
            }

            // Подготавливаем данные для письма
            $emailData = [
                'submission' => $submission,
                'form_data' => $submission->data,
                'form_widget' => $submission->formWidget,
                'site' => $submission->formWidget->site,
            ];

            // Отправляем email
            Mail::to($to)->send(new FormSubmissionMail($submission));

            Log::info('Email action executed successfully', [
                'submission_id' => $submission->id,
                'recipients' => $to,
                'subject' => $subject
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Email action failed', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
                'config' => $config
            ]);
            return false;
        }
    }
}
