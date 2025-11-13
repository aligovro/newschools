<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodsSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $paymentMethods = [
      [
        'name' => 'Система быстрых платежей (СБП)',
        'slug' => 'sbp',
        'gateway' => 'App\Services\Payment\YooKassaGateway',
        'icon' => 'sbp.svg',
        'description' => 'Оплата через СБП - быстро, безопасно и удобно',
        'settings' => [
          'shop_id' => env('YOOKASSA_SHOP_ID', ''),
          'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
          'payment_method_data' => ['type' => 'sbp'],
          'confirmation' => ['type' => 'qr'],
        ],
        'fee_percentage' => 0.00, // СБП обычно без комиссии
        'fee_fixed' => 0,
        'min_amount' => 100, // 1 рубль
        'max_amount' => 0, // без ограничений
        'is_active' => true,
        'is_test_mode' => env('YOOKASSA_TEST_MODE', true),
        'sort_order' => 1,
      ],
      [
        'name' => 'Банковская карта',
        'slug' => 'bankcard',
        'gateway' => 'App\Services\Payment\YooKassaGateway',
        'icon' => 'bankcard.svg',
        'description' => 'Оплата банковской картой Visa, Mastercard, МИР',
        'settings' => [
          'shop_id' => env('YOOKASSA_SHOP_ID', ''),
          'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
          'payment_method_data' => ['type' => 'bank_card'],
        ],
        'fee_percentage' => 2.90, // Комиссия ЮKassa
        'fee_fixed' => 0,
        'min_amount' => 100, // 1 рубль
        'max_amount' => 0, // без ограничений
        'is_active' => true,
        'is_test_mode' => env('YOOKASSA_TEST_MODE', true),
        'sort_order' => 2,
      ],
      [
        'name' => 'Сбербанк',
        'slug' => 'sberpay',
        'gateway' => 'App\Services\Payment\YooKassaGateway',
        'icon' => 'sberpay.svg',
        'description' => 'Оплата через Сбербанк Онлайн',
        'settings' => [
          'shop_id' => env('YOOKASSA_SHOP_ID', ''),
          'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
          'payment_method_data' => ['type' => 'sberbank'],
        ],
        'fee_percentage' => 2.90,
        'fee_fixed' => 0,
        'min_amount' => 100,
        'max_amount' => 0,
        'is_active' => true,
        'is_test_mode' => env('YOOKASSA_TEST_MODE', true),
        'sort_order' => 3,
      ],
      [
        'name' => 'Тинькофф',
        'slug' => 'tinkoff',
        'gateway' => 'App\Services\Payment\YooKassaGateway',
        'icon' => 'tinkoff.svg',
        'description' => 'Оплата через Тинькофф Банк',
        'settings' => [
          'shop_id' => env('YOOKASSA_SHOP_ID', ''),
          'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
          'payment_method_data' => ['type' => 'tinkoff_bank'],
        ],
        'fee_percentage' => 2.75, // Комиссия Тинькофф
        'fee_fixed' => 0,
        'min_amount' => 100,
        'max_amount' => 0,
        'is_active' => true,
        'is_test_mode' => env('TINKOFF_TEST_MODE', true),
        'sort_order' => 4,
      ],
      [
        'name' => 'Наличные',
        'slug' => 'cash',
        'gateway' => null, // Для наличных платежей шлюз не нужен
        'icon' => 'cash.svg',
        'description' => 'Оплата наличными в офисе организации',
        'settings' => [],
        'fee_percentage' => 0.00,
        'fee_fixed' => 0,
        'min_amount' => 100,
        'max_amount' => 0,
        'is_active' => true,
        'is_test_mode' => false,
        'sort_order' => 5,
      ],
    ];

    foreach ($paymentMethods as $methodData) {
      PaymentMethod::updateOrCreate(
        ['slug' => $methodData['slug']],
        $methodData
      );
    }

    $this->command->info('Payment methods seeded successfully!');
  }
}
