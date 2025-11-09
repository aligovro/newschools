<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportRunResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'report_id' => $this->report_id,
            'report_type' => $this->report_type,
            'status' => $this->status,
            'format' => $this->format,
            'filters' => $this->filters ?? [],
            'meta' => $this->meta ?? [],
            'summary' => $this->summary ?? [],
            'data' => $this->when($request->boolean('with_data', false), $this->data ?? []),
            'rows_count' => $this->rows_count,
            'generated_at' => optional($this->generated_at)->toISOString(),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                ];
            }),
            'report' => $this->whenLoaded('report', function () {
                return [
                    'id' => $this->report->id,
                    'title' => $this->report->title,
                ];
            }),
            'project' => $this->whenLoaded('project', function () {
                return [
                    'id' => $this->project->id,
                    'title' => $this->project->title,
                ];
            }),
            'project_stage' => $this->whenLoaded('projectStage', function () {
                return [
                    'id' => $this->projectStage->id,
                    'title' => $this->projectStage->title,
                ];
            }),
            'generated_by' => $this->whenLoaded('generator', function () {
                return [
                    'id' => $this->generator->id,
                    'name' => $this->generator->name,
                    'email' => $this->generator->email,
                ];
            }),
        ];
    }
}


