<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payments\YooKassaPartnerEvent;
use App\Services\Payments\YooKassa\YooKassaPartnerWebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class YooKassaPartnerWebhookController extends Controller
{
    public function __construct(
        protected YooKassaPartnerWebhookService $webhookService
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $payload = $request->all();

        Log::info('YooKassa partner webhook received', ['payload' => $payload]);

        /** @var YooKassaPartnerEvent $event */
        $event = $this->webhookService->registerEvent($payload);

        $this->webhookService->handle($event);

        return response()->json(['status' => 'ok']);
    }
}

