<?php

use App\Models\PaymentMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('payment_transactions') && !Schema::hasColumn('payment_transactions', 'payment_provider')) {
            Schema::table('payment_transactions', function (Blueprint $table) {
                $table->string('payment_provider', 50)->default('yookassa')->after('payment_method_slug');
            });
        }

        if (!Schema::hasTable('payment_methods')) {
            return;
        }

        $this->updatePaymentMethods();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('payment_transactions') && Schema::hasColumn('payment_transactions', 'payment_provider')) {
            Schema::table('payment_transactions', function (Blueprint $table) {
                $table->dropColumn('payment_provider');
            });
        }
    }

    /**
     * Ensure UI payment methods are handled by the unified YooKassa gateway.
     */
    protected function updatePaymentMethods(): void
    {
        $slugs = ['sbp', 'bankcard', 'sberpay', 'tinkoff'];
        $gatewayClass = \App\Services\Payment\YooKassaGateway::class;

        PaymentMethod::whereIn('slug', $slugs)->get()->each(function (PaymentMethod $method) use ($gatewayClass) {
            $settings = $method->settings ?? [];

            $settings['payment_method_data'] = $settings['payment_method_data'] ?? match ($method->slug) {
                'sbp' => ['type' => 'sbp'],
                'sberpay' => ['type' => 'sberbank'],
                'tinkoff' => ['type' => 'tinkoff_bank'],
                default => ['type' => 'bank_card'],
            };

            if ($method->slug === 'sbp' && empty($settings['confirmation'])) {
                $settings['confirmation'] = ['type' => 'qr'];
            }

            $method->gateway = $gatewayClass;
            $method->settings = $settings;
            $method->save();
        });
    }
};
