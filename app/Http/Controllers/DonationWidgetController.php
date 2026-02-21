<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\PaymentMethod;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\PaymentTransaction;
use App\Models\Donation;
use App\Services\Payment\PaymentService;
use App\Services\DonationWidget\DonationWidgetDataService;
use App\Services\BankRequisites\BankRequisitesResolver;
use App\Services\BankRequisites\BankRequisitesQrCodeGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Dompdf\Dompdf;
use Dompdf\Options;

class DonationWidgetController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected DonationWidgetDataService $widgetDataService,
        protected BankRequisitesResolver $bankRequisitesResolver,
        protected BankRequisitesQrCodeGenerator $qrCodeGenerator
    ) {
    }

    /**
     * Получение данных виджета
     */
    public function getWidgetData(Request $request, Organization $organization)
    {
        $fundraiserId = $request->input('fundraiser_id');
        $projectId = $request->input('project_id');
        $siteId = $request->input('site_id');

        $data = $this->widgetDataService->getWidgetData(
            $organization,
            $fundraiserId,
            $projectId,
            $siteId
        );

        return response()->json($data);
    }


    /**
     * Создание пожертвования
     */
    public function createDonation(Request $request, Organization $organization)
    {
        // Валидация входных данных
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:RUB,USD,EUR',
            'payment_method_slug' => 'required|string|exists:payment_methods,slug',
            'fundraiser_id' => 'nullable|exists:fundraisers,id',
            'project_id' => 'nullable|exists:projects,id',
            'project_stage_id' => 'nullable|exists:project_stages,id',
            'donor_name' => 'required_if:is_anonymous,false|string|max:255',
            'donor_email' => 'nullable|email|max:255',
            'donor_phone' => 'nullable|string|max:20',
            'donor_message' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_period' => 'nullable|required_if:is_recurring,true|in:daily,weekly,monthly',
            'send_receipt' => 'boolean',
            'success_url' => 'nullable|url',
            'failure_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        try {
            // Проверяем, что fundraiser и project принадлежат организации
            $fundraiser = null;
            $project = null;
            $projectStage = null;

            if (isset($data['fundraiser_id'])) {
                $fundraiser = Fundraiser::where('id', $data['fundraiser_id'])
                    ->where('organization_id', $organization->id)
                    ->firstOrFail();
            }

            if (isset($data['project_id'])) {
                $project = Project::where('id', $data['project_id'])
                    ->where('organization_id', $organization->id)
                    ->firstOrFail();
            }

            if (isset($data['project_stage_id'])) {
                $projectStage = ProjectStage::where('id', $data['project_stage_id'])
                    ->when($project, function ($query) use ($project) {
                        $query->where('project_id', $project->id);
                    })
                    ->firstOrFail();

                if (!$project) {
                    $project = $projectStage->project;

                    if (!$project || $project->organization_id !== $organization->id) {
                        throw new \InvalidArgumentException('Stage does not belong to organization');
                    }

                    $data['project_id'] = $project->id;
                }
            }

            if ($project && !$projectStage && $project->has_stages) {
                $activeStage = $project->stages()
                    ->where('status', 'active')
                    ->orderBy('order')
                    ->first();

                if ($activeStage) {
                    $projectStage = $activeStage;
                    $data['project_stage_id'] = $activeStage->id;
                }
            }

            if ($projectStage && $project && (int) $projectStage->project_id !== (int) $project->id) {
                throw new \InvalidArgumentException('Stage does not belong to the specified project');
            }

            // Конвертируем сумму в копейки
            $amountInKopeks = (int) round($data['amount'] * 100);

            // Проверяем минимальную и максимальную сумму
            $paymentMethod = PaymentMethod::where('slug', $data['payment_method_slug'])
                ->where('is_active', true)
                ->firstOrFail();

            if (!$paymentMethod->isValidAmount($amountInKopeks)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Неверная сумма платежа',
                ], 422);
            }

            // Создаем платеж через PaymentService
            $paymentData = [
                'organization_id' => $organization->id,
                'fundraiser_id' => $data['fundraiser_id'] ?? null,
                'project_id' => $data['project_id'] ?? null,
                'project_stage_id' => $data['project_stage_id'] ?? null,
                'payment_method_slug' => $data['payment_method_slug'],
                'amount' => $amountInKopeks,
                'currency' => $data['currency'],
                'description' => $data['is_anonymous']
                    ? 'Анонимное пожертвование'
                    : "Пожертвование от {$data['donor_name']}",
                'donor_name' => $data['is_anonymous'] ? 'Анонимный донор' : $data['donor_name'],
                'donor_email' => $data['donor_email'] ?? null,
                'donor_phone' => $data['donor_phone'] ?? null,
                'donor_message' => $data['donor_message'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'send_receipt' => $data['send_receipt'] ?? true,
                'success_url' => $data['success_url'] ?? url('/donation/success'),
                'failure_url' => $data['failure_url'] ?? url('/donation/failure'),
                'is_recurring' => $data['is_recurring'] ?? false,
                'recurring_period' => $data['recurring_period'] ?? null,
            ];

            $result = $this->paymentService->createPayment($paymentData);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating donation: ' . $e->getMessage(), [
                'organization_id' => $organization->id,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании пожертвования',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Получение статуса платежа
     */
    public function getPaymentStatus(Request $request, string $transactionId)
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'amount_rubles' => $transaction->amount_rubles,
                    'formatted_amount' => $transaction->formatted_amount,
                    'currency' => $transaction->currency,
                    'payment_method' => $transaction->payment_method_slug,
                    'created_at' => $transaction->created_at->toIso8601String(),
                    'updated_at' => $transaction->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Транзакция не найдена',
            ], 404);
        }
    }

    /**
     * Получение доступных методов оплаты для организации
     */
    public function getPaymentMethods(Organization $organization)
    {
        $organization->loadMissing('yookassaPartnerMerchant');
        $merchant = $organization->yookassaPartnerMerchant;
        $merchantStatus = $merchant?->status ?? 'inactive';
        $hasCredentials = $merchant
            && is_array($merchant->credentials)
            && !empty(data_get($merchant->credentials, 'shop_id'))
            && !empty(data_get($merchant->credentials, 'secret_key'));

        $isOperational = true;
        if ($merchant) {
            $isOperational = $merchantStatus === \App\Models\Payments\YooKassaPartnerMerchant::STATUS_ACTIVE || $hasCredentials;
        }

        $methods = PaymentMethod::active()->ordered()->get()->map(function ($method) use ($isOperational) {
            return [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'icon' => $method->icon,
                'description' => $method->description,
                'min_amount' => $method->min_amount,
                'max_amount' => $method->max_amount,
                'min_amount_rubles' => $method->min_amount / 100,
                'max_amount_rubles' => $method->max_amount > 0 ? $method->max_amount / 100 : null,
                'available' => $isOperational,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Публичные методы оплаты (для главного сайта, без организации)
     */
    public function getPaymentMethodsPublic()
    {
        $methods = PaymentMethod::active()->ordered()->get()->map(function ($method) {
            return [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'icon' => $method->icon,
                'description' => $method->description,
                'min_amount' => $method->min_amount,
                'max_amount' => $method->max_amount,
                'min_amount_rubles' => $method->min_amount / 100,
                'max_amount_rubles' => $method->max_amount > 0 ? $method->max_amount / 100 : null,
                'available' => true,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Получение списка сборов средств организации
     */
    public function getFundraisers(Organization $organization)
    {
        $fundraisers = Fundraiser::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($fundraiser) {
                return [
                    'id' => $fundraiser->id,
                    'title' => $fundraiser->title,
                    'short_description' => $fundraiser->short_description,
                    'target_amount' => $fundraiser->target_amount,
                    'collected_amount' => $fundraiser->collected_amount,
                    'progress_percentage' => $fundraiser->progress_percentage,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $fundraisers,
        ]);
    }

    /**
     * Получение списка проектов организации
     */
    public function getProjects(Organization $organization)
    {
        $projects = Project::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Генерация PDF с банковскими реквизитами
     */
    public function generateBankRequisitesPdf(Request $request, Organization $organization)
    {
        $projectId = $request->input('project_id');
        $siteId = $request->input('site_id');
        $amount = $request->input('amount');
        $currency = $request->input('currency', 'RUB');
        $donorName = $request->input('donor_name');
        $donorEmail = $request->input('donor_email');

        $requisites = $this->bankRequisitesResolver->resolve($organization, $projectId, $siteId);

        if (!$requisites || empty($requisites['text'])) {
            return response()->json([
                'success' => false,
                'message' => 'Банковские реквизиты не найдены',
            ], 404);
        }

        try {
            $amountFloat = is_numeric($amount) ? (float) $amount : 0;
            $requisites['amount'] = $amountFloat;
            $requisites['currency'] = $currency;
            $qrImageSrc = $this->prepareQrImageForPdf($requisites, $organization);

            $structured = $requisites['structured'] ?? null;
            $amountWords = $amountFloat > 0 && $currency === 'RUB' ? amount_to_words($amountFloat) : null;

            $logoDataUri = $this->resolveLogoDataUri($structured, $organization);

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('defaultFont', 'DejaVu Sans');
            $options->set('isPhpEnabled', true);
            $options->set('isFontSubsettingEnabled', true);

            $dompdf = new Dompdf($options);

            $html = view('pdf.bank-requisites', [
                'organization' => $organization,
                'requisites' => $requisites,
                'structured' => $structured,
                'project' => $projectId ? Project::find($projectId) : null,
                'qrImageSrc' => $qrImageSrc,
                'amount' => $amount,
                'amountFloat' => $amountFloat,
                'amountWords' => $amountWords,
                'currency' => $currency,
                'donorName' => $donorName,
                'donorEmail' => $donorEmail,
                'logoDataUri' => $logoDataUri,
            ])->render();

            $dompdf->loadHtml($html, 'UTF-8');
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = 'bank-requisites-' . $organization->id;
            if ($projectId) {
                $filename .= '-project-' . $projectId;
            }
            if ($siteId) {
                $filename .= '-site-' . $siteId;
            }
            $filename .= '.pdf';

            return response()->streamDownload(function () use ($dompdf) {
                echo $dompdf->output();
            }, $filename, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating bank requisites PDF', [
                'organization_id' => $organization->id,
                'project_id' => $projectId,
                'site_id' => $siteId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при генерации PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Логотип для PDF: приоритет — лого из реквизитов, иначе лого организации.
     */
    protected function resolveLogoDataUri(?array $structured, Organization $organization): ?string
    {
        $logoPath = $structured['logo'] ?? null;
        if (empty($logoPath)) {
            $logoPath = $organization->logo;
        }
        if (empty($logoPath) || !Storage::disk('public')->exists($logoPath)) {
            return null;
        }
        $contents = Storage::disk('public')->get($logoPath);
        $mime = match (strtolower(pathinfo($logoPath, PATHINFO_EXTENSION))) {
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'image/jpeg',
        };
        $b64 = preg_replace('/\s+/', '', base64_encode($contents));

        return 'data:' . $mime . ';base64,' . $b64;
    }

    /**
     * Подготовка изображения QR для PDF.
     * Убирает пробелы из base64 — DomPDF может не отображать изображения с пробелами в data URI.
     */
    protected function prepareQrImageForPdf(array $requisites, Organization $organization): ?string
    {
        $dataUri = $this->qrCodeGenerator->generatePngForPdf($requisites, $organization);
        if (!$dataUri || !str_contains($dataUri, 'base64,')) {
            return $dataUri;
        }

        $prefix = substr($dataUri, 0, strpos($dataUri, 'base64,') + 7);
        $base64 = substr($dataUri, strlen($prefix));
        $base64 = preg_replace('/\s+/', '', $base64);

        return $prefix . $base64;
    }
}
