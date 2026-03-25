<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClubApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'club_id'        => $this->club_id,
            'club_name'      => $this->club_name,
            'applicant_name' => $this->applicant_name,
            'phone'          => $this->phone,
            'email'          => $this->email,
            'comment'        => $this->comment,
            'status'         => $this->status->value,
            'status_label'   => $this->status->label(),
            'status_color'   => $this->status->color(),
            'reviewed_at'    => $this->reviewed_at?->format('d.m.Y H:i'),
            'created_at'     => $this->created_at->format('d.m.Y H:i'),
        ];
    }
}
