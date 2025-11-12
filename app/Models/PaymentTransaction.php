<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'fundraiser_id',
        'project_id',
        'project_stage_id',
        'payment_method_id',
        'transaction_id',
        'external_id',
        'amount',
        'currency',
        'status',
        'payment_method_slug',
        'payment_details',
        'gateway_response',
        'webhook_data',
        'description',
        'return_url',
        'callback_url',
        'success_url',
        'failure_url',
        'expires_at',
        'paid_at',
        'failed_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_details' => 'array',
        'gateway_response' => 'array',
        'webhook_data' => 'array',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Статусы транзакций
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    /**
     * Связь с организацией
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Связь с фандрайзером
     */
    public function fundraiser(): BelongsTo
    {
        return $this->belongsTo(Fundraiser::class);
    }

    /**
     * Связь с проектом
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function projectStage(): BelongsTo
    {
        return $this->belongsTo(ProjectStage::class);
    }

    /**
     * Связь с методом платежа
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Связь с донатом
     */
    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }

    /**
     * Связь с логами
     */
    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    /**
     * Scope для активных транзакций
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope для завершенных транзакций
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope для неудачных транзакций
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope для организации
     */
    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope для фандрайзера
     */
    public function scopeForFundraiser($query, int $fundraiserId)
    {
        return $query->where('fundraiser_id', $fundraiserId);
    }

    /**
     * Scope для проекта
     */
    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeForProjectStage($query, int $projectStageId)
    {
        return $query->where('project_stage_id', $projectStageId);
    }

    /**
     * Проверка статуса
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function isRefunded(): bool
    {
        return $this->status === self::STATUS_REFUNDED;
    }

    /**
     * Проверка истечения времени
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    /**
     * Получение суммы в рублях
     */
    public function getAmountInRublesAttribute(): float
    {
        return $this->amount / 100;
    }

    /**
     * Получение суммы в рублях с форматированием
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount / 100, 0, ',', ' ') . ' ₽';
    }

    /**
     * Получение маскированных данных платежа
     */
    public function getMaskedPaymentDetailsAttribute(): array
    {
        if (!$this->payment_details) {
            return [];
        }

        $masked = $this->payment_details;

        // Маскируем чувствительные данные
        if (isset($masked['card_number'])) {
            $masked['card_number'] = $this->maskCardNumber($masked['card_number']);
        }

        if (isset($masked['phone'])) {
            $masked['phone'] = $this->maskPhone($masked['phone']);
        }

        if (isset($masked['email'])) {
            $masked['email'] = $this->maskEmail($masked['email']);
        }

        return $masked;
    }

    /**
     * Маскирование номера карты
     */
    private function maskCardNumber(string $cardNumber): string
    {
        if (strlen($cardNumber) < 8) {
            return $cardNumber;
        }

        return substr($cardNumber, 0, 4) . ' **** **** ' . substr($cardNumber, -4);
    }

    /**
     * Маскирование телефона
     */
    private function maskPhone(string $phone): string
    {
        if (strlen($phone) < 7) {
            return $phone;
        }

        return substr($phone, 0, 3) . ' *** ** ' . substr($phone, -2);
    }

    /**
     * Маскирование email
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return $email;
        }

        $name = $parts[0];
        $domain = $parts[1];

        if (strlen($name) <= 2) {
            return $name . '@' . $domain;
        }

        return substr($name, 0, 2) . '***@' . $domain;
    }

    /**
     * Генерация уникального transaction_id
     */
    public static function generateTransactionId(): string
    {
        return 'txn_' . time() . '_' . strtoupper(substr(uniqid(), -8));
    }
}
