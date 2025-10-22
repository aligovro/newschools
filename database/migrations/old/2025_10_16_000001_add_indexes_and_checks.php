<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->index(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->index(['type']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->index(['region_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->index(['slug']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->index(['created_at']);
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->index(['organization_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->index(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->index(['slug']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->index(['created_at']);
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->index(['organization_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->index(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->index(['created_at']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->index(['member_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->index(['project_id']);
            });
        } catch (\Throwable $e) {
        }

        // Add check constraints when supported (MySQL 8.0+/Postgres)
        try {
            Schema::getConnection()->statement("ALTER TABLE organizations ADD CONSTRAINT chk_organizations_status CHECK (status IN ('active','inactive','pending'))");
        } catch (\Throwable $e) {
        }

        try {
            Schema::getConnection()->statement("ALTER TABLE organization_sites ADD CONSTRAINT chk_organization_sites_status CHECK (status IN ('draft','published','archived'))");
        } catch (\Throwable $e) {
        }

        try {
            Schema::getConnection()->statement("ALTER TABLE donations ADD CONSTRAINT chk_donations_status CHECK (status IN ('pending','completed','failed','cancelled','refunded'))");
        } catch (\Throwable $e) {
        }
    }

    public function down(): void
    {
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropIndex(['type']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropIndex(['region_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropIndex(['slug']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->dropIndex(['organization_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->dropIndex(['slug']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('organization_sites', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropIndex(['organization_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropIndex(['member_id']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropIndex(['project_id']);
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::getConnection()->statement("ALTER TABLE organizations DROP CONSTRAINT chk_organizations_status");
        } catch (\Throwable $e) {
        }
        try {
            Schema::getConnection()->statement("ALTER TABLE organization_sites DROP CONSTRAINT chk_organization_sites_status");
        } catch (\Throwable $e) {
        }
        try {
            Schema::getConnection()->statement("ALTER TABLE donations DROP CONSTRAINT chk_donations_status");
        } catch (\Throwable $e) {
        }
    }
};
