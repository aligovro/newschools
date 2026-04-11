<?php

namespace App\Http\Controllers;

use App\Models\SiteWidgetConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicShareClickController extends Controller
{
    private const ALLOWED_NETWORKS = ['whatsapp', 'telegram', 'vk', 'max'];

    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'widget_id' => 'required|integer|exists:site_widgets,id',
            'network'   => 'required|string|in:' . implode(',', self::ALLOWED_NETWORKS),
        ]);

        $widgetId = (int) $request->widget_id;
        $network  = $request->network;

        $newCount = DB::transaction(function () use ($widgetId, $network): int {
            $configRow = SiteWidgetConfig::lockForUpdate()
                ->where('site_widget_id', $widgetId)
                ->where('config_key', 'counts')
                ->first();

            if ($configRow) {
                $counts = json_decode($configRow->config_value, true) ?? [];
                $counts[$network] = (int) ($counts[$network] ?? 0) + 1;
                $configRow->update(['config_value' => json_encode($counts)]);

                return $counts[$network];
            }

            SiteWidgetConfig::create([
                'site_widget_id' => $widgetId,
                'config_key'     => 'counts',
                'config_value'   => json_encode([$network => 1]),
                'config_type'    => 'json',
            ]);

            return 1;
        });

        return response()->json(['count' => $newCount]);
    }
}
