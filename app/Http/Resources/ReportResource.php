<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'report_type' => $this->report_type,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'filters' => $this->filters ?? [],
            'meta' => $this->meta ?? [],
            'summary' => $this->summary ?? [],
            'generated_at' => optional($this->generated_at)->toISOString(),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
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
            'site' => $this->whenLoaded('site', function () {
                return [
                    'id' => $this->site->id,
                    'name' => $this->site->name,
                    'status' => $this->site->status,
                ];
            }),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'updater' => $this->whenLoaded('updater', function () {
                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                    'email' => $this->updater->email,
                ];
            }),
            'runs_count' => $this->when(isset($this->runs_count), $this->runs_count),
            'latest_run' => $this->whenLoaded('latestRun', function () {
                return $this->latestRun
                    ? (new ReportRunResource($this->latestRun))->toArray(request())
                    : null;
            }, null),
        ];
    }
}


