<?php

namespace Database\Seeders;

use App\Models\Donation;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ReferralTestDataSeeder extends Seeder
{
  public function run(): void
  {
    // Choose or create an organization for test data
    $organization = Organization::query()->first();
    if (!$organization) {
      $organization = Organization::query()->create([
        'name' => 'Test Organization',
        'slug' => 'test-organization',
      ]);
    }

    // Create a few referrer users
    $referrers = [];
    for ($i = 1; $i <= 3; $i++) {
      $referrer = User::query()->firstOrCreate(
        ['email' => "referrer{$i}@example.com"],
        [
          'name' => "Referrer {$i}",
          'password' => Hash::make('password'),
        ]
      );
      $referrers[] = $referrer;
    }

    // For each referrer, create a few referred users and donations
    foreach ($referrers as $referrer) {
      for ($u = 1; $u <= 4; $u++) {
        $referred = User::query()->firstOrCreate(
          ['email' => "referred_{$referrer->id}_{$u}@example.com"],
          [
            'name' => "Referred {$referrer->id}-{$u}",
            'password' => Hash::make('password'),
          ]
        );

        // Set referral relation without mass-assignment issues
        if (empty($referred->referred_by_id)) {
          $referred->referred_by_id = $referrer->id;
          $referred->save();
        }

        // Create 1-2 completed donations attributed to the referrer
        $numDonations = random_int(1, 2);
        for ($d = 0; $d < $numDonations; $d++) {
          Donation::query()->create([
            'organization_id' => $organization->id,
            'fundraiser_id' => null,
            'project_id' => null,
            'donor_id' => $referred->id,
            'referrer_user_id' => $referrer->id,
            'payment_transaction_id' => null,
            'amount' => random_int(1_000, 50_000), // in minor units if you use them, else adjust
            'currency' => 'RUB',
            'status' => 'completed',
            'payment_method' => 'card',
            'payment_id' => null,
            'transaction_id' => 'TEST-' . uniqid(),
            'is_anonymous' => false,
            'donor_name' => $referred->name,
            'donor_email' => $referred->email,
            'send_receipt' => false,
            'payment_details' => [],
            'webhook_data' => [],
            'paid_at' => now()->subDays(random_int(0, 30)),
          ]);
        }
      }
    }

    $this->command?->info('✅ Referral test data seeded for organization ID: ' . $organization->id);
  }
}
