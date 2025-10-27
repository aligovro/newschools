<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
  // Сохранение платежных настроек проекта
  public function savePaymentSettings(Request $request, $id): JsonResponse
  {
    $request->validate([
      'gateway' => 'nullable|string|in:sbp,yookassa,tinkoff',
      'credentials' => 'nullable|array',
      'options' => 'nullable|array',
      'donation_min_amount' => 'nullable|integer|min:0',
      'donation_max_amount' => 'nullable|integer|min:0',
      'currency' => 'nullable|string|size:3',
      'test_mode' => 'nullable|boolean',
    ]);

    try {
      Log::info('Project payment settings save request', [
        'project_id' => $id,
        'payload' => $request->all(),
      ]);
      $project = $this->getProject($id);

      $payment = $project->payment_settings ?? [];
      $payment = array_merge($payment, $request->only([
        'gateway',
        'credentials',
        'options',
        'donation_min_amount',
        'donation_max_amount',
        'currency',
        'test_mode',
      ]));

      $project->update(['payment_settings' => $payment]);
      $project->refresh();

      Log::info('Project payment settings saved', [
        'project_id' => $project->id,
        'payment_settings' => $project->payment_settings,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Платежные настройки проекта сохранены',
        'payment_settings' => $project->payment_settings,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
      ], 500);
    }
  }

  private function getProject($id): Project
  {
    $user = Auth::user();
    if (!$user) {
      throw new \Exception('Пользователь не авторизован');
    }

    $isSuperAdmin = false;
    $hasRoleCallable = [$user, 'hasRole'];
    if (is_callable($hasRoleCallable)) {
      try {
        $isSuperAdmin = (bool) call_user_func($hasRoleCallable, 'super_admin');
      } catch (\Throwable $e) {
        $isSuperAdmin = false;
      }
    }

    if ($isSuperAdmin) {
      return Project::findOrFail($id);
    }

    if (!empty($user->organization_id)) {
      return Project::where('id', $id)
        ->where('organization_id', $user->organization_id)
        ->firstOrFail();
    }

    throw new \Exception('Пользователь не привязан к организации');
  }
}
