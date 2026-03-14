<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Унификация поля сортировки: везде используем только sort_order.
     * - site_widgets: синхронизируем order → sort_order, удаляем order
     * - widget_positions: order → sort_order
     * - project_stages: order → sort_order
     */
    public function up(): void
    {
        // 1. site_widgets: sync order → sort_order (если sort_order пуст/0, а order задан)
        if (Schema::hasColumn('site_widgets', 'order')) {
            DB::table('site_widgets')
                ->where(function ($q) {
                    $q->whereNull('sort_order')->orWhere('sort_order', '<=', 0);
                })
                ->where('order', '>', 0)
                ->update(['sort_order' => DB::raw('`order`')]);

            try {
                Schema::table('site_widgets', fn (Blueprint $t) => $t->dropIndex(['position_id', 'order']));
            } catch (\Throwable) {
                // Index may not exist
            }
            try {
                Schema::table('site_widgets', fn (Blueprint $t) => $t->dropIndex(['order']));
            } catch (\Throwable) {
                // Index may not exist
            }
            Schema::table('site_widgets', fn (Blueprint $t) => $t->dropColumn('order'));
        }

        // 2. widget_positions: order → sort_order
        if (!Schema::hasColumn('widget_positions', 'sort_order')) {
            Schema::table('widget_positions', function (Blueprint $table) {
                $table->integer('sort_order')->default(0)->after('area');
            });
        }
        if (Schema::hasColumn('widget_positions', 'order')) {
            DB::table('widget_positions')->update(['sort_order' => DB::raw('`order`')]);
            try {
                Schema::table('widget_positions', fn (Blueprint $t) => $t->dropIndex(['order']));
            } catch (\Throwable) {
                // Index may not exist
            }
            Schema::table('widget_positions', fn (Blueprint $t) => $t->dropColumn('order'));
        }
        try {
            Schema::table('widget_positions', fn (Blueprint $t) => $t->index('sort_order'));
        } catch (\Throwable) {
            // Index may already exist
        }

        // 3. project_stages: order → sort_order
        Schema::table('project_stages', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('collected_amount');
        });

        DB::table('project_stages')->update(['sort_order' => DB::raw('`order`')]);

        Schema::table('project_stages', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }

    public function down(): void
    {
        // project_stages: sort_order → order
        Schema::table('project_stages', function (Blueprint $table) {
            $table->integer('order')->default(0)->after('collected_amount');
        });

        DB::table('project_stages')->update(['order' => DB::raw('sort_order')]);

        Schema::table('project_stages', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        // widget_positions: sort_order → order
        Schema::table('widget_positions', function (Blueprint $table) {
            $table->dropIndex(['sort_order']);
        });

        Schema::table('widget_positions', function (Blueprint $table) {
            $table->integer('order')->default(0)->after('area');
        });

        DB::table('widget_positions')->update(['order' => DB::raw('sort_order')]);

        Schema::table('widget_positions', function (Blueprint $table) {
            $table->dropColumn('sort_order');
            $table->index('order');
        });

        // site_widgets: add order back, copy from sort_order
        Schema::table('site_widgets', function (Blueprint $table) {
            $table->integer('order')->default(0)->after('sort_order');
        });

        DB::table('site_widgets')->update(['order' => DB::raw('sort_order')]);

        Schema::table('site_widgets', function (Blueprint $table) {
            $table->index(['position_id', 'order']);
            $table->index('order');
        });
    }
};
