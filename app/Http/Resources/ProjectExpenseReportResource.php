<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectExpenseReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'title'               => $this->title,
            'amount_kopecks'      => $this->amount_kopecks,
            'formatted_amount'    => $this->formatted_amount,
            'status'              => $this->status,
            'status_label'        => $this->status_label,
            'report_date'         => $this->report_date->format('Y-m-d'),
            'formatted_date'      => $this->formatted_date,
            'pdf_url'             => $this->pdf_url,
            'pdf_file_size'       => $this->pdf_file_size,
            'formatted_file_size' => $this->formatted_file_size,
            'created_at'          => optional($this->created_at)->toISOString(),
        ];
    }
}
