<?php

namespace App\Services\Projects;

use App\Models\Project;
use App\Models\ProjectStage;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProjectStageService
{
    public function deleteStagesWithMedia(Project $project): void
    {
        foreach ($project->stages as $stage) {
            if ($stage->image && Storage::disk('public')->exists($stage->image)) {
                Storage::disk('public')->delete($stage->image);
            }
            if ($stage->gallery) {
                foreach ($stage->gallery as $image) {
                    if (Storage::disk('public')->exists($image)) {
                        Storage::disk('public')->delete($image);
                    }
                }
            }
        }
        $project->stages()->delete();
    }

    public function saveStagesFromRequest(Project $project, Request $request): void
    {
        if (!$request->filled('stages') || !is_array($request->stages)) {
            return;
        }

        Log::info('Saving stages', ['count' => count($request->stages)]);
        Log::info('All uploaded files:', array_keys($request->allFiles()));

        $existingStages = $project->stages()->get()->keyBy('id');
        $processedIds = [];

        foreach ($request->stages as $index => $stageData) {
            $stageId = isset($stageData['id']) && is_numeric($stageData['id']) ? (int) $stageData['id'] : null;
            $stage = $stageId && $existingStages->has($stageId) ? $existingStages->get($stageId) : null;

            $targetAmount = 0;
            if (isset($stageData['target_amount'])) {
                $amount = is_numeric($stageData['target_amount']) ? (float) $stageData['target_amount'] : 0;
                $targetAmount = (int) ($amount * 100);
            }

            // Resolve image
            $newImagePath = $this->storeStageImage($request, $index, $stageData);
            $finalImage = null;
            $removeRequested = false;
            if (array_key_exists('remove_image', $stageData)) {
                $val = $stageData['remove_image'];
                $removeRequested = filter_var($val, FILTER_VALIDATE_BOOLEAN) || $val === 1 || $val === '1';
            }

            if ($newImagePath) {
                // Delete previous image if replaced
                if ($stage && $stage->image && Storage::disk('public')->exists($stage->image)) {
                    Storage::disk('public')->delete($stage->image);
                }
                $finalImage = $newImagePath;
            } elseif ($removeRequested) {
                // Remove current image if requested and no new upload
                if ($stage && $stage->image && Storage::disk('public')->exists($stage->image)) {
                    Storage::disk('public')->delete($stage->image);
                }
                $finalImage = null;
            } elseif (!empty($stageData['existing_image']) && is_string($stageData['existing_image'])) {
                $finalImage = $this->toRelativePath($stageData['existing_image']);
            } elseif ($stage) {
                $finalImage = $stage->image; // keep existing
            }

            // Resolve gallery: desired existing order from request + any newly uploaded
            $existingFromRequest = [];
            if (!empty($stageData['gallery']) && is_array($stageData['gallery'])) {
                foreach ($stageData['gallery'] as $img) {
                    if (is_string($img)) {
                        $existingFromRequest[] = $this->toRelativePath($img);
                    }
                }
            }
            $uploaded = $this->buildStageGallery($request, $index, $stageData);
            $finalGallery = array_values(array_filter(array_merge($existingFromRequest, $uploaded)));

            // If updating an existing stage, optionally delete removed gallery files
            if ($stage && is_array($stage->gallery)) {
                $toDelete = array_diff($stage->gallery, $finalGallery);
                foreach ($toDelete as $path) {
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $payload = [
                'title' => $stageData['title'] ?? '',
                'description' => $stageData['description'] ?? null,
                'target_amount' => $targetAmount,
                'image' => $finalImage,
                'gallery' => $finalGallery,
                'order' => $index + 1,
                'status' => $stageData['status'] ?? ($stage?->status ?? 'pending'),
            ];

            if ($stage) {
                $stage->update($payload);
                $processedIds[] = $stage->id;
            } else {
                $new = $project->stages()->create(array_merge($payload, [
                    'collected_amount' => 0,
                ]));
                $processedIds[] = $new->id;
            }
        }

        // Delete stages that were removed in the request
        $stagesToDelete = $project->stages()->whereNotIn('id', $processedIds)->get();
        foreach ($stagesToDelete as $toDelete) {
            if ($toDelete->image && Storage::disk('public')->exists($toDelete->image)) {
                Storage::disk('public')->delete($toDelete->image);
            }
            if (is_array($toDelete->gallery)) {
                foreach ($toDelete->gallery as $img) {
                    if (Storage::disk('public')->exists($img)) {
                        Storage::disk('public')->delete($img);
                    }
                }
            }
            $toDelete->delete();
        }
    }

    private function storeStageImage(Request $request, int $index, array $stageData): ?string
    {
        $keys = [
            "stages.{$index}.image_file",
            "stages.{$index}.image",
            "stages_{$index}_image",
        ];

        foreach ($keys as $key) {
            if ($request->hasFile($key)) {
                return $request->file($key)->store('projects/stages/images', 'public');
            }
        }

        return null;
    }

    private function buildStageGallery(Request $request, int $index, array $stageData): array
    {
        $gallery = [];

        // Note: existing gallery items are handled in saveStagesFromRequest to
        // allow proper diffing/deletion. Here we only process uploaded files.

        $allFiles = $request->allFiles();
        foreach ($allFiles as $key => $file) {
            if (
                preg_match("/^stages\\.{$index}\\.gallery(?:_files)?(?:[._](\\d+)|\\[\\d+\\])?$/", $key) ||
                preg_match("/^stages_{$index}_gallery_(\\d+)$/", $key)
            ) {
                if ($file instanceof \Illuminate\Http\UploadedFile) {
                    $gallery[] = $file->store('projects/stages/gallery', 'public');
                } elseif (is_array($file)) {
                    foreach ($file as $image) {
                        if ($image instanceof \Illuminate\Http\UploadedFile) {
                            $gallery[] = $image->store('projects/stages/gallery', 'public');
                        }
                    }
                }
            }
        }

        $arrayKey = "stages_{$index}_gallery";
        if ($request->hasFile($arrayKey)) {
            $files = Arr::wrap($request->file($arrayKey));
            foreach ($files as $image) {
                if ($image instanceof \Illuminate\Http\UploadedFile) {
                    $gallery[] = $image->store('projects/stages/gallery', 'public');
                }
            }
        }

        return $gallery;
    }

    private function toRelativePath(string $path): string
    {
        return ltrim(str_replace('/storage/', '', $path), '/');
    }
}
