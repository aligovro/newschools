<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\SuggestedSchool;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SuggestedSchoolController extends Controller
{
    /**
     * Сохранение предложенной школы
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'nullable|exists:cities,id',
            'city_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            $suggestedSchool = SuggestedSchool::create([
                'name' => $validated['name'],
                'city_id' => $validated['city_id'] ?? null,
                'city_name' => $validated['city_name'] ?? null,
                'address' => $validated['address'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'status' => 'pending',
            ]);

            // Отправляем уведомление супер-админам
            $this->notifySuperAdmins($suggestedSchool);

            return response()->json([
                'success' => true,
                'message' => 'Школа успешно предложена. Мы рассмотрим вашу заявку в ближайшее время.',
                'data' => [
                    'id' => $suggestedSchool->id,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Ошибка при сохранении предложенной школы', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при отправке формы. Попробуйте позже.',
            ], 500);
        }
    }

    /**
     * Отправка уведомлений супер-админам
     */
    private function notifySuperAdmins(SuggestedSchool $suggestedSchool): void
    {
        try {
            // Получаем всех супер-админов
            $superAdmins = User::role('super_admin')->get();

            if ($superAdmins->isEmpty()) {
                Log::warning('Не найдено супер-админов для отправки уведомления о предложенной школе');
                return;
            }

            // Отправляем email каждому супер-админу
            foreach ($superAdmins as $admin) {
                try {
                    Mail::send('emails.suggested-school-notification', [
                        'suggestedSchool' => $suggestedSchool,
                        'admin' => $admin,
                    ], function ($message) use ($admin, $suggestedSchool) {
                        $message->to($admin->email, $admin->name)
                            ->subject('Новая предложенная школа: ' . $suggestedSchool->name);
                    });
                } catch (\Exception $e) {
                    Log::error('Ошибка отправки email супер-админу', [
                        'admin_id' => $admin->id,
                        'admin_email' => $admin->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Ошибка при отправке уведомлений супер-админам', [
                'error' => $e->getMessage(),
                'suggested_school_id' => $suggestedSchool->id,
            ]);
        }
    }
}
