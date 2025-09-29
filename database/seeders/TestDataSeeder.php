<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Organization;
use App\Models\OrganizationDomain;

class TestDataSeeder extends Seeder
{
  public function run()
  {
    // Создаем тестовые домены для существующих организаций
    $organizations = Organization::all();

    foreach ($organizations as $organization) {
      OrganizationDomain::create([
        'organization_id' => $organization->id,
        'domain' => 'test-' . $organization->id . '.example.com',
        'is_primary' => true,
        'status' => 'active',
        'is_ssl_enabled' => false,
      ]);
    }

    echo "Created " . $organizations->count() . " test domains\n";
  }
}
