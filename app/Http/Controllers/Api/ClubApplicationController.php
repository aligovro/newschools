<?php

namespace App\Http\Controllers\Api;

use App\Enums\ClubApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClubApplication\StoreClubApplicationRequest;
use App\Mail\ClubApplicationMail;
use App\Models\ClubApplication;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ClubApplicationController extends Controller
{
    public function store(StoreClubApplicationRequest $request): JsonResponse
    {
        $organization = Organization::find($request->organization_id);

        $application = ClubApplication::create([
            'organization_id' => $request->organization_id,
            'club_id'         => $request->club_id,
            'club_name'       => $request->club_name,
            'applicant_name'  => $request->name,
            'phone'           => $request->phone,
            'comment'         => $request->comment,
            'status'          => ClubApplicationStatus::Pending,
            'ip_address'      => $request->ip(),
        ]);

        if ($organization?->email) {
            try {
                Mail::to($organization->email)->send(new ClubApplicationMail($application));
            } catch (\Throwable) {
                // Не прерываем ответ при ошибке отправки письма
            }
        }

        return response()->json([
            'message' => 'Заявка успешно отправлена',
        ], 201);
    }
}
